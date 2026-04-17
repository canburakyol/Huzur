# Huzur Faz 3 AI Health Snapshot

## Amac
Faz 3'te AI guven ve observability sinyallerini yalnizca loglarda birakmayip kullanici profiline de tek bicimde yazmak.

## Yazilan alanlar
- `users/{uid}/aiProfile/profile.latestAssistantSnapshot`
- `users/{uid}/aiProfile/profile.latestHomeRankingSnapshot`
- `users/{uid}/aiProfile/profile.latestWeeklyInsightSnapshot`
- `users/{uid}/aiProfile/profile.latestPushHintSnapshot`
- `users/{uid}/aiProfile/profile.latestAiHealthAt`
- owner-read icin Firestore rules:
  - `users/{uid}/aiProfile/{docId}`
  - `users/{uid}/assistantSessions/{sessionId}`
  - `users/{uid}/weeklyInsights/{weekKey}`

## Snapshot semasi
- `kind`
- `provider`
- `confidence`
- `reviewStatus`
- `trustScore`
- `sourceCount`
- `sources[]`
- `updatedAtIso`

Akisa gore opsiyonel alanlar:
- `riskBand`
- `reason`
- `safetyCategory`
- `moduleCount`
- `notificationType`

## Neden onemli
- Son AI sonucunun guven seviyesi istemci veya operasyon tarafinda yeniden okunabilir.
- Faz 4 ve sonrasi icin health-driven premium, recovery ve eval akislari tekrar provider cagirmadan beslenebilir.
- Incident aninda sadece loglara degil, kullanici profiline yazilan son snapshot'a da bakilabilir.

## Kullanım ilkesi
- Snapshot operasyonel ozet icindir; ham prompt veya hassas tam mesaj burada tutulmaz.
- `sources[]` en fazla 3 kayit ve kisaltilmis label ile saklanir.
- Bu alanlar karar destek ve kalite izlemesi icindir; tek basina dini dogruluk garantisi sayilmaz.

## Istemci erisimi
- `src/services/aiHealthSnapshotService.js`
- son AI snapshot'larini Firestore'dan okuyup 5 dakikalik local cache ile sunar
- Faz 4 ve sonrasi ekranlar bu servisle tekrar provider cagrisi yapmadan AI saglik izini tuketebilir
