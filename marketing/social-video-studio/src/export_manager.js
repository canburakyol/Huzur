import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { DIRS } from './config.js';

export async function createExport(category) {
  const id = `${new Date().toISOString().replace(/[:.]/g,'-')}-${crypto.randomBytes(2).toString('hex')}`;
  const dir = path.join(DIRS.videos,id); await fs.mkdir(dir,{recursive:true});
  return { id, dir, video:path.join(dir,'final_video.mp4') };
}
export async function writeExport(exp, captionData, metadata) {
  await Promise.all([
    fs.writeFile(path.join(exp.dir,'caption.txt'),captionData.caption,'utf8'),
    fs.writeFile(path.join(exp.dir,'hashtags.txt'),captionData.hashtags.join(' '),'utf8'),
    fs.writeFile(path.join(exp.dir,'metadata.json'),JSON.stringify(metadata,null,2),'utf8'),
    fs.writeFile(path.join(DIRS.captions,`${exp.id}.txt`),`${captionData.caption}\n\n${captionData.hashtags.join(' ')}`,'utf8')
  ]);
}
