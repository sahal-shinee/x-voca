import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
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

    // 1. Interceptor JWT Token, x-user-id Header, Logging Error, & Auto Fallback
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: 'xvoca_token');
          final userId = await _storage.read(key: 'xvoca_user_id');

          // Lampirkan Bearer Token jika ada
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          // Lampirkan x-user-id pada setiap request outgoing
          if (userId != null && userId.isNotEmpty) {
            options.headers['x-user-id'] = userId;
          } else if (token != null && token.isNotEmpty) {
            options.headers['x-user-id'] = '1';
            await _storage.write(key: 'xvoca_user_id', value: '1');
          }

          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          // Cetak error mendetail ke console/logcat
          _logDetailedDioError(error);

          if (error.response?.statusCode == 401) {
            // Hapus token jika unauthorized / expired
            await _storage.delete(key: 'xvoca_token');
            await _storage.delete(key: 'xvoca_user_id');
            return handler.next(error);
          }

          // Coba fallback URL otomatis jika koneksi gagal (misal HP Fisik / Emulator)
          if ((error.type == DioExceptionType.connectionError ||
                  error.type == DioExceptionType.connectionTimeout) &&
              error.requestOptions.extra['retry_fallback'] != true) {
            for (final fallbackUrl in Env.fallbackUrls) {
              if (fallbackUrl == _dio.options.baseUrl) continue;
              try {
                debugPrint('[DIO FALLBACK] Mencoba koneksi ke: $fallbackUrl');
                final newOptions = error.requestOptions;
                newOptions.baseUrl = fallbackUrl;
                newOptions.extra['retry_fallback'] = true;
                final response = await _dio.fetch(newOptions);
                _dio.options.baseUrl = fallbackUrl;
                debugPrint('[DIO FALLBACK] Berhasil beralih ke: $fallbackUrl');
                return handler.resolve(response);
              } catch (e) {
                debugPrint('[DIO FALLBACK] Gagal mencoba $fallbackUrl: $e');
              }
            }
          }

          return handler.next(error);
        },
      ),
    );

    // 2. LogInterceptor Dio untuk melacak request & response secara langsung
    _dio.interceptors.add(
      LogInterceptor(
        request: true,
        requestHeader: true,
        requestBody: true,
        responseHeader: false,
        responseBody: true,
        error: true,
        logPrint: (obj) => debugPrint('[DIO LOG] $obj'),
      ),
    );
  }

  void _logDetailedDioError(DioException error) {
    debugPrint('==================== [DIO ERROR DETAILS] ====================');
    debugPrint('URL Endpoint    : ${error.requestOptions.baseUrl}${error.requestOptions.path}');
    debugPrint('Method          : ${error.requestOptions.method}');
    debugPrint('Outgoing Headers: ${error.requestOptions.headers}');
    debugPrint('Dio Error Type  : ${error.type}');
    debugPrint('Error Message   : ${error.message}');

    if (error.error != null) {
      debugPrint('Underlying Error: ${error.error}');
    }

    if (error.response != null) {
      debugPrint('HTTP Status Code: ${error.response?.statusCode}');
      debugPrint('Response Headers: ${error.response?.headers}');
      debugPrint('Response Body   : ${error.response?.data}');
    } else {
      debugPrint('Response Body   : No Response (Connection Refused, SocketException, or Host Unreachable)');
    }
    debugPrint('============================================================');
  }

  Dio get client => _dio;
}