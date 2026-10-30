
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
for (const url of ['https://midu.design/','http://127.0.0.1:8791/']) {
const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
const page=await ctx.newPage();
await page.goto(url,{waitUntil:'load',timeout:120000});
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(6000);
const info=await page.evaluate(()=>{
  const main=document.querySelector('#main');
  const out=[];
  const kids=[...main.children].filter(c=>c.tagName.toLowerCase()!=='style');
  const cont=kids.map(c=>c.querySelector('.framer-7DOFx')).find(Boolean);
  if(!cont) return ['NO CONTENT CONTAINER; kids='+kids.map(c=>c.getAttribute('class')).join(' | ')];
  let i=0;
  for(const c of cont.children){
    const r=c.getBoundingClientRect(); const cs=getComputedStyle(c);
    out.push(i+' '+(c.getAttribute('class')||'').slice(0,42)+' name='+(c.getAttribute('data-framer-name')||'-')+' y='+Math.round(r.y+scrollY)+' h='+Math.round(r.height)+' disp='+cs.display+' vis='+cs.visibility+' op='+cs.opacity);
    i++;
  }
  const f=kids.find(x=>x.getAttribute('data-framer-name')==='Footer');
  if(f){const r=f.getBoundingClientRect(); out.push('F y='+Math.round(r.y+scrollY)+' h='+Math.round(r.height));}
  return out;
});
console.log('=== '+url+' ===');
info.forEach(l=>console.log('   '+l));
await ctx.close();
}
await b.close();
