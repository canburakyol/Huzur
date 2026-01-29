# ==================================================
# Huzur App - Production ProGuard Rules
# ==================================================

# Basic optimizations
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-verbose

# ==================================================
# Firebase SDK
# ==================================================
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# Firebase App Check
-keep class com.google.firebase.appcheck.** { *; }
-keep class com.google.firebase.appcheck.playintegrity.** { *; }
-keep class com.google.firebase.appcheck.debug.** { *; }
-dontwarn com.google.firebase.appcheck.**

# Play Integrity API (for App Check)
-keep class com.google.android.play.core.integrity.** { *; }
-keep class com.google.android.play.core.tasks.** { *; }
-dontwarn com.google.android.play.core.integrity.**
-dontwarn com.google.android.play.core.tasks.**

# Firebase Crashlytics
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception

# ==================================================
# Capacitor Core & Plugins
# ==================================================
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin public class * { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
-dontwarn com.getcapacitor.**

# Capacitor WebView JavaScript Interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ==================================================
# RevenueCat Purchases SDK
# ==================================================
-keep class com.revenuecat.purchases.** { *; }
-dontwarn com.revenuecat.purchases.**

# ==================================================
# AdMob / Google Ads
# ==================================================
-keep class com.google.android.gms.ads.** { *; }
-dontwarn com.google.android.gms.ads.**

# ==================================================
# OkHttp & Retrofit (network libraries)
# ==================================================
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase

# ==================================================
# Kotlin
# ==================================================
-dontwarn kotlin.**
-keep class kotlin.Metadata { *; }

# ==================================================
# Debugging - Keep source file names in stack traces
# ==================================================
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ==================================================
# Remove logging in release builds
# ==================================================
-assumenosideeffects class android.util.Log {
    public static int v(...);
    public static int d(...);
    public static int i(...);
    public static int w(...);
    public static int e(...);
}

# ==================================================
# Pro Subscription Security - Obfuscation
# ==================================================

# Obfuscate storage keys
-obfuscationdictionary proguard-dictionary.txt
-classobfuscationdictionary proguard-dictionary.txt
-packageobfuscationdictionary proguard-dictionary.txt

# Keep Pro status related classes but obfuscate method names
-keepclassmembers class * {
    private static final java.lang.String PRO_STATUS_KEY;
    private static final java.lang.String SUBSCRIPTION_KEY;
    private static final java.lang.String REVENUECAT_KEY;
}

# Obfuscate SharedPreferences access
-keepclassmembers class android.content.SharedPreferences {
    public ** get*(...);
    public ** edit();
}

# Keep RevenueCat callbacks but obfuscate implementation
-keep interface com.revenuecat.purchases.interfaces.* { *; }
-keepclassmembers class * implements com.revenuecat.purchases.interfaces.* {
    public void on*(...);
}

# Obfuscate local storage keys (JavaScript bridge)
-keepclassmembers class com.getcapacitor.Bridge {
    public void eval*(...);
}

# Prevent reverse engineering of Pro validation logic
-repackageclasses 'a'
-flattenpackagehierarchy
-allowaccessmodification

# Note: String encryption requires commercial ProGuard/DexGuard
# R8 (Android's default shrinker) does not support -encryptstrings
# For Pro subscription security, we rely on:
# 1. Server-side validation (Firestore Rules)
# 2. Obfuscation (ProGuard/R8)
# 3. ProGuard dictionary for class name obfuscation
