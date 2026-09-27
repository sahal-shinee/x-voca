# USAGE_GUIDE.md — Panduan Lengkap X-VOCA
# Satu-satunya file yang perlu dibaca manusia sebelum dan selama development
# Sahal baca Bagian 1 | Choirul baca Bagian 2 | Berdua baca Bagian 3 & 4

---

## DAFTAR FILE DOCS & FUNGSINYA (untuk referensi)

```
docs/
├── PROJECT_CONTEXT.md    → Ringkasan proyek, stack, keputusan teknis
├── PRD.md                → Daftar lengkap fitur yang harus dibuat
├── ARCHITECTURE.md       → Struktur folder project
├── API_CONTRACT.md       → Semua endpoint API (format request & response)
├── DATABASE_SCHEMA.md    → Struktur tabel MySQL + SQL siap pakai
├── DESIGN_TOKENS.md      → Warna, font, spacing (Tailwind config)
├── UI_SPEC_WEB.md        → Spesifikasi visual detail semua halaman web
├── UI_SPEC_MOBILE.md     → Spesifikasi visual detail semua screen Flutter
├── AI_RULES_WEB.md       → Aturan coding untuk agent Sahal (dibaca agent otomatis)
├── AI_RULES_MOBILE.md    → Aturan coding untuk Gemini Choirul (ada di template bawah)
├── MOCK_DATA.json        → Data dummy semua endpoint untuk Choirul
├── SETUP_GUIDE_SAHAL.md  → Langkah setup environment Sahal
├── SETUP_GUIDE_CHOIRUL.md→ Langkah setup environment Choirul
└── USAGE_GUIDE.md        → File ini — satu-satunya yang perlu dibaca manusia
```

**Catatan penting:**
- File `AI_RULES_WEB.md` tidak perlu dibaca Sahal — agent membacanya otomatis
- File `AI_RULES_MOBILE.md` tidak perlu dibaca Choirul — isinya sudah ada di template prompt di Bagian 2
- Choirul hanya perlu baca file ini + `UI_SPEC_MOBILE.md` + `API_CONTRACT.md` + `MOCK_DATA.json`
- Sahal cukup buka folder project di VSCode, agent baca semua docs otomatis

---

# BAGIAN 1 — KHUSUS SAHAL (VSCode Agent)

## Cara Kerja Agent Sahal

Agent di VSCode Sahal bekerja langsung di dalam folder project — bisa baca, tulis, dan edit file secara otomatis. Sahal **tidak perlu attach file manual**. Yang perlu dilakukan:

1. Buka VSCode dengan membuka **root folder `x-voca/`** (bukan subfolder)
2. Pastikan semua file docs ada di folder `x-voca/docs/`
3. Buka panel agent (Claude atau Gemini)
4. Gunakan prompt dari panduan ini

Agent akan otomatis membaca file yang relevan dari folder `docs/` setiap kali diminta.

---

## Prompt Sahal — Cara Pakai

Setiap prompt di bawah ini **langsung bisa di-copy-paste** ke agent VSCode. Tidak perlu tambah apapun — semua instruksi sudah lengkap di dalamnya.

**Satu aturan:** Selalu mulai prompt dengan perintah baca file dulu, baru minta kerjakan sesuatu. Contoh polanya:
```
Baca [file yang relevan], kemudian [kerjakan ini]
```

---

## FASE 1 — Setup Project & Database

### Prompt 1A — Setup Frontend React (Vite)
```
Baca docs/PROJECT_CONTEXT.md, docs/AI_RULES_WEB.md, docs/ARCHITECTURE.md,
dan docs/DESIGN_TOKENS.md.

Setup project React.js dengan Vite di folder web/frontend/:

1. Project sudah dibuat dengan: npm create vite@latest . -- --template react
   Sekarang install dependencies:
   npm install react-router-dom axios firebase @fingerprintjs/fingerprintjs
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p

2. Konfigurasi tailwind.config.js — buat config lengkap sesuai DESIGN_TOKENS.md.
   Semua warna, font, border-radius, dan spacing harus ada di config ini.

3. Update src/index.css dengan:
   @tailwind base; @tailwind components; @tailwind utilities;
   Tambahkan CSS variables dari DESIGN_TOKENS.md

4. Buat struktur folder sesuai ARCHITECTURE.md:
   src/assets/, src/components/common/, src/components/viewer/,
   src/components/admin/, src/pages/viewer/, src/pages/admin/,
   src/hooks/, src/services/, src/utils/, src/context/

5. Buat file .env dengan prefix VITE_:
   VITE_API_URL, VITE_FIREBASE_API_KEY, VITE_FIREBASE_DATABASE_URL,
   VITE_FIREBASE_PROJECT_ID, VITE_FINGERPRINT_KEY

6. Buat src/services/api.js — Axios instance dengan:
   - baseURL dari import.meta.env.VITE_API_URL
   - interceptor: otomatis attach JWT token dari localStorage key 'xvoca_admin_token'
   - interceptor error: handle 401 → hapus token → redirect ke /admin/login

7. Buat src/App.jsx dengan React Router v6:
   - Route publik: / (HomePage), /voting (VotingPage), /content (ContentGuidePage)
   - Route admin: /admin/login (LoginPage)
   - Route admin protected: /admin/dashboard, /admin/schedules,
     /admin/voting, /admin/content (semua pakai PrivateRoute)

8. Buat src/context/AuthContext.jsx untuk state login admin
```

---

### Prompt 1B — Setup Backend Express.js
```
Baca docs/PROJECT_CONTEXT.md, docs/AI_RULES_WEB.md, docs/ARCHITECTURE.md,
dan docs/DATABASE_SCHEMA.md.

Setup project Express.js di folder web/backend/:

1. Install dependencies:
   npm install express sequelize mysql2 bcrypt jsonwebtoken cors dotenv
   npm install firebase-admin axios googleapis
   npm install --save-dev nodemon

2. Buat struktur folder sesuai ARCHITECTURE.md:
   src/config/, src/models/, src/routes/, src/controllers/, src/middleware/

3. Buat src/config/database.js — koneksi Sequelize ke MySQL Railway
   (baca environment variables dari .env)

4. Buat src/config/firebase.js — Firebase Admin SDK setup
   (baca service account dari path di .env)

5. Buat semua Sequelize models sesuai DATABASE_SCHEMA.md:
   User.js, Schedule.js, Game.js, Vote.js, ContentGuide.js, Todo.js, AuditLog.js
   Setiap model harus include associations yang benar.

6. Buat src/middleware/auth.middleware.js — verifikasi JWT token
   Buat src/middleware/errorHandler.js — global error handler
   Buat src/middleware/rateLimit.middleware.js — rate limiting

7. Buat app.js — Express app setup dengan semua middleware dan routes
   Buat server.js — entry point, sync Sequelize, start server

8. Buat file .env dengan semua variable yang dibutuhkan:
   PORT, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS,
   JWT_SECRET, FIREBASE_SERVICE_ACCOUNT_PATH, FIREBASE_DATABASE_URL,
   YOUTUBE_API_KEY, CORS_ORIGIN

9. Update package.json scripts:
   "dev": "nodemon server.js", "start": "node server.js"

Format response API WAJIB konsisten:
{ "success": true/false, "data": {} atau null, "message": "..." }
```

---

### Prompt 1C — Setup Database & Seed Data
```
Baca docs/PROJECT_CONTEXT.md, docs/AI_RULES_WEB.md, dan docs/DATABASE_SCHEMA.md.

Setup database X-VOCA:

1. Buat migration files untuk semua tabel sesuai DATABASE_SCHEMA.md:
   users, schedules, games, votes, content_guides, todos, audit_logs
   Gunakan Sequelize migrations (sequelize-cli).

2. Buat seeder files dengan data awal dari DATABASE_SCHEMA.md:
   - 1 user Creator (Xion Regalia) — password di-hash dengan bcrypt rounds 12
   - 5 sample games dengan status berbeda-beda
   - 3 sample schedules status upcoming
   - 3 sample content_guides
   - 4 sample audit_logs

3. Buat src/utils/firebase.helper.js — helper functions untuk update Firebase:
   - updateNextSchedule(scheduleData) → update node /schedules/next
   - updateVoteCount(gameId, voteCount, percentage) → update /votes/games/{id}
   - updateBroadcastingStatus(isReady) → update /broadcasting/isReady
   - resetVotingPeriod(periodKey) → reset seluruh node /votes

4. Test koneksi database dengan menjalankan:
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
```

---

## FASE 2 — Backend API (Express.js)

### Prompt 2A — Auth Endpoints
```
Baca docs/PROJECT_CONTEXT.md, docs/AI_RULES_WEB.md, docs/API_CONTRACT.md,
dan docs/DATABASE_SCHEMA.md.

Buat semua auth endpoints sesuai API_CONTRACT.md bagian "1. AUTH ENDPOINTS":

1. POST /api/auth/login
   - Cek email di tabel users
   - Verify password dengan bcrypt.compare
   - Generate JWT token (expire 7 hari) dengan jwt.sign
   - Return token + data user (tanpa password_hash)

2. GET /api/auth/me
   - Butuh authMiddleware
   - Return data user dari JWT payload

3. PATCH /api/auth/broadcasting
   - Butuh authMiddleware
   - Update field is_broadcasting di tabel users
   - Update Firebase node /broadcasting/isReady
   - Return status baru

4. PATCH /api/auth/password
   - Butuh authMiddleware
   - Verify current_password dulu
   - Hash new_password dengan bcrypt rounds 12
   - Update di database

Buat: src/routes/auth.routes.js dan src/controllers/auth.controller.js
Format response wajib: { success, data, message }
```

---

### Prompt 2B — Schedule Endpoints
```
Baca docs/PROJECT_CONTEXT.md, docs/AI_RULES_WEB.md, docs/API_CONTRACT.md,
dan docs/DATABASE_SCHEMA.md.

Buat semua schedule endpoints sesuai API_CONTRACT.md bagian "2. SCHEDULE ENDPOINTS":

1. GET /api/schedules — publik, support query: status, limit, page
2. GET /api/schedules/next — publik, ambil 1 jadwal upcoming terdekat dengan countdown_enabled=true
3. POST /api/schedules — butuh auth, setelah simpan → update Firebase /schedules/next
4. PATCH /api/schedules/:id — butuh auth, setelah update → update Firebase /schedules/next
5. DELETE /api/schedules/:id — butuh auth

Setiap response datetime harus include field tambahan scheduled_at_wib
(konversi UTC+7 menggunakan: new Date(date).toLocaleString('id-ID', {timeZone: 'Asia/Jakarta'}))

Setiap write operation yang mengubah jadwal terdekat:
→ panggil firebase.helper.js updateNextSchedule()
→ tambahkan entry ke tabel audit_logs dengan action_type 'schedule_updated'

Buat: src/routes/schedule.routes.js dan src/controllers/schedule.controller.js
```

---

### Prompt 2C — Game & Vote Endpoints
```
Baca docs/PROJECT_CONTEXT.md, docs/AI_RULES_WEB.md, docs/API_CONTRACT.md,
dan docs/DATABASE_SCHEMA.md.

Buat game dan vote endpoints sesuai API_CONTRACT.md bagian "3. GAME ENDPOINTS"
dan "4. VOTE ENDPOINTS":

GAME:
1. GET /api/games — publik, support query: status, period_key, sort, search
   Hitung vote_percentage: (vote_count / total_votes) * 100
   Return juga meta: { period_key, total_votes, total_games }
2. POST /api/games — butuh auth, Creator tambah game manual
3. PATCH /api/games/:id/status — butuh auth, update status game
   Setelah update → update Firebase /votes/games/{id}/status
4. DELETE /api/games/:id — butuh auth

VOTE:
1. POST /api/votes/:gameId — PUBLIK (dengan anti-spam 3 lapis):
   Lapis 1: ambil IP dari req.headers['x-forwarded-for'] || req.ip
   Lapis 2: ambil fingerprint dari req.body.fingerprint
   Lapis 3: cek di tabel votes WHERE game_id=? AND (ip_address=? OR fingerprint=?) AND period_key=?
   Jika sudah ada → return 429
   Jika belum → INSERT votes, UPDATE games SET vote_count = vote_count + 1
   Hitung persentase baru → update Firebase /votes/games/{gameId}
   Tambah audit_log action_type 'vote_in'

2. POST /api/votes/request — publik (rate limit 1x per device per minggu)
   Cek di tabel votes: request dalam 7 hari terakhir dari fingerprint yang sama
   Jika sudah → return 429
   Jika belum → INSERT ke tabel games dengan status 'requested', added_by 'viewer'
   Tambah audit_log action_type 'game_requested'

3. POST /api/votes/reset-period — butuh auth
   Generate period_key baru (format YYYY-MM dari bulan sekarang)
   UPDATE games SET vote_count=0, period_key=[baru] WHERE status != 'done'
   Update Firebase: reset seluruh node /votes dengan period baru
   Tambah audit_log action_type 'period_reset'

Buat: src/routes/game.routes.js, src/routes/vote.routes.js
      src/controllers/game.controller.js, src/controllers/vote.controller.js
```

---

### Prompt 2D — Content, Todo, YouTube, Dashboard Endpoints
```
Baca docs/PROJECT_CONTEXT.md, docs/AI_RULES_WEB.md, docs/API_CONTRACT.md,
dan docs/DATABASE_SCHEMA.md.

Buat endpoint tersisa sesuai API_CONTRACT.md:

CONTENT GUIDE (bagian 5):
1. GET /api/content — publik, query: featured, game_tag, search, page, limit
   Hanya return yang is_visible=true (untuk publik)
   Sort berdasarkan sort_order ASC
2. POST /api/content — butuh auth
3. PATCH /api/content/:id — butuh auth
4. DELETE /api/content/:id — butuh auth, tambah audit_log 'asset_archived'

TODO (bagian 6):
1. GET /api/todos — butuh auth, query: status, priority
   Return juga meta: { total, completed_today, pending_deadlines }
2. POST /api/todos — butuh auth
3. PATCH /api/todos/:id — butuh auth
   Jika status berubah ke 'completed' → set completed_at = NOW()
4. DELETE /api/todos/:id — butuh auth

YOUTUBE (bagian 7):
1. POST /api/youtube/fetch — butuh auth
   Extract video ID dari URL (support format: youtube.com/live/ID, youtu.be/ID, watch?v=ID)
   Call YouTube Data API v3: GET https://www.googleapis.com/youtube/v3/videos
   Params: { id: videoId, part: 'snippet', key: process.env.YOUTUBE_API_KEY }
   Return: { title, thumbnail_url, category, published_at }

DASHBOARD (bagian 8):
1. GET /api/dashboard/stats — butuh auth
   Query semua data yang dibutuhkan dalam satu request:
   - Total votes bulan ini (dari tabel votes WHERE period_key = bulan ini)
   - Perbandingan dengan bulan lalu
   - Count jadwal upcoming
   - Count todos pending + urgent
   - Count content visible
   - Count games dengan status requested (pending review)
   - Period key aktif

AUDIT LOG (bagian 9):
1. GET /api/audit-logs — butuh auth, query: page, limit, action_type
   Return dengan field time_ago (hitung dari created_at vs NOW())

Buat semua routes dan controllers yang dibutuhkan.
```

---

## FASE 3 — Web Viewer (React.js)

### Prompt 3A — HomePage
```
Baca docs/PROJECT_CONTEXT.md, docs/AI_RULES_WEB.md, docs/UI_SPEC_WEB.md,
dan docs/DESIGN_TOKENS.md.

Buat src/pages/viewer/HomePage.jsx

Referensi visual: UI_SPEC_WEB.md — HALAMAN 1 (Section 1.1, 1.2, 1.3)

Konten halaman terdiri dari 3 section:

SECTION 1 — Hero (UI_SPEC_WEB.md Section 1.1):
- Layout 2 kolom: teks kiri + karakter kanan
- Heading gradient "XION REGALIA"
- 2 CTA button
- Countdown card yang fetch data dari GET /api/schedules/next
  Timer real-time (update setiap detik) menggunakan custom hook src/hooks/useCountdown.js

SECTION 2 — About Xion (UI_SPEC_WEB.md Section 1.2):
- Profile card horizontal: gambar + info + sosmed buttons + stats
- Equipment card: 3 kolom specs (data statis, hardcode sesuai mockup)

SECTION 3 — Upcoming Broadcast (UI_SPEC_WEB.md Section 1.3):
- Carousel horizontal: fetch dari GET /api/schedules?status=upcoming&limit=3
- Card LIVE, UPCOMING dengan styling berbeda

Buat juga:
- src/hooks/useCountdown.js — custom hook, hitung sisa waktu dari datetime target
- src/services/scheduleService.js — fungsi getSchedules() dan getNextSchedule()
- src/components/viewer/CountdownCard.jsx — komponen countdown reusable
- src/components/viewer/ScheduleCard.jsx — komponen card jadwal

Gunakan Firebase listener untuk update countdown real-time:
import { ref, onValue } from 'firebase/database'
Listen ke node /schedules/next — update state saat data berubah
```

---

### Prompt 3B — VotingPage
```
Baca docs/PROJECT_CONTEXT.md, docs/AI_RULES_WEB.md, docs/UI_SPEC_WEB.md,
dan docs/DESIGN_TOKENS.md.

Buat src/pages/viewer/VotingPage.jsx

Referensi visual: UI_SPEC_WEB.md — HALAMAN 2 (semua section)

Fitur yang harus ada:

1. Header halaman dengan info periode (fetch dari GET /api/games meta.period_key)

2. Filter tabs: Semua | Requested | Accepted | Playing | Done
   Search input + dropdown sort

3. Grid game cards (3 kolom desktop, 2 tablet, 1 mobile)
   Setiap card styling berbeda sesuai status (PLAYING=border gold, ACCEPTED=border ungu, dll)
   Lihat UI_SPEC_WEB.md bagian "Grid Game Cards" untuk detail setiap card

4. Vote button dengan anti-spam 3 lapis:
   - Cek localStorage: key "xvoca_voted_{gameId}_{periodKey}"
   - Generate fingerprint dengan FingerprintJS
   - POST /api/votes/:gameId dengan body { fingerprint }
   - Jika 200: simpan localStorage, update UI tombol jadi "Sudah Memberi Vote"
   - Jika 429: tampilkan toast error "Kamu sudah vote game ini"

5. Persentase vote real-time via Firebase:
   Listen ke node /votes/games — update persentase semua card saat ada perubahan
   Tanpa perlu refresh halaman

6. Form request game baru (di bawah grid):
   POST /api/votes/request dengan body { title, genre, fingerprint }
   Tampilkan modal konfirmasi setelah berhasil

Buat juga:
- src/services/gameService.js — getGames(), voteGame(), requestGame()
- src/utils/fingerprint.js — setup dan export FingerprintJS
- src/components/viewer/GameCard.jsx — card game reusable
- src/components/common/Toast.jsx — notifikasi toast
- src/components/common/Modal.jsx — modal konfirmasi
```

---

### Prompt 3C — ContentGuidePage
```
Baca docs/PROJECT_CONTEXT.md, docs/AI_RULES_WEB.md, docs/UI_SPEC_WEB.md,
dan docs/DESIGN_TOKENS.md.

Buat src/pages/viewer/ContentGuidePage.jsx

Referensi visual: UI_SPEC_WEB.md — HALAMAN 3 (semua section)

Fitur yang harus ada:

1. Header dengan search input + dropdown sort "Terbaru"

2. Featured card (full width) — ambil dari GET /api/content?featured=true&limit=1
   Layout 2 kolom: thumbnail kiri + info kanan
   Tombol "Tonton di YouTube" buka link di tab baru

3. Filter tabs kategori — generate dari game_tag unik di data konten
   Tab "Semua(42)" aktif default

4. Grid 4 kolom (desktop), 2 (tablet), 1 (mobile)
   Fetch dari GET /api/content?page=1&limit=8
   Setiap card: thumbnail + badge jumlah video + genre + judul + stats + link YouTube

5. Tombol "Load More" — fetch page berikutnya, append ke list yang sudah ada
   Tampilkan total: "Menampilkan X dari Y arsip"

6. Loading state: skeleton/shimmer untuk grid saat fetch pertama

Buat juga:
- src/services/contentService.js — getContent(), getContentByTag()
- src/components/viewer/ContentCard.jsx — card konten reusable
- src/components/viewer/FeaturedCard.jsx — featured card
```

---

## FASE 4 — Web Admin (React.js)

### Prompt 4A — Layout Admin + Login
```
Baca docs/PROJECT_CONTEXT.md, docs/AI_RULES_WEB.md, docs/UI_SPEC_WEB.md,
dan docs/DESIGN_TOKENS.md.

Buat komponen admin:

1. src/pages/admin/LoginPage.jsx
   Referensi visual: UI_SPEC_WEB.md — HALAMAN 4
   - Form email + password (toggle show/hide)
   - POST /api/auth/login
   - Simpan token ke localStorage key 'xvoca_admin_token'
   - Redirect ke /admin/dashboard setelah berhasil
   - Error message jika gagal

2. src/components/admin/AdminLayout.jsx
   Referensi visual: UI_SPEC_WEB.md — HALAMAN 5 bagian "Layout Global Admin"
   - Sidebar kiri 200px (fixed) dengan logo, profile, menu items, bottom menu
   - Topbar 56px (fixed) dengan breadcrumb, search, avatar
   - Konten area dengan margin yang tepat
   - Menu aktif highlighted sesuai route saat ini

3. src/context/AuthContext.jsx
   - State: user, token, isAuthenticated
   - Method: login(email, password), logout()
   - Persist token di localStorage

4. src/components/admin/PrivateRoute.jsx
   - Cek token di localStorage
   - Jika tidak ada → redirect ke /admin/login
   - Jika ada → render children
```

---

### Prompt 4B — Dashboard Admin
```
Baca docs/PROJECT_CONTEXT.md, docs/AI_RULES_WEB.md, docs/UI_SPEC_WEB.md,
dan docs/DESIGN_TOKENS.md.

Buat src/pages/admin/DashboardPage.jsx

Referensi visual: UI_SPEC_WEB.md — HALAMAN 5 (bagian Konten Dashboard)

Fitur yang harus ada:

1. Greeting + Broadcasting toggle
   GET /api/auth/me untuk nama user
   PATCH /api/auth/broadcasting untuk toggle
   Update Firebase /broadcasting/isReady setelah toggle

2. 4 Stat cards — fetch dari GET /api/dashboard/stats
   Total Vote, Jadwal Upcoming, Tugas Pending, Content Aktif
   Setiap card dengan ikon, angka besar, label, dan badge info

3. 3 Action cards (Tambah Jadwal, Lihat Voting, Tambah Content)
   Klik masing-masing → navigate ke halaman yang sesuai

4. Audit Log table — fetch dari GET /api/audit-logs?limit=5
   Kolom: Waktu (time_ago) | Aksi (badge berwarna) | Detail (2 baris)
   Tombol Refresh → fetch ulang
   Pagination: tampilkan "1/36" dengan tombol Sebelumnya & Berikutnya

5. Rig Calibration widget (data statis kosmetik):
   Tampilkan: nama rig, versi, FPS, 3 metric bars (Audio, Tracking, VRAM)
   Nilai semua statis, tidak perlu fetch dari mana-mana
   Broadcasting toggle di widget ini sync dengan toggle di header

6. Poll Live Monitor (data statis kosmetik):
   Grafik garis sederhana menggunakan SVG atau library recharts
   Nilai statis, tidak perlu real-time

Buat juga:
- src/services/dashboardService.js — getStats(), getAuditLogs()
```

---

### Prompt 4C — Halaman Jadwal Admin
```
Baca docs/PROJECT_CONTEXT.md, docs/AI_RULES_WEB.md, docs/UI_SPEC_WEB.md,
dan docs/DESIGN_TOKENS.md.

Buat src/pages/admin/SchedulePage.jsx

Referensi visual: UI_SPEC_WEB.md — HALAMAN 6 (semua section)

Fitur yang harus ada:

1. Header + 4 summary cards (data dari GET /api/dashboard/stats)

2. Tabel jadwal — fetch GET /api/schedules?status=all
   Filter tabs: SEMUA | LIVE | UPCOMING | ARSIP
   Kolom: NO | JUDUL STREAM | KATEGORI | TANGGAL & WAKTU | STATUS | AKSI
   Row LIVE: background berbeda, border kiri merah
   Aksi: ikon preview + edit + hapus

3. Form panel kanan (slide-in dari kanan):
   Muncul saat klik "+ Tambah Jadwal" atau ikon edit
   Field: Judul, Kategori (dropdown), Tanggal, Waktu, Deskripsi
   Toggle: Hitung Mundur Fansite
   YouTube auto-fill: input URL + tombol "Fetch" → POST /api/youtube/fetch
   Saat fetch berhasil → isi otomatis field Judul dari response
   Simpan: POST /api/schedules (baru) atau PATCH /api/schedules/:id (edit)
   Setelah simpan → tutup panel, refresh tabel

4. Konfirmasi hapus: modal dialog sebelum DELETE /api/schedules/:id

Buat juga:
- src/components/admin/ScheduleFormPanel.jsx — form panel slide-in
```

---

### Prompt 4D — Moderasi Voting Admin
```
Baca docs/PROJECT_CONTEXT.md, docs/AI_RULES_WEB.md, docs/UI_SPEC_WEB.md,
dan docs/DESIGN_TOKENS.md.

Buat src/pages/admin/VotingModerationPage.jsx

Referensi visual: UI_SPEC_WEB.md — HALAMAN 7 (semua section)

Fitur yang harus ada:

1. Header + 4 summary cards (total usulan, suara terkumpul, sedang dimainkan, menunggu review)
   Data dari GET /api/dashboard/stats

2. Tabel moderasi — fetch GET /api/games?status=all
   Filter tabs: SEMUA | REQUESTED | ACCEPTED | PLAYING | DONE
   Search: cari berdasarkan judul
   Kolom: RANK | COVER | JUDUL GAME | JUMLAH VOTE | STATUS | DITAMBAH OLEH | AKSI MODERASI
   Progress bar tipis di bawah vote count (sesuai persentase)
   Aksi per row: Accept | Playing | Done | Hapus
   Tombol yang tersedia berubah sesuai status saat ini:
   - Requested: tampilkan Accept (disabled: Playing, Done)
   - Accepted: tampilkan Playing (disabled: Accept, Done)
   - Playing: tampilkan Done (disabled: Accept, Playing)
   - Done: semua disabled

3. Aksi moderasi:
   Accept: PATCH /api/games/:id/status { status: 'accepted' }
   Playing: PATCH /api/games/:id/status { status: 'playing' }
   Done: PATCH /api/games/:id/status { status: 'done' }
   Hapus: konfirmasi modal → DELETE /api/games/:id
   Setelah setiap aksi → refresh tabel

4. Tombol "Reset Periode Voting":
   Modal konfirmasi dulu sebelum eksekusi
   POST /api/votes/reset-period
   Setelah berhasil → refresh tabel + tampilkan period_key baru

5. Info periode (banner bawah): tampilkan period_key aktif, total suara, sisa hari
   Tombol "Ekspor Data" → download tabel sebagai CSV (generate di frontend)
```

---

### Prompt 4E — Manajemen Content Guide Admin
```
Baca docs/PROJECT_CONTEXT.md, docs/AI_RULES_WEB.md, docs/UI_SPEC_WEB.md,
dan docs/DESIGN_TOKENS.md.

Buat src/pages/admin/ContentManagementPage.jsx

Referensi visual: UI_SPEC_WEB.md — HALAMAN 8 (semua section)

Fitur yang harus ada:

1. Header + search + dropdown + tombol "+ Tambah Konten"

2. 4 stat cards: Total Konten | Publik Visible | Hidden/Draft | Featured Series
   Data dari GET /api/content (admin version — semua konten termasuk hidden)
   Catatan: buat endpoint GET /api/content?admin=true yang return semua konten
   termasuk is_visible=false (hanya untuk admin yang sudah auth)

3. Grid konten 3 kolom:
   Badge VISIBLE/HIDDEN/FEATURED di setiap card
   Aksi per card: edit | toggle visible | toggle featured | hapus
   Toggle visible: PATCH /api/content/:id { is_visible: !current }
   Toggle featured: PATCH /api/content/:id { is_featured: !current }

4. Form panel kanan (slide-in):
   Field: Judul (maks 80 char + counter), Game Tag, YouTube URL
   Thumbnail URL + preview otomatis saat URL diisi (gunakan img onLoad)
   Toggle Featured Banner + Toggle Visible
   Stepper sort order (tombol - dan +)
   Simpan: POST /api/content (baru) atau PATCH /api/content/:id (edit)

5. Pagination: "Halaman 1 dari 3" + tombol Sebelumnya/Selanjutnya

Buat juga:
- src/components/admin/ContentFormPanel.jsx — form panel slide-in
- src/components/admin/ContentCard.jsx — card konten dengan badge dan aksi
```

---

## FASE 5 — Firebase Real-time & Integrasi

### Prompt 5A — Setup Firebase di Frontend
```
Baca docs/PROJECT_CONTEXT.md, docs/AI_RULES_WEB.md, dan docs/ARCHITECTURE.md.

Setup Firebase Realtime Database di frontend React:

1. Buat src/utils/firebase.js:
   - Initialize Firebase dengan config dari import.meta.env.VITE_FIREBASE_*
   - Export: app, database (getDatabase)

2. Buat src/hooks/useFirebase.js dengan custom hooks:
   - useNextSchedule() → listen /schedules/next, return { schedule, loading }
   - useVoteCounts() → listen /votes/games, return { voteCounts, loading }
   - useBroadcastingStatus() → listen /broadcasting/isReady, return { isLive }

3. Update VotingPage.jsx:
   Ganti fetch vote counts dengan useVoteCounts() hook
   Persentase di semua card update real-time saat Firebase berubah
   Tidak perlu refresh halaman

4. Update HomePage.jsx:
   Ganti fetch countdown dengan useNextSchedule() hook
   Countdown otomatis update saat Creator ubah jadwal

5. Update DashboardPage.jsx (admin):
   Gunakan useBroadcastingStatus() untuk sync status broadcasting
   Saat toggle berubah di mobile → langsung update di web admin juga
```

---

### Prompt 5B — Testing & Bug Fix
```
Baca docs/PROJECT_CONTEXT.md, docs/AI_RULES_WEB.md, docs/API_CONTRACT.md,
dan docs/UI_SPEC_WEB.md.

Bantu saya testing semua alur penting X-VOCA:

1. Test alur voting end-to-end:
   - Buka VotingPage → klik vote → cek LocalStorage tersimpan
   - Refresh halaman → tombol harus tetap "Sudah Memberi Vote"
   - Cek di database tabel votes → harus ada 1 row baru
   - Cek Firebase /votes/games/{id} → vote_count harus bertambah
   - Buka tab browser lain (incognito) → seharusnya bisa vote lagi

2. Test alur jadwal:
   - Login admin → tambah jadwal baru
   - Cek Firebase /schedules/next → harus terupdate
   - Buka HomePage viewer → countdown harus menampilkan jadwal baru

3. Test anti-spam:
   - Vote 1x → berhasil
   - Vote lagi game yang sama → harus dapat error 429
   - Coba dari browser berbeda (fingerprint berbeda, IP sama) → seharusnya bisa vote

4. Test YouTube auto-fill:
   - Input URL YouTube yang valid
   - Klik Fetch → form harus terisi otomatis
   - Input URL tidak valid → harus ada pesan error

Untuk setiap bug yang ditemukan, perbaiki langsung di file yang bermasalah.
Baca file yang relevan sebelum memperbaiki bug.
```

---

## Prompt Utilitas — Bisa Dipakai Kapanpun

### Sesi Token Habis, Lanjut Sesi Baru
```
Baca docs/PROJECT_CONTEXT.md dan docs/AI_RULES_WEB.md.
Baca juga file yang sedang dikerjakan: [path file]

Sesi sebelumnya terputus. Saya sedang mengerjakan [nama fitur/file].
Kode terakhir yang sudah dibuat ada di file di atas.
Lanjutkan dari bagian: [jelaskan yang belum selesai]
```

---

### Ada Error / Bug
```
Baca docs/PROJECT_CONTEXT.md dan docs/AI_RULES_WEB.md.
Baca juga file yang bermasalah: [path file]

Error yang muncul:
[paste error message lengkap]

Perbaiki error ini dan jelaskan penyebabnya.
```

---

### Cek Kesesuaian UI dengan Mockup
```
Baca docs/UI_SPEC_WEB.md bagian [nama halaman].
Baca juga file: [path file JSX]

Periksa apakah kode ini sudah sesuai spesifikasi visual di UI_SPEC_WEB.md.
Jika ada yang tidak sesuai, perbaiki langsung.
```

---

### Refactor / Rapikan Kode
```
Baca docs/AI_RULES_WEB.md dan file berikut: [path file]

Rapikan kode ini sesuai aturan di AI_RULES_WEB.md:
- Pastikan semua API call melalui services/
- Pastikan tidak ada hardcode warna hex
- Pastikan struktur komponen sesuai ARCHITECTURE.md
- Pastikan format response sudah konsisten { success, data, message }
```

---

# BAGIAN 2 — KHUSUS CHOIRUL (Gemini Web Free Tier)

## Cara Kerja Gemini Choirul

Gemini web free tier tidak bisa baca folder project dan tidak bisa upload file. Choirul hanya bisa **copy-paste teks** ke chat Gemini.

**Alurnya setiap sesi:**
1. Buka chat Gemini baru di gemini.google.com
2. Copy-paste **Template Wajib** (ada di bawah) — SELALU di setiap sesi baru
3. Copy-paste bagian **Spesifikasi Screen** dari `UI_SPEC_MOBILE.md` yang relevan
4. Copy-paste **Prompt Screen** yang sesuai dari panduan ini
5. Mulai kerjakan

---

## Template Wajib — Copy-Paste di Setiap Sesi Gemini Baru

**Ini WAJIB selalu jadi pesan pertama di setiap sesi baru:**

```
Kamu adalah AI assistant yang membantu saya mengembangkan aplikasi Flutter X-VOCA.
X-VOCA adalah dashboard mobile privat untuk VTuber bernama Xion Regalia.
Aplikasi ini hanya digunakan oleh Creator (Xion Regalia) sendiri — bukan untuk publik.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STACK (TIDAK BOLEH DIGANTI)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Framework       : Flutter + Dart
State mgmt      : Riverpod (flutter_riverpod ^2.4.0)
HTTP client     : Dio (^5.3.0)
Token storage   : flutter_secure_storage (key: 'xvoca_token')
Real-time       : Firebase Realtime Database
Font utama      : Google Fonts — Space Grotesk
Font teknis     : Google Fonts — Space Mono (untuk badge, label status, angka teknis)
Ikon            : Lucide Icons (package lucide_icons)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WARNA (GUNAKAN AppColors.xxx — JANGAN HARDCODE HEX)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AppColors.bgBase        = Color(0xFF0D0B1A)  ← background semua screen
AppColors.bgSurface     = Color(0xFF1A1730)  ← card, container, bottom sheet
AppColors.bgInput       = Color(0xFF252240)  ← input field, badge background
AppColors.bgNav         = Color(0xFF130F2A)  ← bottom navigation bar
AppColors.accentCyan    = Color(0xFF2DFFC2)  ← aksen utama, CTA, tab aktif, toggle
AppColors.accentPurple  = Color(0xFF9B6DFF)  ← aksen kedua, gradient, ungu
AppColors.accentGold    = Color(0xFFFFD700)  ← gold, playing status, urgent
AppColors.accentRed     = Color(0xFFFF4444)  ← merah, live, hapus, error
AppColors.textPrimary   = Color(0xFFEEEAFF)  ← teks utama semua screen
AppColors.textSecondary = Color(0xFF9B97C0)  ← sub-teks, label, placeholder
AppColors.textMuted     = Color(0xFF5C587A)  ← teks sangat redup, tab tidak aktif
AppColors.borderSubtle  = Color(0xFF2A2550)  ← border card, divider

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ATURAN WAJIB CODING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. WARNA: Selalu AppColors.xxx — tidak boleh Color(0xFF...) langsung di widget
2. FONT: GoogleFonts.spaceGrotesk() untuk teks biasa
         GoogleFonts.spaceMonoTextTheme() untuk badge/label teknis
3. STATE: Riverpod — AsyncNotifierProvider untuk data dari API
          StateProvider untuk state lokal sederhana (toggle, filter tab)
4. API: Semua HTTP call melalui services/ menggunakan Dio
        Dio sudah dikonfigurasi dengan interceptor JWT otomatis
5. TOKEN: Baca/simpan dari FlutterSecureStorage key 'xvoca_token'
6. DATETIME: Semua dari API dalam UTC → selalu panggil .toLocal() sebelum display
7. FORMAT API: { "success": bool, "data": {}, "message": "" }
8. LOADING: Pakai package shimmer untuk loading skeleton
9. EMPTY: Buat UI empty state khusus — jangan biarkan layar kosong
10. ERROR 401: Hapus token dari storage → navigate ke LoginScreen
11. SAFE AREA: Selalu pakai SafeArea di setiap Scaffold
12. PADDING: Konten utama selalu padding horizontal 16px

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRUKTUR FOLDER (WAJIB IKUTI)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
lib/
├── core/
│   ├── config/env.dart          ← API URL
│   ├── theme/app_theme.dart     ← AppColors, AppTheme
│   └── utils/date_formatter.dart
├── data/
│   ├── models/                  ← Data class dari API response
│   └── services/                ← Dio API calls
│       └── api_service.dart     ← Dio instance + interceptor
├── presentation/
│   ├── providers/               ← Riverpod providers
│   ├── screens/                 ← Halaman-halaman
│   └── widgets/                 ← Widget reusable
└── main.dart

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POLA KODE WAJIB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Model dari API response (selalu buat fromJson factory):
class ScheduleModel {
  factory ScheduleModel.fromJson(Map<String, dynamic> json) => ScheduleModel(
    scheduledAt: DateTime.parse(json['scheduled_at']).toLocal(),
    ...
  );
}

// Provider Riverpod (AsyncNotifierProvider untuk data API):
@riverpod
class ScheduleNotifier extends _$ScheduleNotifier {
  @override
  Future<List<ScheduleModel>> build() async =>
    ref.read(scheduleServiceProvider).getSchedules();

  Future<void> refresh() async => ref.invalidateSelf();
}

// Service Dio (semua API call di sini):
class ScheduleService {
  final Dio _dio;
  ScheduleService(this._dio);

  Future<List<ScheduleModel>> getSchedules() async {
    final response = await _dio.get('/schedules');
    if (response.data['success']) {
      return (response.data['data'] as List)
        .map((e) => ScheduleModel.fromJson(e)).toList();
    }
    throw Exception(response.data['message']);
  }
}

// Widget menggunakan provider:
class ScheduleScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final schedulesAsync = ref.watch(scheduleNotifierProvider);
    return schedulesAsync.when(
      loading: () => ShimmerLoading(),
      error: (e, _) => ErrorWidget(e.toString()),
      data: (schedules) => ScheduleList(schedules: schedules),
    );
  }
}
```

---

Setelah paste template di atas, **lanjutkan dengan salah satu prompt screen di bawah ini:**

---

## Prompt Screen Choirul — Per Screen

### Prompt Setup Awal (Fase 1)
```
[PASTE TEMPLATE WAJIB DI ATAS DULU]

Bantu saya setup project Flutter X-VOCA dari awal.

Buat file-file berikut:

1. pubspec.yaml — dengan semua dependencies:
   flutter_riverpod, riverpod_annotation, dio, firebase_core, firebase_database,
   flutter_secure_storage, google_fonts, lucide_icons, intl,
   cached_network_image, shimmer, flutter_local_notifications

2. lib/core/theme/app_theme.dart:
   class AppColors dengan semua warna di atas sebagai static const Color
   class AppTheme dengan static ThemeData darkTheme menggunakan:
   - scaffoldBackgroundColor: AppColors.bgBase
   - Space Grotesk sebagai font default (GoogleFonts.spaceGroteskTextTheme)
   - BottomNavigationBar background: AppColors.bgNav

3. lib/core/config/env.dart:
   class Env dengan static const apiBaseUrl (isi: 'http://10.0.2.2:3001/api' untuk emulator)
   Catatan: 10.0.2.2 adalah IP localhost dari emulator Android

4. lib/data/services/api_service.dart:
   Buat Dio instance dengan:
   - baseUrl dari Env.apiBaseUrl
   - connectTimeout dan receiveTimeout 10 detik
   - Interceptor onRequest: baca token dari FlutterSecureStorage, tambahkan ke header Authorization
   - Interceptor onError: jika 401 → hapus token → navigate ke LoginScreen

5. lib/main.dart:
   - async main() dengan WidgetsFlutterBinding.ensureInitialized()
   - await Firebase.initializeApp()
   - runApp(ProviderScope(child: XVocaApp()))
   - MaterialApp dengan AppTheme.darkTheme dan home: LoginScreen()
```

---

### Prompt Login Screen (Fase 2)

```
[PASTE TEMPLATE WAJIB DI ATAS DULU]

[PASTE ISI "SCREEN 1 — LOGIN" DARI UI_SPEC_MOBILE.MD DI SINI]

Buat file-file berikut untuk Login Screen:

1. lib/data/models/user_model.dart — dari struktur response /api/auth/login:
   id, name, email, role, avatarUrl, rigName, rigVersion, isBroadcasting

2. lib/data/services/auth_service.dart:
   - login(email, password) → POST /api/auth/login
     Jika success: simpan token ke FlutterSecureStorage key 'xvoca_token'
     Return UserModel
   - logout() → hapus token dari storage
   - getMe() → GET /api/auth/me

3. lib/presentation/providers/auth_provider.dart:
   - authProvider: StateNotifierProvider menyimpan UserModel? (null = belum login)
   - isAuthenticatedProvider: bool dari authProvider != null

4. lib/presentation/screens/login_screen.dart:
   Ikuti spesifikasi visual di atas persis.
   - Form email + password dengan validasi
   - Toggle show/hide password (ikon mata Lucide)
   - Checkbox "Keep session active" (simpan di FlutterSecureStorage)
   - Tombol gradient "Sign In to Dashboard →" (LinearGradient cyan ke purple)
   - Tombol biometrik (tampilan saja, tidak perlu implementasi biometrik)
   - Loading indicator saat proses login
   - SnackBar error jika login gagal
   - Navigate ke DashboardScreen jika berhasil
```

---

### Prompt Dashboard Screen (Fase 3)

```
[PASTE TEMPLATE WAJIB DI ATAS DULU]

[PASTE ISI "SCREEN 2 — DASHBOARD" DARI UI_SPEC_MOBILE.MD DI SINI]

DATA DUMMY (gunakan ini dulu sampai backend siap):
- Countdown target: DateTime.now().add(Duration(hours: 4, minutes: 12, seconds: 4))
- Stream title: "Cyberpunk 2077 Night"
- Stats: votes=1420, topGame="GTA V", pendingRequests=5, pendingTasks=3
- Tasks: [
    {title: "Check OBS Audio Filters", sub: "Virtual DSP gain compensation (-3.2db", priority: "urgent"},
    {title: "Render YouTube Shorts", sub: "Clip 1080×1920 60FPS high-moments", priority: "medium"},
  ]

API (ganti data dummy setelah backend siap):
- Countdown: GET /api/schedules/next → scheduled_at
- Stats: GET /api/dashboard/stats
- Tasks: GET /api/todos?limit=3&sort=priority

Buat file-file berikut:

1. lib/presentation/widgets/countdown_widget.dart:
   StatefulWidget dengan Timer.periodic(Duration(seconds: 1), ...)
   Hitung sisa waktu dari DateTime target
   Tampilkan jam:menit:detik dalam format "04h : 12m : 04s"
   Font Space Mono, warna accentCyan, font size 20px

2. lib/presentation/widgets/stat_card.dart:
   Reusable card dengan: ikon, badge (optional), angka besar, label
   Background bgSurface, border-radius 14px

3. lib/presentation/providers/dashboard_provider.dart:
   dashboardStatsProvider: AsyncNotifierProvider untuk GET /api/dashboard/stats
   nextScheduleProvider: AsyncNotifierProvider untuk GET /api/schedules/next

4. lib/presentation/screens/dashboard_screen.dart:
   Ikuti spesifikasi visual di atas persis.
   - AppBar dengan nama app + badge + bell + avatar
   - Broadcasting toggle (simpan state lokal dulu, nanti connect ke API)
   - CountdownWidget
   - Grid 2x2 StatCard
   - Internal Tasks list 3 item
   - BottomNavigationBar 5 tab
```

---

### Prompt Schedule Screen (Fase 4)

```
[PASTE TEMPLATE WAJIB DI ATAS DULU]

[PASTE ISI "SCREEN 3 — STREAM SCHEDULE" DARI UI_SPEC_MOBILE.MD DI SINI]
[PASTE ISI "SCREEN 4 — ADD SCHEDULE (BOTTOM SHEET)" DARI UI_SPEC_MOBILE.MD DI SINI]

DATA DUMMY (dari MOCK_DATA.json bagian "schedules"):
[PASTE ISI "schedules" DARI MOCK_DATA.JSON DI SINI]

API (ganti setelah backend siap):
- GET /api/schedules?status=upcoming → list jadwal
- GET /api/schedules/next → jadwal terdekat
- POST /api/schedules → tambah jadwal
- PATCH /api/schedules/:id → edit jadwal
- DELETE /api/schedules/:id → hapus jadwal
- POST /api/youtube/fetch → auto-fill dari YouTube URL
  Body: { "url": "..." }
  Response: { "data": { "title": "...", "thumbnail_url": "...", "category": "..." } }

Buat file-file berikut:

1. lib/data/models/schedule_model.dart — dari struktur response API
2. lib/data/services/schedule_service.dart — semua method CRUD + youtube fetch
3. lib/presentation/providers/schedule_provider.dart
4. lib/presentation/screens/schedule_screen.dart — ikuti spesifikasi visual
5. lib/presentation/widgets/add_schedule_bottom_sheet.dart — ikuti spesifikasi visual
   Fitur YouTube auto-fill: saat tombol Fetch diklik → call scheduleService.fetchYoutube(url)
   Jika berhasil → isi otomatis field Stream Title dari response.title
```

---

### Prompt Vote Analytics Screen (Fase 5)

```
[PASTE TEMPLATE WAJIB DI ATAS DULU]

[PASTE ISI "SCREEN 5 — VOTE ANALYTICS" DARI UI_SPEC_MOBILE.MD DI SINI]

DATA DUMMY (dari MOCK_DATA.json bagian "games"):
[PASTE ISI "games" DARI MOCK_DATA.JSON DI SINI]

API (ganti setelah backend siap):
- GET /api/games → list semua game
- PATCH /api/games/:id/status → { "status": "accepted"/"playing"/"done" }
- DELETE /api/games/:id → hapus game
- POST /api/votes/reset-period → reset periode

Buat file-file berikut:

1. lib/data/models/game_model.dart
2. lib/data/services/game_service.dart
3. lib/presentation/providers/game_provider.dart
4. lib/presentation/screens/vote_analytics_screen.dart — ikuti spesifikasi visual
   Fitur penting:
   - Tombol Approve/Reject: muncul hanya untuk game status 'requested'
   - Tombol Set Playing: muncul untuk status 'accepted'
   - Tombol Mark Done: muncul untuk status 'playing'
   - Reset Period: tampilkan AlertDialog konfirmasi sebelum eksekusi
   - Setelah setiap aksi → refresh list game
```

---

### Prompt To-Do List Screen (Fase 6)

```
[PASTE TEMPLATE WAJIB DI ATAS DULU]

[PASTE ISI "SCREEN 6 — TO-DO LIST" DARI UI_SPEC_MOBILE.MD DI SINI]

DATA DUMMY (dari MOCK_DATA.json bagian "todos"):
[PASTE ISI "todos" DARI MOCK_DATA.JSON DI SINI]

API (ganti setelah backend siap):
- GET /api/todos → list semua todo
- POST /api/todos → tambah todo baru
- PATCH /api/todos/:id → update (termasuk mark complete: { "status": "completed" })
- DELETE /api/todos/:id → hapus todo

Buat file-file berikut:

1. lib/data/models/todo_model.dart
2. lib/data/services/todo_service.dart
3. lib/presentation/providers/todo_provider.dart
4. lib/presentation/screens/todo_screen.dart — ikuti spesifikasi visual
   Fitur penting:
   - Progress bar harian: completed/total
   - Swipe kanan (Dismissible): mark as completed → background hijau
   - Swipe kiri (Dismissible): hapus → background merah → konfirmasi dulu
   - Strikethrough untuk task completed
   - Deadline merah jika sudah lewat (deadline.isBefore(DateTime.now()))
5. lib/presentation/widgets/add_task_bottom_sheet.dart
   Field: judul, dropdown priority, date+time picker, tags input
```

---

### Prompt Settings Screen (Fase 7)

```
[PASTE TEMPLATE WAJIB DI ATAS DULU]

[PASTE ISI "SCREEN 7 — SETTINGS & PROFILE" DARI UI_SPEC_MOBILE.MD DI SINI]

API:
- GET /api/auth/me → data profil
- PATCH /api/auth/broadcasting → { "is_broadcasting": true/false }
- PATCH /api/auth/password → { "current_password": "...", "new_password": "..." }

Buat lib/presentation/screens/settings_screen.dart — ikuti spesifikasi visual.

Fitur penting:
- Profile card dengan avatar (CircleAvatar), nama, email, badge role
- Row joined date + channel status
- 3 row integrasi: YouTube Sync (badge Active), Firebase Sync (badge Synced),
  Change Password (navigasi ke halaman ganti password)
- 2 toggle preferences: Auto-Broadcast (call PATCH /api/auth/broadcasting)
  dan Pending Alerts (simpan lokal di FlutterSecureStorage key 'notif_alerts')
- Build version row (data statis: "v1.0.4 (Prod)")
- Tombol Sign Out: hapus token dari FlutterSecureStorage →
  navigate ke LoginScreen dan hapus semua route sebelumnya (pushAndRemoveUntil)
```

---

### Prompt Firebase Real-time (Fase 8)

```
[PASTE TEMPLATE WAJIB DI ATAS DULU]

Setup Firebase Realtime Database listener di Flutter:

1. lib/data/services/firebase_service.dart:
   - listenNextSchedule(callback) → listen /schedules/next
   - listenBroadcastingStatus(callback) → listen /broadcasting/isReady

2. Update DashboardScreen:
   Ganti countdown dari data dummy ke Firebase listener /schedules/next
   Di initState: FirebaseService().listenNextSchedule((data) { setState(...) })
   Timer countdown tetap jalan setiap detik dari target datetime yang diupdate Firebase

3. Update DashboardScreen broadcasting toggle:
   Listen ke /broadcasting/isReady — sync dengan toggle yang di-set dari Web Admin
   Saat toggle di-tap: call PATCH /api/auth/broadcasting + update Firebase

4. Pastikan dispose listener saat screen di-dispose:
   Simpan StreamSubscription, panggil subscription.cancel() di dispose()
```

---

### Prompt Ganti Mock ke API Asli

```
[PASTE TEMPLATE WAJIB DI ATAS DULU]

Saya ingin mengganti semua data dummy ke API asli.
URL backend: [tanya Sahal — Railway URL atau IP lokal]

Update lib/core/config/env.dart:
- apiBaseUrl = '[URL dari Sahal]'

Update semua service files — pastikan tidak ada hardcode data dummy:
- auth_service.dart
- schedule_service.dart
- game_service.dart
- todo_service.dart

Untuk setiap service, pastikan:
- Method sudah benar-benar call endpoint sesuai API_CONTRACT.md
- Parse response dengan format: { "success": bool, "data": {}, "message": "" }
- Jika success false → throw Exception(response.data['message'])
- Semua DateTime parse dari string → .toLocal()
```

---

### Prompt Sesi Baru Setelah Terputus

```
[PASTE TEMPLATE WAJIB DI ATAS DULU]

Sesi sebelumnya terputus. Saya sedang mengerjakan: [nama screen/file]

Kode yang sudah ada sejauh ini:
[paste kode terakhir]

Lanjutkan dari bagian: [jelaskan yang belum selesai]
```

---

### Prompt Ada Error / Bug

```
[PASTE TEMPLATE WAJIB DI ATAS DULU]

Saya mendapat error ini saat menjalankan Flutter:
[paste error message dari terminal atau debug console]

Kode yang bermasalah (file: [nama file]):
[paste kode]

Tolong perbaiki dan jelaskan penyebabnya.
```

---

## Referensi Cepat Choirul

| Choirul butuh... | Buka file... | Ambil bagian... |
|---|---|---|
| Spesifikasi visual screen | `UI_SPEC_MOBILE.md` | "SCREEN X — [nama]" |
| Format request/response endpoint | `API_CONTRACT.md` | Endpoint yang relevan |
| Data dummy sementara | `MOCK_DATA.json` | Key yang sesuai |
| Cara setup Flutter dari awal | `SETUP_GUIDE_CHOIRUL.md` | Semua tahap |

---

# BAGIAN 3 — KOORDINASI SAHAL & CHOIRUL

## Kapan Harus Komunikasi

| Situasi | Yang harus dilakukan |
|---|---|
| Choirul mau mulai connect ke API asli | Tanya Sahal: URL Railway atau IP lokal |
| Response API berbeda dari MOCK_DATA | Sahal cek format response, update MOCK_DATA.json |
| Ada perubahan endpoint | Sahal update API_CONTRACT.md DULU, baru info Choirul |
| Backend endpoint baru selesai dibuat | Sahal info Choirul: endpoint apa yang sudah siap |
| Choirul stuck dengan error API | Kirim screenshot error ke Sahal untuk dicek di backend |

## Aturan Wajib Berdua

```
1. Jangan ubah API_CONTRACT.md sepihak
   → Diskusi dulu, update file, baru coding

2. Jangan commit file .env ke GitHub (sudah ada di .gitignore)

3. Update progress setiap hari via chat:
   → "Sahal: selesai endpoint /api/votes, lanjut /api/content"
   → "Choirul: selesai DashboardScreen, lanjut ScheduleScreen"

4. Jika Choirul butuh data format tertentu dari backend
   → Sahal update MOCK_DATA.json sesuai format response asli
   → Choirul pakai MOCK_DATA dulu sambil tunggu backend siap
```

---

# BAGIAN 4 — CHECKLIST PROGRESS

## Milestone 1 — Setup
- [ ] Sahal: Railway MySQL + semua tabel + seed data berhasil
- [ ] Sahal: Firebase Realtime Database aktif
- [ ] Sahal: Backend Express jalan di localhost:3001
- [ ] Sahal: Frontend React (Vite) jalan di localhost:5173
- [ ] Choirul: Flutter jalan di emulator Android
- [ ] Choirul: Firebase terhubung ke Flutter (tidak ada error)

## Milestone 2 — Backend Selesai
- [ ] Semua endpoint di API_CONTRACT.md sudah dibuat Sahal
- [ ] Semua endpoint sudah ditest dengan Thunder Client
- [ ] Firebase update otomatis saat ada perubahan data
- [ ] Anti-spam voting berfungsi (test 3 lapis)

## Milestone 3 — Mobile App Selesai
- [ ] Login Screen — bisa login dan logout
- [ ] Dashboard Screen — countdown, stats, tasks
- [ ] Schedule Screen — CRUD jadwal + YouTube auto-fill
- [ ] Vote Analytics Screen — moderasi game lengkap
- [ ] To-Do List Screen — CRUD task + swipe gesture
- [ ] Settings Screen — profil + preferences + sign out
- [ ] Firebase listener aktif (countdown + broadcasting sync)
- [ ] Semua screen connect ke API asli (bukan mock)

## Milestone 4 — Web Selesai
- [ ] HomePage — hero, profil, upcoming broadcast
- [ ] VotingPage — grid game, vote anti-spam, real-time Firebase
- [ ] ContentGuidePage — katalog, filter, load more
- [ ] Login Admin — bisa login ke dashboard
- [ ] Dashboard Admin — stats, audit log, rig widget
- [ ] Jadwal Admin — CRUD + form panel + YouTube auto-fill
- [ ] Voting Moderasi — tabel ranking + aksi moderasi + reset periode
- [ ] Content Admin — grid + form panel + toggle visible/featured

## Milestone 5 — Deploy & Demo
- [ ] Frontend React di-deploy ke Vercel
- [ ] Backend Express di-deploy ke Railway
- [ ] APK Flutter ter-install di HP Xion Regalia
- [ ] Semua fitur berjalan end-to-end
- [ ] Countdown sync antara web dan mobile
- [ ] Voting real-time berfungsi tanpa refresh
