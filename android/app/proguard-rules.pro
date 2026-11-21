# ==================================================
# Huzur App - R8 rules
# ==================================================
# Firebase, Play services (AdMob, Play Integrity), RevenueCat, WorkManager and Capacitor
# (incl. every class extending com.getcapacitor.Plugin) ship their own consumer rules in
# their AARs. Do not add blanket "-keep class lib.** { *; }" rules here: they keep whole
# libraries unobfuscated and pushed Play's obfuscation score below 25% (Nov 2026).

-dontusemixedcaseclassnames

# Capacitor WebView JavaScript interface (called by name from JS)
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Crashlytics: readable stack traces (mapping file is uploaded) and custom exception names
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
-keep public class * extends java.lang.Exception

# Kotlin
-keep class kotlin.Metadata { *; }

# Missing optional classes referenced by libraries
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**
-dontwarn com.google.android.play.core.**
-dontwarn com.revenuecat.purchases.**
-dontwarn com.getcapacitor.**
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-dontwarn kotlin.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase

# Strip verbose logging from release builds
-assumenosideeffects class android.util.Log {
    public static int v(...);
    public static int d(...);
    public static int i(...);
}

# Obfuscation: short names from the dictionary, all classes moved into one package
-obfuscationdictionary proguard-dictionary.txt
-classobfuscationdictionary proguard-dictionary.txt
-packageobfuscationdictionary proguard-dictionary.txt
-repackageclasses 'a'
-allowaccessmodification
