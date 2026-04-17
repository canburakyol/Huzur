# Huzur SOTA Audit Prompt

Amaç: Huzur kod tabanını mevcut davranışı bozmadan SOTA seviyesinde denetle, gerçek kırıkları düzelt, ölü veya erişilemeyen yüzeyleri ayıkla ve tüm yüksek trafikli ekranları ortak emerald-gold tema sistemiyle hizala.

Kurallar:
- Önce kanıt topla: `lint`, `build`, birim testleri, backend testleri ve hedefli kod aramaları.
- “Ölü kod” tespitinde yalnızca derlenmeyen kodu değil, artık hiçbir yerden ulaşılamayan, yanlış feature anahtarına bağlı veya eski akıştan kopmuş yüzeyleri de ara.
- Eski davranışı koru: yeni sistemler eski fallback’leri ezmesin; gerekiyorsa alias veya wrapper ile geriye uyum sağla.
- Tema incelemesinde önce ortak kabuğu denetle: `index.css`, `Navigation.css`, loader’lar, tab bar, modal shell, header yüzeyleri.
- Sonra kategori yüzeylerini denetle: home, aile, gamification, multimedia, quran, social ve eğitim ekranları.
- Tema dışı sinyaller:
  - sert beyaz arka planlar
  - koyu temada okunaksız koyu metin
  - token dışı parlak rastgele renkler
  - aynı işlev için farklı buton/zemin dili
  - eksik CSS variable fallback’leri
- Düzeltmeler:
  - mümkün olduğunda token kullan
  - tema dışı renkleri emerald-gold ailesine yaklaştır
  - kategori vurgularını tamamen öldürme; ama ana marka atmosferini bozma
  - tek bir eski ekran yeni ekranla çakışıyorsa ayrı ayrı yaşatmak yerine aynı deneyim ailesine hizala
- Güvenlik:
  - kullanıcı verisini etkileyen davranışları değiştirme
  - feature flag davranışlarını koru
  - network/scheduler mantığını yalnızca kırık varsa değiştir

Teslim formatı:
1. Doğrulanmış kırıklar
2. Düzeltilen dosyalar
3. Tema hizalama kararları
4. Hâlâ izlenmesi gereken riskler
5. Yeniden çalıştırılan doğrulamalar
