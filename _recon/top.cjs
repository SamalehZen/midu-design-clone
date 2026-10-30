
const fs=require('fs');
const dom=JSON.parse(fs.readFileSync('/home/node/Ui/_recon/dom.json','utf8'));
function desc(n,d){ if(n.t!==undefined) return;
  console.log('  '.repeat(d)+'<'+n.tag+' class='+(n.attrs.class||'').slice(0,44)+' name='+(n.attrs['data-framer-name']||'')+' id='+(n.attrs.id||'')+' kids='+((n.kids||[]).length));
  for(const c of (n.kids||[])) desc(c,d+1); }
console.log('--- #main ---'); desc(dom.main,0);
console.log('--- page children ---');
const page=dom.main.kids.find(k=>k.t===undefined&&(k.attrs.class||'').includes('framer-W8QJn'));
(page.kids||[]).forEach(c=>console.log('   <'+c.tag+' class='+(c.attrs.class||'').slice(0,44)+' name='+(c.attrs['data-framer-name']||'')+' kids='+((c.kids||[]).length)));
