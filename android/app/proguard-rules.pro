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
}
