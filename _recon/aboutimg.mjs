
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
for (const url of ['https://midu.design/','http://127.0.0.1:8792/']) {
const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
const page=await ctx.newPage();
await page.goto(url,{waitUntil:'load',timeout:120000});
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(3000);
const H=await page.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<=H;y+=400){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(120); }
await page.waitForTimeout(1500);
console.log('=== '+url+' ===');
const el=await page.evaluate(()=>{
  const e=document.querySelector('[data-framer-name="AboutBrandImage"]');
  if(!e) return null;
  const cs=getComputedStyle(e);
  return {cls:e.getAttribute('class'), pos:cs.position, l:cs.left, r:cs.right, t:cs.top, b:cs.bottom, w:cs.width, h:cs.height, tr:cs.transform, transformOrigin:cs.transformOrigin, parentCls:e.parentElement.getAttribute('class'), parentName:e.parentElement.getAttribute('data-framer-name'), parentRect:JSON.stringify(e.parentElement.getBoundingClientRect())};
});
console.log('  base:',JSON.stringify(el));
for(const s of [0,600,1200,1500,1800,2100,2400,2700,3000]){
  for(let i=0;i<20;i++){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),s); await page.waitForTimeout(110); if(Math.abs(await page.evaluate(()=>window.scrollY)-s)<=1) break; }
  await page.waitForTimeout(500);
  const r=await page.evaluate(()=>{ const e=document.querySelector('[data-framer-name="AboutBrandImage"]'); const b=e.getBoundingClientRect(); return {tr:getComputedStyle(e).transform.replace(/\s+/g,''), inline:(e.getAttribute('style')||'').match(/transform[^;]*/)||'', x:+b.x.toFixed(2),y:+b.y.toFixed(2),w:+b.width.toFixed(2),h:+b.height.toFixed(2)}; });
  console.log('  sy='+s+' tr='+r.tr+' rect='+r.x+','+r.y+' '+r.w+'x'+r.h+(r.inline[0]?(' inline='+r.inline[0]):''));
}
await ctx.close();
}
await b.close();
