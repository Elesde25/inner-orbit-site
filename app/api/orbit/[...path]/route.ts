import { env } from 'cloudflare:workers';
export const dynamic='force-dynamic';
const enc=new TextEncoder();
const hex=(a:ArrayBuffer)=>Array.from(new Uint8Array(a),b=>b.toString(16).padStart(2,'0')).join('');
const random=()=>hex(crypto.getRandomValues(new Uint8Array(32)).buffer);
const digest=async(s:string)=>hex(await crypto.subtle.digest('SHA-256',enc.encode(s)));
const dataCategory:Record<string,string>={'inner-orbit-universe-v2':'progress','inner-orbit-demo-v1':'progress','inner-orbit-world-v1':'progress','inner-orbit-natal-input':'birthChart','inner-orbit-chart-view':'birthChart','inner-orbit-numerology-v1':'birthChart','inner-orbit:imported-birth:v1':'birthChart','inner-orbit-experience-v1':'appearanceAudio','inner-orbit:alchemy:journey:v1':'alchemy'};
const emptyAccountData=()=>({version:1,profile:{displayName:'',avatarForm:null},preferences:{sync:{progress:false,birthChart:false,appearanceAudio:false,alchemy:false}},records:{},conflicts:[]});
function validAccountData(value:any){if(value?.version!==1||typeof value.profile?.displayName!=='string'||value.profile.displayName.length>80||(value.profile.avatarForm!==null&&!['feminine','masculine','androgynous'].includes(value.profile.avatarForm))||!value.preferences?.sync||!value.records||typeof value.records!=='object'||Array.isArray(value.records)||!Array.isArray(value.conflicts)||value.conflicts.length>100)return false;for(const category of ['progress','birthChart','appearanceAudio','alchemy'])if(typeof value.preferences.sync[category]!=='boolean')return false;for(const [key,record] of Object.entries(value.records) as [string,any][]){if(!dataCategory[key]||!value.preferences.sync[dataCategory[key]]||typeof record?.value!=='string'||record.value.length>120000||!Number.isSafeInteger(record.updatedAt)||record.updatedAt<0)return false}for(const conflict of value.conflicts)if(!dataCategory[conflict?.key]||!value.preferences.sync[dataCategory[conflict.key]]||!['device','account'].includes(conflict.source)||typeof conflict.value!=='string'||conflict.value.length>120000||!Number.isSafeInteger(conflict.updatedAt)||conflict.updatedAt<0||(conflict.deleted!==undefined&&typeof conflict.deleted!=='boolean'))return false;return JSON.stringify(value).length<=240000}
async function password(s:string,salt:string){const key=await crypto.subtle.importKey('raw',enc.encode(s),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:enc.encode(salt),iterations:100000},key,256));}
function json(data:unknown,status=200,cookie?:string){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(cookie?{'Set-Cookie':cookie}:{})}});}
async function api(req:Request){
 const db=env.DB;if(!db)return json({error:'Journal storage is temporarily unavailable.'},503);
 const url=new URL(req.url),action=url.pathname.split('/').pop();
 const mut=req.method!=='GET';
 if(mut&&(req.headers.get('Origin')!==url.origin||req.headers.get('Content-Type')!=='application/json'))return json({error:'Please submit from Inner Orbit.'},403);
 const maxBody=action==='data'?260000:24000;
 if(Number(req.headers.get('content-length')||0)>maxBody)return json({error:'Entry is too long.'},413);
 const token=req.headers.get('cookie')?.match(/(?:^|;\s*)io_session=([a-f0-9]{64})(?:;|$)/)?.[1];
 const tokenHash=token?await digest(token):'';
 const user=token?await db.prepare('SELECT accounts.id, accounts.email FROM sessions JOIN accounts ON accounts.id=sessions.user_id WHERE token=? AND expires>?').bind(tokenHash,Date.now()).first<{id:string,email:string}>():null;
 if(req.method==='GET'&&action==='session'){await db.prepare('SELECT 1 FROM accounts LIMIT 1').first();return json({user});}
 const cookie=(value:string,max=2592000)=>`io_session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${max}${url.protocol==='https:'?'; Secure':''}`;
 let body:any={};if(mut){const raw=await req.text();if(raw.length>maxBody)return json({error:'Entry is too long.'},413);try{body=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}}
 if(req.method==='POST'&&action==='logout'){
  if(typeof body.userId!=='string')return json({error:'Confirm the account before signing out.'},400);
  if(!user)return json({error:'Your session has changed. Refresh account status before signing out.'},401);
  if(user.id!==body.userId)return json({error:'Your session has changed. Refresh account status before signing out.'},409);
  await db.prepare('DELETE FROM sessions WHERE token=? AND user_id=?').bind(tokenHash,user.id).run();return json({ok:true},200,cookie('',0));
 }
 if(req.method==='POST'&&action==='delete-account'){
  if(!user)return json({error:'Sign in again before deleting this account.'},401);
  if(body.confirmation!=='DELETE'||typeof body.password!=='string'||body.password.length<12||body.password.length>128)return json({error:'Confirm deletion and re-enter your password.'},400);
  const key=await digest(`${req.headers.get('cf-connecting-ip')||'local'}:delete:${Math.floor(Date.now()/900000)}`);
  const rate=await db.prepare('INSERT INTO attempts (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,Date.now()+900000).first<{count:number}>();
  if((rate?.count||0)>20)return json({error:'Too many attempts. Please try again in 15 minutes.'},429);
  const account=await db.prepare('SELECT hash,salt FROM accounts WHERE id=?').bind(user.id).first<{hash:string,salt:string}>();
  if(!account||await password(body.password,account.salt)!==account.hash)return json({error:'Password is incorrect. No account data was deleted.'},403);
  await db.batch([
   db.prepare('DELETE FROM sessions WHERE user_id=?').bind(user.id),
   db.prepare('DELETE FROM journal WHERE user_id=?').bind(user.id),
   db.prepare('DELETE FROM library_accounts WHERE user_id=?').bind(user.id),
   db.prepare('DELETE FROM account_data WHERE user_id=?').bind(user.id),
   db.prepare('DELETE FROM public_profiles WHERE user_id=?').bind(user.id),
   db.prepare('DELETE FROM accounts WHERE id=?').bind(user.id)
  ]);
  return json({ok:true,deleted:['account','sessions','journal','library','accountData','publicProfile']},200,cookie('',0));
 }
 if(req.method==='POST'&&action==='report-profile'){
  if(!user)return json({error:'Sign in before reporting a celestial profile.'},401);
  const slug=typeof body.slug==='string'?body.slug:'';
  const reason=body.reason;
  if(!/^[a-f0-9]{64}$/.test(slug)||!['impersonation','harassment','spam','other'].includes(reason))return json({error:'Choose a profile and report reason.'},400);
  const target=await db.prepare('SELECT user_id FROM public_profiles WHERE slug=? AND published=1 AND (share_name=1 OR share_avatar=1)').bind(slug).first<{user_id:string}>();
  if(!target)return json({error:'This celestial profile is unavailable.'},404);
  if(target.user_id===user.id)return json({error:'You cannot report your own profile.'},400);
  const key=await digest(`${user.id}:profile-report:${Math.floor(Date.now()/86400000)}`);
  const rate=await db.prepare('INSERT INTO attempts (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,Date.now()+86400000).first<{count:number}>();
  if((rate?.count||0)>5)return json({error:'Report limit reached. Try again tomorrow.'},429);
  await db.prepare('INSERT INTO profile_reports (id,reporter_id,target_slug,reason,created) VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),user.id,slug,reason,Date.now()).run();
  return json({ok:true},201);
 }
 if(req.method==='POST'&&(action==='login'||action==='register')){
  const email=typeof body.email==='string'?body.email.trim().toLowerCase():'',pass=body.password;
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||typeof pass!=='string'||pass.length<12||pass.length>128)return json({error:'Use a valid email and a password of 12–128 characters.'},400);
  const key=await digest(`${req.headers.get('cf-connecting-ip')||'local'}:${Math.floor(Date.now()/900000)}`);
  const rate=await db.prepare('INSERT INTO attempts (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,Date.now()+900000).first<{count:number}>();
  if((rate?.count||0)>20)return json({error:'Too many attempts. Please try again in 15 minutes.'},429);
  let row=await db.prepare('SELECT * FROM accounts WHERE email=?').bind(email).first<any>();
  const salt=row?.salt||random(),hash=await password(pass,salt);
  if(action==='register'){
   if(row)return json({error:'Unable to create this account. Try signing in with your existing details.'},400);
   row={id:crypto.randomUUID(),email};
   try{await db.prepare('INSERT INTO accounts (id,email,hash,salt,created) VALUES (?,?,?,?,?)').bind(row.id,email,hash,salt,Date.now()).run()}catch{return json({error:'Unable to create this account. Try signing in.'},400)}
  }else if(!row||hash!==row.hash)return json({error:'Email or password is incorrect.'},401);
  const next=random();await db.prepare('INSERT INTO sessions (token,user_id,expires) VALUES (?,?,?)').bind(await digest(next),row.id,Date.now()+2592000000).run();
  await db.batch([db.prepare('DELETE FROM sessions WHERE expires<?').bind(Date.now()),db.prepare('DELETE FROM attempts WHERE expires<?').bind(Date.now())]);
  return json({user:{id:row.id,email}},200,cookie(next));
 }
 if(!user)return json({error:'Sign in to access your Soul Journal.'},401);
 if(action==='data'&&req.method==='GET'){
  const row=await db.prepare('SELECT revision,snapshot,updated FROM account_data WHERE user_id=?').bind(user.id).first<{revision:number,snapshot:string,updated:number}>();
  return json({userId:user.id,revision:row?.revision||0,updated:row?.updated||null,snapshot:row?JSON.parse(row.snapshot):emptyAccountData()});
 }
 if(action==='data'&&req.method==='PUT'){
  if(body.userId!==user.id||!Number.isSafeInteger(body.revision)||body.revision<0||!validAccountData(body.snapshot))return json({error:'Account data is invalid or belongs to another account.'},400);
  for(const [key] of Object.entries(body.snapshot.records) as [string,unknown][]){const category=dataCategory[key];if(!body.snapshot.preferences.sync[category])return json({error:'Enable this data category before syncing it.'},403)}
  const encoded=JSON.stringify(body.snapshot),updated=Date.now();let result;
  if(body.revision===0)result=await db.prepare('INSERT INTO account_data (user_id,revision,snapshot,updated) VALUES (?,1,?,?) ON CONFLICT(user_id) DO NOTHING RETURNING revision').bind(user.id,encoded,updated).first<{revision:number}>();
  else result=await db.prepare('UPDATE account_data SET snapshot=?,revision=revision+1,updated=? WHERE user_id=? AND revision=? RETURNING revision').bind(encoded,updated,user.id,body.revision).first<{revision:number}>();
  if(!result){const latest=await db.prepare('SELECT revision,snapshot,updated FROM account_data WHERE user_id=?').bind(user.id).first<{revision:number,snapshot:string,updated:number}>();return json({error:'Another device changed account data.',revision:latest?.revision||0,snapshot:latest?JSON.parse(latest.snapshot):emptyAccountData()},409)}
  return json({revision:result.revision,updated});
 }
 if(action==='public-profile'&&req.method==='GET'){
  if(!user)return json({error:'Sign in to manage your public profile.'},401);
  const row=await db.prepare('SELECT slug,display_name,avatar_form,share_name,share_avatar,published FROM public_profiles WHERE user_id=?').bind(user.id).first<any>();
  return json({profile:row?{slug:row.slug,displayName:row.display_name,avatarForm:row.avatar_form,shareName:!!row.share_name,shareAvatar:!!row.share_avatar,published:!!row.published,url:row.published?`/profile/${row.slug}`:null}:null});
 }
 if(action==='public-profile'&&req.method==='PUT'){
  if(!user)return json({error:'Sign in to manage your public profile.'},401);
  const displayName=typeof body.displayName==='string'?body.displayName.trim():null;
  const avatarForm=body.avatarForm===null?null:body.avatarForm;
  if(displayName===null||displayName.length>60||!['feminine','masculine','androgynous',null].includes(avatarForm)||typeof body.shareName!=='boolean'||typeof body.shareAvatar!=='boolean'||typeof body.published!=='boolean')return json({error:'Choose a public name, avatar, sharing fields and profile visibility.'},400);
  if(body.published&&(!body.shareName&&!body.shareAvatar||body.shareName&&!displayName||body.shareAvatar&&!avatarForm))return json({error:'Choose at least one complete field before publishing.'},400);
  const existing=await db.prepare('SELECT slug FROM public_profiles WHERE user_id=?').bind(user.id).first<{slug:string}>(),slug=existing?.slug||random(),updated=Date.now();
  await db.prepare('INSERT INTO public_profiles (user_id,slug,display_name,avatar_form,share_name,share_avatar,published,updated) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET display_name=excluded.display_name,avatar_form=excluded.avatar_form,share_name=excluded.share_name,share_avatar=excluded.share_avatar,published=excluded.published,updated=excluded.updated').bind(user.id,slug,displayName,avatarForm,body.shareName?1:0,body.shareAvatar?1:0,body.published?1:0,updated).run();
  return json({profile:{slug,displayName,avatarForm,shareName:body.shareName,shareAvatar:body.shareAvatar,published:body.published,url:body.published?`/profile/${slug}`:null}});
 }
 if(action==='journal'&&req.method==='GET'){const rows=await db.prepare('SELECT id,question,answer,context,created FROM journal WHERE user_id=? ORDER BY created DESC LIMIT 500').bind(user.id).all();return json({entries:rows.results});}
 if(action==='journal'&&req.method==='POST'){
  const {question,answer,context}=body;
  if(typeof question!=='string'||!question.trim()||question.length>1500||typeof answer!=='string'||!answer.trim()||answer.length>10000||typeof context!=='string'||context.length>1000)return json({error:'Add a response (up to 10,000 characters).'},400);
  const id=crypto.randomUUID(),created=Date.now();await db.prepare('INSERT INTO journal (id,user_id,question,answer,context,created) VALUES (?,?,?,?,?,?)').bind(id,user.id,question.trim(),answer.trim(),context,created).run();return json({entry:{id,question,answer,context,created}},201);
 }
 if(action==='journal'&&req.method==='DELETE'){await db.prepare('DELETE FROM journal WHERE id=? AND user_id=?').bind(String(body.id),user.id).run();return json({ok:true});}
 return json({error:'Not found.'},404);
}
async function safe(req:Request){try{return await api(req)}catch{return json({error:'The journal could not be reached. Your text has not been cleared; please try again.'},503)}}
export {safe as GET,safe as POST,safe as PUT,safe as DELETE};
