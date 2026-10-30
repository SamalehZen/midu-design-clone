
const fs=require('fs');
const dom=JSON.parse(fs.readFileSync('/home/node/Ui/_recon/dom.json','utf8'));
function tree(n,d,maxd,out){
  if(n.t!==undefined) return;
  const cls=(n.attrs.class||'').split(' ')[0];
  out.push('  '.repeat(d)+'<'+n.tag+' .'+cls+' name="'+(n.attrs['data-framer-name']||'')+'" id="'+(n.attrs.id||'')+'">'+(n.kids?(' ['+n.kids.length+']'):''));
  if(d<maxd) (n.kids||[]).forEach(k=>tree(k,d+1,maxd,out));
}
const out=[]; tree(dom.main,0,2,out); console.log(out.join('\n'));
