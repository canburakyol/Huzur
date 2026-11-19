export type NuzulEntry = {
  id: string;
  keywords: string[];
  title: string;
  content: string;
  source: string;
}

export const nuzulData: NuzulEntry[] = [
  {
    id: 'fatiha',
    keywords: ['fatiha', 'elham', 'fatiha suresi', 'fatiha nüzul'],
    title: 'Fatiha Suresi',
    content: `Fatiha Suresi'nin nüzul sebebiyle ilgili belirli bir olaydan ziyade, genel bir ihtiyaca binaen indirildiği belirtilmektedir. Mekke döneminin ilk yıllarında nazil olan bu sure, Kur'an-ı Kerim'in mushaftaki ilk, nüzul sıralamasında ise 5. suresidir.

**Temel Nedenler:**
1. **Dua ve İbadet Rehberliği:** Müslümanlara dua ve ibadetlerinde bir rehberlik sağlamak, Allah'a kulluğun en güzel örneklerini sunmak amacıyla indirilmiştir.
2. **Tevhidin Vurgulanması:** Allah'ın birliğini, yüceliğini, rahmetini ve hidayetini vurgulamaktadır.
3. **Namazın Temeli:** Her rekâtta okunur (Hanefîlere göre vacip, Şâfiîlere göre farz); müminin Rabbiyle konuşurcasına O'na yaklaşmasını sağlamak hedeflenmiştir.

Bazı kaynaklarda, Cebrail (a.s)'ın Hz. Peygamber'e görünmesi ve Peygamberimizin endişelenmesi üzerine, onu teselli etmek ve namazı öğretmek üzere indirildiği de rivayet edilir; bu rivayetin senedi zayıftır.`,
    source: 'Diyanet Tefsiri / İslam Ansiklopedisi'
  },
  {
    id: 'bakara_255',
    keywords: ['ayetel kürsi', 'ayet-el kürsi', 'bakara 255', 'kürsi'],
    title: 'Ayetel Kürsi (Bakara 255)',
    content: `Ayetel Kürsi, Bakara Suresi'nin 255. ayeti olup, özel bir olay üzerine inmekten ziyade, İslam inancının en temel ilkesi olan "Tevhid"i (Allah'ın birliği) en kapsamlı şekilde anlatmak üzere indirilmiştir.

**Öne Çıkan Hususlar:**
* Allah'ın "Hayy" (Diri) ve "Kayyum" (Her şeyi ayakta tutan) sıfatlarını açıklar.
* O'nun kürsüsünün (hakimiyetinin) gökleri ve yeri kuşattığını bildirir.
* Müşriklerin şefaat anlayışını reddederek, izni olmadan kimsenin şefaat edemeyeceğini vurgular.

Efendimiz (s.a.v), Übey b. Ka'b'a bu ayetin Kur'an'ın en büyük ayeti olduğunu teyit etmiştir (Müslim, Salâtü'l-müsâfirîn). İniş sebebi, müminlere Allah'ın azametini ve kâinat üzerindeki mutlak hakimiyetini öğretmektir.`,
    source: 'Kütüb-i Sitte / Diyanet'
  },
  {
    id: 'kevser',
    keywords: ['kevser', 'kevser suresi', 'ebter'],
    title: 'Kevser Suresi',
    content: `Kevser Suresi, Mekkeli müşriklerin Hz. Peygamber'e (s.a.v) yönelik hakaretlerine bir cevap ve teselli olarak indirilmiştir.

**Olay:**
Peygamber Efendimizin erkek çocukları (Kasım ve Abdullah) vefat edince, müşriklerden As b. Va'il gibi kimseler, "Onun soyu kesildi, o ebterdir (soyu kesik)" diyerek alay etmişlerdir.

**Nüzul Sebebi:**
Yüce Allah, Peygamberini teselli etmek için bu sureyi indirmiş ve şöyle buyurmuştur:
1. "Biz sana Kevser'i (bol nimeti, cennet nehrini, bitmeyen hayrı) verdik."
2. "Asıl soyu kesik (ebter) olan, sana kin tutan kimsedir."

Bu sure, Peygamberimizin manevi soyunun (ümmetinin) kıyamete kadar devam edeceğini müjdelemiştir.`,
    source: 'Taberi / Elmalılı Hamdi Yazır'
  },
  {
    id: 'maide_3',
    keywords: ['maide 3', 'maide suresi 3', 'dini tamamladım', 'veda haccı'],
    title: 'Maide Suresi 3. Ayet',
    content: `Maide Suresi'nin 3. ayeti ("Bugün sizin için dininizi kemale erdirdim..."), Veda Haccı sırasında, Arafat'ta, Cuma günü nazil olmuştur.

**Önemi:**
Bu ayet, İslam dininin hükümlerinin tamamlandığını ve Allah'ın müminler üzerindeki nimetini tamamladığını ilan eder. Yahudilerden birisi Hz. Ömer'e: "Eğer bu ayet bize inseydi, o günü bayram ilan ederdik" demiştir. Hz. Ömer de: "Biz o günü ve ayetin Peygamber'e nerede indiğini biliyoruz: Cuma günü Arafat'ta duruyordu" cevabını vermiştir (Buhârî, Îmân; Müslim, Tefsîr).

İbn Abbas da bu ayetin iki bayramın bir araya geldiği gün, Cuma ve Arefe gününde indiğini söylemiştir (Tirmizî, Tefsîr, Mâide).`,
    source: 'Buhari / Müslim / Tirmizi'
  },
  {
    id: 'alak_ilk',
    keywords: ['alak', 'alak suresi', 'ilk vahiy', 'oku', 'ikra'],
    title: 'Alak Suresi (İlk 5 Ayet)',
    content: `Alak Suresi'nin ilk 5 ayeti, Kur'an-ı Kerim'in inen ilk ayetleridir.

**Olay:**
Hz. Peygamber (s.a.v), Hira Mağarası'nda tefekkür halindeyken Cebrail (a.s) gelmiş ve ona "Oku!" (İkra) demiştir. Peygamberimiz "Ben okuma bilmem" cevabını vermiştir. Bu diyalog üç kez tekrarlanmış, sonunda Cebrail (a.s) ilk 5 ayeti vahyetmiştir:

"Yaratan Rabbinin adıyla oku! O, insanı bir aşılanmış yumurtadan yarattı. Oku! Rabbin, en büyük kerem sahibidir. O, kalemle yazmayı öğretendir, insana bilmediğini öğretendir."

Bu olay, 610 yılı Ramazan ayında, Kadir Gecesi'nde gerçekleşmiş ve İslam'ın doğuşunu müjdelemiştir.`,
    source: 'Buhari, Bed\'ü\'l-Vahy'
  },
  {
    id: 'ihlas',
    keywords: ['ihlas', 'ihlas suresi', 'kul huvallahu ehad', 'allahın sıfatları'],
    title: 'İhlas Suresi',
    content: `İhlas Suresi, Mekkeli müşriklerin Hz. Peygamber'e gelerek Allah'ı tarif etmesini istemeleri üzerine inmiştir.

**Soru:**
Müşrikler: "Ey Muhammed! Bize Rabbinin nesebini anlat" demişlerdir (Tirmizî, Tefsîr, İhlâs). Başka rivayetlerde "Altından mıdır, gümüşten midir?" diye sordukları da geçer.

**Cevap:**
Allah Teala, Kendisini en güzel ve özlü şekilde anlatan bu sureyi indirmiştir:
"De ki: O Allah birdir. Allah Samed'dir (Her şey O'na muhtaçtır, O hiçbir şeye muhtaç değildir). O doğurmamış ve doğmamıştır. Hiçbir şey O'na denk değildir."

Bu sure, Allah'ın birliğini (Tevhid) ve hiçbir şeye benzemediğini en net şekilde ortaya koyar.`,
    source: 'Tirmizi / Müsned'
  },
  {
    id: 'duha',
    keywords: ['duha', 'duha suresi', 'kuşluk', 'rabbin seni terk etmedi'],
    title: 'Duha Suresi',
    content: `Duha Suresi, vahyin bir süre gelmemesi üzerine inmiştir.

**Olay:**
Cündüb b. Süfyân'ın anlattığına göre Hz. Peygamber rahatsızlanmış ve iki üç gece (gece namazına) kalkamamıştı. Bir kadın gelip "Ey Muhammed, şeytanın seni terk etmiş olmalı" demiştir (Buhârî, Tefsîr, Duhâ; Müslim, Cihâd). Diğer rivayetlerde vahyin daha uzun süre (15 gün veya daha fazla) kesildiği ve müşriklerin "Rabbi onu terk etti" diye alay ettikleri de nakledilir.

**Teselli:**
Yüce Allah, kuşluk vaktine ve geceye yemin ederek söze başlamış ve: "Rabbin seni terk etmedi ve sana darılmadı" buyurarak Peygamberini teselli etmiştir. Ayrıca ahiretin dünyadan daha hayırlı olduğunu ve Allah'ın ona hoşnut olacağı nimetler vereceğini müjdelemiştir.`,
    source: 'Buhari / Müslim'
  },
  {
    id: 'tebbet',
    keywords: ['tebbet', 'tebbet suresi', 'ebu leheb'],
    title: 'Tebbet Suresi',
    content: `Tebbet Suresi, Peygamberimizin amcası Ebu Leheb hakkında inmiştir.

**Olay:**
Hz. Peygamber, "Yakın akrabanı uyar" emri üzerine Safa tepesine çıkarak Kureyşlileri İslam'a davet etmiştir. Herkes dinlerken, Ebu Leheb öne çıkıp: "Kahrolasıca! Bizi bunun için mi topladın?" diyerek hakaret etmiştir (Buhârî, Tefsîr, Tebbet).

**Cevap:**
Bunun üzerine Allah Teala, Ebu Leheb'in helak olacağını, malının ve kazandıklarının ona fayda vermeyeceğini bildiren bu sureyi indirmiştir. Ebu Leheb'in karısı da Peygamberimizin yoluna dikenler döktüğü için "odun hamalı" olarak zikredilmiştir.`,
    source: 'Buhari / Taberi'
  },
  {
    id: 'fil',
    keywords: ['fil', 'fil suresi', 'ebrehe', 'kabe'],
    title: 'Fil Suresi',
    content: `Fil Suresi, Peygamberimizin doğumundan kısa bir süre önce gerçekleşen "Fil Vakası"nı anlatır.

**Olay:**
Yemen Valisi Ebrehe, insanları Kabe'den vazgeçirip kendi yaptırdığı kiliseye yöneltmek için büyük bir ordu ve fillerle Mekke'ye saldırmıştır. Kabe'yi yıkmak istemiştir.

**Sonuç:**
Allah Teala, sürü sürü kuşlar (ebâbîl) göndererek Ebrehe'nin ordusunu "yenilmiş ekin yaprağı" gibi darmadağın etmiştir. Bu sure, Kabe'nin sahibinin Allah olduğunu ve O'nun evini koruduğunu hatırlatmak için indirilmiştir.`,
    source: 'İbn Hişam / Taberi'
  }
];

export const searchNuzul = (query: string): NuzulEntry | null => {
  const normalizedQuery = query.toLowerCase().trim();

  const results = nuzulData.filter(item =>
    item.keywords.some(keyword => normalizedQuery.includes(keyword)) ||
    item.title.toLowerCase().includes(normalizedQuery)
  );

  return results.length > 0 ? results[0] : null;
};
