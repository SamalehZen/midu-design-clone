
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
const S=+(process.argv[2]||3600);
async function prep(url){
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(url,{waitUntil:'load',timeout:120000});
  await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(3000);
  for(let y=0;y<=11143;y+=400){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(110); }
  await page.waitForTimeout(1500); return page;
}
const O=await prep('https://midu.design/'), L=await prep('http://127.0.0.1:8792/');
for(const p of [O,L]) for(let i=0;i<25;i++){ await p.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),S); await p.waitForTimeout(100); if(Math.abs(await p.evaluate(()=>window.scrollY)-S)<=1) break; }
await O.waitForTimeout(500); await L.waitForTimeout(500);
const a=PNG.sync.read(await O.screenshot()), c=PNG.sync.read(await L.screenshot());
const pts=[];
for(let y=0;y<900;y+=3) for(let x=0;x<1200;x+=3){ const i=(y*1200+x)*4;
  const d=Math.abs(a.data[i]-c.data[i])+Math.abs(a.data[i+1]-c.data[i+1])+Math.abs(a.data[i+2]-c.data[i+2]);
  if(d>6) pts.push([x,y,d]); }
console.log('sampled diff points (1/9 of pixels):',pts.length);
pts.sort((p,q)=>q[2]-p[2]);
const sample=pts.filter((_,i)=>i%7===0).slice(0,400);
const res=await O.evaluate((list)=>{
  const hist={};
  for(const [x,y] of list){
    const els=document.elementsFromPoint(x,y);
    let id='none';
    for(const e of els){ const cs=getComputedStyle(e);
      id=e.tagName.toLowerCase()+'|'+((e.getAttribute('class')||'').split(' ').filter(c=>/^framer-/.test(c)).slice(-1)[0]||'-')+'|'+(e.getAttribute('data-framer-name')||'')+'|bg='+(cs.backgroundColor!=='rgba(0, 0, 0, 0)'?'Y':'n')+'|img='+(e.tagName==='IMG'?'Y':'n');
      break; }
    hist[id]=(hist[id]||0)+1; }
  return hist;
},sample);
console.log('=== topmost element histogram (orig page) ===');
Object.entries(res).sort((p,q)=>q[1]-p[1]).slice(0,12).forEach(([k,v])=>console.log('  '+v+'  '+k));
await b.close();
