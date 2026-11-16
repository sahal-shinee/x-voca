import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'core/theme/app_theme.dart';
import 'data/services/notification_service.dart';
import 'presentation/providers/auth_provider.dart';
import 'presentation/providers/theme_provider.dart';
import 'presentation/screens/login_screen.dart';
import 'presentation/screens/dashboard_screen.dart';
import 'presentation/screens/splash_screen.dart';

/// Titik masuk utama (Entry Point) aplikasi X-VOCA Mobile.
///
/// Menginisialisasi binding Flutter, Firebase Core, layanan notifikasi push (FCM),
/// dan membungkus root widget dengan `ProviderScope` untuk manajemen state Riverpod.
void main() async {
  // Memastikan binding Flutter siap sebelum eksekusi asynchronous
  WidgetsFlutterBinding.ensureInitialized();

  // Inisialisasi Firebase & FCM Service
  try {
    await Firebase.initializeApp();
    await NotificationService.instance.initialize();
  } catch (e) {
    debugPrint("Firebase init: $e");
  }

  // Menjalankan root widget dalam ProviderScope Riverpod
  runApp(
    const ProviderScope(
      child: XVocaApp(),
    ),
  );
}

/// Root Widget aplikasi X-VOCA.
///
/// Mengonfigurasi tema (Light/Dark mode), routing navigasi dasar,
/// dan menampilkan splash screen awal saat aplikasi pertama kali dibuka.
class XVocaApp extends ConsumerWidget {
  const XVocaApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Memantau preferensi tema yang tersimpan (Light/Dark/System)
    final themeMode = ref.watch(themeProvider);

    return MaterialApp(
      title: 'X-VOCA',
      debugShowCheckedModeBanner: false,
      themeMode: themeMode,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      home: const SplashScreen(),
      routes: {
        '/auth': (context) => const AuthWrapper(),
      },
    );
  }
}

/// Wrapper status autentikasi pengguna.
///
/// Bertindak sebagai router penentu apakah pengguna diarahkan ke:
/// - [DashboardScreen] jika sudah login dan sesi aktif.
/// - [LoginScreen] jika belum login atau sesi telah berakhir/error.
/// - Tampilan loading sementara saat validasi sesi sedang berjalan.
class AuthWrapper extends ConsumerWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Memantau state autentikasi dari AuthProvider
    final authState = ref.watch(authProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return authState.when(
      // Kondisi data siap: Jika user ada tampilkan Dashboard, jika null tampilkan Login
      data: (user) =>
          user != null ? const DashboardScreen() : const LoginScreen(),
      // Kondisi loading: Menampilkan indikator loading dengan tema yang sesuai
      loading: () => Scaffold(
        backgroundColor: isDark ? AppColors.bgBase : AppColors.bgBaseLight,
        body: Center(
          child: CircularProgressIndicator(
            color: isDark ? AppColors.accentCyan : AppColors.accentPurple,
          ),
        ),
      ),
      // Kondisi error: Fallback langsung ke halaman Login
      error: (_, __) => const LoginScreen(),
    );
  }
}
