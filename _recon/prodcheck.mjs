
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
const page=await ctx.newPage();
const errs=[], r404=[];
page.on('pageerror',e=>errs.push(String(e).slice(0,140)));
page.on('response',r=>{ if(r.status()>=400) r404.push(r.status()+' '+r.url().slice(-60)); });
await page.goto('https://component.hypeer.cloud/ui/',{waitUntil:'load',timeout:120000});
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(6000);
const r=await page.evaluate(()=>{
  const secs=[...document.querySelectorAll('[data-framer-name]')].map(e=>e.getAttribute('data-framer-name'));
  const banner=document.querySelector('.--framer-cookie-banner-container');
  const sun=document.querySelector('[data-framer-name="IconSun"]');
  return {h:document.documentElement.scrollHeight,
    mainKids:[...document.querySelector('#main').children].length,
    footer:!!document.querySelector('[data-framer-name="Footer"]'),
    banner:!!banner, bannerRect:banner?JSON.stringify(banner.getBoundingClientRect().toJSON()):null,
    sunDisp:sun?getComputedStyle(sun).display:null,
    heroIframe:!!document.querySelector('iframe'),
    clip:document.querySelector('[data-framer-name="AboutBrandImage"]').style.transform,
    fonts:[...document.fonts].filter(f=>f.status==='loaded').length};
});
console.log(JSON.stringify(r,null,1));
console.log('page errors:',errs.length?errs.join(' | '):'none');
console.log('http >=400:',r404.length?r404.join(' | '):'none');
await b.close();
