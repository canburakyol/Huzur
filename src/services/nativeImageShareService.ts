import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

type NativeCanvasShareOptions = {
  fileName: string;
  title: string;
  text: string;
  dialogTitle: string;
  format?: 'image/png' | 'image/jpeg';
  quality?: number;
};

export const shareCanvasWithTextOnNative = async (
  canvas: HTMLCanvasElement,
  options: NativeCanvasShareOptions,
): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return false;

  const format = options.format || 'image/png';
  const dataUrl = canvas.toDataURL(format, options.quality ?? 1);
  const base64Data = dataUrl.split(',')[1];

  if (!base64Data) {
    throw new Error('image_generation_failed');
  }

  const writeResult = await Filesystem.writeFile({
    path: options.fileName,
    data: base64Data,
    directory: Directory.Cache,
  });

  await Share.share({
    title: options.title,
    text: options.text,
    files: [writeResult.uri],
    dialogTitle: options.dialogTitle,
  });

  return true;
};
