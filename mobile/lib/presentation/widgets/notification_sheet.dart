import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../../core/theme/app_theme.dart';
import '../providers/notification_provider.dart';
import '../providers/schedule_provider.dart' show dashboardTabProvider;

class NotificationSheet extends ConsumerStatefulWidget {
  const NotificationSheet({super.key});

  static Future<void> show(BuildContext context) {
    HapticFeedback.lightImpact();
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const NotificationSheet(),
    );
  }

  @override
  ConsumerState<NotificationSheet> createState() => _NotificationSheetState();
}

class _NotificationSheetState extends ConsumerState<NotificationSheet> {
  int _selectedFilter = 0; // 0: Semua, 1: Belum Dibaca

  String _formatTimeAgo(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);

    if (diff.inMinutes < 1) return 'Baru saja';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m lalu';
    if (diff.inHours < 24) return '${diff.inHours}j lalu';
    return '${diff.inDays}h lalu';
  }

  _NotificationTypeConfig _getTypeConfig(String type, bool isDark) {
    switch (type.toUpperCase()) {
      case 'VOTE_SPIKE':
      case 'VOTE_RECEIVED':
        return _NotificationTypeConfig(
          icon: LucideIcons.trending_up,
          color: AppColors.accentCyan,
          bg: AppColors.accentCyan.withValues(alpha: 0.12),
          border: AppColors.accentCyan.withValues(alpha: 0.35),
          label: 'VOTE SPIKE',
        );
      case 'NEW_GAME_REQUEST':
      case 'GAME_REQUESTED':
        return _NotificationTypeConfig(
          icon: LucideIcons.gamepad_2,
          color: AppColors.accentPurple,
          bg: AppColors.accentPurple.withValues(alpha: 0.12),
          border: AppColors.accentPurple.withValues(alpha: 0.35),
          label: 'GAME REQUEST',
        );
      case 'NEW_COLLAB_REQUEST':
      case 'COLLAB_REQUESTED':
        return _NotificationTypeConfig(
          icon: LucideIcons.users,
          color: AppColors.accentPurple,
          bg: AppColors.accentPurple.withValues(alpha: 0.12),
          border: AppColors.accentPurple.withValues(alpha: 0.35),
          label: 'COLLAB REQUEST',
        );
      case 'TODO_DEADLINE':
        return _NotificationTypeConfig(
          icon: LucideIcons.circle_alert,
          color: AppColors.accentRed,
          bg: AppColors.accentRed.withValues(alpha: 0.12),
          border: AppColors.accentRed.withValues(alpha: 0.35),
          label: 'DEADLINE',
        );
      case 'SCHEDULE_REMINDER':
      case 'SCHEDULE_UPCOMING':
        return _NotificationTypeConfig(
          icon: LucideIcons.calendar,
          color: AppColors.accentGold,
          bg: AppColors.accentGold.withValues(alpha: 0.12),
          border: AppColors.accentGold.withValues(alpha: 0.35),
          label: 'JADWAL',
        );
      case 'BROADCASTING_START':
        return _NotificationTypeConfig(
          icon: LucideIcons.radio,
          color: AppColors.accentCyan,
          bg: AppColors.accentCyan.withValues(alpha: 0.12),
          border: AppColors.accentCyan.withValues(alpha: 0.35),
          label: 'BROADCAST',
        );
      default:
        return _NotificationTypeConfig(
          icon: LucideIcons.bell,
          color: isDark ? AppColors.textSecondary : AppColors.textSecondaryLight,
          bg: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.08),
          border: isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight,
          label: 'SISTEM',
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final notifState = ref.watch(notificationProvider);
    final allNotifications = notifState.notifications;
    final unreadCount = notifState.unreadCount;

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    final displayedList = _selectedFilter == 1
        ? allNotifications.where((n) => !n.read).toList()
        : allNotifications;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.85,
      ),
      decoration: BoxDecoration(
        color: bgSurface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        border: Border.all(color: borderSubtle, width: 1),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag Handle
          Center(
            child: Container(
              width: 36,
              height: 4,
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              decoration: BoxDecoration(
                color: borderSubtle,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: AppColors.accentCyan.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: AppColors.accentCyan.withValues(alpha: 0.3),
                          width: 0.8,
                        ),
                      ),
                      child: const Icon(LucideIcons.bell, color: AppColors.accentCyan, size: 18),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'NOTIFIKASI STUDIO',
                          style: GoogleFonts.spaceMono(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: AppColors.accentCyan,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Text(
                          unreadCount > 0 ? '$unreadCount belum dibaca' : 'Semua sudah dibaca',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: unreadCount > 0 ? AppColors.accentCyan : textMuted,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),

                Row(
                  children: [
                    if (unreadCount > 0)
                      IconButton(
                        tooltip: 'Tandai semua dibaca',
                        icon: const Icon(LucideIcons.check_check, size: 18, color: AppColors.accentCyan),
                        onPressed: () {
                          HapticFeedback.lightImpact();
                          ref.read(notificationProvider.notifier).markAllAsRead();
                        },
                      ),
                    if (allNotifications.isNotEmpty)
                      IconButton(
                        tooltip: 'Hapus semua',
                        icon: Icon(LucideIcons.trash, size: 18, color: textMuted),
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
                                  const Icon(LucideIcons.trash, color: AppColors.accentRed, size: 20),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Hapus Notifikasi',
                                    style: GoogleFonts.spaceGrotesk(
                                      fontWeight: FontWeight.bold,
                                      color: textPrimary,
                                      fontSize: 16,
                                    ),
                                  ),
                                ],
                              ),
                              content: Text(
                                'Semua riwayat notifikasi akan dihapus dari daftar.',
                                style: GoogleFonts.spaceGrotesk(color: textSecondary, fontSize: 13),
                              ),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.pop(ctx, false),
                                  child: Text('Batal', style: GoogleFonts.spaceGrotesk(color: textMuted)),
                                ),
                                ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.accentRed,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                  ),
                                  onPressed: () => Navigator.pop(ctx, true),
                                  child: Text('Hapus Semua',
                                      style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.bold)),
                                ),
                              ],
                            ),
                          );

                          if (confirm == true) {
                            ref.read(notificationProvider.notifier).clearAll();
                          }
                        },
                      ),
                    IconButton(
                      tooltip: 'Tutup',
                      icon: Icon(LucideIcons.x, size: 18, color: textMuted),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Filter Chips (Semua vs Belum Dibaca)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
            child: Row(
              children: [
                _buildFilterChip(
                  label: 'Semua (${allNotifications.length})',
                  index: 0,
                  isDark: isDark,
                  textPrimary: textPrimary,
                  textMuted: textMuted,
                  bgInput: bgInput,
                ),
                const SizedBox(width: 8),
                _buildFilterChip(
                  label: 'Belum Dibaca ($unreadCount)',
                  index: 1,
                  isDark: isDark,
                  textPrimary: textPrimary,
                  textMuted: textMuted,
                  bgInput: bgInput,
                ),
              ],
            ),
          ),

          const SizedBox(height: 8),
          Divider(color: borderSubtle.withValues(alpha: 0.5), height: 1),

          // Notification List
          Expanded(
            child: displayedList.isEmpty
                ? _buildEmptyState(textPrimary, textMuted, borderSubtle, isDark)
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    itemCount: displayedList.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (ctx, index) {
                      final notif = displayedList[index];
                      final config = _getTypeConfig(notif.type, isDark);

                      return Dismissible(
                        key: ValueKey(notif.id),
                        direction: DismissDirection.endToStart,
                        background: Container(
                          alignment: Alignment.centerRight,
                          padding: const EdgeInsets.only(right: 20),
                          decoration: BoxDecoration(
                            color: AppColors.accentRed.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Icon(LucideIcons.trash, color: AppColors.accentRed, size: 20),
                        ),
                        onDismissed: (_) {
                          HapticFeedback.lightImpact();
                          ref.read(notificationProvider.notifier).deleteNotification(notif.id);
                        },
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: () {
                              HapticFeedback.selectionClick();
                              if (!notif.read) {
                                ref.read(notificationProvider.notifier).markAsRead(notif.id);
                              }
                              Navigator.pop(context);
                              if (notif.targetTab != null) {
                                ref.read(dashboardTabProvider.notifier).state = notif.targetTab!;
                              }
                            },
                            borderRadius: BorderRadius.circular(14),
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: !notif.read
                                    ? AppColors.accentCyan.withValues(alpha: isDark ? 0.05 : 0.04)
                                    : (isDark ? bgInput.withValues(alpha: 0.4) : Colors.white),
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(
                                  color: !notif.read
                                      ? AppColors.accentCyan.withValues(alpha: 0.4)
                                      : borderSubtle,
                                  width: !notif.read ? 1.2 : 0.8,
                                ),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Left unread bar indicator
                                  if (!notif.read)
                                    Container(
                                      width: 3.5,
                                      height: 36,
                                      margin: const EdgeInsets.only(right: 10),
                                      decoration: BoxDecoration(
                                        color: AppColors.accentCyan,
                                        borderRadius: BorderRadius.circular(2),
                                      ),
                                    ),

                                  // Type Icon
                                  Container(
                                    width: 36,
                                    height: 36,
                                    decoration: BoxDecoration(
                                      color: config.bg,
                                      borderRadius: BorderRadius.circular(10),
                                      border: Border.all(color: config.border, width: 0.8),
                                    ),
                                    child: Icon(config.icon, color: config.color, size: 18),
                                  ),
                                  const SizedBox(width: 12),

                                  // Content
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Expanded(
                                              child: Text(
                                                notif.title,
                                                style: GoogleFonts.spaceGrotesk(
                                                  fontSize: 13,
                                                  fontWeight: notif.read ? FontWeight.w600 : FontWeight.bold,
                                                  color: textPrimary,
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                            const SizedBox(width: 6),
                                            Text(
                                              _formatTimeAgo(notif.createdAt),
                                              style: GoogleFonts.spaceMono(
                                                fontSize: 10,
                                                color: textMuted,
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 3),
                                        Text(
                                          notif.message,
                                          style: GoogleFonts.spaceGrotesk(
                                            fontSize: 11.5,
                                            color: notif.read ? textMuted : textSecondary,
                                            height: 1.3,
                                          ),
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        const SizedBox(height: 6),
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: config.bg,
                                                borderRadius: BorderRadius.circular(4),
                                                border: Border.all(color: config.border, width: 0.6),
                                              ),
                                              child: Text(
                                                config.label,
                                                style: GoogleFonts.spaceMono(
                                                  fontSize: 8.5,
                                                  fontWeight: FontWeight.bold,
                                                  color: config.color,
                                                ),
                                              ),
                                            ),
                                            if (notif.targetTab != null)
                                              Row(
                                                children: [
                                                  Text(
                                                    'Buka',
                                                    style: GoogleFonts.spaceMono(
                                                      fontSize: 10,
                                                      fontWeight: FontWeight.bold,
                                                      color: AppColors.accentCyan,
                                                    ),
                                                  ),
                                                  const SizedBox(width: 2),
                                                  const Icon(LucideIcons.chevron_right, size: 12, color: AppColors.accentCyan),
                                                ],
                                              ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip({
    required String label,
    required int index,
    required bool isDark,
    required Color textPrimary,
    required Color textMuted,
    required Color bgInput,
  }) {
    final isSelected = _selectedFilter == index;
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        setState(() => _selectedFilter = index);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.accentCyan.withValues(alpha: 0.15)
              : (isDark ? bgInput : Colors.white),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected
                ? AppColors.accentCyan.withValues(alpha: 0.5)
                : (isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight),
            width: 0.8,
          ),
        ),
        child: Text(
          label,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            color: isSelected ? AppColors.accentCyan : textMuted,
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(Color textPrimary, Color textMuted, Color borderSubtle, bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: borderSubtle, width: 0.8),
              ),
              child: Icon(LucideIcons.bell, size: 24, color: textMuted.withValues(alpha: 0.5)),
            ),
            const SizedBox(height: 14),
            Text(
              'Belum Ada Notifikasi',
              style: GoogleFonts.spaceGrotesk(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Aktivitas baru studio, voting, dan jadwal stream akan muncul di sini.',
              textAlign: TextAlign.center,
              style: GoogleFonts.spaceGrotesk(
                fontSize: 12,
                color: textMuted,
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NotificationTypeConfig {
  final IconData icon;
  final Color color;
  final Color bg;
  final Color border;
  final String label;

  _NotificationTypeConfig({
    required this.icon,
    required this.color,
    required this.bg,
    required this.border,
    required this.label,
  });
}
