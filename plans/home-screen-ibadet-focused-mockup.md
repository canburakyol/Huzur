# Ana Ekran Mockup Planı - Sade ve İbadet Odaklı

## 1. Tasarım İlkeleri
- Birincil odak: namaz vakti ve sıradaki vakit
- İkincil odak: günlük ibadet ilerlemesi ve hızlı aksiyon
- Üçüncül odak: içerik ve keşif
- Analitik kartları son kullanıcı ana ekranında yer almaz

## 2. Bilgi Mimarisi Önceliği
1. Vakit durumu
2. Geri sayım
3. Günlük hedefler ve görevler
4. Hızlı ibadet araçları
5. İçerik önerileri

## 2.1 Görsel Mockup A - Vakit Merkezli

```mermaid
flowchart TB
    subgraph A[Telefon Ekranı A]
        direction TB
        A1[Konum Hava Selamlama]
        A2[Güncel Vakit Banner]
        A3[Sonraki Vakit Geri Sayım]
        A4[Günlük Hedefler]
        A5[Hızlı Aksiyonlar 2x2]
        A6[Günün Görevleri]
        A7[Günlük İçerik]
        A1 --> A2 --> A3 --> A4 --> A5 --> A6 --> A7
    end

    classDef primary fill:#0f3d2e,color:#f5e6c8,stroke:#d4af37,stroke-width:1px
    classDef section fill:#f7f5ef,color:#14352a,stroke:#c9b27a,stroke-width:1px

    class A2,A3 primary
    class A1,A4,A5,A6,A7 section
```

## 2.2 Görsel Mockup B - Görev Merkezli

```mermaid
flowchart TB
    subgraph B[Telefon Ekranı B]
        direction TB
        B1[Konum Hava Selamlama]
        B2[Günlük Hedefler Özet]
        B3[Güncel Vakit Banner]
        B4[Sonraki Vakit Geri Sayım]
        B5[Hızlı Aksiyonlar Yatay]
        B6[Günün Görevleri]
        B7[Günlük İçerik]
        B1 --> B2 --> B3 --> B4 --> B5 --> B6 --> B7
    end

    classDef primary fill:#0f3d2e,color:#f5e6c8,stroke:#d4af37,stroke-width:1px
    classDef section fill:#f7f5ef,color:#14352a,stroke:#c9b27a,stroke-width:1px

    class B3,B4 primary
    class B1,B2,B5,B6,B7 section
```

## 3. Mockup A - Vakit Merkezli Akış

```text
┌─────────────────────────────────────┐
│  Konum + Hava + Selamlama          │
├─────────────────────────────────────┤
│  Güncel Vakit Banner               │
│  Örn İkindi Vakti                  │
├─────────────────────────────────────┤
│  Sonraki Vakit Geri Sayım          │
│  01:24:18                          │
│  Alt satır: Günün tüm vakit şeridi │
├─────────────────────────────────────┤
│  Günlük Hedefler Kartı             │
│  - Namaz tamamlandı 3/5            │
│  - Zikir hedefi 120/300            │
│  - Bugün hatim 2 sayfa             │
├─────────────────────────────────────┤
│  Hızlı Aksiyonlar 2x2              │
│  [Namaz Takip] [Zikirmatik]        │
│  [Kıble]      [Günün Duası]        │
├─────────────────────────────────────┤
│  Günün Görevleri                   │
├─────────────────────────────────────┤
│  Günlük İçerik Önerisi             │
└─────────────────────────────────────┘
```

## 4. Mockup B - Görev Merkezli Akış

```text
┌─────────────────────────────────────┐
│  Konum + Hava + Selamlama          │
├─────────────────────────────────────┤
│  Günlük Hedefler Kartı             │
│  Bugün özeti tek bakışta           │
├─────────────────────────────────────┤
│  Güncel Vakit Banner               │
├─────────────────────────────────────┤
│  Sonraki Vakit Geri Sayım          │
├─────────────────────────────────────┤
│  Hızlı Aksiyonlar yatay çipler      │
│  Namaz  Zikir  Kıble  Dua          │
├─────────────────────────────────────┤
│  Günün Görevleri                   │
├─────────────────────────────────────┤
│  Günlük İçerik                      │
└─────────────────────────────────────┘
```

## 5. Akış Diyagramı

```mermaid
flowchart TD
    A[Ana Ekran] --> B[Konum ve Selamlama]
    A --> C[Vakit Durumu]
    C --> D[Geri Sayım]
    A --> E[Günlük Hedefler]
    A --> F[Hızlı Aksiyonlar]
    A --> G[Görevler]
    A --> H[İçerik]
```

## 6. Mevcut Bileşenlerden Uygulanabilir Eşleme
- Üst blok aynı kalır: [`HomeHeader`](src/components/HomeHeader.jsx)
- Vakit başlığı aynı kalır: [`PrayerTimeBanner`](src/components/PrayerTimeBanner.jsx)
- Geri sayım aynı kalır: [`PrayerCountdown`](src/components/PrayerCountdown.jsx)
- Görev bölümü korunur: [`DailyQuests`](src/components/DailyQuests.jsx)
- İçerik bölümü korunur: [`DailyContentGrid`](src/components/app-shell/AppHomeTabContent.jsx:85)
- Hızlı aksiyon için mevcut grid sadeleştirilir: [`FeatureGrid`](src/components/FeatureGrid.jsx)
- Yerleşim sırası düzenlenecek dosya: [`AppHomeTabContent()`](src/components/app-shell/AppHomeTabContent.jsx:18)

## 7. Karar Notu
- Son kullanıcı deneyimi için önerim Mockup A
- Sebep: namaz odaklı uygulamada en kritik karar anı olan sonraki vakit bilgisi üstte ve görünür
- Growth kartı ana ekranda olmayacak, gerekirse sadece admin veya debug görünümünde tutulacak
