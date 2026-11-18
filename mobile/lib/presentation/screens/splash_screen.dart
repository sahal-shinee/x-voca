import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:video_player/video_player.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme/app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';

/// Halaman SplashScreen aplikasi X-VOCA Mobile.
///
/// Fitur utama:
/// - Memutar video splash screen animasi logo X-VOCA (`splash.mp4` atau `splashwhite.mp4`).
/// - Menyesuaikan video dan warna latar secara dinamis berdasarkan preferensi tema pengguna (Dark/Light).
/// - Menginisialisasi pengecekan sesi autentikasi (`authProvider`) di latar belakang selama video diputar.
/// - Berpindah secara otomatis ke rute `/auth` (`AuthWrapper`) segera setelah video selesai diputar.
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
    // Safety fallback: jika video gagal diinisialisasi atau listener tidak trigger,
    // pindah otomatis setelah 3 detik agar aplikasi tidak stuck di loading screen.
    Future.delayed(const Duration(milliseconds: 3000), () {
      if (mounted && !_hasNavigated) {
        _hasNavigated = true;
        _checkAuthAndNavigate();
      }
    });
  }

  /// Menyiapkan pemutar video dengan aset yang sesuai dengan tema tersimpan.
  Future<void> _initVideo() async {
    try {
      // Membaca status tema dari SharedPreferences dengan fallback secure storage
      String? savedTheme;
      try {
        final prefs = await SharedPreferences.getInstance();
        savedTheme = prefs.getString('user_theme_mode');
      } catch (_) {
        try {
          savedTheme = await const FlutterSecureStorage().read(key: 'user_theme_mode');
        } catch (_) {}
      }

      // Jika tersimpan 'light', pakai video splash terang & background putih
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
    } catch (e) {
      debugPrint('[SPLASH] Gagal inisialisasi video: $e');
      if (mounted && !_hasNavigated) {
        _hasNavigated = true;
        _checkAuthAndNavigate();
      }
    }
  }

  /// Listener untuk mendeteksi kapan video selesai diputar.
  void _videoListener() {
    if (_controller != null &&
        _controller!.value.isInitialized &&
        _controller!.value.position >= _controller!.value.duration &&
        !_hasNavigated) {
      _hasNavigated = true;
      _checkAuthAndNavigate();
    }
  }

  /// Navigasi ke wrapper otentikasi (/auth).
  void _checkAuthAndNavigate() {
    if (!mounted) return;
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
    // Memicu pengecekan sesi autentikasi di background sedini mungkin
    ref.watch(authProvider);

    // Pantau tema aktif
    final themeMode = ref.watch(themeProvider);
    final isLight = themeMode == ThemeMode.light || _isLightMode;

    return Scaffold(
      // Latar belakang murni hitam/putih agar seamless dengan video player
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
