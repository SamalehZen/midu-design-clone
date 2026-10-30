
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const b = await chromium.launch({ executablePath: '/home/node/chrome-run.sh', args: ['--no-sandbox','--disable-gpu'] });
const ctx = await b.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto('https://midu.design/', { waitUntil:'networkidle', timeout: 90000 });
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(6000);
const H = await page.evaluate(()=>document.documentElement.scrollHeight);
for (let y=0; y<=H; y+=450){ await page.evaluate(v=>window.scrollTo(0,v), y); await page.waitForTimeout(220); }
await page.waitForTimeout(3000);
await page.evaluate(()=>window.scrollTo(0,0));
await page.waitForTimeout(4000);
const dump = await page.evaluate(()=>{
  const root=document.querySelector('#main');
  return { head: document.head.innerHTML.length, body: document.body.innerHTML.length,
    main: root ? root.outerHTML : null,
    header: document.querySelector('.framer-ju84um')?.outerHTML?.slice(0,500) || null,
    appearIds: document.querySelectorAll('[data-framer-appear-id]').length,
    opacityZero: [...document.querySelectorAll('#main *')].filter(e=>getComputedStyle(e).opacity==='0').length,
    iframes: [...document.querySelectorAll('iframe')].map(f=>({src:f.src, w:Math.round(f.getBoundingClientRect().width), h:Math.round(f.getBoundingClientRect().height), y:Math.round(f.getBoundingClientRect().y+scrollY)})),
    lottie: [...document.querySelectorAll('dotlottie-player, lottie-player')].map(e=>({tag:e.tagName, src:e.getAttribute('src'), w:Math.round(e.getBoundingClientRect().width), h:Math.round(e.getBoundingClientRect().height), y:Math.round(e.getBoundingClientRect().y+scrollY)})),
  };
});
fs.writeFileSync('/home/node/Ui/_recon/home-settled.html', dump.main);
fs.writeFileSync('/home/node/Ui/_recon/home-meta.json', JSON.stringify({bodyLen:dump.body, opacityZero:dump.opacityZero, appearIds:dump.appearIds, iframes:dump.iframes, lottie:dump.lottie}, null, 1));
console.log(JSON.stringify({bodyLen:dump.body, mainLen:dump.main?.length, opacityZero:dump.opacityZero, appearIds:dump.appearIds, iframes:dump.iframes, lottie:dump.lottie}, null, 1));
await b.close();
