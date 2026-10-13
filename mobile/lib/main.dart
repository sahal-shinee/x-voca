import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'core/theme/app_theme.dart';
import 'presentation/providers/auth_provider.dart';
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

class XVocaApp extends StatelessWidget {
  const XVocaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'X-VOCA Mobile',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const SplashScreen(),
    );
  }
}

class AuthWrapper extends ConsumerWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return authState.when(
      data: (user) => user != null ? const DashboardScreen() : const LoginScreen(),
      loading: () => const Scaffold(
        backgroundColor: AppColors.bgBase,
        body: Center(
          child: CircularProgressIndicator(color: AppColors.accentCyan),
        ),
      ),
      error: (_, __) => const LoginScreen(),
    );
  }
}