# PRD.md — Product Requirements Document
# X-VOCA (Xion's Voice of Creator & Audience)
# Versi: 1.0 | Status: Final

---

## 1. TUJUAN PRODUK

Membangun sistem informasi terpusat untuk VTuber Xion Regalia yang terdiri dari:
1. **Web Viewer Portal** — pusat informasi publik untuk penonton
2. **Web Admin Dashboard** — panel kontrol untuk Creator via PC
3. **Mobile Creator App** — dashboard manajemen untuk Creator via smartphone

---

## 2. USER STORIES

### 2.1 Sebagai Viewer (Penonton)

| ID | User Story | Priority |
|---|---|---|
| V-01 | Saya ingin melihat profil dan informasi Xion Regalia di satu halaman | High |
| V-02 | Saya ingin melihat jadwal stream berikutnya dengan countdown real-time | High |
| V-03 | Saya ingin vote untuk game yang ingin saya tonton | High |
| V-04 | Saya ingin submit request game baru yang belum ada di daftar | High |
| V-05 | Saya ingin melihat persentase vote setiap game secara real-time | High |
| V-06 | Saya ingin browse katalog video/playlist YouTube Xion berdasarkan kategori | Medium |
| V-07 | Saya ingin tahu status game (sedang dimainkan, sudah selesai, diterima) | Medium |
| V-08 | Saya ingin melihat equipment dan spesifikasi setup streaming Xion | Low |

### 2.2 Sebagai Creator (Xion Regalia)

| ID | User Story | Priority |
|---|---|---|
| C-01 | Saya ingin login dengan aman ke dashboard Creator | High |
| C-02 | Saya ingin menambah jadwal stream baru dengan auto-fill dari YouTube link | High |
| C-03 | Saya ingin jadwal yang saya input otomatis mengubah countdown di web viewer | High |
| C-04 | Saya ingin melihat ranking game berdasarkan jumlah vote penonton | High |
| C-05 | Saya ingin approve/reject game request dari penonton | High |
| C-06 | Saya ingin menandai game sebagai "Sedang Dimainkan" atau "Selesai" | High |
| C-07 | Saya ingin mereset periode voting untuk memulai sesi baru | High |
| C-08 | Saya ingin mencatat to-do list pribadi dengan prioritas dan deadline | Medium |
| C-09 | Saya ingin mendapat notifikasi jika ada to-do yang melewati deadline | Medium |
| C-10 | Saya ingin mengelola katalog konten YouTube yang tampil di web | Medium |
| C-11 | Saya ingin toggle status broadcast (ready/off air) yang terlihat di dashboard | Medium |
| C-12 | Saya ingin melihat audit log aktivitas sistem | Low |

---

## 3. FITUR & ACCEPTANCE CRITERIA

### 3.1 WEB VIEWER — Hero & Profil

**F-W01: Hero Section**
- ✅ Menampilkan nama "XION REGALIA" dengan gradient typography
- ✅ Menampilkan karakter/avatar Xion Regalia
- ✅ Tombol CTA: "Lihat Voting" dan "Content Guide"
- ✅ Widget countdown stream berikutnya (data dari database, real-time)
- ✅ Countdown menampilkan: jam, menit, detik + judul stream + tanggal

**F-W02: Profil & About Section**
- ✅ Menampilkan data: nama, debut date, subscribers, total video
- ✅ Menampilkan link sosial media (YouTube, Twitter, TikTok)
- ✅ Menampilkan equipment specs (data statis, bisa diedit di admin)
- ✅ Menampilkan jadwal upcoming broadcast (3 jadwal terdekat)

### 3.2 WEB VIEWER — Game Voting

**F-W03: Tampilan Daftar Game**
- ✅ Grid responsif: 3 kolom desktop, 2 kolom tablet, 1 kolom mobile
- ✅ Setiap kartu game menampilkan: cover art, judul, genre, jumlah vote, persentase, status
- ✅ Filter tab: Semua / Requested / Accepted / Playing / Done
- ✅ Search game berdasarkan judul
- ✅ Sort: Suara Terbanyak (default), Terbaru

**F-W04: Voting**
- ✅ Viewer bisa vote 1x per game per periode
- ✅ Anti-spam: validasi IP + FingerprintJS + LocalStorage
- ✅ Setelah vote: tombol berubah jadi "Sudah Memberi Vote" (disabled)
- ✅ Persentase vote update real-time via Firebase tanpa refresh halaman
- ✅ Toast error muncul jika sudah pernah vote di periode yang sama

**F-W05: Game Request**
- ✅ Form di bawah halaman voting: input judul game + pilih genre
- ✅ Submit request (1x per device per minggu)
- ✅ Modal konfirmasi setelah submit berhasil
- ✅ Request masuk ke queue moderasi Creator (status: "Requested")

### 3.3 WEB VIEWER — Content Guide

**F-W06: Katalog Konten**
- ✅ Grid: 4 kolom desktop, 2 kolom tablet, 1 kolom mobile
- ✅ Featured card besar di bagian atas (konten yang di-pin Creator)
- ✅ Filter tab berdasarkan kategori/game
- ✅ Search berdasarkan judul
- ✅ Setiap card: thumbnail, judul, jumlah video, total durasi, link YouTube
- ✅ Hanya konten dengan status visible=true yang tampil

### 3.4 WEB ADMIN — Auth

**F-A01: Login Admin**
- ✅ Form login: email + password
- ✅ Toggle show/hide password
- ✅ Redirect ke dashboard setelah login berhasil
- ✅ Error message jika credentials salah
- ✅ Session tersimpan (JWT token di localStorage)

### 3.5 WEB ADMIN — Dashboard

**F-A02: Stat Cards**
- ✅ Total Vote Bulan Ini (dengan perbandingan bulan lalu)
- ✅ Jadwal Upcoming (jumlah stream terdaftar)
- ✅ Tugas Pending (dari To-Do List, highlight jika ada urgent)
- ✅ Content Aktif (jumlah konten visible)

**F-A03: Audit Log**
- ✅ Tabel log aktivitas: waktu, jenis aksi, detail
- ✅ Jenis aksi: Vote Masuk, Jadwal Diupdate, Request Game, Aset Diarsip
- ✅ Pagination (5 per halaman)
- ✅ Tombol Refresh dan Filter

**F-A04: Rig Calibration Widget**
- ✅ Menampilkan data statis: model name, versi, FPS (dapat diedit di Settings)
- ✅ Broadcasting Ready toggle (tersimpan di database, tampil di mobile dashboard)

### 3.6 WEB ADMIN — Manajemen Jadwal

**F-A05: Tabel Jadwal**
- ✅ Menampilkan semua jadwal dengan kolom: no, judul, kategori, tanggal, status, aksi
- ✅ Filter: Semua / Live / Upcoming / Arsip
- ✅ Status badge: LIVE NOW / UPCOMING / DONE / ARSIP
- ✅ Aksi per row: preview, edit, delete

**F-A06: Form Tambah/Edit Jadwal**
- ✅ Panel form di kanan layar (slide in)
- ✅ Field: Judul Stream, Kategori Game, Tanggal, Waktu (WIB), Deskripsi
- ✅ Toggle: Hitung Mundur Fansite (sync countdown ke web viewer)
- ✅ Simpan → data tersimpan ke MySQL + Firebase update countdown
- ✅ Status jadwal otomatis: upcoming → live (saat waktu tiba) → done

**F-A07: YouTube Auto-fill (Mobile & Web Admin)**
- ✅ Input YouTube URL → klik Fetch
- ✅ Backend call YouTube Data API v3
- ✅ Form otomatis terisi: judul, thumbnail, kategori game

### 3.7 WEB ADMIN — Moderasi Voting

**F-A08: Tabel Moderasi**
- ✅ Ranking game berdasarkan vote_count
- ✅ Kolom: rank, cover, judul game, genre, publisher, jumlah vote, status, ditambah oleh, aksi
- ✅ Filter: Semua / Requested / Accepted / Playing / Done
- ✅ Aksi per row: Accept, Set Playing, Mark Done, Delete

**F-A09: Kontrol Periode Voting**
- ✅ Tombol "Reset Periode Voting"
- ✅ Konfirmasi modal sebelum reset
- ✅ Reset: semua vote_count → 0, status game → requested, period_key baru dibuat
- ✅ Data votes lama tetap tersimpan di tabel votes (arsip)
- ✅ Info periode aktif: period_key, total suara terkumpul, sisa hari

**F-A10: Tambah Game Manual**
- ✅ Creator bisa tambah game baru langsung dari admin (tanpa perlu request dari viewer)
- ✅ Field: judul game, genre, cover image URL, publisher

### 3.8 WEB ADMIN — Manajemen Content Guide

**F-A11: Grid Konten**
- ✅ Grid 3 kolom dengan card konten
- ✅ Badge status: VISIBLE / HIDDEN / FEATURED
- ✅ Aksi per card: edit, toggle visible, toggle featured, delete
- ✅ Stat cards: total konten, publik visible, hidden/draft, featured series

**F-A12: Form Tambah/Edit Konten**
- ✅ Panel form di kanan (slide in)
- ✅ Field: judul (maks 80 karakter), game tag/kategori, YouTube URL/Playlist ID
- ✅ Thumbnail URL dengan preview otomatis
- ✅ Toggle: Featured Banner, Visible di Publik
- ✅ Sort Order (angka urutan tampil di web)

### 3.9 MOBILE APP — Login

**F-M01: Login Screen**
- ✅ Field: email + password (toggle show/hide)
- ✅ Checkbox "Keep session active"
- ✅ Tombol "Sign In to Dashboard" dengan gradient CTA
- ✅ Opsi biometrik (fingerprint) untuk login cepat
- ✅ Redirect ke Dashboard setelah berhasil

### 3.10 MOBILE APP — Dashboard

**F-M02: Dashboard Utama**
- ✅ Header: nama app X-VOCA + notif bell + avatar Creator
- ✅ Broadcasting Ready toggle (sync ke Web Admin)
- ✅ Countdown Widget: data stream terdekat dari database (jam:menit:detik)
- ✅ Community Pulse: 4 stat cards (total votes, top voted game, pending requests, pending tasks)
- ✅ Internal Tasks: 3 task teratas dari To-Do List (urgent diprioritaskan)
- ✅ Avatar Sync Latency widget (data statis kosmetik)
- ✅ Bottom navigation: Home / Schedule / Votes / To-Do / Profile

### 3.11 MOBILE APP — Stream Schedule

**F-M03: Halaman Jadwal**
- ✅ Tab filter: Upcoming / Live Now / History
- ✅ Card jadwal berikutnya: judul, game, tanggal, countdown, OBS Ready badge (statis)
- ✅ List jadwal lain dengan toggle Public Countdown
- ✅ FAB tombol "+ Add Schedule"

**F-M04: Add/Edit Schedule (Bottom Sheet)**
- ✅ Auto-fill via YouTube URL + tombol Fetch
- ✅ Form manual: Stream Title, Game Category (dropdown), Date, Time
- ✅ Toggle: Publish Countdown to Viewer Web
- ✅ Field Description
- ✅ Tombol: Discard / Save & Sync to Web

### 3.12 MOBILE APP — Vote Analytics

**F-M05: Moderation Queue**
- ✅ Tab filter: All Lifecycle / Pending (Req) / Done
- ✅ Section "Moderation Queue (Stage 1 & 2)": game dengan status Requested
- ✅ Aksi per game: Approve/Accept + Reject
- ✅ Section "Active & Finished (Stage 3 & 4)": game Accepted, Playing, Done
- ✅ Aksi: Set to Playing / Mark as Done
- ✅ Reset Period button

### 3.13 MOBILE APP — To-Do List

**F-M06: Daftar Tugas**
- ✅ Tab filter: All Tasks / Urgent / Editing / Completed
- ✅ Progress bar harian (X of Y completed)
- ✅ Section High Priority & Deadlines
- ✅ Setiap task: judul, deadline, tags, priority badge, resource info
- ✅ FAB tombol "+ New Task"
- ✅ Swipe to complete / delete
- ✅ Notifikasi push jika task melewati deadline

**F-M07: Add/Edit Task**
- ✅ Field: judul task, deadline (date + time), priority (urgent/high/medium/low)
- ✅ Tags (multi-input)
- ✅ Resource info (teks singkat)

### 3.14 MOBILE APP — Settings & Profile

**F-M08: Halaman Settings**
- ✅ Profile card: avatar, nama, email, role badge, rig identifier
- ✅ Joined date + channel status (Connected/Disconnected)
- ✅ Integration & Security: YouTube Data Sync status, Firebase sync status, Change Password
- ✅ App Preferences: Auto-Broadcast Status toggle, Pending Request Alerts toggle
- ✅ X-VOCA Build Version info
- ✅ Tombol Sign Out

---

## 4. NON-FUNCTIONAL REQUIREMENTS

| Kategori | Requirement |
|---|---|
| Performance | Halaman web load < 3 detik pada koneksi 4G |
| Real-time | Update vote terlihat < 2 detik setelah klik |
| Security | JWT token expire 7 hari, refresh token 30 hari |
| Anti-spam | Max 1 vote per game per device per period_key |
| Responsive | Web: mobile (375px) / tablet (768px) / desktop (1200px) |
| Availability | Target uptime 99% (free tier Railway + Vercel) |
| Data retention | Data votes lama tetap tersimpan meski periode di-reset |

---

## 5. OUT OF SCOPE (Tidak Dikerjakan)

- Integrasi OBS WebSocket (status OBS real-time)
- Auto-sync YouTube playlist (Content Guide input manual)
- Sistem komentar atau live chat
- Fitur donasi/monetisasi
- Multi-creator (hanya untuk Xion Regalia)
- Push notification web (hanya mobile)
- Dark/light mode toggle (fixed dark mode)
