# Huzur Faz 3 Rollout Health Checklist

## Faz 3 canli kapilari
- `assistant_v2_enabled = true`
- `weekly_insights_v1_enabled = true`
- `home_ranking_v2_enabled = true`
- `push_personalization_v1_enabled = true`
- `social_ai_hints_v1_enabled = true`

## Kod kapisi
- `npm run build`
- `npm run lint`
- `npm run test:all`

## Trust kapisi
- Assistant cevabinda su alanlar donmeli:
  - `confidence`
  - `reviewStatus`
  - `sourceCount`
  - `trustScore`
  - `sources`
- Weekly insight cevabinda su alanlar donmeli:
  - `confidence`
  - `reviewStatus`
  - `sourceCount`
  - `trustScore`
  - `sources`

## UI smoke kapisi
1. Assistant icinde bot cevabi altinda trust chip'leri gorunmeli.
2. Assistant icinde kaynak varsa en az bir kaynak etiketi gorunmeli.
3. Weekly report acilisinda AI insight geldiyse trust chip'leri gorunmeli.
4. Trust metadata yoksa UI bozulmadan sade fallback gosterilmeli.

## Observability kapisi
- Functions loglarinda su event tipleri gorulebilmeli:
  - `assistant_v2_resolved`
  - `weekly_insight_v1_resolved`
  - `home_ranking_v2_resolved`
  - `push_hint_v1_resolved`
- Bu loglarda en az su alanlar olmali:
  - `provider`
  - `latencyMs`
  - `usedFallback`
- Assistant ve weekly insight akislarinda ek olarak:
  - `confidence`
  - `reviewStatus`
  - `trustScore`
  - `sourceCount`

## Manuel canli kontrol
1. Assistant'a genel bir soru sor.
2. Assistant'a hassas bir soru sor ve `general_guidance` davranisini gozle.
3. Weekly report'u ac ve AI insight varsa trust sinyallerini kontrol et.
4. Firebase Functions loglarinda ayni oturumun observability eventlerini ara.

## Go / no-go kurali
- Build, lint veya test kirmiziysa rollout ilerlemez.
- Trust metadata alanlarindan biri sistematik sekilde bos geliyorsa rollout durur.
- Fallback orani ani yukselirse ilgili flag kademeli kapatilir.
- Safety policy yanitlari anormal artarsa assistant prompt ve source katmani tekrar gozden gecirilir.
