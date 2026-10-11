import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../../core/theme/app_theme.dart';

// Model Data Dummy Jadwal
class StreamSchedule {
  final String id;
  final String title;
  final String gameCategory;
  final DateTime scheduledAt;
  final String platform;
  final String status; // 'live', 'upcoming', 'completed'
  final bool isReminderSet;

  StreamSchedule({
    required this.id,
    required this.title,
    required this.gameCategory,
    required this.scheduledAt,
    required this.platform,
    required this.status,
    this.isReminderSet = false,
  });
}

class ScheduleScreen extends ConsumerStatefulWidget {
  const ScheduleScreen({super.key});

  @override
  ConsumerState<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends ConsumerState<ScheduleScreen> {
  int _selectedFilterIndex = 0; // 0: All, 1: Upcoming, 2: Live, 3: Past
  final List<String> _filters = ['ALL', 'UPCOMING', 'LIVE', 'PAST'];

  // List Data Dummy Jadwal Stream
  final List<StreamSchedule> _schedules = [
    StreamSchedule(
      id: 's1',
      title: 'Cyberpunk 2077 Night Stream: Phantom Liberty DLC',
      gameCategory: 'Cyberpunk 2077',
      scheduledAt: DateTime.now().add(const Duration(hours: 4, minutes: 12)),
      platform: 'YouTube',
      status: 'upcoming',
      isReminderSet: true,
    ),
    StreamSchedule(
      id: 's2',
      title: 'Minecraft Hardcore Day 100 Build Megabase',
      gameCategory: 'Minecraft',
      scheduledAt: DateTime.now().subtract(const Duration(minutes: 30)),
      platform: 'YouTube',
      status: 'live',
    ),
    StreamSchedule(
      id: 's3',
      title: 'Resident Evil 4 Remake Professional S+ Rank',
      gameCategory: 'Resident Evil 4',
      scheduledAt: DateTime.now().add(const Duration(days: 1, hours: 2)),
      platform: 'Twitch',
      status: 'upcoming',
    ),
    StreamSchedule(
      id: 's4',
      title: 'Chilling & Member Q&A Session + Karaoke',
      gameCategory: 'Just Chatting',
      scheduledAt: DateTime.now().add(const Duration(days: 3)),
      platform: 'YouTube',
      status: 'upcoming',
    ),
    StreamSchedule(
      id: 's5',
      title: 'Assassin\'s Creed Origins Main Story Finale',
      gameCategory: 'AC Origins',
      scheduledAt: DateTime.now().subtract(const Duration(days: 2)),
      platform: 'YouTube',
      status: 'completed',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    // Filter Data Berdasarkan Tab yang Dipilih
    final filteredSchedules = _schedules.where((s) {
      if (_selectedFilterIndex == 1) return s.status == 'upcoming';
      if (_selectedFilterIndex == 2) return s.status == 'live';
      if (_selectedFilterIndex == 3) return s.status == 'completed';
      return true; // ALL
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.bgBase,
      appBar: AppBar(
        backgroundColor: AppColors.bgNav,
        elevation: 0,
        title: Text(
          'STREAM SCHEDULES',
          style: GoogleFonts.spaceGrotesk(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
            letterSpacing: 1,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.plus, color: AppColors.accentCyan),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  backgroundColor: AppColors.bgSurface,
                  content: Text(
                    'Tambah Jadwal (Coming Soon)',
                    style: GoogleFonts.spaceGrotesk(color: AppColors.textPrimary),
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: AppColors.bgSurface,
            child: Row(
              children: List.generate(_filters.length, (index) {
                final isSelected = _selectedFilterIndex == index;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: ChoiceChip(
                    label: Text(
                      _filters[index],
                      style: GoogleFonts.spaceMono(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: isSelected ? Colors.black : AppColors.textSecondary,
                      ),
                    ),
                    selected: isSelected,
                    selectedColor: AppColors.accentCyan,
                    backgroundColor: AppColors.bgInput,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                      side: BorderSide(
                        color: isSelected ? AppColors.accentCyan : AppColors.borderSubtle,
                      ),
                    ),
                    onSelected: (_) {
                      setState(() {
                        _selectedFilterIndex = index;
                      });
                    },
                  ),
                );
              }),
            ),
          ),
          const Divider(height: 1, color: AppColors.borderSubtle),

          // Schedule List
          Expanded(
            child: filteredSchedules.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(LucideIcons.calendar_x, color: AppColors.textMuted, size: 48),
                        const SizedBox(height: 12),
                        Text(
                          'Tidak ada jadwal stream',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 14,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filteredSchedules.length,
                    itemBuilder: (context, index) {
                      final item = filteredSchedules[index];
                      return _buildScheduleCard(item);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildScheduleCard(StreamSchedule schedule) {
    Color statusColor;
    String statusLabel;
    IconData statusIcon;

    switch (schedule.status) {
      case 'live':
        statusColor = AppColors.accentRed;
        statusLabel = 'LIVE NOW';
        statusIcon = LucideIcons.radio;
        break;
      case 'completed':
        statusColor = AppColors.textMuted;
        statusLabel = 'COMPLETED';
        statusIcon = LucideIcons.circle_check;
        break;
      default:
        statusColor = AppColors.accentPurple;
        statusLabel = 'UPCOMING';
        statusIcon = LucideIcons.clock;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.bgSurface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: schedule.status == 'live' ? AppColors.accentRed : AppColors.borderSubtle,
          width: schedule.status == 'live' ? 1.5 : 1.0,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Status Badge & Platform
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Row(
                  children: [
                    Icon(statusIcon, color: statusColor, size: 12),
                    const SizedBox(width: 4),
                    Text(
                      statusLabel,
                      style: GoogleFonts.spaceMono(
                        fontSize: 10,
                        color: statusColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              Row(
                children: [
                  Icon(
                    schedule.platform == 'YouTube' ? LucideIcons.video : LucideIcons.tv,
                    color: AppColors.textSecondary,
                    size: 14,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    schedule.platform,
                    style: GoogleFonts.spaceMono(
                      fontSize: 10,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Stream Title
          Text(
            schedule.title,
            style: GoogleFonts.spaceGrotesk(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),

          // Category / Game
          Row(
            children: [
              const Icon(LucideIcons.gamepad_2, color: AppColors.accentGold, size: 14),
              const SizedBox(width: 6),
              Text(
                schedule.gameCategory,
                style: GoogleFonts.spaceMono(
                  fontSize: 11,
                  color: AppColors.accentGold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Footer: Time & Action Button
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(LucideIcons.calendar, color: AppColors.textSecondary, size: 14),
                  const SizedBox(width: 6),
                  Text(
                    '${schedule.scheduledAt.day}/${schedule.scheduledAt.month}/${schedule.scheduledAt.year} • ${_twoDigits(schedule.scheduledAt.hour)}:${_twoDigits(schedule.scheduledAt.minute)} WIB',
                    style: GoogleFonts.spaceMono(
                      fontSize: 10,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
              if (schedule.status == 'upcoming')
                IconButton(
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  icon: Icon(
                    schedule.isReminderSet ? LucideIcons.bell_ring : LucideIcons.bell,
                    color: schedule.isReminderSet ? AppColors.accentCyan : AppColors.textMuted,
                    size: 18,
                  ),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        duration: const Duration(seconds: 1),
                        content: Text(
                          schedule.isReminderSet ? 'Pengingat dihapus' : 'Pengingat diaktifkan',
                          style: GoogleFonts.spaceGrotesk(),
                        ),
                      ),
                    );
                  },
                ),
            ],
          ),
        ],
      ),
    );
  }

  String _twoDigits(int n) => n.toString().padLeft(2, '0');
}