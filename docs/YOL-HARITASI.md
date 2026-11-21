# Huzur — Düzeltme Yol Haritası

Sıralı ilerlenecek. Bir adım bitmeden sonrakine geçme; her adım tek oturumda bitecek büyüklükte.
Durum sütununu adım bitince güncelle. Son güncelleme: 14 Kasım 2026, sürüm 18.4.0 (vc40).

Sıralama mantığı: önce kullanıcının **şu an** yaşadığı kırık şeyler, sonra **yanlış bilgi** (dini içerik),
sonra **görünüm**, en son **iç kalite**. Yanlış dini bilgi, eski görünümden daha ağır bir sorundur.

| # | Adım | Kim | Süre | Durum |
|---|------|-----|------|-------|
| 0 | 18.4.0'ı Play Store'a yükle | Sen | 15 dk | ✅ 14 Kas |
| 1 | Faturalandırmayı aç, fonksiyonları deploy et | Sen + ben | 1 oturum | 🟨 Blaze ✅ · getFamilyMembers ✅ 21 Kas · telefonda deneme kaldı |
| 2 | Gizlilik URL'si ve yayın sonrası izleme | Sen + ben | 30 dk | 🟨 URL ✅ 14 Kas · vitals: ~17 ve ~21 Kas |
| 3 | Özel Günler takvimini düzelt | Ben | 1 oturum | ✅ 19 Kas |
| 4 | Satın alma / geri yükleme testi | Sen + ben | 1 oturum | ⬜ |
| 5 | Dini içerik doğrulaması (5 parça) | Ben | 5 oturum | ✅ 19 Kas |
| 6 | Mushaf tasarımına taşıma (ekran ekran) | Ben | ~10 oturum | ⬜ |
| 7 | Teknik borç | Ben | 3–4 oturum | ⬜ |
| 8 | Almanca / Endonezce çeviri | Ben | 3–4 oturum | ✅ 20 Kas (görünen ekranlar) |

---

## 0. Yayın — 18.4.0

- Android Studio → Build → Generate Signed App Bundle → release → Play Console'a yükle.
- Web paketi zaten derlenip `android/` içine eşitlendi; yeniden derlemeye gerek yok.
- **Bitti sayılır:** Play Console'da 18.4.0 (40) yayında ya da kademeli dağıtımda.

## 1. Sunucu tarafını ayağa kaldır — en yüksek etki

Firebase faturalandırması kapalı (`billingEnabled: false`); bütün Cloud Functions en az 22 Ekim'den beri çalışmıyor.
Soru-Cevap, aile hedefleri, davet/ödül ve sunucuya bağlı her özellik kırık.

1. **Sen:** Firebase / GCP konsolunda faturalandırmayı aç. Aynı anda bir **bütçe uyarısı** kur (ör. aylık 10 $ ve 25 $ eşikleri).
2. **Ben:** `firebase deploy --only functions` öncesi hangi fonksiyonların değiştiğini listele; önce yalnızca
   `firebase deploy --only functions:getFamilyMembers`, sonra gerekiyorsa diğerleri.
3. **Ben:** Fonksiyon loglarını ve Crashlytics'i kontrol et; telefonda Soru-Cevap ve Aile ekranını dene.
- **Bitti sayılır:** Soru-Cevap cevap veriyor, Aile ekranı tüm üyeleri gösteriyor, loglarda yeni hata yok.
- **21 Kas:** Blaze açıldı; fonksiyonlar 'billing disabled' vermiyor (listPublicHatims canlıda çalıştı).
  `getFamilyMembers` yüklendi (europe-west1, 2. nesil); webde App Check olmadığı için reddediyor, telefonda denenecek.
  Canlı 33 fonksiyon = koddaki liste. Bütçe uyarısı kurulduğu doğrulanmadı. CLI uyarısı: firebase-functions paketi eski.

## 2. Gizlilik ve izleme

- **Sen:** Play Console → Uygulama içeriği → Gizlilik politikası adresi `https://canburakyol.github.io/privacy-policy/` mi?
- **Ben (yayından ~3 ve ~7 gün sonra):** Play vitals çökme/ANR oranı, yeni yorumlar, Crashlytics.
  Bu oturumda Play Console bağlantısı kurulamadı; bağlantıyı yeniden dene.
- **Bitti sayılır:** URL doğru; 7 günlük çökme oranı önceki sürümden kötü değil.

## 3. Özel Günler takvimi — yanlış ve bayatlamış tarih

`src/domains/tools/components/SpecialDaysCalendar.jsx` yalnızca 2025–2026 tarihlerini elle tutuyor; Aralık 2026'dan sonra boş kalacak.
2026 satırlarında hatalı görünen tarihler var (Mevlid 15 Ocak = Miraç'ın tarihi; Ramazan Bayramı arife gününe yazılmış;
Hicri yılbaşı ve Aşure ~10 gün kaymış). `src/data/religiousDays.ts` de yalnızca 2025'i içeriyor.

- Tarihleri Diyanet'in yayımladığı dini günler takviminden doğrula (2026, 2027, 2028).
- İki kaynağı tek veriye indir; yıl bitince boş kalmasın diye en yakın yılın günlerini göster.
- Bir test: her yıl için liste boş değil, tarihler sıralı, bilinen birkaç tarih Diyanet'le aynı.
- **Bitti sayılır:** 2027 sonuna kadar bütün kandil/bayram tarihleri Diyanet'le birebir; test geçiyor.
- **Yapıldı (19 Kas):** Tek kaynak `src/data/religiousDays.ts` (Diyanet 2025–2028). Kampanya/bildirim seçimi (`campaignService`) de bu tabloya bağlandı.
  Özel Günler menüde (Diğer araçlar); Hadisler 5b doğrulamasından sonra menüye geri eklendi. Dini Günler listesi (Özel Günler'in kopyası),
  Hikmetler (âlim sözleri kaynaksız), Ajanda ve Tebrik Kartları bilinçli olarak gizli. Tablo Aralık 2028'de bitiyor; 2028 ortasında 2029–2030 eklenmeli.
  Ajanda'nın not anahtarı UTC tarihle üretiliyor (Türkiye'de bir gün geri); düzeltmek kayıtlı notları kaydırır, taşıma ile birlikte yapılmalı.

## 4. Satın alma testi

Pro satın alma ve geri yükleme hiç gerçek cihazda denenmedi.
- **Sen:** Play Console → Lisans testi'ne kendi hesabını ekle.
- **Ben:** Telefonda yıllık ve aylık satın alma, iptal, geri yükleme; RevenueCat'te `pro_access` yetkisinin açıldığını doğrula; reklamların kalktığını gör.
- **Bitti sayılır:** Dört akış (satın al, iptal, geri yükle, reklamsız) çalışıyor.

## 5. Dini içerik doğrulaması

Dua Kitabı için yapılan kontrol (Kur'an metni + hadis koleksiyonlarıyla otomatik karşılaştırma, kısaltılmış anlam testi) diğer içeriğe uygulanacak.
Her parça ayrı oturum; her parçada **yanlış atıf, eksik meal, kaynağı olmayan söz** aranır.

| Parça | Dosyalar | Not |
|-------|----------|-----|
| 5a Günün ayeti ✅ 19 Kas | `src/data/discoveryData.ts`, `VerseOfTheDay.jsx` yedek metni | 15 ayet kontrol edildi; Hûd 11:7 yanlış atıf → Hadîd 57:4, İnşirah referansı düzeltildi |
| 5b Hadisler ✅ 19 Kas | `src/data/hadiths.ts`, `contentService.ts` | 91 hadis 7 koleksiyonla karşılaştırıldı; 4 zayıf/hadis olmayan kaldırıldı, 6 metin/kaynak düzeltildi |
| 5c Zikir / Tespihat / Nafile ✅ 19 Kas | `zikirData.ts`, `tespihatData.ts`, `NafilePrayers.jsx`, `Zikirmatik.jsx` | Tespihat doğru (Ayetel Kürsî Uthmani ile birebir); Nafile'de vitir/duha/işrak/teheccüd açıklamaları düzeltildi; `zikirData.ts` kullanılmıyor (ölü kod) |
| 5d Hikmetler ✅ 19 Kas | `src/data/hikmetData.ts` | 6 zayıf/hadis olmayan kaldırıldı, 5 lafız/atıf düzeltildi; âlim sözlerinin çoğu kaynaksız (ekran gizli) |
| 5e Esmâü'l-Hüsnâ, Namaz Hocası ✅ 19 Kas | `esmaUlHusnaData.ts`, `prayerTeacherData.ts` | 99 isim Tirmizî 3507 sırasıyla birebir; rekât tablosu doğru; selamı almak vaciptir düzeltmesi |
| 5f Yarışma, Duygu ayetleri, Tecvid, Nüzul, Fihrist ✅ 19 Kas | `dailyQuizData.ts`, `moodData.ts`, `tajweed*.ts`, `nuzulData.ts`, `detailedFihrist.ts` | Zamm-ı sure "her rekâtta" yanlışı, kıble 16-17 ay; kalkale örneği (قُلْ → الْفَلَقِ), Mü'minûn 23:55; Nüzul'de Duha/Tebbet/Mâide rivayetleri Buhârî'ye göre; fihristin ~280 ayeti konusuyla uyumlu. tr çeviride "?" olmuş 30 harf düzeltildi, testle korunuyor |
| 5h Kütüphane, Zekât, manevi öneriler ✅ 20 Kas | `libraryData.ts` (+en/de/id), `ZakatCalculator.jsx`, `spiritualInterventions` | Kütüphane'de 18 hata 4 dilde (Varaka "son peygamber", Hz. Ömer'in İslam'a girişi, Karahanlı 840, Mus'ab'ın kefeni, Talha "1000 dinar", Süleyman "cin dili", Fatiha'nın Arapçası eksikti...). Zekât: gümüş sabit 30 TL/gr ve eski altın fiyatıyla hesaplanıyordu; artık fiyatlar giriliyor, test var. Manevi öneri metinleri (haftalık rapor, bildirim) Türkçe harfsizdi ve her dilde Türkçe çıkıyordu: harfler düzeltildi, Türkçe dışında çevrilmiş yedek metin gösteriliyor |
| 5g Siyer ⬜ | `seerahData.ts` | Siyer Haritası ve Nüzul ekranları menüde yok (gizli); açılacaksa önce doğrulanmalı |

- **Bitti sayılır:** Her parçada doğrulanamayan madde ya düzeltildi ya "kaynak doğrulanmadı" diye işaretlendi; regresyon testi var.

## 6. Mushaf tasarımına taşıma

Bitenler: Kıble, Ana sayfa, Pro, Zikirmatik, Dua Kitabı, İmsakiye, Kur'an okuyucu, Kaza Takibi, Ayarlar (20 Kas; ~103 ekran bileşeninin 9'u).
21 Kas: Tecvid, Kelime Kelime, Topluluk (Hatim/Dua) taşındı; Esmâü'l-Hüsnâ zaten uyumluydu.
Menüden hiç açılamayan 13 ekran (taşınmadı, önce aç/sil kararı): spiritualCoach, weeklySermon, radio, liveBroadcast,
quranMemorize, nuzulExplorer, seerahMap, deedJournal, nafilePrayers, islamicMeditation, calendar, zakat, agenda.
Her ekranda: `PageHeader` + `hz-*` sınıfları, satır içi stil yerine CSS, emoji ikon alanları → lucide, gündüz/gece telefonda kontrol.
20 Kas renk birliği: vurgu rengi seçici kaldırıldı (Tema = açık/koyu/sistem). Eski token'lar `variables.css` sonundaki
takma ad bloğuyla iki temada Mushaf'a bağlı; 101 dosyada 2000 kullanım Mushaf adlarına çevrildi; paletin dışındaki 161 sabit
renk (indigo, mavi, turuncu, amber) Mushaf karşılığına. Kontrast taraması (<3:1) iki temada 32 ekran + 4 sekmede temiz.
Kalan: `--on-primary` (dolgu üstü yazı, bilerek), modül takma adları (`--fam-*`, `--edu-*`, `--soc-*`), gizli ekranlar,
düzen/bileşen düzeyinde taşıma (PageHeader, satır içi stiller) ekran ekran sürüyor.

Sıra (en çok kullanılan önce):
1. ✅ Kur'an okuyucu (`domains/quran`) — 20 Kas; telefonda göz kontrolü kaldı
2. ✅ Kaza Takibi (`PrayerTracker.jsx`) — 20 Kas
3. ✅ Ayarlar (`domains/settings`) — 20 Kas; bildirim izni Android'de artık yerel API'den okunuyor
4. Soru-Cevap
5. Tespihat, Esmâü'l-Hüsnâ, Dua Takipçisi
6. Günlük Görevler, Amel Defteri, Rozetler (`gamificationData.ts` emojileri)
7. Hadisler, Hikmetler, Tebrik Kartları, Özel Günler
8. Kalan araç ekranları (Zekât, Cami Bulucu, Hatim, Aile)
- **Bitti sayılır (her ekran için):** Eski token kalmadı, emoji kalmadı, iki temada telefonda doğrulandı, commit'lendi.

## 7. Teknik borç

- ✅ `npx tsc --noEmit` sıfır hata (21 Kas). Sırada: CI'a tip kontrolü eklemek.
- ✅ Capacitor 8.4.3'e sabitlendi (20 Kas; GHSA-rvm3-566m-v7fv). 8.6.x'e geçme: SystemBars orada pencere kökünü
  dinliyor, AdMob banner'ı da aynı dinleyiciyi eziyor; Android 15+'ta klavye/inset hatası riski. AdMob eklentisi
  güncellenince yeniden değerlendir.
- ✅ `scope-files` zaman aşımı ve testlerdeki i18n HTTP istekleri (teardown sonrası AbortError) giderildi.
- ✅ `reports/*.md` artık yalnızca içerik değişince yeniden yazılıyor.
- **Bitti sayılır:** `tsc` sıfır hata, test paketi kararlı geçiyor, `git status` temiz kalıyor.

## 8. Almanca / Endonezce çeviri

Her dilde ~1100 metin İngilizce duruyor (en çok: `content`, `hikmet`, `greetingCards`, `deedJournal`, `menu`).
Bu dillerden indirme olmadığı için en sonda. Önce arayüz metinleri, sonra içerik; dini metinler Türkçe/Arapça kaynaktan.
- **20 Kas:** Görünen ekranlarda İngilizce kalan metin yok; kalanlar özel ad/terim (Juz, Dhikr, Surah) ya da gizli ekran
  (Hikmetler, Tebrik Kartları, Amel Defteri — açılırsa önce içerik doğrulanıp sonra çevrilmeli) ya da kullanılmayan `content.*`.
  Tecvid kuralları tr kaynaktan en/de/id yeniden yazıldı (id makine çevirisi bozuktu, örnekler yanlıştı); ölü ad alanı dosyaları
  silindi, açılışta yalnızca `translation` + `tajweed` yükleniyor. Tecvid okunuşları (transliteration) hâlâ Türkçe harflerle.
- **Bitti sayılır:** de/id'de İngilizceyle birebir aynı çok kelimeli metin kalmadı (özel adlar hariç).
- **Durum (19 Kas):** Arayüz, bildirimler, Kur'an (Bubenheim/Kemenag mealleri), günlük içerik, Esma, hadisler,
  Siyer, Namaz Hocası, Tespihat, kütüphane, fihrist, kelime kelime meal, asistan cevapları ve paylaşım metinleri
  4 dilde. Tüm ekranlarda tr↔de fark taramasında yalnızca marka/özel adlar kaldı.
  Davet ekranları, lisanslar, bildirim kanalları ve yerel ezan bildirimi de 4 dilde (19 Kas akşam).
  Endonezya/Malezya/Singapur/Brunei'de vakitler Kemenag açılarıyla (20°/18°) hesaplanıyor.
  Kalan: telefonda dil değiştirerek göz kontrolü (özellikle ezan bildirimi). Zekât bilinçli olarak ₺.

---

### Her oturumda

- Başlamadan: `git pull`, bu dosyada sıradaki ⬜ adım.
- Bitirirken: test + telefonda kontrol, commit, bu tabloda durumu ✅ yap.
- Yayına çıkacak bir değişiklik birikirse: `versionCode`/`versionName` yükselt (şu an 40 / 18.4.0).
