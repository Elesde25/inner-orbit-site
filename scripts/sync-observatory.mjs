import {mkdirSync,copyFileSync} from 'node:fs';
mkdirSync('public/observatory',{recursive:true});copyFileSync('observatory/dist/index.html','public/observatory/index.html');
