# Huzur Faz 3 Rollout Gate

## Amac
AI trust ve health sinyallerini yalnizca izlemek degil, rollout kararina donusturmek.

## Girisler
- `aiHealthSummary`
- `config/aiFlags`

## Cikislar
- `go`
- `cautious`
- `hold`

## Kurallar
- `actionCount > 0` ise: `hold`
- `watchCount > 1` veya `averageTrust < 0.70` ise: `cautious`
- aksi durumda: `go`

## Uygulama icindeki yuzey
- `src/components/Settings.jsx`
- `src/services/aiRolloutGateService.js`

## Neden onemli
- Iki kisilik ekipte rollout karari hizli ve tutarli kalir.
- Trust paneli sadece gosterge olmaktan cikar, operator yardimcisi haline gelir.
- Faz 4 oncesi AI yuzeyleri icin geri donus gerektiren belirsizlik azalir.
