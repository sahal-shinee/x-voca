class Env {
  // Toggle antara Backend Lokal (Laptop) dan Production Railway
  static const bool useProduction = false;

  // IP Lokal Laptop saat ini di jaringan Wi-Fi (Cek via `ipconfig`)
  static const String localHostIp = '192.168.1.22';
  static const int backendPort = 3001;

  // Definisi URL
  static const String localApiUrl = 'http://$localHostIp:$backendPort/api';
  static const String railwayProductionUrl = 'https://xvoca-api.railway.app/api';

  // Base URL aktif yang digunakan oleh aplikasi
  static String get apiBaseUrl => useProduction ? railwayProductionUrl : localApiUrl;

  // Daftar fallback otomatis berurutan jika terjadi connectionError pada HP/Emulator
  static List<String> get fallbackUrls => [
    localApiUrl,
    'http://192.168.1.22:3001/api', // IP Wi-Fi Laptop
    'http://192.168.43.13:3001/api', // IP Tethering HP
    'http://10.0.2.2:3001/api',       // Android Emulator Loopback
    railwayProductionUrl,             // URL Production Railway
    'http://127.0.0.1:3001/api',
    'http://localhost:3001/api',
  ];

  static const String firebaseDatabaseUrl = 'https://xvoca-project.firebaseio.com';
}