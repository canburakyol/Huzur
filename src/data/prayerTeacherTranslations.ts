// Non-Turkish copy for prayerTeacherData (Hanafi rulings kept as in the Turkish source).
// Qur'anic meanings (Fatiha, Ikhlas) are Sahih International, Bubenheim & Elyas and Kemenag RI.
import type { PrayerStep, Recitation, PrayerType, ReligiousTerm, PrayerInvalidator, QuizQuestion } from './prayerTeacherData';

type Lang = 'en' | 'de' | 'id';
type StepCopy = [name: string, description: string, detail: string];
type TypeCopy = { name: string; note: string; details: Array<[type: string, description: string]> };
type TermCopy = { name: string; description: string; examples: string[] };
type QuizCopy = { question: string; options: string[] };
type Pack = {
  steps: Record<number, StepCopy>;
  recitations: Record<string, [name: string, meaning: string]>;
  types: Record<string, TypeCopy>;
  terms: Record<string, TermCopy>;
  invalidators: Record<number, string>;
  quiz: Record<number, QuizCopy>;
};

const LATIN: Record<string, string> = {
  subhaneke: "Subhanakallahumma wa bihamdika wa tabarakasmuka wa ta'ala jadduka wa la ilaha ghayruk.",
  fatiha: "Bismillahir-rahmanir-rahim. Al-hamdu lillahi rabbil-'alamin. Ar-rahmanir-rahim. Maliki yawmid-din. Iyyaka na'budu wa iyyaka nasta'in. Ihdinas-siratal-mustaqim. Siratal-ladhina an'amta 'alayhim ghayril-maghdubi 'alayhim wa lad-dallin.",
  ihlas: "Qul huwallahu ahad. Allahus-samad. Lam yalid wa lam yulad. Wa lam yakun lahu kufuwan ahad.",
  ruku: "Subhana rabbiyal-'azim",
  secde: "Subhana rabbiyal-a'la",
  ettehiyyatu: "At-tahiyyatu lillahi was-salawatu wat-tayyibat. As-salamu 'alayka ayyuhan-nabiyyu wa rahmatullahi wa barakatuh. As-salamu 'alayna wa 'ala 'ibadillahis-salihin. Ash-hadu an la ilaha illallah wa ash-hadu anna Muhammadan 'abduhu wa rasuluh.",
  salli: "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammad, kama sallayta 'ala Ibrahima wa 'ala ali Ibrahim, innaka hamidun majid.",
  barik: "Allahumma barik 'ala Muhammadin wa 'ala ali Muhammad, kama barakta 'ala Ibrahima wa 'ala ali Ibrahim, innaka hamidun majid.",
  rabbena: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar.",
};

const PACKS: Record<Lang, Pack> = {
  en: {
    steps: {
      1: ['Intention', 'Make the intention in your heart for the prayer you are about to perform.', 'The intention is made in the heart; saying it aloud is sunnah. Example: "I intend, for the sake of Allah, to perform today\'s fard of the Dhuhr prayer."'],
      2: ['Opening takbir', 'Raise your hands to your ears and say "Allahu Akbar".', 'Men raise their hands to ear level, women to shoulder level. The thumbs may touch the earlobes.'],
      3: ['Standing (qiyam)', 'Stand upright with the right hand placed over the left.', 'Subhanaka, the ta\'awwudh and basmala, al-Fatiha and an additional surah are recited. The eyes look at the place of prostration.'],
      4: ["Bowing (ruku')", 'Bow while saying "Allahu Akbar".', 'The hands grasp the knees and the back is straight. "Subhana rabbiyal-\'azim" is said 3 times. On rising, "Sami\'allahu liman hamidah" is said.'],
      5: ['Standing after bowing (qawma)', 'Rise from bowing and say "Rabbana lakal-hamd".', 'Stand fully upright with the arms at your sides. Pause for a moment, then go down into prostration.'],
      6: ['Prostration (sajda)', 'Go into prostration saying "Allahu Akbar".', 'First the knees, then the hands, then the forehead and nose are placed on the ground. "Subhana rabbiyal-a\'la" is said 3 times.'],
      7: ['Sitting between prostrations (jalsa)', 'Sit upright between the two prostrations.', '"Rabbighfir li" is said. The hands rest on the knees.'],
      8: ["Sitting (qa'da)", 'In the last rak\'ah, sit and recite at-Tahiyyat.', 'At-Tahiyyat, the Salli and Barik supplications and the Rabbana supplications are recited. The index finger is raised.'],
      9: ['Salam', 'End the prayer by giving salam to the right and to the left.', 'Say "As-salamu \'alaykum wa rahmatullah", first to the right, then to the left.'],
    },
    recitations: {
      subhaneke: ['Subhanaka', 'O Allah, You are free of every imperfection, and I praise You. Blessed is Your name and exalted is Your majesty. There is no god but You.'],
      fatiha: ['Surah al-Fatiha', 'In the name of Allah, the Entirely Merciful, the Especially Merciful. [All] praise is [due] to Allah, Lord of the worlds - The Entirely Merciful, the Especially Merciful, Sovereign of the Day of Recompense. It is You we worship and You we ask for help. Guide us to the straight path - The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.'],
      ihlas: ['Surah al-Ikhlas', 'Say, "He is Allah, [who is] One, Allah, the Eternal Refuge. He neither begets nor is born, Nor is there to Him any equivalent."'],
      ruku: ["Tasbih of ruku'", 'Glory be to my Lord, the Magnificent, free of every imperfection.'],
      secde: ['Tasbih of sajda', 'Glory be to my Lord, the Most High, free of every imperfection.'],
      ettehiyyatu: ['At-Tahiyyat', 'All worship of the tongue, the body and wealth belongs to Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and messenger.'],
      salli: ['Allahumma Salli', 'O Allah, send mercy upon Muhammad and the family of Muhammad, as You sent mercy upon Ibrahim and the family of Ibrahim. Indeed, You are Praiseworthy, Glorious.'],
      barik: ['Allahumma Barik', 'O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim. Indeed, You are Praiseworthy, Glorious.'],
      rabbena: ['Rabbana supplications', 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.'],
    },
    types: {
      sabah: { name: 'Fajr prayer', note: 'The sunnah of Fajr is very important; the Prophet never left it.', details: [['Sunnah', 'Two rak\'ahs sunnah (emphasised sunnah)'], ['Fard', 'Two rak\'ahs fard']] },
      ogle: { name: 'Dhuhr prayer', note: 'In the first sunnah you sit after every two rak\'ahs.', details: [['First sunnah', 'Four rak\'ahs sunnah'], ['Fard', 'Four rak\'ahs fard'], ['Last sunnah', 'Two rak\'ahs sunnah']] },
      ikindi: { name: 'Asr prayer', note: 'The sunnah of Asr is prayed before the fard and is not an emphasised sunnah.', details: [['Sunnah', 'Four rak\'ahs sunnah (non-emphasised)'], ['Fard', 'Four rak\'ahs fard']] },
      aksam: { name: 'Maghrib prayer', note: 'The fard of Maghrib is three rak\'ahs; it is the only fard prayer with an odd number of rak\'ahs.', details: [['Fard', 'Three rak\'ahs fard'], ['Sunnah', 'Two rak\'ahs sunnah']] },
      yatsi: { name: 'Isha prayer', note: 'Witr is wajib and is prayed after Isha.', details: [['First sunnah', 'Four rak\'ahs sunnah (non-emphasised)'], ['Fard', 'Four rak\'ahs fard'], ['Last sunnah', 'Two rak\'ahs sunnah'], ['Witr', 'Three rak\'ahs witr (wajib)']] },
    },
    terms: {
      farz: { name: 'Fard', description: 'Acts of worship that Allah has commanded definitively. Abandoning them is a major sin.', examples: ['The fard of the five daily prayers', 'Fasting in Ramadan', 'Zakat', 'Hajj (for those able)', 'Ablution', 'Facing the qibla for prayer'] },
      vacip: { name: 'Wajib', description: 'Acts that must be done, though not established by evidence as strong as for fard.', examples: ['Witr prayer', 'The Eid prayers', 'Sadaqat al-fitr', 'Offering a sacrifice', 'Reciting al-Fatiha in prayer', 'The prostration of forgetfulness'] },
      sunnet: { name: 'Sunnah', description: 'Acts of worship that the Prophet (peace be upon him) performed and wished us to perform.', examples: ['The sunnahs of the daily prayers', 'Using the miswak', 'Responding to the adhan and iqama', 'Giving salam'] },
      mustehap: { name: 'Mustahabb (Mandub)', description: 'Deeds that earn reward when done, with no sin in leaving them.', examples: ['Voluntary prayers', 'Reciting the sala', 'The forenoon prayer', 'The night prayer (tahajjud)'] },
      mubah: { name: 'Mubah', description: 'Actions one is free to do or leave, carrying no religious ruling.', examples: ['Eating', 'Sleeping', 'Walking', 'Trading'] },
    },
    invalidators: {
      1: 'Speaking (deliberately or by mistake)',
      2: 'Laughing out loud',
      3: 'Eating or drinking',
      4: 'Turning the chest away from the qibla',
      5: "'Amal kathir (much movement unrelated to the prayer)",
      6: 'Losing ablution',
      7: 'Uncovering the awrah',
      8: 'Crying (over worldly matters)',
      9: 'Forcing a cough (without reason)',
      10: 'Blowing (expelling air from the mouth)',
      11: "Reciting the Qur'an wrongly (so that the meaning changes)",
      12: 'Fainting or losing one\'s mind',
    },
    quiz: {
      1: { question: 'What is the takbir said at the start of the prayer called?', options: ['Thana', 'Opening takbir', 'As-salamu alaykum', 'Takbir al-tashriq'] },
      2: { question: "How many times is the tasbih said in ruku'?", options: ['1', '3', '5', '7'] },
      3: { question: 'How many rak\'ahs does the Fajr prayer have in total?', options: ['2', '4', '6', '8'] },
      4: { question: 'What is the ruling of the witr prayer?', options: ['Fard', 'Wajib', 'Sunnah', 'Mustahabb'] },
      5: { question: 'Which of the following does not invalidate the prayer?', options: ['Speaking', 'Laughing', 'Crying (out of fear of Allah)', 'Eating'] },
      6: { question: 'What is the ruling of reciting al-Fatiha in prayer?', options: ['Fard', 'Wajib', 'Sunnah', 'Mubah'] },
      7: { question: 'Which is the tasbih of prostration?', options: ["Subhana rabbiyal-'azim", "Subhana rabbiyal-a'la", "Sami'allahu liman hamidah", 'Rabbana lakal-hamd'] },
      8: { question: 'How many rak\'ahs is the fard of Isha?', options: ['2', '3', '4', '5'] },
      9: { question: 'What is the sitting between the two prostrations called?', options: ["Qa'da", 'Jalsa', 'Qawma', 'Qiyam'] },
      10: { question: 'When is at-Tahiyyat recited in the prayer?', options: ["In the first rak'ah", "In ruku'", 'In the final sitting', 'In prostration'] },
    },
  },
  de: {
    steps: {
      1: ['Absicht', 'Fasse im Herzen die Absicht für das Gebet, das du verrichten willst.', 'Die Absicht wird im Herzen gefasst; sie auszusprechen ist Sunna. Beispiel: „Ich beabsichtige um Allahs willen, das heutige Pflichtgebet des Dhuhr zu verrichten.“'],
      2: ['Eröffnungs-Takbir', 'Hebe die Hände zu den Ohren und sprich „Allahu Akbar“.', 'Männer heben die Hände auf Ohrhöhe, Frauen auf Schulterhöhe. Die Daumen dürfen die Ohrläppchen berühren.'],
      3: ['Stehen (Qiyam)', 'Steh aufrecht, die rechte Hand liegt auf der linken.', 'Es werden Subhanaka, Ta‘awwudh und Basmala, al-Fatiha und eine weitere Sure rezitiert. Der Blick ist auf den Niederwerfungsplatz gerichtet.'],
      4: ['Verbeugung (Ruku‘)', 'Verbeuge dich mit „Allahu Akbar“.', 'Die Hände umfassen die Knie, der Rücken ist gerade. Dreimal wird „Subhana rabbiyal-‘azim“ gesprochen. Beim Aufrichten sagt man „Sami‘allahu liman hamidah“.'],
      5: ['Aufrichten (Qawma)', 'Richte dich aus der Verbeugung auf und sprich „Rabbana lakal-hamd“.', 'Steh ganz aufrecht, die Arme hängen locker an den Seiten. Halte kurz inne und gehe dann in die Niederwerfung.'],
      6: ['Niederwerfung (Sadschda)', 'Geh mit „Allahu Akbar“ in die Niederwerfung.', 'Zuerst die Knie, dann die Hände, dann Stirn und Nase auf den Boden. Dreimal wird „Subhana rabbiyal-a‘la“ gesprochen.'],
      7: ['Sitzen zwischen den Niederwerfungen (Dschalsa)', 'Sitz aufrecht zwischen den beiden Niederwerfungen.', 'Man sagt „Rabbighfir li“. Die Hände liegen auf den Knien.'],
      8: ['Sitzen (Qa‘da)', 'Setz dich in der letzten Rak‘a und sprich at-Tahiyyat.', 'Es werden at-Tahiyyat, die Salli- und Barik-Bittgebete und die Rabbana-Bittgebete gesprochen. Der Zeigefinger wird angehoben.'],
      9: ['Salam', 'Beende das Gebet mit dem Friedensgruß nach rechts und nach links.', 'Mit „As-salamu ‘alaykum wa rahmatullah“ grüßt man zuerst nach rechts, dann nach links.'],
    },
    recitations: {
      subhaneke: ['Subhanaka', 'O Allah, Du bist frei von jedem Makel, und ich lobe Dich. Gesegnet ist Dein Name und erhaben ist Deine Majestät. Es gibt keinen Gott außer Dir.'],
      fatiha: ['Sure al-Fatiha', 'Im Namen Allahs, des Allerbarmers, des Barmherzigen. (Alles) Lob gehört Allah, dem Herrn der Welten, dem Allerbarmer, dem Barmherzigen, dem Herrscher am Tag des Gerichts. Dir allein dienen wir, und zu Dir allein flehen wir um Hilfe. Leite uns den geraden Weg, den Weg derjenigen, denen Du Gunst erwiesen hast, nicht derjenigen, die (Deinen) Zorn erregt haben, und nicht der Irregehenden!'],
      ihlas: ['Sure al-Ichlas', 'Sag: Er ist Allah, ein Einer, Allah, der Überlegene. Er hat nicht gezeugt und ist nicht gezeugt worden, und niemand ist Ihm jemals gleich.'],
      ruku: ['Tasbih der Verbeugung', 'Gepriesen sei mein Herr, der Gewaltige, frei von jedem Makel.'],
      secde: ['Tasbih der Niederwerfung', 'Gepriesen sei mein Herr, der Höchste, frei von jedem Makel.'],
      ettehiyyatu: ['At-Tahiyyat', 'Alle Anbetung mit Zunge, Körper und Besitz gebührt Allah. Friede sei mit dir, o Prophet, und die Barmherzigkeit Allahs und Sein Segen. Friede sei mit uns und mit den rechtschaffenen Dienern Allahs. Ich bezeuge, dass es keinen Gott außer Allah gibt, und ich bezeuge, dass Muhammad Sein Diener und Gesandter ist.'],
      salli: ['Allahumma Salli', 'O Allah, erbarme Dich Muhammads und der Familie Muhammads, wie Du Dich Ibrahims und der Familie Ibrahims erbarmt hast. Du bist gewiss lobenswert und ruhmreich.'],
      barik: ['Allahumma Barik', 'O Allah, segne Muhammad und die Familie Muhammads, wie Du Ibrahim und die Familie Ibrahims gesegnet hast. Du bist gewiss lobenswert und ruhmreich.'],
      rabbena: ['Rabbana-Bittgebete', 'Unser Herr, gib uns im Diesseits Gutes und im Jenseits Gutes, und bewahre uns vor der Strafe des Feuers.'],
    },
    types: {
      sabah: { name: 'Fadschr-Gebet', note: 'Die Sunna des Fadschr ist sehr wichtig; der Prophet hat sie nie ausgelassen.', details: [['Sunna', 'Zwei Rak‘a Sunna (betonte Sunna)'], ['Fard', 'Zwei Rak‘a Pflicht']] },
      ogle: { name: 'Dhuhr-Gebet', note: 'In der ersten Sunna sitzt man nach je zwei Rak‘a.', details: [['Erste Sunna', 'Vier Rak‘a Sunna'], ['Fard', 'Vier Rak‘a Pflicht'], ['Letzte Sunna', 'Zwei Rak‘a Sunna']] },
      ikindi: { name: 'Asr-Gebet', note: 'Die Sunna des Asr wird vor dem Pflichtgebet verrichtet und ist keine betonte Sunna.', details: [['Sunna', 'Vier Rak‘a Sunna (nicht betont)'], ['Fard', 'Vier Rak‘a Pflicht']] },
      aksam: { name: 'Maghrib-Gebet', note: 'Das Pflichtgebet des Maghrib hat drei Rak‘a; es ist das einzige Pflichtgebet mit ungerader Rak‘a-Zahl.', details: [['Fard', 'Drei Rak‘a Pflicht'], ['Sunna', 'Zwei Rak‘a Sunna']] },
      yatsi: { name: 'Ischa-Gebet', note: 'Das Witr-Gebet ist wadschib und wird nach dem Ischa verrichtet.', details: [['Erste Sunna', 'Vier Rak‘a Sunna (nicht betont)'], ['Fard', 'Vier Rak‘a Pflicht'], ['Letzte Sunna', 'Zwei Rak‘a Sunna'], ['Witr', 'Drei Rak‘a Witr (wadschib)']] },
    },
    terms: {
      farz: { name: 'Fard', description: 'Gottesdienste, die Allah eindeutig geboten hat. Sie zu unterlassen ist eine große Sünde.', examples: ['Die Pflichtteile der fünf Gebete', 'Das Fasten im Ramadan', 'Die Zakat', 'Die Pilgerfahrt (für den, der dazu fähig ist)', 'Die Gebetswaschung', 'Sich zum Gebet der Qibla zuwenden'] },
      vacip: { name: 'Wadschib', description: 'Handlungen, die verrichtet werden müssen, auch wenn sie nicht durch so starke Belege wie Fard feststehen.', examples: ['Das Witr-Gebet', 'Die Festgebete', 'Die Sadaqat al-Fitr', 'Das Opfern', 'Al-Fatiha im Gebet rezitieren', 'Die Niederwerfung der Vergesslichkeit'] },
      sunnet: { name: 'Sunna', description: 'Gottesdienste, die der Prophet (Friede sei mit ihm) verrichtet hat und die wir verrichten sollen.', examples: ['Die Sunna-Gebete der fünf Gebete', 'Den Miswak benutzen', 'Auf Adhan und Iqama antworten', 'Den Friedensgruß sprechen'] },
      mustehap: { name: 'Mustahabb (Mandub)', description: 'Taten, die belohnt werden, deren Unterlassen aber keine Sünde ist.', examples: ['Freiwillige Gebete', 'Die Sala rezitieren', 'Das Vormittagsgebet', 'Das Nachtgebet (Tahadschud)'] },
      mubah: { name: 'Mubah', description: 'Handlungen, die man tun oder lassen darf und die keine religiöse Bewertung tragen.', examples: ['Essen', 'Schlafen', 'Gehen', 'Handel treiben'] },
    },
    invalidators: {
      1: 'Sprechen (absichtlich oder versehentlich)',
      2: 'Lautes Lachen',
      3: 'Essen oder Trinken',
      4: 'Die Brust von der Qibla abwenden',
      5: '‘Amal kathir (viel gebetsfremde Bewegung)',
      6: 'Verlust der Gebetswaschung',
      7: 'Entblößen der ‘Awra',
      8: 'Weinen (aus weltlichen Gründen)',
      9: 'Erzwungenes Husten (ohne Grund)',
      10: 'Pusten (Luft aus dem Mund stoßen)',
      11: 'Fehlerhaftes Rezitieren des Korans (so dass sich der Sinn ändert)',
      12: 'Ohnmacht oder Verlust des Verstandes',
    },
    quiz: {
      1: { question: 'Wie heißt der Takbir zu Beginn des Gebets?', options: ['Thana', 'Eröffnungs-Takbir', 'As-salamu alaykum', 'Takbir at-Taschriq'] },
      2: { question: 'Wie oft wird in der Verbeugung der Tasbih gesprochen?', options: ['1', '3', '5', '7'] },
      3: { question: 'Wie viele Rak‘a hat das Fadschr-Gebet insgesamt?', options: ['2', '4', '6', '8'] },
      4: { question: 'Welche Bewertung hat das Witr-Gebet?', options: ['Fard', 'Wadschib', 'Sunna', 'Mustahabb'] },
      5: { question: 'Was davon macht das Gebet nicht ungültig?', options: ['Sprechen', 'Lachen', 'Weinen (aus Ehrfurcht vor Allah)', 'Essen'] },
      6: { question: 'Welche Bewertung hat das Rezitieren von al-Fatiha im Gebet?', options: ['Fard', 'Wadschib', 'Sunna', 'Mubah'] },
      7: { question: 'Welches ist der Tasbih der Niederwerfung?', options: ['Subhana rabbiyal-‘azim', 'Subhana rabbiyal-a‘la', 'Sami‘allahu liman hamidah', 'Rabbana lakal-hamd'] },
      8: { question: 'Wie viele Rak‘a hat das Pflichtgebet des Ischa?', options: ['2', '3', '4', '5'] },
      9: { question: 'Wie heißt das Sitzen zwischen den beiden Niederwerfungen?', options: ['Qa‘da', 'Dschalsa', 'Qawma', 'Qiyam'] },
      10: { question: 'Wann wird at-Tahiyyat im Gebet gesprochen?', options: ['In der ersten Rak‘a', 'In der Verbeugung', 'Im letzten Sitzen', 'In der Niederwerfung'] },
    },
  },
  id: {
    steps: {
      1: ['Niat', 'Berniatlah dalam hati untuk salat yang akan kamu kerjakan.', 'Niat dilakukan di dalam hati; melafalkannya adalah sunah. Contoh: "Aku berniat karena Allah untuk mengerjakan salat fardu Zuhur hari ini."'],
      2: ['Takbiratul ihram', 'Angkat kedua tangan setinggi telinga dan ucapkan "Allahu Akbar".', 'Laki-laki mengangkat tangan setinggi telinga, perempuan setinggi bahu. Ibu jari boleh menyentuh daun telinga.'],
      3: ['Berdiri (qiyam)', 'Berdiri tegak, tangan kanan diletakkan di atas tangan kiri.', 'Dibaca Subhanaka, ta\'awudz dan basmalah, Al-Fatihah, dan surah tambahan. Pandangan tertuju ke tempat sujud.'],
      4: ['Rukuk', 'Membungkuk sambil mengucapkan "Allahu Akbar".', 'Tangan menggenggam lutut dan punggung lurus. Ucapkan "Subhana rabbiyal-\'azim" 3 kali. Saat bangkit, ucapkan "Sami\'allahu liman hamidah".'],
      5: ["I'tidal (qawmah)", 'Bangkit dari rukuk dan ucapkan "Rabbana lakal-hamd".', 'Berdiri tegak sepenuhnya dengan tangan lurus di samping. Diam sejenak, lalu turun untuk sujud.'],
      6: ['Sujud', 'Turun untuk sujud sambil mengucapkan "Allahu Akbar".', 'Lutut lebih dahulu, lalu tangan, lalu dahi dan hidung diletakkan di lantai. Ucapkan "Subhana rabbiyal-a\'la" 3 kali.'],
      7: ['Duduk di antara dua sujud', 'Duduk tegak di antara dua sujud.', 'Ucapkan "Rabbighfir li". Tangan diletakkan di atas lutut.'],
      8: ['Duduk tasyahud (qa\'dah)', 'Pada rakaat terakhir, duduk dan baca at-Tahiyyat.', 'Dibaca at-Tahiyyat, doa Salli dan Barik, serta doa Rabbana. Jari telunjuk diangkat.'],
      9: ['Salam', 'Akhiri salat dengan salam ke kanan dan ke kiri.', 'Ucapkan "As-salamu \'alaikum wa rahmatullah", pertama ke kanan, lalu ke kiri.'],
    },
    recitations: {
      subhaneke: ['Subhanaka', 'Ya Allah, Mahasuci Engkau dari segala kekurangan, dan aku memuji-Mu. Mahaberkah nama-Mu dan Mahatinggi keagungan-Mu. Tiada tuhan selain Engkau.'],
      fatiha: ['Surah Al-Fatihah', 'Dengan menyebut nama Allah Yang Maha Pemurah lagi Maha Penyayang. Segala puji bagi Allah, Tuhan semesta alam. Maha Pemurah lagi Maha Penyayang. Yang menguasai di Hari Pembalasan. Hanya Engkaulah yang kami sembah, dan hanya kepada Engkaulah kami meminta pertolongan. Tunjukilah kami jalan yang lurus, (yaitu) Jalan orang-orang yang telah Engkau beri nikmat kepada mereka; bukan (jalan) mereka yang dimurkai dan bukan (pula jalan) mereka yang sesat.'],
      ihlas: ['Surah Al-Ikhlas', 'Katakanlah: "Dialah Allah, Yang Maha Esa. Allah adalah Tuhan yang bergantung kepada-Nya segala sesuatu. Dia tiada beranak dan tidak pula diperanakkan, dan tidak ada seorangpun yang setara dengan Dia".'],
      ruku: ['Tasbih rukuk', 'Mahasuci Tuhanku Yang Mahaagung dari segala kekurangan.'],
      secde: ['Tasbih sujud', 'Mahasuci Tuhanku Yang Mahatinggi dari segala kekurangan.'],
      ettehiyyatu: ['At-Tahiyyat', 'Segala penghormatan, salat, dan kebaikan milik Allah. Semoga keselamatan, rahmat Allah, dan berkah-Nya tercurah kepadamu, wahai Nabi. Semoga keselamatan tercurah kepada kami dan hamba-hamba Allah yang saleh. Aku bersaksi bahwa tiada tuhan selain Allah, dan aku bersaksi bahwa Muhammad adalah hamba dan utusan-Nya.'],
      salli: ['Allahumma Salli', 'Ya Allah, limpahkanlah rahmat kepada Muhammad dan keluarga Muhammad, sebagaimana Engkau melimpahkan rahmat kepada Ibrahim dan keluarga Ibrahim. Sesungguhnya Engkau Maha Terpuji lagi Maha Mulia.'],
      barik: ['Allahumma Barik', 'Ya Allah, berkahilah Muhammad dan keluarga Muhammad, sebagaimana Engkau memberkahi Ibrahim dan keluarga Ibrahim. Sesungguhnya Engkau Maha Terpuji lagi Maha Mulia.'],
      rabbena: ['Doa Rabbana', 'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan peliharalah kami dari siksa neraka.'],
    },
    types: {
      sabah: { name: 'Salat Subuh', note: 'Sunah Subuh sangat penting; Nabi tidak pernah meninggalkannya.', details: [['Sunah', 'Dua rakaat sunah (sunah muakkad)'], ['Fardu', 'Dua rakaat fardu']] },
      ogle: { name: 'Salat Zuhur', note: 'Pada sunah pertama, duduk dilakukan setiap dua rakaat.', details: [['Sunah sebelum', 'Empat rakaat sunah'], ['Fardu', 'Empat rakaat fardu'], ['Sunah sesudah', 'Dua rakaat sunah']] },
      ikindi: { name: 'Salat Asar', note: 'Sunah Asar dikerjakan sebelum fardu dan bukan sunah muakkad.', details: [['Sunah', 'Empat rakaat sunah (ghairu muakkad)'], ['Fardu', 'Empat rakaat fardu']] },
      aksam: { name: 'Salat Magrib', note: 'Fardu Magrib tiga rakaat; satu-satunya salat fardu dengan jumlah rakaat ganjil.', details: [['Fardu', 'Tiga rakaat fardu'], ['Sunah', 'Dua rakaat sunah']] },
      yatsi: { name: 'Salat Isya', note: 'Salat witir wajib (menurut mazhab Hanafi) dan dikerjakan setelah Isya.', details: [['Sunah sebelum', 'Empat rakaat sunah (ghairu muakkad)'], ['Fardu', 'Empat rakaat fardu'], ['Sunah sesudah', 'Dua rakaat sunah'], ['Witir', 'Tiga rakaat witir (wajib)']] },
    },
    terms: {
      farz: { name: 'Fardu', description: 'Ibadah yang diperintahkan Allah secara pasti. Meninggalkannya adalah dosa besar.', examples: ['Fardu salat lima waktu', 'Puasa Ramadan', 'Zakat', 'Haji (bagi yang mampu)', 'Wudu', 'Menghadap kiblat dalam salat'] },
      vacip: { name: 'Wajib', description: 'Perbuatan yang harus dikerjakan, meskipun dalilnya tidak sekuat fardu (dalam mazhab Hanafi).', examples: ['Salat witir', 'Salat Id', 'Zakat fitrah', 'Berkurban', 'Membaca Al-Fatihah dalam salat', 'Sujud sahwi'] },
      sunnet: { name: 'Sunah', description: 'Ibadah yang dikerjakan Nabi ﷺ dan beliau ingin kita kerjakan.', examples: ['Salat sunah rawatib', 'Bersiwak', 'Menjawab azan dan iqamah', 'Mengucapkan salam'] },
      mustehap: { name: 'Mustahab (Mandub)', description: 'Amalan yang berpahala bila dikerjakan dan tidak berdosa bila ditinggalkan.', examples: ['Salat sunah', 'Membaca selawat sebelum azan', 'Salat Duha', 'Salat malam (tahajud)'] },
      mubah: { name: 'Mubah', description: 'Perbuatan yang boleh dikerjakan atau ditinggalkan, tanpa hukum agama.', examples: ['Makan', 'Tidur', 'Berjalan', 'Berdagang'] },
    },
    invalidators: {
      1: 'Berbicara (sengaja atau tidak sengaja)',
      2: 'Tertawa terbahak-bahak',
      3: 'Makan atau minum',
      4: 'Memalingkan dada dari kiblat',
      5: 'Banyak gerakan di luar gerakan salat',
      6: 'Batalnya wudu',
      7: 'Terbukanya aurat',
      8: 'Menangis (karena urusan dunia)',
      9: 'Batuk yang dibuat-buat (tanpa sebab)',
      10: 'Meniup (mengeluarkan udara dari mulut)',
      11: 'Salah membaca Al-Qur\'an (hingga maknanya berubah)',
      12: 'Pingsan atau hilang akal',
    },
    quiz: {
      1: { question: 'Apa nama takbir yang diucapkan saat memulai salat?', options: ['Tsana', 'Takbiratul ihram', 'Assalamualaikum', 'Takbir tasyrik'] },
      2: { question: 'Berapa kali tasbih dibaca saat rukuk?', options: ['1', '3', '5', '7'] },
      3: { question: 'Berapa total rakaat salat Subuh?', options: ['2', '4', '6', '8'] },
      4: { question: 'Apa hukum salat witir (mazhab Hanafi)?', options: ['Fardu', 'Wajib', 'Sunah', 'Mustahab'] },
      5: { question: 'Manakah yang tidak membatalkan salat?', options: ['Berbicara', 'Tertawa', 'Menangis (karena takut kepada Allah)', 'Makan'] },
      6: { question: 'Apa hukum membaca Al-Fatihah dalam salat (mazhab Hanafi)?', options: ['Fardu', 'Wajib', 'Sunah', 'Mubah'] },
      7: { question: 'Manakah tasbih sujud?', options: ["Subhana rabbiyal-'azim", "Subhana rabbiyal-a'la", "Sami'allahu liman hamidah", 'Rabbana lakal-hamd'] },
      8: { question: 'Berapa rakaat fardu salat Isya?', options: ['2', '3', '4', '5'] },
      9: { question: 'Apa nama duduk di antara dua sujud?', options: ["Qa'dah", 'Jalsah', "I'tidal", 'Qiyam'] },
      10: { question: 'Kapan at-Tahiyyat dibaca dalam salat?', options: ['Pada rakaat pertama', 'Saat rukuk', 'Pada duduk terakhir', 'Saat sujud'] },
    },
  },
};

const packFor = (language: string): Pack | null => PACKS[language.slice(0, 2) as Lang] ?? null;

export const localizePrayerTeacher = (language: string) => {
  const pack = packFor(language);
  return {
    step: (s: PrayerStep): PrayerStep => {
      const c = pack?.steps[s.id];
      return c ? { ...s, name: c[0], description: c[1], detail: c[2] } : s;
    },
    recitation: (r: Recitation): Recitation => {
      const c = pack?.recitations[r.id];
      return c ? { ...r, name: c[0], latin: LATIN[r.id] ?? r.latin, meaning: c[1] } : r;
    },
    type: (p: PrayerType): PrayerType => {
      const c = pack?.types[p.id];
      return c ? { ...p, name: c.name, note: c.note, details: p.details.map((d, i) => ({ ...d, type: c.details[i]?.[0] ?? d.type, description: c.details[i]?.[1] ?? d.description })) } : p;
    },
    term: (term: ReligiousTerm): ReligiousTerm => {
      const c = pack?.terms[term.id];
      return c ? { ...term, name: c.name, description: c.description, examples: c.examples } : term;
    },
    invalidator: (i: PrayerInvalidator): PrayerInvalidator => {
      const c = pack?.invalidators[i.id];
      return c ? { ...i, text: c } : i;
    },
    quiz: (q: QuizQuestion): QuizQuestion => {
      const c = pack?.quiz[q.id];
      return c ? { ...q, question: c.question, options: c.options } : q;
    },
  };
};
