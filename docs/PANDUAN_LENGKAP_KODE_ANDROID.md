# 📱 Panduan Lengkap Arsitektur & Kode Mobile Android (Flutter) — X-VOCA
## Dokumentasi Teknis Internal untuk Pengembang / Partner Kolaborasi

> **Tujuan Dokumen Ini:**  
> Dokumen ini disusun secara terperinci agar rekan pengembang dapat **memahami arsitektur aplikasi mobile Android X-VOCA dari hulu ke hilir**, mengetahui fungsi setiap file dan baris kode penting, memahami alur data (*data flow*), serta dapat melanjutkan pengembangan, pengujian, maupun presentasi teknis dengan percaya diri.

---

## 📑 Daftar Isi
1. [Gambaran Umum & Tech Stack](#1-gambaran-umum--tech-stack)
2. [Peta Struktur Direktori (`mobile/lib/`)](#2-peta-struktur-direktori-mobilelib)
3. [Arsitektur & Pola Desain (Clean MVVM + Riverpod)](#3-arsitektur--pola-desain-clean-mvvm--riverpod)
4. [Bedah Layer Core & Konfigurasi Lingkungan](#4-bedah-layer-core--konfigurasi-lingkungan)
5. [Bedah Layer Data (Network, Storage, & Notifikasi)](#5-bedah-layer-data-network-storage--notifikasi)
6. [Bedah Layer State Management (Riverpod Providers)](#6-bedah-layer-state-management-riverpod-providers)
7. [Bedah Layer Tampilan Antarmuka (Screens & Widgets)](#7-bedah-layer-tampilan-antarmuka-screens--widgets)
8. [Fitur-Fitur Khusus & Optimasi Penting yang Diterapkan](#8-fitur-fitur-khusus--optimasi-penting-yang-diterapkan)
9. [Panduan Menjalankan, Debugging, & Build APK](#9-panduan-menjalankan-debugging--build-apk)
10. [FAQ & Tanya Jawab Teknis Siap Pakai](#10-faq--tanya-jawab-teknis-siap-pakai)

---

## 1. Gambaran Umum & Tech Stack

Aplikasi Android **X-VOCA** adalah *Mobile Creator Companion* yang dirancang khusus untuk **VTuber Xion Regalia** agar dapat memantau dan mengontrol ekosistem siarannya langsung dari genggaman (smartphone).

### Komponen Teknologi Utama:
* **Framework:** Flutter 3.x (Dart 3.x)
* **Pola Arsitektur:** Clean Architecture dengan pendekatan *Feature-First / Layered MVVM*
* **Manajemen State:** `flutter_riverpod: ^2.4.0` (Reaktif, aman dari memory leak, tanpa BuildContext dependency)
* **Koneksi Jaringan (HTTP):** `dio: ^5.3.0` (Mendukung Interceptor JWT, auto-retry fallback, timeout guard)
* **Penyimpanan Lokal & Keamanan:**
  * `flutter_secure_storage: ^9.0.0` (Enkripsi KeyStore Android untuk token autentikasi JWT)
  * `shared_preferences: ^2.5.6` (Preferensi UI cepat untuk tema Dark/Light mode)
* **Layanan Realtime & Notifikasi:**
  * `firebase_core` & `firebase_messaging` (FCM push notification remote)
  * `firebase_database` (Sinkronisasi live data penonton & polling vote)
  * `flutter_local_notifications: 17.2.4` (AlarmManager native untuk pengingat live 30m & deadline to-do)
  * `timezone: ^0.9.4` (Penjadwalan alarm presisi berbasis zona waktu lokal WIB)
* **Desain & Aksen UI:**
  * `google_fonts` (`Space Grotesk`, `Space Mono`, `Outfit`)
  * `flutter_lucide` (Ikon vektor modern konsisten)
  * Obsidian Dark Mode (`#0D0B14`) & Slate Light Mode (`#F5F3EF`)

---

## 2. Peta Struktur Direktori (`mobile/lib/`)

Folder `lib` dibagi menjadi 3 lapisan utama (*Clean Architecture Separation*):

```text
mobile/lib/
│
├── main.dart                       # Entry point aplikasi, inisialisasi Firebase & Riverpod Scope
│
├── core/                           # Konfigurasi inti dan styling dasar sistem
│   ├── config/
│   │   └── env.dart                # Environment, endpoint production Vercel & fallback IP
│   └── theme/
│       └── app_theme.dart          # Token warna Obsidian/Slate & tema Material 3
│
├── data/                           # Layer data murni (tanpa ketergantungan UI)
│   ├── models/                     # Representasi data POJO (Plain Old Java/Dart Objects)
│   │   ├── audit_log_model.dart    # Model riwayat log audit studio
│   │   ├── collab_model.dart       # Model pengajuan kolaborasi streamer
│   │   ├── game_model.dart         # Model game & perolehan suara voting
│   │   ├── notification_model.dart # Model pesan notifikasi in-app
│   │   ├── schedule_model.dart     # Model jadwal live streaming
│   │   ├── todo_model.dart         # Model tugas persiapan siaran
│   │   ├── user_model.dart         # Model akun profil & konfigurasi rig kreator
│   │   └── youtube_stats_model.dart# Model statistik channel YouTube
│   └── services/                   # Jembatan komunikasi ke API Server & Hardware
│       ├── api_service.dart        # Client Dio pusat, interceptor JWT, fallback endpoint
│       ├── auth_service.dart       # HTTP request auth, login, & secure storage token
│       ├── collab_service.dart     # Endpoint permohonan collab (approve/reject)
│       ├── game_service.dart       # Endpoint moderasi game & reset periode voting
│       ├── notification_service.dart# Handler FCM push notification & Android AlarmManager
│       ├── schedule_service.dart   # Endpoint CRUD jadwal & toggle siaran
│       └── todo_service.dart       # Endpoint CRUD to-do list tugas
│
└── presentation/                   # Layer tampilan (UI) & Manajemen State
    ├── providers/                  # StateNotifier & Controller Riverpod
    │   ├── audit_log_provider.dart # Pengelola state log aktivitas studio
    │   ├── auth_provider.dart      # Pengelola sesi login, verifikasi JWT, & profil
    │   ├── collab_provider.dart    # Pengelola daftar & status permohonan kolaborasi
    │   ├── game_provider.dart      # Pengelola katalog game & statistik voting
    │   ├── notification_provider.dart # Pengelola badge & riwayat notifikasi aktif
    │   ├── schedule_provider.dart  # Pengelola jadwal streaming + auto-reminder
    │   ├── theme_provider.dart     # Pengelola pergantian tema Dark/Light instan
    │   ├── todo_provider.dart      # Pengelola checklist to-do + alarm deadline
    │   └── youtube_provider.dart   # Pengelola metrik analitik YouTube
    ├── screens/                    # Layar utama aplikasi (Halaman UI)
    │   ├── splash_screen.dart      # Intro animasi & pengecekan awal status sesi
    │   ├── login_screen.dart       # Formulir masuk akun kreator X-VOCA
    │   ├── dashboard_screen.dart   # Kontainer utama 5 tab navigasi bawah & floating sheet
    │   ├── schedule_screen.dart    # Tab 1: Manajemen jadwal & status siaran
    │   ├── votes_screen.dart       # Tab 2: Moderasi voting game & request collab
    │   ├── todo_screen.dart        # Tab 3: Checklist tugas persiapan streaming
    │   └── settings_screen.dart    # Tab 4: Pengaturan profil, rig VTuber, tema, & sistem
    └── widgets/                    # Komponen UI modular yang dapat digunakan ulang
        ├── countdown_widget.dart   # Timer hitung mundur live stream reaktif
        ├── notification_sheet.dart # Lembar modal (bottom sheet) daftar notifikasi
        └── stat_card.dart          # Kartu statistik metrik bergradasi cyber
```

---

## 3. Arsitektur & Pola Desain (Clean MVVM + Riverpod)

Aplikasi ini menggunakan pola **Model-View-ViewModel (MVVM)** dengan alur satu arah (*Unidirectional Data Flow*):

```
┌─────────────────┐       Tindakan Pengguna (Tap/Input)      ┌──────────────────┐
│   View (UI)     │ ────────────────────────────────────────> │  Riverpod State  │
│  (Screen/Widget)│ <──────────────────────────────────────── │     Notifier     │
└─────────────────┘        Re-render Reaktif saat State Ganti └─────────┬────────┘
                                                                        │ Memanggil Service
                                                                        ▼
┌─────────────────┐           Data JSON Diterima             ┌──────────────────┐
│ Model (Entity)  │ <──────────────────────────────────────── │   Data Service   │
│ (fromJson/Map)  │                                           │   (Dio Client)   │
└─────────────────┘                                           └─────────┬────────┘
                                                                        │ Request HTTP/FCM
                                                                        ▼
                                                              ┌──────────────────┐
                                                              │ Backend (Express)│
                                                              │  & TiDB / MySQL  │
                                                              └──────────────────┘
```

### Mengapa Memilih Riverpod?
1. **Bebas `BuildContext`**: Notifier dapat beroperasi di layer data/service tanpa harus mengoper context UI.
2. **Compile-time Safe**: Error penulisan provider terdeteksi langsung saat kompilasi, bukan crash saat runtime.
3. **Optimistic Updates**: Tampilan UI dapat diperbarui seketika (*instant feedback*) sebelum response server selesai, lalu melakukan rollback jika jaringan putus.

---

## 4. Bedah Layer Core & Konfigurasi Lingkungan

### 4.1. File: `mobile/lib/core/config/env.dart`
Mengatur seluruh alamat jaringan dan sakelar server:
* `static const bool useProduction = true;`:
  * Jika `true`: Aplikasi mengarah ke Vercel Cloud Server (`https://xvoca-backend.vercel.app/api`).
  * Jika `false`: Mengarah ke IP lokal laptop pengembang (`192.168.1.3:3001/api` atau `localhost`).
* `fallbackUrls`:
  Daftar URL cadangan bertingkat. Jika server Vercel mengalami kendala koneksi atau offline, `ApiService` secara otomatis mencoba endpoint alternatif tanpa membuat aplikasi *force close*.

### 4.2. File: `mobile/lib/core/theme/app_theme.dart`
Mendefinisikan identitas visual bergaya Cyber-VTuber:
* **Dark Mode (Obsidian Theme):**
  * Background: `#0D0B14` (Hitam hangat)
  * Kartu/Surface: `#161423` & `#1E1B2F`
  * Aksen: Neon Cyan (`#7EE0D2`) & Royal Lilac/Purple (`#C084FC`)
* **Light Mode (Slate Theme):**
  * Background: `#F5F3EF` (Broken white hangat)
  * Teks: Kontras tinggi gelap `#0F172A`
* Menggunakan tipografi `GoogleFonts.spaceGrotesk` (modern tech) dan `GoogleFonts.spaceMono` (angka & jam bergaya terminal rig).

---

## 5. Bedah Layer Data (Network, Storage, & Notifikasi)

### 5.1. File: `mobile/lib/data/services/api_service.dart`
Pusat komunikasi jaringan aplikasi menggunakan library `Dio`:
* **JWT Interceptor Otomatis:** Setiap kali request dikirim, interceptor mengambil token dari `FlutterSecureStorage` dan menyematkannya di header `Authorization: Bearer <token>`.
* **Timeout Proteksi:** Dibatasi maksimal 10 detik agar aplikasi tidak hang jika sinyal internet buruk.
* **Auto Error Formatter:** Menerjemahkan status HTTP (401, 403, 404, 500) menjadi pesan berbahasa Indonesia yang sopan untuk ditampilkan di UI.

### 5.2. File: `mobile/lib/data/services/auth_service.dart`
Mengelola sesi login kreator:
* Mengamankan access token menggunakan **Android KeyStore Hardware Encryption** melalui `FlutterSecureStorage`.
* Menyediakan fungsi `login()`, `logout()`, `getProfile()`, dan verifikasi validitas sesi saat pertama kali aplikasi dibuka.

### 5.3. File: `mobile/lib/data/services/notification_service.dart`
File krusial yang menangani 2 arsitektur notifikasi sekaligus:

#### A. Remote Push Notification (FCM):
* **Topic Subscription:** HP kreator berlangganan ke topik `creator_alerts` (notifikasi request game baru, collab baru, dan milestone vote), dan otomatis unsubscribe dari `stream_alerts` (agar HP tidak berdering saat siaran diri sendiri sedang LIVE).
* **Foreground Handler:** Saat aplikasi sedang dibuka di layar, pesan FCM ditangkap dan ditampilkan sebagai *Heads-up Notification Banner* menggunakan channel Android berkategori `Importance.max`.

#### B. Local Notification & Alarm Presisi (AlarmManager Native):
1. **Pengingat Siaran 30 Menit (`scheduleStreamReminder`):**
   * Menghitung `scheduled_at - 30 menit`.
   * Menggunakan `_localNotifications.zonedSchedule` dengan mode `AndroidScheduleMode.exactAllowWhileIdle`.
   * **Bekerja Offline:** Alarm tetap berdering tepat waktu meskipun koneksi internet terputus atau layar HP mati.
2. **Pengingat Batas Waktu To-Do (`scheduleTodoReminder`):**
   * Otomatis dipasang **1 jam sebelum deadline** tugas tiba (atau tepat pada jam deadline jika sisa waktu < 1 jam).
   * Judul otomatis menyesuaikan prioritas: `🚨 Tugas Urgent: Batas Waktu Mendekat!` atau `📌 Pengingat Tugas`.
3. **Pembatalan Cerdas (`cancelStreamReminder` & `cancelTodoReminder`):**
   * Jika jadwal/tugas dihapus atau dicentang selesai (*Completed*), sistem otomatis membatalkan alarm yang terpasang di sistem Android.

---

## 6. Bedah Layer State Management (Riverpod Providers)

Semua provider berada di `mobile/lib/presentation/providers/`. Berikut adalah logika utama di balik provider-provider kunci:

### 6.1. `auth_provider.dart`
* Menyimpan state pengguna aktif dalam bentuk `AsyncValue<UserModel?>`.
* Saat pertama kali dibuka, memanggil `_init()` untuk mengecek token lokal di Secure Storage. Jika valid, pengguna langsung masuk ke Dashboard tanpa harus mengetik password ulang.
* Membawa fungsi `updateProfile()` yang memungkinkan kreator mengganti nama, nama rig hardware ("Obsidian Rig #03"), dan versi rig langsung dari smartphone.

### 6.2. `theme_provider.dart`
* Mengatur peralihan antara `ThemeMode.dark` dan `ThemeMode.light`.
* **Solusi Dual Persistence:** Menyimpan preferensi tema ke `SharedPreferences` (untuk pembacaan sinkron instan tanpa jeda kedip layar) sekaligus ke `FlutterSecureStorage`.
* Mengubah tema secara *instantaneous* (0 milidetik latency) di seluruh layar.

### 6.3. `schedule_provider.dart`
* Menyimpan daftar jadwal siaran streaming (`List<ScheduleModel>`).
* Setiap kali jadwal berhasil dimuat (`fetchSchedules`), provider otomatis melakukan iterasi ke semua jadwal berstatus `upcoming` dan memanggil `scheduleStreamReminder()` ke sistem notifikasi Android.
* Saat membuat jadwal baru (`addSchedule`), provider menggunakan **Optimistic UI**, menampilkan jadwal sementara di layar sebelum respon server tiba agar pengguna tidak merasa lemot.

### 6.4. `todo_provider.dart`
* Mengelola daftar tugas persiapan siaran streaming (`TodoState`).
* **Integrasi Alarm Otomatis:**
  * Saat tugas ber-deadline ditambahkan (`addTodo`) atau dimuat (`fetchTodos`), alarm pengingat 1 jam otomatis didaftarkan ke sistem Android.
  * Saat tugas dicentang selesai (`toggleStatus` atau `updateStatus` ke `completed`), alarm dibatalkan seketika.
  * Saat tugas dihapus (`deleteTodo`), alarm dibersihkan dari memori Android.

---

## 7. Bedah Layer Tampilan Antarmuka (Screens & Widgets)

### 7.1. File: `mobile/lib/main.dart` & `splash_screen.dart`
* `main()` menjalankan `WidgetsFlutterBinding.ensureInitialized()`, menginisialisasi Firebase Core, dan mendaftarkan plugin notifikasi sebelum aplikasi digambar.
* `AuthWrapper` bertindak sebagai *Gatekeeper Navigasi*:
  * Jika token ada dan valid ➔ Langsung ke `DashboardScreen()`.
  * Jika token null atau kadaluwarsa ➔ Mengarahkan ke `LoginScreen()`.

### 7.2. File: `mobile/lib/presentation/screens/dashboard_screen.dart`
Merupakan induk tampilan kreator yang membungkus 5 tab menggunakan `IndexedStack` (sehingga state scroll dan form tidak hilang saat berpindah tab):
* **Tab 0: Overview / Dasbor Ringkas**
  * Kartu status Live Stream (Siap Siar / Sedang Live).
  * Timer hitung mundur (*Countdown Widget*) menuju jadwal stream berikutnya.
  * Metrik cepat statistik perolehan vote dan ringkasan to-do.
* **Tab 1: Jadwal (`ScheduleScreen`)**
  * Daftar timeline siaran (Upcoming, Live, Done).
  * Tombol modal tambah jadwal baru dengan validasi tanggal, jam, dan URL YouTube.
* **Tab 2: Voting & Collab (`VotesScreen`)**
  * Dual-Tab: Moderasi Game vs Permohonan Kolaborasi Streamer.
  * Dropdown kategori terstandarisasi + opsi input custom "Lainnya".
  * Tombol persetujuan usulan (*Approve* / *Reject*) dan penanda game *Playing* / *Done*.
* **Tab 3: To-Do List (`TodoScreen`)**
  * Filter status: *Semua*, *Pending*, *In Progress*, *Selesai*.
  * Filter kategori: *Stream & Jadwal*, *Konten & Video*, *Aset & Teknis*, *Sosmed*.
  * Checklist interaktif dengan efek getar haptic lembut (`HapticFeedback.selectionClick()`).
  * Modal penambahan tugas lengkap dengan pemilihan batas waktu (*Date & Time Picker*).
* **Tab 4: Pengaturan (`SettingsScreen`)**
  * Konfigurasi profil & dialog pengubahan nama Rig VTuber ("Obsidian Rig #03").
  * Tombol toggle tema tampilan (Dark Mode / Light Mode).
  * Sakelar notifikasi sistem dan tombol salin Base URL Endpoint.
  * Tombol pembersihan cache gambar dan tombol keluar sesi (*Logout*).

---

## 8. Fitur-Fitur Khusus & Optimasi Penting yang Diterapkan

Berikut adalah hal-hal teknis spesifik yang telah kita kerjakan dan selesaikan pada aplikasi Android ini:

### 8.1. Perbaikan Crash Mode Release APK (R8 / ProGuard Keep Rules)
* **Masalah Awal:** Di versi debug aplikasi berjalan lancar, namun ketika di-*build* menjadi `app-release.apk`, aplikasi *force close* saat tombol ganti tema ditekan.
* **Penyebab:** Kompiler R8 mengabstraksi / memotong (*tree-shaking*) kelas Kotlin Coroutine (`Continuation` ➔ `dm`) yang dibutuhkan oleh plugin `shared_preferences_android`.
* **Solusi yang Diterapkan:** Menambahkan aturan ProGuard di `mobile/android/app/proguard-rules.pro`:
  ```proguard
  -keep class io.flutter.plugins.sharedpreferences.** { *; }
  -keep class kotlin.coroutines.** { *; }
  -keep class androidx.preference.** { *; }
  ```

### 8.2. Penanganan Otomatis Keyboard Virtual (*Soft Keyboard Dismissal*)
* **Masalah Awal:** Saat kreator menekan tombol ganti status atau menutup dialog, keyboard HP masih sering menempel dan tidak mau turun secara otomatis.
* **Solusi yang Diterapkan:** Menambahkan pemanggilan universal penutup keyboard di setiap aksi dialog dan submit form:
  ```dart
  FocusManager.instance.primaryFocus?.unfocus();
  SystemChannels.textInput.invokeMethod('TextInput.hide');
  ```

### 8.3. Konsistensi Format Kategori Game
* Menggunakan daftar kategori yang 100% seragam antara Android, Web Admin, dan Web Viewer:
  `Action RPG`, `Survival Horror`, `Adventure`, `Open World`, `Simulation`, `Strategy`, `Indie`, `Multiplayer`, `Retro`, dan `Lainnya`.
* Jika memilih `Lainnya`, kolom input teks tambahan otomatis muncul secara elegan.

### 8.4. Standarisasi Bahasa Formal
* Seluruh teks antarmuka, *placeholder*, judul dialog, dan notifikasi telah dibersihkan dari bahasa kasual / placeholder bercandaan menjadi Bahasa Indonesia formal yang rapi dan profesional.

---

## 9. Panduan Menjalankan, Debugging, & Build APK

Jika rekan Anda ingin menjalankan atau mengompilasi kode ini di komputernya:

### A. Menjalankan di Mode Debug:
Pastikan HP Android sudah terhubung via kabel data (USB Debugging aktif) atau emulator menyala:
```bash
cd mobile
flutter pub get
flutter run
```

### B. Memeriksa Integritas Kode (Linter):
Untuk memastikan tidak ada syntax error atau import yang rusak:
```bash
flutter analyze
```
*(Hasil saat ini: `No issues found!`)*

### C. Mengompilasi Menjadi File APK Siap Pakai (Release Mode):
Untuk menghasilkan file installer `.apk` final yang optimal dan terkompresi:
```bash
flutter build apk --release
```
* **Hasil File APK:**  
  `mobile/build/app/outputs/flutter-apk/app-release.apk`  
  *(Ukuran sekitar 74 MB, siap diinstal langsung di HP Android tanpa perlu Android Studio).*

---

## 10. FAQ & Tanya Jawab Teknis Siap Pakai

Berikut adalah rangkuman pertanyaan teknis yang mungkin ditanyakan oleh teman, dosen, atau penguji, beserta cara menjawabnya:

**Q1: Mengapa menggunakan Riverpod dan bukan Provider biasa atau Bloc?**  
*Jawaban:* Riverpod adalah evolusi dari Provider yang sepenuhnya aman saat waktu kompilasi (*compile-time safe*). Riverpod tidak bergantung pada `BuildContext` pohon widget, sehingga pemanggilan state (seperti autentikasi atau notifikasi) dapat dijalankan langsung di lapisan service tanpa membuat kode UI berantakan. Bloc terlalu bertele-tele (*boilerplate heavy*) untuk kebutuhan aplikasi manajemen kreator ini.

**Q2: Bagaimana notifikasi jadwal dan to-do list bisa menyala padahal HP sedang mati layar dan tidak membuka aplikasi?**  
*Jawaban:* Aplikasi memanfaatkan plugin `flutter_local_notifications` yang dihubungkan ke layanan native Android `AlarmManager` dengan izin `SCHEDULE_EXACT_ALARM`. Sistem mendaftarkan alarm presisi ke kernel Android berdasarkan zona waktu lokal (`tz.TZDateTime`), sehingga Android OS sendiri yang akan membunyikan alarm tersebut meskipun proses aplikasi Flutter di latar belakang sudah dihentikan oleh sistem.

**Q3: Di mana token login disimpan dan apakah aman jika HP di-root?**  
*Jawaban:* Token JWT tidak disimpan di `SharedPreferences` biasa, melainkan di `FlutterSecureStorage`. Di sistem Android, library ini secara otomatis memanfaatkan **Android KeyStore Hardware Encryption** (AES-CBC + RSA), di mana kunci dekripsi disimpan di tingkat modul keamanan perangkat keras (*hardware level*), bukan di file teks biasa.

**Q4: Apa yang terjadi jika server backend di internet sedang down saat membuka aplikasi?**  
*Jawaban:* Di file `env.dart` dan `api_service.dart`, kami telah menerapkan logika *Fallback Interceptor*. Jika endpoint utama Vercel gagal diakses (timeout), Dio Interceptor akan otomatis mencoba alamat cadangan (seperti jaringan lokal atau loopback ADB reverse) sebelum akhirnya menampilkan pesan error yang ramah pengguna.

---

*Dokumen ini dibuat secara resmi untuk dokumentasi pengembangan sistem X-VOCA Mobile.*  
*Terakhir Diperbarui: November 2026.*
