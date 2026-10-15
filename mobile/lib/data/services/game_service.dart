import 'package:dio/dio.dart';
import '../models/game_model.dart';

class GameService {
  final Dio _dio;

  GameService(this._dio);

  /// GET /api/games — ambil semua game (public)
  Future<List<GameModel>> getGames() async {
    final response = await _dio.get('/games');
    if (response.data['success'] == true) {
      final List raw = response.data['data'] ?? [];
      return raw.map((json) => GameModel.fromJson(json)).toList();
    }
    throw Exception(response.data['message'] ?? 'Gagal mengambil daftar game');
  }

  /// GET /api/votes/stats — statistik vote periode ini
  Future<VoteStatsModel> getVoteStats() async {
    final response = await _dio.get('/votes/stats');
    if (response.data['success'] == true) {
      return VoteStatsModel.fromJson(response.data['data']);
    }
    throw Exception(response.data['message'] ?? 'Gagal mengambil statistik vote');
  }

  /// POST /api/games — tambah game kandidat baru (protected/admin)
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
    throw Exception(response.data['message'] ?? 'Gagal menambah game baru');
  }

  /// POST /api/votes/:gameId — submit vote (public, memerlukan fingerprint)
  Future<Map<String, dynamic>> submitVote(int gameId, String fingerprint) async {
    final response = await _dio.post(
      '/votes/$gameId',
      data: {'fingerprint': fingerprint},
    );
    if (response.data['success'] == true) {
      return response.data['data'] as Map<String, dynamic>;
    }
    throw Exception(response.data['message'] ?? 'Gagal submit vote');
  }

  /// PATCH /api/games/:id/status — ubah status game (protected/admin)
  Future<GameModel> updateGameStatus(int id, String status) async {
    final response = await _dio.patch('/games/$id/status', data: {'status': status});
    if (response.data['success'] == true) {
      return GameModel.fromJson(response.data['data']);
    }
    throw Exception(response.data['message'] ?? 'Gagal memperbarui status game');
  }

  /// DELETE /api/games/:id — hapus game (protected/admin)
  Future<void> deleteGame(int id) async {
    final response = await _dio.delete('/games/$id');
    if (response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Gagal menghapus game');
    }
  }
}