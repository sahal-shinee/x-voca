# Keep shared_preferences_android JNI/Pigeon classes and Kotlin Coroutines signatures
-keep class io.flutter.plugins.sharedpreferences.** { *; }
-keep class kotlin.coroutines.** { *; }
-keep class kotlin.jvm.internal.DefaultConstructorMarker { *; }
-keep class com.github.dart_lang.jni.** { *; }

# Keep Flutter Secure Storage & Cryptography classes
-keep class com.it_nomads.fluttersecurestorage.** { *; }
-keep class androidx.security.crypto.** { *; }

# Keep Gson / JSON serialization if used by plugins
-keepattributes Signature, InnerClasses, EnclosingMethod
