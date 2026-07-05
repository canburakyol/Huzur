export interface MultimediaCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  count: number;
}

export interface DuaImage {
  id: string;
  title: string;
  text: string;
  bgColor: string;
  textColor: string;
}

export interface MosqueImage {
  id: string;
  title: string;
  location: string;
  url: string;
  thumbnail: string;
}

export interface KabeImage {
  id: string;
  title: string;
  location: string;
  url: string;
  thumbnail: string;
}

export interface RamazanImage {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
}

export interface KuranImage {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
}

export interface TesbihImage {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
}

export const MULTIMEDIA_CATEGORIES: MultimediaCategory[] = [
  { id: 'dualar', title: 'Dualı Görseller', icon: '🤲', description: 'Paylaşılabilir dua kartları', count: 8 },
  { id: 'camiler', title: 'Cami Fotoğrafları', icon: '🕌', description: 'Dünyanın en güzel camileri', count: 7 },
  { id: 'kabe', title: 'Kabe ve Harem', icon: '🕋', description: 'Kutsal topraklar', count: 4 },
  { id: 'ramazan', title: 'Ramazan Görselleri', icon: '🌙', description: 'Ramazan ve iftar görselleri', count: 5 },
  { id: 'kuran', title: 'Kuran Görselleri', icon: '📖', description: 'Kuran-ı Kerim fotoğrafları', count: 5 },
  { id: 'tesbih', title: 'Tesbih ve İbadet', icon: '📿', description: 'İbadet görselleri', count: 5 }
];

// Concrete Stitch palette colors keep generated/shareable cards renderer-independent.
export const DUA_IMAGES: DuaImage[] = [
  { id: 'dua1', title: 'Sabah Duası', text: 'Ya Rabbi, bugün beni hayırlı işlere muvaffak kıl.', bgColor: 'linear-gradient(135deg, #1b3022 0%, #1b3022 100%)', textColor: '#f5f2e9' },
  { id: 'dua2', title: 'Şükür Duası', text: 'Elhamdülillah, her halimde şükürler olsun.', bgColor: 'linear-gradient(135deg, #1b3022 0%, #1b3022 100%)', textColor: '#f5f2e9' },
  { id: 'dua3', title: 'Bereket Duası', text: 'Allah\'ım evime, işime, aileme bereket ver.', bgColor: 'linear-gradient(135deg, #1b3022 0%, #1b3022 100%)', textColor: '#aa8343' },
  { id: 'dua4', title: 'Huzur Duası', text: 'Rabbim kalbime huzur, dilime doğru söz ver.', bgColor: 'linear-gradient(135deg, #1b3022 0%, #1b3022 100%)', textColor: '#f5f2e9' },
  { id: 'dua5', title: 'Af Duası', text: 'Ya Rabbi, günahlarımı affet, beni bağışla.', bgColor: 'linear-gradient(135deg, #aa8343 0%, #aa8343 100%)', textColor: '#f5f2e9' },
  { id: 'dua6', title: 'Şifa Duası', text: 'Allah\'ım hastalarımıza şifa, dertlilerimize deva ver.', bgColor: 'linear-gradient(135deg, #1b3022 0%, #1b3022 100%)', textColor: '#f5f2e9' },
  { id: 'dua7', title: 'Sabır Duası', text: 'Rabbim bana sabır ver, sabredenlerden eyle.', bgColor: 'linear-gradient(135deg, #1b3022 0%, #1b3022 100%)', textColor: '#f5f2e9' },
  { id: 'dua8', title: 'Akşam Duası', text: 'Ya Rabbi, bu geceyi hayırlı eyle, bizi koru.', bgColor: 'linear-gradient(135deg, #1b3022 0%, #1b3022 100%)', textColor: '#aa8343' }
];

export const CAMI_IMAGES: MosqueImage[] = [
  { id: 'cami1', title: 'Sultanahmet Camii', location: 'İstanbul, Türkiye', url: '/images/multimedia/camiler/sultanahmet.png', thumbnail: '/images/multimedia/camiler/sultanahmet.png' },
  { id: 'cami2', title: 'Ayasofya', location: 'İstanbul, Türkiye', url: '/images/multimedia/camiler/ayasofya.png', thumbnail: '/images/multimedia/camiler/ayasofya.png' },
  { id: 'cami3', title: 'Şeyh Zayed Camii', location: 'Abu Dhabi, BAE', url: '/images/multimedia/camiler/seyh_zayed.png', thumbnail: '/images/multimedia/camiler/seyh_zayed.png' },
  { id: 'cami4', title: 'Mescid-i Nebevi', location: 'Medine, Suudi Arabistan', url: '/images/multimedia/camiler/mescidi_nebevi.png', thumbnail: '/images/multimedia/camiler/mescidi_nebevi.png' },
  { id: 'cami5', title: 'Selimiye Camii', location: 'Edirne, Türkiye', url: '/images/multimedia/camiler/selimiye.png', thumbnail: '/images/multimedia/camiler/selimiye.png' },
  { id: 'cami6', title: 'Cami İç Mekan', location: 'İslam Mimarisi', url: '/images/multimedia/camiler/cami_ic_mekan.png', thumbnail: '/images/multimedia/camiler/cami_ic_mekan.png' },
  { id: 'cami7', title: 'Kubbe Detayı', location: 'İslam Sanatı', url: '/images/multimedia/camiler/kubbe_detay.png', thumbnail: '/images/multimedia/camiler/kubbe_detay.png' }
];

export const KABE_IMAGES: KabeImage[] = [
  { id: 'kabe1', title: 'Kabe-i Muazzama', location: 'Mekke, Suudi Arabistan', url: '/images/multimedia/kabe/kabe_1.png', thumbnail: '/images/multimedia/kabe/kabe_1.png' },
  { id: 'kabe2', title: 'Mescid-i Haram Panorama', location: 'Mekke, Suudi Arabistan', url: '/images/multimedia/kabe/mescidi_haram.png', thumbnail: '/images/multimedia/kabe/mescidi_haram.png' },
  { id: 'kabe3', title: 'Tavaf', location: 'Mekke, Suudi Arabistan', url: '/images/multimedia/kabe/tavaf.png', thumbnail: '/images/multimedia/kabe/tavaf.png' },
  { id: 'kabe4', title: 'Kabe Gece Manzarası', location: 'Mekke, Suudi Arabistan', url: '/images/multimedia/kabe/kabe_gece.png', thumbnail: '/images/multimedia/kabe/kabe_gece.png' }
];

export const RAMAZAN_IMAGES: RamazanImage[] = [
  { id: 'ramazan1', title: 'İftar Sofrası', description: 'Ramazan bereketi', url: '/images/multimedia/ramazan/iftar.png', thumbnail: '/images/multimedia/ramazan/iftar.png' },
  { id: 'ramazan2', title: 'Hurma', description: 'İftar açma sünneti', url: '/images/multimedia/ramazan/hurma.png', thumbnail: '/images/multimedia/ramazan/hurma.png' },
  { id: 'ramazan3', title: 'Ramazan Feneri', description: 'Ramazan süsü', url: '/images/multimedia/ramazan/ramazan_feneri.png', thumbnail: '/images/multimedia/ramazan/ramazan_feneri.png' },
  { id: 'ramazan4', title: 'Hilal', description: 'Ramazan ayı', url: '/images/multimedia/ramazan/hilal.png', thumbnail: '/images/multimedia/ramazan/hilal.png' },
  { id: 'ramazan5', title: 'Mahya', description: 'Hoş Geldin Ramazan', url: '/images/multimedia/ramazan/mahya.png', thumbnail: '/images/multimedia/ramazan/mahya.png' }
];

export const KURAN_IMAGES: KuranImage[] = [
  { id: 'kuran1', title: 'Kuran-ı Kerim', description: 'Mushaf-ı Şerif', url: '/images/multimedia/kuran/kuran_1.png', thumbnail: '/images/multimedia/kuran/kuran_1.png' },
  { id: 'kuran2', title: 'Kuran Tilaveti', description: 'Okuma anı', url: '/images/multimedia/kuran/kuran_tilavet.png', thumbnail: '/images/multimedia/kuran/kuran_tilavet.png' },
  { id: 'kuran3', title: 'Hat Sanatı', description: 'İslam kaligrafisi', url: '/images/multimedia/kuran/hat_sanati.png', thumbnail: '/images/multimedia/kuran/hat_sanati.png' },
  { id: 'kuran4', title: 'Rahle ve Kuran', description: 'Kuran standı', url: '/images/multimedia/kuran/rahle.png', thumbnail: '/images/multimedia/kuran/rahle.png' },
  { id: 'kuran5', title: 'Tezhip Sanatı', description: 'Süsleme sanatı', url: '/images/multimedia/kuran/tezhip.png', thumbnail: '/images/multimedia/kuran/tezhip.png' }
];

export const TESBIH_IMAGES: TesbihImage[] = [
  { id: 'tesbih1', title: 'Tesbih', description: 'Zikir aleti', url: '/images/multimedia/kuran/kuran_1.png', thumbnail: '/images/multimedia/kuran/kuran_1.png' },
  { id: 'tesbih2', title: 'Namaz Kılan', description: 'İbadet anı', url: '/images/multimedia/camiler/cami_ic_mekan.png', thumbnail: '/images/multimedia/camiler/cami_ic_mekan.png' },
  { id: 'tesbih3', title: 'Secde', description: 'Kulluk', url: '/images/multimedia/kabe/kabe_1.png', thumbnail: '/images/multimedia/kabe/kabe_1.png' },
  { id: 'tesbih4', title: 'Dua Eden Eller', description: 'Yalvarış', url: '/images/multimedia/ramazan/ramazan_feneri.png', thumbnail: '/images/multimedia/ramazan/ramazan_feneri.png' },
  { id: 'tesbih5', title: 'Seccade', description: 'Namaz seccadesi', url: '/images/multimedia/camiler/kubbe_detay.png', thumbnail: '/images/multimedia/camiler/kubbe_detay.png' }
];

export const getImagesByCategory = (categoryId: string): DuaImage[] | MosqueImage[] | KabeImage[] | RamazanImage[] | KuranImage[] | TesbihImage[] => {
  switch (categoryId) {
    case 'dualar': return DUA_IMAGES;
    case 'camiler': return CAMI_IMAGES;
    case 'kabe': return KABE_IMAGES;
    case 'ramazan': return RAMAZAN_IMAGES;
    case 'kuran': return KURAN_IMAGES;
    case 'tesbih': return TESBIH_IMAGES;
    default: return [];
  }
};
