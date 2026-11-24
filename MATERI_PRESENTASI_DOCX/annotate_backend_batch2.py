import os

def prepend_header(filepath, header_text):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if header already exists
    if "FILE: web/backend/" in content:
        print(f"Already commented: {filepath}")
        return
        
    new_content = header_text.strip() + "\n\n" + content
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Successfully annotated: {filepath}")

# 1. schedule.controller.js
h_schedule = """/**
 * ============================================================================
 * FILE: web/backend/src/controllers/schedule.controller.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Pengendali agenda siaran streaming mingguan Xion Regalia.
 * Mengatur:
 * 1. Pengambilan jadwal siaran dengan filter status ('upcoming', 'live', 'done').
 * 2. Ekstraksi otomatis thumbnail YouTube dari tautan streaming.
 * 3. Konversi zona waktu UTC ke Waktu Indonesia Barat (WIB / UTC+7).
 * 4. Pembuatan jadwal baru, pembaruan status live, dan penghapusan jadwal.
 * 5. Fitur 'Archive Schedule': menyalin jadwal yang selesai langsung ke Content Guide.
 * 6. Lazy cron throttle untuk sinkronisasi otomatis jadwal live di lingkungan serverless.
 *
 * RELASI ANTAR FILE:
 * - Mengimpor model `Schedule`, `User`, `Game`, `AuditLog` dari `../models`.
 * - Mengimpor helper Firebase dari `../utils/firebase.helper` untuk broadcast status.
 * - Mengimpor `updateScheduleStatuses` dari `../utils/scheduleCron`.
 * - Dipanggil oleh `src/routes/schedule.routes.js`.
 *
 * POIN PENJELASAN UNTUK GURU / PENGUJI:
 * - "Jadwal disimpan dalam format UTC standar di database, lalu dikonversi ke WIB
 *   sehingga akurat diakses dari wilayah mana pun."
 * - "Saat siaran dimulai, sistem secara otomatis memperbarui banner siaran di Firebase RTDB."
 * ============================================================================
 */"""
prepend_header("web/backend/src/controllers/schedule.controller.js", h_schedule)

# 2. content.controller.js
h_content = """/**
 * ============================================================================
 * FILE: web/backend/src/controllers/content.controller.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Pengendali katalog arsip rekaman siaran (Video On Demand / Content Guide).
 * Mengatur:
 * 1. Pengambilan katalog video dengan pagination, pencarian, dan pemfilteran kategori game.
 * 2. Penetapan video spotlight utama (is_featured toggle) yang disematkan di halaman depan.
 * 3. Kalkulasi metrik agregat: total durasi siaran, kategori unik, dan video baru 7 hari terakhir.
 * 4. Penambahan dan pengeditan metadata video YouTube (judul, thumbnail, durasi).
 *
 * RELASI ANTAR FILE:
 * - Mengimpor model `ContentGuide`, `User`, `AuditLog` dari `../models`.
 * - Mengimpor `triggerContentUpdate` dari `../utils/firebase.helper`.
 * - Dipanggil oleh rute `src/routes/content.routes.js`.
 *
 * POIN PENJELASAN UNTUK GURU / PENGUJI:
 * - "Fitur spotlight memungkinkan kreator memilih video terbaik untuk diputar langsung
 *   oleh penonton di landing page tanpa dialihkan ke aplikasi luar."
 * - "Statistik total durasi dihitung secara dinamis dari database dan diformat ke jam & menit."
 * ============================================================================
 */"""
prepend_header("web/backend/src/controllers/content.controller.js", h_content)

# 3. dashboard.controller.js
h_dashboard = """/**
 * ============================================================================
 * FILE: web/backend/src/controllers/dashboard.controller.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Penyedia metrik analitik ringkas untuk layar utama Studio Admin (DashboardPage).
 * Mengagregasi:
 * 1. Total suara voting yang masuk pada periode bulan berjalan.
 * 2. Status kesiapan siaran langsung kreator (broadcasting status).
 * 3. Agenda siaran streaming terdekat (next upcoming schedule).
 * 4. Daftar 10 aktivitas log audit terbaru untuk pemantauan keamanan operasional.
 *
 * RELASI ANTAR FILE:
 * - Mengimpor model `Game`, `Schedule`, `Vote`, `AuditLog`, `User` dari `../models`.
 * - Dipanggil oleh rute `src/routes/dashboard.routes.js`.
 *
 * POIN PENJELASAN UNTUK GURU / PENGUJI:
 * - "Dashboard dirancang untuk memberikan gambaran cepat (helicopter view) dalam 3 detik pertama
 *   saat kreator membuka Studio Admin."
 * ============================================================================
 */"""
prepend_header("web/backend/src/controllers/dashboard.controller.js", h_dashboard)

# 4. youtube.controller.js
h_youtube = """/**
 * ============================================================================
 * FILE: web/backend/src/controllers/youtube.controller.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Jembatan penghubung backend dengan Google YouTube Data API v3.
 * Mengatur:
 * 1. Ekstraksi ID video dari beragam format URL YouTube (watch?v=, live/, youtu.be, embed/).
 * 2. Pengambilan metadata otomatis dari API YouTube resmi: judul video, deskripsi, thumbnail HD,
 *    dan durasi format ISO 8601 (dikonversi ke menit & jam).
 * 3. Mekanisme fallback cerdas jika kuota Google API limit atau offline.
 *
 * RELASI ANTAR FILE:
 * - Mengimpor helper `youtube.helper.js`.
 * - Dipanggil oleh rute `src/routes/youtube.routes.js`.
 *
 * POIN PENJELASAN UNTUK GURU / PENGUJI:
 * - "Admin tidak perlu mengetik judul dan mencari gambar thumbnail manual.
 *   Cukup tempelkan link YouTube, sistem akan otomatis mengambil data via Google API."
 * ============================================================================
 */"""
prepend_header("web/backend/src/controllers/youtube.controller.js", h_youtube)

# 5. collabRequest.controller.js
h_collab = """/**
 * ============================================================================
 * FILE: web/backend/src/controllers/collabRequest.controller.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Pengendali fitur usulan kolaborasi streamer dari komunitas penonton.
 * Mengatur:
 * 1. Penerimaan formulir ajuan kolaborasi dari penonton dengan rate limiting ketat.
 * 2. Moderasi dan peninjauan ajuan oleh admin di Studio Kreator (status: pending, reviewed, accepted, rejected).
 * 3. Pencatatan audit log saat ajuan ditinjau.
 *
 * RELASI ANTAR FILE:
 * - Mengimpor model `CollabRequest` dan `AuditLog` dari `../models`.
 * - Dipanggil oleh rute `src/routes/collabRequest.routes.js`.
 * ============================================================================
 */"""
prepend_header("web/backend/src/controllers/collabRequest.controller.js", h_collab)

# 6. todo.controller.js
h_todo = """/**
 * ============================================================================
 * FILE: web/backend/src/controllers/todo.controller.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Pengendali fitur to-do list internal kreator untuk persiapan agenda siaran.
 * Mengatur operasi CRUD (Create, Read, Update, Delete) catatan kerja dan checklist prioritas.
 *
 * RELASI ANTAR FILE:
 * - Mengimpor model `Todo` dari `../models`.
 * - Dipanggil oleh rute `src/routes/todo.routes.js`.
 * ============================================================================
 */"""
prepend_header("web/backend/src/controllers/todo.controller.js", h_todo)

# 7. src/utils/firebase.helper.js
h_fb_helper = """/**
 * ============================================================================
 * FILE: web/backend/src/utils/firebase.helper.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Helper terpusat untuk interaksi backend dengan Firebase Admin SDK.
 * Mengatur:
 * 1. Inisialisasi Firebase Admin dengan Service Account Key (JSON atau Base64).
 * 2. Sinkronisasi angka vote real-time ke node `/votes/{gameId}`.
 * 3. Penyiaran status siaran live ke node `/broadcasting` dan `/next_schedule`.
 * 4. Pengiriman push notification ke aplikasi smartphone via Firebase Cloud Messaging (FCM Topic).
 *
 * RELASI ANTAR FILE:
 * - Digunakan oleh `vote.controller.js`, `game.controller.js`, `auth.controller.js`, dan `schedule.controller.js`.
 *
 * POIN PENJELASAN UNTUK GURU / PENGUJI:
 * - "Helper ini menggunakan Firebase Realtime Database sebagai event dispatcher
 *   sehingga pembaruan data sampai ke browser penonton dalam hitungan milidetik."
 * ============================================================================
 */"""
prepend_header("web/backend/src/utils/firebase.helper.js", h_fb_helper)

# 8. src/utils/scheduleCron.js
h_cron = """/**
 * ============================================================================
 * FILE: web/backend/src/utils/scheduleCron.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Mesin penjadwalan otomatis (Cron Job) untuk status siaran langsung.
 * Mengatur:
 * 1. Pengecekan berkala (tiap 1 menit) terhadap jadwal berstatus 'upcoming'.
 * 2. Jika waktu jadwal sudah tercapai (`scheduled_at <= now`), status otomatis beralih ke 'live'.
 * 3. Sinkronisasi jadwal live yang baru aktif ke Firebase Realtime Database.
 *
 * RELASI ANTAR FILE:
 * - Mengimpor model `Schedule` dari `../models`.
 * - Dijalankan pada saat booting di `server.js` dan dipanggil secara lazy di `app.js`.
 * ============================================================================
 */"""
prepend_header("web/backend/src/utils/scheduleCron.js", h_cron)

# 9. src/utils/youtube.helper.js
h_yt_helper = """/**
 * ============================================================================
 * FILE: web/backend/src/utils/youtube.helper.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Helper parsing URL YouTube dan pemanggilan Google YouTube Data API v3.
 * Mengubah link YouTube menjadi Video ID, mengambil durasi ISO 8601 (contoh: PT1H23M45S),
 * dan mengonversinya menjadi menit serta jam yang mudah dibaca pengguna.
 *
 * RELASI ANTAR FILE:
 * - Digunakan oleh `youtube.controller.js` dan `content.controller.js`.
 * ============================================================================
 */"""
prepend_header("web/backend/src/utils/youtube.helper.js", h_yt_helper)
