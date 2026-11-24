import os

def prepend_header(filepath, header_text):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "FILE: web/frontend/" in content:
        print(f"Already commented: {filepath}")
        return
        
    new_content = header_text.strip() + "\n\n" + content
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Successfully annotated: {filepath}")

# ============================================================
# APP & ENTRY POINT
# ============================================================

prepend_header("web/frontend/src/App.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/App.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Pusat rute aplikasi React (React Router DOM v6).
 * Memetakan jalur URL dengan komponen halaman yang sesuai:
 * - Rute Publik Penonton: `/` (HomePage), `/voting` (VotingPage), `/content-guide` (ContentGuidePage).
 * - Rute Autentikasi: `/admin/login` (LoginPage).
 * - Rute Privat Studio Admin: Seluruh rute `/admin/*` dibungkus komponen `ProtectedRoute`
 *   agar tidak bisa dimasuki tanpa token JWT yang sah.
 * ============================================================================
 */""")

prepend_header("web/frontend/src/main.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/main.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Titik awal (Entry Point) eksekusi React 18 di browser.
 * Menginjeksi root virtual DOM ke dalam elemen `<div id="root">` di `index.html`.
 * Membungkus seluruh aplikasi dengan `BrowserRouter`, `AuthProvider`, `NotificationProvider`, dan `ThemeProvider`.
 * ============================================================================
 */""")

# ============================================================
# VIEWER PAGES
# ============================================================

prepend_header("web/frontend/src/pages/viewer/HomePage.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/pages/viewer/HomePage.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Halaman beranda utama portal fansite X-VOCA.
 * Mengintegrasikan:
 * 1. HeroSection: Kartu karakter interaktif, selector aura/mood, dan status Live Ready.
 * 2. CountdownCard: Timer dinamis menghitung mundur ke jadwal siaran streaming terdekat.
 * 3. ScheduleSection: Kalender siaran streaming mingguan.
 * 4. EquipmentSection: Profil perangkat keras dan rig virtual streaming.
 * ============================================================================
 */""")

prepend_header("web/frontend/src/pages/viewer/VotingPage.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/pages/viewer/VotingPage.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Pusat interaksi voting game bulanan komunitas penonton X-VOCA.
 * Fitur Andalan:
 * 1. Quick Vote (Top 3): Menampilkan 3 kandidat game teratas untuk voting instan.
 * 2. Daftar Game Lengkap: Filter status game (Requested, Accepted, Playing, Done) dan pencarian judul.
 * 3. Ekstraksi Fingerprint: Mengambil hash hardware browser untuk validasi anti-spam zero-login.
 * 4. Real-time Firebase Sync: Menggunakan hook `useFirebase('votes')` sehingga persentase
 *    dan jumlah suara ter-update live tanpa reload saat ada suara baru masuk.
 * 5. Tombol '+ Request Game': Membuka formulir pengajuan game baru dengan cooldown 7 hari.
 * ============================================================================
 */""")

prepend_header("web/frontend/src/pages/viewer/ContentGuidePage.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/pages/viewer/ContentGuidePage.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Halaman katalog arsip rekaman siaran (Content Guide / VOD Catalog).
 * Menampilkan:
 * 1. Strip Statistik Real-time: Total video, total kategori aktif, dan konten baru 7 hari terakhir.
 * 2. Featured Video Spotlight: Cuplikan siaran terbaik yang disematkan kreator.
 * 3. Filter Kategori Game: Menyaring video berdasarkan genre/game tertentu.
 * 4. Modal Pemutar Video YouTube: Menonton rekaman siaran langsung tanpa meninggalkan website.
 * ============================================================================
 */""")

# ============================================================
# ADMIN PAGES
# ============================================================

prepend_header("web/frontend/src/pages/admin/LoginPage.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/pages/admin/LoginPage.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Formulir otentikasi login khusus administrator/kreator Studio X-VOCA.
 * Memvalidasi input email dan password, mengirim request POST ke `/api/auth/login`,
 * dan menyimpan token JWT ke `AuthContext` serta `localStorage` sebelum mengarahkan ke dashboard.
 * ============================================================================
 */""")

prepend_header("web/frontend/src/pages/admin/DashboardPage.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/pages/admin/DashboardPage.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Layar ringkasan analitik utama Creator Studio.
 * Menampilkan metrik cepat:
 * 1. Total suara voting yang terkumpul pada periode bulan berjalan.
 * 2. Status siaran langsung saat ini (Broadcasting status toggle).
 * 3. Agenda siaran terdekat dan pintasan cepat ke modul manajemen.
 * 4. Daftar 10 aktivitas log terbaru (AuditLogViewer) untuk memantau keamanan operasional.
 * ============================================================================
 */""")

prepend_header("web/frontend/src/pages/admin/VotingModerationPage.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/pages/admin/VotingModerationPage.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Panel moderasi voting game untuk kreator/admin:
 * 1. Meninjau usulan game penonton yang berstatus 'requested' dan menyetujuinya ('accepted')
 *    agar muncul di halaman voting publik.
 * 2. Memperbarui siklus hidup game yang sedang dimainkan ('playing') dan selesai ('done').
 * 3. Reset Periode Voting: Membuka periode bulan baru dan mengarsipkan suara lama.
 * 4. Ekspor Laporan Resmi: Mencetak rekapitulasi perolehan suara bulanan ke format dokumen PDF resmi.
 * ============================================================================
 */""")

prepend_header("web/frontend/src/pages/admin/SchedulePage.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/pages/admin/SchedulePage.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Pengelolaan jadwal siaran streaming (Schedule Manager):
 * 1. Menambah, mengedit, dan menghapus jadwal siaran mingguan.
 * 2. Mengubah status jadwal menjadi 'live' secara manual.
 * 3. Fitur One-Click Archive: Menyalin siaran yang telah selesai langsung ke arsip Content Guide.
 * ============================================================================
 */""")

prepend_header("web/frontend/src/pages/admin/ContentManagementPage.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/pages/admin/ContentManagementPage.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Pengelolaan katalog arsip video rekaman VOD:
 * 1. Menambah video baru dengan deteksi otomatis judul & thumbnail dari Google YouTube Data API.
 * 2. Mengatur video mana yang dijadikan pin spotlight utama (`is_featured`).
 * 3. Mengatur visibilitas publik video (publik / tersembunyi).
 * ============================================================================
 */""")

prepend_header("web/frontend/src/pages/admin/CollabRequestsPage.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/pages/admin/CollabRequestsPage.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Kotak masuk peninjauan usulan kolaborasi streamer dari komunitas penggemar.
 * Admin dapat memverifikasi link streamer dan memperbarui status ajuan (Reviewed/Accepted/Rejected).
 * ============================================================================
 */""")

prepend_header("web/frontend/src/pages/admin/TodoPage.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/pages/admin/TodoPage.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Catatan kerja dan checklist persiapan operasional internal streamer.
 * ============================================================================
 */""")

prepend_header("web/frontend/src/pages/admin/SettingsPage.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/pages/admin/SettingsPage.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Pengaturan akun admin: ganti nama profil, rig version, dan pergantian kata sandi (Change Password).
 * ============================================================================
 */""")

# ============================================================
# KEY COMPONENTS
# ============================================================

prepend_header("web/frontend/src/components/admin/ProtectedRoute.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/components/admin/ProtectedRoute.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Penjaga rute sisi klien (Route Guard).
 * Memeriksa status `isAuthenticated` dari `AuthContext`:
 * - Jika admin sah: merender komponen halaman tujuan (`children`).
 * - Jika tidak terotentikasi: menendang pengguna otomatis ke `/admin/login`.
 * ============================================================================
 */""")

prepend_header("web/frontend/src/components/viewer/HeroSection.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/components/viewer/HeroSection.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Komponen showcase kartu profil utama Xion Regalia di landing page:
 * - Selector aura/mood visual karakter interaktif.
 * - Indikator status Live Ready.
 * - Integrasi dengan kartu Countdown Timer.
 * ============================================================================
 */""")

prepend_header("web/frontend/src/components/viewer/CountdownCard.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/components/viewer/CountdownCard.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Komponen kartu penghitung mundur waktu dinamis menuju siaran terdekat.
 * Menggunakan hook `useCountdown` untuk update detik secara matematis.
 * ============================================================================
 */""")

prepend_header("web/frontend/src/components/viewer/CollabRequestModal.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/components/viewer/CollabRequestModal.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Dialog modal formulir publik bagi penonton untuk merekomendasikan kolaborasi streamer.
 * ============================================================================
 */""")

prepend_header("web/frontend/src/components/admin/ExportPdfModal.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/components/admin/ExportPdfModal.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Modal dialog pratinjau dan ekspor laporan resmi rekapitulasi voting bulanan ke format dokumen PDF.
 * ============================================================================
 */""")
