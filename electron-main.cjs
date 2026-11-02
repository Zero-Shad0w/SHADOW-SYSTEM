const { app, BrowserWindow, dialog } = require('electron');
const { spawn } = require('node:child_process');
const path = require('node:path');
const http = require('node:http');
let server=null, win=null, stopping=false;
const PORT=4173, URL='http://127.0.0.1:'+PORT;
function ping(){return new Promise(resolve=>{const req=http.get(URL,r=>{r.resume();resolve(r.statusCode>=200&&r.statusCode<500)});req.on('error',()=>resolve(false));req.setTimeout(700,()=>{req.destroy();resolve(false)})})}
async function waitForServer(){for(let i=0;i<80;i++){if(await ping())return true;await new Promise(r=>setTimeout(r,250))}return false}
async function startServer(){
 const serverPath=path.join(process.resourcesPath,'app','server.js');
 server=spawn(process.execPath,[serverPath],{cwd:path.dirname(serverPath),env:{...process.env,ELECTRON_RUN_AS_NODE:'1',PORT:String(PORT)},windowsHide:true,stdio:'ignore'});
 server.on('exit',code=>{if(!stopping&&win){dialog.showErrorBox('SHADOW SYSTEM','The local training server stopped unexpectedly'+(code===null?'':(' (code '+code+')'))+'. Please restart the app.')}})
 if(!await waitForServer())throw new Error('The local training server did not start on port '+PORT+'. Check whether another app is using this port.');
}
function createWindow(){win=new BrowserWindow({width:1440,height:940,minWidth:980,minHeight:680,backgroundColor:'#07070d',autoHideMenuBar:true,icon:path.join(process.resourcesPath,'app','public','favicon.ico'),webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true}});win.loadURL(URL);win.on('closed',()=>win=null)}
app.whenReady().then(async()=>{try{await startServer();createWindow()}catch(e){dialog.showErrorBox('SHADOW SYSTEM could not start',e.message);app.quit()}})
app.on('before-quit',()=>{stopping=true;if(server&&!server.killed)server.kill()});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0&&server)createWindow()});
