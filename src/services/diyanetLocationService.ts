import { storageService } from './storageService';
import { logger } from '../utils/logger';

// --- Types ---

interface DistrictMapping {
  districtId: string;
  districtName: string;
  cityName: string;
}

// --- Constants ---

const STORAGE_KEY_DISTRICT = 'diyanet_selected_district';

/**
 * Hardcoded map of major Turkish cities/districts to Diyanet district IDs.
 * These IDs correspond to the `/vakitler/{ilce_id}` endpoint on emushaf.net.
 * Source: https://ezanvakti.emushaf.net/ilceler/{sehir_id}
 */
const TURKEY_DISTRICT_MAP: Record<string, DistrictMapping> = {
  // Istanbul districts
  'istanbul': { districtId: '9541', districtName: 'İstanbul', cityName: 'İstanbul' },
  'kadikoy': { districtId: '9530', districtName: 'Kadıköy', cityName: 'İstanbul' },
  'uskudar': { districtId: '9551', districtName: 'Üsküdar', cityName: 'İstanbul' },
  'besiktas': { districtId: '9519', districtName: 'Beşiktaş', cityName: 'İstanbul' },
  'fatih': { districtId: '9525', districtName: 'Fatih', cityName: 'İstanbul' },
  'bakirkoy': { districtId: '9517', districtName: 'Bakırköy', cityName: 'İstanbul' },
  'beyoglu': { districtId: '9521', districtName: 'Beyoğlu', cityName: 'İstanbul' },
  'sisli': { districtId: '9547', districtName: 'Şişli', cityName: 'İstanbul' },
  'atasehir': { districtId: '20553', districtName: 'Ataşehir', cityName: 'İstanbul' },
  'umraniye': { districtId: '9550', districtName: 'Ümraniye', cityName: 'İstanbul' },
  'pendik': { districtId: '9538', districtName: 'Pendik', cityName: 'İstanbul' },
  'maltepe': { districtId: '9534', districtName: 'Maltepe', cityName: 'İstanbul' },
  'kartal': { districtId: '9531', districtName: 'Kartal', cityName: 'İstanbul' },
  'tuzla': { districtId: '9549', districtName: 'Tuzla', cityName: 'İstanbul' },
  'sultanbeyli': { districtId: '9548', districtName: 'Sultanbeyli', cityName: 'İstanbul' },
  'sancaktepe': { districtId: '20554', districtName: 'Sancaktepe', cityName: 'İstanbul' },
  'cekmekoy': { districtId: '9523', districtName: 'Çekmeköy', cityName: 'İstanbul' },
  'beykoz': { districtId: '9520', districtName: 'Beykoz', cityName: 'İstanbul' },
  'sariyer': { districtId: '9543', districtName: 'Sarıyer', cityName: 'İstanbul' },
  'eyupsultan': { districtId: '9524', districtName: 'Eyüpsultan', cityName: 'İstanbul' },
  'kagithane': { districtId: '9529', districtName: 'Kağıthane', cityName: 'İstanbul' },
  'beylikduzu': { districtId: '20551', districtName: 'Beylikdüzü', cityName: 'İstanbul' },
  'esenyurt': { districtId: '20552', districtName: 'Esenyurt', cityName: 'İstanbul' },
  'avcilar': { districtId: '9516', districtName: 'Avcılar', cityName: 'İstanbul' },
  'kucukcekmece': { districtId: '9533', districtName: 'Küçükçekmece', cityName: 'İstanbul' },
  'bahcelievler': { districtId: '9518', districtName: 'Bahçelievler', cityName: 'İstanbul' },
  'bagcilar': { districtId: '9515', districtName: 'Bağcılar', cityName: 'İstanbul' },
  'gungoren': { districtId: '9528', districtName: 'Güngören', cityName: 'İstanbul' },
  'zeytinburnu': { districtId: '9553', districtName: 'Zeytinburnu', cityName: 'İstanbul' },
  'esenler': { districtId: '9526', districtName: 'Esenler', cityName: 'İstanbul' },
  'gaziosmanpasa': { districtId: '9527', districtName: 'Gaziosmanpaşa', cityName: 'İstanbul' },
  'sultangazi': { districtId: '20555', districtName: 'Sultangazi', cityName: 'İstanbul' },
  'buyukcekmece': { districtId: '9522', districtName: 'Büyükçekmece', cityName: 'İstanbul' },
  'catalca': { districtId: '9552', districtName: 'Çatalca', cityName: 'İstanbul' },
  'silivri': { districtId: '9546', districtName: 'Silivri', cityName: 'İstanbul' },
  'arnavutkoy': { districtId: '20550', districtName: 'Arnavutköy', cityName: 'İstanbul' },
  'basaksehir': { districtId: '20556', districtName: 'Başakşehir', cityName: 'İstanbul' },

  // Major cities (merkez / il geneli)
  'ankara': { districtId: '9206', districtName: 'Ankara', cityName: 'Ankara' },
  'izmir': { districtId: '9560', districtName: 'İzmir', cityName: 'İzmir' },
  'bursa': { districtId: '9335', districtName: 'Bursa', cityName: 'Bursa' },
  'antalya': { districtId: '9225', districtName: 'Antalya', cityName: 'Antalya' },
  'adana': { districtId: '9146', districtName: 'Adana', cityName: 'Adana' },
  'konya': { districtId: '9609', districtName: 'Konya', cityName: 'Konya' },
  'gaziantep': { districtId: '9459', districtName: 'Gaziantep', cityName: 'Gaziantep' },
  'sanliurfa': { districtId: '9755', districtName: 'Şanlıurfa', cityName: 'Şanlıurfa' },
  'kocaeli': { districtId: '9597', districtName: 'Kocaeli', cityName: 'Kocaeli' },
  'mersin': { districtId: '9504', districtName: 'Mersin', cityName: 'Mersin' },
  'diyarbakir': { districtId: '9384', districtName: 'Diyarbakır', cityName: 'Diyarbakır' },
  'kayseri': { districtId: '9580', districtName: 'Kayseri', cityName: 'Kayseri' },
  'eskisehir': { districtId: '9440', districtName: 'Eskişehir', cityName: 'Eskişehir' },
  'sakarya': { districtId: '9737', districtName: 'Sakarya', cityName: 'Sakarya' },
  'samsun': { districtId: '9745', districtName: 'Samsun', cityName: 'Samsun' },
  'trabzon': { districtId: '9820', districtName: 'Trabzon', cityName: 'Trabzon' },
  'malatya': { districtId: '9653', districtName: 'Malatya', cityName: 'Malatya' },
  'erzurum': { districtId: '9429', districtName: 'Erzurum', cityName: 'Erzurum' },
  'manisa': { districtId: '9664', districtName: 'Manisa', cityName: 'Manisa' },
  'denizli': { districtId: '9373', districtName: 'Denizli', cityName: 'Denizli' },
  'kahramanmaras': { districtId: '9571', districtName: 'Kahramanmaraş', cityName: 'Kahramanmaraş' },
  'van': { districtId: '9847', districtName: 'Van', cityName: 'Van' },
  'balikesir': { districtId: '9283', districtName: 'Balıkesir', cityName: 'Balıkesir' },
  'tekirdag': { districtId: '9806', districtName: 'Tekirdağ', cityName: 'Tekirdağ' },
  'mugla': { districtId: '9691', districtName: 'Muğla', cityName: 'Muğla' },
  'marmaris': { districtId: '17883', districtName: 'Marmaris', cityName: 'Muğla' },
  'hatay': { districtId: '9477', districtName: 'Hatay', cityName: 'Hatay' },
  'mardin': { districtId: '9672', districtName: 'Mardin', cityName: 'Mardin' },
  'afyonkarahisar': { districtId: '9169', districtName: 'Afyonkarahisar', cityName: 'Afyonkarahisar' },
  'sivas': { districtId: '9771', districtName: 'Sivas', cityName: 'Sivas' },
  'tokat': { districtId: '9811', districtName: 'Tokat', cityName: 'Tokat' },
  'ordu': { districtId: '9716', districtName: 'Ordu', cityName: 'Ordu' },
  'corum': { districtId: '9363', districtName: 'Çorum', cityName: 'Çorum' },
  'aksaray': { districtId: '9187', districtName: 'Aksaray', cityName: 'Aksaray' },
  'kutahya': { districtId: '9634', districtName: 'Kütahya', cityName: 'Kütahya' },
  'isparta': { districtId: '9494', districtName: 'Isparta', cityName: 'Isparta' },
  'edirne': { districtId: '9399', districtName: 'Edirne', cityName: 'Edirne' },
  'elazig': { districtId: '9406', districtName: 'Elazığ', cityName: 'Elazığ' },
  'rize': { districtId: '9729', districtName: 'Rize', cityName: 'Rize' },
  'batman': { districtId: '9308', districtName: 'Batman', cityName: 'Batman' },
  'bolu': { districtId: '9320', districtName: 'Bolu', cityName: 'Bolu' },
  'duzce': { districtId: '9393', districtName: 'Düzce', cityName: 'Düzce' },
  'giresun': { districtId: '9466', districtName: 'Giresun', cityName: 'Giresun' },
  'yalova': { districtId: '9854', districtName: 'Yalova', cityName: 'Yalova' },
  'zonguldak': { districtId: '9870', districtName: 'Zonguldak', cityName: 'Zonguldak' },
  'karabuk': { districtId: '9576', districtName: 'Karabük', cityName: 'Karabük' },
  'kastamonu': { districtId: '9578', districtName: 'Kastamonu', cityName: 'Kastamonu' },
  'burdur': { districtId: '9330', districtName: 'Burdur', cityName: 'Burdur' },
  'usak': { districtId: '9840', districtName: 'Uşak', cityName: 'Uşak' },
  'canakkale': { districtId: '9348', districtName: 'Çanakkale', cityName: 'Çanakkale' },
  'kirklareli': { districtId: '9589', districtName: 'Kırklareli', cityName: 'Kırklareli' },
  'kirikkale': { districtId: '9587', districtName: 'Kırıkkale', cityName: 'Kırıkkale' },
  'nevsehir': { districtId: '9705', districtName: 'Nevşehir', cityName: 'Nevşehir' },
  'nigde': { districtId: '9710', districtName: 'Niğde', cityName: 'Niğde' },
  'yozgat': { districtId: '9861', districtName: 'Yozgat', cityName: 'Yozgat' },
  'amasya': { districtId: '9198', districtName: 'Amasya', cityName: 'Amasya' },
  'sinop': { districtId: '9766', districtName: 'Sinop', cityName: 'Sinop' },
  'bartin': { districtId: '9304', districtName: 'Bartın', cityName: 'Bartın' },
  'bilecik': { districtId: '9312', districtName: 'Bilecik', cityName: 'Bilecik' },
  'bingol': { districtId: '9316', districtName: 'Bingöl', cityName: 'Bingöl' },
  'bitlis': { districtId: '9318', districtName: 'Bitlis', cityName: 'Bitlis' },
  'mus': { districtId: '9700', districtName: 'Muş', cityName: 'Muş' },
  'siirt': { districtId: '9759', districtName: 'Siirt', cityName: 'Siirt' },
  'sirnak': { districtId: '9769', districtName: 'Şırnak', cityName: 'Şırnak' },
  'hakkari': { districtId: '9474', districtName: 'Hakkari', cityName: 'Hakkari' },
  'igdir': { districtId: '9489', districtName: 'Iğdır', cityName: 'Iğdır' },
  'kars': { districtId: '9577', districtName: 'Kars', cityName: 'Kars' },
  'agri': { districtId: '9175', districtName: 'Ağrı', cityName: 'Ağrı' },
  'ardahan': { districtId: '9240', districtName: 'Ardahan', cityName: 'Ardahan' },
  'artvin': { districtId: '9248', districtName: 'Artvin', cityName: 'Artvin' },
  'bayburt': { districtId: '9310', districtName: 'Bayburt', cityName: 'Bayburt' },
  'gumushane': { districtId: '9472', districtName: 'Gümüşhane', cityName: 'Gümüşhane' },
  'tunceli': { districtId: '9834', districtName: 'Tunceli', cityName: 'Tunceli' },
  'adiyaman': { districtId: '9157', districtName: 'Adıyaman', cityName: 'Adıyaman' },
  'kilis': { districtId: '9585', districtName: 'Kilis', cityName: 'Kilis' },
  'osmaniye': { districtId: '9723', districtName: 'Osmaniye', cityName: 'Osmaniye' },
  'kirschehir': { districtId: '9591', districtName: 'Kırşehir', cityName: 'Kırşehir' },
  'cankiri': { districtId: '9356', districtName: 'Çankırı', cityName: 'Çankırı' },
  'karaman': { districtId: '9575', districtName: 'Karaman', cityName: 'Karaman' },
  'aydin': { districtId: '9261', districtName: 'Aydın', cityName: 'Aydın' },
  'bodrum': { districtId: '9693', districtName: 'Bodrum', cityName: 'Muğla' },
};

const DEFAULT_DISTRICT: DistrictMapping = TURKEY_DISTRICT_MAP['istanbul'];

// --- Public API ---

/**
 * Gets the currently selected district ID.
 * Falls back to Istanbul if nothing is stored.
 */
export const getSelectedDistrictId = (): string => {
  const stored = storageService.getItem<DistrictMapping>(STORAGE_KEY_DISTRICT);
  return stored?.districtId || DEFAULT_DISTRICT.districtId;
};

/**
 * Gets the currently selected district info.
 */
export const getSelectedDistrict = (): DistrictMapping => {
  const stored = storageService.getItem<DistrictMapping>(STORAGE_KEY_DISTRICT);
  return stored || DEFAULT_DISTRICT;
};

/**
 * Sets the selected district by key from the hardcoded map.
 */
export const setDistrictByKey = (key: string): DistrictMapping | null => {
  const normalized = key.toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/\s+/g, '');

  const mapping = TURKEY_DISTRICT_MAP[normalized];
  if (!mapping) {
    logger.warn(`[DiyanetLocation] No mapping found for key: ${key}`);
    return null;
  }

  storageService.setItem(STORAGE_KEY_DISTRICT, mapping);
  logger.log(`[DiyanetLocation] District set to: ${mapping.districtName} (${mapping.districtId})`);
  return mapping;
};

/**
 * Sets the selected district by district ID directly.
 */
export const setDistrictById = (districtId: string, districtName = 'Bilinmeyen', cityName = ''): void => {
  const mapping: DistrictMapping = { districtId, districtName, cityName };
  storageService.setItem(STORAGE_KEY_DISTRICT, mapping);
  logger.log(`[DiyanetLocation] District set by ID: ${districtName} (${districtId})`);
};

/**
 * Tries to find a matching district for a given city/location name.
 * Uses normalized string matching.
 */
export const findDistrictByName = (name: string): DistrictMapping | null => {
  if (!name) return null;

  const normalized = name.toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/\s+/g, '');

  // Direct key match
  if (TURKEY_DISTRICT_MAP[normalized]) {
    return TURKEY_DISTRICT_MAP[normalized];
  }

  // Search in values by districtName or cityName
  const entries = Object.values(TURKEY_DISTRICT_MAP);
  const match = entries.find((entry) => {
    const entryDistrictNorm = entry.districtName.toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g')
      .replace(/\s+/g, '');
    const entryCityNorm = entry.cityName.toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g')
      .replace(/\s+/g, '');
    return entryDistrictNorm === normalized || entryCityNorm === normalized;
  });

  return match || null;
};

/**
 * Returns all available district mappings for listing in UI.
 */
export const getAllDistricts = (): DistrictMapping[] => {
  return Object.values(TURKEY_DISTRICT_MAP);
};

/**
 * Returns the hardcoded district map for external use.
 */
export const getDistrictMap = (): Record<string, DistrictMapping> => {
  return { ...TURKEY_DISTRICT_MAP };
};

export default {
  getSelectedDistrictId,
  getSelectedDistrict,
  setDistrictByKey,
  setDistrictById,
  findDistrictByName,
  getAllDistricts,
  getDistrictMap,
};
