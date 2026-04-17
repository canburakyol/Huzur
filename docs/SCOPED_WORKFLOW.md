# Scoped Workflow

Amaç: tam repo taramasını varsayılan olmaktan çıkarmak ve işi önce scope içinde çözmek.

## Hızlı Başlangıç

```bash
npm run scope:files -- list
npm run scope:files -- family
npm run scope:info -- family
npm run scope:task -- "scope:family davet akisinda sayaç bozuk"
npm run scope:resolve -- "assistant cevap tonu fazla uzun"
npm run scope:doctor
```

## Standart Görev Formatı

Varsayılan format:

```text
scope:<scope-name> <what to change>
```

Örnekler:
- `scope:monetization rewarded ad flowunda bug var`
- `scope:education nuzul explorer ekranina loading state ekle`
- `scope:backend revenuecat webhook loglarini duzelt`
- `scope:onboarding invite modal kapaninca referral state sifirlaniyor`
- `scope:family aile panelinde child card bos geliyor`

Doğal dil fallback:

```bash
npm run scope:task -- "assistant cevap tonu fazla uzun"
npm run scope:task -- "premium restore calismiyor"
npm run scope:task -- "bildirim izni ekrani acilmiyor"
```

Fallback çözümleme kuralları:
- Açık `scope:` varsa onu kullan.
- Yoksa `scripts/scope-map.json` alias haritasını kullan.
- Hala gerekirse scope dosyalarından türetilen component, hook ve service isimleriyle eşleştir.
- Skor eşitse scope zorlama; belirsiz diye raporla.

## Scope Bilgisi Okuma

Bir scope'un bakim özetini ve giriş noktalarını görmek için:

```bash
npm run scope:info -- family
npm run scope:info -- social
npm run scope:info -- onboarding
```

Bu komut şunları gösterir:
- Kısa bakım özeti
- İlk bakılacak entrypoint dosyaları
- Sık dokunulan yardımcı dosyalar
- Scope dışına taşma riski olan shared alanlar
- İlgili komşu scope'lar

## Scope Kuralları

Varsayılan çalışma disiplini:
- Önce scope çöz.
- Sonra sadece o scope dosyalarını aç.
- Sonra düzeltmeyi yap.

Scope dışına yalnızca şu durumlarda çık:
- Test, build veya runtime hata çıktısı başka dosyayı işaret ediyorsa
- Güvenli düzeltme için ortak utility zorunluysa
- Veri bütünlüğü veya güvenlik bunu gerektiriyorsa

Scope dışına çıktıysan tek satır gerekçe notu düş:

```text
scope-expand: shared referral helper without this change onboarding fix would stay inconsistent
```

Özellikle dikkat:
- `src/App.jsx` ve `src/services` içine doğrudan dalmadan önce scope teyidi yap.
- Shared dosyaya dokunmak istiyorsan önce aktif scope içinde çözüm mümkün mü kontrol et.
- Yeni bir feature veya yeni önemli bir giriş dosyası eklenirse `scripts/scope-map.json` ve gerekiyorsa `scripts/scope-registry.json` güncellenmeli.

## Scope Tipleri

Feature scope'lar doğrudan `src/features/*/index.js` üzerinden türetilir.

Static scope'lar elle korunur:
- `backend`
- `android`
- `app-shell`
- `home`
- `monetization`
- `notifications`
- `release`
- `localization`
- `onboarding`

## Bakım Notları

Bu workflow büyük refactor yerine ilk iterasyon hızını hedefler.

Beklenen kazanım:
- Gereksiz repo taraması azalır
- Aynı alan için tekrar tekrar keşif yapılmaz
- Doğal dil isteklerde bile önce dar dosya kümesi bulunur

Bakım standardı:
- Tek iş, tek scope varsayımı
- Shared dosyaya geçiş istisna olmalı
- Alias veya static scope değişirse önce `scripts/scope-map.json`, bakım özeti değişirse `scripts/scope-registry.json`, sonra doküman güncellenmeli
