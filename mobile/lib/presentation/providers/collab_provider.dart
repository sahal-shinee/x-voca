import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../core/config/env.dart';
import '../../data/models/collab_model.dart';
import '../../data/services/collab_service.dart';
import 'auth_provider.dart';

class CollabState {
  final bool isLoading;
  final List<CollabModel> requests;
  final String? error;

  CollabState({
    this.isLoading = false,
    this.requests = const [],
    this.error,
  });

  CollabState copyWith({
    bool? isLoading,
    List<CollabModel>? requests,
    String? error,
  }) {
    return CollabState(
      isLoading: isLoading ?? this.isLoading,
      requests: requests ?? this.requests,
      error: error,
    );
  }
}

class CollabNotifier extends StateNotifier<CollabState> {
  final CollabService _collabService;

  CollabNotifier(this._collabService) : super(CollabState()) {
    fetchCollabRequests();
  }

  Future<void> fetchCollabRequests() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final list = await _collabService.getCollabRequests();
      state = state.copyWith(isLoading: false, requests: list);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> updateStatus(int id, String status, {String? notes}) async {
    try {
      final updated =
          await _collabService.updateCollabStatus(id, status, notes: notes);
      state = state.copyWith(
        requests: state.requests.map((r) => r.id == id ? updated : r).toList(),
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteRequest(int id) async {
    try {
      await _collabService.deleteCollabRequest(id);
      state = state.copyWith(
        requests: state.requests.where((r) => r.id != id).toList(),
      );
    } catch (e) {
      rethrow;
    }
  }
}

final collabServiceProvider = Provider<CollabService>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: Env.apiBaseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));

  final userState = ref.watch(authProvider);

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) {
        final currentUser = userState.value;
        if (currentUser != null && currentUser.id > 0) {
          options.headers['x-user-id'] = currentUser.id.toString();
        }
        return handler.next(options);
      },
    ),
  );

  return CollabService(dio);
});

final collabProvider =
    StateNotifierProvider<CollabNotifier, CollabState>((ref) {
  final service = ref.watch(collabServiceProvider);
  return CollabNotifier(service);
});