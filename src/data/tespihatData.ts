export type SourceType = 'hadith' | 'quran' | 'general';

export type SourceMetadata = {
  sourceType: SourceType;
  citation?: string;
}

export type TespihatSection = SourceMetadata & {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  count?: number;
  arabic: string;
  latin: string;
  meaning: string;
}

export type Tesbih = {
  id: string;
  title: string;
  arabic: string;
  latin: string;
  meaning: string;
  count: number;
  color: string;
}

export type TevhidEntry = SourceMetadata & {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  arabic: string;
  latin: string;
  meaning: string;
}

export type Dua = SourceMetadata & {
  id: string;
  title: string;
  arabic: string;
  latin: string;
  meaning: string;
  optional?: boolean;
}

export const TESPIHAT_SECTIONS: TespihatSection[] = [
  {
    id: 'istigfar', title: 'İstiğfar', subtitle: '3 defa', icon: '🤲', count: 3,
    arabic: 'أَسْتَغْفِرُ اللَّهَ', latin: 'Estağfirullah', meaning: 'Allah’tan bağışlanma dilerim.',
    sourceType: 'hadith', citation: 'Sahih Muslim 591'
  },
  {
    id: 'entes-selam', title: 'Allâhümme Entes-Selâm', subtitle: 'Namaz sonrası dua', icon: '✨', count: 1,
    arabic: 'اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ',
    latin: 'Allâhümme entes-selâmu ve minkes-selâm. Tebârekte yâ zel-celâli vel-ikrâm.',
    meaning: 'Allah’ım! Sen Selâm’sın (esenlik verensin). Selâmet ve esenlik sendendir. Ey celâl ve ikram sahibi! Sen mübarek ve yücesin.',
    sourceType: 'hadith', citation: 'Sahih Muslim 591'
  },
  {
    id: 'salavat', title: 'Salâvat-ı Şerîfe', subtitle: 'Peygamberimize salât', icon: '🌙', count: 1,
    arabic: 'اللّٰهُمَّ صَلِّ عَلٰى سَيِّدِنَا مُحَمَّدٍ وَعَلٰى اٰلِ سَيِّدِنَا مُحَمَّدٍ',
    latin: 'Allâhümme salli alâ seyyidinâ Muhammedin ve alâ âli seyyidinâ Muhammed.',
    meaning: 'Allah’ım! Efendimiz Hz. Muhammed’e ve O’nun ailesine salât eyle (rahmet et, şerefini yücelt).', sourceType: 'general'
  },
  {
    id: 'subhanallahi', title: 'Sübhânallâhi vel-Hamdülillâh', subtitle: 'Tesbih, hamd ve tekbir', icon: '📿', count: 1,
    arabic: 'سُبْحَانَ اللّٰهِ وَالْحَمْدُ لِلّٰهِ وَلَا اِلٰهَ اِلَّا اللّٰهُ وَاللّٰهُ اَكْبَرُ وَلَا حَوْلَ وَلَا قُوَّةَ اِلَّا بِاللّٰهِ الْعَلِىِّ الْعَظٖيمِ',
    latin: 'Sübhanallâhi vel-hamdülillâhi ve lâ ilâhe illallâhu vallâhu ekber. Ve lâ havle ve lâ kuvvete illâ billâhil aliyyil azîm.',
    meaning: 'Allah’ı tesbih ederim. Hamd Allah’a mahsustur. Allah’tan başka ilâh yoktur. Allah en büyüktür. Güç ve kuvvet ancak yüce Allah’ın yardımıyladır.', sourceType: 'general'
  },
  {
    id: 'ayetel-kursi', title: 'Âyetü’l-Kürsî', subtitle: 'Bakara 255', icon: '📖', count: 1,
    arabic: 'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌۭ وَلَا نَوْمٌۭ ۚ لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍۢ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ',
    latin: 'Allâhu lâ ilâhe illâ hüvel-hayyül-kayyûm. Lâ te’huzühû sinetün ve lâ nevm. Lehû mâ fis-semâvâti ve mâ fil-ard. Men zellezî yeşfeu indehû illâ bi-iznih. Ya’lemü mâ beyne eydîhim ve mâ halfehüm. Ve lâ yuhîtûne bişey’in min ilmihî illâ bimâ şâe. Vesia kürsiyyühüs-semâvâti vel-ard. Ve lâ yeûduhû hıfzuhumâ. Ve hüvel aliyyül-azîm.',
    meaning: 'Allah, O’ndan başka ilâh yoktur; diridir, her şeyi ayakta tutandır. O’nu ne uyuklama ne uyku tutar. Göklerde ve yerde ne varsa O’nundur. İzni olmadan O’nun katında şefaat edecek kimdir? O, kullarının önlerindekini ve arkalarındakini bilir. Onlar, O’nun ilminden dilediği kadarından başka bir şeyi kavrayamazlar. O’nun kürsüsü gökleri ve yeri kuşatmıştır. Onları korumak O’na ağır gelmez. O, yücedir, büyüktür.',
    sourceType: 'quran', citation: 'Kur’an 2:255'
  }
];

export const TESBIHLER: Tesbih[] = [
  { id: 'subhanallah', title: 'Sübhanallah', arabic: 'سُبْحَانَ اللّٰهِ', latin: 'Sübhanallah', meaning: 'Allah’ı noksan sıfatlardan tenzih ederim.', count: 33, color: '#4CAF50' },
  { id: 'elhamdulillah', title: 'Elhamdülillah', arabic: 'اَلْحَمْدُ لِلّٰهِ', latin: 'Elhamdülillah', meaning: 'Her türlü övgü Allah’a mahsustur.', count: 33, color: '#2196F3' },
  { id: 'allahuekber', title: 'Allahu Ekber', arabic: 'اَللّٰهُ اَكْبَرُ', latin: 'Allâhu Ekber', meaning: 'Allah en büyüktür.', count: 33, color: '#FF9800' }
];

export const TEVHID: TevhidEntry = {
  id: 'tevhid', title: 'Tevhid', subtitle: 'Tesbihlerin ardından', icon: '🌟',
  arabic: 'لَا اِلٰهَ اِلَّا اللّٰهُ وَحْدَهُ لَا شَرٖيكَ لَهُ الْمُلْكُ وَ لَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
  latin: 'Lâ ilâhe illallâhu vahdehû lâ şerike leh. Lehü’l-mülkü ve lehü’l-hamdü ve hüve alâ külli şey’in kadîr.',
  meaning: 'Allah’tan başka ilâh yoktur; O tektir, ortağı yoktur. Mülk O’nundur, hamd O’na mahsustur. O’nun her şeye gücü yeter.', sourceType: 'general'
};

export const OPTIONAL_QURAN_DUALAR: Dua[] = [
  { id: 'rabbena1', title: 'Rabbenâ Âtinâ', arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', latin: 'Rabbenâ âtinâ fid-dünyâ haseneten ve fil-âhireti haseneten ve kınâ azâbennâr.', meaning: 'Rabbimiz! Bize dünyada da ahirette de güzellik ver ve bizi ateş azabından koru.', sourceType: 'quran', citation: 'Kur’an 2:201', optional: true },
  { id: 'rabbena2', title: 'Rabbenağfirlî', arabic: 'رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ', latin: 'Rabbenağfirlî ve li-vâlideyye ve lil-mü’minîne yevme yekûmül-hisâb.', meaning: 'Rabbimiz! Hesap gününde beni, anne-babamı ve müminleri bağışla.', sourceType: 'quran', citation: 'Kur’an 14:41', optional: true },
  { id: 'rabbi-inni', title: 'Rabbi İnnî', arabic: 'رَبِّ إِنِّي لِمَا أَنْزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ', latin: 'Rabbi innî limâ enzelte ileyye min hayrin fekîr.', meaning: 'Rabbim! Bana indireceğin her hayra muhtacım.', sourceType: 'quran', citation: 'Kur’an 28:24', optional: true },
  { id: 'rabbi-habli', title: 'Rabbi Hablî', arabic: 'رَبِّ هَبْ لِي مِنْ لَدُنْكَ ذُرِّيَّةً طَيِّبَةً إِنَّكَ سَمِيعُ الدُّعَاءِ', latin: 'Rabbi hablî min ledünke zürriyyeten tayyibeh. İnneke semîud-duâ.', meaning: 'Rabbim! Bana katından temiz bir nesil bağışla. Şüphesiz sen duaları işitensin.', sourceType: 'quran', citation: 'Kur’an 3:38', optional: true }
];

export const TESPIHAT_ORDER: string[] = ['istigfar', 'entes-selam', 'salavat', 'subhanallahi', 'ayetel-kursi', 'tesbih-subhanallah', 'tesbih-elhamdulillah', 'tesbih-allahuekber', 'tevhid', 'optional-quran-duas'];
