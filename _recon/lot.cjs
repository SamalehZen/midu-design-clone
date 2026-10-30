
const fs=require('fs');
const d=require('/home/node/Ui/_recon/dom-live.json');
function at(path){ const i=path.split('.').slice(1).map(Number); let n=d.main; for(const k of i){ const kids=(n.kids||[]).filter(x=>!x.t||x.t!==''); n=kids[k]; if(!n) return null; } return n; }
for(const p of ['0.0.0.5.0.0.1.0.0.1.1','0.0.0.5.0.0.1.0.0.1.1.0','0.0.3.0.0.0.0.0.1']){
  const n=at(p);
  console.log(p, n? JSON.stringify({tag:n.tag, attrs:n.attrs, kids:(n.kids||[]).map(k=>k.t!==undefined?('TEXT:'+k.t.slice(0,20)):k.tag)}).slice(0,400) : 'MISSING');
}
// search the whole live tree for dotlottie / lottie
const hits=[];
(function scan(n,path){ if(n.t!==undefined)return; if(/lottie/i.test(n.tag)||JSON.stringify(n.attrs).match(/lottie/i)) hits.push(path+' '+n.tag+' '+JSON.stringify(n.attrs).slice(0,200));
  let k=0; for(const c of n.kids){ if(c.t!==undefined)continue; scan(c,path+'.'+k); k++; } })(d.main,'0');
console.log('--- lottie references in live DOM ---');
hits.slice(0,8).forEach(h=>console.log('  '+h));
