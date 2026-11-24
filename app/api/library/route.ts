import { env } from 'cloudflare:workers';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function handle(req:Request){
 const db=env.DB;if(!db)return json({error:'Account storage unavailable.'},503);
 const url=new URL(req.url);if(req.method!=='GET'&&(req.headers.get('Origin')!==url.origin||req.headers.get('Content-Type')!=='application/json'))return json({error:'Use Inner Orbit to save.'},403);
 const token=req.headers.get('cookie')?.match(/(?:^|;\s*)io_session=([a-f0-9]{64})(?:;|$)/)?.[1];
 if(!token)return json({error:'Sign in to sync your library.'},401);
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))),n=>n.toString(16).padStart(2,'0')).join('');
 const user=await db.prepare('SELECT user_id FROM sessions WHERE token=? AND expires>?').bind(digest,Date.now()).first<{user_id:string}>();
 if(!user)return json({error:'Your session ended. Sign in again; local recovery is preserved.'},401);
 const row=await db.prepare('SELECT revision,snapshot FROM library_accounts WHERE user_id=?').bind(user.user_id).first<{revision:number,snapshot:string}>();
 if(req.method==='GET')return json({userId:user.user_id,revision:row?.revision||0,snapshot:row?JSON.parse(row.snapshot):null});
 if(req.method!=='PUT')return json({error:'Method not allowed.'},405);
 const raw=await req.text();if(raw.length>900000)return json({error:'Library is too large to sync. Export your notes before reducing it.'},413);
 let body:any;try{body=JSON.parse(raw)}catch{return json({error:'Invalid library data.'},400)}
 if(body.userId!==user.user_id)return json({error:"Account changed. Reopen the library before saving."},401);
 const s=body.snapshot;
 if(!Number.isSafeInteger(body.revision)||body.revision<0||s?.version!==2||!s.library||!Array.isArray(s.highlights)||!Array.isArray(s.ledger)||!s.library.progress||!Array.isArray(s.library.bookmarks)||!s.library.notes||!Array.isArray(s.library.recent)||!s.library.readerPrefs)return json({error:'Unsupported library data. No records were overwritten.'},400);
 // Compare-and-swap makes every write conditional, including first creation.
 const encoded=JSON.stringify(s);
 let result;
 if(body.revision===0){result=await db.prepare('INSERT INTO library_accounts (user_id,revision,snapshot,updated) VALUES (?,1,?,?) ON CONFLICT(user_id) DO NOTHING RETURNING revision').bind(user.user_id,encoded,Date.now()).first<{revision:number}>();}
 else {result=await db.prepare('UPDATE library_accounts SET snapshot=?,revision=revision+1,updated=? WHERE user_id=? AND revision=? RETURNING revision').bind(encoded,Date.now(),user.user_id,body.revision).first<{revision:number}>();}
 if(!result){const latest=await db.prepare('SELECT revision,snapshot FROM library_accounts WHERE user_id=?').bind(user.user_id).first<{revision:number,snapshot:string}>();return json({error:'Another device changed these records.',revision:latest?.revision||0,snapshot:latest?JSON.parse(latest.snapshot):null},409);}
 return json({revision:result.revision});
}
async function safe(req:Request){try{return await handle(req)}catch{return json({error:'Library sync unavailable. Your local recovery copy is retained.'},503)}}
export {safe as GET,safe as PUT};
