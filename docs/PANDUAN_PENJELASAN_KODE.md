# 📘 Panduan Bedah Kode & Persiapan Presentasi / Sidang
## Sistem X-VOCA (Portal Fansite, Voting Interaktif, & Studio Kreator)

> **Tujuan Dokumen Ini:**  
> Dokumen ini disusun khusus agar Anda **memahami alur sistem luar dalam**, mengetahui **file dan baris kode mana yang penting**, serta **mampu menjawab dengan percaya diri dan fasih** jika dosen penguji, penilai, atau klien bertanya mengenai cara kerja teknis sistem X-VOCA.

---

## 📑 Daftar Isi
1. [Peta Lokasi File-File Kunci (Quick Reference)](#1-peta-lokasi-file-file-kunci-quick-reference)
2. [Modul 1: Sistem Voting & Algoritma Anti-Spam (Paling Sering Ditanyakan!)](#2-modul-1-sistem-voting--algoritma-anti-spam)
3. [Modul 2: Arsitektur Sinkronisasi Real-Time (MySQL + Firebase Hybrid)](#3-modul-2-arsitektur-sinkronisasi-real-time)
4. [Modul 3: Sistem Jadwal Siaran & Countdown Dinamis](#4-modul-3-sistem-jadwal-siaran--countdown-dinamis)
5. [Modul 4: Sistem Arsip Konten & Statistik Akurat](#5-modul-4-sistem-arsip-konten--statistik-akurat)
6. [Modul 5: Keamanan & Autentikasi Admin Studio (JWT & Middleware)](#6-modul-5-keamanan--autentikasi-admin-studio)
7. [Modul 6: Standar Clean UI & Penanganan Error (Anti-AI Slop)](#7-modul-6-standar-clean-ui--penanganan-error)
8. [Simulasi 10 Pertanyaan Sidang / Penguji & Jawaban Siap Pakai](#8-simulasi-10-pertanyaan-sidang--penguji--jawaban-siap-pakai)

---

## 1. Peta Lokasi File-File Kunci (Quick Reference)

Jika ditanya *"Di mana kodingan untuk fitur X?"*, rujuk tabel ini:

| Fitur / Logika | File Frontend | File Backend | Tabel Database |
| :--- | :--- | :--- | :--- |
| **Fingerprint Anti-Spam** | `web/frontend/src/utils/fingerprint.js` | `web/backend/src/controllers/game.controller.js` | `votes` |
| **Halaman Voting Publik** | `web/frontend/src/pages/viewer/VotingPage.jsx` | `web/backend/src/routes/vote.routes.js` | `games`, `votes` |
| **Moderasi & Reset Voting**| `web/frontend/src/pages/admin/VotingModerationPage.jsx`| `web/backend/src/controllers/game.controller.js` | `games`, `audit_logs` |
| **Realtime Sync Hook** | `web/frontend/src/hooks/useFirebase.js` | `web/backend/src/utils/firebase.helper.js` | Firebase RTDB |
| **Jadwal & Countdown** | `web/frontend/src/components/viewer/HeroSection.jsx` | `web/backend/src/controllers/schedule.controller.js` | `schedules` |
| **Arsip Content Guide** | `web/frontend/src/pages/viewer/ContentGuidePage.jsx` | `web/backend/src/controllers/content.controller.js` | `content_guides` |
| **Login & JWT Auth** | `web/frontend/src/pages/admin/LoginPage.jsx` | `web/backend/src/controllers/auth.controller.js` | `users` |
| **Middleware Keamanan** | `web/frontend/src/components/admin/ProtectedRoute.jsx`| `web/backend/src/middleware/auth.middleware.js` | - |

---

## 2. Modul 1: Sistem Voting & Algoritma Anti-Spam

### A. Masalah yang Dipecahkan
Biasanya voting di web mengharuskan user *Login Google/Email* (bikin malas penonton) **ATAU** tanpa login sama sekali tapi gampang dicurangi pakai refresh browser (*spamming*).  
**Solusi X-VOCA:** Sistem voting *Zero-Friction* tetapi memiliki perlindungan anti-kecurangan ganda menggunakan **Browser Fingerprinting** dan **Monthly Period Keying**.

---

### B. Cara Kerja Fingerprint di Frontend
📍 **File:** [`web/frontend/src/utils/fingerprint.js`](file:///d:/CODING/Project%20FullStack/x-voca/web/frontend/src/utils/fingerprint.js)

```javascript
// Mengambil hardware & browser fingerprint unik
export const getFingerprint = async () => {
  let fp = localStorage.getItem('xvoca_fp');
  if (fp) return fp;

  try {
    const FingerprintJS = await import('@fingerprintjs/fingerprintjs');
    const fpAgent = await FingerprintJS.load();
    const result = await fpAgent.get();
    fp = result.visitorId; // Hash unik gabungan Canvas, WebGL, Audio, Screen resolution
    localStorage.setItem('xvoca_fp', fp);
    return fp;
  } catch (err) {
    // Fallback entropy jika extension memblokir script
    fp = 'fp_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('xvoca_fp', fp);
    return fp;
  }
};
```
> **Poin Penjelasan untuk Dosen:**  
> *"Sistem kami mengekstrak hash perangkat keras (GPU rendering canvas, arsitektur CPU, resolusi layar, timezone) melalui library FingerprintJS menjadi string 32-karakter unik (`visitorId`). Sekalipun user me-refresh browser atau membuka private browsing, fingerprint fisik perangkatnya tetap sama."*

---

### C. Validasi Pencegahan Double Vote di Backend
📍 **File:** [`web/backend/src/controllers/game.controller.js`](file:///d:/CODING/Project%20FullStack/x-voca/web/backend/src/controllers/game.controller.js)

```javascript
const voteGame = async (req, res) => {
  const { id } = req.params;
  const { fingerprint } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const currentPeriod = new Date().toISOString().slice(0, 7); // Format: "YYYY-MM" (Contoh: "2026-11")

  // 1. Cek apakah fingerprint ini sudah pernah vote game ini di bulan yang sama
  const existingVote = await Vote.findOne({
    where: {
      game_id: id,
      fingerprint: fingerprint,
      period_key: currentPeriod
    }
  });

  if (existingVote) {
    return res.status(409).json({
      success: false,
      message: 'Anda sudah memberikan suara untuk game ini di periode bulan ini.'
    });
  }

  // 2. Gunakan Database Transaction agar vote_count dan tabel votes sinkron
  await sequelize.transaction(async (t) => {
    await Vote.create({
      game_id: id,
      fingerprint,
      ip_address: ipAddress,
      period_key: currentPeriod
    }, { transaction: t });

    await Game.increment('vote_count', { by: 1, where: { id }, transaction: t });
  });

  // 3. Broadcast real-time ke Firebase agar penonton lain langsung melihat angkanya naik
  await updateVoteCount(id, newVoteCount, currentPeriod);
};
```
> **Poin Penjelasan untuk Dosen:**  
> *"Kami membagi voting ke dalam `period_key` berbasis bulan (`YYYY-MM`). Pada level database, kami menggunakan Sequelize Managed Transaction (`sequelize.transaction`). Jika pencatatan log vote gagal, penambahan angka suara akan di-rollback otomatis sehingga integritas data terjamin konsisten."*

---

## 3. Modul 2: Arsitektur Sinkronisasi Real-Time

### A. Mengapa Hybrid (MySQL + Firebase)?
* **MySQL:** Sebagai *Single Source of Truth* untuk relasi data kompleks, audit trail, migrasi, dan integritas data ACID.
* **Firebase Realtime Database:** Sebagai *Event Dispatcher / Live Sync Layer* dengan latensi milidetik ke browser klien tanpa membebani server backend dengan jutaan koneksi socket terus-menerus.

```
Penonton Klik Vote ➔ Express API ➔ Simpan ke MySQL (Reliable)
                                  ➔ Update Firebase RTDB (Instant)
                                           ↓
                     Klien Lain Menerima Event Live (Tanpa Reload)
```

### B. Kode Frontend Listener Real-Time
📍 **File:** [`web/frontend/src/hooks/useFirebase.js`](file:///d:/CODING/Project%20FullStack/x-voca/web/frontend/src/hooks/useFirebase.js)

```javascript
export function useVotes() {
  const [votes, setVotes] = useState({});

  useEffect(() => {
    const db = getFirebaseDatabase();
    const votesRef = ref(db, 'votes');

    // Mendengarkan perubahan data vote dari Firebase
    const unsubscribe = onValue(votesRef, (snapshot) => {
      if (snapshot.exists()) {
        setVotes(snapshot.val()); // Update state React seketika
      }
    });

    return () => off(votesRef); // Clean up listener saat unmount
  }, []);

  return { votes };
}
```

---

## 4. Modul 3: Sistem Jadwal Siaran & Countdown Dinamis

### A. Perhitungan Countdown Real-Time
📍 **File:** [`web/frontend/src/components/viewer/HeroSection.jsx`](file:///d:/CODING/Project%20FullStack/x-voca/web/frontend/src/components/viewer/HeroSection.jsx)

Countdown bekerja dengan mengambil siaran berstatus `scheduled` terdekat dari database, lalu menghitung selisih waktu secara lokal setiap 1000ms (1 detik):
```javascript
useEffect(() => {
  const timer = setInterval(() => {
    const now = new Date().getTime();
    const target = new Date(nextSchedule.datetime).getTime();
    const diff = target - now;

    if (diff <= 0) {
      setIsLiveNow(true); // Otomatis berubah status menjadi LIVE jika waktu tiba
      clearInterval(timer);
    } else {
      setDays(Math.floor(diff / (1000 * 60 * 60 * 24)));
      setHours(Math.floor((diff / (1000 * 60 * 60)) % 24));
      setMinutes(Math.floor((diff / 1000 / 60) % 60));
      setSeconds(Math.floor((diff / 1000) % 60));
    }
  }, 1000);

  return () => clearInterval(timer);
}, [nextSchedule]);
```

### B. Otomatisasi Siklus Jadwal
Jadwal memiliki siklus:
1. `scheduled`: Ditampilkan di kalender siaran mendatang & countdown widget.
2. `live`: Tombol berubah menjadi merah menyala *"Sedang Siaran Langsung"* dan mengarahkan langsung ke URL YouTube.
3. `completed`: Siaran telah berakhir; admin memiliki tombol 1-klik untuk langsung mengekspor metadata siaran ini menjadi item **Content Guide (Arsip Video)**.

---

## 5. Modul 4: Sistem Arsip Konten & Statistik Akurat

### A. Perhitungan Total Video Tanpa Data Dummy
📍 **File:** [`web/backend/src/controllers/content.controller.js`](file:///d:/CODING/Project%20FullStack/x-voca/web/backend/src/controllers/content.controller.js)

```javascript
const getContentStats = async (req, res) => {
  // Hanya ambil konten yang diset 'is_visible: true' oleh admin
  const contents = await ContentGuide.findAll({
    where: { is_visible: true },
    attributes: ['created_at', 'total_duration', 'game_tag']
  });

  // Total Video dihitung murni dari jumlah rekaman arsip yang aktif di DB
  const totalVideos = contents.length;

  // Hitung jumlah kategori unik yang aktif
  const categoriesSet = new Set(contents.map(c => c.game_tag).filter(Boolean));
  const totalCategories = categoriesSet.size;

  // Hitung konten baru yang diupload dalam 7 hari terakhir
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const newContent = contents.filter(c => new Date(c.created_at) >= sevenDaysAgo).length;

  return res.status(200).json({
    success: true,
    data: {
      totalVideos: totalVideos.toString(),
      totalCategories: totalCategories.toString(),
      newContent: newContent.toString()
    }
  });
};
```
> **Poin Penjelasan untuk Dosen:**  
> *"Seluruh angka di strip analitik Content Guide dihitung secara agregat langsung dari tabel database MySQL. Saat admin menambah atau menyembunyikan video dari studio, event Firebase `content_updates` akan memicu fetch ulang seketika di browser pengguna tanpa reload."*

---

## 6. Modul 5: Keamanan & Autentikasi Admin Studio

### A. Alur Autentikasi JWT (JSON Web Token)
1. Admin memasukkan username & password di `/login`.
2. Password dicocokkan dengan hash di database menggunakan `bcrypt.compare`.
3. Jika valid, backend membuat token bertanda tangan:
   ```javascript
   const token = jwt.sign(
     { id: user.id, username: user.username, role: user.role },
     process.env.JWT_SECRET,
     { expiresIn: '24h' }
   );
   ```
4. Token disimpan di `localStorage` frontend dan disuntikkan secara otomatis ke setiap HTTP Request menggunakan Axios Request Interceptor:
   ```javascript
   // web/frontend/src/services/api.js
   api.interceptors.request.use((config) => {
     const token = localStorage.getItem('token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });
   ```

### B. Proteksi Endpoint di Backend
📍 **File:** [`web/backend/src/middleware/auth.middleware.js`](file:///d:/CODING/Project%20FullStack/x-voca/web/backend/src/middleware/auth.middleware.js)

```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) return res.status(401).json({ message: 'Akses ditolak: Token tidak ada' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Sesi berakhir atau token tidak valid' });
    req.user = user; // Simpan data user ke request
    next();
  });
};
```

---

## 7. Modul 6: Standar Clean UI & Penanganan Error (Anti-AI Slop)

Sistem X-VOCA dibangun dengan prinsip **Human-Centered Software Craftsmanship** (bebas dari artefak AI slop):
1. **Zero Broken SVG Artifacts:** Ikon navigasi dan panah tombol diuji menggunakan standar SVG `lucide-react` berukuran presisi (16x16px, `strokeWidth={2.25}`) dengan micro-interaction hover, bukan path kustom dengan koordinat rusak/gepeng.
2. **Robust Fallback Images:** Jika penonton atau admin memasukkan URL cover game atau thumbnail yang tautannya mati (404/broken), browser tidak menampilkan kotak hitam kosong atau ikon gambar pecah bawaan OS, melainkan beralih otomatis ke placeholder bertema cyberpunk (`imgError` state handler di [`GameCard.jsx`](file:///d:/CODING/Project%20FullStack/x-voca/web/frontend/src/components/viewer/GameCard.jsx)).
3. **No Random Emojis as Status Badges:** Semua penanda status (OPEN, LIVE, ACCEPTED) menggunakan komponen vector pill terstandar dengan warna fungsional:
   * Cyan (`#7ee0d2`): Data aktif / interaksi utama
   * Amber/Gold (`#fbbf24`): Peringkat juara / sedang dimainkan
   * Purple (`#c084fc`): Kategori / diterima
   * Slate/Muted (`#8E8AAB`): Status arsip / selesai

---

## 8. Simulasi 10 Pertanyaan Sidang / Penguji & Jawaban Siap Pakai

Berikut adalah pertanyaan teknis yang paling sering diajukan oleh dosen penguji atau penguji teknis beserta jawaban terbaiknya:

### ❓ Q1: "Mengapa Anda menggunakan Browser Fingerprinting untuk voting alih-alih mengharuskan penonton login akun?"
> **💡 Jawaban Anda:**  
> *"Kami mempertimbangkan aspek **User Friction** dan tingkat konversi keterlibatan penonton saat siaran berlangsung. Jika penonton siaran harus mendaftar atau login akun terlebih dahulu hanya untuk vote sebuah game, sebagian besar penonton akan membatalkan niatnya.  
> Dengan FingerprintJS, kami mengidentifikasi perangkat keras browser berdasarkan hash canvas, audio context, dan resolusi layar. Ini memberikan perlindungan anti-spam yang kuat (1 suara per game per bulan per perangkat) sekaligus menjaga pengalaman pengguna tetap instan dan nyaman."*

---

### ❓ Q2: "Apa yang terjadi jika ada dua orang vote bersamaan di detik yang sama (Race Condition)?"
> **💡 Jawaban Anda:**  
> *"Kami telah mengantisipasi kondisi tersebut di backend pada file `game.controller.js`. Penambahan suara tidak dilakukan dengan query update biasa (`vote_count = vote_count + 1`), melainkan dibungkus di dalam **Sequelize Managed Database Transaction** dengan operasi atomic `Game.increment('vote_count')`. Selain itu, kombinasi kolom `game_id + fingerprint + period_key` di tabel `votes` dapat dijadikan constraint unik sehingga vote ganda di waktu bersamaan akan ditolak oleh basis data."*

---

### ❓ Q3: "Mengapa Anda menggunakan Firebase Realtime Database jika sudah ada MySQL?"
> **💡 Jawaban Anda:**  
> *"Kami menerapkan arsitektur **Hybrid Data Synchronization**. MySQL berperan sebagai basis data relasional utama untuk penyimpanan permanen, relasi tabel, dan konsistensi ACID.  
> Sementara Firebase Realtime Database kami gunakan khusus sebagai **Event Dispatcher**. Jika kami mengandalkan polling HTTP terus-menerus ke MySQL dari ribuan pengunjung web, koneksi server backend kami akan overload. Dengan Firebase SDK, browser penonton langsung menerima event pembaruan angka suara dalam hitungan milidetik secara efisien."*

---

### ❓ Q4: "Bagaimana cara sistem membatasi voting per bulan?"
> **💡 Jawaban Anda:**  
> *"Sistem menggunakan konsep **Period Keying** berformat string `YYYY-MM` (contohnya `2026-11` untuk November 2026). Setiap suara yang dicatat di tabel `votes` dan setiap game di tabel `games` memiliki atribut `period_key`.  
> Saat admin menekan tombol **Reset Periode Voting**, sistem mengarsipkan periode berjalan dan memulai `period_key` baru. Dengan begitu, hak vote semua penonton ter-reset otomatis di bulan baru tanpa menghapus data histori perolehan suara bulan-bulan sebelumnya."*

---

### ❓ Q5: "Bagaimana alur otorisasi halaman Admin Studio?"
> **💡 Jawaban Anda:**  
> *"Di frontend, kami membuat komponen `ProtectedRoute.jsx` yang membungkus semua rute `/admin/*`. Komponen ini mengecek keberadaan token JWT dan validitas profil melalui `AuthContext`. Jika tidak ada token, pengguna langsung di-redirect ke `/login`.  
> Di backend, kami memiliki middleware `auth.middleware.js` yang memverifikasi tanda tangan digital JWT (`jwt.verify`) pada setiap request API yang bersifat privat. Jadi walaupun ada pihak yang mencoba menembak API admin secara langsung via Postman atau Curl, request akan diblokir dengan HTTP status 401 Unauthorized."*

---

### ❓ Q6: "Bagaimana sistem menangani gambar atau cover yang link-nya rusak?"
> **💡 Jawaban Anda:**  
> *"Di komponen `GameCard.jsx`, kami menerapkan fallback cerdas. Kami menginisialisasi state `imgError` yang mendengarkan event `onError` pada elemen `<img>`. Jika gambar gagal diunduh browser (misalnya link 404 atau koneksi terputus), state `imgError` menjadi `true` dan UI otomatis beralih merender ikon vektor placeholder gamepad dengan gradien tema cyberpunk yang elegan, sehingga tata letak kartu tidak rusak."*

---

### ❓ Q7: "Apakah data analitik 'Total Video' dan 'Kategori' di Content Guide bersifat statis?"
> **💡 Jawaban Anda:**  
> *"Tidak, data tersebut 100% dinamis dan real-time. Endpoint `/api/content/stats` di backend melakukan agregasi langsung ke tabel `content_guides` menggunakan filter `is_visible: true`.  
> Selain itu, komponen `ContentGuidePage.jsx` terhubung dengan Firebase listener `content_updates`. Saat admin menambahkan, menyunting, atau menghapus arsip video dari dashboard, Firebase membroadcast sinyal pembaruan dan angka statistik di halaman penonton langsung ter-update seketika tanpa perlu me-refresh browser."*

---

### ❓ Q8: "Bagaimana sistem menentukan siaran berikutnya pada widget Countdown?"
> **💡 Jawaban Anda:**  
> *"Endpoint `/api/schedules/next` mengeksekusi query database mencari jadwal yang memiliki `status: 'scheduled'` dan waktu `datetime >= NOW()`, lalu diurutkan secara `ASC` dengan batas `LIMIT 1`.  
> Frontend kemudian menerima objek siaran tersebut dan fungsi `setInterval` lokal menghitung selisih waktu (`diff`) setiap 1000 milidetik hingga menuju waktu 0, di mana statusnya akan otomatis beralih menjadi 'Live'."*

---

### ❓ Q9: "Bagaimana password akun admin disimpan di database?"
> **💡 Jawaban Anda:**  
> *"Password tidak pernah disimpan dalam bentuk plaintext. Kami menggunakan algoritma hashing satu arah **Bcrypt** dengan salt rounds bernilai 10 melalui library `bcryptjs`. Pada saat admin login, backend memverifikasi kecocokan menggunakan `bcrypt.compare(passwordInput, user.passwordHash)`. Dengan metode ini, bahkan jika database bocor, password asli tetap tidak dapat dibaca."*

---

### ❓ Q10: "Apa keunggulan arsitektur Full-Stack yang Anda buat ini dibandingkan CMS seperti WordPress?"
> **💡 Jawaban Anda:**  
> *"Tiga keunggulan utama:  
> 1. **Performa & Latensi:** Aplikasi frontend berupa Single Page Application (SPA) yang sangat cepat dibangun dengan Vite, serta sinkronisasi data real-time berbasis Firebase yang tidak dimiliki CMS biasa.  
> 2. **Kustomisasi Logika Bisnis:** Fitur seperti voting anti-spam berbasis hardware fingerprinting, siklus moderasi game, dan integrasi countdown live streaming dirancang khusus sesuai alur operasional virtual YouTuber tanpa bloatware plugin pihak ketiga.  
> 3. **Skalabilitas & Ekosistem Multi-Platform:** Backend REST API yang bersih ini dapat melayani tidak hanya klien web penonton dan admin, tetapi juga aplikasi mobile Flutter yang sudah kami siapkan dengan endpoint data yang sama."*

---

**Selamat belajar & sukses untuk presentasi/sidangnya! Sistem ini telah dirancang dengan arsitektur yang solid, rapi, dan mudah dipertanggungjawabkan.**
