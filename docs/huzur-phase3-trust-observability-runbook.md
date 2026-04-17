# Huzur Faz 3 Trust ve Observability Runbook

## Global ops rollup kaynaklari
- Firestore gunluk metrikleri: `ops/aiMetrics/daily/{dateKey}`
- Global release sagligi: `ops/aiReleaseStatus`
- Functions structured log eventleri:
  - `assistant_v2_resolved`
  - `home_ranking_v2_resolved`
  - `weekly_insight_v1_resolved`
  - `push_hint_v1_resolved`
- Uygulama ici operator paneli: `Settings > AI guven durumu`

## Go / no-go esikleri
- `fallbackRate > 0.25` ise `watch`
- `fallbackRate > 0.40` ise `critical`
- `lowTrustRate > 0.20` ise `watch`
- `criticalIncidentCount24h > 0` ise `critical`
- `weeklyCronHealthy = false` ise `critical`
- `staleSurfaceCount > 1` ise `watch`

## Incident turleri
- `assistant_v2_resolved` trust dususu
- `weekly_insight_v1_resolved` trust dususu
- asiri fallback orani
- safety policy cevaplarinda anormal artis
- sourceCount sifira dusen cevaplarda artis

## Runbook 1: Assistant trust dususu
Tespit:
- `assistant_v2_resolved` loglarinda `trustScore < 0.55` ve `reviewStatus = unreviewed` artis gostermesi

Ilk kontrol:
- son deploy degisti mi
- `OPENAI_API_KEY` ve `GEMINI_API_KEY` aktif mi
- `config/aiFlags.assistant_v2_enabled` acik mi

Daraltma:
- provider dagilimina bak
- safety policy oranina bak
- sourceCount sifir olan cevaplari ayir

Mudahale:
- gerekirse flag acik kalsa da prompt rollback veya provider fallback agirligi dusun
- en kotu durumda `assistant_v2_enabled = false`
- global statuda `critical` varsa staged rollout durdur

## Runbook 2: Weekly insight trust dususu
Tespit:
- `weekly_insight_v1_resolved` loglarinda `trustScore` dususu veya `confidence = low` artis

Ilk kontrol:
- cron son calisma zamani
- `weekly_insights_v1_enabled` flag durumu
- context snapshot alanlari bos mu

Daraltma:
- reviewed source gelen kullanicilar ile kaynaksiz kullanicilari ayir
- provider fallback oranini incele

Mudahale:
- gerekirse sadece cron fallback dokumanlariyla devam et
- en kotu durumda `weekly_insights_v1_enabled = false`
- `weeklyCronHealthy = false` ise `generateWeeklyInsightsCron` loglarini oncele

## Runbook 3: Fallback patlamasi
Tespit:
- home, assistant, weekly veya push akislarinda fallback oraninin aniden artmasi

Ilk kontrol:
- Functions hata loglari
- provider secret durumlari
- deploy sonrasi basladi mi

Daraltma:
- sadece tek endpoint mi etkileniyor
- sadece tek provider mi etkileniyor

Mudahale:
- ilgili flag'i kapat
- fallback davrani sini acik tut
- Phase 3 eval setini tekrar kos
- `ops/aiReleaseStatus.recommendedAction` alanini Settings icinde dogrula

## Kontrol sirasi
1. `Settings` icinde global release sagligini kontrol et
2. `ops/aiReleaseStatus` dokumanini ac ve `topRiskSurface` alanina bak
3. Ayni tarih icin `ops/aiMetrics/daily/{dateKey}` dokumaninda provider ve surface dagilimini incele
4. Functions loglarinda ilgili surface icin son 20 olayi tara
5. Gerekirse flag daralt, sonra eval/test kapilarini tekrar kos

## Faz 3 kapanis kriteri
- Settings icinde global release health okunabiliyor olmali
- `ops/aiMetrics/daily/{dateKey}` dokumaninda sayaçlar artis gosteriyor olmali
- `ops/aiReleaseStatus` saatlik olarak guncellenebilmeli
- eval/test kapilari kirmizi vermemeli
