// Word morphology from the Quranic Arabic Corpus v0.4 (Kais Dukes, GNU GPL, corpus.quran.com).
// Its terms allow use in any application if the source is named and linked; the panel does both.
// Generated per surah; regenerate with scripts/build-word-morphology.mjs when more surahs get word meanings.
import data from './wordMorphology.json';

export interface WordMorphology {
  pos: string;
  features: string[];
  lemma?: string;
  lemmaCount?: number;
  root?: string;
  rootCount?: number;
  related?: [string, number][];
  prefixes?: string[];
  suffixes?: string[];
}

export const MORPHOLOGY_SOURCE_URL = 'https://corpus.quran.com';

const MORPHOLOGY = data as unknown as Record<string, Record<string, WordMorphology>>;

export const getWordMorphology = (surah: number, ayah: number, word: number): WordMorphology | null =>
  MORPHOLOGY[surah]?.[`${ayah}:${word}`] ?? null;

type T = (key: string, fallback: string, options?: Record<string, unknown>) => string;

// "3MS" -> person 3, masculine, singular. Plain "M"/"MP"/"FS" have no person.
const describePgn = (tag: string, t: T): string | null => {
  const m = tag.match(/^([123])?([MF])?([SDP])?$/);
  if (!m || !tag) return null;
  const [, person, gender, number] = m;
  return [
    person && t(`wordByWord.morph.person.${person}`, `${person}. şahıs`),
    gender && t(`wordByWord.morph.gender.${gender}`, gender),
    number && t(`wordByWord.morph.number.${number}`, number),
  ].filter(Boolean).join(' ');
};

const describeFeature = (tag: string, t: T): string | null => {
  if (tag.startsWith('FORM_')) return t('wordByWord.morph.form', '{{form}}. bab', { form: tag.slice(5) });
  return describePgn(tag, t) ?? (FEATURES.has(tag) ? t(`wordByWord.morph.feature.${tag}`, tag) : null);
};

const FEATURES = new Set(['PERF', 'IMPF', 'IMPV', 'PASS', 'ACT_PCPL', 'PASS_PCPL', 'VN', 'NOM', 'ACC', 'GEN', 'INDEF', 'MOOD_JUS', 'MOOD_SUBJ']);
const PREFIXES: Record<string, string> = { 'Al+': 'al', 'bi+': 'bi', 'l:P+': 'li', 'w:CONJ+': 'wa', 'f:CONJ+': 'fa', 'ka+': 'ka', 'sa+': 'sa' };

export const describeMorphology = (m: WordMorphology, t: T) => {
  const affixes = (m.prefixes || [])
    .map((p) => (PREFIXES[p] ? t(`wordByWord.morph.prefix.${PREFIXES[p]}`, p) : null))
    .concat((m.suffixes || []).map((s) => {
      const pgn = s.startsWith('PRON:') ? describePgn(s.slice(5), t) : null;
      return pgn ? t('wordByWord.morph.pronounSuffix', 'zamir eki ({{who}})', { who: pgn }) : null;
    }))
    .filter((x): x is string => Boolean(x));
  return {
    pos: t(`wordByWord.morph.pos.${m.pos}`, m.pos),
    grammar: m.features.map((f) => describeFeature(f, t)).filter((x): x is string => Boolean(x)),
    affixes,
  };
};
