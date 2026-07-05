import { spawn } from 'node:child_process';

export async function composeVideo({ script, assets, voiceover, output }) {
  const screenshots = assets.screenshots.slice(0,4);
  const sceneDuration = script.duration / screenshots.length;
  const sceneFilters = [];
  screenshots.forEach((_, index) => {
    sceneFilters.push(
      `[${index}:v]split=2[rawbg${index}][rawfg${index}]`,
      `[rawbg${index}]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=35:6,eq=brightness=-0.24:saturation=0.72[bg${index}]`,
      `[rawfg${index}]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black@0,format=rgba[fg${index}]`,
      `[bg${index}][fg${index}]overlay=0:0,setsar=1,trim=duration=${sceneDuration},setpts=PTS-STARTPTS[scene${index}]`
    );
  });
  const concatInputs = screenshots.map((_,index)=>`[scene${index}]`).join('');
  const audioIndex = screenshots.length;
  const filters = [
    ...sceneFilters,
    `${concatInputs}concat=n=${screenshots.length}:v=1:a=0[out]`,
    `[${audioIndex}:a]volume=1.20,apad=pad_dur=${script.duration},atrim=duration=${script.duration}[aout]`
  ].join(';');
  const args = ['-y'];
  screenshots.forEach((screenshot) => args.push('-loop','1','-framerate','30','-i',screenshot));
  args.push('-i',voiceover.audio);
  args.push('-filter_complex',filters,'-map','[out]','-map','[aout]','-t',String(script.duration),'-r','30','-c:v','libx264','-preset','slow','-crf','17','-c:a','aac','-b:a','192k','-movflags','+faststart',output.video);
  await new Promise((resolve,reject)=>{ const p=spawn('ffmpeg',args,{windowsHide:true}); let err=''; p.stderr.on('data',(d)=>err+=d); p.on('error',reject); p.on('close',(code)=>code===0?resolve():reject(new Error(err.slice(-3500)))); });
}
