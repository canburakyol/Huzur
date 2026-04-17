# Huzur Faz 5 Referral Growth Loop

## Hedef
Referral hattini sadece paylasim yuzeyi olmaktan cikarip, gercek donus gorunen ve olculebilir bir growth loop haline getirmek.

## Bu turda tamamlananlar
- Local referral state korunurken server-side sync katmani eklendi.
- Yeni callable'lar:
  - `syncReferralStateV1`
  - `getReferralServerSnapshotV1`
- Davet eden taraf icin gercek `acceptedCount` ve `convertedCount` ozeti tutuluyor.
- Davet edilen taraf icin `inviteeRewardUnlockedAt` server tarafinda da gorunur hale geldi.
- Invite modal yeni growth plan katmanina tasindi:
  - share CTA experiment
  - progress steps
  - blocked state
  - copy/share funnel analytics
- Referral funnel analytics derinlesti:
  - `invite_modal_viewed`
  - `invite_share_opened`
  - `invite_code_copied`
  - `invite_link_copied`

## Veri modeli
- `referralCodes/{inviteCode}`
  - `inviterId`
  - `inviteCode`
  - `createdAt`
  - `updatedAt`
- `referrals/{inviterUid}`
  - `inviterId`
  - `ownCode`
  - `inviteCreatedAt`
  - `acceptedCount`
  - `convertedCount`
  - `latestInviterRewardAt`
  - `updatedAt`
- `referralConversions/{inviterUid}_{inviteeUid}`
  - `inviterId`
  - `inviteeId`
  - `inviteCode`
  - `acceptedAt`
  - `onboardingCompletedAt`
  - `firstIbadahCompletedAt`
  - `convertedAt`
  - `updatedAt`
- `users/{uid}/data/referralServerState`
  - `invitedByCode`
  - `inviteAcceptedAt`
  - `onboardingCompletedAt`
  - `firstIbadahCompletedAt`
  - `inviteeRewardUnlockedAt`
  - `inviterId`
  - `syncIssue`
  - `syncedAt`

## Growth loop
1. Kullanici link olusturur.
2. Kod server'da kullaniciya baglanir.
3. Davet edilen kisi deep link ile gelir.
4. Onboarding ve ilk ibadet milestone'lari sync edilir.
5. Server conversion'i bir kez sayar.
6. Invite modal donusen ve bekleyen davetleri gosterir.

## Sonraki en mantikli optimizasyonlar
- Home icinde tetik anlari:
  - haftalik icgoru sonrasi
  - recovery tamamlandiginda
  - premium odul anindan sonra
- Referral landing ve referred onboarding copy uyumu
- Top converters / aile daveti / sosyal kanit halkasi
- Fraud sinyallerini ops paneline tasimak
