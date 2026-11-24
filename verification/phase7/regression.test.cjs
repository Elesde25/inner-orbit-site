const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const realm=fs.readFileSync('dist/realm-travel.js','utf8');
for(const reduced of [false,true]){
 const context={worldState:{still:reduced},Element:{prototype:{}},matchMedia:()=>({matches:false}),location:{hash:''},offerIntro(){},document:{addEventListener(){}},window:{addEventListener(){}}};
 vm.createContext(context);vm.runInContext(realm,context);vm.runInContext("approachRealm('observatory')",context);assert.equal(context.location.hash,'realm-observatory');
}
const c={themeLibrary:{},natalDegrees:true,Intl,Date,console,matchMedia:()=>({matches:false}),localStorage:{getItem(){return null},setItem(){}},forgeAvatar:()=>'',vistaSeat:()=>'',applyHubCosmetics(){}};c.window=c;vm.createContext(c);
for(const p of ['vendor/astronomy.js','natal-core.js','universe-model.js','natal.js','threshold.js'])vm.runInContext(fs.readFileSync('dist/'+p,'utf8'),c);
vm.runInContext(`natalChart=NatalCore.calculate({date:'1990-06-15',time:'12:00',zone:'America/New_York',lat:38.89511,lon:-77.03637,houses:'whole',unknown:false,occurrence:'reject'});var natalVisible=new Set([0,1,2,3,4,5,6,7,8,9]);var natalAspectSelected=null;function escapeHTML(s){return String(s)};function natalAspects(){return OrbitMath.aspects(natalChart.planets,6,'all')}`,c);
for(const mode of ['discover','depth']){const preview=vm.runInContext(`natalWheel('${mode}',true)`,c);assert.doesNotMatch(preview,/tabindex|role="button"|data-natal-(planet|house|aspect)=/);const wheel=vm.runInContext(`natalWheel('${mode}')`,c);assert.match(wheel,/data-natal-planet/);assert.match(wheel,/data-natal-house/)}
let gain=null,paused=false;c.worldPrefs={};c.saveWorldPrefs=()=>{};vm.runInContext('experienceAudio.fade=v=>testGain(v);experienceAudio.audio={pause:()=>testPause()};experienceAudio.ui=()=>{}',Object.assign(c,{testGain:v=>gain=v,testPause:()=>paused=true}));vm.runInContext('experienceAudio.mute()',c);assert.equal(gain,0);assert.equal(paused,true);
console.log('PASS: missing-animation and reduced-motion direct arrival; noninteractive accurate previews; full wheel controls retained; mute silences shared gain and media.');
