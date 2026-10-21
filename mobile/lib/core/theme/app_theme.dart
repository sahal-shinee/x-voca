import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  // ==========================================
  // Obsidian RIG Dark Mode Colors (Web-Aligned)
  // Deep Warm Violet/Purple Obsidian Theme
  // ==========================================
  static const Color bgBase        = Color(0xFF0D0B14); // Deep violet-black base (--bg-base)
  static const Color bgSurface     = Color(0xFF161423); // Dark purple surface (--bg-surface)
  static const Color bgCard        = Color(0xFF1E1B2F); // Rich violet card container (--bg-card)
  static const Color bgCardHover   = Color(0xFF2D2A42); // Elevated card hover (--bg-card-hover)
  static const Color bgInput       = Color(0xFF1E1B2E); // Deep purple input field (--bg-input)
  static const Color bgNav         = Color(0xFF181622); // Dark purple navigation bar (--bg-nav)
  static const Color borderSubtle  = Color(0xFF2E2B3D); // Purple-tinted subtle border (--border-subtle)
  static const Color textPrimary   = Color(0xFFF8F9FC); // Crisp soft white (--text-primary)
  static const Color textSecondary = Color(0xFFB8B4C8); // Soft lilac/lavender secondary (--text-secondary)
  static const Color textMuted     = Color(0xFF8E8AA0); // Muted lavender-slate (--text-muted)

  // Accents in Dark Mode (Soft & Radiant Purple Dominant)
  static const Color accentPurple  = Color(0xFFA78BFA); // DOMINANT brand purple (--accent-purple)
  static const Color accentCyan    = Color(0xFF5EEAD4); // Radiant mint cyan (--accent-cyan)
  static const Color accentGold    = Color(0xFFFBBF24); // Warm amber gold (--accent-gold)
  static const Color accentRed     = Color(0xFFEF4444); // Live broadcast & urgent (--status-live)
  static const Color accentEmerald = Color(0xFF2DD4BF); // Done / success status (--status-done)

  // ==========================================
  // Clean Futuristic Light Mode Colors (Web-Aligned)
  // High Contrast & Legible WCAG Compliant
  // ==========================================
  static const Color bgBaseLight        = Color(0xFFF8FAFC); // Clean slate-white base (--bg-base)
  static const Color bgSurfaceLight     = Color(0xFFFFFFFF); // Card & surface putih (--bg-surface)
  static const Color bgCardLight        = Color(0xFFF1F5F9); // Soft elevated container (--bg-card)
  static const Color bgInputLight       = Color(0xFFFFFFFF); // Input field putih bersih (--bg-input)
  static const Color bgNavLight         = Color(0xFFFFFFFF); // Navigation bar terang (--bg-nav)
  static const Color borderSubtleLight  = Color(0xFFE2E8F0); // Subtle slate border (--border-subtle)
  static const Color textPrimaryLight   = Color(0xFF0F172A); // High contrast dark slate (--text-primary)
  static const Color textSecondaryLight = Color(0xFF334155); // Slate secondary (--text-secondary)
  static const Color textMutedLight     = Color(0xFF64748B); // Slate muted (--text-muted)

  // Accents in Light Mode (Deep & High Contrast on White - Web Aligned)
  static const Color accentPurpleLight  = Color(0xFF7C3AED); // DOMINANT deep royal purple (--accent-purple)
  static const Color accentCyanLight    = Color(0xFF0D9488); // Deep teal cyan (--accent-cyan)
  static const Color accentGoldLight    = Color(0xFFD97706); // Deep amber gold (--accent-gold)
  static const Color accentRedLight     = Color(0xFFDC2626); // Deep crimson red (--status-live)
  static const Color accentEmeraldLight = Color(0xFF0D9488); // Deep teal done (--status-done)

  // ==========================================
  // Dynamic Dual-Theme Resolvers (Web Aligned)
  // ==========================================
  static Color primary(bool isDark) => isDark ? accentPurple : accentPurpleLight;
  static Color secondary(bool isDark) => isDark ? accentCyan : accentCyanLight;
  static Color gold(bool isDark) => isDark ? accentGold : accentGoldLight;
  static Color red(bool isDark) => isDark ? accentRed : accentRedLight;
  static Color emerald(bool isDark) => isDark ? accentEmerald : accentEmeraldLight;

  static Color bg(bool isDark) => isDark ? bgBase : bgBaseLight;
  static Color surface(bool isDark) => isDark ? bgSurface : bgSurfaceLight;
  static Color card(bool isDark) => isDark ? bgCard : bgCardLight;
  static Color input(bool isDark) => isDark ? bgInput : bgInputLight;
  static Color nav(bool isDark) => isDark ? bgNav : bgNavLight;
  static Color border(bool isDark) => isDark ? borderSubtle : borderSubtleLight;

  static Color text(bool isDark) => isDark ? textPrimary : textPrimaryLight;
  static Color textSub(bool isDark) => isDark ? textSecondary : textSecondaryLight;
  static Color textMute(bool isDark) => isDark ? textMuted : textMutedLight;

  // Gradients (Web Aligned)
  static List<Color> gradientCta(bool isDark) => isDark
      ? const [accentCyan, accentPurple]
      : const [accentCyanLight, accentPurpleLight];

  static List<Color> gradientPurple(bool isDark) => isDark
      ? const [Color(0xFF8B5CF6), accentPurple]
      : const [Color(0xFF6D28D9), accentPurpleLight];

  // Design Tokens (Radius & Border)
  static const double radiusCard   = 14.0;
  static const double radiusInput  = 10.0;
  static const double radiusBadge  = 6.0;
  static const double borderWidth  = 1.0;
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
        primary: AppColors.accentPurple, // Dominant Brand Purple in Dark Mode
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
          side: const BorderSide(color: AppColors.borderSubtle, width: AppColors.borderWidth),
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
        selectedItemColor: AppColors.accentPurple, // Dominant Purple Active Item
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

  // Light Theme
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.bgBaseLight,
      colorScheme: const ColorScheme.light(
        surface: AppColors.bgSurfaceLight,
        primary: AppColors.accentPurpleLight, // Dominant Brand Purple in Light Mode (#7C3AED)
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
          side: const BorderSide(color: AppColors.borderSubtleLight, width: AppColors.borderWidth),
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
        selectedItemColor: AppColors.accentPurpleLight, // Dominant Purple Active Item (#7C3AED)
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
