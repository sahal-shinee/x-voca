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
# CONTEXTS
# ============================================================

prepend_header("web/frontend/src/context/AuthContext.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/context/AuthContext.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Pusat manajemen status otentikasi global admin (React Context API).
 * Mengatur:
 * 1. Penyimpanan state `user`, `isAuthenticated`, dan `tokenExpiresAt`.
 * 2. Fungsi `login()`: menyimpan token JWT di `localStorage` ('xvoca_admin_token') dan inisialisasi sesi.
 * 3. Fungsi `logout()`: membersihkan token dari browser dan mengalihkan halaman ke login.
 * 4. Pengecekan otomatis masa berlaku token saat aplikasi dibuka kembali (Auto Session Restore).
 * 5. Auto-logout timer: otomatis mengeluarkan admin jika token kedaluwarsa saat browser tetap terbuka.
 *
 * POIN PENJELASAN UNTUK GURU / PENGUJI:
 * - "Context API digunakan agar status login admin dapat diakses di seluruh komponen
 *   tanpa perlu prop drilling."
 * ============================================================================
 */""")

prepend_header("web/frontend/src/context/NotificationContext.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/context/NotificationContext.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Mengelola sistem antrean notifikasi Toast interaktif (Success, Error, Info, Warning).
 * Memungkinkan pemanggilan notifikasi dari komponen mana pun dengan memanggil `showToast()`.
 * ============================================================================
 */""")

prepend_header("web/frontend/src/context/ThemeContext.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/context/ThemeContext.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Mengatur konsistensi tema antarmuka Midnight Cyberpunk di seluruh komponen React.
 * ============================================================================
 */""")

# ============================================================
# HOOKS
# ============================================================

prepend_header("web/frontend/src/hooks/useFirebase.js", """/**
 * ============================================================================
 * FILE: web/frontend/src/hooks/useFirebase.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Custom React Hook untuk mendengarkan perubahan data di Firebase Realtime Database via WebSockets.
 * Mengatur:
 * 1. Pendaftaran listener realtime (`onValue`) pada node Firebase (seperti `/votes`).
 * 2. Pembaruan state komponen secara instan tanpa perlu reload halaman saat ada suara baru masuk.
 * 3. Pembersihan listener (Cleanup function: `return () => unsubscribe()`) saat komponen di-unmount
 *    untuk mencegah Memory Leak.
 *
 * POIN PENJELASAN UNTUK GURU / PENGUJI:
 * - "Hook ini mewujudkan fitur Momen Wow di mana penonton melihat angka vote naik seketika
 *   saat ada orang lain yang menekan tombol vote di tempat berbeda."
 * ============================================================================
 */""")

prepend_header("web/frontend/src/hooks/useCountdown.js", """/**
 * ============================================================================
 * FILE: web/frontend/src/hooks/useCountdown.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Custom React Hook penghitung mundur waktu (Dynamic Countdown Timer).
 * Menghitung selisih matematis antara waktu sekarang (`Date.now()`) dengan target jadwal siaran:
 * - Menghasilkan objek waktu terstruktur: `{ days, hours, minutes, seconds, isLive, isEnded }`.
 * - Melakukan pembaruan perhitungan setiap 1000 milidetik (1 detik) via `setInterval`.
 * - Membantu menampilkan status animasi denied/pulse saat siaran berstatus LIVE NOW.
 * ============================================================================
 */""")

prepend_header("web/frontend/src/hooks/useAuth.js", """/**
 * ============================================================================
 * FILE: web/frontend/src/hooks/useAuth.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Shortcut hook untuk mengakses AuthContext secara bersih dan aman.
 * Menghindari pemanggilan `useContext(AuthContext)` berulang kali di banyak file.
 * ============================================================================
 */""")

prepend_header("web/frontend/src/hooks/useDashboardStats.js", """/**
 * ============================================================================
 * FILE: web/frontend/src/hooks/useDashboardStats.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Hook pengambil metrik statistik analitik Studio Admin (total suara, jadwal terdekat, log aktivitas).
 * ============================================================================
 */""")

# ============================================================
# SERVICES
# ============================================================

prepend_header("web/frontend/src/services/api.js", """/**
 * ============================================================================
 * FILE: web/frontend/src/services/api.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Instance Axios terpusat sebagai klien HTTP utama komunikasi frontend ke backend.
 * Mengonfigurasi:
 * 1. `baseURL`: Menyesuaikan URL backend dari environment (`VITE_API_URL` atau localhost:3001).
 * 2. Request Interceptor: Otomatis menyisipkan header `Authorization: Bearer <token>`
 *    dari localStorage ke setiap request endpoint privat.
 * 3. Response Interceptor: Menangkap respons error status 401 Unauthorized dan
 *    otomatis mengarahkan admin kembali ke halaman login jika token sudah kedaluwarsa.
 * ============================================================================
 */""")

prepend_header("web/frontend/src/services/gameService.js", """/**
 * ============================================================================
 * FILE: web/frontend/src/services/gameService.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Layanan pemanggil API untuk katalog game dan voting:
 * - `getGames()`: Mengambil daftar kandidat game.
 * - `submitVote(gameId, fingerprint)`: Mengirim suara penonton beserta hardware fingerprint.
 * - `submitGameRequest(gameData)`: Mengajukan usulan game baru penonton.
 * - `updateGameStatus(id, status)`: Moderasi admin mengubah siklus status game.
 * ============================================================================
 */""")

prepend_header("web/frontend/src/services/scheduleService.js", """/**
 * ============================================================================
 * FILE: web/frontend/src/services/scheduleService.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Layanan pemanggil API jadwal siaran streaming (CRUD jadwal, update status live).
 * ============================================================================
 */""")

prepend_header("web/frontend/src/services/contentService.js", """/**
 * ============================================================================
 * FILE: web/frontend/src/services/contentService.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Layanan pemanggil API arsip video VOD Content Guide (fetch katalog, toggle spotlight).
 * ============================================================================
 */""")

# ============================================================
# UTILS
# ============================================================

prepend_header("web/frontend/src/utils/fingerprint.js", """/**
 * ============================================================================
 * FILE: web/frontend/src/utils/fingerprint.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Helper pembuat identitas unik perangkat peramban menggunakan pustaka `@fingerprintjs/fingerprintjs`.
 * Mengatur:
 * 1. Ekstraksi hash hardware perangkat penonton (Canvas, WebGL, Screen, Audio Stack)
 *    menghasilkan string 32-karakter unik (`visitorId`).
 * 2. Caching identitas di `localStorage` agar tidak membebani komputasi peramban.
 * 3. Mekanisme fallback acak jika adblocker memblokir script fingerprint.
 * 4. Fungsi penanda lokal `hasVoted()` dan `markVoted()` untuk respon instan antarmuka.
 *
 * POIN PENJELASAN UNTUK GURU / PENGUJI:
 * - "Inilah inti dari sistem voting Zero-Login X-VOCA. Penonton tidak perlu mendaftar akun,
 *   tetapi kecurangan suara dicegah karena hash perangkatnya terkunci 1 suara per game per bulan."
 * ============================================================================
 */""")

prepend_header("web/frontend/src/utils/pdfExport.js", """/**
 * ============================================================================
 * FILE: web/frontend/src/utils/pdfExport.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Helper ekspor dokumen laporan resmi rekapitulasi voting bulanan ke dalam format PDF.
 * Memanfaatkan pustaka:
 * - `html2canvas`: Menangkap tangkapan visual elemen tabel HTML dengan fidelitas tinggi.
 * - `jspdf`: Menyusun tata letak lembar cetak dokumen A4 dan menghasilkan file PDF siap unduh.
 * ============================================================================
 */""")

prepend_header("web/frontend/src/utils/firebase.js", """/**
 * ============================================================================
 * FILE: web/frontend/src/utils/firebase.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Konfigurasi inisialisasi Firebase Web SDK di sisi peramban klien.
 * Mengatur koneksi ke Firebase Realtime Database menggunakan API Key dan Database URL dari .env.
 * ============================================================================
 */""")
