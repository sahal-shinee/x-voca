import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/schedule_model.dart';

class CountdownWidget extends StatefulWidget {
  final List<ScheduleModel>? schedules;
  final DateTime? targetDate;
  final String? streamTitle;
  final VoidCallback? onComplete;
  final VoidCallback? onWatchLive;
  final String? youtubeUrl;

  const CountdownWidget({
    super.key,
    this.schedules,
    this.targetDate,
    this.streamTitle,
    this.onComplete,
    this.onWatchLive,
    this.youtubeUrl,
  });

  @override
  State<CountdownWidget> createState() => _CountdownWidgetState();
}

class _CountdownWidgetState extends State<CountdownWidget> {
  Timer? _timer;
  Duration _duration = Duration.zero;
  bool _completionNotified = false;

  ScheduleModel? _resolveNextUpcoming() {
    if (widget.schedules == null || widget.schedules!.isEmpty) return null;

    final upcoming = widget.schedules!
        .where((s) =>
            s.status.toLowerCase() == 'upcoming' && s.scheduledAt != null)
        .toList();

    if (upcoming.isEmpty) return null;

    final now = DateTime.now();
    final futureUpcoming =
        upcoming.where((s) => s.scheduledAt!.isAfter(now)).toList();
    if (futureUpcoming.isNotEmpty) {
      futureUpcoming.sort((a, b) => a.scheduledAt!.compareTo(b.scheduledAt!));
      return futureUpcoming.first;
    }

    upcoming.sort((a, b) => a.scheduledAt!.compareTo(b.scheduledAt!));
    return upcoming.last;
  }

  DateTime? get _effectiveTargetDate {
    if (widget.targetDate != null) return widget.targetDate;
    final next = _resolveNextUpcoming();
    return next?.scheduledAt;
  }

  String? get _effectiveStreamTitle {
    if (widget.streamTitle != null) return widget.streamTitle;
    final next = _resolveNextUpcoming();
    return next?.title;
  }

  String? get _effectiveYoutubeUrl {
    if (widget.youtubeUrl != null) return widget.youtubeUrl;
    final next = _resolveNextUpcoming();
    return next?.youtubeUrl;
  }

  @override
  void initState() {
    super.initState();
    _updateTime();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => _updateTime());
  }

  void _updateTime() {
    final targetDate = _effectiveTargetDate;
    if (targetDate == null) {
      if (mounted && _duration != Duration.zero) {
        setState(() => _duration = Duration.zero);
      }
      return;
    }

    final now = DateTime.now();
    final difference = targetDate.difference(now);

    if (difference <= Duration.zero) {
      if (!_completionNotified) {
        _completionNotified = true;
        if (mounted) {
          setState(() => _duration = Duration.zero);
        }
        widget.onComplete?.call();
      }
      return;
    }

    if (mounted) {
      setState(() {
        _duration = difference;
      });
    }
  }

  @override
  void didUpdateWidget(covariant CountdownWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.targetDate != widget.targetDate ||
        oldWidget.schedules != widget.schedules) {
      _completionNotified = false;
      _updateTime();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _twoDigits(int n) => n.toString().padLeft(2, '0');

  Future<void> _launchUrl(String urlString) async {
    HapticFeedback.lightImpact();
    final uri = Uri.tryParse(urlString);
    if (uri != null && await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    final targetDate = _effectiveTargetDate;
    final streamTitle = _effectiveStreamTitle;
    final youtubeUrl = _effectiveYoutubeUrl;

    // ==========================================
    // STANDBY MODE (Tidak ada jadwal aktif)
    // ==========================================
    if (targetDate == null || streamTitle == null) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        decoration: BoxDecoration(
          color: bgSurface,
          borderRadius: BorderRadius.circular(AppColors.radiusCard),
          border: Border.all(color: borderSubtle, width: AppColors.borderWidth),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: bgInput,
                shape: BoxShape.circle,
                border: Border.all(color: borderSubtle),
              ),
              child: Icon(
                LucideIcons.calendar_x,
                color: textMuted,
                size: 32,
              ),
            ),
            const SizedBox(height: 14),
            Text(
              'Belum Ada Jadwal Siaran',
              style: GoogleFonts.spaceGrotesk(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Tambahkan jadwal siaran baru pada modul Schedule untuk mengaktifkan countdown.',
              style: GoogleFonts.spaceMono(
                fontSize: 10,
                color: textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    // ==========================================
    // COUNTDOWN MODE AKTIF
    // ==========================================
    final int days = _duration.inDays;
    final int hours = _duration.inHours.remainder(24);
    final int minutes = _duration.inMinutes.remainder(60);
    final int seconds = _duration.inSeconds.remainder(60);

    final daysStr = _twoDigits(days);
    final hoursStr = _twoDigits(hours);
    final minutesStr = _twoDigits(minutes);
    final secondsStr = _twoDigits(seconds);

    final hasYoutube = youtubeUrl?.isNotEmpty == true;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgSurface,
        borderRadius: BorderRadius.circular(AppColors.radiusCard),
        border: Border.all(color: borderSubtle, width: AppColors.borderWidth),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary(isDark).withValues(alpha: isDark ? 0.08 : 0.04),
            blurRadius: 14,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Timer Icon + Title + Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(
                    LucideIcons.timer,
                    size: 15,
                    color: AppColors.primary(isDark),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'NEXT STREAM COUNTDOWN',
                    style: GoogleFonts.spaceMono(
                      fontSize: 10.5,
                      color: textSecondary,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.accentPurple.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(AppColors.radiusBadge),
                  border: Border.all(
                    color: AppColors.accentPurple.withValues(alpha: 0.35),
                  ),
                ),
                child: Text(
                  'UPCOMING',
                  style: GoogleFonts.spaceMono(
                    fontSize: 9,
                    color: AppColors.accentPurple,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Judul Siaran
          Text(
            streamTitle,
            style: GoogleFonts.spaceGrotesk(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: textPrimary,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 14),

          // Structured Digit Blocks (HARI, JAM, MENIT, DETIK)
          Row(
            children: [
              _buildTimeBox(
                daysStr,
                'HARI',
                bgInput,
                borderSubtle,
                AppColors.primary(isDark),
                textMuted,
              ),
              _buildColonSeparator(textMuted),
              _buildTimeBox(
                hoursStr,
                'JAM',
                bgInput,
                borderSubtle,
                AppColors.primary(isDark),
                textMuted,
              ),
              _buildColonSeparator(textMuted),
              _buildTimeBox(
                minutesStr,
                'MENIT',
                bgInput,
                borderSubtle,
                AppColors.primary(isDark),
                textMuted,
              ),
              _buildColonSeparator(textMuted),
              _buildTimeBox(
                secondsStr,
                'DETIK',
                bgInput,
                borderSubtle,
                AppColors.primary(isDark),
                textMuted,
                isPulse: true,
              ),
            ],
          ),

          // Tautan Video Live Opsional
          if (hasYoutube || widget.onWatchLive != null) ...[
            const SizedBox(height: 12),
            InkWell(
              borderRadius: BorderRadius.circular(8),
              onTap: () {
                if (widget.onWatchLive != null) {
                  widget.onWatchLive!();
                } else if (hasYoutube) {
                  _launchUrl(youtubeUrl!);
                }
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                decoration: BoxDecoration(
                  color: bgInput.withValues(alpha: 0.6),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: borderSubtle),
                ),
                child: Row(
                  children: [
                    const Icon(LucideIcons.video, size: 14, color: AppColors.accentRed),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        hasYoutube ? youtubeUrl! : 'Tonton Siaran Live',
                        style: GoogleFonts.spaceMono(
                          fontSize: 10,
                          color: AppColors.secondary(isDark),
                          decoration: TextDecoration.underline,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Icon(LucideIcons.external_link, size: 12, color: AppColors.secondary(isDark)),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTimeBox(
    String value,
    String label,
    Color bgInput,
    Color borderSubtle,
    Color accentColor,
    Color textMuted, {
    bool isPulse = false,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: bgInput,
          borderRadius: BorderRadius.circular(AppColors.radiusInput),
          border: Border.all(
            color: borderSubtle,
            width: AppColors.borderWidth,
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 250),
              transitionBuilder: (child, animation) => FadeTransition(
                opacity: animation,
                child: child,
              ),
              child: Text(
                value,
                key: ValueKey<String>(value),
                style: GoogleFonts.spaceMono(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: accentColor,
                ),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: GoogleFonts.spaceMono(
                fontSize: 8.5,
                color: textMuted,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildColonSeparator(Color textMuted) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: Text(
        ':',
        style: GoogleFonts.spaceMono(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: textMuted,
        ),
      ),
    );
  }
}
