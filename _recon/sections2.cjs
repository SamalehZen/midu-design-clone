
const fs=require('fs');
const dom=JSON.parse(fs.readFileSync('/home/node/Ui/_recon/dom.json','utf8'));
const page=dom.main.kids.find(k=>k.t===undefined && (k.attrs.class||'').includes('framer-W8QJn'));
const cont=page.kids.find(k=>k.t===undefined && (k.attrs.class||'').includes('framer-7DOFx'));
console.log('content children:', cont.kids.filter(k=>k.t===undefined).length);
let i=0;
for(const k of cont.kids){
  if(k.t!==undefined) continue;
  const n=(x)=>{let c=0;const w=(y)=>{if(y.t!==undefined)return;c++;(y.kids||[]).forEach(w)};w(x);return c};
  console.log(i, '<'+k.tag+'>', 'class='+(k.attrs.class||''), 'name='+(k.attrs['data-framer-name']||''), 'id='+(k.attrs.id||''), 'nodes='+n(k));
  i++;
}
const footer=page.kids.find(k=>k.t===undefined && (k.attrs.class||'').includes('framer-1xnxnjn'));
console.log('footer name', footer.attrs['data-framer-name'], 'kids', footer.kids.filter(k=>k.t===undefined).length);
