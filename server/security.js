import { randomBytes, createHash, timingSafeEqual, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(scryptCallback);
export const token = () => randomBytes(32).toString('hex');
export const hash = (value) => createHash('sha256').update(value).digest('hex');
export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const x = Buffer.from(a),
    y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return `scrypt$${salt}$${key.toString('hex')}`;
}
export async function verifyPassword(password, encoded) {
  const [scheme, salt, key] = encoded.split('$');
  if (scheme !== 'scrypt') return false;
  const actual = await scrypt(password, salt, 64, {
    N: 32768,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });
  return safeEqual(actual.toString('hex'), key);
}
export const dummyHash = await hashPassword('not-a-valid-account-password');
export function cookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || '')
      .split(';')
      .map((x) => x.trim().split('='))
      .filter((x) => x.length === 2)
  );
}
export function sessionMiddleware(db, config) {
  const SESSION_TTL = 7 * 86400000;
  return (req, res, next) => {
    const raw = cookies(req).fame_session;
    if (raw && /^[a-f0-9]{64}$/.test(raw)) {
      req.session = db
        .prepare('SELECT * FROM sessions WHERE token_hash=? AND expires_at>?')
        .get(hash(raw), Date.now());
      if (req.session?.user_id) {
        req.user = db
          .prepare('SELECT id,name,email,role,verified,created_at FROM users WHERE id=?')
          .get(req.session.user_id);
        // Sliding expiry: extend DB row so active users are never silently logged out.
        // The cookie itself keeps its original Max-Age; browsers handle the window implicitly
        // because the next createSession call (e.g. on login) will reissue a fresh cookie.
        db.prepare('UPDATE sessions SET expires_at=? WHERE token_hash=?').run(
          Date.now() + SESSION_TTL,
          req.session.token_hash
        );
      }
    }
    next();
  };
}
export function createSession(db, config, req, res, userId = null) {
  if (req.session)
    db.prepare('DELETE FROM sessions WHERE token_hash=?').run(req.session.token_hash);
  const raw = token(),
    csrf = token();
  db.prepare('INSERT INTO sessions VALUES(?,?,?,?)').run(
    hash(raw),
    userId,
    csrf,
    Date.now() + 7 * 86400000
  );
  res.cookie('fame_session', raw, {
    httpOnly: true,
    secure: config.production,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 86400000,
  });
  return csrf;
}
export function requireUser(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Please sign in to continue.' });
  next();
}
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ error: 'Owner access is required.' });
  next();
}
export function csrfGuard(config) {
  return (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    if (req.headers.origin !== config.origin)
      return res.status(403).json({ error: 'This request did not come from this website.' });
    if (!req.session || !safeEqual(req.headers['x-csrf-token'], req.session.csrf))
      return res
        .status(403)
        .json({ error: 'Your session has changed. Refresh this page and try again.' });
    next();
  };
}
export function rateLimit(db, prefix, max, windowMs) {
  return (req, res, next) => {
    const key = hash(`${prefix}:${req.ip}`),
      now = Date.now();
    db.prepare(
      'INSERT INTO rate_limits(key,count,reset_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN reset_at<? THEN 1 ELSE count+1 END,reset_at=CASE WHEN reset_at<? THEN excluded.reset_at ELSE reset_at END'
    ).run(key, now + windowMs, now, now);
    const row = db.prepare('SELECT * FROM rate_limits WHERE key=?').get(key);
    if (row.count > max) {
      res.set('Retry-After', String(Math.max(1, Math.ceil((row.reset_at - now) / 1000))));
      return res
        .status(429)
        .json({ error: 'Too many attempts. Please wait a few minutes and try again.' });
    }
    next();
  };
}
