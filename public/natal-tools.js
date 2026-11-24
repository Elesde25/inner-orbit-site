/* Reusable astronomical comparisons. No interpretation or persistence side effects. */
(function(root){
const core=typeof module==='object'?require('./natal-core.js'):root.NatalCore;
const types=[['Conjunction',0],['Sextile',60],['Square',90],['Trine',120],['Opposition',180]];
function crossAspects(moving,natal,orb=3){if(!Number.isFinite(orb)||orb<0||orb>10)throw Error('Choose an orb from 0° to 10°.');const rows=[];moving.forEach((p,a)=>natal.forEach((q,b)=>{const separation=Math.abs(core.delta(p.longitude,q.longitude));types.forEach(([name,angle])=>{const difference=Math.abs(separation-angle);if(difference<=orb)rows.push({a,b,name,angle,separation,orb:difference})})}));return rows.sort((a,b)=>a.orb-b.orb||a.a-b.a||a.b-b.b)}
function transit(date,time,natal,orb=3){if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time))throw Error('Enter a valid date and UTC time.');const t=new Date(date+'T'+time+':00Z');if(!Number.isFinite(+t)||t.toISOString().slice(0,16)!==date+'T'+time||+date.slice(0,4)<1900||+date.slice(0,4)>2100)throw Error('Choose a valid date between 1900 and 2100.');const planets=core.positions(t);return {utc:t.toISOString(),planets,aspects:crossAspects(planets,natal,orb)}}
const api={crossAspects,transit};if(typeof module==='object')module.exports=api;else root.NatalTools=api;
})(typeof window==='undefined'?globalThis:window);
