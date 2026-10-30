
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
async function prep(url){
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(url,{waitUntil:'load',timeout:120000});
  await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(2500);
  for(let y=0;y<=11143;y+=400){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(110); }
  await page.waitForTimeout(1200); return page;
}
const O=await prep('https://midu.design/'), L=await prep('http://127.0.0.1:8792/');
for(const p of [O,L]) for(let i=0;i<25;i++){ await p.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),3600); await p.waitForTimeout(100); if(Math.abs(await p.evaluate(()=>window.scrollY)-3600)<=1) break; }
await O.waitForTimeout(600); await L.waitForTimeout(600);
const a=PNG.sync.read(await O.screenshot()), c=PNG.sync.read(await L.screenshot());
const X0=100,Y0=400,PW=240,PH=240;
function diffAt(dx,dy){ let s=0; for(let y=0;y<PH;y++) for(let x=0;x<PW;x++){
  const ax=X0+x, ay=Y0+y; const i=(ay*1200+ax)*4; const j=((ay+dy)*1200+(ax+dx))*4;
  s+=Math.abs(a.data[i]-c.data[j])+Math.abs(a.data[i+1]-c.data[j+1])+Math.abs(a.data[i+2]-c.data[j+2]); } return s/(PW*PH*3); }
console.log('shift fit (patch 240x240 at '+X0+','+Y0+'), mean |delta| per channel:');
for(let dy=-3;dy<=3;dy++){ const row=[]; for(let dx=-3;dx<=3;dx++) row.push(diffAt(dx,dy).toFixed(2).padStart(6)); console.log('  dy='+String(dy).padStart(3)+' '+row.join('')); }
console.log('best = min above');
// raw sample of a 6x6 patch
console.log('raw pixels (ORIG -> LOCAL) at a row with diffs:');
for(let y=Y0;y<Y0+240;y++){ let n=0; for(let x=X0;x<X0+PW;x++){ const i=(y*1200+x)*4; const d=Math.abs(a.data[i]-c.data[i])+Math.abs(a.data[i+1]-c.data[i+1])+Math.abs(a.data[i+2]-c.data[i+2]); if(d>6)n++; }
  if(n>0){ console.log('  row '+y+' differing='+n); let shown=0; for(let x=X0;x<X0+PW&&shown<4;x++){ const i=(y*1200+x)*4; const d=Math.abs(a.data[i]-c.data[i])+Math.abs(a.data[i+1]-c.data[i+1])+Math.abs(a.data[i+2]-c.data[i+2]); if(d>6){ console.log('     x='+x+' O=('+a.data[i]+','+a.data[i+1]+','+a.data[i+2]+') L=('+c.data[i]+','+c.data[i+1]+','+c.data[i+2]+')'); shown++; } } if(shown) break; } }
await b.close();
