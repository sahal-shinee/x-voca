import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  // Dark Mode Colors (Bawaan)
  static const Color bgBase        = Color(0xFF0D0B1A); // Background utama
  static const Color bgSurface     = Color(0xFF1A1730); // Card & container
  static const Color bgInput       = Color(0xFF252240); // Input field & badge
  static const Color bgNav         = Color(0xFF130F2A); // Bottom navigation
  static const Color accentCyan    = Color(0xFF2DFFC2); // Aksen utama, CTA, toggle
  static const Color accentPurple  = Color(0xFF9B6DFF); // Gradient, aksen kedua
  static const Color accentGold    = Color(0xFFFFD700); // Gold, status playing
  static const Color accentRed     = Color(0xFFFF4444); // Merah, LIVE, hapus, error
  static const Color textPrimary   = Color(0xFFEEEAFF); // Teks utama
  static const Color textSecondary = Color(0xFF9B97C0); // Sub-teks, label
  static const Color textMuted     = Color(0xFF5C587A); // Teks redup, tab non-aktif
  static const Color borderSubtle  = Color(0xFF2A2550); // Border card & divider

  // Light Mode Colors (Disesuaikan dengan tema cyberpunk/futuristik versi terang)
  static const Color bgBaseLight        = Color(0xFFF4F3FA); // Background utama terang
  static const Color bgSurfaceLight     = Color(0xFFFFFFFF); // Card & container putih
  static const Color bgInputLight       = Color(0xFFEBE8F5); // Input field terang
  static const Color bgNavLight         = Color(0xFFFFFFFF); // Bottom navigation terang
  static const Color textPrimaryLight   = Color(0xFF1A153A); // Teks utama terang
  static const Color textSecondaryLight = Color(0xFF5A557A); // Sub-teks terang
  static const Color textMutedLight     = Color(0xFF9B97C0); // Teks redup terang
  static const Color borderSubtleLight  = Color(0xFFDDD9EE); // Border terang
}

class AppTheme {
  // Dark Theme
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.bgBase,
      colorScheme: const ColorScheme.dark(
        surface: AppColors.bgSurface,
        primary: AppColors.accentCyan,
        secondary: AppColors.accentPurple,
        error: AppColors.accentRed,
      ),
      textTheme: GoogleFonts.spaceGroteskTextTheme().apply(
        bodyColor: AppColors.textPrimary,
        displayColor: AppColors.textPrimary,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.bgNav,
        selectedItemColor: AppColors.accentCyan,
        unselectedItemColor: AppColors.textMuted,
        type: BottomNavigationBarType.fixed,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.bgNav,
        elevation: 0,
        iconTheme: IconThemeData(color: AppColors.textPrimary),
      ),
    );
  }

  // Light Theme
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.bgBaseLight,
      colorScheme: const ColorScheme.light(
        surface: AppColors.bgSurfaceLight,
        primary: AppColors.accentPurple,
        secondary: AppColors.accentCyan,
        error: AppColors.accentRed,
      ),
      textTheme: GoogleFonts.spaceGroteskTextTheme().apply(
        bodyColor: AppColors.textPrimaryLight,
        displayColor: AppColors.textPrimaryLight,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.bgNavLight,
        selectedItemColor: AppColors.accentPurple,
        unselectedItemColor: AppColors.textMutedLight,
        type: BottomNavigationBarType.fixed,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.bgNavLight,
        elevation: 0,
        iconTheme: IconThemeData(color: AppColors.textPrimaryLight),
      ),
    );
  }
}