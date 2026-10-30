
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
async function probe(url,label){
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(url,{waitUntil:'load',timeout:90000});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(3000);
  const H=await page.evaluate(()=>document.documentElement.scrollHeight);
  for(let y=0;y<=H;y+=400){ await page.evaluate(v=>window.scrollTo(0,v),y); await page.waitForTimeout(120); }
  await page.waitForTimeout(1500);
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.waitForTimeout(3000);
  const info=await page.evaluate(()=>{
    const out=[];
    const els=[...document.querySelectorAll('#main *')];
    for(const e of els){
      const r=e.getBoundingClientRect();
      const absY=r.y+window.scrollY;
      if(absY>1140 && absY<1240 && r.width>200 && r.height>10 && e.children.length===0){
        const cs=getComputedStyle(e);
        out.push({tag:e.tagName.toLowerCase(), cls:(e.getAttribute('class')||'').slice(0,40), y:Math.round(absY), op:cs.opacity, vis:cs.visibility, disp:cs.display, color:cs.color, txt:(e.textContent||'').trim().slice(0,30), inl:(e.getAttribute('style')||'').slice(0,120), chain:(()=>{let n=e,acc=[];while(n&&n.id!=='main'){const c=getComputedStyle(n);acc.push(n.tagName.toLowerCase()+':'+c.opacity+':f'+c.filter.slice(0,20));n=n.parentElement;}return acc.slice(0,5).join(' | ')})()});
      }
    }
    return {out, scrollH:document.documentElement.scrollHeight};
  });
  console.log('--- '+label+' ---');
  for(const o of info.out.slice(0,6)) console.log(JSON.stringify(o));
  await ctx.close();
}
await probe(process.argv[2],'ORIG');
await probe(process.argv[3],'LOCAL');
await b.close();
