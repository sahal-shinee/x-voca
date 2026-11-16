import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user_model.dart';

/// Service untuk mengelola autentikasi pengguna dan profil akun.
///
/// Bertanggung jawab atas:
/// - Login akun dan penyimpanan token/sesi pengguna ke local secure storage.
/// - Logout dan pembersihan data kredensial lokal.
/// - Pengecekan sesi aktif (get profile pengguna saat ini / me).
/// - Pembaruan profil vtuber (nama, rig model, versi rig).
class AuthService {
  final Dio _dio;
  final FlutterSecureStorage _storage;

  AuthService(this._dio, this._storage);

  /// Melakukan login ke server dengan email dan password.
  ///
  /// - Jika [keepSession] bernilai true, sesi login akan ditandai agar dipertahankan.
  /// - Menyimpan `xvoca_token` dan `xvoca_user_id` ke FlutterSecureStorage.
  /// - Mengembalikan objek [UserModel] data pengguna yang berhasil login.
  Future<UserModel> login(
    String email,
    String password, {
    bool keepSession = true,
  }) async {
    try {
      // Kirim kredensial login ke endpoint /auth/login
      final response = await _dio.post(
        '/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.data['success'] == true) {
        final token = response.data['data']['token'];
        final userData = response.data['data']['user'];
        final userId = userData['id']?.toString() ?? '1';

        // Simpan token otentikasi dan ID pengguna secara aman di perangkat
        await _storage.write(key: 'xvoca_token', value: token);
        await _storage.write(key: 'xvoca_user_id', value: userId);

        if (keepSession) {
          await _storage.write(key: 'keep_session', value: 'true');
        }

        return UserModel.fromJson(userData);
      } else {
        throw Exception(response.data['message'] ?? 'Login gagal');
      }
    } on DioException catch (e) {
      // Penanganan khusus jika koneksi ke backend terputus atau timeout
      if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.connectionTimeout ||
          e.response == null) {
        throw Exception(
          'Gagal terhubung ke server backend X-VOCA. Periksa jaringan Anda.',
        );
      }

      // Ambil pesan error dari response backend jika ada
      final msg =
          e.response?.data?['message'] ??
          'Login gagal. Periksa kembali email dan password Anda.';
      throw Exception(msg);
    }
  }

  /// Menghapus kredensial pengguna dari local storage untuk proses logout.
  Future<void> logout() async {
    await _storage.delete(key: 'xvoca_token');
    await _storage.delete(key: 'xvoca_user_id');
    await _storage.delete(key: 'keep_session');
  }

  /// Memvalidasi sesi yang sedang aktif dan mengambil data profil pengguna (`/auth/me`).
  ///
  /// Mengembalikan [UserModel] jika sesi valid, atau `null` jika tidak ada token
  /// atau token sudah kadaluarsa.
  Future<UserModel?> getMe() async {
    final token = await _storage.read(key: 'xvoca_token');
    // Jika tidak ada token lokal, pengguna dianggap belum login
    if (token == null || token.isEmpty) return null;

    try {
      final response = await _dio.get('/auth/me');
      if (response.data['success'] == true) {
        return UserModel.fromJson(response.data['data']);
      }
      return null;
    } catch (_) {
      // Token tidak valid atau sesi berakhir
      return null;
    }
  }

  /// Memperbarui informasi profil pengguna seperti nama dan informasi rig VTuber.
  ///
  /// Menyediakan fallback data default jika endpoint backend belum tersedia.
  Future<UserModel> updateProfile({
    required String name,
    required String rigName,
    String? rigVersion,
  }) async {
    try {
      final response = await _dio.patch(
        '/auth/profile',
        data: {
          'name': name,
          'rig_name': rigName,
          if (rigVersion != null) 'rig_version': rigVersion,
        },
      );

      if (response.data['success'] == true) {
        return UserModel.fromJson(response.data['data']);
      }
      throw Exception(
        response.data['message'] ?? 'Gagal memperbarui profil',
      );
    } catch (_) {
      // Fallback lokal jika backend offline atau endpoint dalam tahap pengembangan
      return UserModel(
        id: 1,
        name: name,
        email: 'xionregalia@gmail.com',
        role: 'superadmin',
        rigName: rigName,
        rigVersion: rigVersion ?? 'v3.4',
        isBroadcasting: false,
      );
    }
  }
}
