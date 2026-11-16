import 'package:dio/dio.dart';
import '../models/todo_model.dart';

/// Service untuk mengelola daftar tugas dan to-do list streaming VTuber.
///
/// Bertanggung jawab atas:
/// - Mengambil daftar to-do berdasarkan filter status dan tingkat prioritas.
/// - Menghitung metadata statistik (total tugas, selesai hari ini, deadline mendekat).
/// - Menambahkan tugas baru lengkap dengan deadline, tag, dan referensi aset.
/// - Memperbarui status penyelesaian atau rincian to-do.
/// - Menghapus tugas dari sistem.
class TodoService {
  final Dio _dio;

  TodoService(this._dio);

  /// Mengambil daftar tugas dengan filter opsional [status] dan [priority] (`GET /todos`).
  ///
  /// Mengembalikan Dart Record berisi:
  /// - `todos`: Daftar objek [TodoModel].
  /// - `meta`: Map statistik ringkas (`total`, `completed_today`, `pending_deadlines`).
  Future<({List<TodoModel> todos, Map<String, int> meta})> getTodos({
    String? status,
    String? priority,
  }) async {
    // Siapkan parameter query jika ada filter aktif
    final queryParams = <String, String>{};
    if (status != null) queryParams['status'] = status;
    if (priority != null) queryParams['priority'] = priority;

    final response = await _dio.get(
      '/todos',
      queryParameters: queryParams.isEmpty ? null : queryParams,
    );

    if (response.data['success'] == true) {
      final data = response.data['data'];

      // Parsing daftar item todo dari payload respons
      final List raw = (data is Map && data['todos'] is List)
          ? data['todos'] as List
          : (data is List ? data : []);

      final todos = raw.map((item) {
        final map = item is Map
            ? Map<String, dynamic>.from(item)
            : <String, dynamic>{};
        return TodoModel.fromJson(map);
      }).toList();

      // Parsing metadata ringkasan statistik tugas
      final metaMap = (data is Map && data['meta'] is Map)
          ? data['meta'] as Map
          : {};

      final meta = {
        'total':
            int.tryParse(metaMap['total']?.toString() ?? '') ?? todos.length,
        'completed_today':
            int.tryParse(metaMap['completed_today']?.toString() ?? '') ?? 0,
        'pending_deadlines':
            int.tryParse(metaMap['pending_deadlines']?.toString() ?? '') ?? 0,
      };

      return (todos: todos, meta: meta);
    }
    throw Exception(
      response.data['message'] ?? 'Gagal mengambil daftar todo',
    );
  }

  /// Membuat to-do item baru (`POST /todos`).
  ///
  /// Mendukung judul, deskripsi, prioritas, tenggat waktu (deadline),
  /// tag label, serta tautan/informasi resource.
  Future<TodoModel> createTodo({
    required String title,
    String? description,
    String priority = 'medium',
    DateTime? deadline,
    List<String> tags = const [],
    String? resourceInfo,
  }) async {
    final response = await _dio.post(
      '/todos',
      data: {
        'title': title,
        'description': description,
        'priority': priority,
        'deadline': deadline?.toIso8601String(),
        'tags': tags,
        'resource_info': resourceInfo,
      },
    );

    if (response.data['success'] == true) {
      return TodoModel.fromJson(response.data['data']);
    }
    throw Exception(response.data['message'] ?? 'Gagal membuat todo');
  }

  /// Memperbarui informasi to-do yang ada (`PATCH /todos/:id`).
  ///
  /// Dapat digunakan untuk toggle status checklist maupun mengubah rincian teks.
  Future<TodoModel> updateTodo(int id, Map<String, dynamic> updates) async {
    final response = await _dio.patch('/todos/$id', data: updates);
    if (response.data['success'] == true) {
      return TodoModel.fromJson(response.data['data']);
    }
    throw Exception(
      response.data['message'] ?? 'Gagal memperbarui todo',
    );
  }

  /// Menghapus to-do item berdasarkan ID (`DELETE /todos/:id`).
  Future<void> deleteTodo(int id) async {
    final response = await _dio.delete('/todos/$id');
    if (response.data['success'] != true) {
      throw Exception(
        response.data['message'] ?? 'Gagal menghapus todo',
      );
    }
  }
}
