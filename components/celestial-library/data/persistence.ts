import type { Atmosphere, Bookmark, ProgressEntry, RecentVisit } from './types';
import { getBook } from './library';

export type Highlight = {id:string; bookId:string; chapterId:string; passage:string; start:number; end:number; quote:string; color:string; note:string; updated:number};
export type LedgerNote = {id:string; title:string; text:string; tags:string; bookId?:string; chapterId?:string; passage?:string; updated:number; journalId?:string};
export type LibraryState = {progress:Record<string,ProgressEntry>;bookmarks:Bookmark[];notes:Record<string,{text:string;updated:number}>;recent:RecentVisit[];atmosphere:Atmosphere;readerPrefs:{fontSize:number;lineSpacing:number;theme:'parchment'|'night'|'dawn';motionSafe:boolean};soulHubRoute:string;onboardingSeen:boolean};
export interface LibrarySnapshot {version:2; library:LibraryState; highlights:Highlight[];ledger:LedgerNote[]}
/** Synchronous local cache contract. An account integration must provide a hydrated cache, enqueue writes and surface sync conflicts separately. */
export interface LibraryPersistenceAdapter {load():LibrarySnapshot;save(snapshot:LibrarySnapshot):void}
export const defaults:LibraryState={progress:{},bookmarks:[],notes:{},recent:[],atmosphere:'full',readerPrefs:{fontSize:19,lineSpacing:1.75,theme:'parchment',motionSafe:false},soulHubRoute:'/soul-hub',onboardingSeen:false};
export const COLORS: Record<string,string> = {Gold:'#f5dc83', Lavender:'#dbbaf3', Rose:'#f4b9c4', Emerald:'#a8dfbf', Sapphire:'#acd0f5', Amber:'#f3c58c'};
const KEY='inner-orbit-celestial-v2';
/** Legacy vN:lN is resolved once against the exact supplied edition, never against page numbers. */
export function migratePassage(bookId:string,chapterId:string,passage:string):string {
 const m=/^v(\d+):l(\d+)$/.exec(passage); if(!m)return passage;
 return getBook(bookId)?.chapters.find(c=>c.id===chapterId)?.verses[+m[1]]?.lines[+m[2]]?.id ?? passage;
}
function read(key:string):unknown {const raw=localStorage.getItem(key);return raw===null?null:JSON.parse(raw)}
function migrate():LibrarySnapshot {
 const raw=read('inner-orbit-library-v1') as Partial<LibraryState>|null;
 const highlights=(read('inner-orbit-highlights-v1') ?? []) as Highlight[];
 const ledger=(read('inner-orbit-ledger-v1') ?? []) as LedgerNote[];
 if(!Array.isArray(highlights)||!Array.isArray(ledger))throw new Error('Invalid legacy library records; originals retained');
 const library={...defaults,...raw,readerPrefs:{...defaults.readerPrefs,...raw?.readerPrefs}};
 return {version:2,library,highlights:highlights.map(h=>({...h,passage:migratePassage(h.bookId,h.chapterId,h.passage)})),ledger:ledger.map(n=>n.passage&&n.bookId&&n.chapterId?{...n,passage:migratePassage(n.bookId,n.chapterId,n.passage)}:n)};
}
export const localLibraryAdapter:LibraryPersistenceAdapter={
 load(){const value=read(KEY) as LibrarySnapshot|null;if(value!==null){if(value.version!==2||!value.library||!Array.isArray(value.highlights)||!Array.isArray(value.ledger))throw new Error('Invalid library snapshot');return value}return migrate()},
 save(snapshot){localStorage.setItem(KEY,JSON.stringify(snapshot))},
};
let activeAdapter:LibraryPersistenceAdapter=localLibraryAdapter;
export function configureLibraryPersistence(adapter:LibraryPersistenceAdapter){activeAdapter=adapter}
export function getLibraryPersistence(){return activeAdapter}
export const uid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
