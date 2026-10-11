import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';

class CountdownWidget extends StatefulWidget {
  final DateTime targetDate;
  final String streamTitle;

  const CountdownWidget({
    super.key,
    required this.targetDate,
    required this.streamTitle,
  });

  @override
  State<CountdownWidget> createState() => _CountdownWidgetState();
}

class _CountdownWidgetState extends State<CountdownWidget> {
  late Timer _timer;
  Duration _duration = Duration.zero;

  @override
  void initState() {
    super.initState();
    _updateTime();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => _updateTime());
  }

  void _updateTime() {
    final now = DateTime.now();
    final difference = widget.targetDate.difference(now);
    setState(() {
      _duration = difference.isNegative ? Duration.zero : difference;
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  String _twoDigits(int n) => n.toString().padLeft(2, '0');

  @override
  Widget build(BuildContext context) {
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
              Text(
                'NEXT STREAM COUNTDOWN',
                style: GoogleFonts.spaceMono(
                  fontSize: 11,
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.accentPurple.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(6),
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
            widget.streamTitle,
            style: GoogleFonts.spaceGrotesk(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            '${hours}h : ${minutes}m : ${seconds}s',
            style: GoogleFonts.spaceMono(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.accentCyan,
              letterSpacing: 2,
            ),
          ),
        ],
      ),
    );
  }
}