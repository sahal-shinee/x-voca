import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/todo_model.dart';
import '../../data/models/audit_log_model.dart';
import '../providers/auth_provider.dart';
import '../providers/todo_provider.dart';
import '../providers/schedule_provider.dart';
import '../providers/game_provider.dart';
import '../providers/audit_log_provider.dart';
import '../providers/youtube_provider.dart';
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

class _DashboardScreenState extends ConsumerState<DashboardScreen>
    with SingleTickerProviderStateMixin {
  int _currentIndex = 0;
  bool _isBroadcasting = false;
  bool _isLoadingBroadcast = false;

  final Set<int> _visitedTabs = {0};

  late final AnimationController _pulseController;
  late final Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);

    _pulseAnimation = CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  void _showFloatingToast(
    BuildContext context, {
    required String message,
    required bool isSuccess,
    IconData? icon,
  }) {
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
        margin: const EdgeInsets.only(
          left: 16,
          right: 16,
          bottom: 16,
        ),
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

  @override
  Widget build(BuildContext context) {
    ref.listen(scheduleProvider, (previous, next) {
      final isAnyLive = next.schedules.any((s) => s.status.toLowerCase() == 'live');
      if (mounted && _isBroadcasting != isAnyLive) {
        setState(() => _isBroadcasting = isAnyLive);
      }
    });

    final authState = ref.watch(authProvider);
    final user = authState.value;

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgBase = isDark ? AppColors.bgBase : AppColors.bgBaseLight;
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final bgNav = isDark ? AppColors.bgNav : AppColors.bgNavLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    final userName = user?.name;
    final userRig = user?.rigName;
    final String creatorName = (userName != null && userName.trim().isNotEmpty)
        ? userName
        : 'Xion Regalia';
    final String rigName = (userRig != null && userRig.trim().isNotEmpty)
        ? userRig
        : 'Obsidian Rig #03';

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
        title: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const LinearGradient(
                  colors: [AppColors.accentPurple, AppColors.accentCyan],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.accentPurple.withValues(alpha: 0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              alignment: Alignment.center,
              child: Text(
                creatorName.isNotEmpty ? creatorName[0].toUpperCase() : 'X',
                style: GoogleFonts.spaceGrotesk(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  fontSize: 16,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  creatorName,
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: textPrimary,
                  ),
                ),
                Row(
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
                      rigName,
                      style: GoogleFonts.spaceMono(
                        fontSize: 10,
                        color: textSecondary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
        actions: [
          SizedBox(
            width: 44,
            height: 44,
            child: IconButton(
              tooltip: 'Segarkan Data',
              icon: Icon(LucideIcons.refresh_cw, color: textSecondary, size: 18),
              onPressed: () {
                HapticFeedback.lightImpact();
                ref.read(todoProvider.notifier).fetchTodos();
                ref.read(scheduleProvider.notifier).fetchSchedules();
                ref.read(gameProvider.notifier).loadAllData();
                ref.read(auditLogProvider.notifier).fetchLogs();
                ref.read(youtubeProvider.notifier).fetchStats();
                _showFloatingToast(
                  context,
                  message: 'Data dashboard berhasil diperbarui',
                  isSuccess: true,
                  icon: LucideIcons.refresh_cw,
                );
              },
            ),
          ),
          SizedBox(
            width: 44,
            height: 44,
            child: IconButton(
              tooltip: 'Keluar Akun',
              icon: const Icon(LucideIcons.log_out, color: AppColors.accentRed, size: 18),
              onPressed: () async {
                HapticFeedback.lightImpact();
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
                      'Apakah Anda yakin ingin keluar dari sesi Obsidian RIG X-VOCA?',
                      style: GoogleFonts.spaceGrotesk(
                        color: textSecondary,
                        fontSize: 13,
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
                          'Logout',
                          style: GoogleFonts.spaceMono(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
                if (confirm == true) {
                  await ref.read(authProvider.notifier).logout();
                }
              },
            ),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: [
          _buildDashboardBody(isDark),
          _visitedTabs.contains(1) ? const ScheduleScreen() : const SizedBox.shrink(),
          _visitedTabs.contains(2) ? const VotesScreen() : const SizedBox.shrink(),
          _visitedTabs.contains(3) ? const TodoScreen() : const SizedBox.shrink(),
          _visitedTabs.contains(4) ? const SettingsScreen() : const SizedBox.shrink(),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(top: BorderSide(color: borderSubtle, width: 0.8)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) {
            HapticFeedback.selectionClick();
            setState(() {
              _currentIndex = index;
              _visitedTabs.add(index);
            });
          },
          type: BottomNavigationBarType.fixed,
          backgroundColor: bgNav,
          elevation: 0,
          selectedItemColor: AppColors.primary(isDark),
          unselectedItemColor: textMuted,
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
      ),
    );
  }

  Widget _buildDashboardBody(bool isDark) {
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    final todoState = ref.watch(todoProvider);
    final scheduleState = ref.watch(scheduleProvider);
    final gameState = ref.watch(gameProvider);
    final ytState = ref.watch(youtubeProvider);

    final upcomingSchedules = scheduleState.schedules
        .where((s) => s.status.toLowerCase() == 'upcoming')
        .toList();
    final now = DateTime.now();
    final countdownSchedules = upcomingSchedules
        .where((schedule) {
          final scheduledAt = schedule.scheduledAt;
          return schedule.countdownEnabled &&
              scheduledAt != null &&
              scheduledAt.isAfter(now);
        })
        .toList()
      ..sort((a, b) => a.scheduledAt!.compareTo(b.scheduledAt!));
    final nextStream =
        countdownSchedules.isNotEmpty ? countdownSchedules.first : null;

    final totalVotes = gameState.voteStats?.totalVotes ??
        gameState.games.fold<int>(0, (sum, g) => sum + g.voteCount);

    final sortedGames = List.of(gameState.games)
      ..sort((a, b) => b.voteCount.compareTo(a.voteCount));
    final topGameTitle = sortedGames.isNotEmpty ? sortedGames.first.title : 'Belum Ada';

    final urgentTasksCount = todoState.todos.where((t) => t.isUrgent && !t.isCompleted).length;
    final pendingSchedulesCount = upcomingSchedules.length;

    final pendingTasksList = todoState.todos.where((t) => !t.isCompleted).take(3).toList();

    final subText = ytState.stats?.formattedSubscribers ?? '4,61 rb';
    final videoCountText = ytState.stats != null ? '${ytState.stats!.totalVideos} Video' : '703 Video';

    return RefreshIndicator(
      onRefresh: () async {
        HapticFeedback.lightImpact();
        await Future.wait([
          ref.read(todoProvider.notifier).fetchTodos(),
          ref.read(scheduleProvider.notifier).fetchSchedules(),
          ref.read(gameProvider.notifier).loadAllData(),
          ref.read(auditLogProvider.notifier).fetchLogs(),
          ref.read(youtubeProvider.notifier).fetchStats(),
        ]);
        if (mounted) {
          _showFloatingToast(
            context,
            message: 'Dashboard disinkronkan',
            isSuccess: true,
            icon: LucideIcons.check_check,
          );
        }
      },
      color: AppColors.primary(isDark),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildBroadcastingCard(isDark),
            const SizedBox(height: 16),

            CountdownWidget(
              schedules: scheduleState.schedules,
              targetDate: nextStream?.scheduledAt,
              streamTitle: nextStream?.title,
              onComplete: () {
                if (mounted) setState(() {});
              },
            ),
            const SizedBox(height: 16),

            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.35,
              children: [
                StatCard(
                  title: 'SUBSCRIBERS',
                  value: subText,
                  icon: Icons.play_circle_fill,
                  iconColor: AppColors.red(isDark),
                  badgeText: 'YOUTUBE',
                ),
                StatCard(
                  title: 'TOTAL VOTES',
                  value: totalVotes.toString(),
                  icon: LucideIcons.vote,
                  iconColor: AppColors.secondary(isDark),
                  badgeText: 'COMMUNITY',
                ),
                StatCard(
                  title: 'TOP GAME',
                  value: topGameTitle,
                  icon: LucideIcons.gamepad_2,
                  iconColor: AppColors.gold(isDark),
                  badgeText: '#1 RANK',
                ),
                StatCard(
                  title: 'SCHEDULES',
                  value: '$pendingSchedulesCount Upcoming',
                  icon: LucideIcons.calendar,
                  iconColor: AppColors.primary(isDark),
                  badgeText: 'AGENDA',
                ),
                StatCard(
                  title: 'TASKS',
                  value: '$urgentTasksCount Urgent',
                  icon: LucideIcons.list_todo,
                  iconColor: urgentTasksCount > 0 ? AppColors.red(isDark) : AppColors.emerald(isDark),
                  badgeText: urgentTasksCount > 0 ? 'ATTENTION' : 'CLEAR',
                ),
                StatCard(
                  title: 'TOTAL VIDEOS',
                  value: videoCountText,
                  icon: LucideIcons.video,
                  iconColor: AppColors.accentPurple,
                  badgeText: 'CONTENT',
                ),
              ],
            ),
            const SizedBox(height: 16),

            Container(
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
                      Row(
                        children: [
                          Icon(LucideIcons.list_todo, color: AppColors.primary(isDark), size: 16),
                          const SizedBox(width: 8),
                          Text(
                            'INTERNAL TASKS',
                            style: GoogleFonts.spaceMono(
                              fontSize: 11,
                              color: textSecondary,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: bgInput,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              '${pendingTasksList.length} Aktif',
                              style: GoogleFonts.spaceMono(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: textMuted,
                              ),
                            ),
                          ),
                        ],
                      ),
                      InkWell(
                        borderRadius: BorderRadius.circular(8),
                        onTap: () {
                          HapticFeedback.selectionClick();
                          setState(() {
                            _currentIndex = 3;
                            _visitedTabs.add(3);
                          });
                        },
                        child: Container(
                          constraints: const BoxConstraints(minHeight: 44, minWidth: 44),
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                          alignment: Alignment.center,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                'Buka To-Do',
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.primary(isDark),
                                ),
                              ),
                              const SizedBox(width: 4),
                              Icon(
                                LucideIcons.chevron_right,
                                color: AppColors.primary(isDark),
                                size: 15,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  if (todoState.isLoading && pendingTasksList.isEmpty)
                    Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Center(
                        child: SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(strokeWidth: 2.2, color: AppColors.primary(isDark)),
                        ),
                      ),
                    )
                  else if (pendingTasksList.isEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
                      decoration: BoxDecoration(
                        color: bgInput.withValues(alpha: 0.5),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        children: [
                          const Icon(LucideIcons.circle_check, color: AppColors.accentEmerald, size: 22),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Semua Task Selesai!',
                                  style: GoogleFonts.spaceGrotesk(
                                    color: textPrimary,
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  'Rig creator siap untuk persiapan siaran berikutnya.',
                                  style: GoogleFonts.spaceGrotesk(
                                    color: textMuted,
                                    fontSize: 11,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    ...pendingTasksList.asMap().entries.map((entry) {
                      final idx = entry.key;
                      final task = entry.value;
                      return Column(
                        children: [
                          _buildTaskTile(task, isDark),
                          if (idx < pendingTasksList.length - 1)
                            Divider(color: borderSubtle, height: 16),
                        ],
                      );
                    }),
                ],
              ),
            ),
            const SizedBox(height: 16),

            _buildAuditLogsSection(isDark),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildBroadcastingCard(bool isDark) {
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: bgSurface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: _isBroadcasting
              ? AppColors.accentRed.withValues(alpha: 0.7)
              : borderSubtle,
          width: _isBroadcasting ? 1.2 : 1.0,
        ),
        boxShadow: _isBroadcasting
            ? [
                BoxShadow(
                  color: AppColors.accentRed.withValues(alpha: isDark ? 0.22 : 0.12),
                  blurRadius: 16,
                  spreadRadius: 1,
                  offset: const Offset(0, 3),
                ),
              ]
            : null,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Row(
              children: [
                if (_isBroadcasting)
                  AnimatedBuilder(
                    animation: _pulseAnimation,
                    builder: (context, _) => Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: AppColors.accentRed,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.accentRed.withValues(
                              alpha: 0.4 + (0.5 * _pulseAnimation.value),
                            ),
                            blurRadius: 8 * _pulseAnimation.value,
                            spreadRadius: 2.5 * _pulseAnimation.value,
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: textMuted,
                      shape: BoxShape.circle,
                    ),
                  ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            _isBroadcasting ? 'BROADCASTING LIVE' : 'BROADCAST STANDBY',
                            style: GoogleFonts.spaceMono(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                              color: _isBroadcasting ? AppColors.accentRed : textSecondary,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: _isBroadcasting
                                  ? AppColors.accentRed.withValues(alpha: 0.15)
                                  : bgInput,
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(
                                color: _isBroadcasting
                                    ? AppColors.accentRed.withValues(alpha: 0.3)
                                    : borderSubtle,
                              ),
                            ),
                            child: Text(
                              _isBroadcasting ? 'ON AIR' : 'OFFLINE',
                              style: GoogleFonts.spaceMono(
                                fontSize: 8.5,
                                fontWeight: FontWeight.bold,
                                color: _isBroadcasting ? AppColors.accentRed : textMuted,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        _isBroadcasting
                            ? 'Siaran langsung aktif ke komunitas'
                            : 'Mode siaga / belum ada live aktif',
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 11,
                          color: textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          _isLoadingBroadcast
              ? const SizedBox(
                  width: 28,
                  height: 28,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.2,
                    color: AppColors.accentRed,
                  ),
                )
              : Switch(
                  value: _isBroadcasting,
                  activeThumbColor: AppColors.accentRed,
                  activeTrackColor: AppColors.accentRed.withValues(alpha: 0.35),
                  inactiveThumbColor: textMuted,
                  inactiveTrackColor: bgInput,
                  onChanged: (val) async {
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
                            Icon(
                              LucideIcons.radio,
                              color: val ? AppColors.accentRed : AppColors.accentCyan,
                              size: 20,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              val ? 'Mulai Live Broadcast?' : 'Hentikan Broadcast?',
                              style: GoogleFonts.spaceGrotesk(
                                color: textPrimary,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                        content: Text(
                          val
                              ? 'Status siaran akan diubah ke "LIVE ON AIR" dan ditampilkan kepada seluruh audiens di dashboard.'
                              : 'Status siaran akan dikembalikan ke "STANDBY / OFFLINE". Apakah Anda yakin ingin mengakhiri siaran?',
                          style: GoogleFonts.spaceGrotesk(
                            color: textSecondary,
                            fontSize: 13,
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
                              backgroundColor: val ? AppColors.accentRed : AppColors.accentCyan,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                            ),
                            onPressed: () {
                              HapticFeedback.selectionClick();
                              Navigator.pop(ctx, true);
                            },
                            child: Text(
                              val ? 'Ya, Mulai Live' : 'Ya, Hentikan',
                              style: GoogleFonts.spaceMono(
                                color: val ? Colors.white : Colors.black,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );

                    if (confirm == true && mounted) {
                      setState(() => _isLoadingBroadcast = true);
                      try {
                        final dio = ref.read(dioProvider);
                        try {
                          await dio.patch(
                            '/auth/broadcasting',
                            data: {'is_broadcasting': val, 'is_live': val},
                          );
                        } catch (_) {
                          await dio.patch(
                            '/dashboard/live-status',
                            data: {'is_broadcasting': val, 'is_live': val},
                          );
                        }

                        setState(() => _isBroadcasting = val);
                        await ref.read(scheduleProvider.notifier).fetchSchedules();
                        ref.read(auditLogProvider.notifier).fetchLogs();

                        if (mounted) {
                          _showFloatingToast(
                            context,
                            message: val
                                ? 'Status siaran diubah ke LIVE ON AIR!'
                                : 'Siaran telah dinonaktifkan (STANDBY).',
                            isSuccess: true,
                            icon: val ? LucideIcons.radio : LucideIcons.circle_check,
                          );
                        }
                      } catch (e) {
                        if (mounted) {
                          _showFloatingToast(
                            context,
                            message: 'Gagal mengubah status siaran: $e',
                            isSuccess: false,
                            icon: LucideIcons.circle_alert,
                          );
                        }
                      } finally {
                        if (mounted) {
                          setState(() => _isLoadingBroadcast = false);
                        }
                      }
                    }
                  },
                ),
        ],
      ),
    );
  }

  Widget _buildAuditLogsSection(bool isDark) {
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    final auditState = ref.watch(auditLogProvider);

    return Container(
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
              Row(
                children: [
                  Icon(LucideIcons.activity, color: AppColors.primary(isDark), size: 16),
                  const SizedBox(width: 8),
                  Text(
                    'AKTIVITAS TERKINI',
                    style: GoogleFonts.spaceMono(
                      fontSize: 11,
                      color: textSecondary,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
              SizedBox(
                width: 44,
                height: 44,
                child: IconButton(
                  tooltip: 'Segarkan Log',
                  icon: Icon(LucideIcons.refresh_cw, color: textMuted, size: 16),
                  onPressed: () {
                    HapticFeedback.lightImpact();
                    ref.read(auditLogProvider.notifier).fetchLogs();
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          if (auditState.isLoading && auditState.logs.isEmpty)
            Container(
              height: 100,
              alignment: Alignment.center,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary(isDark)),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Memuat riwayat aktivitas...',
                    style: GoogleFonts.spaceGrotesk(color: textMuted, fontSize: 11),
                  ),
                ],
              ),
            )
          else if (auditState.logs.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 20),
              child: Center(
                child: Column(
                  children: [
                    Icon(LucideIcons.scroll_text, color: textMuted, size: 28),
                    const SizedBox(height: 8),
                    Text(
                      'Belum ada log aktivitas sistem.',
                      style: GoogleFonts.spaceGrotesk(color: textMuted, fontSize: 12),
                    ),
                  ],
                ),
              ),
            )
          else
            ...auditState.logs.asMap().entries.map((entry) {
              final idx = entry.key;
              final log = entry.value;
              return Column(
                children: [
                  _buildLogItem(log, isDark),
                  if (idx < auditState.logs.length - 1)
                    Divider(color: borderSubtle, height: 16),
                ],
              );
            }),
        ],
      ),
    );
  }

  Widget _buildLogItem(AuditLogModel log, bool isDark) {
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;

    Color badgeColor = AppColors.accentCyan;
    final action = log.actionType.toUpperCase();
    if (action.contains('BROADCAST') || action.contains('LIVE')) {
      badgeColor = AppColors.accentRed;
    } else if (action.contains('DELETE') || action.contains('REJECT')) {
      badgeColor = AppColors.accentRed;
    } else if (action.contains('UPDATE') || action.contains('EDIT') || action.contains('STATUS')) {
      badgeColor = AppColors.accentGold;
    } else if (action.contains('KONTEN') || action.contains('CONTENT') || action.contains('SCHEDULE')) {
      badgeColor = AppColors.accentPurple;
    } else if (action.contains('CREATE') || action.contains('TAMBAH')) {
      badgeColor = AppColors.accentEmerald;
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(LucideIcons.clock, size: 12, color: textMuted),
            const SizedBox(width: 4),
            Text(
              log.timeAgo,
              style: GoogleFonts.spaceMono(fontSize: 10, color: textMuted),
            ),
          ],
        ),
        const SizedBox(width: 10),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
            color: badgeColor.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(
            log.actionType.replaceAll('_', ' '),
            style: GoogleFonts.spaceMono(
              fontSize: 9,
              fontWeight: FontWeight.bold,
              color: badgeColor,
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                log.description,
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 12,
                  color: textPrimary,
                  fontWeight: FontWeight.w600,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              if (log.subDetail != null && log.subDetail!.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 2),
                  child: Text(
                    log.subDetail!,
                    style: GoogleFonts.spaceMono(
                      fontSize: 10,
                      color: textMuted,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTaskTile(TodoModel task, bool isDark) {
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;

    return InkWell(
      borderRadius: BorderRadius.circular(8),
      onTap: () {
        HapticFeedback.selectionClick();
        setState(() {
          _currentIndex = 3;
          _visitedTabs.add(3);
        });
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4.0),
        child: Row(
          children: [
            Icon(
              task.isUrgent ? LucideIcons.circle_alert : LucideIcons.circle_dot,
              color: task.isUrgent ? AppColors.accentRed : AppColors.accentGold,
              size: 18,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          task.title,
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: textPrimary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (task.isUrgent)
                        Container(
                          margin: const EdgeInsets.only(left: 6),
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                          decoration: BoxDecoration(
                            color: AppColors.accentRed.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'URGENT',
                            style: GoogleFonts.spaceMono(
                              fontSize: 8.5,
                              fontWeight: FontWeight.bold,
                              color: AppColors.accentRed,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    task.description?.isNotEmpty == true
                        ? task.description!
                        : 'Tidak ada detail keterangan',
                    style: GoogleFonts.spaceMono(
                      fontSize: 10,
                      color: textSecondary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 6),
            Icon(
              LucideIcons.chevron_right,
              color: textSecondary.withValues(alpha: 0.5),
              size: 14,
            ),
          ],
        ),
      ),
    );
  }
}