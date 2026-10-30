
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';
import fs from 'node:fs';
const map=JSON.parse(fs.readFileSync('/home/node/Ui/_recon/asset-map-live.json','utf8'));
const byName=new Map(map.map(a=>[a.name,a.url]));
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
async function prep(url,mode){
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  if(mode==='cdn'){
    await page.route('**/assets/**', async (route)=>{
      const u=new URL(route.request().url()); const name=u.pathname.split('/').pop();
      const remote=byName.get(name);
      if(!remote){ await route.continue(); return; }
      try { const r=await fetch(remote); const buf=Buffer.from(await r.arrayBuffer());
        await route.fulfill({status:200, contentType:r.headers.get('content-type')||'application/octet-stream', body:buf}); }
      catch(e){ await route.continue(); }
    });
  }
  await page.goto(url,{waitUntil:'load',timeout:120000});
  await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(2500);
  for(let y=0;y<=11143;y+=400){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(110); }
  await page.waitForTimeout(1200); return page;
}
const mode=process.argv[2]||'cdn';
const O=await prep('https://midu.design/','none'), L=await prep('http://127.0.0.1:8792/',mode);
for(const p of [O,L]) for(let i=0;i<25;i++){ await p.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),3600); await p.waitForTimeout(100); if(Math.abs(await p.evaluate(()=>window.scrollY)-3600)<=1) break; }
await O.waitForTimeout(600); await L.waitForTimeout(600);
const a=PNG.sync.read(await O.screenshot()), c=PNG.sync.read(await L.screenshot());
let n=0,sum=0; for(let i=0;i<a.data.length;i+=4){ const d=Math.abs(a.data[i]-c.data[i])+Math.abs(a.data[i+1]-c.data[i+1])+Math.abs(a.data[i+2]-c.data[i+2]); sum+=d; if(d>6)n++; }
console.log('mode='+mode+'  y=3600 diffPx='+n+' ('+(100*n/(1200*900)).toFixed(3)+'%) MAE='+(sum/(1200*900)/765).toFixed(6));
const X0=100,Y0=400,PW=240,PH=240;
function diffAt(dx,dy){ let s=0; for(let y=0;y<PH;y++) for(let x=0;x<PW;x++){ const i=((Y0+y)*1200+(X0+x))*4, j=((Y0+y+dy)*1200+(X0+x+dx))*4; s+=Math.abs(a.data[i]-c.data[j])+Math.abs(a.data[i+1]-c.data[j+1])+Math.abs(a.data[i+2]-c.data[j+2]); } return s/(PW*PH*3); }
console.log('patch mean|delta| at (0,0) = '+diffAt(0,0).toFixed(3));
await b.close();
