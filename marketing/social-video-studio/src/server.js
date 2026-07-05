import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { CATEGORIES, DIRS } from './config.js';
import { ensureWorkspace, assetStatus, pickAssets } from './asset_manager.js';
import { loadApprovedContent } from './content_bank_loader.js';
import { generateScript } from './script_generator.js';
import { generateCaption } from './caption_generator.js';
import { createExport, writeExport } from './export_manager.js';
import { composeVideo } from './video_composer.js';
import { generateVoiceover } from './audio_manager.js';

await ensureWorkspace();
const json=(res,status,data)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8'});res.end(JSON.stringify(data));};
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.mp4':'video/mp4','.png':'image/png'};
async function generate(category){
  if(!CATEGORIES[category]) throw new Error('Geçersiz kategori.');
  const [approved,assets,exp]=await Promise.all([loadApprovedContent(category),pickAssets(),createExport(category)]);
  const script=generateScript(category,approved), caption=generateCaption(category,script);
  const voiceover=await generateVoiceover(script,exp.dir);
  await composeVideo({script,assets,voiceover,output:exp});
  const metadata={id:exp.id,category,categoryLabel:CATEGORIES[category],createdAt:new Date().toISOString(),duration:script.duration,resolution:'1080x1920',script,assets:{screenshots:assets.screenshots.map((item)=>path.basename(item)),backgroundAudio:null},religiousContent:{used:Boolean(script.approvedText),source:script.approvedSource}};
  await writeExport(exp,caption,metadata);
  return {id:exp.id,videoUrl:`/outputs/${exp.id}/final_video.mp4`,caption,metadata};
}
const server=http.createServer(async(req,res)=>{try{
  if(req.url==='/api/status') return json(res,200,{categories:CATEGORIES,assets:await assetStatus()});
  if(req.url==='/api/generate'&&req.method==='POST'){let body='';for await(const c of req)body+=c;return json(res,200,await generate(JSON.parse(body).category));}
  const outputMatch=req.url.match(/^\/outputs\/([^/]+)\/([^/]+)$/);
  const file=outputMatch?path.join(DIRS.videos,outputMatch[1],outputMatch[2]):path.join(DIRS.public,req.url==='/'?'index.html':req.url);
  const safeRoot=outputMatch?DIRS.videos:DIRS.public; if(!path.resolve(file).startsWith(path.resolve(safeRoot))) return json(res,403,{error:'Erişim reddedildi'});
  const data=await fs.readFile(file);res.writeHead(200,{'content-type':types[path.extname(file)]??'application/octet-stream'});res.end(data);
}catch(error){if(error.code==='ENOENT')return json(res,404,{error:'Bulunamadı'});json(res,500,{error:error.message});}});
server.listen(4310,'127.0.0.1',()=>console.log('Huzur Video Studio: http://localhost:4310'));
