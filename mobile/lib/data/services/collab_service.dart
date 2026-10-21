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

  /// PATCH /api/collab-requests/:id/review — Ubah status dan simpan catatan admin
  Future<CollabModel> updateCollabStatus(
      int id, String status, {String? notes}) async {
    Response response;
    final payload = {
      'status': status,
      if (notes != null) 'notes': notes,
      if (notes != null) 'review_notes': notes,
    };

    try {
      response = await _dio.patch('/collab-requests/$id/review', data: payload);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        response = await _dio.patch('/collab-requests/$id/status', data: payload);
      } else {
        rethrow;
      }
    }

    if (response.data['success'] == true) {
      return CollabModel.fromJson(response.data['data']);
    }
    throw Exception(
        response.data['message'] ?? 'Gagal memperbarui status collab');
  }

  /// PATCH /api/collab-requests/:id/review — Simpan/edit catatan admin saja
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
        response = await _dio.patch('/collab-requests/$id/status', data: payload);
      } else {
        rethrow;
      }
    }

    if (response.data['success'] == true) {
      return CollabModel.fromJson(response.data['data']);
    }
    throw Exception(
        response.data['message'] ?? 'Gagal menyimpan catatan admin');
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