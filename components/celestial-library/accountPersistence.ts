import { defaults, type LibrarySnapshot } from './data/persistence';
export const emptySnapshot=():LibrarySnapshot=>({version:2,library:structuredClone(defaults),highlights:[],ledger:[]});
const equal=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
/** Three-way, record-granular reconciliation. Absence is a deletion, not an invitation to resurrect it. */
export function mergeSnapshots(base:LibrarySnapshot,local:LibrarySnapshot,remote:LibrarySnapshot):LibrarySnapshot {
 const merge=(b:any,l:any,r:any,path:string):any=>{
  if(equal(l,b))return r;if(equal(r,b)||equal(l,r))return l;
  const keyed=['highlights','ledger','bookmarks','recent'].includes(path.split('.').pop()!);
  if(keyed&&Array.isArray(b)&&Array.isArray(l)&&Array.isArray(r)){
   const key=(v:any)=>v.id||v.bookId;const map=(a:any[])=>Object.fromEntries(a.map(v=>[key(v),v]));return Object.values(merge(map(b),map(l),map(r),path+'.records'));
  }
  if(b&&l&&r&&!Array.isArray(b)&&typeof b==='object'&&typeof l==='object'&&typeof r==='object'){
   const out:any={};for(const k of new Set([...Object.keys(b),...Object.keys(l),...Object.keys(r)])){const v=merge(b[k],l[k],r[k],path+'.'+k);if(v!==undefined)out[k]=v}return out;
  }
  throw Error('Conflicting edits to '+path+'. Export your local copy before loading the account version.');
 };return merge(base,local,remote,'snapshot');
}
export async function libraryRequest(method='GET',body?:unknown){const res=await fetch('/api/library',{method,credentials:'same-origin',headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const data:any=await res.json();return {res,data};}
