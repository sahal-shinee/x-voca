import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/game_model.dart';
import '../../data/models/collab_model.dart';
import '../providers/game_provider.dart';
import '../providers/collab_provider.dart';

class VotesScreen extends ConsumerStatefulWidget {
  const VotesScreen({super.key});

  @override
  ConsumerState<VotesScreen> createState() => _VotesScreenState();
}

class _VotesScreenState extends ConsumerState<VotesScreen> {
  final String _deviceFingerprint =
      'device_${DateTime.now().millisecondsSinceEpoch}';

  String _selectedFilter = 'all';

  // Helper Dialog Konfirmasi Serbaguna
  Future<bool> _showConfirmDialog({
    required BuildContext context,
    required String title,
    required String content,
    required String confirmText,
    Color confirmColor = AppColors.accentCyan,
  }) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.bgSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.borderSubtle),
        ),
        title: Text(
          title,
          style: GoogleFonts.spaceGrotesk(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        content: Text(
          content,
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
              backgroundColor: confirmColor,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(
              confirmText,
              style: GoogleFonts.spaceMono(
                color: confirmColor == AppColors.accentRed
                    ? Colors.white
                    : Colors.black,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
    return result ?? false;
  }

  void _showAddGameModal(BuildContext context) {
    final titleController = TextEditingController();
    final genreController = TextEditingController();
    final formKey = GlobalKey<FormState>();
    bool isSubmitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.bgSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (modalContext, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 16,
                right: 16,
                top: 20,
                bottom: MediaQuery.of(modalContext).viewInsets.bottom + 20,
              ),
              child: Form(
                key: formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(LucideIcons.gamepad_2,
                                color: AppColors.accentCyan, size: 20),
                            const SizedBox(width: 8),
                            Text(
                              'Tambah Game Poll Baru',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimary,
                              ),
                            ),
                          ],
                        ),
                        IconButton(
                          icon: const Icon(LucideIcons.x,
                              color: AppColors.textMuted, size: 20),
                          onPressed: () => Navigator.pop(modalContext),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Nama / Judul Game',
                      style: GoogleFonts.spaceMono(
                          fontSize: 12, color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: titleController,
                      style: GoogleFonts.spaceGrotesk(
                          color: AppColors.textPrimary),
                      decoration: InputDecoration(
                        hintText: 'Contoh: Resident Evil 4 Remake',
                        hintStyle: GoogleFonts.spaceGrotesk(
                            color: AppColors.textMuted, fontSize: 13),
                        filled: true,
                        fillColor: AppColors.bgInput,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide:
                              const BorderSide(color: AppColors.borderSubtle),
                        ),
                      ),
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) {
                          return 'Nama game wajib diisi';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                    Text(
                      'Genre / Kategori (Opsional)',
                      style: GoogleFonts.spaceMono(
                          fontSize: 12, color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: genreController,
                      style: GoogleFonts.spaceGrotesk(
                          color: AppColors.textPrimary),
                      decoration: InputDecoration(
                        hintText: 'Contoh: Horror / Action / Survival',
                        hintStyle: GoogleFonts.spaceGrotesk(
                            color: AppColors.textMuted, fontSize: 13),
                        filled: true,
                        fillColor: AppColors.bgInput,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide:
                              const BorderSide(color: AppColors.borderSubtle),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.accentCyan,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: isSubmitting
                            ? null
                            : () async {
                                if (!formKey.currentState!.validate()) return;
                                setModalState(() => isSubmitting = true);

                                try {
                                  await ref.read(gameProvider.notifier).addGame(
                                        titleController.text.trim(),
                                        genre: genreController.text.trim(),
                                      );

                                  if (context.mounted) {
                                    Navigator.pop(modalContext);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        backgroundColor: AppColors.bgSurface,
                                        content: Text(
                                          'Game kandidat berhasil ditambahkan!',
                                          style: GoogleFonts.spaceGrotesk(
                                              color: AppColors.accentCyan),
                                        ),
                                      ),
                                    );
                                  }
                                } catch (e) {
                                  setModalState(() => isSubmitting = false);
                                  if (context.mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        backgroundColor: AppColors.bgSurface,
                                        content: Text(
                                          'Gagal menambah game: $e',
                                          style: GoogleFonts.spaceGrotesk(
                                              color: AppColors.accentRed),
                                        ),
                                      ),
                                    );
                                  }
                                }
                              },
                        child: isSubmitting
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2, color: Colors.black),
                              )
                            : Text(
                                'Simpan Game kandidat',
                                style: GoogleFonts.spaceGrotesk(
                                  color: Colors.black,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: AppColors.bgBase,
        appBar: AppBar(
          backgroundColor: AppColors.bgNav,
          elevation: 0,
          title: Text(
            'COMMUNITY HUB',
            style: GoogleFonts.spaceGrotesk(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
              letterSpacing: 1,
            ),
          ),
          actions: [
            IconButton(
              icon: const Icon(LucideIcons.refresh_cw,
                  size: 18, color: AppColors.textSecondary),
              onPressed: () {
                ref.read(gameProvider.notifier).loadAllData();
                ref.read(collabProvider.notifier).fetchCollabRequests();
              },
            ),
            IconButton(
              icon: const Icon(LucideIcons.plus, color: AppColors.accentCyan),
              onPressed: () => _showAddGameModal(context),
            ),
          ],
          bottom: TabBar(
            indicatorColor: AppColors.accentCyan,
            labelColor: AppColors.accentCyan,
            unselectedLabelColor: AppColors.textMuted,
            labelStyle: GoogleFonts.spaceGrotesk(
                fontWeight: FontWeight.bold, fontSize: 13),
            tabs: const [
              Tab(text: 'Game Votes'),
              Tab(text: 'Collab Requests'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildGameVotesTab(),
            _buildCollabRequestsTab(),
          ],
        ),
      ),
    );
  }

  // ==================== TAB 1: GAME VOTES ====================
  Widget _buildGameVotesTab() {
    final gameState = ref.watch(gameProvider);
    final games = gameState.games;
    final voteStats = gameState.voteStats;

    final int totalVotes = voteStats?.totalVotes ??
        games.fold<int>(0, (sum, game) => sum + game.voteCount);

    if (gameState.isLoading && games.isEmpty) {
      return const Center(
          child: CircularProgressIndicator(color: AppColors.accentCyan));
    }

    if (gameState.error != null && games.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline,
                color: AppColors.accentRed, size: 40),
            const SizedBox(height: 8),
            Text('Gagal mengambil data polling',
                style: GoogleFonts.spaceGrotesk(color: AppColors.textPrimary)),
            const SizedBox(height: 12),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.accentCyan),
              onPressed: () => ref.read(gameProvider.notifier).loadAllData(),
              child: Text('Coba Lagi',
                  style: GoogleFonts.spaceGrotesk(color: Colors.black)),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(gameProvider.notifier).loadAllData(),
      color: AppColors.accentCyan,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildFilterChips(games),
          const SizedBox(height: 16),
          _buildMainPollCard(games, totalVotes),
        ],
      ),
    );
  }

  Widget _buildFilterChips(List<GameModel> games) {
    final filters = [
      {'key': 'all', 'label': 'Semua', 'count': games.length},
      {
        'key': 'requested',
        'label': 'Requested',
        'count': games.where((g) => g.status == 'requested').length
      },
      {
        'key': 'accepted',
        'label': 'Accepted',
        'count': games.where((g) => g.status == 'accepted').length
      },
      {
        'key': 'playing',
        'label': 'Playing',
        'count': games.where((g) => g.status == 'playing').length
      },
      {
        'key': 'done',
        'label': 'Done',
        'count': games.where((g) => g.status == 'done').length
      },
    ];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: filters.map((f) {
          final isSelected = _selectedFilter == f['key'];
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              selected: isSelected,
              showCheckmark: false,
              label: Text(
                '${f['label']} (${f['count']})',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  color: isSelected ? Colors.black : AppColors.textSecondary,
                ),
              ),
              backgroundColor: AppColors.bgSurface,
              selectedColor: AppColors.accentCyan,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(
                  color: isSelected
                      ? AppColors.accentCyan
                      : AppColors.borderSubtle,
                ),
              ),
              onSelected: (_) {
                setState(() {
                  _selectedFilter = f['key'] as String;
                });
              },
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildMainPollCard(List<GameModel> games, int totalVotes) {
    final filteredGames = games.where((g) {
      if (_selectedFilter == 'all') return true;
      return g.status == _selectedFilter;
    }).toList();

    final int filteredTotalVotes =
        filteredGames.fold<int>(0, (sum, game) => sum + game.voteCount);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.bgSurface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderSubtle),
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
                  color: AppColors.accentCyan.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  'COSMIC DEMOCRACY',
                  style: GoogleFonts.spaceMono(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: AppColors.accentCyan,
                  ),
                ),
              ),
              Row(
                children: [
                  const Icon(LucideIcons.clock,
                      size: 13, color: AppColors.accentGold),
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
          Text(
            'Pilih game yang ingin kamu tonton. Suara kamu menentukan live dan playthrough berikutnya.',
            style: GoogleFonts.spaceGrotesk(
                fontSize: 13, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 16),
          if (filteredGames.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 20),
              child: Center(
                child: Text(
                  'Tidak ada game dalam kategori ini.',
                  style: GoogleFonts.spaceGrotesk(color: AppColors.textMuted),
                ),
              ),
            )
          else
            ...filteredGames.map((game) {
              final gameVotes = game.voteCount;
              final double percentage = filteredTotalVotes > 0
                  ? (gameVotes / filteredTotalVotes)
                  : 0.0;

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.bgInput,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: Column(
                  children: [
                    // Area Vote
                    GestureDetector(
                      onTap: () async {
                        final confirmVote = await _showConfirmDialog(
                          context: context,
                          title: 'Konfirmasi Vote Game',
                          content:
                              'Apakah Anda yakin ingin memberikan suara untuk pilihan ini?\n\n"${game.title}"',
                          confirmText: 'Ya, Vote',
                          confirmColor: AppColors.accentCyan,
                        );

                        if (!confirmVote) return;

                        try {
                          await ref
                              .read(gameProvider.notifier)
                              .submitVote(game.id, _deviceFingerprint);

                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                backgroundColor: AppColors.bgSurface,
                                content: Text(
                                  'Berhasil memberikan vote untuk ${game.title}!',
                                  style: GoogleFonts.spaceGrotesk(
                                      color: AppColors.accentCyan),
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
                                  style: GoogleFonts.spaceGrotesk(
                                      color: AppColors.accentRed),
                                ),
                              ),
                            );
                          }
                        }
                      },
                      child: Stack(
                        children: [
                          Positioned.fill(
                            child: FractionallySizedBox(
                              alignment: Alignment.centerLeft,
                              widthFactor: percentage,
                              child: Container(
                                decoration: BoxDecoration(
                                  color: AppColors.accentCyan
                                      .withValues(alpha: 0.18),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                            ),
                          ),
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
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            game.title,
                                            style: GoogleFonts.spaceGrotesk(
                                              fontSize: 13,
                                              fontWeight: FontWeight.bold,
                                              color: AppColors.textPrimary,
                                            ),
                                          ),
                                          Text(
                                            'Status: ${game.status.toUpperCase()}',
                                            style: GoogleFonts.spaceMono(
                                              fontSize: 9,
                                              color: AppColors.accentGold,
                                            ),
                                          ),
                                        ],
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

                    // Tombol Aksi Moderasi Kreator (Dengan Dialog Konfirmasi)
                    if (game.status != 'done') ...[
                      const SizedBox(height: 8),
                      const Divider(color: AppColors.borderSubtle, height: 1),
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          // Tolak (Hapus)
                          if (game.status == 'requested')
                            InkWell(
                              onTap: () async {
                                final confirm = await _showConfirmDialog(
                                  context: context,
                                  title: 'Hapus Kandidat Game?',
                                  content:
                                      'Game "${game.title}" akan dihapus permanen dari daftar.',
                                  confirmText: 'Tolak & Hapus',
                                  confirmColor: AppColors.accentRed,
                                );

                                if (confirm) {
                                  await ref
                                      .read(gameProvider.notifier)
                                      .deleteGame(game.id);
                                }
                              },
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 4),
                                child: Row(
                                  children: [
                                    const Icon(LucideIcons.trash,
                                        size: 13, color: AppColors.accentRed),
                                    const SizedBox(width: 4),
                                    Text('Tolak',
                                        style: GoogleFonts.spaceMono(
                                            fontSize: 11,
                                            color: AppColors.accentRed)),
                                  ],
                                ),
                              ),
                            ),

                          const SizedBox(width: 12),

                          // Terima (Requested -> Accepted)
                          if (game.status == 'requested')
                            InkWell(
                              onTap: () async {
                                final confirm = await _showConfirmDialog(
                                  context: context,
                                  title: 'Terima Game Kandidat?',
                                  content:
                                      'Game "${game.title}" akan disetujui dan masuk daftar voting resmi.',
                                  confirmText: 'Ya, Terima',
                                  confirmColor: AppColors.accentCyan,
                                );

                                if (confirm) {
                                  await ref
                                      .read(gameProvider.notifier)
                                      .updateGameStatus(game.id, 'accepted');
                                }
                              },
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 4),
                                child: Row(
                                  children: [
                                    const Icon(LucideIcons.circle_check,
                                        size: 13, color: AppColors.accentCyan),
                                    const SizedBox(width: 4),
                                    Text('Terima',
                                        style: GoogleFonts.spaceMono(
                                            fontSize: 11,
                                            color: AppColors.accentCyan,
                                            fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              ),
                            ),

                          // Mulai Mainkan (Accepted -> Playing)
                          if (game.status == 'accepted')
                            InkWell(
                              onTap: () async {
                                final confirm = await _showConfirmDialog(
                                  context: context,
                                  title: 'Mulai Mainkan Game?',
                                  content:
                                      'Status "${game.title}" akan diubah menjadi Sedang Dimainkan (Playing).',
                                  confirmText: 'Ya, Mainkan',
                                  confirmColor: Colors.greenAccent,
                                );

                                if (confirm) {
                                  await ref
                                      .read(gameProvider.notifier)
                                      .updateGameStatus(game.id, 'playing');
                                }
                              },
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 4),
                                child: Row(
                                  children: [
                                    const Icon(LucideIcons.play,
                                        size: 13, color: Colors.greenAccent),
                                    const SizedBox(width: 4),
                                    Text('Mulai Mainkan',
                                        style: GoogleFonts.spaceMono(
                                            fontSize: 11,
                                            color: Colors.greenAccent,
                                            fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              ),
                            ),

                          // Tandai Selesai (Playing -> Done)
                          if (game.status == 'playing')
                            InkWell(
                              onTap: () async {
                                final confirm = await _showConfirmDialog(
                                  context: context,
                                  title: 'Selesaikan Game?',
                                  content:
                                      'Game "${game.title}" akan ditandai Selesai/Tamat (Done).',
                                  confirmText: 'Ya, Selesai',
                                  confirmColor: AppColors.textMuted,
                                );

                                if (confirm) {
                                  await ref
                                      .read(gameProvider.notifier)
                                      .updateGameStatus(game.id, 'done');
                                }
                              },
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 4),
                                child: Row(
                                  children: [
                                    const Icon(LucideIcons.check_check,
                                        size: 13, color: AppColors.textMuted),
                                    const SizedBox(width: 4),
                                    Text('Tandai Selesai',
                                        style: GoogleFonts.spaceMono(
                                            fontSize: 11,
                                            color: AppColors.textMuted)),
                                  ],
                                ),
                              ),
                            ),
                        ],
                      ),
                    ],
                  ],
                ),
              );
            }),
          const SizedBox(height: 6),
          Text(
            '$filteredTotalVotes suara pada kategori ini',
            style:
                GoogleFonts.spaceMono(fontSize: 10, color: AppColors.textMuted),
          ),
        ],
      ),
    );
  }

  // ==================== TAB 2: COLLAB REQUESTS ====================
  Widget _buildCollabRequestsTab() {
    final collabState = ref.watch(collabProvider);
    final requests = collabState.requests;

    if (collabState.isLoading && requests.isEmpty) {
      return const Center(
          child: CircularProgressIndicator(color: AppColors.accentCyan));
    }

    if (collabState.error != null && requests.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline,
                color: AppColors.accentRed, size: 40),
            const SizedBox(height: 8),
            Text('Gagal mengambil data collab requests',
                style: GoogleFonts.spaceGrotesk(color: AppColors.textPrimary)),
            const SizedBox(height: 12),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.accentCyan),
              onPressed: () =>
                  ref.read(collabProvider.notifier).fetchCollabRequests(),
              child: Text('Coba Lagi',
                  style: GoogleFonts.spaceGrotesk(color: Colors.black)),
            ),
          ],
        ),
      );
    }

    if (requests.isEmpty) {
      return RefreshIndicator(
        onRefresh: () =>
            ref.read(collabProvider.notifier).fetchCollabRequests(),
        color: AppColors.accentCyan,
        child: ListView(
          padding: const EdgeInsets.all(32),
          children: [
            const SizedBox(height: 60),
            const Icon(LucideIcons.users, size: 48, color: AppColors.textMuted),
            const SizedBox(height: 12),
            Center(
              child: Text(
                'Belum Ada Request Collab',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
            const SizedBox(height: 6),
            Center(
              child: Text(
                'Ajakan mabar atau collab dari streamer lain bakal muncul di sini.',
                textAlign: TextAlign.center,
                style: GoogleFonts.spaceMono(
                    fontSize: 12, color: AppColors.textMuted),
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(collabProvider.notifier).fetchCollabRequests(),
      color: AppColors.accentCyan,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: requests.length,
        itemBuilder: (context, index) {
          final collab = requests[index];
          return _buildCollabCard(collab);
        },
      ),
    );
  }

  Widget _buildCollabCard(CollabModel collab) {
    Color statusColor;
    switch (collab.status.toLowerCase()) {
      case 'accepted':
        statusColor = Colors.greenAccent;
        break;
      case 'rejected':
        statusColor = AppColors.accentRed;
        break;
      default:
        statusColor = AppColors.accentGold;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.bgSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    const Icon(LucideIcons.tv,
                        size: 16, color: AppColors.accentCyan),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        collab.requestedStreamerName,
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  collab.status.toUpperCase(),
                  style: GoogleFonts.spaceMono(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: statusColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          if (collab.message != null && collab.message!.isNotEmpty) ...[
            Text(
              collab.message!,
              style: GoogleFonts.spaceGrotesk(
                fontSize: 12,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 8),
          ],

          if (collab.requestedStreamerSocial != null &&
              collab.requestedStreamerSocial!.isNotEmpty) ...[
            GestureDetector(
              onTap: () async {
                final url = Uri.parse(collab.requestedStreamerSocial!);
                if (await canLaunchUrl(url)) {
                  await launchUrl(url, mode: LaunchMode.externalApplication);
                }
              },
              child: Row(
                children: [
                  const Icon(LucideIcons.link,
                      size: 13, color: AppColors.accentCyan),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      collab.requestedStreamerSocial!,
                      style: GoogleFonts.spaceMono(
                        fontSize: 11,
                        color: AppColors.accentCyan,
                        decoration: TextDecoration.underline,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],

          // Tombol Aksi Collab Requests (Dengan Dialog Konfirmasi)
          if (collab.status.toLowerCase() == 'pending') ...[
            const Divider(color: AppColors.borderSubtle),
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.accentRed),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  icon: const Icon(LucideIcons.x,
                      size: 14, color: AppColors.accentRed),
                  label: Text('Tolak',
                      style: GoogleFonts.spaceMono(
                          fontSize: 11, color: AppColors.accentRed)),
                  onPressed: () async {
                    final confirm = await _showConfirmDialog(
                      context: context,
                      title: 'Tolak Collab Request?',
                      content:
                          'Ajakan collab dari "${collab.requestedStreamerName}" akan ditolak.',
                      confirmText: 'Tolak Request',
                      confirmColor: AppColors.accentRed,
                    );

                    if (confirm) {
                      try {
                        await ref
                            .read(collabProvider.notifier)
                            .updateStatus(collab.id, 'rejected');
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              backgroundColor: AppColors.bgSurface,
                              content: Text('Request collab ditolak',
                                  style: GoogleFonts.spaceGrotesk(
                                      color: AppColors.textPrimary)),
                            ),
                          );
                        }
                      } catch (e) {
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              backgroundColor: AppColors.bgSurface,
                              content: Text('Gagal update: $e',
                                  style: GoogleFonts.spaceGrotesk(
                                      color: AppColors.accentRed)),
                            ),
                          );
                        }
                      }
                    }
                  },
                ),
                const SizedBox(width: 8),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.accentCyan,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  icon: const Icon(LucideIcons.check,
                      size: 14, color: Colors.black),
                  label: Text('Terima',
                      style: GoogleFonts.spaceMono(
                          fontSize: 11,
                          color: Colors.black,
                          fontWeight: FontWeight.bold)),
                  onPressed: () async {
                    final confirm = await _showConfirmDialog(
                      context: context,
                      title: 'Terima Collab Request?',
                      content:
                          'Apakah kamu yakin ingin menerima ajakan collab dari "${collab.requestedStreamerName}"?',
                      confirmText: 'Ya, Terima',
                      confirmColor: AppColors.accentCyan,
                    );

                    if (confirm) {
                      try {
                        await ref
                            .read(collabProvider.notifier)
                            .updateStatus(collab.id, 'accepted');
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              backgroundColor: AppColors.bgSurface,
                              content: Text('Request collab diterima!',
                                  style: GoogleFonts.spaceGrotesk(
                                      color: AppColors.accentCyan)),
                            ),
                          );
                        }
                      } catch (e) {
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              backgroundColor: AppColors.bgSurface,
                              content: Text('Gagal update: $e',
                                  style: GoogleFonts.spaceGrotesk(
                                      color: AppColors.accentRed)),
                            ),
                          );
                        }
                      }
                    }
                  },
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
