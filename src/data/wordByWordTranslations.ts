// en/de/id copy for wordByWordData. Words are listed per surah in the same order as in the data file.
import type { SurahWordData } from './wordByWordData';

type Lang = 'en' | 'de' | 'id';
type Word = [translit: string, en: string, de: string, id: string];

const SURAHS: Record<number, { name: string; meaning: Record<Lang, string>; words: Word[] }> = {
  1: {
    name: 'Al-Fatihah',
    meaning: { en: 'The Opening', de: 'Die Eröffnende', id: 'Pembukaan' },
    words: [
      ['Bismi', 'In the name', 'Im Namen', 'Dengan nama'],
      ['Allahi', 'of Allah', 'Allahs', 'Allah'],
      ['ar-Rahmani', 'the Entirely Merciful', 'des Allerbarmers', 'Yang Maha Pengasih'],
      ['ar-Rahimi', 'the Especially Merciful', 'des Barmherzigen', 'Yang Maha Penyayang'],
      ['al-Hamdu', 'All praise', 'Alles Lob', 'Segala puji'],
      ['lillahi', 'belongs to Allah', 'gehört Allah', 'bagi Allah'],
      ['Rabbi', 'Lord', 'dem Herrn', 'Tuhan'],
      ["al-'alamin", 'of the worlds', 'der Welten', 'semesta alam'],
      ['ar-Rahmani', 'the Entirely Merciful', 'dem Allerbarmer', 'Yang Maha Pengasih'],
      ['ar-Rahimi', 'the Especially Merciful', 'dem Barmherzigen', 'Yang Maha Penyayang'],
      ['Maliki', 'Sovereign', 'dem Herrscher', 'Pemilik'],
      ['yawmi', 'of the Day', 'am Tag', 'hari'],
      ['ad-din', 'of Recompense', 'des Gerichts', 'pembalasan'],
      ['Iyyaka', 'You alone', 'Dir allein', 'Hanya kepada-Mu'],
      ["na'budu", 'we worship', 'dienen wir', 'kami menyembah'],
      ['wa iyyaka', 'and You alone', 'und zu Dir allein', 'dan hanya kepada-Mu'],
      ["nasta'in", 'we ask for help', 'flehen wir um Hilfe', 'kami memohon pertolongan'],
      ['Ihdina', 'Guide us', 'Leite uns', 'Tunjukilah kami'],
      ['as-sirata', 'to the path', 'den Weg', 'jalan'],
      ['al-mustaqim', 'the straight', 'geraden', 'yang lurus'],
      ['Sirata', 'The path', 'Den Weg', 'Jalan'],
      ['alladhina', 'of those', 'derjenigen', 'orang-orang yang'],
      ["an'amta", 'You have favoured', 'denen Du Gunst erwiesen hast', 'telah Engkau beri nikmat'],
      ["'alayhim", 'upon them', 'ihnen', 'kepada mereka'],
      ['ghayri', 'not', 'nicht', 'bukan'],
      ['al-maghdubi', 'of those who earned anger', 'derjenigen, die Zorn erregt haben', 'mereka yang dimurkai'],
      ["'alayhim", 'upon them', 'gegen sie', 'atas mereka'],
      ['wa la', 'and not', 'und nicht', 'dan bukan'],
      ['ad-dallin', 'of those astray', 'der Irregehenden', 'mereka yang sesat'],
    ],
  },
  112: {
    name: 'Al-Ikhlas',
    meaning: { en: 'Sincerity', de: 'Die Aufrichtigkeit', id: 'Memurnikan Keesaan Allah' },
    words: [
      ['Qul', 'Say', 'Sag', 'Katakanlah'],
      ['huwa', 'He', 'Er', 'Dia'],
      ['Allahu', 'is Allah', 'ist Allah', 'Allah'],
      ['ahad', 'the One', 'ein Einer', 'Yang Maha Esa'],
      ['Allahu', 'Allah', 'Allah', 'Allah'],
      ['as-Samad', 'the Eternal Refuge (all depend on Him)', 'der Überlegene (alle bedürfen Seiner)', 'tempat bergantung segala sesuatu'],
      ['Lam', 'not', 'nicht', 'tidak'],
      ['yalid', 'He begets', 'hat gezeugt', 'beranak'],
      ['wa lam', 'and not', 'und nicht', 'dan tidak'],
      ['yulad', 'is He born', 'ist gezeugt worden', 'diperanakkan'],
      ['Wa lam', 'And not', 'Und nicht', 'Dan tidak'],
      ['yakun', 'is there', 'ist', 'ada'],
      ['lahu', 'to Him', 'Ihm', 'bagi-Nya'],
      ['kufuwan', 'equivalent', 'gleich', 'setara'],
      ['ahad', 'any', 'jemand', 'seorang pun'],
    ],
  },
  113: {
    name: 'Al-Falaq',
    meaning: { en: 'The Daybreak', de: 'Das Morgengrauen', id: 'Waktu Subuh' },
    words: [
      ['Qul', 'Say', 'Sag', 'Katakanlah'],
      ["a'udhu", 'I seek refuge', 'Ich nehme Zuflucht', 'aku berlindung'],
      ['bi-Rabbi', 'in the Lord', 'beim Herrn', 'kepada Tuhan'],
      ['al-falaq', 'of daybreak', 'des Morgengrauens', 'yang menguasai subuh'],
      ['Min', 'from', 'vor', 'dari'],
      ['sharri', 'the evil', 'dem Übel', 'kejahatan'],
      ['ma', 'of that which', 'dessen, was', 'apa yang'],
      ['khalaq', 'He created', 'Er erschaffen hat', 'Dia ciptakan'],
      ['Wa min', 'And from', 'Und vor', 'Dan dari'],
      ['sharri', 'the evil', 'dem Übel', 'kejahatan'],
      ['ghasiqin', 'of darkness', 'der Finsternis', 'malam'],
      ['idha', 'when', 'wenn', 'apabila'],
      ['waqab', 'it settles', 'sie hereinbricht', 'telah gelap gulita'],
      ['Wa min', 'And from', 'Und vor', 'Dan dari'],
      ['sharri', 'the evil', 'dem Übel', 'kejahatan'],
      ['an-naffathati', 'of the blowers', 'der Bläserinnen', 'wanita-wanita tukang sihir yang meniup'],
      ['fi', 'in', 'in', 'pada'],
      ["al-'uqad", 'knots', 'die Knoten', 'buhul-buhul'],
      ['Wa min', 'And from', 'Und vor', 'Dan dari'],
      ['sharri', 'the evil', 'dem Übel', 'kejahatan'],
      ['hasidin', 'of an envier', 'eines Neiders', 'orang yang dengki'],
      ['idha', 'when', 'wenn', 'apabila'],
      ['hasad', 'he envies', 'er neidet', 'ia dengki'],
    ],
  },
  114: {
    name: 'An-Nas',
    meaning: { en: 'Mankind', de: 'Die Menschen', id: 'Manusia' },
    words: [
      ['Qul', 'Say', 'Sag', 'Katakanlah'],
      ["a'udhu", 'I seek refuge', 'Ich nehme Zuflucht', 'aku berlindung'],
      ['bi-Rabbi', 'in the Lord', 'beim Herrn', 'kepada Tuhan'],
      ['an-nas', 'of mankind', 'der Menschen', 'manusia'],
      ['Maliki', 'the Sovereign', 'dem König', 'Raja'],
      ['an-nas', 'of mankind', 'der Menschen', 'manusia'],
      ['Ilahi', 'the God', 'dem Gott', 'Sembahan'],
      ['an-nas', 'of mankind', 'der Menschen', 'manusia'],
      ['Min', 'from', 'vor', 'dari'],
      ['sharri', 'the evil', 'dem Übel', 'kejahatan'],
      ['al-waswasi', 'of the whisperer', 'des Einflüsterers', 'bisikan'],
      ['al-khannas', 'who withdraws', 'des Davonschleichenden', 'yang bersembunyi'],
      ['Alladhi', 'Who', 'der', 'yang'],
      ['yuwaswisu', 'whispers', 'einflüstert', 'membisikkan'],
      ['fi', 'into', 'in', 'ke dalam'],
      ['suduri', 'the breasts', 'die Brüste', 'dada'],
      ['an-nas', 'of mankind', 'der Menschen', 'manusia'],
      ['Mina', 'from among', 'von', 'dari'],
      ['al-jinnati', 'the jinn', 'den Dschinn', 'golongan jin'],
      ['wan-nas', 'and mankind', 'und den Menschen', 'dan manusia'],
    ],
  },
};

const COL: Record<Lang, number> = { en: 1, de: 2, id: 3 };

/** Returns `data` with names, meanings and words in `language`; Turkish/unknown returns it unchanged. */
export const localizeWordByWord = (data: SurahWordData | null, surahNumber: number | null, language: string): SurahWordData | null => {
  const lang = language.slice(0, 2) as Lang;
  const entry = surahNumber ? SURAHS[surahNumber] : undefined;
  if (!data || !entry || !(lang in COL)) return data;
  let i = 0;
  return {
    ...data,
    name: entry.name,
    meaning: entry.meaning[lang],
    verses: data.verses.map((verse) => ({
      ...verse,
      words: verse.words.map((word) => {
        const row = entry.words[i++];
        return row ? { ...word, transliteration: row[0], meaning: row[COL[lang]] } : word;
      }),
    })),
  };
};

export const WORD_BY_WORD_COUNTS = Object.fromEntries(Object.entries(SURAHS).map(([n, s]) => [n, s.words.length]));
