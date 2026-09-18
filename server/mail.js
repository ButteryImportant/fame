import nodemailer from 'nodemailer';
import { appendFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
export function createMailer(db, config) {
  const transport = config.smtp.host ? nodemailer.createTransport(config.smtp) : null;
  let busy = false;
  function queue(recipient, subject, body) {
    db.prepare(
      'INSERT INTO mail_jobs(id,recipient,subject,body,next_attempt,created_at) VALUES(?,?,?,?,?,?)'
    ).run(randomUUID(), recipient, subject, body, Date.now(), Date.now());
  }
  async function flush() {
    if (busy) return;
    busy = true;
    try {
      for (const job of db
        .prepare(
          "SELECT * FROM mail_jobs WHERE status='pending' AND attempts<8 AND next_attempt<=? LIMIT 10"
        )
        .all(Date.now())) {
        try {
          if (transport)
            await transport.sendMail({
              from: config.mailFrom,
              to: job.recipient,
              subject: job.subject,
              text: job.body,
            });
          else if (!config.production) {
            const dir = path.dirname(config.dbPath);
            mkdirSync(dir, { recursive: true });
            appendFileSync(
              path.join(dir, 'mail-preview.jsonl'),
              JSON.stringify({ to: job.recipient, subject: job.subject, text: job.body }) + '\n',
              { mode: 0o600 }
            );
          } else throw new Error('Mail unavailable');
          db.prepare("UPDATE mail_jobs SET status='sent',body='' WHERE id=?").run(job.id);
        } catch {
          db.prepare('UPDATE mail_jobs SET attempts=attempts+1,next_attempt=? WHERE id=?').run(
            Date.now() + Math.min(3600000, 30000 * 2 ** job.attempts),
            job.id
          );
          console.error('Email delivery deferred; inspect owner mail status.');
        }
      }
    } finally {
      busy = false;
    }
  }
  return { queue, flush };
}
