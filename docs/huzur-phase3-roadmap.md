# Huzur Faz 3 Yol Haritasi

## Faz 3 amaci
Huzur'un AI ve icerik katmanini sadece akilli degil, ayni zamanda guvenilir, izlenebilir ve degerlendirilebilir hale getirmek.

## Faz 3 SOTA ilkeleri
- Kaynaksiz cevap varsa bunu gizleme; `confidence` ve `reviewStatus` ile acikla.
- Fallback cevaplari bile trust metadata uretsin.
- Her AI akisinda provider, latency, fallback ve trust sinyali loglansin.
- Eval katmani sadece model kalitesini degil, guven kurallarina uyumu da olcmeli.

## Bu fazda teslim edecegimiz ana katmanlar

### 1. Trust metadata
- `sources[]`
- `reviewStatus`
- `sourceCount`
- `trustScore`
- `confidence`

### 2. Observability
- structured AI logs
- provider/fallback/latency sinyalleri
- assistant ve weekly insight trust loglari
- production runbook

### 3. Eval harness
- normalize edilen cevaplar icin backend testleri
- trust regression testleri
- safety response kalite kilitleri

## Faz 3 sprint sirasi
1. Trust metadata normalizasyonu
2. AI observability loglari
3. Eval harness
4. Runbook ve manual operasyon kapisi
5. Source registry / reviewed content genislemesi

## Faz 3 kabul kriteri
- Assistant ve weekly insight cevaplari trust metadata ile doner.
- Fallback cevaplari da trust metadata ile doner.
- AI akislarinda structured observability loglari vardir.
- Trust regression testleri gecmektedir.
- Phase 3 sonunda source-backed expansion icin geri donmeden ilerlenebilir bir omurga kurulmustur.
