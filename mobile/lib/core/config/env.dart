class Env {
  // Toggle antara Backend Lokal (Laptop) dan Production Railway
  static const bool useProduction = false;

  // IP Lokal Wi-Fi Laptop saat ini (192.168.1.3)
  static const String localHostIp = '192.168.1.3';
  static const int backendPort = 3001;

  // Definisi URL aktif
  static const String localApiUrl = 'http://$localHostIp:$backendPort/api';
  static const String railwayProductionUrl = 'https://xvoca-api.railway.app/api';

  // Base URL aktif yang digunakan oleh aplikasi
  static String get apiBaseUrl => useProduction ? railwayProductionUrl : localApiUrl;

  // Daftar fallback otomatis berurutan jika terjadi kendala rute jaringan
  static List<String> get fallbackUrls => [
    'http://192.168.1.3:3001/api',     // Wi-Fi Rumah / Kantor (Aktif)
    'http://localhost:3001/api',       // USB ADB Reverse
    'http://127.0.0.1:3001/api',       // USB ADB Reverse Alternate
    'http://172.16.200.242:3001/api',  // IP Wi-Fi Alternatif
    'http://10.0.2.2:3001/api',        // Android Emulator Loopback
    'http://192.168.43.13:3001/api',   // Tethering HP
    'http://192.168.1.22:3001/api',    // Wi-Fi Sebelumnya
    railwayProductionUrl,              // Production Railway
  ];

  static const String firebaseDatabaseUrl = 'https://xvoca-project.firebaseio.com';
}
