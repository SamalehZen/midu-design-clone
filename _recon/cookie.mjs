
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
const page=await ctx.newPage();
await page.goto('https://midu.design/',{waitUntil:'load',timeout:120000});
await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(7000);
const r=await page.evaluate(()=>{
  const el=document.querySelector('[class*="framer-cookie-banner"]');
  if(!el) return {found:false};
  const parent=el.parentElement;
  function dump(e,d){ const cs=getComputedStyle(e); const b=e.getBoundingClientRect();
    const props=['position','top','left','right','bottom','width','height','backgroundColor','color','display','flexDirection','justifyContent','alignItems','gap','padding','margin','borderRadius','fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','textAlign','boxShadow','border','zIndex','opacity','transform','cursor','pointerEvents','maxWidth','minHeight','backdropFilter'];
    const o={}; for(const p of props) o[p]=cs[p];
    return ' '.repeat(d)+'<'+e.tagName.toLowerCase()+' class="'+(e.getAttribute('class')||'')+'"'+(e.id?' id="'+e.id+'"':'')+'> rect='+[Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)].join(',')+'\n'+' '.repeat(d+2)+JSON.stringify(o)+'\n'+' '.repeat(d+2)+'TEXT='+JSON.stringify(e.children.length? '' : e.textContent); }
  let out=''; (function w(e,d){ out+=dump(e,d)+'\n'; for(const c of e.children) w(c,d+2); })(el,0);
  return {found:true, out, parentHTML:parent.outerHTML.slice(0,220), parentCls:parent.getAttribute('class'), sib:[...parent.children].map(c=>c.tagName+'.'+(c.getAttribute('class')||'')), cookies:document.cookie, ls:Object.keys(localStorage)};
});
console.log('found:',r.found,' parentCls:',r.parentCls);
console.log(' parent.siblings:',(r.sib||[]).join(' | '));
console.log(' cookies:',r.cookies,' localStorage:',(r.ls||[]).join(','));
console.log(r.out);
await b.close();
