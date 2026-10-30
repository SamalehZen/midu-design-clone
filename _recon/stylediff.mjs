
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
const PROPS=['backgroundColor','backgroundImage','color','borderTopWidth','borderTopColor','borderTopStyle','borderRadius','boxShadow','opacity','filter','mixBlendMode','transform','clipPath','maskImage','webkitMaskImage','fontFamily','fontSize','fontWeight','letterSpacing','lineHeight','textAlign','padding','margin','justifyContent','alignItems','flexDirection','gap','position','zIndex','overflow','objectFit','aspectRatio','width','height','top','left','right','bottom','display','visibility','textTransform','whiteSpace','textDecorationLine','backgroundSize','backgroundPosition','backdropFilter','isolation','outline'];
async function grab(url,SCROLL){
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(url,{waitUntil:'load',timeout:120000});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(3000);
  const H=await page.evaluate(()=>document.documentElement.scrollHeight);
  for(let y=0;y<=H;y+=400){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(120); }
  for(let i=0;i<25;i++){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),SCROLL); await page.waitForTimeout(110); if(Math.abs(await page.evaluate(()=>window.scrollY)-SCROLL)<=1) break; }
  await page.waitForTimeout(1500);
  const d=await page.evaluate((props)=>{
    const out=[]; const main=document.querySelector('#main');
    function walk(el,path){ const cs=getComputedStyle(el); const r=el.getBoundingClientRect();
      const o={p:path,cls:(el.getAttribute('class')||''),name:el.getAttribute('data-framer-name')||''};
      for(const k of props) o[k]=cs[k];
      o._r=[Math.round(r.x),Math.round(r.y+window.scrollY),Math.round(r.width),Math.round(r.height)].join(',');
      out.push(o);
      let i=0; for(const c of el.children){ const t=c.tagName.toLowerCase(); if(t==='style'||t==='script'||t==='link')continue; walk(c,path+'.'+i); i++; } }
    walk(main,'0'); return out;
  },PROPS);
  await ctx.close(); return d;
}
const SCROLL=+(process.argv[3]||9900);
const A=await grab(process.argv[2],SCROLL);
const L=await grab(process.argv[4],SCROLL);
await b.close();
console.log('elements', A.length, L.length);
const byPath=new Map(L.map(e=>[e.p,e]));
const groups=new Map();
const ANIM=new Set(['transform','opacity','filter']);
for(const a of A){
  const c=byPath.get(a.p); if(!c) continue;
  const diffs=[];
  for(const k of Object.keys(a)){ if(k==='p'||k==='cls'||k==='name') continue;
    if(String(a[k])!==String(c[k])) diffs.push(k); }
  if(!diffs.length) continue;
  const key=diffs.filter(k=>!ANIM.has(k)).join(',')+' ||A:'+diffs.filter(k=>ANIM.has(k)).join(',');
  const cls=a.cls.split(' ').filter(x=>/^(framer-|framer-text)/.test(x)).slice(-1)[0]+' ['+(a.name||'')+']';
  if(!groups.has(key)) groups.set(key,[]);
  groups.get(key).push({cls, a, c, diffs});
}
const arr=[...groups.entries()].sort((x,z)=>z[1].length-x[1].length);
console.log('distinct style-diff signatures:',arr.length);
arr.slice(0,14).forEach(([k,v])=>{
  console.log('--- '+v.length+' elements :: '+k);
  const s=v[0];
  for(const d of s.diffs) console.log('      '+d+': ORIG='+String(s.a[d]).slice(0,90)+' | LOCAL='+String(s.c[d]).slice(0,90));
  console.log('      e.g. '+s.cls+' rect O='+s.a._r+' L='+s.c._r);
});
