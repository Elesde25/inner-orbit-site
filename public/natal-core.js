/* Astronomy Engine 2.1.19; tropical, geocentric, true ecliptic of date. */
(function(root){
const A=typeof module==='object'?require('./vendor/astronomy.js'):root.Astronomy;
const norm=x=>(x%360+360)%360,delta=(a,b)=>((a-b+540)%360)-180,rad=Math.PI/180;
function utc(date,time,zone,occurrence='reject'){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time)||new Date(date+'T00:00Z').toISOString().slice(0,10)!==date)throw Error('Enter a valid date and time.');
 const target=Date.parse(date+'T'+time+':00Z');if(!Number.isFinite(target)||+time.slice(0,2)>23||+time.slice(3)>59)throw Error('Enter a valid time.');
 const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 const wall=t=>{const p=Object.fromEntries(fmt.formatToParts(new Date(t)).map(p=>[p.type,p.value]));return Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second)};
 const offsets=new Set();for(let h=-36;h<=36;h+=6){const t=target+h*3600000;offsets.add(wall(t)-t)}
 const choices=[...offsets].map(o=>target-o).filter(t=>wall(t)===target).sort((a,b)=>a-b);
 if(!choices.length)throw Error('This local time did not exist during a clock change. Check your recorded time and timezone.');
 if(choices.length>1&&occurrence==='reject')throw Error('This time occurred twice during a clock change. Choose the earlier or later occurrence.');
 return new Date(choices[occurrence==='later'?choices.length-1:0]);
}
function positions(t){return ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'].map(name=>{const position=d=>A.Ecliptic(A.GeoVector(name,d,true));const p=position(t),before=position(new Date(+t-3600000)),after=position(new Date(+t+3600000));return {name,longitude:p.elon,latitude:p.elat,speed:delta(after.elon,before.elon)*12,retrograde:delta(after.elon,before.elon)<0}})}
function calculate(input){const year=+input.date.slice(0,4);if(year<1900||year>2100)throw Error('Supported birth dates are 1900–2100.');const t=utc(input.date,input.unknown?'12:00':input.time,input.zone,input.occurrence),lat=Number(input.lat),lon=Number(input.lon);if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180||input.lat===''||input.lon==='')throw Error('Supply valid latitude (−90 to 90) and longitude (−180 to 180).');
 let asc=null,mc=null,cusps=[];if(!input.unknown&&Math.abs(lat)<66){const theta=norm(A.SiderealTime(t)*15+lon)*rad,eps=Math.asin(Math.abs(A.Rotation_EQD_ECT(t).rot[1][2]));asc=norm(Math.atan2(-Math.cos(theta),Math.sin(theta)*Math.cos(eps)+Math.tan(lat*rad)*Math.sin(eps))/rad+180);mc=norm(Math.atan2(Math.sin(theta),Math.cos(theta)*Math.cos(eps))/rad);const start=input.houses==='equal'?asc:Math.floor(asc/30)*30;cusps=Array.from({length:12},(_,i)=>norm(start+i*30));}
 return {input:{...input},utc:t.toISOString(),planets:positions(t),asc,mc,cusps,precision:'Astronomy Engine 2.1.19 · designed for approximately ±1 arcminute; displayed minutes are rounded, not infinite precision.',unknown:!!input.unknown};}
const api={utc,positions,calculate,norm,delta};if(typeof module==='object')module.exports=api;else root.NatalCore=api;
})(typeof window==='undefined'?globalThis:window);
