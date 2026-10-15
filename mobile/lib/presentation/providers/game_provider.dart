import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../core/config/env.dart';
import '../../data/models/game_model.dart';
import '../../data/services/game_service.dart';
import 'auth_provider.dart';

// ==========================================
// 1. CLASS STATE (Wadah Penyimpanan Data UI Game & Vote)
// ==========================================
class GameState {
  // Status loading saat mengambil data dari server
  final bool isLoading;

  // Daftar game yang didapat dari API GET /api/games
  final List<GameModel> games;

  // Data statistik vote dari API GET /api/votes/stats
  final VoteStatsModel? voteStats;

  // Menampung pesan error jika koneksi/request gagal
  final String? error;

  GameState({
    this.isLoading = false,
    this.games = const [],
    this.voteStats,
    this.error,
  });

  // Helper copyWith untuk memperbarui variabel state secara imutabel
  GameState copyWith({
    bool? isLoading,
    List<GameModel>? games,
    VoteStatsModel? voteStats,
    String? error,
  }) {
    return GameState(
      isLoading: isLoading ?? this.isLoading,
      games: games ?? this.games,
      voteStats: voteStats ?? this.voteStats,
      error: error,
    );
  }
}

// ==========================================
// 2. NOTIFIER CLASS (Logika Bisnis & Penanganan API)
// ==========================================
class GameNotifier extends StateNotifier<GameState> {
  final GameService _gameService;

  // Otomatis memuat daftar game dan statistik vote saat provider diinisialisasi
  GameNotifier(this._gameService) : super(GameState()) {
    loadAllData();
  }

  // A. Memuat seluruh data (Daftar Game + Statistik Vote) sekaligus
  Future<void> loadAllData() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      // Jalankan pemanggilan API secara paralel agar lebih cepat
      final results = await Future.wait([
        _gameService.getGames(),
        _gameService.getVoteStats(),
      ]);

      final gamesData = results[0] as List<GameModel>;
      final statsData = results[1] as VoteStatsModel;

      state = state.copyWith(
        isLoading: false,
        games: gamesData,
        voteStats: statsData,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  // B. Ambil hanya daftar game (GET /api/games)
  Future<void> fetchGames() async {
    try {
      final games = await _gameService.getGames();
      state = state.copyWith(games: games);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  // C. Ambil statistik vote (GET /api/votes/stats)
  Future<void> fetchVoteStats() async {
    try {
      final stats = await _gameService.getVoteStats();
      state = state.copyWith(voteStats: stats);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  // D. Submit Vote untuk Game tertentu (POST /api/votes/:gameId)
  Future<Map<String, dynamic>> submitVote(int gameId, String fingerprint) async {
    try {
      // Panggil API vote dengan melampirkan fingerprint perangkat
      final result = await _gameService.submitVote(gameId, fingerprint);
      
      // Setelah berhasil vote, refresh data game & statistik agar UI langsung ter-update
      loadAllData();
      
      return result;
    } catch (e) {
      rethrow; // Lempar error ke UI agar SnackBar/Dialog bisa menampilkan pesan gagal
    }
  }

  // E. Ubah status game (PATCH /api/games/:id/status) — Khusus Admin/Protected
  Future<void> updateGameStatus(int id, String status) async {
    try {
      final updatedGame = await _gameService.updateGameStatus(id, status);
      
      // Update item game di state lokal secara instan
      state = state.copyWith(
        games: state.games.map((g) => g.id == id ? updatedGame : g).toList(),
      );
      
      // Refresh statistik vote
      fetchVoteStats();
    } catch (e) {
      rethrow;
    }
  }

  // F. Hapus game dari daftar (DELETE /api/games/:id) — Khusus Admin/Protected
  Future<void> deleteGame(int id) async {
    try {
      await _gameService.deleteGame(id);
      
      // Hapus game dari state lokal
      state = state.copyWith(
        games: state.games.where((g) => g.id != id).toList(),
      );
      
      fetchVoteStats();
    } catch (e) {
      rethrow;
    }
  }
}

// ==========================================
// 3. SERVICE PROVIDER (Konfigurasi Dio & Header Auth)
// ==========================================
final gameServiceProvider = Provider<GameService>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: Env.apiBaseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));

  // Ambil data user dari authProvider jika sedang terautentikasi
  final userState = ref.watch(authProvider);

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) {
        final currentUser = userState.value;
        if (currentUser != null && currentUser.id > 0) {
          options.headers['x-user-id'] = currentUser.id.toString();
        }
        return handler.next(options);
      },
    ),
  );

  return GameService(dio);
});

// ==========================================
// 4. MAIN PROVIDER (Akses Utama dari UI)
// ==========================================
final gameProvider = StateNotifierProvider<GameNotifier, GameState>((ref) {
  final gameService = ref.watch(gameServiceProvider);
  return GameNotifier(gameService);
});