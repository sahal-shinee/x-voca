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
        
        await _storage.write(key: 'xvoca_token', value: token);
        if (keepSession) {
          await _storage.write(key: 'keep_session', value: 'true');
        }
        
        return UserModel.fromJson(userData);
      } else {
        throw Exception(response.data['message'] ?? 'Login gagal');
      }
    } on DioException catch (e) {
      // Fallback Dummy jika Backend Sahal belum menyala
      if (e.type == DioExceptionType.connectionError || e.response == null) {
        if (email == 'xion@xvoca.id' && password == 'password123') {
          const dummyToken = 'dummy_jwt_token_xvoca_creator';
          await _storage.write(key: 'xvoca_token', value: dummyToken);
          return UserModel(
            id: 1,
            name: 'Xion Regalia',
            email: 'xion@xvoca.id',
            role: 'creator',
            rigName: 'Rig-01 Primis',
            rigVersion: 'v2.4',
            isBroadcasting: false,
          );
        } else {
          throw Exception('Email/Password salah! (Dummy: xion@xvoca.id / password123)');
        }
      }
      final msg = e.response?.data?['message'] ?? 'Gagal terhubung ke server';
      throw Exception(msg);
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'xvoca_token');
  }

  Future<UserModel?> getMe() async {
    final token = await _storage.read(key: 'xvoca_token');
    if (token == null || token.isEmpty) return null;

    try {
      final response = await _dio.get('/auth/me');
      if (response.data['success'] == true) {
        return UserModel.fromJson(response.data['data']);
      }
    } catch (_) {
      // Biarkan terautentikasi dengan dummy jika token ada
      return UserModel(
        id: 1,
        name: 'Xion Regalia',
        email: 'xion@xvoca.id',
        role: 'creator',
        rigName: 'Rig-01 Primis',
        rigVersion: 'v2.4',
      );
    }
    return null;
  }
}