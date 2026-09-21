import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { openDatabase } from '../server/db.js';

export const SILVER_EMAILS = [
  'amitkpatra29@gmail.com',
  'maharashtrasugars@gmail.com',
  'kumarharishchandra0@gmail.com',
  'engineersriraj@gmail.com',
  'prashanthbannur@gmail.com',
  'deepsinghbungai@gmail.com',
  'hansilmaru@gmail.com',
  'drmanuvet@gmail.com',
  'anshul.jazzy@gmail.com',
  'anuradhaudgire641@gmail.com',
  'yashaswiagro06@gmail.com',
  'borichanh@gmail.com',
  'parikshit.enq@gmail.com',
  'rajkumar.tanishq@gmail.com',
  'ddmosantosh@gmail.com',
  'sudhir.soundalkar@gmail.com',
  'tirumalaepidemics@gmail.com',
  'yogitasdeshmukh12@gmail.com',
  'jainbasant22@gmail.com',
  'lochan.makhija@gmail.com',
  'sibapala56@gmail.com',
  'umeshinter@ymail.com',
  'afserkar786@gmail.com',
  'acharyarathindra@gmail.com',
  'bobidegangamohan@gmail.com',
  'dakshwanth_kumar@yahoo.com',
  'arjunchakure@gmail.com',
  'tankshyam.tank@gmail.com',
  'madhusarkar26@gmail.com',
  'manokdubeyonline@gmail.com',
  'vd.manoj5078@gmail.com',
  'narvirsirohi19@gmail.com',
  'prasad.bankeshwar@gmail.com',
  'rakesh8k7@gmail.com',
  'borkarvijendra2@gmail.com',
  'das.satyaswaroop@gmail.com',
  'randeepsidhu1976@gmail.com',
];

export function grantSilverAccess(db) {
  const courseId = 'blueprint';
  const course = db.prepare('SELECT * FROM courses WHERE id=?').get(courseId);
  if (!course) {
    throw new Error(`Silver course with id "${courseId}" not found in database.`);
  }

  const cleanList = [...new Set(SILVER_EMAILS.map((e) => e.trim().toLowerCase()))];
  console.log(`Processing ${cleanList.length} emails for Silver Course ("${course.title}")...`);

  let addedGrants = 0;
  let alreadyGranted = 0;
  let existingUsersEnrolled = 0;

  for (const email of cleanList) {
    const existingGrant = db
      .prepare('SELECT * FROM preapproved_grants WHERE LOWER(email)=? AND course_id=?')
      .get(email, courseId);

    let grantId = existingGrant?.id;
    if (!existingGrant) {
      grantId = randomUUID();
      db.prepare(
        'INSERT INTO preapproved_grants(id, email, course_id, created_at) VALUES(?, ?, ?, ?)'
      ).run(grantId, email, courseId, Date.now());
      addedGrants++;
    } else {
      alreadyGranted++;
    }

    // If an account already exists in users for this email, grant order immediately
    const user = db.prepare('SELECT * FROM users WHERE LOWER(email)=?').get(email);
    if (user) {
      const existingOrder = db
        .prepare(
          "SELECT id FROM orders WHERE user_id=? AND course_id=? AND (status='captured' OR status='demo') AND refund_amount<amount LIMIT 1"
        )
        .get(user.id, courseId);

      if (!existingOrder) {
        const orderId = randomUUID();
        const orderAmount = Math.max(course.price || 0, 1);
        const now = Date.now();
        db.prepare(
          "INSERT INTO orders(id,user_id,course_id,provider_order_id,payment_id,amount,currency,status,refund_amount,created_at,paid_at) VALUES(?,?,?,?,?,?,'INR','captured',0,?,?)"
        ).run(
          orderId,
          user.id,
          courseId,
          'pregrant_' + randomUUID(),
          'grant_' + randomUUID(),
          orderAmount,
          now,
          now
        );
        existingUsersEnrolled++;
      }

      db.prepare(
        'UPDATE preapproved_grants SET claimed_at=?, claimed_by_user_id=? WHERE id=?'
      ).run(Date.now(), user.id, grantId);
    }
  }

  return {
    total: cleanList.length,
    addedGrants,
    alreadyGranted,
    existingUsersEnrolled,
  };
}

// If run directly from CLI:
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('grant-silver-course-access.js')) {
  const dbPath = path.resolve(process.env.DATABASE_PATH || './data/fame.sqlite');
  console.log('Connecting to database:', dbPath);
  const db = openDatabase(dbPath);
  try {
    const res = grantSilverAccess(db);
    console.log('Grant results:', res);
    const count = db.prepare('SELECT count(*) as count FROM preapproved_grants').get().count;
    console.log(`Total pre-approved grants in database: ${count}`);
  } finally {
    db.close();
  }
}
