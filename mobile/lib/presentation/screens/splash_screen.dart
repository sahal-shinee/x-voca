import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:video_player/video_player.dart';
import '../../core/theme/app_theme.dart';
import '../providers/auth_provider.dart';
import 'dashboard_screen.dart';
import 'login_screen.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  late VideoPlayerController _controller;
  bool _hasNavigated = false;

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.asset('assets/videos/splash.mp4')
      ..initialize().then((_) {
        setState(() {});
        _controller.play();
      });

    _controller.addListener(_videoListener);
  }

  void _videoListener() {
    if (_controller.value.isInitialized &&
        _controller.value.position >= _controller.value.duration &&
        !_hasNavigated) {
      _hasNavigated = true;
      _checkAuthAndNavigate();
    }
  }

  void _checkAuthAndNavigate() {
    if (!mounted) return;

    // Ambil data auth yang sudah selesai di-fetch di background pas video lagi diputar
    final authState = ref.read(authProvider);

    Widget targetScreen = const LoginScreen();

    authState.whenData((user) {
      if (user != null) {
        targetScreen = const DashboardScreen();
      }
    });

    // Langsung pindah ke halaman tujuan tanpa lewat AuthWrapper / Loading lagi
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => targetScreen),
    );
  }

  @override
  void dispose() {
    _controller.removeListener(_videoListener);
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Pancing authProvider dari pertama kali splash screen muncul biar langsung jalan di background
    ref.watch(authProvider);

    return Scaffold(
      backgroundColor: AppColors.bgBase,
      body: Center(
        child: _controller.value.isInitialized
            ? AspectRatio(
                aspectRatio: _controller.value.aspectRatio,
                child: VideoPlayer(_controller),
              )
            : const CircularProgressIndicator(color: AppColors.accentCyan),
      ),
    );
  }
}