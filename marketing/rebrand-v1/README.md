# Huzur rebrand v1

Bu klasör yeni Huzur kimliği için bir tasarım yönü içerir:

- `icon-concept.png`: yeni ikon konsepti. Eski altın çiçek desenini tekrar etmez; sakinlik ve rehberliği çağrıştıran yalın bir niş/ışık işaretidir.
- `ui-*.png`: yeni uygulama arayüzü konseptleri.
- `01-*.png` ile `03-*.png`: Google Play mağaza görseli mockupları.

Bu set tasarım kararı içindir. Mağazaya yüklemeden önce, uygulama arayüzünün bu yönle tutarlı hâle getirilmesi gerekir.

Üretim: yerleşik image generation aracı ile konsept UI ve ikon; `scripts/generate-play-store-tr-rebrand-assets.py` ile metin ve 1080x1920 mağaza kompozisyonu.

## Üretim ikonları

- `huzur-icon.svg`: Yeni ikonun ana vektör kaynağı.
- `huzur-icon-512.png`: Google Play ve sosyal paylaşım için 512×512 ana PNG.
- `huzur-icon-512-worker.png`: Cloudflare Worker için sıkıştırılmış 512×512 PNG.
- `huzur-icon-play-current-512.png`: Google Play'in canlı sayfasındaki güncel, keskin 512×512 ikonun yerel doğrulama kopyası. Telegram otomasyonu `icon-v3` sürümünde bu mağaza görselinin CDN adresini kullanır.
- `android/app/src/main/res/mipmap-*/ic_launcher.png`: Android cihazlarda kullanılan yoğunluk bazlı launcher çıktıları.
