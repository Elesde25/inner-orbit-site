// Exercise the actual API handler with SQLite through a D1-compatible adapter.
import {DatabaseSync} from 'node:sqlite';
import {build} from 'esbuild';
import fs from 'node:fs';
const sqlite=new DatabaseSync(':memory:');sqlite.exec(fs.readFileSync('drizzle/0000_steep_avengers.sql','utf8'));
class Statement {constructor(sql,values=[]){this.sql=sql;this.values=values}bind(...v){return new Statement(this.sql,v)}async first(){return sqlite.prepare(this.sql).get(...this.values)||null}async all(){return {results:sqlite.prepare(this.sql).all(...this.values)}}async run(){return sqlite.prepare(this.sql).run(...this.values)}}
globalThis.__testDb={prepare:s=>new Statement(s),batch:async statements=>Promise.all(statements.map(s=>s.run()))};
await build({entryPoints:['app/api/orbit/[...path]/route.ts'],bundle:true,platform:'node',format:'esm',outfile:'/tmp/orbit-api-test.mjs',plugins:[{name:'test-d1',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'test',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const env={DB:globalThis.__testDb};'}))}}]});
const handler=await import('/tmp/orbit-api-test.mjs');
const originalFetch=globalThis.fetch;
globalThis.fetch=async(url,options={})=>{const req=new Request(url,options);return handler[req.method](req)};
let text=fs.readFileSync('tests/journal-scenarios.mjs','utf8');
text=text.replace("import assert from 'node:assert/strict';", "const {default:assert}=await import('node:assert/strict');").replace("import {randomBytes} from 'node:crypto';","const {randomBytes}=await import('node:crypto');");
await new Function('return (async()=>{'+text+'})()')();
globalThis.fetch=originalFetch;
