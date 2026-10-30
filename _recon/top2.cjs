
const fs=require('fs');
const dom=JSON.parse(fs.readFileSync('/home/node/Ui/_recon/dom.json','utf8'));
console.log('#main kids:');
dom.main.kids.forEach((c,i)=>console.log('  '+i+' tag='+(c.t!==undefined?'TEXT':c.tag)+' class='+((c.attrs&&c.attrs.class)||'').slice(0,60)+' id='+((c.attrs&&c.attrs.id)||'')+' len='+((c.t&&c.t.length)||((c.kids||[]).length))));
console.log('#main attrs:', JSON.stringify(dom.main.attrs).slice(0,400));
const page=dom.main.kids.find(k=>k.t===undefined&&(k.attrs.class||'').includes('framer-W8QJn'));
console.log('page attrs:', JSON.stringify(page.attrs));
console.log('page kids:');
page.kids.forEach((c,i)=>console.log('  '+i+' tag='+c.tag+' class='+(c.attrs.class||'').slice(0,60)+' name='+(c.attrs['data-framer-name']||'')+' id='+(c.attrs.id||'')+' kids='+((c.kids||[]).length)));
