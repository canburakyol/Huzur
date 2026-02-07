---
title: 'Mobil Özellikler Entegrasyonu (V2)'
slug: 'mobile-features-v2'
created: '2026-02-01'
stepsCompleted: [1, 2, 3, 4]
status: 'ready-for-dev'
tech_stack: ['React 19', 'Capacitor 8', 'Firebase']
files_to_modify: ['src/context/AppInitProvider.jsx', 'src/components/Zikirmatik.jsx', 'src/components/Tespihat.jsx', 'src/components/Adhkar.jsx']
code_patterns: ['Service patterns', 'Provider initialization']
test_patterns: ['Manual mobile testing', 'Haptic feedback verification']
---

# Tech-Spec: Mobil Özellikler Entegrasyonu (V2)

**Created:** 2026-02-01

## Overview

### Problem Statement

Uygulamanın mobil platformda daha profesyonel ve "native" hissettirmesi için gerekli olan titreşim geri bildirimi, uygulama içi güncelleme kontrolü, puanlama teşviği ve uygulama içi tarayıcı gibi özelliklerin eksikliği.

### Solution

Capacitor 8 eklentilerini kullanarak Haptics, App Rate, In-App Update, In-App Browser ve Screen Orientation özelliklerini uygulamak ve ilgili merkezi servisleri sisteme entegre etmek.

### Scope

**In Scope:**
- Capacitor eklentilerinin kurulumu (Haptics, Rate, Update, Browser, Orientation)
- Yeni servis dosyalarının oluşturulması (hapticsService.js, rateService.js, updateService.js, browserService.js, orientationService.js)
- Zikirmatik, Tespihat ve Adhkar bileşenlerine Haptics entegrasyonu
- AppInitProvider'a Update, Rate ve Orientation kontrollerinin eklenmesi
- Ayarlar sayfasındaki dış linklerin In-App Browser'a taşınması

**Out of Scope:**
- iOS spesifik Xcode yapılandırmaları (sadece kod seviyesinde hazırlık)
- Biometrik doğrulama (kullanıcı tarafından reddedildi)

## Context for Development

### Codebase Patterns

Uygulama genelinde servis tabanlı bir yapı (`src/services`) ve merkezi state yönetimi için Context API (`src/context`) kullanılmaktadır. Yeni eklenen özellikler de bu desene uygun şekilde servis olarak tanımlanacak ve merkezi initialization noktalarından tetiklenecektir.

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `src/context/AppInitProvider.jsx` | Uygulama başlangıç mantığı (Update, Rate, Orientation buraya eklenecek) |
| `src/components/Zikirmatik.jsx` | Haptics entegrasyonu yapılacak ana bileşen |
| `plans/mobile-features-integration-plan.md` | Detaylı entegrasyon planı |

### Technical Decisions

- **Impact Style:** Zikir çekilirken `Medium`, butonlara basılırken `Light` haptic impact kullanılacak.
- **Update Strategy:** Kritik güncellemeler (priority >= 5) için `Immediate`, diğerleri için `Flexible` update sunulacak.
- **Browser Presentation:** Tüm dış linkler `fullscreen` presentation style ile açılacak.
- **Architecture Pattern:** (Method 42 Critique) `AppInitProvider`'ın şişmesini önlemek için, yeni özelliklerin (Rate, Update, Orientation) initialization mantığı `hooks/useMobileFeatures.js` adında yeni bir custom hook içinde toplanacak ve Provider sadece bu hook'u çağıracak.

## Critique & Refine (Method 42 - Winston)

**Eleştiri:**
> "AppInitProvider zaten çok yüklü (Prayer, Location, Auth, Badges). Buraya bir de Update/Rate/Orientation mantığını raw code olarak eklemek 'God Object' problemine yol açar. Bu logic kesinlikle ayrıştırılmalı."

**İyileştirme:**
Yeni servislerin (Haptics, Rate, Update) başlatılması ve yönetilmesi için `useMobileFeatures` hook'u oluşturulacak. Bu hook:
1. Platform kontrolü yapacak (Web vs Native).
2. Orientation kilidini yönetecek.
3. Update kontrolünü asenkron başlatacak.
4. Rate servisini initialize edecek.
5. Sadece gerekli durum/fonksiyonları Provider'a dönecek.

## Failure Mode Analysis (Method 35)

Bu özelliklerin entegrasyonunda olası kırılma noktaları ve çözüm stratejileri (Murat & Barry tarafından analiz edildi):

### 1. Haptics (Titreşim)
| Hata Modu | Etkisi | Önlem / Strateji |
|-----------|--------|------------------|
| **Cihaz Desteklemiyor** | Uygulama durabilir veya hiçbir şey olmaz. | `Haptics.isSupported()` kontrolü zorunlu. Olmazsa `navigator.vibrate` fallback. |
| **Kullanıcı Titreşimi Kapattı** | Zikir hissi kaybolur. | Bu ayarı uygulamanın kendi 'Settings' bölümünden kontrol edilebilir hale getir. |
| **Eski Android Sürümü** | Hata fırlatabilir. | `try-catch` blokları ile tüm çağrılar sarmalanmalı. |

### 2. App Rate (Puanlama)
| Hata Modu | Etkisi | Önlem / Strateji |
|-----------|--------|------------------|
| **Google Play Hizmetleri Yok** | (Huawei vb.) Hata fırlatır. | Rate eklentisi başarısız olursa sessizce hata yakala, custom modal gösterme. |
| **İnternet Yok** | Rate dialog açılmaz. | İstek öncesi `Network.getStatus()` kontrolü yapılabilir. |
| **Çok Sık Sorma** | Kullanıcı sinirlenir, siler. | `Preferences` ile son sorulma tarihini ve reddedilme durumunu katı şekilde takip et. |

### 3. In-App Updates
| Hata Modu | Etkisi | Önlem / Strateji |
|-----------|--------|------------------|
| **Dev Ortamı** | Hata fırlatır (Play Store yok). | `isDev` flag kontrolü ile development ortamında bu servisi bypass et. |
| **Flexible Update Takılması** | Yükleme %100'de kalır. | Listener timeout süresi, eğer takılırsa kullanıcıyı rahatsız etme. |

### 4. Browser & Orientation
| Hata Modu | Etkisi | Önlem / Strateji |
|-----------|--------|------------------|
| **Tarayıcı Açılmıyor** | Link bozuk sanılır. | `Browser.open` fail olursa `window.open(url, '_blank')` ile sistem tarayıcısına düş. |
| **Tablet Kullanımı** | Dikey mod kötü görünür. | Sadece telefonlarda (`Device.getInfo().model`) dikey kilit yap, tabletlerde serbest bırak. |

## Implementation Plan

### Tasks

- [ ] Task 1: Install Capacitor Plugins
  - File: `package.json`
  - Action: Install `@capacitor/haptics`, `capacitor-rate-app`, `capacitor-inappupdate`, `@capacitor/browser`, `@capacitor/screen-orientation`.
  - Notes: Run `npx cap sync` after installation.

- [ ] Task 2: Implement Haptics Service
  - File: `src/services/hapticsService.js` (NEW)
  - Action: Create service with methods `lightImpact`, `mediumImpact`, `heavyImpact`, `successNotification`. Implement `isSupported` check.
  - Notes: Add fallback to `navigator.vibrate`.

- [ ] Task 3: Implement Rate Service
  - File: `src/services/rateService.js` (NEW)
  - Action: Create service to track `launchCount` and `eventCount`. **Priority**: Trigger prompt immediately after "Zikir Goal Reached" if conditions met (Sally's feedback).

- [ ] Task 4: Implement Update Service
  - File: `src/services/updateService.js` (NEW)
  - Action: Create service to check for updates. Add listener for `appStateChange` to re-check update status on resume (Winston's feedback).

- [ ] Task 5: Implement Browser & Orientation Services
  - File: `src/services/browserService.js` (NEW), `src/services/orientationService.js` (NEW)
  - Action: Create services for `Browser.open` and `ScreenOrientation.lock`.

- [ ] Task 6: Create useMobileFeatures Hook
  - File: `src/hooks/useMobileFeatures.js` (NEW)
  - Action: Encapsulate logic. Bind Update check to `AppState` changes. Expose `triggerRatePrompt` for Zikir components.

- [ ] Task 7: Integrate into AppInitProvider
  - File: `src/context/AppInitProvider.jsx`
  - Action: Import and call `useMobileFeatures()`.

- [ ] Task 8: Integrate Haptics into Zikirmatik
  - File: `src/components/Zikirmatik.jsx`
  - Action: Add haptics. **New**: Call `rateService.checkAndPrompt()` when target reached.

- [ ] Task 9: Integrate Haptics into Tespihat & Adhkar
  - File: `src/components/Tespihat.jsx`, `src/components/Adhkar.jsx`
  - Action: Replace `navigator.vibrate` with `hapticsService.lightImpact()` on tap.

- [ ] Task 10: Integrate In-App Browser in Settings
  - File: `src/pages/Settings.jsx` (or equivalent component with external links)
  - Action: Use `browserService.open` for Privacy Policy and external links.

### Acceptance Criteria

- [ ] AC 1: Zikirmatik Haptics
  Given user is on Zikirmatik page, when user taps count button, then device should provide medium haptic feedback.
  Given user reaches target count, when tap occurs, then device should provide success notification haptic pattern.

- [ ] AC 2: Rate Prompt Logic
  Given user finishes a Zikir/Hatim (Happy Moment), when conditions (7 days) met, then Rate App dialog should appear immediately (Sally's Rule).
  Given user has already rated, when logic runs, then dialog should NOT appear.

- [ ] AC 3: Orientation Lock
  Given app is open, when user rotates device to landscape, then app UI should remain in portrait mode (on phones).

- [ ] AC 4: Update Check & Resume
  Given app returns from background (Resume), when a flexible update is pending, then app should check status and prompt install if ready (Winston's Rule).

- [ ] AC 5: In-App Browser
  Given user clicks 'Privacy Policy' in Settings, then link should open in internal browser modal.

- [ ] AC 6: Offline Start (Murat's Rule)
  Given device has NO internet, when app opens, then Update and Rate checks should fail silently without showing any error modal to user.

## Additional Context

### Dependencies

- @capacitor/haptics
- capacitor-rate-app
- capacitor-inappupdate
- @capacitor/browser
- @capacitor/screen-orientation

### Testing Strategy

- Fiziksel Android cihazda titreşim şiddetinin kontrolü.
- Ekran döndürme kilidinin her sayfada dikey kaldığının doğrulanması.
- In-App browser açıldığında uygulama bar renginin uyumluluğu.

### Notes

- AndroidManifest.xml üzerinde bazı eklentiler için manuel düzenleme gerekebilir.
- Rate App eklentisi Google Play Store yüklü olmayan cihazlarda hata vermemeli.
