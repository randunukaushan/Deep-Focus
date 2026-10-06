// Local-only preview; serves this artifact, never the repository.
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const allowed={'/':'index.html','/index.html':'index.html','/brand-reference.png':'brand-reference.png','/motion.css':'motion.css','/onboarding.css':'onboarding.css','/onboarding.js':'onboarding.js','/onboarding-copy.js':'onboarding-copy.js'};
http.createServer((req,res)=>{
 const file=allowed[(req.url||'/').split('?')[0]];
 if(!file){res.writeHead(404);res.end('Not found');return;}
 res.setHeader('Content-Type',file.endsWith('.png')?'image/png':file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8');
 res.setHeader('Cache-Control','no-store');
 fs.createReadStream(path.join(__dirname,file)).pipe(res);
}).listen(8873,'127.0.0.1',()=>console.log('Deep Focus preview: http://127.0.0.1:8873'));
