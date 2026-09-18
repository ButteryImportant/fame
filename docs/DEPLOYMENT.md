# Deploying FAME

## Supported architecture

React 19 + Vite frontend, Express 5 on Node.js 24 LTS, built-in SQLite with WAL, persistent server sessions, Nodemailer and Razorpay REST APIs. Serve frontend and API on one origin. The application is intended for a **single application instance with a persistent local volume**. Do not deploy it to a static-only host, ephemeral filesystem or several instances with separate SQLite files.

For larger scale, migrate the repository layer to a managed database, use a dedicated mail worker and signed video streaming, then repeat load and security testing. No production capacity claim or penetration-test certification is implied.

## Production configuration

Copy `.env.example` to `.env` on the server. Configure:

```dotenv
NODE_ENV=production
PORT=4173
APP_ORIGIN=https://your-domain.example
DATABASE_PATH=./data/fame.sqlite
PAYMENT_MODE=razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_private_key_secret
RAZORPAY_WEBHOOK_SECRET=your_private_webhook_secret
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
MAIL_FROM=FAME <your-verified-sender@example.com>
TRUST_PROXY_HOPS=1
```

Use a real HTTPS origin, without a trailing slash. `TRUST_PROXY_HOPS=1` is appropriate only if exactly one trusted reverse proxy fronts the application. Otherwise configure the actual topology or use 0 for direct connections. Restrict direct access to the backend port. HTTP-only local demo is supported only outside production.

Configure a reverse proxy (Caddy/Nginx or your host's equivalent) with HTTPS, request size limits and correct forwarding. Route all paths to the application, including `/api/payments/webhook`. Keep `/api` on the same origin; no cross-origin cookie setup is required.

Run:

```sh
npm ci
npm test
npm run build
npm run admin
npm start
```

Use a process supervisor for `npm start`. Keep `data/` and `private-media/` persistent, private and backed up. Start with a fresh production database: do not ship a testing database containing accounts or email tokens. Database schema and draft starter programmes initialise on first start. This version uses schema version 1; future schema changes should be delivered as explicit migrations.

## Docker alternative

After configuring `.env`:

```sh
docker compose up -d --build
docker compose exec fame node scripts/create-admin.js
```

The compose port binds only to host loopback for use behind a reverse proxy. Named volumes preserve the database and backups. Videos are mounted read-only from `private-media`. Configure permissions so the container's `node` user can read the recordings. No secrets are baked into the image.

For Docker backups: `docker compose exec fame node scripts/backup.js`. Export a copy of the backup volume to a separate storage location.

## Razorpay setup and validation

1. Use Razorpay **test mode** credentials first. Add the test key pair to `.env`, select `PAYMENT_MODE=razorpay`, configure SMTP and restart.
2. In the owner dashboard, add the real business details and policies. Review and publish a finished course. Test checkout remains subject to the same readiness checks as live checkout.
3. Set the webhook URL to `https://your-domain.example/api/payments/webhook` and use the exact same dedicated secret as `RAZORPAY_WEBHOOK_SECRET`.
4. Subscribe to `payment.captured`, `order.paid`, `refund.processed`, and `payment.refunded`. Configure automatic capture in Razorpay. The app does not grant access for `authorized` payments alone and does not issue refunds automatically.
5. Test payment success, failure, cancellation, delayed callback and duplicate webhook delivery. Confirm order amount/currency, received email, course access and saved progress.
6. Trigger a partial refund and a full refund in the test dashboard. Partial refunds retain course access; full refunds revoke the relevant purchase. Another valid paid purchase of the same course still grants access. Delayed capture events cannot undo a full refund.
7. Review actual published prices, taxes and programme descriptions. Replace test credentials with live credentials only after account activation and a successful hosted test transaction. Never re-use a test database as the live database.

Orders are created on the server using the database price in paise. Payment signatures use the locally stored provider order ID. The server fetches payment details and checks the order, amount, currency and captured status before enabling access. Signed webhooks provide a second confirmation path if the browser closes. Stored webhook IDs and order state make repeated callbacks idempotent.

A refunded purchase remains in order history. The dashboard's revenue metric excludes demo orders and subtracts processed refunds from captured orders. It is an operational view, not a tax invoice or accounting ledger. Issue legally appropriate invoices through your normal accounting process.

## Email and recovery

The database contains a durable email queue. A worker in the app attempts delivery every ten seconds, with up to eight attempts and increasing delays. Sent message bodies are removed from the queue. The owner dashboard shows queue status. Inspect pending/failed-attempt jobs operationally and fix SMTP issues before launch; there is no external email service configured in this ZIP.

Use a verified sender with SPF/DKIM/DMARC configured at your mail provider. Password reset links expire after one hour and verification links after 24 hours. Password reset invalidates the user's active sessions. Do not expose the database or development mail preview file.

## Backups and restore

Run `npm run backup`. It uses SQLite's backup API so WAL data is included consistently. Back up private video files separately. Encrypt offsite backups and test restoration.

To restore, stop the application, preserve a copy of the current database plus its WAL/SHM files, place the chosen backup at `DATABASE_PATH`, remove stale WAL/SHM files for that restored database while the app is stopped, and restart. Verify owner sign-in and a learner's enrolment/progress. This process must be operated by the server owner.

## Source references

- Razorpay Standard Checkout integration: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/
- Razorpay webhook validation: https://razorpay.com/docs/webhooks/validate-test/
- Razorpay payment capture: https://razorpay.com/docs/payments/payments/capture-settings/
- Node.js SQLite API: https://nodejs.org/api/sqlite.html

The integration was checked against the official Standard Checkout documentation during implementation. External payment and email services still require account-specific end-to-end testing with your credentials.
