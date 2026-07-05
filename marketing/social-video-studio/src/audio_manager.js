import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide:true }); let error = '';
    child.stderr.on('data', (data) => error += data);
    child.on('error', reject);
    child.on('close', (code) => code === 0 ? resolve() : reject(new Error(error || `${command} kod ${code} ile kapandı.`)));
  });
}

export async function generateVoiceover(script, outputDir) {
  const input = path.join(outputDir, 'voiceover.txt');
  const audio = path.join(outputDir, 'voiceover.mp3');
  await fs.writeFile(input, script.narration, 'utf8');
  await run('edge-tts', ['--voice','tr-TR-AhmetNeural','--rate','+4%','--file',input,'--write-media',audio]);
  return { audio };
}
