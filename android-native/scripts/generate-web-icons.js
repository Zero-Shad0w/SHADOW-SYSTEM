const fs=require('node:fs');
const path=require('node:path');
const sharp=require('sharp');
const pngToIco=require('png-to-ico');
const zlib=require('node:zlib');
const root=path.resolve(__dirname,'../..');
const source=path.join(root,'assets','shadow-system-icon.svg');
const encoded=path.join(root,'assets','android-hunter-icon.svg.gz.b64');
const pub=path.join(root,'public');
async function main(){
 if(fs.existsSync(encoded))fs.writeFileSync(source,zlib.gunzipSync(Buffer.from(fs.readFileSync(encoded,'utf8'),'base64')));
 if(!fs.existsSync(source))throw new Error('Missing selected Shadow System icon artwork');
 const icons=path.join(pub,'icons');fs.mkdirSync(icons,{recursive:true});
 for(const size of [192,512])fs.writeFileSync(path.join(icons,'shadow-system-'+size+'.png'),await sharp(source).resize(size,size,{fit:'contain'}).png().toBuffer());
 const ico=await pngToIco([256,48,32,16].map(size=>sharp(source).resize(size,size,{fit:'contain'}).png().toBuffer()).map(async p=>await p));
 fs.writeFileSync(path.join(pub,'favicon.ico'),await ico);
 const mp=path.join(pub,'manifest.json');
 if(fs.existsSync(mp)){const m=JSON.parse(fs.readFileSync(mp,'utf8'));m.icons=[{src:'/icons/shadow-system-192.png',sizes:'192x192',type:'image/png',purpose:'any'},{src:'/icons/shadow-system-512.png',sizes:'512x512',type:'image/png',purpose:'any maskable'}];fs.writeFileSync(mp,JSON.stringify(m,null,2)+'\\n')}
 console.log('Windows/PWA icons generated from selected Hunter portrait');
}
main().catch(e=>{console.error(e);process.exit(1)});
