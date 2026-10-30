
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
for (const url of ['https://midu.design/','http://127.0.0.1:8792/']) {
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(url,{waitUntil:'load',timeout:120000});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(8000);
  const r=await page.evaluate(()=>{
    const out={};
    for(const sel of ['.framer-W8QJn','.framer-7DOFx','.framer-bulukq','.framer-10h9rgl','.framer-1c3gczv']){
      const el=document.querySelector(sel); if(!el){out[sel]='MISSING';continue;}
      const cs=getComputedStyle(el); const b=el.getBoundingClientRect();
      out[sel]={cls:el.getAttribute('class'),disp:cs.display,dir:cs.flexDirection,gap:cs.gap,pad:cs.padding,just:cs.justifyContent,align:cs.alignItems,pos:cs.position,w:Math.round(b.width),h:Math.round(b.height),
        childDisps:[...el.children].map(c=>getComputedStyle(c).display).join(','), nKids:el.children.length};
    }
    return out;
  });
  console.log('=== '+url+' ===');
  for(const k of Object.keys(r)) console.log('  '+k+' '+JSON.stringify(r[k]));
  await ctx.close();
}
await b.close();
