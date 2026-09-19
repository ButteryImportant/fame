import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { seed } from './seed.js';
export function openDatabase(filename) {
  if (filename !== ':memory:') mkdirSync(path.dirname(filename), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(filename);
  db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('student','admin')),verified INTEGER NOT NULL DEFAULT 0,created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id) ON DELETE CASCADE,csrf TEXT NOT NULL,expires_at INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE TABLE IF NOT EXISTS tokens(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,kind TEXT NOT NULL CHECK(kind IN ('verify','reset')),expires_at INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS idx_tokens_user_kind ON tokens(user_id,kind);
    CREATE TABLE IF NOT EXISTS courses(id TEXT PRIMARY KEY,slug TEXT NOT NULL UNIQUE,title TEXT NOT NULL,eyebrow TEXT NOT NULL,description TEXT NOT NULL,summary TEXT NOT NULL,price INTEGER NOT NULL CHECK(price>=0),level TEXT NOT NULL,accent TEXT NOT NULL DEFAULT 'green',status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','upcoming')),is_sample INTEGER NOT NULL DEFAULT 1,position INTEGER NOT NULL DEFAULT 0,outcomes TEXT NOT NULL DEFAULT '[]');
    CREATE TABLE IF NOT EXISTS lessons(id TEXT PRIMARY KEY,course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,module_title TEXT NOT NULL,title TEXT NOT NULL,body TEXT NOT NULL DEFAULT '',video_url TEXT NOT NULL DEFAULT '',minutes INTEGER NOT NULL DEFAULT 10,position INTEGER NOT NULL DEFAULT 0,is_preview INTEGER NOT NULL DEFAULT 0);
    CREATE INDEX IF NOT EXISTS idx_lessons_course_position ON lessons(course_id,position);
    CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),course_id TEXT NOT NULL REFERENCES courses(id),provider_order_id TEXT UNIQUE,payment_id TEXT UNIQUE,amount INTEGER NOT NULL CHECK(amount>0),currency TEXT NOT NULL DEFAULT 'INR',status TEXT NOT NULL CHECK(status IN ('creating','created','captured','demo','failed','refunded')),refund_amount INTEGER NOT NULL DEFAULT 0,created_at INTEGER NOT NULL,paid_at INTEGER);
    CREATE INDEX IF NOT EXISTS idx_orders_user_course ON orders(user_id,course_id,status);
    CREATE TABLE IF NOT EXISTS progress(user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0,1)),updated_at INTEGER NOT NULL,PRIMARY KEY(user_id,lesson_id));
    CREATE TABLE IF NOT EXISTS webhook_events(id TEXT PRIMARY KEY,created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS rate_limits(key TEXT PRIMARY KEY,count INTEGER NOT NULL,reset_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS mail_jobs(id TEXT PRIMARY KEY,recipient TEXT NOT NULL,subject TEXT NOT NULL,body TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',attempts INTEGER NOT NULL DEFAULT 0,next_attempt INTEGER NOT NULL,created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS profiles(user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,handle TEXT UNIQUE NOT NULL,avatar TEXT NOT NULL DEFAULT '',headline TEXT NOT NULL DEFAULT '',bio TEXT NOT NULL DEFAULT '',location TEXT NOT NULL DEFAULT '',business_stage TEXT NOT NULL DEFAULT 'Idea Phase',focus_area TEXT NOT NULL DEFAULT '',website TEXT NOT NULL DEFAULT '',linkedin TEXT NOT NULL DEFAULT '',instagram TEXT NOT NULL DEFAULT '',twitter TEXT NOT NULL DEFAULT '',updated_at INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS idx_profiles_handle ON profiles(handle);
    CREATE TABLE IF NOT EXISTS community_posts(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,title TEXT NOT NULL,body TEXT NOT NULL,category TEXT NOT NULL DEFAULT 'General',is_resolved INTEGER NOT NULL DEFAULT 0,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);
    CREATE TABLE IF NOT EXISTS community_replies(id TEXT PRIMARY KEY,post_id TEXT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,body TEXT NOT NULL,is_solution INTEGER NOT NULL DEFAULT 0,created_at INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS idx_community_replies_post ON community_replies(post_id,created_at ASC);
    CREATE TABLE IF NOT EXISTS community_upvotes(user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,post_id TEXT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,created_at INTEGER NOT NULL,PRIMARY KEY(user_id,post_id));
    PRAGMA user_version=2;`);
  seed(db);
  return db;
}
export function transaction(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const value = fn();
    db.exec('COMMIT');
    return value;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}
export function hasAccess(db, userId, courseId, allowDemo = false) {
  return !!db
    .prepare(
      "SELECT 1 FROM orders WHERE user_id=? AND course_id=? AND (status='captured' OR (status='demo' AND ?=1)) AND refund_amount<amount LIMIT 1"
    )
    .get(userId, courseId, allowDemo ? 1 : 0);
}
export function getSettings(db) {
  return Object.fromEntries(
    db
      .prepare('SELECT * FROM settings')
      .all()
      .map((r) => [r.key, r.value])
  );
}
