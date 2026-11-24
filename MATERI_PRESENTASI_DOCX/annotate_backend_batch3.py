import os

def prepend_header(filepath, header_text):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "FILE: web/backend/" in content:
        print(f"Already commented: {filepath}")
        return
        
    new_content = header_text.strip() + "\n\n" + content
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Successfully annotated: {filepath}")

# ============================================================
# MODELS
# ============================================================

# 1. models/index.js
prepend_header("web/backend/src/models/index.js", """/**
 * ============================================================================
 * FILE: web/backend/src/models/index.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Pusat orkestrasi dan pendefinisian asosiasi relasional (Associations) seluruh Model Sequelize.
 * Mengatur relasi antar entitas:
 * - Game.hasMany(Vote) & Vote.belongsTo(Game) -> Integritas data voting komunitas.
 * - User.hasMany(Schedule) & Schedule.belongsTo(User) -> Pemilik agenda siaran.
 * - User.hasMany(ContentGuide) & ContentGuide.belongsTo(User) -> Pemilik arsip VOD.
 * Menyediakan fungsi `testConnection()` dan `syncDatabase()`.
 * ============================================================================
 */""")

# 2. models/User.js
prepend_header("web/backend/src/models/User.js", """/**
 * ============================================================================
 * FILE: web/backend/src/models/User.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Definisi skema tabel `users` (Akun Administrator & Streamer).
 * Menyimpan nama, email unik, password_hash (Bcrypt), role ('admin'/'superadmin'),
 * serta status live broadcasting ('is_broadcasting').
 * Dilengkapi instance method `verifyPassword()` untuk perbandingan aman kata sandi.
 * ============================================================================
 */""")

# 3. models/Game.js
prepend_header("web/backend/src/models/Game.js", """/**
 * ============================================================================
 * FILE: web/backend/src/models/Game.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Definisi skema tabel `games` (Kandidat Game Voting Komunitas).
 * Menyimpan judul, genre, URL cover art, perolehan suara (`vote_count`),
 * status siklus hidup ('requested', 'accepted', 'playing', 'done'), dan `period_key` (YYYY-MM).
 * ============================================================================
 */""")

# 4. models/Vote.js
prepend_header("web/backend/src/models/Vote.js", """/**
 * ============================================================================
 * FILE: web/backend/src/models/Vote.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Definisi skema tabel `votes` (Bukti Pencatatan Suara & Log Anti-Spam).
 * Mencatat relasi `game_id`, Alamat IP (`ip_address`), `fingerprint` perangkat unik,
 * dan `period_key`. Berfungsi ganda untuk validasi anti-spam voting dan cooldown 7 hari request game.
 * ============================================================================
 */""")

# 5. models/Schedule.js
prepend_header("web/backend/src/models/Schedule.js", """/**
 * ============================================================================
 * FILE: web/backend/src/models/Schedule.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Definisi skema tabel `schedules` (Agenda Siaran Streaming Mingguan).
 * Menyimpan judul, deskripsi, waktu mulai (`scheduled_at` format UTC),
 * kategori game, status siaran ('upcoming', 'live', 'done'), dan tautan streaming YouTube.
 * ============================================================================
 */""")

# 6. models/ContentGuide.js
prepend_header("web/backend/src/models/ContentGuide.js", """/**
 * ============================================================================
 * FILE: web/backend/src/models/ContentGuide.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Definisi skema tabel `content_guides` (Katalog Arsip Rekaman Video VOD).
 * Menyimpan ID video YouTube (`youtube_id`), judul, thumbnail URL, kategori tag,
 * durasi, serta flag spotlight utama (`is_featured`).
 * ============================================================================
 */""")

# 7. models/AuditLog.js
prepend_header("web/backend/src/models/AuditLog.js", """/**
 * ============================================================================
 * FILE: web/backend/src/models/AuditLog.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Definisi skema tabel `audit_logs` (Rekam Jejak Aktivitas Sistem).
 * Mencatat jenis aksi (`action_type`), detail kejadian, sub-detail, ID user pelaku,
 * dan stempel waktu (`created_at`) untuk audit forensik dan keamanan sistem.
 * ============================================================================
 */""")

# 8. models/CollabRequest.js
prepend_header("web/backend/src/models/CollabRequest.js", """/**
 * ============================================================================
 * FILE: web/backend/src/models/CollabRequest.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Definisi skema tabel `collab_requests` (Usulan Kolaborasi dari Komunitas).
 * Menyimpan nama streamer usulan penonton, tautan kanal, alasan kolaborasi,
 * informasi pengusul, dan status moderasi ('pending', 'reviewed', 'accepted', 'rejected').
 * ============================================================================
 */""")

# 9. models/Todo.js
prepend_header("web/backend/src/models/Todo.js", """/**
 * ============================================================================
 * FILE: web/backend/src/models/Todo.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Definisi skema tabel `todos` (Checklist Agenda Internal Streamer).
 * Menyimpan daftar tugas, status penyelesaian (`is_completed`), prioritas, dan tenggat waktu.
 * ============================================================================
 */""")

# ============================================================
# ROUTES
# ============================================================

prepend_header("web/backend/src/routes/vote.routes.js", """/**
 * ============================================================================
 * FILE: web/backend/src/routes/vote.routes.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Deklarasi rute API untuk pemungutan suara (Voting) dan pengajuan request game.
 * Menyematkan middleware `voteLimiter` untuk menangkal serangan bot spamming.
 * Endpoints:
 * - GET  /api/votes/stats         -> Statistik suara periode aktif (Publik)
 * - POST /api/votes/request       -> Pengajuan game baru dengan cooldown 7 hari (Publik + Limiter)
 * - POST /api/votes/reset-period  -> Reset periode bulanan (Khusus Admin)
 * - POST /api/votes/:gameId       -> Memberikan 1 suara dengan proteksi fingerprint (Publik + Limiter)
 * ============================================================================
 */""")

prepend_header("web/backend/src/routes/game.routes.js", """/**
 * ============================================================================
 * FILE: web/backend/src/routes/game.routes.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Deklarasi rute API untuk pengelolaan katalog game.
 * Endpoints publik untuk penonton (GET) dan endpoints terproteksi untuk admin (POST, PATCH, DELETE).
 * ============================================================================
 */""")

prepend_header("web/backend/src/routes/auth.routes.js", """/**
 * ============================================================================
 * FILE: web/backend/src/routes/auth.routes.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Deklarasi rute API autentikasi: login admin, verifikasi profil aktif, dan perubahan password.
 * ============================================================================
 */""")

prepend_header("web/backend/src/routes/schedule.routes.js", """/**
 * ============================================================================
 * FILE: web/backend/src/routes/schedule.routes.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Deklarasi rute API jadwal siaran streaming (GET publik, CRUD terproteksi admin).
 * ============================================================================
 */""")

prepend_header("web/backend/src/routes/content.routes.js", """/**
 * ============================================================================
 * FILE: web/backend/src/routes/content.routes.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Deklarasi rute API katalog arsip video Content Guide (VOD).
 * ============================================================================
 */""")

prepend_header("web/backend/src/routes/admin.routes.js", """/**
 * ============================================================================
 * FILE: web/backend/src/routes/admin.routes.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Rute payung khusus Studio Admin. Seluruh endpoint di dalam berkas ini dilindungi oleh
 * `authMiddleware` dan `adminOnly` sehingga hanya admin sah ber-token JWT yang dapat mengakses.
 * ============================================================================
 */""")

prepend_header("web/backend/src/routes/dashboard.routes.js", """/**
 * ============================================================================
 * FILE: web/backend/src/routes/dashboard.routes.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Rute pengembalian statistik dan data ringkasan analitik Studio Admin.
 * ============================================================================
 */""")

prepend_header("web/backend/src/routes/collabRequest.routes.js", """/**
 * ============================================================================
 * FILE: web/backend/src/routes/collabRequest.routes.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Rute pengajuan kolaborasi streamer (POST publik dengan `collabLimiter`) dan peninjauan oleh admin.
 * ============================================================================
 */""")

prepend_header("web/backend/src/routes/todo.routes.js", """/**
 * ============================================================================
 * FILE: web/backend/src/routes/todo.routes.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Rute pengelolaan to-do list internal kreator.
 * ============================================================================
 */""")

prepend_header("web/backend/src/routes/youtube.routes.js", """/**
 * ============================================================================
 * FILE: web/backend/src/routes/youtube.routes.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Rute pengambilan metadata YouTube via Google YouTube Data API v3.
 * ============================================================================
 */""")

prepend_header("web/backend/src/routes/auditLog.routes.js", """/**
 * ============================================================================
 * FILE: web/backend/src/routes/auditLog.routes.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Rute pembacaan rekam jejak aktivitas keamanan dan operasional (Audit Logs).
 * ============================================================================
 */""")

prepend_header("web/backend/src/routes/notification.routes.js", """/**
 * ============================================================================
 * FILE: web/backend/src/routes/notification.routes.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Rute manajemen langganan notifikasi push FCM ke topik tertentu ('stream_alerts', 'creator_alerts').
 * ============================================================================
 */""")

prepend_header("web/backend/src/routes/index.js", """/**
 * ============================================================================
 * FILE: web/backend/src/routes/index.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Indeks sentral penggabungan seluruh router modular backend X-VOCA.
 * ============================================================================
 */""")
