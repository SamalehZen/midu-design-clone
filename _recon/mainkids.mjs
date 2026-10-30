
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu']});
const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
const page=await ctx.newPage();
await page.goto('https://midu.design/',{waitUntil:'load',timeout:90000});
await page.waitForTimeout(8000);
const info=await page.evaluate(()=>{
  const main=document.querySelector('#main');
  const kids=[...main.children].map(c=>({tag:c.tagName.toLowerCase(), cls:(c.getAttribute('class')||'').slice(0,50), name:c.getAttribute('data-framer-name')||'', n:c.children.length}));
  return {kids, childNodes: main.childNodes.length, nodeTypes:[...main.childNodes].map(n=>n.nodeType+':'+(n.nodeName||''))};
});
console.log(JSON.stringify(info,null,1));
await b.close();
