import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
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
}

class AppTheme {
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
    );
  }
}