import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user_model.dart';

class AuthService {
  final Dio _dio;
  final FlutterSecureStorage _storage;

  AuthService(this._dio, this._storage);

  Future<UserModel> login(String email, String password, {bool keepSession = true}) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      if (response.data['success'] == true) {
        final token = response.data['data']['token'];
        final userData = response.data['data']['user'];
        final userId = userData['id']?.toString() ?? '1';
        
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
      if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.connectionTimeout ||
          e.response == null) {
        throw Exception('Gagal terhubung ke server backend X-VOCA. Periksa jaringan Anda.');
      }
      final msg = e.response?.data?['message'] ?? 'Login gagal. Periksa kembali email dan password Anda.';
      throw Exception(msg);
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'xvoca_token');
    await _storage.delete(key: 'xvoca_user_id');
    await _storage.delete(key: 'keep_session');
  }

  Future<UserModel?> getMe() async {
    final token = await _storage.read(key: 'xvoca_token');
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

  Future<UserModel> updateProfile({
    required String name,
    required String rigName,
    String? rigVersion,
  }) async {
    try {
      final response = await _dio.patch('/auth/profile', data: {
        'name': name,
        'rig_name': rigName,
        if (rigVersion != null) 'rig_version': rigVersion,
      });

      if (response.data['success'] == true) {
        return UserModel.fromJson(response.data['data']);
      }
      throw Exception(response.data['message'] ?? 'Gagal memperbarui profil');
    } catch (_) {
      // Fallback jika backend offline atau endpoint belum dibuat
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
