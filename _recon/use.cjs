
const fs=require('fs');
const dom=JSON.parse(fs.readFileSync('/home/node/Ui/_recon/dom.json','utf8'));
console.log('TPL full:', JSON.stringify(dom.tpl).slice(0,1200));
function find(n,pred,path,out){ if(n.t!==undefined)return; if(pred(n,path)) out.push({path, n}); let k=0; for(const c of n.kids||{}){ if(c.t!==undefined) continue; find(c,pred,path+'.'+k,out); k++; } }
const uses=[]; find(dom.main,(n)=>n.tag==='use','0',uses);
console.log('\nUSE elements:', uses.length);
for(const u of uses) console.log(u.path, JSON.stringify(u.n.attrs));
// context 3 levels up
for(const u of uses.slice(0,2)){
  const o=[]; let n=dom.main; const parts=u.path.split('.').map(Number).slice(0,-2);
  for(const p of parts.slice(1)){ let k=0,found=null; for(const c of n.kids||[]){ if(c.t!==undefined)continue; if(k===p){found=c;break;} k++; } n=found; }
  const dump=(x,i)=>{ if(!x)return; if(x.t!==undefined){o.push(i+JSON.stringify(x.t.slice(0,40)));return;} o.push(i+'<'+x.tag+' class='+(x.attrs.class||'')+' name='+(x.attrs['data-framer-name']||'')+' style='+String(x.attrs.style||'').slice(0,100)+'>'); (x.kids||[]).forEach(k=>dump(k,i+'  ')); };
  dump(n,''); console.log('\nCONTEXT of '+u.path+':\n'+o.join('\n').slice(0,1200));
}
