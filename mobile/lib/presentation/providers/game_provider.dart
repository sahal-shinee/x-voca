import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/game_model.dart';
import '../../data/services/game_service.dart';
import 'auth_provider.dart';

/// State penampung data game streaming dan ringkasan voting (Game State).
///
/// Menyimpan list game [games], data statistik [voteStats], status [isLoading], dan pesan [error].
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

  /// Menggandakan instance [GameState] dengan nilai baru secara immutable.
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

/// StateNotifier yang mengatur logika bisnis daftar game dan voting.
///
/// Fitur utama:
/// - Memuat data game dan statistik secara paralel menggunakan `Future.wait`.
/// - Optimistic Update pada pengiriman vote (`submitVote`) dengan rollback otomatis jika request ditolak.
/// - Penambahan game kandidat baru (`addGame`).
/// - Pembaruan status game (`updateGameStatus`) dan penghapusan game (`deleteGame`).
class GameNotifier extends StateNotifier<GameState> {
  final GameService _gameService;

  GameNotifier(this._gameService) : super(GameState()) {
    loadAllData();
  }

  /// Memuat seluruh data (daftar game dan statistik vote) secara bersamaan.
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

  /// Mengambil daftar game terbaru dari endpoint `GET /api/games`.
  Future<void> fetchGames() async {
    try {
      final games = await _gameService.getGames();
      state = state.copyWith(games: games);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  /// Mengambil metrik statistik voting dari endpoint `GET /api/votes/stats`.
  Future<void> fetchVoteStats() async {
    try {
      final stats = await _gameService.getVoteStats();
      state = state.copyWith(voteStats: stats);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  /// Menambahkan kandidat game baru (akses admin) dan menyisipkannya langsung ke state lokal.
  Future<void> addGame(String title, {String? genre}) async {
    try {
      final newGame = await _gameService.createGame(title: title, genre: genre);

      // Optimistic update: langsung sisipkan ke list lokal
      state = state.copyWith(
        games: [...state.games, newGame],
      );

      // Sinkronisasi ulang data statistik
      fetchVoteStats();
    } catch (e) {
      rethrow;
    }
  }

  /// Mengirimkan vote dengan Optimistic Update:
  /// 1. Menyimpan cadangan state saat ini untuk rollback.
  /// 2. Menaikkan hitungan vote pada game dan total vote di UI secara instan.
  /// 3. Mengirimkan request ke server; jika gagal (misal duplikasi fingerprint), state dikembalikan ke awal.
  Future<Map<String, dynamic>> submitVote(
    int gameId,
    String fingerprint,
  ) async {
    // 1. Simpan backup state sebelum diubah
    final previousGames = state.games;
    final previousStats = state.voteStats;

    // 2. Optimistic Update pada UI lokal
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
      // 3. Kirim payload vote ke backend
      final result = await _gameService.submitVote(gameId, fingerprint);

      // Refresh data asli dari server
      loadAllData();
      return result;
    } catch (e) {
      // 4. Rollback ke kondisi semula jika terjadi error
      state = state.copyWith(
        games: previousGames,
        voteStats: previousStats,
      );
      rethrow;
    }
  }

  /// Memperbarui status permainan game (requested, accepted, playing, done).
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

  /// Menghapus game dari daftar voting.
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

/// Provider instance [GameService].
final gameServiceProvider = Provider<GameService>((ref) {
  return GameService(ref.watch(dioProvider));
});

/// Provider global data game dan sistem voting komunitas.
final gameProvider = StateNotifierProvider<GameNotifier, GameState>((ref) {
  final gameService = ref.watch(gameServiceProvider);
  return GameNotifier(gameService);
});
