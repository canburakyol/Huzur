import { storageService } from './storageService';
import { logger } from '../utils/logger';
import DIYANET_DISTRICTS from '../data/diyanetDistricts.json';

// --- Types ---

type DistrictMapping = {
  districtId: string;
  districtName: string;
  cityName: string;
}

// --- Constants ---

const STORAGE_KEY_DISTRICT = 'diyanet_selected_district';

const normalizeLocationName = (value: string): string => value
  .toLocaleLowerCase('tr-TR')
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .replace(/ı/g, 'i')
  .replace(/ö/g, 'o')
  .replace(/ü/g, 'u')
  .replace(/ş/g, 's')
  .replace(/ç/g, 'c')
  .replace(/ğ/g, 'g')
  .replace(/\(.*?\)/g, '')
  .replace(/[^a-z0-9]/g, '');

/**
 * Every Turkish district Diyanet publishes times for: { PROVINCE: [[DISTRICT, id], ...] }.
 * Generated from https://ezanvakti.emushaf.net/ilceler/{sehirId} (same ids as namazvakti.diyanet.gov.tr)
 * on 2026-11-19. The previous hand-written map had 110 of 118 ids pointing at other provinces.
 */
const DISTRICTS = DIYANET_DISTRICTS as Record<string, string[][]>;

// Central Istanbul districts have no own Diyanet entry; Diyanet publishes one time for them as İSTANBUL.
const ISTANBUL_CENTRAL = [
  'adalar', 'atasehir', 'bagcilar', 'bahcelievler', 'bakirkoy', 'bayrampasa', 'besiktas', 'beykoz', 'beyoglu',
  'esenler', 'eyupsultan', 'eyup', 'fatih', 'gaziosmanpasa', 'gungoren', 'kadikoy', 'kagithane', 'sariyer',
  'sisli', 'umraniye', 'uskudar', 'zeytinburnu',
];

const BY_ID = new Map<string, DistrictMapping>();
const BY_NAME = new Map<string, DistrictMapping[]>();
for (const [province, districts] of Object.entries(DISTRICTS)) {
  for (const [name, id] of districts) {
    const mapping = { districtId: id, districtName: name, cityName: province };
    BY_ID.set(id, mapping);
    const key = normalizeLocationName(name);
    BY_NAME.set(key, [...(BY_NAME.get(key) || []), mapping]);
  }
}
// "MUĞLA" names both the province and its centre district; a province name means its centre.
for (const [province] of Object.entries(DISTRICTS)) {
  const key = normalizeLocationName(province);
  const centre = (BY_NAME.get(key) || []).filter((m) => m.cityName === province);
  if (centre.length === 1) BY_NAME.set(key, centre);
}

const DEFAULT_DISTRICT: DistrictMapping = BY_ID.get('9541') as DistrictMapping;
for (const name of ISTANBUL_CENTRAL) BY_NAME.set(name, [DEFAULT_DISTRICT]);

const isKnownDistrict = (mapping: DistrictMapping | null | undefined): mapping is DistrictMapping => (
  Boolean(mapping && BY_ID.get(mapping.districtId)?.districtName === mapping.districtName)
);

// --- Public API ---

/**
 * Gets the stored district ID. Stored values written by older versions (with wrong ids) are ignored.
 * Falls back to Istanbul only when nothing valid is stored.
 */
export const getSelectedDistrictId = (): string => getSelectedDistrict().districtId;

/** Gets the stored district, or Istanbul. */
export const getSelectedDistrict = (): DistrictMapping => {
  const stored = storageService.getItem<DistrictMapping>(STORAGE_KEY_DISTRICT);
  return isKnownDistrict(stored) ? stored : DEFAULT_DISTRICT;
};

/** True when a valid district was chosen on this device, not the Istanbul default. */
export const hasSelectedDistrict = (): boolean => isKnownDistrict(storageService.getItem<DistrictMapping>(STORAGE_KEY_DISTRICT));

/**
 * Finds the Diyanet district for a place name (district or province centre).
 * Returns null when the name is unknown or exists in more than one province, so callers can
 * fall back to calculating from coordinates instead of guessing a far-away district.
 */
export const findDistrictByName = (name: string): DistrictMapping | null => {
  if (!name) return null;
  const matches = BY_NAME.get(normalizeLocationName(name)) || [];
  return matches.length === 1 ? matches[0] : null;
};

/** Sets the selected district by place name. */
export const setDistrictByKey = (key: string): DistrictMapping | null => {
  const mapping = findDistrictByName(key);
  if (!mapping) {
    logger.warn(`[DiyanetLocation] No mapping found for key: ${key}`);
    return null;
  }

  storageService.setItem(STORAGE_KEY_DISTRICT, mapping);
  logger.log(`[DiyanetLocation] District set to: ${mapping.districtName} (${mapping.districtId})`);
  return mapping;
};

/** Sets the selected district by district ID directly. */
export const setDistrictById = (districtId: string, districtName = 'Bilinmeyen', cityName = ''): void => {
  const mapping: DistrictMapping = { districtId, districtName, cityName };
  storageService.setItem(STORAGE_KEY_DISTRICT, mapping);
  logger.log(`[DiyanetLocation] District set by ID: ${districtName} (${districtId})`);
};

/** Returns all Diyanet districts. */
export const getAllDistricts = (): DistrictMapping[] => [...BY_ID.values()];

export default {
  getSelectedDistrictId,
  getSelectedDistrict,
  hasSelectedDistrict,
  setDistrictByKey,
  setDistrictById,
  findDistrictByName,
  getAllDistricts,
};
