# DESIGN_TOKENS — X-VOCA
# Sumber kebenaran tunggal untuk semua keputusan visual
# Berlaku untuk: Web (Next.js/Tailwind) dan Mobile (Flutter)
# Dibuat berdasarkan analisis mockup Figma X-VOCA

---

## 1. FILOSOFI VISUAL

X-VOCA menggunakan estetika **"Cyber Nocturne"** — gelap, atmospheric, dan futuristik
seperti ruang kontrol stasiun siaran malam. Bukan sekadar dark mode biasa.

**Prinsip utama:**
- **Deep Space** — background sangat gelap, hampir hitam keunguan (bukan hitam murni)
- **Cyan/Mint sebagai nyawa** — warna aksen utama yang memberi kesan teknologi dan hidup
- **Gradient sebagai highlight** — dipakai untuk elemen interaktif utama (tombol CTA, badge)
- **Typografi bold dan bersih** — judul besar, kontras tinggi, tidak dekoratif berlebihan
- **Glassmorphism subtle** — card dengan border tipis, bukan shadow tebal

---

## 2. COLOR PALETTE

### 2.1 Background Colors

| Token | Hex | Digunakan untuk |
|---|---|---|
| `bg-base` | `#0D0B1A` | Background halaman utama (paling gelap) |
| `bg-surface` | `#12102A` | Background section / area konten |
| `bg-card` | `#1A1730` | Background card, panel, modal |
| `bg-card-hover` | `#201D3A` | Card saat di-hover |
| `bg-input` | `#1E1B35` | Background input field, textarea |
| `bg-overlay` | `#0D0B1Acc` | Overlay / backdrop modal (80% opacity) |
| `bg-nav` | `#100E24` | Background navbar / sidebar |
| `bg-nav-active` | `#1E1B38` | Nav item yang sedang aktif |

### 2.2 Accent Colors (Brand)

| Token | Hex | Digunakan untuk |
|---|---|---|
| `accent-cyan` | `#2DFFC2` | Aksen utama: icon aktif, border highlight, teks aksen |
| `accent-purple` | `#9B6DFF` | Aksen sekunder: badge, tag, elemen dekoratif |
| `accent-lilac` | `#C084FC` | Aksen tersier: hover state, gradient mid |
| `accent-gold` | `#F5A623` | Status khusus: priority urgent, voting winner |

### 2.3 Gradient

| Token | Value | Digunakan untuk |
|---|---|---|
| `gradient-cta` | `linear-gradient(135deg, #2DFFC2 0%, #9B6DFF 100%)` | Tombol CTA utama (Save, Sign In, Submit) |
| `gradient-cta-hover` | `linear-gradient(135deg, #1FEFB0 0%, #8B5DF0 100%)` | Tombol CTA saat hover |
| `gradient-hero` | `linear-gradient(135deg, #2DFFC2 0%, #C084FC 50%, #9B6DFF 100%)` | Teks hero besar (XION) |
| `gradient-card-border` | `linear-gradient(135deg, #2DFFC220, #9B6DFF20)` | Border card yang glowing |
| `gradient-sidebar` | `linear-gradient(180deg, #1A1730 0%, #0D0B1A 100%)` | Background sidebar admin |

### 2.4 Status Colors

| Token | Hex | Status |
|---|---|---|
| `status-live` | `#FF4444` | LIVE NOW — siaran aktif |
| `status-live-bg` | `#FF444420` | Background badge LIVE |
| `status-upcoming` | `#9B6DFF` | UPCOMING — jadwal mendatang |
| `status-upcoming-bg` | `#9B6DFF20` | Background badge UPCOMING |
| `status-done` | `#2DFFC2` | DONE / COMPLETED |
| `status-done-bg` | `#2DFFC220` | Background badge DONE |
| `status-playing` | `#F5A623` | PLAYING / ON AIR |
| `status-playing-bg` | `#F5A62320` | Background badge PLAYING |
| `status-requested` | `#C084FC` | REQUESTED — menunggu review |
| `status-requested-bg` | `#C084FC20` | Background badge REQUESTED |
| `status-synced` | `#2DFFC2` | SYNCED — terhubung |
| `status-warning` | `#F5A623` | WARNING / perlu perhatian |
| `status-error` | `#FF4444` | ERROR |

### 2.5 Priority Colors (To-Do)

| Token | Hex | Priority |
|---|---|---|
| `priority-urgent` | `#CC2222` | URGENT |
| `priority-urgent-bg` | `#CC222230` | Background badge URGENT |
| `priority-high` | `#E05D2A` | HIGH |
| `priority-high-bg` | `#E05D2A30` | Background badge HIGH |
| `priority-medium` | `#B8860B` | MEDIUM |
| `priority-medium-bg` | `#B8860B30` | Background badge MEDIUM |
| `priority-low` | `#4A9B6D` | LOW |
| `priority-low-bg` | `#4A9B6D30` | Background badge LOW |
| `priority-done` | `#555370` | DONE (greyed out) |

### 2.6 Text Colors

| Token | Hex | Digunakan untuk |
|---|---|---|
| `text-primary` | `#FFFFFF` | Judul, teks utama |
| `text-secondary` | `#A09BB8` | Subtitle, deskripsi, label |
| `text-muted` | `#5C5878` | Placeholder, teks disabled |
| `text-accent` | `#2DFFC2` | Teks highlight, link aktif |
| `text-accent-purple` | `#9B6DFF` | Teks highlight sekunder |
| `text-danger` | `#FF4444` | Error message, teks bahaya |
| `text-warning` | `#F5A623` | Warning, teks perhatian |
| `text-on-cta` | `#0D0B1A` | Teks di atas tombol gradient CTA |

### 2.7 Border Colors

| Token | Hex | Digunakan untuk |
|---|---|---|
| `border-subtle` | `#2A2645` | Border card default, divider |
| `border-active` | `#2DFFC240` | Border card aktif / selected |
| `border-input` | `#2A2645` | Border input field default |
| `border-input-focus` | `#2DFFC280` | Border input saat focus |
| `border-danger` | `#FF444480` | Border input error |

---

## 3. TYPOGRAPHY

### 3.1 Font Family

```css
/* Font Utama — untuk semua teks */
font-family: 'Space Grotesk', sans-serif;

/* Font Monospace — untuk angka data, kode, timer, ID */
font-family: 'Space Mono', monospace;

/* Fallback stack */
font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif;
font-family: 'Space Mono', 'Courier New', monospace;
```

> **Instalasi di Next.js:**
> ```typescript
> // app/layout.tsx
> import { Space_Grotesk, Space_Mono } from 'next/font/google'
> const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-sans' })
> const spaceMono = Space_Mono({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-mono' })
> ```

> **Instalasi di Flutter:**
> ```yaml
> # pubspec.yaml
> google_fonts: ^6.1.0
> # Gunakan GoogleFonts.spaceGrotesk() dan GoogleFonts.spaceMono()
> ```

### 3.2 Font Scale (Web)

| Token | Size | Weight | Line Height | Digunakan untuk |
|---|---|---|---|---|
| `text-hero` | `72px / 4.5rem` | `800` | `1.0` | Nama "XION" di hero section |
| `text-hero-sub` | `48px / 3rem` | `700` | `1.1` | "REGALIA" di bawah XION |
| `text-display` | `36px / 2.25rem` | `700` | `1.2` | Judul halaman utama |
| `text-heading` | `24px / 1.5rem` | `700` | `1.3` | Judul section, card header |
| `text-subheading` | `18px / 1.125rem` | `600` | `1.4` | Sub-judul, label section |
| `text-body` | `14px / 0.875rem` | `400` | `1.6` | Teks konten utama |
| `text-body-sm` | `13px / 0.8125rem` | `400` | `1.5` | Teks deskripsi kecil |
| `text-caption` | `11px / 0.6875rem` | `500` | `1.4` | Label badge, status, caption |
| `text-data` | `32px / 2rem` | `700` | `1.0` | Angka statistik besar (1,247 votes) |
| `text-timer` | `48px / 3rem` | `700` | `1.0` | Countdown timer (font monospace) |

### 3.3 Font Scale (Flutter/Mobile)

| Token | Size | Weight | Digunakan untuk |
|---|---|---|---|
| `titleLarge` | `28sp` | `700` | Judul halaman (Stream Schedule, Internal To-Do List) |
| `titleMedium` | `20sp` | `700` | Judul section, card header besar |
| `titleSmall` | `16sp` | `600` | Sub-judul, nama game dalam card |
| `bodyLarge` | `14sp` | `400` | Teks deskripsi utama |
| `bodyMedium` | `13sp` | `400` | Teks konten standar |
| `bodySmall` | `12sp` | `400` | Teks pendukung, label kecil |
| `labelLarge` | `12sp` | `600` | Label badge, status pill |
| `labelSmall` | `10sp` | `500` | Caption, metadata |
| `dataDisplay` | `36sp` | `700` | Angka statistik (1,420 votes) |
| `timerDisplay` | `40sp` | `700` | Countdown timer (Space Mono) |

### 3.4 Aturan Penggunaan Font

- **Judul halaman**: Bold/ExtraBold, putih penuh `#FFFFFF`
- **Subtitle / deskripsi halaman**: Regular, warna `text-secondary` (`#A09BB8`)
- **Label uppercase**: Letter-spacing `0.08em`, ukuran kecil — hanya untuk label kategori/badge
- **Angka & timer**: Selalu gunakan `Space Mono` agar tidak ada layout shift saat angka berubah
- **Teks aksen**: Gunakan `text-accent` (`#2DFFC2`) hanya untuk satu elemen per section

---

## 4. SPACING & SIZING

### 4.1 Spacing Scale

Gunakan kelipatan **4px** sebagai unit dasar.

| Token | Value | Digunakan untuk |
|---|---|---|
| `space-1` | `4px` | Padding icon kecil |
| `space-2` | `8px` | Gap antar elemen inline |
| `space-3` | `12px` | Padding badge, pill |
| `space-4` | `16px` | Padding card dalam, gap list item |
| `space-5` | `20px` | Padding card standar |
| `space-6` | `24px` | Gap antar section kecil |
| `space-8` | `32px` | Padding halaman mobile |
| `space-10` | `40px` | Gap antar section besar |
| `space-12` | `48px` | Margin top section |
| `space-16` | `64px` | Padding section hero |

### 4.2 Border Radius

| Token | Value | Digunakan untuk |
|---|---|---|
| `radius-sm` | `6px` | Badge, pill kecil, chip status |
| `radius-md` | `12px` | Input field, button sekunder |
| `radius-lg` | `16px` | Card standar |
| `radius-xl` | `20px` | Card besar, panel utama |
| `radius-2xl` | `24px` | Modal, bottom sheet |
| `radius-full` | `9999px` | Tombol CTA utama (pill shape), avatar |

### 4.3 Layout Web

| Konteks | Nilai |
|---|---|
| Max width konten | `1200px` |
| Padding halaman kiri-kanan | `24px` (mobile) / `48px` (desktop) |
| Sidebar admin width | `200px` (collapsed: `64px`) |
| Navbar height | `60px` |
| Grid card content guide | `4 kolom` (desktop) / `2 kolom` (tablet) / `1 kolom` (mobile) |
| Grid card game voting | `3 kolom` (desktop) / `2 kolom` (tablet) / `1 kolom` (mobile) |

### 4.4 Layout Mobile (Flutter)

| Konteks | Nilai |
|---|---|
| Padding halaman horizontal | `20px` |
| Padding halaman vertical top | `16px` |
| Bottom navigation height | `72px` |
| Card padding internal | `16px` |
| Gap antar card | `12px` |
| App bar height | `56px` |
| FAB bottom margin | `24px` dari bottom nav |

---

## 5. KOMPONEN & PATTERN

### 5.1 Badge / Status Pill

```
Struktur: [dot] [TEKS]
Padding: 4px 10px
Border radius: 6px (radius-sm)
Font: 11px, weight 600, letter-spacing 0.06em, uppercase
Background: warna status dengan opacity 20% (misal: status-live-bg)
Text color: warna status penuh (misal: status-live)
```

**Contoh:**
- `● LIVE NOW` → bg: `#FF444420`, text: `#FF4444`
- `● UPCOMING` → bg: `#9B6DFF20`, text: `#9B6DFF`
- `✓ DONE` → bg: `#2DFFC220`, text: `#2DFFC2`
- `⏵ PLAYING` → bg: `#F5A62320`, text: `#F5A623`

### 5.2 Card

```
Background: bg-card (#1A1730)
Border: 1px solid border-subtle (#2A2645)
Border radius: radius-lg (16px)
Padding: 16px–20px
Hover: background berubah ke bg-card-hover, border ke border-active
Transition: 200ms ease
```

**Card aktif / selected:**
```
Border: 1px solid accent-cyan (#2DFFC240)
Box shadow: 0 0 0 1px #2DFFC220 (subtle glow)
```

### 5.3 Tombol

**CTA Utama (Save, Sign In, Submit):**
```
Background: gradient-cta
Text: text-on-cta (#0D0B1A), bold
Border radius: radius-full (pill)
Padding: 14px 28px
Font: 15px, weight 700
```

**Tombol Sekunder (Discard, Cancel, Batal):**
```
Background: bg-card (#1A1730)
Border: 1px solid border-subtle (#2A2645)
Text: text-secondary (#A09BB8)
Border radius: radius-full
Padding: 14px 24px
```

**Tombol Danger (Reject, Delete, Sign Out):**
```
Background: #CC222230
Border: 1px solid #CC222260
Text: #FF4444
Border radius: radius-md atau radius-full
```

**Tombol Ghost / Outline:**
```
Background: transparent
Border: 1px solid accent-cyan (#2DFFC260)
Text: accent-cyan (#2DFFC2)
Border radius: radius-md
```

### 5.4 Input Field

```
Background: bg-input (#1E1B35)
Border: 1px solid border-input (#2A2645)
Border radius: radius-md (12px)
Padding: 12px 16px
Text: text-primary (#FFFFFF)
Placeholder: text-muted (#5C5878)
Icon color: text-secondary (#A09BB8)

Focus state:
  Border: 1px solid border-input-focus (#2DFFC280)
  Box shadow: 0 0 0 3px #2DFFC210

Error state:
  Border: 1px solid border-danger (#FF444480)
```

### 5.5 Toggle Switch

```
Track OFF: bg-card (#1A1730), border: border-subtle
Track ON: accent-cyan (#2DFFC2)
Thumb: #FFFFFF
Width: 48px, Height: 28px
Border radius: radius-full
```

### 5.6 Bottom Navigation (Mobile)

```
Background: bg-nav (#100E24)
Border top: 1px solid border-subtle (#2A2645)
Height: 72px
Icon inactive: text-muted (#5C5878)
Icon active: accent-cyan (#2DFFC2)
Label active: accent-cyan (#2DFFC2), 11px, weight 600
Active indicator: background bulat kecil di belakang icon
```

### 5.7 Sidebar Admin (Web)

```
Background: gradient-sidebar
Width: 200px
Logo area: 64px height
Nav item padding: 12px 16px
Nav item active: bg-nav-active (#1E1B38), border-left 2px accent-cyan
Nav item icon: 18px
Nav item text: 14px, weight 500
Bottom actions (Settings, Keluar): di bawah, dipisah border
```

### 5.8 Top Bar Admin (Web)

```
Background: bg-nav (#100E24)
Height: 60px
Border bottom: 1px solid border-subtle
Berisi: breadcrumb session info | search | notif bell | avatar
Search: bg-input, rounded-full, placeholder "Quick search..."
```

### 5.9 Progress Bar

```
Track: bg-card (#1A1730)
Fill: accent-cyan (#2DFFC2) atau gradient-cta untuk yang spesial
Height: 4px (slim) / 8px (standar)
Border radius: radius-full
```

### 5.10 Countdown Timer

```
Font: Space Mono, bold
Color: accent-cyan (#2DFFC2)
Size: besar (48px web / 40sp mobile)
Format: 00h : 00m : 00s
Label unit: text-secondary, ukuran kecil di bawah angka
Background blok timer: bg-card dengan border subtle
```

---

## 6. ICON SYSTEM

Gunakan library **Lucide Icons** (web) dan **Lucide Flutter** (mobile).

| Konteks | Ukuran Web | Ukuran Mobile |
|---|---|---|
| Navbar / sidebar | `18px` | `22dp` |
| Icon dalam card | `16px` | `20dp` |
| Icon CTA / button | `16px` | `18dp` |
| Icon besar / hero | `32px` | `32dp` |
| Bottom nav | — | `24dp` |

**Warna icon:**
- Default: `text-secondary (#A09BB8)`
- Aktif / highlight: `accent-cyan (#2DFFC2)`
- Danger: `status-live (#FF4444)`
- Di atas tombol CTA: `text-on-cta (#0D0B1A)`

---

## 7. EFEK VISUAL

### 7.1 Glow Effect (Elemen Penting)

Digunakan secara selektif pada elemen kunci agar tidak berlebihan.

```css
/* Subtle glow untuk card aktif */
box-shadow: 0 0 20px #2DFFC215;

/* Glow lebih kuat untuk status LIVE */
box-shadow: 0 0 24px #FF444430;

/* Glow untuk tombol CTA */
box-shadow: 0 4px 24px #2DFFC230;
```

### 7.2 Glassmorphism Card

```css
/* Untuk card yang tampil di atas gambar / background */
background: rgba(26, 23, 48, 0.85);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.06);
```

### 7.3 Particle / Star Background

Di hero section web, terdapat titik-titik kecil (bintang) di background.
```css
/* Implementasi via CSS atau library tsparticles */
/* Warna titik: #FFFFFF dengan opacity 30-60% */
/* Ukuran: 1-2px */
/* Jumlah: 40-60 titik */
/* Tidak bergerak atau bergerak sangat lambat */
```

### 7.4 Animasi & Transisi

```css
/* Transisi default semua elemen interaktif */
transition: all 200ms ease;

/* Hover card */
transform: translateY(-2px);

/* Tombol CTA press */
transform: scale(0.98);

/* Fade in konten */
animation: fadeIn 300ms ease;

/* Loading skeleton */
animation: shimmer 1.5s infinite;
background: linear-gradient(90deg, bg-card, bg-card-hover, bg-card);
```

**Prinsip animasi:**
- Tidak ada animasi auto-play yang terus berputar
- Hanya transisi sebagai respons aksi user
- Duration: 150–300ms, jangan lebih dari 400ms
- Easing: `ease` atau `ease-out`

---

## 8. IMPLEMENTASI

### 8.1 Tailwind Config (Web — `tailwind.config.ts`)

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Background
        'bg-base': '#0D0B1A',
        'bg-surface': '#12102A',
        'bg-card': '#1A1730',
        'bg-card-hover': '#201D3A',
        'bg-input': '#1E1B35',
        'bg-nav': '#100E24',
        'bg-nav-active': '#1E1B38',
        // Accent
        'accent-cyan': '#2DFFC2',
        'accent-purple': '#9B6DFF',
        'accent-lilac': '#C084FC',
        'accent-gold': '#F5A623',
        // Text
        'text-primary': '#FFFFFF',
        'text-secondary': '#A09BB8',
        'text-muted': '#5C5878',
        // Border
        'border-subtle': '#2A2645',
        'border-active': '#2DFFC240',
        // Status
        'status-live': '#FF4444',
        'status-upcoming': '#9B6DFF',
        'status-done': '#2DFFC2',
        'status-playing': '#F5A623',
        'status-requested': '#C084FC',
      },
      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace'],
      },
      borderRadius: {
        'sm': '6px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
      },
      backgroundImage: {
        'gradient-cta': 'linear-gradient(135deg, #2DFFC2 0%, #9B6DFF 100%)',
        'gradient-hero': 'linear-gradient(135deg, #2DFFC2 0%, #C084FC 50%, #9B6DFF 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, #1A1730 0%, #0D0B1A 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

### 8.2 Flutter Theme (Mobile — `lib/core/theme/app_theme.dart`)

```dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  // Background
  static const bgBase = Color(0xFF0D0B1A);
  static const bgSurface = Color(0xFF12102A);
  static const bgCard = Color(0xFF1A1730);
  static const bgCardHover = Color(0xFF201D3A);
  static const bgInput = Color(0xFF1E1B35);
  static const bgNav = Color(0xFF100E24);
  static const bgNavActive = Color(0xFF1E1B38);

  // Accent
  static const accentCyan = Color(0xFF2DFFC2);
  static const accentPurple = Color(0xFF9B6DFF);
  static const accentLilac = Color(0xFFC084FC);
  static const accentGold = Color(0xFFF5A623);

  // Text
  static const textPrimary = Color(0xFFFFFFFF);
  static const textSecondary = Color(0xFFA09BB8);
  static const textMuted = Color(0xFF5C5878);
  static const textOnCta = Color(0xFF0D0B1A);

  // Border
  static const borderSubtle = Color(0xFF2A2645);
  static const borderActive = Color(0x402DFFC2);

  // Status
  static const statusLive = Color(0xFFFF4444);
  static const statusUpcoming = Color(0xFF9B6DFF);
  static const statusDone = Color(0xFF2DFFC2);
  static const statusPlaying = Color(0xFFF5A623);
  static const statusRequested = Color(0xFFC084FC);

  // Priority
  static const priorityUrgent = Color(0xFFCC2222);
  static const priorityHigh = Color(0xFFE05D2A);
  static const priorityMedium = Color(0xFFB8860B);
  static const priorityLow = Color(0xFF4A9B6D);
  static const priorityDone = Color(0xFF555370);

  // Gradients
  static const gradientCta = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [accentCyan, accentPurple],
  );

  static const gradientHero = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [accentCyan, accentLilac, accentPurple],
  );
}

class AppTheme {
  static ThemeData get darkTheme => ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: AppColors.bgBase,
    colorScheme: const ColorScheme.dark(
      primary: AppColors.accentCyan,
      secondary: AppColors.accentPurple,
      surface: AppColors.bgCard,
      background: AppColors.bgBase,
      error: AppColors.statusLive,
    ),
    textTheme: GoogleFonts.spaceGroteskTextTheme().copyWith(
      displayLarge: GoogleFonts.spaceGrotesk(
        fontSize: 36, fontWeight: FontWeight.w700, color: AppColors.textPrimary,
      ),
      titleLarge: GoogleFonts.spaceGrotesk(
        fontSize: 28, fontWeight: FontWeight.w700, color: AppColors.textPrimary,
      ),
      titleMedium: GoogleFonts.spaceGrotesk(
        fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.textPrimary,
      ),
      titleSmall: GoogleFonts.spaceGrotesk(
        fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary,
      ),
      bodyLarge: GoogleFonts.spaceGrotesk(
        fontSize: 14, fontWeight: FontWeight.w400, color: AppColors.textSecondary,
      ),
      bodyMedium: GoogleFonts.spaceGrotesk(
        fontSize: 13, fontWeight: FontWeight.w400, color: AppColors.textSecondary,
      ),
      labelLarge: GoogleFonts.spaceGrotesk(
        fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary,
      ),
      labelSmall: GoogleFonts.spaceGrotesk(
        fontSize: 10, fontWeight: FontWeight.w500, color: AppColors.textMuted,
      ),
    ),
    cardTheme: CardTheme(
      color: AppColors.bgCard,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppColors.borderSubtle, width: 1),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.bgInput,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.borderSubtle),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.borderSubtle),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.accentCyan, width: 1.5),
      ),
      hintStyle: GoogleFonts.spaceGrotesk(color: AppColors.textMuted),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.bgNav,
      selectedItemColor: AppColors.accentCyan,
      unselectedItemColor: AppColors.textMuted,
      elevation: 0,
    ),
    dividerTheme: const DividerThemeData(
      color: AppColors.borderSubtle,
      thickness: 1,
    ),
  );
}
```

### 8.3 CSS Variables (Global — `app/globals.css`)

```css
:root {
  /* Background */
  --bg-base: #0D0B1A;
  --bg-surface: #12102A;
  --bg-card: #1A1730;
  --bg-card-hover: #201D3A;
  --bg-input: #1E1B35;
  --bg-nav: #100E24;
  --bg-nav-active: #1E1B38;

  /* Accent */
  --accent-cyan: #2DFFC2;
  --accent-purple: #9B6DFF;
  --accent-lilac: #C084FC;
  --accent-gold: #F5A623;

  /* Text */
  --text-primary: #FFFFFF;
  --text-secondary: #A09BB8;
  --text-muted: #5C5878;
  --text-on-cta: #0D0B1A;

  /* Border */
  --border-subtle: #2A2645;
  --border-active: rgba(45, 255, 194, 0.25);

  /* Gradient */
  --gradient-cta: linear-gradient(135deg, #2DFFC2 0%, #9B6DFF 100%);
  --gradient-hero: linear-gradient(135deg, #2DFFC2 0%, #C084FC 50%, #9B6DFF 100%);
}

body {
  background-color: var(--bg-base);
  color: var(--text-primary);
  font-family: var(--font-space-grotesk), system-ui, sans-serif;
}
```

---

## 9. ATURAN PENGGUNAAN (DO & DON'T)

### ✅ DO
- Gunakan `accent-cyan` sebagai warna utama untuk elemen interaktif terpenting di tiap halaman
- Gunakan `Space Mono` untuk semua angka yang berubah (timer, vote count, statistik)
- Gunakan gradient hanya untuk tombol CTA utama dan teks hero — bukan untuk dekorasi sembarangan
- Pertahankan konsistensi border radius: card = `16px`, input = `12px`, button utama = `full`
- Gunakan warna status yang tepat sesuai tabel di atas — jangan improvisasi warna baru

### ❌ DON'T
- Jangan gunakan warna putih `#FFFFFF` untuk background apapun
- Jangan gunakan shadow tebal — X-VOCA menggunakan border + glow, bukan box-shadow
- Jangan campur lebih dari 2 warna aksen dalam satu card/komponen
- Jangan gunakan animasi looping otomatis (spinner loading boleh, tapi bukan dekorasi)
- Jangan gunakan font selain `Space Grotesk` dan `Space Mono` tanpa diskusi tim
- Jangan ubah opacity teks di bawah 50% — gunakan `text-muted` sebagai batas terendah

---

## 10. REFERENSI HALAMAN → KOMPONEN

| Halaman | Komponen Utama | Token Kritis |
|---|---|---|
| Hero Section (Web) | Text hero gradient, countdown, karakter | `gradient-hero`, `accent-cyan`, `Space Mono` |
| Profile & Schedule (Web) | Card profil, schedule card horizontal | `bg-card`, `status-live`, `status-upcoming` |
| Game Voting (Web) | Grid card game, vote button, progress bar | `gradient-cta`, `status-*`, progress bar |
| Content Guide (Web) | Grid 4 kolom, featured card besar, filter tab | `bg-card`, `accent-cyan`, thumbnail |
| Admin Login (Web) | Card center, form, tombol CTA | `gradient-cta`, `bg-input`, `border-input-focus` |
| Admin Dashboard (Web) | Sidebar, stat card 4 kolom, tabel audit log | `gradient-sidebar`, `accent-gold`, `Space Mono` |
| Admin Jadwal (Web) | Tabel + form panel kanan | `status-*`, `bg-input`, table row hover |
| Admin Voting (Web) | Tabel ranking, action button inline | `accent-cyan`, `status-*`, `priority-*` |
| Admin Content (Web) | Grid + form panel kanan | `bg-card`, toggle switch, thumbnail |
| Login (Mobile) | Form + gradient CTA button | `gradient-cta`, `bg-input`, `accent-cyan` |
| Dashboard (Mobile) | Header card, 2x2 stat grid, task list | `accent-cyan`, `priority-urgent`, `Space Mono` |
| Stream Schedule (Mobile) | Tab filter, jadwal card, timer | `status-*`, `Space Mono`, toggle |
| Add Schedule (Mobile) | Bottom sheet form, YouTube autofill | `bg-card`, `gradient-cta`, `border-input-focus` |
| Vote Analytics (Mobile) | Moderation queue card, action button | `status-*`, `accent-cyan`, `priority-*` |
| To-Do List (Mobile) | Progress bar, task card, priority badge | `priority-*`, progress bar, `Space Mono` |
| Settings (Mobile) | Profile card, integration list, toggle | `accent-cyan`, toggle, `bg-card` |

---

## Changelog

| Tanggal | Perubahan | Oleh |
|---|---|---|
| 2026-09-26 | File dibuat — analisis dari 16 mockup Figma | - |
