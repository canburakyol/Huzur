# 🔒 Firebase Firestore Güvenlik Kuralları Önerisi

Bu belge, Firebase Console'a uygulamanız gereken güvenlik kurallarını içerir.

## 📍 Nereye Yapıştırılacak?

1. **Firebase Console**'a gidin: https://console.firebase.google.com/
2. Projenizi seçin: `huzur-app-c01b7`
3. Sol menüden **Firestore Database** > **Rules** sekmesine tıklayın
4. Mevcut kuralları aşağıdaki kurallarla değiştirin
5. **Publish** butonuna tıklayın

---

## 🛡️ Önerilen Güvenlik Kuralları

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ========================================
    // DUA KARDEŞLİĞİ (duas collection)
    // ========================================
    match /duas/{duaId} {
      // Herkes duaları okuyabilir
      allow read: if true;
      
      // Yeni dua oluşturma: Sadece geçerli formatta
      allow create: if request.resource.data.keys().hasAll(['text', 'count', 'date'])
                    && request.resource.data.text is string
                    && request.resource.data.text.size() > 0
                    && request.resource.data.text.size() <= 500
                    && request.resource.data.count == 0
                    && request.resource.data.date is string;
      
      // Güncelleme: Sadece 'count' alanı 1 artırılabilir
      allow update: if request.resource.data.diff(resource.data).affectedKeys().hasOnly(['count'])
                    && request.resource.data.count == resource.data.count + 1;
      
      // Silme: Kimse silemez
      allow delete: if false;
    }
    
    // ========================================
    // HATİM TAKİBİ (hatims collection)
    // ========================================
    match /hatims/{hatimId} {
      // Herkes hatimleri okuyabilir (erişim kodu UI'da kontrol edilir)
      allow read: if true;
      
      // Yeni hatim oluşturma: Geçerli format kontrolü
      allow create: if request.resource.data.keys().hasAll(['title', 'createdAt', 'createdBy', 'participants', 'parts', 'accessCode'])
                    && request.resource.data.title is string
                    && request.resource.data.title.size() > 0
                    && request.resource.data.title.size() <= 100
                    && request.resource.data.accessCode is string
                    && request.resource.data.accessCode.size() == 6;
      
      // Güncelleme: Sadece izin verilen alanlar değiştirilebilir
      allow update: if request.resource.data.diff(resource.data).affectedKeys()
                       .hasOnly(['participants', 'parts', 'completedParts'])
                    // Temel alanlar değiştirilemez
                    && request.resource.data.title == resource.data.title
                    && request.resource.data.accessCode == resource.data.accessCode
                    && request.resource.data.createdAt == resource.data.createdAt
                    && request.resource.data.createdBy == resource.data.createdBy;
      
      // Silme: Kimse silemez
      allow delete: if false;
    }
    
    // ========================================
    // DİĞER TÜM COLLECTION'LAR
    // Varsayılan olarak erişim yok
    // ========================================
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 📋 Kuralların Açıklaması

### Dua Kardeşliği (`duas`)

| İşlem | İzin | Açıklama |
|-------|------|----------|
| **Okuma** | ✅ Herkes | Tüm dualar görüntülenebilir |
| **Oluşturma** | ⚠️ Kısıtlı | `text`, `count`, `date` alanları zorunlu. `count` başlangıçta 0 olmalı. Metin max 500 karakter |
| **Güncelleme** | ⚠️ Kısıtlı | Sadece `count` alanı ve sadece 1 artırılabilir. Spam koruması! |
| **Silme** | ❌ Yasak | Hiçbir dua silinemez |

### Hatim Takibi (`hatims`)

| İşlem | İzin | Açıklama |
|-------|------|----------|
| **Okuma** | ✅ Herkes | Tüm hatimler görüntülenebilir (erişim kodu UI'da kontrol ediliyor) |
| **Oluşturma** | ⚠️ Kısıtlı | Zorunlu alanlar ve format kontrolü. Başlık max 100 karakter, kod 6 karakter |
| **Güncelleme** | ⚠️ Kısıtlı | Sadece `participants`, `parts`, `completedParts` güncellenebilir. Başlık, kod, oluşturucu değiştirilemez |
| **Silme** | ❌ Yasak | Hiçbir hatim silinemez |

---

## ⚠️ Önemli Notlar

1. **Test Edin**: Kuralları uyguladıktan sonra uygulamayı test edin
2. **Mevcut Verileriniz**: Bu kurallar mevcut verileri etkilemez, sadece yeni işlemleri kontrol eder
3. **Geri Alma**: Sorun olursa eski kurallarınıza dönebilirsiniz

---

## 🧪 Test Komutları (Firebase Console'da)

Firebase Console > Firestore > Rules > "Rules playground" sekmesinde test edebilirsiniz:

```
// Dua oluşturma testi - BAŞARILI olmalı
POST /duas
{
  "text": "Allah'ım bana yardım et",
  "count": 0,
  "date": "2026-01-03"
}

// Dua sayacı artırma testi - BAŞARILI olmalı
PATCH /duas/{id}
{
  "count": 1  // mevcut 0 ise
}

// Dua silme testi - REDDEDİLMELİ
DELETE /duas/{id}
```
