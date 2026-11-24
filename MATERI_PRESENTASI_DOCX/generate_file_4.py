import os
from docx.shared import Inches, Pt, RGBColor
from doc_builder import (
    create_base_document, add_header_banner, add_heading_1, add_heading_2,
    add_heading_3, add_paragraph, add_bullet_point, add_callout,
    add_table_data, COLOR_PRIMARY, COLOR_SECONDARY, COLOR_ACCENT
)

def build_file_4():
    doc = create_base_document()
    
    add_header_banner(
        doc,
        title="File 4: Alur & Script Lengkap Presentasi Web",
        subtitle="Panduan Berbicara Kata demi Kata, Skenario Demo Klik di Layar Proyektor, Manajemen Waktu, dan 'Momen WOW' untuk Guru",
        tag="X-VOCA DOKUMEN PRESENTASI & UJIAN"
    )
    
    add_callout(
        doc,
        "Dokumen ini memandu Anda saat berdiri di depan kelas atau ruang ujian. "
        "Dilengkapi narasi kalimat pembuka, kata-kata transisi antar fitur, urutan klik di browser, "
        "hingga kalimat penutup yang sopan dan meyakinkan di hadapan guru.",
        title="PETUNJUK PRAKTIK PRESENTASI",
        style_type="info"
    )
    
    # ---------------------------------------------------------
    # BAB 1: MANAJEMEN WAKTU FLEKSIBEL
    # ---------------------------------------------------------
    add_heading_1(doc, "1. Manajemen Waktu Presentasi Fleksibel")
    add_paragraph(
        doc,
        "Karena waktu ujian Anda tidak menentu (bisa dipotong cepat oleh guru atau sebaliknya diminta mendemokan secara detail), "
        "persiapkan dua skenario durasi:"
    )
    
    headers_waktu = ["Skenario", "Estimasi Waktu", "Fokus Utama yang Harus Disampaikan"]
    rows_waktu = [
        [
            "Versi Ringkas (Fast Pitch)",
            "7 – 10 Menit",
            "Pembukaan (1 mnt) ➔ Latar Belakang & Masalah (1.5 mnt) ➔ Arsitektur Hybrid (1.5 mnt) ➔ Demo Live Fitur Kunci: Realtime Voting & Admin Moderasi (4 mnt) ➔ Penutup (1 mnt)."
        ],
        [
            "Versi Lengkap (Deep Dive)",
            "15 – 20 Menit",
            "Pembukaan (2 mnt) ➔ Masalah & Solusi (3 mnt) ➔ Arsitektur Sistem 3-Tier (3 mnt) ➔ Demo Live Lengkap: Viewer, Dual-Browser Realtime Sync, Anti-Spam Fingerprint, Admin Studio, & Ekspor PDF (8 mnt) ➔ Kesimpulan (2 mnt) ➔ Lanjut Sesi Tanya Jawab."
        ]
    ]
    add_table_data(doc, headers_waktu, rows_waktu, [Inches(1.8), Inches(1.4), Inches(3.3)])

    # ---------------------------------------------------------
    # BAB 2: NASKAH PEMBUKAAN (PITCH OPENING)
    # ---------------------------------------------------------
    add_heading_1(doc, "2. Naskah Pembukaan (Pitch Opening)")
    add_paragraph(
        doc,
        "Buka presentasi Anda dengan salam sopan, nada suara tenang, dan tatap mata guru Anda secara percaya diri:"
    )
    
    add_callout(
        doc,
        "\"Selamat pagi/siang Bapak/Ibu Guru dan rekan-rekan sekalian.\n\n"
        "Perkenalkan, nama saya [Nama Anda]. Pada kesempatan yang berharga hari ini, saya ingin mempresentasikan proyek Full-Stack "
        "yang telah saya kembangkan, yaitu 'X-VOCA: Official Fansite, Interactive Community Hub, & Admin Management System'.\n\n"
        "Sistem ini saya dedikasikan khusus untuk mendukung operasional virtual live streaming. Di era digital saat ini, "
        "kreator virtual dan penonton menghadapi kendala klasik: jadwal siaran yang terpencar-pencar di berbagai media sosial, "
        "serta sistem voting game komunitas yang sering dimanipulasi oleh bot atau spammer karena tidak adanya proteksi yang tepat.\n\n"
        "X-VOCA hadir memecahkan masalah tersebut dengan menggabungkan Web Portal penonton yang interaktif, Dashboard Studio mandiri untuk kreator, "
        "arsitektur Hybrid Database (MySQL dan Firebase Realtime Database), serta teknologi Zero-Login Anti-Spam berbasis Browser Fingerprinting.\n\n"
        "Izin saya untuk langsung mendemonstrasikan sistem yang telah berjalan ini.\"",
        title="KATA-KATA PEMBUKA SIAP BACA",
        style_type="success"
    )

    # ---------------------------------------------------------
    # BAB 3: SKENARIO DEMO LIVE LANGKAH DEMI LANGKAH
    # ---------------------------------------------------------
    add_heading_1(doc, "3. Skenario Demo Live di Layar (Urutan Klik & Narasi)")
    add_paragraph(
        doc,
        "Ikuti urutan langkah di bawah ini secara disiplin agar alur demonstrasi mengalir runtut dan logis di mata guru:"
    )
    
    # Langkah 1
    add_heading_2(doc, "Langkah 1: Halaman Beranda (Hero Showcase & Countdown Siaran)")
    add_bullet_point(doc, "Tindakan di Layar", "Buka browser pada alamat 'http://localhost:5173/'. Tampilkan bagian Hero Section dengan kartu profil Xion Regalia.")
    add_bullet_point(doc, "Interaksi", "Klik tombol pengubah mood/aura karakter (misal: Serene, Energetic, Cyberpunk). Arahkan kursor ke Countdown Timer.")
    add_bullet_point(doc, "Narasi untuk Guru", 
        "\"Bapak/Ibu Guru, ini adalah halaman muka portal penonton. Kami menerapkan desain Cyberpunk Midnight yang modern dan imersif. "
        "Di kartu profil ini, penonton dapat melihat status kesiapan siaran kreator secara langsung. Di bawahnya terdapat Dynamic Countdown Timer "
        "yang menghitung mundur waktu menuju siaran berikutnya secara matematis. Jika waktu siaran tiba, badge akan otomatis berganti status menjadi LIVE NOW.\""
    )

    # Langkah 2
    add_heading_2(doc, "Langkah 2: Kalender Siaran & Arsip Content Guide")
    add_bullet_point(doc, "Tindakan di Layar", "Scroll ke bawah menuju Schedule Section, lalu navigasikan ke halaman '/content-guide'.")
    add_bullet_point(doc, "Interaksi", "Klik salah satu tombol filter kategori (misal: 'Elden Ring' atau 'Zatsu'), lalu klik salah satu kartu video hingga muncul modal pemutar video YouTube.")
    add_bullet_point(doc, "Narasi untuk Guru", 
        "\"Selanjutnya, penonton dapat melihat jadwal streaming mingguan dan tautan langsung ke siaran YouTube. "
        "Pada halaman Content Guide, seluruh rekaman video siaran terdahulu diarsipkan secara rapi. Kami menyematkan filter kategori instan "
        "dan fitur Spotlight Video di mana penonton dapat langsung menonton cuplikan siaran tanpa meninggalkan website kami.\""
    )

    # Langkah 3 & 4 (MOMEN WOW)
    add_heading_2(doc, "Langkah 3 & 4 (MOMEN WOW!): Real-Time Sync Voting & Anti-Spam Demo")
    add_paragraph(
        doc,
        "TIPS EMAS: Ini adalah bagian paling menarik yang akan membuat guru Anda kagum. Siapkan DUA jendela browser berdampingan (Split Screen di layar): "
        "Jendela Kiri adalah Google Chrome biasa, Jendela Kanan adalah Google Chrome mode Penyamaran (Incognito) atau browser Edge."
    )
    add_bullet_point(doc, "Tindakan di Layar", 
        "Buka halaman 'http://localhost:5173/voting' di kedua jendela browser tersebut secara berdampingan."
    )
    add_bullet_point(doc, "Interaksi 1 (Live Sync)", 
        "Di Jendela Kiri (Chrome Biasa), pilih salah satu game lalu klik tombol 'Vote'. Jangan sentuh atau me-refresh Jendela Kanan."
    )
    add_bullet_point(doc, "Narasi untuk Guru", 
        "\"Bapak/Ibu, mari kita perhatikan keajaiban sinkronisasi realtime sistem kami. Di sebelah kiri saya mengklik tombol Vote pada game A. "
        "Perhatikan jendela di sebelah kanan: tanpa saya me-refresh halaman sama sekali, angka suara dan persentasenya langsung bertambah seketika! "
        "Ini terwujud berkat integrasi Firebase Realtime Database melalui koneksi persistent WebSocket.\""
    )
    add_bullet_point(doc, "Interaksi 2 (Uji Coba Anti-Spam)", 
        "Di Jendela Kiri yang sama, coba klik tombol 'Vote' sekali lagi pada game yang sama."
    )
    add_bullet_point(doc, "Hasil di Layar", "Muncul notifikasi Toast warna merah / peringatan: 'Anda sudah memberikan suara untuk game ini di periode ini'.")
    add_bullet_point(doc, "Narasi untuk Guru", 
        "\"Dan ketika pengguna yang sama mencoba melakukan kecurangan dengan mengklik vote berulang kali, sistem backend kami langsung menolaknya. "
        "Sistem mendeteksi Browser Fingerprint dan IP perangkat tersebut sehingga prinsip 1 Perangkat = 1 Suara per Bulan terjamin adil dan transparan tanpa perlu penonton login.\""
    )

    # Langkah 5
    add_heading_2(doc, "Langkah 5: Pengajuan Request Game Baru oleh Penonton")
    add_bullet_point(doc, "Tindakan di Layar", "Di halaman voting, klik tombol '+ Request Game'.")
    add_bullet_point(doc, "Interaksi", "Ketik judul game contoh: 'Cyberpunk 2077 Phantom Liberty', pilih genre 'Action RPG', lalu klik 'Kirim Usulan'.")
    add_bullet_point(doc, "Narasi untuk Guru", 
        "\"Penonton juga dapat mengajukan usulan game baru. Namun demi keamanan sistem dari spam bot, usulan ini dilindungi cooldown 7 hari per perangkat. "
        "Selain itu, game yang baru diusulkan TIDAK langsung tampil di daftar voting publik, melainkan statusnya ditampung sebagai 'requested' "
        "untuk ditinjau terlebih dahulu oleh kreator.\""
    )

    # Langkah 6
    add_heading_2(doc, "Langkah 6: Masuk ke Dashboard Studio Kreator (Admin Management)")
    add_bullet_point(doc, "Tindakan di Layar", "Buka tab baru ke 'http://localhost:5173/admin/login'. Masukkan username dan password admin.")
    add_bullet_point(doc, "Interaksi 1 (Dashboard)", "Tunjukkan metrik analitik dashboard, statistik suara, dan daftar Audit Log aktivitas.")
    add_bullet_point(doc, "Interaksi 2 (Moderasi Voting)", 
        "Masuk ke menu 'Voting Moderation'. Tunjukkan game 'Cyberpunk 2077' yang baru saja diusulkan oleh penonton tadi di tab 'Requested'. "
        "Klik tombol 'Accept' untuk menyetujuinya. Kembali ke halaman publik untuk membuktikan bahwa game tersebut sekarang sudah muncul di daftar voting!"
    )
    add_bullet_point(doc, "Interaksi 3 (Ekspor Laporan PDF)", 
        "Di halaman Voting Moderation, klik tombol 'Ekspor PDF'. Tunjukkan hasil unduhan file PDF laporan resmi rekapitulasi voting bulanan."
    )
    add_bullet_point(doc, "Narasi untuk Guru", 
        "\"Di studio admin, seluruh kontrol berada di tangan kreator. Di sini kami melihat game yang diusulkan tadi, lalu saya setujui menjadi 'Accepted'. "
        "Kreator juga dapat mengekspor rekapitulasi suara bulanan ini ke dalam dokumen PDF resmi sebagai laporan pertanggungjawaban agenda siaran.\""
    )

    # ---------------------------------------------------------
    # BAB 4: NASKAH PENUTUP & TRANSISI KE TANYA JAWAB
    # ---------------------------------------------------------
    add_heading_1(doc, "4. Naskah Penutup & Transisi ke Sesi Tanya Jawab")
    add_callout(
        doc,
        "\"Demikianlah presentasi dan demonstrasi sistem Full-Stack X-VOCA yang telah saya bangun.\n\n"
        "Secara garis besar, sistem ini berhasil menggabungkan estetika antarmuka modern, interaktivitas real-time, "
        "serta keandalan arsitektur backend dengan perlindungan anti-spam yang kuat.\n\n"
        "Saya menyadari sistem ini masih memiliki ruang untuk terus dikembangkan. "
        "Oleh karena itu, saya sangat mengharapkan masukan, saran, serta pertanyaan dari Bapak/Ibu Guru.\n\n"
        "Terima kasih atas perhatian dan waktu yang diberikan. Waktu dan tempat saya persilahkan kepada Bapak/Ibu Guru.\"",
        title="KATA-KATA PENUTUP SIAP BACA",
        style_type="success"
    )

    # ---------------------------------------------------------
    # BAB 5: TIPS ETIKA & BAHASA TUBUH DI DEPAN GURU
    # ---------------------------------------------------------
    add_heading_1(doc, "5. Tips Sikap & Bahasa Tubuh di Hadapan Guru")
    add_bullet_point(doc, "Tatap Mata & Senyum Sopan", "Jangan terus-menerus menatap layar monitor laptop. Sesekali tatap wajah guru Anda saat menjelaskan konsep utama.")
    add_bullet_point(doc, "Gunakan Pointer / Kursor dengan Tenang", "Saat menunjuk elemen UI, gerakkan kursor secara halus dan perlahan, jangan berputar-putar cepat yang membuat guru pusing melihatnya.")
    add_bullet_point(doc, "Dengarkan Pertanyaan Hingga Tuntas", "Jangan pernah memotong ucapan guru saat beliau sedang bertanya. Anggukkan kepala tanda mengerti, beri jeda 2 detik, lalu jawab dengan kalimat: 'Baik, terima kasih atas pertanyaannya Pak/Bu...'.")
    add_bullet_point(doc, "Jujur jika Ada Kelemahan", "Jika guru menanyakan fitur yang belum sempat Anda buat, jangan berbohong. Katakan: 'Fitur tersebut merupakan ide pengembangan yang sangat bagus Pak/Bu, saat ini sistem kami baru sampai tahap X dan hal tersebut sudah masuk dalam rencana pengembangan versi berikutnya.'")
    
    output_path = os.path.join("MATERI_PRESENTASI_DOCX", "4_Alur_dan_Script_Presentasi_Web.docx")
    doc.save(output_path)
    print(f"Success generating: {output_path}")

if __name__ == "__main__":
    build_file_4()
