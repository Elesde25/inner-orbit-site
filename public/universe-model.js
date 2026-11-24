'use strict';
/* Pure calculations: no ephemeris, network, storage or interpretation side effects. */
const OrbitMath = (() => {
 const sum=n=>String(n).replace(/\D/g,'').split('').reduce((a,b)=>a+Number(b),0);
 function reduce(n,masters=true){const trail=[n];while(n>9&&!(masters&&[11,22,33].includes(n))){n=sum(n);trail.push(n)}return {value:n,trail};}
 function validDate(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return false;const d=new Date(s+'T12:00:00Z');return !isNaN(d)&&d.toISOString().slice(0,10)===s;}
 function nameNumbers(name){const letters=name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z]/g,'');if(!letters)return null;const values=[...letters].map(c=>({letter:c,value:(c.charCodeAt(0)-65)%9+1,vowel:'AEIOU'.includes(c)}));const make=rows=>rows.length?{...reduce(rows.reduce((s,l)=>s+l.value,0)),working:rows.map(l=>`${l.letter}=${l.value}`).join(' + ')}:null;return {expression:make(values),soul:make(values.filter(l=>l.vowel)),personality:make(values.filter(l=>!l.vowel)),letters};}
 function cycles(birth,date){if(!validDate(birth)||!validDate(date))return null;const [y,m,d]=date.split('-').map(Number),[,bm,bd]=birth.split('-').map(Number);const year=reduce(sum(bm)+sum(bd)+sum(y),false),month=reduce(year.value+m,false),day=reduce(month.value+d,false);return {year,month,day,working:`${sum(bm)} (digits of birth month ${bm}) + ${sum(bd)} (digits of birth day ${bd}) + ${sum(y)} (digits of ${y}) = ${sum(bm)+sum(bd)+sum(y)}`};}
 function numerology(birth,name,date){const life=validDate(birth)?{...reduce(sum(birth)),working:birth.replace(/-/g,'').split('').join(' + ')}:null;return {life,names:nameNumbers(name||''),cycles:cycles(birth,date)};}
 const normalize=n=>(n%360+360)%360;
 const distance=(a,b)=>{const d=Math.abs(normalize(a)-normalize(b));return Math.min(d,360-d)};
 const aspectTypes=[{name:'Conjunction',angle:0,glyph:'☌',tone:'merge'},{name:'Sextile',angle:60,glyph:'⚹',tone:'opportunity'},{name:'Square',angle:90,glyph:'□',tone:'tension'},{name:'Trine',angle:120,glyph:'△',tone:'flow'},{name:'Opposition',angle:180,glyph:'☍',tone:'balance'}];
 function aspects(planets,orb=6,filter='all'){let result=[];for(let i=0;i<planets.length;i++)for(let j=i+1;j<planets.length;j++){let separation=distance(planets[i].longitude,planets[j].longitude);for(const type of aspectTypes){let delta=Math.abs(separation-type.angle);if(delta<=orb&&(filter==='all'||filter===type.name))result.push({a:i,b:j,...type,orb:delta,separation});}}return result.sort((a,b)=>a.orb-b.orb||a.a-b.a);}
 function house(longitude,cusps){for(let i=0;i<12;i++)if(normalize(longitude-cusps[i])<normalize(cusps[(i+1)%12]-cusps[i]))return i+1;return null;}
 return {sum,reduce,validDate,nameNumbers,cycles,numerology,normalize,distance,aspectTypes,aspects,house};
})();
if(typeof module!=='undefined')module.exports=OrbitMath;
