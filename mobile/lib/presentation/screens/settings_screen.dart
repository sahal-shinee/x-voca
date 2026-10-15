import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../../core/config/env.dart';
import '../../core/theme/app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _notificationsEnabled = true;
  bool _autoSyncLogs = true;
  bool _obsRemoteConnected = true;

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.value;

    final themeMode = ref.watch(themeProvider);
    final isDarkMode = themeMode == ThemeMode.dark;

    final userName =
        user?.name.isNotEmpty == true ? user!.name : 'Creator Admin';
    final userEmail =
        user?.email.isNotEmpty == true ? user!.email : 'admin@x-voca.com';
    final userRole = (user?.role ?? 'creator').toUpperCase();
    final rigInfo = user?.rigName != null && user!.rigName!.isNotEmpty
        ? '${user.rigName} ${user.rigVersion != null ? "(${user.rigVersion})" : ""}'
        : 'Rig-01 Primis (v2.4)';

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
          // User Profile Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDarkMode ? AppColors.bgSurface : AppColors.bgSurfaceLight,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isDarkMode ? AppColors.borderSubtle : AppColors.borderSubtleLight,
              ),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 26,
                  backgroundColor: AppColors.accentPurple,
                  child: Text(
                    userName[0].toUpperCase(),
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
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Section: Appearance & Theme
          _buildSectionHeader('APPEARANCE & THEME', isDarkMode),
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(
              color: isDarkMode ? AppColors.bgSurface : AppColors.bgSurfaceLight,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isDarkMode ? AppColors.borderSubtle : AppColors.borderSubtleLight,
              ),
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
                isDarkMode ? 'Tampilan tema gelap aktif' : 'Tampilan tema terang aktif',
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

          // Section 1: System & Database Status
          _buildSectionHeader('SYSTEM & DATABASE STATUS', isDarkMode),
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(
              color: isDarkMode ? AppColors.bgSurface : AppColors.bgSurfaceLight,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isDarkMode ? AppColors.borderSubtle : AppColors.borderSubtleLight,
              ),
            ),
            child: Column(
              children: [
                _buildStatusTile(
                  icon: LucideIcons.database,
                  title: 'Database Host (Railway MySQL)',
                  subtitle: 'tokaido.proxy.rlwy.net:40526',
                  statusText: 'CONNECTED',
                  statusColor: Colors.greenAccent,
                  isDarkMode: isDarkMode,
                ),
                Divider(
                  color: isDarkMode ? AppColors.borderSubtle : AppColors.borderSubtleLight,
                  height: 1,
                ),
                _buildStatusTile(
                  icon: LucideIcons.server,
                  title: 'API Backend Base URL',
                  subtitle: Env.apiBaseUrl,
                  statusText: 'ONLINE',
                  statusColor: Colors.greenAccent,
                  isDarkMode: isDarkMode,
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Section 2: Stream & Rig Integration
          _buildSectionHeader('STREAM & RIG INTEGRATION', isDarkMode),
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(
              color: isDarkMode ? AppColors.bgSurface : AppColors.bgSurfaceLight,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isDarkMode ? AppColors.borderSubtle : AppColors.borderSubtleLight,
              ),
            ),
            child: Column(
              children: [
                _buildSwitchTile(
                  icon: LucideIcons.radio,
                  title: 'OBS WebSocket Remote',
                  subtitle: 'Auto-sync broadcast state & scene switcher',
                  value: _obsRemoteConnected,
                  onChanged: (val) => setState(() => _obsRemoteConnected = val),
                  isDarkMode: isDarkMode,
                ),
                Divider(
                  color: isDarkMode ? AppColors.borderSubtle : AppColors.borderSubtleLight,
                  height: 1,
                ),
                _buildSwitchTile(
                  icon: LucideIcons.bell,
                  title: 'Push Notifications',
                  subtitle: 'Notifikasi jadwal stream & hasil voting baru',
                  value: _notificationsEnabled,
                  onChanged: (val) => setState(() => _notificationsEnabled = val),
                  isDarkMode: isDarkMode,
                ),
                Divider(
                  color: isDarkMode ? AppColors.borderSubtle : AppColors.borderSubtleLight,
                  height: 1,
                ),
                _buildSwitchTile(
                  icon: LucideIcons.refresh_cw,
                  title: 'Auto-sync Activity Logs',
                  subtitle: 'Kirim riwayat perubahan ke server secara berkala',
                  value: _autoSyncLogs,
                  onChanged: (val) => setState(() => _autoSyncLogs = val),
                  isDarkMode: isDarkMode,
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Section 3: Account & Session
          _buildSectionHeader('ACCOUNT & SESSION', isDarkMode),
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(
              color: isDarkMode ? AppColors.bgSurface : AppColors.bgSurfaceLight,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isDarkMode ? AppColors.borderSubtle : AppColors.borderSubtleLight,
              ),
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
                'Akhiri sesi aktif pada perangkat ini',
                style: GoogleFonts.spaceMono(
                  fontSize: 10,
                  color: isDarkMode ? AppColors.textMuted : AppColors.textMutedLight,
                ),
              ),
              onTap: () => _confirmLogout(context, isDarkMode),
            ),
          ),
          const SizedBox(height: 24),

          // Info Versi Aplikasi
          Center(
            child: Text(
              'X-Voca VTuber Manager v1.0.4 (Build 2026)',
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

  // Dialog Konfirmasi Logout
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
          'Apakah Anda yakin ingin keluar dari akun ini?',
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

  Widget _buildSwitchTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
    required bool isDarkMode,
  }) {
    return SwitchListTile(
      secondary: Icon(icon, color: AppColors.accentPurple, size: 20),
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
      value: value,
      activeThumbColor: AppColors.accentCyan,
      onChanged: onChanged,
    );
  }
}