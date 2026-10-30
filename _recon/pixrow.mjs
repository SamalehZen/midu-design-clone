
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
async function prep(url){
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(url,{waitUntil:'load',timeout:120000});
  await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(3000);
  for(let y=0;y<=11143;y+=400){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(110); }
  await page.waitForTimeout(1500); return page;
}
const O=await prep('https://midu.design/'), L=await prep('http://127.0.0.1:8792/');
for(const p of [O,L]) for(let i=0;i<25;i++){ await p.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),9900); await p.waitForTimeout(100); if(Math.abs(await p.evaluate(()=>window.scrollY)-9900)<=1) break; }
await O.waitForTimeout(400); await L.waitForTimeout(400);
const a=PNG.sync.read(await O.screenshot()), c=PNG.sync.read(await L.screenshot());
const W=a.width;
console.log('row  absY   n   xmin xmax   sample O->L');
for(let y=660;y<900;y+=10){
  let n=0,x0=1e9,x1=-1, sp=null;
  for(let x=0;x<W;x++){ const i=(y*W+x)*4;
    const d=Math.abs(a.data[i]-c.data[i])+Math.abs(a.data[i+1]-c.data[i+1])+Math.abs(a.data[i+2]-c.data[i+2]);
    if(d>6){ n++; if(x<x0)x0=x; if(x>x1)x1=x; if(!sp && x%1===0 && n%40===0) sp='('+a.data[i]+','+a.data[i+1]+','+a.data[i+2]+')->('+c.data[i]+','+c.data[i+1]+','+c.data[i+2]+')'; } }
  if(n) console.log(String(y).padStart(4)+' '+(y+9900)+' '+String(n).padStart(5)+' '+String(x0).padStart(5)+' '+String(x1).padStart(5)+'   '+(sp||''));
}
await b.close();
