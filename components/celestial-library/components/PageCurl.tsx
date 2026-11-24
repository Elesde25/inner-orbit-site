import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type Flip = {direction:'next'|'prev';node:HTMLElement;mode?:'drag'|'settle';progress?:number};
function pageTexture(node:HTMLElement,night:boolean, width:number, height:number):THREE.CanvasTexture {
 const c=document.createElement('canvas');c.width=800;c.height=Math.round(800*height/width);const x=c.getContext('2d')!;const h=c.height;
 const bg=x.createLinearGradient(0,0,c.width,0);if(night){bg.addColorStop(0,'#181225');bg.addColorStop(.5,'#261d38');bg.addColorStop(1,'#181225')}else{bg.addColorStop(0,'#eedeba');bg.addColorStop(.25,'#fbf1da');bg.addColorStop(1,'#f4e5c5')};x.fillStyle=bg;x.fillRect(0,0,c.width,h);
 let y=65;const max=c.width-100; const nodes=node.querySelectorAll('header,h3,p,footer');
 nodes.forEach(el=>{if(el.parentElement?.closest('header') && el.tagName!=='HEADER')return;const text=(el as HTMLElement).innerText?.trim();if(!text)return; const header=el.tagName==='HEADER', footer=el.tagName==='FOOTER', heading=el.tagName==='H3';x.font=header?'bold 31px Georgia':heading?'bold 27px Georgia':footer?'15px Georgia':'25px Georgia';x.fillStyle=night?'#e9ddc6':'#342617';let line='';for(const word of text.split(/\s+/)){let next=(line+' '+word).trim();if(x.measureText(next).width>max&&line){x.fillText(line,50,y,max);y+=header?40:36;line=word}else line=next}if(line){x.fillText(line,50,y,max);y+=header?60:heading?45:footer?30:42}});
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
export default function PageCurl({flip,wide,night,onFailure}:{flip:Flip;wide:boolean;night:boolean;onFailure:()=>void}) {
 const host=useRef<HTMLDivElement>(null), latest=useRef(flip);latest.current=flip;
 useEffect(()=>{const el=host.current;if(!el)return;let renderer:THREE.WebGLRenderer;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});}catch{onFailure();return}
 const contextLost=(e:Event)=>{e.preventDefault();onFailure()};renderer.domElement.addEventListener('webglcontextlost',contextLost);
 renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0,0);el.appendChild(renderer.domElement);
 const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(35,1,.1,10000);scene.add(new THREE.AmbientLight(0xffffff,1.35));const light=new THREE.DirectionalLight(0xffe8bd,1.5);light.position.set(-200,500,800);scene.add(light);
 const shell=el.parentElement!;let mesh:THREE.Mesh|undefined,back:THREE.Mesh|undefined,geo:THREE.PlaneGeometry|undefined,frontMat:THREE.MeshStandardMaterial|undefined,backMat:THREE.MeshStandardMaterial|undefined,tex:THREE.CanvasTexture|undefined;let pw=0,ph=0,hinge=0;
 const resize=()=>{const r=shell.getBoundingClientRect(),cw=r.width*2,ch=r.height;renderer.setSize(cw,ch,false);cam.aspect=cw/ch;cam.position.set(0,0,(ch/2)/Math.tan(THREE.MathUtils.degToRad(35/2)));cam.lookAt(0,0,0);cam.updateProjectionMatrix();pw=wide?(r.width-26)/2:r.width-26;ph=r.height-27;hinge=wide?0:(flip.direction==='next'?-pw/2:pw/2);if(mesh)scene.remove(mesh);if(back)scene.remove(back);geo?.dispose();frontMat?.dispose();backMat?.dispose();tex?.dispose();geo=new THREE.PlaneGeometry(pw,ph,48,12);tex=pageTexture(flip.node,night,pw,ph);frontMat=new THREE.MeshStandardMaterial({map:tex,side:flip.direction==='next'?THREE.FrontSide:THREE.BackSide,roughness:1});backMat=new THREE.MeshStandardMaterial({color:night?0x211a31:0xf4e8ce,side:flip.direction==='next'?THREE.BackSide:THREE.FrontSide,roughness:1});mesh=new THREE.Mesh(geo,frontMat);back=new THREE.Mesh(geo,backMat);scene.add(mesh,back)};
 const ro=new ResizeObserver(resize);ro.observe(shell);resize();let id=0,alive=true,start=performance.now(),last=start,value=0,velocity=0;
 const loop=(now:number)=>{if(!alive)return;const dt=Math.min(.035,(now-last)/1000);last=now;const f=latest.current;if(!f.mode){let t=Math.min(1,(now-start)/1800);value=t*t*(3-2*t)}else{const target=f.progress||0;const k=f.mode==='drag'?90:18, damping=f.mode==='drag'?18:9;velocity+=((target-value)*k-damping*velocity)*dt;value=Math.max(0,Math.min(1,value+velocity*dt))}
 if(geo){const p=geo.attributes.position as THREE.BufferAttribute;const base=geo.parameters;const cols=base.widthSegments!+1;const rows=base.heightSegments!+1;const sign=flip.direction==='next'?1:-1;for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){let u=i/(cols-1);if(sign<0)u=1-u;const theta=Math.PI*value + Math.sin(Math.PI*value)*.92*u;const x=hinge+sign*pw*u*Math.cos(theta);const z=pw*u*Math.sin(theta);const y=ph*(.5-j/(rows-1)) + Math.sin(Math.PI*u)*Math.sin(Math.PI*value)*ph*.012;p.setXYZ(j*cols+i,x,y,z)}p.needsUpdate=true;geo.computeVertexNormals()}
 renderer.render(scene,cam);id=requestAnimationFrame(loop)};id=requestAnimationFrame(loop);
 return()=>{alive=false;renderer.domElement.removeEventListener('webglcontextlost',contextLost);cancelAnimationFrame(id);ro.disconnect();geo?.dispose();tex?.dispose();frontMat?.dispose();backMat?.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove()};
 },[flip.node,flip.direction,wide,night,onFailure]);
 return <div ref={host} className="three-page-layer" aria-hidden="true"/>;
}
