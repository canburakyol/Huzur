# Huzur Faz 3 AI Ops Checklist

## Amac
AI trust, rollout gate ve release readiness katmanlarini operatorun tek bakista aksiyon alabilecegi bir checklist haline getirmek.

## Katmanlar
- `src/services/aiOpsChecklistService.js`
- `src/components/Settings.jsx`
- `src/services/analyticsService.js`

## Cekirdek cikti
- operator aksiyonlari
- cekirdek smoke seti
- manuel konsol kontrolleri
- hizli runbook ozetleri

## Smoke seti
- Assistant V2 smoke
- Home ranking smoke
- Weekly insight smoke
- Push hint smoke

## Manuel kontroller
- Functions loglari
- Firestore AI health snapshot tazeligi
- Analytics trendi
- Yerel AI incident kayitlari

## Karar seviyesi
- `stable`
- `verify`
- `intervene`

## Beklenen kazanim
- iki kisilik ekipte release kararini UI icinden desteklemek
- trust dususunde hangi yuzeye once bakilacagini netlestirmek
- smoke ve log kontrolunu ayni panelde toplamak
