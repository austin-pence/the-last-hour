import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const f of ['index.html','app.js','style.css','core.js','new-game.js','copy.js']) await copyFile('public/'+f,'dist/'+f);
let config;try{config=JSON.parse(await readFile('private/firebase-config.json','utf8'));}catch{throw Error('Verified Firebase web config required at private/firebase-config.json');}
await writeFile('dist/config.js','export default '+JSON.stringify(config)+';\n');
console.log('Built static Hosting app; private game content excluded.');
