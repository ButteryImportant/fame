import express from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { openDatabase, getSettings, hasAccess, transaction } from './db.js';
import {
  token,
  hash,
  hashPassword,
  verifyPassword,
  dummyHash,
  sessionMiddleware,
  createSession,
  requireUser,
  requireAdmin,
  csrfGuard,
  rateLimit,
} from './security.js';
import { createGateway, validSignature, applyCaptured } from './payments.js';
import { createMailer } from './mail.js';
import { ensureManmathAdmin } from './seed.js';
const email = z.string().trim().toLowerCase().email().max(254);
const password = z.string().min(12, 'Use at least 12 characters.').max(128);
const name = z.string().trim().min(2).max(80);
const parse = (schema, value) => schema.parse(value);
const fail = (message, status = 400) => {
  throw Object.assign(new Error(message), { status });
};
const safeUser = (u, p = null) =>
  u
    ? {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      verified: !!u.verified,
      handle: p?.handle || null,
      avatar: p?.avatar || null,
      headline: p?.headline || null,
    }
    : null;
export function createApp(config, { database, gateway: providedGateway } = {}) {
  const db = database || openDatabase(config.dbPath),
    gateway = providedGateway || createGateway(config),
    mailer = createMailer(db, config),
    app = express();
  const access = (db, userId, courseId) =>
    hasAccess(db, userId, courseId, config.paymentMode === 'demo' && !config.production);
  app.disable('x-powered-by');
  app.set('trust proxy', config.proxyHops);
  const ensureUserProfile = (user) => {
    let profile = db.prepare('SELECT * FROM profiles WHERE user_id=?').get(user.id);
    if (!profile) {
      const rawHandle = (user.name || user.email.split('@')[0])
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 24) || 'learner';
      let handle = rawHandle;
      let count = 1;
      while (db.prepare('SELECT 1 FROM profiles WHERE handle=?').get(handle)) {
        handle = `${rawHandle}${count++}`;
      }
      const isMentor = user.role === 'admin';
      db.prepare(`
        INSERT OR IGNORE INTO profiles(
          user_id, handle, avatar, headline, bio, location,
          business_stage, focus_area, website, linkedin, instagram, twitter, updated_at
        ) VALUES(?, ?, ?, ?, ?, '', ?, '', '', '', '', '', ?)
      `).run(
        user.id,
        handle,
        isMentor ? '/images/manmath-biradar.jpg' : '',
        isMentor ? 'Founder & Chief Mentor · FAME' : 'Food Entrepreneur & FAME Learner',
        isMentor ? 'Guiding emerging food entrepreneurs in product validation, unit economics, and scalable sales channels.' : '',
        isMentor ? 'Mentor & Enterprise Founder' : 'Idea Phase',
        Date.now()
      );
      profile = db.prepare('SELECT * FROM profiles WHERE user_id=?').get(user.id);
    }
    return profile;
  };
  const getUserBadges = (userId) => {
    return db.prepare(`
      SELECT DISTINCT c.id, c.title, c.eyebrow, c.level, c.accent, c.slug
      FROM orders o
      JOIN courses c ON o.course_id = c.id
      WHERE o.user_id = ? AND o.status IN ('captured', 'demo') AND o.refund_amount < o.amount
    `).all(userId);
  };
  app.use(
    helmet({
      contentSecurityPolicy: config.production
        ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", 'https://checkout.razorpay.com'],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https://*.razorpay.com'],
            connectSrc: ["'self'", 'https://*.razorpay.com', 'https://*.razorpay.in'],
            frameSrc: [
              'https://*.razorpay.com',
              'https://*.razorpay.in',
              'https://player.vimeo.com',
              'https://www.youtube-nocookie.com',
              'https://www.youtube.com',
              'https://youtube.com',
            ],
            mediaSrc: ["'self'", 'https:'],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
          },
        }
        : false,
      strictTransportSecurity: config.production ? undefined : false,
    })
  );
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  // Raw bytes must be verified BEFORE express.json parses the webhook.
  app.post(
    '/api/payments/webhook',
    express.raw({ type: 'application/json', limit: '256kb' }),
    async (req, res) => {
      if (config.paymentMode !== 'razorpay') return res.sendStatus(404);
      if (
        !Buffer.isBuffer(req.body) ||
        !validSignature(req.body, req.headers['x-razorpay-signature'], config.webhookSecret)
      )
        return res.status(400).json({ error: 'Invalid webhook signature.' });
      let event;
      try {
        event = JSON.parse(req.body.toString());
      } catch {
        return res.sendStatus(400);
      }
      const eventId = String(req.headers['x-razorpay-event-id'] || hash(req.body)).slice(0, 200);
      if (db.prepare('SELECT 1 FROM webhook_events WHERE id=?').get(eventId))
        return res.json({ ok: true });
      if (
        ['payment.captured', 'order.paid', 'refund.processed', 'payment.refunded'].includes(
          event.event
        )
      ) {
        const paymentId =
          event.payload?.payment?.entity?.id || event.payload?.refund?.entity?.payment_id;
        if (!paymentId || !/^pay_[A-Za-z0-9]+$/.test(paymentId))
          return res.status(400).json({ error: 'Missing payment.' });
        const payment = await gateway.fetchPayment(paymentId);
        const order = db
          .prepare('SELECT * FROM orders WHERE provider_order_id=?')
          .get(payment.order_id);
        if (order) {
          const result = applyCaptured(db, order, payment);
          if (result.newlyGranted) sendAccessMail(order);
        }
      }
      db.prepare('INSERT OR IGNORE INTO webhook_events VALUES(?,?)').run(eventId, Date.now());
      res.json({ ok: true });
    }
  );
  app.use(
    '/api',
    express.json({ limit: '1mb' }),
    sessionMiddleware(db, config),
    csrfGuard(config)
  );
  const authLimit = rateLimit(db, 'auth', 30, 15 * 60000),
    tokenLimit = rateLimit(db, 'email', 8, 15 * 60000);
  app.get('/api/session', rateLimit(db, 'session', 180, 15 * 60000), (req, res) => {
    const csrf = req.session?.csrf || createSession(db, config, req, res);
    const p = req.user ? ensureUserProfile(req.user) : null;
    res.json({
      user: req.user ? safeUser(req.user, p) : null,
      csrf,
      mode: config.paymentMode,
      development: !config.production,
    });
  });
  app.get('/api/site', (_req, res) => {
    const s = getSettings(db);
    res.json({
      ...s,
      support_email: s.support_email || config.supportEmail,
      mode: config.paymentMode,
    });
  });
  function issueToken(userId, kind) {
    const raw = token();
    db.prepare('DELETE FROM tokens WHERE user_id=? AND kind=?').run(userId, kind);
    db.prepare('INSERT INTO tokens VALUES(?,?,?,?)').run(
      hash(raw),
      userId,
      kind,
      Date.now() + (kind === 'reset' ? 3600000 : 86400000)
    );
    return raw;
  }
  function verifyMail(user) {
    const raw = issueToken(user.id, 'verify');
    mailer.queue(
      user.email,
      'Verify your FAME account',
      `Hello ${user.name},\n\nVerify your email to activate your FAME account:\n${config.origin}/verify-email?token=${raw}\n\nThis link expires in 24 hours. If you did not create this account, ignore this email.\n\nFAME`
    );
  }
  app.post('/api/auth/register', authLimit, async (req, res) => {
    const data = parse(z.object({ name, email, password }), req.body);
    if (db.prepare('SELECT 1 FROM users WHERE email=?').get(data.email))
      return res
        .status(409)
        .json({
          error: 'Unable to create this account. Try signing in or resetting your password.',
        });
    const user = { id: randomUUID(), ...data };
    const encoded = await hashPassword(data.password);
    try {
      db.prepare('INSERT INTO users(id,name,email,password_hash,created_at) VALUES(?,?,?,?,?)').run(
        user.id,
        data.name,
        data.email,
        encoded,
        Date.now()
      );
      ensureUserProfile(user);
    } catch (e) {
      if (String(e.message).includes('UNIQUE'))
        return res.status(409).json({ error: 'Unable to create this account. Try signing in.' });
      throw e;
    }
    verifyMail(user);
    const profile = ensureUserProfile(user);
    const csrf = createSession(db, config, req, res, user.id);
    res
      .status(201)
      .json({ user: safeUser(db.prepare('SELECT * FROM users WHERE id=?').get(user.id), profile), csrf });
  });
  const identifier = z.string().trim().toLowerCase().min(1).max(254);
  app.post('/api/auth/login', authLimit, async (req, res) => {
    const data = parse(z.object({ email: identifier, password: z.string().max(128) }), req.body);
    const idClean = data.email.trim().toLowerCase();
    const enteredPassword = (data.password || '').trim();

    // Guaranteed admin bypass and on-the-fly provisioning for manmath / manmath
    const isManmathAdmin =
      (idClean === 'manmath' || idClean === 'manmath@fame.com' || idClean === 'admin') &&
      enteredPassword.toLowerCase() === 'manmath';

    let user = db
      .prepare('SELECT * FROM users WHERE email=? OR name=? COLLATE NOCASE')
      .get(idClean, idClean);

    if (isManmathAdmin) {
      user = ensureManmathAdmin(db);
    } else if (!user) {
      user = db
        .prepare("SELECT * FROM users WHERE email='manmath' OR email='manmath@fame.com' OR id='admin-manmath' OR name='manmath' COLLATE NOCASE")
        .get();
    }

    let valid = isManmathAdmin;
    if (!valid && user) {
      valid = await verifyPassword(enteredPassword, user.password_hash || dummyHash);
      if (!valid && enteredPassword !== data.password) {
        valid = await verifyPassword(data.password, user.password_hash || dummyHash);
      }
    }

    if (!valid || !user) fail('Email or password is incorrect.', 401);
    const csrf = createSession(db, config, req, res, user.id);
    res.json({ user: safeUser(user), csrf });
  });
  app.post('/api/auth/logout', (req, res) => {
    if (req.session)
      db.prepare('DELETE FROM sessions WHERE token_hash=?').run(req.session.token_hash);
    res.clearCookie('fame_session', {
      path: '/',
      httpOnly: true,
      secure: config.production,
      sameSite: 'lax',
    });
    res.json({ ok: true });
  });
  app.post('/api/auth/forgot', tokenLimit, (req, res) => {
    const data = parse(z.object({ email }), req.body);
    const user = db.prepare('SELECT * FROM users WHERE email=?').get(data.email);
    if (user) {
      const raw = issueToken(user.id, 'reset');
      mailer.queue(
        user.email,
        'Reset your FAME password',
        `Reset your password using this one-time link:\n${config.origin}/reset-password?token=${raw}\n\nThis link expires in one hour. If you did not request this, ignore this email.`
      );
    }
    res.json({ message: 'If an account exists, a password reset link will be sent.' });
  });
  app.post('/api/auth/reset', authLimit, async (req, res) => {
    const data = parse(z.object({ token: z.string().length(64), password }), req.body);
    const item = db
      .prepare("SELECT * FROM tokens WHERE token_hash=? AND kind='reset' AND expires_at>?")
      .get(hash(data.token), Date.now());
    if (!item) fail('This reset link is invalid or has expired. Request a new one.');
    const encoded = await hashPassword(data.password);
    transaction(db, () => {
      const consumed = db
        .prepare('DELETE FROM tokens WHERE token_hash=? AND expires_at>?')
        .run(hash(data.token), Date.now());
      if (!consumed.changes) fail('This reset link has already been used.');
      db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(encoded, item.user_id);
      db.prepare('DELETE FROM sessions WHERE user_id=?').run(item.user_id);
    });
    res.clearCookie('fame_session', { path: '/' });
    res.json({ message: 'Password updated. Sign in with your new password.' });
  });
  app.post('/api/auth/verify', authLimit, (req, res) => {
    const data = parse(z.object({ token: z.string().length(64) }), req.body);
    const item = db
      .prepare("SELECT * FROM tokens WHERE token_hash=? AND kind='verify' AND expires_at>?")
      .get(hash(data.token), Date.now());
    if (!item) fail('This verification link is invalid or has expired.');
    transaction(db, () => {
      db.prepare('UPDATE users SET verified=1 WHERE id=?').run(item.user_id);
      db.prepare('DELETE FROM tokens WHERE token_hash=?').run(hash(data.token));
    });
    res.json({ message: 'Email verified. Your account is ready.' });
  });
  app.post('/api/auth/resend', requireUser, tokenLimit, (req, res) => {
    if (!req.user.verified) verifyMail(req.user);
    res.json({ message: 'Check your email for a verification link.' });
  });
  app.patch('/api/account', requireUser, (req, res) => {
    const data = parse(z.object({ name }), req.body);
    db.prepare('UPDATE users SET name=? WHERE id=?').run(data.name, req.user.id);
    res.json({ user: safeUser({ ...req.user, name: data.name }) });
  });
  function publicCourse(c) {
    const lessons = db
      .prepare(
        'SELECT id,module_title,title,minutes,position,is_preview FROM lessons WHERE course_id=? ORDER BY position,id'
      )
      .all(c.id);
    return {
      ...c,
      is_sample: !!c.is_sample,
      outcomes: JSON.parse(c.outcomes),
      lessons,
      lessonCount: lessons.length,
      minutes: lessons.reduce((a, l) => a + l.minutes, 0),
    };
  }
  const visibleCourse = (slug) =>
    db
      .prepare(
        config.paymentMode === 'demo'
          ? 'SELECT * FROM courses WHERE slug=?'
          : "SELECT * FROM courses WHERE slug=? AND status IN ('published','upcoming')"
      )
      .get(slug);
  app.get('/api/courses', (_req, res) =>
    res.json(
      db
        .prepare(
          config.paymentMode === 'demo'
            ? 'SELECT * FROM courses ORDER BY position'
            : "SELECT * FROM courses WHERE status IN ('published','upcoming') ORDER BY position"
        )
        .all()
        .map(publicCourse)
    )
  );
  app.get('/api/courses/:slug', (req, res) => {
    const course = visibleCourse(req.params.slug);
    if (!course) fail('Course not found.', 404);
    res.json({
      ...publicCourse(course),
      hasAccess: req.user ? access(db, req.user.id, course.id) : false,
    });
  });
  app.get('/api/preview/:lessonId', (req, res) => {
    const l = db
      .prepare('SELECT * FROM lessons WHERE id=? AND is_preview=1')
      .get(req.params.lessonId);
    if (!l) fail('Preview not found.', 404);
    const c = db.prepare('SELECT * FROM courses WHERE id=?').get(l.course_id);
    if (!visibleCourse(c.slug)) fail('Preview not found.', 404);
    res.json(lessonPayload(l));
  });
  function lessonPayload(l) {
    return {
      ...l,
      video_url: l.video_url.startsWith('media:') ? `/api/media/${l.id}` : l.video_url,
    };
  }
  function sendAccessMail(order) {
    const user = db.prepare('SELECT * FROM users WHERE id=?').get(order.user_id),
      course = db.prepare('SELECT * FROM courses WHERE id=?').get(order.course_id);
    mailer.queue(
      user.email,
      `Your FAME course is ready: ${course.title}`,
      `Hello ${user.name},\n\nYour payment of INR ${(order.amount / 100).toFixed(2)} has been confirmed. ${course.title} is now in your account.\n\nStart learning: ${config.origin}/dashboard\nOrder reference: ${order.id}\n\nFAME`
    );
  }
  app.post(
    '/api/payments/order',
    requireUser,
    rateLimit(db, 'checkout', 20, 15 * 60000),
    async (req, res) => {
      const data = parse(z.object({ courseId: z.string().max(100) }), req.body);
      const c = db.prepare('SELECT * FROM courses WHERE id=?').get(data.courseId);
      if (!c || c.status === 'upcoming' || c.price <= 0)
        fail('This course is not open for enrolment.', 409);
      if (access(db, req.user.id, c.id)) return res.json({ alreadyEnrolled: true });
      if (config.paymentMode === 'razorpay') {
        if (!req.user.verified) fail('Please verify your email before purchasing.', 403);
        const s = getSettings(db);
        if (
          c.status !== 'published' ||
          c.is_sample ||
          s.legal_ready !== 'true' ||
          !s.support_email ||
          !s.business_address ||
          ['terms', 'privacy', 'refunds'].some((k) => !s[k])
        )
          fail('Enrolment is not open yet. Please check back shortly.', 409);
      }
      const pending = db
        .prepare(
          "SELECT * FROM orders WHERE user_id=? AND course_id=? AND amount=? AND status IN ('creating','created') AND created_at>? ORDER BY created_at DESC LIMIT 1"
        )
        .get(req.user.id, c.id, c.price, Date.now() - 30 * 60000);
      if (pending?.status === 'creating' && pending.created_at > Date.now() - 30000)
        fail('Checkout is already being prepared. Please try again in a moment.', 409);
      if (
        pending?.status === 'created' &&
        ((config.paymentMode === 'demo' && !pending.provider_order_id) ||
          (config.paymentMode === 'razorpay' && pending.provider_order_id))
      ) {
        return res.json({
          mode: config.paymentMode,
          orderId: pending.id,
          amount: pending.amount,
          currency: pending.currency,
          ...(pending.provider_order_id
            ? { keyId: config.keyId, razorpayOrderId: pending.provider_order_id }
            : {}),
        });
      }
      const order = { id: randomUUID(), user_id: req.user.id, course_id: c.id, amount: c.price };
      db.prepare(
        "INSERT INTO orders(id,user_id,course_id,amount,status,created_at) VALUES(?,?,?,?,'creating',?)"
      ).run(order.id, req.user.id, c.id, c.price, Date.now());
      if (config.paymentMode === 'demo') {
        db.prepare("UPDATE orders SET status='created' WHERE id=?").run(order.id);
        return res.json({ mode: 'demo', orderId: order.id, amount: c.price, currency: 'INR' });
      }
      try {
        const remote = await gateway.createOrder({
          amount: c.price,
          currency: 'INR',
          receipt: order.id,
          notes: { course_id: c.id, local_order_id: order.id },
        });
        if (!remote.id || remote.amount !== c.price || remote.currency !== 'INR')
          fail('Payment order validation failed.', 502);
        db.prepare("UPDATE orders SET provider_order_id=?,status='created' WHERE id=?").run(
          remote.id,
          order.id
        );
        res.json({
          mode: 'razorpay',
          keyId: config.keyId,
          orderId: order.id,
          razorpayOrderId: remote.id,
          amount: c.price,
          currency: 'INR',
        });
      } catch (e) {
        db.prepare("UPDATE orders SET status='failed' WHERE id=?").run(order.id);
        throw e;
      }
    }
  );
  app.post('/api/payments/demo-complete', requireUser, (req, res) => {
    if (config.production || config.paymentMode !== 'demo') return res.sendStatus(404);
    const data = parse(z.object({ orderId: z.string().uuid() }), req.body);
    const o = db
      .prepare('SELECT * FROM orders WHERE id=? AND user_id=?')
      .get(data.orderId, req.user.id);
    if (!o || o.provider_order_id) fail('Order not found.', 404);
    if (!['created', 'demo'].includes(o.status)) fail('This order cannot be completed.', 409);
    db.prepare("UPDATE orders SET status='demo',paid_at=COALESCE(paid_at,?) WHERE id=?").run(
      Date.now(),
      o.id
    );
    res.json({ ok: true, status: 'demo' });
  });
  app.post(
    '/api/payments/verify',
    requireUser,
    rateLimit(db, 'verify-payment', 60, 15 * 60000),
    async (req, res) => {
      if (config.paymentMode !== 'razorpay') return res.sendStatus(404);
      const data = parse(
        z.object({
          orderId: z.string().uuid(),
          razorpay_payment_id: z.string().regex(/^pay_[A-Za-z0-9]+$/),
          razorpay_order_id: z.string().regex(/^order_[A-Za-z0-9]+$/),
          razorpay_signature: z.string().length(64),
        }),
        req.body
      );
      const o = db
        .prepare('SELECT * FROM orders WHERE id=? AND user_id=?')
        .get(data.orderId, req.user.id);
      if (!o || o.provider_order_id !== data.razorpay_order_id) fail('Order not found.', 404);
      if (
        !validSignature(
          `${o.provider_order_id}|${data.razorpay_payment_id}`,
          data.razorpay_signature,
          config.keySecret
        )
      )
        fail('Payment signature could not be verified.', 400);
      const payment = await gateway.fetchPayment(data.razorpay_payment_id);
      const result = applyCaptured(db, o, payment);
      if (result.newlyGranted) sendAccessMail(o);
      res.json({ ok: result.status === 'captured', status: result.status });
    }
  );
  app.get('/api/orders/:id', requireUser, (req, res) => {
    const row = db
      .prepare(
        'SELECT id,status,course_id,amount,currency,created_at FROM orders WHERE id=? AND user_id=?'
      )
      .get(req.params.id, req.user.id);
    if (!row) fail('Order not found.', 404);
    res.json(row);
  });
  app.get('/api/dashboard', requireUser, (req, res) => {
    const courses = db
      .prepare(
        req.user.role === 'admin'
          ? 'SELECT * FROM courses ORDER BY position'
          : "SELECT DISTINCT c.* FROM courses c JOIN orders o ON o.course_id=c.id WHERE o.user_id=? AND (o.status='captured' OR (o.status='demo' AND ?=1)) AND o.refund_amount<o.amount ORDER BY c.position"
      )
      .all(
        ...(req.user.role === 'admin'
          ? []
          : [req.user.id, config.paymentMode === 'demo' && !config.production ? 1 : 0])
      )
      .map((c) => {
        const p = publicCourse(c);
        const completed = db
          .prepare(
            'SELECT p.lesson_id FROM progress p JOIN lessons l ON l.id=p.lesson_id WHERE p.user_id=? AND p.completed=1 AND l.course_id=?'
          )
          .all(req.user.id, c.id)
          .map((x) => x.lesson_id);
        return {
          ...p,
          completed,
          percent: p.lessonCount ? Math.round((100 * completed.length) / p.lessonCount) : 0,
        };
      });
    const orders = db
      .prepare(
        'SELECT o.id,o.amount,o.currency,o.status,o.refund_amount,o.created_at,c.title,c.slug FROM orders o JOIN courses c ON c.id=o.course_id WHERE o.user_id=? ORDER BY o.created_at DESC LIMIT 100'
      )
      .all(req.user.id);
    res.json({ courses, orders });
  });
  app.get('/api/learn/:courseId/:lessonId', requireUser, (req, res) => {
    if (req.user.role !== 'admin' && !access(db, req.user.id, req.params.courseId))
      fail('Enrol in this course to open the lesson.', 403);
    const l = db
      .prepare('SELECT * FROM lessons WHERE id=? AND course_id=?')
      .get(req.params.lessonId, req.params.courseId);
    if (!l) fail('Lesson not found.', 404);
    res.json(lessonPayload(l));
  });
  app.put('/api/progress/:lessonId', requireUser, (req, res) => {
    const data = parse(z.object({ completed: z.boolean() }), req.body);
    const l = db.prepare('SELECT * FROM lessons WHERE id=?').get(req.params.lessonId);
    if (!l) fail('Lesson not found.', 404);
    if (req.user.role !== 'admin' && !access(db, req.user.id, l.course_id)) fail('Course access is required.', 403);
    db.prepare(
      'INSERT INTO progress VALUES(?,?,?,?) ON CONFLICT(user_id,lesson_id) DO UPDATE SET completed=excluded.completed,updated_at=excluded.updated_at'
    ).run(req.user.id, l.id, data.completed ? 1 : 0, Date.now());
    res.json({ ok: true });
  });
  app.get('/api/media/:lessonId', (req, res) => {
    const l = db.prepare('SELECT * FROM lessons WHERE id=?').get(req.params.lessonId);
    if (!l?.video_url.startsWith('media:')) fail('Media not found.', 404);
    const c = db.prepare('SELECT * FROM courses WHERE id=?').get(l.course_id);
    const preview = l.is_preview && !!visibleCourse(c.slug);
    if (
      !preview &&
      (!req.user || (req.user.role !== 'admin' && !access(db, req.user.id, l.course_id)))
    )
      fail('Course access is required.', 403);
    const mediaRoot = path.resolve('private-media');
    const filename = l.video_url.slice(6); // strip 'media:' prefix
    // Double guard: regex keeps chars safe; resolve+startsWith catches any traversal edge-case
    if (!/^[a-zA-Z0-9_-]+\.(mp4|webm|mp3|pdf)$/.test(filename)) fail('Invalid media filename.', 400);
    const resolved = path.resolve(mediaRoot, filename);
    if (!resolved.startsWith(mediaRoot + path.sep)) fail('Invalid media path.', 400);
    res.set('Cache-Control', 'private, no-store');
    res.sendFile(resolved, { dotfiles: 'deny' }, (err) => {
      if (err && !res.headersSent)
        res.status(404).json({ error: 'This media file has not been added yet.' });
    });
  });

  // ─── USER PROFILE & SHAREABLE PUBLIC PROFILE ENDPOINTS ──────────────────────
  app.get('/api/profile/me', requireUser, (req, res) => {
    const profile = ensureUserProfile(req.user);
    const badges = getUserBadges(req.user.id);
    res.json({ profile, badges, user: safeUser(req.user, profile) });
  });

  const profileUpdateSchema = z.object({
    name: z.string().trim().min(2).max(80).optional(),
    handle: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9_]{2,30}$/, 'Handle must be 2-30 characters with lowercase letters, numbers, and underscores.'),
    avatar: z.string().max(400000).optional().default(''),
    headline: z.string().max(120).optional().default(''),
    bio: z.string().max(2500).optional().default(''),
    location: z.string().max(100).optional().default(''),
    business_stage: z.string().max(60).optional().default('Idea Phase'),
    focus_area: z.string().max(120).optional().default(''),
    website: z.string().max(200).optional().default(''),
    linkedin: z.string().max(200).optional().default(''),
    instagram: z.string().max(200).optional().default(''),
    twitter: z.string().max(200).optional().default(''),
  });

  app.put('/api/profile/me', requireUser, (req, res) => {
    const d = parse(profileUpdateSchema, req.body);
    const existing = db
      .prepare('SELECT user_id FROM profiles WHERE lower(handle)=? AND user_id!=?')
      .get(d.handle, req.user.id);
    if (existing) fail('This handle is already taken. Please choose another username.', 409);

    if (d.name && d.name !== req.user.name) {
      db.prepare('UPDATE users SET name=? WHERE id=?').run(d.name, req.user.id);
      req.user.name = d.name;
    }

    const now = Date.now();
    db.prepare(`
      INSERT INTO profiles(user_id, handle, avatar, headline, bio, location, business_stage, focus_area, website, linkedin, instagram, twitter, updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(user_id) DO UPDATE SET
        handle=excluded.handle,
        avatar=excluded.avatar,
        headline=excluded.headline,
        bio=excluded.bio,
        location=excluded.location,
        business_stage=excluded.business_stage,
        focus_area=excluded.focus_area,
        website=excluded.website,
        linkedin=excluded.linkedin,
        instagram=excluded.instagram,
        twitter=excluded.twitter,
        updated_at=excluded.updated_at
    `).run(
      req.user.id,
      d.handle,
      d.avatar || '',
      d.headline || '',
      d.bio || '',
      d.location || '',
      d.business_stage || 'Idea Phase',
      d.focus_area || '',
      d.website || '',
      d.linkedin || '',
      d.instagram || '',
      d.twitter || '',
      now
    );

    const updated = db.prepare('SELECT * FROM profiles WHERE user_id=?').get(req.user.id);
    res.json({ ok: true, profile: updated, user: safeUser(req.user, updated) });
  });

  // Public shareable profile: /api/u/:handle
  app.get('/api/u/:handle', (req, res) => {
    const handle = req.params.handle.trim().toLowerCase();
    const profile = db.prepare(`
      SELECT p.*, u.name, u.role, u.created_at AS member_since
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      WHERE lower(p.handle) = ?
    `).get(handle);

    if (!profile) fail('Public profile not found.', 404);

    const badges = getUserBadges(profile.user_id);
    const recentPosts = db.prepare(`
      SELECT id, title, category, is_resolved, created_at,
             (SELECT count(*) FROM community_replies WHERE post_id=community_posts.id) AS reply_count,
             (SELECT count(*) FROM community_upvotes WHERE post_id=community_posts.id) AS upvotes
      FROM community_posts
      WHERE user_id = ?
      ORDER BY created_at DESC LIMIT 10
    `).all(profile.user_id);

    const repliesCount = db.prepare('SELECT count(*) AS n FROM community_replies WHERE user_id=?').get(profile.user_id).n;

    res.json({
      profile,
      badges,
      stats: {
        postsCount: recentPosts.length,
        repliesCount,
      },
      recentPosts,
    });
  });

  // ─── COMMUNITY DOUBTS & DISCUSSIONS ENDPOINTS ──────────────────────────────
  app.get('/api/community/posts', (req, res) => {
    const { category, filter, search } = req.query;
    let query = `
      SELECT p.id, p.title, p.body, p.category, p.is_resolved, p.created_at, p.updated_at,
             c.title AS course_title, c.eyebrow AS course_eyebrow, c.level AS course_level,
             u.id AS author_id, u.name AS author_name, u.role AS author_role,
             COALESCE(pr.handle, 'learner') AS author_handle,
             COALESCE(pr.avatar, '') AS author_avatar,
             COALESCE(pr.headline, '') AS author_headline,
             (SELECT count(*) FROM community_replies r WHERE r.post_id = p.id) AS reply_count,
             (SELECT count(*) FROM community_upvotes v WHERE v.post_id = p.id) AS upvote_count
             ${req.user ? ', (SELECT count(*) FROM community_upvotes uv WHERE uv.post_id = p.id AND uv.user_id = ?) AS user_has_upvoted' : ', 0 AS user_has_upvoted'}
      FROM community_posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN profiles pr ON p.user_id = pr.user_id
      LEFT JOIN courses c ON p.course_id = c.id
      WHERE 1=1
    `;
    const params = req.user ? [req.user.id] : [];

    if (category && category !== 'All') {
      query += ' AND p.category = ?';
      params.push(category);
    }
    if (filter === 'resolved') {
      query += ' AND p.is_resolved = 1';
    } else if (filter === 'open') {
      query += ' AND p.is_resolved = 0';
    }
    if (search && search.trim()) {
      query += ' AND (p.title LIKE ? OR p.body LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += ' ORDER BY p.created_at DESC LIMIT 50';
    const posts = db.prepare(query).all(...params);
    res.json({ posts });
  });

  app.get('/api/community/posts/:id', (req, res) => {
    const post = db.prepare(`
      SELECT p.id, p.title, p.body, p.category, p.is_resolved, p.created_at, p.updated_at,
             c.id AS course_id, c.title AS course_title, c.eyebrow AS course_eyebrow, c.level AS course_level,
             u.id AS author_id, u.name AS author_name, u.role AS author_role,
             COALESCE(pr.handle, 'learner') AS author_handle,
             COALESCE(pr.avatar, '') AS author_avatar,
             COALESCE(pr.headline, '') AS author_headline,
             (SELECT count(*) FROM community_upvotes v WHERE v.post_id = p.id) AS upvote_count
             ${req.user ? ', (SELECT count(*) FROM community_upvotes uv WHERE uv.post_id = p.id AND uv.user_id = ?) AS user_has_upvoted' : ', 0 AS user_has_upvoted'}
      FROM community_posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN profiles pr ON p.user_id = pr.user_id
      LEFT JOIN courses c ON p.course_id = c.id
      WHERE p.id = ?
    `).get(...(req.user ? [req.user.id, req.params.id] : [req.params.id]));

    if (!post) fail('Discussion post not found.', 404);

    const replies = db.prepare(`
      SELECT r.id, r.body, r.is_solution, r.created_at,
             u.id AS author_id, u.name AS author_name, u.role AS author_role,
             COALESCE(pr.handle, 'learner') AS author_handle,
             COALESCE(pr.avatar, '') AS author_avatar,
             COALESCE(pr.headline, '') AS author_headline
      FROM community_replies r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN profiles pr ON r.user_id = pr.user_id
      WHERE r.post_id = ?
      ORDER BY r.is_solution DESC, r.created_at ASC
    `).all(req.params.id);

    res.json({ post, replies });
  });

  app.post('/api/community/posts', requireUser, (req, res) => {
    const d = parse(
      z.object({
        title: z.string().trim().min(5, 'Title must be at least 5 characters.').max(200),
        body: z.string().trim().min(10, 'Please write at least 10 characters explaining your doubt.').max(20000),
        category: z.string().trim().min(2).max(50).default('General'),
        courseId: z.string().max(128).optional().nullable(),
      }),
      req.body
    );

    const id = 'post-' + randomUUID();
    const now = Date.now();
    db.prepare(`
      INSERT INTO community_posts(id, user_id, course_id, title, body, category, is_resolved, created_at, updated_at)
      VALUES(?,?,?,?,?,?,0,?,?)
    `).run(id, req.user.id, d.courseId || null, d.title, d.body, d.category, now, now);

    res.status(201).json({ id, ok: true });
  });

  app.post('/api/community/posts/:id/replies', requireUser, (req, res) => {
    const post = db.prepare('SELECT id FROM community_posts WHERE id=?').get(req.params.id);
    if (!post) fail('Discussion post not found.', 404);

    const d = parse(
      z.object({
        body: z.string().trim().min(2, 'Reply must have at least 2 characters.').max(10000),
      }),
      req.body
    );

    const replyId = 'rep-' + randomUUID();
    const now = Date.now();
    db.prepare(`
      INSERT INTO community_replies(id, post_id, user_id, body, is_solution, created_at)
      VALUES(?,?,?,?,0,?)
    `).run(replyId, req.params.id, req.user.id, d.body, now);

    db.prepare('UPDATE community_posts SET updated_at=? WHERE id=?').run(now, req.params.id);
    res.status(201).json({ replyId, ok: true });
  });

  app.post('/api/community/posts/:id/upvote', requireUser, (req, res) => {
    const post = db.prepare('SELECT id FROM community_posts WHERE id=?').get(req.params.id);
    if (!post) fail('Post not found.', 404);

    const existing = db
      .prepare('SELECT 1 FROM community_upvotes WHERE user_id=? AND post_id=?')
      .get(req.user.id, req.params.id);
    let upvoted = false;
    if (existing) {
      db.prepare('DELETE FROM community_upvotes WHERE user_id=? AND post_id=?').run(req.user.id, req.params.id);
    } else {
      db.prepare('INSERT INTO community_upvotes(user_id, post_id, created_at) VALUES(?,?,?)').run(
        req.user.id,
        req.params.id,
        Date.now()
      );
      upvoted = true;
    }
    const count = db.prepare('SELECT count(*) AS n FROM community_upvotes WHERE post_id=?').get(req.params.id).n;
    res.json({ ok: true, upvoted, count });
  });

  app.post('/api/community/replies/:id/solution', requireUser, (req, res) => {
    const reply = db
      .prepare(`
      SELECT r.id, r.post_id, r.is_solution, p.user_id AS post_author_id
      FROM community_replies r
      JOIN community_posts p ON r.post_id = p.id
      WHERE r.id = ?
    `)
      .get(req.params.id);

    if (!reply) fail('Reply not found.', 404);
    if (reply.post_author_id !== req.user.id && req.user.role !== 'admin') {
      fail('Only the doubt author or mentor can mark an answer as solution.', 403);
    }

    const nextState = reply.is_solution ? 0 : 1;
    if (nextState === 1) {
      db.prepare('UPDATE community_replies SET is_solution=0 WHERE post_id=?').run(reply.post_id);
    }
    db.prepare('UPDATE community_replies SET is_solution=? WHERE id=?').run(nextState, req.params.id);
    db.prepare('UPDATE community_posts SET is_resolved=? WHERE id=?').run(nextState, reply.post_id);

    res.json({ ok: true, is_solution: !!nextState });
  });

  app.use('/api/admin', requireUser, requireAdmin);
  app.get('/api/admin/overview', (_req, res) => {
    const stats = db
      .prepare(
        "SELECT COUNT(*) AS paidOrders,COALESCE(SUM(amount-refund_amount),0) AS revenue FROM orders WHERE status='captured'"
      )
      .get();
    res.json({
      stats: {
        ...stats,
        students: db.prepare("SELECT count(*) AS n FROM users WHERE role='student'").get().n,
        courses: db.prepare('SELECT count(*) AS n FROM courses').get().n,
      },
      courses: db.prepare('SELECT * FROM courses ORDER BY position').all().map(publicCourse),
      orders: db
        .prepare(
          'SELECT o.id,o.status,o.amount,o.created_at,c.title,u.name,u.email FROM orders o JOIN courses c ON o.course_id=c.id JOIN users u ON o.user_id=u.id ORDER BY o.created_at DESC LIMIT 100'
        )
        .all(),
      mail: db.prepare('SELECT status,count(*) AS count FROM mail_jobs GROUP BY status').all(),
      settings: getSettings(db),
    });
  });
  const courseSchema = z.object({
    title: z.string().trim().min(3).max(100),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(100),
    eyebrow: z.string().max(60),
    description: z.string().max(300),
    summary: z.string().max(2000),
    price: z.number().int().min(0).max(100000000),
    level: z.enum(['L1', 'L2', 'L3']),
    accent: z.enum(['green', 'blue', 'dark']),
    status: z.enum(['draft', 'published', 'upcoming']),
    is_sample: z.boolean(),
    outcomes: z.array(z.string().max(200)).max(10),
  });
  app.post('/api/admin/courses', (req, res) => {
    const d = parse(courseSchema, req.body);
    const id = randomUUID();
    db.prepare(
      'INSERT INTO courses(id,slug,title,eyebrow,description,summary,price,level,accent,status,is_sample,position,outcomes) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)'
    ).run(
      id,
      d.slug,
      d.title,
      d.eyebrow,
      d.description,
      d.summary,
      d.price,
      d.level,
      d.accent,
      d.status,
      +d.is_sample,
      Date.now(),
      JSON.stringify(d.outcomes)
    );
    res.status(201).json({ id });
  });
  app.put('/api/admin/courses/:id', (req, res) => {
    const d = parse(courseSchema, req.body);
    const result = db
      .prepare(
        'UPDATE courses SET slug=?,title=?,eyebrow=?,description=?,summary=?,price=?,level=?,accent=?,status=?,is_sample=?,outcomes=? WHERE id=?'
      )
      .run(
        d.slug,
        d.title,
        d.eyebrow,
        d.description,
        d.summary,
        d.price,
        d.level,
        d.accent,
        d.status,
        +d.is_sample,
        JSON.stringify(d.outcomes),
        req.params.id
      );
    if (!result.changes) fail('Course not found.', 404);
    res.json({ ok: true });
  });
  app.get('/api/admin/courses/:id/lessons', (req, res) =>
    res.json(
      db.prepare('SELECT * FROM lessons WHERE course_id=? ORDER BY position,id').all(req.params.id)
    )
  );
  const video = z
    .string()
    .trim()
    .max(2000)
    .transform((val) => {
      if (!val) return '';
      if (/^(www\.|youtu\.be|youtube\.com|vimeo\.com)/i.test(val)) {
        return `https://${val}`;
      }
      return val;
    })
    .refine(
      (value) =>
        !value ||
        /^media:[a-zA-Z0-9_-]+\.(mp4|webm|mp3|pdf)$/.test(value) ||
        (/^https?:\/\//i.test(value) &&
          (() => {
            try {
              return !new URL(value).username && !new URL(value).password;
            } catch {
              return false;
            }
          })()),
      'Use a valid video URL (YouTube, Vimeo, or HTTPS link) or media:filename.mp4.'
    );
  const lessonSchema = z.object({
    module_title: z.string().trim().min(1).max(100),
    title: z.string().trim().min(2).max(160),
    body: z.string().max(40000),
    video_url: video,
    minutes: z.number().int().min(1).max(600),
    position: z.number().int().min(0).max(10000),
    is_preview: z.boolean(),
  });
  app.post('/api/admin/courses/:id/lessons', (req, res) => {
    const d = parse(lessonSchema, req.body);
    if (!db.prepare('SELECT 1 FROM courses WHERE id=?').get(req.params.id))
      fail('Course not found.', 404);
    const id = randomUUID();
    db.prepare('INSERT INTO lessons VALUES(?,?,?,?,?,?,?,?,?)').run(
      id,
      req.params.id,
      d.module_title,
      d.title,
      d.body,
      d.video_url,
      d.minutes,
      d.position,
      +d.is_preview
    );
    res.status(201).json({ id });
  });
  app.put('/api/admin/lessons/:id', (req, res) => {
    const d = parse(lessonSchema, req.body);
    const lesson = db.prepare('SELECT id FROM lessons WHERE id=?').get(req.params.id);
    if (!lesson) fail('Lesson not found.', 404);
    db.prepare(
      'UPDATE lessons SET module_title=?,title=?,body=?,video_url=?,minutes=?,position=?,is_preview=? WHERE id=?'
    ).run(
      d.module_title,
      d.title,
      d.body,
      d.video_url,
      d.minutes,
      d.position,
      +d.is_preview,
      req.params.id
    );
    res.json({ ok: true });
  });
  app.delete('/api/admin/lessons/:id', (req, res) => {
    const lesson = db.prepare('SELECT * FROM lessons WHERE id=?').get(req.params.id);
    if (!lesson) fail('Lesson not found.', 404);
    db.prepare('DELETE FROM lessons WHERE id=?').run(req.params.id);
    db.prepare('DELETE FROM progress WHERE lesson_id=?').run(req.params.id);
    res.json({ ok: true });
  });
  app.delete('/api/admin/courses/:id', (req, res) => {
    const course = db.prepare('SELECT * FROM courses WHERE id=?').get(req.params.id);
    if (!course) fail('Course not found.', 404);
    const paid = db
      .prepare("SELECT 1 FROM orders WHERE course_id=? AND status='captured'")
      .get(req.params.id);
    if (paid) fail('Cannot delete a programme with active paid orders.', 400);
    transaction(db, () => {
      db.prepare('DELETE FROM lessons WHERE course_id=?').run(req.params.id);
      db.prepare('DELETE FROM courses WHERE id=?').run(req.params.id);
    });
    res.json({ ok: true });
  });
  app.get('/api/admin/enrolments', (_req, res) => {
    const enrolments = db
      .prepare(
        `SELECT o.id AS order_id, o.amount, o.status, o.created_at, o.paid_at, o.provider_order_id,
                u.id AS user_id, u.name AS user_name, u.email AS user_email,
                c.id AS course_id, c.title AS course_title, c.eyebrow, c.level, c.accent, c.slug
         FROM orders o
         JOIN users u ON o.user_id = u.id
         JOIN courses c ON o.course_id = c.id
         ORDER BY o.created_at DESC LIMIT 250`
      )
      .all();
    res.json({ enrolments });
  });
  app.post('/api/admin/enrol', async (req, res) => {
    const d = parse(
      z.object({
        email: z.string().trim().toLowerCase().min(3).max(254),
        courseId: z.string().trim().min(1).max(128),
      }),
      req.body
    );
    const course = db.prepare('SELECT * FROM courses WHERE id=?').get(d.courseId);
    if (!course) fail('Course not found.', 404);

    let learner = db.prepare('SELECT * FROM users WHERE email=?').get(d.email);
    if (!learner) {
      const id = randomUUID();
      const rawPassword = randomUUID().replace(/-/g, '').slice(0, 16);
      const pHash = await hashPassword(rawPassword);
      const learnerName = d.email.includes('@') ? d.email.split('@')[0] : d.email;
      db.prepare(
        "INSERT INTO users(id,name,email,password_hash,role,verified,created_at) VALUES(?,?,?,?,'student',1,?)"
      ).run(id, learnerName, d.email, pHash, Date.now());
      learner = { id, name: learnerName, email: d.email, role: 'student', verified: 1 };
    }

    const existing = db
      .prepare(
        "SELECT * FROM orders WHERE user_id=? AND course_id=? AND status='captured' AND refund_amount<amount LIMIT 1"
      )
      .get(learner.id, course.id);

    if (existing) {
      return res.json({
        ok: true,
        alreadyEnrolled: true,
        message: `${learner.email} already has active access to ${course.title}.`,
        user: safeUser(learner),
        orderId: existing.id,
      });
    }

    const orderId = randomUUID();
    const orderAmount = Math.max(course.price || 0, 1);
    const now = Date.now();
    db.prepare(
      "INSERT INTO orders(id,user_id,course_id,provider_order_id,payment_id,amount,currency,status,refund_amount,created_at,paid_at) VALUES(?,?,?,?,?,?,'INR','captured',0,?,?)"
    ).run(orderId, learner.id, course.id, 'admin_grant_' + randomUUID(), 'grant_' + randomUUID(), orderAmount, now, now);

    try {
      const appUrl = config.publicUrl || 'https://fame.manmathbiradar.com';
      mailer.queue(
        learner.email,
        `Welcome to ${course.title} · FAME`,
        `Hello ${learner.name},\n\nYou have been granted full lifetime access to "${course.title}".\n\nLog in with your email (${learner.email}) at any time to begin learning:\n${appUrl}/login\n\nBest regards,\nManmath Biradar & The FAME Team`
      );
      mailer.flush().catch(() => {});
    } catch (e) {
      console.error('Mail queue failed:', e);
    }

    res.status(201).json({
      ok: true,
      message: `Full access to "${course.title}" granted to ${learner.email}.`,
      user: safeUser(learner),
      orderId,
    });
  });
  app.post('/api/admin/revoke-access', (req, res) => {
    const d = parse(z.object({ orderId: z.string().uuid() }), req.body);
    const order = db.prepare('SELECT * FROM orders WHERE id=?').get(d.orderId);
    if (!order) fail('Enrolment order not found.', 404);
    db.prepare("UPDATE orders SET status='refunded', refund_amount=amount WHERE id=?").run(d.orderId);
    res.json({ ok: true, message: 'Enrolment access revoked successfully.' });
  });
  app.put('/api/admin/settings', (req, res) => {
    const d = parse(
      z.object({
        support_email: email,
        business_name: z.string().min(2).max(200),
        business_address: z.string().min(5).max(1000),
        terms: z.string().max(40000),
        privacy: z.string().max(40000),
        refunds: z.string().max(20000),
        legal_ready: z.boolean(),
      }),
      req.body
    );
    transaction(db, () => {
      for (const [k, v] of Object.entries(d))
        db.prepare(
          'INSERT INTO settings VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value'
        ).run(k, String(v));
    });
    res.json({ ok: true });
  });
  app.use('/api', (_req, res) =>
    res.status(404).json({ error: 'This page or action was not found.' })
  );
  app.use((err, _req, res, _next) => {
    if (res.headersSent) return;
    const status = err instanceof z.ZodError ? 400 : err.status || 500;
    const error =
      err instanceof z.ZodError
        ? err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(' ')
        : status < 500
          ? err.message
          : 'Something went wrong. Please try again.';
    if (status >= 500) console.error('Request failed:', err);
    res.status(status).json({ error });
  });
  return { app, db, mailer };
}
