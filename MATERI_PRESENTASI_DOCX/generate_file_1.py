import os
import sys
from docx.shared import Inches, Pt, RGBColor
from doc_builder import (
    create_base_document, add_header_banner, add_heading_1, add_heading_2,
    add_heading_3, add_paragraph, add_bullet_point, add_callout,
    add_table_data, COLOR_PRIMARY, COLOR_SECONDARY, COLOR_ACCENT
)

def build_file_1():
    doc = create_base_document()
    
    add_header_banner(
        doc,
        title="File 1: Katalog & Peta Relasi Lengkap File & Folder",
        subtitle="Bedah Struktur Direktori Frontend & Backend, Peran Setiap File, serta Hubungan Ketergantungan Antar Komponen",
        tag="X-VOCA DOKUMEN PRESENTASI & UJIAN"
    )
    
    add_callout(
        doc,
        "Dokumen ini dirancang sebagai panduan navigasi cepat dan mendalam bagi Anda saat menghadapi penguji. "
        "Jika penguji menanyakan 'File ini gunanya apa?' atau 'Kenapa file ini ada hubungannya dengan file itu?', "
        "seluruh jawaban teknis yang terstruktur rapi ada di dalam dokumen ini.",
        title="PETUNJUK PENGGUNAAN DOKUMEN",
        style_type="info"
    )
    
    # ---------------------------------------------------------
    # BAB 1: PETA ARSITEKTUR STRUKTUR DIREKTORI PROYEK
    # ---------------------------------------------------------
    add_heading_1(doc, "1. Peta Arsitektur & Struktur Direktori Proyek")
    add_paragraph(
        doc,
        "Proyek X-VOCA dibangun dengan arsitektur Full-Stack yang memisahkan tanggung jawab secara jelas (Separation of Concerns). "
        "Sistem utama berada di dalam folder 'web', yang terbagi menjadi dua pilar: 'backend' (Node.js + Express.js API) dan "
        "'frontend' (React 18 + Vite). Selain itu, terdapat modul 'mobile' (Flutter) sebagai aplikasi pendamping (companion app) "
        "dan folder 'docs' sebagai repositori dokumentasi rekayasa perangkat lunak."
    )
    
    headers_dir = ["Direktori Utama", "Teknologi", "Fungsi & Peran Utama Sistem"]
    rows_dir = [
        ["web/backend", "Node.js, Express, Sequelize, Firebase Admin", "RESTful API server, ORM basis data MySQL, sinkronisasi realtime, dan keamanan JWT."],
        ["web/frontend", "React 18, Vite 6, Tailwind CSS, Axios", "Antarmuka publik penonton (Fansite Viewer) dan dashboard kreator (Admin Studio)."],
        ["mobile", "Flutter 3, Dart, Provider Pattern", "Aplikasi smartphone pendamping bagi kreator/streamer untuk memantau voting & jadwal siaran."],
        ["docs", "Markdown Documentations", "Dokumentasi perancangan sistem: PRD, Architecture, Database Schema, dan panduan kode."]
    ]
    add_table_data(doc, headers_dir, rows_dir, [Inches(1.5), Inches(2.2), Inches(2.8)])
    
    # ---------------------------------------------------------
    # BAB 2: KATALOG & PERAN DETAIL FILE BACKEND
    # ---------------------------------------------------------
    add_heading_1(doc, "2. Katalog Detail File Backend (web/backend)")
    add_paragraph(
        doc,
        "Bagian backend bertindak sebagai penyedia layanan API (Application Programming Interface), pengendali aturan bisnis (business logic), "
        "serta pengatur lalu lintas data antara basis data relasional MySQL dan Firebase Realtime Database."
    )
    
    # Sub 2.1: Entry Point & Konfigurasi Server
    add_heading_2(doc, "A. File Entry Point, Server, & Konfigurasi Lingkungan")
    
    add_bullet_point(
        doc, "web/backend/server.js",
        "Titik masuk utama (entry point) server Node.js lokal. Menginisialisasi koneksi basis data MySQL via Sequelize, memverifikasi ketersediaan tabel, "
        "dan menjalankan HTTP server pada port yang ditentukan (default: 3001). Berelasi langsung dengan 'app.js' dan 'src/config/database.js'."
    )
    add_bullet_point(
        doc, "web/backend/app.js",
        "Pusat konfigurasi Express application instance. Mengatur global middleware seperti CORS (Cross-Origin Resource Sharing), "
        "Helmet (keamanan header HTTP), JSON body parsing, URL-encoded parser, global logging, serta memasang seluruh rute API terpusat ('/api'). "
        "Berelasi dengan 'src/routes/index.js' dan 'src/middleware/errorHandler.js'."
    )
    add_bullet_point(
        doc, "web/backend/api/index.js & vercel.json",
        "Konfigurasi adapter Serverless Deployment untuk Vercel. Mengizinkan aplikasi Express backend berjalan sebagai serverless cloud function "
        "apabila di-deploy secara online di cloud."
    )
    add_bullet_point(
        doc, "web/backend/.env & .env.example",
        "File konfigurasi variabel lingkungan rahasia (Environment Variables). Menyimpan kredensial basis data (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME), "
        "JWT_SECRET, kredensial Firebase Base64, dan port server. File ini tidak boleh diunggah ke Git publik demi keamanan."
    )
    add_bullet_point(
        doc, "web/backend/package.json",
        "Manifes proyek backend yang mencatat seluruh pustaka dependensi (express, sequelize, mysql2, firebase-admin, jsonwebtoken, bcryptjs, cors, helmet) "
        "dan skrip eksekusi ('npm start', 'npm run dev', migrasi)."
    )
    
    # Sub 2.2: Folder config
    add_heading_2(doc, "B. Folder src/config/ (Koneksi Basis Data & Cloud Services)")
    add_bullet_point(
        doc, "src/config/database.js",
        "Menginisialisasi instance Sequelize ORM dan mengelola connection pooling ke MySQL. Mendukung konfigurasi lokal (XAMPP/Laragon) "
        "maupun cloud connection (TiDB Cloud / Railway). Menyediakan fungsi otentikasi koneksi database 'testConnection()'."
    )
    add_bullet_point(
        doc, "src/config/firebase.js",
        "Menginisialisasi Firebase Admin SDK menggunakan service account key (JSON atau Base64 string dari environment variable). "
        "Menyediakan akses ke Firebase Realtime Database dan Firebase Cloud Messaging (FCM Topic Broadcast)."
    )

    # Sub 2.3: Folder models
    add_heading_2(doc, "C. Folder src/models/ (Definisi Entitas & Skema Relasional)")
    add_paragraph(
        doc,
        "Folder ini berisi definisi skema tabel MySQL menggunakan Sequelize Model. Di dalamnya terdefinisi validasi kolom, tipe data, "
        "serta relasi antar tabel (associations):"
    )
    
    headers_models = ["File Model", "Tabel Database", "Fungsi & Relasi Kunci"]
    rows_models = [
        ["src/models/User.js", "users", "Menyimpan akun administrator/kreator (username, email, password terenkripsi bcrypt, role)."],
        ["src/models/Game.js", "games", "Menyimpan kandidat game voting (title, genre, cover_url, vote_count, status, period_key). Berelasi 1-ke-N dengan Vote."],
        ["src/models/Vote.js", "votes", "Mencatat bukti suara unik (game_id, fingerprint, ip_address, period_key, voted_at). Terhubung ke Game (belongsTo)."],
        ["src/models/Schedule.js", "schedules", "Menyimpan agenda siaran mingguan (title, start_time, category, status: scheduled/live/completed, stream_url)."],
        ["src/models/ContentGuide.js", "content_guides", "Menyimpan katalog arsip VOD siaran YouTube (youtube_id, title, duration, category, is_featured)."],
        ["src/models/Todo.js", "todos", "Pencatatan daftar tugas internal kreator (title, is_completed, priority, due_date)."],
        ["src/models/AuditLog.js", "audit_logs", "Rekam jejak aktivitas sistem secara transparan (action_type, detail, sub_detail, created_at)."],
        ["src/models/CollabRequest.js", "collab_requests", "Menyimpan formulir ajuan kolaborasi dari penonton (streamer_name, platform, status: pending/reviewed)."],
        ["src/models/index.js", "Pusat Asosiasi", "Mengagregasi seluruh model dan mendefinisikan foreign key relasional (Game.hasMany(Vote), Vote.belongsTo(Game))."]
    ]
    add_table_data(doc, headers_models, rows_models, [Inches(1.8), Inches(1.2), Inches(3.5)])
    
    # Sub 2.4: Controllers
    add_heading_2(doc, "D. Folder src/controllers/ (Pusat Logika Bisnis & Transaksi)")
    add_bullet_point(
        doc, "src/controllers/auth.controller.js",
        "Menangani alur autentikasi login administrator. Memvalidasi kecocokan username dan enkripsi password via bcrypt.compare(), "
        "serta menerbitkan token JSON Web Token (JWT) yang ditandatangani dengan secret key dan masa kedaluwarsa 24 jam."
    )
    add_bullet_point(
        doc, "src/controllers/vote.controller.js",
        "Pusat logika voting penonton dan pengajuan request game. Melakukan pencegahan spam berbasis IP dan Browser Fingerprint, "
        "mengupdate jumlah suara secara atomik di MySQL, mencatat audit log, dan mem-broadcast perolehan suara live ke Firebase RTDB."
    )
    add_bullet_point(
        doc, "src/controllers/game.controller.js",
        "Manajemen data master game untuk admin studio. Menyediakan fitur penambahan game baru, perubahan status (requested -> accepted -> playing -> done), "
        "penghapusan game, dan kalkulasi persentase suara bulanan."
    )
    add_bullet_point(
        doc, "src/controllers/schedule.controller.js",
        "Mengatur jadwal siaran mingguan Xion Regalia. Menyediakan fungsi CRUD jadwal, penentuan status otomatis (live/scheduled), "
        "serta otomatisasi duplikasi jadwal siaran yang telah usai langsung ke arsip Content Guide."
    )
    add_bullet_point(
        doc, "src/controllers/content.controller.js",
        "Mengelola data arsip VOD/video. Mendukung pagination, filter kategori, toggle status spotlight/featured video, "
        "dan kalkulasi statistik total durasi serta video terbaru."
    )
    add_bullet_point(
        doc, "src/controllers/youtube.controller.js",
        "Jembatan API eksternal ke Google YouTube Data API v3. Mengambil metadata video (judul, thumbnail HD, durasi) secara otomatis saat admin menempelkan tautan YouTube."
    )
    add_bullet_point(
        doc, "src/controllers/dashboard.controller.js",
        "Menghitung metrik analitik dashboard admin: total suara bulan berjalan, jadwal terdekat, rasio partisipasi voting, dan aktivitas log terbaru."
    )
    add_bullet_point(
        doc, "src/controllers/todo.controller.js & collabRequest.controller.js",
        "Mengontrol fitur to-do list internal streamer dan peninjauan formulir usulan kolaborasi penonton."
    )

    # Sub 2.5: Middleware & Utils
    add_heading_2(doc, "E. Folder src/middleware/ & src/utils/ (Keamanan & Helper)")
    add_bullet_point(
        doc, "src/middleware/auth.middleware.js",
        "Penjaga gerbang endpoint privat. Mengekstrak Bearer token dari header 'Authorization', memverifikasinya menggunakan jwt.verify(), "
        "dan menolak request jika token tidak valid atau kedaluwarsa (HTTP 401 Unauthorized)."
    )
    add_bullet_point(
        doc, "src/middleware/rateLimit.middleware.js",
        "Pembatas laju request (Rate Limiter) in-memory untuk menangkal serangan brute-force, DDoS ringan, dan bot spamming. "
        "Membatasi vote maksimal 10 request/menit dan pengajuan kolaborasi maksimal 5 request/10 menit per IP."
    )
    add_bullet_point(
        doc, "src/middleware/errorHandler.js",
        "Global error handling middleware. Menangkap seluruh error tak terduga (500) agar server tidak mengalami crash (fatal unhandled exception) "
        "dan mengembalikan format respons JSON yang konsisten."
    )
    add_bullet_point(
        doc, "src/utils/firebase.helper.js",
        "Helper utility untuk operasi Firebase Admin SDK: 'updateVoteCount()', 'updateAllGamesVotes()', 'resetVotingPeriod()', "
        "serta 'sendTopicNotification()' untuk push notification ke smartphone via FCM."
    )

    # Sub 2.6: Migrations & Seeders
    add_heading_2(doc, "F. Folder migrations/ & seeders/ (Migrasi & Data Awal Basis Data)")
    add_bullet_point(
        doc, "migrations/ (9 file migrasi)",
        "Skrip terstruktur pembuatan tabel MySQL secara bertahap tanpa perlu merancang manual via phpMyAdmin. "
        "Memastikan skema tabel selalu sinkron dan konsisten di seluruh komputer pengembang maupun saat ujian."
    )
    add_bullet_point(
        doc, "seeders/ (5 file seeder)",
        "Skrip injeksi data awal (dummy/sample data) untuk akun admin default, jadwal siaran contoh, daftar game awal, dan arsip VOD."
    )

    # ---------------------------------------------------------
    # BAB 3: KATALOG & PERAN DETAIL FILE FRONTEND
    # ---------------------------------------------------------
    add_heading_1(doc, "3. Katalog Detail File Frontend (web/frontend)")
    add_paragraph(
        doc,
        "Frontend dibangun dengan Single Page Application (SPA) berbasis React 18, dibundel oleh Vite 6 untuk proses build yang sangat cepat, "
        "dan dihias menggunakan Tailwind CSS dengan tema Cyberpunk Midnight yang elegan."
    )
    
    # Sub 3.1: Entry Point & Konfigurasi Frontend
    add_heading_2(doc, "A. File Konfigurasi & Entry Point")
    add_bullet_point(
        doc, "index.html",
        "Halaman HTML utama SPA tempat root DOM div ('#root') berada. Mengatur meta-tag, judul halaman, dan favicon aplikasi."
    )
    add_bullet_point(
        doc, "src/main.jsx",
        "Titik injeksi awal React 18 (ReactDOM.createRoot). Membungkus aplikasi dengan BrowserRouter dan ThemeProvider."
    )
    add_bullet_point(
        doc, "src/App.jsx",
        "Pusat deklarasi rute halaman (React Router DOM v6). Membedakan rute publik penonton ('/', '/voting', '/content-guide'), "
        "halaman login ('/admin/login'), serta rute privat terlindungi di bawah '/admin/*' yang dibungkus oleh komponen 'ProtectedRoute'."
    )
    add_bullet_point(
        doc, "tailwind.config.js",
        "Definisi tema desain sistem X-VOCA. Mendaftarkan palet warna Midnight Cyberpunk: Dark Background (#0d0b1a, #141126), "
        "Cyan Accent (#7ee0d2), dan Purple Accent (#c084fc)."
    )
    add_bullet_point(
        doc, "vite.config.js",
        "Konfigurasi bundler Vite: plugin React, port lokal (default: 5173), dan pengaturan proxy untuk mengarahkan request API ke backend."
    )

    # Sub 3.2: Context & State Management
    add_heading_2(doc, "B. Folder src/context/ (Manajemen State Global)")
    add_bullet_point(
        doc, "src/context/AuthContext.jsx",
        "Menyimpan status autentikasi login admin secara global di memori React. Menyediakan fungsi 'login()' dan 'logout()', "
        "serta otomatis memeriksa token tersimpan di localStorage saat browser di-refresh."
    )
    add_bullet_point(
        doc, "src/context/NotificationContext.jsx",
        "Mengelola antrean pesan notifikasi toast interaktif (sukses, error, info) di seluruh antarmuka pengguna."
    )
    add_bullet_point(
        doc, "src/context/ThemeContext.jsx",
        "Mengatur preferensi tema tampilan antarmuka (gelap / aksen neon) yang konsisten di semua layar."
    )

    # Sub 3.3: Custom Hooks
    add_heading_2(doc, "C. Folder src/hooks/ (Custom React Hooks)")
    add_bullet_point(
        doc, "src/hooks/useFirebase.js",
        "Custom hook krusial yang menginisialisasi listener Firebase Web SDK ('onValue'). Mendengarkan perubahan data node '/votes' "
        "secara real-time melalui WebSocket dan otomatis mengupdate state React tanpa me-reload browser."
    )
    add_bullet_point(
        doc, "src/hooks/useCountdown.js",
        "Menghitung selisih waktu secara matematis dari waktu sekarang menuju waktu siaran siaran terdekat (hari, jam, menit, detik) "
        "secara dinamis setiap detik."
    )
    add_bullet_point(
        doc, "src/hooks/useAuth.js & useAuthNavigation.js",
        "Mempermudah komponen mengakses data user yang sedang login dan menangani proteksi navigasi otomatis jika sesi berakhir."
    )
    add_bullet_point(
        doc, "src/hooks/useDashboardStats.js",
        "Mengambil dan menyegarkan metrik statistik analitik dashboard admin secara otomatis."
    )

    # Sub 3.4: Pages
    add_heading_2(doc, "D. Folder src/pages/ (Halaman Antarmuka Pengguna)")
    
    headers_pages = ["File Halaman", "Akses", "Fungsi & Konten yang Ditampilkan"]
    rows_pages = [
        ["src/pages/viewer/HomePage.jsx", "Publik", "Beranda utama portal fansite. Menampilkan kartu profil hero interaktif, jadwal siaran mingguan, countdown dinamis, dan profil perlengkapan streaming."],
        ["src/pages/viewer/VotingPage.jsx", "Publik", "Pusat voting game bulanan penonton. Dilengkapi Quick Vote (Top 3), daftar kandidat lengkap, filter status, dan formulir pengajuan game baru."],
        ["src/pages/viewer/ContentGuidePage.jsx", "Publik", "Katalog arsip VOD siaran YouTube. Menampilkan video spotlight, filter kategori game, pencarian judul, dan dialog pemutar video langsung."],
        ["src/pages/admin/LoginPage.jsx", "Publik", "Formulir autentikasi masuk ke Studio Kreator khusus administrator dengan validasi token JWT."],
        ["src/pages/admin/DashboardPage.jsx", "Admin", "Panel ikhtisar studio: metrik suara, ringkasan jadwal live, aktivitas log terbaru, dan pintasan cepat."],
        ["src/pages/admin/SchedulePage.jsx", "Admin", "Manajemen CRUD jadwal siaran mingguan, set status live/selesai, dan tombol otomatis salin ke Content Guide."],
        ["src/pages/admin/VotingModerationPage.jsx", "Admin", "Moderasi usulan game penonton (Accept/Reject), perbarui siklus status game, reset periode bulanan, dan ekspor laporan PDF resmi."],
        ["src/pages/admin/ContentManagementPage.jsx", "Admin", "Manajemen arsip VOD: tambah link YouTube (auto metadata fetch), edit kategori, dan set featured video."],
        ["src/pages/admin/CollabRequestsPage.jsx", "Admin", "Kotak masuk ulasan rekomendasi kolaborasi kreator yang diajukan oleh komunitas penonton."],
        ["src/pages/admin/TodoPage.jsx", "Admin", "Daftar checklist to-do list internal kreator untuk persiapan agenda siaran."],
        ["src/pages/common/NotFoundPage.jsx", "Publik", "Halaman error 404 estetik bertema Cyberpunk jika pengguna mengakses URL yang tidak terdaftar."]
    ]
    add_table_data(doc, headers_pages, rows_pages, [Inches(2.2), Inches(0.8), Inches(3.5)])

    # Sub 3.5: Components
    add_heading_2(doc, "E. Folder src/components/ (Komponen Modular Reusable)")
    add_bullet_point(
        doc, "src/components/admin/ProtectedRoute.jsx",
        "Komponen pembungkus rute privat. Memeriksa keberadaan token JWT valid di AuthContext; jika tidak ada, pengguna dialihkan otomatis ke '/admin/login'."
    )
    add_bullet_point(
        doc, "src/components/admin/AdminLayout.jsx, Sidebar.jsx, Header.jsx",
        "Struktur kerangka dasar dashboard studio: menu navigasi samping, profil admin aktif, tombol logout, dan indikator status koneksi."
    )
    add_bullet_point(
        doc, "src/components/admin/ExportPdfModal.jsx",
        "Modal dialog untuk mengonfigurasi dan mencetak dokumen laporan rekapitulasi voting bulanan resmi ke dalam file PDF."
    )
    add_bullet_point(
        doc, "src/components/viewer/HeroSection.jsx & CountdownCard.jsx",
        "Komponen showcase interaktif kartu profil Xion Regalia dengan selector mood/aura, audio sfx visual, dan timer countdown otomatis."
    )
    add_bullet_point(
        doc, "src/components/viewer/CollabRequestModal.jsx",
        "Formulir modal publik bagi penonton untuk merekomendasikan kolaborasi streamer lain kepada Xion Regalia."
    )
    add_bullet_point(
        doc, "src/components/common/ (Button, Input, Modal, Toast, Badge, StatCard)",
        "Pustaka komponen UI dasar yang konsisten, bersih, dan mematuhi aturan desain antarmuka modern (Clean Code UI)."
    )

    # Sub 3.6: Services & Utils
    add_heading_2(doc, "F. Folder src/services/ & src/utils/ (Jaringan & Helper)")
    add_bullet_point(
        doc, "src/services/api.js",
        "Instance Axios terpusat dengan konfigurasi baseURL dan Interceptor. Otomatis menyisipkan header 'Authorization: Bearer <token>' "
        "pada setiap request privat dan menangani auto-logout jika backend mengembalikan status 401 Unauthorized."
    )
    add_bullet_point(
        doc, "src/services/ (gameService, scheduleService, contentService, dll.)",
        "Modul layanan pemanggil API spesifik per domain fitur yang menghubungkan UI komponen dengan rute backend."
    )
    add_bullet_point(
        doc, "src/utils/fingerprint.js",
        "Helper pembuat identitas unik perangkat penonton menggunakan FingerprintJS (Canvas, WebGL, Screen Resolution) "
        "untuk validasi anti-spam voting tanpa mewajibkan penonton registrasi akun."
    )
    add_bullet_point(
        doc, "src/utils/pdfExport.js",
        "Helper konversi elemen HTML dashboard rekapitulasi menjadi dokumen PDF berkualitas tinggi menggunakan 'html2canvas' dan 'jspdf'."
    )

    # ---------------------------------------------------------
    # BAB 4: MATRIKS RELASI ANTAR FILE (END-TO-END TRACING)
    # ---------------------------------------------------------
    add_heading_1(doc, "4. Matriks Relasi Antar File (Alur Kerja Lengkap Fitur Kunci)")
    add_paragraph(
        doc,
        "Untuk menjawab pertanyaan guru: 'Bagaimana alur komunikasi antara frontend dan backend saat fitur X dijalankan?', "
        "berikut adalah tracing relasi file dari ujung antarmuka penonton hingga ke basis data:"
    )
    
    headers_relasi = ["Nama Fitur", "File Frontend yang Terlibat", "File Backend yang Terlibat", "Tabel Database / Cloud"]
    rows_relasi = [
        [
            "Voting Game Realtime",
            "VotingPage.jsx\n➔ fingerprint.js\n➔ gameService.js\n➔ api.js\n➔ useFirebase.js (listener)",
            "vote.routes.js\n➔ rateLimit.middleware.js\n➔ vote.controller.js\n➔ firebase.helper.js",
            "MySQL: `votes`, `games`\nCloud: Firebase RTDB `/votes`"
        ],
        [
            "Request Game oleh Viewer",
            "VotingPage.jsx (Modal Form)\n➔ fingerprint.js\n➔ gameService.js",
            "vote.routes.js\n➔ rateLimit.middleware.js\n➔ vote.controller.js\n➔ firebase.helper.js (FCM Alert)",
            "MySQL: `games` (status: requested), `votes` (placeholder cooldown), `audit_logs`"
        ],
        [
            "Login & Akses Studio Admin",
            "LoginPage.jsx\n➔ AuthContext.jsx\n➔ api.js\n➔ ProtectedRoute.jsx",
            "auth.routes.js\n➔ rateLimit.middleware.js\n➔ auth.controller.js\n➔ auth.middleware.js",
            "MySQL: `users` (verifikasi bcrypt hash)"
        ],
        [
            "Jadwal Siaran & Countdown",
            "HomePage.jsx\n➔ HeroSection.jsx\n➔ useCountdown.js\n➔ scheduleService.js",
            "schedule.routes.js\n➔ schedule.controller.js",
            "MySQL: `schedules`"
        ],
        [
            "Arsip Video & Auto YouTube Fetch",
            "ContentManagementPage.jsx\n➔ VideoMetadataModal.jsx\n➔ youtubeService.js",
            "youtube.routes.js\n➔ youtube.controller.js\n➔ content.controller.js",
            "MySQL: `content_guides`\nCloud: Google YouTube Data API v3"
        ],
        [
            "Ekspor Laporan PDF Voting",
            "VotingModerationPage.jsx\n➔ ExportPdfModal.jsx\n➔ pdfExport.js",
            "game.routes.js\n➔ game.controller.js (Get historical period votes)",
            "MySQL: `games`, `votes`"
        ]
    ]
    add_table_data(doc, headers_relasi, rows_relasi, [Inches(1.4), Inches(2.1), Inches(2.0), Inches(1.5)])
    
    output_path = os.path.join("MATERI_PRESENTASI_DOCX", "1_Katalog_dan_Peta_Relasi_File_Folder.docx")
    doc.save(output_path)
    print(f"Success generating: {output_path}")

if __name__ == "__main__":
    build_file_1()
