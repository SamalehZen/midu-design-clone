
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/home/node/chrome-run.sh', args: ['--no-sandbox','--disable-gpu','--font-render-hinting=none'] });
const ctx = await b.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errs=[]; page.on('pageerror',e=>errs.push(String(e)));
const reqs=[]; page.on('request',r=>reqs.push(r.url()));
const resp = await page.goto('https://midu.design/', { waitUntil:'networkidle', timeout: 90000 });
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(12000);
const info = await page.evaluate(() => {
  const secs=[...document.querySelectorAll('section, header, footer, main > div, [data-framer-name]')].slice(0,200).map(el=>{
    const r=el.getBoundingClientRect();
    return {tag:el.tagName.toLowerCase(), name: el.getAttribute('data-framer-name'), id: el.id, cls: (el.className||'').toString().slice(0,80), y: Math.round(r.y+scrollY), h: Math.round(r.height), w: Math.round(r.width)};
  }).filter(s=>s.h>40);
  const media=[...document.querySelectorAll('img,video,canvas,svg')].length;
  const canv=[...document.querySelectorAll('canvas')].map(c=>({w:c.width,h:c.height,cls:c.className}));
  const vids=[...document.querySelectorAll('video')].map(v=>({src:v.currentSrc||v.src, w:v.getBoundingClientRect().width, h:v.getBoundingClientRect().height, loop:v.loop, muted:v.muted}));
  const fonts=[...new Set([...document.querySelectorAll('*')].slice(0,4000).map(e=>getComputedStyle(e).fontFamily))].slice(0,20);
  return { title: document.title, height: document.documentElement.scrollHeight, secs: secs.slice(0,80), media, canv, vids, fonts };
});
console.log(JSON.stringify({status: resp.status(), errs: errs.slice(0,5), nreq: reqs.length, ...info}, null, 1));
await b.close();
