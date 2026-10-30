
const {PNG}=require('pngjs'); const fs=require('fs');
const src=PNG.sync.read(fs.readFileSync('/home/node/Ui/_recon/home-full.png'));
function crop(y,h,w,scale,name){
  const sw=Math.round(w/scale), sh=Math.round(h/scale);
  const out=new PNG({width:sw,height:sh});
  for(let yy=0;yy<sh;yy++) for(let xx=0;xx<sw;xx++){
    const sy=Math.min(src.height-1,y+Math.round(yy*scale)), sx=Math.min(src.width-1,Math.round(xx*scale));
    const si=(sy*src.width+sx)*4, di=(yy*sw+xx)*4;
    out.data[di]=src.data[si];out.data[di+1]=src.data[si+1];out.data[di+2]=src.data[si+2];out.data[di+3]=255;
  }
  fs.writeFileSync('/home/node/Ui/_recon/'+name, PNG.sync.write(out));
}
crop(0,900,1200,1,'sec-hero.png');
crop(900,1752,1200,1,'sec-about.png');
crop(2652,900,1200,1,'sec-works1.png');
crop(3552,900,1200,1,'sec-works2.png');
crop(4452,700,1200,1,'sec-works3.png');
crop(6059,900,1200,1,'sec-services1.png');
crop(6959,849,1200,1,'sec-services2.png');
crop(7763,900,1200,1,'sec-pricing1.png');
crop(8663,900,1200,1,'sec-pricing2.png');
crop(9563,808,1200,1,'sec-pricing3.png');
crop(10371,772,1200,1,'sec-footer.png');
console.log('ok');
