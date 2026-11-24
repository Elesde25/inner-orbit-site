/* The uploaded Observatory runs in an isolated viewport; existing universe state is untouched. */
function installImportedObservatory(){
 window.addEventListener('message',e=>{
  const frame=document.querySelector('.imported-observatory iframe');
  if(e.origin!==location.origin||e.source!==frame?.contentWindow)return;
  if(e.data?.type==='inner-orbit-birth-input'){
   const b=e.data.input;
   if(!b||typeof b!=='object'||typeof b.name!=='string'||b.name.length>40||typeof b.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(b.date)||typeof b.time!=='string'||typeof b.timeKnown!=='boolean'||typeof b.placeId!=='string'||!Number.isFinite(b.lat)||Math.abs(b.lat)>89.9||!Number.isFinite(b.lon)||Math.abs(b.lon)>180||!Number.isFinite(b.tzOffset)||Math.abs(b.tzOffset)>14)return;
   try{localStorage.setItem('inner-orbit:imported-birth:v1',JSON.stringify(b))}catch{}
   return;
  }
  if(e.data?.type!=='inner-orbit-chart')return;
  const c=e.data.chart;if(!c||!Array.isArray(c.planets)||c.planets.length!==10||!Number.isFinite(c.utcMs))return;
  let birth={};try{birth=JSON.parse(localStorage.getItem('inner-orbit:imported-birth:v1')||localStorage.getItem('inner-orbit-natal-input')||'{}')}catch{}
  natalChart={input:{date:birth.date||c.dateLabel,time:birth.time||c.timeLabel,cityLabel:c.placeLabel,lat:c.latitude,lon:c.longitude,zone:birth.tz||birth.zone||'UTC',unknown:!c.timeKnown},utc:new Date(c.utcMs).toISOString(),planets:c.planets.map(p=>({name:p.name,longitude:p.lon,retrograde:p.retro})),asc:c.timeKnown?c.ascLon:null,mc:c.timeKnown?c.mcLon:null,cusps:c.timeKnown?c.cusps:[],unknown:!c.timeKnown,precision:c.ephemeris.name};
  if(natalChart.planets.every(p=>Number.isFinite(p.longitude)))natalUpdateThemes();
 });
 views['alchemy-classic']=views.alchemy;
 views.alchemy=()=>`<section class="imported-alchemy"><iframe title="Inner Alchemy — Your Great Work" src="/alchemy" loading="eager"></iframe></section>`;
 const alStyle=document.createElement('style');alStyle.textContent='.imported-alchemy{height:calc(100dvh - 100px);min-height:500px}.imported-alchemy iframe{display:block;width:100%;height:100%;border:0}body:has(.imported-alchemy){overflow:hidden}body:has(.imported-alchemy) #main{padding:0;max-width:none}body:has(.imported-alchemy) footer{display:none}@media(max-width:767px){.imported-alchemy{height:calc(100dvh - 80px);min-height:0}}';document.head.append(alStyle);
 const legacy=views.observatory;
 views['observatory-classic']=legacy;
 const frame=(journal=false)=>`<section class="imported-observatory"><iframe title="${journal?'Soul Journal — account reflections':'Interactive Observatory — your natal sky'}" src="/observatory/${journal?'?journal=1':state.route==='expert'?'?mode=deep':''}" allow="fullscreen" loading="eager"></iframe></section>`;
 views.observatory=()=>frame(); views.expert=()=>frame(); views['soul-journal']=()=>frame(true);
 queueMicrotask(()=>{const a=document.createElement('a');a.href='#soul-journal';a.textContent='✧ Soul Journal · Your saved reflections';document.querySelector('.menu-grid')?.append(a)});
 const menu=document.querySelector('.menu-grid');
 // Menu is populated later by app.js. Retain a visible account journal link in the header.
 const nav=document.querySelector('.primary');if(nav){const a=document.createElement('a');a.href='#soul-journal';a.textContent='Soul Journal';nav.append(a)}
 const style=document.createElement('style');style.textContent='.imported-observatory{height:calc(100dvh - 100px);min-height:540px;width:100%;position:relative}.imported-observatory iframe{height:100%;width:100%;border:0;display:block}body:has(.imported-observatory) #main{padding:0;max-width:none}body:has(.imported-observatory) footer{display:none}@media(max-width:767px){.imported-observatory{height:calc(100dvh - 78px);min-height:0}}';document.head.append(style);
}
