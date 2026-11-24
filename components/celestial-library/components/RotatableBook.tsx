import { useCallback, useRef, useState } from 'react';
import ThreeBook from './ThreeBook';
import type { Book } from '../data/types';
import { coverFrontImage } from '../data/coverArt';

/** Lightweight CSS 3-D book: independently lit front, back, spine, and page-block planes. */
export default function RotatableBook({book, opening, compact=false, motion=true}:{book:Book; opening:boolean; compact?:boolean; motion?:boolean}) {
 const [fallback,setFallback]=useState(false);
 const onFailure=useCallback(()=>setFallback(true),[]);
 const [rotation,setRotation]=useState({x:-7,y:-20});
 const origin=useRef<{x:number;y:number;rx:number;ry:number}|null>(null);
 const adjust=(dx:number,dy=0)=>setRotation(p=>({x:Math.max(-35,Math.min(35,p.x+dy)),y:p.y+dx}));
 return <div className="book-inspection">
  <div className={`model-scene ${compact ? 'compact' : 'immersive'} ${opening?'is-opening':''}`} onPointerDown={e=>{if(opening)return; origin.current={x:e.clientX,y:e.clientY,rx:rotation.x,ry:rotation.y};e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={e=>{const a=origin.current;if(!a||opening)return;setRotation({x:Math.max(-35,Math.min(35,a.rx+(e.clientY-a.y)*.35)),y:a.ry+(e.clientX-a.x)*.55})}} onPointerUp={e=>{origin.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)}} onPointerCancel={()=>{origin.current=null}} role="group" aria-label="Rotatable three-dimensional book. Drag to rotate, or use the rotation buttons.">
   {!fallback ? <ThreeBook book={book} opening={opening} rotation={rotation} compact={compact} onFailure={onFailure} motion={motion}/> : <div className="model-book" style={{transform:`rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`, '--model-base':book.cover.base.split(',')[0], '--model-metal':book.cover.accent} as React.CSSProperties}>
     <div className="model-back" style={{backgroundImage:`linear-gradient(#08050b44,#08050b77),url('${coverFrontImage(book.title)}')`}}/>
     <div className="model-pages"/><div className="model-side model-right"/><div className="model-side model-top"/><div className="model-side model-bottom"/><div className="model-side model-spine"/>
     <div className="model-first-page"><div className="model-page-title">{book.title}<div className="model-rule"/><small>✦ &nbsp; The Living Tome &nbsp; ✦</small></div></div>
     <div className="model-board"><div className="model-board-front"><img src={coverFrontImage(book.title)} alt="" draggable={false}/><div className="model-plaque">{book.title}</div></div><div className="model-board-inner"/></div>
   </div>}
  </div>
  {!opening && <div className="model-controls"><span>Drag to turn the book</span><div><button onClick={()=>adjust(-25)} aria-label="Rotate book left">↶</button><button onClick={()=>setRotation({x:-7,y:-20})} aria-label="Reset book rotation">Reset</button><button onClick={()=>adjust(25)} aria-label="Rotate book right">↷</button></div></div>}
 </div>;
}
