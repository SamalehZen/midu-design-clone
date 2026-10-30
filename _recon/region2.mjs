
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
const Y0=10550, Y1=10820;
async function grab(url){
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(url,{waitUntil:'load',timeout:120000});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(3000);
  for(let y=0;y<=11143;y+=400){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(110); }
  for(let i=0;i<25;i++){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),9900); await page.waitForTimeout(100); if(Math.abs(await page.evaluate(()=>window.scrollY)-9900)<=1) break; }
  await page.waitForTimeout(1200);
  const d=await page.evaluate(([y0,y1])=>{
    const AR=['backgroundColor','color','fontSize','fontFamily','fontWeight','opacity','letterSpacing','textAlign','transform','filter','mixBlendMode','borderRadius','backgroundImage','padding','textTransform','lineHeight','webkitTextStrokeColor','webkitTextStrokeWidth','webkitTextFillColor'];
    const out={}; const main=document.querySelector('#main');
    function walk(el,path){ const r=el.getBoundingClientRect(); const ay=r.y+window.scrollY;
      if(ay<y1 && ay+r.height>y0){ const cs=getComputedStyle(el);
        const o={_r:[Math.round(r.x),Math.round(ay),Math.round(r.width),Math.round(r.height)].join(','), _t:(el.children.length===0?(el.textContent||''):''), _tag:el.tagName.toLowerCase(), _cls:(el.getAttribute('class')||''), _n:el.getAttribute('data-framer-name')||''};
        for(const k of AR) o[k]=String(cs[k]).slice(0,70);
        out[path]=o; }
      let i=0; for(const c of el.children){ const t=c.tagName.toLowerCase(); if(t==='style'||t==='script'||t==='link')continue; walk(c,path+'.'+i); i++; } }
    walk(main,'0'); return out;
  },[Y0,Y1]);
  await ctx.close(); return d;
}
const A=await grab('https://midu.design/'), L=await grab('http://127.0.0.1:8792/');
await b.close();
const keys=new Set([...Object.keys(A),...Object.keys(L)]);
let n=0;
for(const k of keys){
  const a=A[k], c=L[k];
  if(!a||!c){ console.log('PATH MISSING '+k+' orig='+(!!a)+' local='+(!!c)); n++; continue; }
  const d=[];
  for(const p of Object.keys(a)) if(String(a[p])!==String(c[p])) d.push(p);
  if(!d.length) continue;
  n++;
  console.log('DIFF '+k+' '+a._tag+' .'+a._cls.split(' ').slice(-1)[0]+' ['+a._n+'] O='+a._r+' L='+c._r);
  for(const p of d) console.log('      '+p+': O='+String(a[p]).slice(0,80)+' | L='+String(c[p]).slice(0,80));
  if(n>14) break;
}
console.log('total differing paths in region:',n);
