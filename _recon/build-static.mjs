
import fs from 'node:fs';
import path from 'node:path';

const RECON='/home/node/Ui/_recon';
const UI='/home/node/Ui/ui';
const dom=JSON.parse(fs.readFileSync(RECON+'/dom.json','utf8'));
const amap=JSON.parse(fs.readFileSync(RECON+'/asset-map.json','utf8'));
const byUrl=new Map(amap.filter(a=>!a.error).map(a=>[a.url,a.name]));

function localize(u){
  if(!u) return u;
  u=String(u).trim();
  if(byUrl.has(u)) return 'assets/'+byUrl.get(u);
  return u;
}
const VOID=new Set(['img','br','hr','input','source','meta','link','area','base','col','embed','track','wbr']);
const RAWTAG={lottie:'dotlottie-player'};

function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escAttr(s){ return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function rewriteUrlList(v){ return v.split(',').map(p=>{ const t=p.trim(); if(!t) return ''; const m=t.split(/\s+/); m[0]=localize(m[0]); return m.join(' '); }).filter(Boolean).join(', '); }
function rewriteCssUrls(v){ return v.replace(/url\((['"]?)([^)'"]+)\1\)/g, (full,q,u)=>{ const l=localize(u); return l===u? full : 'url('+q+l+q+')'; }); }

function ser(n){
  if(n.t!==undefined) return esc(n.t);
  const tag=RAWTAG[n.tag]||n.tag;
  const parts=[tag];
  const isIframe = n.tag==='iframe';
  for(const k of Object.keys(n.attrs||{})){
    let v=n.attrs[k];
    if(k==='data-framer-hydrate-v2') continue;
    if((k==='src'||k==='poster') && !isIframe) v=localize(v);
    else if(k==='srcset') v=rewriteUrlList(v);
    else if(k==='href' && !n.tag.match(/^(use|a)$/)) { if(/^https?:/.test(v)) v=localize(v); }
    else if(k==='style'||/_constraints$/.test(k)) v=rewriteCssUrls(v);
    parts.push(k+'="'+escAttr(v)+'"');
  }
  const open='<'+parts.join(' ')+'>';
  const kids=n.kids||[];
  if(kids.length===0 && (VOID.has(tag)||tag==='svg'||tag==='use'||tag==='iframe'||tag==='dotlottie-player')) return open+'</'+tag+'>';
  return open+kids.map(k=>ser(k)).join('')+'</'+tag+'>';
}

let css=fs.readFileSync(RECON+'/css-all.css','utf8');
css=css.split('\n/* --- */\n').filter(blk=>!/__framer-editorbar/.test(blk)).join('\n');
css=rewriteCssUrls(css);

const body = ser(dom.main) + (dom.tpl? '\n'+ser(dom.tpl):'') + '\n';
const html = '<!doctype html>\n<html lang="en" dir="ltr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width">\n<title>UI/UX &amp; Web Design Studio for Startups — Midu Studio</title>\n<style>\n'+css+'\n</style>\n</head>\n<body>\n'+body+'</body>\n</html>\n';

fs.mkdirSync(UI,{recursive:true});
fs.writeFileSync(UI+'/index.html', html);
console.log('html bytes', html.length, 'css bytes', css.length);
console.log('svg-templates present:', /svg-templates/.test(html), ' dotlottie:', (html.match(/dotlottie-player/g)||[]).length, ' iframe:', (html.match(/<iframe/g)||[]).length);
