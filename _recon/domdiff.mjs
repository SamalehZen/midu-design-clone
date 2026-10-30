
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const PROPS=['display','position','fontFamily','fontSize','fontWeight','fontStyle','letterSpacing','lineHeight','color','backgroundColor','backgroundImage','backgroundSize','backgroundPosition','opacity','transform','transformOrigin','filter','backdropFilter','borderRadius','boxShadow','mixBlendMode','maskImage','webkitMaskImage','zIndex','overflow','objectFit','objectPosition','textTransform','textAlign','padding','margin','border','width','height','gap','justifyContent','alignItems','flexDirection','flexShrink','flexGrow','aspectRatio','willChange','visibility','imageRendering','isolation'];

async function grab(browser,url){
  const ctx=await browser.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(url,{waitUntil:'load',timeout:90000});
  try{await page.evaluate(()=>document.fonts.ready);}catch(e){}
  await page.waitForTimeout(3000);
  const H=await page.evaluate(()=>document.documentElement.scrollHeight);
  for(let y=0;y<=H;y+=400){ await page.evaluate(v=>window.scrollTo(0,v),y); await page.waitForTimeout(120); }
  await page.waitForTimeout(1500);
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.waitForTimeout(3000);
  const data=await page.evaluate((PROPS)=>{
    const out=[];
    const main=document.querySelector('#main');
    function walk(el,path,depth){
      const cs=getComputedStyle(el);
      const r=el.getBoundingClientRect();
      const rec={p:path, tag:el.tagName.toLowerCase(), cls:(el.getAttribute('class')||''), name:el.getAttribute('data-framer-name')||'',
        x:+r.x.toFixed(3), y:+(r.y+window.scrollY).toFixed(3), w:+r.width.toFixed(3), h:+r.height.toFixed(3), s:{}};
      for(const k of PROPS) rec.s[k]=cs[k];
      rec.s.text=(el.children.length===0? (el.textContent||'').slice(0,40):'');
      out.push(rec);
      let i=0, k=0;
      for(const c of el.children){ const t=c.tagName.toLowerCase(); if(t==='style'||t==='script'||t==='link') continue; walk(c, path+'.'+k, depth+1); k++; }
    }
    walk(main,'0',0);
    return out;
  },PROPS);
  await ctx.close();
  return data;
}

const browser=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
const [,,origUrl,localUrl]=process.argv;
const A=await grab(browser,origUrl);
const B=await grab(browser,localUrl);
await browser.close();
console.log('orig nodes',A.length,'local nodes',B.length);
fs.writeFileSync('/home/node/Ui/_recon/domdiff-orig.json',JSON.stringify(A));
fs.writeFileSync('/home/node/Ui/_recon/domdiff-local.json',JSON.stringify(B));
const byPath=new Map(B.map(e=>[e.p,e]));
let geo=0, sty=0, missing=0;
const geoList=[], styList=[];
for(const a of A){
  const b=byPath.get(a.p);
  if(!b){ missing++; continue; }
  const d=[b.x-a.x,b.y-a.y,b.w-a.w,b.h-a.h];
  if(d.some(v=>Math.abs(v)>0.05)){ geo++; geoList.push({p:a.p,tag:a.tag,cls:a.cls.slice(0,40),name:a.name,d:d.map(v=>+v.toFixed(2)),a:[a.x,a.y,a.w,a.h],b:[b.x,b.y,b.w,b.h]}); }
  const sd=[];
  for(const k in a.s){ if(a.s[k]!==b.s[k]) sd.push({k,a:String(a.s[k]).slice(0,60),b:String(b.s[k]).slice(0,60)}); }
  if(sd.length){ sty++; styList.push({p:a.p,tag:a.tag,cls:a.cls.slice(0,40),name:a.name,sd}); }
}
console.log('missing in local:',missing,' geometry mismatches:',geo,' style mismatches:',sty);
const gsum={}; for(const g of geoList){ const key=g.d.join(','); gsum[key]=(gsum[key]||0)+1; }
console.log('geometry delta signatures:',JSON.stringify(gsum));
const ssum={}; for(const s of styList){ const key=s.sd.map(x=>x.k).join(','); ssum[key]=(ssum[key]||0)+1; }
console.log('style mismatch keys:',JSON.stringify(ssum));
fs.writeFileSync('/home/node/Ui/_recon/domdiff-report.json',JSON.stringify({geoList,styList},null,1));
console.log('--- first 25 geometry ---');
geoList.slice(0,25).forEach(g=>console.log(' ',g.p,g.tag,g.name||g.cls,'d='+g.d.join(','),'orig='+g.a.join(','),'ours='+g.b.join(',')));
console.log('--- first 30 style ---');
styList.slice(0,30).forEach(s=>console.log(' ',s.p,s.tag,s.name||s.cls,JSON.stringify(s.sd.map(x=>x.k+': '+x.a+' -> '+x.b))));
