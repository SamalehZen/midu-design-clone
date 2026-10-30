
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
const page=await ctx.newPage();
await page.goto('https://midu.design/',{waitUntil:'load',timeout:120000});
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(4000);
const H=await page.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<=H;y+=400){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(130); }
await page.waitForTimeout(1500);
await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
await page.waitForTimeout(4000);
const data=await page.evaluate(()=>{
  function ser(el){
    if(el.nodeType===3) return {t:el.nodeValue};
    if(el.nodeType!==1) return null;
    const attrs={};
    for(const a of el.attributes) attrs[a.name]=a.value;
    const kids=[];
    for(const c of el.childNodes){ const s=ser(c); if(s) kids.push(s); }
    return {tag:el.tagName.toLowerCase(), attrs, kids};
  }
  return {
    main: ser(document.querySelector('#main')),
    tpl: ser(document.querySelector('#svg-templates')),
    height: document.documentElement.scrollHeight,
    bodyKids: [...document.body.children].map(c=>c.tagName.toLowerCase()),
  };
});
await ctx.close(); await b.close();
fs.writeFileSync('/home/node/Ui/_recon/dom-live.json', JSON.stringify(data));
console.log('height', data.height, 'bodyKids', data.bodyKids.join(','));
// compare class attributes with the old capture
const old=JSON.parse(fs.readFileSync('/home/node/Ui/_recon/dom.json','utf8'));
let diffs=0, total=0, samples=[];
function walk(a,c,path){
  if(a.t!==undefined||c.t!==undefined) return;
  total++;
  const ca=(a.attrs&&a.attrs.class)||'', cc=(c.attrs&&c.attrs.class)||'';
  if(ca!==cc){ diffs++; if(samples.length<14) samples.push(path+' OLD['+ca+'] NEW['+cc+']'); }
  const ka=(a.kids||[]).filter(x=>x.t===undefined||x.t!==''), kc=(c.kids||[]).filter(x=>x.t===undefined||x.t!=='');
  for(let i=0;i<Math.min(ka.length,kc.length);i++) walk(ka[i],kc[i],path+'.'+i);
}
walk(old.main,data.main,'0');
console.log('elements compared:',total,' class mismatches:',diffs);
samples.forEach(s=>console.log('  '+s));
// also count style diffs
let sdiffs=0;
function walk2(a,c){ if(a.t!==undefined||c.t!==undefined) return;
  const sa=(a.attrs&&a.attrs.style)||'', sc=(c.attrs&&c.attrs.style)||'';
  if(sa!==sc) sdiffs++;
  const ka=(a.kids||[]).filter(x=>x.t===undefined||x.t!==''), kc=(c.kids||[]).filter(x=>x.t===undefined||x.t!=='');
  for(let i=0;i<Math.min(ka.length,kc.length);i++) walk2(ka[i],kc[i]); }
walk2(old.main,data.main);
console.log('style attribute mismatches:',sdiffs);
