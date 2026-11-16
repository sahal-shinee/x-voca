import 'package:dio/dio.dart';
import '../models/collab_model.dart';

/// Service untuk mengelola data permohonan kolaborasi (Collab Requests).
///
/// Bertanggung jawab atas:
/// - Mengambil seluruh daftar pengajuan collab dari partner / vtuber lain.
/// - Menyetujui, menolak, atau meninjau (review) permohonan collab.
/// - Menyimpan catatan review internal admin.
/// - Menghapus data permohonan collab.
class CollabService {
  final Dio _dio;

  CollabService(this._dio);

  /// Mengambil daftar semua permohonan kolaborasi yang masuk (`GET /collab-requests`).
  Future<List<CollabModel>> getCollabRequests() async {
    final response = await _dio.get('/collab-requests');
    if (response.data['success'] == true) {
      final List raw = response.data['data'] ?? [];
      return raw.map((json) => CollabModel.fromJson(json)).toList();
    }
    throw Exception(
      response.data['message'] ?? 'Gagal mengambil data collab request',
    );
  }

  /// Memperbarui status collab (misal: 'approved', 'rejected', 'pending')
  /// beserta catatan review admin (`PATCH /collab-requests/:id/review`).
  ///
  /// Dilengkapi fallback ke endpoint `/status` jika endpoint `/review` mengembalikan 404.
  Future<CollabModel> updateCollabStatus(
    int id,
    String status, {
    String? notes,
  }) async {
    Response response;
    final payload = {
      'status': status,
      if (notes != null) 'notes': notes,
      if (notes != null) 'review_notes': notes,
    };

    try {
      // Coba endpoint review terlebih dahulu
      response = await _dio.patch('/collab-requests/$id/review', data: payload);
    } on DioException catch (e) {
      // Fallback ke endpoint status jika rute review tidak ditemukan di backend lama
      if (e.response?.statusCode == 404) {
        response = await _dio.patch(
          '/collab-requests/$id/status',
          data: payload,
        );
      } else {
        rethrow;
      }
    }

    if (response.data['success'] == true) {
      return CollabModel.fromJson(response.data['data']);
    }
    throw Exception(
      response.data['message'] ?? 'Gagal memperbarui status collab',
    );
  }

  /// Memperbarui hanya catatan review internal admin tanpa mengubah status collab.
  Future<CollabModel> updateReviewNotes(int id, String notes) async {
    Response response;
    final payload = {
      'action': 'update_note',
      'notes': notes,
      'review_notes': notes,
    };

    try {
      response = await _dio.patch('/collab-requests/$id/review', data: payload);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        response = await _dio.patch(
          '/collab-requests/$id/status',
          data: payload,
        );
      } else {
        rethrow;
      }
    }

    if (response.data['success'] == true) {
      return CollabModel.fromJson(response.data['data']);
    }
    throw Exception(
      response.data['message'] ?? 'Gagal menyimpan catatan admin',
    );
  }

  /// Menghapus entri permohonan kolaborasi berdasarkan ID (`DELETE /collab-requests/:id`).
  Future<void> deleteCollabRequest(int id) async {
    final response = await _dio.delete('/collab-requests/$id');
    if (response.data['success'] != true) {
      throw Exception(
        response.data['message'] ?? 'Gagal menghapus collab request',
      );
    }
  }
}
