# Android App Check Release Build Hatası Çözüm Planı

## Sorun Özeti
`compileReleaseJavaWithJavac` sırasında `DebugAppCheckProviderFactory` sınıfı bulunamadığı için derleme kırılıyor.

## Kök Neden
- `MainActivity.java` içinde debug-only sınıfa doğrudan import var.
- `firebase-appcheck-debug` bağımlılığı `debugImplementation` ile tanımlı.
- Bu nedenle release varyantında debug sınıfı classpath üzerinde yokken kaynak kodda referans verildiği için derleme hatası oluşuyor.

## Hedef
Debug App Check akışını korurken release derlemeyi debug kütüphanesine bağımlı olmadan çalıştırmak.

## Uygulama Stratejisi
1. `MainActivity.java` içindeki `DebugAppCheckProviderFactory` import ve doğrudan referansı kaldır.
2. Build type bazlı sağlayıcı çözümleme katmanı ekle:
   - `app/src/debug/java/com/huzurapp/android/AppCheckProviderResolver.java`
   - `app/src/release/java/com/huzurapp/android/AppCheckProviderResolver.java`
3. `MainActivity.java` içinde provider kurulumunu tek çağrıya indir:
   - `firebaseAppCheck.installAppCheckProviderFactory(AppCheckProviderResolver.getFactory())`
4. Gradle bağımlılık kapsamlarını olduğu gibi koru:
   - `firebase-appcheck-debug` sadece `debugImplementation` olarak kalacak.
5. Doğrulama:
   - Debug derleme başarılı
   - Release derleme başarılı
   - `cannot find symbol DebugAppCheckProviderFactory` hatası kapanmış

## Beklenen Sonuç
- Release derleme debug sınıfı görmeden tamamlanır.
- Debug derleme mevcut token/log akışını sürdürür.
- Güvenli bağımlılık sınırları korunur.
