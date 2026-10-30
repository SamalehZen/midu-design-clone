
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
for (const url of ['https://midu.design/','http://127.0.0.1:8792/']) {
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  const bad=[]; page.on('response',r=>{ if(r.status()>=400) bad.push(r.status()+' '+r.url().slice(0,90)); });
  await page.goto(url,{waitUntil:'load',timeout:120000});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(9000);
  const info=await page.evaluate(()=>{
    const main=document.querySelector('#main');
    function walk(el,path,d,out){ if(d>3) return; const r=el.getBoundingClientRect(); const cs=getComputedStyle(el);
      out.push(path+' '+(el.getAttribute('class')||'').slice(0,22)+' y='+Math.round(r.y+scrollY)+' h='+Math.round(r.height)+' disp='+cs.display+' pos='+cs.position);
      let k=0; for(const c of el.children){ const t=c.tagName.toLowerCase(); if(t==='style'||t==='script'||t==='link')continue; walk(c,path+'.'+k,d+1,out); k++; } }
    const out=[]; walk(main,'0',0,out);
    return {H:document.documentElement.scrollHeight, out};
  });
  await ctx.close();
  console.log('=== '+url+' H='+info.H+' ===');
  info.out.filter(l=>/h=[1-9]\d\d/.test(l)).forEach(l=>console.log('   '+l));
  if(bad.length) console.log('   FAILED:', [...new Set(bad)].slice(0,6).join(' | '));
}
await b.close();
