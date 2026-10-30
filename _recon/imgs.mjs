
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
async function grab(url){
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(url,{waitUntil:'load',timeout:120000});
  await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(2000);
  for(let y=0;y<=11143;y+=400){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(110); }
  await page.waitForTimeout(2000);
  const d=await page.evaluate(()=>{
    const imgs=[...document.querySelectorAll('#main img')].map((e,i)=>({i, src:(e.getAttribute('src')||'').split('/').pop(), srcset:(e.getAttribute('srcset')||'').length,
      sizes:e.getAttribute('sizes')||'', cur:(e.currentSrc||'').split('/').pop(), nw:e.naturalWidth, nh:e.naturalHeight,
      dw:Math.round(e.getBoundingClientRect().width), dh:Math.round(e.getBoundingClientRect().height),
      loading:e.getAttribute('loading')||'', style:(e.getAttribute('style')||'').slice(0,50), cls:(e.getAttribute('class')||'').slice(0,30), alt:(e.alt||'').slice(0,20)}));
    const bgs=[...document.querySelectorAll('#main *')].map(e=>getComputedStyle(e).backgroundImage).filter(v=>v&&v!=='none');
    return {imgs, bgCount:bgs.length, bgSample:bgs.slice(0,4).map(s=>s.slice(0,110))};
  });
  await ctx.close(); return d;
}
const A=await grab('https://midu.design/'), L=await grab('http://127.0.0.1:8792/');
await b.close();
console.log('ORIG imgs:',A.imgs.length,' LOCAL imgs:',L.imgs.length,' bgImages O/L:',A.bgCount+'/'+L.bgCount);
for(let i=0;i<Math.max(A.imgs.length,L.imgs.length);i++){
  const a=A.imgs[i]||{}, c=L.imgs[i]||{};
  const diff=[];
  if(a.nw!==c.nw||a.nh!==c.nh) diff.push('natural '+a.nw+'x'+a.nh+' vs '+c.nw+'x'+c.nh);
  if((a.cur||'').replace(/^.*?-/,'')!==(c.cur||'').replace(/^.*?-/,'')) diff.push('cur '+a.cur+' vs '+c.cur);
  if(a.srcset!==c.srcset) diff.push('srcsetLen '+a.srcset+' vs '+c.srcset);
  if(a.sizes!==c.sizes) diff.push('sizes "'+a.sizes+'" vs "'+c.sizes+'"');
  if(a.dw!==c.dw||a.dh!==c.dh) diff.push('disp '+a.dw+'x'+a.dh+' vs '+c.dw+'x'+c.dh);
  if(a.loading!==c.loading) diff.push('loading '+a.loading+' vs '+c.loading);
  const ratio=a.nw&&a.dw?(a.nw/a.dw).toFixed(2):'-'; const ratio2=c.nw&&c.dw?(c.nw/c.dw).toFixed(2):'-';
  if(diff.length) console.log('img#'+i+' ratio O='+ratio+' L='+ratio2+' :: '+diff.join(' | '));
}
console.log('--- bg images ---');
console.log(A.bgSample.join('\n'));
