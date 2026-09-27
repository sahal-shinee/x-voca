# ARCHITECTURE.md — X-VOCA
# Dokumen arsitektur teknis sistem
# Dibaca oleh: Sahal (Web) & Choirul (Mobile)

---

## 1. GAMBARAN BESAR SISTEM

```
┌─────────────────────────────────────────────────────────────────┐
│                        VIEWER (Browser)                         │
│                    React.js — Vercel CDN                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP REST API
                           │ Firebase Realtime (listener)
┌──────────────────────────▼──────────────────────────────────────┐
│                    EXPRESS.JS BACKEND                           │
│                      Railway Server                             │
│  /api/schedules  /api/games  /api/votes  /api/auth             │
│  /api/todos  /api/content  /api/youtube                        │
└──────────┬───────────────────────────┬──────────────────────────┘
           │                           │
┌──────────▼──────────┐   ┌────────────▼────────────┐
│    MySQL Database   │   │  Firebase Realtime DB   │
│      Railway        │   │  (real-time broadcast)  │
│                     │   │                         │
│  users              │   │  /schedules/next        │
│  schedules          │   │  /votes/{gameId}        │
│  games              │   │  /broadcasting          │
│  votes              │   │                         │
│  content_guides     │   └────────────▲────────────┘
│  todos              │                │ listener
└─────────────────────┘   ┌────────────┴────────────┐
                           │   FLUTTER MOBILE APP    │
                           │   Dio HTTP + Riverpod   │
                           └─────────────────────────┘
```

---

## 2. STRUKTUR FOLDER PROJECT

```
x-voca/
│
├── 📁 docs/                          ← Dokumentasi bersama
│   ├── PROJECT_CONTEXT.md
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── API_CONTRACT.md
│   ├── DATABASE_SCHEMA.md
│   └── DESIGN_TOKENS.md
│
├── 📁 web/
│   ├── 📁 frontend/                  ← Sahal: React.js
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── 📁 assets/            ← Gambar, icon, font
│   │   │   ├── 📁 components/        ← Komponen reusable
│   │   │   │   ├── 📁 common/        ← Badge, Button, Card, Input, Toggle
│   │   │   │   ├── 📁 viewer/        ← Komponen khusus halaman viewer
│   │   │   │   └── 📁 admin/         ← Komponen khusus halaman admin
│   │   │   ├── 📁 pages/             ← Halaman-halaman
│   │   │   │   ├── 📁 viewer/
│   │   │   │   │   ├── HomePage.jsx
│   │   │   │   │   ├── VotingPage.jsx
│   │   │   │   │   └── ContentGuidePage.jsx
│   │   │   │   └── 📁 admin/
│   │   │   │       ├── LoginPage.jsx
│   │   │   │       ├── DashboardPage.jsx
│   │   │   │       ├── SchedulePage.jsx
│   │   │   │       ├── VotingModerationPage.jsx
│   │   │   │       └── ContentManagementPage.jsx
│   │   │   ├── 📁 hooks/             ← Custom React hooks
│   │   │   │   ├── useFirebase.js
│   │   │   │   ├── useAuth.js
│   │   │   │   └── useCountdown.js
│   │   │   ├── 📁 services/          ← API calls (Axios)
│   │   │   │   ├── api.js            ← Axios instance + interceptors
│   │   │   │   ├── scheduleService.js
│   │   │   │   ├── gameService.js
│   │   │   │   ├── voteService.js
│   │   │   │   └── contentService.js
│   │   │   ├── 📁 utils/             ← Helper functions
│   │   │   │   ├── fingerprint.js    ← FingerprintJS setup
│   │   │   │   ├── formatDate.js
│   │   │   │   └── constants.js
│   │   │   ├── 📁 context/           ← React Context (auth state)
│   │   │   │   └── AuthContext.jsx
│   │   │   ├── App.jsx               ← Router setup
│   │   │   ├── main.jsx              ← Entry point
│   │   │   └── index.css             ← Tailwind directives + CSS vars
│   │   ├── tailwind.config.js        ← Dari DESIGN_TOKENS.md
│   │   ├── .env                      ← Environment variables
│   │   └── package.json
│   │
│   └── 📁 backend/                   ← Sahal: Express.js
│       ├── 📁 src/
│       │   ├── 📁 config/
│       │   │   ├── database.js       ← Sequelize connection
│       │   │   └── firebase.js       ← Firebase Admin SDK setup
│       │   ├── 📁 models/            ← Sequelize models
│       │   │   ├── User.js
│       │   │   ├── Schedule.js
│       │   │   ├── Game.js
│       │   │   ├── Vote.js
│       │   │   ├── ContentGuide.js
│       │   │   └── Todo.js
│       │   ├── 📁 routes/            ← Route definitions
│       │   │   ├── auth.routes.js
│       │   │   ├── schedule.routes.js
│       │   │   ├── game.routes.js
│       │   │   ├── vote.routes.js
│       │   │   ├── content.routes.js
│       │   │   ├── todo.routes.js
│       │   │   └── youtube.routes.js
│       │   ├── 📁 controllers/       ← Business logic
│       │   │   ├── auth.controller.js
│       │   │   ├── schedule.controller.js
│       │   │   ├── game.controller.js
│       │   │   ├── vote.controller.js
│       │   │   ├── content.controller.js
│       │   │   ├── todo.controller.js
│       │   │   └── youtube.controller.js
│       │   ├── 📁 middleware/
│       │   │   ├── auth.middleware.js     ← JWT verification
│       │   │   ├── rateLimit.middleware.js ← Anti-spam
│       │   │   └── errorHandler.js
│       │   ├── 📁 migrations/        ← Sequelize migrations
│       │   └── 📁 seeders/           ← Data awal
│       ├── app.js                    ← Express app setup
│       ├── server.js                 ← Entry point
│       ├── .env                      ← Environment variables
│       └── package.json
│
├── 📁 mobile/                        ← Choirul: Flutter
│   ├── lib/
│   │   ├── 📁 core/
│   │   │   ├── 📁 config/
│   │   │   │   └── env.dart          ← API URL, Firebase config
│   │   │   ├── 📁 theme/
│   │   │   │   └── app_theme.dart    ← Dari DESIGN_TOKENS.md
│   │   │   └── 📁 utils/
│   │   │       ├── date_formatter.dart
│   │   │       └── constants.dart
│   │   ├── 📁 data/
│   │   │   ├── 📁 models/            ← Data models (dari API response)
│   │   │   │   ├── schedule_model.dart
│   │   │   │   ├── game_model.dart
│   │   │   │   ├── todo_model.dart
│   │   │   │   └── user_model.dart
│   │   │   └── 📁 services/          ← API calls (Dio)
│   │   │       ├── api_service.dart  ← Dio instance + interceptors
│   │   │       ├── auth_service.dart
│   │   │       ├── schedule_service.dart
│   │   │       ├── game_service.dart
│   │   │       └── todo_service.dart
│   │   ├── 📁 presentation/
│   │   │   ├── 📁 providers/         ← Riverpod providers
│   │   │   │   ├── auth_provider.dart
│   │   │   │   ├── schedule_provider.dart
│   │   │   │   ├── game_provider.dart
│   │   │   │   └── todo_provider.dart
│   │   │   ├── 📁 screens/           ← Halaman-halaman
│   │   │   │   ├── login_screen.dart
│   │   │   │   ├── dashboard_screen.dart
│   │   │   │   ├── schedule_screen.dart
│   │   │   │   ├── vote_analytics_screen.dart
│   │   │   │   ├── todo_screen.dart
│   │   │   │   └── settings_screen.dart
│   │   │   └── 📁 widgets/           ← Widget reusable
│   │   │       ├── status_badge.dart
│   │   │       ├── countdown_widget.dart
│   │   │       ├── game_card.dart
│   │   │       ├── task_card.dart
│   │   │       └── gradient_button.dart
│   │   └── main.dart                 ← Entry point + ProviderScope
│   └── pubspec.yaml
│
└── README.md
```

---

## 3. ARSITEKTUR BACKEND (EXPRESS.JS)

### Format Response API (WAJIB konsisten)
```javascript
// Success
{
  "success": true,
  "data": { ... },
  "message": "Berhasil"
}

// Error
{
  "success": false,
  "data": null,
  "message": "Pesan error yang jelas"
}

// Paginated
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Middleware Stack (urutan)
```javascript
app.use(cors())
app.use(express.json())
app.use(rateLimit())        // global rate limit
app.use('/api/auth', authRoutes)
app.use('/api/schedules', authMiddleware, scheduleRoutes)
app.use('/api/games', gameRoutes)           // public read, auth for write
app.use('/api/votes', voteRoutes)           // public (dengan anti-spam)
app.use('/api/content', contentRoutes)      // public read, auth for write
app.use('/api/todos', authMiddleware, todoRoutes)
app.use('/api/youtube', authMiddleware, youtubeRoutes)
app.use(errorHandler)
```

---

## 4. ARSITEKTUR FIREBASE REALTIME DATABASE

### Struktur Node Firebase
```json
{
  "broadcasting": {
    "isReady": true,
    "updatedAt": "2026-09-26T20:00:00Z"
  },
  "schedules": {
    "next": {
      "id": 1,
      "title": "Cyberpunk 2077 Night Stream",
      "game": "Cyberpunk 2077",
      "datetime": "2026-09-27T20:00:00+07:00",
      "countdownEnabled": true
    }
  },
  "votes": {
    "period": "2026-09",
    "games": {
      "1": { "voteCount": 247, "status": "requested" },
      "2": { "voteCount": 198, "status": "accepted" }
    },
    "totalVotes": 1480
  }
}
```

### Kapan Firebase di-update oleh Backend
| Event | Firebase Node yang diupdate |
|---|---|
| Creator simpan jadwal baru | `/schedules/next` |
| Creator toggle countdown | `/schedules/next/countdownEnabled` |
| Viewer submit vote (valid) | `/votes/games/{gameId}/voteCount` |
| Creator reset periode | `/votes` (seluruh node) |
| Creator toggle broadcasting | `/broadcasting/isReady` |
| Creator update status game | `/votes/games/{gameId}/status` |

---

## 5. ARSITEKTUR ANTI-SPAM VOTING

### Alur Validasi (3 Lapis)
```
[1] CLIENT SIDE
    Cek localStorage: key "xvoca_voted_{gameId}_{periodKey}"
    Jika ada → tampilkan tombol disabled "Sudah Memberi Vote"
    Jika tidak ada → lanjut ke layer 2

[2] CLIENT SIDE  
    Generate fingerprint via FingerprintJS
    Kirim POST /api/votes/:gameId dengan body:
    { fingerprint: "hash_string" }
    Header otomatis membawa IP (dari server)

[3] SERVER SIDE (Express.js)
    Ambil IP dari req.ip (atau X-Forwarded-For)
    Cek tabel votes: WHERE game_id=? AND ip_address=? AND period_key=?
    Jika ada → return 429 Too Many Requests
    Cek tabel votes: WHERE game_id=? AND fingerprint=? AND period_key=?
    Jika ada → return 429 Too Many Requests
    Jika tidak ada → simpan vote, update vote_count, update Firebase
    Return 200 OK

[CLIENT] Setelah 200 OK:
    Simpan localStorage: "xvoca_voted_{gameId}_{periodKey}" = true
```

---

## 6. ARSITEKTUR AUTENTIKASI ADMIN

### Alur Login
```
POST /api/auth/login
  body: { email, password }
  → Cek users table
  → Verify bcrypt password
  → Generate JWT token (expire: 7 hari)
  → Return: { token, user: { id, name, email, role } }

Client simpan token di localStorage: "xvoca_admin_token"
Setiap request admin: Header Authorization: Bearer {token}
Backend middleware verify JWT sebelum proses request
```

### Protected Routes
```
Web Admin → semua route /admin/* di React butuh token
Backend → middleware authMiddleware di semua route yang butuh auth
Flutter → Dio interceptor otomatis attach token ke setiap request
```

---

## 7. FLOW YOUTUBE AUTO-FILL

```
[Flutter/React]
User paste: https://youtube.com/live/x7K9vQ
Klik tombol "Fetch"

→ POST /api/youtube/fetch
  body: { url: "https://youtube.com/live/x7K9vQ" }
  header: Authorization: Bearer {token}

[Express Backend]
Extract video ID dari URL
Call YouTube Data API v3:
  GET https://www.googleapis.com/youtube/v3/videos
  params: { id: videoId, part: "snippet", key: YOUTUBE_API_KEY }

Return ke client:
{
  "success": true,
  "data": {
    "title": "Cyberpunk 2077 Night Stream",
    "thumbnail": "https://i.ytimg.com/...",
    "category": "Gaming",
    "publishedAt": "2026-09-27T13:00:00Z"
  }
}

[Flutter/React]
Form otomatis terisi dengan data yang dikembalikan
```

---

## 8. DEPLOYMENT

### Vercel (Frontend React)
```
Repository: github.com/team/x-voca (folder /web/frontend)
Build command: npm run build
Output directory: build
Environment variables: set di Vercel dashboard
Auto-deploy: setiap push ke branch main
```

### Railway (Backend + MySQL)
```
Service 1: Express.js
  Repository: github.com/team/x-voca (folder /web/backend)
  Start command: node server.js
  Environment variables: set di Railway dashboard

Service 2: MySQL Database
  Plugin: MySQL di Railway
  Connection string: otomatis tersedia sebagai env var
```

### Firebase
```
Project: xvoca-project (buat di Firebase Console)
Aktifkan: Realtime Database
Rules: baca publik, tulis hanya dari backend (via Admin SDK)
```
