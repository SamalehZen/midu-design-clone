
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
    return [...document.querySelectorAll('#main img')].map((e,i)=>{ const r=e.getBoundingClientRect(); const ay=r.y+scrollY;
      if(ay<3550||ay>4550) return null;
      const desc=(e.getAttribute('srcset')||'').split(',').map(p=>{const t=p.trim().split(/\s+/); return t[1]||'1x';}).join(' ');
      const sizes=e.getAttribute('sizes');
      return {i, ay:Math.round(ay), w:+r.width.toFixed(2), sizes:sizes, desc:desc, cur:(e.currentSrc||'').split('/').pop(),
        name:(/([A-Za-z0-9]{20,})\.[a-z]+/.exec(e.currentSrc||'')||[])[1]||e.currentSrc};
    }).filter(Boolean);
  });
  await ctx.close(); return d;
}
const A=await grab('https://midu.design/'), L=await grab('http://127.0.0.1:8792/');
await b.close();
console.log('ORIG visible imgs:'+A.length+'  LOCAL:'+L.length);
for(let i=0;i<Math.max(A.length,L.length);i++){
  const a=A[i]||{}, c=L[i]||{};
  const flag=(String(a.desc)!==String(c.desc)||String(a.sizes)!==String(c.sizes))?'  <<< MISMATCH':'';
  console.log('#'+i+' y='+a.ay+'/'+c.ay+'  desc O['+a.desc+'] L['+c.desc+']  sizes O['+a.sizes+'] L['+c.sizes+']'+flag);
  if(flag) console.log('     cur O='+a.cur+'\n     cur L='+c.cur);
}
