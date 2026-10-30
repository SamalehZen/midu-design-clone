
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
const Y0=10550, Y1=10800, X0=650, X1=1200;
async function grab(url){
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(url,{waitUntil:'load',timeout:120000});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(3000);
  for(let y=0;y<=11143;y+=400){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(110); }
  for(let i=0;i<25;i++){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),9900); await page.waitForTimeout(100); if(Math.abs(await page.evaluate(()=>window.scrollY)-9900)<=1) break; }
  await page.waitForTimeout(1200);
  const d=await page.evaluate(([y0,y1,x0,x1])=>{
    const out=[]; const main=document.querySelector('#main');
    function walk(el,path){ const r=el.getBoundingClientRect(); const ay=r.y+window.scrollY, ax=r.x;
      if(ay<y1 && ay+r.height>y0 && ax<x1 && ax+r.width>x0){
        const cs=getComputedStyle(el);
        out.push({p:path,tag:el.tagName.toLowerCase(),cls:(el.getAttribute('class')||'').slice(0,60),name:el.getAttribute('data-framer-name')||'',
          r:[Math.round(ax),Math.round(ay),Math.round(r.width),Math.round(r.height)].join(','),
          txt:(el.children.length===0?(el.textContent||'').slice(0,40):''),
          bg:cs.backgroundColor, bgImg:cs.backgroundImage.slice(0,60), col:cs.color, op:cs.opacity, fs:cs.fontSize, ff:cs.fontFamily.split(',')[0], bd:cs.backdropFilter, fil:cs.filter,
          border:cs.borderWidth+' '+cs.borderColor});
      }
      let i=0; for(const c of el.children){ const t=c.tagName.toLowerCase(); if(t==='style'||t==='script'||t==='link')continue; walk(c,path+'.'+i); i++; } }
    walk(main,'0'); return out;
  },[Y0,Y1,X0,X1]);
  await ctx.close(); return d;
}
const A=await grab('https://midu.design/'), L=await grab('http://127.0.0.1:8792/');
await b.close();
console.log('ORIG elements in region:',A.length,' LOCAL:',L.length);
A.slice(0,18).forEach(e=>console.log('  O '+e.p+' '+e.cls.slice(0,34)+' ['+e.name+'] '+e.r+' bg='+e.bg+' img='+(e.bgImg.slice(0,40))+' txt='+JSON.stringify(e.txt)+' op='+e.op+' ff='+e.ff));
console.log('---');
L.slice(0,18).forEach(e=>console.log('  L '+e.p+' '+e.cls.slice(0,34)+' ['+e.name+'] '+e.r+' bg='+e.bg+' img='+(e.bgImg.slice(0,40))+' txt='+JSON.stringify(e.txt)+' op='+e.op+' ff='+e.ff));
