
const fs=require('fs');
const dom=JSON.parse(fs.readFileSync('/home/node/Ui/_recon/dom.json','utf8'));
const tags={}, attrs={}, svgTags=new Set(), svgAttrs={};
const SVG_NS='http://www.w3.org/2000/svg';
function walk(n, inSvg){
  if(n.t!==undefined) return;
  tags[n.tag]=(tags[n.tag]||0)+1;
  const isSvg = inSvg || n.tag==='svg';
  if(isSvg) svgTags.add(n.tag);
  for(const k of Object.keys(n.attrs||{})){
    attrs[k]=(attrs[k]||0)+1;
    if(isSvg) svgAttrs[k]=(svgAttrs[k]||0)+1;
  }
  (n.kids||[]).forEach(k=>walk(k,isSvg));
}
walk(dom.main,false);
console.log('TAGS:'); console.log(Object.entries(tags).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+':'+v).join(' '));
console.log('\nSVG TAGS:'); console.log([...svgTags].join(' '));
console.log('\nATTRS:'); console.log(Object.entries(attrs).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+':'+v).join(' '));
console.log('\nSVG ATTRS:'); console.log(Object.entries(svgAttrs).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+':'+v).join(' '));
console.log('\nPLACEHOLDERS:', JSON.stringify((()=>{const o={};const w=(n)=>{if(n.t!==undefined)return;if(n.placeholder)o[n.placeholder]=(o[n.placeholder]||0)+1;(n.kids||[]).forEach(w)};w(dom.main);return o})()));
// top-level of tpl
console.log('\nTPL kids:', dom.tpl? dom.tpl.kids.length : 0);
