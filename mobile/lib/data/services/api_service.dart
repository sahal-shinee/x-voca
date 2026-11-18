import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/config/env.dart';

/// Service inti untuk mengelola konfigurasi HTTP client (Dio).
///
/// Bertanggung jawab atas:
/// - Penentuan Base URL dan timeout koneksi.
/// - Penyisipan Authorization token (JWT) dan header identitas pengguna (`x-user-id`).
/// - Penanganan error global (logging detail, penghapusan token jika 401 Unauthorized).
/// - Mekanisme auto-fallback URL jika koneksi ke server utama gagal.
class ApiService {
  final Dio _dio;
  final FlutterSecureStorage _storage;

  /// Inisialisasi ApiService dengan mengonfigurasi opsi dasar dan interceptor Dio.
  ApiService(this._dio, this._storage) {
    // -------------------------------------------------------------
    // Konfigurasi dasar HTTP Client (Base Options)
    // -------------------------------------------------------------
    _dio.options = BaseOptions(
      baseUrl: Env.apiBaseUrl,
      connectTimeout: const Duration(seconds: 8),
      receiveTimeout: const Duration(seconds: 12),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    );

    // -------------------------------------------------------------
    // Interceptor 1: Penanganan Request, Token JWT, Error & Fallback
    // -------------------------------------------------------------
    _dio.interceptors.add(
      InterceptorsWrapper(
        // Dijalankan setiap kali ada request keluar
        onRequest: (options, handler) async {
          // Ambil token dan user ID dari penyimpanan aman lokal
          final token = await _storage.read(key: 'xvoca_token');
          final userId = await _storage.read(key: 'xvoca_user_id');

          // Sisipkan Bearer token ke header Authorization jika tersedia
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }

          // Sisipkan x-user-id untuk identifikasi pengguna di backend
          if (userId != null && userId.isNotEmpty) {
            options.headers['x-user-id'] = userId;
          } else if (token != null && token.isNotEmpty) {
            // Nilai default jika token ada namun user_id belum tersimpan
            options.headers['x-user-id'] = '1';
            await _storage.write(key: 'xvoca_user_id', value: '1');
          }

          return handler.next(options);
        },

        // Dijalankan setiap kali terjadi kegagalan/error pada request HTTP
        onError: (DioException error, handler) async {
          // Cetak detail error ke logcat/console debug
          _logDetailedDioError(error);

          // Jika status HTTP 401 (Unauthorized / Token Kadaluarsa)
          if (error.response?.statusCode == 401) {
            // Bersihkan data otentikasi lokal agar user dapat login ulang
            await _storage.delete(key: 'xvoca_token');
            await _storage.delete(key: 'xvoca_user_id');
            return handler.next(error);
          }

          // Mekanisme Auto-Fallback khusus mode pengembangan lokal (!Env.useProduction).
          // Pada mode produksi (Vercel Cloud), hindari mencoba 5 alamat IP lokal agar
          // notifikasi error tidak tertunda hingga 15+ detik.
          final isConnectionIssue =
              error.type == DioExceptionType.connectionError ||
              error.type == DioExceptionType.connectionTimeout ||
              error.type == DioExceptionType.receiveTimeout ||
              error.type == DioExceptionType.sendTimeout;

          final hasNotRetried =
              error.requestOptions.extra['retry_fallback'] != true;

          if (!Env.useProduction && isConnectionIssue && hasNotRetried) {
            for (final fallbackUrl in Env.fallbackUrls) {
              // Lewati URL yang sudah dicoba dan gagal
              if (fallbackUrl == _dio.options.baseUrl) continue;

              try {
                debugPrint('[DIO FALLBACK] Mencoba koneksi ke: $fallbackUrl');
                final newOptions = error.requestOptions;
                newOptions.baseUrl = fallbackUrl;
                newOptions.connectTimeout = const Duration(seconds: 3);
                newOptions.receiveTimeout = const Duration(seconds: 5);
                newOptions.extra['retry_fallback'] = true;

                // Eksekusi ulang request dengan baseUrl yang baru
                final response = await _dio.fetch(newOptions);

                // Perbarui baseUrl aktif pada Dio jika berhasil
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

    // -------------------------------------------------------------
    // Interceptor 2: Logger HTTP Request & Response untuk proses debug
    // -------------------------------------------------------------
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

  /// Menampilkan rincian error HTTP secara terstruktur pada console debug.
  void _logDetailedDioError(DioException error) {
    debugPrint('==================== [DIO ERROR DETAILS] ====================');
    debugPrint(
      'URL Endpoint    : ${error.requestOptions.baseUrl}${error.requestOptions.path}',
    );
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
      debugPrint(
        'Response Body   : No Response (Connection Refused, SocketException, or Host Unreachable)',
      );
    }
    debugPrint('============================================================');
  }

  /// Instance Dio yang telah terkonfigurasi untuk digunakan oleh service lain.
  Dio get client => _dio;
}
