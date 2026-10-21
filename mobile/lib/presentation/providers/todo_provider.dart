import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/todo_model.dart';
import '../../data/services/todo_service.dart';
import 'auth_provider.dart' show dioProvider;

class TodoState {
  final bool isLoading;
  final List<TodoModel> todos;
  final Map<String, int> meta;
  final String? error;

  TodoState({
    this.isLoading = false,
    this.todos = const [],
    this.meta = const {
      'total': 0,
      'completed_today': 0,
      'pending_deadlines': 0
    },
    this.error,
  });

  TodoState copyWith({
    bool? isLoading,
    List<TodoModel>? todos,
    Map<String, int>? meta,
    String? error,
  }) {
    return TodoState(
      isLoading: isLoading ?? this.isLoading,
      todos: todos ?? this.todos,
      meta: meta ?? this.meta,
      error: error,
    );
  }
}

class TodoNotifier extends StateNotifier<TodoState> {
  final TodoService _todoService;

  TodoNotifier(this._todoService) : super(TodoState()) {
    fetchTodos();
  }

  Future<void> fetchTodos({String? status, String? priority}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final result =
          await _todoService.getTodos(status: status, priority: priority);
      state = state.copyWith(
        isLoading: false,
        todos: result.todos,
        meta: result.meta,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> addTodo({
    required String title,
    String? description,
    String priority = 'medium',
    String status = 'pending',
    DateTime? deadline,
    List<String> tags = const [],
    String? resourceInfo,
  }) async {
    final previousTodos = state.todos;
    final previousMeta = state.meta;

    final tempId = -DateTime.now().millisecondsSinceEpoch;
    final tempTodo = TodoModel(
      id: tempId,
      userId: 0,
      title: title,
      description: description,
      priority: priority,
      status: status,
      deadline: deadline,
      tags: tags,
      resourceInfo: resourceInfo,
    );

    final newMeta = Map<String, int>.from(state.meta);
    newMeta['total'] = (newMeta['total'] ?? state.todos.length) + 1;
    if (deadline != null && deadline.isAfter(DateTime.now())) {
      newMeta['pending_deadlines'] = (newMeta['pending_deadlines'] ?? 0) + 1;
    }

    state = state.copyWith(
      todos: [tempTodo, ...state.todos],
      meta: newMeta,
    );

    try {
      final newTodo = await _todoService.createTodo(
        title: title,
        description: description,
        priority: priority,
        deadline: deadline,
        tags: tags,
        resourceInfo: resourceInfo,
      );

      state = state.copyWith(
        todos: state.todos.map((t) => t.id == tempId ? newTodo : t).toList(),
      );
    } catch (e) {
      state = state.copyWith(todos: previousTodos, meta: previousMeta);
      rethrow;
    }
  }

  Future<void> updateTodo({
    required int id,
    required String title,
    String? description,
    required String priority,
    String? status,
    DateTime? deadline,
    List<String> tags = const [],
    String? resourceInfo,
  }) async {
    final previousTodos = state.todos;

    final current = state.todos.firstWhere((t) => t.id == id, orElse: () => state.todos.first);
    final updatedTodo = current.copyWith(
      title: title,
      description: description,
      priority: priority,
      status: status ?? current.status,
      deadline: deadline,
      tags: tags,
      resourceInfo: resourceInfo,
    );

    state = state.copyWith(
      todos: state.todos.map((t) => t.id == id ? updatedTodo : t).toList(),
    );

    try {
      final Map<String, dynamic> body = {
        'title': title,
        'description': description,
        'priority': priority,
        'deadline': deadline?.toIso8601String(),
        'tags': tags,
        'resource_info': resourceInfo,
        if (status != null) 'status': status,
      };
      final updatedFromServer = await _todoService.updateTodo(id, body);
      state = state.copyWith(
        todos: state.todos.map((t) => t.id == id ? updatedFromServer : t).toList(),
      );
    } catch (e) {
      state = state.copyWith(todos: previousTodos);
      rethrow;
    }
  }

  Future<void> updateStatus(int id, String newStatus) async {
    final previousTodos = state.todos;
    final isNowCompleted = newStatus == 'completed';

    state = state.copyWith(
      todos: state.todos.map((t) {
        if (t.id == id) {
          return t.copyWith(
            status: newStatus,
            completedAt: isNowCompleted ? DateTime.now() : null,
          );
        }
        return t;
      }).toList(),
    );

    try {
      final updated = await _todoService.updateTodo(id, {'status': newStatus});
      state = state.copyWith(
        todos: state.todos.map((t) => t.id == id ? updated : t).toList(),
      );
    } catch (e) {
      state = state.copyWith(todos: previousTodos);
      rethrow;
    }
  }

  Future<void> toggleStatus(TodoModel todo) async {
    final nextStatus = todo.status == 'completed' ? 'pending' : 'completed';
    await updateStatus(todo.id, nextStatus);
  }

  Future<void> deleteTodo(int id) async {
    final previousTodos = state.todos;
    final previousMeta = state.meta;

    TodoModel? target;
    try {
      target = state.todos.firstWhere((t) => t.id == id);
    } catch (_) {}

    final newMeta = Map<String, int>.from(state.meta);
    final currentTotal = newMeta['total'] ?? state.todos.length;
    newMeta['total'] = currentTotal > 0 ? currentTotal - 1 : 0;
    if (target?.isCompleted == true) {
      final currentCompleted = newMeta['completed_today'] ?? 0;
      newMeta['completed_today'] = currentCompleted > 0 ? currentCompleted - 1 : 0;
    }
    if (target != null && target.deadline != null && !target.isCompleted) {
      final currentPending = newMeta['pending_deadlines'] ?? 0;
      newMeta['pending_deadlines'] = currentPending > 0 ? currentPending - 1 : 0;
    }

    state = state.copyWith(
      todos: state.todos.where((t) => t.id != id).toList(),
      meta: newMeta,
    );

    try {
      await _todoService.deleteTodo(id);
    } catch (e) {
      state = state.copyWith(todos: previousTodos, meta: previousMeta);
      rethrow;
    }
  }
}

final todoServiceProvider = Provider<TodoService>((ref) {
  return TodoService(ref.watch(dioProvider));
});

final todoProvider = StateNotifierProvider<TodoNotifier, TodoState>((ref) {
  final todoService = ref.watch(todoServiceProvider);
  return TodoNotifier(todoService);
});