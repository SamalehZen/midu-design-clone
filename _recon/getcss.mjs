
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const b = await chromium.launch({ executablePath: '/home/node/chrome-run.sh', args: ['--no-sandbox','--disable-gpu'] });
const ctx = await b.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto('https://midu.design/', { waitUntil:'networkidle', timeout: 90000 });
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(5000);
const res = await page.evaluate(()=>{
  const sheets=[...document.querySelectorAll('style')].map(s=>s.textContent);
  const links=[...document.querySelectorAll('link[rel=stylesheet]')].map(l=>l.href);
  const imgs=[...document.querySelectorAll('img')].map(i=>i.currentSrc||i.src).filter(Boolean);
  const srcsets=[...document.querySelectorAll('img[srcset],source[srcset]')].map(i=>i.srcset);
  const urls=new Set();
  const collect=(txt)=>{ for(const m of txt.matchAll(/url\((['"]?)([^)'"]+)\1\)/g)) urls.add(m[2]); };
  sheets.forEach(collect);
  return {sheets, links, imgs, srcsets, urls:[...urls]};
});
fs.writeFileSync('/home/node/Ui/_recon/css-all.css', res.sheets.join('\n/* --- */\n'));
fs.writeFileSync('/home/node/Ui/_recon/urls.json', JSON.stringify(res,null,1));
console.log('sheets',res.sheets.length,'css bytes',res.sheets.join('').length,'urls',res.urls.length,'imgs',res.imgs.length,'links',res.links);
console.log(res.urls.slice(0,15).join('\n'));
await b.close();
