
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
const page=await ctx.newPage();
await page.goto('https://midu.design/',{waitUntil:'load',timeout:120000});
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(3500);
const H=await page.evaluate(()=>document.documentElement.scrollHeight);
console.log('height',H);
async function goTo(y){ for(let i=0;i<20;i++){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(90); const c=await page.evaluate(()=>Math.round(window.scrollY)); if(Math.abs(c-y)<=1) return c; } return await page.evaluate(()=>Math.round(window.scrollY)); }
async function snap(){ return page.evaluate(()=>{
  const out={}; const main=document.querySelector('#main');
  function walk(el,path){ const st=el.getAttribute('style')||'';
    const t=(st.match(/(?:^|;)\s*transform\s*:\s*([^;]*)/)||[])[1]||'';
    const o=(st.match(/(?:^|;)\s*opacity\s*:\s*([^;]*)/)||[])[1]||'';
    out[path]=t.trim()+'|'+o.trim();
    let k=0; for(const c of el.children){ const tg=c.tagName.toLowerCase(); if(tg==='style'||tg==='script'||tg==='link')continue; walk(c,path+'.'+k); k++; } }
  walk(main,'0'); return out; }); }
const POS=[]; for(let y=0;y<=3000;y+=100) POS.push(y); for(let y=3400;y<=H;y+=400) POS.push(y);
const up=[], down=[];
for(const p of POS){ const c=await goTo(p); await page.waitForTimeout(420); up.push({t:p,a:c,d:await snap()}); }
for(const p of [...POS].reverse()){ const c=await goTo(p); await page.waitForTimeout(420); down.push({t:p,a:c,d:await snap()}); }
await ctx.close(); await b.close();
fs.writeFileSync('/home/node/Ui/_recon/scrolllink-raw.json',JSON.stringify({up,down,H}));
// classify: element changed between up and down at the same scroll => reversible (scroll-linked)
const byT=new Map(); for(const s of down) byT.set(s.t,s.d);
const paths=Object.keys(up[0].d);
const rev=new Map();
for(const s of up){ const d2=byT.get(s.t); if(!d2) continue;
  for(const p of paths){ const a=s.d[p], c=d2[p]; if(a===undefined||c===undefined) continue;
    if(a!==c){ if(!rev.has(p)) rev.set(p,new Set()); rev.get(p).add(s.t+' :: up['+a+'] down['+c+']'); } }
}
console.log('reversible (scroll-linked) elements:',rev.size);
console.log('sample mismatches:', [...rev.entries()].slice(0,3).map(([k,v])=>k+' -> '+[...v].slice(0,2).join(' ; ')).join('\n  '));
// also collect all elements whose value varies across the up-sweep
const varies=[];
for(const p of paths){ const vals=new Set(); for(const s of up){ if(s.d[p]!==undefined) vals.add(s.d[p]); } if(vals.size>=3) varies.push(p); }
console.log('elements whose inline transform/opacity varies over scroll:',varies.length);
fs.writeFileSync('/home/node/Ui/_recon/scrolllink.json',JSON.stringify({rev:[...rev.keys()],varies},null,1));
