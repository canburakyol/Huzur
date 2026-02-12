# Güvenlik Düzeltme Yol Haritası

Bu rapor, tespit edilen bulguları uygulanabilir iş paketlerine çevirir. Öncelik sırası release etkisine göre verilmiştir.

## 1) Öncelik ve Uygulama Sırası

1. **SEC-001 (Critical):** Firestore yetki modeli sertleştirme
2. **SEC-002 (High):** Gemini anahtarını client’tan kaldırma, server-side çağrı
3. **SEC-003 (High):** FCM token güvenli depolama ve yaşam döngüsü
4. **SEC-004 (High):** HTTP endpoint kaldırma
5. **SEC-005/006/007/008 (Medium/Low):** CI gate, payload minimizasyonu, izin minimizasyonu, AppCheck ayrıştırma

---

## 2) SEC-001 — Firestore Kural Sertleştirme Planı (Critical)

### Hedef
Kimliği doğrulanmış her kullanıcının geniş okuma/yazma erişimini kaldırıp, owner/member tabanlı **en az ayrıcalık** modeline geçmek.

### Etkilenen yerler
- `users`, `families`, `familyGroups`, `hatims`, `duas` kuralları
- Referans: `firestore.rules`

### Uygulama adımları
1. **Veri modeli envanteri çıkar**
   - Her koleksiyon için: kim okuyabilir, kim yazabilir, hangi alanlar yazılabilir.
2. **Kural yardımcı fonksiyonlarını genişlet**
   - `isOwner`, `isMember`, `isAdmin` benzeri yardımcılar.
3. **Collection bazlı kural daraltma**
   - `users/{userId}`: yalnız owner read/write.
   - `families/{familyId}`: yalnız üyeler read; create authenticated; update/delete yalnız admin/owner.
   - `familyGroups/{groupId}`: read yalnız üye/pending durumuna göre; update sadece belirli alanlar.
   - `duas/{duaId}`: create’de zorunlu alan doğrulama; update’de sadece `aminCount` gibi izinli alanlar; delete owner.
   - `hatims/{hatimId}`: update için `parts`, `readers` alanlarında role tabanlı kısıt.
4. **Alan seviyesinde doğrulama ekle**
   - `request.resource.data.diff(resource.data).changedKeys()` ile allowlist.
5. **Server-side’a taşınacak kritik yazımlar**
   - Üyelik onayı, admin değişimi, toplu update gibi akışları Cloud Functions’a taşı.
6. **Emulator testlerini zorunlu hale getir**
   - Pozitif/negatif test seti oluştur.

### Doğrulama testleri
- Farklı uid ile başkasının `users/{userId}` kaydı update -> **RED**.
- Üye olmayan kullanıcı `familyGroups` read -> **RED**.
- Yetkili kullanıcı kendi kaynaklarını güncelleme -> **GREEN**.

### Kapanış kriteri
- Firestore rule testlerinde tüm yetkisiz senaryolar reddediliyor.
- Üretime deploy öncesi rule test stage’i zorunlu geçiyor.

---

## 3) SEC-002 — Gemini Anahtarını Server-Side’a Taşıma (High)

### Hedef
`VITE_GEMINI_API_KEY` kullanımını istemciden tamamen kaldırmak; Gemini çağrılarını sadece yetkili backend fonksiyonundan geçirmek.

### Etkilenen yerler
- `src/services/geminiService.js`
- `functions/` (oluşturulacak/iyileştirilecek çağrı fonksiyonu)
- `CLOUD_FUNCTIONS_SETUP.md`

### Uygulama adımları
1. **Client direct call kapat**
   - URL query ile key kullanılan akışı kaldır.
2. **Callable function tasarla**
   - Input: `prompt`, `contextType`
   - Kontroller: auth zorunlu, rate limit, input boyutu, içerik sanitizasyonu.
3. **Secret yönetimi**
   - Anahtar yalnız Functions config/secret manager’da tutulmalı.
4. **Client adaptasyonu**
   - `generateContent` yalnız callable endpoint’e istek atmalı.
5. **Hata modeli standardizasyonu**
   - 429/403/5xx için standart hata kodu döndür.
6. **Gözlemlenebilirlik**
   - Rate-limit ve hata metriklerini function loglarında anonim şekilde tut.

### Doğrulama testleri
- Uygulama ağ trafiğinde anahtar görünmemeli.
- Auth’suz function çağrısı reddedilmeli.
- Dakikalık limit aşımında deterministic hata dönmeli.

### Kapanış kriteri
- Build artifact içinde key pattern yok.
- Güvenlik testinde istemciden doğrudan Gemini çağrısı yok.

---

## 4) SEC-003 — FCM Token Güvenli Depolama ve Lifecycle (High)

### Hedef
FCM token’ı `localStorage` benzeri erişilebilir depodan çıkarıp güvenli depoya taşımak; rotation/revoke/logout döngüsünü tamamlamak.

### Etkilenen yerler
- `src/services/fcmService.js`
- `src/services/storageService.js`
- `src/services/secureStorage.js`

### Uygulama adımları
1. **Token storage adapter değişimi**
   - `setString/getString` yerine async secure metotlar.
2. **Lifecycle yönetimi**
   - Login’de refresh kontrolü, logout’ta token temizliği.
3. **Server senkronizasyonu**
   - Token güncellemelerinde backend’e son token yazımı ve eski token invalidasyonu.
4. **Leak yüzeyi azaltma**
   - Event payload’da token taşınmamalı; loglarda token maskelenmeli.
5. **Geriye dönük migration**
   - Eski token key’i varsa güvenli depoya taşıyıp eski kaydı sil.

### Doğrulama testleri
- Cihazda token yalnız güvenli depoda bulunmalı.
- Logout sonrası token bulunmamalı.
- Push registration yenilenince eski token kullanım dışı kalmalı.

### Kapanış kriteri
- Güvenlik testinde local depoda token tespiti yok.

---

## 5) SEC-004 — HTTP Endpoint Kaldırma ve TLS Sertleştirme (High)

### Hedef
Tüm ağ çağrılarının HTTPS olmasını garanti etmek ve HTTP fallback’i tamamen kaldırmak.

### Etkilenen yerler
- `src/services/contentService.js`
- Ağ çağrısı yapan servisler (genel tarama)

### Uygulama adımları
1. **HTTP endpoint envanteri**
   - Kodda tüm `http://` kullanımını tarayıp listele.
2. **HTTPS muadiline geçiş**
   - İlgili endpointin TLS destekleyen sürümüne geç.
3. **Fallback davranışı**
   - HTTPS başarısızsa güvenli fallback (local data) kullan.
4. **Network policy doğrulama**
   - Android network security config ile uyumu test et.

### Doğrulama testleri
- Trafik kaydında HTTP istek kalmamalı.
- Proxy ile MITM denemesinde kritik içerik manipüle edilememeli.

### Kapanış kriteri
- Kod taramasında `http://` yok (bilinçli test endpointleri hariç).

---

## 6) SEC-005/006/007/008 — Hardening Paketi (Medium/Low)

## SEC-005 Release CI Gate
1. Android release lint’i aktif et.
2. CI’da lint fail -> build fail kuralı koy.
3. Güvenlik checklist’ini release pipeline’a ekle.

## SEC-006 Notification Payload Minimizasyonu
1. Push payload allowlist: sadece gerekli alanlar.
2. `extra`/event dispatch öncesi sanitize et.
3. Bildirim geçmişinde hassas alanları kaydetme.

## SEC-007 Permission Minimizasyonu
1. Manifest izinlerini fonksiyon bazlı gerekçelendir.
2. Kullanılmayan izinleri kaldır.
3. Runtime izin metinlerini privacy policy ile hizala.

## SEC-008 AppCheck Debug Ayrıştırma
1. Debug bağımlılıklarını debug flavor’a taşı.
2. Release varyantında debug provider yokluğunu CI’da doğrula.

### Kapanış kriteri
- Release pipeline güvenlik kapıları (rules test + lint + basic SAST) geçmeden dağıtım yok.

---

## 7) Uygulama Stratejisi — Sprint Benzeri İcra Akışı

### Faz 1 (Bloklayıcılar)
- SEC-001, SEC-002, SEC-003, SEC-004

### Faz 2 (Sertleştirme)
- SEC-005, SEC-006, SEC-007, SEC-008

### Faz 3 (Regresyon ve Sign-off)
- Güvenlik regresyon checklist
- Release blocker’ların kapatıldığını kanıtlayan çıktı seti

---

## 8) Çıktı/Artefakt Listesi

1. Güncel kurallar dosyası: `firestore.rules`
2. Function güvenlik dokümanı ve kodu: `functions/`
3. Güncellenmiş istemci servisleri: `src/services/*.js`
4. CI güvenlik gate tanımı: Android + test pipeline
5. Final doğrulama raporu: `reports/security-remediation-validation.md`

---

## 9) Riskten Kapatmaya İzlenebilirlik Tablosu

- SEC-001 -> Rule değişikliği + emulator test raporu
- SEC-002 -> Client key kaldırımı + function auth/rate-limit test raporu
- SEC-003 -> Token storage migration + logout/rotation test raporu
- SEC-004 -> HTTP kaldırımı + trafik kanıtı
- SEC-005/006/007/008 -> CI çıktıları + manifest/payload kontrol raporu
