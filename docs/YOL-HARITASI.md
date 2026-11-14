# Huzur — Düzeltme Yol Haritası

Sıralı ilerlenecek. Bir adım bitmeden sonrakine geçme; her adım tek oturumda bitecek büyüklükte.
Durum sütununu adım bitince güncelle. Son güncelleme: 14 Kasım 2026, sürüm 18.4.0 (vc40).

Sıralama mantığı: önce kullanıcının **şu an** yaşadığı kırık şeyler, sonra **yanlış bilgi** (dini içerik),
sonra **görünüm**, en son **iç kalite**. Yanlış dini bilgi, eski görünümden daha ağır bir sorundur.

| # | Adım | Kim | Süre | Durum |
|---|------|-----|------|-------|
| 0 | 18.4.0'ı Play Store'a yükle | Sen | 15 dk | ⬜ |
| 1 | Faturalandırmayı aç, fonksiyonları deploy et | Sen + ben | 1 oturum | ⬜ |
| 2 | Gizlilik URL'si ve yayın sonrası izleme | Sen + ben | 30 dk | ⬜ |
| 3 | Özel Günler takvimini düzelt | Ben | 1 oturum | ⬜ |
| 4 | Satın alma / geri yükleme testi | Sen + ben | 1 oturum | ⬜ |
| 5 | Dini içerik doğrulaması (5 parça) | Ben | 5 oturum | ⬜ |
| 6 | Mushaf tasarımına taşıma (ekran ekran) | Ben | ~10 oturum | ⬜ |
| 7 | Teknik borç | Ben | 3–4 oturum | ⬜ |
| 8 | Almanca / Endonezce çeviri | Ben | 3–4 oturum | ⬜ |

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
| 5a Günün ayeti | `src/data/discoveryData.ts`, `VerseOfTheDay.jsx` yedek metni | Kur'an'la otomatik karşılaştırılabilir |
| 5b Hadisler | `src/data/hadiths.ts`, `contentService.ts` | Koleksiyonlarla otomatik karşılaştırılabilir |
| 5c Zikir / Tespihat / Nafile | `zikirData.ts`, `tespihatData.ts`, `NafilePrayers.jsx`, `Zikirmatik.jsx` | Zikirmatik'te yalnız Hasbünallah'ın kaynağı var |
| 5d Hikmetler | `src/data/hikmetData.ts` | Sözlerin kime ait olduğu ayrı ayrı doğrulanmalı |
| 5e Esmâü'l-Hüsnâ, Namaz Hocası | `esmaUlHusnaData.ts`, `prayerTeacherData.ts` | Fıkhi bilgi: Diyanet ilmihaline göre |

- **Bitti sayılır:** Her parçada doğrulanamayan madde ya düzeltildi ya "kaynak doğrulanmadı" diye işaretlendi; regresyon testi var.

## 6. Mushaf tasarımına taşıma

Bitenler: Kıble, Ana sayfa, Pro, Zikirmatik, Dua Kitabı, İmsakiye (~103 ekran bileşeninin 6'sı).
Her ekranda: `PageHeader` + `hz-*` sınıfları, satır içi stil yerine CSS, emoji ikon alanları → lucide, gündüz/gece telefonda kontrol.

Sıra (en çok kullanılan önce):
1. Kur'an okuyucu (`domains/quran`) — büyük, iki oturum
2. Kaza Takibi (`PrayerTracker.jsx`)
3. Ayarlar (`domains/settings`)
4. Soru-Cevap
5. Tespihat, Esmâü'l-Hüsnâ, Dua Takipçisi
6. Günlük Görevler, Amel Defteri, Rozetler (`gamificationData.ts` emojileri)
7. Hadisler, Hikmetler, Tebrik Kartları, Özel Günler
8. Kalan araç ekranları (Zekât, Cami Bulucu, Hatim, Aile)
- **Bitti sayılır (her ekran için):** Eski token kalmadı, emoji kalmadı, iki temada telefonda doğrulandı, commit'lendi.

## 7. Teknik borç

- `npx tsc --noEmit` 432 hata veriyor (derleme denetlemediği için uygulama çalışıyor). Alan alan sıfırla; en sonda CI'a tip kontrolü ekle.
- `scripts/scope-files.test.js` tam pakette 5 sn zaman aşımına takılıyor: testin süresini kısalt ya da zaman aşımını yükselt.
- `reports/*.md` testler/dev sunucu tarafından yeniden yazılıyor ve her seferinde git'i kirletiyor: `.gitignore`'a al ya da üretimi durdur.
- **Bitti sayılır:** `tsc` sıfır hata, test paketi kararlı geçiyor, `git status` temiz kalıyor.

## 8. Almanca / Endonezce çeviri

Her dilde ~1100 metin İngilizce duruyor (en çok: `content`, `hikmet`, `greetingCards`, `deedJournal`, `menu`).
Bu dillerden indirme olmadığı için en sonda. Önce arayüz metinleri, sonra içerik; dini metinler Türkçe/Arapça kaynaktan.
- **Bitti sayılır:** de/id'de İngilizceyle birebir aynı çok kelimeli metin kalmadı (özel adlar hariç).

---

### Her oturumda

- Başlamadan: `git pull`, bu dosyada sıradaki ⬜ adım.
- Bitirirken: test + telefonda kontrol, commit, bu tabloda durumu ✅ yap.
- Yayına çıkacak bir değişiklik birikirse: `versionCode`/`versionName` yükselt (şu an 40 / 18.4.0).
