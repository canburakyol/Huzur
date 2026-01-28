---
trigger: always_on
---

# Android Geliştirme Kuralları
- Dil: Her zaman Kotlin kullan.
- Mimari: MVVM dışında kod yazma.
- UI: Sadece Jetpack Compose kullan, XML kullanma.
- İsimlendirme: ViewModel'ler her zaman "ViewModel" ile bitmeli.
- Hata Yönetimi: Network çağrılarını her zaman Result wrapper içine al.