import readline from 'node:readline';
import { Writable } from 'node:stream';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { openDatabase } from '../server/db.js';
import { hashPassword } from '../server/security.js';
let hidden=false;
const output=new Writable({write(chunk,encoding,callback){if(!hidden)process.stdout.write(chunk,encoding);callback();}});
const rl=readline.createInterface({input:process.stdin,output,terminal:true});
const ask=question=>new Promise(resolve=>rl.question(question,resolve));
try{
  if(!process.stdin.isTTY)throw new Error('Run this command in an interactive terminal. Passwords are entered privately.');
  const name=(await ask('Owner name: ')).trim();
  const email=(await ask('Owner email: ')).trim().toLowerCase();
  if(name.length<2||name.length>80||!/^\S+@\S+\.\S+$/.test(email)||email.length>254)throw new Error('Enter a valid name and email.');
  process.stdout.write('Owner password (12+ characters, input hidden): ');hidden=true;
  const password=await ask('');hidden=false;process.stdout.write('\n');
  if(password.length<12||password.length>128)throw new Error('Password must be 12–128 characters.');
  const db=openDatabase(path.resolve(process.env.DATABASE_PATH||'./data/fame.sqlite'));
  if(db.prepare('SELECT id FROM users WHERE email=?').get(email)){db.close();throw new Error('That account already exists. Choose a new owner email. This command never overwrites an account.');}
  const encoded=await hashPassword(password);
  db.prepare("INSERT INTO users(id,name,email,password_hash,role,verified,created_at) VALUES(?,?,?,?,'admin',1,?)").run(randomUUID(),name,email,encoded,Date.now());db.close();
  console.log('Owner account created. Sign in and open Owner dashboard.');
}catch(e){console.error(e.message);process.exitCode=1;}finally{rl.close();}
