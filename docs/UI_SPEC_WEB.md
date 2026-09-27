# UI_SPEC_WEB.md — Spesifikasi Visual Web X-VOCA
# Deskripsi detail layout setiap halaman web berdasarkan mockup
# Dibaca oleh: Sahal + AI Agent setiap kali mengerjakan halaman web
# WAJIB di-attach bersama PROJECT_CONTEXT.md dan AI_RULES_WEB.md

---

## PANDUAN UMUM SEMUA HALAMAN WEB

### Tema Global
```
Mode          : Dark mode only (tidak ada light mode)
Background    : #0D0B1A (hampir hitam dengan tint ungu)
Font utama    : Space Grotesk (semua teks)
Font mono     : Space Mono (untuk label teknis, kode, badge)
Bahasa UI     : Campuran Indonesia & Inggris (ikuti mockup per elemen)
Nuansa        : "Cyber Nocturne" — gelap, misterius, tech-savvy, VTuber
```

### Navbar (Semua Halaman Web Viewer)
```
Layout        : Horizontal, fixed top, full width
Height        : ~60px
Background    : #0D0B1A dengan border-bottom 1px #2A2550
Padding       : 0 48px (desktop)

Kiri          : Logo "X-VOCA" (teks putih bold) + badge "REGALIA OPS"
                (badge: background transparan, border #2A2550, teks abu kecil)
Tengah        : Navigation links: Home | Voting | Content Guide
                (link aktif: underline cyan #2DFFC2, teks putih)
                (link tidak aktif: teks #9B97C0)
Kanan         : Tombol "● LIVE NOW" (background merah #FF4444, teks putih, rounded-full)
                + ikon audio bars (putih, animasi pulse saat live)
                + Avatar Creator (lingkaran, 32px)
```

---

## HALAMAN 1 — HOME (WEB VIEWER)

### Section 1.1 — Hero Section (Layar Pertama / Above the Fold)

```
Layout        : Full viewport height, 2 kolom (50/50)
Background    : Gradient radial dari #1A1535 ke #0D0B1A
                + partikel bintang kecil (titik-titik putih/cyan tersebar)

KOLOM KIRI (konten teks):
  Posisi       : Vertikal center, padding kiri 80px

  Badge        : Pill kecil "✦ Virtual Creator"
                 (border 1px #9B6DFF, teks #9B6DFF, background transparan)
                 Margin bottom: 16px

  Heading      : "XION" — font size 96px, font weight 900
                 Gradient text: dari #2DFFC2 (kiri) ke #9B6DFF (kanan)
                 Line 2: "REGALIA" — font size 48px, font weight 300
                 Letter spacing: 0.3em, teks putih (bukan gradient)

  Subtitle     : "Your space to follow every stream, vote for what comes
                  next, and discover every journey."
                 Font size: 16px, warna #9B97C0, max-width 400px
                 Margin top: 16px, margin bottom: 32px

  CTA Buttons  : 2 tombol horizontal berdampingan, gap 12px
                 Tombol 1 "Lihat Voting →"
                   Background: #2DFFC2, teks hitam #0D0B1A, font weight 700
                   Padding: 12px 24px, border-radius: 8px
                 Tombol 2 "📖 Content Guide"
                   Background: transparan, border 1px #9B6DFF
                   Teks: #9B6DFF, padding: 12px 24px, border-radius: 8px

  Countdown Card (di bawah tombol, margin top 32px):
    Background  : #1A1730, border 1px #2A2550, border-radius 12px
    Padding     : 20px 24px
    Label atas  : "📡 STREAM BERIKUTNYA" (teks #9B97C0, font mono, uppercase, 11px)
                  + Badge "● SYNCED 23:00 WIB" (teks cyan #2DFFC2, 11px) — di kanan label
    Angka       : 3 kotak sejajar — JAM | MIN | DET
                  Angka: font size 48px, font weight 700, warna #2DFFC2
                  Label bawah angka: "JAM", "MIN", "DET" — teks #9B97C0, 11px
    Footer card : "✦ Sing-along & Midnight Telemetry" (kiri, teks #9B97C0, 13px)
                  "RESERVE" (kanan, teks #2DFFC2, font weight 600, uppercase)

KOLOM KANAN (karakter):
  Posisi       : Vertikal center, horizontal center
  Konten       : Gambar karakter Xion Regalia (PNG transparan/WebP)
                 Tinggi: ~70% viewport
                 Tidak ada frame/border — karakter langsung di atas background
  Badge        : Pill "● REGALIA PROTOCOL : NOCTURNE"
                 Posisi: di atas kepala karakter, center
                 Background: #1A1730, border #2A2550, teks #9B97C0, font mono, 11px

Footer section : Teks "SCROLL ↓" di bawah tengah, teks #5C587A, 12px
```

---

### Section 1.2 — About Xion (Scroll ke bawah)

```
Layout        : Full width, background #0D0B1A, padding 80px 48px

Label section : Pill center "| ABOUT XION"
                Background #1A1730, border #2A2550, teks #9B97C0

Heading       : "The Solitary Voice in Deep Space"
                Font size 36px, font weight 700, teks putih, text-align center
                Margin bottom 48px

PROFILE CARD:
  Layout      : Card horizontal — gambar kiri (30%) + info kanan (70%)
  Background  : #1A1730, border 1px #2A2550, border-radius 16px
  Padding     : 32px

  Gambar kiri : Ilustrasi Xion Regalia (portrait), height ~280px
                Badge bawah gambar: "● TELEM: STABLE"
                (background #0D0B1A, teks #2DFFC2, font mono, 10px)

  Info kanan  :
    Nama      : "Xion Regalia" — font size 28px, font weight 700, putih
    Subtitle  : "INDEPENDENT VTUBER · SINCE 2025"
                Teks #9B97C0, font mono, uppercase, 11px, letter spacing 0.1em

    Bio       : Paragraf 2-3 kalimat, teks #9B97C0, font size 14px
                Max-width: 400px

    Sosmed    : 3 tombol pill horizontal
                YouTube: background #FF0000 transparan, border #FF0000, ikon + teks
                Twitter: background #1DA1F2 transparan, border #1DA1F2
                TikTok: background #000000, border #333

    Stats     : 3 angka sejajar dengan divider vertikal
                "703" — Total Video (angka cyan besar, label abu kecil)
                "4.65k" — Subscribers (angka kuning/gold #FFD700)
                "Feb '25" — Debut (angka orange #FF8800)

EQUIPMENT CARD (di bawah profile card):
  Background  : #1A1730, border #2A2550, border-radius 16px, padding 24px
  Header      : "⚙ Equipment & Rig Specs" (teks putih, font weight 600)
                + Badge "CALIBRATED" (background #2DFFC2 transparan, border #2DFFC2)
                + "● TELEMETRY LINK ACTIVE" (kanan, teks #2DFFC2, 11px)
  Sub-header  : Deskripsi singkat, teks #9B97C0, font size 13px

  3 Kolom specs (grid 3 kolom, gap 16px, border atas per kolom):
    Kolom 1 "PC & PROCESSING" (label font mono cyan, 10px):
      PROCESSOR: "AMD Ryzen 9 7950X3D" (putih, bold)
                 "16 Cores / 32 Threads @ 5.7GHz" (abu, 13px)
      GRAPHICS:  "NVIDIA GeForce RTX 4090" (putih, bold)
                 "24GB GDDR6X VRAM" (abu, 13px)
    Kolom 2 "AUDIO & BROADCAST":
      MIC:       "Shure SM7B + Elgato Wave XLR"
                 "Cloudlifter CL-1 Inline Preamp"
      MONITOR:   "Sennheiser HD 600"
                 "Open-back Reference Headphones"
    Kolom 3 "RIG & TRACKING" (label gold):
      RIG:       "Obsidian Rig #03"
                 "ARKit 52 Blendshapes + Physics XYZ"
      ENGINE:    "iPhone 15 Pro TrueDepth"
                 "60 FPS VTube Studio + Hand Tracking"
```

---

### Section 1.3 — Upcoming Broadcast

```
Layout        : Full width, padding 80px 48px, background sedikit lebih gelap

Label section : Pill center "| JADWAL STREAM"
Heading       : "Upcoming Broadcast Transmission" — center, font size 32px
Sub-heading   : 2 baris teks abu, center, font size 14px

Label feed    : "≡≡ TRANS-SPECTRA FEED [UTC+07]" — kiri, font mono, abu, 11px
Nav arrows    : "‹" dan "›" — kanan, tombol lingkaran kecil

CAROUSEL JADWAL (horizontal scroll, 3 card terlihat):
  Setiap card (width ~300px, border-radius 16px, padding 24px):
    Card LIVE  : Border kiri 3px merah #FF4444
                 Background: #1A1730
                 Badge "● LIVE NOW" (merah) + badge genre (abu)
                 Ikon: lingkaran dengan ikon game di dalam (background #252240)
                 Judul: font size 16px, putih, font weight 600
                 Tanggal: "Hari ini · 23:00 WIB", abu, 13px
                 Status: "● Sedang Berlangsung" (merah, font size 13px)
                 CTA: "Tonton Siaran Sekarang →" (teks merah, font weight 600)

    Card UPCOMING: Border kiri 3px cyan #2DFFC2
                 Badge "UPCOMING" (cyan) + badge genre
                 Countdown: "in 2d 14h" (teks abu, 13px)
                 CTA: "Lihat Detail →" (teks abu)

Footer card  : Teks abu kecil di bawah carousel
```

---

## HALAMAN 2 — GAME VOTING (WEB VIEWER)

### Header Halaman
```
Background    : #0D0B1A, padding 48px 48px 0px
Badge         : "✦ AUDIENCE GOVERNANCE & TELEMETRY" 
                (font mono, teks abu, border #2A2550, pill kecil)
Heading       : "Game Voting" — font size 56px, font weight 800
                Gradient text: cyan ke purple (sama seperti hero)
Sub-heading   : Baris 1: "Pilih game yang ingin kamu tonton, Aku mainkan berikutnya."
                Baris 2: "Suaramu menentukan live dan playthrough selanjutnya."
                Teks #9B97C0, font size 16px

Info periode  : Card kecil di KANAN atas heading
                Background #1A1730, border #2A2550, border-radius 8px, padding 12px 16px
                Baris 1: "PERIODE: SEPTEMBER 2026" + dot hijau (kanan)
                Baris 2: "↺ Reset berkala oleh Creator · 1,480 Suara Terkumpul"
                Font: mono, 12px, teks abu/cyan
```

### Filter Tab
```
Layout        : Horizontal pill tabs, margin top 32px
Tabs          : Semua(12) | Requested(5) | Accepted(4) | ● Playing(1) | Done(2)
Tab aktif     : Background #2DFFC2, teks hitam, font weight 700, border-radius 20px
Tab lain      : Background transparan, teks #9B97C0, border none
Playing tab   : Ada dot orange sebelum teks

Kanan tab     : Search bar (background #1A1730, border #2A2550, ikon search, placeholder "Cari judul game...")
                + Dropdown "Suara Terbanyak ▼" (background #1A1730)
```

### Grid Game Cards
```
Layout        : 3 kolom, gap 20px, margin top 24px
Responsive    : 2 kolom tablet, 1 kolom mobile

CARD PLAYING (highlighted — border emas):
  Background  : #1A1730
  Border      : 2px solid #FFD700 (emas/gold)
  Border-radius: 16px
  Padding     : 0 (gambar full di atas) + 16px konten bawah

  Badge atas  : "PLAYING" — pojok kanan atas gambar
                Background #FFD700, teks hitam, font weight 700, 11px

  Cover image : Full width, height ~160px, object-fit cover, border-radius 12px 12px 0 0
  Label genre : "SURVIVAL HORROR / RETRO SCI-FI" — font mono, teks abu, 10px, margin top 12px
  Label durasi: "WEEK 3 ON AIR" — kanan, font mono, abu, 10px
  Judul       : "Signalis: Solitary Resonance" — font size 18px, putih, font weight 700

  Vote info   : "Voting Pool Result" (abu, 12px) + angka "486 votes · 38%" (kanan, putih)
  Progress bar: Full width, height 6px, background #252240
                Fill: gradient cyan ke purple, width sesuai persentase
                Border-radius: 3px

  Tombol      : Full width, background #252240, border 1px #FFD700
                Teks "⊙ Sedang Dimainkan" — kuning, font weight 600, center
                Padding 12px, border-radius 8px, margin top 12px

CARD ACCEPTED:
  Border      : 2px solid #9B6DFF (ungu)
  Badge       : "✦ ACCEPTED" (ungu, pojok kanan atas gambar)
  Label       : "TOP CANDIDATE #1"
  Progress    : Fill ungu/cyan
  Tombol      : "✓ Sudah Memberi Vote" (abu, disabled)
                ATAU "↑ Vote untuk Game Ini" (teks cyan, border cyan)

CARD REQUESTED:
  Border      : 1px solid #2A2550 (subtle)
  Badge       : "✦ REQUESTED"
  Tombol      : "↑ Vote untuk Game Ini" — border cyan, teks cyan
                Hover: background cyan transparan

CARD DONE:
  Border      : 1px solid #2A2550
  Badge       : "✓ DONE" (hijau #2DFFC2)
  Label bawah : "ARCHIVED BROADCAST" + "VOD AVAILABLE"
  Tombol      : "✓ Selesai Dimainkan" — disabled, background #1A1730, teks abu
```

### Form Request Game Baru
```
Layout        : Card full width, background #1E1B35, border 1px #2A2550
                Border-radius 16px, padding 32px, margin top 40px

Header        : Ikon pill ungu kiri
                "Request Game Baru" — font size 24px, putih, font weight 700
                Sub: deskripsi 2 baris, teks abu, 14px

Form 2 kolom  :
  Kolom kiri  : Label "JUDUL GAME *" (font mono, abu, 11px, uppercase)
                Input: background #252240, border #2A2550, border-radius 8px
                Padding 12px 16px, placeholder "Nama game yang ingin kamu request..."
                Ikon gamepad di dalam input (kiri)

  Kolom kanan : Label "GENRE / ALASAN (OPSIONAL)"
                Dropdown: background #252240, "Pilih Kategori..."

Info max      : "✦ Maksimum 1 request per pemirsa per sesi mingguan." (abu, 13px)
Tombol submit : Background #2DFFC2, teks hitam, "Kirim Request →"
                Padding 12px 24px, border-radius 8px, float kanan

Catatan bawah : 2 poin dengan bullet "✦", teks abu, 13px
```

---

## HALAMAN 3 — CONTENT GUIDE (WEB VIEWER)

### Header Halaman
```
Badge         : "✦ STREAM ARCHIVE & MEDIA VAULT" (pill, font mono, abu)
Heading       : "Content Guide" — font size 56px, font weight 800
                Gradient text: cyan ke purple
Sub-heading   : "Semua perjalanan stream Xion, terarsip rapi untuk kamu jelajahi."
                Teks abu, 16px

Kanan header  : Search bar + Dropdown "Terbaru ▼"
```

### Featured Card (Full Width)
```
Layout        : 2 kolom (video preview kiri 45% + info kanan 55%)
Background    : #1A1730, border #2A2550, border-radius 16px, padding 24px
Margin bottom : 32px

Kiri (preview):
  Thumbnail   : Gambar dengan overlay gelap
  Play button : Lingkaran putih dengan segitiga play, center
  Label bawah : "📺 FULL ARCHIVE · 14 EPISODES" (font mono, abu, 11px)

Kanan (info) :
  Badges      : "★ FEATURED SERIES" (gold) + "ACTION RPG / SOULSLIKE" (abu)
  Judul       : Font size 28px, putih, font weight 700
  Deskripsi   : 2-3 kalimat, abu, 14px, margin top 8px

  Stats 3 item: Ikon + angka + label (horizontal)
                "14 Video Siaran" | "48.5 Jam Total" | "100% Selesai Tamat"
                Teks abu, 14px, divider vertikal antar item

  Tombol      : "Tonton di YouTube →" (background #2DFFC2, teks hitam)
                + "Simpan ke Playlist" (border #2A2550, teks putih)
                Gap 12px
```

### Filter Tab Kategori
```
Layout        : Horizontal scroll, pill tabs
Tabs          : Semua(42) | Minecraft(16) | Elden Ring(14) | Stardew Valley(8) | dll
Tab aktif     : Background #2DFFC2, teks hitam
Info kanan    : "● Menampilkan 42 Playlist & Arsip" (teks abu, 13px)
```

### Grid Konten (4 Kolom)
```
Layout        : 4 kolom desktop, 2 kolom tablet, 1 kolom mobile
Gap           : 16px

Setiap card   :
  Border-radius: 12px, overflow hidden, background #1A1730, border #2A2550

  Thumbnail   : Full width, height 140px, object-fit cover, position relative
                Badge pojok kanan atas: "12 VIDEO" atau "03:42:15"
                (background hitam transparan, teks putih, font mono, 11px)
                Badge pojok kiri bawah: ikon playlist atau video (putih kecil)

  Konten bawah: Padding 14px
                Label genre: "SURVIVAL HORROR" (font mono, abu, 10px, uppercase)
                Judul: font size 15px, putih, font weight 600, 2 baris max
                Stats: "12 video · 28 jam total" (abu, 13px, margin top 4px)
                Link: "Tonton di YouTube →" (teks abu/cyan, 13px)
                      + ikon external link (kanan bawah card)
```

### Load More Button
```
Layout        : Center, margin top 40px
Tombol        : "↺ Muat Lebih Banyak Arsip (Load More)"
                Background transparan, border 1px #2A2550, teks putih
                Padding 12px 32px, border-radius 8px
Sub-teks      : "MENAMPILKAN 8 DARI 42 ARSIP SIARAN TERSEDIA" (abu, 11px, mono)
```

### CTA Discord
```
Layout        : Card full width, background #1A1730, border #2A2550, border-radius 12px
                Padding 20px 24px, margin top 40px, flex horizontal

Kiri          : Ikon "✦" besar (pill ungu)
                "Mencari klip atau momen tertentu?" (putih, font weight 600)
                Deskripsi 1 kalimat (abu, 13px)

Kanan         : Tombol "Buka Discord Vault ↗" (border putih, teks putih)
```

---

## HALAMAN 4 — LOGIN ADMIN (WEB)

### Layout
```
Background    : Full page #0D0B1A dengan gradient radial ungu sangat halus di tengah
Layout        : Center screen, card di tengah

Footer kiri   : "NODE // TOKYO-03 · LATENCY 12ms" (font mono, abu, 11px)
Footer kanan  : "AUTH GATE // v2.0.3 STABLE" (font mono, abu, 11px)
```

### Login Card
```
Width         : 480px, background #1A1730
Border        : 1px solid #2A2550, border-radius 16px, padding 40px
Position      : Center screen

Header card   :
  Logo        : "| X-VOCA 🔒" — kiri (teks putih bold, ikon gembok)
  Badge       : "● RESTRICTED ACCESS" — kanan
                Background #252240, teks #FFD700, dot kuning, font mono, 12px

Heading       : "Creator Login" — font size 28px, putih, font weight 700
Sub-heading   : "Hanya untuk " + "Xion Regalia" (teks cyan)
                Font size 14px

Form          :
  Label EMAIL : Font mono, teks #9B97C0, 11px, uppercase, margin bottom 6px
  Input email : Background #0D0B1A, border 1px #2A2550
                Padding 14px 16px, border-radius 8px, full width
                Ikon "@" di kiri (teks #9B97C0)
                Placeholder: "xion.regalia@gmail.com"
                Teks input: putih

  Label PASSWORD: Same style
  Input pass  : Ikon kunci di kiri, dots password
                Ikon mata di kanan (toggle show/hide)

  Tombol LOGIN: Full width, background #2DFFC2, teks hitam #0D0B1A
                Font weight 700, font size 16px, padding 14px
                Border-radius 8px, margin top 24px
                Teks: "Masuk →"

  Forgot pass : "Lupa password? Hubungi admin." — center, teks abu, 13px

Footer card   :
  "● TLS 1.3 SECURE ENCLAVE" (font mono, abu, 11px, center)
  "© 2025 X-VOCA REGALIA OPS · ENCRYPTED CREATOR SESSION" (abu, 10px, center)
```

---

## HALAMAN 5 — DASHBOARD ADMIN (WEB)

### Layout Global Admin
```
Sidebar kiri  : Width 200px, background #130F2A, height 100vh, fixed
Topbar        : Height 56px, background #0D0B1A, border-bottom #2A2550, fixed
Konten        : margin-left 200px, margin-top 56px, padding 32px, background #0D0B1A
```

### Sidebar
```
Background    : #130F2A, border-right 1px #2A2550

Logo area     : Padding 20px 16px
                "X-VOCA PRO" (teks putih, font weight 700)
                "● CREATOR OPS" (teks #2DFFC2, font mono, 10px)

Profile area  : Padding 16px, border-bottom #2A2550
                Avatar (36px lingkaran) + nama "Xion Regalia" (putih, 14px, bold)
                "● ONLINE" (teks #2DFFC2, font mono, 11px)

Menu items    : Padding 8px 16px per item, border-radius 8px
                Ikon (16px) + teks (14px), gap 10px
                Aktif: background #252240, teks putih
                Tidak aktif: teks #9B97C0, hover background #1A1730
  - 📊 Dashboard
  - 📅 Jadwal Stream
  - 🎮 Game Voting
  - 📖 Content Guide

Bottom menu   : Margin top auto, border-top #2A2550, padding 16px
  - ⚙ Settings (abu)
  - ↩ Keluar (merah #FF4444)
```

### Topbar
```
Kiri          : "CONSOLE" (abu) | "SESSION LIVE" (putih) | "● NODE 01 SYNCED" 
                (badge: background #1A1730, teks #2DFFC2, dot hijau, font mono, 11px)
Tengah        : Search bar "Quick search... ⌘K"
                Background #1A1730, border #2A2550, border-radius 8px, width 300px
Kanan         : Bell icon (dengan badge notif merah) + Avatar (32px) + "Xion R."
```

### Konten Dashboard

**Greeting + Status Bar:**
```
Badge         : "| TELEMETRY NODE 01 · Engine 4.19 Synced" (font mono, cyan, 12px)
Heading       : "Selamat datang, Xion" — font size 28px, putih, font weight 700
Tanggal       : "📅 Kamis, 24 Oktober 2026 UTC+07:00" (abu, 14px)
Toggle kanan  : "● BROADCASTING READY" + toggle switch (cyan saat ON)
```

**4 Stat Cards (Grid 4 kolom):**
```
Setiap card   : Background #1A1730, border #2A2550, border-radius 12px, padding 20px

Card 1 "Total Vote Bulan Ini":
  Ikon        : Upload icon (kanan atas card, abu)
  Angka       : "1,247" — font size 32px, cyan #2DFFC2, font weight 700
  Label       : "Total Vote Bulan Ini" — abu, 13px
  Badge bawah : "↑ 12% vs 30 hari lalu" (teks hijau, 12px)

Card 2 "Jadwal Upcoming":
  Angka       : "03" — font size 32px, ungu #9B6DFF
  Label       : "Jadwal Upcoming" + "Stream terverifikasi" (abu, 12px)
  Badge       : "SlotTerisi" (background ungu transparan)

Card 3 "Tugas Pending":
  Angka       : "05" — font size 32px, kuning #FFD700
  Badge       : "Prioritas urgent: 2 Critical" (merah, 12px)

Card 4 "Content Aktif":
  Angka       : "18" — font size 32px, putih
  Badge       : "100% VISIBLE" (hijau, 12px)
```

**3 Action Cards (Grid 3 kolom, di bawah stat cards):**
```
Card "+ Tambah Jadwal":
  Background  : #1E1B35, border #3D3870
  Ikon kiri   : Lingkaran ikon jadwal (background #252240)
  Teks        : "Sinkronisasi sesi siaran baru"
  Arrow "→"   : Kanan, teks cyan

Card "Lihat Voting →":
  Background  : #1A1730

Card "+ Tambah Content":
  Background  : #2A1F10, border #5C3D00 (golden tint)
```

**Audit Log Section:**
```
Header        : "AUDIT LOG" (badge abu kiri) + "Aktivitas Terkini" (putih, 20px bold)
                Sub: "Log interaksi dan perubahan data operasional stasiun siaran"
                Tombol kanan: "⊟ Filter" + "↺ Refresh" (border #2A2550, abu)

Tabel         : Background #1A1730, border-radius 12px, overflow hidden
  Header row  : Background #252240, teks #9B97C0, font mono, 11px, uppercase
                Kolom: WAKTU | AKSI | DETAIL
  Data rows   : Padding 16px, border-bottom #2A2550

  Kolom WAKTU : "10 mnt lalu" — abu, 14px, ikon jam kiri
  Kolom AKSI  : Badge pill berwarna sesuai jenis:
                "Vote Masuk" → background cyan transparan, border cyan, teks cyan
                "Jadwal Diupdate" → ungu
                "Request Game" → gold
                "Aset Diarsip" → abu
  Kolom DETAIL: Teks utama putih 14px + sub-teks abu 12px di bawahnya

Pagination    : "Menampilkan 4 dari 142 entri log"
                Tombol "Sebelumnya | 1/36 | Berikutnya" — kanan
```

**Rig Calibration Widget (sidebar kanan floating atau card bawah):**
```
Header        : "RIG CALIBRATION" (font mono, abu) + dot hijau
Gambar        : Thumbnail visual rig (gambar gelap sci-fi)
                Badge overlay: "Xion_Rig_v3.4" + "60 FPS" (pojok kanan atas gambar)
                Label: "ARKit 52 Blendshapes · Active" (abu, 12px)

Metrics       :
  "Audio Dynamic Range": progress bar hijau, nilai "-14.2 LUFS" (kanan, cyan)
  "Tracking Latency"   : progress bar, nilai "12.4 ms"
  "VRAM Allocation"    : progress bar, nilai "4.8 / 12 GB"

Tombol        : "Reset Tracking" (background #252240, teks putih, border #2A2550)
                + ikon settings (kanan tombol)

Poll Monitor  :
  "POLL LIVE MONITOR · Vote Velocity / Jam" (header, abu, font mono)
  Grafik garis: kurva smooth warna ungu/cyan, background #0D0B1A
  Label bawah : "● Puncak: 21:00 (148 votes/h) · +24.8% spike" (abu + cyan, 12px)
```

---

## HALAMAN 6 — MANAJEMEN JADWAL STREAM (WEB ADMIN)

### Header Halaman
```
Badge         : "| SIARAN & PENJADWALAN" (font mono, cyan)
Heading       : "Manajemen Jadwal" — font size 28px, putih, bold
Sub           : "Kelola jadwal stream Xion, sinkronisasi countdown publik..."
Search        : Input search "Cari judul atau game..." + Filter tabs kanan
                Tabs: SEMUA(14) | LIVE(1) | UPCOMING(8) | ARSIP
Tombol        : "+ Tambah Jadwal" — background #2DFFC2, teks hitam, kanan
```

### 4 Summary Cards
```
Layout        : 4 kolom, gap 16px
Card style    : Background #1A1730, border #2A2550, border-radius 12px, padding 16px 20px

Card 1 "Siaran Aktif": 
  Ikon broadcast + "Elden Ring Rush" (putih bold) + badge merah "●" (live indicator)
Card 2 "Slot Terjadwal 7 Hari":
  Ikon kalender + "4 Sesi Terdaftar" (putih bold)
Card 3 "Sinkronisasi Fansite":
  Ikon sync + "Tersambung (0.4s)" (cyan)
Card 4 "Voting Terpilih":
  Ikon voting + "Outer Wilds (64%)" (gold)
```

### Tabel Master Queue
```
Header tabel  : "MASTER QUEUE" + badge "Server Region: Asia/Jakarta (WIB)"
                Ikon reload + ikon download (kanan)

Kolom         : NO | JUDUL STREAM | KATEGORI GAME | TANGGAL & WAKTU | STATUS | AKSI
Background    : #1A1730, border-radius 12px

Row data      :
  NO          : Angka (01, 02, dst), abu, font mono
  JUDUL       : Teks utama (putih, 14px, bold) + sub-teks 2-3 baris abu 12px
                (berisi: deskripsi singkat, Stream ID, total viewers untuk yang live)
  KATEGORI    : Badge pill (background sesuai game, teks putih kecil)
                Contoh: "● MINECRAFT" (hijau), "● ELDEN RING" (orange)
  TANGGAL     : "📅 20 Sep 2026, 19:00 WIB" (abu, 13px)
  STATUS      : Badge: "● UPCOMING" (ungu) | "● LIVE NOW" (merah) | "✓ DONE" (abu)
  AKSI        : Row LIVE: tombol "● Stop" (merah) + ikon external link + ikon edit
                Row lain: ikon preview + ikon edit + ikon hapus (merah)

Row LIVE      : Background sedikit lebih terang (#252240), border-left 3px merah
```

### Form Panel Kanan (Slide-in saat tambah/edit)
```
Width         : 360px, fixed kanan, height 100%, background #130F2A
Border-left   : 1px solid #2A2550, padding 24px
Overlay       : Background gelap transparan di belakang panel

Header panel  : "● MODIFIKASI JADWAL" (badge merah kiri)
                "Tambah Jadwal Baru" — putih, bold, 20px
                "Entry langsung ke telemetry node broadcast" (abu, 13px)
                Tombol ✕ (kanan atas)

Form fields   :
  Judul Stream: Label + "Maks 80 Char" (kanan, abu, 11px)
                Input text full width, background #1A1730, border #2A2550

  Kategori    : Dropdown dengan icon search di dalam
  Tanggal     : Date picker (background #1A1730)
  Waktu (WIB) : Time picker
  Deskripsi   : Textarea 3 baris

  Toggle      : "Hitung Mundur Fansite"
                Row horizontal: label kiri + toggle switch kanan (cyan saat ON)
                Sub: "Sinkronisasi banner publik portal!" (abu, 12px)
  Info toggle : "Countdown publik otomatis mulai T-24 jam sebelum siaran." (abu, 12px, italic)

Tombol bawah  : "✓ Simpan Jadwal" (full width, background #2DFFC2, teks hitam, bold)
                "Batal" (full width, background transparan, teks abu, border none)
```

---

## HALAMAN 7 — MODERASI VOTING (WEB ADMIN)

### Header
```
Badge         : "✦ AUDIENCE GOVERNANCE MODERATION"
Heading       : "Moderasi Voting" (putih, 28px, bold)
Sub           : Deskripsi 2 baris (abu)
Tombol kanan  : "↺ Reset Periode Voting" (border #2A2550, abu)
                "+ Tambah Game" (background #2DFFC2, teks hitam)
```

### 4 Summary Cards
```
Total Usulan  : "18 Game" + badge "↑+4 minggu ini"
Suara Terkumpul: "1,480" (font besar, cyan) + "Quorum 84% tercapai" (hijau)
Sedang Dimainkan: "Signalis (1)" (gold) + "● Live Campaign Aktif"
Menunggu Review: "3 Request" + "Butuh moderasi"
```

### Tabel Utama
```
Filter tabs   : SEMUA(18) | REQUESTED(5) | ACCEPTED(8) | PLAYING(1) | DONE(4)
Search        : "Cari judul game atau nama viewer..." (kanan)

Kolom tabel   : RANK | COVER | JUDUL GAME | JUMLAH VOTE | STATUS | DITAMBAH OLEH | AKSI MODERASI

Row data      :
  RANK        : "#1" dengan medali emas 🥇 (top 3 ada medali)
  COVER       : Thumbnail kecil 48x48px, border-radius 8px
  JUDUL       : "Elden Ring: Shadow of..." (putih, bold, 14px) + genre + publisher (abu, 12px)
  VOTE        : "247 · 45%" (putih bold + abu kecil) + progress bar di bawah (cyan, tipis)
  STATUS      : Badge "● REQUESTED" (ungu) | "● ACCEPTED" | "● PLAYING" (gold) | "● DONE"
  DITAMBAH    : "Viewer #4021" (abu) + "Regalia Crew" (lebih kecil, abu)
                Atau "Creator (Xion)" + "Admin Official" dengan ikon centang
  AKSI        : Tombol-tombol kecil:
                "✓ Accept" (border cyan, teks cyan)
                "▶ Playing" (border gold, teks gold) — highlight saat game sudah accepted
                "✓ Done" (border abu, teks abu)
                Ikon hapus 🗑 (merah, paling kanan)

Row PLAYING   : Background #1E1B10 (golden tint) + tombol "Sedang Tayang" (gold, aktif)
Row DONE      : Teks abu/muted, tombol-tombol disabled
```

### Info Periode (Banner Bawah)
```
Layout        : Card full width, background #1A1730, border-left 3px #9B6DFF
                Padding 20px 24px, border-radius 0 12px 12px 0

Kiri          : Ikon jam lingkaran
                "Informasi Periode Voting #14 · SISA 6 HARI" (putih, bold)
                Paragraf penjelasan (abu, 14px)

Kanan         : "Konfigurasi Auto-Roll" (border abu, abu)
                "Ekspor Data" (background #9B6DFF, putih)
```

---

## HALAMAN 8 — MANAJEMEN CONTENT GUIDE (WEB ADMIN)

### Header + Stat Cards
```
Badge         : "● CONTENT VAULT & MEDIA CURATION"
Heading       : "Manajemen Content Guide"
Search        : Input "Cari judul, tag game, atau ID... ⌘K" + Dropdown "Semua Status ▼"
Tombol        : "+ Tambah Konten" (background #2DFFC2, teks hitam)

4 Stat cards  :
  "TOTAL KONTEN: 18 Entries"
  "PUBLIK VISIBLE: 15 Aktif Tayang" (ikon mata hijau)
  "HIDDEN / DRAFT: 3 Diarsipkan" (ikon mata coret, merah)
  "FEATURED SERIES: 1 Elden Ring" (ikon bintang gold)
```

### Grid Konten (3 Kolom)
```
Label         : "GRID KURASI VIDEO · Menampilkan 6 dari 18 arsip"
Sort          : "Urutkan: Sort Index (Asc)" (kanan)

Setiap card   : Background #1A1730, border #2A2550, border-radius 12px
                Overflow hidden, position relative

  Badge VISIBLE: Top-left overlay "● VISIBLE" (background hijau transparan)
  Badge FEATURED: Top-right "★ FEATURED" (gold, hanya yang featured)
  Badge HIDDEN : "⊗ HIDDEN" (merah)

  Thumbnail   : Gambar full width, height 120px, object-fit cover

  Konten bawah: Padding 14px
    Genre     : "ACTION RPG" (font mono, abu, 10px) + "# 1" (kanan, abu, 10px)
    Judul     : Putih, 14px, bold, 2 baris max (truncate)
    URL       : "youtu.be/playlist?lis..." (abu, 12px, truncate)
    Stats     : "14 Video · 48.5 Jam Total" | "HD 1080p" (kanan, abu, 12px)

  Action bar  : 4 ikon horizontal di bawah stats
                ✏ Edit | 👁 Toggle visible | ★ Toggle featured | 🗑 Hapus
                Warna: abu default, hover warna masing-masing
```

### Form Panel Kanan (Add/Edit)
```
Width         : 380px, background #130F2A, fixed kanan, padding 24px

Header        : "● FORM KURASI"
                "Tambah Konten Baru" (putih, bold, 20px)
                Tombol ✕

Fields        :
  Judul Konten: Label + "Maks 80 Karakter" (kanan)
                Input: "Persona 3 Reload: Tartarus Midnight..." (placeholder)

  Game Tag    : Input dengan ikon tag di kanan
                "JRPG / Narrative"

  YouTube URL : Input dengan ikon YouTube merah di kiri
                "https://youtube.com/playlist?list..."

  Thumbnail   : Label + "16:9 Aspect" (kanan, badge abu)
                Input URL
                Preview: Gambar thumbnail langsung tampil di bawah input
                Badge "THUMBNAIL TERDETEKSI (1920X1080)" (hijau, di atas preview)
                Ikon refresh (pojok kanan preview)

  Toggles     :
    "★ Featured Banner": toggle + sub "Set sebagai sorotan..."
    "👁 Visible di Publik": toggle + sub "Tampilkan langsung ke katalog publik"

  Sort Order  : Label + stepper (tombol "-" + angka "7" + tombol "+")
                Sub: "Nomor urut prioritas katalog" (abu, 12px)

Tombol bawah  : "💾 Simpan Konten" (full width, background #9B6DFF, putih)
                "Batal" (transparan, abu)
```

---

## CATATAN PENTING UNTUK AI

Ketika generate kode halaman web, SELALU:

1. **Cek bagian halaman yang relevan di file ini** sebelum menulis JSX/CSS
2. **Gunakan class Tailwind dari DESIGN_TOKENS.md** — jangan hardcode hex langsung
3. **Ikuti layout dan hierarki elemen** persis seperti dideskripsikan di atas
4. **Pertahankan nuansa "Cyber Nocturne"** — dark, tech, VTuber aesthetic
5. **Font Space Grotesk untuk semua teks**, Space Mono untuk label teknis/badge
6. **Semua badge/label teknis** gunakan uppercase + letter-spacing + font mono
7. **Border subtle** (#2A2550) untuk memisahkan elemen, bukan shadow
8. **Gradient cyan→purple** untuk elemen highlight/CTA utama
9. **Animasi** hanya di elemen yang benar-benar butuh (countdown, pulse badge live)
10. **Responsive** — semua halaman harus bisa tampil di mobile (375px) sampai desktop (1440px)
