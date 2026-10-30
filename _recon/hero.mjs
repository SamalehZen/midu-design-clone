
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
const page=await ctx.newPage();
await page.goto('https://midu.design/',{waitUntil:'load',timeout:120000});
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(3000);
async function goTo(y){ for(let i=0;i<20;i++){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(120); if(Math.abs(await page.evaluate(()=>window.scrollY)-y)<=1) break; } }
const res=await page.evaluate(()=>{
  const out=[];
  const main=document.querySelector('#main');
  function walk(el,path){ out.push([path,el]); let k=0; for(const c of el.children){ const t=c.tagName.toLowerCase(); if(t==='style'||t==='script'||t==='link')continue; walk(c,path+'.'+k); k++; } }
  walk(main,'0');
  window.__map=new Map(out);
  return null;
});
for(const s of [0,600,1200,1800,2400,3000]){
  await goTo(s); await page.waitForTimeout(500);
  const rows=await page.evaluate(()=>{
    const out=[];
    for(const p of ['0.0.0.5','0.0.0.5.0','0.0.0.5.0.0','0.0.0.5.0.0.0','0.0.0.5.0.0.1']){
      const el=window.__map.get(p); if(!el){out.push(p+' MISSING');continue;}
      const cs=getComputedStyle(el); const r=el.getBoundingClientRect();
      out.push(p+' name='+(el.getAttribute('data-framer-name')||'-')+' pos='+cs.position+' vy='+r.y.toFixed(1)+' h='+r.height.toFixed(1)+' tr='+cs.transform.replace(/\s+/g,'')+' top='+cs.top+' z='+cs.zIndex);
    }
    return {rows:out, sy:Math.round(window.scrollY)};
  });
  console.log('--- scrollY='+rows.sy+' ---');
  rows.rows.forEach(r=>console.log('   '+r));
}
await b.close();
