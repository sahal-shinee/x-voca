import os
from docx.shared import Inches, Pt, RGBColor
from doc_builder import (
    create_base_document, add_header_banner, add_heading_1, add_heading_2,
    add_heading_3, add_paragraph, add_bullet_point, add_callout,
    add_code_block, add_table_data, COLOR_PRIMARY, COLOR_SECONDARY, COLOR_ACCENT
)

def build_file_6():
    doc = create_base_document()
    
    add_header_banner(
        doc,
        title="File 6: Checklist Teknis Persiapan Demo & Rencana Darurat",
        subtitle="Panduan Menyalakan Server Cepat, Kredensial Login Resmi, Setup Layar, dan Skenario Penyelamat 'Plan B'",
        tag="X-VOCA DOKUMEN PRESENTASI & UJIAN"
    )
    
    add_callout(
        doc,
        "Dokumen ini wajib Anda baca dan praktikkan malam ini serta sesaat sebelum ujian dimulai. "
        "Mengikuti checklist ini menjamin Anda tidak akan panik karena server tidak bisa menyala, port bentrok, "
        "atau lupa password akun admin saat berada di depan guru.",
        title="PETUNJUK KESIAPAN TEKNIS UJIAN",
        style_type="warn"
    )
    
    # ---------------------------------------------------------
    # BAB 1: KREDENSIAL LOGIN RESMI STUDIO ADMIN
    # ---------------------------------------------------------
    add_heading_1(doc, "1. Kredensial Login Resmi Studio Admin")
    add_paragraph(
        doc,
        "Catat atau hafalkan kredensial akun administrator default ini untuk login ke Creator Studio saat ujian:"
    )
    
    headers_cred = ["Atribut", "Nilai Kredensial", "Keterangan"]
    rows_cred = [
        ["URL Login Admin", "http://localhost:5173/admin/login", "Halaman masuk Studio Kreator"],
        ["Email", "xionregalia@gmail.com", "Email terdaftar di seeder dan database"],
        ["Password Utama", "password123", "Password default pengujian"],
        ["Password Alternatif", "xvoca2026", "Password cadangan sekunder"],
        ["Role", "superadmin", "Memiliki hak penuh atas seluruh fitur moderasi"]
    ]
    add_table_data(doc, headers_cred, rows_cred, [Inches(1.8), Inches(2.5), Inches(2.2)])

    # ---------------------------------------------------------
    # BAB 2: CHECKLIST MALAM INI (H-1)
    # ---------------------------------------------------------
    add_heading_1(doc, "2. Checklist Persiapan Malam Ini (H-1)")
    add_paragraph(
        doc,
        "Sebelum beristirahat malam ini, pastikan 4 hal berikut sudah teruji di laptop Anda:"
    )
    
    add_bullet_point(
        doc, "1. Uji Database MySQL",
        "Nyalakan XAMPP / Laragon, pastikan modul MySQL aktif (lampu indikator hijau). Buka phpMyAdmin, "
        "pastikan database proyek (biasanya bernama `xvoca_db` atau `x_voca`) sudah berisi tabel-tabel seperti `users`, `games`, `votes`, `schedules`."
    )
    add_bullet_point(
        doc, "2. Uji Skrip Startup Otomatis",
        "Di root folder proyek, sudah tersedia file batch: `start_backend.bat` dan `start_frontend.bat`. "
        "Coba jalankan keduanya untuk memastikan server backend dan frontend Vite bisa menyala tanpa error."
    )
    add_bullet_point(
        doc, "3. Uji Coba Login Admin",
        "Buka browser, buka `http://localhost:5173/admin/login`, coba login dengan email `xionregalia@gmail.com` "
        "dan password `password123`. Pastikan berhasil masuk ke Dashboard."
    )
    add_bullet_point(
        doc, "4. Cas Baterai Laptop & Bawa Charger",
        "Jangan sampai laptop kehabisan baterai di tengah demonstrasi. Siapkan charger dan mouse eksternal agar navigasi kursor stabil."
    )

    # ---------------------------------------------------------
    # BAB 3: CHECKLIST 15 MENIT SEBELUM UJIAN DI SEKOLAH
    # ---------------------------------------------------------
    add_heading_1(doc, "3. Checklist 15 Menit Sebelum Ujian (Di Hadapan Guru)")
    add_paragraph(
        doc,
        "Lakukan urutan booting sistem berikut tepat sebelum giliran Anda dipanggil:"
    )
    
    add_bullet_point(doc, "Langkah 1", "Nyalakan MySQL di XAMPP Control Panel.")
    add_bullet_point(doc, "Langkah 2 (Terminal Backend)", "Buka Command Prompt / PowerShell, arahkan ke backend dan jalankan:\ncd \"d:\\CODING\\Project FullStack\\x-voca\\web\\backend\" && npm run dev\n(Tunggu sampai muncul pesan: 'Server running on port 3001' & 'Database connected').")
    add_bullet_point(doc, "Langkah 3 (Terminal Frontend)", "Buka tab terminal baru, arahkan ke frontend dan jalankan:\ncd \"d:\\CODING\\Project FullStack\\x-voca\\web\\frontend\" && npm run dev\n(Tunggu sampai muncul link: 'http://localhost:5173/').")
    add_bullet_point(doc, "Langkah 4 (Setup Tab Browser)", "Buka Google Chrome, siapkan tab-tab berikut:\n• Tab 1: http://localhost:5173/ (Beranda Fansite)\n• Tab 2: http://localhost:5173/voting (Halaman Voting Publik)\n• Tab 3: http://localhost:5173/admin/login (Halaman Login Admin)\n• Buka 1 jendela Incognito (Chrome Penyamaran) pada halaman http://localhost:5173/voting (Untuk demonstrasi Realtime Sync berdampingan).")

    # ---------------------------------------------------------
    # BAB 4: SKENARIO DARURAT & RENCANA CADANGAN (PLAN B)
    # ---------------------------------------------------------
    add_heading_1(doc, "4. Skenario Darurat & Rencana Cadangan (Troubleshooting Plan B)")
    add_paragraph(
        doc,
        "Jika terjadi kendala teknis tak terduga, jangan panik! Gunakan solusi cepat berikut:"
    )
    
    add_heading_2(doc, "Kendala 1: Port 3001 atau 5173 Error 'EADDRINUSE' (Port Sedang Terpakai)")
    add_paragraph(
        doc,
        "Penyebab: Ada proses Node.js lama yang masih menggantung di latar belakang Windows.\n"
        "Solusi Cepat (Buka PowerShell Administrator):"
    )
    code_kill = """# Perintah cepat mematikan proses Node.js yang menggantung di Windows:
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force"""
    add_code_block(doc, code_kill, "PowerShell - Matikan Proses Node.js Gantung")
    add_paragraph(doc, "Setelah perintah dijalankan, jalankan kembali `npm run dev`.")

    add_heading_2(doc, "Kendala 2: MySQL di XAMPP Menolak Start ('Port 3306 in use')")
    add_paragraph(
        doc,
        "Penyebab: Layanan MySQL bawaan Windows Services sedang berjalan otomatis.\n"
        "Solusi Cepat:"
    )
    code_mysql = """# Buka PowerShell Administrator:
Stop-Service MySQL -ErrorAction SilentlyContinue
Stop-Service MySQL80 -ErrorAction SilentlyContinue"""
    add_code_block(doc, code_mysql, "PowerShell - Hentikan Service MySQL Bawaan")
    add_paragraph(doc, "Lalu klik tombol 'Start' MySQL kembali di XAMPP Control Panel.")

    add_heading_2(doc, "Kendala 3: Internet Sekolah Mati / Sangat Lambat")
    add_callout(
        doc,
        "Penjelasan Taktis untuk Guru:\n"
        "\"Pak/Bu Guru, sistem X-VOCA kami dirancang dengan prinsip Graceful Degradation. "
        "Seluruh data inti, basis data MySQL, server Express, dan aplikasi React berjalan 100% secara lokal di mesin komputer ini. "
        "Meskipun akses internet eksternal terputus (seperti YouTube streaming atau Firebase cloud), "
        "seluruh transaksi voting, jadwal, dan dashboard admin tetap dapat didemokan dan berfungsi secara offline tanpa kendala.\"",
        title="JAWABAN PENYELAMAT SAAT INTERNET MATI",
        style_type="info"
    )

    add_heading_2(doc, "Kendala 4: Ingin Demo Voting Ulang Tapi Sistem Menolak ('Sudah Pernah Vote')")
    add_paragraph(
        doc,
        "Penyebab: Sistem anti-spam Anda bekerja dengan sangat baik!\n"
        "Cara Mereset Cepat untuk Demo Baru di Depan Guru:\n"
        "1. Di browser Chrome, tekan F12 (Buka DevTools) ➔ Masuk tab 'Application' ➔ Storage ➔ Klik 'Clear site data'.\n"
        "2. ATAU buka phpMyAdmin ➔ Pilih database proyek ➔ Kosongkan tabel `votes` (klik 'Empty' / `TRUNCATE TABLE votes;`). Maka seluruh perangkat bisa vote kembali dari nol."
    )
    
    output_path = os.path.join("MATERI_PRESENTASI_DOCX", "6_Checklist_Teknis_Demo_dan_Troubleshooting.docx")
    doc.save(output_path)
    print(f"Success generating: {output_path}")

if __name__ == "__main__":
    build_file_6()
