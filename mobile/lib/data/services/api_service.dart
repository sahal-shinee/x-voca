import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/config/env.dart';

class ApiService {
  final Dio _dio;
  final FlutterSecureStorage _storage;

  ApiService(this._dio, this._storage) {
    _dio.options = BaseOptions(
      baseUrl: Env.apiBaseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    );

    // Interceptor JWT Token & Handling Error 401
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: 'xvoca_token');
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          if (error.response?.statusCode == 401) {
            // Hapus token jika unauthorized / expired
            await _storage.delete(key: 'xvoca_token');
          }
          return handler.next(error);
        },
      ),
    );
  }

  Dio get client => _dio;
}