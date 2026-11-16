import 'package:dio/dio.dart';
import '../models/schedule_model.dart';

/// Service untuk mengelola jadwal siaran streaming VTuber (Schedules).
///
/// Bertanggung jawab atas:
/// - Mengambil daftar jadwal stream yang akan datang atau yang telah selesai.
/// - Menambahkan jadwal streaming baru.
/// - Mengubah informasi jadwal (judul, waktu, status, platform, link stream).
/// - Menghapus jadwal siaran.
class ScheduleService {
  final Dio _dio;

  ScheduleService(this._dio);

  /// Mengambil daftar semua jadwal siaran streaming (`GET /schedules`).
  ///
  /// Mampu menangani format respons fleksibel dari backend
  /// (baik berupa `List` langsung maupun `Map` dengan key `schedules`).
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
        throw const FormatException(
          'Format data jadwal dari server tidak valid.',
        );
      }
      return raw.map((json) => ScheduleModel.fromJson(json)).toList();
    }
    throw Exception(
      response.data['message'] ?? 'Gagal mengambil jadwal',
    );
  }

  /// Membuat dan menambahkan jadwal siaran baru (`POST /schedules`).
  ///
  /// Menyertakan `userId` dalam payload serta header `x-user-id`
  /// untuk otorisasi kepemilikan jadwal di sisi backend.
  Future<ScheduleModel> createSchedule(
    ScheduleModel schedule, {
    int? userId,
  }) async {
    final payload = schedule.toJson();
    final effectiveUserId =
        userId ?? (schedule.userId > 0 ? schedule.userId : 1);
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
    throw Exception(
      response.data['message'] ?? 'Gagal menambah jadwal',
    );
  }

  /// Memperbarui informasi jadwal yang ada berdasarkan ID (`PATCH /schedules/:id`).
  ///
  /// [updates] berisi pasangan key-value field yang ingin diperbarui
  /// (misal: judul, waktu mulai, platform, dsb).
  Future<ScheduleModel> updateSchedule(
    int id,
    Map<String, dynamic> updates, {
    int? userId,
  }) async {
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
    throw Exception(
      response.data['message'] ?? 'Gagal memperbarui jadwal',
    );
  }

  /// Menghapus jadwal streaming berdasarkan ID (`DELETE /schedules/:id`).
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
      throw Exception(
        response.data['message'] ?? 'Gagal menghapus jadwal',
      );
    }
  }
}
