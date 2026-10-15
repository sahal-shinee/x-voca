import 'package:dio/dio.dart';
import '../models/schedule_model.dart';

class ScheduleService {
  final Dio _dio;

  ScheduleService(this._dio);

  /// GET /api/schedules — Ambil daftar jadwal stream
  Future<List<ScheduleModel>> getSchedules() async {
    final response = await _dio.get('/schedules');
    if (response.data['success'] == true) {
      final data = response.data['data'];
      final raw = data is List
          ? data
          : data is Map<String, dynamic>
              ? data['schedules']
              : null;
      if (raw is! List) {
        throw const FormatException('Format data jadwal dari server tidak valid.');
      }
      return raw.map((json) => ScheduleModel.fromJson(json)).toList();
    }
    throw Exception(response.data['message'] ?? 'Gagal mengambil jadwal');
  }

  /// POST /api/schedules — Tambah jadwal stream baru
  Future<ScheduleModel> createSchedule(ScheduleModel schedule, {int? userId}) async {
    final payload = schedule.toJson();
    final effectiveUserId = userId ?? (schedule.userId > 0 ? schedule.userId : 1);
    payload['user_id'] = effectiveUserId;

    final response = await _dio.post(
      '/schedules',
      data: payload,
      options: Options(
        headers: {
          'x-user-id': effectiveUserId.toString(),
        },
      ),
    );
    if (response.data['success'] == true) {
      return ScheduleModel.fromJson(response.data['data']);
    }
    throw Exception(response.data['message'] ?? 'Gagal menambah jadwal');
  }

  /// PATCH /api/schedules/:id — Update jadwal
  Future<ScheduleModel> updateSchedule(int id, Map<String, dynamic> updates, {int? userId}) async {
    final payload = Map<String, dynamic>.from(updates);
    final effectiveUserId = userId ?? 1;
    payload['user_id'] = effectiveUserId;

    final response = await _dio.patch(
      '/schedules/$id',
      data: payload,
      options: Options(
        headers: {
          'x-user-id': effectiveUserId.toString(),
        },
      ),
    );
    if (response.data['success'] == true) {
      return ScheduleModel.fromJson(response.data['data']);
    }
    throw Exception(response.data['message'] ?? 'Gagal memperbarui jadwal');
  }

  /// DELETE /api/schedules/:id — Hapus jadwal
  Future<void> deleteSchedule(int id, {int? userId}) async {
    final effectiveUserId = userId ?? 1;
    final response = await _dio.delete(
      '/schedules/$id',
      options: Options(
        headers: {
          'x-user-id': effectiveUserId.toString(),
        },
      ),
    );
    if (response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Gagal menghapus jadwal');
    }
  }
}