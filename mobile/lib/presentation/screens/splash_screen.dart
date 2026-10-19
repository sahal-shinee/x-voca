import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:video_player/video_player.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme/app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  VideoPlayerController? _controller;
  bool _hasNavigated = false;
  bool _isInitialized = false;
  bool _isLightMode = false;

  @override
  void initState() {
    super.initState();
    _initVideo();
  }

  Future<void> _initVideo() async {
    // Membaca status tema langsung dari SharedPreferences agar akurat saat aplikasi baru dibuka
    final prefs = await SharedPreferences.getInstance();
    final savedTheme = prefs.getString('user_theme_mode');
    
    // Jika tersimpan 'light', pakai video & background putih
    _isLightMode = savedTheme == 'light';

    final videoAsset = _isLightMode
        ? 'assets/videos/splashwhite.mp4'
        : 'assets/videos/splash.mp4';

    _controller = VideoPlayerController.asset(videoAsset);
    await _controller!.initialize();

    if (mounted) {
      setState(() {
        _isInitialized = true;
      });
      _controller!.play();
      _controller!.addListener(_videoListener);
    }
  }

  void _videoListener() {
    if (_controller != null &&
        _controller!.value.isInitialized &&
        _controller!.value.position >= _controller!.value.duration &&
        !_hasNavigated) {
      _hasNavigated = true;
      _checkAuthAndNavigate();
    }
  }

  void _checkAuthAndNavigate() {
    if (!mounted) return;
    // Arahkan ke AuthWrapper — Riverpod yang akan memutuskan Login atau Dashboard
    Navigator.of(context).pushReplacementNamed('/auth');
  }

  @override
  void dispose() {
    _controller?.removeListener(_videoListener);
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Pancing authProvider dari pertama kali splash screen muncul biar langsung jalan di background
    ref.watch(authProvider);

    // Ikuti tema aktif jika ada perubahan state
    final themeMode = ref.watch(themeProvider);
    final isLight = themeMode == ThemeMode.light || _isLightMode;

    return Scaffold(
      // Pakai hitam/putih murni khusus di SplashScreen agar menyatu dengan video
      backgroundColor: isLight ? Colors.white : Colors.black,
      body: Center(
        child: (_controller != null && _isInitialized)
            ? AspectRatio(
                aspectRatio: _controller!.value.aspectRatio,
                child: VideoPlayer(_controller!),
              )
            : CircularProgressIndicator(
                color: isLight ? AppColors.accentPurple : AppColors.accentCyan,
              ),
      ),
    );
  }
}