'use client';
import { useState,type FormEvent } from 'react';

type Props={busy:boolean;onExport:()=>Promise<void>;onDelete:(password:string)=>Promise<void>};

export default function AccountDeletionPanel({busy,onExport,onDelete}:Props){
 const [password,setPassword]=useState(''),[confirmation,setConfirmation]=useState(''),[exported,setExported]=useState(false),[status,setStatus]=useState('');
 async function exportData(){setStatus('Preparing your account export…');try{await onExport();setExported(true);setStatus('Export downloaded. Review and keep it before continuing.')}catch(error){setStatus((error as Error).message)}}
 async function deleteAccount(event:FormEvent<HTMLFormElement>){event.preventDefault();setStatus('Deleting account data…');try{await onDelete(password);setPassword('');setConfirmation('')}catch(error){setStatus((error as Error).message)}}
 return <details className="library-delete-panel"><summary>Delete account</summary><div className="library-delete-content">
  <p>Deletion removes account login, Soul Journal entries, public celestial profile, and synced Library highlights, notes, bookmarks, reading progress, and reader preferences.</p>
  <p>It does not remove Alchemy journeys saved under a separate browser cookie, guest Library data, or offline recovery copies on other devices. <a href="/alchemy">Open Alchemy and use “Erase my Work”</a> to remove its current-browser save. This flow leaves guest and other-device browser storage untouched.</p>
  <p>Deletion removes active account records immediately. Cloudflare D1 recovery history may retain data for up to 7 days on Workers Free or 30 days on Workers Paid. Worker Logs may retain request telemetry for up to 7 days. This site’s production plan and settings are unverified, so deletion cannot promise immediate erasure from backups or logs.</p>
  <button type="button" disabled={busy} onClick={exportData}>Export account data first</button>
  <form onSubmit={deleteAccount}>
   <label>Password<input type="password" autoComplete="current-password" minLength={12} maxLength={128} required value={password} onChange={event=>setPassword(event.target.value)}/></label>
   <label>Type DELETE to confirm<input type="text" autoComplete="off" required value={confirmation} onChange={event=>setConfirmation(event.target.value)}/></label>
   <button type="submit" disabled={busy||!exported||confirmation!=='DELETE'}>Permanently delete account</button>
  </form>
  {!exported&&<p>Download your export before deletion. The delete button stays locked until export completes.</p>}
  <p role="status" aria-live="polite">{status}</p>
 </div></details>
}
