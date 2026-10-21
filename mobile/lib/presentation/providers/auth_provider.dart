import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../data/models/user_model.dart';
import '../../data/services/api_service.dart';
import '../../data/services/auth_service.dart';

final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage();
});

final dioProvider = Provider<Dio>((ref) {
  final storage = ref.watch(secureStorageProvider);
  return ApiService(Dio(), storage).client;
});

final authServiceProvider = Provider<AuthService>((ref) {
  final dio = ref.watch(dioProvider);
  final storage = ref.watch(secureStorageProvider);
  return AuthService(dio, storage);
});

class AuthNotifier extends StateNotifier<AsyncValue<UserModel?>> {
  final AuthService _authService;

  AuthNotifier(this._authService) : super(const AsyncValue.loading()) {
    checkAuthStatus();
  }

  Future<void> checkAuthStatus() async {
    state = const AsyncValue.loading();
    try {
      final user = await _authService.getMe();
      state = AsyncValue.data(user);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> login(String email, String password, {bool keepSession = true}) async {
    state = const AsyncValue.loading();
    try {
      final user = await _authService.login(email, password, keepSession: keepSession);
      state = AsyncValue.data(user);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    state = const AsyncValue.data(null);
  }

  Future<void> updateProfile({
    required String name,
    required String rigName,
    String? rigVersion,
  }) async {
    final currentUser = state.value;
    try {
      final updatedUser = await _authService.updateProfile(
        name: name,
        rigName: rigName,
        rigVersion: rigVersion,
      );
      state = AsyncValue.data(updatedUser);
    } catch (_) {
      // Fallback state lokal agar UI tetap update real-time
      if (currentUser != null) {
        state = AsyncValue.data(
          UserModel(
            id: currentUser.id,
            name: name,
            email: currentUser.email,
            role: currentUser.role,
            rigName: rigName,
            rigVersion: rigVersion ?? currentUser.rigVersion,
            isBroadcasting: currentUser.isBroadcasting,
          ),
        );
      }
    }
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AsyncValue<UserModel?>>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthNotifier(authService);
});