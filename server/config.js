import path from 'node:path';
export function loadConfig(overrides = {}) {
  const production = process.env.NODE_ENV === 'production';
  const c = {
    production,
    port: Number(process.env.PORT || 4173),
    origin: process.env.APP_ORIGIN || 'http://localhost:4173',
    dbPath: path.resolve(process.env.DATABASE_PATH || './data/fame.sqlite'),
    paymentMode: process.env.PAYMENT_MODE || 'demo',
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
    supportEmail: process.env.SUPPORT_EMAIL || '',
    proxyHops: Number(process.env.TRUST_PROXY_HOPS || 0),
    smtp: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    },
    mailFrom: process.env.MAIL_FROM,
    ...overrides,
  };
  if (!['demo', 'razorpay'].includes(c.paymentMode))
    throw new Error('PAYMENT_MODE must be demo or razorpay');
  if (new URL(c.origin).origin !== c.origin)
    throw new Error('APP_ORIGIN must be an origin without a trailing slash or path');
  if (!Number.isInteger(c.proxyHops) || c.proxyHops < 0 || c.proxyHops > 3)
    throw new Error('Invalid TRUST_PROXY_HOPS');
  if (c.production && (c.paymentMode === 'demo' || !c.origin.startsWith('https://')))
    throw new Error('Production requires HTTPS APP_ORIGIN and PAYMENT_MODE=razorpay');
  if (c.paymentMode === 'razorpay' && (!c.keyId || !c.keySecret || !c.webhookSecret))
    throw new Error('Razorpay mode requires key ID, key secret and webhook secret');
  if (c.production && (!c.smtp.host || !c.mailFrom))
    throw new Error('Production requires SMTP_HOST and MAIL_FROM');
  return c;
}
