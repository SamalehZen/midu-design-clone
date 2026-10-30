
import fs from 'node:fs';

const RECON='/home/node/Ui/_recon';
const dom=JSON.parse(fs.readFileSync(RECON+'/dom-live.json','utf8'));
const pageAttrs=dom.main.kids.find(k=>k.t===undefined&&(k.attrs.class||'').includes('framer-W8QJn')).attrs;
const SRC='/home/node/Ui/ui/src/generated';
fs.mkdirSync(SRC,{recursive:true});

const ATTR_MAP={class:'className',for:'htmlFor',tabindex:'tabIndex',srcset:'srcSet',fetchpriority:'fetchPriority','fill-opacity':'fillOpacity','stroke-width':'strokeWidth','stroke-linecap':'strokeLinecap','stroke-linejoin':'strokeLinejoin','fill-rule':'fillRule','stop-color':'stopColor','clip-path':'clipPath'};
const VOID=new Set(['img','br','hr','input','source','meta','link','area','base','col','embed','track','wbr']);

const amap=JSON.parse(fs.readFileSync(RECON+'/asset-map.json','utf8'));
const byUrl=new Map(amap.filter(a=>!a.error).map(a=>[a.url,a.name]));
const localize=(u)=>{ if(!u) return u; u=String(u).trim(); return byUrl.has(u)? 'assets/'+byUrl.get(u) : u; };

const DYN={
  '0.0.0.5.0.0':'hero-parallax',
  '0.0.0.5.0.0.1.0':'hero-meta-parallax',
  '0.0.0.8.0.0.1.1.0.0.1.4':'reviews-carousel',
  '0.0.0.9.0.0.0.1.0.0':'logo-marquee',
};
const DYN_RULES=[
  {k:'hero-parallax', f:(n)=>n.attrs['data-framer-name']==='HeroSection'},
  {k:'hero-meta-parallax', f:(n)=>n.attrs['data-framer-name']==='HeroMetaBar'},
  {k:'reviews-carousel', f:(n)=>n.attrs['data-framer-name']==='ReviewsCarousel'},
  {k:'logo-marquee', f:(n)=>n.tag==='ul' && (n.kids||[]).length>=10},
];

function splitDecls(s){
  const out=[]; let cur=''; let depth=0; let q=null;
  for(let i=0;i<s.length;i++){
    const ch=s[i];
    if(q){ cur+=ch; if(ch===q) q=null; continue; }
    if(ch==='('){ depth++; cur+=ch; continue; }
    if(ch==='"'||ch==="'"){ q=ch; cur+=ch; continue; }
    if(ch===')'){ depth--; cur+=ch; continue; }
    if(ch===';'&&depth===0){ out.push(cur); cur=''; continue; }
    cur+=ch;
  }
  if(cur.trim()) out.push(cur);
  return out;
}
const camel=(p)=> p.startsWith('--')? p : p.replace(/-([a-z])/g,(m,c)=>c.toUpperCase());
function styleObj(s){ const o={}; for(const d of splitDecls(s)){ const i=d.indexOf(':'); if(i<0)continue; const k=d.slice(0,i).trim(), v=d.slice(i+1).trim(); if(k&&v) o[camel(k)]=v; } return o; }
const needsExpr=(v)=>/["'<>&{}\n\t\\]/.test(v);
const attrVal=(v)=> needsExpr(v)? '{'+JSON.stringify(v)+'}' : JSON.stringify(v);

let clockCount=0, lottieCount=0;

function ser(n,isSvg,path,parentName,inClock){
  if(n.t!==undefined){
    if(n.t==='') return '';
    if(inClock){ clockCount++; return '<Clock />'; }
    return needsExpr(n.t)? '{'+JSON.stringify(n.t)+'}' : n.t;
  }
  const tag=n.tag;
  const svg = isSvg || tag==='svg';
  const isIframe = tag==='iframe';
  const isLottie = tag==='lottie' || tag==='dotlottie-player';
  if(isLottie){ lottieCount++; return '<SleepIcon />'; }
  let head='<'+tag, styleVal=null;
  for(const k of Object.keys(n.attrs||{})){
    let v=n.attrs[k];
    if(k==='data-framer-hydrate-v2') continue;
    if(k==='style'){ const o=styleObj(v); if(Object.keys(o).length) styleVal=o; continue; }
    if((k==='src'||k==='poster') && !isIframe) v=localize(v);
    else if(k==='srcset') v=v.split(',').map(p=>{const t=p.trim();if(!t)return'';const m=t.split(/\s+/);m[0]=localize(m[0]);return m.join(' ');}).filter(Boolean).join(', ');
    else if(k==='href' && !/^(use|a)$/.test(tag) && /^https?:/.test(v)) v=localize(v);
    head+=' '+(ATTR_MAP[k]||k)+'='+attrVal(v);
  }
  if(styleVal) head+=' style={{'+Object.entries(styleVal).map(([a,b])=>((/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(a))?a:JSON.stringify(a))+':'+JSON.stringify(b)).join(',')+'}}';
  const rule=DYN_RULES.find(r=>r.f(n));
  if(rule) head+=' data-midu-dyn='+JSON.stringify(rule.k);
  const name=n.attrs['data-framer-name'];
  const clockCtx = inClock || name==='LocalTime';
  const kids=n.kids||[];
  if(kids.length===0) return VOID.has(tag)? head+' />' : head+'></'+tag+'>';
  let k2=0;
  const inner=kids.map(x=>{
    if(x.t!==undefined) return ser(x,svg,path,name,clockCtx);
    const kp=path+'.'+k2; k2++;
    return ser(x,svg,kp,name,clockCtx);
  }).join('');
  return head+'>'+inner+'</'+tag+'>';
}

const page=dom.main.kids.find(k=>k.t===undefined && (k.attrs.class||'').includes('framer-W8QJn'));
const cont=page.kids.find(k=>k.t===undefined && (k.attrs.class||'').includes('framer-7DOFx'));
const footer=page.kids.find(k=>k.t===undefined && (k.attrs.class||'').includes('framer-1xnxnjn'));
const others=dom.main.kids.filter(k=>k.t===undefined&&k.tag!=='style'&&k!==page);

const names=['NavDesktopVariant','NavStickyMount','NavSearchMount','NavMenuMount','SmoothScrollMount','HeroSectionSroll','AboutSection','WorksSection','WorksSectionVariantB','ServicesSection','ServicesListOverlap','PricingSection'];
const bodyKids=cont.kids.filter(k=>k.t===undefined&&k.tag!=='style');

let out='// AUTO-GENERATED from the measured DOM of https://midu.design\n';
out+='// 1:1 tags, classes, attributes and inline styles. Regenerate: node _recon/gen-react.mjs\n';
out+='import React from "react";\nimport { Clock } from "../dynamic/Clock.jsx";\nimport { SleepIcon } from "../dynamic/SleepIcon.jsx";\n\n';
bodyKids.forEach((k,i)=>{
  const nm=names[i]||('Block'+i);
  out+='export function '+nm+'() {\n  return ('+ser(k,false,'0.0.0.'+i,'',false)+');\n}\n\n';
});
out+='export function FooterBlock() {\n  return ('+ser(footer,false,'0.0.'+(bodyKids.length+1),'',false)+');\n}\n\n';
others.forEach((k,i)=>{ out+='export function MainExtra'+i+'() {\n  return ('+ser(k,false,'x'+i,'',false)+');\n}\n\n'; });
const attrObj=(n)=>{
  const o={};
  for(const k of Object.keys(n.attrs||{})){
    if(k==='style'){ const s=styleObj(n.attrs[k]); if(Object.keys(s).length) o.style=s; continue; }
    o[ATTR_MAP[k]||k]=n.attrs[k];
  }
  return o;
};
out+='export const PAGE = '+JSON.stringify(attrObj(page))+' ;\n';
out+='export const CONTENT = '+JSON.stringify(attrObj(cont))+' ;\n';
out+='export const EXTRAS = '+JSON.stringify(others.map((k,i)=>({name:'MainExtra'+i, attrs:attrObj(k), kids:(k.kids||[]).length})))+' ;\n';
console.log('main extras:', others.map(k=>k.tag+' '+(k.attrs.class||'')+' kids='+(k.kids||[]).length).join(' | '));
out+='export function SvgTemplates() {\n  return ('+ser(dom.tpl,false,'tpl','',false)+');\n}\n';
fs.writeFileSync(SRC+'/sections.jsx',out);
console.log('sections.jsx bytes',out.length);
console.log('Clock instances:',clockCount,' SleepIcon instances:',lottieCount,' dyn bindings:',(out.match(/data-midu-dyn/g)||[]).length);
fs.writeFileSync(RECON+'/page-attrs.json', JSON.stringify(pageAttrs,null,1));
console.log('page attrs:', JSON.stringify(pageAttrs).slice(0,300));
