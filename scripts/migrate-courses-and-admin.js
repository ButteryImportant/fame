import path from 'node:path';
import { openDatabase } from '../server/db.js';
import { hashPassword } from '../server/security.js';
import { syncBlueprintLessons } from '../server/seed.js';

const dbPath = path.resolve(process.env.DATABASE_PATH || './data/fame.sqlite');
console.log('Connecting to database:', dbPath);
const db = openDatabase(dbPath);

// 1. Update course status to 'published'
db.prepare("UPDATE courses SET status='published' WHERE id IN ('blueprint', 'mastery')").run();
console.log('Updated courses to published:', db.prepare('SELECT id, title, price, status FROM courses').all());

// 2. Sync all 15 Blueprint lessons with latest content and video URLs
syncBlueprintLessons(db);

const videoUrls = {
  'blueprint-1': 'https://www.youtube.com/watch?v=V91WAr_cGwg&list=PLN9bNLEBeLek',
  'blueprint-2': 'https://www.youtube.com/watch?v=-gQoeOBgDWM&list=PLN9bNLEBeLek&index=2&pp=iAQBsAgC',
  'blueprint-3': 'https://www.youtube.com/watch?v=-h_VVUn7wpg&list=PLN9bNLEBeLek&index=3&pp=iAQBsAgC',
  'blueprint-4': 'https://www.youtube.com/watch?v=0uYaotUSyU0&list=PLN9bNLEBeLek&index=4&pp=iAQB0gcJCSQMAYcqIYzvsAgC',
  'blueprint-5': 'https://www.youtube.com/watch?v=q0pCmpmymhA&list=PLN9bNLEBeLek&index=5&pp=iAQBsAgC',
  'blueprint-6': 'https://www.youtube.com/watch?v=HWxZ1kXnd60&list=PLN9bNLEBeLek&index=6&pp=iAQBsAgC',
  'blueprint-7': 'https://www.youtube.com/watch?v=O9zTlMViaB4&list=PLN9bNLEBeLek&index=7&pp=iAQBsAgC',
  'blueprint-8': 'https://www.youtube.com/watch?v=dmgAXe-gI6Q&list=PLN9bNLEBeLek&index=8&pp=iAQBsAgC',
  'blueprint-9': 'https://www.youtube.com/watch?v=tp6aRHTGwDQ&list=PLN9bNLEBeLek&index=9&pp=iAQB0gcJCSQMAYcqIYzvsAgC',
  'blueprint-10': 'https://www.youtube.com/watch?v=ZPWI3sSbEKQ&list=PLN9bNLEBeLek&index=10&pp=iAQBsAgC',
  'blueprint-11': 'https://www.youtube.com/watch?v=LOX-iC07R2c&list=PLN9bNLEBeLek&index=11&pp=iAQBsAgC',
  'blueprint-12': 'https://www.youtube.com/watch?v=COkeGU9NkSM&list=PLN9bNLEBeLek&index=12&pp=iAQBsAgC',
  'blueprint-13': 'https://www.youtube.com/watch?v=Y7sJAUQ8AaU&list=PLN9bNLEBeLek&index=13&pp=iAQBsAgC',
  'blueprint-14': 'https://www.youtube.com/watch?v=y6yKu_O8P1Q&list=PLN9bNLEBeLek&index=14&pp=iAQBsAgC',
  'blueprint-15': 'https://www.youtube.com/watch?v=SZxs84uwkM8&list=PLN9bNLEBeLek&index=15&pp=iAQBsAgC',
  'mastery-1': 'https://www.youtube.com/watch?v=7wtfhZwyrcc',
  'mastery-2': 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
};

const updateLessonVideo = db.prepare('UPDATE lessons SET video_url=? WHERE id=?');
for (const [lessonId, url] of Object.entries(videoUrls)) {
  updateLessonVideo.run(url, lessonId);
}
console.log('Updated lesson videos:', db.prepare("SELECT id, title, video_url FROM lessons WHERE course_id='blueprint' ORDER BY position").all());

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
