import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../../core/config/env.dart';
import '../../core/theme/app_theme.dart';
import '../providers/auth_provider.dart';

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
    // Membaca data pengguna aktif dari authProvider secara dinamis
    final authState = ref.watch(authProvider);
    final user = authState.value;

    final userName = user?.name.isNotEmpty == true ? user!.name : 'Creator Admin';
    final userEmail = user?.email.isNotEmpty == true ? user!.email : 'admin@x-voca.com';
    final userRole = (user?.role ?? 'creator').toUpperCase();
    final rigInfo = user?.rigName != null && user!.rigName!.isNotEmpty
        ? '${user.rigName} ${user.rigVersion != null ? "(${user.rigVersion})" : ""}'
        : 'Rig-01 Primis (v2.4)';

    return Scaffold(
      backgroundColor: AppColors.bgBase,
      appBar: AppBar(
        backgroundColor: AppColors.bgNav,
        elevation: 0,
        title: Text(
          'SETTINGS & CONFIG',
          style: GoogleFonts.spaceGrotesk(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
            letterSpacing: 1,
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // User Profile Card Dinamis dari UserModel
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.bgSurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.borderSubtle),
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
                          color: AppColors.textPrimary,
                        ),
                      ),
                      Text(
                        userEmail,
                        style: GoogleFonts.spaceMono(
                          fontSize: 11,
                          color: AppColors.textMuted,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        rigInfo,
                        style: GoogleFonts.spaceMono(
                          fontSize: 10,
                          color: AppColors.textSecondary,
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

          // Section 1: System & Database Status
          _buildSectionHeader('SYSTEM & DATABASE STATUS'),
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(
              color: AppColors.bgSurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.borderSubtle),
            ),
            child: Column(
              children: [
                _buildStatusTile(
                  icon: LucideIcons.database,
                  title: 'Database Host (Railway MySQL)',
                  subtitle: 'tokaido.proxy.rlwy.net:40526',
                  statusText: 'CONNECTED',
                  statusColor: Colors.greenAccent,
                ),
                const Divider(color: AppColors.borderSubtle, height: 1),
                _buildStatusTile(
                  icon: LucideIcons.server,
                  title: 'API Backend Base URL',
                  subtitle: Env.apiBaseUrl,
                  statusText: 'ONLINE',
                  statusColor: Colors.greenAccent,
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Section 2: Stream & Rig Integration
          _buildSectionHeader('STREAM & RIG INTEGRATION'),
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(
              color: AppColors.bgSurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.borderSubtle),
            ),
            child: Column(
              children: [
                _buildSwitchTile(
                  icon: LucideIcons.radio,
                  title: 'OBS WebSocket Remote',
                  subtitle: 'Auto-sync broadcast state & scene switcher',
                  value: _obsRemoteConnected,
                  onChanged: (val) => setState(() => _obsRemoteConnected = val),
                ),
                const Divider(color: AppColors.borderSubtle, height: 1),
                _buildSwitchTile(
                  icon: LucideIcons.bell,
                  title: 'Push Notifications',
                  subtitle: 'Notifikasi jadwal stream & hasil voting baru',
                  value: _notificationsEnabled,
                  onChanged: (val) => setState(() => _notificationsEnabled = val),
                ),
                const Divider(color: AppColors.borderSubtle, height: 1),
                _buildSwitchTile(
                  icon: LucideIcons.refresh_cw,
                  title: 'Auto-sync Activity Logs',
                  subtitle: 'Kirim riwayat perubahan ke server secara berkala',
                  value: _autoSyncLogs,
                  onChanged: (val) => setState(() => _autoSyncLogs = val),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Section 3: Account & Session
          _buildSectionHeader('ACCOUNT & SESSION'),
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(
              color: AppColors.bgSurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.borderSubtle),
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
                  color: AppColors.textMuted,
                ),
              ),
              onTap: () => _confirmLogout(context),
            ),
          ),
          const SizedBox(height: 24),

          // Info Versi Aplikasi
          Center(
            child: Text(
              'X-Voca VTuber Manager v1.0.4 (Build 2026)',
              style: GoogleFonts.spaceMono(
                fontSize: 10,
                color: AppColors.textMuted,
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  // Dialog Konfirmasi Logout Sederhana
  Future<void> _confirmLogout(BuildContext context) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.bgSurface,
        title: const Text(
          'Konfirmasi Logout',
          style: TextStyle(color: AppColors.textPrimary),
        ),
        content: const Text(
          'Apakah Anda yakin ingin keluar dari akun ini?',
          style: TextStyle(color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Batal', style: TextStyle(color: AppColors.textMuted)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Logout', style: TextStyle(color: AppColors.accentRed)),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      await ref.read(authProvider.notifier).logout();
    }
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: GoogleFonts.spaceMono(
        fontSize: 11,
        fontWeight: FontWeight.bold,
        color: AppColors.textSecondary,
      ),
    );
  }

  Widget _buildStatusTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required String statusText,
    required Color statusColor,
  }) {
    return ListTile(
      leading: Icon(icon, color: AppColors.accentCyan, size: 20),
      title: Text(
        title,
        style: GoogleFonts.spaceGrotesk(
          fontSize: 13,
          fontWeight: FontWeight.bold,
          color: AppColors.textPrimary,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: GoogleFonts.spaceMono(fontSize: 10, color: AppColors.textSecondary),
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
  }) {
    return SwitchListTile(
      secondary: Icon(icon, color: AppColors.accentPurple, size: 20),
      title: Text(
        title,
        style: GoogleFonts.spaceGrotesk(
          fontSize: 13,
          fontWeight: FontWeight.bold,
          color: AppColors.textPrimary,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: GoogleFonts.spaceMono(fontSize: 10, color: AppColors.textSecondary),
      ),
      value: value,
      activeThumbColor: AppColors.accentCyan,
      onChanged: onChanged,
    );
  }
}