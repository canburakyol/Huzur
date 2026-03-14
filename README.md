# Huzur - Modern İslami Yaşam ve Üretkenlik Uygulaması

<p align="center">
  <img src="public/favicon.svg" width="128" height="128" alt="Huzur Logo">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success.svg" alt="Status">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/React-19-61dafb.svg" alt="React">
  <img src="https://img.shields.io/badge/Vite-7-646cff.svg" alt="Vite">
  <img src="https://img.shields.io/badge/Capacitor-7-119eff.svg" alt="Capacitor">
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg" alt="PRs Welcome">
</p>

---

Huzur, modern müslümanların günlük dini vecibelerini takip etmelerine, Kuran-ı Kerim öğrenmelerine ve manevi gelişimlerini sürdürmelerine yardımcı olmak için tasarlanmış, çevrimdışı öncelikli (offline-first) bir üretkenlik uygulamasıdır. 

React, Vite ve Capacitor kullanılarak geliştirilen bu uygulama, hem web hem de mobil platformlarda akıcı bir deneyim sunar.

## ✨ Öne Çıkan Özellikler

<p align="center">
  <img src="portfolio_assets/huzur_main_screen_1772710722776.png" width="30%" alt="Ana Ekran">
  <img src="portfolio_assets/huzur_quran_screen_1772710739172.png" width="30%" alt="Kuran Ekranı">
  <img src="portfolio_assets/huzur_dhikr_screen_1772710763137.png" width="30%" alt="Zikir Ekranı">
</p>

- 🕌 **Akıllı Namaz Vakitleri**: Konum bazlı hassas vakitler ve özelleştirilebilir bildirimler.
- 📖 **Kuran-ı Kerim**: 114 sure, interaktif okuma modları ve Türkçe meal desteği.
- 🤲 **Dua ve Zikir**: Geniş dua kütüphanesi ve dijital zikirmatik.
- 🧭 **Kıble Pusulası**: Hassas sensör destekli kıble yönü bulucu.
- 📊 **İbadet Takibi**: Kaza namazları ve günlük hedefler için istatistiksel takip.
- 🌦️ **Manevi Hava Durumu**: Esma-ül Hüsna, günün ayeti ve hadis-i şerifler ile günlük motivasyon.
- 📱 **Modern Arayüz**: Emerald ve Gold temasıyla göz yormayan, premium tasarım.

## 🛠️ Teknoloji Yığını

Huzur, en güncel ve performanslı teknolojiler üzerine inşa edilmiştir:

- **Frontend**: [React 19](https://reactjs.org/) + [Vite 7](https://vitejs.dev/)
- **Mobil Köprü**: [Capacitor 7](https://capacitorjs.com/)
- **İkon Seti**: [Lucide React](https://lucide.dev/)
- **Veri Yönetimi**: Hooks ve Context API (Strict Mode uyumlu)
- **Servisler**: Firebase (Opsiyonel), RevenueCat (Abonelik)
- **Stil**: Modern Vanilla CSS (Premium tasarımlar ve mikro animasyonlar)

## 🚀 Başlangıç

### Gereksinimler

- **Node.js**: v22.x (LTS) veya üzeri
- **npm** veya **yarn**
- **Android Studio**: Android çıktıları almak için gereklidir.

### Kurulum

1. **Depoyu klonlayın:**
   ```bash
   git clone https://github.com/canburakyol/Huzur.git
   cd Huzur
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Geliştirme modunda çalıştırın:**
   ```bash
   npm run dev
   ```

4. **Production build oluşturun:**
   ```bash
   npm run build
   ```

5. **Android cihazda test edin:**
   ```bash
   npx cap sync android
   npx cap open android
   ```

## 📂 Proje Yapısı

```text
src/
├── components/      # Modüler ve yeniden kullanılabilir UI bileşenleri
├── services/       # API entegrasyonları ve iş mantığı
├── data/          # Statik dini veriler ve yerelleştirme dosyaları
├── hooks/         # Özel React hookları
└── App.jsx        # Uygulama ana giriş noktası
```

## 🤝 Katkıda Bulunma

Huzur'u daha iyi hale getirmek için katkılarınızı bekliyoruz! Lütfen önce [CONTRIBUTING.md](CONTRIBUTING.md) dosyasını inceleyin.

1. Depoyu fork edin.
2. Feature branch'inizi oluşturun (`git checkout -b feature/YeniOzellik`).
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Yeni özellik eklendi'`).
4. Branch'inizi push edin (`git push origin feature/YeniOzellik`).
5. Bir Pull Request açın.

## 📜 Lisans

Bu proje **MIT Lisansı** ile lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakabilirsiniz.

## ✉️ İletişim

**Can Burak AKYOL** - [@canburakyol](https://github.com/canburakyol)

---
<p align="center">
  Huzurla kalın. 🌙
</p>
