/** Per-volume sculptural accents, independent of the illustrated leather tooling. */
export type ReliefStyle = 'water'|'lotus'|'laurel'|'celestial'|'geometry'|'vine'|'flame'|'sun';
export interface ArtifactDesign {style:ReliefStyle; stone:string; metal:string; bands:number; orbit:number; clasp:boolean}
export const ARTIFACT_DESIGNS:Record<string,ArtifactDesign> = {
 'tao-te-ching':{style:'water',stone:'#246e59',metal:'#caa75d',bands:5,orbit:6,clasp:false},
 'bhagavad-gita':{style:'lotus',stone:'#a01536',metal:'#dcae57',bands:5,orbit:8,clasp:true},
 'dhammapada':{style:'lotus',stone:'#347c8c',metal:'#d4a044',bands:4,orbit:8,clasp:false},
 'ecclesiastes':{style:'sun',stone:'#9e5530',metal:'#b9935c',bands:4,orbit:8,clasp:true},
 'meditations':{style:'laurel',stone:'#1c2026',metal:'#a97d45',bands:4,orbit:6,clasp:false},
 'enchiridion':{style:'laurel',stone:'#345b5c',metal:'#ad8a53',bands:5,orbit:6,clasp:true},
 'millennial-tao':{style:'water',stone:'#62bca9',metal:'#d5bb82',bands:5,orbit:6,clasp:true},
 'consciousness-primer':{style:'celestial',stone:'#793fb0',metal:'#bbb1cf',bands:4,orbit:8,clasp:false},
 'varieties-experience':{style:'flame',stone:'#c78ca1',metal:'#caa471',bands:5,orbit:8,clasp:false},
 'sacred-plants-history':{style:'vine',stone:'#599969',metal:'#c9ad65',bands:4,orbit:6,clasp:true},
 'sacred-geometry-primer':{style:'geometry',stone:'#96c9e2',metal:'#d2c6af',bands:5,orbit:8,clasp:true},
 'archetypes-myth':{style:'sun',stone:'#946198',metal:'#d3aa6a',bands:4,orbit:8,clasp:false},
 'gnostic-wisdom':{style:'celestial',stone:'#8953b6',metal:'#d1b77f',bands:5,orbit:8,clasp:true},
 'geometry-companion':{style:'geometry',stone:'#73c0ba',metal:'#c0cbd0',bands:4,orbit:6,clasp:false},
};
export const artifactDesign=(id:string):ArtifactDesign=>ARTIFACT_DESIGNS[id] ?? {style:'celestial',stone:'#8b82ad',metal:'#cbb17a',bands:4,orbit:6,clasp:false};
