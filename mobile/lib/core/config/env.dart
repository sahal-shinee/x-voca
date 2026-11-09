class Env {
  // Toggle antara Backend Lokal (Laptop) dan Production Railway
  static const bool useProduction = false;

  // IP Lokal / Hostname: 'localhost' adalah jalur tercepat via USB kabel (ADB reverse)
  static const String localHostIp = 'localhost';
  static const int backendPort = 3001;

  // Definisi URL
  static const String localApiUrl = 'http://localhost:$backendPort/api';
  static const String railwayProductionUrl = 'https://xvoca-api.railway.app/api';

  // Base URL aktif yang digunakan oleh aplikasi
  static String get apiBaseUrl => useProduction ? railwayProductionUrl : localApiUrl;

  // Daftar fallback otomatis berurutan jika terjadi error atau timeout pada HP/Emulator
  static List<String> get fallbackUrls => [
    'http://localhost:3001/api',       // USB ADB Reverse (Sangat Stabil & Cepat)
    'http://127.0.0.1:3001/api',       // USB ADB Reverse Alternate
    'http://172.16.200.242:3001/api',  // IP Wi-Fi Laptop
    'http://10.0.2.2:3001/api',        // Android Emulator Loopback
    'http://192.168.43.13:3001/api',   // IP Tethering HP
    'http://192.168.1.22:3001/api',    // IP Wi-Fi Rumah
    railwayProductionUrl,              // URL Production Railway
  ];

  static const String firebaseDatabaseUrl = 'https://xvoca-project.firebaseio.com';
}
