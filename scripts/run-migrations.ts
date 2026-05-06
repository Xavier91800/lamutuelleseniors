import { getDb } from '../src/lib/db/client';

const db = getDb();
console.log(`[migrate] applied. Tables: ${db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((r: { name: string } | unknown) => (r as { name: string }).name).join(', ')}`);
db.close();
