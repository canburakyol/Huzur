# Huzur Faz 3 Source Registry

## Ilk kaynak tipleri
- `daily_content`
  - ornek: gunun ayet referansi
  - reviewStatus: `reviewed`
- `daily_dua`
  - ornek: gunun duasi veya dua basligi
  - reviewStatus: `reviewed`
- `esma_ul_husna`
  - ornek: gunun esmasi
  - reviewStatus: `reviewed`
- `hadith`
  - ornek: gunun hadis kaynagi
  - reviewStatus: `reviewed`
- `general_islamic_guidance`
  - safety policy ve hassas redirect cevaplari
  - reviewStatus: `general_guidance`

## Kaynak alani standardi
- `sourceId`
- `label`
- `type`
- `reviewStatus`
- `confidence`
- `origin`

## Ilk entegrasyon noktasi
- `contentService.getDailyContent`
- `aiContextService.buildAiContext`
- `functions/index.js -> buildContextSources`

## Sonraki genisleme
- Firestore tabanli reviewed content registry
- ayet/hadis/dua icin daha net kaynak numaralari
- scholar review ve versioning alanlari
