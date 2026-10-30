
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
const page=await ctx.newPage();
await page.goto('https://midu.design/',{waitUntil:'load',timeout:120000});
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(3000);
const H=await page.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<=H;y+=400){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(130);}
await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
await page.waitForTimeout(3000);
async function goTo(y){ for(let i=0;i<20;i++){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(110); if(Math.abs(await page.evaluate(()=>window.scrollY)-y)<=1) break; } }
const KEY=['#main','#main .framer-b52rkh','#main ul'];
await goTo(0);
const samples=[];
for(let i=0;i<25;i++){
  const s=await page.evaluate(()=>{
    const out=[];
    const main=document.querySelector('#main');
    function walk(el,path){ const cs=getComputedStyle(el); const r=el.getBoundingClientRect();
      out.push([path, el.getAttribute('data-framer-name')||'', cs.transform, cs.opacity, +r.x.toFixed(2), +r.y.toFixed(2), cs.background&&cs.backgroundColor, cs.color]);
      let k=0; for(const c of el.children){ const t=c.tagName.toLowerCase(); if(t==='style'||t==='script'||t==='link')continue; walk(c,path+'.'+k); k++; } }
    walk(main,'0'); return {out, t:performance.now()};
  });
  samples.push(s);
  await page.waitForTimeout(400);
}
await b.close();
// find elements whose style changes over time (no scroll)
const n=Math.min(...samples.map(s=>s.out.length));
const changing=[];
for(let i=0;i<n;i++){
  const vals=new Set();
  for(const s of samples){ const e=s.out[i]; if(!e) continue; vals.add(e[2]+'|'+e[3]+'|'+e[4]+'|'+e[5]+'|'+e[6]); }
  if(vals.size>2){ const e=samples[0].out[i]; changing.push({path:e[0],name:e[1],variants:vals.size,tag:e[0].split('.').length}); }
}
console.log('time-animated elements:',changing.length);
changing.forEach(c=>console.log('  '+c.path+' name='+c.name+' variants='+c.variants+' depth='+c.tag));
// detailed time series for the interesting ones
function series(path){
  const out=[];
  for(const s of samples){ const e=s.out.find(x=>x[0]===path); if(e) out.push({t:+(s.t).toFixed(0),tr:e[2],op:e[3],x:e[4],y:e[5]}); }
  return out;
}
for(const p of ['0.0.0.8.0.0.1.1.0.0.1.4','0.0.0.9']){
  const s=series(p);
  if(!s.length) continue;
  console.log('=== series '+p+' ===');
  s.slice(0,14).forEach(x=>console.log('   t='+x.t+' x='+x.x+' tr='+x.tr.replace(/\s+/g,'')));
}
fs.writeFileSync('/home/node/Ui/_recon/kinetics.json',JSON.stringify(changing,null,1));
