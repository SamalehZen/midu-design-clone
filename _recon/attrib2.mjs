
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
const S=3600;
async function prep(url){
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(url,{waitUntil:'load',timeout:120000});
  await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(3000);
  for(let y=0;y<=11143;y+=400){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(110); }
  await page.waitForTimeout(1500); return page;
}
const O=await prep('https://midu.design/'), L=await prep('http://127.0.0.1:8792/');
for(const p of [O,L]) for(let i=0;i<25;i++){ await p.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),S); await p.waitForTimeout(100); if(Math.abs(await p.evaluate(()=>window.scrollY)-S)<=1) break; }
await O.waitForTimeout(500); await L.waitForTimeout(500);
const a=PNG.sync.read(await O.screenshot()), c=PNG.sync.read(await L.screenshot());
const pts=[];
for(let y=0;y<900;y+=3) for(let x=0;x<1200;x+=3){ const i=(y*1200+x)*4;
  const d=Math.abs(a.data[i]-c.data[i])+Math.abs(a.data[i+1]-c.data[i+1])+Math.abs(a.data[i+2]-c.data[i+2]);
  if(d>6) pts.push([x,y]); }
const hist=await O.evaluate((list)=>{ const h={};
  for(const [x,y] of list){ const e=document.elementFromPoint(x,y); if(!e) continue;
    let k=e.tagName; if(e.tagName==='IMG'){ const m=/([A-Za-z0-9]{20,})\.[a-z]+/.exec(e.currentSrc||''); k='IMG:'+(m?m[1].slice(0,14):'?')+' nw='+e.naturalWidth+'x'+e.naturalHeight+' disp='+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height); }
    else k=e.tagName+'.'+((e.getAttribute('class')||'').split(' ').filter(x=>/^framer-/.test(x)).slice(-1)[0]||'-')+'['+(e.getAttribute('data-framer-name')||'')+']';
    h[k]=(h[k]||0)+1; }
  return h; },pts);
console.log('=== differing points by element (orig) ===');
Object.entries(hist).sort((p,q)=>q[1]-p[1]).slice(0,8).forEach(([k,v])=>console.log('  '+v+'  '+k));
const info=await Promise.all([O,L].map(p=>p.evaluate(()=>[...document.querySelectorAll('#main img')].filter(e=>{const r=e.getBoundingClientRect();return r.y>-200&&r.y<1100&&r.width>0;}).map(e=>{ const cs=getComputedStyle(e); const chain=[]; let q=e; for(let i=0;i<6&&q;i++){ const c2=getComputedStyle(q); chain.push(((q.getAttribute('class')||'').split(' ').filter(x=>/^framer-/.test(x)).slice(-1)[0]||q.tagName)+':wc='+c2.willChange+',bf='+c2.backfaceVisibility+',iso='+c2.isolation+',tr='+c2.transform+',fi='+c2.filter); q=q.parentElement; }
  const rr=e.getBoundingClientRect(); const disp=rr.width.toFixed(3)+'x'+rr.height.toFixed(3);
  return {name:(e.currentSrc||'').split('/').pop().slice(0,30), nw:e.naturalWidth, nh:e.naturalHeight, complete:e.complete, disp, chain}; })));
console.log('=== ORIG visible imgs ===');
info[0].forEach(i=>console.log('  '+i.name+' nat='+i.nw+'x'+i.nh+' disp='+i.disp+' complete='+i.complete+'\n     '+i.chain.join('\n     ')));
console.log('=== LOCAL visible imgs ===');
info[1].forEach(i=>console.log('  '+i.name+' nat='+i.nw+'x'+i.nh+' disp='+i.disp+' complete='+i.complete));
await b.close();
