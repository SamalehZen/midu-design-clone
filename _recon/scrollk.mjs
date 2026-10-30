
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
const page=await ctx.newPage();
await page.goto('https://midu.design/',{waitUntil:'load',timeout:120000});
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(3000);
async function goTo(y){ for(let i=0;i<20;i++){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(110); if(Math.abs(await page.evaluate(()=>window.scrollY)-y)<=1) break; } }
function ty(tr){ const m=/matrix\(1,\s*0,\s*0,\s*1,\s*(-?[\d.]+),\s*(-?[\d.]+)\)/.exec(tr); if(m) return {tx:+m[1],ty:+m[2]}; const m2=/translateY\((-?[\d.]+)px\)/.exec(tr); if(m2) return {tx:0,ty:+m2[1]}; if(tr==='none') return {tx:0,ty:0}; return {tx:NaN,ty:NaN}; }
async function snap(){ return page.evaluate(()=>{ const out=[]; const main=document.querySelector('#main');
  function walk(el,path){ const cs=getComputedStyle(el); out.push([path, el.getAttribute('data-framer-name')||'', (el.getAttribute('class')||'').slice(0,30), +el.getBoundingClientRect().height.toFixed(2), cs.transform, cs.opacity, cs.position]);
    let k=0; for(const c of el.children){ const t=c.tagName.toLowerCase(); if(t==='style'||t==='script'||t==='link')continue; walk(c,path+'.'+k); k++; } }
  walk(main,'0'); return out; }); }
await goTo(0); await page.waitForTimeout(1200); const A=await snap();
await goTo(1000); await page.waitForTimeout(1200); const B=await snap();
await b.close();
console.log('nodes',A.length,B.length);
const res=[];
for(let i=0;i<Math.min(A.length,B.length);i++){
  const a=B[i], c=A[i];
  if(a[0]!==c[0]) { console.log('PATH DRIFT at',i,a[0],c[0]); break; }
  const ta=ty(c[4]), tb=ty(a[4]);
  const dty=tb.ty-ta.ty, dtx=tb.tx-ta.tx;
  if((!isNaN(dty)&&Math.abs(dty)>0.5)||(!isNaN(dtx)&&Math.abs(dtx)>0.5)){
    res.push({path:a[0],name:a[1],cls:a[2],h:a[3],dx:+dtx.toFixed(2),dy:+dty.toFixed(2),kx:+(dtx/1000).toFixed(4),ky:+(dty/1000).toFixed(4),pos:a[6]});
  }
}
console.log('scroll-linked elements (per 1000px scroll):',res.length);
res.forEach(r=>console.log('  '+r.path+'  name='+r.name+' cls='+r.cls+'  dx='+r.dx+' dy='+r.dy+'  kx='+r.kx+' ky='+r.ky));
fs.writeFileSync('/home/node/Ui/_recon/scrollk.json',JSON.stringify(res,null,1));
