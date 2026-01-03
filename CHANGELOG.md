# Huzur Uygulaması - Güncelleme Notları
## Sürüm: 1.1.0 | Tarih: 10 Aralık 2024

---

## 🆕 Yeni Özellikler

### 🕌 Açılış Duası
- Uygulama ilk açıldığında ekranda güzel bir dua kartı görünür
- Besmele ve Taha Suresi 25-26. ayetler
- "Rabbim! Göğsümü aç ve işimi kolaylaştır."
- Dokunarak kapatılır, her oturumda 1 kez gösterilir

---

## 🔧 İyileştirmeler

### 📖 Hikaye Görselleri Düzeltildi
- Siyah ekran sorunu çözüldü
- Portakal gibi alakasız fotoğraflar kaldırıldı
- Yeni kaliteli cami görselleri eklendi
- Görsel yüklenemezse gradient arka plan gösterilir

### 📤 Paylaş Özelliği Geliştirildi
- Native paylaşım desteği (WhatsApp, Instagram, Telegram vs.)
- Masaüstünde WhatsApp Web'e yönlendirme
- Daha akıcı paylaşım deneyimi

---

## 📝 Play Store "Yenilikler" Metni (Kısa)

```
🕌 Açılış duası eklendi - Uygulama açılırken güzel bir dua karşılıyor
📖 Hikaye görselleri iyileştirildi
📤 Paylaşım özelliği geliştirildi
🐛 Hata düzeltmeleri ve performans iyileştirmeleri
```

---

## 📝 Play Store "Yenilikler" Metni (Detaylı)

```
Bu güncellemede neler var:

🕌 Açılış Duası
• Uygulama açıldığında ekranın ortasında güzel bir dua kartı görünür
• Besmele ve "Rabbim! Göğsümü aç ve işimi kolaylaştır" duası

📖 Hikaye İyileştirmeleri  
• Görsel kalitesi artırıldı
• Siyah ekran sorunu giderildi
• Yeni cami ve dua görselleri eklendi

📤 Gelişmiş Paylaşım
• WhatsApp, Instagram ve diğer uygulamalarla doğrudan paylaşım
• Daha kolay içerik paylaşımı

🐛 Hata Düzeltmeleri
• Genel performans iyileştirmeleri
• Küçük hata düzeltmeleri

Hayırlı günler dileriz! 🤲
```

---

## 🔢 Teknik Değişiklikler

| Dosya | Değişiklik |
|-------|------------|
| `src/App.jsx` | Açılış duası modalı eklendi |
| `src/components/Stories.jsx` | Paylaş fonksiyonu güncellendi, fallback gradient eklendi |
| `src/services/contentService.js` | Eksik görsel referansları düzeltildi |
| `public/stories/` | Yeni cami görselleri eklendi |
