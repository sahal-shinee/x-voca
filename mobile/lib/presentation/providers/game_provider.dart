import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../core/config/env.dart';
import '../../data/models/game_model.dart';
import '../../data/services/game_service.dart';
import 'auth_provider.dart';

// ==========================================
// 1. CLASS STATE
// ==========================================
class GameState {
  final bool isLoading;
  final List<GameModel> games;
  final VoteStatsModel? voteStats;
  final String? error;

  GameState({
    this.isLoading = false,
    this.games = const [],
    this.voteStats,
    this.error,
  });

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
// 2. NOTIFIER CLASS
// ==========================================
class GameNotifier extends StateNotifier<GameState> {
  final GameService _gameService;

  GameNotifier(this._gameService) : super(GameState()) {
    loadAllData();
  }

  // A. Memuat seluruh data (Daftar Game + Statistik Vote)
  Future<void> loadAllData() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
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

  // B. Ambil daftar game (GET /api/games)
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

  // D. Tambah Game Baru (POST /api/games) — Dipanggil saat klik tombol '+' di VotesScreen
  Future<void> addGame(String title, {String? genre}) async {
    try {
      final newGame = await _gameService.createGame(title: title, genre: genre);
      
      // Optimistic Update: langsung masukkan game baru ke state lokal
      state = state.copyWith(
        games: [...state.games, newGame],
      );
      
      // Refresh statistik
      fetchVoteStats();
    } catch (e) {
      rethrow;
    }
  }

  // E. Submit Vote dengan Optimistic Update (POST /api/votes/:gameId)
  Future<Map<String, dynamic>> submitVote(int gameId, String fingerprint) async {
    // 1. Simpan backup state sebelum diubah (untuk rollback jika error)
    final previousGames = state.games;
    final previousStats = state.voteStats;

    // 2. Optimistic Update: Tambah jumlah vote di UI secara instan!
    final updatedGames = state.games.map((game) {
      if (game.id == gameId) {
        return game.copyWith(voteCount: game.voteCount + 1);
      }
      return game;
    }).toList();

    VoteStatsModel? updatedStats;
    if (previousStats != null) {
      updatedStats = previousStats.copyWith(
        totalVotes: previousStats.totalVotes + 1,
      );
    }

    state = state.copyWith(
      games: updatedGames,
      voteStats: updatedStats,
    );

    try {
      // 3. Kirim data ke backend
      final result = await _gameService.submitVote(gameId, fingerprint);
      
      // Refresh data asli dari server
      loadAllData();
      return result;
    } catch (e) {
      // 4. Jika gagal (misal 401 atau sudah pernah vote), kembalikan ke state awal
      state = state.copyWith(
        games: previousGames,
        voteStats: previousStats,
      );
      rethrow;
    }
  }

  // F. Ubah status game (PATCH /api/games/:id/status)
  Future<void> updateGameStatus(int id, String status) async {
    try {
      final updatedGame = await _gameService.updateGameStatus(id, status);
      
      state = state.copyWith(
        games: state.games.map((g) => g.id == id ? updatedGame : g).toList(),
      );
      
      fetchVoteStats();
    } catch (e) {
      rethrow;
    }
  }

  // G. Hapus game dari daftar (DELETE /api/games/:id)
  Future<void> deleteGame(int id) async {
    try {
      await _gameService.deleteGame(id);
      
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
// 3. SERVICE PROVIDER (Injeksi Header x-user-id)
// ==========================================
final gameServiceProvider = Provider<GameService>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: Env.apiBaseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));

  // Ambil data user dari authProvider untuk header x-user-id
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
// 4. MAIN PROVIDER
// ==========================================
final gameProvider = StateNotifierProvider<GameNotifier, GameState>((ref) {
  final gameService = ref.watch(gameServiceProvider);
  return GameNotifier(gameService);
});