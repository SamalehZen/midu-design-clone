
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
const page=await ctx.newPage();
await page.goto(process.argv[2],{waitUntil:'load',timeout:120000});
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(3500);
const H=await page.evaluate(()=>document.documentElement.scrollHeight);
// disable lenis interference: measure with instant jumps and verify actual scrollY
async function goTo(y){
  for(let i=0;i<25;i++){
    await page.evaluate(v=>{ window.scrollTo({top:v,behavior:'instant'}); }, y);
    await page.waitForTimeout(120);
    const cur=await page.evaluate(()=>Math.round(window.scrollY));
    if(Math.abs(cur-y)<=1) return cur;
  }
  return await page.evaluate(()=>Math.round(window.scrollY));
}
const SCROLLS=[];
for(let y=0;y<=H;y+=100) SCROLLS.push(y);
const samples=[];
for(const s of SCROLLS){
  const actual=await goTo(s);
  await page.waitForTimeout(260);
  const data=await page.evaluate(()=>{
    const out={};
    const main=document.querySelector('#main');
    function walk(el,path){
      const r=el.getBoundingClientRect();
      out[path]=[+r.y.toFixed(2),+r.height.toFixed(2),el.getAttribute('style')||''];
      let k=0; for(const c of el.children){ const t=c.tagName.toLowerCase(); if(t==='style'||t==='script'||t==='link')continue; walk(c,path+'.'+k); k++; }
    }
    walk(main,'0');
    return out;
  });
  samples.push({target:s, actual, data});
}
await ctx.close(); await b.close();
fs.writeFileSync('/home/node/Ui/_recon/scrollmap-raw.json', JSON.stringify(samples));
const paths=Object.keys(samples[0].data);
console.log('samples',samples.length,'paths',paths.length,'actuals', samples.map(s=>s.actual).slice(0,8).join(','),'...', samples.map(s=>s.actual).slice(-4).join(','));
// find elements whose inline style changes with scroll
const changing=[];
for(const p of paths){
  const seen=new Set();
  for(const s of samples){ const e=s.data[p]; if(!e) continue; const st=e[2];
    // keep only transform/opacity-relevant declarations
    const key=(st.match(/(transform|opacity|filter)\s*:[^;]*/g)||[]).join('|');
    seen.add(key);
  }
  if(seen.size>2) changing.push({path:p, variants:seen.size, sample:[...seen].slice(0,4)});
}
console.log('elements whose inline transform/opacity varies with scroll:',changing.length);
fs.writeFileSync('/home/node/Ui/_recon/scrollmap.json',JSON.stringify(changing,null,1));
changing.slice(0,25).forEach(c=>console.log('  '+c.path+'  variants='+c.variants));
