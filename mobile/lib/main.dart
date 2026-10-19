import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'core/theme/app_theme.dart';
import 'presentation/providers/auth_provider.dart';
import 'presentation/providers/theme_provider.dart';
import 'presentation/screens/login_screen.dart';
import 'presentation/screens/dashboard_screen.dart';
import 'presentation/screens/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint("Firebase init: $e");
  }

  runApp(
    const ProviderScope(
      child: XVocaApp(),
    ),
  );
}

class XVocaApp extends ConsumerWidget {
  const XVocaApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeProvider);

    return MaterialApp(
      title: 'X-VOCA Mobile',
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

class AuthWrapper extends ConsumerWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return authState.when(
      data: (user) =>
          user != null ? const DashboardScreen() : const LoginScreen(),
      loading: () => Scaffold(
        backgroundColor: isDark ? AppColors.bgBase : AppColors.bgBaseLight,
        body: Center(
          child: CircularProgressIndicator(
            color: isDark ? AppColors.accentCyan : AppColors.accentPurple,
          ),
        ),
      ),
      error: (_, __) => const LoginScreen(),
    );
  }
}