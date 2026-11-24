import { env } from 'cloudflare:workers';
export const dynamic='force-dynamic';
const ID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const hex=(b:ArrayBuffer)=>Array.from(new Uint8Array(b),v=>v.toString(16).padStart(2,'0')).join('');
async function handle(req:Request){
 const url=new URL(req.url),db=env.DB;
 const out=(value:unknown,status=200,cookie?:string)=>Response.json(value,{status,headers:{'Cache-Control':'no-store',...(cookie?{'Set-Cookie':cookie}:{})}});
 if(!db)return out({error:'Saving is temporarily unavailable.'},503);
 if(req.method!=='GET'&&req.headers.get('Origin')!==url.origin)return out({error:'Submit from Inner Orbit.'},403);
 let token=req.headers.get('cookie')?.match(/(?:^|;\s*)io_alchemy=([a-f0-9]{64})(?:;|$)/)?.[1];
 if(!token)token=hex(crypto.getRandomValues(new Uint8Array(32)).buffer);
 const owner=hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)));
 const cookie=`io_alchemy=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=31536000${url.protocol==='https:'?'; Secure':''}`;
 const id=url.searchParams.get('id');
 if(id&&!ID.test(id))return out({error:'Invalid journey.'},400);
 if(req.method==='GET'){
  const row=id?await db.prepare('SELECT data FROM alchemy_journeys WHERE id=? AND owner=?').bind(id,owner).first<{data:string}>():await db.prepare('SELECT data FROM alchemy_journeys WHERE owner=? ORDER BY updated DESC LIMIT 1').bind(owner).first<{data:string}>();
  return out({journey:row?JSON.parse(row.data):null},200,cookie);
 }
 if(req.method==='PUT'){
  if(req.headers.get('content-type')!=='application/json')return out({error:'Use JSON.'},415);
  if(Number(req.headers.get('content-length')||0)>24000)return out({error:'Journey too large.'},413);
  const raw=await req.text();if(raw.length>24000)return out({error:'Journey too large.'},413);
  let j:any;try{j=JSON.parse(raw).journey}catch{return out({error:'Invalid journey.'},400)}
  if(!j||j.v!==1||!ID.test(j.id)||!Number.isInteger(j.step)||j.step<0||j.step>8||!Number.isInteger(j.maxStep)||j.maxStep<j.step||j.maxStep>8||!j.intake||typeof j.intake!=='object'||!j.rites||typeof j.rites!=='object'||!Array.isArray(j.practiceLog)||!Number.isFinite(j.updatedAt))return out({error:'Invalid journey.'},400);
  // A journey id is never sufficient authority to read or overwrite another browser's work.
  const result=await db.prepare('INSERT INTO alchemy_journeys (id,owner,data,updated) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,updated=excluded.updated WHERE alchemy_journeys.owner=excluded.owner AND excluded.updated>=alchemy_journeys.updated').bind(j.id,owner,JSON.stringify(j),j.updatedAt).run();
  if(!result.meta.changes)return out({error:'This journey cannot overwrite a newer or different private save.'},409);
  return out({ok:true},200,cookie);
 }
 if(req.method==='DELETE'&&id){await db.prepare('DELETE FROM alchemy_journeys WHERE id=? AND owner=?').bind(id,owner).run();return out({ok:true},200,cookie)}
 return out({error:'Not found.'},404);
}
async function safe(req:Request){try{return await handle(req)}catch{return Response.json({error:'Your journey could not be saved. Please keep this tab open and try again.'},{status:503,headers:{'Cache-Control':'no-store'}})}}
export {safe as GET,safe as PUT,safe as DELETE};
