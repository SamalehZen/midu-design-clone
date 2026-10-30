
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';
import fs from 'node:fs';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
const page=await ctx.newPage();
await page.goto(process.argv[2]||'https://midu.design/',{waitUntil:'load',timeout:90000});
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(4000);
const H=await page.evaluate(()=>document.documentElement.scrollHeight);
console.log('height',H);
const results=[];
for(let y=0; y<H; y+=900){
  await page.evaluate(v=>window.scrollTo(0,v),y);
  await page.waitForTimeout(2500);
  const a=await page.screenshot();
  await page.waitForTimeout(1600);
  const c=await page.screenshot();
  const A=PNG.sync.read(a), C=PNG.sync.read(c);
  let n=0; let x0=1e9,x1=-1,y0=1e9,y1=-1;
  const W=A.width, HH=A.height;
  for(let yy=0;yy<HH;yy++)for(let xx=0;xx<W;xx++){
    const i=(yy*W+xx)*4, j=(yy*C.width+xx)*4;
    const d=Math.abs(A.data[i]-C.data[j])+Math.abs(A.data[i+1]-C.data[j+1])+Math.abs(A.data[i+2]-C.data[j+2]);
    if(d>6){n++; if(xx<x0)x0=xx; if(xx>x1)x1=xx; if(yy<y0)y0=yy; if(yy>y1)y1=yy;}
  }
  results.push({scrollY:y, diff:n, pct:+(n/(W*HH)*100).toFixed(3), bbox:n?[x0,y0,x1,y1]:null});
  console.log('scrollY='+y, 'animated px='+n, results[results.length-1].pct+'%', n?('bbox x'+x0+'-'+x1+' y'+(y0+y)+'-'+(y1+y)):'');
}
fs.writeFileSync('/home/node/Ui/_recon/animated.json',JSON.stringify(results,null,1));
await b.close();
