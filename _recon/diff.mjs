
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';
import fs from 'node:fs';

const VW=1200, VH=900;
const args=['--no-sandbox','--disable-gpu','--hide-scrollbars','--force-device-scale-factor=1'];

async function settleAndShoot(browser, url, shot, { settle=true, geomSel=null } = {}){
  const ctx=await browser.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:1});
  const page=await ctx.newPage();
  const errs=[]; page.on('pageerror',e=>errs.push(String(e).slice(0,200)));
  await page.goto(url,{waitUntil:'load',timeout:90000});
  try{ await page.evaluate(()=>document.fonts.ready); }catch(e){}
  await page.waitForTimeout(3000);
  const H=await page.evaluate(()=>document.documentElement.scrollHeight);
  if(settle){
    for(let y=0;y<=H;y+=400){ await page.evaluate(v=>window.scrollTo(0,v),y); await page.waitForTimeout(150); }
    await page.waitForTimeout(2000);
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.waitForTimeout(4000);
  }
  const geom = geomSel? await page.evaluate((sel)=>{
    const out={};
    for(const s of sel){ const e=document.querySelector(s); if(!e){out[s]=null;continue;} const r=e.getBoundingClientRect(); out[s]={x:+r.x.toFixed(2),y:+(r.y+window.scrollY).toFixed(2),w:+r.width.toFixed(2),h:+r.height.toFixed(2)}; }
    return out;
  }, geomSel) : null;
  const height=await page.evaluate(()=>document.documentElement.scrollHeight);
  await page.screenshot({path:shot,fullPage:true,animations:'disabled'});
  await ctx.close();
  return {height, errs, geom};
}

function diffPNG(a,b){
  const A=PNG.sync.read(fs.readFileSync(a)), B=PNG.sync.read(fs.readFileSync(b));
  const W=Math.min(A.width,B.width), H=Math.min(A.height,B.height);
  let n=0,sum=0;
  const rowDiff=new Array(H).fill(0);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const i=(y*A.width+x)*4, j=(y*B.width+x)*4;
    const d=Math.abs(A.data[i]-B.data[j])+Math.abs(A.data[i+1]-B.data[j+1])+Math.abs(A.data[i+2]-B.data[j+2]);
    sum+=d; if(d>6){n++;rowDiff[y]++;}
  }
  return {W,H,total:W*H,diff:n,pct:n/(W*H)*100,mae:sum/(W*H*765),rowDiff,A,B};
}

const [,,origUrl, localUrl, tag]=process.argv;
const browser=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args});
const SEL=['#main','#hero','.framer-bulukq','.framer-10h9rgl','.framer-1c3gczv','.framer-aef8d','.framer-1xnxnjn','.framer-ju84um'];
const o=await settleAndShoot(browser,origUrl,'/home/node/Ui/_recon/diff-orig.png',{geomSel:SEL});
const l=await settleAndShoot(browser,localUrl,'/home/node/Ui/_recon/diff-local.png',{geomSel:SEL});
await browser.close();
const d=diffPNG('/home/node/Ui/_recon/diff-orig.png','/home/node/Ui/_recon/diff-local.png');
console.log('=== '+tag+' ===');
console.log('orig h='+o.height+' local h='+l.height+' (delta '+(l.height-o.height)+')');
console.log('pixels: '+d.diff+' / '+d.total+' = '+d.pct.toFixed(4)+'%   MAE='+d.mae.toFixed(6));
console.log('orig errs', o.errs.length, 'local errs', l.errs.length, l.errs.slice(0,3));
console.log('geom deltas:');
for(const s of SEL){ const a=o.geom[s], b=l.geom[s]; if(!a||!b){ console.log('  '+s, a?'':'(missing orig)', b?'':'(missing local)'); continue; }
  const dd=[b.x-a.x,b.y-a.y,b.w-a.w,b.h-a.h];
  if(dd.some(v=>Math.abs(v)>0.01)) console.log('  '+s+' dx='+dd[0]+' dy='+dd[1]+' dw='+dd[2]+' dh='+dd[3]); }
// band histogram
const bands=[]; const BH=100;
for(let y=0;y<d.H;y+=BH){ let s=0; for(let k=y;k<Math.min(d.H,y+BH);k++) s+=d.rowDiff[k]; bands.push({y,pct:(s/(Math.min(d.H,y+BH)-y)/d.W*100)}); }
console.log('bands with >1% diff:');
bands.filter(b=>b.pct>1).forEach(b=>console.log('  y='+b.y+'  '+b.pct.toFixed(2)+'%'));
