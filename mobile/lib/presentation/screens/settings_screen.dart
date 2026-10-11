import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
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
    final authState = ref.watch(authProvider);
    final user = authState.value;

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
          // User Profile Card
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
                  radius: 24,
                  backgroundColor: AppColors.accentPurple,
                  child: Text(
                    user?.name.isNotEmpty == true ? user!.name[0] : 'X',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 20,
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
                        user?.name ?? 'Xion Regalia',
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        user?.rigName ?? 'Rig-01 Primis',
                        style: GoogleFonts.spaceMono(
                          fontSize: 11,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.accentCyan.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          'VTUBER CREATOR ADMIN',
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

          // Section 1: System Status
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
                  title: 'API Backend Server',
                  subtitle: 'Railway Live Environment (Node/Express)',
                  statusText: 'ONLINE',
                  statusColor: Colors.greenAccent,
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Section 2: STREAM & RIG INTEGRATION
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

          // Section 3: Account Actions
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
              onTap: () {
                ref.read(authProvider.notifier).logout();
              },
            ),
          ),
          const SizedBox(height: 24),

          // App Version Info
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
          color: statusColor.withOpacity(0.12),
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
      activeColor: AppColors.accentCyan,
      onChanged: onChanged,
    );
  }
}