import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { Book } from '../data/types';
import { coverFrontImage } from '../data/coverArt';
import { artifactDesign } from '../data/artifactDesign';
import { relief, roundedGeometry, dressSpine } from './ArtifactRelief';

function plaque(title:string):{color:THREE.CanvasTexture;bump:THREE.CanvasTexture} {
 const c=document.createElement('canvas'),bc=document.createElement('canvas');c.width=bc.width=1024;c.height=bc.height=230;const ctx=c.getContext('2d')!,bx=bc.getContext('2d')!;
 const g=ctx.createLinearGradient(0,0,0,230);g.addColorStop(0,'#ddba79');g.addColorStop(.12,'#9b723d');g.addColorStop(.27,'#775327');g.addColorStop(.65,'#816033');g.addColorStop(.9,'#bd9857');g.addColorStop(1,'#4b321b');ctx.fillStyle=g;ctx.fillRect(0,0,1024,230);ctx.strokeStyle='#e8cb8a';ctx.lineWidth=4;ctx.strokeRect(13,13,998,204);
 bx.fillStyle='#aaaaaa';bx.fillRect(0,0,1024,230);
 ctx.textAlign=bx.textAlign='center';ctx.textBaseline=bx.textBaseline='middle';let fs=title.length>48?48:title.length>25?55:70;ctx.font=bx.font=`600 ${fs}px Georgia`;
 const words=title.split(' '),lines:string[]=[];let line='';for(const word of words){const next=(line+' '+word).trim();if(ctx.measureText(next).width>850&&line){lines.push(line);line=word}else line=next}if(line)lines.push(line);
 lines.slice(0,3).forEach((l,i)=>{const y=115+(i-(Math.min(lines.length,3)-1)/2)*(fs+5);ctx.fillStyle='#ebce91';ctx.fillText(l,512,y+2);ctx.fillStyle='#3b260f';ctx.fillText(l,512,y);bx.fillStyle='#303030';bx.fillText(l,512,y)});
 const color=new THREE.CanvasTexture(c);color.colorSpace=THREE.SRGBColorSpace;return {color,bump:new THREE.CanvasTexture(bc)};
}
function pageTexture(title:string):THREE.CanvasTexture {const c=document.createElement('canvas');c.width=768;c.height=1024;const x=c.getContext('2d')!;x.fillStyle='#f4e7ca';x.fillRect(0,0,c.width,c.height);x.strokeStyle='#b99b64';x.lineWidth=4;x.strokeRect(45,45,678,934);x.textAlign='center';x.fillStyle='#6b4a26';x.font='italic 30px Georgia';x.fillText('THE LIVING TOME',384,340);x.font='bold 42px Georgia';const words=title.split(' ');let l='', lines:string[]=[];for(const w of words){let n=(l+' '+w).trim();if(x.measureText(n).width>620&&l){lines.push(l);l=w}else l=n}lines.push(l);lines.forEach((z,i)=>x.fillText(z,384,430+i*60));x.fillRect(260,560,248,2);x.font='italic 26px Georgia';x.fillText('A reading awaits',384,620);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function edgeTexture():THREE.CanvasTexture {const c=document.createElement('canvas');c.width=128;c.height=512;const ctx=c.getContext('2d')!;ctx.fillStyle='#dfc9a1';ctx.fillRect(0,0,128,512);for(let y=0;y<512;y+=4){ctx.fillStyle=y%12===0?'#ad8f66':'#c9b28a';ctx.fillRect(0,y,128,1)}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}

function leatherGrain():THREE.CanvasTexture {
 const c=document.createElement('canvas');c.width=256;c.height=256;const x=c.getContext('2d')!;const img=x.createImageData(256,256);let seed=9247;
 for(let i=0;i<256*256;i++){seed=(seed*1664525+1013904223)>>>0;const noise=(seed>>>25),v=110+noise;img.data[i*4]=img.data[i*4+1]=img.data[i*4+2]=v;img.data[i*4+3]=255}x.putImageData(img,0,0);
 const tex=new THREE.CanvasTexture(c);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(2,3);return tex;
}

export default function ThreeBook({book,opening,rotation,onFailure,compact=false,motion=true}:{book:Book;opening:boolean;rotation:{x:number;y:number};onFailure:()=>void;compact?:boolean;motion?:boolean}) {
 const root=useRef<HTMLDivElement>(null);const rot=useRef(rotation);const openingRef=useRef(opening);rot.current=rotation;openingRef.current=opening;
 useEffect(()=>{const el=root.current;if(!el)return;let renderer:THREE.WebGLRenderer;
 try {renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch{onFailure();return;}
 let disposed=false;const contextLost=(e:Event)=>{e.preventDefault();if(!disposed)onFailure()};renderer.domElement.addEventListener('webglcontextlost',contextLost);
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0x000000,0);el.appendChild(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,100);camera.position.set(0,0,7.9);
 scene.add(new THREE.AmbientLight(0xffffff,1.2));const light=new THREE.DirectionalLight(0xffe4ad,2.5);light.position.set(-3,5,7);scene.add(light);const cool=new THREE.DirectionalLight(0x829ce9,.8);cool.position.set(4,0,3);scene.add(cool);
 const group=new THREE.Group();scene.add(group);const W=1.85,H=2.68,D=.40;const design=artifactDesign(book.id);
 const texture=new THREE.TextureLoader().load(coverFrontImage(book.title),t=>{if(disposed)t.dispose()});texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),4);
 const edge=edgeTexture(),page=pageTexture(book.title),name=plaque(book.title),grain=leatherGrain();
 const wrapColors:Record<string,string>={'The Dhammapada':'#4b1918','Tao Te Ching':'#152a1c','Bhagavad Gita':'#4a121f','The Millennial Tao':'#122f39','The Luminous Mind — A Field Guide to Consciousness':'#30213c','Gnostic Wisdom & Early Mystical Traditions':'#30213c'};
 const leather=new THREE.MeshStandardMaterial({color:new THREE.Color(wrapColors[book.title] || book.cover.base.split(',')[0]),roughness:.75,metalness:.2,bumpMap:grain,bumpScale:.008});
 const paper=new THREE.MeshStandardMaterial({map:edge,roughness:.95});
 const boardMat=new THREE.MeshStandardMaterial({map:texture,bumpMap:texture,bumpScale:.018,roughness:.55,metalness:.16});
 const add=(g:THREE.BufferGeometry,m:THREE.Material|THREE.Material[],parent=group)=>{let o=new THREE.Mesh(g,m);parent.add(o);return o};
 const back=add(roundedGeometry(W+.06,H+.06,.075),leather);back.position.z=-D/2;
 const backArt=add(new THREE.PlaneGeometry(W,H),boardMat);backArt.position.z=-D/2-.052;backArt.rotation.y=Math.PI;
 const block=add(roundedGeometry(W-.05,H-.10,D-.07,.045),paper);block.position.x=.025;
 const trim=new THREE.MeshStandardMaterial({color:design.metal,roughness:.28,metalness:.82});
 const spineGem=new THREE.MeshPhysicalMaterial({color:design.stone,roughness:.19,metalness:.15,clearcoat:1});
 dressSpine(group,design,H+.02,D*.56,-W/2,leather,trim,spineGem);
 const pg=add(new THREE.PlaneGeometry(W-.09,H-.12),new THREE.MeshStandardMaterial({map:page,roughness:1}));pg.position.set(.025,0,D/2-.025);
 const hinge=new THREE.Group();hinge.position.set(-W/2,0,D/2);group.add(hinge);
 const front=add(roundedGeometry(W+.06,H+.06,.075),leather,hinge);front.position.x=W/2;
 const frontArt=add(new THREE.PlaneGeometry(W,H),boardMat,hinge);frontArt.position.set(W/2,0,.052);
 const adorn=relief(design,W,H,book.title);adorn.root.position.set(W/2,0,.055);hinge.add(adorn.root);
 const jewelLight=new THREE.PointLight(design.stone,.5,1.6);jewelLight.position.set(W/2,.05,.45);hinge.add(jewelLight);
 const plateBase=add(roundedGeometry(W*.73,.25,.045,.04),adorn.darkMetal,hinge);plateBase.position.set(W/2,-H*.405,.112);
 const plate=add(new THREE.PlaneGeometry(W*.70,.205),new THREE.MeshStandardMaterial({map:name.color,bumpMap:name.bump,bumpScale:.012,metalness:.65,roughness:.43}),hinge);plate.position.set(W/2,-H*.405,.149);
 for(const sx of [-1,1]){const pin=add(new THREE.SphereGeometry(.017,12,8),adorn.metal,hinge);pin.position.set(W/2+sx*W*.34,-H*.405,.153);pin.scale.z=.4;}
 // Back board receives real engraved surrounds rather than a bare cuboid.
 const backRelief=relief({...design,clasp:false},W,H,book.title);backRelief.root.position.set(0,0,-D/2-.055);backRelief.root.rotation.y=Math.PI;group.add(backRelief.root);

 const inside=add(new THREE.PlaneGeometry(W-.08,H-.08),new THREE.MeshStandardMaterial({color:0xd5bb8d,roughness:.96,side:THREE.DoubleSide}),hinge);inside.position.set(W/2,0,-.052);inside.rotation.y=Math.PI;
 // Handful of dim, slow stardust motes, never a bright graphic over the text.
 let stars:THREE.Points|undefined, aura:THREE.Sprite|undefined, auraTexture:THREE.CanvasTexture|undefined;
 if(motion){
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const ctx=canvas.getContext('2d')!;
  const glow=ctx.createRadialGradient(64,64,1,64,64,62);glow.addColorStop(0,'rgba(200,175,255,.65)');glow.addColorStop(.3,'rgba(112,80,175,.20)');glow.addColorStop(1,'rgba(25,10,70,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,128,128);auraTexture=new THREE.CanvasTexture(canvas);
  aura=new THREE.Sprite(new THREE.SpriteMaterial({map:auraTexture,color:0xc4a5ff,transparent:true,opacity:.20,depthWrite:false,blending:THREE.AdditiveBlending}));aura.position.z=-.75;aura.scale.set(4.4,4.8,1);scene.add(aura);
  const coordinates:number[]=[];for(let i=0;i<35;i++){const a=i*2.39996, radius=1.3+(i%7)*.13;coordinates.push(Math.cos(a)*radius, Math.sin(a)*radius*1.15, -.5+(i%5)*.09)}
  const starGeometry=new THREE.BufferGeometry();starGeometry.setAttribute('position',new THREE.Float32BufferAttribute(coordinates,3));
  stars=new THREE.Points(starGeometry,new THREE.PointsMaterial({color:design.metal,size:.027,transparent:true,opacity:.58,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(stars);
 }
 let needsPaint=true,lastRotation="";let frame=0,openedAt:number|null=null,alive=true;const resize=()=>{needsPaint=true;const w=Math.max(1,el.clientWidth),h=Math.max(1,el.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.z=compact?7.4:5.6;camera.updateProjectionMatrix()};const ro=new ResizeObserver(resize);ro.observe(el);resize();
 const animate=(now:number)=>{if(!alive)return;const openDistance=Math.max(7.3,4.25/(2*Math.tan(THREE.MathUtils.degToRad(16))*camera.aspect));camera.position.z=THREE.MathUtils.lerp(camera.position.z,openingRef.current?openDistance:(compact?7.4:5.6),.035);if(openingRef.current){if(openedAt===null)openedAt=now;const t=Math.min(1,(now-openedAt)/2300);const smooth=t*t*(3-2*t);hinge.rotation.y=-Math.PI*.91*smooth;group.rotation.y=THREE.MathUtils.lerp(group.rotation.y,0,.045);group.rotation.x=THREE.MathUtils.lerp(group.rotation.x,0,.045);group.position.x=-.1+.8*smooth;}else{openedAt=null;hinge.rotation.y=0;group.position.x=0;group.rotation.x=THREE.MathUtils.degToRad(rot.current.x);group.rotation.y=THREE.MathUtils.degToRad(rot.current.y)}if(stars){stars.rotation.z=now*.000025;jewelLight.intensity=.48+.12*Math.sin(now*.0014);}if(aura)(aura.material as THREE.SpriteMaterial).opacity=.17+.03*Math.sin(now*.001);const signature=JSON.stringify(rot.current);if(!document.hidden&&(needsPaint||motion||openingRef.current||lastRotation!==signature)){renderer.render(scene,camera);needsPaint=false;lastRotation=signature}frame=requestAnimationFrame(animate)};frame=requestAnimationFrame(animate);
 return ()=>{disposed=true;alive=false;renderer.domElement.removeEventListener('webglcontextlost',contextLost);cancelAnimationFrame(frame);ro.disconnect();scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const materials=Array.isArray(o.material)?o.material:[o.material];materials.forEach(m=>m.dispose());}});if(stars){stars.geometry.dispose();(stars.material as THREE.Material).dispose()} if(aura)(aura.material as THREE.Material).dispose();auraTexture?.dispose();[texture,edge,page,name.color,name.bump,grain].forEach(t=>t.dispose());renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove()};
 },[book,compact,onFailure,motion]);
 return <div ref={root} className="three-book-canvas" aria-hidden="true"/>;
}
