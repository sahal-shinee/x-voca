# SETUP_GUIDE_CHOIRUL.md
# Panduan setup lengkap untuk Choirul (Mobile Flutter)
# Ikuti langkah ini SECARA URUT sebelum mulai coding

---

## TAHAP 1 — Persiapan Tools

### 1.1 Install Flutter
1. Buka https://docs.flutter.dev/get-started/install
2. Pilih sistem operasi kamu (Windows/Mac/Linux)
3. Ikuti langkah instalasi sampai selesai
4. Buka terminal, jalankan:
   ```bash
   flutter doctor
   ```
5. Pastikan semua tanda ✅ (atau minimal tidak ada tanda ✗ merah)
   Yang wajib ✅:
   - Flutter (Channel stable)
   - Android toolchain
   - Android Studio / VS Code

### 1.2 Install Android Studio
- Download di: https://developer.android.com/studio
- Saat install, centang: **Android SDK**, **Android Virtual Device**
- Setelah install, buka Android Studio → klik **"More Actions"** → **"SDK Manager"**
- Pastikan **Android 14 (API 34)** terinstall

### 1.3 Buat Android Virtual Device (Emulator)
1. Di Android Studio → **"More Actions"** → **"Virtual Device Manager"**
2. Klik **"Create device"**
3. Pilih: **Pixel 7** → klik Next
4. Pilih sistem: **Android 14 (API 34)** → Download jika belum ada → Next
5. Klik **"Finish"**
6. Test: klik tombol ▶ untuk jalankan emulator

### 1.4 Install VSCode (opsional tapi disarankan)
- Download di: https://code.visualstudio.com
- Install extension: **Flutter** dan **Dart**
- Ini memudahkan pengerjaan dibanding Android Studio untuk coding

### 1.5 Buat Akun Firebase
- Daftar di: https://console.firebase.google.com
- Gunakan akun Google yang sama dengan Sahal, atau buat terpisah
- Minta Sahal untuk invite email kamu sebagai member di Firebase project `xvoca-project`

---

## TAHAP 2 — Setup Flutter Project

### 2.1 Buat Project Flutter Baru
```bash
# Masuk ke folder x-voca/mobile
cd x-voca/mobile

# Buat project flutter (jika belum ada)
flutter create . --org com.xvoca --project-name xvoca_mobile

# Atau jika sudah ada folder, langsung masuk
cd x-voca/mobile
```

### 2.2 Setup pubspec.yaml
Buka file `pubspec.yaml` dan ganti bagian `dependencies:` dengan:
```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  flutter_riverpod: ^2.4.0
  riverpod_annotation: ^2.3.0
  
  # HTTP Client
  dio: ^5.3.0
  
  # Firebase
  firebase_core: ^2.24.0
  firebase_database: ^10.4.0
  
  # Secure Storage (untuk JWT token)
  flutter_secure_storage: ^9.0.0
  
  # Fonts & Icons
  google_fonts: ^6.1.0
  lucide_icons: ^0.0.2
  
  # Utilities
  intl: ^0.18.0
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  
  # Notifications
  flutter_local_notifications: ^16.1.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
  riverpod_generator: ^2.3.0
  build_runner: ^2.4.0
```

Setelah edit pubspec.yaml, jalankan:
```bash
flutter pub get
```

### 2.3 Setup Firebase di Flutter
1. Install FlutterFire CLI:
   ```bash
   dart pub global activate flutterfire_cli
   ```
2. Di folder project Flutter, jalankan:
   ```bash
   flutterfire configure
   ```
3. Pilih project Firebase: `xvoca-project`
4. Pilih platform: **Android** (centang Android, skip iOS jika tidak perlu)
5. Command ini akan otomatis membuat file `google-services.json` di `android/app/`

### 2.4 Setup android/app/build.gradle
Buka `android/app/build.gradle`, pastikan ada:
```gradle
android {
    compileSdk 34
    
    defaultConfig {
        minSdkVersion 21
        targetSdkVersion 34
    }
}
```

### 2.5 Buat Struktur Folder
```bash
# Di dalam folder lib/, buat semua subfolder
mkdir -p lib/core/config
mkdir -p lib/core/theme
mkdir -p lib/core/utils
mkdir -p lib/data/models
mkdir -p lib/data/services
mkdir -p lib/presentation/providers
mkdir -p lib/presentation/screens
mkdir -p lib/presentation/widgets
```

---

## TAHAP 3 — Setup File Konfigurasi Dasar

### 3.1 Buat env.dart
Buat file `lib/core/config/env.dart`:
```dart
class Env {
  // Ganti dengan URL backend Sahal saat production
  // Saat development: gunakan IP komputer Sahal di jaringan yang sama
  static const String apiBaseUrl = 'http://192.168.x.x:3001/api';
  // atau saat sudah deploy: 'https://xvoca-api.railway.app/api'
  
  static const String firebaseProjectId = 'xvoca-project';
  static const String firebaseDatabaseUrl = 
    'https://xvoca-project-default-rtdb.asia-southeast1.firebasedatabase.app';
}
```

**CATATAN:** Tanya Sahal untuk IP komputernya saat development lokal.
Saat backend sudah di-deploy ke Railway, ganti dengan URL Railway.

### 3.2 Buat app_theme.dart
Buat file `lib/core/theme/app_theme.dart`:
```dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  // Backgrounds
  static const bgBase = Color(0xFF0D0B1A);
  static const bgSurface = Color(0xFF1A1730);
  static const bgCard = Color(0xFF1E1B35);
  static const bgInput = Color(0xFF252240);
  static const bgNav = Color(0xFF130F2A);

  // Accents
  static const accentCyan = Color(0xFF2DFFC2);
  static const accentPurple = Color(0xFF9B6DFF);
  static const accentPink = Color(0xFFFF6B9D);
  static const accentGold = Color(0xFFFFD700);

  // Text
  static const textPrimary = Color(0xFFEEEBFF);
  static const textSecondary = Color(0xFF9B97C0);
  static const textMuted = Color(0xFF5C587A);

  // Borders
  static const borderSubtle = Color(0xFF2A2550);
  static const borderActive = Color(0xFF3D3870);

  // Status
  static const statusLive = Color(0xFFFF4444);
  static const statusUpcoming = Color(0xFF9B6DFF);
  static const statusDone = Color(0xFF2DFFC2);
  static const statusPlaying = Color(0xFFFFD700);
  static const statusRequested = Color(0xFF9B97C0);

  // Priority
  static const priorityUrgent = Color(0xFFFF4444);
  static const priorityHigh = Color(0xFFFF8800);
  static const priorityMedium = Color(0xFFFFD700);
  static const priorityLow = Color(0xFF2DFFC2);
}

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.bgBase,
      primaryColor: AppColors.accentCyan,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.accentCyan,
        secondary: AppColors.accentPurple,
        background: AppColors.bgBase,
        surface: AppColors.bgSurface,
      ),
      textTheme: GoogleFonts.spaceGröteskTextTheme(
        ThemeData.dark().textTheme,
      ).copyWith(
        bodyLarge: GoogleFonts.spaceGrotesk(color: AppColors.textPrimary),
        bodyMedium: GoogleFonts.spaceGrotesk(color: AppColors.textSecondary),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.bgBase,
        elevation: 0,
        titleTextStyle: GoogleFonts.spaceGrotesk(
          color: AppColors.textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w700,
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.bgNav,
        selectedItemColor: AppColors.accentCyan,
        unselectedItemColor: AppColors.textMuted,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }
}
```

### 3.3 Setup main.dart
```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'core/theme/app_theme.dart';
import 'presentation/screens/login_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(
    const ProviderScope(
      child: XVocaApp(),
    ),
  );
}

class XVocaApp extends StatelessWidget {
  const XVocaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'X-VOCA Creator Hub',
      theme: AppTheme.darkTheme,
      debugShowCheckedModeBanner: false,
      home: const LoginScreen(),
    );
  }
}
```

### 3.4 Setup Dio Service
Buat file `lib/data/services/api_service.dart`:
```dart
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/config/env.dart';

final _storage = FlutterSecureStorage();

Dio createDio() {
  final dio = Dio(BaseOptions(
    baseUrl: Env.apiBaseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {'Content-Type': 'application/json'},
  ));

  // Interceptor: otomatis attach token ke setiap request
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      final token = await _storage.read(key: 'xvoca_token');
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      return handler.next(options);
    },
    onError: (error, handler) async {
      // Jika 401: token expired → hapus token → redirect ke login
      if (error.response?.statusCode == 401) {
        await _storage.delete(key: 'xvoca_token');
        // TODO: navigate ke LoginScreen
      }
      return handler.next(error);
    },
  ));

  return dio;
}
```

---

## TAHAP 4 — Test Setup Berjalan

### 4.1 Jalankan di Emulator
```bash
# Pastikan emulator sudah berjalan
# Kemudian di terminal:
flutter run
```

Harus muncul layar putih/gelap tanpa error di terminal.

### 4.2 Test Firebase
```dart
// Tambahkan sementara di main() untuk test Firebase
print('Firebase initialized: ${Firebase.app().name}');
```

Harus muncul `Firebase initialized: [DEFAULT]` di terminal.

### 4.3 Test Koneksi API (saat Sahal sudah setup backend)
```dart
// Tambahkan sementara untuk test
final dio = createDio();
final response = await dio.get('/schedules/next');
print(response.data);
```

---

## TAHAP 5 — Cara Menggunakan Mock Data

**Saat backend Sahal belum siap**, gunakan `MOCK_DATA.json` sebagai data palsu.

Cara pakai di Flutter:
```dart
// Di service file, tambahkan flag useMock
const bool useMock = true; // ganti ke false saat backend sudah siap

Future<ScheduleModel?> getNextSchedule() async {
  if (useMock) {
    // Kembalikan data dari MOCK_DATA.json
    return ScheduleModel(
      id: 1,
      title: 'Cyberpunk 2077 – Main Story Exploration',
      gameCategory: 'Cyberpunk 2077',
      scheduledAt: DateTime(2026, 9, 27, 20, 0).toLocal(),
      countdownEnabled: true,
      status: 'upcoming',
    );
  }
  
  // Kode API asli di sini
  final response = await _dio.get('/schedules/next');
  return ScheduleModel.fromJson(response.data['data']);
}
```

---

## TAHAP 6 — Cara Menggunakan Gemini Web

### Template Awal Sesi Baru
Setiap buka chat Gemini baru, **copy-paste teks ini dulu** sebelum pertanyaan apapun:

```
Saya Choirul, sedang mengerjakan aplikasi Flutter untuk proyek X-VOCA.
X-VOCA adalah dashboard mobile privat untuk VTuber Xion Regalia.

STACK WAJIB (jangan diganti):
- Flutter + Dart
- State management: Riverpod (flutter_riverpod)
- HTTP client: Dio
- Storage token: flutter_secure_storage
- Real-time: Firebase Realtime Database
- Font: Google Fonts (Space Grotesk)

WARNA UTAMA (AppColors):
- bgBase: #0D0B1A (background utama)
- bgSurface: #1A1730 (card/surface)
- accentCyan: #2DFFC2 (aksen utama)
- accentPurple: #9B6DFF (aksen sekunder)
- textPrimary: #EEEAFF

ATURAN CODING:
- Semua warna pakai AppColors.xxx (tidak hardcode hex)
- Semua API call melalui services/ menggunakan Dio
- JWT token di flutter_secure_storage dengan key 'xvoca_token'
- Datetime dari API dalam UTC, konversi ke local (toLocal())
- Format response API: { success: bool, data: {}, message: "" }

Saya sedang mengerjakan: [SEBUTKAN SCREEN/FITUR YANG INGIN DIBUAT]
```

### Tips Menggunakan Gemini
- **Satu sesi = satu screen** — jangan campur beberapa screen dalam satu sesi
- Jika error, paste **full error message** dari terminal/debug console
- Jika kode yang dihasilkan panjang dan sesi hampir habis, minta Gemini **"lanjutkan hanya bagian ..."**
- Selalu **test di emulator** setelah dapat kode dari Gemini sebelum minta kode berikutnya
- Jika ada yang aneh/tidak sesuai mockup, **describe ulang dengan lebih spesifik**

---

## TAHAP 7 — Koordinasi dengan Sahal

### Yang Perlu Dikomunikasikan ke Sahal
1. **IP address komputer Sahal** → untuk set di `env.dart` saat development lokal
2. **Jika ada perubahan di API_CONTRACT.md** → minta Sahal update file tersebut dulu sebelum kamu coding
3. **Endpoint mana yang sudah siap** → supaya kamu tahu kapan bisa ganti dari mock ke API asli

### Cara Test API dari Sahal
Saat Sahal bilang endpoint sudah siap:
1. Ganti `useMock = false` di service file yang relevan
2. Pastikan `apiBaseUrl` di `env.dart` sudah benar
3. Jalankan di emulator, cek debug console untuk response
4. Jika ada error → screenshot error → kirim ke Sahal

---

## URUTAN PENGERJAAN YANG DISARANKAN

```
Minggu 1:
✦ Fase 1: Setup project + konfigurasi dasar (1-2 hari)
✦ Fase 2: Login Screen (1-2 hari)
✦ Fase 3: Dashboard Screen dengan mock data (2-3 hari)

Minggu 2:
✦ Fase 4: Stream Schedule Screen + Add Schedule Bottom Sheet (3 hari)
✦ Fase 5: Vote Analytics Screen (2 hari)

Minggu 3:
✦ Fase 6: To-Do List Screen (2-3 hari)
✦ Fase 7: Settings & Profile Screen (2 hari)

Minggu 4:
✦ Fase 8: Firebase real-time + polish (2 hari)
✦ Ganti semua mock data ke API asli (2-3 hari)
✦ Testing + bug fix (2 hari)
```

---

## CHECKLIST FINAL SEBELUM DEMO

- [ ] Login berfungsi dengan akun Xion Regalia
- [ ] Dashboard menampilkan data real dari backend
- [ ] Countdown berjalan real-time
- [ ] Broadcasting toggle tersinkronisasi ke web admin
- [ ] Schedule CRUD berfungsi lengkap
- [ ] YouTube auto-fill berfungsi
- [ ] Vote Analytics dapat approve/reject game
- [ ] To-Do List CRUD berfungsi
- [ ] Notifikasi deadline berfungsi
- [ ] Settings menampilkan profil yang benar
- [ ] Sign out menghapus token dan kembali ke login
- [ ] Semua screen tidak ada error di production build
- [ ] APK bisa di-install di HP fisik Xion Regalia
