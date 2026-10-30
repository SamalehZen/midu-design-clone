
import { chromium } from 'playwright-core';
import { createHash } from 'node:crypto';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
const Y0=10550, Y1=10830;
async function grab(url,label){
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(url,{waitUntil:'load',timeout:120000});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(3000);
  for(let y=0;y<=11143;y+=400){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(110); }
  for(let i=0;i<25;i++){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),9900); await page.waitForTimeout(100); if(Math.abs(await page.evaluate(()=>window.scrollY)-9900)<=1) break; }
  await page.waitForTimeout(1200);
  const d=await page.evaluate(([y0,y1])=>{
    const out=[]; const main=document.querySelector('#main');
    function walk(el,path){ const r=el.getBoundingClientRect(); const ay=r.y+window.scrollY;
      if(ay<y1 && ay+r.height>y0 && r.width>0){
        out.push({p:path,tag:el.tagName.toLowerCase(),cls:(el.getAttribute('class')||''),n:el.getAttribute('data-framer-name')||'',
          r:[Math.round(r.x),Math.round(ay),Math.round(r.width),Math.round(r.height)].join(','),
          h:el.innerHTML.slice(0,900)}); }
      let i=0; for(const c of el.children){ const t=c.tagName.toLowerCase(); if(t==='style'||t==='script'||t==='link')continue; walk(c,path+'.'+i); i++; } }
    walk(main,'0'); return out;
  },[Y0,Y1]);
  await ctx.close(); return d;
}
const A=await grab('https://midu.design/'), L=await grab('http://127.0.0.1:8792/');
await b.close();
const am=new Map(A.map(e=>[e.p,e])), lm=new Map(L.map(e=>[e.p,e]));
const H=(s)=>createHash('sha1').update(s).digest('hex').slice(0,10);
for(const [p,a] of am){
  const c=lm.get(p);
  if(!c){ console.log('MISSING LOCAL '+p); continue; }
  const ha=H(a.h), hc=H(c.h);
  if(ha===hc) continue;
  console.log('CONTENT DIFF '+p+' <'+a.tag+'> .'+a.cls.split(' ').slice(-1)[0]+' ['+a.n+'] '+a.r+' vs '+c.r+'  len '+a.h.length+'/'+c.h.length);
  console.log('   O: '+a.h.replace(/\s+/g,' ').slice(0,300));
  console.log('   L: '+c.h.replace(/\s+/g,' ').slice(0,300));
}
