# Huzur Play Store konsept seti v1

Bu setteki uygulama ekranları, mevcut Huzur temasına göre üretilmiş yüksek kaliteli konsept mockuplardır. Gerçek ekran görüntüsü değildir; ancak yalnızca uygulamada bulunan işlevleri gösterir.

## Mağaza sırası

1. `01-namaz-ve-rutin.png`
2. `02-kuran.png`
3. `03-dua-ve-esma.png`

`ui-*.png` dosyaları, mağaza metni eklenmemiş kaynak konsept ekranlardır.

## Politika sınırı

- Uygulamada bulunmayan özellik, başarı oranı veya kullanıcı sayısı gösterme.
- Reklamsız deneyim izlenimi vermek yerine görseli ürün özelliğini anlatan temsili arayüz olarak kullan.
- Mockuplardaki işlevleri mevcut uygulama akışlarıyla eşleştirmeden yükleme.

## Üretim yöntemi

- Kaynak UI mockupları: yerleşik image generation aracı.
- Mağaza başlıkları ve 1080x1920 kompozisyon: `scripts/generate-play-store-tr-concept-assets.py`.
