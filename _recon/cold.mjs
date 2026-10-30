
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';
const args=['--no-sandbox','--disable-gpu','--hide-scrollbars'];
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args});
async function mk(url){ const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1}); const p=await ctx.newPage(); await p.goto(url,{waitUntil:'load',timeout:120000}); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(3500); return p; }
const H=11143;
async function settle(p){ for(let y=0;y<=H;y+=400){ await p.evaluate(v=>window.scrollTo(0,v),y); await p.waitForTimeout(140);} await p.waitForTimeout(1500); await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(3500); }
function prof(buf){ const p=PNG.sync.read(buf); const out=[]; for(let y=0;y<p.height;y+=60){ let s=0; for(let x=0;x<p.width;x+=4){const i=(y*p.width+x)*4; s+=p.data[i]+p.data[i+1]+p.data[i+2];} out.push(Math.round(s/(p.width/4)/3)); } return out; }
function d2(a,c){ const A=PNG.sync.read(a),B=PNG.sync.read(c); let n=0; for(let i=0;i<A.data.length;i+=4){ const x=Math.abs(A.data[i]-B.data[i])+Math.abs(A.data[i+1]-B.data[i+1])+Math.abs(A.data[i+2]-B.data[i+2]); if(x>6)n++; } return n; }
const cold=await mk('https://midu.design/');
await cold.evaluate(()=>window.scrollTo(0,1800)); await cold.waitForTimeout(4000);
const cbuf=await cold.screenshot();
const warm=await mk('https://midu.design/'); await settle(warm);
await warm.evaluate(()=>window.scrollTo(0,1800)); await warm.waitForTimeout(3000);
const wbuf=await warm.screenshot();
const loc=await mk('http://127.0.0.1:8791/');
await loc.evaluate(()=>window.scrollTo(0,1800)); await loc.waitForTimeout(2500);
const lbuf=await loc.screenshot();
console.log('cold vs warm :', d2(cbuf,wbuf));
console.log('warm vs local:', d2(wbuf,lbuf));
console.log('cold vs local:', d2(cbuf,lbuf));
console.log('cold :', prof(cbuf).join(' '));
console.log('warm :', prof(wbuf).join(' '));
console.log('local:', prof(lbuf).join(' '));
const probe=async(p,label)=>{ const r=await p.evaluate(()=>{
  const out={}; const sec=document.querySelector('.framer-bulukq');
  out.section={t:getComputedStyle(sec).transform, o:getComputedStyle(sec).opacity, y:Math.round(sec.getBoundingClientRect().y),h:Math.round(sec.getBoundingClientRect().height)};
  const h=sec.querySelector('h2'); if(h) out.h2={t:getComputedStyle(h).transform,o:getComputedStyle(h).opacity,y:Math.round(h.getBoundingClientRect().y)};
  const inner=sec.children[0]; if(inner) out.inner={t:getComputedStyle(inner).transform,o:getComputedStyle(inner).opacity,y:Math.round(inner.getBoundingClientRect().y)};
  const kids=[...sec.querySelectorAll('*')].filter(e=>getComputedStyle(e).opacity!=='1').length; out.nonFullOpacity=kids;
  return out; }); console.log(label, JSON.stringify(r)); };
await probe(loc,'LOCAL'); await probe(cold,'COLD '); await probe(warm,'WARM ');
await b.close();
