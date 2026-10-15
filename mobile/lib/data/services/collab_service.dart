import 'package:dio/dio.dart';
import '../models/collab_model.dart';

class CollabService {
  final Dio _dio;

  CollabService(this._dio);

  /// GET /api/collab-requests — Ambil semua pengajuan collab
  Future<List<CollabModel>> getCollabRequests() async {
    final response = await _dio.get('/collab-requests');
    if (response.data['success'] == true) {
      final List raw = response.data['data'] ?? [];
      return raw.map((json) => CollabModel.fromJson(json)).toList();
    }
    throw Exception(
        response.data['message'] ?? 'Gagal mengambil data collab request');
  }

  /// PATCH /api/collab-requests/:id/status — Ubah status ('accepted' / 'rejected')
  Future<CollabModel> updateCollabStatus(
      int id, String status, {String? notes}) async {
    final response = await _dio.patch(
      '/collab-requests/$id/status',
      data: {
        'status': status,
        if (notes != null && notes.isNotEmpty) 'review_notes': notes,
      },
    );
    if (response.data['success'] == true) {
      return CollabModel.fromJson(response.data['data']);
    }
    throw Exception(
        response.data['message'] ?? 'Gagal memperbarui status collab');
  }

  /// DELETE /api/collab-requests/:id — Hapus data collab request
  Future<void> deleteCollabRequest(int id) async {
    final response = await _dio.delete('/collab-requests/$id');
    if (response.data['success'] != true) {
      throw Exception(
          response.data['message'] ?? 'Gagal menghapus collab request');
    }
  }
}