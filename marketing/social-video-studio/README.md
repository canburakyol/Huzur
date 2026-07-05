# Huzur Social Video Studio

Yerel çalışan, FFmpeg tabanlı kısa video üretim MVP'si.

## Çalıştırma

1. Windows'ta `ffmpeg -version` komutunun çalıştığını doğrulayın.
2. Bu klasörde `npm start` çalıştırın.
3. `http://localhost:4310` adresini açın.
4. Bir kategori seçip **Video üret** düğmesine basın.

İlk çalıştırmada `assets` altındaki klasörler oluşturulur. Gerçek uygulama ekran görüntülerini `assets/screenshots`, logoları `assets/logo`, telifsiz medya dosyalarını ilgili klasörlere koyun. Sistem boş klasörlerde repo içindeki mevcut güvenli Huzur varlıklarını kullanır.

## AI kullanımı

MVP çevrimdışı ve anahtarsız çalışır. Pazarlama metinleri kategori şablonlarından üretilir. `OPENAI_API_KEY` tanımlanırsa sonraki sürümde `script_generator` içine sağlayıcı eklenebilir. Dini metinler hiçbir koşulda modele yazdırılmamalı; yalnızca `content_bank/*.json` içindeki `approved: true` kayıtlar kullanılmalıdır.

## Çıktı

Her üretim `output/videos/<id>/` altında `final_video.mp4`, `caption.txt`, `hashtags.txt` ve `metadata.json` oluşturur.
