import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  isNativePlatform: vi.fn(() => true),
  writeFile: vi.fn(),
  share: vi.fn(),
  html2canvas: vi.fn(),
  logShareOpened: vi.fn(),
  logShareSent: vi.fn(),
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

vi.mock('html2canvas', () => ({ default: mocks.html2canvas }));

vi.mock('./analyticsService', () => ({
  logShareOpened: mocks.logShareOpened,
  logShareSent: mocks.logShareSent,
}));

vi.mock('./referralService', () => ({
  createInviteLink: () => ({ code: 'test-code' }),
}));

vi.mock('../config/deepLinkConfig', () => ({
  buildPlayStoreReferralUrl: () => 'https://play.google.com/store/apps/details?id=test',
}));

import { shareVerseAsImage } from './verseImageShareService';

describe('shareVerseAsImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isNativePlatform.mockReturnValue(true);
    mocks.share.mockResolvedValue(undefined);
  });

  it('opens native text sharing when the render element is unavailable', async () => {
    const result = await shareVerseAsImage(null, {
      reference: 'İnşirah, 5-6',
      translation: 'Zorlukla beraber kolaylık vardır.',
    });

    expect(result).toEqual({ success: true });
    expect(mocks.share).toHaveBeenCalledWith(expect.objectContaining({
      text: expect.stringContaining('Zorlukla beraber kolaylık vardır.'),
    }));
    expect(mocks.logShareSent).toHaveBeenCalledWith('verse_text', 'native_share_fallback');
  });

  it('falls back to native text sharing when image rendering fails', async () => {
    mocks.html2canvas.mockRejectedValue(new Error('render failed'));

    const result = await shareVerseAsImage(document.createElement('article'), {
      reference: 'İnşirah, 5-6',
      translation: 'Zorlukla beraber kolaylık vardır.',
    });

    expect(result).toEqual({ success: true });
    expect(mocks.share).toHaveBeenCalledTimes(1);
    expect(mocks.share.mock.calls[0][0]).not.toHaveProperty('files');
  });
});
