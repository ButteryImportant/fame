import { DatabaseSync, backup } from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import path from 'node:path';
const file=path.resolve(process.env.DATABASE_PATH||'./data/fame.sqlite');
mkdirSync('backups',{recursive:true,mode:0o700});
const target=path.resolve('backups',`fame-${new Date().toISOString().replace(/[:.]/g,'-')}.sqlite`);
const db=new DatabaseSync(file,{readOnly:true});
try{await backup(db,target);console.log(`Backup saved: ${target}`);}finally{db.close();}
