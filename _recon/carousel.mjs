
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
const page=await ctx.newPage();
await page.goto('https://midu.design/',{waitUntil:'load',timeout:120000});
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(3000);
const H=await page.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<=H;y+=400){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(120);}
async function goTo(y){ for(let i=0;i<20;i++){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(110); if(Math.abs(await page.evaluate(()=>window.scrollY)-y)<=1) break; } }
// reviews carousel region ~5400
await goTo(5400); await page.waitForTimeout(2500);
const rev=[];
for(let i=0;i<80;i++){
  const s=await page.evaluate(()=>{
    const track=document.querySelector('[data-framer-name="ReviewsCarousel"]');
    const cards=[...document.querySelectorAll('[data-framer-name="FirstReviewBody"]')];
    const vis=cards.map(c=>{const r=c.getBoundingClientRect(); return +r.x.toFixed(2);});
    const ids=cards.map(c=>(c.textContent||'').trim().slice(0,14));
    return {t:performance.now(), trackTr:track?getComputedStyle(track).transform:'-', vis, ids, sy:Math.round(window.scrollY)};
  });
  rev.push(s); await page.waitForTimeout(300);
}
console.log('=== REVIEWS CAROUSEL (y=5400) ===');
rev.slice(0,30).forEach(r=>console.log('  t='+r.t.toFixed(0)+' track='+r.trackTr.replace(/\s+/g,'')+' cardsX='+r.vis.join(',')+' ids='+r.ids.map(x=>x.slice(0,8)).join('|')));
// logos strip ~6373
await goTo(6300); await page.waitForTimeout(2000);
const log=[];
for(let i=0;i<40;i++){
  const s=await page.evaluate(()=>{
    const uls=[...document.querySelectorAll('#main ul')];
    const u=uls[uls.length-1];
    const items=u?[...u.children].map(c=>{const r=c.getBoundingClientRect(); return +r.x.toFixed(2);}):[];
    return {t:performance.now(), tr:u?getComputedStyle(u).transform:'-', items:items.slice(0,6), n:items.length};
  });
  log.push(s); await page.waitForTimeout(300);
}
console.log('=== LOGO STRIP (y=6300) ===');
log.slice(0,20).forEach(r=>console.log('  t='+r.t.toFixed(0)+' tr='+r.tr.replace(/\s+/g,'')+' items='+r.items.join(',')+' n='+r.n));
await b.close();
