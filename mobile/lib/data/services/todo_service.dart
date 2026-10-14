import 'package:dio/dio.dart';
import '../models/todo_model.dart';

class TodoService {
  final Dio _dio;

  TodoService(this._dio);

  /// GET /api/todos?status=pending|in_progress|completed&priority=urgent|high|medium|low
  Future<({List<TodoModel> todos, Map<String, int> meta})> getTodos({
    String? status,
    String? priority,
  }) async {
    final queryParams = <String, String>{};
    if (status != null) queryParams['status'] = status;
    if (priority != null) queryParams['priority'] = priority;

    final response = await _dio.get(
      '/todos',
      queryParameters: queryParams.isEmpty ? null : queryParams,
    );

    if (response.data['success'] == true) {
      final data = response.data['data'];
      final List raw = (data is Map && data['todos'] is List)
          ? data['todos'] as List
          : (data is List ? data : []);

      final todos = raw.map((item) {
        final map = item is Map
            ? Map<String, dynamic>.from(item)
            : <String, dynamic>{};
        return TodoModel.fromJson(map);
      }).toList();

      final metaMap = (data is Map && data['meta'] is Map)
          ? data['meta'] as Map
          : {};

      final meta = {
        'total': int.tryParse(metaMap['total']?.toString() ?? '') ?? todos.length,
        'completed_today': int.tryParse(metaMap['completed_today']?.toString() ?? '') ?? 0,
        'pending_deadlines': int.tryParse(metaMap['pending_deadlines']?.toString() ?? '') ?? 0,
      };
      return (todos: todos, meta: meta);
    }
    throw Exception(response.data['message'] ?? 'Gagal mengambil daftar todo');
  }

  /// POST /api/todos — buat todo baru
  Future<TodoModel> createTodo({
    required String title,
    String? description,
    String priority = 'medium',
    DateTime? deadline,
    List<String> tags = const [],
    String? resourceInfo,
  }) async {
    final response = await _dio.post('/todos', data: {
      'title': title,
      'description': description,
      'priority': priority,
      'deadline': deadline?.toIso8601String(),
      'tags': tags,
      'resource_info': resourceInfo,
    });
    if (response.data['success'] == true) {
      return TodoModel.fromJson(response.data['data']);
    }
    throw Exception(response.data['message'] ?? 'Gagal membuat todo');
  }

  /// PATCH /api/todos/:id — update todo (termasuk toggle complete)
  Future<TodoModel> updateTodo(int id, Map<String, dynamic> updates) async {
    final response = await _dio.patch('/todos/$id', data: updates);
    if (response.data['success'] == true) {
      return TodoModel.fromJson(response.data['data']);
    }
    throw Exception(response.data['message'] ?? 'Gagal memperbarui todo');
  }

  /// DELETE /api/todos/:id — hapus todo
  Future<void> deleteTodo(int id) async {
    final response = await _dio.delete('/todos/$id');
    if (response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Gagal menghapus todo');
    }
  }
}
