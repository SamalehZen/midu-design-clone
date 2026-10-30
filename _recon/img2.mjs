
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
async function grab(url){
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(url,{waitUntil:'load',timeout:120000});
  await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(2500);
  for(let y=0;y<=11143;y+=400){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(110); }
  for(let i=0;i<25;i++){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),3600); await page.waitForTimeout(100); if(Math.abs(await page.evaluate(()=>window.scrollY)-3600)<=1) break; }
  await page.waitForTimeout(1500);
  const d=await page.evaluate(()=>{
    return [...document.querySelectorAll('#main img')].map((e,i)=>{ const r=e.getBoundingClientRect(); const cs=getComputedStyle(e);
      return {i, x:+r.x.toFixed(4), y:+(r.y+scrollY).toFixed(4), w:+r.width.toFixed(4), h:+r.height.toFixed(4),
        of:cs.objectFit, op:cs.objectPosition, ir:cs.imageRendering, filt:cs.filter, mb:cs.mixBlendMode, br:cs.borderRadius, tr:cs.transform, opa:cs.opacity,
        nw:e.naturalWidth, nh:e.naturalHeight, cur:(e.currentSrc||'').split('?')[1]||(e.currentSrc||'').split('/').pop(),
        sz:e.getAttribute('sizes'), ss:(e.getAttribute('srcset')||'').split(',').length}; });
  });
  await ctx.close(); return d;
}
const A=await grab('https://midu.design/'), L=await grab('http://127.0.0.1:8792/');
await b.close();
for(let i=0;i<Math.max(A.length,L.length);i++){
  const a=A[i]||{}, c=L[i]||{};
  const d=[];
  for(const k of ['x','y','w','h']) if(a[k]!==c[k]) d.push(k+' '+a[k]+' vs '+c[k]);
  for(const k of ['of','op','ir','filt','mb','br','tr','opa','nw','nh','sz','ss']) if(String(a[k])!==String(c[k])) d.push(k+' '+String(a[k]).slice(0,40)+' vs '+String(c[k]).slice(0,40));
  if(d.length) console.log('img#'+i+' :: '+d.join(' | '));
}
