import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/schedule_model.dart';

class CountdownWidget extends StatefulWidget {
  final List<ScheduleModel>? schedules;
  final DateTime? targetDate;
  final String? streamTitle;
  final VoidCallback? onComplete;

  const CountdownWidget({
    super.key,
    this.schedules,
    this.targetDate,
    this.streamTitle,
    this.onComplete,
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
        .where((s) => s.status.toLowerCase() == 'upcoming' && s.scheduledAt != null)
        .toList();

    if (upcoming.isEmpty) return null;

    final now = DateTime.now();
    // Prioritaskan jadwal di masa depan yang paling dekat
    final futureUpcoming = upcoming.where((s) => s.scheduledAt!.isAfter(now)).toList();
    if (futureUpcoming.isNotEmpty) {
      futureUpcoming.sort((a, b) => a.scheduledAt!.compareTo(b.scheduledAt!));
      return futureUpcoming.first;
    }

    // Jika waktu terlewat tapi masih berstatus upcoming, ambil yang paling mendekati sekarang
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

  @override
  Widget build(BuildContext context) {
    final targetDate = _effectiveTargetDate;
    final streamTitle = _effectiveStreamTitle;

    // Empty State: Jika daftar jadwal kosong atau belum ada stream upcoming
    if (targetDate == null || streamTitle == null) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        decoration: BoxDecoration(
          color: AppColors.bgSurface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.borderSubtle),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.bgInput,
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.borderSubtle),
              ),
              child: const Icon(
                LucideIcons.calendar_x,
                color: AppColors.textMuted,
                size: 32,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Belum ada jadwal stream',
              style: GoogleFonts.spaceGrotesk(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Tambahkan jadwal siaran baru pada tab Schedule',
              style: GoogleFonts.spaceMono(
                fontSize: 10,
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    // Real-time Countdown Active
    final hours = _twoDigits(_duration.inHours);
    final minutes = _twoDigits(_duration.inMinutes.remainder(60));
    final seconds = _twoDigits(_duration.inSeconds.remainder(60));

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.bgSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(
                    LucideIcons.timer,
                    size: 14,
                    color: AppColors.accentCyan,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'NEXT STREAM COUNTDOWN',
                    style: GoogleFonts.spaceMono(
                      fontSize: 11,
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.accentPurple.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(
                    color: AppColors.accentPurple.withValues(alpha: 0.4),
                  ),
                ),
                child: Text(
                  'UPCOMING',
                  style: GoogleFonts.spaceMono(
                    fontSize: 10,
                    color: AppColors.accentPurple,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            streamTitle,
            style: GoogleFonts.spaceGrotesk(
              fontSize: 17,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              _buildTimeBox(hours, 'JAM'),
              _buildColonSeparator(),
              _buildTimeBox(minutes, 'MENIT'),
              _buildColonSeparator(),
              _buildTimeBox(seconds, 'DETIK'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTimeBox(String value, String label) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.bgInput,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.borderSubtle),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: GoogleFonts.spaceMono(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: AppColors.accentCyan,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: GoogleFonts.spaceMono(
                fontSize: 9,
                color: AppColors.textMuted,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildColonSeparator() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 6),
      child: Text(
        ':',
        style: GoogleFonts.spaceMono(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: AppColors.textMuted,
        ),
      ),
    );
  }
}
