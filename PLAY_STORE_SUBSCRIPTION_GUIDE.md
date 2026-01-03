# Google Play Console Abonelik Kurulum Rehberi

Uygulamanız **Freemium** modelindedir. Yani uygulama mağazada **Ücretsiz** olarak görünür, ancak içinde **Uygulama İçi Satın Alma (Abonelik)** barındırır.

## 1. Ödeme Profili (Merchant Account)
Abonelik satabilmek için Google'ın ödeme profilinizi onaylaması gerekir.
1.  Play Console'da **Setup (Kurulum)** > **Payment profile (Ödeme profili)** sayfasına gidin.
2.  Burada bir ödeme profili oluşturun ve banka hesap bilgilerinizi girin.
3.  Onaylanması 1-2 gün sürebilir.

## 2. Abonelikleri Oluşturma
1.  Sol menüden **Monetize (Para Kazanma)** > **Products (Ürünler)** > **Subscriptions (Abonelikler)** sayfasına gidin.
2.  **Create subscription (Abonelik oluştur)** butonuna tıklayın.

### A. Aylık Paket
*   **Product ID:** `huzur_monthly` (RevenueCat ile aynı olmalı)
*   **Name:** Huzur Pro Aylık
*   **Create** butonuna basın.
*   Açılan sayfada **Base plans** kısmına gelin ve **Add base plan** deyin.
*   **Base plan ID:** `monthly-base`
*   **Type:** Auto-renewing (Otomatik yenilenen)
*   **Price:** Fiyatı girin (Örn: 49.99 TRY) ve "Update prices" diyerek diğer ülkeleri ayarlayın.
*   **Billing period:** Monthly (Aylık)
*   **Save** ve ardından **Activate** (Aktifleştir) butonuna basın.

### B. Yıllık Paket
*   Geri dönüp tekrar **Create subscription** deyin.
*   **Product ID:** `huzur_yearly` (RevenueCat ile aynı olmalı)
*   **Name:** Huzur Pro Yıllık
*   **Create** butonuna basın.
*   **Base plans** kısmından **Add base plan** deyin.
*   **Base plan ID:** `yearly-base`
*   **Type:** Auto-renewing
*   **Price:** Fiyatı girin (Örn: 399.99 TRY).
*   **Billing period:** Yearly (Yıllık)
*   **Save** ve ardından **Activate** butonuna basın.

## 3. RevenueCat Bağlantısı (Opsiyonel ama Önerilen)
Gerçek zamanlı sunucu bildirimleri (Real-time Developer Notifications) için:
1.  Play Console'da **Monetize** > **Monetization setup** sayfasına gidin.
2.  **Real-time developer notifications** başlığı altında bir **Topic name** girmeniz gerekebilir.
3.  Bu kısım biraz daha teknik (Google Cloud Pub/Sub gerektirir). Şimdilik uygulamanın çalışması için **zorunlu değildir**, RevenueCat periyodik olarak kontrol eder. Ancak ileride "anında iptal/iade" bildirimleri için yapılması önerilir.
