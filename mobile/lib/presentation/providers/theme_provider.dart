import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeNotifier extends StateNotifier<ThemeMode> {
  static const _themeKey = 'user_theme_mode';

  ThemeNotifier() : super(ThemeMode.dark) {
    _loadThemeFromPrefs();
  }

  // Membaca status tema dari memori lokal HP saat provider diinisialisasi
  Future<void> _loadThemeFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final themeString = prefs.getString(_themeKey);

    if (themeString == 'light') {
      state = ThemeMode.light;
    } else if (themeString == 'dark') {
      state = ThemeMode.dark;
    }
  }

  // Mengubah tema sekaligus menyimpannya secara permanen ke SharedPreferences
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

  // Mengatur mode tema secara spesifik
  Future<void> setThemeMode(ThemeMode mode) async {
    final prefs = await SharedPreferences.getInstance();
    state = mode;
    await prefs.setString(
      _themeKey,
      mode == ThemeMode.light ? 'light' : 'dark',
    );
  }
}

final themeProvider = StateNotifierProvider<ThemeNotifier, ThemeMode>((ref) {
  return ThemeNotifier();
});