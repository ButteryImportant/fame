import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, createHmac } from 'node:crypto';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createApp } from '../server/app.js';
import { loadConfig } from '../server/config.js';
import { hash } from '../server/security.js';
const origin = 'http://fame.test';
const testPassword = 'Test-only-long-password-2026';
async function fixture(mode = 'demo') {
  const dir = mkdtempSync(path.join(tmpdir(), 'fame-test-'));
  const config = loadConfig({ production: false, origin, dbPath: path.join(dir, 'db.sqlite'), paymentMode: mode, keyId: 'rzp_test_fixture', keySecret: 'test-key-secret', webhookSecret: 'test-webhook-secret', smtp: {}, mailFrom: '' });
  let payment = {}; let serial = 0;
  const gateway = { createOrder: async b => ({ id: `order_test${++serial}`, amount: b.amount, currency: b.currency }), fetchPayment: async id => ({ ...payment, id }) };
  const { app, db, mailer } = createApp(config, { gateway });
  const server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  const base = `http://127.0.0.1:${server.address().port}`;
  function client() { let cookie = '', csrf = ''; return { async call(url, method = 'GET', body, extra = {}) { const r = await fetch(base + '/api' + url, { method, headers: { origin, 'Content-Type': 'application/json', cookie, 'X-CSRF-Token': csrf, ...extra }, body: body === undefined ? undefined : JSON.stringify(body) }); const set = r.headers.get('set-cookie'); if (set) cookie = set.split(';')[0]; const json = await r.json().catch(() => ({})); if (json.csrf) csrf = json.csrf; return { status: r.status, body: json, headers: r.headers }; }, async register(email = `${randomUUID()}@example.test`) { await this.call('/session'); const r = await this.call('/auth/register', 'POST', { name: 'Test Learner', email, password: testPassword }); assert.equal(r.status, 201); return r.body.user; } }; }
  function launch() { db.prepare("UPDATE courses SET status='published',is_sample=0 WHERE id='blueprint'").run(); for (const [k, v] of Object.entries({ support_email: 'support@example.test', business_address: 'Test business address', terms: 'Test terms in fixture', privacy: 'Test privacy in fixture', refunds: 'Test refunds in fixture', legal_ready: 'true' })) db.prepare('UPDATE settings SET value=? WHERE key=?').run(v, k); db.prepare('UPDATE users SET verified=1').run(); }
  async function webhook(event, eventId) { const payload = JSON.stringify(event); const signature = createHmac('sha256', config.webhookSecret).update(payload).digest('hex'); const r = await fetch(base + '/api/payments/webhook', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-razorpay-signature': signature, 'x-razorpay-event-id': eventId }, body: payload }); return r.status; }
  return { db, config, client, launch, mailer, gateway, dir, webhook, setPayment: p => { payment = p; }, close: async () => { await new Promise(r => server.close(r)); db.close(); rmSync(dir, { recursive: true, force: true }); } };
}
async function run(mode, fn) { const f = await fixture(mode); try { await fn(f); } finally { await f.close(); } }
function signature(f, o, paymentId) { return createHmac('sha256', f.config.keySecret).update(`${o.razorpayOrderId}|${paymentId}`).digest('hex'); }
test('Registration stores scrypt hashes; session is HttpOnly; CSRF and origin are enforced', () => run('demo', async f => { const c = f.client(); const s = await c.call('/session'); assert.match(s.headers.get('set-cookie'), /HttpOnly/); assert.match(s.headers.get('set-cookie'), /SameSite=Lax/); assert.equal((await c.call('/auth/register', 'POST', { name: 'Test', email: 'test@example.test', password: testPassword }, { 'x-csrf-token': 'bad' })).status, 403); assert.equal((await c.call('/auth/register', 'POST', { name: 'Test', email: 'test@example.test', password: testPassword }, { origin: 'https://evil.test' })).status, 403); const u = await c.register(); const stored = f.db.prepare('SELECT * FROM users WHERE id=?').get(u.id); assert.match(stored.password_hash, /^scrypt\$/); assert.equal(u.password_hash, undefined); assert.notEqual(stored.password_hash, testPassword); }));
test('Login rotates the session; wrong credentials fail; logout removes access', () => run('demo', async f => { const c = f.client(), u = await c.register('login@example.test'); assert.equal((await c.call('/auth/login', 'POST', { email: u.email, password: 'incorrect' })).status, 401); const count = f.db.prepare('SELECT count(*) AS n FROM sessions WHERE user_id=?').get(u.id).n; const logged = await c.call('/auth/login', 'POST', { email: u.email, password: testPassword }); assert.equal(logged.status, 200); assert.equal(f.db.prepare('SELECT count(*) AS n FROM sessions WHERE user_id=?').get(u.id).n, count); assert.equal((await c.call('/auth/logout', 'POST')).status, 200); assert.equal((await c.call('/dashboard')).status, 401); }));
test('Default admin account manmath / manmath can login and has admin privileges', () => run('demo', async f => { const c = f.client(); await c.call('/session'); const r1 = await c.call('/auth/login', 'POST', { email: 'manmath', password: 'manmath' }); assert.equal(r1.status, 200); assert.equal(r1.body.user.role, 'admin'); assert.equal((await c.call('/admin/overview')).status, 200); await c.call('/auth/logout', 'POST'); const c2 = f.client(); await c2.call('/session'); const r2 = await c2.call('/auth/login', 'POST', { email: 'Manmath', password: 'Manmath' }); assert.equal(r2.status, 200); assert.equal(r2.body.user.role, 'admin'); assert.equal((await c2.call('/admin/overview')).status, 200); }));
test('Email verification token is single-use and updates the account', () => run('demo', async f => { const c = f.client(), u = await c.register(); await f.mailer.flush(); const email = JSON.parse(readFileSync(path.join(f.dir, 'mail-preview.jsonl'), 'utf8').trim()); const token = email.text.match(/token=([a-f0-9]{64})/)[1]; assert.equal((await c.call('/auth/verify', 'POST', { token })).status, 200); assert.equal((await c.call('/session')).body.user.verified, true); assert.equal((await c.call('/auth/verify', 'POST', { token })).status, 400); }));
test('Password reset is single-use, rejects expired tokens, and revokes all sessions', () => run('demo', async f => { const c = f.client(), u = await c.register(); await c.call('/auth/forgot', 'POST', { email: u.email }); await f.mailer.flush(); const lines = readFileSync(path.join(f.dir, 'mail-preview.jsonl'), 'utf8').trim().split('\n').map(JSON.parse); const reset = lines.find(x => x.subject.includes('Reset')); const token = reset.text.match(/token=([a-f0-9]{64})/)[1]; const changed = await c.call('/auth/reset', 'POST', { token, password: 'A-new-test-password-2026' }); assert.equal(changed.status, 200); assert.equal((await c.call('/dashboard')).status, 401); await c.call('/session'); assert.equal((await c.call('/auth/reset', 'POST', { token, password: testPassword })).status, 400); assert.equal((await c.call('/auth/login', 'POST', { email: u.email, password: testPassword })).status, 401); assert.equal((await c.call('/auth/login', 'POST', { email: u.email, password: 'A-new-test-password-2026' })).status, 200); await c.call('/auth/forgot', 'POST', { email: u.email }); f.db.prepare("UPDATE tokens SET expires_at=0 WHERE kind='reset'").run(); await f.mailer.flush(); const expired = JSON.parse(readFileSync(path.join(f.dir, 'mail-preview.jsonl'), 'utf8').trim().split('\n').at(-1)).text.match(/token=([a-f0-9]{64})/)[1]; assert.equal((await c.call('/auth/reset', 'POST', { token: expired, password: testPassword })).status, 400); }));
test('Public catalogue exposes metadata only; previews and locked lessons are distinct', () => run('demo', async f => { const c = f.client(); const list = await c.call('/courses'); assert.equal(list.body.length, 3); assert.equal(list.body[0].lessons[0].body, undefined); assert.equal(list.body[0].lessons[0].video_url, undefined); assert.equal((await c.call('/preview/blueprint-1')).status, 200); assert.equal((await c.call('/preview/blueprint-2')).status, 404); assert.equal((await c.call('/learn/blueprint/blueprint-2')).status, 401); await c.register(); assert.equal((await c.call('/learn/blueprint/blueprint-2')).status, 403); assert.equal((await c.call('/progress/blueprint-2', 'PUT', { completed: true })).status, 403); }));
test('Demo enrolment uses server price, grants only its buyer, and persists completion idempotently', () => run('demo', async f => { const c = f.client(), other = f.client(); await c.register(); await other.register(); const o = (await c.call('/payments/order', 'POST', { courseId: 'blueprint', amount: 1 })).body; assert.equal(o.amount, 749900); assert.equal((await other.call('/payments/demo-complete', 'POST', { orderId: o.orderId })).status, 404); assert.equal((await c.call('/payments/demo-complete', 'POST', { orderId: o.orderId })).status, 200); assert.equal((await c.call('/payments/demo-complete', 'POST', { orderId: o.orderId })).status, 200); assert.equal((await c.call('/learn/blueprint/blueprint-2')).status, 200); assert.equal((await other.call('/learn/blueprint/blueprint-2')).status, 403); await c.call('/progress/blueprint-2', 'PUT', { completed: true }); await c.call('/progress/blueprint-2', 'PUT', { completed: true }); const d = (await c.call('/dashboard')).body; assert.equal(d.courses.length, 1); assert.equal(d.courses[0].completed.length, 1); assert.equal(d.courses[0].percent, 13); await c.call('/progress/blueprint-2', 'PUT', { completed: false }); assert.equal((await c.call('/dashboard')).body.courses[0].percent, 0); assert.equal((await other.call(`/orders/${o.orderId}`)).status, 404); }));
test('Owner operations require role; admin has unrestricted editing and publication power', () => run('demo', async f => { const c = f.client(), u = await c.register(); assert.equal((await c.call('/admin/overview')).status, 403); f.db.prepare("UPDATE users SET role='admin' WHERE id=?").run(u.id); const data = (await c.call('/admin/overview')).body; assert.equal(data.stats.revenue, 0); const { id, position, lessons, lessonCount, minutes, ...course } = data.courses[0]; assert.equal((await c.call(`/admin/courses/${id}`, 'PUT', { ...course, status: 'published', is_sample: true })).status, 200); assert.equal((await c.call(`/admin/courses/${id}`, 'PUT', { ...course, status: 'published', is_sample: false })).status, 200); assert.equal((await c.call('/admin/lessons/blueprint-1', 'PUT', { module_title: 'Intro', title: 'Welcome', body: '', video_url: '', minutes: 5, position: 0, is_preview: false })).status, 200); assert.equal((await c.call('/admin/lessons/blueprint-1', 'PUT', { module_title: 'Intro', title: 'Welcome', body: 'Real content', video_url: 'javascript:alert(1)', minutes: 5, position: 0, is_preview: false })).status, 400); }));
test('Razorpay checkout requires verification and launch readiness; demo endpoint is absent', () => run('razorpay', async f => { const c = f.client(); await c.register(); assert.equal((await c.call('/payments/order', 'POST', { courseId: 'blueprint' })).status, 403); f.db.prepare('UPDATE users SET verified=1').run(); assert.equal((await c.call('/payments/order', 'POST', { courseId: 'blueprint' })).status, 409); assert.equal((await c.call('/payments/demo-complete', 'POST', { orderId: randomUUID() })).status, 404); f.launch(); assert.equal((await c.call('/payments/order', 'POST', { courseId: 'blueprint' })).status, 200); }));
test('Verified, captured payment grants access exactly once and queues one access email', () => run('razorpay', async f => { const c = f.client(); await c.register(); f.launch(); const o = (await c.call('/payments/order', 'POST', { courseId: 'blueprint' })).body; const p = 'pay_captured1'; f.setPayment({ order_id: o.razorpayOrderId, amount: o.amount, currency: 'INR', status: 'captured', captured: true, amount_refunded: 0 }); const body = { orderId: o.orderId, razorpay_order_id: o.razorpayOrderId, razorpay_payment_id: p, razorpay_signature: signature(f, o, p) }; assert.equal((await c.call('/payments/verify', 'POST', body)).status, 200); assert.equal((await c.call('/payments/verify', 'POST', body)).status, 200); assert.equal((await c.call('/dashboard')).body.courses.length, 1); assert.equal(f.db.prepare("SELECT count(*) AS n FROM mail_jobs WHERE subject LIKE 'Your FAME course%'").get().n, 1); }));
test('Forged signatures, uncaptured payments and mismatched amounts never grant access', () => run('razorpay', async f => { const c = f.client(); await c.register(); f.launch(); const o = (await c.call('/payments/order', 'POST', { courseId: 'blueprint' })).body; const p = 'pay_testreject'; let body = { orderId: o.orderId, razorpay_order_id: o.razorpayOrderId, razorpay_payment_id: p, razorpay_signature: '0'.repeat(64) }; assert.equal((await c.call('/payments/verify', 'POST', body)).status, 400); body.razorpay_signature = signature(f, o, p); f.setPayment({ order_id: o.razorpayOrderId, amount: o.amount, currency: 'INR', status: 'authorized', captured: false }); assert.equal((await c.call('/payments/verify', 'POST', body)).status, 409); f.setPayment({ order_id: o.razorpayOrderId, amount: 100, currency: 'INR', status: 'captured', captured: true }); assert.equal((await c.call('/payments/verify', 'POST', body)).status, 409); assert.equal((await c.call('/dashboard')).body.courses.length, 0); }));
test('Webhook capture survives a closed checkout; duplicates and refunds are safe', () => run('razorpay', async f => { const c = f.client(); await c.register(); f.launch(); const o = (await c.call('/payments/order', 'POST', { courseId: 'blueprint' })).body; const p = 'pay_webhook'; const payment = { order_id: o.razorpayOrderId, amount: o.amount, currency: 'INR', status: 'captured', captured: true, amount_refunded: 0 }; f.setPayment(payment); const event = { event: 'payment.captured', payload: { payment: { entity: { id: p } } } }; assert.equal(await f.webhook(event, 'event1'), 200); assert.equal(await f.webhook(event, 'event1'), 200); assert.equal((await c.call('/dashboard')).body.courses.length, 1); f.setPayment({ ...payment, amount_refunded: 10000 }); assert.equal(await f.webhook({ event: 'refund.processed', payload: { refund: { entity: { payment_id: p } } } }, 'event2'), 200); assert.equal((await c.call('/dashboard')).body.courses.length, 1); f.setPayment({ ...payment, status: 'refunded', amount_refunded: o.amount }); assert.equal(await f.webhook({ event: 'refund.processed', payload: { refund: { entity: { payment_id: p } } } }, 'event3'), 200); assert.equal((await c.call('/dashboard')).body.courses.length, 0); assert.equal((await c.call('/learn/blueprint/blueprint-2')).status, 403); f.setPayment(payment); assert.equal(await f.webhook(event, 'event4'), 200); assert.equal((await c.call('/dashboard')).body.courses.length, 0); }));
test('Invalid webhook signature rejected; payment verification cannot cross account boundary', () => run('razorpay', async f => { const c = f.client(), other = f.client(); await c.register(); await other.register(); f.launch(); const o = (await c.call('/payments/order', 'POST', { courseId: 'blueprint' })).body; const p = 'pay_cross'; assert.equal((await c.call('/payments/webhook', 'POST', { event: 'payment.captured' }, { 'x-razorpay-signature': '0'.repeat(64) })).status, 400); assert.equal((await other.call('/payments/verify', 'POST', { orderId: o.orderId, razorpay_order_id: o.razorpayOrderId, razorpay_payment_id: p, razorpay_signature: signature(f, o, p) })).status, 404); }));
test('Gateway failure does not enrol and stores a failed order', () => run('razorpay', async f => { const c = f.client(); await c.register(); f.launch(); f.gateway.createOrder = async () => { throw Object.assign(new Error('Provider unavailable'), { status: 502 }); }; assert.equal((await c.call('/payments/order', 'POST', { courseId: 'blueprint' })).status, 502); assert.equal((await c.call('/dashboard')).body.courses.length, 0); assert.equal(f.db.prepare('SELECT status FROM orders').get().status, 'failed'); }));
test('Authentication endpoints have persistent rate limits', () => run('demo', async f => { const c = f.client(); await c.call('/session'); let last; for (let i = 0; i < 31; i++)last = await c.call('/auth/login', 'POST', { email: 'invalid', password: 'x' }); assert.equal(last.status, 429); assert.ok(last.headers.get('retry-after')); }));
test('Production rejects demo payments, HTTP and missing email configuration', () => { assert.throws(() => loadConfig({ production: true, paymentMode: 'demo', origin: 'https://fame.example' })); assert.throws(() => loadConfig({ production: true, paymentMode: 'razorpay', origin: 'http://fame.example', keyId: 'x', keySecret: 'x', webhookSecret: 'x' })); assert.throws(() => loadConfig({ production: true, paymentMode: 'razorpay', origin: 'https://fame.example', keyId: 'x', keySecret: 'x', webhookSecret: 'x', smtp: {}, mailFrom: '' })); });
test('Reopening checkout reuses a recent unpaid order instead of creating duplicate purchases', () => run('razorpay', async f => { const c = f.client(); await c.register(); f.launch(); const first = (await c.call('/payments/order', 'POST', { courseId: 'blueprint' })).body; const second = (await c.call('/payments/order', 'POST', { courseId: 'blueprint' })).body; assert.equal(first.orderId, second.orderId); assert.equal(first.razorpayOrderId, second.razorpayOrderId); assert.equal(f.db.prepare('SELECT count(*) AS n FROM orders').get().n, 1); }));
test('Previously stored demo orders never grant access in Razorpay mode', () => run('razorpay', async f => { const c = f.client(), u = await c.register(); f.launch(); f.db.prepare("INSERT INTO orders(id,user_id,course_id,amount,status,created_at) VALUES(?,?,'blueprint',749900,'demo',?)").run(randomUUID(), u.id, Date.now()); assert.equal((await c.call('/dashboard')).body.courses.length, 0); assert.equal((await c.call('/courses/food-business-blueprint')).body.hasAccess, false); assert.equal((await c.call('/learn/blueprint/blueprint-2')).status, 403); assert.equal((await c.call('/progress/blueprint-2', 'PUT', { completed: true })).status, 403); }));
test('Private media route requires enrolment; media location is absent from public metadata', () => run('demo', async f => { const c = f.client(); f.db.prepare("UPDATE lessons SET video_url='media:private-test.mp4' WHERE id='blueprint-2'").run(); assert.equal((await c.call('/media/blueprint-2')).status, 403); await c.register(); assert.equal((await c.call('/media/blueprint-2')).status, 403); assert.equal((await c.call('/courses/food-business-blueprint')).body.lessons[1].video_url, undefined); }));
test('Admin can grant and revoke course access to any arbitrary email address', () => run('demo', async f => {
  const adminClient = f.client();
  const u = await adminClient.register();
  f.db.prepare("UPDATE users SET role='admin' WHERE id=?").run(u.id);
  const targetEmail = 'vip.learner@example.com';
  const grantRes = await adminClient.call('/admin/enrol', 'POST', { email: targetEmail, courseId: 'blueprint' });
  assert.equal(grantRes.status, 201);
  assert.ok(grantRes.body.ok);
  assert.equal(grantRes.body.user.email, targetEmail);
  const enrolmentsRes = await adminClient.call('/admin/enrolments');
  assert.equal(enrolmentsRes.status, 200);
  const found = enrolmentsRes.body.enrolments.find(e => e.user_email === targetEmail && e.course_id === 'blueprint');
  assert.ok(found);
  const targetUser = f.db.prepare('SELECT id FROM users WHERE email=?').get(targetEmail);
  assert.ok(targetUser);
  const hasAccessInDb = f.db.prepare("SELECT 1 FROM orders WHERE user_id=? AND course_id='blueprint' AND status='captured'").get(targetUser.id);
  assert.ok(hasAccessInDb);
  const grantAgain = await adminClient.call('/admin/enrol', 'POST', { email: targetEmail, courseId: 'blueprint' });
  assert.equal(grantAgain.status, 200);
  assert.ok(grantAgain.body.alreadyEnrolled);
  const revokeRes = await adminClient.call('/admin/revoke-access', 'POST', { orderId: grantRes.body.orderId });
  assert.equal(revokeRes.status, 200);
  assert.ok(revokeRes.body.ok);
  const revokedOrder = f.db.prepare('SELECT status FROM orders WHERE id=?').get(grantRes.body.orderId);
  assert.equal(revokedOrder.status, 'refunded');
}));

test('Community doubts, rich personality profiles, and shareable public handles function end-to-end', () => run('demo', async f => {
  const alice = f.client();
  const aliceUser = await alice.register('alice.foodie@example.com');
  const bob = f.client();
  const bobUser = await bob.register('bob.founder@example.com');

  // 1. Initial profile fetch
  const initialMe = await alice.call('/profile/me');
  assert.equal(initialMe.status, 200);
  assert.ok(initialMe.body.profile.handle.startsWith('test'));

  // 2. Update profile with custom handle, avatar, headline, bio, business stage, social links
  const updateRes = await alice.call('/profile/me', 'PUT', {
    name: 'Alice AgroInnovator',
    handle: 'alice_millet',
    avatar: 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=',
    headline: 'Founder @ Millet Crunch | Ready-to-cook innovator',
    bio: 'Pioneering millet-based extruded snacks with zero refined flour. Building India first clean-label healthy munching brand.',
    location: 'Pune, Maharashtra',
    business_stage: 'Pilot Batch & Feedback',
    focus_area: 'Millets, Vacuum Frying, Nitrogen Sealing',
    website: 'https://milletcrunch.in',
    linkedin: 'https://linkedin.com/in/alice-millet',
    instagram: 'https://instagram.com/alice_millet',
    twitter: 'https://twitter.com/alice_millet',
  });
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.profile.handle, 'alice_millet');
  assert.equal(updateRes.body.profile.business_stage, 'Pilot Batch & Feedback');

  // 3. Handle conflict check
  const conflictRes = await bob.call('/profile/me', 'PUT', {
    handle: 'alice_millet',
    headline: 'Trying to steal handle',
  });
  assert.equal(conflictRes.status, 409);

  // 4. Public shareable profile: /api/u/alice_millet
  const publicRes = await f.client().call('/u/alice_millet');
  assert.equal(publicRes.status, 200);
  assert.equal(publicRes.body.profile.name, 'Alice AgroInnovator');
  assert.equal(publicRes.body.profile.handle, 'alice_millet');
  assert.equal(publicRes.body.profile.avatar, 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=');
  assert.equal(publicRes.body.profile.headline, 'Founder @ Millet Crunch | Ready-to-cook innovator');

  // 5. Post a community doubt
  const postRes = await alice.call('/community/posts', 'POST', {
    title: 'How to calculate vacuum frying moisture content for millets?',
    body: 'We are experimenting with vacuum frying foxtail millets at 110 degrees C. What final moisture level ensures crispiness without rancidity?',
    category: 'Packaging & Compliance',
  });
  assert.equal(postRes.status, 201);
  const postId = postRes.body.id;
  assert.ok(postId);

  // 6. Upvote doubt
  const upvoteRes = await bob.call(`/community/posts/${postId}/upvote`, 'POST');
  assert.equal(upvoteRes.status, 200);
  assert.equal(upvoteRes.body.upvoted, true);
  assert.equal(upvoteRes.body.count, 1);

  // Toggle upvote
  const unvoteRes = await bob.call(`/community/posts/${postId}/upvote`, 'POST');
  assert.equal(unvoteRes.status, 200);
  assert.equal(unvoteRes.body.upvoted, false);
  assert.equal(unvoteRes.body.count, 0);

  // Upvote again
  await bob.call(`/community/posts/${postId}/upvote`, 'POST');

  // 7. Post a reply
  const replyRes = await bob.call(`/community/posts/${postId}/replies`, 'POST', {
    body: 'For vacuum fried millets, keep moisture under 2.5% and verify with moisture analyzer before packing with 99.9% nitrogen flush.',
  });
  assert.equal(replyRes.status, 201);
  const replyId = replyRes.body.replyId;
  assert.ok(replyId);

  // 8. Author marks reply as accepted solution
  const solutionRes = await alice.call(`/community/replies/${replyId}/solution`, 'POST');
  assert.equal(solutionRes.status, 200);
  assert.equal(solutionRes.body.is_solution, true);

  // 9. Fetch post thread and verify
  const threadRes = await f.client().call(`/community/posts/${postId}`);
  assert.equal(threadRes.status, 200);
  assert.equal(threadRes.body.post.is_resolved, 1);
  assert.equal(threadRes.body.post.author_handle, 'alice_millet');
  assert.equal(threadRes.body.replies.length, 1);
  assert.equal(threadRes.body.replies[0].is_solution, 1);
  assert.equal(threadRes.body.replies[0].author_handle, bobUser.handle);
}));

