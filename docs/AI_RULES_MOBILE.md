# AI_RULES_MOBILE.md — Aturan AI untuk Choirul
# Copy-paste isi file ini di awal setiap sesi Gemini baru
# Platform: Gemini Web (free tier)

---

## IDENTITAS PROYEK
Kamu adalah AI assistant yang membantu Choirul mengembangkan aplikasi mobile X-VOCA.
Choirul berperan sebagai Mobile Developer (Flutter).
X-VOCA adalah aplikasi dashboard khusus untuk VTuber Xion Regalia.

---

## STACK YANG DIGUNAKAN (TIDAK BOLEH DIGANTI)
```
Framework       : Flutter (Dart)
State Management: Riverpod (flutter_riverpod)
HTTP Client     : Dio
Real-time       : Firebase Realtime Database (firebase_database)
Auth Storage    : flutter_secure_storage (bukan SharedPreferences)
Font            : Google Fonts (Space Grotesk + Space Mono)
Icons           : Lucide Flutter (lucide_icons)
```

---

## PUBSPEC.YAML DEPENDENCIES
```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.4.0
  dio: ^5.3.0
  firebase_core: ^2.24.0
  firebase_database: ^10.4.0
  flutter_secure_storage: ^9.0.0
  google_fonts: ^6.1.0
  lucide_icons: ^0.0.2
  intl: ^0.18.0
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  flutter_local_notifications: ^16.1.0
```

---

## ATURAN WAJIB

1. **State management SELALU menggunakan Riverpod**
   - Buat provider di folder `presentation/providers/`
   - Gunakan `AsyncNotifierProvider` untuk data dari API
   - Gunakan `StateProvider` untuk state lokal sederhana (toggle, filter)

2. **API calls SELALU melalui services/ menggunakan Dio**
   - Jangan pakai http package langsung
   - Dio instance dikonfigurasi di `data/services/api_service.dart`
   - Interceptor otomatis attach JWT token dari FlutterSecureStorage

3. **JWT Token disimpan di FlutterSecureStorage** (bukan SharedPreferences)
   ```dart
   final storage = FlutterSecureStorage();
   await storage.write(key: 'xvoca_token', value: token);
   final token = await storage.read(key: 'xvoca_token');
   ```

4. **Semua warna dari AppColors** (di `core/theme/app_theme.dart`)
   - JANGAN hardcode hex color langsung di widget
   - Contoh: `color: AppColors.accentCyan` ✅
   - Bukan: `color: Color(0xFF2DFFC2)` yang ditulis manual ❌

5. **Datetime dari API dalam UTC → konversi ke WIB (+7 jam) sebelum display**
   ```dart
   DateTime utcTime = DateTime.parse(apiResponse['scheduled_at']);
   DateTime wibTime = utcTime.toLocal(); // atau add(Duration(hours: 7))
   ```

6. **Gunakan field `*_wib` dari API jika tersedia** (backend sudah konversikan)

7. **Error handling → selalu handle 401 (token expired) dengan redirect ke LoginScreen**

8. **Saat backend belum siap → gunakan MOCK_DATA.json**

---

## STRUKTUR FOLDER (WAJIB IKUTI)
```
lib/
├── core/
│   ├── config/
│   │   └── env.dart           ← API URL, config
│   ├── theme/
│   │   └── app_theme.dart     ← AppColors, AppTheme (dari DESIGN_TOKENS.md)
│   └── utils/
│       ├── date_formatter.dart
│       └── constants.dart
├── data/
│   ├── models/               ← Data class dari API response
│   └── services/             ← Dio API calls
├── presentation/
│   ├── providers/            ← Riverpod providers
│   ├── screens/              ← Halaman-halaman
│   └── widgets/              ← Widget reusable
└── main.dart                 ← ProviderScope wrapper
```

---

## POLA KODE YANG HARUS DIIKUTI

### Model dari API Response
```dart
// data/models/schedule_model.dart
class ScheduleModel {
  final int id;
  final String title;
  final String? gameCategory;
  final DateTime scheduledAt;
  final bool countdownEnabled;
  final String status;

  ScheduleModel({
    required this.id,
    required this.title,
    this.gameCategory,
    required this.scheduledAt,
    required this.countdownEnabled,
    required this.status,
  });

  factory ScheduleModel.fromJson(Map<String, dynamic> json) {
    return ScheduleModel(
      id: json['id'],
      title: json['title'],
      gameCategory: json['game_category'],
      scheduledAt: DateTime.parse(json['scheduled_at']).toLocal(),
      countdownEnabled: json['countdown_enabled'] ?? true,
      status: json['status'],
    );
  }
}
```

### Provider Pattern (Riverpod)
```dart
// presentation/providers/schedule_provider.dart
@riverpod
class ScheduleNotifier extends _$ScheduleNotifier {
  @override
  Future<List<ScheduleModel>> build() async {
    return ref.read(scheduleServiceProvider).getSchedules();
  }

  Future<void> addSchedule(Map<String, dynamic> data) async {
    await ref.read(scheduleServiceProvider).createSchedule(data);
    ref.invalidateSelf(); // refresh list
  }
}
```

### Service Pattern (Dio)
```dart
// data/services/schedule_service.dart
class ScheduleService {
  final Dio _dio;
  ScheduleService(this._dio);

  Future<List<ScheduleModel>> getSchedules({String status = 'all'}) async {
    final response = await _dio.get('/schedules', queryParameters: {'status': status});
    if (response.data['success']) {
      return (response.data['data'] as List)
          .map((e) => ScheduleModel.fromJson(e))
          .toList();
    }
    throw Exception(response.data['message']);
  }
}
```

---

## FASE PENGERJAAN

### FASE 1 — Setup Project Flutter
**Prompt untuk Gemini:**
```
Saya Choirul, sedang mengerjakan aplikasi mobile Flutter untuk proyek X-VOCA.
X-VOCA adalah dashboard mobile untuk VTuber Xion Regalia.

Stack: Flutter + Riverpod + Dio + Firebase + FlutterSecureStorage + Google Fonts (Space Grotesk)

Bantu saya:
1. Setup pubspec.yaml dengan semua dependency yang dibutuhkan
2. Buat struktur folder: core/, data/, presentation/
3. Buat file app_theme.dart dengan AppColors dan AppTheme
   (warna: bgBase=#0D0B1A, accentCyan=#2DFFC2, accentPurple=#9B6DFF, dll)
4. Buat file env.dart dengan API base URL
5. Buat Dio instance di api_service.dart dengan interceptor untuk JWT token
6. Setup main.dart dengan ProviderScope dan Firebase initialization
```

**Checklist Fase 1:**
- [ ] pubspec.yaml lengkap
- [ ] Struktur folder sesuai
- [ ] app_theme.dart dengan AppColors lengkap
- [ ] env.dart dengan API URL
- [ ] api_service.dart dengan Dio + interceptor
- [ ] main.dart dengan ProviderScope

---

### FASE 2 — Login Screen
**Prompt untuk Gemini:**
```
Saya sedang di FASE 2 — Login Screen untuk X-VOCA Flutter app.

Buat login_screen.dart dengan:
- Field email + password (toggle show/hide password menggunakan Lucide Icons)
- Checkbox "Keep session active"
- Tombol gradient "Sign In to Dashboard →" (gradient dari cyan ke purple)
- Opsi biometrik (ikon fingerprint)
- Tombol call API: POST /api/auth/login → { email, password }
- Jika sukses: simpan token ke FlutterSecureStorage, navigate ke DashboardScreen
- Jika gagal: tampilkan snackbar error

Warna background: #0D0B1A, Card: #1A1730, Accent: #2DFFC2, #9B6DFF
Font: Space Grotesk
```

**Checklist Fase 2:**
- [ ] LoginScreen UI sesuai mockup
- [ ] Validasi form (email format, password tidak kosong)
- [ ] API call ke /api/auth/login
- [ ] Simpan token ke FlutterSecureStorage
- [ ] Navigate ke Dashboard setelah berhasil
- [ ] Error handling (snackbar)
- [ ] auth_provider.dart

---

### FASE 3 — Dashboard Screen
**Prompt untuk Gemini:**
```
Saya sedang di FASE 3 — Dashboard Screen untuk X-VOCA Flutter app.

Buat dashboard_screen.dart dengan:
- AppBar: "X-VOCA" + badge "CREATOR HUB" + bell icon + avatar Creator
- Broadcasting Toggle (toggle on/off, call PATCH /api/auth/broadcasting)
- Countdown Widget: ambil data dari GET /api/schedules/next
  Tampilkan: jam:menit:detik countdown, judul stream, tanggal
- Community Pulse: 4 stat cards dari GET /api/dashboard/stats
  Cards: Total Votes, Top Voted Game, Pending Requests, Pending Tasks
- Internal Tasks: 3 task teratas dari GET /api/todos?limit=3
- Bottom Navigation: Home / Schedule / Votes / To-Do / Profile

Warna: bgBase=#0D0B1A, card=#1A1730, cyan=#2DFFC2
```

**Checklist Fase 3:**
- [ ] DashboardScreen UI sesuai mockup
- [ ] Broadcasting toggle (tersimpan dan sync)
- [ ] Countdown widget dengan timer real-time
- [ ] 4 Community Pulse stat cards
- [ ] Internal Tasks list (3 teratas)
- [ ] Bottom navigation berfungsi
- [ ] dashboard_provider.dart

---

### FASE 4 — Stream Schedule Screen
**Prompt untuk Gemini:**
```
Saya sedang di FASE 4 — Stream Schedule Screen untuk X-VOCA Flutter app.

Buat schedule_screen.dart dengan:
- Header: "Stream Schedule" + search + filter icon
- Tab filter: Upcoming / Live Now / History
- Card jadwal berikutnya (highlighted): judul, game, countdown, status badge
- List jadwal lain: game badge, tanggal, judul, toggle Public Countdown
- FAB tombol "+ Add Schedule"

Buat add_schedule_bottom_sheet.dart (bottom sheet) dengan:
- Auto-fill via YouTube URL input + tombol "Fetch →"
  (call POST /api/youtube/fetch, isi form otomatis)
- Form: Stream Title, Game Category (dropdown), Date picker, Time picker
- Toggle: Publish Countdown to Viewer Web
- Textarea Description
- Tombol: Discard | Save & Sync to Web

API: GET /api/schedules, POST /api/schedules, PATCH /api/schedules/:id, DELETE /api/schedules/:id
```

**Checklist Fase 4:**
- [ ] ScheduleScreen UI sesuai mockup
- [ ] Tab filter berfungsi
- [ ] Card jadwal dengan countdown
- [ ] Add Schedule bottom sheet
- [ ] YouTube auto-fill berfungsi
- [ ] Date + time picker
- [ ] CRUD jadwal lengkap
- [ ] schedule_provider.dart

---

### FASE 5 — Vote Analytics Screen
**Prompt untuk Gemini:**
```
Saya sedang di FASE 5 — Vote Analytics Screen untuk X-VOCA Flutter app.

Buat vote_analytics_screen.dart dengan:
- Header: "Vote Analytics" + Reset Period button
- Tab filter: All Lifecycle / Pending (Req) / Done
- Section "Moderation Queue": game dengan status Requested
  Setiap card: cover, judul, requester, waktu, tombol Approve/Reject
- Section "Active & Finished": game Accepted, Playing, Done
  Card Playing: jumlah votes, progress bar, tombol Mark as Done
  Card Done: info selesai, votes final, status Archived

API:
- GET /api/games
- PATCH /api/games/:id/status
- POST /api/votes/reset-period
```

**Checklist Fase 5:**
- [ ] VoteAnalyticsScreen UI sesuai mockup
- [ ] Tab filter berfungsi
- [ ] Moderation Queue section
- [ ] Approve/Reject action
- [ ] Active & Finished section
- [ ] Mark as Done action
- [ ] Reset Period dengan konfirmasi dialog
- [ ] game_provider.dart

---

### FASE 6 — To-Do List Screen
**Prompt untuk Gemini:**
```
Saya sedang di FASE 6 — To-Do List Screen untuk X-VOCA Flutter app.

Buat todo_screen.dart dengan:
- Header: "Internal To-Do List" + search + calendar icon
- Tab filter: All Tasks / Urgent / Editing / Completed
- Progress bar harian: "X OF Y COMPLETED"
- Section High Priority & Deadlines: task cards
  Setiap card: judul, deadline (merah jika terlewat), tags, priority badge, resource info
  Swipe right: mark complete | Swipe left: delete
- Section Completed: task yang sudah done (greyed out, strikethrough)
- FAB tombol "+ New Task"

Buat add_task_bottom_sheet.dart dengan:
- Field: judul task, deadline (date+time picker), priority dropdown
- Tags input (multi chip)
- Resource info field
- Tombol: Cancel | Add Task

API: GET /api/todos, POST /api/todos, PATCH /api/todos/:id, DELETE /api/todos/:id
```

**Checklist Fase 6:**
- [ ] TodoScreen UI sesuai mockup
- [ ] Tab filter berfungsi
- [ ] Progress bar harian
- [ ] Task cards dengan priority badge
- [ ] Swipe to complete / delete
- [ ] Add Task bottom sheet
- [ ] Notifikasi deadline (flutter_local_notifications)
- [ ] todo_provider.dart

---

### FASE 7 — Settings Screen
**Prompt untuk Gemini:**
```
Saya sedang di FASE 7 — Settings & Profile Screen untuk X-VOCA Flutter app.

Buat settings_screen.dart dengan:
- Profile card: avatar lingkaran, nama "Xion Regalia", email, badge "Super Admin"
  Sub-info: rig_name, joined date, channel status
- Section "Integration & Security":
  Row YouTube Data Sync: ikon + label + status badge "Active"
  Row Firebase & MySQL: ikon + label + status badge "Synced"
  Row Change Admin Password: ikon + label + arrow (navigasi ke form ganti password)
- Section "App Preferences":
  Toggle Auto-Broadcast Status (sync ke /api/auth/broadcasting)
  Toggle Pending Request Alerts (simpan di FlutterSecureStorage)
  Row X-VOCA Build Version: label + badge "v1.0.4 (Prod)"
- Tombol "Sign Out of Creator Hub" (merah, hapus token, kembali ke LoginScreen)

API: GET /api/auth/me, PATCH /api/auth/password
```

**Checklist Fase 7:**
- [ ] SettingsScreen UI sesuai mockup
- [ ] Profile info dari API
- [ ] Toggle preferences berfungsi
- [ ] Sign Out (hapus token dari FlutterSecureStorage)
- [ ] Change password flow

---

### FASE 8 — Firebase Real-time & Final Polish
**Prompt untuk Gemini:**
```
Saya sedang di FASE 8 — Firebase Real-time dan final polish X-VOCA Flutter app.

Bantu saya:
1. Setup Firebase listener di Dashboard untuk countdown (listen /schedules/next)
2. Setup Firebase listener untuk broadcasting status (/broadcasting/isReady)
3. Pastikan countdown timer berjalan smooth (update setiap detik)
4. Tambahkan loading state (shimmer effect) di semua screen
5. Tambahkan empty state UI (jika tidak ada jadwal, tidak ada task, dll)
6. Handle offline state dengan pesan yang jelas
7. Pastikan bottom navigation preserve state antar tab
```

---

## CARA MENGGUNAKAN FILE INI DI SETIAP SESI GEMINI BARU

1. Buka chat Gemini baru
2. Copy-paste bagian berikut secara berurutan:

   SELALU (wajib di setiap sesi):
   - Bagian IDENTITAS PROYEK + STACK + ATURAN WAJIB dari file ini
   - Bagian FASE yang sedang dikerjakan (prompt + checklist)

   Jika membuat/mengerjakan UI/screen:
   - Tambahkan bagian screen yang relevan dari UI_SPEC_MOBILE.md
     Contoh: sedang buat DashboardScreen → copy bagian "SCREEN 2 — DASHBOARD"

   Jika mengerjakan koneksi API:
   - Tambahkan endpoint yang relevan dari API_CONTRACT.md

3. Lanjutkan dengan menjelaskan apa yang ingin dikerjakan

## TEMPLATE PROMPT AWAL SESI GEMINI BARU

```
Saya Choirul, sedang mengerjakan aplikasi Flutter untuk proyek X-VOCA.
X-VOCA adalah dashboard mobile privat untuk VTuber Xion Regalia.

STACK WAJIB (jangan diganti):
- Flutter + Dart
- State management: Riverpod (flutter_riverpod)
- HTTP client: Dio
- Storage token: flutter_secure_storage (key: 'xvoca_token')
- Real-time: Firebase Realtime Database
- Font: Google Fonts — Space Grotesk (teks utama), Space Mono (badge/label teknis)
- Ikon: Lucide Icons (package lucide_icons)

WARNA UTAMA (AppColors — jangan hardcode hex):
- AppColors.bgBase       = #0D0B1A  ← background semua screen
- AppColors.bgSurface    = #1A1730  ← card/container
- AppColors.bgInput      = #252240  ← input field, badge background
- AppColors.accentCyan   = #2DFFC2  ← aksen utama, tombol CTA, tab aktif
- AppColors.accentPurple = #9B6DFF  ← aksen sekunder, gradient
- AppColors.textPrimary  = #EEEAFF  ← teks utama
- AppColors.textSecondary= #9B97C0  ← teks abu/sub-teks
- AppColors.textMuted    = #5C587A  ← teks sangat redup

ATURAN CODING:
- Semua warna: AppColors.xxx (TIDAK hardcode hex)
- State management: Riverpod (AsyncNotifierProvider untuk data API)
- API calls: Dio melalui services/ (ada interceptor JWT otomatis)
- Token: flutter_secure_storage key 'xvoca_token'
- DateTime dari API: selalu toLocal() untuk konversi UTC ke WIB
- Format response API: { success: bool, data: {}, message: "" }
- Loading state: pakai Shimmer (package shimmer)
- Error state: tampilkan pesan error, ada tombol retry
- Empty state: tampilkan ilustrasi/teks, jangan biarkan kosong

SPESIFIKASI VISUAL SCREEN YANG SEDANG DIKERJAKAN:
[PASTE bagian screen dari UI_SPEC_MOBILE.md di sini]
Contoh: paste "SCREEN 2 — DASHBOARD" jika sedang kerjakan DashboardScreen

Saya sedang di FASE [nomor] — [nama fase].
Screen yang ingin dibuat: [nama screen, contoh: dashboard_screen.dart]
```
