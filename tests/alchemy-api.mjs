import {DatabaseSync} from 'node:sqlite';
import {build} from 'esbuild';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const sqlite=new DatabaseSync(':memory:');sqlite.exec(fs.readFileSync('drizzle/0001_young_siren.sql','utf8'));
class Statement {constructor(sql,values=[]){this.sql=sql;this.values=values}bind(...v){return new Statement(this.sql,v)}async first(){return sqlite.prepare(this.sql).get(...this.values)||null}async run(){const r=sqlite.prepare(this.sql).run(...this.values);return {meta:{changes:Number(r.changes)}}}}
globalThis.__alchemyDb={prepare:s=>new Statement(s)};
await build({entryPoints:['app/api/journey/route.ts'],bundle:true,platform:'node',format:'esm',outfile:'/tmp/alchemy-api-test.mjs',plugins:[{name:'test-d1',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'test',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const env={DB:globalThis.__alchemyDb};'}))}}]});
const handler=await import('/tmp/alchemy-api-test.mjs'),origin='https://inner-orbit.test';
async function call(method,path='',body,cookie=''){const r=await handler[method](new Request(origin+'/api/journey'+path,{method,headers:{Origin:origin,'Content-Type':'application/json',Cookie:cookie},...(body?{body:JSON.stringify(body)}:{})}));return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]||''}}
const first=await call('GET');assert.equal(first.status,200);assert.equal(first.data.journey,null);assert.ok(first.cookie.startsWith('io_alchemy='));const cookie=first.cookie;
const journey={v:1,id:crypto.randomUUID(),step:1,maxStep:1,intake:{name:'QA'},rites:{burn:'A thought to reconsider'},practiceLog:[],updatedAt:Date.now()};
assert.equal((await call('PUT','',{journey},cookie)).status,200);
assert.equal((await call('GET','?id='+journey.id,undefined,cookie)).data.journey.rites.burn,journey.rites.burn);
assert.equal((await call('GET','',undefined,cookie)).data.journey.id,journey.id);
const outsider=(await call('GET')).cookie;
assert.equal((await call('GET','?id='+journey.id,undefined,outsider)).data.journey,null);
assert.equal((await call('PUT','',{journey},outsider)).status,409);
await call('DELETE','?id='+journey.id,undefined,outsider);assert.ok((await call('GET','',undefined,cookie)).data.journey);
assert.equal((await call('PUT','',{journey:{...journey,updatedAt:journey.updatedAt-1}},cookie)).status,409);
assert.equal((await call('PUT','',{journey:{...journey,step:9}},cookie)).status,400);
const cross=await handler.PUT(new Request(origin+'/api/journey',{method:'PUT',headers:{Origin:'https://another.invalid','Content-Type':'application/json'},body:'{}'}));assert.equal(cross.status,403);
await call('DELETE','?id='+journey.id,undefined,cookie);assert.equal((await call('GET','',undefined,cookie)).data.journey,null);
console.log('PASS: Alchemy save, restore, cookie ownership, isolation, stale-save rejection, validation, CSRF and erase.');
