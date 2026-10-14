import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/game_model.dart';
import '../providers/game_provider.dart';

class VotesScreen extends ConsumerStatefulWidget {
  const VotesScreen({super.key});

  @override
  ConsumerState<VotesScreen> createState() => _VotesScreenState();
}

class _VotesScreenState extends ConsumerState<VotesScreen> {
  // Menyiapkan fingerprint sederhana untuk dikirim saat vote
  final String _deviceFingerprint = 'device_${DateTime.now().millisecondsSinceEpoch}';

  @override
  Widget build(BuildContext context) {
    // 1. Membaca state dari gameProvider
    final gameState = ref.watch(gameProvider);
    final games = gameState.games;
    final voteStats = gameState.voteStats;

    // Hitung total seluruh suara dari semua game yang ada
    final int totalVotes = voteStats?.totalVotes ??
        games.fold<int>(0, (sum, game) => sum + game.voteCount);

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
          // Tombol Refresh Manual
          IconButton(
            icon: const Icon(LucideIcons.refresh_cw, size: 18, color: AppColors.textSecondary),
            onPressed: () {
              ref.read(gameProvider.notifier).loadAllData();
            },
          ),
          IconButton(
            icon: const Icon(LucideIcons.plus, color: AppColors.accentCyan),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  backgroundColor: AppColors.bgSurface,
                  content: Text(
                    'Tambah Game Poll (Fitur Admin)',
                    style: GoogleFonts.spaceGrotesk(color: AppColors.textPrimary),
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: gameState.isLoading && games.isEmpty
          ? const Center(child: CircularProgressIndicator(color: AppColors.accentCyan))
          : gameState.error != null && games.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, color: AppColors.accentRed, size: 40),
                      const SizedBox(height: 8),
                      Text(
                        'Gagal mengambil data polling',
                        style: GoogleFonts.spaceGrotesk(color: AppColors.textPrimary),
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.accentCyan),
                        onPressed: () => ref.read(gameProvider.notifier).loadAllData(),
                        child: Text('Coba Lagi', style: GoogleFonts.spaceGrotesk(color: Colors.black)),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: () => ref.read(gameProvider.notifier).loadAllData(),
                  color: AppColors.accentCyan,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      // Card Polling Utama dari Database
                      _buildMainPollCard(games, totalVotes),
                    ],
                  ),
                ),
    );
  }

  Widget _buildMainPollCard(List<GameModel> games, int totalVotes) {
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
                  color: AppColors.accentCyan.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  'GAME SELECTION POLL',
                  style: GoogleFonts.spaceMono(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: AppColors.accentCyan,
                  ),
                ),
              ),
              Row(
                children: [
                  const Icon(LucideIcons.clock, size: 13, color: AppColors.accentGold),
                  const SizedBox(width: 4),
                  Text(
                    'LIVE VOTING',
                    style: GoogleFonts.spaceMono(
                      fontSize: 10,
                      color: AppColors.accentGold,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Title
          Text(
            'Game Apa yang Harus Dimainkan Pas Live Stream Nanti?',
            style: GoogleFonts.spaceGrotesk(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),

          // Render Setiap Game sebagai Opsi Polling dari Database
          if (games.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 20),
              child: Center(
                child: Text(
                  'Belum ada kandidat game di database.',
                  style: GoogleFonts.spaceGrotesk(color: AppColors.textMuted),
                ),
              ),
            )
          else
            ...games.map((game) {
              final gameVotes = game.voteCount;
              final double percentage = totalVotes > 0 ? (gameVotes / totalVotes) : 0.0;

              return GestureDetector(
                onTap: () async {
                  final bool? confirmVote = await showDialog<bool>(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      backgroundColor: AppColors.bgSurface,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                        side: const BorderSide(color: AppColors.borderSubtle),
                      ),
                      title: Row(
                        children: [
                          const Icon(LucideIcons.gamepad_2, color: AppColors.accentCyan, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            'Konfirmasi Vote Game',
                            style: GoogleFonts.spaceGrotesk(
                              color: AppColors.textPrimary,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                      content: Text(
                        'Apakah Anda yakin ingin memberikan suara untuk pilihan ini?\n\n"${game.title}"',
                        style: GoogleFonts.spaceMono(
                          color: AppColors.textSecondary,
                          fontSize: 12,
                        ),
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(ctx, false),
                          child: Text(
                            'Batal',
                            style: GoogleFonts.spaceMono(color: AppColors.textMuted),
                          ),
                        ),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.accentCyan,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          onPressed: () => Navigator.pop(ctx, true),
                          child: Text(
                            'Ya, Vote',
                            style: GoogleFonts.spaceMono(
                              color: Colors.black,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );

                  if (confirmVote != true) return;

                  try {
                    // Panggil fungsi submitVote di provider
                    await ref
                        .read(gameProvider.notifier)
                        .submitVote(game.id, _deviceFingerprint);

                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          backgroundColor: AppColors.bgSurface,
                          content: Text(
                            'Berhasil memberikan vote untuk ${game.title}!',
                            style: GoogleFonts.spaceGrotesk(color: AppColors.accentCyan),
                          ),
                        ),
                      );
                    }
                  } catch (e) {
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          backgroundColor: AppColors.bgSurface,
                          content: Text(
                            'Gagal kirim vote: $e',
                            style: GoogleFonts.spaceGrotesk(color: AppColors.accentRed),
                          ),
                        ),
                      );
                    }
                  }
                },
                child: Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.bgInput,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.borderSubtle),
                  ),
                  child: Stack(
                    children: [
                      // Percentage Bar Background
                      Positioned.fill(
                        child: FractionallySizedBox(
                          alignment: Alignment.centerLeft,
                          widthFactor: percentage,
                          child: Container(
                            decoration: BoxDecoration(
                              color: AppColors.accentCyan.withValues(alpha: 0.18),
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
                                const Icon(
                                  LucideIcons.gamepad_2,
                                  size: 16,
                                  color: AppColors.accentCyan,
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    game.title,
                                    style: GoogleFonts.spaceGrotesk(
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            '${(percentage * 100).toStringAsFixed(0)}% ($gameVotes)',
                            style: GoogleFonts.spaceMono(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: AppColors.accentCyan,
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
            '$totalVotes total suara masuk',
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