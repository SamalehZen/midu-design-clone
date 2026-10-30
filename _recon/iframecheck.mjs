
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
for(const url of ['https://midu.design/','http://127.0.0.1:8792/','https://component.hypeer.cloud/ui/']){
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  const codes=[];
  page.on('response',r=>{ if(/gradientshader/.test(r.url())) codes.push(r.status()+' '+r.url().slice(0,60)); });
  await page.goto(url,{waitUntil:'load',timeout:120000});
  await page.waitForTimeout(6000);
  const info=await page.evaluate(()=>{
    const f=document.querySelector('iframe');
    let inner='n/a', innerH=0;
    try { const d=f.contentDocument; if(d){ inner=(d.body?d.body.innerHTML.length:0)+''; innerH=d.documentElement?d.documentElement.scrollHeight:0; const cv=d.querySelector('canvas'); inner+=' canvas='+(cv?cv.width+'x'+cv.height:'none'); } } catch(e){ inner='cross-origin'; }
    return {src:f?f.src.slice(0,60):'none', rect:f?JSON.stringify(f.getBoundingClientRect().toJSON()):null, inner, innerH};
  });
  console.log(url);
  console.log('   iframe:', info.src, info.rect);
  console.log('   inner:', info.inner);
  console.log('   net:', codes.join(' | ')||'no request seen');
  await ctx.close();
}
await b.close();
