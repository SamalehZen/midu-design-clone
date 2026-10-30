
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
for(const off of [0,3,6,9,12,15,18,21]){
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  await ctx.addInitScript((offset)=>{
    const D=Date; const shift=offset*3600*1000;
    class ND extends D { constructor(...a){ if(a.length===0) super(D.now()+shift); else super(...a); } static now(){ return D.now()+shift; } }
    window.Date=ND;
  }, off);
  const page=await ctx.newPage();
  await page.goto('https://midu.design/',{waitUntil:'load',timeout:120000});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(6000);
  const r=await page.evaluate(()=>{
    const g=(n)=>{ const e=document.querySelector('[data-framer-name="'+n+'"]'); if(!e) return n+'=MISSING'; const b=e.getBoundingClientRect(); return n+'='+Math.round(b.width)+'x'+Math.round(b.height)+'@'+Math.round(b.x)+','+Math.round(b.y); };
    const clock=[...document.querySelectorAll('[data-framer-name="LocalTime"]')].map(e=>e.textContent.trim())[0]||'-';
    return {clock, sun:g('IconSun'), sleep:g('IconSleep'), sunA:g('IconSunAnimation'), sleepA:g('IconSleepAnimation')};
  });
  console.log('utcNow='+new Date(Date.now()+off*3600e3).toISOString().slice(11,16)+' clock='+r.clock+'  '+r.sun+'  '+r.sleep);
  await ctx.close();
}
await b.close();
