// Builds src/data/wordMorphology.json from Quranic Arabic Corpus v0.4 (Buckwalter).
// usage: node scripts/build-word-morphology.mjs <quranic-corpus-morphology-0.4.txt>
// Source file: corpus.quran.com/download (keep its copyright block; see src/data/wordMorphology.ts).
import fs from 'node:fs';

const SRC = process.argv[2];
const OUT = new URL('../src/data/wordMorphology.json', import.meta.url);
const SURAHS = [1, 112, 113, 114];
const BW = {
  "'": 'ء', '>': 'أ', '&': 'ؤ', '<': 'إ', '}': 'ئ', A: 'ا', b: 'ب', p: 'ة', t: 'ت', v: 'ث', j: 'ج', H: 'ح', x: 'خ',
  d: 'د', '*': 'ذ', r: 'ر', z: 'ز', s: 'س', $: 'ش', S: 'ص', D: 'ض', T: 'ط', Z: 'ظ', E: 'ع', g: 'غ', _: 'ـ', f: 'ف',
  q: 'ق', k: 'ك', l: 'ل', m: 'م', n: 'ن', h: 'ه', w: 'و', Y: 'ى', y: 'ي', F: 'ً', N: 'ٌ', K: 'ٍ', a: 'َ', u: 'ُ',
  i: 'ِ', '~': 'ّ', o: 'ْ', '`': 'ٰ', '{': 'ٱ', '^': 'ٓ', '#': 'ٔ',
};
const ar = (s) => [...s].map((c) => BW[c] ?? '').join('');

// word key "s:v:w" -> { stem features, prefixes, suffixes }
const words = new Map();
for (const line of fs.readFileSync(SRC, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\((\d+):(\d+):(\d+):(\d+)\)\t([^\t]*)\t([^\t]*)\t(.*)$/);
  if (!m) continue;
  const [, s, v, w, , , tag, feats] = m;
  const key = `${s}:${v}:${w}`;
  if (!words.has(key)) words.set(key, { prefixes: [], suffixes: [] });
  const word = words.get(key);
  const parts = feats.split('|');
  if (parts[0] === 'PREFIX') word.prefixes.push(parts[1]);
  else if (parts[0] === 'SUFFIX') word.suffixes.push(parts.slice(1).join('|'));
  else if (parts[0] === 'STEM') {
    word.pos = tag;
    const feat = [];
    for (const p of parts.slice(2)) {
      if (p.startsWith('LEM:')) word.lemma = ar(p.slice(4));
      else if (p.startsWith('ROOT:')) word.root = [...ar(p.slice(5))].join(' ');
      else if (p.startsWith('MOOD:')) feat.push(`MOOD_${p.slice(5)}`);
      else if (/^\((\w+)\)$/.test(p)) feat.push(`FORM_${p.slice(1, -1)}`);
      else feat.push(p);
    }
    // ACT|PCPL / PASS|PCPL -> one tag
    word.features = feat.join('|').replace('ACT|PCPL', 'ACT_PCPL').replace('PASS|PCPL', 'PASS_PCPL').split('|').filter(Boolean);
  }
}

// whole-Quran counts so the panel can say how often a root/lemma occurs
const rootCount = new Map();
const lemmaCount = new Map();
const rootLemmas = new Map();
for (const w of words.values()) {
  if (w.lemma) lemmaCount.set(w.lemma, (lemmaCount.get(w.lemma) || 0) + 1);
  if (!w.root) continue;
  rootCount.set(w.root, (rootCount.get(w.root) || 0) + 1);
  if (!rootLemmas.has(w.root)) rootLemmas.set(w.root, new Set());
  rootLemmas.get(w.root).add(w.lemma);
}

const out = {};
for (const s of SURAHS) {
  out[s] = {};
  for (const [key, w] of words) {
    const [ws] = key.split(':');
    if (+ws !== s) continue;
    const entry = { pos: w.pos, features: w.features };
    if (w.lemma) entry.lemma = w.lemma, entry.lemmaCount = lemmaCount.get(w.lemma);
    if (w.root) {
      entry.root = w.root;
      entry.rootCount = rootCount.get(w.root);
      entry.related = [...rootLemmas.get(w.root)]
        .filter((l) => l !== w.lemma)
        .sort((a, b) => lemmaCount.get(b) - lemmaCount.get(a))
        .slice(0, 4)
        .map((l) => [l, lemmaCount.get(l)]);
    }
    if (w.prefixes.length) entry.prefixes = w.prefixes;
    if (w.suffixes.length) entry.suffixes = w.suffixes;
    out[s][key.slice(key.indexOf(':') + 1)] = entry;
  }
}

// sanity: Fatiha well-known facts
const f = out[1];
console.assert(f['1:3'].root === 'ر ح م' && f['1:3'].pos === 'ADJ', 'rahman');
console.assert(f['5:4'].features.includes('FORM_X') && f['5:4'].root === 'ع و ن', 'nastain');
console.assert(f['2:1'].prefixes[0] === 'Al+', 'al-hamd');
console.log('words', words.size, 'rHm count', rootCount.get('ر ح م'), 'per surah', SURAHS.map((s) => Object.keys(out[s]).length));
fs.writeFileSync(OUT, JSON.stringify(out));
console.log('bytes', fs.statSync(OUT).size);
