
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
const now=new Date();
const target=[6.5,7,7.25,7.5,8,19,19.5,19.75,20,20.5,21];
for(const h of target){
  const d=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate(),Math.floor(h),Math.round((h%1)*60),0));
  const off=(d.getTime()-now.getTime())/3600000;
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  await ctx.addInitScript((shift)=>{ const D=Date; class ND extends D { constructor(...a){ if(a.length===0) super(D.now()+shift); else super(...a);} static now(){ return D.now()+shift; } } window.Date=ND; }, off*3600*1000);
  const page=await ctx.newPage();
  await page.goto('https://midu.design/',{waitUntil:'load',timeout:120000});
  await page.waitForTimeout(5500);
  const r=await page.evaluate(()=>{
    const g=(n)=>{ const e=document.querySelector('[data-framer-name="'+n+'"]'); if(!e) return 0; const b=e.getBoundingClientRect(); return Math.round(b.width); };
    const clock=[...document.querySelectorAll('[data-framer-name="LocalTime"]')].map(e=>e.textContent.trim())[0]||'-';
    return {clock, sun:g('IconSun'), sleep:g('IconSleep')};
  });
  console.log('utc='+d.toISOString().slice(11,16)+'  clock='+r.clock.padEnd(9)+' sun='+r.sun+' sleep='+r.sleep+'  => '+(r.sun>0?'SUN':'MOON'));
  await ctx.close();
}
await b.close();
