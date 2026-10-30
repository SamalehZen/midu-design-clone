
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
async function run(url,label){
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(url,{waitUntil:'load',timeout:120000});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(4000);
  const snap=()=>page.evaluate(()=>{
    const g=(sel)=>{const e=document.querySelector(sel); if(!e) return null; const r=e.getBoundingClientRect(); return {y:Math.round(r.y+window.scrollY), h:Math.round(r.height)};};
    const out={H:document.documentElement.scrollHeight, scrollY:Math.round(window.scrollY)};
    for(const s of ['#hero','.framer-bulukq','.framer-10h9rgl','#services','.framer-aef8d','.framer-1xnxnjn']) out[s]=g(s);
    return out;
  });
  const before=await snap();
  const H=before.H;
  for(let y=0;y<=H;y+=400){ await page.evaluate(v=>window.scrollTo(0,v),y); await page.waitForTimeout(140); }
  await page.waitForTimeout(1500);
  const mid=await snap();
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.waitForTimeout(3500);
  const after=await snap();
  // now test programmatic scroll accuracy
  await page.evaluate(()=>window.scrollTo(0,1800)); await page.waitForTimeout(1500);
  const s1800=await page.evaluate(()=>({scrollY:Math.round(window.scrollY), heroTop:Math.round(document.querySelector('#hero').getBoundingClientRect().y)}));
  console.log('=== '+label+' ===');
  console.log('before', JSON.stringify(before));
  console.log('mid   ', JSON.stringify(mid));
  console.log('after ', JSON.stringify(after));
  console.log('at scrollTo(0,1800):', JSON.stringify(s1800));
  await ctx.close();
}
await run(process.argv[2],'ORIG');
await run(process.argv[3],'LOCAL');
await b.close();
