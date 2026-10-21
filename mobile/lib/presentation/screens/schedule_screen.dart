import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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

  void _showFloatingBanner({
    required BuildContext context,
    required String message,
    bool isError = false,
    bool isSuccess = false,
  }) {
    HapticFeedback.lightImpact();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;

    final color = isError
        ? AppColors.accentRed
        : (isSuccess ? AppColors.accentEmerald : AppColors.accentCyan);

    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        backgroundColor: bgSurface,
        elevation: 6,
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: color.withValues(alpha: 0.35), width: 1),
        ),
        content: Row(
          children: [
            Icon(
              isError
                  ? LucideIcons.circle_alert
                  : (isSuccess ? LucideIcons.circle_check : LucideIcons.info),
              color: color,
              size: 18,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: GoogleFonts.spaceGrotesk(
                  color: textPrimary,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  Future<void> _copyToClipboard(BuildContext context, String text, String label) async {
    await Clipboard.setData(ClipboardData(text: text));
    if (context.mounted) {
      _showFloatingBanner(
        context: context,
        message: '$label disalin ke clipboard',
        isSuccess: true,
      );
    }
  }

  Future<void> _launchYouTubeUrl(BuildContext context, String rawUrl) async {
    HapticFeedback.lightImpact();
    String formattedUrl = rawUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://$formattedUrl';
    }
    final uri = Uri.tryParse(formattedUrl);
    if (uri != null && await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else if (context.mounted) {
      _showFloatingBanner(
        context: context,
        message: 'Tidak dapat membuka tautan YouTube ($rawUrl)',
        isError: true,
      );
    }
  }

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
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    // Filter status count
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
          SizedBox(
            width: 44,
            height: 44,
            child: IconButton(
              tooltip: 'Segarkan Data',
              icon: Icon(LucideIcons.refresh_cw, size: 18, color: textSecondary),
              onPressed: () {
                HapticFeedback.lightImpact();
                ref.read(scheduleProvider.notifier).fetchSchedules();
              },
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary(isDark),
        elevation: 4,
        icon: Icon(LucideIcons.plus, color: isDark ? Colors.black : Colors.white, size: 18),
        label: Text(
          'Tambah Jadwal',
          style: GoogleFonts.spaceGrotesk(
            color: isDark ? Colors.black : Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
        ),
        onPressed: () {
          HapticFeedback.selectionClick();
          _showAddScheduleDialog(context);
        },
      ),
      body: Column(
        children: [
          // Header Mini Summary
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
                    isLive: liveCount > 0,
                    isDark: isDark,
                  ),
                ),
                Container(width: 1, height: 26, color: borderSubtle),
                Expanded(
                  child: _buildMiniStat(
                    title: 'Slot Terjadwal',
                    value: '$upcomingCount Sesi',
                    color: AppColors.primary(isDark),
                    isDark: isDark,
                  ),
                ),
                Container(width: 1, height: 26, color: borderSubtle),
                Expanded(
                  child: _buildMiniStat(
                    title: 'Selesai',
                    value: '$doneCount Sesi',
                    color: AppColors.emerald(isDark),
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
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: List.generate(filterLabels.length, (index) {
                  final isSelected = _selectedFilterIndex == index;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: SizedBox(
                      height: 38,
                      child: ChoiceChip(
                        label: Text(
                          filterLabels[index],
                          style: GoogleFonts.spaceMono(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: isSelected ? (isDark ? Colors.black : Colors.white) : textSecondary,
                          ),
                        ),
                        selected: isSelected,
                        selectedColor: AppColors.primary(isDark),
                        backgroundColor: bgInput,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                          side: BorderSide(
                            color: isSelected ? AppColors.primary(isDark) : borderSubtle,
                            width: 1,
                          ),
                        ),
                        onSelected: (_) {
                          HapticFeedback.selectionClick();
                          setState(() => _selectedFilterIndex = index);
                        },
                      ),
                    ),
                  );
                }),
              ),
            ),
          ),
          Divider(height: 1, color: borderSubtle),

          // Schedule List / State Handler
          Expanded(
            child: scheduleState.isLoading && allSchedules.isEmpty
                ? _buildLoadingSkeleton(isDark)
                : scheduleState.error != null && allSchedules.isEmpty
                    ? _buildErrorState(context, scheduleState.error!, isDark)
                    : filteredSchedules.isEmpty
                        ? _buildEmptyState(context, isDark)
                        : RefreshIndicator(
                            onRefresh: () async {
                              HapticFeedback.lightImpact();
                              await ref.read(scheduleProvider.notifier).fetchSchedules();
                            },
                            color: AppColors.primary(isDark),
                            backgroundColor: bgSurface,
                            child: ListView.builder(
                              physics: const AlwaysScrollableScrollPhysics(
                                parent: BouncingScrollPhysics(),
                              ),
                              padding: const EdgeInsets.only(
                                left: 16,
                                right: 16,
                                top: 16,
                                bottom: 84,
                              ),
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
    bool isLive = false,
    required bool isDark,
  }) {
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    return Column(
      children: [
        Text(title, style: GoogleFonts.spaceMono(fontSize: 9, color: textMuted)),
        const SizedBox(height: 3),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (isLive) ...[
              const _PulsingLiveDot(),
              const SizedBox(width: 5),
            ],
            Text(
              value,
              style: GoogleFonts.spaceGrotesk(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildLoadingSkeleton(bool isDark) {
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 3,
      itemBuilder: (context, index) => Container(
        margin: const EdgeInsets.only(bottom: 14),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: bgSurface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: borderSubtle),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  width: 80,
                  height: 20,
                  decoration: BoxDecoration(
                    color: bgInput,
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
                Container(
                  width: 60,
                  height: 20,
                  decoration: BoxDecoration(
                    color: bgInput,
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Container(
              width: double.infinity,
              height: 18,
              decoration: BoxDecoration(
                color: bgInput,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(height: 8),
            Container(
              width: 140,
              height: 14,
              decoration: BoxDecoration(
                color: bgInput,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(BuildContext context, String error, bool isDark) {
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.accentRed.withValues(alpha: 0.12),
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.accentRed.withValues(alpha: 0.3)),
              ),
              child: const Icon(LucideIcons.circle_alert, color: AppColors.accentRed, size: 36),
            ),
            const SizedBox(height: 14),
            Text(
              'Gagal Memuat Jadwal',
              style: GoogleFonts.spaceGrotesk(
                color: textPrimary,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              error,
              textAlign: TextAlign.center,
              style: GoogleFonts.spaceMono(color: textSecondary, fontSize: 11),
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 44,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary(isDark),
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                icon: const Icon(LucideIcons.rotate_cw, size: 16),
                label: Text(
                  'Coba Lagi',
                  style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold),
                ),
                onPressed: () {
                  HapticFeedback.lightImpact();
                  ref.read(scheduleProvider.notifier).fetchSchedules();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, bool isDark) {
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;

    String emptyTitle = 'Belum Ada Jadwal Stream';
    String emptySub = 'Buat jadwal siaran baru agar audiens mendapatkan informasi live.';
    if (_selectedFilterIndex == 1) {
      emptyTitle = 'Tidak Ada Siaran LIVE';
      emptySub = 'Sedang tidak ada stream yang aktif saat ini.';
    } else if (_selectedFilterIndex == 2) {
      emptyTitle = 'Tidak Ada Sesi Mendatang';
      emptySub = 'Semua agenda siaran telah rampung atau belum dijadwalkan.';
    } else if (_selectedFilterIndex == 3) {
      emptyTitle = 'Belum Ada Arsip Selesai';
      emptySub = 'Daftar riwayat siaran yang sudah usai akan tampil di sini.';
    }

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight,
                shape: BoxShape.circle,
                border: Border.all(
                  color: isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight,
                ),
              ),
              child: Icon(LucideIcons.calendar_x, color: textMuted, size: 40),
            ),
            const SizedBox(height: 16),
            Text(
              emptyTitle,
              style: GoogleFonts.spaceGrotesk(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: textPrimary,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              emptySub,
              textAlign: TextAlign.center,
              style: GoogleFonts.spaceMono(fontSize: 11, color: textSecondary),
            ),
            const SizedBox(height: 20),
            SizedBox(
              height: 44,
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: AppColors.primary(isDark)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                ),
                icon: Icon(LucideIcons.plus, size: 16, color: AppColors.primary(isDark)),
                label: Text(
                  'Buat Jadwal Baru',
                  style: GoogleFonts.spaceGrotesk(
                    color: AppColors.primary(isDark),
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
                onPressed: () {
                  HapticFeedback.selectionClick();
                  _showAddScheduleDialog(context);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScheduleCard(ScheduleModel schedule, bool isDark) {
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;

    Color statusColor;
    String statusLabel;
    IconData statusIcon;

    final statusLower = schedule.status.toLowerCase();

    switch (statusLower) {
      case 'live':
        statusColor = AppColors.accentRed;
        statusLabel = 'LIVE NOW';
        statusIcon = LucideIcons.radio;
        break;
      case 'done':
      case 'archived':
      case 'past':
      case 'completed':
        statusColor = AppColors.accentEmerald;
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
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.05),
            offset: const Offset(0, 3),
            blurRadius: 8,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row: Status Badge, Platform, Edit, Delete
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: statusColor.withValues(alpha: 0.35)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (statusLower == 'live') ...[
                      const _PulsingLiveDot(),
                      const SizedBox(width: 5),
                    ] else ...[
                      Icon(statusIcon, color: statusColor, size: 12),
                      const SizedBox(width: 4),
                    ],
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
                    size: 13,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    schedule.streamPlatform,
                    style: GoogleFonts.spaceMono(fontSize: 10, color: textSecondary),
                  ),
                  const SizedBox(width: 6),
                  // Touch Target 44x44 dp: Edit Button
                  SizedBox(
                    width: 44,
                    height: 44,
                    child: IconButton(
                      tooltip: 'Edit Jadwal',
                      icon: const Icon(LucideIcons.pencil, size: 16, color: AppColors.accentCyan),
                      onPressed: () {
                        HapticFeedback.selectionClick();
                        _showEditScheduleDialog(context, schedule);
                      },
                    ),
                  ),
                  // Touch Target 44x44 dp: Delete Button
                  SizedBox(
                    width: 44,
                    height: 44,
                    child: IconButton(
                      tooltip: 'Hapus Jadwal',
                      icon: Icon(LucideIcons.trash, size: 16, color: textMuted),
                      onPressed: () async {
                        HapticFeedback.lightImpact();
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
                              'Apakah Anda yakin ingin menghapus jadwal ini?\n\n"${schedule.title}"',
                              style: GoogleFonts.spaceMono(
                                color: textSecondary,
                                fontSize: 12,
                              ),
                            ),
                            actions: [
                              TextButton(
                                onPressed: () {
                                  HapticFeedback.selectionClick();
                                  Navigator.pop(ctx, false);
                                },
                                child: Text('Batal', style: GoogleFonts.spaceMono(color: textMuted)),
                              ),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.accentRed,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                                onPressed: () {
                                  HapticFeedback.selectionClick();
                                  Navigator.pop(ctx, true);
                                },
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
                              _showFloatingBanner(
                                context: context,
                                message: 'Jadwal berhasil dihapus',
                                isSuccess: true,
                              );
                            }
                          } catch (e) {
                            if (mounted) {
                              _showFloatingBanner(
                                context: context,
                                message: 'Gagal menghapus jadwal: $e',
                                isError: true,
                              );
                            }
                          }
                        }
                      },
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Judul Stream
          Text(
            schedule.title,
            style: GoogleFonts.spaceGrotesk(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: textPrimary,
            ),
          ),
          const SizedBox(height: 8),

          // Kategori & Tag
          Row(
            children: [
              const Icon(LucideIcons.gamepad_2, color: AppColors.accentGold, size: 14),
              const SizedBox(width: 6),
              Text(
                schedule.gameCategory?.isNotEmpty == true ? schedule.gameCategory! : 'General Stream',
                style: GoogleFonts.spaceMono(
                  fontSize: 11,
                  color: AppColors.accentGold,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Waktu Pelaksanaan
          Row(
            children: [
              Icon(LucideIcons.calendar, color: textSecondary, size: 13),
              const SizedBox(width: 6),
              Text(
                '${scheduledDate.day}/${scheduledDate.month}/${scheduledDate.year} ${_twoDigits(scheduledDate.hour)}:${_twoDigits(scheduledDate.minute)} WIB',
                style: GoogleFonts.spaceMono(fontSize: 10, color: textSecondary),
              ),
            ],
          ),

          // Deskripsi (opsional)
          if (schedule.description?.isNotEmpty == true) ...[
            const SizedBox(height: 8),
            Text(
              schedule.description!,
              style: GoogleFonts.spaceGrotesk(
                fontSize: 12,
                color: textSecondary,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],

          // Banner YouTube Link + Quick Utilities (Buka & Salin)
          if (hasYoutubeUrl) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: bgInput,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: borderSubtle),
              ),
              child: Row(
                children: [
                  const Icon(Icons.smart_display_rounded, color: AppColors.accentRed, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: InkWell(
                      onTap: () => _launchYouTubeUrl(context, schedule.youtubeUrl!),
                      child: Text(
                        schedule.youtubeUrl!,
                        style: GoogleFonts.spaceMono(
                          fontSize: 10,
                          color: AppColors.accentRed,
                          decoration: TextDecoration.underline,
                          decorationColor: AppColors.accentRed,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
                  // Utility 1: Touch Target 44x44 dp Salin Link
                  SizedBox(
                    width: 36,
                    height: 36,
                    child: IconButton(
                      tooltip: 'Salin Tautan YouTube',
                      padding: EdgeInsets.zero,
                      icon: Icon(LucideIcons.copy, size: 14, color: textSecondary),
                      onPressed: () => _copyToClipboard(
                        context,
                        schedule.youtubeUrl!,
                        'Tautan YouTube',
                      ),
                    ),
                  ),
                  // Utility 2: Touch Target 44x44 dp Buka Eksternal
                  SizedBox(
                    width: 36,
                    height: 36,
                    child: IconButton(
                      tooltip: 'Buka di YouTube',
                      padding: EdgeInsets.zero,
                      icon: const Icon(LucideIcons.external_link, size: 14, color: AppColors.accentRed),
                      onPressed: () => _launchYouTubeUrl(context, schedule.youtubeUrl!),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  // HELPERS INPUT
  InputDecoration _inputDecoration(String hint, bool isDark) {
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    return InputDecoration(
      hintText: hint,
      hintStyle: GoogleFonts.spaceGrotesk(color: textMuted),
      filled: true,
      fillColor: bgInput,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
    );
  }

  Widget _buildSectionLabel(String label, bool isDark) {
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    return Text(
      label,
      style: GoogleFonts.spaceMono(
        fontSize: 10,
        color: textSecondary,
        fontWeight: FontWeight.bold,
        letterSpacing: 0.5,
      ),
    );
  }

  Widget _buildDatePicker(BuildContext context, DateTime selectedDate, Function(DateTime) onPick, bool isDark) {
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;

    return InkWell(
      onTap: () async {
        HapticFeedback.selectionClick();
        final picked = await showDatePicker(
          context: context,
          initialDate: selectedDate,
          firstDate: DateTime(2024),
          lastDate: DateTime(2030),
        );
        if (picked != null) onPick(picked);
      },
      borderRadius: BorderRadius.circular(10),
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
        HapticFeedback.selectionClick();
        final picked = await showTimePicker(context: context, initialTime: selectedTime);
        if (picked != null) onPick(picked);
      },
      borderRadius: BorderRadius.circular(10),
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
      backgroundColor: Colors.transparent,
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
            decoration: BoxDecoration(
              color: bgSurface,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              border: Border.all(color: borderSubtle, width: 1),
            ),
            padding: EdgeInsets.only(
              left: 20,
              right: 20,
              top: 16,
              bottom: MediaQuery.of(modalContext).viewInsets.bottom + 20,
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Handle Bar
                  Center(
                    child: Container(
                      width: 36,
                      height: 4,
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: borderSubtle,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
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
                      SizedBox(
                        width: 44,
                        height: 44,
                        child: IconButton(
                          icon: Icon(LucideIcons.x, color: textMuted),
                          onPressed: () => Navigator.pop(modalContext),
                        ),
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
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
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
                            Text('Sinkronisasi banner publik portal',
                                style: GoogleFonts.spaceMono(color: textMuted, fontSize: 10)),
                          ],
                        ),
                        Switch(
                          value: countdownEnabled,
                          activeThumbColor: AppColors.primary(isDark),
                          onChanged: (val) {
                            HapticFeedback.selectionClick();
                            setModalState(() => countdownEnabled = val);
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary(isDark),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: () async {
                        final title = titleController.text.trim();
                        if (title.isEmpty) {
                          _showFloatingBanner(
                            context: context,
                            message: 'Judul jadwal stream wajib diisi!',
                            isError: true,
                          );
                          return;
                        }

                        HapticFeedback.lightImpact();
                        final bool? confirmSave = await showDialog<bool>(
                          context: modalContext,
                          builder: (ctx) => AlertDialog(
                            backgroundColor: bgSurface,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                              side: BorderSide(color: borderSubtle),
                            ),
                            title: Row(
                              children: [
                                Icon(LucideIcons.calendar, color: AppColors.primary(isDark), size: 20),
                                const SizedBox(width: 8),
                                Text(
                                  'Konfirmasi Simpan',
                                  style: GoogleFonts.spaceGrotesk(
                                    color: textPrimary,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ],
                            ),
                            content: Text(
                              'Apakah Anda yakin ingin menyimpan jadwal stream ini?\n\n"$title"',
                              style: GoogleFonts.spaceMono(color: textSecondary, fontSize: 12),
                            ),
                            actions: [
                              TextButton(
                                onPressed: () {
                                  HapticFeedback.selectionClick();
                                  Navigator.pop(ctx, false);
                                },
                                child: Text('Batal', style: GoogleFonts.spaceMono(color: textMuted)),
                              ),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.primary(isDark),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                                onPressed: () {
                                  HapticFeedback.selectionClick();
                                  Navigator.pop(ctx, true);
                                },
                                child: Text(
                                  'Ya, Simpan',
                                  style: GoogleFonts.spaceMono(color: Colors.black, fontWeight: FontWeight.bold),
                                ),
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
                          if (context.mounted) {
                            _showFloatingBanner(
                              context: context,
                              message: 'Jadwal berhasil disimpan & disinkronkan!',
                              isSuccess: true,
                            );
                          }
                        } catch (e) {
                          if (context.mounted) {
                            _showFloatingBanner(
                              context: context,
                              message: 'Gagal menambah jadwal: $e',
                              isError: true,
                            );
                          }
                        }
                      },
                      child: Text(
                        '✓ Simpan Jadwal',
                        style: GoogleFonts.spaceGrotesk(
                          color: isDark ? Colors.black : Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
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
      backgroundColor: Colors.transparent,
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
            decoration: BoxDecoration(
              color: bgSurface,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              border: Border.all(color: borderSubtle, width: 1),
            ),
            padding: EdgeInsets.only(
              left: 20,
              right: 20,
              top: 16,
              bottom: MediaQuery.of(modalContext).viewInsets.bottom + 20,
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Handle Bar
                  Center(
                    child: Container(
                      width: 36,
                      height: 4,
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: borderSubtle,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('MODIFIKASI JADWAL',
                              style: GoogleFonts.spaceMono(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.accentCyan)),
                          Text('Edit Jadwal Stream',
                              style: GoogleFonts.spaceGrotesk(fontSize: 18, fontWeight: FontWeight.bold, color: textPrimary)),
                        ],
                      ),
                      SizedBox(
                        width: 44,
                        height: 44,
                        child: IconButton(
                          icon: Icon(LucideIcons.x, color: textMuted),
                          onPressed: () => Navigator.pop(modalContext),
                        ),
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
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
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
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                    ),
                    items: [
                      DropdownMenuItem(value: 'upcoming', child: Text('Upcoming', style: GoogleFonts.spaceGrotesk(color: AppColors.accentPurple))),
                      DropdownMenuItem(value: 'live', child: Text('Live Now', style: GoogleFonts.spaceGrotesk(color: AppColors.accentRed))),
                      DropdownMenuItem(value: 'done', child: Text('Selesai (Done)', style: GoogleFonts.spaceGrotesk(color: AppColors.accentEmerald))),
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
                                style: GoogleFonts.spaceGrotesk(color: textPrimary, fontWeight: FontWeight.bold, fontSize: 13)),
                            Text('Sinkronisasi banner publik portal',
                                style: GoogleFonts.spaceMono(color: textMuted, fontSize: 10)),
                          ],
                        ),
                        Switch(
                          value: countdownEnabled,
                          activeThumbColor: AppColors.primary(isDark),
                          onChanged: (val) {
                            HapticFeedback.selectionClick();
                            setModalState(() => countdownEnabled = val);
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary(isDark),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: () async {
                        final title = titleController.text.trim();
                        if (title.isEmpty) {
                          _showFloatingBanner(
                            context: context,
                            message: 'Judul jadwal stream wajib diisi!',
                            isError: true,
                          );
                          return;
                        }

                        HapticFeedback.lightImpact();
                        final bool? confirmSave = await showDialog<bool>(
                          context: modalContext,
                          builder: (ctx) => AlertDialog(
                            backgroundColor: bgSurface,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                              side: BorderSide(color: borderSubtle),
                            ),
                            title: Row(
                              children: [
                                Icon(LucideIcons.pencil, color: AppColors.primary(isDark), size: 20),
                                const SizedBox(width: 8),
                                Text(
                                  'Konfirmasi Simpan Perubahan',
                                  style: GoogleFonts.spaceGrotesk(
                                    color: textPrimary,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ],
                            ),
                            content: Text(
                              'Apakah Anda yakin ingin menyimpan perubahan pada jadwal ini?\n\n"$title"',
                              style: GoogleFonts.spaceMono(color: textSecondary, fontSize: 12),
                            ),
                            actions: [
                              TextButton(
                                onPressed: () {
                                  HapticFeedback.selectionClick();
                                  Navigator.pop(ctx, false);
                                },
                                child: Text('Batal', style: GoogleFonts.spaceMono(color: textMuted)),
                              ),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.primary(isDark),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                                onPressed: () {
                                  HapticFeedback.selectionClick();
                                  Navigator.pop(ctx, true);
                                },
                                child: Text(
                                  'Ya, Simpan',
                                  style: GoogleFonts.spaceMono(color: Colors.black, fontWeight: FontWeight.bold),
                                ),
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
                          if (context.mounted) {
                            _showFloatingBanner(
                              context: context,
                              message: 'Jadwal berhasil diperbarui!',
                              isSuccess: true,
                            );
                          }
                        } catch (e) {
                          if (context.mounted) {
                            _showFloatingBanner(
                              context: context,
                              message: 'Gagal memperbarui jadwal: $e',
                              isError: true,
                            );
                          }
                        }
                      },
                      child: Text(
                        '✓ Simpan Perubahan',
                        style: GoogleFonts.spaceGrotesk(
                          color: isDark ? Colors.black : Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
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

/// Widget dot berdenyut halus (pulsing) khusus saat siaran LIVE
class _PulsingLiveDot extends StatefulWidget {
  const _PulsingLiveDot();

  @override
  State<_PulsingLiveDot> createState() => _PulsingLiveDotState();
}

class _PulsingLiveDotState extends State<_PulsingLiveDot> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
    _animation = Tween<double>(begin: 0.35, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: AppColors.accentRed.withValues(alpha: _animation.value),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: AppColors.accentRed.withValues(alpha: _animation.value * 0.6),
                blurRadius: 4,
                spreadRadius: 1,
              ),
            ],
          ),
        );
      },
    );
  }
}
