
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const b = await chromium.launch({ executablePath: '/home/node/chrome-run.sh', args: ['--no-sandbox','--disable-gpu'] });
const ctx = await b.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto('https://midu.design/', { waitUntil:'networkidle', timeout: 90000 });
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(12000);
const info = await page.evaluate(() => {
  const out=[];
  // top-level sections under main
  const walk=(el,d)=>{
    if(d>3) return;
    for(const c of el.children){
      const r=c.getBoundingClientRect();
      const name=c.getAttribute('data-framer-name');
      if(r.height>60) out.push({d, tag:c.tagName.toLowerCase(), name, id:c.id, y:Math.round(r.y+scrollY), h:Math.round(r.height), w:Math.round(r.width), cls:(c.className||'').toString().slice(0,60)});
      walk(c,d+1);
    }
  };
  walk(document.body,0);
  const canv=[...document.querySelectorAll('canvas')].map(c=>({w:c.width,h:c.height,cls:c.className.toString().slice(0,40)}));
  const vids=[...document.querySelectorAll('video')].map(v=>({src:(v.currentSrc||v.src).slice(-60), w:Math.round(v.getBoundingClientRect().width), h:Math.round(v.getBoundingClientRect().height)}));
  const imgs=[...document.querySelectorAll('img')].map(i=>({src:i.currentSrc.slice(-50), w:Math.round(i.getBoundingClientRect().width), h:Math.round(i.getBoundingClientRect().height)}));
  return {height: document.documentElement.scrollHeight, out, canv, vids, imgs};
});
fs.writeFileSync('/home/node/Ui/_recon/home-outline.json', JSON.stringify(info,null,1));
console.log('height', info.height, 'nodes', info.out.length, 'canvas', info.canv.length, 'video', info.vids.length, 'img', info.imgs.length);
await page.screenshot({ path: '/home/node/Ui/_recon/home-full.png', fullPage: true });
await b.close();
