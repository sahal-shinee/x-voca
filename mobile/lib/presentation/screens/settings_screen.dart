import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/config/env.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/user_model.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _notificationsEnabled = true;

  // Floating SnackBar / Toast Helper yang modern, rounded, dan melayang di atas navigasi
  void _showFloatingToast({
    required String message,
    required bool isSuccess,
    IconData? icon,
  }) {
    if (!mounted) return;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;

    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        elevation: 6,
        backgroundColor: bgSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(
            color: isSuccess
                ? AppColors.accentEmerald.withValues(alpha: 0.6)
                : AppColors.accentRed.withValues(alpha: 0.6),
            width: 1.2,
          ),
        ),
        margin: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        duration: const Duration(seconds: 3),
        content: Row(
          children: [
            Icon(
              icon ?? (isSuccess ? LucideIcons.circle_check : LucideIcons.circle_alert),
              color: isSuccess ? AppColors.accentEmerald : AppColors.accentRed,
              size: 18,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: textPrimary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Fungsi pembuka URL eksternal
  Future<void> _openUrl(String urlString) async {
    HapticFeedback.lightImpact();
    final Uri? uri = Uri.tryParse(urlString);
    if (uri == null) {
      _showFloatingToast(message: 'Format tautan tidak valid', isSuccess: false);
      return;
    }

    try {
      if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
        _showFloatingToast(message: 'Tidak dapat membuka tautan: $urlString', isSuccess: false);
      }
    } catch (e) {
      _showFloatingToast(message: 'Gagal membuka tautan: $e', isSuccess: false);
    }
  }

  // Dialog Edit Profil & Rig Name
  void _showEditProfileDialog(BuildContext context, UserModel? user) {
    HapticFeedback.lightImpact();
    final nameCtrl = TextEditingController(text: user?.name ?? 'Xion Regalia');
    final rigCtrl = TextEditingController(text: user?.rigName ?? 'Obsidian Rig #03');
    final versionCtrl = TextEditingController(text: user?.rigVersion ?? 'v3.4');

    showDialog(
      context: context,
      builder: (ctx) {
        final isDark = Theme.of(ctx).brightness == Brightness.dark;
        final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
        final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
        final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
        final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
        final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
        final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

        return AlertDialog(
          backgroundColor: bgSurface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: borderSubtle),
          ),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: (AppColors.primary(isDark)).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  LucideIcons.pencil,
                  color: AppColors.primary(isDark),
                  size: 18,
                ),
              ),
              const SizedBox(width: 10),
              Text(
                'Edit Profil & Rig',
                style: GoogleFonts.spaceGrotesk(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: textPrimary,
                ),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'NAMA CREATOR *',
                  style: GoogleFonts.spaceMono(fontSize: 10, color: textSecondary, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: nameCtrl,
                  style: GoogleFonts.spaceGrotesk(color: textPrimary, fontSize: 13),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: bgInput,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: borderSubtle)),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: borderSubtle)),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: AppColors.primary(isDark), width: 1.2),
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  'RIG MODEL NAME *',
                  style: GoogleFonts.spaceMono(fontSize: 10, color: textSecondary, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: rigCtrl,
                  style: GoogleFonts.spaceGrotesk(color: textPrimary, fontSize: 13),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: bgInput,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: borderSubtle)),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: borderSubtle)),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: AppColors.primary(isDark), width: 1.2),
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  'RIG VERSION',
                  style: GoogleFonts.spaceMono(fontSize: 10, color: textSecondary, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: versionCtrl,
                  style: GoogleFonts.spaceGrotesk(color: textPrimary, fontSize: 13),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: bgInput,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: borderSubtle)),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: borderSubtle)),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: AppColors.primary(isDark), width: 1.2),
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                HapticFeedback.selectionClick();
                Navigator.pop(ctx);
              },
              child: Text('Batal', style: GoogleFonts.spaceMono(color: textMuted)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary(isDark),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              ),
              onPressed: () async {
                final newName = nameCtrl.text.trim();
                final newRig = rigCtrl.text.trim();
                final newVer = versionCtrl.text.trim();

                if (newName.isNotEmpty && newRig.isNotEmpty) {
                  HapticFeedback.selectionClick();
                  Navigator.pop(ctx);
                  await ref.read(authProvider.notifier).updateProfile(
                    name: newName,
                    rigName: newRig,
                    rigVersion: newVer,
                  );
                  _showFloatingToast(message: 'Profil & Rig berhasil diperbarui!', isSuccess: true);
                } else {
                  _showFloatingToast(message: 'Nama dan model rig wajib diisi!', isSuccess: false);
                }
              },
              child: Text(
                'Simpan',
                style: GoogleFonts.spaceMono(
                  color: isDark ? Colors.black : Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.value;

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgBase = isDark ? AppColors.bgBase : AppColors.bgBaseLight;
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final bgNav = isDark ? AppColors.bgNav : AppColors.bgNavLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    final userName = user?.name.isNotEmpty == true ? user!.name : 'Xion Regalia';
    final userEmail = user?.email.isNotEmpty == true ? user!.email : 'xionregalia@gmail.com';
    final userRole = (user?.role ?? 'creator').toUpperCase();
    final rigName = user?.rigName?.isNotEmpty == true ? user!.rigName! : 'Obsidian Rig #03';
    final rigVersion = user?.rigVersion?.isNotEmpty == true ? '(${user!.rigVersion})' : '(v3.4)';
    final rigFullInfo = '$rigName $rigVersion';

    return Scaffold(
      backgroundColor: bgBase,
      appBar: AppBar(
        backgroundColor: bgNav,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: borderSubtle, height: 1),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'OBSIDIAN RIG CONTROL',
              style: GoogleFonts.spaceMono(
                fontSize: 9,
                fontWeight: FontWeight.bold,
                color: AppColors.primary(isDark),
                letterSpacing: 1.2,
              ),
            ),
            Text(
              'Pengaturan & Konfigurasi',
              style: GoogleFonts.spaceGrotesk(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: textPrimary,
              ),
            ),
          ],
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        children: [
          // 1. KARTU PROFIL UTAMA CREATOR (Aksen Glowing Halus & Tap to Copy)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: bgSurface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: borderSubtle),
              boxShadow: [
                BoxShadow(
                  color: AppColors.accentPurple.withValues(alpha: isDark ? 0.12 : 0.05),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                // Avatar Inisial Bergradasi dengan Soft Glow
                Container(
                  width: 54,
                  height: 54,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: const LinearGradient(
                      colors: [AppColors.accentPurple, AppColors.accentCyan],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.accentPurple.withValues(alpha: 0.35),
                        blurRadius: 12,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    userName.isNotEmpty ? userName[0].toUpperCase() : 'X',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(width: 14),

                // Info Detail Profil
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              userName,
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: textPrimary,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: (AppColors.primary(isDark)).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(
                                color: (AppColors.primary(isDark)).withValues(alpha: 0.3),
                              ),
                            ),
                            child: Text(
                              '$userRole ACCESS',
                              style: GoogleFonts.spaceMono(
                                fontSize: 8.5,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary(isDark),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 3),

                      // Email (Tap to Copy)
                      InkWell(
                        onTap: () {
                          HapticFeedback.lightImpact();
                          Clipboard.setData(ClipboardData(text: userEmail));
                          _showFloatingToast(message: 'Email disalin ke clipboard!', isSuccess: true, icon: LucideIcons.copy);
                        },
                        borderRadius: BorderRadius.circular(4),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              userEmail,
                              style: GoogleFonts.spaceMono(
                                fontSize: 11,
                                color: textMuted,
                              ),
                            ),
                            const SizedBox(width: 4),
                            Icon(LucideIcons.copy, size: 10, color: textMuted),
                          ],
                        ),
                      ),
                      const SizedBox(height: 5),

                      // Rig ID & Versi (Tap to Copy)
                      InkWell(
                        onTap: () {
                          HapticFeedback.lightImpact();
                          Clipboard.setData(ClipboardData(text: rigFullInfo));
                          _showFloatingToast(message: 'Rig ID disalin ke clipboard!', isSuccess: true, icon: LucideIcons.copy);
                        },
                        borderRadius: BorderRadius.circular(4),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                color: AppColors.accentEmerald,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              rigFullInfo,
                              style: GoogleFonts.spaceMono(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: textSecondary,
                              ),
                            ),
                            const SizedBox(width: 4),
                            Icon(LucideIcons.copy, size: 10, color: textSecondary),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // Touch Target 44x44 dp: Tombol Edit Profil
                SizedBox(
                  width: 44,
                  height: 44,
                  child: IconButton(
                    icon: Icon(
                      LucideIcons.pencil,
                      color: AppColors.primary(isDark),
                      size: 18,
                    ),
                    tooltip: 'Edit Profil & Rig',
                    onPressed: () => _showEditProfileDialog(context, user),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // 2. PREFERENSI TAMPILAN
          _buildSectionHeader('PREFERENSI TAMPILAN', isDark),
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(
              color: bgSurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: borderSubtle),
            ),
            child: Column(
              children: [
                SwitchListTile(
                  secondary: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: (isDark ? AppColors.accentPurple : AppColors.accentGold).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      isDark ? LucideIcons.moon : LucideIcons.sun,
                      color: isDark ? AppColors.accentPurple : AppColors.accentGold,
                      size: 18,
                    ),
                  ),
                  title: Text(
                    isDark ? 'Mode Gelap (Obsidian Dark)' : 'Mode Terang (Clean Light)',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: textPrimary,
                    ),
                  ),
                  subtitle: Text(
                    isDark ? 'Tema gelap neon khas kreator aktif' : 'Tema terang berlatar bersih aktif',
                    style: GoogleFonts.spaceMono(
                      fontSize: 10,
                      color: textSecondary,
                    ),
                  ),
                  value: isDark,
                  activeThumbColor: AppColors.primary(isDark),
                  onChanged: (_) {
                    HapticFeedback.selectionClick();
                    ref.read(themeProvider.notifier).toggleTheme();
                  },
                ),
                Divider(color: borderSubtle, height: 1),
                SwitchListTile(
                  secondary: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.accentPurple.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(LucideIcons.bell, color: AppColors.accentPurple, size: 18),
                  ),
                  title: Text(
                    'Push Notifications',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: textPrimary,
                    ),
                  ),
                  subtitle: Text(
                    'Peringatan jadwal siaran, live stream, dan to-do',
                    style: GoogleFonts.spaceMono(
                      fontSize: 10,
                      color: textSecondary,
                    ),
                  ),
                  value: _notificationsEnabled,
                  activeThumbColor: AppColors.primary(isDark),
                  onChanged: (val) {
                    HapticFeedback.selectionClick();
                    setState(() => _notificationsEnabled = val);
                    _showFloatingToast(
                      message: val ? 'Notifikasi push diaktifkan' : 'Notifikasi push dinonaktifkan',
                      isSuccess: true,
                      icon: val ? LucideIcons.bell : LucideIcons.bell_off,
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // 3. SISTEM & KONEKSI BACKEND
          _buildSectionHeader('SISTEM & KONEKSI BACKEND', isDark),
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(
              color: bgSurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: borderSubtle),
            ),
            child: Column(
              children: [
                // Status Server Railway / Local Backend
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.accentEmerald.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(LucideIcons.server, color: AppColors.accentEmerald, size: 18),
                  ),
                  title: Text(
                    'Status API & Database',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: textPrimary,
                    ),
                  ),
                  subtitle: Text(
                    Env.useProduction ? 'Railway Cloud API • Active' : 'Local ADB Reverse • Active',
                    style: GoogleFonts.spaceMono(
                      fontSize: 10,
                      color: textSecondary,
                    ),
                  ),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.accentEmerald.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: AppColors.accentEmerald.withValues(alpha: 0.4)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                            color: AppColors.accentEmerald,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 5),
                        Text(
                          'CONNECTED',
                          style: GoogleFonts.spaceMono(
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            color: AppColors.accentEmerald,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Divider(color: borderSubtle, height: 1),

                // Base URL Endpoint (Tap to Copy)
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.secondary(isDark).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(LucideIcons.network, color: AppColors.secondary(isDark), size: 18),
                  ),
                  title: Text(
                    'Base URL Endpoint',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: textPrimary,
                    ),
                  ),
                  subtitle: Text(
                    Env.apiBaseUrl,
                    style: GoogleFonts.spaceMono(
                      fontSize: 10,
                      color: textMuted,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  trailing: SizedBox(
                    width: 44,
                    height: 44,
                    child: IconButton(
                      tooltip: 'Salin Base URL',
                      icon: Icon(LucideIcons.copy, color: AppColors.secondary(isDark), size: 16),
                      onPressed: () {
                        HapticFeedback.lightImpact();
                        Clipboard.setData(ClipboardData(text: Env.apiBaseUrl));
                        _showFloatingToast(message: 'Base URL disalin ke clipboard!', isSuccess: true, icon: LucideIcons.copy);
                      },
                    ),
                  ),
                ),
                Divider(color: borderSubtle, height: 1),

                // Bersihkan Cache Lokal
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.accentGold.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(LucideIcons.trash, color: AppColors.accentGold, size: 18),
                  ),
                  title: Text(
                    'Bersihkan Cache Lokal',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: textPrimary,
                    ),
                  ),
                  subtitle: Text(
                    'Kosongkan cache memori gambar dan data sementara',
                    style: GoogleFonts.spaceMono(
                      fontSize: 10,
                      color: textSecondary,
                    ),
                  ),
                  trailing: Icon(LucideIcons.chevron_right, size: 16, color: textMuted),
                  onTap: () {
                    HapticFeedback.lightImpact();
                    PaintingBinding.instance.imageCache.clear();
                    PaintingBinding.instance.imageCache.clearLiveImages();
                    _showFloatingToast(message: 'Cache memori lokal berhasil dibersihkan!', isSuccess: true, icon: LucideIcons.check_check);
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // 4. PUSAT DOKUMENTASI & PORTAL
          _buildSectionHeader('PUSAT DOKUMENTASI & PORTAL', isDark),
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(
              color: bgSurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: borderSubtle),
            ),
            child: Column(
              children: [
                // 1. YouTube Channel
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.accentRed.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.ondemand_video, color: AppColors.accentRed, size: 18),
                  ),
                  title: Text(
                    'YouTube Channel',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: textPrimary,
                    ),
                  ),
                  subtitle: Text(
                    '@xionregalia (Official Live & VOD)',
                    style: GoogleFonts.spaceMono(
                      fontSize: 10,
                      color: textSecondary,
                    ),
                  ),
                  trailing: Icon(LucideIcons.external_link, color: AppColors.primary(isDark), size: 16),
                  onTap: () => _openUrl('https://www.youtube.com/@xionregalia'),
                ),
                Divider(color: borderSubtle, height: 1),

                // 2. Web Fansite X-VOCA
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.accentPurple.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(LucideIcons.globe, color: AppColors.accentPurple, size: 18),
                  ),
                  title: Text(
                    'Web Fansite X-VOCA',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: textPrimary,
                    ),
                  ),
                  subtitle: Text(
                    'Portal publik live voting & agenda stream',
                    style: GoogleFonts.spaceMono(
                      fontSize: 10,
                      color: textSecondary,
                    ),
                  ),
                  trailing: Icon(LucideIcons.external_link, color: AppColors.primary(isDark), size: 16),
                  onTap: () => _openUrl('https://x-voca.vercel.app'),
                ),
                Divider(color: borderSubtle, height: 1),

                // 3. YouTube Studio Live Control Room
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.accentGold.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(LucideIcons.video, color: AppColors.accentGold, size: 18),
                  ),
                  title: Text(
                    'Live Control Room',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: textPrimary,
                    ),
                  ),
                  subtitle: Text(
                    'YouTube Studio streaming dashboard & analitik',
                    style: GoogleFonts.spaceMono(
                      fontSize: 10,
                      color: textSecondary,
                    ),
                  ),
                  trailing: Icon(LucideIcons.external_link, color: AppColors.primary(isDark), size: 16),
                  onTap: () => _openUrl('https://studio.youtube.com'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // 5. TENTANG APLIKASI
          _buildSectionHeader('TENTANG APLIKASI', isDark),
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(
              color: bgSurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: borderSubtle),
            ),
            child: Column(
              children: [
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: (AppColors.primary(isDark)).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(LucideIcons.info, color: AppColors.primary(isDark), size: 18),
                  ),
                  title: Text(
                    'X-VOCA Creator Hub',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: textPrimary,
                    ),
                  ),
                  subtitle: Text(
                    'v1.0.0 Stable Build • Production Ready',
                    style: GoogleFonts.spaceMono(
                      fontSize: 10,
                      color: textSecondary,
                    ),
                  ),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: bgInput,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'RELEASE',
                      style: GoogleFonts.spaceMono(
                        fontSize: 8.5,
                        fontWeight: FontWeight.bold,
                        color: textMuted,
                      ),
                    ),
                  ),
                ),
                Divider(color: borderSubtle, height: 1),
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.accentPurple.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(LucideIcons.layers, color: AppColors.accentPurple, size: 18),
                  ),
                  title: Text(
                    'Arsitektur Sistem',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: textPrimary,
                    ),
                  ),
                  subtitle: Text(
                    'Flutter 3.x • Material 3 • Dual-Theme Rig Engine',
                    style: GoogleFonts.spaceMono(
                      fontSize: 10,
                      color: textSecondary,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // 6. LOGOUT & KEAMANAN SESI
          _buildSectionHeader('SESI & KEAMANAN AKUN', isDark),
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(
              color: bgSurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: AppColors.accentRed.withValues(alpha: 0.5),
                width: 1.2,
              ),
            ),
            child: ListTile(
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.accentRed.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(LucideIcons.log_out, color: AppColors.accentRed, size: 18),
              ),
              title: Text(
                'Keluar Akun (Logout)',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppColors.accentRed,
                ),
              ),
              subtitle: Text(
                'Hapus sesi lokal dan kembali ke halaman login',
                style: GoogleFonts.spaceMono(
                  fontSize: 10,
                  color: textMuted,
                ),
              ),
              trailing: const Icon(LucideIcons.chevron_right, size: 18, color: AppColors.accentRed),
              onTap: () => _confirmLogout(context, isDark),
            ),
          ),
          const SizedBox(height: 28),

          // Footer Versi Aplikasi
          Center(
            child: Column(
              children: [
                Text(
                  'X-VOCA CREATOR RIG DASHBOARD',
                  style: GoogleFonts.spaceMono(
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1,
                    color: textMuted,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Crafted with Passion for Obsidian Streamers',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 10,
                    color: textMuted.withValues(alpha: 0.8),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  // Dialog Konfirmasi Logout Modern & Taktil
  Future<void> _confirmLogout(BuildContext context, bool isDark) async {
    HapticFeedback.lightImpact();
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: bgSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: borderSubtle),
        ),
        title: Row(
          children: [
            const Icon(LucideIcons.triangle_alert, color: AppColors.accentRed, size: 20),
            const SizedBox(width: 8),
            Text(
              'Konfirmasi Logout',
              style: GoogleFonts.spaceGrotesk(
                color: textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ],
        ),
        content: Text(
          'Apakah Anda yakin ingin keluar dari sesi kreator X-VOCA? Token autentikasi lokal akan dihapus.',
          style: GoogleFonts.spaceGrotesk(
            color: textSecondary,
            fontSize: 13,
            height: 1.4,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              HapticFeedback.selectionClick();
              Navigator.pop(ctx, false);
            },
            child: Text(
              'Batal',
              style: GoogleFonts.spaceMono(color: textMuted),
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.accentRed,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            ),
            onPressed: () {
              HapticFeedback.selectionClick();
              Navigator.pop(ctx, true);
            },
            child: Text(
              'Ya, Keluar',
              style: GoogleFonts.spaceMono(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      await ref.read(authProvider.notifier).logout();
    }
  }

  Widget _buildSectionHeader(String title, bool isDark) {
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    return Text(
      title,
      style: GoogleFonts.spaceMono(
        fontSize: 10.5,
        fontWeight: FontWeight.bold,
        color: textSecondary,
        letterSpacing: 0.8,
      ),
    );
  }
}
