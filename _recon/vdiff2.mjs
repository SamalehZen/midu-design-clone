
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';
import fs from 'node:fs';
const args=['--no-sandbox','--disable-gpu','--hide-scrollbars'];
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args});
const H=11143, VH=900;
async function prep(url){
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(url,{waitUntil:'load',timeout:120000});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(3000);
  for(let y=0;y<=H;y+=400){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(120); }
  await page.waitForTimeout(1200);
  return page;
}
async function shot(page,y){
  for(let i=0;i<25;i++){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(110); const c=await page.evaluate(()=>Math.round(window.scrollY)); if(Math.abs(c-y)<=1) break; }
  await page.waitForTimeout(600);
  return page.screenshot();
}
const O=await prep('https://midu.design/');
const L=await prep('http://127.0.0.1:8792/');
const ys=[]; for(let y=0;y<=H-VH;y+=450) ys.push(y);
let tot=0, totAll=0, totD=0, worst=[];
console.log('scrollY   diffPx    %      MAE');
for(const y of ys){
  const a=PNG.sync.read(await shot(O,y));
  const c=PNG.sync.read(await shot(L,y));
  let n=0, sum=0;
  const rows=new Map();
  for(let j=0;j<a.height;j++){ let rn=0;
    for(let x=0;x<a.width;x++){ const i=(j*a.width+x)*4;
      const d=Math.abs(a.data[i]-c.data[i])+Math.abs(a.data[i+1]-c.data[i+1])+Math.abs(a.data[i+2]-c.data[i+2]);
      sum+=d; if(d>6){ n++; rn++; }
    }
    if(rn) rows.set(j,rn);
  }
  const np=a.width*a.height;
  tot+=n; totAll+=np; totD+=sum;
  const pct=(100*n/np);
  const mae=sum/np/765;
  console.log(String(y).padStart(6)+(n+'').padStart(10)+pct.toFixed(2).padStart(8)+'%'+mae.toFixed(6).padStart(12));
  // report contiguous bright rows
  let run=null; const bands=[];
  for(let j=0;j<a.height;j++){ const v=rows.get(j)||0;
    if(v>a.width*0.02){ if(!run) run={a:j,b:j,n:v}; else {run.b=j; run.n+=v;} }
    else if(run){ bands.push(run); run=null; } }
  if(run) bands.push(run);
  bands.sort((x,z)=>z.n-x.n);
  worst.push({y, pct:+pct.toFixed(2), bands:bands.slice(0,4).map(x=>(x.a+y)+'-'+(x.b+y)+' n='+x.n)});
}
console.log('TOTAL differing:',tot,'/',totAll,'=',(100*tot/totAll).toFixed(2)+'%  MAE='+(totD/totAll/765).toFixed(6));
console.log('--- worst bands per position ---');
worst.forEach(w=>console.log('  y='+w.y+' '+w.pct+'% '+w.bands.join(' | ')));
await b.close();
