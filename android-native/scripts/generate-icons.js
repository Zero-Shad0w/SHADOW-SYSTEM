const fs=require('node:fs');
const path=require('node:path');
const sharp=require('sharp');
const pngToIco=require('png-to-ico');
const root=path.resolve(__dirname,'../..');
const source=path.join(root,'assets','shadow-system-icon.svg');
const android=path.join(__dirname,'..','android','app','src','main','res');
const appRoot=path.resolve(root,'..');
const publicDir=path.join(root,'public');
async function main(){
 if(!fs.existsSync(source)) throw new Error('Missing assets/shadow-system-icon.svg');
 const sizes={mdpi:48,hdpi:72,xhdpi:96,xxhdpi:144,xxxhdpi:192};
 for(const [density,size] of Object.entries(sizes)){
  const dir=path.join(android,'mipmap-'+density);fs.mkdirSync(dir,{recursive:true});
  const png=await sharp(source).resize(size,size,{fit:'contain'}).png().toBuffer();
  fs.writeFileSync(path.join(dir,'ic_launcher.png'),png);
  fs.writeFileSync(path.join(dir,'ic_launcher_round.png'),png);
 }
 const drawable=path.join(android,'drawable');fs.mkdirSync(drawable,{recursive:true});
 fs.writeFileSync(path.join(drawable,'ic_launcher_foreground.png'),await sharp(source).resize(432,432,{fit:'contain'}).png().toBuffer());
 const adaptive=path.join(android,'mipmap-anydpi-v26');fs.mkdirSync(adaptive,{recursive:true});
 const xml='<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@android:color/black"/><foreground android:drawable="@drawable/ic_launcher_foreground"/></adaptive-icon>';
 fs.writeFileSync(path.join(adaptive,'ic_launcher.xml'),xml);
 fs.writeFileSync(path.join(adaptive,'ic_launcher_round.xml'),xml);
 if(fs.existsSync(publicDir)){
  const icons=path.join(publicDir,'icons');fs.mkdirSync(icons,{recursive:true});
  const pngs=[];
  for(const size of [192,512]){
   const out=path.join(icons,'shadow-system-'+size+'.png');
   const data=await sharp(source).resize(size,size,{fit:'contain'}).png().toBuffer();fs.writeFileSync(out,data);pngs.push(data);
  }
  const ico=await pngToIco([await sharp(source).resize(256,256).png().toBuffer(),await sharp(source).resize(48,48).png().toBuffer(),await sharp(source).resize(32,32).png().toBuffer(),await sharp(source).resize(16,16).png().toBuffer()]);
  fs.writeFileSync(path.join(publicDir,'favicon.ico'),ico);
  const manifestPath=path.join(publicDir,'manifest.json');
  if(fs.existsSync(manifestPath)){
   const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
   manifest.icons=[{src:'/icons/shadow-system-192.png',sizes:'192x192',type:'image/png',purpose:'any'},{src:'/icons/shadow-system-512.png',sizes:'512x512',type:'image/png',purpose:'any maskable'}];
   fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\\n');
  }
 }
 console.log('Generated SHADOW SYSTEM Android, PWA and Windows-compatible icon assets.');
}
main().catch(e=>{console.error(e);process.exit(1)});
