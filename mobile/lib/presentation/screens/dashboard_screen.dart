import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/todo_model.dart';
import '../providers/auth_provider.dart';
import '../providers/todo_provider.dart';
import '../providers/schedule_provider.dart';
import '../providers/game_provider.dart';
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
  bool _isLoadingBroadcast = false;

  // Set untuk mencatat tab mana saja yang sudah pernah dibuka (Lazy Loading)
  final Set<int> _visitedTabs = {0};

  @override
  Widget build(BuildContext context) {
    // Sinkronkan toggle siaran dengan data live yang masuk dari scheduleProvider
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

    // KODE BARU (SUDAH AMAN NULL-SAFETY):
final String creatorName = (user?.name != null && user!.name.isNotEmpty)
    ? user!.name
    : 'Xion Regalia';

final String rigName = (user?.rigName != null && user!.rigName!.isNotEmpty)
    ? user!.rigName!
    : 'Obsidian Rig #03';

    return Scaffold(
      backgroundColor: bgBase,
      appBar: AppBar(
        backgroundColor: bgNav,
        elevation: 0,
        title: Row(
          children: [
            CircleAvatar(
              radius: 16,
              backgroundColor: AppColors.accentPurple,
              child: Text(
                creatorName[0].toUpperCase(),
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
                  creatorName,
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: textPrimary,
                  ),
                ),
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
        actions: [
          IconButton(
            icon: Icon(LucideIcons.refresh_cw, color: textSecondary, size: 18),
            onPressed: () {
              ref.read(todoProvider.notifier).fetchTodos();
              ref.read(scheduleProvider.notifier).fetchSchedules();
              ref.read(gameProvider.notifier).loadAllData();
            },
          ),
          IconButton(
            icon: const Icon(LucideIcons.log_out, color: AppColors.accentRed, size: 20),
            onPressed: () async {
              final confirm = await showDialog<bool>(
                context: context,
                builder: (ctx) => AlertDialog(
                  backgroundColor: bgSurface,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(color: borderSubtle),
                  ),
                  title: Text(
                    'Konfirmasi Logout',
                    style: TextStyle(color: textPrimary),
                  ),
                  content: Text(
                    'Yakin ingin keluar dari X-VOCA?',
                    style: TextStyle(color: textSecondary),
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(ctx, false),
                      child: Text('Batal', style: TextStyle(color: textMuted)),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(ctx, true),
                      child: const Text('Logout', style: TextStyle(color: AppColors.accentRed)),
                    ),
                  ],
                ),
              );
              if (confirm == true) {
                await ref.read(authProvider.notifier).logout();
              }
            },
          ),
        ],
      ),
      // Lazy IndexedStack: Hanya render widget yang tab-nya sudah pernah dibuka
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
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
            _visitedTabs.add(index);
          });
        },
        type: BottomNavigationBarType.fixed,
        backgroundColor: bgNav,
        selectedItemColor: isDark ? AppColors.accentCyan : AppColors.accentPurple,
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
    );
  }

  Widget _buildDashboardBody(bool isDark) {
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    final todoState = ref.watch(todoProvider);
    final scheduleState = ref.watch(scheduleProvider);
    final gameState = ref.watch(gameProvider);

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

    return RefreshIndicator(
      onRefresh: () async {
        await Future.wait([
          ref.read(todoProvider.notifier).fetchTodos(),
          ref.read(scheduleProvider.notifier).fetchSchedules(),
          ref.read(gameProvider.notifier).loadAllData(),
        ]);
      },
      color: AppColors.accentCyan,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Container Toggle Broadcasting Live
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: bgSurface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: borderSubtle),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(
                        LucideIcons.radio,
                        color: _isBroadcasting ? AppColors.accentRed : textMuted,
                        size: 20,
                      ),
                      const SizedBox(width: 10),
                      Text(
                        _isBroadcasting ? 'BROADCASTING LIVE' : 'BROADCAST OFF',
                        style: GoogleFonts.spaceMono(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: _isBroadcasting ? AppColors.accentRed : textSecondary,
                        ),
                      ),
                    ],
                  ),
                  _isLoadingBroadcast
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: AppColors.accentRed,
                          ),
                        )
                      : Switch(
                          value: _isBroadcasting,
                          activeThumbColor: AppColors.accentRed,
                          onChanged: (val) async {
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
                                      ? 'Apakah Anda yakin ingin mengaktifkan status siaran live (Broadcasting Live)?'
                                      : 'Apakah Anda yakin ingin menonaktifkan status siaran live?',
                                  style: GoogleFonts.spaceMono(
                                    color: textSecondary,
                                    fontSize: 12,
                                  ),
                                ),
                                actions: [
                                  TextButton(
                                    onPressed: () => Navigator.pop(ctx, false),
                                    child: Text(
                                      'Batal',
                                      style: GoogleFonts.spaceMono(color: textMuted),
                                    ),
                                  ),
                                  ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: val ? AppColors.accentRed : AppColors.accentCyan,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                    onPressed: () => Navigator.pop(ctx, true),
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
                                await dio.patch(
                                  '/api/dashboard/live-status',
                                  data: {'is_live': val},
                                );

                                setState(() => _isBroadcasting = val);
                                await ref.read(scheduleProvider.notifier).fetchSchedules();

                                if (mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(
                                        val
                                            ? 'Status siaran diubah ke LIVE!'
                                            : 'Siaran telah dinonaktifkan.',
                                        style: GoogleFonts.spaceMono(),
                                      ),
                                      backgroundColor:
                                          val ? AppColors.accentRed : AppColors.accentCyan,
                                    ),
                                  );
                                }
                              } catch (e) {
                                if (mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(
                                        'Gagal mengubah status siaran: $e',
                                        style: GoogleFonts.spaceMono(),
                                      ),
                                      backgroundColor: AppColors.accentRed,
                                    ),
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
            ),
            const SizedBox(height: 16),

            // Countdown Widget Dinamis
            CountdownWidget(
              targetDate: nextStream?.scheduledAt,
              streamTitle: nextStream?.title,
              onComplete: () {
                if (mounted) setState(() {});
              },
            ),
            const SizedBox(height: 16),

            // Stat Cards Grid
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.3,
              children: [
                StatCard(
                  title: 'TOTAL VOTES',
                  value: totalVotes.toString(),
                  icon: LucideIcons.vote,
                  iconColor: AppColors.accentCyan,
                  badgeText: 'LIVE',
                ),
                StatCard(
                  title: 'TOP GAME',
                  value: topGameTitle,
                  icon: LucideIcons.gamepad_2,
                  iconColor: AppColors.accentGold,
                  badgeText: '#1 RANK',
                ),
                StatCard(
                  title: 'SCHEDULES',
                  value: '$pendingSchedulesCount Upcoming',
                  icon: LucideIcons.calendar,
                  iconColor: AppColors.accentPurple,
                ),
                StatCard(
                  title: 'TASKS',
                  value: '$urgentTasksCount Urgent',
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
                      Text(
                        'INTERNAL TASKS',
                        style: GoogleFonts.spaceMono(
                          fontSize: 11,
                          color: textSecondary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      GestureDetector(
                        onTap: () {
                          setState(() {
                            _currentIndex = 3;
                            _visitedTabs.add(3);
                          });
                        },
                        child: Row(
                          children: [
                            Text(
                              'Lihat Semua',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 11,
                                color: isDark ? AppColors.accentCyan : AppColors.accentPurple,
                              ),
                            ),
                            const SizedBox(width: 4),
                            Icon(
                              LucideIcons.chevron_right,
                              color: isDark ? AppColors.accentCyan : AppColors.accentPurple,
                              size: 16,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  if (todoState.isLoading && pendingTasksList.isEmpty)
                    const Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Center(child: CircularProgressIndicator(color: AppColors.accentCyan)),
                    )
                  else if (pendingTasksList.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12.0),
                      child: Text(
                        'Semua task sudah selesai!',
                        style: GoogleFonts.spaceGrotesk(color: textMuted, fontSize: 13),
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
          ],
        ),
      ),
    );
  }

  Widget _buildTaskTile(TodoModel task, bool isDark) {
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;

    return Row(
      children: [
        Icon(
          task.isUrgent ? LucideIcons.circle_alert : LucideIcons.clock,
          color: task.isUrgent ? AppColors.accentRed : AppColors.accentGold,
          size: 18,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                task.title,
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: textPrimary,
                ),
              ),
              Text(
                task.description?.isNotEmpty == true
                    ? task.description!
                    : 'Tidak ada detail keterangan',
                style: GoogleFonts.spaceMono(
                  fontSize: 10,
                  color: textSecondary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}