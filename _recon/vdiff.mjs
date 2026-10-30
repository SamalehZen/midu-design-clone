
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';
import fs from 'node:fs';

const VW=1200, VH=900;
const args=['--no-sandbox','--disable-gpu','--hide-scrollbars','--force-device-scale-factor=1'];

export async function open(browser,url){
  const ctx=await browser.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:1});
  const page=await ctx.newPage();
  const errs=[]; page.on('pageerror',e=>errs.push(String(e).slice(0,160)));
  await page.goto(url,{waitUntil:'load',timeout:120000});
  try{await page.evaluate(()=>document.fonts.ready);}catch(e){}
  await page.waitForTimeout(3000);
  const H=await page.evaluate(()=>document.documentElement.scrollHeight);
  return {ctx,page,errs,height:H};
}
export async function settle(page,H){
  for(let y=0;y<=H;y+=400){ await page.evaluate(v=>window.scrollTo(0,v),y); await page.waitForTimeout(140); }
  await page.waitForTimeout(1200);
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.waitForTimeout(3500);
}
export function diffBuffers(a,b){
  const A=PNG.sync.read(a), B=PNG.sync.read(b);
  const W=Math.min(A.width,B.width), H=Math.min(A.height,B.height);
  let n=0,sum=0; const row=new Uint16Array(H);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const i=(y*A.width+x)*4, j=(y*B.width+x)*4;
    const d=Math.abs(A.data[i]-B.data[j])+Math.abs(A.data[i+1]-B.data[j+1])+Math.abs(A.data[i+2]-B.data[j+2]);
    sum+=d; if(d>6){n++;row[y]++;}
  }
  return {W,H,n,total:W*H,pct:n/(W*H)*100,mae:sum/(W*H*765),row};
}

const [,,origUrl,localUrl,tag,stepArg]=process.argv;
const STEP=+(stepArg||300);
const browser=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args});
const O=await open(browser,origUrl), L=await open(browser,localUrl);
console.log('heights orig='+O.height+' local='+L.height+' delta='+(L.height-O.height));
const H=Math.min(O.height,L.height);
await settle(O.page,O.height); await settle(L.page,L.height);

let tot=0,totn=0,totmae=0,worst=[];
const shots={};
for(let y=0;y<H;y+=STEP){
  await O.page.evaluate(v=>window.scrollTo(0,v),y); await L.page.evaluate(v=>window.scrollTo(0,v),y);
  await O.page.waitForTimeout(1100); await L.page.waitForTimeout(1100);
  const a=await O.page.screenshot(); const c=await L.page.screenshot();
  // second original shot to detect animated areas
  await O.page.waitForTimeout(900);
  const a2=await O.page.screenshot();
  const d=diffBuffers(a,c); const anim=diffBuffers(a,a2);
  tot+=d.total; totn+=d.n; totmae+=d.mae*d.total;
  worst.push({y,n:d.n,pct:+d.pct.toFixed(3),mae:+d.mae.toFixed(6),animPct:+anim.pct.toFixed(3)});
  if(tag) { fs.writeFileSync('/tmp/o_'+y+'.png',a); fs.writeFileSync('/tmp/l_'+y+'.png',c); }
}
await browser.close();
worst.sort((x,y)=>y.n-x.n);
console.log('=== '+(tag||'vdiff')+' step='+STEP+' ===');
console.log('TOTAL pixels '+totn+' / '+tot+' = '+(totn/tot*100).toFixed(4)+'%   MAE='+(totmae/tot).toFixed(6));
console.log('worst viewports:');
worst.slice(0,14).forEach(w=>console.log('  y='+w.y+'  diff='+w.n+' ('+w.pct+'%)  MAE='+w.mae+'  animInOrig='+w.animPct+'%'));
fs.writeFileSync('/home/node/Ui/_recon/vdiff-'+tag+'.json',JSON.stringify(worst,null,1));
