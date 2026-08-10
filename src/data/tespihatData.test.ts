import { describe, expect, it } from 'vitest';
import { OPTIONAL_QURAN_DUALAR, TESPIHAT_SECTIONS } from './tespihatData';

describe('tespihat source integrity', () => {
  it('keeps Ayet al-Kursi as Qur’an 2:255 without an added basmala', () => {
    const ayetelKursi = TESPIHAT_SECTIONS.find((section) => section.id === 'ayetel-kursi');

    expect(ayetelKursi).toMatchObject({ sourceType: 'quran', citation: 'Kur’an 2:255' });
    expect(ayetelKursi?.arabic).toMatch(/^ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ/);
    expect(ayetelKursi?.arabic).not.toContain('بِسْمِ');
  });

  it('cites Sahih Muslim 591 for the prescribed istighfar and salam', () => {
    const istigfar = TESPIHAT_SECTIONS.find((section) => section.id === 'istigfar');
    const salam = TESPIHAT_SECTIONS.find((section) => section.id === 'entes-selam');

    expect(istigfar).toMatchObject({ count: 3, arabic: 'أَسْتَغْفِرُ اللَّهَ', sourceType: 'hadith', citation: 'Sahih Muslim 591' });
    expect(salam).toMatchObject({ sourceType: 'hadith', citation: 'Sahih Muslim 591' });
  });

  it('identifies Quran duas as optional and cites their verses', () => {
    expect(OPTIONAL_QURAN_DUALAR).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'rabbena1', sourceType: 'quran', citation: 'Kur’an 2:201', optional: true }),
      expect.objectContaining({ id: 'rabbena2', sourceType: 'quran', citation: 'Kur’an 14:41', optional: true }),
      expect.objectContaining({ id: 'rabbi-inni', sourceType: 'quran', citation: 'Kur’an 28:24', optional: true }),
      expect.objectContaining({ id: 'rabbi-habli', sourceType: 'quran', citation: 'Kur’an 3:38', optional: true }),
    ]));
  });
});
