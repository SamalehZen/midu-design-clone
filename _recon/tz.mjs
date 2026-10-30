
import { chromium } from 'playwright-core';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu']});
for (const tz of ['UTC','Europe/London','America/New_York','Asia/Tokyo']) {
  const ctx=await b.newContext({viewport:{width:1200,height:900},timezoneId:tz});
  const page=await ctx.newPage();
  await page.goto('https://midu.design/',{waitUntil:'load',timeout:90000});
  await page.waitForTimeout(6000);
  const t=await page.evaluate(()=>{
    const els=[...document.querySelectorAll('[data-framer-name="LocalTime"]')];
    const vis=(sel)=>[...document.querySelectorAll(sel)].map(e=>getComputedStyle(e).display).join(',');
    return {times: els.map(e=>e.textContent.trim()), sun: vis('[data-framer-name="IconSun"]'), sleep: vis('[data-framer-name="IconSleep"]'), now: new Date().toString(), tz: Intl.DateTimeFormat().resolvedOptions().timeZone};
  });
  console.log(tz, JSON.stringify(t));
  await ctx.close();
}
await b.close();
