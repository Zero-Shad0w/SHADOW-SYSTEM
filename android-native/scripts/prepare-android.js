const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const sourcePublic = path.resolve(root, '..', 'public');
const web = path.join(root, 'www');
fs.rmSync(web, { recursive: true, force: true });
fs.cpSync(sourcePublic, web, { recursive: true });
const seed = JSON.parse(fs.readFileSync(path.join(root, 'seed-state.json'), 'utf8'));
fs.writeFileSync(path.join(web, 'seed-state.js'), `window.SHADOW_SEED=${JSON.stringify(seed)};`, 'utf8');
const indexPath = path.join(web, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace('<script src="/app.js?v=10"></script>', '<script src="/seed-state.js"></script><script src="/app.js?v=11"></script>');
html = html.replace('<link rel="manifest" href="/manifest.json">', '');
fs.writeFileSync(indexPath, html, 'utf8');
const appPath = path.join(web, 'app.js');
let app = fs.readFileSync(appPath, 'utf8');
const cloudToggle = `<label class="list-item" style="display:flex;gap:12px;align-items:center;margin:12px 0"><span>Enable optional cloud features</span><input id="cloudSyncEnabled" type="checkbox"></label>`;
const cloudNeedle = `<p class="subtle">Connect a cloud identity to access the same training backup from another device. Cloud sign-in is separate from this device's local Hunter login.</p>`;
app = app.replace(cloudNeedle, cloudNeedle+cloudToggle+'<p class="subtle">Cloud features are off by default. Your training remains stored on this device unless you opt in.</p>');
const cloudBindNeedle = "if($('#cloudLogin'))$('#cloudLogin').onclick=async()=>{";
app = app.replace(cloudBindNeedle, "if($('#cloudSyncEnabled')){$('#cloudSyncEnabled').checked=state.data.settings.cloudSyncEnabled===true;$('#cloudSyncEnabled').onchange=async e=>{await api('/settings','POST',{...state.data.settings,cloudSyncEnabled:e.target.checked});toast(e.target.checked?'Optional cloud features enabled':'Local-only mode enabled');render()}}if($('#cloudLogin'))$('#cloudLogin').onclick=async()=>{");
const oldApi = "async function api(path,method='GET',body){const r=await fetch('/api'+path,{method,headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});const d=await r.json();if(!r.ok)throw Error(d.error||'Request failed');return d;}";
const nativeApi = String.raw`const nativeMode=!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
let nativeDbPromise;
function nativeDb(){if(!nativeDbPromise)nativeDbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open('shadow-system-local',1);req.onupgradeneeded=()=>req.result.createObjectStore('records');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});return nativeDbPromise}
async function nativeRead(){const db=await nativeDb();return new Promise((resolve,reject)=>{const tx=db.transaction('records','readonly'),r=tx.objectStore('records').get('state');r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}
async function nativeWrite(value){const db=await nativeDb();return new Promise((resolve,reject)=>{const tx=db.transaction('records','readwrite');tx.objectStore('records').put(value,'state');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
async function nativeState(){let s=await nativeRead();if(!s){s=structuredClone(window.SHADOW_SEED);s.profile={...s.profile,username:'SHADOW HUNTER'};s.settings={...s.settings,cloudSyncEnabled:false};await nativeWrite(s)}return s}
async function nativeApi(path,method='GET',body){const s=await nativeState(),p=path.split('?')[0];if(method==='GET'&&(p==='/state'||p==='/backup'))return s;if(p==='/auth/me'&&method==='GET')return {authenticated:true,local:true,account:{id:'local-device',username:s.profile.username||'SHADOW HUNTER'}};if(p==='/auth/logout'&&method==='POST')return {ok:true,local:true};if(method==='POST'&&p==='/profile'){s.profile={...s.profile,...body};await nativeWrite(s);return s.profile}if(method==='POST'&&p==='/settings'){s.settings={...s.settings,...body};await nativeWrite(s);return s.settings}if(method==='POST'&&p==='/exercises'){const i=s.exercises.findIndex(x=>String(x.id)===String(body.id));if(i>=0)s.exercises[i]={...s.exercises[i],...body};else s.exercises.push({...body,id:body.id||crypto.randomUUID()});await nativeWrite(s);return s.exercises}if(method==='DELETE'&&p.startsWith('/exercises/')){s.exercises=s.exercises.filter(x=>String(x.id)!==decodeURIComponent(p.split('/').pop()));await nativeWrite(s);return {ok:true}}if(method==='POST'&&p==='/programs'){const i=s.programs.findIndex(x=>String(x.id)===String(body.id));const item={...body,id:body.id||crypto.randomUUID(),created_at:body.created_at||new Date().toISOString()};if(i>=0)s.programs[i]=item;else s.programs.unshift(item);await nativeWrite(s);return {id:item.id}}if(method==='DELETE'&&p.startsWith('/programs/')){s.programs=s.programs.filter(x=>String(x.id)!==decodeURIComponent(p.split('/').pop()));await nativeWrite(s);return {ok:true}}if(method==='POST'&&p==='/workouts'){const id=body.id||crypto.randomUUID(),i=s.workouts.findIndex(x=>String(x.id)===String(id)),item={...body,id,created_at:body.created_at||new Date().toISOString()};if(i>=0)s.workouts[i]={...s.workouts[i],...item};else s.workouts.unshift(item);if(body.status==='completed'&&!s.xpEvents.some(x=>x.workout_id===id))s.xpEvents.unshift({id:crypto.randomUUID(),workout_id:id,amount:Math.max(0,Number(body.xp||0)),reason:'Workout completed',created_at:new Date().toISOString()});await nativeWrite(s);return {id,xp:Math.max(0,Number(body.xp||0))}}if(method==='POST'&&p==='/restore'){if(!body||!Array.isArray(body.workouts)||!Array.isArray(body.exercises))throw Error('Invalid backup file');const safe={...body,profile:{...s.profile,...(body.profile||{})},settings:{...s.settings,...(body.settings||{})},achievements:body.achievements||[],programs:body.programs||[],workouts:body.workouts||[],xpEvents:body.xpEvents||[]};await nativeWrite(safe);return {ok:true}}throw Error('Unsupported local operation: '+method+' '+p)}
async function api(path,method='GET',body){if(nativeMode)return nativeApi(path,method,body);const r=await fetch('/api'+path,{method,headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});const d=await r.json();if(!r.ok)throw Error(d.error||'Request failed');return d;}`;
if (!app.includes(oldApi)) throw new Error('Could not find existing API helper in app.js');
app = app.replace(oldApi, nativeApi);
app = app.replace("if('serviceWorker'in navigator)navigator.serviceWorker.register('/service-worker.js').catch(()=>{});", "if(!nativeMode&&'serviceWorker'in navigator)navigator.serviceWorker.register('/service-worker.js').catch(()=>{});");
app = app.replaceAll("try{await cloudAuth('login'", "try{if(!state.data.settings.cloudSyncEnabled){toast('Enable optional cloud features first');return}await cloudAuth('login'");
app = app.replaceAll("try{await cloudAuth('register'", "try{if(!state.data.settings.cloudSyncEnabled){toast('Enable optional cloud features first');return}await cloudAuth('register'");
app = app.replaceAll("try{await cloudPush()", "try{if(!state.data.settings.cloudSyncEnabled){toast('Enable optional cloud features first');return}await cloudPush()");
app = app.replaceAll("try{await cloudPull()", "try{if(!state.data.settings.cloudSyncEnabled){toast('Enable optional cloud features first');return}await cloudPull()");
app = app.replace('SQLite · LOCAL', 'ON-DEVICE DATABASE · LOCAL');
app = app.replace('INSTALLED PWA', 'NATIVE ANDROID APP');
fs.writeFileSync(appPath, app, 'utf8');
console.log('Prepared native web assets with local-first IndexedDB persistence.');