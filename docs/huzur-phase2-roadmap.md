# Huzur Faz 2 Yol Haritasi

## Hedef
Faz 2'nin amaci, Huzur'u sadece "acilan bir uygulama" olmaktan cikarip nazik ama sistemli bir geri donus motoruna cevirmektir. Bu fazda odagimiz retention, recovery loops, segmentasyon ve premium deger momentleri olacak.

## SOTA ilke seti
- Geri donus dili baskici degil, sakin ve yargisiz olacak.
- Buyuk hedef dayatmak yerine tek net sonraki adim onerilecek.
- Her retention yuzeyi ayni duygusal dili kullanacak.
- Mevcut akislar bozulmayacak; yeni davranislar mevcut servislerin ustune katman olarak eklenecek.
- Analytics her yeni retention yuzeyini olcecek.

## Faz 2 is paketleri

### 1. Recovery Loop Engine
- `recoveryLoopService` merkez karar katmani olarak kullanilir.
- Risk bandlari: `steady`, `cooling`, `at_risk`, `comeback`
- Cikti: headline, description, CTA, hedef feature, notification title/body, reward tone

### 2. Comeback Surfaces
- `WelcomeBackBonus` recovery plan ile kisilesir.
- Geri donus modal dili daha sakin ve net hale gelir.
- Analytics: gosterim, kapatma, claim ve risk band takibi

### 3. Retention Notifications
- Streak notification'lari sert uyari dilinden cikartilir.
- Recovery plan tabanli daha nazik copy kullanilir.
- Quiet hours, mevcut scheduling ve izin akisi korunur.

### 4. Segment ve Goal Moments
- Primary goal sinyali retention kararlari icinde kullanilir.
- Quran odakli kullaniciya farkli, aile odakli kullaniciya farkli geri donus onerisi verilir.

### 5. Premium Value Moments
- Recovery plan icinde premium yuzeyleri zorla one itilmez.
- Ancak uygun yerlerde "daha derin rehberlik", "haftalik ozet", "aile ritmi" gibi premium baglari olgunlasir.

## Uygulama sirasi
1. Recovery loop'u comeback modalina bagla
2. Recovery loop'u streak bildirimlerine bagla
3. Retention telemetry'yi derinlestir
4. Premium deger momentlerini secili yuzeylere yerlestir
5. Faz 2 kapanis audit'i ve rollout kontrolu

## Faz 2 basari olcutleri
- `comeback_bonus_shown -> claimed` orani
- ertesi gun geri donus orani
- streak kayip oraninda azalma
- reminder/streak push tap oraninda artis
- recovery yuzeylerinde dismiss oraninin dusmesi

## Riskler
- Fazla romantik ama aksiyonsuz copy
- Kullaniciya gereksiz suc duygusu yuklemek
- Bildirimlerin sert ve tekrara dusen yapida kalmasi
- Goal bazli farklilastirmanin tutarsiz hissettirmesi

## Faz 2 kapanis kriteri
- Recovery plan en az 2 urun yuzeyine baglanmis olacak
- Telemetry bu yuzeyleri ayri ayri olcecek
- Build ve lint temiz gececek
- Mevcut scheduling ve comeback bonus akisi bozulmayacak
