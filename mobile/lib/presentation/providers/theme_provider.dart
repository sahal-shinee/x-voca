import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// StateNotifier pengelola tema tampilan aplikasi (Dark Mode vs Light Mode).
///
/// Menyimpan preferensi pengguna secara persisten di `SharedPreferences`
/// sehingga tema tetap terjaga saat aplikasi ditutup dan dibuka kembali.
class ThemeNotifier extends StateNotifier<ThemeMode> {
  static const _themeKey = 'user_theme_mode';

  /// Default tema awal aplikasi adalah Dark Mode (`ThemeMode.dark`).
  ThemeNotifier() : super(ThemeMode.dark) {
    _loadThemeFromPrefs();
  }

  /// Membaca konfigurasi tema yang tersimpan di memori perangkat lokal.
  Future<void> _loadThemeFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final themeString = prefs.getString(_themeKey);

    if (themeString == 'light') {
      state = ThemeMode.light;
    } else if (themeString == 'dark') {
      state = ThemeMode.dark;
    }
  }

  /// Beralih tema secara bolak-balik antara Gelap dan Terang serta menyimpannya ke prefs.
  Future<void> toggleTheme() async {
    final prefs = await SharedPreferences.getInstance();
    if (state == ThemeMode.dark) {
      state = ThemeMode.light;
      await prefs.setString(_themeKey, 'light');
    } else {
      state = ThemeMode.dark;
      await prefs.setString(_themeKey, 'dark');
    }
  }

  /// Mengatur tema secara eksplisit ke [ThemeMode.light] atau [ThemeMode.dark].
  Future<void> setThemeMode(ThemeMode mode) async {
    final prefs = await SharedPreferences.getInstance();
    state = mode;
    await prefs.setString(
      _themeKey,
      mode == ThemeMode.light ? 'light' : 'dark',
    );
  }
}

/// Provider global preferensi tema aplikasi.
final themeProvider = StateNotifierProvider<ThemeNotifier, ThemeMode>((ref) {
  return ThemeNotifier();
});
