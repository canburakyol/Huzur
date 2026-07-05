const copy = {
  prayer_times:['Günün koşturmacasında vakitleri kaçırma','Namaz vakitlerini sade bir ekranda takip et'],
  qibla:['Yeni bir yerde kıbleyi arama','Kıble yönünü birkaç saniyede bul'],
  dhikr:['Küçük adımlar, düzenli bir ibadet rutini','Zikirlerini kolayca say ve takip et'],
  quran:['Kur’an okumaya her gün küçük bir yer aç','Kaldığın yerden okumaya devam et'],
  prayer_circle:['Dualarda birbirimize yer açalım','Dua kardeşliğiyle iyiliği paylaş'],
  khatm:['Hatim hedefin yarım kalmasın','İlerlemeni gör, kaldığın yeri unutma'],
  friday:['Cumanın huzurunu sevdiklerinle paylaş','Hazır Cuma içeriklerini kolayca gönder'],
  general:['İbadet rutinin dağınık mı?','Namaz, kıble, zikir ve daha fazlası tek yerde']
};

const narrations = {
  prayer_times: 'Namaz vakitlerini bulunduğun konuma göre takip et. Yaklaşan vakti tek bakışta gör. Huzur, günlük ibadet düzenini sürdürmene yardımcı olur.',
  qibla: 'Bulunduğun yerde kıble yönünü birkaç saniyede bul. Sade pusula ekranıyla yönünü kolayca belirle. İhtiyacın olduğunda Huzur yanında.',
  dhikr: 'Zikirlerini kolayca say ve günlük ilerlemeni takip et. Kaldığın sayı kaybolmasın. Düzenli zikir alışkanlığını Huzur ile sürdür.',
  quran: 'Kur’an okumaya kaldığın yerden devam et. Surelere ve ayetlere kolayca ulaş. Günlük okuma düzenini Huzur ile takip et.',
  prayer_circle: 'Dua kardeşliğinde güzel dileklere ortak ol. Onaylı duaları paylaş ve başkalarının dualarına destek ver. İyiliği birlikte çoğalt.',
  khatm: 'Hatim hedefini oluştur ve ilerlemeni adım adım gör. Kaldığın yeri unutmadan okumaya devam et. Hatim yolculuğunu Huzur ile planla.',
  friday: 'Cuma gününün huzurunu sevdiklerinle paylaş. Hazır Cuma mesajlarına kolayca ulaş. Beğendiğin içeriği birkaç dokunuşla gönder.',
  general: 'Namaz vakitleri, kıble yönü, zikir ve Kur’an okuma araçları Huzur’da bir arada. İhtiyacın olan özelliğe kolayca ulaş. Günlük ibadet rutinini sadeleştir.'
};

export function generateScript(category, approvedContent = []) {
  const selected = approvedContent[Math.floor(Math.random() * approvedContent.length)];
  const [hook, benefit] = copy[category] ?? copy.general;
  return {
    hook, benefit,
    approvedText: selected?.text ?? null,
    approvedSource: selected?.source ?? null,
    ctaTitle: 'Huzur uygulamasını indir',
    ctaSubtitle: 'Namaz vakitleri, kıble, zikir ve daha fazlası tek yerde',
    narration: narrations[category] ?? narrations.general,
    duration: 13
  };
}
