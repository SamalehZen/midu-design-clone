
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
const page=await ctx.newPage();
await page.goto('https://midu.design/',{waitUntil:'load',timeout:120000});
await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(7000);
const r=await page.evaluate(()=>{
  const el=document.querySelector('.--framer-cookie-banner-container');
  const chain=[]; let e=el;
  while(e && e!==document.documentElement){ const cs=getComputedStyle(e); const b=e.getBoundingClientRect();
    chain.push(e.tagName.toLowerCase()+'.'+((e.getAttribute('class')||'')||'-')+' pos='+cs.position+' z='+cs.zIndex+' r='+[Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)].join(',')+' disp='+cs.display);
    e=e.parentElement; }
  const txt=el.innerText;
  const inputs=[...el.querySelectorAll('input')].map(i=>({type:i.type,id:i.id,val:i.value,cls:i.className,rect:(()=>{const r=i.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)].join(',')})()}));
  const p=el.querySelectorAll('p');
  const spans=[...el.querySelectorAll('span,a')].map(s=>s.tagName+':'+JSON.stringify(s.textContent)+' color='+getComputedStyle(s).color+' dec='+getComputedStyle(s).textDecorationLine+' href='+(s.getAttribute('href')||''));
  return {chain, txt, inputs, pHtml:[...p].map(x=>x.outerHTML.replace(/></g,'>\n<')).join('\n---\n'), spans, mode:localStorage.getItem('framerCookiesConsentMode')};
});
console.log('=== ancestor chain ===');
console.log(r.chain.join('\n'));
console.log('=== innerText ===\n'+JSON.stringify(r.txt));
console.log('=== inputs ===\n'+JSON.stringify(r.inputs,null,1));
console.log('=== spans/links ===\n'+r.spans.join('\n'));
console.log('=== p html ===\n'+r.pHtml);
console.log('consentMode:',r.mode);
await b.close();
