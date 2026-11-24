'use strict';
let worldPrefs={sound:false,skip:false,intro:false};
try{const p=JSON.parse(localStorage.getItem('inner-orbit-experience')||'{}');worldPrefs={sound:p.sound===true,skip:p.skip===true,intro:p.intro===true};}catch{}
function saveWorldPrefs(){try{localStorage.setItem('inner-orbit-experience',JSON.stringify(worldPrefs))}catch{}}
function openGateway(mode='new'){document.getElementById('gateway-title').textContent=mode==='return'?'Return Home.':'Come Home.';document.getElementById('gateway-submit').textContent=mode==='return'?'Return Home':'Come Home';document.getElementById('gateway-description').textContent=mode==='return'?'Your universe is waiting. Return to the demonstration galaxy—no real account is connected.':'Your extraordinary begins here. Choose a name for your celestial universe.';document.getElementById('soul-name').value=worldState.name;document.getElementById('skip-future').checked=worldPrefs.skip;updateSoundControl();document.getElementById('gateway-dialog').showModal();}
function updateSoundControl(){const b=document.getElementById('arrival-sound');b.textContent=worldPrefs.sound?'Sound on':'Sound off';b.setAttribute('aria-pressed',String(worldPrefs.sound));}
let celestialAudio;
function playArrivalTone(){if(!worldPrefs.sound)return;try{celestialAudio=celestialAudio||new(window.AudioContext||window.webkitAudioContext)();celestialAudio.resume().catch(()=>{});[261.63,392,523.25].forEach((f,i)=>{const oscillator=celestialAudio.createOscillator(),gain=celestialAudio.createGain(),t=celestialAudio.currentTime+i*.18;oscillator.type='sine';oscillator.frequency.value=f;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.025,t+.15);gain.gain.exponentialRampToValueAtTime(.0001,t+2.8);oscillator.connect(gain);gain.connect(celestialAudio.destination);oscillator.start(t);oscillator.stop(t+3)});}catch{}}
function offerIntro(){if(worldPrefs.intro)return;setTimeout(()=>{if(location.hash==='#home'&&!worldState.arriving&&!worldPrefs.intro){document.getElementById('intro-skip-future').checked=worldPrefs.skip;document.getElementById('intro-dialog').showModal();worldPrefs.intro=true;saveWorldPrefs();}},180);}
document.getElementById('return-home').addEventListener('click',()=>openGateway('return'));
document.querySelector('.gateway-close').addEventListener('click',()=>document.getElementById('gateway-dialog').close());
document.querySelectorAll('.intro-close').forEach(b=>b.addEventListener('click',()=>document.getElementById('intro-dialog').close()));
document.getElementById('arrival-sound').addEventListener('click',()=>{worldPrefs.sound=!worldPrefs.sound;saveWorldPrefs();updateSoundControl();if(worldPrefs.sound)playArrivalTone();});
document.getElementById('gateway-form').addEventListener('submit',e=>{e.preventDefault();worldState.name=(document.getElementById('soul-name').value.trim()||'Alex').replace(/\s+/g,' ');worldPrefs.skip=document.getElementById('skip-future').checked;saveWorldPrefs();document.getElementById('gateway-dialog').close();enterUniverse();});
document.getElementById('clear-data').addEventListener('click',()=>{worldPrefs={sound:false,skip:false,intro:false};try{localStorage.removeItem('inner-orbit-experience')}catch{}});

document.getElementById('intro-skip-future').addEventListener('change',e=>{worldPrefs.skip=e.target.checked;saveWorldPrefs();});
