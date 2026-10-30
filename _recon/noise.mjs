
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
async function prep(url){
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(url,{waitUntil:'load',timeout:120000});
  await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(3000);
  for(let y=0;y<=11143;y+=400){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(110); }
  await page.waitForTimeout(1500); return page;
}
const A=await prep(process.argv[2]), B=await prep(process.argv[2]);
for(const S of [1800,3600,4050,6750,9900]){
  for(const p of [A,B]) for(let i=0;i<25;i++){ await p.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),S); await p.waitForTimeout(100); if(Math.abs(await p.evaluate(()=>window.scrollY)-S)<=1) break; }
  await A.waitForTimeout(500); await B.waitForTimeout(500);
  const a=PNG.sync.read(await A.screenshot()), c=PNG.sync.read(await B.screenshot());
  let n=0,sum=0,mx=0;
  for(let i=0;i<a.data.length;i+=4){
    const d=Math.abs(a.data[i]-c.data[i])+Math.abs(a.data[i+1]-c.data[i+1])+Math.abs(a.data[i+2]-c.data[i+2]);
    sum+=d; if(d>6)n++; if(d>mx)mx=d;
  }
  console.log('y='+S+' diffPx='+n+' ('+(100*n/(1200*900)).toFixed(3)+'%) MAE='+(sum/(1200*900)/765).toFixed(6)+' maxd='+mx);
}
await b.close();
