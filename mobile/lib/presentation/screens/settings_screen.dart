import 'package:flutter/material.dart';
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

  // Fungsi pembuka URL eksternal
  Future<void> _openUrl(String urlString) async {
    final Uri uri = Uri.parse(urlString);
    try {
      if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Tidak dapat membuka: $urlString', style: GoogleFonts.spaceMono()),
              backgroundColor: AppColors.accentRed,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error membuka link: $e', style: GoogleFonts.spaceMono()),
            backgroundColor: AppColors.accentRed,
          ),
        );
      }
    }
  }

  // Dialog Edit Profil & Rig Name
  void _showEditProfileDialog(BuildContext context, UserModel? user, bool isDarkMode) {
    final nameCtrl = TextEditingController(text: user?.name ?? 'Xion Regalia');
    final rigCtrl = TextEditingController(text: user?.rigName ?? 'Obsidian Rig #03');
    final versionCtrl = TextEditingController(text: user?.rigVersion ?? 'v3.4');

    final bgSurface = isDarkMode ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final textPrimary = isDarkMode ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDarkMode ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final borderSubtle = isDarkMode ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: bgSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: borderSubtle),
        ),
        title: Row(
          children: [
            const Icon(LucideIcons.pencil, color: AppColors.accentCyan, size: 20),
            const SizedBox(width: 8),
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
                'NAMA CREATOR',
                style: GoogleFonts.spaceMono(fontSize: 10, color: textSecondary, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: nameCtrl,
                style: GoogleFonts.spaceGrotesk(color: textPrimary, fontSize: 13),
                decoration: InputDecoration(
                  filled: true,
                  fillColor: isDarkMode ? AppColors.bgBase : Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: borderSubtle)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: borderSubtle)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.accentCyan)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
              const SizedBox(height: 14),
              Text(
                'RIG MODEL NAME',
                style: GoogleFonts.spaceMono(fontSize: 10, color: textSecondary, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: rigCtrl,
                style: GoogleFonts.spaceGrotesk(color: textPrimary, fontSize: 13),
                decoration: InputDecoration(
                  filled: true,
                  fillColor: isDarkMode ? AppColors.bgBase : Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: borderSubtle)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: borderSubtle)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.accentCyan)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
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
                  fillColor: isDarkMode ? AppColors.bgBase : Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: borderSubtle)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: borderSubtle)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.accentCyan)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Batal', style: GoogleFonts.spaceMono(color: isDarkMode ? AppColors.textMuted : AppColors.textMutedLight)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.accentCyan,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () async {
              final newName = nameCtrl.text.trim();
              final newRig = rigCtrl.text.trim();
              final newVer = versionCtrl.text.trim();

              if (newName.isNotEmpty && newRig.isNotEmpty) {
                Navigator.pop(ctx);
                await ref.read(authProvider.notifier).updateProfile(
                  name: newName,
                  rigName: newRig,
                  rigVersion: newVer,
                );

                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Profil & Rig berhasil diperbarui!', style: GoogleFonts.spaceMono()),
                      backgroundColor: AppColors.accentCyan,
                    ),
                  );
                }
              }
            },
            child: Text(
              'Simpan',
              style: GoogleFonts.spaceMono(color: Colors.black, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.value;

    final themeMode = ref.watch(themeProvider);
    final isDarkMode = themeMode == ThemeMode.dark;

    final userName = user?.name.isNotEmpty == true ? user!.name : 'Xion Regalia';
    final userEmail = user?.email.isNotEmpty == true ? user!.email : 'xionregalia@gmail.com';
    final userRole = (user?.role ?? 'creator').toUpperCase();
    final rigInfo = user?.rigName != null && user!.rigName!.isNotEmpty
        ? '${user.rigName} ${user.rigVersion != null ? "(${user.rigVersion})" : ""}'
        : 'Obsidian Rig #03 (v3.4)';

    final bgSurface = isDarkMode ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final borderSubtle = isDarkMode ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    return Scaffold(
      backgroundColor: isDarkMode ? AppColors.bgBase : AppColors.bgBaseLight,
      appBar: AppBar(
        backgroundColor: isDarkMode ? AppColors.bgNav : AppColors.bgNavLight,
        elevation: 0,
        title: Text(
          'SETTINGS & CONFIG',
          style: GoogleFonts.spaceGrotesk(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: isDarkMode ? AppColors.textPrimary : AppColors.textPrimaryLight,
            letterSpacing: 1,
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Profil Creator & Rig Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: bgSurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: borderSubtle),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 26,
                  backgroundColor: AppColors.accentPurple,
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
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        userName,
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: isDarkMode ? AppColors.textPrimary : AppColors.textPrimaryLight,
                        ),
                      ),
                      Text(
                        userEmail,
                        style: GoogleFonts.spaceMono(
                          fontSize: 11,
                          color: isDarkMode ? AppColors.textMuted : AppColors.textMutedLight,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        rigInfo,
                        style: GoogleFonts.spaceMono(
                          fontSize: 10,
                          color: isDarkMode ? AppColors.textSecondary : AppColors.textSecondaryLight,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.accentCyan.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '$userRole ACCESS',
                          style: GoogleFonts.spaceMono(
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            color: AppColors.accentCyan,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(LucideIcons.pencil, color: AppColors.accentCyan, size: 20),
                  tooltip: 'Edit Profil & Rig',
                  onPressed: () => _showEditProfileDialog(context, user, isDarkMode),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Tautan Cepat / Quick Links
          _buildSectionHeader('TAUTAN CEPAT / QUICK LINKS', isDarkMode),
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(
              color: bgSurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: borderSubtle),
            ),
            child: Column(
              children: [
                // 1. YouTube Channel (Aktif)
                ListTile(
                  leading: const Icon(Icons.ondemand_video, color: AppColors.accentRed, size: 22),
                  title: Text(
                    'YouTube Channel',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: isDarkMode ? AppColors.textPrimary : AppColors.textPrimaryLight,
                    ),
                  ),
                  subtitle: Text(
                    '@xionregalia (Official Stream Channel)',
                    style: GoogleFonts.spaceMono(
                      fontSize: 10,
                      color: isDarkMode ? AppColors.textSecondary : AppColors.textSecondaryLight,
                    ),
                  ),
                  trailing: const Icon(LucideIcons.external_link, color: AppColors.accentCyan, size: 18),
                  onTap: () => _openUrl('https://www.youtube.com/@xionregalia'),
                ),
                Divider(color: borderSubtle, height: 1),

                // 2. Web Fansite X-VOCA (Slot Placeholder)
                ListTile(
                  leading: const Icon(LucideIcons.globe, color: AppColors.accentPurple, size: 22),
                  title: Text(
                    'Web Fansite X-VOCA',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: isDarkMode ? AppColors.textPrimary : AppColors.textPrimaryLight,
                    ),
                  ),
                  subtitle: Text(
                    'Portal publik live voting & jadwal stream',
                    style: GoogleFonts.spaceMono(
                      fontSize: 10,
                      color: isDarkMode ? AppColors.textSecondary : AppColors.textSecondaryLight,
                    ),
                  ),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                    decoration: BoxDecoration(
                      color: (isDarkMode ? Colors.white : Colors.black).withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'SEGERA HADIR',
                      style: GoogleFonts.spaceMono(
                        fontSize: 8,
                        fontWeight: FontWeight.bold,
                        color: isDarkMode ? AppColors.textMuted : AppColors.textMutedLight,
                      ),
                    ),
                  ),
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Portal fansite publik sedang disiapkan Sahal!', style: GoogleFonts.spaceMono()),
                        backgroundColor: AppColors.accentPurple,
                      ),
                    );
                  },
                ),
                Divider(color: borderSubtle, height: 1),

                // 3. YouTube Studio (Slot Placeholder)
                ListTile(
                  leading: const Icon(LucideIcons.video, color: AppColors.accentGold, size: 22),
                  title: Text(
                    'YouTube Studio Live',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: isDarkMode ? AppColors.textPrimary : AppColors.textPrimaryLight,
                    ),
                  ),
                  subtitle: Text(
                    'Manajemen analitik & live control room',
                    style: GoogleFonts.spaceMono(
                      fontSize: 10,
                      color: isDarkMode ? AppColors.textSecondary : AppColors.textSecondaryLight,
                    ),
                  ),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                    decoration: BoxDecoration(
                      color: (isDarkMode ? Colors.white : Colors.black).withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'SEGERA HADIR',
                      style: GoogleFonts.spaceMono(
                        fontSize: 8,
                        fontWeight: FontWeight.bold,
                        color: isDarkMode ? AppColors.textMuted : AppColors.textMutedLight,
                      ),
                    ),
                  ),
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Tautan YouTube Studio akan diaktifkan setelah integrasi API selesai!', style: GoogleFonts.spaceMono()),
                        backgroundColor: AppColors.accentGold,
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Tampilan & Tema
          _buildSectionHeader('APPEARANCE & THEME', isDarkMode),
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(
              color: bgSurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: borderSubtle),
            ),
            child: SwitchListTile(
              secondary: Icon(
                isDarkMode ? LucideIcons.moon : LucideIcons.sun,
                color: isDarkMode ? AppColors.accentCyan : AppColors.accentGold,
                size: 20,
              ),
              title: Text(
                'Dark Mode',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: isDarkMode ? AppColors.textPrimary : AppColors.textPrimaryLight,
                ),
              ),
              subtitle: Text(
                isDarkMode ? 'Tema gelap aktif' : 'Tema terang aktif',
                style: GoogleFonts.spaceMono(
                  fontSize: 10,
                  color: isDarkMode ? AppColors.textSecondary : AppColors.textSecondaryLight,
                ),
              ),
              value: isDarkMode,
              activeThumbColor: AppColors.accentCyan,
              onChanged: (_) {
                ref.read(themeProvider.notifier).toggleTheme();
              },
            ),
          ),
          const SizedBox(height: 20),

          // Koneksi Backend & Server
          _buildSectionHeader('SERVER & CONNECTION', isDarkMode),
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(
              color: bgSurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: borderSubtle),
            ),
            child: Column(
              children: [
                _buildStatusTile(
                  icon: LucideIcons.server,
                  title: 'API Backend Base URL',
                  subtitle: Env.apiBaseUrl,
                  statusText: 'ACTIVE',
                  statusColor: Colors.greenAccent,
                  isDarkMode: isDarkMode,
                ),
                Divider(color: borderSubtle, height: 1),
                SwitchListTile(
                  secondary: const Icon(LucideIcons.bell, color: AppColors.accentPurple, size: 20),
                  title: Text(
                    'Push Notifications',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: isDarkMode ? AppColors.textPrimary : AppColors.textPrimaryLight,
                    ),
                  ),
                  subtitle: Text(
                    'Pemberitahuan jadwal stream dan voting',
                    style: GoogleFonts.spaceMono(
                      fontSize: 10,
                      color: isDarkMode ? AppColors.textSecondary : AppColors.textSecondaryLight,
                    ),
                  ),
                  value: _notificationsEnabled,
                  activeThumbColor: AppColors.accentCyan,
                  onChanged: (val) => setState(() => _notificationsEnabled = val),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Akun & Sesi
          _buildSectionHeader('ACCOUNT & SESSION', isDarkMode),
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(
              color: bgSurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: borderSubtle),
            ),
            child: ListTile(
              leading: const Icon(LucideIcons.log_out, color: AppColors.accentRed),
              title: Text(
                'Keluar / Logout',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppColors.accentRed,
                ),
              ),
              subtitle: Text(
                'Hapus token sesi dan kembali ke halaman login',
                style: GoogleFonts.spaceMono(
                  fontSize: 10,
                  color: isDarkMode ? AppColors.textMuted : AppColors.textMutedLight,
                ),
              ),
              onTap: () => _confirmLogout(context, isDarkMode),
            ),
          ),
          const SizedBox(height: 24),

          // Versi Aplikasi
          Center(
            child: Text(
              'X-VOCA Creator Hub v1.0.0',
              style: GoogleFonts.spaceMono(
                fontSize: 10,
                color: isDarkMode ? AppColors.textMuted : AppColors.textMutedLight,
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Future<void> _confirmLogout(BuildContext context, bool isDarkMode) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: isDarkMode ? AppColors.bgSurface : AppColors.bgSurfaceLight,
        title: Text(
          'Konfirmasi Logout',
          style: TextStyle(
            color: isDarkMode ? AppColors.textPrimary : AppColors.textPrimaryLight,
          ),
        ),
        content: Text(
          'Apakah kamu yakin ingin keluar dari akun ini?',
          style: TextStyle(
            color: isDarkMode ? AppColors.textSecondary : AppColors.textSecondaryLight,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(
              'Batal',
              style: TextStyle(
                color: isDarkMode ? AppColors.textMuted : AppColors.textMutedLight,
              ),
            ),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text(
              'Logout',
              style: TextStyle(color: AppColors.accentRed),
            ),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      await ref.read(authProvider.notifier).logout();
    }
  }

  Widget _buildSectionHeader(String title, bool isDarkMode) {
    return Text(
      title,
      style: GoogleFonts.spaceMono(
        fontSize: 11,
        fontWeight: FontWeight.bold,
        color: isDarkMode ? AppColors.textSecondary : AppColors.textSecondaryLight,
      ),
    );
  }

  Widget _buildStatusTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required String statusText,
    required Color statusColor,
    required bool isDarkMode,
  }) {
    return ListTile(
      leading: Icon(icon, color: AppColors.accentCyan, size: 20),
      title: Text(
        title,
        style: GoogleFonts.spaceGrotesk(
          fontSize: 13,
          fontWeight: FontWeight.bold,
          color: isDarkMode ? AppColors.textPrimary : AppColors.textPrimaryLight,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: GoogleFonts.spaceMono(
          fontSize: 10,
          color: isDarkMode ? AppColors.textSecondary : AppColors.textSecondaryLight,
        ),
      ),
      trailing: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: statusColor.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          statusText,
          style: GoogleFonts.spaceMono(
            fontSize: 9,
            fontWeight: FontWeight.bold,
            color: statusColor,
          ),
        ),
      ),
    );
  }
}