export const HATIM_DISCOVERY_SEEDS = [
  {
    id: 'seed-hatim-sabir',
    name: 'Huzur Toplulugu Sabir Hatmi',
    description: 'Zor zamanlardan gecenler icin birlikte niyet edilen acik hatim halkasi.',
    totalParts: 30,
    completedParts: 18,
    progressPercent: 60,
    memberCount: 24,
    isMember: false,
    isSeed: true,
    seedSource: 'huzur',
    createdAtMs: Date.parse('2026-03-10T08:00:00.000Z'),
  },
  {
    id: 'seed-hatim-cuma',
    name: 'Cuma Bereket Hatmi',
    description: 'Cuma gunu dualarinda bulusmak isteyenler icin haftalik topluluk hatmi.',
    totalParts: 30,
    completedParts: 9,
    progressPercent: 30,
    memberCount: 17,
    isMember: false,
    isSeed: true,
    seedSource: 'huzur',
    createdAtMs: Date.parse('2026-03-12T11:30:00.000Z'),
  },
];

export const DUA_DISCOVERY_SEEDS = [
  {
    id: 'seed-dua-sehri',
    text: 'Bugun niyet ettigimiz her hayrin kabul olmasi ve kalplerimize huzur dolmasi icin dua ediyoruz.',
    isAnonymous: false,
    authorName: 'Huzur Toplulugu',
    aminCount: 142,
    isSeed: true,
    seedSource: 'huzur',
    featured: true,
    createdAtMs: Date.parse('2026-03-14T07:30:00.000Z'),
  },
  {
    id: 'seed-dua-rahmet',
    text: 'Hasta olanlara sifa, daralan gonullere ferahlama ve ailelerimize rahmet diliyoruz.',
    isAnonymous: false,
    authorName: 'Topluluktan one cikan',
    aminCount: 96,
    isSeed: true,
    seedSource: 'huzur',
    featured: true,
    createdAtMs: Date.parse('2026-03-13T19:45:00.000Z'),
  },
];

export const FAMILY_DISCOVERY_SEEDS = [
  {
    id: 'seed-family-dua',
    name: 'Huzur Dua Cemberi',
    isSeed: true,
    seedSource: 'huzur',
    createdAtMs: Date.parse('2026-03-09T09:00:00.000Z'),
  },
  {
    id: 'seed-family-bereket',
    name: 'Bereket Sofrasi Ailesi',
    isSeed: true,
    seedSource: 'huzur',
    createdAtMs: Date.parse('2026-03-11T18:30:00.000Z'),
  },
];
