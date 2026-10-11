import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../../core/theme/app_theme.dart';
import '../providers/auth_provider.dart';
import '../widgets/countdown_widget.dart';
import '../widgets/stat_card.dart';
import 'schedule_screen.dart';
import 'votes_screen.dart';
import 'todo_screen.dart';
import 'settings_screen.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  int _currentIndex = 0;
  bool _isBroadcasting = false;

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.value;

    return Scaffold(
      backgroundColor: AppColors.bgBase,
      appBar: AppBar(
        backgroundColor: AppColors.bgNav,
        elevation: 0,
        title: Row(
          children: [
            CircleAvatar(
              radius: 16,
              backgroundColor: AppColors.accentPurple,
              child: Text(
                user?.name.isNotEmpty == true ? user!.name[0] : 'X',
                style: GoogleFonts.spaceGrotesk(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user?.name ?? 'Xion Regalia',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                Text(
                  user?.rigName ?? 'Rig-01 Primis',
                  style: GoogleFonts.spaceMono(
                    fontSize: 10,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.bell, color: AppColors.textSecondary, size: 20),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(LucideIcons.log_out, color: AppColors.accentRed, size: 20),
            onPressed: () => ref.read(authProvider.notifier).logout(),
          ),
        ],
      ),
      body: IndexedStack(
      index: _currentIndex,
      children: [
        _buildDashboardBody(),
        const ScheduleScreen(),
        const VotesScreen(),
        const TodoScreen(),
        const SettingsScreen(), // <-- Ganti baris ini
      ],
    ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        type: BottomNavigationBarType.fixed,
        backgroundColor: AppColors.bgNav,
        selectedItemColor: AppColors.accentCyan,
        unselectedItemColor: AppColors.textMuted,
        selectedLabelStyle: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.bold),
        unselectedLabelStyle: GoogleFonts.spaceGrotesk(fontSize: 10),
        items: const [
          BottomNavigationBarItem(icon: Icon(LucideIcons.layout_dashboard), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Icon(LucideIcons.calendar), label: 'Schedule'),
          BottomNavigationBarItem(icon: Icon(LucideIcons.vote), label: 'Votes'),
          BottomNavigationBarItem(icon: Icon(LucideIcons.square_check), label: 'To-Do'),
          BottomNavigationBarItem(icon: Icon(LucideIcons.settings), label: 'Settings'),
        ],
      ),
    );
  }

  Widget _buildDashboardBody() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Toggle Broadcasting
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.bgSurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.borderSubtle),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      LucideIcons.radio,
                      color: _isBroadcasting ? AppColors.accentRed : AppColors.textMuted,
                      size: 20,
                    ),
                    const SizedBox(width: 10),
                    Text(
                      _isBroadcasting ? 'BROADCASTING LIVE' : 'BROADCAST OFF',
                      style: GoogleFonts.spaceMono(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: _isBroadcasting ? AppColors.accentRed : AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
                Switch(
                  value: _isBroadcasting,
                  activeColor: AppColors.accentRed,
                  onChanged: (val) => setState(() => _isBroadcasting = val),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Countdown Widget
          CountdownWidget(
            targetDate: DateTime.now().add(const Duration(hours: 4, minutes: 12, seconds: 30)),
            streamTitle: 'Cyberpunk 2077 Night Stream',
          ),
          const SizedBox(height: 16),

          // Stat Cards Grid 2x2
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.3,
            children: const [
              StatCard(
                title: 'TOTAL VOTES',
                value: '1,420',
                icon: LucideIcons.vote,
                iconColor: AppColors.accentCyan,
                badgeText: '+12%',
              ),
              StatCard(
                title: 'TOP GAME',
                value: 'GTA V',
                icon: LucideIcons.gamepad_2,
                iconColor: AppColors.accentGold,
                badgeText: '#1 RANK',
              ),
              StatCard(
                title: 'REQUESTS',
                value: '5 Pending',
                icon: LucideIcons.inbox,
                iconColor: AppColors.accentPurple,
              ),
              StatCard(
                title: 'TASKS',
                value: '3 Urgent',
                icon: LucideIcons.list_todo,
                iconColor: AppColors.accentRed,
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Internal Tasks Section
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.bgSurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.borderSubtle),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'INTERNAL TASKS',
                      style: GoogleFonts.spaceMono(
                        fontSize: 11,
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const Icon(LucideIcons.chevron_right, color: AppColors.textMuted, size: 18),
                  ],
                ),
                const SizedBox(height: 12),
                _buildTaskTile('Check OBS Audio Filters', 'Virtual DSP gain compensation (-3.2dB)', true),
                const Divider(color: AppColors.borderSubtle, height: 16),
                _buildTaskTile('Render YouTube Shorts', 'Clip 1080x1920 60FPS high-moments', false),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTaskTile(String title, String subtitle, bool isUrgent) {
    return Row(
      children: [
        Icon(
          isUrgent ? LucideIcons.circle_alert : LucideIcons.clock,
          color: isUrgent ? AppColors.accentRed : AppColors.accentGold,
          size: 18,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              Text(
                subtitle,
                style: GoogleFonts.spaceMono(
                  fontSize: 10,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}