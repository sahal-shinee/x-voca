# 🎮 Buku Panduan Mobile Android X-VOCA
## Versi Super Gampang: "Dari Anak SD Sampai Programmer Langsung Paham!"

> **Kenapa buku panduan ini dibuat?**  
> Supaya temanmu (atau siapa pun yang membaca dokumen ini) bisa langsung paham cara kerja aplikasi Android ini tanpa pusing dengan istilah-istilah rumit. Kita pakai **perumpamaan dunia nyata (seperti restoran, kurir paket, dan jam weker)**, tapi tetap dilengkapi **nama file dan baris kodingan aslinya**!

---

## 📑 Daftar Isi
1. [Ibarat Apa Sih Aplikasi Android Ini? (Konsep Dasar)](#1-ibarat-apa-sih-aplikasi-android-ini-konsep-dasar)
2. [Peta Markas: Tugas Setiap Folder di `mobile/lib/`](#2-peta-markas-tugas-setiap-folder-di-mobilelib)
3. [Rahasia Tim 3 Serangkai: UI, Riverpod, dan Kurir Jaringan](#3-rahasia-tim-3-serangkai-ui-riverpod-dan-kurir-jaringan)
4. [Bedah File Penting Satu per Satu](#4-bedah-file-penting-satu-per-satu)
   * 4.1. Remote Kontrol Server (`env.dart`)
   * 4.2. Baju Gelap & Baju Terang (`app_theme.dart` & `theme_provider.dart`)
   * 4.3. Brankas & Kunci Rahasia (`auth_service.dart` & `auth_provider.dart`)
   * 4.4. Jam Weker & Merpati Pos (`notification_service.dart`)
   * 4.5. Papan Tugas Anti-Lupa (`todo_screen.dart` & `todo_provider.dart`)
   * 4.6. Papan Jadwal Live (`schedule_screen.dart` & `schedule_provider.dart`)
   * 4.7. Kotak Suara Voting & Collab (`votes_screen.dart`)
5. [Cerita Seru Masalah Eror yang Sudah Berhasil Diperbaiki](#5-cerita-seru-masalah-eror-yang-sudah-berhasil-diperbaiki)
6. [Cara Menjalankan dan Bikin File APK-nya](#6-cara-menjalankan-dan-bikin-file-apk-nya)
7. [Contekan Tanya-Jawab Keren (Siap Buat Presentasi!)](#7-contekan-tanya-jawab-keren-siap-buat-presentasi)

---

## 1. Ibarat Apa Sih Aplikasi Android Ini? (Konsep Dasar)

Bayangkan streamer VTuber kita, **Xion Regalia**, sedang siaran di komputer kamarnya. Dia butuh **Remote Kontrol Ajaib** di HP-nya supaya tidak perlu bolak-balik buka laptop cuma buat:
1. Menyalakan tanda *"Aku Sedang Live!"*.
2. Memasang jam weker pengingat siaran dan tugas-tugas penting.
3. Memilih game apa yang mau dimainkan dari usulan penonton.
4. Melihat teman streamer lain yang mengajak collab bareng.

Nah, aplikasi Android ini adalah **Remote Kontrol Ajaib** tersebut!

---

## 2. Peta Markas: Tugas Setiap Folder di `mobile/lib/`

Ibaratkan sebuah **Rumah Makan Padang yang Mewah**, kodingan kita dibagi menjadi 3 ruangan rapi:

```text
mobile/lib/
│
├── core/            ---> "Pondasi Rumah & Dekorasi"
│                         Berisi warna lampu (tema) dan alamat jalan rumah makan (URL server).
│
├── data/            ---> "Dapur, Kulkas, & Kurir Pengantar"
│                         Tempat menyimpan wadah makanan (Model), brankas kunci, 
│                         dan kurir yang bolak-balik mengambil bahan ke server pusat.
│
└── presentation/    ---> "Meja Makan & Pelayan Ramah"
                          Tempat layar yang dilihat pengguna (Screens) dan 
                          pelayan pintar yang mencatat pesanan (Riverpod Providers).
```

---

## 3. Rahasia Tim 3 Serangkai: UI, Riverpod, dan Kurir Jaringan

Bagaimana aplikasi ini bekerja saat kamu memencet tombol di layar HP? Ada 3 tokoh yang bekerja sama:

```
[ 1. LAYAR HP (View) ]
  Kamu memencet tombol checklist: "Tugas Selesai!"
        │
        ▼
[ 2. PELAYAN PINTAR (Riverpod Provider) ]
  "Siap! Layar langsung aku centang hijau sekarang juga,
   lalu aku suruh kurir lapor ke server pusat!"
        │
        ▼
[ 3. KURIR CEPAT (Dio / ApiService) ]
  Kurir naik motor cepat mengantar surat ke Server Vercel di awan:
  "Halo Server, tolong tandai tugas ID #5 sudah selesai ya!"
        │
        ▼
[ 4. GUDANG PUSAT (Database Server) ]
  Data disimpan permanen di database MySQL / TiDB.
```

> **Kenapa harus pakai cara ini?**  
> Supaya kalau internetnya lambat, layar HP kamu **tidak macet (hang)**! Layar langsung berubah seketika (*Optimistic Update*), sementara si kurir bekerja di belakang layar.

---

## 4. Bedah File Penting Satu per Satu

Di bawah ini adalah penjelasan setiap file penting beserta tugasnya.

---

### 4.1. Remote Kontrol Server
📍 **File:** [`mobile/lib/core/config/env.dart`](file:///c:/project_flutter/x-voca/mobile/lib/core/config/env.dart)

* **Ibaratnya:** Sakelar pemilih jalan tol.
* **Tugasnya:**
  Menentukan HP ini mau mengirim data ke **Server Asli di Internet (Vercel Cloud)** atau ke **Laptop Pengembang lewat WiFi/Kabel USB**.
* **Kodingan Kuncinya:**
  ```dart
  // Kalau true = pakai server internet Vercel
  // Kalau false = pakai laptop sendiri buat ngetes
  static const bool useProduction = true;
  ```
  Di file ini juga ada daftar `fallbackUrls`. Jika jalan tol utama macet, kurir otomatis putar balik lewat jalan tikus alternatif tanpa bikin aplikasi mogok (*crash*).

---

### 4.2. Baju Gelap & Baju Terang
📍 **File Warna:** [`mobile/lib/core/theme/app_theme.dart`](file:///c:/project_flutter/x-voca/mobile/lib/core/theme/app_theme.dart)  
📍 **File Otak Tema:** [`mobile/lib/presentation/providers/theme_provider.dart`](file:///c:/project_flutter/x-voca/mobile/lib/presentation/providers/theme_provider.dart)

* **Ibaratnya:** Sakelar lampu kamar tidur.
* **Tugasnya:**
  Mengganti baju aplikasi antara **Mode Gelap (Obsidian Rig)** yang keren beraksen ungu-neon, dan **Mode Terang (Slate Mode)** yang bersih.
* **Cara Kerjanya:**
  Saat tombol switch ditekan, pilihanmu langsung disimpan ke dua tempat sekaligus:
  1. `SharedPreferences` (Buku catatan cepat di saku) ➔ Begitu aplikasi dibuka, temanya langsung ingat tanpa kedip!
  2. `FlutterSecureStorage` (Brankas cadangan).

---

### 4.3. Brankas & Kunci Rahasia
📍 **File Kunci:** [`mobile/lib/data/services/auth_service.dart`](file:///c:/project_flutter/x-voca/mobile/lib/data/services/auth_service.dart)  
📍 **File Penjaga:** [`mobile/lib/presentation/providers/auth_provider.dart`](file:///c:/project_flutter/x-voca/mobile/lib/presentation/providers/auth_provider.dart)

* **Ibaratnya:** Kunci gembok gelang tangan VIP.
* **Tugasnya:**
  Menyimpan tiket login (Token JWT) setelah kamu memasukkan email & password.
* **Hebatnya di Mana?**
  Tiket rahasia ini **tidak disimpan di file teks biasa yang bisa diintip orang**, melainkan di dalam **Android KeyStore Hardware** (brankas besi enkripsi bawaan chip prosesor HP).
  * Saat kamu membuka aplikasi, file `splash_screen.dart` cuma tanya ke brankas: *"Tiketnya masih ada dan sah nggak?"*  
  * Kalau sah ➔ Langsung masuk ke Dasbor tanpa perlu ketik password lagi!

---

### 4.4. Jam Weker & Merpati Pos
📍 **File:** [`mobile/lib/data/services/notification_service.dart`](file:///c:/project_flutter/x-voca/mobile/lib/data/services/notification_service.dart)

Aplikasi ini punya 2 jenis pemberitahuan:

#### A. Jam Weker Mandiri (Local Notification - Bekerja Offline!)
* **Pengingat Siaran:** Tepat **30 menit sebelum jadwal live**, HP akan berdering dan bergetar:  
  *`⏰ Siaran 30 Menit Lagi! Sesi "Malam Minggu Gaming" akan dimulai pukul 20:00 WIB. Siapkan OBS & rig sekarang!`*
* **Pengingat To-Do List:** Tepat **1 jam sebelum deadline tugas**, jam weker HP berbunyi:  
  *`🚨 Tugas Urgent: Batas Waktu Mendekat! Tugas "Render Thumbnail YouTube" tinggal 1 jam lagi!`*
* **Kenapa Hebat?**  
  Menggunakan `Android AlarmManager` native. Jadi **walaupun kamu matikan kuota internet atau layar HP mati terkunci**, alarmnya tetap bunyi tepat waktu!

#### B. Merpati Pos dari Awan (Firebase Push Notification / FCM)
* Kalau ada penonton di website mengusulkan game baru atau mengirim request ajakan collab, server mengirim merpati pos kilat ke HP kreator:  
  *`🤝 Permohonan Collab Baru Masuk! @KoboKanaeru diajukan oleh penonton.`*
* Notifikasi ini langsung muncul melayang di bar atas HP kamu.

---

### 4.5. Papan Tugas Anti-Lupa (To-Do List)
📍 **File Layar:** [`mobile/lib/presentation/screens/todo_screen.dart`](file:///c:/project_flutter/x-voca/mobile/lib/presentation/screens/todo_screen.dart)  
📍 **File Otak:** [`mobile/lib/presentation/providers/todo_provider.dart`](file:///c:/project_flutter/x-voca/mobile/lib/presentation/providers/todo_provider.dart)

* **Ibaratnya:** Papan tulis to-do list magnet di pintu kulkas.
* **Fitur-Fiturnya:**
  1. **Checklist Instan:** Dipencet langsung centang hijau dan ada efek getar lembut (*haptic feedback*).
  2. **Tanda Bahaya Merah:** Kalau tugasnya belum selesai dan tanggal deadline sudah lewat, otomatis ada tulisan merah *"Lewat Batas Waktu"*.
  3. **Auto Pasang Jam Weker:** Begitu kamu membuat tugas dan memilih jam deadline, sistem diam-diam langsung memasang alarm jam weker di HP kamu.
  4. **Auto Batal Alarm:** Begitu tugasnya kamu centang selesai atau kamu hapus tong sampah, alarmnya otomatis dibatalkan supaya tidak berisik!

---

### 4.6. Papan Jadwal Live Streaming
📍 **File Layar:** [`mobile/lib/presentation/screens/schedule_screen.dart`](file:///c:/project_flutter/x-voca/mobile/lib/presentation/screens/schedule_screen.dart)  
📍 **File Otak:** [`mobile/lib/presentation/providers/schedule_provider.dart`](file:///c:/project_flutter/x-voca/mobile/lib/presentation/providers/schedule_provider.dart)

* **Ibaratnya:** Jadwal pelajaran di kelas sekolah.
* **Fitur-Fiturnya:**
  1. Menampilkan siaran apa yang akan datang (*Upcoming*), yang lagi live (*Live*), dan yang sudah lewat (*Done*).
  2. Ada tombol sakelar: *"Mulai Live"* yang kalau ditekan akan otomatis mengubah countdown di website fansite penonton menjadi merah bertuliskan **LIVE**.
  3. Bisa menempelkan link YouTube, dan sistem otomatis membaca durasi dan tanggalnya.

---

### 4.7. Kotak Suara Voting & Collab
📍 **File Layar:** [`mobile/lib/presentation/screens/votes_screen.dart`](file:///c:/project_flutter/x-voca/mobile/lib/presentation/screens/votes_screen.dart)  
📍 **File Otak:** [`mobile/lib/presentation/providers/game_provider.dart`](file:///c:/project_flutter/x-voca/mobile/lib/presentation/providers/game_provider.dart) & [`collab_provider.dart`](file:///c:/project_flutter/x-voca/mobile/lib/presentation/providers/collab_provider.dart)

* **Ibaratnya:** Kotak surat suara pemilihan ketua kelas.
* **Fitur-Fiturnya:**
  1. **Tab 1 (Voting Game):** Melihat ranking game yang paling banyak dipilih penonton. Kreator bisa menekan tombol centang hijau (*Setujui*) atau silang merah (*Tolak*).
  2. **Tab 2 (Request Collab):** Melihat streamer mana saja yang diajukan oleh penonton lengkap dengan link sosial medianya.
  3. **Pilihan Kategori:** Menggunakan dropdown pilihan rapi (`Action RPG`, `Survival Horror`, `Adventure`, dll) atau bisa ketik sendiri jika memilih `Lainnya`.

---

## 5. Cerita Seru Masalah Eror yang Sudah Berhasil Diperbaiki

Biar temanmu tahu perjuangan di balik aplikasi ini, ceritakan 3 masalah seru ini:

### 🥊 Masalah 1: "Tukang Bersih-Bersih yang Terlalu Rajin" (Crash Mode Release)
* **Ceritanya:** Pas dicoba di laptop (mode debug), tombol ganti tema gelap-terang lancar jaya. Tapi pas dibikin jadi file APK (`app-release.apk`) dan diinstal ke HP beneran, aplikasinya langsung mental keluar (*force close*) tiap kali tombol tema dipencet!
* **Penyebabnya:** Kompiler Android punya robot pembersih bernama **R8**. Si robot ini saking rajinnya mengira kodingan sakelar tema itu sampah yang tidak terpakai, jadi kabelnya dipotong sama dia!
* **Solusinya:** Kita buat aturan di file `mobile/android/app/proguard-rules.pro`:  
  *`-keep class io.flutter.plugins.sharedpreferences.** { *; }`*  
  Artinya: *"Hai Robot R8, jangan sentuh dan jangan hapus kabel ini ya, ini kabel sakelar tema kita!"* Hasilnya? APK sekarang lancar 100%!

### 🥊 Masalah 2: "Keyboard HP yang Suka Nongol Sendiri dan Nggak Mau Pulang"
* **Ceritanya:** Tiap kali habis ganti status game atau menutup popup, papan ketik (keyboard HP) tiba-tiba muncul sendiri menutupi setengah layar dan tidak mau turun.
* **Solusinya:** Kita pasang mantra sakti di setiap tombol aksi:  
  `FocusManager.instance.primaryFocus?.unfocus();` dan `TextInput.hide`  
  Artinya: *"Tutup keyboard sekarang juga begitu tombol ditekan!"* Sekarang layar selalu bersih dan lega.

### 🥊 Masalah 3: "Dropdown Kategori yang Kaku Kayak Zaman Purba"
* **Ceritanya:** Sebelumnya dropdown di website dan HP menggunakan kotak standar bawaan Windows yang kaku dan tajam warna biru jadul.
* **Solusinya:** Kita buatkan komponen custom baru bernama **`CustomDropdown`** yang punya efek kaca transparan (*Glassmorphism*), ada ikon centang neon, dan animasinya berputar mulus.

---

## 6. Cara Menjalankan dan Bikin File APK-nya

Kalau temanmu mau mencoba di komputernya sendiri, suruh ikuti 3 langkah gampang ini:

### Langkah 1: Hubungkan HP Android ke Laptop
Colok kabel USB dari HP ke laptop, dan pastikan mode **USB Debugging** di HP sudah menyala.

### Langkah 2: Jalankan Aplikasinya (Mode Tes)
Buka terminal / PowerShell di folder proyek:
```bash
cd mobile
flutter pub get
flutter run
```
Aplikasi akan otomatis terpasang dan terbuka di layar HP!

### Langkah 3: Bikin File APK Jadi (Buat Dibagikan ke Teman / Google Drive)
Ketik perintah ini di terminal:
```bash
flutter build apk --release
```
Tunggu sekitar 1–2 menit sampai muncul tulisan `Built build\app\outputs\flutter-apk\app-release.apk`.  
Ambil file APK-nya di folder:  
📁 **`mobile/build/app/outputs/flutter-apk/app-release.apk`**  
Kirim file itu lewat WhatsApp atau Google Drive, tinggal klik langsung terinstal di HP siapa pun!

---

## 7. Contekan Tanya-Jawab Keren (Siap Buat Presentasi!)

Kalau ada dosen, teman, atau penguji yang bertanya, gunakan jawaban pintar ini:

* **Tanya:** *"Kenapa pakai Flutter, kenapa nggak bikin pakai Java/Kotlin native aja?"*  
  **Jawab:** *"Karena Flutter sekali tulis kodingan bisa langsung dipakai di Android, iOS, bahkan Web. Performanya juga sangat mulus 60 FPS karena dirender langsung oleh engine grafis C++."*

* **Tanya:** *"Kenapa pilih Riverpod buat state management-nya?"*  
  **Jawab:** *"Riverpod itu compile-time safe, artinya kalau kita salah ketik nama data, langsung ketahuan errornya sebelum aplikasi dijalankan. Riverpod juga bikin kode UI kita bersih dan nggak gampang kena memory leak."*

* **Tanya:** *"Gimana ceritanya alarm pengingat to-do list bisa nyala padahal HP mati kuota?"*  
  **Jawab:** *"Karena alarmnya tidak menunggu sinyal internet dari server, melainkan didaftarkan langsung ke jam sistem inti Android OS menggunakan native AlarmManager (`flutter_local_notifications`). Begitu jam yang ditentukan tiba, Android sendiri yang membunyikan alarmnya."*

* **Tanya:** *"Aman nggak password dan token login di aplikasi ini?"*  
  **Jawab:** *"Sangat aman, karena kita simpan di `FlutterSecureStorage` yang memakai enkripsi perangkat keras Android KeyStore (AES-256), bukan teks polos biasa."*

---

> 🎉 **Selamat!** Sekarang kamu dan temanmu sudah tahu luar-dalam sistem Android X-VOCA. Dokumen ini adalah bukti hasil kerja keras dan kecerdasan arsitektur yang telah dibangun bersama!
