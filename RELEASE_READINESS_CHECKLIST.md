# Huzur Android Sürüm Hazırlık Kontrol Listesi

Son güncelleme: 2026-03-07
Kapsam: Android production sürümü, repo + backend + gerekli manuel konsol kontrolleri

## Yayın Durumu
- Otomatik repo/backend durumu: GEÇTİ
- Manuel production konsol durumu: BEKLİYOR
- Rollout önerisi: ŞARTLI OLARAK UYGUN
- `%100` rollout önerisi: HAYIR, aşağıdaki manuel maddeler tamamlanmadan yapılmamalı

## 1) Otomatik Repo ve Backend Kapıları
- [x] `npm run lint`
- [x] `npm run test:unit` -> 18 test geçti
- [x] `npm run test:backend` -> 14 test geçti
- [x] `npm run test:all`
- [x] `npm run build`
- [x] `node -c functions/index.js`
- [x] root altında `npm audit --omit=dev --json` -> production açık yok
- [x] `functions/` altında `npm audit --omit=dev --json` -> production açık yok

## 2) Tamamlanan Güvenlik ve Güvenilirlik İyileştirmeleri
- [x] RevenueCat webhook secret yönetimi sertleştirildi
- [x] Premium durumu server-authoritative yapıya yaklaştırıldı
- [x] Aileye kodla katılım akışı callable arkasına alındı
- [x] Hatim keşif ve kodla katılım akışı callable arkasına alındı
- [x] Analytics callable, App Check + admin claim arkasına alındı
- [x] Push token senkronizasyonu server-managed callable akışına taşındı
- [x] Firestore rules ile `fcmTokens` alanına direct client yazımı engellendi
- [x] Dua amin akışı kullanıcı başına tekil callable akışına taşındı
- [x] Firestore rules ile direct client amin artırımı kapatıldı
- [x] Kritik allow/deny senaryoları için Firestore emulator rule testleri eklendi
- [x] Kritik backend join/token/dua akışları için callable testleri eklendi

## 3) Staged Rollout Öncesi Zorunlu Manuel Maddeler
- [ ] Firebase App Check: Android uygulaması production’da Play Integrity kullanıyor
- [ ] Firebase App Check enforcement: Firestore, Functions, Storage ve Realtime Database için açık
- [ ] Firebase Android API key sadece paket adı + SHA fingerprint ile kısıtlı
- [ ] Firebase web API key kısıtları güncel proje ayarlarıyla uyumlu
- [ ] Play Console vitals son 30 gün için incelendi
- [ ] Crash-free users hedef eşiği karşılıyor
- [ ] ANR oranı hedef eşiği karşılıyor
- [ ] RevenueCat dashboard üzerinde purchase/restore/renewal/cancel kontrolleri tamamlandı
- [ ] RevenueCat webhook test olayı production loglarında doğrulandı
- [ ] AdMob serving, fill rate ve rewarded completion sağlığı kontrol edildi
- [ ] Firestore, Functions, Auth ve gelir etkileyen hatalar için alerting doğrulandı
- [ ] Production’da debug App Check provider token aktif değil

## 4) Rollout Eşikleri
- [ ] Crash-free users >= 99.5%
- [ ] ANR oranı <= 0.30%
- [ ] Satın alma başarı oranı >= 98%
- [ ] Restore başarı oranı >= 98%
- [ ] Açık kritik güvenlik bulgusu yok
- [ ] Rollout anında aktif billing/push incident yok

## 5) Önerilen Rollout Sırası
- [ ] Release candidate APK/AAB için internal smoke testi
- [ ] %5 staged rollout
- [ ] Vitals, purchase, restore, push ve ads için 24 saat izleme
- [ ] Her şey yeşil kalırsa %20 rollout
- [ ] Her şey yeşil kalırsa %50 rollout
- [ ] Tüm manuel eşikler yeşil kalırsa %100 rollout

## 6) Manuel Smoke Test Matrisi
- [ ] Anonymous auth ve ilk açılış
- [ ] Namaz vakitleri yükleme ve bildirim izin akışı
- [ ] Push registration ve token sync
- [ ] Pro satın alma
- [ ] Pro restore
- [ ] Play üzerinden abonelik iptali ve server sync davranışı
- [ ] Davet kodu ile aileye katılım
- [ ] Kod ile hatime katılım
- [ ] Public hatim keşfi
- [ ] İkinci hesap/cihaz ile dua oluşturma ve amin verme

## 7) Bloklamayan Bilinen Notlar
- Vite build hâlâ `smartNotificationService.js` için mevcut chunk-splitting uyarısını veriyor
- Vite build hâlâ `subscriptionSyncService.js` için mevcut chunk-splitting uyarısını veriyor
- Dev dependency audit temiz değil; production dependency audit temiz
- Bu makinede backend emulator test akışı Java 17 nedeniyle `firebase-tools@13.35.1` kullanıyor

## 8) Sorumluluk Dağılımı
- Codex
- [x] Repo sertleştirmesi tamamlandı
- [x] Otomatik doğrulamalar tamamlandı
- [x] Emulator ve callable testleri eklendi
- [x] Release checklist ve readiness raporu güncellendi
- Sen
- [ ] Firebase Console kontrolleri
- [ ] Play Console vitals kontrolü
- [ ] RevenueCat dashboard doğrulaması
- [ ] AdMob dashboard doğrulaması
- [ ] Nihai rollout yürütmesi
