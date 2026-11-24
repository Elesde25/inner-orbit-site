import type { ChartData } from "../lib/astro";
import {createContext,useContext,useEffect,useId,useRef,useState,type ReactNode} from 'react';
const chartSources = new WeakMap<ChartData,string>();
export const setJournalChartSource=(chart:ChartData,demo:boolean)=>chartSources.set(chart,demo?"Demonstration chart":"Calculated birth chart");
export const journalChartSource=(chart:ChartData)=>chartSources.get(chart)||"Calculated birth chart";
type User={id:string;email:string};
type Entry={id:string;question:string;answer:string;context:string;created:number};
const JournalContext=createContext<{user:User|null;open:()=>void;reload:()=>void}>({user:null,open:()=>{},reload:()=>{}});
async function api(path:string,method='GET',body?:unknown){const r=await fetch('/api/orbit/'+path,{method,credentials:'same-origin',headers:method==='GET'?{}:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const data=await r.json();if(!r.ok)throw new Error(data.error||'Please try again.');return data;}
export function JournalProvider({children}:{children:ReactNode}){
 const [user,setUser]=useState<User|null>(null),[entries,setEntries]=useState<Entry[]>([]),[error,setError]=useState(''),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[register,setRegister]=useState(false),[show,setShow]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLElement|null>(null);
 const reload=()=>{api('journal').then(d=>setEntries(d.entries)).catch(e=>setError(e.message))};
 const open=()=>{trigger.current=document.activeElement as HTMLElement;dialog.current?.showModal();if(user)reload()};
 useEffect(()=>{api('session').then(d=>{setUser(d.user);setReady(true)}).catch(e=>{setError(e.message);setReady(true)});if(new URLSearchParams(location.search).has('journal'))open()},[]);
 const close=()=>{dialog.current?.close();trigger.current?.focus()};
 return <JournalContext.Provider value={{user,open,reload}}>{children}<nav className="orbit-links" aria-label="Inner Orbit navigation"><a href="/#home" target="_top">← Soul Hub</a><button onClick={open}>✧ Soul Journal</button></nav>
 <dialog className="soul-journal" ref={dialog} aria-labelledby="journal-title"><div className="journal-head"><div><small>YOUR PRIVATE REFLECTION SPACE</small><h1 id="journal-title">Soul Journal</h1></div><button aria-label="Close Soul Journal" onClick={close}>✕</button></div>
 <p>Keep the questions that move you, and the answers that make them yours.</p>
 {!ready?<p role="status">Connecting to your journal…</p>:user?<><div className="journal-account"><span>Signed in as {user.email}</span><button disabled={busy} onClick={async()=>{setBusy(true);try{await api('logout','POST',{});setUser(null);setEntries([]);setError('')}catch(e){setError((e as Error).message)}finally{setBusy(false)}}}>Sign out</button></div>
 <p className="journal-note">Saved to your account. Open this journal on another device by signing in with the same email and password.</p>
 <button onClick={reload}>Refresh entries</button><div className="journal-entries">{entries.length?entries.map(e=><article key={e.id}><small>{new Date(e.created).toLocaleString()} · {e.context}</small><h2>{e.question}</h2><p className="journal-answer">{e.answer}</p><button disabled={busy} onClick={async()=>{if(!confirm('Permanently delete this reflection?'))return;setBusy(true);try{await api('journal','DELETE',{id:e.id});reload()}catch(e){setError((e as Error).message)}finally{setBusy(false)}}}>Delete reflection</button></article>):<p>Your journal is waiting for its first reflection. Select a planet or planetary relationship, open its reading, and answer “A Moment of Reflection.”</p>}</div></>:<><div className="journal-tabs"><button aria-pressed={!register} onClick={()=>{setRegister(false);setError('')}}>Sign in</button><button aria-pressed={register} onClick={()=>{setRegister(true);setError('')}}>Create account</button></div>
 <form onSubmit={async e=>{e.preventDefault();setError('');setBusy(true);const data=new FormData(e.currentTarget);try{const d=await api(register?'register':'login','POST',{email:data.get('email'),password:data.get('password')});setUser(d.user);reload();e.currentTarget?.reset()}catch(e){setError((e as Error).message)}finally{setBusy(false)}}}>
 <label htmlFor="journal-email">Email</label><input id="journal-email" name="email" type="email" autoComplete="username" required maxLength={254}/>
 <label htmlFor="journal-password">Password · 12–128 characters</label><div className="journal-password"><input id="journal-password" name="password" type={show?'text':'password'} autoComplete={register?'new-password':'current-password'} minLength={12} maxLength={128} required/><button type="button" aria-pressed={show} onClick={()=>setShow(!show)}>{show?'Hide':'Show'}</button></div>
 <button className="journal-primary" disabled={busy} type="submit">{busy?'Connecting…':register?'Create my journal account':'Sign in to my journal'}</button></form><p className="journal-note">Email verification and forgotten-password recovery are not yet available. Save your password in a password manager. Browsing charts never requires an account.</p></>}
 <p role="status" className="journal-error">{error}</p><button onClick={close}>Return to chart</button></dialog></JournalContext.Provider>
}
const reflectionDrafts = new Map<string,string>();
export function Reflection({question,context}:{question:string;context:string}){
 const {user,open,reload}=useContext(JournalContext),id=useId();
 const draftKey=context+'::'+question;
 const [text,setText]=useState(()=>reflectionDrafts.get(draftKey)||''),[status,setStatus]=useState(''),[busy,setBusy]=useState(false);
 return <form className="reflection-form" onSubmit={async e=>{e.preventDefault();if(!user){open();return}setBusy(true);setStatus('');try{await api('journal','POST',{question,answer:text,context});setStatus('Saved to your Soul Journal.');setText('');reflectionDrafts.delete(draftKey);reload()}catch(e){setStatus((e as Error).message)}finally{setBusy(false)}}}><label htmlFor={id}>{question}</label><textarea id={id} name="reflection" value={text} onChange={e=>{setText(e.target.value);if(reflectionDrafts.size>100)reflectionDrafts.clear();reflectionDrafts.set(draftKey,e.target.value)}} placeholder="Make room for your own words…" rows={4} maxLength={10000} required/><button disabled={busy} type="submit">{busy?'Saving…':user?'Save to Soul Journal':'Sign in to save reflection'}</button><p role="status">{status}</p>{!user&&<small>Your response stays here while you sign in. It is saved to your account only when you choose Save.</small>}</form>
}
