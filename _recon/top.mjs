
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const b = await chromium.launch({ executablePath: '/home/node/chrome-run.sh', args: ['--no-sandbox','--disable-gpu'] });
const ctx = await b.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto('https://midu.design/', { waitUntil:'networkidle', timeout: 90000 });
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(4000);
const top = await page.evaluate(()=>[...document.body.children].map(e=>{const r=e.getBoundingClientRect(); return {tag:e.tagName.toLowerCase(), id:e.id, cls:(e.className||'').toString().slice(0,70), y:Math.round(r.y+scrollY), h:Math.round(r.height), kids:e.children.length}}));
fs.writeFileSync('/home/node/Ui/_recon/top.json', JSON.stringify(top,null,1));
await b.close();
