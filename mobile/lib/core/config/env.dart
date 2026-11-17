/// Konfigurasi lingkungan (Environment) aplikasi X-VOCA Mobile.
///
/// Berisi konstanta alamat server backend, port, URL portal web publik,
/// serta daftar endpoint cadangan (fallback) untuk pengujian di perangkat fisik maupun emulator.
class Env {
  /// Sakelar (toggle) lingkungan: `true` untuk Production (Railway), `false` untuk Lokal.
  static const bool useProduction = false;

  /// IP host lokal komputer/laptop pengembang (sesuaikan dengan IP jaringan lokal aktif).
  static const String localHostIp = '192.168.1.3';

  /// Port layanan backend Express/Node.js.
  static const int backendPort = 3001;

  // -------------------------------------------------------------
  // Definisi URL API Endpoint
  // -------------------------------------------------------------

  /// Alamat endpoint API server lokal.
  /// Default menggunakan loopback via USB ADB reverse (http://localhost:3001/api)
  /// agar bebas dari hambatan firewall atau isolasi router Wi-Fi.
  static const String localApiUrl = 'http://localhost:3001/api';

  /// Alamat endpoint API server production di Railway.
  static const String railwayProductionUrl =
      'https://xvoca-api.railway.app/api';

  /// Base URL aktif yang akan dipakai oleh [ApiService] berdasarkan flag [useProduction].
  static String get apiBaseUrl =>
      useProduction ? railwayProductionUrl : localApiUrl;

  /// Daftar URL cadangan otomatis yang akan dicoba berurutan oleh Dio Interceptor
  /// jika koneksi ke [apiBaseUrl] mengalami kegagalan / timeout.
  static List<String> get fallbackUrls => [
        'http://localhost:3001/api', // USB ADB Reverse (Prioritas Utama)
        'http://192.168.1.3:3001/api', // IP Wi-Fi Router Rumah / Kantor aktif
        'http://192.168.43.13:3001/api', // IP Tethering Wi-Fi Hotspot HP
        'http://127.0.0.1:3001/api', // Loopback alternate
        'http://10.0.2.2:3001/api', // Loopback bawaan Android Emulator
      ];

  /// URL Firebase Realtime Database untuk sinkronisasi live data.
  static const String firebaseDatabaseUrl =
      'https://xvoca-project-default-rtdb.asia-southeast1.firebasedatabase.app';

  // -------------------------------------------------------------
  // Portal Fansite Publik (Viewer Website)
  // -------------------------------------------------------------

  /// Alamat web fansite lokal (Vite frontend).
  static const String localWebUrl = 'http://$localHostIp:5173';

  /// Alamat web fansite production (Vercel deployment).
  static const String vercelProductionUrl = 'https://x-voca.vercel.app';

  /// URL portal web publik aktif yang dapat dibagikan atau dibuka dari aplikasi.
  static String get publicWebUrl =>
      useProduction ? vercelProductionUrl : localWebUrl;
}
