# PROJECT_CONTEXT.md — X-VOCA
# File ini WAJIB di-attach di awal SETIAP sesi AI baru
# Dibaca oleh: Sahal (Web) & Choirul (Mobile)

---

## 1. RINGKASAN PROYEK

**X-VOCA (Xion's Voice of Creator & Audience)** adalah sistem manajemen konten terpusat
untuk VTuber Xion Regalia. Sistem ini menghubungkan Creator dengan audiensnya melalui
dua platform utama yang tersinkronisasi secara real-time.

**Klien:** Xion Regalia (VTuber indie)
**Tim:** Sahal (Web + Backend) & Choirul (Mobile Flutter)
**Sekolah:** SMK Negeri 1 Cimahi — Proyek KIK 2026

---

## 2. PLATFORM YANG DIBANGUN

### A. Web Viewer Portal (Publik — untuk penonton)
Diakses oleh siapapun tanpa login. Berisi:
- Hero/Landing page dengan profil Xion Regalia
- Halaman Game Voting & Request
- Halaman Content Guide (arsip video/playlist YouTube)

### B. Web Admin Dashboard (Private — untuk Creator via PC)
Diakses hanya oleh Xion Regalia setelah login. Berisi:
- Dashboard utama dengan statistik & audit log
- Manajemen Jadwal Stream
- Moderasi Game Voting
- Manajemen Content Guide

### C. Mobile Creator App (Private — untuk Creator via smartphone)
Aplikasi Flutter khusus Xion Regalia. Berisi:
- Login screen
- Dashboard (countdown + broadcasting toggle)
- Stream Schedule (CRUD jadwal)
- Vote Analytics (moderasi voting)
- To-Do List (catatan internal pribadi)
- Settings & Profile

---

## 3. TECH STACK FINAL

| Layer | Teknologi | Hosting |
|---|---|---|
| Web Frontend (Viewer + Admin) | React.js + React Router v6 + Tailwind CSS | Vercel |
| Web Backend (API) | Node.js + Express.js | Railway |
| Database | MySQL + Sequelize ORM | Railway |
| Real-time | Firebase Realtime Database | Firebase (free tier) |
| Mobile App | Flutter + Riverpod + Dio | APK (sideload) |
| Anti-spam Voting | FingerprintJS + IP + LocalStorage | — |
| YouTube Auto-fill | YouTube Data API v3 (key di backend) | — |

---

## 4. KEPUTUSAN ARSITEKTUR PENTING

1. **Backend terpisah dari frontend** — React di Vercel, Express di Railway
2. **Real-time voting via Firebase** — bukan WebSocket manual (Railway tidak support persistent WebSocket di free tier)
3. **YouTube API Key di backend** — TIDAK BOLEH ada di frontend atau Flutter
4. **Anti-spam 3 lapis** — IP Address + FingerprintJS + LocalStorage token
5. **Content Guide input manual** — Creator paste URL YouTube, bukan auto-sync playlist
6. **Reset voting manual** — Creator klik reset, sistem auto-generate period_key baru (format: YYYY-MM)
7. **Obsidian Rig diganti** — dengan Countdown Widget (data dari Schedule) + Broadcasting Ready toggle
8. **Viewer tidak perlu login** — akses publik sepenuhnya untuk web viewer

---

## 5. AKTOR & HAK AKSES

### Guest (Viewer/Penonton)
- Akses publik tanpa login
- Bisa: lihat profil, lihat jadwal, lihat countdown, browse Content Guide
- Bisa: vote game, submit game request (dibatasi anti-spam)
- Tidak bisa: akses area admin apapun

### SuperAdmin (Xion Regalia / Creator)
- Wajib login (email + password + 2FA)
- Akses via Web Admin (PC) DAN Mobile App (smartphone)
- Bisa: semua operasi CRUD di semua modul
- Bisa: moderasi voting, reset periode, toggle status game
- Bisa: manage Content Guide, manage jadwal stream
- Bisa: lihat To-Do List pribadi (tidak dipublikasikan ke viewer)

---

## 6. FITUR PER MODUL

### Web Viewer
| Fitur | Deskripsi |
|---|---|
| Hero Section | Karakter Xion, catchphrase, link sosmed, countdown stream berikutnya |
| Profil & About | Data karakter, equipment specs, statistik channel |
| Upcoming Broadcast | Jadwal stream mendatang dari database |
| Game Voting | Grid kartu game, vote button, progress bar persentase |
| Game Request | Form submit request game baru (1x per periode per device) |
| Content Guide | Grid katalog video/playlist YouTube berdasarkan kategori |

### Web Admin
| Fitur | Deskripsi |
|---|---|
| Dashboard | Stat cards (total vote, jadwal, tugas, konten), audit log, rig calibration widget |
| Manajemen Jadwal | Tabel jadwal CRUD + form panel kanan + auto-fill YouTube API |
| Moderasi Voting | Tabel ranking game, aksi Accept/Playing/Done/Delete, info periode |
| Manajemen Content | Grid konten CRUD + form panel kanan + toggle visible/featured |

### Mobile App
| Fitur | Deskripsi |
|---|---|
| Login | Email + password, keep session active |
| Dashboard | Broadcasting toggle, countdown widget, community pulse stats, internal tasks |
| Stream Schedule | Tab upcoming/live/history, countdown per jadwal, add/edit/delete |
| Add Schedule | Bottom sheet form + YouTube auto-fill via backend API |
| Vote Analytics | Queue moderasi, approve/reject, set playing, mark done |
| To-Do List | CRUD task dengan priority (urgent/high/medium/low), deadline, progress |
| Settings | Profile info, integrasi YouTube sync, Firebase sync, toggle preferences |

---

## 7. STRUKTUR DATABASE (RINGKASAN)

6 tabel utama:
- `users` — akun creator
- `schedules` — jadwal stream
- `games` — daftar game voting
- `votes` — log voting per device
- `content_guides` — katalog konten YouTube
- `todos` — to-do list internal creator

Detail lengkap → lihat `DATABASE_SCHEMA.md`

---

## 8. ALUR DATA KRITIS

### Alur Voting Real-time:
```
Viewer klik Vote
→ Cek LocalStorage (sudah vote?)
→ Cek FingerprintJS hash
→ POST /api/votes/:gameId ke Express backend
→ Backend cek IP + fingerprint di tabel votes
→ Jika valid: update vote_count di MySQL + tulis ke Firebase
→ Firebase broadcast ke semua viewer aktif
→ Semua browser update persentase vote secara real-time
```

### Alur Sinkronisasi Jadwal:
```
Creator input jadwal di Mobile/Web Admin
→ POST /api/schedules ke Express backend
→ Data tersimpan di MySQL
→ Backend update Firebase node /schedules/next
→ Web viewer countdown otomatis update
→ Mobile dashboard countdown otomatis update
```

### Alur YouTube Auto-fill:
```
Creator paste YouTube URL di form jadwal
→ Flutter/React kirim POST /api/youtube/fetch ke backend
→ Backend call YouTube Data API v3 (API key aman di server)
→ Return: judul, thumbnail, kategori game
→ Form otomatis terisi
```

---

## 9. ENVIRONMENT VARIABLES

### Backend (Express.js) — `.env`
```
PORT=3001
DB_HOST=railway_host
DB_PORT=3306
DB_NAME=xvoca_db
DB_USER=railway_user
DB_PASS=railway_password
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
YOUTUBE_API_KEY=your_youtube_api_key
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=https://xvoca.vercel.app
```

### Frontend React — `.env`
```
REACT_APP_API_URL=https://xvoca-api.railway.app
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_DATABASE_URL=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FINGERPRINT_KEY=your_fingerprint_public_key
```

### Flutter — `lib/core/config/env.dart`
```dart
const apiBaseUrl = 'https://xvoca-api.railway.app';
const firebaseProjectId = 'xvoca-project';
```

---

## 10. KONTAK TIM

| Nama | Peran | Tools |
|---|---|---|
| Sahal | Web Frontend (React) + Backend (Express) + Database (MySQL) | VSCode + Claude/Gemini Agent |
| Choirul | Mobile App (Flutter) | Gemini Web |
