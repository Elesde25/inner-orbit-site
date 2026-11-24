import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
const origin='https://inner-orbit.test';
let cookie='';
async function call(path,method='GET',body,overrideCookie){const r=await fetch(origin+'/api/orbit/'+path,{method,headers:{Origin:origin,...(method!=='GET'?{'Content-Type':'application/json'}:{}),Cookie:overrideCookie??cookie},...(body?{body:JSON.stringify(body)}:{})});const c=r.headers.get('set-cookie');if(c)cookie=c.split(';')[0];return {status:r.status,data:await r.json(),headers:r.headers};}
assert.equal((await call('journal')).status,401);
const credentials={email:`qa-${Date.now()}@example.invalid`,password:randomBytes(24).toString('hex')};
const registered=await call('register','POST',credentials);assert.equal(registered.status,200,JSON.stringify(registered.data));assert.ok(registered.headers.get('set-cookie').includes('HttpOnly'));assert.ok(registered.headers.get('set-cookie').includes('Secure'));const firstCookie=cookie;
const saved=await call('journal','POST',{question:'What helps you reconnect with yourself?',answer:'A quiet walk and writing one honest paragraph.',context:'Integration test · Sun'});assert.equal(saved.status,201,JSON.stringify(saved.data));const id=saved.data.entry.id;
assert.equal((await call('journal')).data.entries[0].answer,'A quiet walk and writing one honest paragraph.');
assert.equal((await call('logout','POST',{})).status,200);assert.equal((await call('journal','GET',undefined,firstCookie)).status,401);
assert.equal((await call('login','POST',credentials)).status,200);assert.equal((await call('journal')).data.entries[0].id,id);const accountCookie=cookie;
const other={email:`qa-other-${Date.now()}@example.invalid`,password:randomBytes(24).toString('hex')};assert.equal((await call('register','POST',other)).status,200);assert.equal((await call('journal')).data.entries.length,0);
await call('journal','DELETE',{id});assert.equal((await call('journal','GET',undefined,accountCookie)).data.entries[0].id,id);
assert.equal((await fetch(origin+'/api/orbit/journal',{method:'POST',headers:{Origin:'https://wrong.invalid','Content-Type':'application/json',Cookie:accountCookie},body:'{}'})).status,403);
assert.equal((await call('journal','POST',{question:'Q',answer:' ',context:'test'})).status,400);
console.log('PASS: registration, secure session, save/list, logout revocation, re-login persistence, account isolation, owner-only deletion, cross-origin rejection, validation.');
