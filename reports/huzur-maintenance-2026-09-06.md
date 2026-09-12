# Huzur bakım doğrulaması — 6 Eylül 2026

## Uygulanan değişiklikler

- React Router / react-router-dom: 7.18.3. Mevcut BrowserRouter kullanımı korunuyor.
- Protobufjs: uygulama ve functions kilit dosyalarında 8.8.0; override alt sınırı 8.6.6.
- Functions: qs 6.16.0, brace-expansion 2.1.4, body-parser 1.20.6.
- QiblaCompass dosyasından kullanılmayan yardımcı fonksiyon export'ları kaldırıldı; hesaplama davranışı aynı.
- `.nvmrc` ve `.node-version`: 22.23.2. Mevcut sistem Node kurulumu değiştirilmedi.
- Android başlangıcında Crashlytics artık analitik tercihinden bağımsız hata raporlama tercihini de kontrol ediyor. JS köprüsü iki tercihi ayrı iletiyor; önbellek iki tercihi de dikkate alıyor. Analitik açık/hata raporlama kapalı ve sonradan tercih değişimi için regresyon testleri eklendi.

## Doğrulama

- Node 22.23.2, npm 11.6.2.
- ESLint: hata ve uyarı yok.
- Unit: 68 dosya, 268 test başarılı.
- Backend: gerçek yerel Firestore emülatörüyle 6 dosya, 38 test başarılı.
- Web build ve Android modu web build başarılı. Büyük chunk, dinamik/statik import ve eski Browserslist verisi uyarıları devam ediyor; kapsamlı bundle düzenlemesi yapılmadı.
- Root ve functions `npm audit --omit=dev`: ayrı ayrı 0 bulgu. Bu sonuç geliştirme bağımlılıklarının tamamının temiz olduğu anlamına gelmez.
- `node -c functions/index.js` ve `git diff --check` başarılı.
- Android `:app:lintRelease`: başarılı, çıkış kodu 0; 0 hata, 61 uyarı; 641 görev (126 çalıştırıldı, 515 günceldi). Rapor: `android/app/build/reports/lint-results-release.html`. Uyarılar arasında kullanılmayan kaynaklar, ikon şekli/boyutu, sabit metinler ve bağımlılık tavsiyeleri var; bu bakım bunların tamamını gidermedi.
- Bağlı Android cihazı bulunamadı; cihazda satın alma, bildirim, yönlendirme ve Crashlytics ağ davranışı test edilmedi.
- Sürüm 18.2.16 / 38. AAB üretilmedi, mağazaya veya Firebase'e dağıtım yapılmadı.

## Ortamda yeniden çalıştırma

Node 22 ve npm bu makinede `%LOCALAPPDATA%\huzur-tools\node22` altında izole kuruldu. PowerShell oturumunda:

```powershell
$env:PATH = "$env:LOCALAPPDATA\huzur-tools\node22;$env:LOCALAPPDATA\huzur-tools\node22\node_modules\.bin;$env:PATH"
npm version --json
npm run lint
npm run test:unit
npm run build
npm run build:android
```

`node -v` tek başına yeterli kontrol değil: sistemdeki npm başlatıcısı kendi yanındaki Node 25'i seçebiliyor. `npm version --json` içindeki node alanı da 22.23.2 olmalı.

Java'nın Windows Unix socket geçici yolunda `Invalid argument: connect` hatası görüldü. Yalnızca görev oturumunda kısa bir geçici dizin kullanıldı:

```powershell
New-Item -ItemType Directory -Force .codex/.cache/java-tmp | Out-Null
$env:JAVA_TOOL_OPTIONS = '-Djdk.net.unixdomain.tmpdir=E:\D_Backup\Projem\.codex\.cache\java-tmp'
# Backend emülatörü için kurulu Android Studio JBR:
$env:JAVA_HOME = 'E:\Program Files\Android\jbr'
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
npm run test:backend
# Android Gradle için proje Java 17 toolchain'i:
$env:JAVA_HOME = 'C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot'
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
Set-Location android
.\gradlew.bat :app:lintRelease --no-daemon '-Porg.gradle.java.installations.paths=C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot'
```

## Mağaza ve beyan kontrolü

Canlı Türkçe Play sayfası tarayıcıda kontrol edildi: “anlaşılır hâle” doğru yazılıyor. Cron raporundaki “hle” mevcut sayfada doğrulanmadı; metin değiştirilmedi.

Play Console canlı hesabıyla doğrulama yapıldı. Uygulama `com.huzurapp.android`; üretimde 18.2.16 / versionCode 38 ve %100 dağıtım görünüyor. Son 28 günde Console gösterge paneli cihaz edinme 6, ilk açılış 3 ve aylık etkin cihaz 13 bildiriyor.

Data safety anketi kaydetmeden, yalnızca mevcut yanıtlar okunarak kontrol edildi. Mevcut yanıtlar: zorunlu veri toplama/paylaşma `Evet`; aktarım sırasında şifreleme `Evet`; uygulama içi hesap oluşturma `Yok`; uygulama dışı hesapla giriş `Evet`; veri silme talebi `Hayır`. Seçili veri türleri yaklaşık konum, uygulama işlemleri ve cihaz/diğer kimlikler. Yaklaşık konum `Toplandı`, kısa süreli işleme `Evet`, isteğe bağlı ve amaç `Uygulama işlevselliği`; uygulama işlemleri `Toplandı`, kalıcı işleme, zorunlu ve amaçlar `Uygulama işlevselliği + Analiz`; cihaz/diğer kimlikler `Toplandı`, kalıcı işleme, isteğe bağlı ve amaçlar `Analiz + Reklam veya pazarlama + Sahtekarlığı önleme, güvenlik ve kanunlara uygunluk`. Bu yanıtlar kod ve gizlilik politikası sahibi tarafından ayrıca eşleştirilmeden yayın beyanı olarak onaylanmamalı.

Android vitals canlı ekranda sürüm 38 (18.2.16) için kullanıcı tarafından algılanan kilitlenme oranı ve ANR oranı `- / Veri kullanılamıyor`; bellek, başlama, oluşturma, pil ve izin metrikleri de veri göstermiyor. Bu, kritik sorun yok anlamına gelmez; mevcut üretim kohortu metrik üretmek için yetersiz. Console tek öneri olarak R8 optimizasyonunu gösteriyor ve Android Gradle Plugin 9.0 veya sonrasına yükseltmeyi istiyor. Kodda release için `minifyEnabled true` ve `shrinkResources true` zaten mevcut; öneri bağımlılık/toolchain ve yayınlanan artifact düzeyinde ayrıca doğrulanmalı.

| Yüzey | Kod / kamuya açık kanıt | Kalan değerlendirme |
| --- | --- | --- |
| Analitik | `privacyModeService.ts`: ilk kurulumda telemetry/analytics açık; mevcut şema için açık kapatma tercihi korunuyor | Console'da uygulama işlemleri için `Analiz` seçili; varsayılan davranış ve rıza metni sahibi tarafından eşleştirilmeli |
| Crashlytics | Bu bakımda ayrı hata raporlama tercihi başlangıç köprüsüne taşındı | Yeni Android paketi üzerinde açık/kapalı durumlarının cihazda doğrulanması |
| Konum | Uygulama ve canlı politika, koordinatların namaz/hava/konum servislerine gönderilebildiğini açıklıyor | Console'da yaklaşık konum seçili; `Toplandı`, kısa süreli, isteğe bağlı ve yalnızca `Uygulama işlevselliği` olarak kayıtlı. Kod/politika ile sahip eşleştirmesi gerekiyor |
| Abonelik | Functions RevenueCat doğrulaması; canlı politikada satın alma/abonelik bilgileri | Satın alma geçmişi ve kimlik kategorileriyle eşleştirme |
| Bildirim | Functions kullanıcı kaydında FCM token işlemleri | Cihaz kimliği ve amaç beyanları |
| AI mesajları | Canlı politikada backend ve AI sağlayıcısına gönderim açıklaması | Mesaj içeriği, amaç, saklama süresi ve sağlayıcı kapsamı |
| Silme | Play “veriler silinemiyor”; canlı politika silme talebi için destek adresi / uygulama akışı söylüyor | Gerçek silme mekanizması ve beyan birbiriyle doğrulanmalı |

SDK bulunması tek başına Google'ın “paylaşım” tanımına göre otomatik “evet” seçme gerekçesi değildir; hizmet sağlayıcı ve geçici işleme istisnaları gerçek akışla değerlendirilmelidir. Console'a herhangi bir beyan gönderilmedi; formda yalnızca ileri adımlarla mevcut yanıtlar okundu.

Kaynaklar: [Play kaydı](https://play.google.com/store/apps/details?id=com.huzurapp.android&hl=tr), [canlı gizlilik politikası](https://canburakyol.github.io/privacy-policy/), [Google Data safety açıklaması](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en), [React Router güvenlik duyurusu](https://github.com/advisories/GHSA-qwww-vcr4-c8h2), [Protobufjs güvenlik duyurusu](https://github.com/advisories/GHSA-j3f2-48v5-ccww).
