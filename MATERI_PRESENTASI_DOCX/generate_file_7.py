import os
from docx.shared import Inches, Pt, RGBColor
from docx.enum.section import WD_SECTION, WD_ORIENT
from doc_builder import (
    create_base_document, add_header_banner, add_heading_1, add_heading_2,
    add_heading_3, add_paragraph, add_bullet_point, add_callout,
    add_table_data, add_code_block, add_image_with_caption,
    COLOR_PRIMARY, COLOR_SECONDARY, COLOR_ACCENT
)
from generate_erd_image import generate_erd

def build_file_7():
    doc = create_base_document()
    
    # Pastikan file gambar diagram ERD kualitas tinggi sudah dibuat
    erd_image_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "erd_diagram.png")
    if not os.path.exists(erd_image_path):
        generate_erd()
    
    # Header Banner
    add_header_banner(
        doc,
        title="File 7: Diagram ERD & Dokumentasi Lengkap Database X-VOCA",
        subtitle="Visualisasi Hubungan Entitas, Kamus Data Fisik (Data Dictionary), Derajat Kardinalitas, Integritas Referensial, Normalisasi 1NF-3NF, dan Script Presentasi Basis Data untuk Guru Penguji",
        tag="X-VOCA DOKUMEN PRESENTASI & BASIS DATA"
    )
    
    add_callout(
        doc,
        "Dokumen ini disusun khusus sebagai referensi resmi arsitektur basis data relasional (RDBMS MySQL) "
        "dan NoSQL realtime (Firebase RTDB) untuk platform X-VOCA. Gunakan dokumen ini untuk menjawab "
        "pertanyaan teknis penguji terkait struktur tabel, normalisasi, hubungan relasi (kardinalitas), "
        "aturan integritas kaskade (CASCADE/SET NULL), serta strategi keamanan anti-spam pada transaksi data.",
        title="PANDUAN UNTUK PRESENTASI KEPADA GURU / PENGUJI",
        style_type="info"
    )
    
    # ---------------------------------------------------------
    # BAB 1: GAMBARAN UMUM & VISUALISASI DIAGRAM ERD
    # ---------------------------------------------------------
    add_heading_1(doc, "1. Gambaran Umum & Visualisasi Diagram ERD")
    add_paragraph(
        doc,
        "Entity Relationship Diagram (ERD) adalah representasi grafis yang memvisualisasikan bagaimana "
        "entitas-entitas data dalam sistem X-VOCA saling berhubungan, menyimpan informasi, dan menjaga "
        "integritas transaksi. Basis data utama X-VOCA dirancang menggunakan Relational Database Management "
        "System (RDBMS) MySQL yang dikelola melalui Object-Relational Mapping (ORM) Sequelize pada backend Node.js."
    )
    
    add_heading_2(doc, "1.1 Skema Visual Diagram Relasi Entitas (ERD)")
    add_paragraph(
        doc,
        "Berikut adalah peta visual jaring-jaring relasi entitas basis data (Entity Relationship Diagram) "
        "yang menghubungkan seluruh tabel fisik dalam sistem X-VOCA. Diagram ini disajikan dalam format poster "
        "rekayasa perangkat lunak resolusi ultra-tinggi (300 DPI) pada halaman mendatar (Landscape) agar seluruh atribut field, "
        "kunci primer (Primary Key - PK), kunci asing (Foreign Key - FK), composite index, serta jalur relasi garis "
        "dan derajat kardinalitasnya dapat diinspeksi secara detail dan presisi oleh guru penguji:"
    )
    
    # -------------------------------------------------------------
    # HALAMAN KHUSUS LANDSCAPE UNTUK DIAGRAM ERD RESOLUSI TINGGI
    # -------------------------------------------------------------
    erd_sec = doc.add_section(WD_SECTION.NEW_PAGE)
    erd_sec.orientation = WD_ORIENT.LANDSCAPE
    erd_sec.page_width = Inches(11.0)
    erd_sec.page_height = Inches(8.5)
    erd_sec.top_margin = Inches(0.4)
    erd_sec.bottom_margin = Inches(0.4)
    erd_sec.left_margin = Inches(0.5)
    erd_sec.right_margin = Inches(0.5)
    
    add_image_with_caption(
        doc,
        erd_image_path,
        caption="1.1: Diagram Relasi Entitas (ERD) Lengkap Sistem X-VOCA (MySQL / Sequelize ORM / Hybrid Firebase RTDB)",
        width=Inches(10.0)
    )
    
    add_callout(
        doc,
        "Cara Membaca Jaring-Jaring Relasi ERD X-VOCA:\n"
        "1. Titik Lingkaran & Badge [1] menandakan sisi Entitas Induk (Parent) tempat Primary Key (PK) berada.\n"
        "2. Panah Solid & Badge [∞ N] menandakan sisi Entitas Anak (Child) tempat Foreign Key (FK) merujuk langsung ke kolom induk.\n"
        "3. Kotak Label Mengambang di tengah garis menerangkan aturan integritas referensial: ON DELETE CASCADE "
        "(data anak otomatis ikut terhapus jika induk dihapus) atau ON DELETE SET NULL (kolom FK diset NULL agar data anak tetap aman).\n"
        "4. Entitas Standalone `audit_logs` sengaja tidak memiliki garis Foreign Key agar log audit sistem abadi (immutable) dan tidak dapat terhapus kaskade.",
        title="PANDUAN PEMBACAAN JARING-JARING RELASI DIAGRAM ERD UNTUK PENGUJI",
        style_type="info"
    )
    
    # -------------------------------------------------------------
    # KEMBALI KE HALAMAN PORTRAIT UNTUK DOKUMENTASI & DATA DICTIONARY
    # -------------------------------------------------------------
    normal_sec = doc.add_section(WD_SECTION.NEW_PAGE)
    normal_sec.orientation = WD_ORIENT.PORTRAIT
    normal_sec.page_width = Inches(8.5)
    normal_sec.page_height = Inches(11.0)
    normal_sec.top_margin = Inches(0.9)
    normal_sec.bottom_margin = Inches(0.9)
    normal_sec.left_margin = Inches(1.0)
    normal_sec.right_margin = Inches(1.0)
    
    # Ringkasan Matriks Relasi
    add_heading_2(doc, "1.2 Matriks Relasi Antar-Entitas")
    add_paragraph(
        doc,
        "Tabel berikut merangkum seluruh hubungan relasional antar entitas, derajat kardinalitas, "
        "serta aturan integritas referensial (Action on Delete / Update) yang diterapkan pada basis data:"
    )
    
    rel_headers = ["Entitas Induk (Parent)", "Entitas Anak (Child)", "Kardinalitas", "Foreign Key", "On Delete Action", "Tujuan Bisnis"]
    rel_rows = [
        ["users", "schedules", "1 : N (One-to-Many)", "user_id", "CASCADE", "Agenda siaran dibuat dan dimiliki oleh admin streamer."],
        ["users", "content_guides", "1 : N (One-to-Many)", "user_id", "SET NULL", "Arsip video VOD tetap dipertahankan meskipun user pembuat dihapus."],
        ["users", "todos", "1 : N (One-to-Many)", "user_id", "CASCADE", "Tugas persiapan streaming terikat langsung ke akun kreator."],
        ["users", "collab_requests", "1 : N (One-to-Many)", "reviewed_by", "SET NULL", "Pengajuan collab mencatat admin yang menyetujui/menolak."],
        ["games", "votes", "1 : N (One-to-Many)", "game_id", "CASCADE", "Seluruh suara terikat pada game. Jika game dihapus, voting otomatis gugur."],
        ["- (System)", "audit_logs", "Standalone (N/A)", "-", "NO ACTION", "Log keamanan historis independen, tidak boleh terhapus (Audit Trail)."]
    ]
    add_table_data(doc, rel_headers, rel_rows, [Inches(1.0), Inches(1.1), Inches(1.1), Inches(0.9), Inches(1.0), Inches(1.4)])
    
    # ---------------------------------------------------------
    # BAB 2: KAMUS DATA LENGKAP (DATA DICTIONARY)
    # ---------------------------------------------------------
    add_heading_1(doc, "2. Kamus Data Lengkap (Data Dictionary)")
    add_paragraph(
        doc,
        "Kamus data mendeskripsikan secara rinci struktur fisik setiap kolom, tipe data SQL, batasan (constraints), "
        "nilai bawaan (default value), dan signifikansi fungsionalnya dalam arsitektur aplikasi X-VOCA."
    )
    
    # 2.1 users
    add_heading_2(doc, "2.1 Tabel `users` (Akun Administrator & Streamer)")
    add_paragraph(
        doc,
        "Tabel `users` menyimpan identitas otentikasi administrator kreator Studio (Xion Regalia). "
        "Keamanan kata sandi menggunakan hashing kriptografi satu arah (bcrypt) dengan salt 10 rounds."
    )
    user_headers = ["Nama Kolom", "Tipe Data", "Constraints", "Default", "Keterangan Fungsional"]
    user_rows = [
        ["id", "INT", "PK, Auto Increment, Not Null", "-", "Primary Key unik pengenal akun admin."],
        ["name", "VARCHAR(255)", "Not Null", "-", "Nama lengkap tampilan kreator (e.g., 'Xion Regalia')."],
        ["email", "VARCHAR(255)", "Not Null, UNIQUE", "-", "Alamat email login akun (dijamin unik di database)."],
        ["password", "VARCHAR(255)", "Not Null", "-", "Hash kata sandi bcrypt (panjang 60 karakter aman)."],
        ["role", "ENUM('admin','moderator')", "Not Null", "'admin'", "Tingkat hak akses pada Creator Studio."],
        ["avatar_url", "VARCHAR(500)", "Nullable", "NULL", "URL foto profil admin (mendukung CDN eksternal)."],
        ["bio", "TEXT", "Nullable", "NULL", "Deskripsi profil singkat kreator."],
        ["is_broadcasting", "BOOLEAN", "Not Null", "false", "Flag status siaran live (true = LIVE, false = STANDBY)."],
        ["created_at", "DATETIME / TIMESTAMP", "Not Null", "CURRENT_TIMESTAMP", "Waktu pertama kali akun didaftarkan."],
        ["updated_at", "DATETIME / TIMESTAMP", "Not Null", "CURRENT_TIMESTAMP", "Waktu perubahan data profil terakhir."]
    ]
    add_table_data(doc, user_headers, user_rows, [Inches(1.2), Inches(1.2), Inches(1.4), Inches(0.8), Inches(1.9)])
    
    # 2.2 games
    add_heading_2(doc, "2.2 Tabel `games` (Katalog Game Pilihan & Usulan Penonton)")
    add_paragraph(
        doc,
        "Tabel `games` merepresentasikan daftar judul game yang tersedia pada periode pemungutan suara (voting). "
        "Tabel ini mendukung dua alur: game resmi yang dimasukkan kreator dan game yang diusulkan langsung oleh penonton."
    )
    game_headers = ["Nama Kolom", "Tipe Data", "Constraints", "Default", "Keterangan Fungsional"]
    game_rows = [
        ["id", "INT", "PK, Auto Increment, Not Null", "-", "Primary Key unik setiap game."],
        ["title", "VARCHAR(255)", "Not Null", "-", "Judul game (e.g., 'Elden Ring', 'Valorant')."],
        ["description", "TEXT", "Nullable", "NULL", "Sinopsis atau ulasan singkat gameplay."],
        ["genre", "VARCHAR(100)", "Nullable", "NULL", "Genre game (e.g., 'Action RPG', 'Horror', 'FPS')."],
        ["cover_url", "MEDIUMTEXT", "Nullable", "NULL", "URL cover poster game (mendukung tautan CDN & base64)."],
        ["vote_count", "INT", "Not Null", "0", "Agregat total suara (denormalisasi untuk performa O(1))."],
        ["status", "ENUM('active','archived','pending_approval')", "Not Null", "'active'", "Status game dalam sistem voting."],
        ["requested_by", "VARCHAR(255)", "Nullable", "NULL", "Nama pena penonton yang mengusulkan game ini."],
        ["requested_at", "DATETIME", "Nullable", "NULL", "Waktu saat usulan game diajukan oleh penonton."],
        ["created_at", "DATETIME / TIMESTAMP", "Not Null", "CURRENT_TIMESTAMP", "Waktu penambahan entri game."],
        ["updated_at", "DATETIME / TIMESTAMP", "Not Null", "CURRENT_TIMESTAMP", "Waktu pembaruan status / data game."]
    ]
    add_table_data(doc, game_headers, game_rows, [Inches(1.2), Inches(1.2), Inches(1.4), Inches(0.8), Inches(1.9)])
    
    # 2.3 votes
    add_heading_2(doc, "2.3 Tabel `votes` (Transaksi Suara & Keamanan Anti-Spam)")
    add_paragraph(
        doc,
        "Tabel `votes` menyimpan setiap transaksi pemungutan suara yang masuk dari publik secara anonim tanpa login. "
        "Keabsahan dan integritas voting dilindungi melalui kombinasi Fingerprint perangkat browser dan IP Address."
    )
    vote_headers = ["Nama Kolom", "Tipe Data", "Constraints", "Default", "Keterangan Fungsional"]
    vote_rows = [
        ["id", "INT", "PK, Auto Increment, Not Null", "-", "Primary Key unik transaksi pemungutan suara."],
        ["game_id", "INT", "FK -> games.id, Not Null", "-", "Foreign Key merujuk ke game yang dipilih."],
        ["ip_address", "VARCHAR(45)", "Not Null", "-", "Alamat IP pemilih (mendukung format IPv4 dan IPv6)."],
        ["fingerprint", "VARCHAR(255)", "Nullable", "NULL", "Hash hardware fingerprint browser dari FingerprintJS."],
        ["user_agent", "VARCHAR(500)", "Nullable", "NULL", "String header browser & sistem operasi pemilih."],
        ["period", "VARCHAR(7)", "Not Null", "-", "Periode voting aktif format 'YYYY-MM' (e.g., '2026-11')."],
        ["created_at", "DATETIME / TIMESTAMP", "Not Null", "CURRENT_TIMESTAMP", "Waktu tepat saat suara masuk (Audit timestamp)."],
        ["updated_at", "DATETIME / TIMESTAMP", "Not Null", "CURRENT_TIMESTAMP", "Waktu pembaruan sistem."]
    ]
    add_table_data(doc, vote_headers, vote_rows, [Inches(1.2), Inches(1.2), Inches(1.4), Inches(0.8), Inches(1.9)])
    
    add_callout(
        doc,
        "Kunci Anti-Spam di Database: Tabel `votes` memiliki Composite Index pada `(ip_address, fingerprint, period)`. "
        "Sebelum query INSERT dieksekusi, backend menjalankan validasi: "
        "WHERE (fingerprint = :fp OR ip_address = :ip) AND period = :currentPeriod. "
        "Jika ditemukan catatan sebelumnya, request ditolak dengan HTTP 429 / 409 (Sudah Memilih).",
        title="POIN PENTING PENGUJI: MENGAPA VOTE TIDAK BUTUH USER_ID?",
        style_type="warn"
    )
    
    # 2.4 schedules
    add_heading_2(doc, "2.4 Tabel `schedules` (Agenda Siaran Streaming & Live Status)")
    add_paragraph(
        doc,
        "Tabel `schedules` mengelola kalender jadwal siaran langsung kreator. Data dari tabel ini disinkronkan "
        "secara real-time ke node Firebase `/schedules/next` untuk menggerakkan Countdown Timer di Hero Section."
    )
    sch_headers = ["Nama Kolom", "Tipe Data", "Constraints", "Default", "Keterangan Fungsional"]
    sch_rows = [
        ["id", "INT", "PK, Auto Increment, Not Null", "-", "Primary Key unik sesi jadwal siaran."],
        ["user_id", "INT", "FK -> users.id, Not Null", "-", "Foreign Key pemilik/pembuat agenda siaran."],
        ["title", "VARCHAR(255)", "Not Null", "-", "Judul siaran streaming (e.g., 'Mabar Santai')."],
        ["description", "TEXT", "Nullable", "NULL", "Rincian rencana agenda siaran langsung."],
        ["scheduled_at", "DATETIME", "Not Null", "-", "Waktu target tayang siaran streaming."],
        ["status", "ENUM('upcoming','live','done','cancelled')", "Not Null", "'upcoming'", "Siklus hidup status siaran."],
        ["game_category", "VARCHAR(100)", "Nullable", "NULL", "Kategori konten/game yang akan dimainkan."],
        ["stream_platform", "VARCHAR(50)", "Not Null", "'YouTube'", "Platform siaran (default: YouTube)."],
        ["youtube_url", "VARCHAR(500)", "Nullable", "NULL", "Tautan langsung menuju siaran YouTube Live."],
        ["created_at", "DATETIME / TIMESTAMP", "Not Null", "CURRENT_TIMESTAMP", "Waktu pembuatan jadwal."],
        ["updated_at", "DATETIME / TIMESTAMP", "Not Null", "CURRENT_TIMESTAMP", "Waktu perubahan jadwal."]
    ]
    add_table_data(doc, sch_headers, sch_rows, [Inches(1.2), Inches(1.2), Inches(1.4), Inches(0.8), Inches(1.9)])
    
    # 2.5 todos
    add_heading_2(doc, "2.5 Tabel `todos` (Checklist Persiapan Studio & Tugas Internal)")
    add_paragraph(
        doc,
        "Tabel `todos` mencatat daftar periksa persiapan pra-siaran streaming kreator (e.g., testing mic, setup OBS, "
        "download update game). Menjamin kesiapan teknis sebelum Master Broadcast dinyalakan."
    )
    todo_headers = ["Nama Kolom", "Tipe Data", "Constraints", "Default", "Keterangan Fungsional"]
    todo_rows = [
        ["id", "INT", "PK, Auto Increment, Not Null", "-", "Primary Key unik tugas to-do."],
        ["user_id", "INT", "FK -> users.id, Not Null", "-", "Foreign Key pemilik daftar tugas."],
        ["title", "VARCHAR(255)", "Not Null", "-", "Uraian tugas persiapan siaran."],
        ["description", "TEXT", "Nullable", "NULL", "Catatan detail teknis tugas."],
        ["status", "ENUM('pending','in_progress','completed')", "Not Null", "'pending'", "Status progres pengerjaan."],
        ["priority", "ENUM('low','medium','high','urgent')", "Not Null", "'medium'", "Tingkat urgensi penyelesaian."],
        ["due_date", "DATETIME", "Nullable", "NULL", "Batas waktu (deadline) tugas diselesaikan."],
        ["created_at", "DATETIME / TIMESTAMP", "Not Null", "CURRENT_TIMESTAMP", "Waktu tugas didaftarkan."],
        ["updated_at", "DATETIME / TIMESTAMP", "Not Null", "CURRENT_TIMESTAMP", "Waktu status tugas diperbarui."]
    ]
    add_table_data(doc, todo_headers, todo_rows, [Inches(1.2), Inches(1.2), Inches(1.4), Inches(0.8), Inches(1.9)])
    
    # 2.6 content_guides
    add_heading_2(doc, "2.6 Tabel `content_guides` (Arsip Video VOD & Panduan Penggemar)")
    add_paragraph(
        doc,
        "Tabel `content_guides` menyimpan repositori video siaran ulang (VOD) dan highlight terbaik Xion Regalia. "
        "Memungkinkan penggemar baru menonton rekaman siaran berdasarkan kategori dan status pin rekomendasi."
    )
    content_headers = ["Nama Kolom", "Tipe Data", "Constraints", "Default", "Keterangan Fungsional"]
    content_rows = [
        ["id", "INT", "PK, Auto Increment, Not Null", "-", "Primary Key unik arsip konten."],
        ["user_id", "INT", "FK -> users.id, Nullable", "NULL", "Foreign Key pengunggah (SET NULL jika user dihapus)."],
        ["title", "VARCHAR(255)", "Not Null", "-", "Judul video rekaman / highlight."],
        ["description", "TEXT", "Nullable", "NULL", "Deskripsi dan catatan waktu (timestamps)."],
        ["category", "VARCHAR(100)", "Not Null", "-", "Kategori konten (e.g., 'Gameplay', 'Karaoke', 'Clip')."],
        ["video_url", "VARCHAR(500)", "Not Null", "-", "Tautan pemutar video YouTube."],
        ["thumbnail_url", "MEDIUMTEXT", "Nullable", "NULL", "Gambar thumbnail video resolusi tinggi."],
        ["duration", "VARCHAR(20)", "Nullable", "NULL", "Durasi penayangan video (format 'HH:MM:SS')."],
        ["view_count", "INT", "Not Null", "0", "Jumlah penayangan / popularitas video."],
        ["is_pinned", "BOOLEAN", "Not Null", "false", "Flag semat (pinned) di bagian atas halaman panduan."],
        ["created_at", "DATETIME / TIMESTAMP", "Not Null", "CURRENT_TIMESTAMP", "Waktu konten ditambahkan."],
        ["updated_at", "DATETIME / TIMESTAMP", "Not Null", "CURRENT_TIMESTAMP", "Waktu pembaruan informasi konten."]
    ]
    add_table_data(doc, content_headers, content_rows, [Inches(1.2), Inches(1.2), Inches(1.4), Inches(0.8), Inches(1.9)])
    
    # 2.7 collab_requests
    add_heading_2(doc, "2.7 Tabel `collab_requests` (Pengajuan Kolaborasi Streamer Eksternal)")
    add_paragraph(
        doc,
        "Tabel `collab_requests` menampung formulir pendaftaran kolaborasi yang diajukan oleh sesama kreator atau VTuber. "
        "Dilengkapi fitur peninjauan (review workflow) dengan status persetujuan resmi."
    )
    collab_headers = ["Nama Kolom", "Tipe Data", "Constraints", "Default", "Keterangan Fungsional"]
    collab_rows = [
        ["id", "INT", "PK, Auto Increment, Not Null", "-", "Primary Key unik pengajuan kolaborasi."],
        ["streamer_name", "VARCHAR(255)", "Not Null", "-", "Nama talent / kreator yang mengajak kolaborasi."],
        ["platform", "VARCHAR(50)", "Not Null", "-", "Platform siaran (e.g., 'YouTube', 'Twitch')."],
        ["channel_url", "VARCHAR(500)", "Not Null", "-", "Tautan kanal siaran kreator pengusul."],
        ["contact", "VARCHAR(255)", "Not Null", "-", "Kontak korespondensi (Email / Discord Tag)."],
        ["proposed_game", "VARCHAR(255)", "Not Null", "-", "Judul game atau konsep acara yang diajukan."],
        ["proposed_date", "DATE", "Not Null", "-", "Estimasi tanggal pelaksanaan kolaborasi."],
        ["notes", "TEXT", "Nullable", "NULL", "Pesan dan konsep acara yang ingin dibawakan."],
        ["status", "ENUM('pending','approved','rejected','expired','scheduled')", "Not Null", "'pending'", "Status verifikasi oleh admin."],
        ["reviewed_by", "INT", "FK -> users.id, Nullable", "NULL", "Foreign Key admin yang memverifikasi."],
        ["reviewed_at", "DATETIME", "Nullable", "NULL", "Waktu ketika status pengajuan diputuskan."],
        ["admin_notes", "TEXT", "Nullable", "NULL", "Catatan internal admin saat mereview usulan."],
        ["created_at", "DATETIME / TIMESTAMP", "Not Null", "CURRENT_TIMESTAMP", "Waktu form pengajuan disubmit."],
        ["updated_at", "DATETIME / TIMESTAMP", "Not Null", "CURRENT_TIMESTAMP", "Waktu perubahan status."]
    ]
    add_table_data(doc, collab_headers, collab_rows, [Inches(1.2), Inches(1.2), Inches(1.4), Inches(0.8), Inches(1.9)])
    
    # 2.8 audit_logs
    add_heading_2(doc, "2.8 Tabel `audit_logs` (Rekam Jejak Keamanan Sistem & Audit Trail)")
    add_paragraph(
        doc,
        "Tabel `audit_logs` adalah entitas pencatatan peristiwa independen (Audit Trail). "
        "Merekam setiap aktivitas krusial dalam sistem, seperti perubahan status siaran langsung, suara voting masuk, "
        "dan modifikasi jadwal siaran untuk keperluan investigasi keamanan dan transparansi operasional."
    )
    audit_headers = ["Nama Kolom", "Tipe Data", "Constraints", "Default", "Keterangan Fungsional"]
    audit_rows = [
        ["id", "INT", "PK, Auto Increment, Not Null", "-", "Primary Key unik entri catatan log."],
        ["action_type", "VARCHAR(100)", "Not Null", "-", "Kode jenis aksi (e.g., 'VOTE_MASUK', 'BROADCASTING_TOGGLE')."],
        ["detail", "TEXT", "Not Null", "-", "Penjelasan komprehensif mengenai kejadian/peristiwa."],
        ["sub_detail", "VARCHAR(255)", "Nullable", "NULL", "Keterangan tambahan (e.g., nama pemilih, IP)."],
        ["ip_address", "VARCHAR(45)", "Nullable", "NULL", "IP Address asal inisiasi aktivitas."],
        ["user_agent", "VARCHAR(500)", "Nullable", "NULL", "Identitas peramban perangkat pemohon."],
        ["created_at", "DATETIME / TIMESTAMP", "Not Null", "CURRENT_TIMESTAMP", "Waktu absolut peristiwa terjadi."]
    ]
    add_table_data(doc, audit_headers, audit_rows, [Inches(1.2), Inches(1.2), Inches(1.4), Inches(0.8), Inches(1.9)])
    
    # ---------------------------------------------------------
    # BAB 3: ANALISIS RELASI & INTEGRITAS REFERENSIAL
    # ---------------------------------------------------------
    add_heading_1(doc, "3. Analisis Relasi & Integritas Referensial")
    add_paragraph(
        doc,
        "Integritas referensial menjamin bahwa hubungan antar-tabel selalu konsisten secara matematis. "
        "Di dalam database X-VOCA, aturan integritas referensial diatur dengan ketat melalui Foreign Key constraints:"
    )
    
    add_bullet_point(
        doc, "Relasi `users` ke `schedules` (1 : N dengan ON DELETE CASCADE)",
        "Satu akun admin streamer dapat membuat banyak jadwal siaran. Aturan kaskade (CASCADE) memastikan "
        "bahwa apabila akun admin dihapus secara permanen, seluruh agenda siaran yang dibuat olehnya otomatis terhapus "
        "sehingga tidak meninggalkan data sampah (orphan records) di database."
    )
    add_bullet_point(
        doc, "Relasi `games` ke `votes` (1 : N dengan ON DELETE CASCADE)",
        "Satu judul game dapat memiliki ribuan suara voting dari komunitas. Jika admin menghapus sebuah game dari katalog "
        "karena melanggar kebijakan, maka seluruh riwayat suara yang menempel pada `game_id` tersebut otomatis dibersihkan secara instan."
    )
    add_bullet_point(
        doc, "Relasi `users` ke `content_guides` (1 : N dengan ON DELETE SET NULL)",
        "Berbeda dengan jadwal siaran, arsip video rekaman (VOD) adalah aset publik yang sangat berharga bagi fansite. "
        "Oleh karena itu, jika akun user pengunggah terhapus, field `user_id` pada tabel `content_guides` diubah menjadi NULL "
        "(SET NULL), sehingga video tetap aman dan dapat terus dinikmati oleh pengunjung web."
    )
    add_bullet_point(
        doc, "Relasi `users` ke `collab_requests` (1 : N dengan ON DELETE SET NULL)",
        "Field `reviewed_by` mencatat siapa admin yang menyetujui kolaborasi. Jika admin tersebut pensiun atau akunnya dihapus, "
        "status pengajuan kolaborasi tetap tersimpan dengan nilai reviewer menjadi NULL."
    )
    
    # ---------------------------------------------------------
    # BAB 4: BUKTI NORMALISASI BASIS DATA (1NF, 2NF, 3NF)
    # ---------------------------------------------------------
    add_heading_1(doc, "4. Bukti Penerapan Kaidah Normalisasi (1NF, 2NF, 3NF)")
    add_paragraph(
        doc,
        "Struktur tabel X-VOCA telah dirancang secara ilmiah mengikuti kaidah normalisasi basis data "
        "untuk meminimalkan redundansi (duplikasi data) dan mencegah anomali insersi, pembaruan, serta penghapusan data:"
    )
    
    add_heading_2(doc, "4.1 Bentuk Normal Pertama (1NF - First Normal Form)")
    add_paragraph(
        doc,
        "Sebuah tabel memenuhi 1NF apabila setiap kolom hanya menyimpan nilai tunggal (Atomic Value) "
        "dan tidak terdapat pengulangan grup (repeating groups). Pada X-VOCA:"
    )
    add_bullet_point(
        doc, "Nilai Atomik",
        "Setiap kolom menyimpan satu fakta tunggal. Kolom `scheduled_at` menyimpan datetime utuh tanpa pemisahan manual "
        "yang berulang, dan genre disimpan secara atomik."
    )
    add_bullet_point(
        doc, "Tidak Ada Repeating Groups",
        "Sebagai contoh, suara penonton tidak disimpan sebagai array teks di dalam tabel `games` (e.g., '192.168.1.1, 192.168.1.2'), "
        "melainkan dipisahkan ke dalam entitas relasional tersendiri yaitu tabel `votes`."
    )
    
    add_heading_2(doc, "4.2 Bentuk Normal Kedua (2NF - Second Normal Form)")
    add_paragraph(
        doc,
        "Tabel memenuhi 2NF apabila telah berada pada 1NF dan seluruh atribut non-kunci bergantung secara penuh (Fully Functional Dependency) "
        "pada Primary Key, bukan hanya pada sebagian kunci komposit."
    )
    add_bullet_point(
        doc, "Ketergantungan Fungsional Penuh",
        "Seluruh tabel di X-VOCA menggunakan Primary Key berbasis ID tunggal (`id` Auto Increment). "
        "Dengan Primary Key tunggal, secara otomatis tidak ada kemungkinan terjadinya ketergantungan parsial (Partial Dependency)."
    )
    
    add_heading_2(doc, "4.3 Bentuk Normal Ketiga (3NF - Third Normal Form)")
    add_paragraph(
        doc,
        "Tabel memenuhi 3NF apabila telah memenuhi 2NF dan tidak memiliki ketergantungan transitif (Transitive Dependency), "
        "yaitu atribut non-kunci tidak boleh bergantung pada atribut non-kunci lainnya."
    )
    add_bullet_point(
        doc, "Eliminasi Ketergantungan Transitif",
        "Pada tabel `schedules`, informasi profil user pembuat (seperti nama dan email admin) tidak disimpan di dalam tabel `schedules`. "
        "Tabel `schedules` hanya menyimpan `user_id`. Jika ingin mengambil data nama admin, query dilakukan via JOIN ke tabel `users`. "
        "Hal ini mencegah redundansi nama admin yang berulang di setiap baris jadwal."
    )
    
    add_heading_2(doc, "4.4 Denormalisasi Terkontrol (Controlled Denormalization)")
    add_paragraph(
        doc,
        "Dalam rekayasa sistem berkinerja tinggi, terdapat satu bentuk denormalisasi terkontrol yang diterapkan pada X-VOCA, "
        "yaitu kolom `vote_count` pada tabel `games`:"
    )
    add_callout(
        doc,
        "Mengapa ada kolom `vote_count` di tabel `games` padahal jumlah suara bisa dihitung via COUNT(votes.id)?\n\n"
        "Alasan Performa (Optimization Trade-off):\n"
        "Landing page penonton diakses oleh ribuan audiens secara simultan. Jika setiap pemuatan halaman harus menjalankan "
        "query 'SELECT COUNT(*) FROM votes WHERE game_id = ... GROUP BY game_id', database akan terbebani komputasi berat.\n"
        "Dengan menyimpan agregat `vote_count` di tabel `games`, query daftar game berjalan dalam kompleksitas O(1) super cepat. "
        "Sinkronisasi angka dilakukan secara atomik melalui transaksi: 'UPDATE games SET vote_count = vote_count + 1 WHERE id = :id'.",
        title="POIN JAWABAN UJIAN TENTANG DENORMALISASI",
        style_type="success"
    )
    
    # ---------------------------------------------------------
    # BAB 5: ARSITEKTUR BASIS DATA HYBRID (MYSQL + FIREBASE RTDB)
    # ---------------------------------------------------------
    add_heading_1(doc, "5. Arsitektur Basis Data Hybrid (MySQL Relational + Firebase NoSQL)")
    add_paragraph(
        doc,
        "X-VOCA mengadopsi model arsitektur data hibrida (Hybrid Polyglot Persistence) yang menggabungkan keunggulan "
        "Relational Database (MySQL) dan In-Memory Realtime Database (Firebase RTDB):"
    )
    
    hybrid_headers = ["Karakteristik", "MySQL Database (Primary Store)", "Firebase Realtime Database (Sync Cache)"]
    hybrid_rows = [
        ["Model Data", "Relasional Terstruktur (Tabel, Baris, Kolom).", "Dokumen JSON Berorientasi Objek (Hierarki Pohon)."],
        ["Peran Utama", "Penyimpanan data permanen, relasi FK, agregasi, transaksi ACID.", "Distribusi event realtime kilat via WebSocket ke peramban publik."],
        ["Koneksi Protokol", "TCP/IP Connection Pool (Port 3306).", "Persisten WebSocket (WSS) Pub/Sub Engine."],
        ["Modul yang Dikelola", "Users, Games, Votes historis, Todos, Collabs, AuditLogs.", "Countdown Timer (/schedules/next), Live Pulse (/broadcasting), Votes Live."],
        ["Keandalan Transaksi", "Konsistensi Ketat (ACID Compliant) dengan proteksi deadlock.", "Kecepatan Respons Sub-Detik (<100ms) tanpa refresh browser."]
    ]
    add_table_data(doc, hybrid_headers, hybrid_rows, [Inches(1.5), Inches(2.5), Inches(2.5)])
    
    # ---------------------------------------------------------
    # BAB 6: SCRIPT JAWABAN & CHEAT SHEET TANYA JAWAB GURU
    # ---------------------------------------------------------
    add_heading_1(doc, "6. Script Jawaban & Cheat Sheet Presentasi ERD untuk Guru Penguji")
    add_paragraph(
        doc,
        "Berikut adalah rangkuman simulasi tanya jawab teknis mengenai basis data yang paling sering ditanyakan oleh guru atau penguji:"
    )
    
    add_heading_2(doc, "Q1: 'Coba jelaskan alur dan relasi ERD ini secara singkat!'")
    add_callout(
        doc,
        "Contoh Jawaban:\n"
        "\"Baik Pak/Bu, basis data X-VOCA memiliki 8 entitas utama yang terbagi menjadi 3 klaster:\n"
        "1. Klaster Manajemen Kreator: Berpusat pada tabel 'users' yang memiliki relasi One-to-Many ke tabel 'schedules' "
        "(agenda siaran), 'todos' (tugas persiapan), dan 'content_guides' (arsip video).\n"
        "2. Klaster Partisipasi Penonton: Berpusat pada tabel 'games' yang berelasi One-to-Many ke tabel 'votes'. "
        "Setiap penonton memberikan suara, transaksi dicatat di tabel 'votes' lengkap dengan sidik jari hardware dan IP address.\n"
        "3. Klaster Keamanan: Terdapat tabel 'audit_logs' yang berdiri independen untuk mencatat seluruh log aktivitas sistem "
        "secara kronologis demi menjaga transparansi operasional.\"",
        title="SCRIPT JAWABAN Q1: PENJELASAN ALUR ERD",
        style_type="info"
    )
    
    add_heading_2(doc, "Q2: 'Mengapa tabel Votes tidak memiliki Foreign Key ke tabel Users?'")
    add_callout(
        doc,
        "Contoh Jawaban:\n"
        "\"Pertanyaan yang sangat bagus Pak/Bu. Ini adalah keputusan desain arsitektur yang sengaja kami ambil berdasarkan UX dan Keamanan:\n"
        "- Dari sisi User Experience (UX): Jika voting mewajibkan penonton membuat akun atau login terlebih dahulu, "
        "tingkat partisipasi penonton akan anjlok drastis karena malas repot (friction rate tinggi).\n"
        "- Dari sisi Keamanan: Sebagai pengganti user_id, kami menerapkan Multi-Layer Anti-Spam menggunakan hardware fingerprinting "
        "dan IP Address yang diikat ke kolom 'period'. Dengan demikian, sistem tetap mampu mencegah kecurangan 1 orang voting berulang kali "
        "meskipun penonton tidak memiliki akun login di tabel users.\"",
        title="SCRIPT JAWABAN Q2: VOTE TANPA LOGIN",
        style_type="warn"
    )
    
    add_heading_2(doc, "Q3: 'Apa perbedaan aksi ON DELETE CASCADE dan ON DELETE SET NULL pada ERD Anda?'")
    add_callout(
        doc,
        "Contoh Jawaban:\n"
        "\"Perbedaannya terletak pada nilai penting dari entitas anak (child) tersebut Pak/Bu:\n"
        "- ON DELETE CASCADE kami gunakan pada relasi 'games' ke 'votes' dan 'users' ke 'schedules'. Jika induknya dihapus, "
        "anaknya ikut dihapus karena data anak tersebut tidak memiliki arti tanpa induknya.\n"
        "- ON DELETE SET NULL kami gunakan pada relasi 'users' ke 'content_guides'. Jika admin pengunggah video dihapus, "
        "videonya tidak boleh ikut terhapus karena video tersebut adalah arsip fansite publik yang masih ingin ditonton oleh penggemar. "
        "Maka sistem hanya mengubah user_id menjadi NULL tanpa merusak datanya.\"",
        title="SCRIPT JAWABAN Q3: CASCADE VS SET NULL",
        style_type="info"
    )
    
    add_heading_2(doc, "Q4: 'Bagaimana tabel ini membuktikan bahwa database Anda sudah 3NF?'")
    add_callout(
        doc,
        "Contoh Jawaban:\n"
        "\"Basis data kami sudah memenuhi 3NF karena:\n"
        "1. Sudah 1NF: Seluruh kolom bernilai atomik dan tidak ada data berulang dalam format array teks.\n"
        "2. Sudah 2NF: Seluruh tabel menggunakan Primary Key tunggal berbasis ID, sehingga mustahil ada ketergantungan parsial.\n"
        "3. Sudah 3NF: Tidak ada ketergantungan transitif. Contohnya pada tabel 'schedules', kami tidak menyimpan nama atau email admin, "
        "melainkan hanya menyimpan 'user_id'. Informasi user tersimpan murni di tabel 'users' dan dihubungkan melalui relasi relasional.\"",
        title="SCRIPT JAWABAN Q4: BUKTI 3NF",
        style_type="success"
    )
    
    # Save document
    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(output_dir, "7_Diagram_ERD_dan_Dokumentasi_Database.docx")
    doc.save(output_path)
    print(f"✅ File berhasil dibuat: {output_path}")

if __name__ == "__main__":
    build_file_7()
