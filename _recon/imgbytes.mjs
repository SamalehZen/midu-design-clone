
import { chromium } from 'playwright-core';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
async function grab(url){
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(url,{waitUntil:'load',timeout:120000});
  await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(2500);
  for(let y=0;y<=11143;y+=400){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(110); }
  await page.waitForTimeout(2500);
  const d=await page.evaluate(()=>[...document.querySelectorAll('#main img')].filter(e=>e.getBoundingClientRect().width>200).map(e=>({cur:e.currentSrc, nw:e.naturalWidth, nh:e.naturalHeight, src:e.getAttribute('src')})));
  await ctx.close(); return {d, base:url};
}
const A=await grab('https://midu.design/'), L=await grab('http://127.0.0.1:8792/');
await b.close();
const md5=(x)=>crypto.createHash('md5').update(x).digest('hex');
for(let i=0;i<A.d.length;i++){
  const a=A.d[i], c=L.d[i];
  let rb=null, lb=null;
  try { rb=execFileSync('curl',['-s','-L','--max-time','60',a.cur],{maxBuffer:64e6}); } catch(e){}
  const lu=/^https?:/.test(c.cur)? c.cur : 'http://127.0.0.1:8792/'+c.cur.replace(/^\.?\//,'');
  try { lb=execFileSync('curl',['-s','-L','--max-time','60',lu],{maxBuffer:64e6}); } catch(e){}
  console.log('#'+i+' nat O='+a.nw+'x'+a.nh+' L='+c.nw+'x'+c.nh);
  console.log('   O '+a.cur);
  console.log('     bytes='+(rb?rb.length:'ERR')+' md5='+(rb?md5(rb):'-'));
  console.log('   L '+c.cur);
  console.log('     bytes='+(lb?lb.length:'ERR')+' md5='+(lb?md5(lb):'-'));
  console.log('   src attr O='+String(a.src).replace('https://framerusercontent.com','')+'\n   src attr L='+c.src);
}
