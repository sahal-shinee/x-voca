import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../data/models/user_model.dart';
import '../../data/services/api_service.dart';
import '../../data/services/auth_service.dart';
import '../../data/services/notification_service.dart';

/// Provider instance [FlutterSecureStorage] untuk menyimpan data sensitif secara terenkripsi.
final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage();
});

/// Provider instance [Dio] yang telah dikonfigurasi melalui [ApiService].
final dioProvider = Provider<Dio>((ref) {
  final storage = ref.watch(secureStorageProvider);
  return ApiService(Dio(), storage).client;
});

/// Provider instance [AuthService] untuk mengelola API request autentikasi.
final authServiceProvider = Provider<AuthService>((ref) {
  final dio = ref.watch(dioProvider);
  final storage = ref.watch(secureStorageProvider);
  return AuthService(dio, storage);
});

/// StateNotifier untuk memanajemen status autentikasi pengguna secara asynchronous (`AsyncValue<UserModel?>`).
///
/// Mengelola siklus:
/// - Pengecekan sesi token saat aplikasi pertama dibuka (`checkAuthStatus`).
/// - Proses login akun pengguna (`login`).
/// - Pemutusan sesi dan pembersihan kredensial (`logout`).
/// - Toggle status siaran langsung (`setBroadcasting`).
/// - Pembaruan data profil VTuber (`updateProfile`).
class AuthNotifier extends StateNotifier<AsyncValue<UserModel?>> {
  final AuthService _authService;

  AuthNotifier(this._authService) : super(const AsyncValue.loading()) {
    checkAuthStatus();
  }

  /// Mengecek apakah terdapat token valid yang tersimpan di perangkat lokal.
  Future<void> checkAuthStatus() async {
    state = const AsyncValue.loading();
    try {
      final user = await _authService.getMe().timeout(
            const Duration(seconds: 4),
            onTimeout: () {
              // Jika verifikasi backend melebihi 4 detik, langsung fallback ke null agar masuk login
              return null;
            },
          );
      if (user != null) {
        // Otomatis berlangganan topik notifikasi khusus streamer jika berhasil login
        unawaited(NotificationService.instance.subscribeCreatorTopics());
      }
      state = AsyncValue.data(user);
    } catch (_) {
      // Jika terjadi error koneksi / token invalid, arahkan ke LoginScreen
      state = const AsyncValue.data(null);
    }
  }

  /// Menjalankan alur login akun dengan email dan password.
  Future<void> login(
    String email,
    String password, {
    bool keepSession = true,
  }) async {
    state = const AsyncValue.loading();
    try {
      final user = await _authService.login(
        email,
        password,
        keepSession: keepSession,
      );
      unawaited(NotificationService.instance.subscribeCreatorTopics());
      state = AsyncValue.data(user);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }

  /// Mengeluarkan sesi login aktif dan mengosongkan state user menjadi `null`.
  Future<void> logout() async {
    unawaited(NotificationService.instance.unsubscribeAllTopics());
    await _authService.logout();
    state = const AsyncValue.data(null);
  }

  /// Memperbarui status penyiaran live secara instan pada UI.
  void setBroadcasting(bool isBroadcasting) {
    final currentUser = state.value;
    if (currentUser != null) {
      state = AsyncValue.data(
        currentUser.copyWith(isBroadcasting: isBroadcasting),
      );
    }
  }

  /// Memperbarui informasi profil pengguna dan rig VTuber.
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
      // Fallback update state lokal agar UI tetap responsif jika backend offline
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

/// Provider global status autentikasi yang dipantau oleh `AuthWrapper` dan komponen UI lainnya.
final authProvider =
    StateNotifierProvider<AuthNotifier, AsyncValue<UserModel?>>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthNotifier(authService);
});
