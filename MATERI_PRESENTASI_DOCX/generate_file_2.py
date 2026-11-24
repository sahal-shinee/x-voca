import os
from docx.shared import Inches, Pt, RGBColor
from doc_builder import (
    create_base_document, add_header_banner, add_heading_1, add_heading_2,
    add_heading_3, add_paragraph, add_bullet_point, add_callout,
    add_table_data, COLOR_PRIMARY, COLOR_SECONDARY, COLOR_ACCENT
)

def build_file_2():
    doc = create_base_document()
    
    add_header_banner(
        doc,
        title="File 2: Master Blueprint & Penjelasan Lengkap Sistem X-VOCA",
        subtitle="Dokumentasi Konseptual, Arsitektur 3-Tier, Model Hybrid Database, dan Bedah Menyeluruh Modul Frontend & Backend",
        tag="X-VOCA DOKUMEN PRESENTASI & UJIAN"
    )
    
    add_callout(
        doc,
        "Dokumen ini adalah ringkasan arsitektur sistem level tinggi (high-level system blueprint). "
        "Gunakan dokumen ini untuk menjelaskan gambaran besar proyek saat guru bertanya: "
        "'Mengapa sistem ini dibuat?', 'Bagaimana konsep arsitekturnya?', atau 'Bagaimana cara kerja sistem ini dari awal sampai akhir?'.",
        title="PANDUAN UNTUK PRESENTASI KEPADA GURU",
        style_type="info"
    )
    
    # ---------------------------------------------------------
    # BAB 1: LATAR BELAKANG, MASALAH, & TUJUAN SISTEM
    # ---------------------------------------------------------
    add_heading_1(doc, "1. Latar Belakang Masalah & Urgensi Sistem")
    add_paragraph(
        doc,
        "Dalam industri hiburan digital modern, kreator virtual streaming (Virtual Talent / VTuber) seperti Xion Regalia "
        "menghadapi tantangan operasional yang signifikan dalam mengelola interaksi komunitas dan publikasi agenda siaran. "
        "Tiga masalah utama yang melatarbelakangi lahirnya sistem X-VOCA adalah:"
    )
    
    add_bullet_point(
        doc, "Fragmentasi Informasi Siaran",
        "Jadwal siaran sering kali hanya diunggah sebagai gambar statis di media sosial (seperti Twitter/X atau Discord). "
        "Akibatnya, penonton dari berbagai zona waktu sering kebingungan mengenai kapan siaran persisnya dimulai, "
        "apakah siaran mengalami penundaan, serta di mana tautan siaran langsungnya."
    )
    add_bullet_point(
        doc, "Manipulasi & Friksi pada Voting Game Komunitas",
        "Kreator membutuhkan masukan game apa yang ingin ditonton oleh penggemar pada bulan berikutnya. "
        "Sistem voting konvensional memiliki dua kelemahan fatal: jika mewajibkan login akun (Google/Email), penonton enggan berpartisipasi "
        "karena repot (tinggi friksi); sebaliknya, jika tanpa login sama sekali, pemungutan suara sangat mudah dicurangi "
        "melalui refresh halaman berulang kali (spamming)."
    )
    add_bullet_point(
        doc, "Inefisiensi Rekapitulasi & Moderasi Mandiri",
        "Kreator harus mencatat usulan game dan jadwal secara manual di spreadsheet terpisah. "
        "Tidak ada sistem terpadu yang menghubungkan jadwal siaran dengan arsip video rekaman (VOD) secara otomatis."
    )
    
    add_paragraph(
        doc,
        "Solusi X-VOCA: Ekosistem digital terpadu yang memadukan Portal Fansite Interaktif untuk penonton dan "
        "Studio Kreator Mandiri untuk manajemen streamer, dengan teknologi Hybrid Database dan Anti-Spam Browser Fingerprinting."
    )

    # ---------------------------------------------------------
    # BAB 2: ARSITEKTUR SISTEM 3-TIER & MODEL HYBRID DATABASE
    # ---------------------------------------------------------
    add_heading_1(doc, "2. Arsitektur Sistem 3-Tier & Model Hybrid Database")
    add_paragraph(
        doc,
        "X-VOCA dirancang menggunakan arsitektur 3-Tier (Presentation Layer, Application Layer, dan Data Layer) "
        "yang menjamin skalabilitas, modularitas, dan keamanan sistem."
    )
    
    headers_layers = ["Lapisan (Tier)", "Teknologi yang Digunakan", "Peran & Tanggung Jawab Teknis"]
    rows_layers = [
        [
            "Presentation Tier (Client)",
            "Web: React 18, Vite 6, Tailwind CSS\nMobile: Flutter 3, Dart",
            "Menyajikan antarmuka pengguna responsif bertema Cyberpunk Midnight, menangani interaksi pengguna, ekstraksi fingerprint perangkat, dan mendengarkan event realtime."
        ],
        [
            "Application Tier (Server)",
            "Node.js, Express.js REST API",
            "Mengelola aturan bisnis, validasi request, pembatasan laju (rate limiting), autentikasi JWT, transaksi basis data, audit logging, dan sinkronisasi cloud."
        ],
        [
            "Data & Cloud Tier (Storage)",
            "MySQL 8 (Sequelize ORM)\nFirebase Realtime Database\nGoogle YouTube Data API v3",
            "MySQL sebagai Single Source of Truth transaksi relasional ACID. Firebase RTDB sebagai penyalur update skor voting real-time berlatensi milidetik. YouTube API untuk metadata video otomatis."
        ]
    ]
    add_table_data(doc, headers_layers, rows_layers, [Inches(1.8), Inches(2.2), Inches(2.5)])
    
    add_heading_2(doc, "Alasan Ilmiah Pemilihan Model Basis Data Hybrid (MySQL + Firebase)")
    add_paragraph(
        doc,
        "Pertanyaan yang sangat sering diajukan oleh guru atau penguji adalah: "
        "'Mengapa Anda menggunakan dua basis data sekaligus (MySQL dan Firebase)? Kenapa tidak salah satu saja?'"
    )
    add_paragraph(
        doc,
        "Jawabannya terletak pada kompromi antara keandalan data (Data Integrity) dan kecepatan siaran (Real-time Latency):"
    )
    
    add_bullet_point(
        doc, "MySQL (Relational Database with ACID Property)",
        "Digunakan sebagai basis data utama yang menyimpan relasi entitas kompleks: akun pengguna, riwayat suara voting, jadwal siaran, "
        "dan catatan log audit. MySQL menjamin sifat Atomicity, Consistency, Isolation, dan Durability (ACID) sehingga data transaksi "
        "tidak akan pernah korup atau hilang meskipun terjadi lonjakan lalu lintas."
    )
    add_bullet_point(
        doc, "Firebase Realtime Database (WebSocket-based Live Layer)",
        "Digunakan khusus sebagai Event Dispatcher / Live Broadcast Layer. Saat ribuan penonton berada di halaman voting secara bersamaan, "
        "Firebase mendistribusikan kenaikan angka suara secara instan dalam hitungan milidetik melalui koneksi persistent WebSocket. "
        "Hal ini mencegah server Express backend mengalami bottleneck akibat jutaan request polling berulang kali (long-polling)."
    )
    
    add_callout(
        doc,
        "Alur Harmonisasi Data:\n"
        "1. Penonton mengklik tombol Vote ➔ 2. Request dikirim ke Express API ➔ "
        "3. Backend memvalidasi anti-spam dan menulis transaksi secara aman ke MySQL ➔ "
        "4. Setelah MySQL sukses mencatat, backend otomatis mem-broadcast angka baru ke Firebase RTDB ➔ "
        "5. Seluruh penonton lain di dunia langsung melihat angka bertambah di layarnya tanpa perlu merefresh halaman.",
        title="KONSEP SINKRONISASI DUA ARAH",
        style_type="success"
    )

    # ---------------------------------------------------------
    # BAB 3: BEDAH MODUL FRONTEND
    # ---------------------------------------------------------
    add_heading_1(doc, "3. Bedah Menyeluruh Modul Frontend")
    add_paragraph(
        doc,
        "Frontend X-VOCA dirancang dengan memisahkan dua domain utama: Portal Publik Penonton (Fansite Viewer) "
        "dan Dashboard Privat Kreator (Creator Admin Studio)."
    )
    
    add_heading_2(doc, "A. Portal Publik Penonton (Fansite Viewer)")
    
    add_bullet_point(
        doc, "Hero Interactive Showcase (HomePage.jsx)",
        "Menampilkan kartu profil karakter Xion Regalia dengan selector mood/aura visual, indikator status siaran langsung (Live Ready), "
        "dan Countdown Timer otomatis menuju agenda siaran berikutnya."
    )
    add_bullet_point(
        doc, "Kalender Siaran Mingguan (ScheduleSection.jsx)",
        "Daftar jadwal siaran mingguan dengan badge status dinamis ('scheduled', 'live', 'completed'), label kategori game, "
        "dan tautan langsung menuju stream YouTube / platform streaming."
    )
    add_bullet_point(
        doc, "Pusat Voting Game Komunitas (VotingPage.jsx)",
        "Area penonton memberikan hak suara untuk game yang ingin dimainkan streamer bulan ini. Fitur unggulan:\n"
        "• Quick Vote (Top 3): Menampilkan 3 game dengan perolehan suara tertinggi untuk voting cepat.\n"
        "• Filter Siklus Hidup: Penonton dapat menyaring game berdasarkan status (Requested, Accepted, Playing, Done).\n"
        "• Perlindungan Anti-Spam Zero-Login: Tiap perangkat hanya dapat memilih 1 kali per game dalam 1 periode bulan aktif tanpa wajib registrasi akun.\n"
        "• Live Synchronization: Angka suara ter-update live tanpa reload berkat listener Firebase RTDB."
    )
    add_bullet_point(
        doc, "Formulir Usulan Game Penonton (Game Request Modal)",
        "Memungkinkan penonton mengusulkan judul game baru. Dilengkapi pembatasan laju 1 usulan per perangkat per 7 hari untuk mencegah spamming."
    )
    add_bullet_point(
        doc, "Katalog Arsip Siaran (ContentGuidePage.jsx)",
        "Pusat arsip VOD siaran terdahulu. Dilengkapi filter kategori dinamis, strip statistik real-time (Total Video, Kategori Aktif, Konten Baru), "
        "dan Featured Video Spotlight dengan dialog pemutar video bawaan."
    )
    add_bullet_point(
        doc, "Formulir Usulan Kolaborasi (CollabRequestModal.jsx)",
        "Dialog interaktif bagi penonton untuk merekomendasikan streamer lain agar berkolaborasi dengan Xion Regalia."
    )
    
    add_heading_2(doc, "B. Studio Kreator & Dashboard Admin (Admin Studio)")
    
    add_bullet_point(
        doc, "Autentikasi & Proteksi Akses (LoginPage.jsx & ProtectedRoute.jsx)",
        "Akses masuk khusus administrator menggunakan autentikasi JWT. Dilengkapi pengalihan rute otomatis jika token kedaluwarsa atau tidak sah."
    )
    add_bullet_point(
        doc, "Dashboard Analitik (DashboardPage.jsx)",
        "Menampilkan kartu statistik ringkas: total suara bulan ini, jumlah game aktif, jadwal siaran berikutnya, serta daftar 10 aktivitas log terbaru."
    )
    add_bullet_point(
        doc, "Manajemen Jadwal Siaran (SchedulePage.jsx)",
        "Pengelolaan jadwal siaran lengkap: tambah, edit, hapus, set status menjadi 'live', serta fitur 'One-Click Archive' "
        "yang otomatis menyalin jadwal yang telah selesai siaran ke katalog Content Guide tanpa input ulang."
    )
    add_bullet_point(
        doc, "Moderasi Voting Game (VotingModerationPage.jsx)",
        "Panel kendali penuh atas usulan game: meninjau game yang diajukan penonton (status: 'requested') dan menyetujuinya (status: 'accepted') "
        "agar muncul di halaman voting publik. Menyediakan fitur reset periode bulanan dan ekspor rekapitulasi voting ke PDF resmi."
    )
    add_bullet_point(
        doc, "Manajemen Arsip Konten (ContentManagementPage.jsx)",
        "Pengelolaan arsip video VOD: mendukung pengambilan metadata otomatis dari Google YouTube Data API saat admin menempelkan tautan YouTube, "
        "serta pengaturan pin video spotlight (is_featured)."
    )
    add_bullet_point(
        doc, "Kotak Masuk Kolaborasi & To-Do List (CollabRequestsPage.jsx & TodoPage.jsx)",
        "Memeriksa usulan kolaborasi streamer dari komunitas dan mengelola checklist persiapan siaran internal."
    )

    # ---------------------------------------------------------
    # BAB 4: BEDAH MENYELURUH MODUL BACKEND & BASIS DATA
    # ---------------------------------------------------------
    add_heading_1(doc, "4. Bedah Menyeluruh Modul Backend & Basis Data")
    
    add_heading_2(doc, "A. Arsitektur RESTful API & Standar Respons JSON")
    add_paragraph(
        doc,
        "Backend X-VOCA menerapkan standar REST API murni dengan format respons JSON yang konsisten di setiap endpoint:"
    )
    add_bullet_point(
        doc, "Format Respons Standar",
        "Setiap endpoint selalu mengembalikan payload JSON terstruktur:\n"
        "• 'success' (boolean): Menandakan status keberhasilan operasi.\n"
        "• 'data' (object/array/null): Payload data yang diminta klien.\n"
        "• 'message' (string): Pesan deskriptif dalam Bahasa Indonesia yang ramah pengguna.\n"
        "• 'meta' (object, opsional): Informasi tambahan seperti pagination, periode aktif, dan total suara."
    )
    
    add_heading_2(doc, "B. Keamanan & Proteksi Server")
    add_bullet_point(
        doc, "Enkripsi Password dengan Bcrypt",
        "Kata sandi admin tidak pernah disimpan dalam bentuk teks polos (plain text), melainkan di-hash menggunakan algoritma Bcrypt "
        "dengan salt rounds 10. Hal ini melindungi data kredensial meskipun basis data bocor."
    )
    add_bullet_point(
        doc, "Stateless Token JWT (JSON Web Token)",
        "Setelah login sukses, server menerbitkan token JWT bertanda tangan digital yang memuat klaim identitas user (userId, username, role). "
        "Server tidak perlu menyimpan session state di memori, menjadikannya sangat efisien dan ringan."
    )
    add_bullet_point(
        doc, "In-Memory Rate Limiting",
        "Membatasi jumlah request dari alamat IP yang sama dalam jangka waktu tertentu untuk mencegah spamming dan serangan Denial of Service (DoS)."
    )
    add_bullet_point(
        doc, "HTTP Security Headers (Helmet) & CORS",
        "Mencegah serangan umum berbasis web seperti Cross-Site Scripting (XSS), Clickjacking, dan pembatasan domain akses melalui konfigurasi CORS."
    )

    # ---------------------------------------------------------
    # BAB 5: DIAGRAM & ALIR DATA SISTEM (DATA FLOW)
    # ---------------------------------------------------------
    add_heading_1(doc, "5. Diagram Alir Data Sistem (Data Flow Architecture)")
    add_paragraph(
        doc,
        "Berikut adalah visualisasi alur data sistem pada proses-proses krusial X-VOCA:"
    )
    
    add_heading_2(doc, "A. Alur Proses Voting Real-Time")
    add_paragraph(
        doc,
        "[Browser Penonton]\n"
        "  │ 1. Ekstrak Fingerprint Hardware (Canvas/WebGL)\n"
        "  │ 2. Kirim POST /api/votes/:gameId { fingerprint }\n"
        "  ▼\n"
        "[Rate Limiter Middleware] ─── (Cek batas 10 vote/menit)\n"
        "  │ Lolos\n"
        "  ▼\n"
        "[Vote Controller]\n"
        "  │ 3. Verifikasi: Apakah status game 'accepted'?\n"
        "  │ 4. Cek MySQL: Apakah IP / Fingerprint sudah vote di bulan ini (period_key)?\n"
        "  │ 5. Eksekusi MySQL Transaction: Simpan log ke tabel `votes` & Tambah `vote_count` di tabel `games`\n"
        "  ▼\n"
        "[Firebase RTDB Helper]\n"
        "  │ 6. Update node realtime: `/votes/{gameId}`\n"
        "  ▼\n"
        "[Seluruh Klien Penonton Lain]\n"
        "  └── Listener `onValue` menerima data baru secara instan tanpa reload!"
    )
    
    add_heading_2(doc, "B. Alur Pengajuan Request Game oleh Penonton")
    add_paragraph(
        doc,
        "[Browser Penonton]\n"
        "  │ 1. Isi formulir judul, genre, cover URL\n"
        "  │ 2. Kirim POST /api/votes/request { title, genre, fingerprint }\n"
        "  ▼\n"
        "[Vote Controller]\n"
        "  │ 3. Cek Cooldown: Apakah fingerprint ini sudah mengajukan game dalam 7 hari terakhir?\n"
        "  │ 4. Jika lolos: Buat record baru di `games` dengan status = 'requested'\n"
        "  │ 5. Buat placeholder di tabel `votes` untuk mengunci cooldown 7 hari\n"
        "  │ 6. Catat aktivitas di tabel `audit_logs`\n"
        "  │ 7. Kirim push notification ke aplikasi smartphone admin (FCM Alert)\n"
        "  ▼\n"
        "[Dashboard Studio Admin]\n"
        "  └── Game muncul di tab 'Usulan Game' untuk dimoderasi (Accept / Reject) oleh Admin."
    )
    
    output_path = os.path.join("MATERI_PRESENTASI_DOCX", "2_Master_Blueprint_Sistem_XVOCA.docx")
    doc.save(output_path)
    print(f"Success generating: {output_path}")

if __name__ == "__main__":
    build_file_2()
