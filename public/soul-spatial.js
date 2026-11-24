'use strict';
// A bounded, layered camera. No chart/progress/ownership state is modified here.
const soulCamera={x:0,y:0};
let soulSpaceCleanup=()=>{};
const spatialOldCamera=bindWorldCamera;
bindWorldCamera=function(){if(!document.querySelector('.soul-vista'))spatialOldCamera()};
const spatialOldCosmetics=applyHubCosmetics;
applyHubCosmetics=function(){spatialOldCosmetics();if(state.route==='home')bindSoulSpace()};
function bindSoulSpace(){
 const hub=document.querySelector('.soul-vista');if(!hub||hub.dataset.spatialBound)return;soulSpaceCleanup();hub.dataset.spatialBound='true';
 const map=hub.querySelector('.galaxy-map'),space=hub.querySelector('.galaxy-space'),core=hub.querySelector('.soul-core'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
 if(core)hub.append(core);
 const env=document.createElement('div');env.className='soul-depth';env.setAttribute('aria-hidden','true');env.innerHTML='<div class="depth-haze"></div><div class="depth-horizon"></div><div class="depth-foreground"></div>';hub.prepend(env);
 const trail=document.createElementNS('http://www.w3.org/2000/svg','svg');trail.setAttribute('class','soul-light-route');trail.setAttribute('aria-hidden','true');map.prepend(trail);
 const controls=document.createElement('div');controls.className='soul-camera-controls';controls.innerHTML='<span id="soul-camera-help">Drag the sky to look around</span><div role="group" aria-label="Look around your universe"><button data-look="left" aria-label="Look left">←</button><button data-look="center" aria-label="Center the universe">◎</button><button data-look="right" aria-label="Look right">→</button></div><small id="soul-camera-position" aria-live="polite">At your soul seat</small>';hub.append(controls);
 const handle=document.createElement('button');handle.className='soul-look-handle';handle.setAttribute('aria-label','Look around the sky. Drag, or use arrow keys.');handle.setAttribute('aria-describedby','soul-camera-help');handle.innerHTML='✧ <span>Look around</span> <span aria-hidden="true">↔</span>';hub.append(handle);
 const depths=[.85,1.1,.8,1.05,1,.95,1.16,.9];
 const realms=[...hub.querySelectorAll('[data-realm]')];realms.forEach((el,i)=>{el.style.setProperty('--realm-depth',depths[i]??1);el.insertAdjacentHTML('afterbegin','<span class="realm-ground" aria-hidden="true"></span><span class="realm-lantern" aria-hidden="true"></span>')});
 const clamp=(n,m)=>Math.max(-m,Math.min(m,n));
 function paint(){
  const list=worldState.list,mobile=hub.clientWidth<601,limit=mobile?24:80;
  soulCamera.x=clamp(soulCamera.x,limit);soulCamera.y=clamp(soulCamera.y,mobile?22:38);
  hub.style.setProperty('--look-x',list?'0px':soulCamera.x+'px');hub.style.setProperty('--look-y',list?'0px':soulCamera.y+'px');
  const sel=hub.querySelector('.realm.selected');hub.dataset.looking=sel?sel.dataset.realm:'sky';
  document.getElementById('soul-camera-position').textContent=sel?'Approaching '+sel.querySelector('strong').textContent:Math.abs(soulCamera.x)<5?'At your soul seat':soulCamera.x>0?'Looking toward the western sky':'Looking toward the eastern sky';
  const r=map.getBoundingClientRect();trail.setAttribute('viewBox',`0 0 ${r.width} ${r.height}`);
  if(sel&&!list){const box=sel.querySelector('.realm-art').getBoundingClientRect(),x=box.x+box.width/2-r.x,y=box.y+box.height/2-r.y;trail.innerHTML=`<path d="M${r.width*.5} ${r.height+160} Q${r.width*.5} ${y+110} ${x} ${y}"/><circle cx="${x}" cy="${y}" r="${box.width*.66}"/>`;}else trail.innerHTML='';
 }
 let frame=0;function requestPaint(){if(!frame)frame=requestAnimationFrame(()=>{paint();frame=0})}
 function move(x,y){soulCamera.x=x;soulCamera.y=y;requestPaint()}
 function center(){move(0,0)}
 let focusTarget=null;
 if(worldState.selected&&!worldState.list){const selected=hub.querySelector('.realm.selected'),rect=map.getBoundingClientRect(),r=selected.getBoundingClientRect();focusTarget={x:clamp((rect.x+rect.width*.5-r.x-r.width*.5)*.3,65),y:clamp((rect.y+rect.height*.45-r.y-r.height*.5)*.2,30)}}
 paint();if(focusTarget){requestAnimationFrame(()=>requestAnimationFrame(()=>{if(hub.isConnected)move(focusTarget.x,focusTarget.y)}))}realms.forEach(el=>el.addEventListener('transitionend',e=>{if(e.propertyName==='transform')paint()}));
 // Only sky gestures pan the world. Controls/text keep their native interaction.
 let drag=null,suppress=false;
 function down(e){if(e.button!==0||worldState.list||worldState.arriving)return;if(e.target.closest('button,a,input,select')&&!e.target.closest('.soul-look-handle'))return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,cx:soulCamera.x,cy:soulCamera.y,active:false,target:e.currentTarget};}
 function moving(e){if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.active&&Math.hypot(dx,dy)>5){drag.active=true;drag.target.setPointerCapture(e.pointerId);hub.classList.add('is-looking')}if(drag.active)move(drag.cx+dx*.45,drag.cy+dy*.3)}
 function up(e){if(!drag)return;suppress=drag.active;hub.classList.remove('is-looking');if(drag.target.hasPointerCapture(e.pointerId))drag.target.releasePointerCapture(e.pointerId);drag=null;setTimeout(()=>suppress=false,0)}
 [map,handle].forEach(el=>{el.addEventListener('pointerdown',down);el.addEventListener('pointermove',moving);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('lostpointercapture',()=>{drag=null;hub.classList.remove('is-looking')})});
 map.addEventListener('click',e=>{if(suppress){e.preventDefault();e.stopImmediatePropagation()}},true);
 handle.addEventListener('keydown',e=>{const d={ArrowLeft:[22,0],ArrowRight:[-22,0],ArrowUp:[0,14],ArrowDown:[0,-14]};if(d[e.key]){e.preventDefault();move(soulCamera.x+d[e.key][0],soulCamera.y+d[e.key][1])}if(e.key==='Home'){e.preventDefault();center()}});
 controls.querySelectorAll('[data-look]').forEach(b=>b.addEventListener('click',()=>b.dataset.look==='center'?center():move(soulCamera.x+(b.dataset.look==='left'?35:-35),soulCamera.y)));
 ['soul-core','recenter'].forEach(id=>document.getElementById(id)?.addEventListener('click',center));
 hub.querySelector('.enter-realm')?.addEventListener('click',()=>hub.classList.add('departing'));
 // Pause and reduced motion freeze ambient life, but keep direct camera controls usable.
 const sync=()=>{hub.dataset.motion=String(!reduce.matches&&!worldState.still);paint()};sync();document.getElementById('motion-toggle')?.addEventListener('click',sync);
 reduce.addEventListener('change',sync);soulSpaceCleanup=()=>reduce.removeEventListener('change',sync);
}

const refinedCosmetics=applyHubCosmetics;
applyHubCosmetics=function(){refinedCosmetics();if(state.route!=='home')return;document.querySelectorAll('.soul-vista [data-realm]').forEach(b=>{const id=b.dataset.realm,art=b.querySelector('.realm-art');if(!art||id==='journey')return;art.classList.add('refined-realm-object');art.style.backgroundImage=`url('assets/destinations-v22/${id}.webp')`;art.style.backgroundPosition='center';art.style.backgroundSize='contain';art.style.backgroundRepeat='no-repeat';});};
