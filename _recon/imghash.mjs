
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
async function grab(url){
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(url,{waitUntil:'load',timeout:120000});
  await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(2500);
  for(let y=0;y<=11143;y+=400){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(110); }
  await page.waitForTimeout(2500);
  const d=await page.evaluate(()=>{
    const out=[];
    for(const e of document.querySelectorAll('#main img')){
      const r=e.getBoundingClientRect(); if(!(r.width>200)) continue;
      const cv=document.createElement('canvas'); cv.width=e.naturalWidth; cv.height=e.naturalHeight;
      const cx=cv.getContext('2d'); cx.drawImage(e,0,0);
      const px=cx.getImageData(0,0,cv.width,cv.height).data;
      let s=0; for(let i=0;i<px.length;i+=997) s=(s*31+px[i])>>>0;
      out.push({cur:e.currentSrc, nw:e.naturalWidth, nh:e.naturalHeight, hash:s, first:[px[0],px[1],px[2],px[3],px[400]], mid:[px[(px.length>>1)],px[(px.length>>1)+1],px[(px.length>>1)+2]]});
    }
    return out; });
  await ctx.close(); return d;
}
const A=await grab('https://midu.design/'), L=await grab('http://127.0.0.1:8792/');
await b.close();
for(const x of A) console.log('O hash='+x.hash+' '+x.nw+'x'+x.nh+' first='+x.first.join(',')+' mid='+x.mid.join(',')+'\n   '+x.cur);
for(const x of L) console.log('L hash='+x.hash+' '+x.nw+'x'+x.nh+' first='+x.first.join(',')+' mid='+x.mid.join(',')+'\n   '+x.cur);
