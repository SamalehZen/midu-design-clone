
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';
const args=['--no-sandbox','--disable-gpu','--hide-scrollbars'];
function d(a,b){ const A=PNG.sync.read(a),B=PNG.sync.read(b); let n=0; for(let i=0;i<A.data.length;i+=4){ const x=Math.abs(A.data[i]-B.data[i])+Math.abs(A.data[i+1]-B.data[i+1])+Math.abs(A.data[i+2]-B.data[i+2]); if(x>6)n++; } return n; }
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args});
async function mk(url){ const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1}); const p=await ctx.newPage(); await p.goto(url,{waitUntil:'load',timeout:120000}); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(3000); return {p,ctx}; }
const O=await mk('https://midu.design/'), L=await mk('http://127.0.0.1:8791/');
const H=11143;
async function settle(p){ for(let y=0;y<=H;y+=400){ await p.evaluate(v=>window.scrollTo(0,v),y); await p.waitForTimeout(140);} await p.waitForTimeout(1500); await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(3500); }
await settle(O.p); await settle(L.p);
for(const y of [1800,2100,5700]){
  await O.p.evaluate(v=>window.scrollTo(0,v),y); await L.p.evaluate(v=>window.scrollTo(0,v),y);
  for(const w of [1200,2500,4000]){
    await O.p.waitForTimeout(w===1200?w:w-1200);
    const a=await O.p.screenshot();
    const a2=await O.p.screenshot();
    await L.p.waitForTimeout(0);
    const c=await L.p.screenshot();
    console.log('y='+y+' wait='+w+'  orig_vs_local diff='+d(a,c)+'  orig_selfanimate='+d(a,a2));
  }
  // also test: what does the original look like at a *cold* load scrolled directly here
}
console.log('--- cold check ---');
const C=await mk('https://midu.design/');
await C.p.evaluate(v=>window.scrollTo(0,v),1800); await C.p.waitForTimeout(4000);
const cold=await C.p.screenshot();
const warm=await O.p.screenshot();
console.log('orig cold-vs-settled at y=1800 diff=', d(cold,warm));
await b.close();
