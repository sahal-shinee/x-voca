# AI_RULES_WEB.md — Aturan AI untuk Sahal
# File ini di-attach bersama PROJECT_CONTEXT.md di setiap sesi AI baru
# Platform: VSCode Agent (Claude + Gemini)

---

## IDENTITAS PROYEK
Kamu adalah AI assistant yang membantu Sahal mengembangkan sistem X-VOCA.
Sahal berperan sebagai Web Developer + Database Administrator.
Selalu referensikan file-file di folder /docs sebelum menulis kode apapun.

---

## STACK YANG DIGUNAKAN (TIDAK BOLEH DIGANTI)
```
Frontend  : React.js (bukan Next.js, bukan Vue)
Routing   : React Router v6
Styling   : Tailwind CSS (config dari DESIGN_TOKENS.md)
HTTP      : Axios
Real-time : Firebase SDK (listener untuk vote + countdown)
Anti-spam : FingerprintJS (free tier)

Backend   : Node.js + Express.js (bukan Fastify, bukan NestJS)
ORM       : Sequelize (bukan Prisma, bukan raw query)
Database  : MySQL (di Railway)
Auth      : JWT (jsonwebtoken) + bcrypt
Real-time : Firebase Admin SDK (untuk update dari backend)
```

---

## ATURAN WAJIB — BACKEND

1. **Format response SELALU:**
```javascript
// Success
res.json({ success: true, data: result, message: 'Berhasil' })

// Error
res.status(400).json({ success: false, data: null, message: 'Pesan error' })
```

2. **Struktur folder backend wajib:**
```
src/
├── config/     → database.js, firebase.js
├── models/     → Sequelize models
├── routes/     → route definitions (thin, hanya define route)
├── controllers/ → business logic (semua logic ada di sini)
└── middleware/ → auth, rateLimit, errorHandler
```

3. **JANGAN pernah taruh API key apapun di frontend**
   - YouTube API Key → hanya di backend .env
   - Firebase service account → hanya di backend .env
   - JWT Secret → hanya di backend .env

4. **Setiap endpoint yang mengubah data viewer web → update Firebase juga**
   - Simpan jadwal baru → update `/schedules/next` di Firebase
   - Update vote → update `/votes/games/{id}` di Firebase
   - Toggle broadcasting → update `/broadcasting` di Firebase

5. **Gunakan middleware authMiddleware untuk semua route admin**

6. **Error handling → selalu gunakan try-catch dan kirim ke errorHandler middleware**

7. **Setiap kali menulis endpoint baru → cek API_CONTRACT.md terlebih dahulu**

---

## ATURAN WAJIB — FRONTEND

1. **Design tokens → semua warna/font/spacing dari DESIGN_TOKENS.md**
   - Jangan gunakan warna hex yang tidak ada di DESIGN_TOKENS
   - Gunakan class Tailwind yang sudah dikonfigurasi di tailwind.config.js

2. **Struktur komponen:**
```
components/
├── common/    → Badge, Button, Card, Input, Toggle, Modal (reusable)
├── viewer/    → komponen khusus halaman publik viewer
└── admin/     → komponen khusus halaman admin
```

3. **API calls → semua melalui services/, jangan fetch langsung di komponen**
```javascript
// ✅ Benar
import { getSchedules } from '../services/scheduleService'

// ❌ Salah
fetch('http://localhost:3001/api/schedules')
```

4. **Protected routes admin → gunakan AuthContext + PrivateRoute component**

5. **Real-time voting → gunakan Firebase listener, bukan polling**

6. **Countdown timer → gunakan custom hook useCountdown.js**

7. **Semua text/label → sesuaikan dengan mockup (cek gambar mockup)**

---

## ATURAN TAILWIND

Gunakan class dari config yang sudah ada:
```
Background : bg-bg-base, bg-bg-surface, bg-bg-card, bg-bg-input, bg-bg-nav
Accent     : text-accent-cyan, text-accent-purple, bg-accent-cyan
Text       : text-text-primary, text-text-secondary, text-text-muted
Border     : border-border-subtle, border-border-active
Status     : text-status-live, text-status-upcoming, text-status-done, text-status-playing
Gradient   : bg-gradient-cta, bg-gradient-hero, bg-gradient-sidebar
Radius     : rounded-sm(6px), rounded-md(12px), rounded-lg(16px), rounded-xl(20px), rounded-full
Font       : font-sans (Space Grotesk), font-mono (Space Mono)
```

---

## FASE PENGERJAAN

### FASE 1 — Setup Project & Database
**Prompt untuk memulai fase ini:**
```
Kita mulai FASE 1 setup project X-VOCA.
Bantu saya:
1. Setup project React.js dengan Tailwind CSS dan React Router v6
2. Setup project Express.js dengan Sequelize dan MySQL
3. Konfigurasi tailwind.config.js sesuai DESIGN_TOKENS.md yang sudah ada
4. Buat file .env template untuk frontend dan backend
5. Buat struktur folder sesuai ARCHITECTURE.md

Stack: React.js + Tailwind + React Router v6 (frontend), Express.js + Sequelize + MySQL (backend)
Referensi: ARCHITECTURE.md untuk struktur folder, DESIGN_TOKENS.md untuk Tailwind config
```

**Checklist Fase 1:**
- [ ] React project ter-setup dengan Tailwind
- [ ] Tailwind config sudah include semua tokens dari DESIGN_TOKENS.md
- [ ] Express project ter-setup
- [ ] Sequelize terhubung ke MySQL Railway
- [ ] Semua tabel ter-migrate (jalankan SQL dari DATABASE_SCHEMA.md)
- [ ] Seed data awal berhasil dijalankan
- [ ] .env file sudah dikonfigurasi

---

### FASE 2 — Backend API (Express.js)
**Prompt untuk memulai fase ini:**
```
Kita masuk FASE 2 backend Express.js X-VOCA.
Bantu saya buat endpoint sesuai API_CONTRACT.md.
Mulai dari modul: [sebutkan modul yang ingin dikerjakan, misal: auth, schedules, games]

Aturan:
- Format response: { success, data, message }
- Auth menggunakan JWT + bcrypt
- Sequelize untuk database operations
- Firebase Admin SDK untuk update real-time setelah setiap write operation
- Referensi DATABASE_SCHEMA.md untuk struktur tabel
- Referensi API_CONTRACT.md untuk format request/response
```

**Checklist Fase 2:**
- [ ] POST /api/auth/login
- [ ] GET /api/auth/me
- [ ] PATCH /api/auth/broadcasting
- [ ] GET /api/schedules
- [ ] GET /api/schedules/next
- [ ] POST /api/schedules
- [ ] PATCH /api/schedules/:id
- [ ] DELETE /api/schedules/:id
- [ ] GET /api/games
- [ ] POST /api/games
- [ ] PATCH /api/games/:id/status
- [ ] DELETE /api/games/:id
- [ ] POST /api/votes/:gameId (dengan anti-spam)
- [ ] POST /api/votes/request
- [ ] POST /api/votes/reset-period
- [ ] GET /api/content
- [ ] POST /api/content
- [ ] PATCH /api/content/:id
- [ ] DELETE /api/content/:id
- [ ] GET /api/todos
- [ ] POST /api/todos
- [ ] PATCH /api/todos/:id
- [ ] DELETE /api/todos/:id
- [ ] POST /api/youtube/fetch
- [ ] GET /api/dashboard/stats
- [ ] GET /api/audit-logs

---

### FASE 3 — Frontend Web Viewer (React.js)
**Prompt untuk memulai fase ini:**
```
Kita masuk FASE 3 frontend Web Viewer X-VOCA.
Bantu saya buat halaman viewer yang bisa diakses publik.
Halaman yang perlu dibuat: [HomePage, VotingPage, ContentGuidePage]

Aturan:
- Gunakan Tailwind dengan class dari DESIGN_TOKENS.md
- Semua API call melalui services/ menggunakan Axios
- Real-time voting menggunakan Firebase listener
- Countdown menggunakan custom hook useCountdown
- Desain mengacu pada mockup (tema Cyber Nocturne, dark mode)
- Komponen reusable simpan di components/common/ atau components/viewer/
```

**Checklist Fase 3:**
- [ ] HomePage — Hero section dengan countdown
- [ ] HomePage — Profil & About section
- [ ] HomePage — Upcoming broadcast section
- [ ] VotingPage — Grid game cards
- [ ] VotingPage — Vote button dengan anti-spam (FingerprintJS)
- [ ] VotingPage — Real-time persentase via Firebase
- [ ] VotingPage — Filter tab (Semua/Requested/Accepted/Playing/Done)
- [ ] VotingPage — Form game request
- [ ] VotingPage — Modal konfirmasi setelah request
- [ ] VotingPage — Toast error double vote
- [ ] ContentGuidePage — Grid katalog
- [ ] ContentGuidePage — Featured card
- [ ] ContentGuidePage — Filter tab per game
- [ ] ContentGuidePage — Search

---

### FASE 4 — Frontend Web Admin (React.js)
**Prompt untuk memulai fase ini:**
```
Kita masuk FASE 4 frontend Web Admin X-VOCA.
Bantu saya buat halaman admin yang hanya bisa diakses setelah login.

Aturan:
- Protected routes menggunakan AuthContext + PrivateRoute
- Layout admin: sidebar kiri + topbar + konten area
- Semua API call melalui services/ dengan header Authorization JWT
- Desain mengacu pada mockup admin (sidebar gradient, tabel dengan status badge)
- Komponen reusable simpan di components/admin/
```

**Checklist Fase 4:**
- [ ] LoginPage — form + redirect setelah login
- [ ] Layout admin — sidebar + topbar
- [ ] DashboardPage — 4 stat cards + audit log + rig widget
- [ ] SchedulePage — tabel jadwal + form panel kanan + YouTube auto-fill
- [ ] VotingModerationPage — tabel ranking + aksi moderasi + info periode
- [ ] ContentManagementPage — grid konten + form panel kanan

---

### FASE 5 — Integrasi & Testing
**Prompt untuk memulai fase ini:**
```
Kita masuk FASE 5 integrasi dan testing X-VOCA.
Bantu saya:
1. Pastikan semua Firebase listener berjalan dengan benar
2. Test alur voting end-to-end (vote → Firebase update → web viewer update)
3. Test alur jadwal (input jadwal → Firebase update → countdown web update)
4. Test anti-spam voting
5. Test YouTube auto-fill
6. Pastikan semua response API sesuai format di API_CONTRACT.md
```

---

## CARA MENGGUNAKAN FILE INI DI SETIAP SESI BARU

1. Buka sesi baru di VSCode Agent
2. Attach file-file ini di awal sesuai konteks pekerjaan:

   SELALU (wajib di setiap sesi):
   - `PROJECT_CONTEXT.md`
   - `AI_RULES_WEB.md` (file ini)

   Jika kerja di BACKEND (Express.js):
   - `API_CONTRACT.md`
   - `DATABASE_SCHEMA.md`
   - File controller/route yang sedang dikerjakan

   Jika kerja di FRONTEND VIEWER atau ADMIN (React.js):
   - `DESIGN_TOKENS.md`
   - `UI_SPEC_WEB.md` ← WAJIB untuk semua pekerjaan UI/halaman
   - File page/component yang sedang dikerjakan

3. Mulai prompt dengan menyebut fase + halaman/komponen yang dikerjakan
4. Jika token habis di tengah sesi → buka sesi baru, attach file yang sama, lanjutkan

## TEMPLATE PROMPT AWAL SESI BARU

### Template untuk Backend:
```
Saya Sahal, sedang mengerjakan BACKEND X-VOCA (Express.js + MySQL + Firebase).
Saya sedang di FASE 2 — Backend API.
Context: PROJECT_CONTEXT.md dan AI_RULES_WEB.md sudah saya attach.

Saya ingin membuat: [nama endpoint / controller / route]
Referensi: API_CONTRACT.md bagian [nama endpoint]
Database: DATABASE_SCHEMA.md tabel [nama tabel]
```

### Template untuk Frontend:
```
Saya Sahal, sedang mengerjakan FRONTEND X-VOCA (React.js + Tailwind).
Saya sedang di FASE [3/4] — [Web Viewer / Web Admin].
Context: PROJECT_CONTEXT.md, AI_RULES_WEB.md, UI_SPEC_WEB.md, DESIGN_TOKENS.md sudah saya attach.

Saya ingin membuat halaman/komponen: [nama halaman, contoh: VotingPage.jsx]
Referensi visual: UI_SPEC_WEB.md bagian [nama halaman, contoh: HALAMAN 2 — GAME VOTING]
Stack: React.js + React Router v6 + Tailwind CSS + Axios + Firebase SDK
```
