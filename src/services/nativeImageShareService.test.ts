import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  isNativePlatform: vi.fn(),
  writeFile: vi.fn(),
  share: vi.fn(),
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: mocks.isNativePlatform },
}));

vi.mock('@capacitor/filesystem', () => ({
  Directory: { Cache: 'CACHE' },
  Filesystem: { writeFile: mocks.writeFile },
}));

vi.mock('@capacitor/share', () => ({
  Share: { share: mocks.share },
}));

import { shareCanvasWithTextOnNative } from './nativeImageShareService';

describe('shareCanvasWithTextOnNative', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isNativePlatform.mockReturnValue(true);
    mocks.writeFile.mockResolvedValue({ uri: 'file:///cache/card.png' });
    mocks.share.mockResolvedValue(undefined);
  });

  it('shares the cached image and text together on native platforms', async () => {
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'toDataURL').mockReturnValue('data:image/png;base64,aW1hZ2U=');

    const result = await shareCanvasWithTextOnNative(canvas, {
      fileName: 'card.png',
      title: 'Huzur',
      text: 'Paylasim metni',
      dialogTitle: 'Paylas',
    });

    expect(result).toBe(true);
    expect(mocks.writeFile).toHaveBeenCalledWith({
      path: 'card.png',
      data: 'aW1hZ2U=',
      directory: 'CACHE',
    });
    expect(mocks.share).toHaveBeenCalledWith({
      title: 'Huzur',
      text: 'Paylasim metni',
      files: ['file:///cache/card.png'],
      dialogTitle: 'Paylas',
    });
  });

  it('leaves web sharing to the caller', async () => {
    mocks.isNativePlatform.mockReturnValue(false);

    const result = await shareCanvasWithTextOnNative(document.createElement('canvas'), {
      fileName: 'card.png',
      title: 'Huzur',
      text: 'Paylasim metni',
      dialogTitle: 'Paylas',
    });

    expect(result).toBe(false);
    expect(mocks.writeFile).not.toHaveBeenCalled();
    expect(mocks.share).not.toHaveBeenCalled();
  });
});
