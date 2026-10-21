import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/schedule_model.dart';
import '../providers/schedule_provider.dart';

class ScheduleScreen extends ConsumerStatefulWidget {
  const ScheduleScreen({super.key});

  @override
  ConsumerState<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends ConsumerState<ScheduleScreen> {
  int _selectedFilterIndex = 0;

  final List<String> _categories = [
    'Survival Horror',
    'Action RPG',
    'Adventure',
    'Simulation',
    'Strategy',
    'Indie',
    'Retro',
    'Multiplayer',
    'Lainnya',
  ];

  final List<String> _statuses = ['upcoming', 'live', 'done'];

  @override
  Widget build(BuildContext context) {
    final scheduleState = ref.watch(scheduleProvider);
    final allSchedules = scheduleState.schedules;

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgBase = isDark ? AppColors.bgBase : AppColors.bgBaseLight;
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final bgNav = isDark ? AppColors.bgNav : AppColors.bgNavLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    // Hitung counter status untuk chip filter (identik dengan versi web)
    final liveCount = allSchedules.where((s) => s.status.toLowerCase() == 'live').length;
    final upcomingCount = allSchedules.where((s) => s.status.toLowerCase() == 'upcoming').length;
    final doneCount = allSchedules.where((s) {
      final st = s.status.toLowerCase();
      return st == 'done' || st == 'archived' || st == 'past' || st == 'completed';
    }).length;

    final filterLabels = [
      'SEMUA (${allSchedules.length})',
      'LIVE ($liveCount)',
      'UPCOMING ($upcomingCount)',
      'SELESAI ($doneCount)',
    ];

    final filteredSchedules = allSchedules.where((s) {
      final statusLower = s.status.toLowerCase();
      if (_selectedFilterIndex == 1) return statusLower == 'live';
      if (_selectedFilterIndex == 2) return statusLower == 'upcoming';
      if (_selectedFilterIndex == 3) {
        return statusLower == 'done' || statusLower == 'archived' || statusLower == 'past' || statusLower == 'completed';
      }
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: bgBase,
      appBar: AppBar(
        backgroundColor: bgNav,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'SIARAN & PENJADWALAN',
              style: GoogleFonts.spaceMono(
                fontSize: 9,
                fontWeight: FontWeight.bold,
                color: AppColors.accentCyan,
                letterSpacing: 1.2,
              ),
            ),
            Text(
              'Manajemen Jadwal',
              style: GoogleFonts.spaceGrotesk(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: textPrimary,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(LucideIcons.refresh_cw, size: 18, color: textSecondary),
            onPressed: () => ref.read(scheduleProvider.notifier).fetchSchedules(),
          ),
          const SizedBox(width: 8),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.accentCyan,
        elevation: 4,
        icon: const Icon(LucideIcons.plus, color: Colors.black, size: 18),
        label: Text(
          'Tambah Jadwal',
          style: GoogleFonts.spaceGrotesk(
            color: Colors.black,
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
        ),
        onPressed: () => _showAddScheduleDialog(context),
      ),
      body: Column(
        children: [
          // Header Mini Summary (Sinkron dengan Web)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: bgNav,
            child: Row(
              children: [
                Expanded(
                  child: _buildMiniStat(
                    title: 'Siaran Aktif',
                    value: liveCount > 0 ? '$liveCount LIVE' : 'Tidak ada',
                    color: liveCount > 0 ? AppColors.accentRed : textSecondary,
                    isDark: isDark,
                  ),
                ),
                Container(width: 1, height: 26, color: borderSubtle),
                Expanded(
                  child: _buildMiniStat(
                    title: 'Slot Terjadwal',
                    value: '$upcomingCount Sesi',
                    color: AppColors.accentPurple,
                    isDark: isDark,
                  ),
                ),
                Container(width: 1, height: 26, color: borderSubtle),
                Expanded(
                  child: _buildMiniStat(
                    title: 'Selesai',
                    value: '$doneCount Sesi',
                    color: AppColors.accentCyan,
                    isDark: isDark,
                  ),
                ),
              ],
            ),
          ),
          Divider(height: 1, color: borderSubtle),

          // Filter Chips Bar
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: bgSurface,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: List.generate(filterLabels.length, (index) {
                  final isSelected = _selectedFilterIndex == index;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: ChoiceChip(
                      label: Text(
                        filterLabels[index],
                        style: GoogleFonts.spaceMono(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: isSelected ? Colors.black : textSecondary,
                        ),
                      ),
                      selected: isSelected,
                      selectedColor: AppColors.accentCyan,
                      backgroundColor: bgInput,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                        side: BorderSide(
                          color: isSelected ? AppColors.accentCyan : borderSubtle,
                        ),
                      ),
                      onSelected: (_) => setState(() => _selectedFilterIndex = index),
                    ),
                  );
                }),
              ),
            ),
          ),
          Divider(height: 1, color: borderSubtle),

          // Schedule List
          Expanded(
            child: scheduleState.isLoading && allSchedules.isEmpty
                ? const Center(child: CircularProgressIndicator(color: AppColors.accentCyan))
                : scheduleState.error != null && allSchedules.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.error_outline, color: AppColors.accentRed, size: 40),
                            const SizedBox(height: 8),
                            Text(
                              'Gagal mengambil data jadwal',
                              style: GoogleFonts.spaceGrotesk(color: textPrimary),
                            ),
                            const SizedBox(height: 12),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(backgroundColor: AppColors.accentCyan),
                              onPressed: () => ref.read(scheduleProvider.notifier).fetchSchedules(),
                              child: Text('Coba Lagi', style: GoogleFonts.spaceGrotesk(color: Colors.black)),
                            ),
                          ],
                        ),
                      )
                    : filteredSchedules.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(LucideIcons.calendar_x, color: textMuted, size: 48),
                                const SizedBox(height: 12),
                                Text(
                                  'Belum ada jadwal stream',
                                  style: GoogleFonts.spaceGrotesk(
                                    fontSize: 14,
                                    color: textSecondary,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Tekan "+ Tambah Jadwal" untuk membuat agenda baru',
                                  style: GoogleFonts.spaceMono(fontSize: 11, color: textMuted),
                                ),
                              ],
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: () => ref.read(scheduleProvider.notifier).fetchSchedules(),
                            color: AppColors.accentCyan,
                            child: ListView.builder(
                              padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 80),
                              itemCount: filteredSchedules.length,
                              itemBuilder: (context, index) =>
                                  _buildScheduleCard(filteredSchedules[index], isDark),
                            ),
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildMiniStat({
    required String title,
    required String value,
    required Color color,
    required bool isDark,
  }) {
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    return Column(
      children: [
        Text(title, style: GoogleFonts.spaceMono(fontSize: 9, color: textMuted)),
        const SizedBox(height: 2),
        Text(
          value,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }

  Widget _buildScheduleCard(ScheduleModel schedule, bool isDark) {
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    Color statusColor;
    String statusLabel;
    IconData statusIcon;

    final statusLower = schedule.status.toLowerCase();

    switch (statusLower) {
      case 'live':
        statusColor = AppColors.accentRed;
        statusLabel = 'LIVE';
        statusIcon = LucideIcons.radio;
        break;
      case 'done':
      case 'archived':
      case 'past':
      case 'completed':
        statusColor = const Color(0xFF10B981); // Emerald Green khas Web
        statusLabel = 'SELESAI';
        statusIcon = LucideIcons.circle_check;
        break;
      default:
        statusColor = AppColors.accentPurple;
        statusLabel = 'UPCOMING';
        statusIcon = LucideIcons.clock;
    }

    final scheduledDate = schedule.scheduledAt ?? DateTime.now();
    final hasYoutubeUrl = schedule.youtubeUrl?.isNotEmpty == true;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgSurface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: statusLower == 'live' ? AppColors.accentRed : borderSubtle,
          width: statusLower == 'live' ? 1.5 : 1.0,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: statusColor.withValues(alpha: 0.3)),
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
                    schedule.streamPlatform.toLowerCase() == 'youtube'
                        ? LucideIcons.video
                        : LucideIcons.tv,
                    color: textSecondary,
                    size: 14,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    schedule.streamPlatform,
                    style: GoogleFonts.spaceMono(fontSize: 10, color: textSecondary),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    constraints: const BoxConstraints(),
                    padding: EdgeInsets.zero,
                    icon: const Icon(LucideIcons.pencil, size: 16, color: AppColors.accentCyan),
                    onPressed: () => _showEditScheduleDialog(context, schedule),
                  ),
                  const SizedBox(width: 6),
                  IconButton(
                    constraints: const BoxConstraints(),
                    padding: EdgeInsets.zero,
                    icon: Icon(LucideIcons.trash, size: 16, color: textMuted),
                    onPressed: () async {
                      final bool? confirm = await showDialog<bool>(
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
                                'Konfirmasi Hapus',
                                style: GoogleFonts.spaceGrotesk(
                                  color: textPrimary,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                            ],
                          ),
                          content: Text(
                            'Apakah Anda yakin ingin menghapus jadwal ini?\n("${schedule.title}")',
                            style: GoogleFonts.spaceMono(
                              color: textSecondary,
                              fontSize: 12,
                            ),
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(ctx, false),
                              child: Text('Batal', style: GoogleFonts.spaceMono(color: textMuted)),
                            ),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.accentRed,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                              onPressed: () => Navigator.pop(ctx, true),
                              child: Text(
                                'Ya, Hapus',
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
                        try {
                          await ref.read(scheduleProvider.notifier).deleteSchedule(schedule.id);
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Jadwal berhasil dihapus')),
                            );
                          }
                        } catch (e) {
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Gagal menghapus jadwal: $e')),
                            );
                          }
                        }
                      }
                    },
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            schedule.title,
            style: GoogleFonts.spaceGrotesk(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(LucideIcons.gamepad_2, color: AppColors.accentGold, size: 14),
              const SizedBox(width: 6),
              Text(
                schedule.gameCategory?.isNotEmpty == true ? schedule.gameCategory! : 'General Stream',
                style: GoogleFonts.spaceMono(fontSize: 11, color: AppColors.accentGold),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Icon(LucideIcons.calendar, color: textSecondary, size: 14),
              const SizedBox(width: 6),
              Text(
                '${scheduledDate.day}/${scheduledDate.month}/${scheduledDate.year} ${_twoDigits(scheduledDate.hour)}:${_twoDigits(scheduledDate.minute)} WIB',
                style: GoogleFonts.spaceMono(fontSize: 10, color: textSecondary),
              ),
            ],
          ),
          if (hasYoutubeUrl) ...[
            const SizedBox(height: 8),
            GestureDetector(
              onTap: () async {
                final rawUrl = schedule.youtubeUrl!;
                final uri = Uri.tryParse(rawUrl);
                if (uri != null && await canLaunchUrl(uri)) {
                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                } else if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Tidak dapat membuka URL: $rawUrl')),
                  );
                }
              },
              child: Row(
                children: [
                  const Icon(Icons.smart_display_rounded, color: AppColors.accentRed, size: 16),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      schedule.youtubeUrl!,
                      style: GoogleFonts.spaceMono(
                        fontSize: 10,
                        color: AppColors.accentRed,
                        decoration: TextDecoration.underline,
                        decorationColor: AppColors.accentRed,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const Icon(LucideIcons.external_link, color: AppColors.accentRed, size: 12),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  // HELPERS
  InputDecoration _inputDecoration(String hint, bool isDark) {
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    return InputDecoration(
      hintText: hint,
      hintStyle: GoogleFonts.spaceGrotesk(color: textMuted),
      filled: true,
      fillColor: bgInput,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
    );
  }

  Widget _buildSectionLabel(String label, bool isDark) {
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    return Text(
      label,
      style: GoogleFonts.spaceMono(fontSize: 10, color: textSecondary, fontWeight: FontWeight.bold),
    );
  }

  Widget _buildDatePicker(BuildContext context, DateTime selectedDate, Function(DateTime) onPick, bool isDark) {
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;

    return InkWell(
      onTap: () async {
        final picked = await showDatePicker(
          context: context,
          initialDate: selectedDate,
          firstDate: DateTime(2024),
          lastDate: DateTime(2030),
        );
        if (picked != null) onPick(picked);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        decoration: BoxDecoration(color: bgInput, borderRadius: BorderRadius.circular(10)),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '${_twoDigits(selectedDate.day)}/${_twoDigits(selectedDate.month)}/${selectedDate.year}',
              style: GoogleFonts.spaceMono(color: textPrimary, fontSize: 12),
            ),
            Icon(LucideIcons.calendar, size: 16, color: textMuted),
          ],
        ),
      ),
    );
  }

  Widget _buildTimePicker(BuildContext context, TimeOfDay selectedTime, Function(TimeOfDay) onPick, bool isDark) {
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;

    return InkWell(
      onTap: () async {
        final picked = await showTimePicker(context: context, initialTime: selectedTime);
        if (picked != null) onPick(picked);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        decoration: BoxDecoration(color: bgInput, borderRadius: BorderRadius.circular(10)),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '${_twoDigits(selectedTime.hour)}:${_twoDigits(selectedTime.minute)}',
              style: GoogleFonts.spaceMono(color: textPrimary, fontSize: 12),
            ),
            Icon(LucideIcons.clock, size: 16, color: textMuted),
          ],
        ),
      ),
    );
  }

  // TAMBAH JADWAL MODAL
  void _showAddScheduleDialog(BuildContext context) {
    final messenger = ScaffoldMessenger.of(context);
    final titleController = TextEditingController();
    final descriptionController = TextEditingController();
    final youtubeController = TextEditingController();

    String? selectedCategory;
    DateTime selectedDate = DateTime.now().add(const Duration(hours: 2));
    TimeOfDay selectedTime = TimeOfDay(hour: selectedDate.hour, minute: selectedDate.minute);
    bool countdownEnabled = true;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (modalContext) {
        final isDark = Theme.of(modalContext).brightness == Brightness.dark;
        final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
        final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
        final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
        final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
        final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
        final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

        return StatefulBuilder(
          builder: (modalContext, setModalState) => Container(
            color: bgSurface,
            padding: EdgeInsets.only(
              left: 20,
              right: 20,
              top: 20,
              bottom: MediaQuery.of(modalContext).viewInsets.bottom + 20,
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('MODIFIKASI JADWAL',
                              style: GoogleFonts.spaceMono(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.accentCyan)),
                          Text('Tambah Jadwal Baru',
                              style: GoogleFonts.spaceGrotesk(fontSize: 18, fontWeight: FontWeight.bold, color: textPrimary)),
                        ],
                      ),
                      IconButton(
                        icon: Icon(LucideIcons.x, color: textMuted),
                        onPressed: () => Navigator.pop(modalContext),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  _buildSectionLabel('JUDUL STREAM', isDark),
                  const SizedBox(height: 6),
                  TextField(
                    controller: titleController,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary),
                    decoration: _inputDecoration('Judul stream...', isDark),
                  ),
                  const SizedBox(height: 14),

                  _buildSectionLabel('KATEGORI GAME', isDark),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    initialValue: selectedCategory,
                    dropdownColor: bgInput,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary),
                    hint: Text('Pilih kategori...', style: GoogleFonts.spaceGrotesk(color: textMuted)),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: bgInput,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                    ),
                    items: _categories.map((cat) => DropdownMenuItem(value: cat, child: Text(cat))).toList(),
                    onChanged: (val) => setModalState(() => selectedCategory = val),
                  ),
                  const SizedBox(height: 14),

                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildSectionLabel('TANGGAL', isDark),
                            const SizedBox(height: 6),
                            _buildDatePicker(modalContext, selectedDate, (d) => setModalState(() => selectedDate = d), isDark),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildSectionLabel('WAKTU (WIB)', isDark),
                            const SizedBox(height: 6),
                            _buildTimePicker(modalContext, selectedTime, (t) => setModalState(() => selectedTime = t), isDark),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  _buildSectionLabel('DESKRIPSI', isDark),
                  const SizedBox(height: 6),
                  TextField(
                    controller: descriptionController,
                    maxLines: 2,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary),
                    decoration: _inputDecoration('Deskripsi stream...', isDark),
                  ),
                  const SizedBox(height: 14),

                  _buildSectionLabel('YOUTUBE URL (opsional)', isDark),
                  const SizedBox(height: 6),
                  TextField(
                    controller: youtubeController,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary),
                    decoration: _inputDecoration('https://youtube.com/...', isDark),
                    keyboardType: TextInputType.url,
                  ),
                  const SizedBox(height: 14),

                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: bgInput, borderRadius: BorderRadius.circular(10)),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Hitung Mundur Fansite',
                                style: GoogleFonts.spaceGrotesk(color: textPrimary, fontWeight: FontWeight.bold, fontSize: 13)),
                            Text('Sinkronisasi banner publik portal!',
                                style: GoogleFonts.spaceMono(color: textMuted, fontSize: 10)),
                          ],
                        ),
                        Switch(
                          value: countdownEnabled,
                          activeThumbColor: AppColors.accentCyan,
                          onChanged: (val) => setModalState(() => countdownEnabled = val),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.accentCyan,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: () async {
                        final title = titleController.text.trim();
                        if (title.isEmpty) {
                          messenger.showSnackBar(
                            const SnackBar(content: Text('Judul jadwal stream wajib diisi!')),
                          );
                          return;
                        }

                        final bool? confirmSave = await showDialog<bool>(
                          context: modalContext,
                          builder: (ctx) => AlertDialog(
                            backgroundColor: bgSurface,
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                                side: BorderSide(color: borderSubtle)),
                            title: Row(children: [
                              const Icon(LucideIcons.calendar, color: AppColors.accentCyan, size: 20),
                              const SizedBox(width: 8),
                              Text('Konfirmasi Simpan Jadwal',
                                  style: GoogleFonts.spaceGrotesk(
                                      color: textPrimary, fontWeight: FontWeight.bold, fontSize: 16)),
                            ]),
                            content: Text('Apakah Anda yakin ingin menyimpan jadwal stream ini?\n\n"$title"',
                                style: GoogleFonts.spaceMono(color: textSecondary, fontSize: 12)),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(ctx, false),
                                child: Text('Batal', style: GoogleFonts.spaceMono(color: textMuted)),
                              ),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.accentCyan,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                                onPressed: () => Navigator.pop(ctx, true),
                                child: Text('Ya, Simpan',
                                    style: GoogleFonts.spaceMono(color: Colors.black, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                        );

                        if (confirmSave != true) return;

                        final fullScheduledAt = DateTime(
                          selectedDate.year,
                          selectedDate.month,
                          selectedDate.day,
                          selectedTime.hour,
                          selectedTime.minute,
                        );

                        final newSchedule = ScheduleModel(
                          id: 0,
                          userId: 0,
                          title: title,
                          gameCategory: selectedCategory ?? 'Lainnya',
                          scheduledAt: fullScheduledAt,
                          description: descriptionController.text.trim().isEmpty
                              ? null
                              : descriptionController.text.trim(),
                          youtubeUrl: youtubeController.text.trim().isEmpty
                              ? null
                              : youtubeController.text.trim(),
                          streamPlatform: 'YouTube',
                          countdownEnabled: countdownEnabled,
                          status: 'upcoming',
                        );

                        if (modalContext.mounted) {
                          Navigator.pop(modalContext);
                        }

                        try {
                          await ref.read(scheduleProvider.notifier).addSchedule(newSchedule);
                          messenger.showSnackBar(
                            const SnackBar(content: Text('Jadwal berhasil disimpan & disinkronkan!')),
                          );
                        } catch (e) {
                          messenger.showSnackBar(
                            SnackBar(content: Text('Gagal menambah jadwal: $e')),
                          );
                        }
                      },
                      child: Text('✓ Simpan Jadwal',
                          style: GoogleFonts.spaceGrotesk(color: Colors.black, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  // EDIT JADWAL MODAL
  void _showEditScheduleDialog(BuildContext context, ScheduleModel schedule) {
    final messenger = ScaffoldMessenger.of(context);
    final titleController = TextEditingController(text: schedule.title);
    final descriptionController = TextEditingController(text: schedule.description ?? '');
    final youtubeController = TextEditingController(text: schedule.youtubeUrl ?? '');

    String? selectedCategory = schedule.gameCategory;
    final initDate = schedule.scheduledAt ?? DateTime.now().add(const Duration(hours: 1));
    DateTime selectedDate = DateTime(initDate.year, initDate.month, initDate.day);
    TimeOfDay selectedTime = TimeOfDay(hour: initDate.hour, minute: initDate.minute);
    bool countdownEnabled = schedule.countdownEnabled;
    String selectedStatus = schedule.status.toLowerCase();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (modalContext) {
        final isDark = Theme.of(modalContext).brightness == Brightness.dark;
        final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
        final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
        final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
        final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
        final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
        final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

        return StatefulBuilder(
          builder: (modalContext, setModalState) => Container(
            color: bgSurface,
            padding: EdgeInsets.only(
              left: 20,
              right: 20,
              top: 20,
              bottom: MediaQuery.of(modalContext).viewInsets.bottom + 20,
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('MODIFIKASI JADWAL',
                              style: GoogleFonts.spaceMono(
                                  fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.accentCyan)),
                          Text('Edit Jadwal Stream',
                              style: GoogleFonts.spaceGrotesk(
                                  fontSize: 18, fontWeight: FontWeight.bold, color: textPrimary)),
                        ],
                      ),
                      IconButton(
                        icon: Icon(LucideIcons.x, color: textMuted),
                        onPressed: () => Navigator.pop(modalContext),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  _buildSectionLabel('JUDUL STREAM', isDark),
                  const SizedBox(height: 6),
                  TextField(
                    controller: titleController,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary),
                    decoration: _inputDecoration('Judul stream...', isDark),
                  ),
                  const SizedBox(height: 14),

                  _buildSectionLabel('KATEGORI GAME', isDark),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    initialValue: _categories.contains(selectedCategory) ? selectedCategory : null,
                    dropdownColor: bgInput,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary),
                    hint: Text('Pilih kategori...', style: GoogleFonts.spaceGrotesk(color: textMuted)),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: bgInput,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                    ),
                    items: _categories.map((cat) => DropdownMenuItem(value: cat, child: Text(cat))).toList(),
                    onChanged: (val) => setModalState(() => selectedCategory = val),
                  ),
                  const SizedBox(height: 14),

                  _buildSectionLabel('STATUS STREAM', isDark),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    initialValue: _statuses.contains(selectedStatus) ? selectedStatus : 'upcoming',
                    dropdownColor: bgInput,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: bgInput,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                    ),
                    items: [
                      DropdownMenuItem(value: 'upcoming', child: Text('Upcoming', style: GoogleFonts.spaceGrotesk(color: AppColors.accentPurple))),
                      DropdownMenuItem(value: 'live', child: Text('Live Now', style: GoogleFonts.spaceGrotesk(color: AppColors.accentRed))),
                      DropdownMenuItem(value: 'done', child: Text('Selesai (Done)', style: GoogleFonts.spaceGrotesk(color: const Color(0xFF10B981)))),
                    ],
                    onChanged: (val) => setModalState(() => selectedStatus = val ?? 'upcoming'),
                  ),
                  const SizedBox(height: 14),

                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildSectionLabel('TANGGAL', isDark),
                            const SizedBox(height: 6),
                            _buildDatePicker(modalContext, selectedDate, (d) => setModalState(() => selectedDate = d), isDark),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildSectionLabel('WAKTU (WIB)', isDark),
                            const SizedBox(height: 6),
                            _buildTimePicker(modalContext, selectedTime, (t) => setModalState(() => selectedTime = t), isDark),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  _buildSectionLabel('DESKRIPSI', isDark),
                  const SizedBox(height: 6),
                  TextField(
                    controller: descriptionController,
                    maxLines: 2,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary),
                    decoration: _inputDecoration('Deskripsi stream...', isDark),
                  ),
                  const SizedBox(height: 14),

                  _buildSectionLabel('YOUTUBE URL (opsional)', isDark),
                  const SizedBox(height: 6),
                  TextField(
                    controller: youtubeController,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary),
                    decoration: _inputDecoration('https://youtube.com/...', isDark),
                    keyboardType: TextInputType.url,
                  ),
                  const SizedBox(height: 14),

                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: bgInput, borderRadius: BorderRadius.circular(10)),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Hitung Mundur Fansite',
                                style: GoogleFonts.spaceGrotesk(
                                    color: textPrimary, fontWeight: FontWeight.bold, fontSize: 13)),
                            Text('Sinkronisasi banner publik portal!',
                                style: GoogleFonts.spaceMono(color: textMuted, fontSize: 10)),
                          ],
                        ),
                        Switch(
                          value: countdownEnabled,
                          activeThumbColor: AppColors.accentCyan,
                          onChanged: (val) => setModalState(() => countdownEnabled = val),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.accentCyan,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: () async {
                        final title = titleController.text.trim();
                        if (title.isEmpty) {
                          messenger.showSnackBar(
                            const SnackBar(content: Text('Judul jadwal stream wajib diisi!')),
                          );
                          return;
                        }

                        final bool? confirmSave = await showDialog<bool>(
                          context: modalContext,
                          builder: (ctx) => AlertDialog(
                            backgroundColor: bgSurface,
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                                side: BorderSide(color: borderSubtle)),
                            title: Row(children: [
                              const Icon(LucideIcons.pencil, color: AppColors.accentCyan, size: 20),
                              const SizedBox(width: 8),
                              Text('Konfirmasi Simpan Perubahan',
                                  style: GoogleFonts.spaceGrotesk(
                                      color: textPrimary, fontWeight: FontWeight.bold, fontSize: 15)),
                            ]),
                            content: Text('Apakah Anda yakin ingin menyimpan perubahan pada jadwal ini?\n\n"$title"',
                                style: GoogleFonts.spaceMono(color: textSecondary, fontSize: 12)),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(ctx, false),
                                child: Text('Batal', style: GoogleFonts.spaceMono(color: textMuted)),
                              ),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.accentCyan,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                                onPressed: () => Navigator.pop(ctx, true),
                                child: Text('Ya, Simpan',
                                    style: GoogleFonts.spaceMono(color: Colors.black, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                        );

                        if (confirmSave != true) return;

                        final fullScheduledAt = DateTime(
                          selectedDate.year,
                          selectedDate.month,
                          selectedDate.day,
                          selectedTime.hour,
                          selectedTime.minute,
                        );

                        final updates = {
                          'title': title,
                          'game_category': selectedCategory ?? schedule.gameCategory,
                          'scheduled_at': fullScheduledAt.toIso8601String(),
                          'description': descriptionController.text.trim().isEmpty
                              ? null
                              : descriptionController.text.trim(),
                          'youtube_url': youtubeController.text.trim().isEmpty
                              ? null
                              : youtubeController.text.trim(),
                          'countdown_enabled': countdownEnabled ? 1 : 0,
                          'status': selectedStatus,
                        };

                        if (modalContext.mounted) {
                          Navigator.pop(modalContext);
                        }

                        try {
                          await ref.read(scheduleProvider.notifier).updateSchedule(schedule.id, updates);
                          messenger.showSnackBar(
                            const SnackBar(content: Text('Jadwal berhasil diperbarui!')),
                          );
                        } catch (e) {
                          messenger.showSnackBar(
                            SnackBar(content: Text('Gagal memperbarui jadwal: $e')),
                          );
                        }
                      },
                      child: Text('✓ Simpan Perubahan',
                          style: GoogleFonts.spaceGrotesk(color: Colors.black, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  String _twoDigits(int n) => n.toString().padLeft(2, '0');
}