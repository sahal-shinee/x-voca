import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../../core/theme/app_theme.dart';

class VoteOption {
  final String id;
  final String text;
  int votesCount;

  VoteOption({
    required this.id,
    required this.text,
    required this.votesCount,
  });
}

class VotePoll {
  final String id;
  final String title;
  final String category;
  final DateTime expiresAt;
  final List<VoteOption> options;
  String? selectedOptionId;
  final bool isClosed;

  VotePoll({
    required this.id,
    required this.title,
    required this.category,
    required this.expiresAt,
    required this.options,
    this.selectedOptionId,
    this.isClosed = false,
  });

  int get totalVotes => options.fold(0, (sum, item) => sum + item.votesCount);
}

class VotesScreen extends ConsumerStatefulWidget {
  const VotesScreen({super.key});

  @override
  ConsumerState<VotesScreen> createState() => _VotesScreenState();
}

class _VotesScreenState extends ConsumerState<VotesScreen> {
  final List<VotePoll> _polls = [
    VotePoll(
      id: 'p1',
      title: 'Game Apa yang Harus Dimainin Pas Live Stream Weekend Nanti?',
      category: 'GAME SELECTION',
      expiresAt: DateTime.now().add(const Duration(hours: 18, minutes: 45)),
      selectedOptionId: 'opt1',
      options: [
        VoteOption(id: 'opt1', text: 'Elden Ring: Shadow of the Erdtree', votesCount: 142),
        VoteOption(id: 'opt2', text: 'Resident Evil 4 Remake (Hardcore)', votesCount: 98),
        VoteOption(id: 'opt3', text: 'Minecraft Build Challenge w/ Members', votesCount: 65),
      ],
    ),
    VotePoll(
      id: 'p2',
      title: 'Jam Berapa Enaknya Mulai Stream Hari Jumat?',
      category: 'SCHEDULE POLL',
      expiresAt: DateTime.now().add(const Duration(days: 2)),
      options: [
        VoteOption(id: 'opt21', text: '19.30 WIB (Sepulang Shalat/Kerja)', votesCount: 210),
        VoteOption(id: 'opt22', text: '20.00 WIB (Late Night Stream)', votesCount: 88),
      ],
    ),
    VotePoll(
      id: 'p3',
      title: 'Special Stream 200k Subscribers Idea',
      category: 'COMMUNITY EVENT',
      expiresAt: DateTime.now().subtract(const Duration(hours: 5)),
      isClosed: true,
      selectedOptionId: 'opt31',
      options: [
        VoteOption(id: 'opt31', text: '12-Hour Marathon Gameplay', votesCount: 512),
        VoteOption(id: 'opt32', text: 'Viewer Setup Review & Discord Hangout', votesCount: 340),
        VoteOption(id: 'opt33', text: 'Q&A + Facecam Cooking Stream', votesCount: 120),
      ],
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgBase,
      appBar: AppBar(
        backgroundColor: AppColors.bgNav,
        elevation: 0,
        title: Text(
          'COMMUNITY VOTES',
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
                    'Buat Voting Baru (Khusus Admin)',
                    style: GoogleFonts.spaceGrotesk(color: AppColors.textPrimary),
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _polls.length,
        itemBuilder: (context, index) {
          final poll = _polls[index];
          return _buildPollCard(poll);
        },
      ),
    );
  }

  Widget _buildPollCard(VotePoll poll) {
    final bool hasVoted = poll.selectedOptionId != null;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.bgSurface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Badge & Expiry
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.accentCyan.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  poll.category,
                  style: GoogleFonts.spaceMono(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: AppColors.accentCyan,
                  ),
                ),
              ),
              Row(
                children: [
                  Icon(
                    poll.isClosed ? LucideIcons.circle_check : LucideIcons.clock,
                    size: 13,
                    color: poll.isClosed ? AppColors.textMuted : AppColors.accentGold,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    poll.isClosed ? 'CLOSED' : 'Sisa 18 jam lagi',
                    style: GoogleFonts.spaceMono(
                      fontSize: 10,
                      color: poll.isClosed ? AppColors.textMuted : AppColors.accentGold,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Title
          Text(
            poll.title,
            style: GoogleFonts.spaceGrotesk(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),

          // Poll Options List
          ...poll.options.map((option) {
            final double percentage = poll.totalVotes > 0
                ? (option.votesCount / poll.totalVotes)
                : 0.0;
            final bool isSelected = poll.selectedOptionId == option.id;

            return GestureDetector(
              onTap: (poll.isClosed)
                  ? null
                  : () {
                      setState(() {
                        if (poll.selectedOptionId != option.id) {
                          if (poll.selectedOptionId != null) {
                            final prev = poll.options.firstWhere((o) => o.id == poll.selectedOptionId);
                            prev.votesCount--;
                          }
                          option.votesCount++;
                          poll.selectedOptionId = option.id;
                        }
                      });
                    },
              child: Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.bgInput,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isSelected ? AppColors.accentCyan : AppColors.borderSubtle,
                    width: isSelected ? 1.5 : 1.0,
                  ),
                ),
                child: Stack(
                  children: [
                    // Percentage Bar Background
                    if (hasVoted || poll.isClosed)
                      Positioned.fill(
                        child: FractionallySizedBox(
                          alignment: Alignment.centerLeft,
                          widthFactor: percentage,
                          child: Container(
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? AppColors.accentCyan.withOpacity(0.18)
                                  : AppColors.borderSubtle.withOpacity(0.3),
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                        ),
                      ),

                    // Option Content Text
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Row(
                            children: [
                              Icon(
                                isSelected
                                    ? LucideIcons.circle_check
                                    : LucideIcons.circle,
                                size: 16,
                                color: isSelected
                                    ? AppColors.accentCyan
                                    : AppColors.textMuted,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  option.text,
                                  style: GoogleFonts.spaceGrotesk(
                                    fontSize: 13,
                                    fontWeight:
                                        isSelected ? FontWeight.bold : FontWeight.normal,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (hasVoted || poll.isClosed)
                          Text(
                            '${(percentage * 100).toStringAsFixed(0)}%',
                            style: GoogleFonts.spaceMono(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: isSelected
                                  ? AppColors.accentCyan
                                  : AppColors.textSecondary,
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          }),

          const SizedBox(height: 6),
          // Total Votes Footer
          Text(
            '${poll.totalVotes} total suara',
            style: GoogleFonts.spaceMono(
              fontSize: 10,
              color: AppColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}