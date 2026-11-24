import * as THREE from 'three';
import type { ArtifactDesign } from '../data/artifactDesign';

/** All ornament below is actual raised geometry, shared by every rotating artifact. */
export function roundedShape(w:number,h:number,r:number){const s=new THREE.Shape();const x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
export function roundedGeometry(w:number,h:number,depth:number,r=.055){const g=new THREE.ExtrudeGeometry(roundedShape(w,h,r),{depth,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:2,curveSegments:5});g.translate(0,0,-depth/2);return g;}
export function relief(design:ArtifactDesign,w:number,h:number,title:string) {
 const root=new THREE.Group();
 const metal=new THREE.MeshStandardMaterial({color:design.metal,metalness:.8,roughness:.29});
 const darkMetal=new THREE.MeshStandardMaterial({color:new THREE.Color(design.metal).multiplyScalar(.48),metalness:.85,roughness:.43});
 const gem=new THREE.MeshPhysicalMaterial({color:design.stone,metalness:.2,roughness:.16,clearcoat:1,clearcoatRoughness:.09});
 const gemDark=new THREE.MeshStandardMaterial({color:new THREE.Color(design.stone).multiplyScalar(.38),metalness:.35,roughness:.28});
 const add=(geo:THREE.BufferGeometry,mat:THREE.Material,parent=root)=>{const m=new THREE.Mesh(geo,mat);parent.add(m);return m};
 const path=(points:THREE.Vector3[],radius=.012, mat:THREE.Material=metal,parent=root,closed=false)=>{const curve=new THREE.CatmullRomCurve3(points,closed,'centripetal');return add(new THREE.TubeGeometry(curve,Math.max(20,points.length*5),radius,5,closed),mat,parent)};
 const border=(inset:number,radius:number,mat:THREE.Material)=>{let pts=roundedShape(w-2*inset,h-2*inset,.08).getPoints(8).map(p=>new THREE.Vector3(p.x,p.y,.067));path(pts,radius,mat,root,true)};
 border(.095,.018,darkMetal);border(.105,.009,metal);border(.155,.006,metal);
 const orb=(parent:THREE.Object3D,x:number,y:number,z:number,r:number,color:THREE.Material=gem)=>{
  const setting=add(new THREE.CylinderGeometry(r*1.32,r*1.36,.024,20),darkMetal,parent as THREE.Group);setting.rotation.x=Math.PI/2;setting.position.set(x,y,z);
  const bezel=add(new THREE.TorusGeometry(r*1.08,.009,7,24),metal,parent as THREE.Group);bezel.position.set(x,y,z+.017);
  const stone=add(new THREE.SphereGeometry(r,24,16),color,parent as THREE.Group);stone.scale.z=.62;stone.position.set(x,y,z+.025);
 };
 // Four individually shaped guards, raised off the leather rather than drawn on it.
 for(const sx of [-1,1])for(const sy of [-1,1]){
  const c=new THREE.Group();c.position.set(sx*(w/2-.09),sy*(h/2-.09),.074);c.scale.set(sx,sy,1);root.add(c);
  const shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(-.31,0);shape.quadraticCurveTo(-.25,-.05,-.19,-.12);shape.quadraticCurveTo(-.11,-.16,0,-.30);shape.closePath();
  const plate=add(new THREE.ExtrudeGeometry(shape,{depth:.022,bevelEnabled:true,bevelThickness:.008,bevelSize:.006,bevelSegments:2,curveSegments:7}),darkMetal,c);plate.position.z=-.006;
  path([new THREE.Vector3(-.28,-.025,.035),new THREE.Vector3(-.19,-.06,.05),new THREE.Vector3(-.12,-.13,.05),new THREE.Vector3(-.025,-.27,.035)],.010,metal,c);
  path([new THREE.Vector3(-.22,-.02,.04),new THREE.Vector3(-.18,-.105,.05),new THREE.Vector3(-.08,-.11,.05),new THREE.Vector3(-.04,-.19,.04)],.006,metal,c);
  orb(c,-.075,-.075,.037,.026);
 }
 const center=new THREE.Group(); const position:Record<string,[number,number]>={'Tao Te Ching':[-.022,.017],'The Dhammapada':[0,.015],'The Millennial Tao':[.01,0], 'Gnostic Wisdom & Early Mystical Traditions':[0,0]}; const [dx,dy]=position[title] || [0,0]; center.position.set(dx*w,dy*h,0);root.add(center);
 const ring=add(new THREE.TorusGeometry(.205,.017,8,64),darkMetal,center);ring.position.z=.074;
 const ring2=add(new THREE.TorusGeometry(.19,.007,6,64),metal,center);ring2.position.z=.09;
 if(design.style==='geometry'||design.style==='celestial'){
  for(let i=0;i<(design.style==='geometry'?6:4);i++){
   const e=add(new THREE.TorusGeometry(.263,.006,5,48),metal,center);e.position.z=.075;e.scale.y=design.style==='geometry'?.47:.64;e.rotation.z=i*Math.PI/(design.style==='geometry'?6:4);
  }
 }else if(design.style==='lotus'||design.style==='sun'||design.style==='flame'){
  const n=design.orbit;
  for(let i=0;i<n;i++){let a=i*Math.PI*2/n,petal=new THREE.Group();petal.rotation.z=a;center.add(petal);path([new THREE.Vector3(.19,-.035,.07),new THREE.Vector3(.27,-.055,.09),new THREE.Vector3(.34,0,.08),new THREE.Vector3(.27,.055,.09),new THREE.Vector3(.19,.035,.07)],.008,metal,petal)}
 }else if(design.style==='laurel'||design.style==='vine'){
  for(const sx of [-1,1]){const side=new THREE.Group();side.scale.x=sx;center.add(side);path([new THREE.Vector3(.05,-.32,.07),new THREE.Vector3(.26,-.23,.08),new THREE.Vector3(.34,0,.08),new THREE.Vector3(.25,.3,.07)],.01,metal,side);for(let i=0;i<5;i++){const y=-.2+i*.1,x=.27+Math.sin(i*Math.PI/4)*.04;path([new THREE.Vector3(x,y,.08),new THREE.Vector3(x+.07,y+.03,.09),new THREE.Vector3(x+.09,y+.10,.08),new THREE.Vector3(x+.02,y+.07,.09),new THREE.Vector3(x,y,.08)],.006,metal,side)}}
 }else{
  for(const sy of [-1,1]){const wave=new THREE.Group();wave.scale.y=sy;center.add(wave);for(let j=0;j<2;j++)path([new THREE.Vector3(-.45,.38+j*.055,.07),new THREE.Vector3(-.26,.42+j*.055,.09),new THREE.Vector3(-.08,.36+j*.055,.08),new THREE.Vector3(.12,.42+j*.055,.09),new THREE.Vector3(.42,.39+j*.055,.07)],.007,metal,wave)}
 }
 orb(center,0,0,.082,design.style==='laurel'?.105:.115);
 for(let i=0;i<design.orbit;i++){const a=i*Math.PI*2/design.orbit;orb(center,.255*Math.cos(a),.255*Math.sin(a),.082,.022,i%2?gemDark:gem)}
 if(design.clasp){for(const y of [-.64,.64]){const bar=add(roundedGeometry(.19,.09,.035,.025),darkMetal);bar.position.set(w/2-.015,y,.08);const t=add(roundedGeometry(.15,.045,.015,.018),metal);t.position.set(w/2-.015,y,.108);orb(root,w/2+.015,y,.12,.020)}}
 return {root,metal,darkMetal,gem,gemDark};
}
export function dressSpine(parent:THREE.Group, design:ArtifactDesign, h:number,r:number, x:number, leather:THREE.Material, metal:THREE.Material, gem:THREE.Material){
 const cylinder=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,32,1),leather);cylinder.position.x=x;parent.add(cylinder);
 for(let i=0;i<design.bands;i++){const y=-h*.43+i*h*.86/(design.bands-1);for(const offset of [-.016,.016]){const band=new THREE.Mesh(new THREE.TorusGeometry(r+.006,.012,7,32),metal);band.rotation.x=Math.PI/2;band.position.set(x,y+offset,0);parent.add(band)}}
 const n=design.bands-1;
 // The exposed outer half of the rounded spine is engraved in three dimensions.
 const project=(a:number,y:number,offset=.012)=>new THREE.Vector3(x-Math.cos(a)*(r+offset),y,Math.sin(a)*(r+offset));
 const draw=(pts:THREE.Vector3[],thickness=.007)=>{const t=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),32,thickness,6,false),metal);parent.add(t)};
 for(let i=0;i<n;i++){
  const ya=-h*.43+i*h*.86/n,yb=-h*.43+(i+1)*h*.86/n,center=(ya+yb)/2,span=yb-ya;
  for(const side of [-1,1]){
   const curve:THREE.Vector3[]=[];
   for(let k=0;k<=24;k++){const t=k/24;curve.push(project(side*(.20+.58*Math.sin(Math.PI*t)),ya+span*(.08+.84*t)))}
   draw(curve,.009);
   for(const ysign of [-1,1]) {const leaf:THREE.Vector3[]=[];for(let k=0;k<=20;k++){const a=2*Math.PI*k/20;leaf.push(project(side*(.47+.17*Math.cos(a)),center+ysign*span*.23 + span*.095*Math.sin(a),.017))}draw(leaf,.006)}
  }
  for(const direction of [-1,1]){const rim:THREE.Vector3[]=[];for(let k=0;k<=24;k++){const a=Math.PI*2*k/24;rim.push(project(.40*Math.cos(a),center+span*.13*Math.sin(a),.016))}if(direction===1)draw(rim,.008)}
  if(design.style==='water'){
   for(const shift of [-.22,.22]) {const wave:THREE.Vector3[]=[];for(let k=0;k<=20;k++){const t=k/20;wave.push(project(-.70+1.4*t,center+span*(shift+.035*Math.sin(t*Math.PI*4)),.02))}draw(wave,.0045)}
  }else if(design.style==='geometry'||design.style==='celestial'){
   for(const offset of [-.23,.23]){const orbit:THREE.Vector3[]=[];for(let k=0;k<=24;k++){const a=2*Math.PI*k/24;orbit.push(project(.28*Math.cos(a),center+span*(offset+.095*Math.sin(a)),.02))}draw(orbit,.0045)}
  }else{
   for(const side of [-1,1]){const stem:THREE.Vector3[]=[];for(let k=0;k<=16;k++){const t=k/16;stem.push(project(side*(.55+.10*Math.sin(t*Math.PI*3)),center+span*(-.32+t*.64),.02))}draw(stem,.0045)}
  }
  const setting=new THREE.Mesh(new THREE.SphereGeometry(.043,16,12),metal);setting.scale.set(.55,1,1);setting.position.set(x-r-.014,center,0);parent.add(setting);
  const stone=new THREE.Mesh(new THREE.SphereGeometry(.029,16,12),gem);stone.scale.set(.7,1,1);stone.position.set(x-r-.035,center,0);parent.add(stone);
 }
}
