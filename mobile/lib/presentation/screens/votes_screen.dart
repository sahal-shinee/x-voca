import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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

  // State untuk Tab 1: Game Voting
  String _selectedFilter = 'all';
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  // State untuk Tab 2: Collab Requests
  String _selectedCollabFilter = 'all';
  final TextEditingController _collabSearchController = TextEditingController();
  String _collabSearchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    _collabSearchController.dispose();
    super.dispose();
  }

  // Floating SnackBar / Toast Helper yang modern, rounded, dan taktil
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
        margin: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
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

  // Helper Dialog Konfirmasi Universal Taktil
  Future<bool> _showConfirmDialog({
    required BuildContext context,
    required String title,
    required String content,
    required String confirmText,
    Color confirmColor = AppColors.accentCyan,
    IconData icon = LucideIcons.triangle_alert,
  }) async {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    HapticFeedback.lightImpact();
    final result = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: bgSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: borderSubtle),
        ),
        title: Row(
          children: [
            Icon(icon, color: confirmColor, size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                title,
                style: GoogleFonts.spaceGrotesk(
                  color: textPrimary,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
          ],
        ),
        content: Text(
          content,
          style: GoogleFonts.spaceGrotesk(
            color: textSecondary,
            fontSize: 13,
            height: 1.4,
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
              backgroundColor: confirmColor,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            ),
            onPressed: () {
              HapticFeedback.selectionClick();
              Navigator.pop(ctx, true);
            },
            child: Text(
              confirmText,
              style: GoogleFonts.spaceMono(
                color: confirmColor == AppColors.accentRed ? Colors.white : Colors.black,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
    return result ?? false;
  }

  // Modal Tambah Usulan Game Kandidat Baru
  void _showAddGameModal() {
    HapticFeedback.lightImpact();
    final titleController = TextEditingController();
    final genreController = TextEditingController();
    final formKey = GlobalKey<FormState>();
    bool isSubmitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final isDark = Theme.of(ctx).brightness == Brightness.dark;
        final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
        final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
        final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
        final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
        final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
        final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

        return StatefulBuilder(
          builder: (modalContext, setModalState) {
            return Container(
              decoration: BoxDecoration(
                color: bgSurface,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                border: Border(top: BorderSide(color: borderSubtle, width: 1.2)),
              ),
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
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
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: AppColors.accentCyan.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Icon(LucideIcons.gamepad_2,
                                  color: AppColors.primary(isDark), size: 20),
                            ),
                            const SizedBox(width: 10),
                            Text(
                              'Tambah Game Usulan Baru',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: textPrimary,
                              ),
                            ),
                          ],
                        ),
                        SizedBox(
                          width: 44,
                          height: 44,
                          child: IconButton(
                            icon: Icon(LucideIcons.x, color: textMuted, size: 20),
                            onPressed: () {
                              HapticFeedback.selectionClick();
                              Navigator.pop(modalContext);
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),
                    Text(
                      'Nama / Judul Game *',
                      style: GoogleFonts.spaceMono(
                        fontSize: 11,
                        color: textSecondary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: titleController,
                      style: GoogleFonts.spaceGrotesk(color: textPrimary, fontSize: 13),
                      decoration: InputDecoration(
                        hintText: 'Contoh: Resident Evil 4 Remake',
                        hintStyle: GoogleFonts.spaceGrotesk(
                            color: textMuted, fontSize: 13),
                        filled: true,
                        fillColor: bgInput,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: BorderSide(color: borderSubtle),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: BorderSide(color: borderSubtle),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(color: AppColors.accentCyan, width: 1.2),
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
                        fontSize: 11,
                        color: textSecondary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: genreController,
                      style: GoogleFonts.spaceGrotesk(color: textPrimary, fontSize: 13),
                      decoration: InputDecoration(
                        hintText: 'Contoh: Horror / Action / Survival',
                        hintStyle: GoogleFonts.spaceGrotesk(
                            color: textMuted, fontSize: 13),
                        filled: true,
                        fillColor: bgInput,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: BorderSide(color: borderSubtle),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: BorderSide(color: borderSubtle),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(color: AppColors.accentCyan, width: 1.2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 22),
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
                                HapticFeedback.lightImpact();
                                setModalState(() => isSubmitting = true);

                                try {
                                  await ref.read(gameProvider.notifier).addGame(
                                        titleController.text.trim(),
                                        genre: genreController.text.trim(),
                                      );

                                  if (modalContext.mounted) {
                                    Navigator.pop(modalContext);
                                  }
                                  if (mounted) {
                                    _showFloatingToast(
                                      context,
                                      message: 'Game kandidat berhasil ditambahkan ke polling!',
                                      isSuccess: true,
                                      icon: LucideIcons.gamepad_2,
                                    );
                                  }
                                } catch (e) {
                                  setModalState(() => isSubmitting = false);
                                  if (mounted) {
                                    _showFloatingToast(
                                      context,
                                      message: 'Gagal menambah game: $e',
                                      isSuccess: false,
                                    );
                                  }
                                }
                              },
                        child: isSubmitting
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2, color: Colors.black),
                              )
                            : Text(
                                'Simpan Game',
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
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgBase = isDark ? AppColors.bgBase : AppColors.bgBaseLight;
    final bgNav = isDark ? AppColors.bgNav : AppColors.bgNavLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: bgBase,
        appBar: AppBar(
          backgroundColor: bgNav,
          elevation: 0,
          surfaceTintColor: Colors.transparent,
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(49),
            child: Column(
              children: [
                TabBar(
                  onTap: (_) => HapticFeedback.selectionClick(),
                  indicatorColor: AppColors.primary(isDark),
                  indicatorWeight: 2.5,
                  indicatorSize: TabBarIndicatorSize.tab,
                  labelColor: AppColors.primary(isDark),
                  unselectedLabelColor: textMuted,
                  labelStyle: GoogleFonts.spaceGrotesk(
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                  unselectedLabelStyle: GoogleFonts.spaceGrotesk(
                    fontWeight: FontWeight.w500,
                    fontSize: 13,
                  ),
                  tabs: const [
                    Tab(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(LucideIcons.vote, size: 16),
                          SizedBox(width: 8),
                          Text('Game Voting'),
                        ],
                      ),
                    ),
                    Tab(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(LucideIcons.users, size: 16),
                          SizedBox(width: 8),
                          Text('Collab Requests'),
                        ],
                      ),
                    ),
                  ],
                ),
                Container(color: borderSubtle, height: 1),
              ],
            ),
          ),
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'MODERASI & VOTING',
                style: GoogleFonts.spaceMono(
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary(isDark),
                  letterSpacing: 1.2,
                ),
              ),
              Text(
                'Community Hub',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: textPrimary,
                ),
              ),
            ],
          ),
          actions: [
            // Touch Target 44x44 dp: Refresh Data
            SizedBox(
              width: 44,
              height: 44,
              child: IconButton(
                tooltip: 'Segarkan Data',
                icon: Icon(LucideIcons.refresh_cw, size: 18, color: textSecondary),
                onPressed: () {
                  HapticFeedback.lightImpact();
                  ref.read(gameProvider.notifier).loadAllData();
                  ref.read(collabProvider.notifier).fetchCollabRequests();
                  _showFloatingToast(
                    context,
                    message: 'Data polling & collab berhasil diperbarui',
                    isSuccess: true,
                    icon: LucideIcons.refresh_cw,
                  );
                },
              ),
            ),
            // Touch Target 44x44 dp: Tambah Game Usulan
            SizedBox(
              width: 44,
              height: 44,
              child: IconButton(
                tooltip: 'Tambah Game Usulan',
                icon: Icon(
                  LucideIcons.plus,
                  color: AppColors.primary(isDark),
                  size: 20,
                ),
                onPressed: _showAddGameModal,
              ),
            ),
            const SizedBox(width: 6),
          ],
        ),
        body: TabBarView(
          children: [
            _buildGameVotesTab(isDark),
            _buildCollabRequestsTab(isDark),
          ],
        ),
      ),
    );
  }

  // ==========================================
  // TAB 1: GAME VOTING
  // ==========================================
  Widget _buildGameVotesTab(bool isDark) {
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final bgNav = isDark ? AppColors.bgNav : AppColors.bgNavLight;
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    final gameState = ref.watch(gameProvider);
    final games = gameState.games;
    final voteStats = gameState.voteStats;

    final int totalVotes = voteStats?.totalVotes ??
        games.fold<int>(0, (sum, game) => sum + game.voteCount);

    final requestedCount = games.where((g) => g.status == 'requested').length;
    final acceptedCount = games.where((g) => g.status == 'accepted').length;
    final playingCount = games.where((g) => g.status == 'playing').length;
    final doneCount = games.where((g) => g.status == 'done').length;

    if (gameState.isLoading && games.isEmpty) {
      return Center(
          child: CircularProgressIndicator(color: AppColors.primary(isDark)));
    }

    if (gameState.error != null && games.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(LucideIcons.circle_alert,
                  color: AppColors.accentRed, size: 40),
              const SizedBox(height: 12),
              Text(
                'Gagal mengambil data polling',
                style: GoogleFonts.spaceGrotesk(
                  color: textPrimary,
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary(isDark),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                icon: Icon(LucideIcons.refresh_cw, size: 16, color: isDark ? Colors.black : Colors.white),
                onPressed: () {
                  HapticFeedback.lightImpact();
                  ref.read(gameProvider.notifier).loadAllData();
                },
                label: Text('Coba Lagi',
                    style: GoogleFonts.spaceGrotesk(
                      color: isDark ? Colors.black : Colors.white,
                      fontWeight: FontWeight.bold,
                    )),
              ),
            ],
          ),
        ),
      );
    }

    // Filter list berdasarkan tab chip & pencarian
    final filteredGames = games.where((g) {
      final matchesFilter = _selectedFilter == 'all' || g.status == _selectedFilter;
      final matchesSearch = _searchQuery.isEmpty ||
          g.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          (g.genre?.toLowerCase().contains(_searchQuery.toLowerCase()) ?? false);
      return matchesFilter && matchesSearch;
    }).toList();

    return RefreshIndicator(
      onRefresh: () async {
        HapticFeedback.lightImpact();
        await ref.read(gameProvider.notifier).loadAllData();
        if (mounted) {
          _showFloatingToast(
            context,
            message: 'Polling game disinkronkan',
            isSuccess: true,
            icon: LucideIcons.check_check,
          );
        }
      },
      color: AppColors.primary(isDark),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Header Mini Summary
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: bgNav,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: borderSubtle),
            ),
            child: Row(
              children: [
                Expanded(
                  child: _buildMiniStatItem(
                    title: 'REVIEW',
                    value: '$requestedCount',
                    color: AppColors.accentGold,
                    isDark: isDark,
                  ),
                ),
                Container(width: 1, height: 26, color: borderSubtle),
                Expanded(
                  child: _buildMiniStatItem(
                    title: 'DITERIMA',
                    value: '$acceptedCount',
                    color: AppColors.primary(isDark),
                    isDark: isDark,
                  ),
                ),
                Container(width: 1, height: 26, color: borderSubtle),
                Expanded(
                  child: _buildMiniStatItem(
                    title: 'DIMAINKAN',
                    value: '$playingCount',
                    color: AppColors.accentEmerald,
                    isDark: isDark,
                  ),
                ),
                Container(width: 1, height: 26, color: borderSubtle),
                Expanded(
                  child: _buildMiniStatItem(
                    title: 'SELESAI',
                    value: '$doneCount',
                    color: textMuted,
                    isDark: isDark,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Search Field Game (Dengan Clear Text X Min 44x44 dp)
          Container(
            decoration: BoxDecoration(
              color: bgInput,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: borderSubtle),
            ),
            child: TextField(
              controller: _searchController,
              onChanged: (val) => setState(() => _searchQuery = val.trim()),
              style: GoogleFonts.spaceGrotesk(fontSize: 13, color: textPrimary),
              decoration: InputDecoration(
                hintText: 'Cari judul atau genre game...',
                hintStyle: GoogleFonts.spaceGrotesk(fontSize: 12, color: textMuted),
                prefixIcon: Icon(LucideIcons.search, size: 16, color: textMuted),
                suffixIcon: _searchQuery.isNotEmpty
                    ? SizedBox(
                        width: 44,
                        height: 44,
                        child: IconButton(
                          icon: Icon(LucideIcons.x, size: 16, color: textMuted),
                          onPressed: () {
                            HapticFeedback.selectionClick();
                            _searchController.clear();
                            setState(() => _searchQuery = '');
                          },
                        ),
                      )
                    : null,
                border: InputBorder.none,
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Filter Chips Game
          _buildFilterChips(games, isDark),
          const SizedBox(height: 14),

          // Main Poll Card
          _buildMainPollCard(filteredGames, totalVotes, isDark),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildFilterChips(List<GameModel> games, bool isDark) {
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

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
                style: GoogleFonts.spaceMono(
                  fontSize: 10,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  color: isSelected ? (isDark ? Colors.black : Colors.white) : textSecondary,
                ),
              ),
              backgroundColor: bgSurface,
              selectedColor: AppColors.primary(isDark),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: BorderSide(
                  color: isSelected
                      ? AppColors.primary(isDark)
                      : borderSubtle,
                ),
              ),
              onSelected: (_) {
                HapticFeedback.selectionClick();
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

  Widget _buildMainPollCard(
      List<GameModel> filteredGames, int totalVotes, bool isDark) {
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

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
                    color: AppColors.primary(isDark),
                  ),
                ),
              ),
              Row(
                children: [
                  const Icon(LucideIcons.radio,
                      size: 13, color: AppColors.accentGold),
                  const SizedBox(width: 5),
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
          const SizedBox(height: 10),
          Text(
            'Pilih game yang ingin kamu tonton. Suara kamu menentukan sesi siaran dan playthrough berikutnya.',
            style: GoogleFonts.spaceGrotesk(
              fontSize: 12,
              color: textSecondary,
              height: 1.35,
            ),
          ),
          const SizedBox(height: 16),
          if (filteredGames.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 28),
              child: Center(
                child: Column(
                  children: [
                    Icon(LucideIcons.gamepad, size: 36, color: textMuted),
                    const SizedBox(height: 10),
                    Text(
                      'Tidak ada game dalam filter atau pencarian ini.',
                      style: GoogleFonts.spaceGrotesk(color: textMuted, fontSize: 13),
                    ),
                  ],
                ),
              ),
            )
          else
            ...filteredGames.map((game) {
              final gameVotes = game.voteCount;
              final double percentage =
                  totalVotes > 0 ? (gameVotes / totalVotes) : 0.0;

              Color statusBadgeColor = AppColors.accentGold;
              String statusText = 'REQUESTED';
              IconData statusIcon = LucideIcons.clock;

              if (game.status == 'accepted') {
                statusBadgeColor = AppColors.accentCyan;
                statusText = 'ACCEPTED';
                statusIcon = LucideIcons.circle_check;
              } else if (game.status == 'playing') {
                statusBadgeColor = AppColors.accentEmerald;
                statusText = 'PLAYING';
                statusIcon = LucideIcons.play;
              } else if (game.status == 'done') {
                statusBadgeColor = textMuted;
                statusText = 'DONE';
                statusIcon = LucideIcons.check_check;
              }

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: bgInput,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: borderSubtle),
                ),
                child: Column(
                  children: [
                    // Area Vote Taktil Beranimasi Halus
                    Material(
                      color: Colors.transparent,
                      borderRadius: BorderRadius.circular(12),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(12),
                        onTap: () async {
                          HapticFeedback.lightImpact();
                          final confirmVote = await _showConfirmDialog(
                            context: context,
                            title: 'Konfirmasi Vote Game',
                            content:
                                'Apakah Anda yakin ingin memberikan suara untuk pilihan ini?\n\n"${game.title}"',
                            confirmText: 'Ya, Berikan Vote',
                            confirmColor: AppColors.accentCyan,
                            icon: LucideIcons.vote,
                          );

                          if (!confirmVote) return;

                          try {
                            await ref
                                .read(gameProvider.notifier)
                                .submitVote(game.id, _deviceFingerprint);

                            if (mounted) {
                              _showFloatingToast(
                                context,
                                message: 'Berhasil memberikan vote untuk ${game.title}!',
                                isSuccess: true,
                                icon: LucideIcons.vote,
                              );
                            }
                          } catch (e) {
                            if (mounted) {
                              _showFloatingToast(
                                context,
                                message: 'Gagal kirim vote: $e',
                                isSuccess: false,
                              );
                            }
                          }
                        },
                        child: Stack(
                          children: [
                            // Animated Progress Bar Gliding Smoothly (Curves.easeOutCubic)
                            Positioned.fill(
                              child: AnimatedFractionallySizedBox(
                                duration: const Duration(milliseconds: 600),
                                curve: Curves.easeOutCubic,
                                alignment: Alignment.centerLeft,
                                widthFactor: percentage.clamp(0.0, 1.0),
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: AppColors.accentCyan.withValues(alpha: 0.16),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(12),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(6),
                                          decoration: BoxDecoration(
                                            color: AppColors.accentCyan.withValues(alpha: 0.12),
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Icon(
                                            LucideIcons.gamepad_2,
                                            size: 16,
                                            color: AppColors.primary(isDark),
                                          ),
                                        ),
                                        const SizedBox(width: 10),
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
                                                  color: textPrimary,
                                                ),
                                              ),
                                              const SizedBox(height: 3),
                                              Row(
                                                children: [
                                                  Container(
                                                    padding:
                                                        const EdgeInsets.symmetric(
                                                            horizontal: 6,
                                                            vertical: 2),
                                                    decoration: BoxDecoration(
                                                      color: statusBadgeColor
                                                          .withValues(alpha: 0.15),
                                                      borderRadius:
                                                          BorderRadius.circular(4),
                                                      border: Border.all(
                                                        color: statusBadgeColor
                                                            .withValues(alpha: 0.3),
                                                      ),
                                                    ),
                                                    child: Row(
                                                      mainAxisSize: MainAxisSize.min,
                                                      children: [
                                                        Icon(statusIcon,
                                                            size: 9,
                                                            color: statusBadgeColor),
                                                        const SizedBox(width: 4),
                                                        Text(
                                                          statusText,
                                                          style: GoogleFonts.spaceMono(
                                                            fontSize: 8.5,
                                                            fontWeight: FontWeight.bold,
                                                            color: statusBadgeColor,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                  if (game.genre?.isNotEmpty == true) ...[
                                                    const SizedBox(width: 6),
                                                    Expanded(
                                                      child: Text(
                                                        '• ${game.genre}',
                                                        style: GoogleFonts.spaceMono(
                                                          fontSize: 9,
                                                          color: textMuted,
                                                        ),
                                                        overflow: TextOverflow.ellipsis,
                                                      ),
                                                    ),
                                                  ],
                                                ],
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      Text(
                                        '${(percentage * 100).toStringAsFixed(0)}%',
                                        style: GoogleFonts.spaceMono(
                                          fontSize: 14,
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.primary(isDark),
                                        ),
                                      ),
                                      Text(
                                        '$gameVotes suara',
                                        style: GoogleFonts.spaceMono(
                                          fontSize: 9,
                                          color: textMuted,
                                        ),
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

                    // Moderasi Bar Aksi untuk Game Status Non-Done
                    if (game.status != 'done') ...[
                      Divider(color: borderSubtle, height: 1),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            if (game.status == 'requested') ...[
                              // Touch Target Minimum 44x44 dp: Tolak Game
                              InkWell(
                                borderRadius: BorderRadius.circular(6),
                                onTap: () async {
                                  HapticFeedback.lightImpact();
                                  final confirm = await _showConfirmDialog(
                                    context: context,
                                    title: 'Hapus Usulan Game?',
                                    content:
                                        'Game "${game.title}" akan ditolak dan dihapus permanen dari daftar usulan.',
                                    confirmText: 'Tolak & Hapus',
                                    confirmColor: AppColors.accentRed,
                                    icon: LucideIcons.trash,
                                  );

                                  if (confirm) {
                                    await ref
                                        .read(gameProvider.notifier)
                                        .deleteGame(game.id);
                                    if (mounted) {
                                      _showFloatingToast(
                                        context,
                                        message: 'Usulan game "${game.title}" ditolak',
                                        isSuccess: true,
                                        icon: LucideIcons.trash,
                                      );
                                    }
                                  }
                                },
                                child: Container(
                                  constraints: const BoxConstraints(minHeight: 44, minWidth: 44),
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                  alignment: Alignment.center,
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(LucideIcons.trash,
                                          size: 13, color: AppColors.accentRed),
                                      const SizedBox(width: 5),
                                      Text('Tolak',
                                          style: GoogleFonts.spaceMono(
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                              color: AppColors.accentRed)),
                                    ],
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),

                              // Touch Target Minimum 44x44 dp: Terima Game
                              InkWell(
                                borderRadius: BorderRadius.circular(6),
                                onTap: () async {
                                  HapticFeedback.lightImpact();
                                  final confirm = await _showConfirmDialog(
                                    context: context,
                                    title: 'Terima Usulan Game?',
                                    content:
                                        'Game "${game.title}" akan disetujui dan masuk ke daftar polling resmi.',
                                    confirmText: 'Ya, Terima',
                                    confirmColor: AppColors.accentCyan,
                                    icon: LucideIcons.circle_check,
                                  );

                                  if (confirm) {
                                    await ref
                                        .read(gameProvider.notifier)
                                        .updateGameStatus(game.id, 'accepted');
                                    if (mounted) {
                                      _showFloatingToast(
                                        context,
                                        message: 'Game "${game.title}" disetujui untuk voting!',
                                        isSuccess: true,
                                      );
                                    }
                                  }
                                },
                                child: Container(
                                  constraints: const BoxConstraints(minHeight: 44, minWidth: 44),
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                  alignment: Alignment.center,
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(LucideIcons.circle_check,
                                          size: 13, color: AppColors.accentCyan),
                                      const SizedBox(width: 5),
                                      Text('Terima',
                                          style: GoogleFonts.spaceMono(
                                              fontSize: 11,
                                              color: AppColors.primary(isDark),
                                              fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                              ),
                            ],

                            if (game.status == 'accepted')
                              // Touch Target Minimum 44x44 dp: Mulai Mainkan
                              InkWell(
                                borderRadius: BorderRadius.circular(6),
                                onTap: () async {
                                  HapticFeedback.lightImpact();
                                  final confirm = await _showConfirmDialog(
                                    context: context,
                                    title: 'Mulai Mainkan Game?',
                                    content:
                                        'Status "${game.title}" akan diubah menjadi Sedang Dimainkan (Playing).',
                                    confirmText: 'Ya, Mainkan',
                                    confirmColor: AppColors.accentEmerald,
                                    icon: LucideIcons.play,
                                  );

                                  if (confirm) {
                                    await ref
                                        .read(gameProvider.notifier)
                                        .updateGameStatus(game.id, 'playing');
                                    if (mounted) {
                                      _showFloatingToast(
                                        context,
                                        message: 'Game "${game.title}" kini sedang dimainkan!',
                                        isSuccess: true,
                                        icon: LucideIcons.play,
                                      );
                                    }
                                  }
                                },
                                child: Container(
                                  constraints: const BoxConstraints(minHeight: 44, minWidth: 44),
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                  alignment: Alignment.center,
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(LucideIcons.play,
                                          size: 13, color: AppColors.accentEmerald),
                                      const SizedBox(width: 5),
                                      Text('Mulai Mainkan',
                                          style: GoogleFonts.spaceMono(
                                              fontSize: 11,
                                              color: AppColors.accentEmerald,
                                              fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                              ),

                            if (game.status == 'playing')
                              // Touch Target Minimum 44x44 dp: Tandai Selesai
                              InkWell(
                                borderRadius: BorderRadius.circular(6),
                                onTap: () async {
                                  HapticFeedback.lightImpact();
                                  final confirm = await _showConfirmDialog(
                                    context: context,
                                    title: 'Selesaikan Game?',
                                    content:
                                        'Game "${game.title}" akan ditandai Tamat / Selesai (Done).',
                                    confirmText: 'Ya, Selesai',
                                    confirmColor: textMuted,
                                    icon: LucideIcons.check_check,
                                  );

                                  if (confirm) {
                                    await ref
                                        .read(gameProvider.notifier)
                                        .updateGameStatus(game.id, 'done');
                                    if (mounted) {
                                      _showFloatingToast(
                                        context,
                                        message: 'Game "${game.title}" ditandai selesai',
                                        isSuccess: true,
                                        icon: LucideIcons.check_check,
                                      );
                                    }
                                  }
                                },
                                child: Container(
                                  constraints: const BoxConstraints(minHeight: 44, minWidth: 44),
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                  alignment: Alignment.center,
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(LucideIcons.check_check,
                                          size: 13, color: textMuted),
                                      const SizedBox(width: 5),
                                      Text('Tandai Selesai',
                                          style: GoogleFonts.spaceMono(
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                              color: textMuted)),
                                    ],
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              );
            }),
          const SizedBox(height: 8),
          Center(
            child: Text(
              'Total $totalVotes suara pada periode voting aktif ini',
              style: GoogleFonts.spaceMono(fontSize: 10, color: textMuted),
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // TAB 2: COLLAB REQUESTS
  // ==========================================
  Widget _buildCollabRequestsTab(bool isDark) {
    final bgNav = isDark ? AppColors.bgNav : AppColors.bgNavLight;
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    final collabState = ref.watch(collabProvider);
    final requests = collabState.requests;

    if (collabState.isLoading && requests.isEmpty) {
      return Center(
          child: CircularProgressIndicator(color: AppColors.primary(isDark)));
    }

    if (collabState.error != null && requests.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(LucideIcons.circle_alert,
                  color: AppColors.accentRed, size: 40),
              const SizedBox(height: 12),
              Text(
                'Gagal mengambil data collab requests',
                style: GoogleFonts.spaceGrotesk(
                  color: textPrimary,
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary(isDark),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                icon: Icon(LucideIcons.refresh_cw, size: 16, color: isDark ? Colors.black : Colors.white),
                onPressed: () {
                  HapticFeedback.lightImpact();
                  ref.read(collabProvider.notifier).fetchCollabRequests();
                },
                label: Text('Coba Lagi',
                    style: GoogleFonts.spaceGrotesk(
                      color: isDark ? Colors.black : Colors.white,
                      fontWeight: FontWeight.bold,
                    )),
              ),
            ],
          ),
        ),
      );
    }

    // Metrik Counter (Sinkron dengan Web)
    final totalCount = requests.length;
    final pendingCount = requests.where((r) => r.status.toLowerCase() == 'pending').length;
    final shortlistCount = requests.where((r) {
      final st = r.status.toLowerCase();
      return st == 'approved' || st == 'accepted' || st == 'shortlist';
    }).length;
    final scheduledCount = requests.where((r) => r.status.toLowerCase() == 'scheduled').length;
    final archivedCount = requests.where((r) {
      final st = r.status.toLowerCase();
      return st == 'rejected' || st == 'archived' || st == 'expired';
    }).length;

    // Filter list berdasarkan chip & search query
    final filteredRequests = requests.where((r) {
      final st = r.status.toLowerCase();
      if (_selectedCollabFilter == 'pending' && st != 'pending') return false;
      if (_selectedCollabFilter == 'approved' && st != 'approved' && st != 'accepted' && st != 'shortlist') return false;
      if (_selectedCollabFilter == 'scheduled' && st != 'scheduled') return false;
      if (_selectedCollabFilter == 'rejected' && st != 'rejected' && st != 'archived' && st != 'expired') return false;

      if (_collabSearchQuery.isNotEmpty) {
        final q = _collabSearchQuery.toLowerCase();
        final matchStreamer = r.requestedStreamerName.toLowerCase().contains(q);
        final matchMsg = r.message?.toLowerCase().contains(q) ?? false;
        final matchSocial = r.requestedStreamerSocial?.toLowerCase().contains(q) ?? false;
        if (!matchStreamer && !matchMsg && !matchSocial) return false;
      }
      return true;
    }).toList();

    return RefreshIndicator(
      onRefresh: () async {
        HapticFeedback.lightImpact();
        await ref.read(collabProvider.notifier).fetchCollabRequests();
        if (mounted) {
          _showFloatingToast(
            context,
            message: 'Daftar collab requests disinkronkan',
            isSuccess: true,
            icon: LucideIcons.check_check,
          );
        }
      },
      color: AppColors.primary(isDark),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Header Mini Stats Collab
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: bgNav,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: borderSubtle),
            ),
            child: Row(
              children: [
                Expanded(
                  child: _buildMiniStatItem(
                    title: 'TOTAL USULAN',
                    value: '$totalCount',
                    color: textPrimary,
                    isDark: isDark,
                  ),
                ),
                Container(width: 1, height: 26, color: borderSubtle),
                Expanded(
                  child: _buildMiniStatItem(
                    title: 'USULAN BARU',
                    value: '$pendingCount',
                    color: AppColors.accentGold,
                    isDark: isDark,
                  ),
                ),
                Container(width: 1, height: 26, color: borderSubtle),
                Expanded(
                  child: _buildMiniStatItem(
                    title: 'DISIMPAN',
                    value: '$shortlistCount',
                    color: AppColors.accentPurple,
                    isDark: isDark,
                  ),
                ),
                Container(width: 1, height: 26, color: borderSubtle),
                Expanded(
                  child: _buildMiniStatItem(
                    title: 'DIJADWALKAN',
                    value: '$scheduledCount',
                    color: AppColors.accentEmerald,
                    isDark: isDark,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Search Field Collab (Dengan Clear Text X Min 44x44 dp)
          Container(
            decoration: BoxDecoration(
              color: bgInput,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: borderSubtle),
            ),
            child: TextField(
              controller: _collabSearchController,
              onChanged: (val) => setState(() => _collabSearchQuery = val.trim()),
              style: GoogleFonts.spaceGrotesk(fontSize: 13, color: textPrimary),
              decoration: InputDecoration(
                hintText: 'Cari streamer atau pesan usulan...',
                hintStyle: GoogleFonts.spaceGrotesk(fontSize: 12, color: textMuted),
                prefixIcon: Icon(LucideIcons.search, size: 16, color: textMuted),
                suffixIcon: _collabSearchQuery.isNotEmpty
                    ? SizedBox(
                        width: 44,
                        height: 44,
                        child: IconButton(
                          icon: Icon(LucideIcons.x, size: 16, color: textMuted),
                          onPressed: () {
                            HapticFeedback.selectionClick();
                            _collabSearchController.clear();
                            setState(() => _collabSearchQuery = '');
                          },
                        ),
                      )
                    : null,
                border: InputBorder.none,
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Filter Chips Collab
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildCollabFilterChip('all', 'Semua ($totalCount)', isDark),
                _buildCollabFilterChip('pending', 'Baru ($pendingCount)', isDark),
                _buildCollabFilterChip('approved', 'Disimpan ($shortlistCount)', isDark),
                _buildCollabFilterChip('scheduled', 'Dijadwalkan ($scheduledCount)', isDark),
                _buildCollabFilterChip('rejected', 'Arsip ($archivedCount)', isDark),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // List Collab Requests
          if (filteredRequests.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 40),
              child: Center(
                child: Column(
                  children: [
                    Icon(LucideIcons.users, size: 40, color: textMuted),
                    const SizedBox(height: 12),
                    Text(
                      'Tidak ada usulan kolaborasi dalam filter ini',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: textSecondary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Pilih filter lain atau reset pencarian',
                      style: GoogleFonts.spaceGrotesk(fontSize: 12, color: textMuted),
                    ),
                  ],
                ),
              ),
            )
          else
            ...filteredRequests.map((collab) => _buildCollabCard(collab, isDark)),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildCollabFilterChip(String key, String label, bool isDark) {
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    final isSelected = _selectedCollabFilter == key;

    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        selected: isSelected,
        showCheckmark: false,
        label: Text(
          label,
          style: GoogleFonts.spaceMono(
            fontSize: 10,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            color: isSelected ? (isDark ? Colors.black : Colors.white) : textSecondary,
          ),
        ),
        backgroundColor: bgSurface,
        selectedColor: AppColors.primary(isDark),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(
            color: isSelected
                ? AppColors.primary(isDark)
                : borderSubtle,
          ),
        ),
        onSelected: (_) {
          HapticFeedback.selectionClick();
          setState(() => _selectedCollabFilter = key);
        },
      ),
    );
  }

  Widget _buildCollabCard(CollabModel collab, bool isDark) {
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    Color statusColor;
    String statusLabel;
    final statusLower = collab.status.toLowerCase();

    switch (statusLower) {
      case 'approved':
      case 'accepted':
      case 'shortlist':
        statusColor = AppColors.accentPurple;
        statusLabel = 'DISIMPAN';
        break;
      case 'scheduled':
        statusColor = AppColors.accentEmerald;
        statusLabel = 'DIJADWALKAN';
        break;
      case 'rejected':
      case 'archived':
      case 'expired':
        statusColor = AppColors.accentRed;
        statusLabel = 'ARSIP';
        break;
      default:
        statusColor = AppColors.accentGold;
        statusLabel = 'BARU';
    }

    return Container(
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
              Expanded(
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: AppColors.accentPurple.withValues(alpha: 0.2),
                      child: Text(
                        collab.requestedStreamerName.isNotEmpty
                            ? collab.requestedStreamerName[0].toUpperCase()
                            : '?',
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: AppColors.accentPurple,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        collab.requestedStreamerName,
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: textPrimary,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),

              // Status Dropdown dengan Touch Target Minimum 44x44 dp
              PopupMenuButton<String>(
                tooltip: 'Ubah Status',
                onSelected: (newStatus) async {
                  HapticFeedback.selectionClick();
                  await ref.read(collabProvider.notifier).updateStatus(collab.id, newStatus);
                  if (mounted) {
                    _showFloatingToast(
                      context,
                      message: 'Status "${collab.requestedStreamerName}" diubah!',
                      isSuccess: true,
                    );
                  }
                },
                itemBuilder: (ctx) => [
                  PopupMenuItem(
                    value: 'pending',
                    child: Text('Baru (Pending)',
                        style: GoogleFonts.spaceGrotesk(
                            color: AppColors.accentGold, fontWeight: FontWeight.bold)),
                  ),
                  PopupMenuItem(
                    value: 'approved',
                    child: Text('Disimpan (Shortlist)',
                        style: GoogleFonts.spaceGrotesk(
                            color: AppColors.accentPurple, fontWeight: FontWeight.bold)),
                  ),
                  PopupMenuItem(
                    value: 'scheduled',
                    child: Text('Dijadwalkan',
                        style: GoogleFonts.spaceGrotesk(
                            color: AppColors.accentEmerald, fontWeight: FontWeight.bold)),
                  ),
                  PopupMenuItem(
                    value: 'rejected',
                    child: Text('Arsipkan',
                        style: GoogleFonts.spaceGrotesk(
                            color: AppColors.accentRed, fontWeight: FontWeight.bold)),
                  ),
                ],
                child: Container(
                  constraints: const BoxConstraints(minHeight: 44, minWidth: 44),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: statusColor.withValues(alpha: 0.4)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        statusLabel,
                        style: GoogleFonts.spaceMono(
                          fontSize: 9.5,
                          fontWeight: FontWeight.bold,
                          color: statusColor,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Icon(LucideIcons.chevron_down, size: 12, color: statusColor),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Link Sosmed Interaktif (Tap URL Launch + Copy to Clipboard)
          if (collab.requestedStreamerSocial != null && collab.requestedStreamerSocial!.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: bgInput,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: borderSubtle),
              ),
              child: Row(
                children: [
                  const Icon(LucideIcons.link, size: 14, color: AppColors.accentCyan),
                  const SizedBox(width: 8),
                  Expanded(
                    child: InkWell(
                      borderRadius: BorderRadius.circular(4),
                      onTap: () async {
                        HapticFeedback.lightImpact();
                        String rawUrl = collab.requestedStreamerSocial!.trim();
                        if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
                          rawUrl = 'https://$rawUrl';
                        }
                        final uri = Uri.tryParse(rawUrl);
                        if (uri != null && await canLaunchUrl(uri)) {
                          await launchUrl(uri, mode: LaunchMode.externalApplication);
                        } else if (mounted) {
                          _showFloatingToast(
                            context,
                            message: 'Format URL tidak valid',
                            isSuccess: false,
                          );
                        }
                      },
                      child: Text(
                        collab.requestedStreamerSocial!,
                        style: GoogleFonts.spaceMono(
                          fontSize: 11,
                          color: AppColors.primary(isDark),
                          decoration: TextDecoration.underline,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
                  // Touch Target 44x44 dp: Copy to Clipboard
                  SizedBox(
                    width: 44,
                    height: 44,
                    child: IconButton(
                      tooltip: 'Salin Tautan',
                      icon: const Icon(LucideIcons.copy, size: 14, color: AppColors.accentCyan),
                      onPressed: () {
                        HapticFeedback.lightImpact();
                        Clipboard.setData(
                          ClipboardData(text: collab.requestedStreamerSocial!),
                        );
                        _showFloatingToast(
                          context,
                          message: 'Link sosmed disalin ke clipboard!',
                          isSuccess: true,
                          icon: LucideIcons.copy,
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
          ],

          // Pesan Usulan Viewer (Modern Quotation Chat Styling)
          if (collab.message != null && collab.message!.isNotEmpty) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: bgInput,
                borderRadius: const BorderRadius.only(
                  topRight: Radius.circular(10),
                  bottomRight: Radius.circular(10),
                  bottomLeft: Radius.circular(10),
                ),
                border: const Border(
                  left: BorderSide(color: AppColors.accentPurple, width: 3.5),
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    LucideIcons.quote,
                    size: 14,
                    color: AppColors.accentPurple.withValues(alpha: 0.6),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      collab.message!,
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 12,
                        fontStyle: FontStyle.italic,
                        color: textSecondary,
                        height: 1.35,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
          ],

          // Catatan Admin Micro-Utility (Tap to Edit via Dialog Modal)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: bgInput.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: borderSubtle),
            ),
            child: Row(
              children: [
                const Icon(LucideIcons.notebook_pen, size: 14, color: AppColors.accentGold),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    collab.reviewNotes?.isNotEmpty == true
                        ? collab.reviewNotes!
                        : 'Belum ada catatan internal admin',
                    style: GoogleFonts.spaceMono(
                      fontSize: 11,
                      color: collab.reviewNotes?.isNotEmpty == true ? textPrimary : textMuted,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                // Touch Target 44x44 dp: Edit Catatan Admin
                SizedBox(
                  width: 44,
                  height: 44,
                  child: IconButton(
                    tooltip: 'Edit Catatan',
                    icon: const Icon(LucideIcons.pencil, size: 14, color: AppColors.accentCyan),
                    onPressed: () => _showEditCollabNoteDialog(collab),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Bottom Action Row (Hapus & Jadwalkan Cepat)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Touch Target 44x44 dp: Hapus Request
              SizedBox(
                width: 44,
                height: 44,
                child: IconButton(
                  tooltip: 'Hapus Request',
                  icon: Icon(LucideIcons.trash, size: 16, color: textMuted),
                  onPressed: () async {
                    HapticFeedback.lightImpact();
                    final confirm = await _showConfirmDialog(
                      context: context,
                      title: 'Hapus Request Collab?',
                      content:
                          'Usulan kolaborasi dari "${collab.requestedStreamerName}" akan dihapus permanen dari sistem.',
                      confirmText: 'Ya, Hapus',
                      confirmColor: AppColors.accentRed,
                      icon: LucideIcons.trash,
                    );
                    if (confirm) {
                      await ref.read(collabProvider.notifier).deleteRequest(collab.id);
                      if (mounted) {
                        _showFloatingToast(
                          context,
                          message: 'Usulan kolaborasi dihapus',
                          isSuccess: true,
                          icon: LucideIcons.trash,
                        );
                      }
                    }
                  },
                ),
              ),

              if (statusLower != 'scheduled')
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.accentEmerald,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  icon: const Icon(LucideIcons.calendar, size: 14, color: Colors.black),
                  label: Text(
                    'Jadwalkan',
                    style: GoogleFonts.spaceMono(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.black : Colors.white,
                    ),
                  ),
                  onPressed: () async {
                    HapticFeedback.lightImpact();
                    await ref.read(collabProvider.notifier).updateStatus(collab.id, 'scheduled');
                    if (mounted) {
                      _showFloatingToast(
                        context,
                        message: 'Status "${collab.requestedStreamerName}" diubah ke DIJADWALKAN!',
                        isSuccess: true,
                        icon: LucideIcons.calendar,
                      );
                    }
                  },
                ),
            ],
          ),
        ],
      ),
    );
  }

  // Dialog Edit Catatan Admin Collab (Responsif terhadap Keyboard)
  void _showEditCollabNoteDialog(CollabModel collab) {
    HapticFeedback.lightImpact();
    final noteController = TextEditingController(text: collab.reviewNotes ?? '');

    showDialog(
      context: context,
      builder: (ctx) {
        final isDark = Theme.of(ctx).brightness == Brightness.dark;
        final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
        final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
        final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
        final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
        final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
        final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

        return AlertDialog(
          backgroundColor: bgSurface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: borderSubtle),
          ),
          title: Row(
            children: [
              const Icon(LucideIcons.notebook_pen, color: AppColors.accentGold, size: 20),
              const SizedBox(width: 8),
              Text(
                'Catatan Internal Admin',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: textPrimary,
                ),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Streamer: ${collab.requestedStreamerName}',
                  style: GoogleFonts.spaceMono(fontSize: 11, color: textSecondary),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: noteController,
                  maxLines: 4,
                  autofocus: true,
                  style: GoogleFonts.spaceGrotesk(color: textPrimary, fontSize: 13),
                  decoration: InputDecoration(
                    hintText: 'Tulis rencana, akun Discord, atau catatan koordinasi...',
                    hintStyle: GoogleFonts.spaceGrotesk(color: textMuted, fontSize: 12),
                    filled: true,
                    fillColor: bgInput,
                    contentPadding: const EdgeInsets.all(12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide(color: borderSubtle),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: AppColors.accentCyan, width: 1.2),
                    ),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                HapticFeedback.selectionClick();
                Navigator.pop(ctx);
              },
              child: Text('Batal', style: GoogleFonts.spaceMono(color: textMuted)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.accentCyan,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              ),
              onPressed: () async {
                HapticFeedback.selectionClick();
                final notes = noteController.text.trim();
                Navigator.pop(ctx);
                try {
                  await ref.read(collabProvider.notifier).updateNotes(collab.id, notes);
                  if (mounted) {
                    _showFloatingToast(
                      context,
                      message: 'Catatan admin berhasil disimpan!',
                      isSuccess: true,
                      icon: LucideIcons.circle_check,
                    );
                  }
                } catch (e) {
                  if (mounted) {
                    _showFloatingToast(
                      context,
                      message: 'Gagal menyimpan catatan: $e',
                      isSuccess: false,
                    );
                  }
                }
              },
              child: Text(
                'Simpan Catatan',
                style: GoogleFonts.spaceMono(
                  color: Colors.black,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  // Mini Stat Widget Helper
  Widget _buildMiniStatItem({
    required String title,
    required String value,
    required Color color,
    required bool isDark,
  }) {
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    return Column(
      children: [
        Text(title, style: GoogleFonts.spaceMono(fontSize: 8.5, color: textMuted, letterSpacing: 0.5)),
        const SizedBox(height: 3),
        Text(
          value,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }
}
