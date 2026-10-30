
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
async function grab(url){
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(url,{waitUntil:'load',timeout:120000});
  await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(2500);
  for(let y=0;y<=11143;y+=400){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(110); }
  for(let i=0;i<25;i++){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),3600); await page.waitForTimeout(100); if(Math.abs(await page.evaluate(()=>window.scrollY)-3600)<=1) break; }
  await page.waitForTimeout(1200);
  const d=await page.evaluate(()=>{
    const sy=window.scrollY, dpr=window.devicePixelRatio;
    const imgs=[...document.querySelectorAll('#main img')].filter(e=>e.getBoundingClientRect().width>200).map(e=>{const r=e.getBoundingClientRect();return {y:r.y, x:r.x, w:r.width, h:r.height, name:(e.currentSrc||'').split('/').pop().slice(0,16)};});
    const doc=document.documentElement.getBoundingClientRect();
    return {sy, dpr, ih:window.innerHeight, iw:window.innerWidth, docH:document.documentElement.scrollHeight, docW:doc.width, imgs};
  });
  await ctx.close(); return d;
}
const A=await grab('https://midu.design/'), L=await grab('http://127.0.0.1:8792/');
await b.close();
console.log('ORIG  sy='+A.sy+' dpr='+A.dpr+' inner='+A.iw+'x'+A.ih+' doc='+A.docW+'x'+A.docH);
console.log('LOCAL sy='+L.sy+' dpr='+L.dpr+' inner='+L.iw+'x'+L.ih+' doc='+L.docW+'x'+L.docH);
console.log('ORIG imgs:'); A.imgs.forEach(i=>console.log('   y='+i.y.toFixed(6)+' x='+i.x.toFixed(6)+' '+i.w.toFixed(6)+'x'+i.h.toFixed(6)+' '+i.name));
console.log('LOCAL imgs:'); L.imgs.forEach(i=>console.log('   y='+i.y.toFixed(6)+' x='+i.x.toFixed(6)+' '+i.w.toFixed(6)+'x'+i.h.toFixed(6)+' '+i.name));
