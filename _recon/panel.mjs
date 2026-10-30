
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
async function grab(url){
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(url,{waitUntil:'load',timeout:120000});
  await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(3000);
  for(let y=0;y<=11143;y+=400){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(110); }
  for(let i=0;i<25;i++){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),9900); await page.waitForTimeout(100); if(Math.abs(await page.evaluate(()=>window.scrollY)-9900)<=1) break; }
  await page.waitForTimeout(1200);
  const d=await page.evaluate(()=>{
    const pts=[[900,750],[900,700],[1100,730],[950,660]];
    const res={};
    for(const [x,y] of pts){
      res[x+','+y]=document.elementsFromPoint(x,y).map(e=>{ const cs=getComputedStyle(e); const r=e.getBoundingClientRect();
        return e.tagName.toLowerCase()+'.'+((e.getAttribute('class')||'').split(' ').filter(c=>/framer-/.test(c)).slice(-1)[0]||'-')+'['+(e.getAttribute('data-framer-name')||'')+'] bg='+cs.backgroundColor+' bgi='+cs.backgroundImage.slice(0,50)+' op='+cs.opacity+' r='+[Math.round(r.x),Math.round(r.y+scrollY),Math.round(r.width),Math.round(r.height)].join(',')+' pe='+cs.pointerEvents; });
    }
    // any element with a non-transparent bg covering x 690-1180 near y 10650
    const hits=[]; 
    for(const e of document.querySelectorAll('body *')){ const cs=getComputedStyle(e); if(cs.backgroundColor==='rgba(0, 0, 0, 0)' && cs.backgroundImage==='none') continue;
      const r=e.getBoundingClientRect(); const ay=r.y+scrollY;
      if(ay<10700 && ay+r.height>10620 && r.x<1180 && r.x+r.width>700 && r.width>50) hits.push(e.tagName.toLowerCase()+' .'+((e.getAttribute('class')||'').split(' ').filter(c=>/framer-/.test(c)).slice(-1)[0]||'-')+' bgi='+cs.backgroundImage.slice(0,60)+' bg='+cs.backgroundColor+' r='+[Math.round(r.x),Math.round(ay),Math.round(r.width),Math.round(r.height)].join(',')); }
    return {res, hits};
  });
  await ctx.close(); return d;
}
const A=await grab('https://midu.design/'), L=await grab('http://127.0.0.1:8792/');
await b.close();
console.log('=== ORIG elementsFromPoint ===');
for(const k of Object.keys(A.res)) console.log(' pt '+k+'\n   '+A.res[k].join('\n   '));
console.log('=== LOCAL elementsFromPoint ===');
for(const k of Object.keys(L.res)) console.log(' pt '+k+'\n   '+L.res[k].join('\n   '));
console.log('=== ORIG bg hits ===');
console.log('   '+(A.hits.join('\n   ')||'none'));
console.log('=== LOCAL bg hits ===');
console.log('   '+(L.hits.join('\n   ')||'none'));
