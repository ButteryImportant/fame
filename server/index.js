import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { loadConfig } from './config.js';
import { createApp } from './app.js';
const config = loadConfig();
const { app, db, mailer } = createApp(config);
if (process.argv.includes('--dev')) {
  if (config.production) throw new Error('Development server cannot run in production.');
  const { createServer } = await import('vite');
  const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
} else {
  const root = path.resolve('dist');
  if (!existsSync(path.join(root, 'index.html')))
    throw new Error('Run npm run build before npm start.');
  app.use(express.static(root, { index: false, maxAge: '1h' }));
  app.get('/{*path}', (_req, res) => res.sendFile(path.join(root, 'index.html')));
}
const server = app.listen(config.port, '0.0.0.0', () =>
  console.log(`FAME is running on port ${config.port} (${config.paymentMode} mode).`)
);
const mailTimer = setInterval(() => void mailer.flush(), 10000);
void mailer.flush();
const cleanup = setInterval(() => {
  const now = Date.now();
  db.prepare('DELETE FROM sessions WHERE expires_at<?').run(now);
  db.prepare('DELETE FROM tokens WHERE expires_at<?').run(now);
  db.prepare('DELETE FROM rate_limits WHERE reset_at<?').run(now);
  db.prepare('DELETE FROM webhook_events WHERE created_at<?').run(now - 90 * 86400000);
}, 3600000);
function shutdown() {
  clearInterval(mailTimer);
  clearInterval(cleanup);
  server.close(() => {
    db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
