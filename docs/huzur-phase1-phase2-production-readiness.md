# Huzur Faz 1-2 Production Readiness

## Canli rollout durumu
- `assistant_v2_enabled = true`
- `weekly_insights_v1_enabled = true`
- `home_ranking_v2_enabled = true`
- `push_personalization_v1_enabled = true`
- `social_ai_hints_v1_enabled = true`

## Cekirdek release smoke seti
1. Assistant acilir, soru gonderilir, cevap doner ve eski SSS fallback'i hata halinde calisir.
2. Home ekrani acilir, AI ranking aktifken headline/explanation gorunur veya sessiz fallback ile varsayilan sira korunur.
3. Weekly insight modal/acilisi mevcut haftada veri az olsa bile bos ya da yargisiz bir ozet uretebilir.
4. Recovery loop yuzeyleri comeback ve at-risk durumda gorunur; steady durumda gereksiz recovery karti cikmaz.
5. Push personalization aktifken mevcut schedule mantigi bozulmadan sadece copy/hint katmani zenginlesir.
6. Pro olmayan riskli kullanicida `home_recovery_support` ve premium recovery eventleri loglanir.
7. Family/hatim/social baglamli akislarda AI yardimci katman olsa bile mahrem veri dogrudan ifsa edilmez.

## Tam regresyon matrisi

### Faz 1 AI katmani
- `Assistant V2`
  - Beklenen sonuc: JSON semasi parse edilir, `answer`, `confidence`, `suggestedActions` mantikli doner.
  - Hata sinyali: bos cevap, parse hatasi, sonsuz typing, fallback'in devreye girmemesi.
- `Home Ranking V2`
  - Beklenen sonuc: `rankedModules` duplicate uretmez, varsayilan home akisi bozulmaz.
  - Hata sinyali: bos home, modullerin kaybolmasi, headline acik ama liste yok.
- `Weekly Insights V1`
  - Beklenen sonuc: veri az kullanicida bile motive edici kisa ozet.
  - Hata sinyali: dramatik/sert ton, null alanlarin ekrana sizmasi.
- `Push Personalization V1`
  - Beklenen sonuc: mevcut schedule korunur, copy/hint daha ilgili hale gelir.
  - Hata sinyali: quiet hours ihlali, ayni kullaniciya agresif tekrar.

### Faz 2 retention ve recovery
- `Welcome Back Bonus`
  - Beklenen sonuc: comeback user dogru risk band ile gorulur, ayni oturumda steady'ye dusmez.
  - Hata sinyali: bonus tone'u yanlis, reward aciklamasi risk band ile uyusmuyor.
- `Recovery Support Card`
  - Beklenen sonuc: sadece `at_risk` ve `comeback` bandlarinda gorunur.
  - Hata sinyali: steady user'da recovery karti cikmasi.
- `Premium Recovery Moments`
  - Beklenen sonuc: Pro olmayan riskli kullanicida nazik upsell ve rehber acilisi.
  - Hata sinyali: agresif dil, uygun olmayan anda premium CTA.
- `Streak notification recovery copy`
  - Beklenen sonuc: yargisiz, tek net sonraki adim veren copy.
  - Hata sinyali: sucluluk yukleyen veya sert copy.

## Manuel konsol kontrolleri
- Firestore `config/aiFlags` belgesi tum flag'lerde `true`.
- Functions deploy sonrasi su callable'lar aktif:
  - `askAssistantV2`
  - `getHomeRankingV2`
  - `generateWeeklyInsightsV1`
  - `getPersonalizedPushHintsV1`
  - `generateWeeklyInsightsCron`
- Secret durumlari aktif:
  - `OPENAI_API_KEY`
  - `GEMINI_API_KEY`
- Firestore rules aktif ve `config/aiFlags` auth kullanicilar icin okunabilir.

## Hazirlik karari
- Kod kapisi: `lint`, `build`, `test:all` temiz.
- Firebase kapisi: `functions`, `firestore.rules`, `config/aiFlags` canli.
- Rollout kapisi: Faz 1 ve Faz 2 flag'leri tamamen acik.

Sonuc: Faz 1 ve Faz 2, Faz 3'e gecmeden once geri donus gerektiren bloklayici bir acik konu birakmadan hazir durumda.
