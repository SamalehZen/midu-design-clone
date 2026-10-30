
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
const page=await ctx.newPage();
await page.goto('https://midu.design/',{waitUntil:'load',timeout:120000});
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(6000);
const sel='[data-framer-name="IconSunAnimation"],[data-framer-name="IconSun"],[data-framer-name="IconSleep"],[data-framer-name="SunVector"]';
const rows=[];
for(let i=0;i<20;i++){
  const r=await page.evaluate((s)=>{
    const out=[];
    for(const e of document.querySelectorAll(s)){
      const cs=getComputedStyle(e); const b=e.getBoundingClientRect();
      out.push(e.getAttribute('data-framer-name')+':'+cs.transform.replace(/\s+/g,'')+'|disp='+cs.display+'|op='+cs.opacity+'|'+Math.round(b.width)+'x'+Math.round(b.height)+'@'+Math.round(b.x)+','+Math.round(b.y));
    }
    // also the 1px column near x=940
    const c=[...document.querySelectorAll('#main *')].filter(e=>{const b=e.getBoundingClientRect(); return b.width<=8 && b.width>0 && b.height>=10 && b.x>930 && b.x<950;}).slice(0,3).map(e=>{const b=e.getBoundingClientRect(); return (e.getAttribute('data-framer-name')||e.getAttribute('class')||e.tagName)+' '+Math.round(b.width)+'x'+Math.round(b.height)+'@'+Math.round(b.x)+','+Math.round(b.y+scrollY);});
    return {out, c, t:Math.round(performance.now())};
  }, sel);
  rows.push(r); await page.waitForTimeout(300);
}
console.log('=== icon states over time ===');
rows.slice(0,10).forEach(r=>console.log('  t='+r.t+' '+r.out.join(' ; ')));
console.log('=== 1px column @x=940 ===');
console.log('  '+(rows[0].c.join(' ; ')||'none'));
await b.close();
