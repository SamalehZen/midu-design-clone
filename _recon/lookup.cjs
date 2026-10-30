
const fs=require('fs');
const dom=JSON.parse(fs.readFileSync('/home/node/Ui/_recon/dom.json','utf8'));
function find(n,pred,path,out){ if(n.t!==undefined)return; if(pred(n,path)) out.push({path,n}); let k=0; for(const c of n.kids||[]){ if(c.t!==undefined)continue; find(c,pred,path+'.'+k,out); k++; } }
const uls=[]; find(dom.main,(n)=>n.tag==='ul','0',uls);
uls.forEach(u=>console.log('UL path='+u.path+' class='+u.n.attrs.class+' name='+(u.n.attrs['data-framer-name']||'')+' style='+String(u.n.attrs.style||'').slice(0,80)+' kids='+(u.n.kids||[]).length));
// dynamic class names
for(const nm of ['HeroSection','HeroMetaBar','ReviewsCarousel','LocalTime','IconSleep','ScrollPrompt']){
  const o=[]; find(dom.main,(n)=>n.attrs['data-framer-name']===nm,'0',o);
  o.forEach(e=>console.log(nm,'path='+e.path,'class='+(e.n.attrs.class||'')));
}
// iframes
const ifr=[]; find(dom.main,(n)=>n.tag==='iframe','0',ifr);
ifr.forEach(e=>console.log('IFRAME path='+e.path+' attrs='+JSON.stringify(e.n.attrs).slice(0,300)));
