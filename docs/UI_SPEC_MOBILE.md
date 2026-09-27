# UI_SPEC_MOBILE.md — Spesifikasi Visual Mobile X-VOCA
# Deskripsi detail layout setiap screen Flutter berdasarkan mockup
# Dibaca oleh: Choirul + AI Gemini setiap kali mengerjakan screen Flutter
# WAJIB di-attach/copy bersama PROJECT_CONTEXT.md dan AI_RULES_MOBILE.md

---

## PANDUAN UMUM SEMUA SCREEN MOBILE

### Tema Global
```
Mode          : Dark mode only
Background    : #0D0B1A (hampir hitam dengan tint ungu)
Font utama    : Space Grotesk (google_fonts)
Font mono     : Space Mono (untuk badge teknis, label status)
Viewport      : Desain untuk layar ~390px lebar (iPhone 14 / Android standar)
SafeArea      : Gunakan SafeArea widget di semua screen
```

### Bottom Navigation Bar (Semua Screen setelah Login)
```
Widget        : BottomNavigationBar
Background    : #130F2A
Height        : ~65px (default Flutter)
Border top    : 1px solid #2A2550

5 Tab items   :
  1. Home     : Ikon rumah, label "Home"
  2. Schedule : Ikon kalender, label "Schedule"
  3. Votes    : Ikon bar chart (dengan dot ungu kecil di pojok atas ikon = notif)
                Label "Votes"
  4. To-Do    : Ikon checklist/task, label "To-Do"
  5. Profile  : Ikon person, label "Profile"

Tab aktif     : Ikon + teks warna #2DFFC2 (cyan)
Tab tidak aktif: Ikon + teks warna #5C587A (muted)
Semua ikon    : Lucide Icons
```

### AppBar (Semua Screen)
```
Widget        : AppBar atau custom SliverAppBar
Background    : #0D0B1A (sama dengan background)
Elevation     : 0 (tidak ada shadow)

Kiri          : "X-VOCA" (teks putih, font weight 700, font size 18px)
                + Badge "CREATOR HUB"
                  (Container: background transparan, border 1px #2DFFC2,
                   border-radius 20px, padding 2px 10px,
                   teks #2DFFC2, font mono, font size 10px)

Kanan         : Icon bell (Lucide Icons, warna #9B97C0)
                  + Badge notif kecil (bulat merah, pojok kanan atas ikon, size 8px)
                + Avatar Creator (CircleAvatar, radius 16px, background #252240)
                  + Dot status online (hijau #2DFFC2, 8px, pojok kanan bawah avatar)
```

---

## SCREEN 1 — LOGIN

### Layout Keseluruhan
```
Widget        : Scaffold, background #0D0B1A
Padding       : 24px horizontal

Header area   : Top section, padding top 48px
  Logo        : Row: ikon audio bars (warna cyan, size 24px) + spasi + "X-VOCA" (putih, bold, 22px)
  Badge       : Container di kanan logo
                "● CREATOR HUB" (background #1A1730, border #2A2550, teks #2DFFC2, font mono, 11px)
```

### Card Login
```
Widget        : Container dengan margin top 48px
Background    : #1A1730
Border        : 1px solid #2A2550, border-radius 20px
Padding       : 28px 24px

Heading       : "Sign In" (putih, font size 28px, font weight 700)
Sub           : "Access your creator control room & telemetry"
                (#9B97C0, font size 14px, margin bottom 28px)

Label "CREATOR ACCOUNT":
  Warna       : #FFD700 (gold/kuning), font mono, font size 11px, uppercase
  Margin bottom: 8px

Input Email   :
  Widget      : TextFormField
  Background  : #252240, border-radius 12px, border NONE (pakai filled)
  Prefix ikon : "@" ikon (Lucide, warna #9B97C0)
  Suffix ikon : Centang hijau (jika email valid terdeteksi)
  Placeholder : "xionregalia@gmail.com" (#5C587A)
  Teks input  : Putih, font size 15px
  Padding     : 16px

Label "PASSWORD":
  Warna       : #FFD700, font mono, 11px, uppercase (sama seperti email)

Input Password:
  Prefix ikon : Kunci (Lucide, #9B97C0)
  Suffix ikon : Mata (toggle show/hide, #9B97C0)
  Content     : Dots/asterisks

Row bawah input password:
  Kiri        : Row: Toggle (cyan saat aktif) + "Keep session active" (#9B97C0, 14px)
  Kanan       : "Forgot Password?" (#9B6DFF, 14px)

Tombol "Sign In to Dashboard →":
  Widget      : ElevatedButton, full width, margin top 24px
  Background  : Gradient LinearGradient dari #2DFFC2 (kiri) ke #9B6DFF (kanan)
  Teks        : "Sign In to Dashboard →", hitam #0D0B1A, font weight 700, font size 16px
  Border-radius: 50px (pill shape)
  Padding     : 18px vertical

Divider       : Garis horizontal tipis (#2A2550), margin top 24px

Tombol Biometrik:
  Widget      : OutlinedButton, full width
  Background  : #1A1730 (sedikit berbeda)
  Border      : 1px solid #2A2550, border-radius 16px
  Row konten  : Ikon fingerprint (#2DFFC2, size 24px) + "Quick Sign In with Biometrics" (putih, 15px)
  Padding     : 18px vertical

Footer card   :
  "🔒 X-VOCA OFFICIAL ADMIN PORTAL · ENCRYPTED" (gold, font mono, 11px, center)
  "v2.4.0-StageDeck · 256-Bit SSL Secured" (#5C587A, 12px, center)
  Margin top  : 20px
```

---

## SCREEN 2 — DASHBOARD

### Layout
```
Widget        : Scaffold + CustomScrollView dengan SliverList
Background    : #0D0B1A
Padding konten: 16px horizontal
```

### Card "Next Live / Countdown"
```
Widget        : Container, margin top 16px
Background    : #1A1730
Border        : 1px solid #2A2550, border-radius 16px
Padding       : 16px

Row atas      :
  Thumbnail   : Container 80x60px, border-radius 8px, background #252240
                (gambar cover game, ClipRRect)
                Badge overlay "● NEXT LIVE" (pojok kiri atas thumbnail)
                  Background #2DFFC2, teks hitam, font size 9px, padding 2px 6px

  Info kanan  : Column, margin left 12px, expanded
    Label     : "GAMING · SOLO STREAM" (dots pemisah, #9B97C0, font mono, 10px)
    Judul     : "Cyberpunk 2077 Night" (putih, font size 18px, font weight 700)

    Countdown row:
      Ikon    : Jam (Lucide, #9B97C0, size 14px)
      Label   : "T-MINUS" (#9B97C0, font mono, 10px)
      Waktu   : "04h : 12m : 04s"
                (Container background #0D0B1A, border-radius 8px, padding 8px 12px)
                Font: Space Mono, font size 20px, font weight 700, warna #2DFFC2
                Gap antar angka: titik dua putih

Row bawah card:
  Kiri        : "📹 Obsidian Rig #03 Ready" (#9B97C0, font size 13px)
                (CATATAN: ini sekarang diganti dengan widget statis kosmetik)
  Kanan       : Tombol "Manage Schedule ›"
                Background #252240, border-radius 20px, teks putih, 13px
                Padding 8px 16px
```

### Section "Community Pulse"
```
Header row    :
  Kiri        : Row: Indikator vertikal (2px, cyan, height 20px) + "Community Pulse" (putih, 20px, bold)
  Kanan       : "LIVE TELEMETRY" (#FFD700, font mono, 11px, uppercase)
Margin        : top 24px, bottom 12px

Grid 2x2 (4 stat cards):
  Widget      : GridView, crossAxisCount 2, childAspectRatio ~1.3, spacing 12px

  Card "Total Votes":
    Background: #1A1730, border-radius 14px, padding 16px
    Ikon      : Upload ikon (Lucide, dalam Container lingkaran 36px, background #252240)
    Badge     : "+18%" pojok kanan (background #1A2520, teks #2DFFC2, font mono, 11px)
    Angka     : "1,420" (putih, font size 28px, font weight 700, margin top 8px)
    Label     : "Total Votes Cast" (#9B97C0, 13px)

  Card "Top Voted Game":
    Badge     : "48% Share" (background #2A2040, teks #9B6DFF)
    Angka     : "GTA V" (putih, font size 24px, bold)
    Label     : "Top Voted Title"

  Card "Pending Requests":
    Badge     : "Action Req." (background #2A1A10, teks #FF8800, border-radius 20px)
    Angka     : "5 Games" (putih, font size 24px, bold)
    Label     : "Pending Requests"

  Card "Tasks":
    Badge     : "Backstage" (#5C587A, abu)
    Angka     : "3 Tasks" (putih, font size 24px, bold)
    Label     : "● High priority queued" (merah/orange, 13px, dengan dot)
```

### Section "Internal Tasks"
```
Header row    :
  Kiri        : Indikator cyan + "Internal Tasks" (putih, 20px, bold)
  Kanan       : "See All →" (#9B97C0, 14px, TextButton)
Margin top    : 24px

List tasks (3 item teratas):
  Setiap row  : Padding vertical 14px, border-bottom 1px #2A2550

  Row 1 (URGENT):
    Kiri      : CircleAvatar 36px, background #252240 (warna abu-abu gelap)
    Tengah    : Column expanded
                "Check OBS Audio Filters" (putih, 15px, font weight 600)
                "Virtual DSP gain compensation (-3.2db)" (#9B97C0, 12px, maxLines 1)
    Kanan     : Badge "URGENT" (background #FF4444, teks putih, border-radius 4px, 10px)

  Row 2 (MEDIUM):
    CircleAvatar abu + teks "Render YouTube Shorts" + Badge "MEDIUM" (gold, background #2A1A00)

  Row 3 (Avatar Sync — berbeda):
    Container background #1A1730, border-radius 12px, padding 12px
    Row: Ikon bars/waveform (dalam Container lingkaran 40px, background #1E2040, ikon cyan)
         + Column: "Avatar Sync Latency" (putih) + "Optimal · 12ms Roundtrip" (#2DFFC2)
         + Bar chart mini (3 bar kecil warna cyan/ungu/putih, di kanan)
```

---

## SCREEN 3 — STREAM SCHEDULE

### AppBar Khusus
```
Background    : #0D0B1A
Kiri          : "Stream Schedule" (putih, font size 22px, bold)
                Sub: "Manage and sync live broadcasts" (#9B97C0, 13px)
Kanan         : Ikon search (Lucide) + Ikon filter/sliders (dalam lingkaran #1A1730)
```

### Tab Filter
```
Widget        : Row dengan TabBar custom (bukan default TabBar)
Margin        : 16px horizontal, 12px vertical

Tab "Upcoming" (aktif):
  Background  : #2DFFC2, border-radius 20px, padding 8px 20px
  Teks        : "Upcoming", hitam, font weight 700, 14px

Tab "Live Now":
  Background  : transparan
  Row konten  : Dot merah 8px + "Live Now" (#9B97C0, 14px)

Tab "History":
  Teks        : "History" (#9B97C0, 14px)
```

### Card "Next Broadcast" (Highlighted)
```
Widget        : Container, margin 16px horizontal, border-radius 16px
Background    : #1A1730
Border        : 1px solid #2A2550, padding 16px

Baris badge   : Row
  "NEXT BROADCAST" (pill: background #252240, teks #9B6DFF, font mono, 10px)
  "● YouTube Synced" (pill: background #1A2520, teks #2DFFC2, dot hijau, 10px)
  Ikon pensil (kanan, #9B97C0)
  Ikon external link (kanan, #9B97C0)

Judul         : "Cyberpunk 2077 – Main Story Exploration" (putih, 18px, bold, margin top 10px)

Info game     : Row: Ikon gamepad (cyan, 14px) + "Cyberpunk 2077 · Obsidian Rig #03" (abu, 13px)
Info waktu    : Row: Ikon jam (abu, 14px) + "Today, 20:00 WIB" (abu, 13px)

Countdown box : Container, background #0D0B1A, border-radius 10px, padding 12px, margin top 12px
  Label atas  : "TIME UNTIL GO-LIVE" (#9B97C0, font mono, 10px, uppercase)
  Row         : Angka countdown "04h : 12m : 05s" (cyan, Space Mono, 28px, bold)
                + Badge "📺 OBS Ready" (kanan: background transparan, border #FFD700, teks #FFD700, 11px)

Info bawah    : Row: "● Bitrate preset: 1080p60" (abu, 12px) + "Stream Key: ●●●●●●●●" (abu, 12px, kanan)
```

### Section "Scheduled Events"
```
Header row    :
  "SCHEDULED EVENTS (2)" (#9B97C0, font mono, 12px, uppercase)
  "Auto-Sync Enabled ☁" (#2DFFC2, 12px, kanan)
Margin        : top 20px, bottom 8px

Setiap event card :
  Widget      : Container, background #1A1730, border-radius 14px, padding 16px, margin bottom 12px

  Baris atas  : Row
    Badge game: "Minecraft" (pill: background #1A2A1A, teks #4CAF50, border #4CAF50, 12px)
    Waktu     : "📅 Tomorrow, 19:30 WIB" (abu, 13px)
    Ikon edit : Pojok kanan (Lucide pencil, #9B97C0)

  Judul       : "Minecraft Chill Stream – Mega Build Project" (putih, 16px, bold, margin top 8px)

  Row bawah   :
    Toggle    : Row: "Public Countdown" (#9B97C0, 13px) + Switch (cyan saat ON)
    Badge     : "👥 VIP Chat Only" (kanan: #9B97C0, 12px)
```

### FAB Tombol "+ Add Schedule"
```
Widget        : FloatingActionButton.extended
Position      : Bottom right, margin 16px
Background    : Gradient #2DFFC2 ke #9B6DFF (LinearGradient)
Ikon          : "+" putih
Label         : "Add Schedule" (hitam/putih, font weight 700)
Border-radius : 30px
```

---

## SCREEN 4 — ADD SCHEDULE (BOTTOM SHEET)

### Container
```
Widget        : DraggableScrollableSheet atau BottomSheet
Background    : #1A1730
Border-radius : 20px 20px 0 0
Padding       : 20px 20px 32px
Handle        : Garis abu kecil di atas (Container 40x4px, #5C587A, border-radius 2px, center)
```

### Konten
```
Heading       : "Add Stream Schedule" (putih, 22px, bold)
Sub           : "Schedule & sync across creator endpoints" (#9B97C0, 13px)
Tombol ✕      : Lingkaran (#252240, ikon X, #9B97C0) — pojok kanan atas

Auto-fill box :
  Container   : background #252240, border 1px #9B6DFF, border-radius 12px, padding 16px
  Label       : "★ AUTO-FILL VIA YOUTUBE LINK" (#9B6DFF, font mono, 11px, uppercase)
  Row input   : Ikon YouTube merah (24px) + Input URL (putih, expanded)
                + Tombol "Fetch →" (background #2DFFC2, teks hitam, border-radius 8px, padding 8px 16px)

Divider       : "——— OR ENTER DETAILS MANUALLY ———" (abu, center, font size 12px)
                (garis kiri-kanan, teks di tengah)

Label "STREAM TITLE": Font mono, #9B97C0, 11px, uppercase
Input title   : Background #252240, border-radius 10px, border NONE
                Suffix: ikon pensil (#9B97C0)
                Teks: "Cyberpunk 2077 Night Stream" (putih, 15px)

Label "GAME CATEGORY":
Dropdown      : Background #252240, border-radius 10px, padding 14px 16px
                Row: Ikon gamepad (#9B97C0) + "Cyberpunk 2077 (Action RPG)" (putih) + chevron down (kanan)

Row DATE + TIME (2 kolom):
  Kolom DATE  :
    Label     : "DATE" (font mono, abu, 11px)
    Container : Background #252240, border-radius 10px, padding 14px
                Row: Ikon kalender (#9B97C0) + "24 Aug 2026" (putih)
  Kolom TIME  :
    Label     : "TIME"
    Container : Ikon jam + "20:00 WIB"

Toggle card   :
  Container   : Background #252240, border-radius 10px, padding 14px 16px
  Row         : Column (teks kiri) + Switch (kanan)
    Teks atas : "Publish Countdown to Viewer Web" (putih, 14px, bold)
    Teks bawah: "Syncs live timer to xionregalia.com/live" (#9B97C0, 12px)
    Switch    : Aktif (cyan)

Label "DESCRIPTION":
Textarea      : Background #252240, border-radius 10px, minLines 3, padding 14px

Bottom buttons: Row, gap 12px, margin top 24px
  "Discard"   : Expanded, background #252240, teks putih, border-radius 30px, padding 14px
  "✓ Save & Sync to Web": Expanded (flex 2), gradient cyan-purple
                Teks hitam, font weight 700, border-radius 30px, padding 14px
```

---

## SCREEN 5 — VOTE ANALYTICS

### AppBar Khusus
```
Heading       : "Vote Analytics" (putih, 22px, bold)
Sub           : "Moderate game requests & rankings" (#9B97C0, 13px)
Tombol kanan  : "↺ Reset Period" (background #1A1730, border #2A2550, teks #9B97C0, 12px, border-radius 20px)
```

### Tab Filter
```
Tab "All Lifecycle" : abu, tidak aktif
Tab "Pending (Req) 1": aktif (background #FFD700, teks hitam, badge angka "1")
Tab "● Done"         : dot hijau + teks abu
```

### Section Moderation Queue
```
Header        : "Moderation Queue (Lifecycle Stages 1 & 2)" (putih, 16px, bold)
                "Batch Review ›" (kanan, #9B97C0, 13px)

Card REQUESTED (Resident Evil 4 Remake):
  Container   : Background #1A1730, border-radius 14px, padding 16px, margin bottom 12px

  Status bar  : Row
    Badge     : "⊙ STATUS: REQUESTED (PENDING APPROVAL)" (font mono, abu, 10px, background #252240)
    Badge VIP : "★ VIP" (gold, kanan)

  Row game    :
    Thumbnail : 60x60px, border-radius 8px, ClipRRect
    Info      : Column
                "Resident Evil 4 Remake" (putih, 16px, bold)
                "Requested by @KuroNeko" (#9B97C0, 13px)
                Row: ikon jam + "2 hours ago · Priority Queue" (#9B97C0, 12px)

  Row tombol  : 2 tombol, gap 12px, margin top 12px
    "✓ Approve/Accept": Expanded, background #2DFFC2, teks hitam, bold, border-radius 10px, padding 14px
    "⊗ Reject"         : Expanded, background #2A1010, border 1px #FF4444, teks #FF4444, border-radius 10px

Card ACCEPTED (Elden Ring):
  Status badge: "✦ STATUS: ACCEPTED (QUEUED NEXT)" (cyan) + "QUEUED" (abu, kanan)
  Thumbnail + info + requester
  Row tombol  :
    "▶ Set to Playing": background #9B6DFF, putih, expanded
    "✓ Mark as Done"  : background #252240, border #2DFFC2, teks #2DFFC2, expanded
```

### Section Active & Finished
```
Header        : "Active & Finished (Stages 3 & 4)" (putih, 16px, bold)
                "⏱ Ends in 2d 04h" (kanan, abu, 13px)

Card PLAYING (GTA V):
  Background  : #1A1730, border 1px #FF4444 (merah = live)
  Badge atas  : "● 🔴 LIVE / PLAYING NOW" (merah, font mono, 11px)
  Row stats   : "On Air: 01h 45m" + "640 Votes (48%)" (putih, bold, font size 16px)
  Info game   : Row: ikon gamepad (ungu) + "GTA V Stream – Chaos Mod" (putih, bold)
                Sub: "Heist Night with Collab VTubers..." (abu, 12px, truncate)
  Progress bar: Full width, height 8px, background #252240
                Fill: cyan, width 48%, border-radius 4px
  Label bar   : "Leading by +220 votes" (abu, 12px) + "Active Livestream" (kanan, cyan, 12px)
  Tombol      : Full width, "✓ Mark as Completed / Done" (border #2DFFC2, teks #2DFFC2, padding 14px, border-radius 10px)

Card DONE (Valorant):
  Background  : #1A1730, opacity sedikit lebih gelap
  Badge       : "✓ COMPLETED / FINISHED" (hijau) + "Archived" (kanan, abu)
  Row info    : Ikon checkmark (hijau, dalam lingkaran) + info game + "420 Votes" (kanan, putih, bold)
  Sub-info    : "Finished on 22 Aug · 420 Votes Completed" + "VOD Uploaded" (kanan)

Row item sederhana (Chilla's Art):
  "⏱ Chilla's Art Horror Marathon  Finished · 270 Votes" (abu, 13px)
  Border-top 1px #2A2550
```

---

## SCREEN 6 — TO-DO LIST

### AppBar Khusus
```
Heading       : "Internal To-Do List" (putih, 22px, bold)
Sub           : "Private notes & editing deadlines" (#9B97C0, 13px)
Kanan         : Ikon search + Ikon kalender (masing-masing dalam Container lingkaran #1A1730)
```

### Tab Filter
```
Tab "All Tasks" : Aktif (background #2DFFC2, teks hitam)
Tab "Urgent (2)": dot merah + teks abu + angka badge merah "2"
Tab "Editing"   : abu
Tab "Completed" : abu
```

### Progress Section
```
Widget        : Container, background #1A1730, border-radius 14px, padding 16px, margin 16px horizontal

Row atas      : Ikon target (#2DFFC2) + "Today's Progress" (putih, 15px, bold)
                "3 OF 5 COMPLETED" (kanan, #2DFFC2, font mono, 12px)

Progress bar  : LinearProgressIndicator, value 0.6 (60%)
                Background: #252240, valueColor: gradient ungu ke cyan
                Height: 8px, border-radius 4px, margin top 10px

Row bawah     : "⏰ 2 pending deadlines" (orange, 13px)
                "60% SHIFT CAPACITY" (kanan, abu, font mono, 12px)
```

### Section High Priority
```
Label         : Row: "HIGH PRIORITY & DEADLINES" (#9B97C0, font mono, 11px, uppercase)
                "Auto-synced" (kanan, abu, 12px)
Margin        : top 20px, bottom 8px

Task Card 1 (URGENT):
  Container   : Background #1A1730, border-radius 14px, padding 16px, margin bottom 10px
  Row kiri    : CircleAvatar 36px (background #252240, abu gelap) — checkbox kosong
  Konten      : Column expanded, margin left 12px
    Row atas  : "Render & Export YouTube Shorts Clip" (putih, 15px, bold, expanded)
                Badge "HIGH" (background #FF4444, putih, border-radius 4px, padding 4px 8px, 11px)
    Deadline  : "⏰ Deadline: Today, 18:00 WIB" (merah #FF4444, 13px, bold)
    Row tags  : Wrap widget
                "#Shorts" "#Clip" (pill: background #252240, teks #9B97C0, border-radius 20px, padding 4px 10px, 12px)
    Resource  : "📺 4K ProRes" (kanan, abu, 12px)

Task Card 2 (MEDIUM):
  CircleAvatar abu + "Setup Audio Filters & Noise Gate in OBS"
  Deadline    : "⏰ Deadline: Tomorrow, 14:00 WIB" (abu, 13px) — belum merah
  Tags        : "#TechSetup" "#OBS" + "🎵 VST Plugin"
  Badge       : "MEDIUM" (background #2A1A00, teks #FFD700, border-radius 4px)

Task Card 3 (MEDIUM, berbeda deadline):
  "Review Superchat Fanart Submissions"
  Deadline    : "📅 Friday, 21:00 WIB" (abu, 13px) — ikon kalender bukan jam
  Tags        : "#Community" "#Artwork" + "🖼 12 entries"
```

### Section Completed
```
Label         : Row: "COMPLETED (1)" (#9B97C0, font mono, 11px)
                "Clear all" (kanan, TextButton, #9B97C0, 13px)

Task Done     :
  CircleAvatar: Background #1A2520, ikon centang hijau (#2DFFC2)
  Teks judul  : Strikethrough, warna #5C587A (muted, coretan di tengah teks)
  "Research Indie Horror Game Horizon" ~~strikethrough~~
  Badge       : "DONE" (background #252240, teks #5C587A, abu)
  Sub         : "✓ Completed at 11:20 WIB" (#5C587A, 12px)
  Tags        : Sama tapi warna lebih muted
```

### Auto-Voice Memo Widget
```
Container     : Background #1A1730, border-radius 14px, padding 16px
Row           : Container lingkaran 40px (background gradient ungu, ikon sparkle/stars putih)
                + Column: "Auto-Voice Memo Ready" (putih, 15px, bold)
                          "Tap mic to record audio notes straight to to-do st..." (abu, 12px, truncate)
```

### FAB "+ New Task"
```
Widget        : FloatingActionButton.extended
Background    : Gradient cyan ke ungu
Ikon          : "+" hitam
Label         : "New Task" (hitam, bold)
Border-radius : 30px
```

---

## SCREEN 7 — SETTINGS & PROFILE

### Header
```
Widget        : Column di atas scroll, padding 20px 16px
Heading       : "Settings & Profile" (putih, 24px, bold)
Sub           : "Account preferences & integrations" (#9B97C0, 14px)
Kanan atas    : Tombol QR code (Container lingkaran #1A1730, ikon QR grid, #9B97C0)
```

### Profile Card
```
Container     : Background #1A1730, border-radius 16px, padding 20px, margin 16px horizontal

Row utama     :
  Avatar      : Stack widget
                CircleAvatar radius 36px (gambar avatar Xion)
                Border: 2px gradient cyan-ungu (BoxDecoration + gradient)
                Dot online: Container 12px, hijau #2DFFC2, pojok kanan bawah avatar

  Info kanan  : Column, margin left 16px
    Row nama  : "Xion Regalia" (putih, 18px, bold) + Badge "Super Admin" (kanan)
                (Badge: background #252240, border #9B6DFF, teks #9B6DFF, 11px)
    Email     : "xionregalia@gmail.com" (#9B97C0, 13px)
    Row rig   : Badge "OWNER" (background transparan, border #FFD700, teks #FFD700, 11px)
                + "Obsidian Rig #03" (#9B97C0, 13px)

Divider       : 1px #2A2550, margin top 16px

Row info      : Row main axis spaceAround
  "Joined: Aug 2026" (#9B97C0, 13px) + "Aug 2026" (putih, 13px, bold)
  Divider vertikal: Container 1px height 24px #2A2550
  "Channel: " + "● Connected" (#2DFFC2, 13px, dot hijau)
```

### Section "INTEGRATION & SECURITY"
```
Label section : "INTEGRATION & SECURITY" (#9B6DFF, font mono, 12px, uppercase, padding 20px 16px 8px)

Container     : Background #1A1730, border-radius 16px, padding 0, margin 0 16px
                (semua row di dalam satu container)

Row 1 YouTube :
  Ikon        : Container 36px, background #FF0000, ikon YouTube putih
  Info        : "YouTube Data Sync" (putih, 15px, bold) + "Live broadcast auto-sync" (#9B97C0, 12px)
  Badge       : "● Active" (background #1A2520, teks #2DFFC2, border #2DFFC2, 12px, rounded)
  Divider     : 1px #2A2550

Row 2 Firebase:
  Ikon        : Container 36px, background #FF8800, ikon database/cylinder kuning
  Info        : "Firebase & MySQL" + "Cloud real-time polling"
  Badge       : "Synced" (background #1A2520, teks #2DFFC2, border, rounded)
  Divider     : 1px #2A2550

Row 3 Password:
  Ikon        : Container 36px, background #252240, ikon gembok ungu
  Info        : "Change Admin Password" + "Two-factor auth enabled"
  Ikon kanan  : Chevron right (#9B97C0)
  (Tidak ada badge, ada chevron = bisa diklik ke halaman change password)
```

### Section "APP PREFERENCES"
```
Label section : "APP PREFERENCES" (#9B6DFF, font mono, 12px)

Container     : Background #1A1730, border-radius 16px, margin 0 16px

Row 1 Auto-Broadcast:
  Info        : "Auto-Broadcast Status" (putih, 15px, bold)
                "Syncs OBS state to viewer web" (#9B97C0, 12px)
  Switch      : Aktif (cyan)

Row 2 Alerts :
  Info        : "Pending Request Alerts" + "Push notify for new viewer votes"
  Switch      : Aktif (cyan)

Row 3 Version:
  Info        : "X-VOCA Build Version" + "Production Release"
  Badge       : Container: background #252240, border-radius 8px, padding 6px 12px
                "v1.0.4 (Prod)" (abu, font mono, 13px)
```

### Tombol Sign Out
```
Widget        : ElevatedButton, full width, margin 20px 16px
Background    : Container warna #2A1010 (merah sangat gelap)
Border        : 1px solid #FF4444, border-radius 12px
Row konten    : Ikon keluar (Lucide LogOut, #FF4444) + "Sign Out of Creator Hub" (#FF4444, 15px, bold)
Padding       : 16px vertical
```

---

## CATATAN PENTING UNTUK GEMINI (AI CHOIRUL)

Ketika generate kode Flutter, SELALU:

1. **Cek screen yang relevan di file ini** sebelum mulai nulis kode widget
2. **Gunakan AppColors.xxx** untuk semua warna — TIDAK BOLEH hardcode hex
3. **Font Space Grotesk** untuk semua teks (GoogleFonts.spaceGrotesk())
4. **Font Space Mono** untuk badge teknis, label status, angka countdown
5. **Border-radius** ikuti yang dideskripsikan (card 14-16px, pill 20px, button 10-12px)
6. **Background gelap** untuk semua container — tidak ada yang putih/terang
7. **Lucide Icons** untuk semua ikon (package lucide_icons)
8. **Padding horizontal 16px** untuk konten utama semua screen
9. **Gap antar card** umumnya 10-12px
10. **Gradient** untuk tombol CTA utama (LinearGradient cyan→purple)
11. **Badge status** selalu pill shape (border-radius 20px) dengan background gelap + border warna
12. **Jangan lupa SafeArea** di setiap Scaffold
13. **Loading state** pakai Shimmer dari package shimmer
14. **Empty state** buat UI khusus jika list kosong (jangan biarkan layar kosong)
