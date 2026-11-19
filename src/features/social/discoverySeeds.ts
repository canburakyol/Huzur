import i18n from '../../i18n';
interface HatimDiscoverySeed {
  id: string;
  name: string;
  description: string;
  totalParts: number;
  completedParts: number;
  progressPercent: number;
  memberCount: number;
  isMember: boolean;
  isSeed: true;
  seedSource: string;
  createdAtMs: number;
}

interface DuaDiscoverySeed {
  id: string;
  text: string;
  isAnonymous: boolean;
  authorName: string;
  aminCount: number;
  isSeed: true;
  seedSource: string;
  featured: boolean;
  createdAtMs: number;
}

interface FamilyDiscoverySeed {
  id: string;
  name: string;
  isSeed: true;
  seedSource: string;
  createdAtMs: number;
}

export const HATIM_DISCOVERY_SEEDS: HatimDiscoverySeed[] = [
  {
    id: 'seed-hatim-sabir',
    get name() { return i18n.t('socialSeeds.seed-hatim-sabir.name'); },
    get description() { return i18n.t('socialSeeds.seed-hatim-sabir.description'); },
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
    get name() { return i18n.t('socialSeeds.seed-hatim-cuma.name'); },
    get description() { return i18n.t('socialSeeds.seed-hatim-cuma.description'); },
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

export const DUA_DISCOVERY_SEEDS: DuaDiscoverySeed[] = [
  {
    id: 'seed-dua-sehri',
    get text() { return i18n.t('socialSeeds.seed-dua-sehri.text'); },
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
    get text() { return i18n.t('socialSeeds.seed-dua-rahmet.text'); },
    isAnonymous: false,
    authorName: 'Topluluktan one cikan',
    aminCount: 96,
    isSeed: true,
    seedSource: 'huzur',
    featured: true,
    createdAtMs: Date.parse('2026-03-13T19:45:00.000Z'),
  },
];

export const FAMILY_DISCOVERY_SEEDS: FamilyDiscoverySeed[] = [
  {
    id: 'seed-family-dua',
    get name() { return i18n.t('socialSeeds.seed-family-dua.name'); },
    isSeed: true,
    seedSource: 'huzur',
    createdAtMs: Date.parse('2026-03-09T09:00:00.000Z'),
  },
  {
    id: 'seed-family-bereket',
    get name() { return i18n.t('socialSeeds.seed-family-bereket.name'); },
    isSeed: true,
    seedSource: 'huzur',
    createdAtMs: Date.parse('2026-03-11T18:30:00.000Z'),
  },
];
