import path from 'node:path';
import { openDatabase } from '../server/db.js';
import { hashPassword } from '../server/security.js';

const dbPath = path.resolve(process.env.DATABASE_PATH || './data/fame.sqlite');
console.log('Connecting to database:', dbPath);
const db = openDatabase(dbPath);

// 1. Update course status to 'published'
db.prepare("UPDATE courses SET status='published' WHERE id IN ('blueprint', 'mastery')").run();
console.log('Updated courses to published:', db.prepare('SELECT id, title, price, status FROM courses').all());

// 2. Update lesson video URLs
const videoUrls = {
  'blueprint-1': 'https://www.youtube.com/watch?v=7wtfhZwyrcc',
  'blueprint-2': 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
  'blueprint-3': 'https://www.youtube.com/watch?v=_tV5g6gkMrQ',
  'blueprint-4': 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
  'blueprint-5': 'https://www.youtube.com/watch?v=J---aiyznGQ',
  'blueprint-6': 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
  'blueprint-7': 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
  'blueprint-8': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'mastery-1': 'https://www.youtube.com/watch?v=7wtfhZwyrcc',
  'mastery-2': 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
};

const updateLessonVideo = db.prepare('UPDATE lessons SET video_url=? WHERE id=?');
for (const [lessonId, url] of Object.entries(videoUrls)) {
  updateLessonVideo.run(url, lessonId);
}
console.log('Updated lesson videos:', db.prepare('SELECT id, title, video_url FROM lessons').all());

// 3. Create or update the admin account: username manmath, password manmath
const passwordHash = await hashPassword('manmath');
const existingAdmin = db.prepare("SELECT id FROM users WHERE email='manmath' OR email='manmath@fame.com'").get();

if (existingAdmin) {
  db.prepare("UPDATE users SET password_hash=?, role='admin', verified=1, name='Manmath Biradar' WHERE id=?").run(passwordHash, existingAdmin.id);
  console.log('Updated existing admin account:', existingAdmin.id);
} else {
  db.prepare("INSERT INTO users(id, name, email, password_hash, role, verified, created_at) VALUES(?, 'Manmath Biradar', 'manmath', ?, 'admin', 1, ?)").run(
    'admin-manmath',
    passwordHash,
    Date.now()
  );
  console.log('Created new admin account for manmath');
}

console.log('Current users:', db.prepare('SELECT id, name, email, role, verified FROM users').all());
db.close();
console.log('Migration complete.');
