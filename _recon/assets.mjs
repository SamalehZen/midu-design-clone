
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const b = await chromium.launch({ executablePath: '/home/node/chrome-run.sh', args: ['--no-sandbox','--disable-gpu'] });
const ctx = await b.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const assets=[];
page.on('response', async r=>{ const u=r.url(); const t=r.headers()['content-type']||''; assets.push({u, s:r.status(), t, len:r.headers()['content-length']||''}); });
await page.goto('https://midu.design/', { waitUntil:'networkidle', timeout: 90000 });
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(8000);
const extra = await page.evaluate(()=>({
  css: [...document.styleSheets].map(s=>({href:s.href, rules:(()=>{try{return s.cssRules.length}catch(e){return -1}})()})),
  fonts: [...document.fonts].map(f=>({family:f.family, weight:f.weight, style:f.style, status:f.status, src:(f.src||'').slice(0,120)})),
  links: [...document.querySelectorAll('link')].map(l=>({rel:l.rel, href:l.href, as:l.as||'', type:l.type||''})),
  scripts: [...document.querySelectorAll('script')].map(s=>({src:s.src||'inline', type:s.type||''})),
}));
fs.writeFileSync('/home/node/Ui/_recon/assets-home.json', JSON.stringify({assets, extra}, null, 1));
console.log('assets', assets.length, 'sheets', extra.css.length, 'fonts', extra.fonts.length, 'scripts', extra.scripts.length);
for (const s of extra.scripts) console.log('SCRIPT', s.src.slice(0,110), s.type);
await b.close();
