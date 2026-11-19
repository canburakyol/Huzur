// Excerpts matching the Arabic in moodData; Sahih International, Bubenheim & Elyas and Kemenag RI.
import { SURAH_NAMES_LATIN } from './surahList';
import type { MoodAyah } from './moodData';

type Lang = 'en' | 'de' | 'id';

const EXCERPTS: Record<string, Record<Lang, string>> = {
  '14:7': { en: 'If you are grateful, I will surely increase you [in favor].', de: 'Wenn ihr dankbar seid, werde Ich euch ganz gewiß noch mehr (Gunst) erweisen.', id: 'Sesungguhnya jika kamu bersyukur, pasti Kami akan menambah (nikmat) kepadamu.' },
  '93:11': { en: 'But as for the favor of your Lord, report [it].', de: 'Und was die Gunst deines Herrn angeht, so erzähle (davon).', id: 'Dan terhadap nikmat Tuhanmu, maka hendaklah kamu siarkan.' },
  '94:5': { en: 'For indeed, with hardship [will be] ease.', de: 'Also gewiß, mit der Erschwernis ist Erleichterung.', id: 'Karena sesungguhnya sesudah kesulitan itu ada kemudahan.' },
  '2:286': { en: 'Allah does not charge a soul except [with that within] its capacity.', de: 'Allah erlegt keiner Seele mehr auf, als sie zu leisten vermag.', id: 'Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya.' },
  '9:40': { en: 'Do not grieve; indeed Allah is with us.', de: 'Sei nicht traurig! Gewiß, Allah ist mit uns!', id: 'Janganlah kamu berduka cita, sesungguhnya Allah beserta kita.' },
  '13:28': { en: 'Unquestionably, by the remembrance of Allah hearts are assured.', de: 'Sicherlich, im Gedenken Allahs finden die Herzen Ruhe!', id: 'Ingatlah, hanya dengan mengingati Allah-lah hati menjadi tenteram.' },
  '65:3': { en: 'And whoever relies upon Allah – then He is sufficient for him.', de: 'Und wer sich auf Allah verläßt, dem ist Er seine Genüge.', id: 'Dan barangsiapa yang bertawakkal kepada Allah niscaya Allah akan mencukupkan (keperluan)nya.' },
  '3:134': { en: 'Who restrain anger and who pardon the people.', de: 'Die ihren Grimm zurückhalten und den Menschen verzeihen.', id: 'Orang-orang yang menahan amarahnya dan memaafkan (kesalahan) orang.' },
  '7:199': { en: 'Take what is given freely, enjoin what is good, and turn away from the ignorant.', de: 'Nimm den Überschuß, gebiete das allgemein Gute und wende dich von den Toren ab!', id: "Jadilah engkau pemaaf dan suruhlah orang mengerjakan yang ma'ruf, serta berpalinglah dari pada orang-orang yang bodoh." },
  '2:153': { en: 'Indeed, Allah is with the patient.', de: 'Allah ist mit den Standhaften.', id: 'Sesungguhnya Allah beserta orang-orang yang sabar.' },
  '4:28': { en: 'And mankind was created weak.', de: 'Denn der Mensch ist (ja) schwach erschaffen.', id: 'Dan manusia dijadikan bersifat lemah.' },
};

/** Returns the ayah with surah name and translation in `language`; Turkish/unknown is unchanged. */
export const localizeMoodAyah = (ayah: MoodAyah, language: string): MoodAyah => {
  const lang = language.slice(0, 2) as Lang;
  const excerpt = EXCERPTS[`${ayah.surahNumber}:${ayah.ayah}`]?.[lang];
  if (!excerpt) return ayah;
  return { ...ayah, surah: SURAH_NAMES_LATIN[ayah.surahNumber - 1] ?? ayah.surah, translation: excerpt };
};

export const MOOD_EXCERPT_KEYS = Object.keys(EXCERPTS);
