import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Palet warna dan token desain sistem X-VOCA (selaras dengan Web Portal).
///
/// Menyediakan skema warna untuk Dark Mode (Obsidian RIG) dan Light Mode (Clean Slate),
/// fungsi helper dinamis (`isDark`), gradien, serta konstanta border radius.
class AppColors {
  // =============================================================
  // Palet Dark Mode: Obsidian RIG (Deep Warm Violet/Purple Obsidian)
  // =============================================================
  static const Color bgBase = Color(0xFF0D0B14); // Background dasar (--bg-base)
  static const Color bgSurface = Color(0xFF161423); // Latar surface/kontainer (--bg-surface)
  static const Color bgCard = Color(0xFF1E1B2F); // Kartu konten (--bg-card)
  static const Color bgCardHover = Color(0xFF2D2A42); // Status hover kartu (--bg-card-hover)
  static const Color bgInput = Color(0xFF1E1B2E); // Latar field input (--bg-input)
  static const Color bgNav = Color(0xFF181622); // Navigation bar & App bar (--bg-nav)
  static const Color borderSubtle = Color(0xFF2E2B3D); // Garis pembatas halus (--border-subtle)
  static const Color textPrimary = Color(0xFFF8F9FC); // Teks utama putih cerah (--text-primary)
  static const Color textSecondary = Color(0xFFB8B4C8); // Teks pendukung lavender (--text-secondary)
  static const Color textMuted = Color(0xFF8E8AA0); // Teks redup/placeholder (--text-muted)

  // Warna Aksen Dark Mode
  static const Color accentPurple = Color(0xFFA78BFA); // Ungu dominan brand (--accent-purple)
  static const Color accentCyan = Color(0xFF5EEAD4); // Mint cyan cerah (--accent-cyan)
  static const Color accentGold = Color(0xFFFBBF24); // Kuning amber hangat (--accent-gold)
  static const Color accentRed = Color(0xFFEF4444); // Status live & urgent (--status-live)
  static const Color accentEmerald = Color(0xFF2DD4BF); // Status selesai/sukses (--status-done)

  // =============================================================
  // Palet Light Mode: Clean Futuristic Slate (Tinggi Kontras & WCAG)
  // =============================================================
  static const Color bgBaseLight = Color(0xFFF8FAFC); // Background dasar terang (--bg-base)
  static const Color bgSurfaceLight = Color(0xFFFFFFFF); // Permukaan kartu putih bersih (--bg-surface)
  static const Color bgCardLight = Color(0xFFF1F5F9); // Kontainer kartu lembut (--bg-card)
  static const Color bgInputLight = Color(0xFFFFFFFF); // Field input putih (--bg-input)
  static const Color bgNavLight = Color(0xFFFFFFFF); // Navigation bar terang (--bg-nav)
  static const Color borderSubtleLight = Color(0xFFE2E8F0); // Border slate halus (--border-subtle)
  static const Color textPrimaryLight = Color(0xFF0F172A); // Teks utama slate gelap (--text-primary)
  static const Color textSecondaryLight = Color(0xFF334155); // Teks sekunder slate (--text-secondary)
  static const Color textMutedLight = Color(0xFF64748B); // Teks redup terang (--text-muted)

  // Warna Aksen Light Mode (Kontras Tinggi)
  static const Color accentPurpleLight = Color(0xFF7C3AED); // Ungu royal dominan (--accent-purple)
  static const Color accentCyanLight = Color(0xFF0D9488); // Teal cyan pekat (--accent-cyan)
  static const Color accentGoldLight = Color(0xFFD97706); // Amber pekat (--accent-gold)
  static const Color accentRedLight = Color(0xFFDC2626); // Merah crimson live (--status-live)
  static const Color accentEmeraldLight = Color(0xFF0D9488); // Teal selesai (--status-done)

  // =============================================================
  // Resolver Dinamis (Berdasarkan tema gelap atau terang)
  // =============================================================
  static Color primary(bool isDark) => isDark ? accentPurple : accentPurpleLight;
  static Color secondary(bool isDark) => isDark ? accentCyan : accentCyanLight;
  static Color gold(bool isDark) => isDark ? accentGold : accentGoldLight;
  static Color red(bool isDark) => isDark ? accentRed : accentRedLight;
  static Color emerald(bool isDark) =>
      isDark ? accentEmerald : accentEmeraldLight;

  static Color bg(bool isDark) => isDark ? bgBase : bgBaseLight;
  static Color surface(bool isDark) => isDark ? bgSurface : bgSurfaceLight;
  static Color card(bool isDark) => isDark ? bgCard : bgCardLight;
  static Color input(bool isDark) => isDark ? bgInput : bgInputLight;
  static Color nav(bool isDark) => isDark ? bgNav : bgNavLight;
  static Color border(bool isDark) =>
      isDark ? borderSubtle : borderSubtleLight;

  static Color text(bool isDark) => isDark ? textPrimary : textPrimaryLight;
  static Color textSub(bool isDark) =>
      isDark ? textSecondary : textSecondaryLight;
  static Color textMute(bool isDark) => isDark ? textMuted : textMutedLight;

  // =============================================================
  // Definisi Gradien Warna
  // =============================================================
  /// Gradien Cyan ke Purple untuk tombol Call To Action (CTA).
  static List<Color> gradientCta(bool isDark) => isDark
      ? const [accentCyan, accentPurple]
      : const [accentCyanLight, accentPurpleLight];

  /// Gradien Ungu elegan untuk highlight header dan kartu penting.
  static List<Color> gradientPurple(bool isDark) => isDark
      ? const [Color(0xFF8B5CF6), accentPurple]
      : const [Color(0xFF6D28D9), accentPurpleLight];

  // =============================================================
  // Token Dimensi & Radius
  // =============================================================
  static const double radiusCard = 14.0;
  static const double radiusInput = 10.0;
  static const double radiusBadge = 6.0;
  static const double borderWidth = 1.0;
}

/// Konfigurasi [ThemeData] Flutter untuk tema Gelap (Dark) dan Terang (Light).
class AppTheme {
  /// Definisi tema gelap berbasis palet Obsidian RIG.
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.bgBase,
      colorScheme: const ColorScheme.dark(
        surface: AppColors.bgSurface,
        primary: AppColors.accentPurple,
        secondary: AppColors.accentCyan,
        error: AppColors.accentRed,
      ),
      textTheme: GoogleFonts.spaceGroteskTextTheme().apply(
        bodyColor: AppColors.textPrimary,
        displayColor: AppColors.textPrimary,
      ),
      cardTheme: CardThemeData(
        color: AppColors.bgSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppColors.radiusCard),
          side: const BorderSide(
            color: AppColors.borderSubtle,
            width: AppColors.borderWidth,
          ),
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.bgNav,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        iconTheme: const IconThemeData(color: AppColors.textPrimary),
        titleTextStyle: GoogleFonts.spaceGrotesk(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: AppColors.textPrimary,
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.bgNav,
        selectedItemColor: AppColors.accentPurple,
        unselectedItemColor: AppColors.textMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.borderSubtle,
        thickness: AppColors.borderWidth,
        space: 1.0,
      ),
    );
  }

  /// Definisi tema terang dengan kontras tinggi dan tipografi tajam.
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.bgBaseLight,
      colorScheme: const ColorScheme.light(
        surface: AppColors.bgSurfaceLight,
        primary: AppColors.accentPurpleLight,
        secondary: AppColors.accentCyanLight,
        error: AppColors.accentRedLight,
      ),
      textTheme: GoogleFonts.spaceGroteskTextTheme().apply(
        bodyColor: AppColors.textPrimaryLight,
        displayColor: AppColors.textPrimaryLight,
      ),
      cardTheme: CardThemeData(
        color: AppColors.bgSurfaceLight,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppColors.radiusCard),
          side: const BorderSide(
            color: AppColors.borderSubtleLight,
            width: AppColors.borderWidth,
          ),
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.bgNavLight,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        iconTheme: const IconThemeData(color: AppColors.textPrimaryLight),
        titleTextStyle: GoogleFonts.spaceGrotesk(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: AppColors.textPrimaryLight,
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.bgNavLight,
        selectedItemColor: AppColors.accentPurpleLight,
        unselectedItemColor: AppColors.textMutedLight,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.borderSubtleLight,
        thickness: AppColors.borderWidth,
        space: 1.0,
      ),
    );
  }
}
