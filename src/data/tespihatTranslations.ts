// Non-Turkish copy for tespihatData, by item id. `latin` is a standard transliteration shared by en/de/id.
// Qur'anic meanings are Sahih International, Bubenheim & Elyas and Kemenag RI.
type Copy = { title: string; subtitle?: string; meaning: string };
type Entry = { latin: string; en: Copy; de: Copy; id: Copy };

const ENTRIES: Record<string, Entry> = {
  istigfar: {
    latin: 'Astaghfirullah',
    en: { title: 'Istighfar', subtitle: '3 times', meaning: 'I seek forgiveness from Allah.' },
    de: { title: 'Istighfar', subtitle: '3-mal', meaning: 'Ich bitte Allah um Vergebung.' },
    id: { title: 'Istigfar', subtitle: '3 kali', meaning: 'Aku memohon ampun kepada Allah.' },
  },
  'entes-selam': {
    latin: "Allahumma antas-salamu wa minkas-salam, tabarakta ya dhal-jalali wal-ikram.",
    en: { title: 'Allahumma Antas-Salam', subtitle: 'Supplication after prayer', meaning: 'O Allah, You are Peace and from You comes peace. Blessed are You, O Possessor of Majesty and Honour.' },
    de: { title: 'Allahumma Antas-Salam', subtitle: 'Bittgebet nach dem Gebet', meaning: 'O Allah, Du bist der Friede, und von Dir kommt der Friede. Gesegnet bist Du, o Besitzer von Majestät und Ehre.' },
    id: { title: 'Allahumma Antas-Salam', subtitle: 'Doa setelah salat', meaning: 'Ya Allah, Engkaulah As-Salam dan dari-Mu keselamatan. Mahasuci Engkau, wahai Pemilik keagungan dan kemuliaan.' },
  },
  salavat: {
    latin: "Allahumma salli 'ala sayyidina Muhammadin wa 'ala ali sayyidina Muhammad.",
    en: { title: 'Salawat', subtitle: 'Blessings upon the Prophet', meaning: 'O Allah, send blessings upon our master Muhammad and upon the family of our master Muhammad.' },
    de: { title: 'Salawat', subtitle: 'Segenswünsche für den Propheten', meaning: 'O Allah, segne unseren Herrn Muhammad und die Familie unseres Herrn Muhammad.' },
    id: { title: 'Selawat', subtitle: 'Selawat kepada Nabi', meaning: 'Ya Allah, limpahkanlah rahmat kepada junjungan kami Muhammad dan keluarga junjungan kami Muhammad.' },
  },
  subhanallahi: {
    latin: "Subhanallahi wal-hamdulillahi wa la ilaha illallahu wallahu akbar. Wa la hawla wa la quwwata illa billahil-'aliyyil-'azim.",
    en: { title: 'Subhanallahi wal-Hamdulillah', subtitle: 'Glorification, praise and takbir', meaning: 'Glory be to Allah, praise be to Allah, there is no god but Allah, and Allah is the Greatest. There is no power and no strength except through Allah, the Most High, the Magnificent.' },
    de: { title: 'Subhanallahi wal-Hamdulillah', subtitle: 'Lobpreis, Dank und Takbir', meaning: 'Gepriesen sei Allah, alles Lob gebührt Allah, es gibt keinen Gott außer Allah, und Allah ist der Größte. Es gibt keine Macht und keine Kraft außer durch Allah, den Erhabenen, den Gewaltigen.' },
    id: { title: 'Subhanallahi wal-Hamdulillah', subtitle: 'Tasbih, tahmid, dan takbir', meaning: 'Mahasuci Allah, segala puji bagi Allah, tiada tuhan selain Allah, dan Allah Mahabesar. Tiada daya dan kekuatan kecuali dengan pertolongan Allah Yang Mahatinggi lagi Mahaagung.' },
  },
  'ayetel-kursi': {
    latin: "Allahu la ilaha illa huwal-hayyul-qayyum. La ta'khudhuhu sinatun wa la nawm. Lahu ma fis-samawati wa ma fil-ard. Man dhal-ladhi yashfa'u 'indahu illa bi-idhnih. Ya'lamu ma bayna aydihim wa ma khalfahum, wa la yuhituna bi-shay'in min 'ilmihi illa bima sha'. Wasi'a kursiyyuhus-samawati wal-ard, wa la ya'uduhu hifzuhuma, wa huwal-'aliyyul-'azim.",
    en: { title: 'Ayat al-Kursi', subtitle: 'Al-Baqarah 255', meaning: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is [presently] before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.' },
    de: { title: 'Thronvers', subtitle: 'Al-Baqara 255', meaning: 'Allah - es gibt keinen Gott außer Ihm, dem Lebendigen und Beständigen. Ihn überkommt weder Schlummer noch Schlaf. Ihm gehört (alles), was in den Himmeln und was auf der Erde ist. Wer ist es denn, der bei Ihm Fürsprache einlegen könnte - außer mit Seiner Erlaubnis? Er weiß, was vor ihnen und was hinter ihnen liegt, sie aber umfassen nichts von Seinem Wissen - außer, was Er will. Sein Thronschemel umfaßt die Himmel und die Erde, und ihre Behütung beschwert Ihn nicht. Er ist der Erhabene und Allgewaltige.' },
    id: { title: 'Ayat Kursi', subtitle: 'Al-Baqarah 255', meaning: "Allah, tidak ada Tuhan (yang berhak disembah) melainkan Dia Yang Hidup kekal lagi terus menerus mengurus (makhluk-Nya); tidak mengantuk dan tidak tidur. Kepunyaan-Nya apa yang di langit dan di bumi. Tiada yang dapat memberi syafa'at di sisi Allah tanpa izin-Nya? Allah mengetahui apa-apa yang di hadapan mereka dan di belakang mereka, dan mereka tidak mengetahui apa-apa dari ilmu Allah melainkan apa yang dikehendaki-Nya. Kursi Allah meliputi langit dan bumi. Dan Allah tidak merasa berat memelihara keduanya, dan Allah Maha Tinggi lagi Maha Besar." },
  },
  subhanallah: {
    latin: 'Subhanallah',
    en: { title: 'Subhanallah', meaning: 'Glory be to Allah, free of every imperfection.' },
    de: { title: 'Subhanallah', meaning: 'Gepriesen sei Allah, frei von jedem Makel.' },
    id: { title: 'Subhanallah', meaning: 'Mahasuci Allah dari segala kekurangan.' },
  },
  elhamdulillah: {
    latin: 'Alhamdulillah',
    en: { title: 'Alhamdulillah', meaning: 'All praise is due to Allah.' },
    de: { title: 'Alhamdulillah', meaning: 'Alles Lob gebührt Allah.' },
    id: { title: 'Alhamdulillah', meaning: 'Segala puji bagi Allah.' },
  },
  allahuekber: {
    latin: 'Allahu Akbar',
    en: { title: 'Allahu Akbar', meaning: 'Allah is the Greatest.' },
    de: { title: 'Allahu Akbar', meaning: 'Allah ist der Größte.' },
    id: { title: 'Allahu Akbar', meaning: 'Allah Mahabesar.' },
  },
  tevhid: {
    latin: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadir.",
    en: { title: 'Tawhid', subtitle: 'After the tasbih', meaning: 'There is no god but Allah alone, without partner. His is the dominion and His is the praise, and He has power over all things.' },
    de: { title: 'Tauhid', subtitle: 'Nach dem Tasbih', meaning: 'Es gibt keinen Gott außer Allah allein, ohne Teilhaber. Ihm gehört die Herrschaft und Ihm gebührt das Lob, und Er hat Macht über alle Dinge.' },
    id: { title: 'Tauhid', subtitle: 'Setelah tasbih', meaning: 'Tiada tuhan selain Allah semata, tiada sekutu bagi-Nya. Milik-Nya kerajaan dan bagi-Nya segala puji, dan Dia Mahakuasa atas segala sesuatu.' },
  },
  rabbena1: {
    latin: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar.",
    en: { title: 'Rabbana Atina', meaning: 'Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.' },
    de: { title: 'Rabbana Atina', meaning: 'Unser Herr, gib uns im Diesseits Gutes und im Jenseits Gutes, und bewahre uns vor der Strafe des (Höllen)feuers!' },
    id: { title: 'Rabbana Atina', meaning: 'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat dan peliharalah kami dari siksa neraka.' },
  },
  rabbena2: {
    latin: "Rabbanaghfir li wa li-walidayya wa lil-mu'minina yawma yaqumul-hisab.",
    en: { title: 'Rabbanaghfir Li', meaning: 'Our Lord, forgive me and my parents and the believers the Day the account is established.' },
    de: { title: 'Rabbanaghfir Li', meaning: 'Unser Herr, vergib mir und meinen Eltern und den Gläubigen an dem Tag, da die Abrechnung stattfinden wird.' },
    id: { title: 'Rabbanaghfir Li', meaning: 'Ya Tuhan kami, beri ampunlah aku dan kedua ibu bapaku dan sekalian orang-orang mukmin pada hari terjadinya hisab (hari kiamat).' },
  },
  'rabbi-inni': {
    latin: 'Rabbi inni lima anzalta ilayya min khayrin faqir.',
    en: { title: 'Rabbi Inni', meaning: 'My Lord, indeed I am, for whatever good You would send down to me, in need.' },
    de: { title: 'Rabbi Inni', meaning: 'Mein Herr, ich bin dessen bedürftig, was Du auch immer an Gutem zu mir herabsendest.' },
    id: { title: 'Rabbi Inni', meaning: 'Ya Tuhanku sesungguhnya aku sangat memerlukan sesuatu kebaikan yang Engkau turunkan kepadaku.' },
  },
  'rabbi-habli': {
    latin: "Rabbi hab li min ladunka dhurriyyatan tayyibah, innaka sami'ud-du'a'.",
    en: { title: 'Rabbi Hab Li', meaning: 'My Lord, grant me from Yourself a good offspring. Indeed, You are the Hearer of supplication.' },
    de: { title: 'Rabbi Hab Li', meaning: 'Mein Herr, schenke mir von Dir aus gute Nachkommenschaft! Du bist ja der Gebetserhörer.' },
    id: { title: 'Rabbi Hab Li', meaning: 'Ya Tuhanku, berilah aku dari sisi Engkau seorang anak yang baik. Sesungguhnya Engkau Maha Pendengar doa.' },
  },
};

const QURAN_LABEL: Record<string, string> = { en: 'Quran', de: 'Koran', id: 'QS' };

type Localizable = { id: string; title: string; subtitle?: string; latin: string; meaning: string; citation?: string };

/** Returns the item in `language`; Turkish or untranslated items come back unchanged. */
export const localizeTespihat = <T extends Localizable>(item: T, language: string): T => {
  const lang = language.slice(0, 2) as 'en' | 'de' | 'id';
  const entry = ENTRIES[item.id];
  if (!entry || !(lang in QURAN_LABEL)) return item;
  const copy = entry[lang];
  return {
    ...item,
    title: copy.title,
    subtitle: copy.subtitle ?? item.subtitle,
    latin: entry.latin,
    meaning: copy.meaning,
    citation: item.citation?.replace('Kur’an', QURAN_LABEL[lang]),
  };
};

export const TESPIHAT_TRANSLATION_IDS = Object.keys(ENTRIES);
