import 'package:dio/dio.dart';
import '../models/game_model.dart';

/// Service untuk mengelola game stream dan sistem voting komunitas.
///
/// Bertanggung jawab atas:
/// - Mengambil daftar game kandidat stream beserta statusnya.
/// - Mengambil statistik dan akumulasi voting saat ini.
/// - Menambahkan game baru ke dalam daftar voting (Akses Admin).
/// - Mengirimkan vote penonton dengan proteksi fingerprint perangkat.
/// - Mengubah status game (misal: 'active', 'played', 'archived') dan menghapus game.
class GameService {
  final Dio _dio;

  GameService(this._dio);

  /// Mengambil semua daftar game kandidat stream (`GET /games`).
  ///
  /// Dapat diakses oleh publik/pengguna umum.
  Future<List<GameModel>> getGames() async {
    final response = await _dio.get('/games');
    if (response.data['success'] == true) {
      final List raw = response.data['data'] ?? [];
      return raw.map((json) => GameModel.fromJson(json)).toList();
    }
    throw Exception(
      response.data['message'] ?? 'Gagal mengambil daftar game',
    );
  }

  /// Mengambil ringkasan statistik perolehan suara/vote periode aktif (`GET /votes/stats`).
  Future<VoteStatsModel> getVoteStats() async {
    final response = await _dio.get('/votes/stats');
    if (response.data['success'] == true) {
      final periodKey = response.data['meta']?['period_key'] as String?;
      return VoteStatsModel.fromJson(response.data['data'], periodKey: periodKey);
    }
    throw Exception(
      response.data['message'] ?? 'Gagal mengambil statistik vote',
    );
  }

  /// Menambahkan kandidat game baru untuk voting (`POST /games`).
  ///
  /// Memerlukan hak akses autentikasi admin.
  Future<GameModel> createGame({required String title, String? genre}) async {
    final response = await _dio.post(
      '/games',
      data: {
        'title': title,
        if (genre != null && genre.isNotEmpty) 'genre': genre,
      },
    );
    if (response.data['success'] == true) {
      return GameModel.fromJson(response.data['data']);
    }
    throw Exception(
      response.data['message'] ?? 'Gagal menambah game baru',
    );
  }

  /// Mengirimkan vote untuk game pilihan pengguna (`POST /votes/:gameId`).
  ///
  /// Memerlukan [fingerprint] perangkat untuk mencegah kecurangan/spam voting ganda.
  Future<Map<String, dynamic>> submitVote(
    int gameId,
    String fingerprint,
  ) async {
    final response = await _dio.post(
      '/votes/$gameId',
      data: {'fingerprint': fingerprint},
    );
    if (response.data['success'] == true) {
      return response.data['data'] as Map<String, dynamic>;
    }
    throw Exception(response.data['message'] ?? 'Gagal submit vote');
  }

  /// Mereset periode voting bulanan (`POST /votes/reset-period`).
  ///
  /// Mengarsipkan voting periode lama dan mengembalikan game yang belum tamat ke 0 suara.
  Future<void> resetVotingPeriod() async {
    final response = await _dio.post('/votes/reset-period');
    if (response.data['success'] != true) {
      throw Exception(
        response.data['message'] ?? 'Gagal mereset periode voting',
      );
    }
  }

  /// Mengubah status ketersediaan atau tayang game (`PATCH /games/:id/status`).
  Future<GameModel> updateGameStatus(int id, String status) async {
    final response = await _dio.patch(
      '/games/$id/status',
      data: {'status': status},
    );
    if (response.data['success'] == true) {
      return GameModel.fromJson(response.data['data']);
    }
    throw Exception(
      response.data['message'] ?? 'Gagal memperbarui status game',
    );
  }

  /// Menghapus data game dari daftar (`DELETE /games/:id`).
  Future<void> deleteGame(int id) async {
    final response = await _dio.delete('/games/$id');
    if (response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Gagal menghapus game');
    }
  }
}
