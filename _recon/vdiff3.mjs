
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';
const args=['--no-sandbox','--disable-gpu','--hide-scrollbars'];
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args});
const H=11143, VH=900;
const URLS=process.argv.slice(2,4);
const PORTRAIT=process.argv[4]||'v3';
const MASK_SEL=['iframe','[data-framer-name="ReviewsCarousel"]','[data-framer-name="IconSunAnimation"]','[data-framer-name="IconSleepAnimation"]'];
async function prep(url){
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(url,{waitUntil:'load',timeout:120000});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(3000);
  for(let y=0;y<=H;y+=400){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(120); }
  await page.waitForTimeout(1500);
  return page;
}
async function goTo(page,y){ for(let i=0;i<25;i++){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(110); const c=await page.evaluate(()=>Math.round(window.scrollY)); if(Math.abs(c-y)<=1) return; } }
async function masks(page,y){
  await goTo(page,y);
  return page.evaluate((sel)=>{
    const out=[];
    for(const s of sel) for(const e of document.querySelectorAll(s)){
      const b=e.getBoundingClientRect();
      if(b.width<=0||b.height<=0) continue;
      out.push([b.x,b.y,b.x+b.width,b.y+b.height]);
    }
    // the logo marquee ul: the ul with >=10 children
    for(const u of document.querySelectorAll('#main ul')) if(u.children.length>=10){ const b=u.getBoundingClientRect(); if(b.width>0) out.push([b.x,b.y,b.x+b.width,b.y+b.height]); }
    return out;
  }, MASK_SEL);
}
const O=await prep(URLS[0]);
const L=await prep(URLS[1]);
const ys=[]; for(let y=0;y<=H-VH;y+=450) ys.push(y);
let tot=0,totAll=0,totD=0,rawTot=0;
const rows=[];
for(const y of ys){
  const mo=await masks(O,y); const ml=await masks(L,y);
  await O.waitForTimeout(400); await L.waitForTimeout(400);
  const a=PNG.sync.read(await O.screenshot());
  const c=PNG.sync.read(await L.screenshot());
  const mask=new Uint8Array(a.width*a.height);
  for(const set of [mo,ml]) for(const r of set){
    const x0=Math.max(0,Math.floor(r[0])-4), x1=Math.min(a.width,Math.ceil(r[2])+4);
    const y0=Math.max(0,Math.floor(r[1])-4), y1=Math.min(a.height,Math.ceil(r[3])+4);
    for(let j=y0;j<y1;j++) for(let x=x0;x<x1;x++) mask[j*a.width+x]=1;
  }
  let n=0,sum=0,raw=0,masked=0;
  for(let j=0;j<a.height;j++) for(let x=0;x<a.width;x++){
    const i=(j*a.width+x)*4;
    const d=Math.abs(a.data[i]-c.data[i])+Math.abs(a.data[i+1]-c.data[i+1])+Math.abs(a.data[i+2]-c.data[i+2]);
    if(d>6) raw++;
    if(mask[j*a.width+x]){ masked++; continue; }
    sum+=d; if(d>6) n++;
  }
  const valid=a.width*a.height-masked;
  tot+=n; totD+=sum; rawTot+=raw; totAll+=valid;
  const line=String(y).padStart(6)+String(n).padStart(10)+(100*n/valid).toFixed(2).padStart(8)+'%'+'  raw='+(100*raw/(a.width*a.height)).toFixed(2)+'%  maskedPx='+masked+'  MAE='+(sum/valid/765).toFixed(6);
  console.log(line);
  rows.push(line);
}
console.log('TOTAL masked-out diff: '+tot+' / '+totAll+' = '+(100*tot/totAll).toFixed(3)+'%   MAE='+(totD/totAll/765).toFixed(6));
console.log('TOTAL raw diff:        '+rawTot+' / '+(ys.length*1200*900)+' = '+(100*rawTot/(ys.length*1200*900)).toFixed(3)+'%');
await b.close();
