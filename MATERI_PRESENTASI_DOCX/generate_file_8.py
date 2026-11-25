import os
from docx.shared import Inches, Pt, RGBColor
from doc_builder import (
    create_base_document, add_header_banner, add_heading_1, add_heading_2,
    add_heading_3, add_paragraph, add_bullet_point, add_callout,
    add_table_data, add_code_block, COLOR_PRIMARY, COLOR_SECONDARY, COLOR_ACCENT
)

def build_file_8():
    doc = create_base_document()

    # =========================================================================
    # HEADER BANNER & IDENTITAS DOKUMEN
    # =========================================================================
    add_header_banner(
        doc,
        title="File 8: Justifikasi Teknologi Stack & Arsitektur Decoupled MVC",
        subtitle="Analisis Ilmiah Pemilihan React.js & Express.js, Komparasi Mendalam Head-to-Head vs Laravel, Implementasi Pola MVC Modern, Alur Eksekusi Data, dan Naskah Sidang Presentasi",
        tag="X-VOCA DOKUMEN AKADEMIK & TEKNIKAL SIDANG"
    )

    add_callout(
        doc,
        "Dokumen ini dirancang khusus untuk membekali Anda menjawab pertanyaan paling krusial dari guru penguji: "
        "'Mengapa membuat sistem dengan React dan Express? Mengapa tidak menggunakan Laravel yang sudah populer? "
        "Apakah aplikasi ini menerapkan konsep MVC?'\n\n"
        "Gunakan analogi sederhana, tabel komparasi, dan skrip berbicara yang telah disediakan di dokumen ini "
        "agar argumen Anda terdengar terstruktur, percaya diri, dan berstandar rekayasa perangkat lunak profesional.",
        title="PANDUAN EKSKLUSIF PERSIAPAN SIDANG TUGAS AKHIR / UJIAN PRAKTIK",
        style_type="info"
    )

    # =========================================================================
    # BAB 1: JUSTIFIKASI PEMILIHAN TEKNOLOGI STACK (MENGAPA MEMILIH INI?)
    # =========================================================================
    add_heading_1(doc, "1. Justifikasi Pemilihan Teknologi: React.js & Express.js")
    add_paragraph(
        doc,
        "Sebelum membandingkan dengan kerangka kerja lain, keputusan teknis pemilihan stack X-VOCA didasarkan "
        "pada karakteristik arsitektur dan kebutuhan spesifik domain aplikasi fansite & streaming VTuber (Xion Regalia). "
        "Aplikasi ini membutuhkan performa interaktif tinggi, waktu muat instan, dan pertukaran data waktu-nyata (real-time)."
    )

    # 1.1 REACT.JS
    add_heading_2(doc, "1.1 Mengapa Menggunakan React.js di Sisi Frontend?")
    add_paragraph(
        doc,
        "React.js adalah pustaka (library) JavaScript deklaratif berbasis komponen yang dikembangkan oleh Meta. "
        "Berikut adalah 4 alasan teknis utama mengapa React.js dipilih untuk antarmuka X-VOCA:"
    )

    add_bullet_point(
        doc, "Single Page Application (SPA) & Virtual DOM",
        "React memuat satu halaman HTML tunggal di awal. Ketika pengguna berpindah menu (misalnya dari Beranda ke "
        "Jadwal Siaran atau Katalog Voting), browser tidak melakukan refresh total halaman (reload putih). "
        "Virtual DOM hanya memperbarui bagian elemen yang berubah secara presisi (diffing algorithm), sehingga transisi "
        "antarmuka terasa instan, mulus, dan nyaman seperti aplikasi desktop atau native."
    )
    add_bullet_point(
        doc, "Component-Based Architecture (Prinsip DRY & Reusability)",
        "Antarmuka X-VOCA dipecah menjadi komponen independen yang modular (Card Jadwal, Countdown Timer, Modal Voting, "
        "Navbar, Status Badge). Komponen ini dapat digunakan kembali berkali-kali tanpa duplikasi kode (Don't Repeat Yourself), "
        "sehingga kode lebih rapi, terstruktur, dan mudah dipelihara (maintainable)."
    )
    add_bullet_point(
        doc, "State Management yang Reaktif & Sinergis dengan Realtime Data",
        "React memiliki sistem reaktivitas bawaan (`useState`, `useEffect`, `Context API`). Ketika status siaran berubah "
        "menjadi LIVE atau jumlah suara voting bertambah dari Firebase Realtime Database, state React otomatis memicu "
        "re-render pada komponen terkait secara otomatis dalam hitungan milidetik tanpa intervensi manual terhadap DOM browser."
    )
    add_bullet_point(
        doc, "Ekosistem Modern, Kaya, dan Ringan",
        "React didukung oleh alat modern seperti Vite (bundler berkecepatan tinggi dengan Hot Module Replacement sub-detik), "
        "Tailwind CSS (utility-first styling yang menghasilkan bundle CSS sangat kecil), dan Lucide Icons yang menjamin tampilan elegan."
    )

    # 1.2 EXPRESS.JS & NODE.JS
    add_heading_2(doc, "1.2 Mengapa Menggunakan Express.js (Node.js) di Sisi Backend?")
    add_paragraph(
        doc,
        "Express.js adalah framework minimalis dan fleksibel yang berjalan di atas runtime Node.js (mesin Google V8). "
        "Berikut adalah alasan teknis mengapa Express.js dipilih sebagai pelayan RESTful API X-VOCA:"
    )

    add_bullet_point(
        doc, "Asynchronous & Non-Blocking I/O (Event-Driven Architecture)",
        "Node.js mengeksekusi operasi masukan/keluaran (I/O) seperti pembacaan database MySQL atau request jaringan secara "
        "asynchronous menggunakan Event Loop pada thread tunggal. Server tidak perlu membuat thread baru untuk setiap pengguna. "
        "Karakteristik ini sangat ideal untuk fitur voting publik X-VOCA yang berpotensi menerima ribuan suara masuk secara bersamaan "
        "(concurrency tinggi) tanpa menyebabkan server kehabisan memori RAM."
    )
    add_bullet_point(
        doc, "Unified Language Paradigm (Full-Stack JavaScript)",
        "Menggunakan satu bahasa pemrograman yang sama (JavaScript) dari Frontend hingga Backend. Pengembang tidak perlu berganti "
        "sintaks atau cara berpikir (mengeliminasi context switching antara PHP dan JS). Format validasi data, struktur objek, "
        "dan logika penanganan error dapat diselaraskan dengan mudah."
    )
    add_bullet_point(
        doc, "Pemrosesan JSON Asli (Native JSON Throughput)",
        "Dalam arsitektur RESTful API modern, data ditransmisikan menggunakan format JSON. Karena JSON adalah bagian asli dari "
        "JavaScript (JavaScript Object Notation), Express.js memproses parsing dan serialisasi JSON secara native tanpa overhead "
        "komputasi berat seperti konversi array asosiatif pada bahasa lain."
    )
    add_bullet_point(
        doc, "Minimalis & Fleksibilitas Middleware Modular",
        "Express tidak memaksakan struktur yang kaku (unopinionated). Kami memiliki kontrol penuh dalam menyusun rantai middleware "
        "keamanan seperti CORS, Helmet (HTTP header security), JWT Authentication (`verifyToken`), dan Rate Limiting (anti-DDoS)."
    )

    # =========================================================================
    # BAB 2: KOMPARASI HEAD-TO-HEAD: REACT + EXPRESS VS LARAVEL (PHP)
    # =========================================================================
    add_heading_1(doc, "2. Komparasi Head-to-Head: React + Express vs Laravel (PHP)")
    add_paragraph(
        doc,
        "Pertanyaan: 'Mengapa tidak menggunakan Laravel yang sudah populer di sekolah/kampus?' sering kali muncul dalam ujian. "
        "Berikut adalah analisis komparasi teknis yang membuktikan keunggulan arsitektural stack pilihan X-VOCA:"
    )

    comp_headers = ["Kriteria Evaluasi", "X-VOCA (React.js + Express.js)", "Laravel Konvensional (PHP + Blade)", "Signifikansi untuk X-VOCA"]
    comp_rows = [
        [
            "Arsitektur Sistem",
            "Decoupled / Headless (Pemisahan total Frontend & Backend via REST API).",
            "Monolithic (Tampilan Blade HTML disatukan di dalam server PHP).",
            "Krusial: Backend X-VOCA harus melayani Web dan Mobile Flutter sekaligus."
        ],
        [
            "Multi-Platform (Mobile Ready)",
            "Native API-First. Endpoint API langsung dikonsumsi oleh Flutter tanpa ubah kode.",
            "Harus membuat Controller ganda (satu untuk Web Blade, satu untuk REST API).",
            "Efisiensi 2x lipat: Satu backend melayani Web React dan Android Mobile."
        ],
        [
            "Model Concurrency",
            "Non-blocking Event Loop. Menangani ribuan request I/O secara asynchronous.",
            "Thread-per-request / Multi-process (Apache / PHP-FPM). Butuh RAM lebih besar per koneksi.",
            "Optimal untuk lonjakan suara voting publik serentak tanpa kehabisan RAM server."
        ],
        [
            "User Experience (UX)",
            "Single Page Application (SPA). Navigasi instan tanpa refresh layar putih.",
            "Multi Page Application (MPA). Halaman berpindah memicu reload dokumen HTML.",
            "Fansite modern membutuhkan pemutar audio/video dan countdown yang tidak terputus."
        ],
        [
            "Konsumsi Bandwidth",
            "Sangat Hemat: Server hanya mengirim data mentah berukuran kecil (JSON).",
            "Lebih Boros: Server mengirim seluruh markup HTML, CSS, dan tag pembungkus setiap request.",
            "Menghemat kuota pengguna dan meringankan transfer data hosting server."
        ],
        [
            "Integrasi Realtime",
            "Sangat Alami: State React dan Node.js reaktif instan terhadap Firebase RTDB.",
            "Membutuhkan package tambahan kompleks (Laravel Echo, Pusher, atau Reverb).",
            "Kemudahan sinkronisasi status siaran LIVE di Hero Section dalam <200ms."
        ],
        [
            "Bahasa Pemrograman",
            "Satu Bahasa: JavaScript / Node.js secara menyeluruh (Fullstack).",
            "Bahasa Ganda: PHP di backend, HTML/Blade di template, dan JavaScript di interaksi browser.",
            "Mempercepat waktu pengerjaan proyek dan meminimalkan resiko inkonsistensi tipe data."
        ]
    ]
    add_table_data(doc, comp_headers, comp_rows, [Inches(1.5), Inches(2.2), Inches(2.0), Inches(1.8)])

    add_callout(
        doc,
        "Analogi Sederhana untuk Guru Penguji:\n"
        "• Laravel Blade itu seperti 'Restoran Meja Tradisional': Setiap kali tamu memesan menu baru, pelayan harus "
        "mengganti taplak meja, piring, dan seluruh perlengkapan meja dari awal (Server-Side Rendering / Reload Halaman).\n"
        "• React + Express itu seperti 'Restoran Prasmanan Modern': Meja dan piring sudah tersedia di depan tamu (Client-Side SPA). "
        "Pelayan hanya datang mengantarkan potongan lauk yang baru dipesan saja dalam wadah kecil (JSON API). "
        "Hasilnya: Lebih cepat, tidak berisik, dan tamu tidak perlu menunggu meja ditata ulang setiap saat.",
        title="ANALOGI UNTUK MENJELASKAN KEPADA PENGUJI AGAR MUDAH DIPAHAMI",
        style_type="success"
    )

    # =========================================================================
    # BAB 3: APAKAH MENGGUNAKAN METODE MVC? (ARSITEKTUR MVC MODERN)
    # =========================================================================
    add_heading_1(doc, "3. Analisis Penerapan Pola Arsitektur MVC (Model-View-Controller)")
    add_paragraph(
        doc,
        "Pertanyaan: 'Apakah sistem ini menggunakan metode MVC?'\n"
        "Jawaban Tegas: YA, X-VOCA menerapkan pola arsitektur MVC, tepatnya Decoupled MVC "
        "(Model-View-Controller Terpisah / Client-Server MVC Architecture)."
    )

    add_heading_2(doc, "3.1 Perbedaan MVC Tradisional vs Decoupled MVC Modern")
    add_paragraph(
        doc,
        "Banyak orang mengira MVC harus berada di dalam satu folder framework monolitik (seperti pada Laravel atau CodeIgniter). "
        "Dalam rekayasa perangkat lunak modern, pola MVC telah berevolusi menjadi arsitektur terpisah (Decoupled MVC) "
        "untuk mendukung multi-klien (Web, Mobile, Smart TV):"
    )

    add_bullet_point(
        doc, "MVC Tradisional (Server-Centric / Monolithic)",
        "Model, View, dan Controller berada dalam satu mesin server. Controller mengambil data dari Model, lalu memasukkannya "
        "ke template View (e.g. file `.blade.php` atau `.php`), kemudian me-render dokumen HTML lengkap ke browser. "
        "Kelemahan: Sangat sulit digunakan oleh aplikasi mobile seperti Flutter karena Flutter tidak bisa membaca halaman HTML Blade."
    )
    add_bullet_point(
        doc, "Decoupled MVC Modern (X-VOCA Architecture)",
        "Pemisahan tegas antara Server Data dan Client Presentation (Separation of Concerns). "
        "Model dan Controller bertugas di Backend (Node.js/Express) untuk menjaga data dan keamanan, sedangkan View berjalan "
        "mandiri di perangkat pengguna (React di Web Browser dan Flutter di Smartphone Android). "
        "Jembatan penghubungnya adalah protokol universal HTTP REST API dengan payload data JSON."
    )

    add_heading_2(doc, "3.2 Pemetaan Struktur MVC pada Kode Sumber X-VOCA")
    add_paragraph(
        doc,
        "Berikut adalah bukti konkret letak masing-masing komponen MVC di dalam repositori kode X-VOCA:"
    )

    mvc_headers = ["Komponen MVC", "Lokasi File di X-VOCA", "Teknologi yang Dipakai", "Tanggung Jawab Fungsional"]
    mvc_rows = [
        [
            "MODEL (M)",
            "web/backend/src/models/\n(User.js, Schedule.js, Game.js, Vote.js, dll)",
            "Sequelize ORM & MySQL 8 (InnoDB)",
            "Mendefinisikan skema data, tipe kolom, aturan validasi atribut, asosiasi relasional (hasMany/belongsTo), dan aturan kaskade (CASCADE / SET NULL)."
        ],
        [
            "CONTROLLER (C)",
            "web/backend/src/controllers/\n(authController.js, scheduleController.js, voteController.js, gameController.js, dll)",
            "Express.js Router & Middleware",
            "Menerima request HTTP, memverifikasi token JWT, mengeksekusi logika bisnis (e.g. validasi voting anti-spam), memanggil Model, dan mengirim respon JSON."
        ],
        [
            "VIEW (V) - Web",
            "web/frontend/src/pages/\nweb/frontend/src/components/",
            "React.js (JSX), Tailwind CSS, Lucide Icons",
            "Menerima data JSON dari Controller via Axios, mengelola State antarmuka, me-render grafik Virtual DOM, dan menangani interaksi klik/input pengguna web."
        ],
        [
            "VIEW (V) - Mobile",
            "mobile/lib/features/\nmobile/lib/core/widgets/",
            "Flutter Framework (Dart)",
            "Konsumen View kedua dari Controller yang sama. Menampilkan data jadwal dan voting pada perangkat mobile Android pengguna."
        ]
    ]
    add_table_data(doc, mvc_headers, mvc_rows, [Inches(1.2), Inches(2.2), Inches(1.8), Inches(2.3)])

    # =========================================================================
    # BAB 4: ALUR KERJA LENGKAP (STEP-BY-STEP DATA EXECUTION FLOW)
    # =========================================================================
    add_heading_1(doc, "4. Alur Kerja Sistem (Step-by-Step Data Flow)")
    add_paragraph(
        doc,
        "Untuk membuktikan pemahaman alur kerja MVC kepada penguji, berikut adalah tracing alur eksekusi data "
        "langkah-demi-langkah pada dua proses bisnis utama sistem X-VOCA:"
    )

    add_heading_2(doc, "4.1 Skenario 1: Alur Pemungutan Suara Penonton Publik (Voting Game)")
    add_paragraph(
        doc,
        "Proses ini menggambarkan bagaimana interaksi publik di sisi View diproses secara aman oleh Controller dan disimpan di Model:"
    )

    add_bullet_point(
        doc, "Langkah 1: Interaksi di VIEW (React.js)",
        "Pengunjung membuka tab Voting di website. Pengunjung mengklik tombol 'Vote' pada game 'Elden Ring'. "
        "Frontend mengumpulkan payload data: `game_id`, `fingerprint` (dari library FingerprintJS), dan mengirim HTTP POST request "
        "ke endpoint `/api/votes` menggunakan pustaka Axios."
    )
    add_bullet_point(
        doc, "Langkah 2: Pemeriksaan ROUTER & MIDDLEWARE (Express.js)",
        "Request tiba di server Express (`routes/voteRoutes.js`). Request terlebih dahulu disaring oleh middleware: "
        "CORS (memastikan request berasal dari domain sah) dan Rate Limiter (mencegah serangan brute-force / spamming bot)."
    )
    add_bullet_point(
        doc, "Langkah 3: Pemrosesan Logika di CONTROLLER (`voteController.js`)",
        "Controller mengambil parameter `game_id`, `fingerprint`, dan mengekstrak `ip_address` dari request socket pengguna. "
        "Controller menjalankan aturan bisnis: 'Cek apakah kombinasi IP atau Fingerprint ini sudah pernah memilih di periode bulan aktif saat ini?'"
    )
    add_bullet_point(
        doc, "Langkah 4: Akses Data di MODEL (`Vote.js` & `Game.js`)",
        "Controller memanggil Model Sequelize: `Vote.findOne({ where: ... })`. "
        "Jika belum memilih, Controller menjalankan transaksi atomik: "
        "1) `Vote.create({ game_id, ip_address, fingerprint, period })` "
        "2) `Game.increment('vote_count', { by: 1, where: { id: game_id } })`."
    )
    add_bullet_point(
        doc, "Langkah 5: Penyimpanan Permanen di DATABASE (MySQL)",
        "MySQL mengeksekusi kueri INSERT dan UPDATE dalam proteksi transaksi ACID mesin InnoDB. "
        "Composite index `[ip_address, fingerprint, period]` memastikan pencarian pencegahan duplikasi berjalan kilat O(log N)."
    )
    add_bullet_point(
        doc, "Langkah 6: Respon Balik CONTROLLER ke VIEW",
        "Setelah transaksi sukses, Controller mengembalikan respon status HTTP 201 Created dengan format JSON: "
        "`{ success: true, message: 'Suara Anda berhasil dicatat!', data: { newVoteCount: 154 } }`."
    )
    add_bullet_point(
        doc, "Langkah 7: Pembaruan Tampilan di VIEW (Re-Rendering React)",
        "Pustaka Axios di browser menerima respon JSON tersebut. Fungsi callback React memanggil `setVoteCount()` "
        "sehingga state lokal ter-update. Virtual DOM langsung menaikkan angka voting di layar dan menampilkan animasi toast "
        "'Berhasil Memberikan Suara' tanpa merefresh halaman sama sekali."
    )

    add_heading_2(doc, "4.2 Skenario 2: Alur Penjadwalan Siaran Live oleh Admin Kreator")
    add_paragraph(
        doc,
        "Proses ini menggambarkan integrasi sistem terautentikasi (JWT) dan orkestrasi ganda (MySQL + Firebase RTDB):"
    )

    add_bullet_point(
        doc, "Langkah 1: Input Formulir di VIEW (React Admin Studio)",
        "Admin Xion Regalia mengisi formulir jadwal siaran (Judul: 'Mabar Horor Santai', Tanggal: '2026-11-28 20:00', Platform: 'YouTube'). "
        "Admin menekan tombol 'Simpan Jadwal'. React mengirimkan HTTP POST `/api/schedules` dengan menyertakan JWT Bearer Token "
        "di dalam HTTP Authorization Header."
    )
    add_bullet_point(
        doc, "Langkah 2: Verifikasi Keamanan MIDDLEWARE (`auth.js`)",
        "Middleware mengecek header request, mendekripsi token JWT menggunakan `process.env.JWT_SECRET`, dan memvalidasi "
        "apakah peran admin (`role: admin`) masih sah dan belum kedaluwarsa. Jika sah, identitas admin (`req.user`) diteruskan ke Controller."
    )
    add_bullet_point(
        doc, "Langkah 3: CONTROLLER & MODEL (`scheduleController.js` & `Schedule.js`)",
        "Controller memvalidasi kelengkapan tanggal dan judul, lalu memanggil `Schedule.create(...)` dengan mengikat kolom Foreign Key "
        "`user_id = req.user.id`. Data tersimpan permanen di tabel `schedules` MySQL."
    )
    add_bullet_point(
        doc, "Langkah 4: Realtime Sync ke FIREBASE RTDB",
        "Selain menyimpan ke MySQL, Controller secara otomatis mem-push data agenda siaran terdekat ke node Firebase "
        "`/schedules/next`. Hal ini dilakukan agar ribuan penonton publik yang sedang membuka website mendapatkan update jadwal "
        "secara instan melalui koneksi WebSocket Firebase tanpa perlu membebani server backend dengan kueri polling berulang."
    )
    add_bullet_point(
        doc, "Langkah 5: Audit Logging (`AuditLog.js`)",
        "Controller secara otomatis mencatat kejadian tersebut ke tabel `audit_logs`: "
        "`action_type: 'SCHEDULE_CREATED'`, mencatat IP admin dan detail agenda untuk rekam jejak keamanan abadi."
    )

    # =========================================================================
    # BAB 5: NASKAH BICARA & CHEAT SHEET TANYA JAWAB PENGUJI (SIAP HAFAL)
    # =========================================================================
    add_heading_1(doc, "5. Naskah Bicara & Cheat Sheet Ujian Sidang (Siap Hafal)")
    add_paragraph(
        doc,
        "Gunakan naskah kata-demi-kata (speech script) berikut saat menjawab pertanyaan penguji. "
        "Bahasa yang digunakan formal, percaya diri, lugas, dan berbobot teknis tinggi:"
    )

    # Q1
    add_heading_2(doc, "Naskah 1: 'Kenapa kamu memilih menggunakan Express.js dan React.js?'")
    add_callout(
        doc,
        "\"Terima kasih atas pertanyaannya Pak/Bu. Pemilihan Express.js dan React.js didasarkan pada kebutuhan arsitektur sistem kami:\n\n"
        "1. Dari sisi Frontend (React.js): Kami membangun platform interaktif fansite VTuber yang membutuhkan pemutar konten, "
        "countdown timer siaran, dan voting langsung. React dengan konsep Single Page Application (SPA) dan Virtual DOM memungkinkan "
        "seluruh interaksi ini berjalan mulus tanpa refresh halaman (zero full-page reload), sehingga pengalaman pengguna terasa instan.\n\n"
        "2. Dari sisi Backend (Express.js): Aplikasi kami memiliki fitur voting publik yang berpotensi menerima ribuan suara masuk secara bersamaan. "
        "Node.js dengan karakteristik Asynchronous Non-Blocking I/O dan Event Loop mampu menangani konkurensi request tinggi secara ringan "
        "tanpa membebani memori server.\n\n"
        "Selain itu, perpaduan Full-Stack JavaScript ini membuat alur data JSON dari database hingga antarmuka pengguna menjadi seragam dan sangat cepat.\"",
        title="SKRIP JAWABAN RESMI Q1: JUSTIFIKASI TEKNOLOGI STACK",
        style_type="info"
    )

    # Q2
    add_heading_2(doc, "Naskah 2: 'Kenapa tidak pakai Laravel saja yang lebih umum dan lengkap?'")
    add_callout(
        doc,
        "\"Pertanyaan yang sangat bagus Pak/Bu. Alasan utama kami tidak menggunakan arsitektur bawaan Laravel (Blade) adalah "
        "karena platform X-VOCA dirancang dengan prinsip 'Multi-Platform API-First':\n\n"
        "• Sistem kami melayani dua klien sekaligus, yaitu Website (React) dan Aplikasi Mobile Android (Flutter). "
        "Jika kami menggunakan Laravel Blade konvensional, kami terikat pada arsitektur monolitik yang me-render halaman HTML di server, "
        "sehingga aplikasi Flutter tidak bisa mengonsumsinya secara langsung tanpa membuat controller API terpisah.\n\n"
        "• Dengan Express.js yang murni menyajikan RESTful API (JSON Data), satu backend yang sama dapat langsung digunakan bersama oleh "
        "React Web maupun Flutter Mobile tanpa perlu menulis ulang logika bisnis.\n\n"
        "• Ditambah lagi, untuk pertukaran data waktu-nyata (realtime) dengan Firebase RTDB, ekosistem JavaScript jauh lebih reaktif dan fleksibel.\"",
        title="SKRIP JAWABAN RESMI Q2: KOMPARASI DENGAN LARAVEL",
        style_type="warn"
    )

    # Q3
    add_heading_2(doc, "Naskah 3: 'Apakah aplikasi kamu ini menggunakan MVC? Di mana View-nya?'")
    add_callout(
        doc,
        "\"Betul sekali Pak/Bu. Aplikasi kami menerapkan pola arsitektur MVC, tepatnya Decoupled MVC (Model-View-Controller Terpisah):\n\n"
        "1. Model (M): Berada di backend pada folder `models/` yang dikelola oleh Sequelize ORM untuk berinteraksi dengan database MySQL.\n"
        "2. Controller (C): Berada di backend pada folder `controllers/` yang bertugas memproses logika bisnis, memvalidasi input, dan mengembalikan data JSON.\n"
        "3. View (V): Berada di sisi klien secara independen, yaitu dikelola oleh React.js pada web dan Flutter pada mobile.\n\n"
        "Pemisahan View ke sisi klien ini adalah standar industri modern (Separation of Concerns), di mana server fokus menjaga integritas data (API), "
        "sementara perangkat pengguna bertanggung jawab menampilkan antarmuka grafis yang responsif.\"",
        title="SKRIP JAWABAN RESMI Q3: PENERAPAN MVC MODERN",
        style_type="success"
    )

    # Q4
    add_heading_2(doc, "Naskah 4: Antisipasi Pertanyaan Jebakan: 'Apakah React itu Framework atau Library?'")
    add_callout(
        doc,
        "\"Jawaban yang Tepat:\n"
        "'Secara teknis, React.js adalah sebuah Library (pustaka) untuk membangun antarmuka pengguna, bukan sebuah framework kaku. "
        "Alasan kami memilih React sebagai library adalah karena fleksibilitasnya: kami bebas memadukannya dengan routing modern (React Router), "
        "client HTTP (Axios), ikon modular (Lucide Icons), dan styling utility-first (Tailwind CSS) sesuai kebutuhan spesifik sistem X-VOCA tanpa dibatasi aturan bawaan framework yang kaku.'\"",
        title="TIPS MENJAWAB PERTANYAAN JEBAKAN TENTANG REACT",
        style_type="info"
    )

    # =========================================================================
    # SIMPAN DOKUMEN
    # =========================================================================
    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(output_dir, "8_Justifikasi_Teknologi_Stack_dan_Arsitektur_MVC.docx")
    doc.save(output_path)
    print(f"✅ Dokumen Word Berhasil Dibuat: {output_path}")

if __name__ == "__main__":
    build_file_8()
