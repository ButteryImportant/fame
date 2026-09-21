import path from 'node:path';
import { openDatabase } from '../server/db.js';

const dbPath = path.resolve(process.env.DATABASE_PATH || './data/fame.sqlite');
console.log('Connecting to database:', dbPath);
const db = openDatabase(dbPath);

try {
  const beforeCount = db.prepare('SELECT count(*) as count FROM preapproved_grants').get().count;
  console.log(`Pre-approved grants before deletion: ${beforeCount}`);

  // Delete all preapproved grants
  const result = db.prepare('DELETE FROM preapproved_grants').run();
  console.log('Deleted preapproved grants:', result);

  const afterCount = db.prepare('SELECT count(*) as count FROM preapproved_grants').get().count;
  console.log(`Pre-approved grants after deletion: ${afterCount}`);
} finally {
  db.close();
  console.log('Database connection closed.');
}
