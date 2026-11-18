import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// StateNotifier pengelola tema tampilan aplikasi (Dark Mode vs Light Mode).
///
/// Menyimpan preferensi pengguna secara persisten di `SharedPreferences`
/// dengan cadangan `FlutterSecureStorage` sehingga tema tetap terjaga saat
/// aplikasi ditutup dan dibuka kembali, termasuk pada build rilis.
class ThemeNotifier extends StateNotifier<ThemeMode> {
  static const _themeKey = 'user_theme_mode';
  static const _secureStorage = FlutterSecureStorage();

  /// Default tema awal aplikasi adalah Dark Mode (`ThemeMode.dark`).
  ThemeNotifier() : super(ThemeMode.dark) {
    _loadThemeFromPrefs();
  }

  /// Membaca konfigurasi tema yang tersimpan di memori perangkat lokal.
  Future<void> _loadThemeFromPrefs() async {
    String? themeString;
    try {
      final prefs = await SharedPreferences.getInstance();
      themeString = prefs.getString(_themeKey);
    } catch (_) {
      // Fallback ke secure storage jika SharedPreferences gagal diinisialisasi
    }

    if (themeString == null) {
      try {
        themeString = await _secureStorage.read(key: _themeKey);
      } catch (_) {}
    }

    if (themeString == 'light') {
      state = ThemeMode.light;
    } else if (themeString == 'dark') {
      state = ThemeMode.dark;
    }
  }

  /// Menyimpan preferensi tema ke penyimpanan lokal secara aman tanpa memblokir UI.
  Future<void> _persistTheme(String value) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_themeKey, value);
    } catch (_) {
      // Tetap lanjut menyimpan ke cadangan secure storage
    }
    try {
      await _secureStorage.write(key: _themeKey, value: value);
    } catch (_) {}
  }

  /// Beralih tema secara bolak-balik antara Gelap dan Terang secara instan.
  Future<void> toggleTheme() async {
    final nextMode = state == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    // Perbarui state secara sinkron terlebih dahulu agar tombol switch selalu responsif
    state = nextMode;
    await _persistTheme(nextMode == ThemeMode.light ? 'light' : 'dark');
  }

  /// Mengatur tema secara eksplisit ke [ThemeMode.light] atau [ThemeMode.dark].
  Future<void> setThemeMode(ThemeMode mode) async {
    state = mode;
    await _persistTheme(mode == ThemeMode.light ? 'light' : 'dark');
  }
}

/// Provider global preferensi tema aplikasi.
final themeProvider = StateNotifierProvider<ThemeNotifier, ThemeMode>((ref) {
  return ThemeNotifier();
});
