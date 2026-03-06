import { beforeEach, describe, expect, it, vi } from 'vitest';

const storageMock = vi.hoisted(() => {
  let store = new Map();

  const api = {
    reset() {
      store = new Map();
      api.getItem.mockClear();
      api.setItem.mockClear();
      api.removeItem.mockClear();
    },
    seed(key, value) {
      store.set(key, value);
    },
    getItem: vi.fn((key, defaultValue = null) => (store.has(key) ? store.get(key) : defaultValue)),
    setItem: vi.fn((key, value) => {
      store.set(key, value);
      return true;
    }),
    removeItem: vi.fn((key) => {
      store.delete(key);
      return true;
    })
  };

  return api;
});

const loggerMock = vi.hoisted(() => ({
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
  sensitive: vi.fn()
}));

vi.mock('./storageService', () => ({
  storageService: storageMock
}));

vi.mock('../utils/logger', () => ({
  logger: loggerMock
}));

import { getAvailableTranslations, getSurahComplete } from './quranService';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

const jsonResponse = (payload, ok = true) => ({
  ok,
  json: vi.fn().mockResolvedValue(payload)
});

const createArabicPayload = (surahNumber) => ({
  code: 200,
  data: {
    number: surahNumber,
    name: 'الفاتحة',
    englishName: 'Al-Faatiha',
    englishNameTranslation: 'The Opening',
    revelationType: 'Meccan',
    numberOfAyahs: 2,
    ayahs: [
      { numberInSurah: 1, text: 'ARABIC_1' },
      { numberInSurah: 2, text: 'ARABIC_2' }
    ]
  }
});

const createTranslationPayload = (surahNumber, first = 'Vakif meal 1', second = 'Vakif meal 2') => ({
  code: 200,
  data: {
    number: surahNumber,
    ayahs: [
      { numberInSurah: 1, text: first },
      { numberInSurah: 2, text: second }
    ]
  }
});

const createAcikPayload = (surahNumber) => ({
  data: {
    id: surahNumber,
    verses: [
      { verse_number: 1, transcription: 'Okunus 1' },
      { verse_number: 2, transcription: 'Okunus 2' }
    ]
  }
});

describe('quranService', () => {
  beforeEach(() => {
    storageMock.reset();
    fetchMock.mockReset();
    Object.values(loggerMock).forEach((mockFn) => mockFn.mockClear());
  });

  it('builds tr.vakfi surah data from official meal and Acik Kuran transliteration', async () => {
    fetchMock.mockImplementation((url) => {
      if (url === 'https://api.alquran.cloud/v1/surah/1') {
        return Promise.resolve(jsonResponse(createArabicPayload(1)));
      }
      if (url === 'https://api.alquran.cloud/v1/surah/1/tr.vakfi') {
        return Promise.resolve(jsonResponse(createTranslationPayload(1, 'Resmi Vakif 1', 'Resmi Vakif 2')));
      }
      if (url === 'https://api.acikkuran.com/surah/1') {
        return Promise.resolve(jsonResponse(createAcikPayload(1)));
      }

      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    const result = await getSurahComplete(1, 'tr.vakfi');

    expect(result.number).toBe(1);
    expect(result.ayahs[0]).toMatchObject({
      number: 1,
      arabic: 'ARABIC_1',
      translation: 'Resmi Vakif 1',
      transliteration: 'Okunus 1'
    });
    expect(result.ayahs[1].translation).toBe('Resmi Vakif 2');
    expect(storageMock.setItem).toHaveBeenCalledWith(
      'quran_surah_v5_1_tr.vakfi',
      expect.objectContaining({
        data: expect.objectContaining({ number: 1 }),
        timestamp: expect.any(Number)
      })
    );
  });

  it('keeps official meal when transliteration fetch fails', async () => {
    fetchMock.mockImplementation((url) => {
      if (url === 'https://api.alquran.cloud/v1/surah/2') {
        return Promise.resolve(jsonResponse(createArabicPayload(2)));
      }
      if (url === 'https://api.alquran.cloud/v1/surah/2/tr.vakfi') {
        return Promise.resolve(jsonResponse(createTranslationPayload(2, 'Meal 1', 'Meal 2')));
      }
      if (url === 'https://api.acikkuran.com/surah/2') {
        return Promise.reject(new Error('Acik Kuran unavailable'));
      }

      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    const result = await getSurahComplete(2, 'tr.vakfi');

    expect(result.number).toBe(2);
    expect(result.ayahs[0].translation).toBe('Meal 1');
    expect(result.ayahs[0].transliteration).toBe('');
    expect(loggerMock.warn).toHaveBeenCalled();
  });

  it('rejects payloads that return the wrong surah number', async () => {
    fetchMock.mockImplementation((url) => {
      if (url === 'https://api.alquran.cloud/v1/surah/1') {
        return Promise.resolve(jsonResponse(createArabicPayload(2)));
      }
      if (url === 'https://api.alquran.cloud/v1/surah/1/tr.vakfi') {
        return Promise.resolve(jsonResponse(createTranslationPayload(1)));
      }
      if (url === 'https://api.acikkuran.com/surah/1') {
        return Promise.resolve(jsonResponse(createAcikPayload(1)));
      }

      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    const result = await getSurahComplete(1, 'tr.vakfi');

    expect(result).toBeNull();
    expect(storageMock.setItem).not.toHaveBeenCalled();
    expect(loggerMock.error).toHaveBeenCalled();
  });

  it('returns only a single Turkish translation option', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        code: 200,
        data: [
          { identifier: 'tr.vakfi', name: 'Original Vakif', language: 'tr', type: 'translation' },
          { identifier: 'tr.diyanet', name: 'Original Diyanet', language: 'tr', type: 'translation' },
          { identifier: 'tr.foo', name: 'Other Turkish', language: 'tr', type: 'translation' }
        ]
      })
    );

    const translations = await getAvailableTranslations();
    const identifiers = translations.map((translation) => translation.identifier);

    expect(identifiers).toContain('tr.vakfi');
    expect(identifiers).not.toContain('tr.diyanet');
    expect(identifiers.filter((identifier) => identifier.startsWith('tr.'))).toEqual(['tr.vakfi']);
    expect(identifiers.slice(0, 3)).toEqual(['tr.vakfi', 'en.sahih', 'ar.jalalayn']);
  });

  it('keeps the Vakif Turkish option even if the editions API omits it', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        code: 200,
        data: [
          { identifier: 'tr.foo', name: 'Other Turkish', language: 'tr', type: 'translation' }
        ]
      })
    );

    const translations = await getAvailableTranslations();

    expect(translations[0]).toMatchObject({
      identifier: 'tr.vakfi',
      name: 'Diyanet Vakfı (Türkçe)',
      language: 'tr',
      type: 'translation'
    });
    expect(translations.map((translation) => translation.identifier)).toEqual([
      'tr.vakfi',
      'en.sahih',
      'ar.jalalayn'
    ]);
  });

  it('discards mismatched cached surahs before refetching', async () => {
    storageMock.seed('quran_surah_v5_1_tr.vakfi', {
      data: { number: 99, ayahs: [] },
      timestamp: Date.now()
    });

    fetchMock.mockImplementation((url) => {
      if (url === 'https://api.alquran.cloud/v1/surah/1') {
        return Promise.resolve(jsonResponse(createArabicPayload(1)));
      }
      if (url === 'https://api.alquran.cloud/v1/surah/1/tr.vakfi') {
        return Promise.resolve(jsonResponse(createTranslationPayload(1)));
      }
      if (url === 'https://api.acikkuran.com/surah/1') {
        return Promise.resolve(jsonResponse(createAcikPayload(1)));
      }

      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    const result = await getSurahComplete(1, 'tr.vakfi');

    expect(storageMock.removeItem).toHaveBeenCalledWith('quran_surah_v5_1_tr.vakfi');
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result.number).toBe(1);
  });
});
