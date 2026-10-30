
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
const SCROLL=+(process.argv[4]||0);
async function grab(url){
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(url,{waitUntil:'load',timeout:120000});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(3500);
  const H=await page.evaluate(()=>document.documentElement.scrollHeight);
  for(let y=0;y<=H;y+=400){ await page.evaluate(v=>window.scrollTo(0,v),y); await page.waitForTimeout(140); }
  await page.waitForTimeout(1500);
  await page.evaluate(v=>window.scrollTo(0,v),SCROLL);
  await page.waitForTimeout(3000);
  const data=await page.evaluate(()=>{
    const out=[];
    const main=document.querySelector('#main');
    function walk(el,path){
      const r=el.getBoundingClientRect();
      const cs=getComputedStyle(el);
      out.push({p:path,tag:el.tagName.toLowerCase(),cls:(el.getAttribute('class')||''),name:el.getAttribute('data-framer-name')||'',
        x:+r.x.toFixed(2),y:+r.y.toFixed(2),w:+r.width.toFixed(2),h:+r.height.toFixed(2),
        font:cs.fontFamily.split(',')[0], fs:cs.fontSize, txt:(el.children.length===0?(el.textContent||''):'').slice(0,60),
        op:cs.opacity, tr:cs.transform, fil:cs.filter, vis:cs.visibility});
      let k=0;
      for(const c of el.children){ const t=c.tagName.toLowerCase(); if(t==='style'||t==='script'||t==='link')continue; walk(c,path+'.'+k); k++; }
    }
    walk(main,'0');
    return {out,fonts:[...document.fonts].map(f=>f.family+'|'+f.weight+'|'+f.status)};
  });
  await ctx.close();
  return data;
}
const A=await grab(process.argv[2]);
const B=await grab(process.argv[3]);
await b.close();
console.log('nodes', A.out.length, B.out.length);
console.log('fonts orig :', [...new Set(A.fonts)].sort().join(' '));
console.log('fonts local:', [...new Set(B.fonts)].sort().join(' '));
const byPath=new Map(B.out.map(e=>[e.p,e]));
const geo=[],txt=[],font=[];
for(const a of A.out){
  const c=byPath.get(a.p); if(!c) continue;
  const dd=[c.x-a.x,c.y-a.y,c.w-a.w,c.h-a.h];
  if(dd.some(v=>Math.abs(v)>0.06)) geo.push({p:a.p,name:a.name||a.cls.slice(0,24),d:dd.map(v=>+v.toFixed(2)),o:[a.x,a.y,a.w,a.h],l:[c.x,c.y,c.w,c.h]});
  if(a.txt!==c.txt) txt.push({p:a.p,name:a.name,tag:a.tag,o:a.txt.slice(0,40),l:c.txt.slice(0,40)});
  if(a.font!==c.font||a.fs!==c.fs) font.push({p:a.p,name:a.name,o:a.font+' '+a.fs,l:c.font+' '+c.fs});
}
console.log('scrollY='+SCROLL+'  geometry mismatches:',geo.length,' text mismatches:',txt.length,' font mismatches:',font.length);
const sig={}; geo.forEach(g=>{const k=g.d.join(',');sig[k]=(sig[k]||0)+1});
console.log('geo signatures:',JSON.stringify(sig));
geo.slice(0,20).forEach(g=>console.log('  ',g.p,g.name,'d='+g.d.join(','),'orig='+g.o.join(','),'local='+g.l.join(',')));
console.log('--- text ---'); txt.slice(0,10).forEach(t=>console.log('  ',t.p,t.name,'orig='+JSON.stringify(t.o),'local='+JSON.stringify(t.l)));
console.log('--- font ---'); font.slice(0,10).forEach(t=>console.log('  ',t.p,t.name,t.o,'->',t.l));
