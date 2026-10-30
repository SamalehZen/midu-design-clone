
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
for (const url of ['https://midu.design/','http://127.0.0.1:8791/']) {
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(url,{waitUntil:'load',timeout:120000});
  const rows=[];
  for(let i=0;i<16;i++){
    const r=await page.evaluate(()=>{
      const svc=document.querySelector('.framer-1c3gczv');
      const pr=document.querySelector('.framer-aef8d');
      const imgs=[...svc.querySelectorAll('img')].map(i=>({s:(i.currentSrc||i.src).split('/').pop().slice(0,24), c:i.complete, w:Math.round(i.getBoundingClientRect().width), h:Math.round(i.getBoundingClientRect().height)}));
      return {H:document.documentElement.scrollHeight, svc:Math.round(svc.getBoundingClientRect().height), svcY:Math.round(svc.getBoundingClientRect().y+scrollY), prY:Math.round(pr.getBoundingClientRect().y+scrollY), imgs};
    });
    rows.push(r);
    await page.waitForTimeout(1000);
  }
  console.log('=== '+url+' ===');
  rows.forEach((r,i)=>console.log('  t='+i+'s H='+r.H+' svcH='+r.svc+' svcY='+r.svcY+' pricingY='+r.prY+' imgs='+r.imgs.map(x=>x.w+'x'+x.h+(x.c?'':'!')).join(',')));
  await ctx.close();
}
await b.close();
