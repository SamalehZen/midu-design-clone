
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const OUT = '/home/node/Ui/_recon/dom.json';
const b = await chromium.launch({ executablePath: '/home/node/chrome-run.sh', args: ['--no-sandbox','--disable-gpu'] });
const ctx = await b.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto('https://midu.design/', { waitUntil:'networkidle', timeout: 90000 });
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(5000);
const H = await page.evaluate(()=>document.documentElement.scrollHeight);
for (let y=0; y<=H; y+=400){ await page.evaluate(v=>window.scrollTo(0,v), y); await page.waitForTimeout(180); }
await page.waitForTimeout(2500);
await page.evaluate(()=>window.scrollTo(0,0));
await page.waitForTimeout(3500);

const data = await page.evaluate(() => {
  const SKIP_TAGS = new Set(['SCRIPT','STYLE','LINK','META','NOSCRIPT','TEMPLATE']);
  function ser(el){
    if (SKIP_TAGS.has(el.tagName)) return null;
    const attrs = {};
    for (const a of el.attributes) {
      if (a.name === 'data-framer-hydrate-v2') continue;
      attrs[a.name] = a.value;
    }
    const kids = [];
    for (const c of el.childNodes) {
      if (c.nodeType === 3) { if (c.nodeValue && c.nodeValue.length) kids.push({ t: c.nodeValue }); }
      else if (c.nodeType === 1) { const s = ser(c); if (s) kids.push(s); }
    }
    const tag = el.tagName.toLowerCase();
    if (tag === 'iframe') {
      return { tag, attrs, kids: [], placeholder: 'iframe' };
    }
    if (tag === 'dotlottie-player' || tag === 'lottie-player') {
      return { tag: 'lottie', attrs, kids: [], placeholder: 'lottie' };
    }
    return { tag, attrs, kids };
  }
  const main = document.querySelector('#main');
  const tpl = document.querySelector('#svg-templates');
  return { main: ser(main), tpl: tpl ? ser(tpl) : null, height: document.documentElement.scrollHeight };
});
fs.writeFileSync(OUT, JSON.stringify(data));
const count=(n)=> n.kids? 1+n.kids.reduce((a,k)=>a+(k.t?0:count(k)),0):1;
console.log('height', data.height, 'nodes', count(data.main), 'bytes', JSON.stringify(data).length);
await b.close();
