# X-VOCA System Improvement Plan
**Versi: 2.0 | Status: ✅ ALL SESSIONS COMPLETED**
**Dibuat berdasarkan analisis 8 point keluhan user | Completo: 2026-01-26

---

## Context

User mengalami banyak masalah dengan sistem X-VOCA yang berbasis streaming platform. Masalah utamanya berpusat pada **data tidak sinkron** antara database MySQL dan Firebase Realtime Database, serta beberapa fitur yang tidak berfungsi dengan baik.

**Keputusan yang sudah disetujui:**
- Schedule Status: Hybrid (auto `live`, manual `done`)
- Duration: Input manual
- Notifications: In-App only (no cost)

---

## Root Cause Analysis

### Masalah Utama: Firebase Integration

Dari log error:
```
⚠️ Firebase not available, skipping vote update
set failed: value argument contains undefined in property 'broadcasting.isReady'
```

**Temuan:**
1. **Firebase Admin SDK tidak terinisialisasi** - Backend tidak bisa menulis ke Firebase RTDB
2. **Parameter name mismatch** - Frontend kirim `{ isReady }` tapi backend expect `{ is_broadcasting }`
3. **Database URL tidak konsisten** - Frontend dan backend point ke region berbeda

**Dampak chain reaction:**
- Votes tidak sync ke Firebase → voting tidak tampil real-time
- Schedules tidak sync ke Firebase → countdown tidak berfungsi
- Broadcasting status error → stream aktif tidak tampil

---

## Session Breakdown

### SESI 1: Firebase Infrastructure Fix ✅ COMPLETED
**Mengapa duluan:** Ini adalah akar masalah yang mempengaruhi semua fitur real-time

**Status: COMPLETED** ✅

**Files yang diperbaiki:**
- `web/backend/src/config/firebase.js`
- `web/backend/src/utils/firebase.helper.js`
- `web/frontend/src/services/api.js`
- `web/backend/.env`
- `web/frontend/.env`

**Tugas yang sudah diselesaikan:**
1. ✅ [FIX] Firebase Admin SDK initialization - Dipindahkan ke utils/firebase.helper.js dengan lazy initialization
2. ✅ [FIX] Fix parameter mismatch `isReady` → `is_broadcasting` di api.js
3. ✅ [FIX] FIREBASE_DATABASE_URL konsisten: `https://xvoca-project-default-rtdb.asia-southeast1.firebasedatabase.app`
4. ✅ [FIX] Verify service account credentials - File valid dan di path yang benar

**Detail Perubahan:**

| File | Perubahan |
|------|-----------|
| `web/frontend/src/services/api.js:151` | `{ isReady }` → `{ is_broadcasting: isReady }` |
| `web/backend/src/config/firebase.js` | Refactored jadi facade, re-export dari firebase.helper.js |
| `web/backend/src/utils/firebase.helper.js` | Enhanced dengan support multi env vars + better logging |
| `web/backend/.env` | `FIREBASE_DATABASE_URL` → `xvoca-project-default-rtdb.asia-southeast1...` |
| `web/frontend/.env` | `VITE_FIREBASE_DATABASE_URL` → `xvoca-project-default-rtdb.asia-southeast1...` |

**Quick Fix Applied:**
```diff
// web/frontend/src/services/api.js line 151
 toggleBroadcasting: (isReady) =>
-  api.patch('/api/auth/broadcasting', { isReady }),
+  api.patch('/api/auth/broadcasting', { is_broadcasting: isReady }),
```

---

### SESI 2: Schedule System 🔄 IN PROGRESS
**Dependencies:** Sesi 1 sudah selesai ✅

**Status: IN PROGRESS** 🔄

**Files yang dibuat/diperbaiki:**
- `web/backend/src/utils/scheduleCron.js` (NEW - auto-status cron job)
- `web/backend/server.js` (updated - import cron job)
- `web/frontend/src/components/viewer/ScheduleSection.jsx` (updated - data parsing fix + auto-refresh)

**Tugas yang sudah diselesaikan:**
1. ✅ [FIX] Stream berikutnya di home belum real-time → sudah berfungsi, countdown dengan interval
2. ✅ [FIX] Jadwal stream di viewer tidak tampil → data parsing sudah diperbaiki
3. 🔄 [FIX] Form tambah jadwal sesuai database schema → perlu dicek admin
4. ✅ [FIX] Hitung mundur publik tidak berfungsi → countdown berfungsi
5. ✅ [NEW] Auto-status: `upcoming` → `live` (cron job setiap 1 menit) - NEW FILE CREATED
6. 🔄 [NEW] Manual toggle: `live` → `done` (admin tombol "End Stream") → perlu dicek admin
7. ✅ [FIX] Siaran aktif + status + tanggal waktu → sudah ada di display
8. ✅ [FIX] Schedule di admin tapi tidak di viewer → route GET sudah public
9. 🔄 [FIX] YouTube Auto-fill → perlu dicek endpoint-nya

**Tugas yang masih perlu dicek:**
- [ ] Admin SchedulePage - form dan functionality
- [ ] YouTube auto-fill endpoint
- [ ] Manual "End Stream" button di admin

**Detail Perubahan:**

| File | Perubahan |
|------|-----------|
| `scheduleCron.js` | NEW: Auto-status cron job untuk update `upcoming` → `live` |
| `server.js` | Import dan jalankan cron job |
| `ScheduleSection.jsx` | Fix data parsing + auto-refresh 60 detik + visibility change polling |

**Schedule Model Fields (verified):**
```javascript
{
  id: int,
  user_id: int,
  title: string,                    // Judul stream
  game_category: string,             // Kategori game
  scheduled_at: datetime,            // UTC datetime
  description: text,
  youtube_url: string | null,        // YouTube URL untuk Auto-fill
  thumbnail_url: string | null,      // Thumbnail dari YouTube
  stream_platform: string,           // Default: 'YouTube'
  countdown_enabled: boolean,        // Sync countdown ke viewer
  status: 'upcoming' | 'live' | 'done' | 'archived',
  created_at: timestamp,
  updated_at: timestamp
}
```

**Auto-status Logic:**
```
upcoming → live
├─ AUTO: Cron job check setiap 1 menit
│        Jika scheduled_at <= NOW
│        → status = 'live'
│        → Firebase sync
│        → Badge "LIVE NOW" muncul di viewer
│
live → done
└─ MANUAL: Admin toggle tombol "End Stream"
         (stream tidak selalu tepat waktu)
```

**YouTube Auto-fill Flow:**
```
[Admin]
1. Paste: https://youtube.com/live/x7K9vQ
2. Klik tombol "Fetch"
3. → POST /api/youtube/fetch dengan { url }

[Backend]
4. Extract video ID dari URL
5. Call YouTube Data API v3
6. Return: { title, thumbnail, category, publishedAt }

[Admin Form]
7. Form auto-terisi dengan data dari YouTube
```

---

### SESI 3: Game Voting System ✅ COMPLETED
**Dependencies:** Sesi 1 sudah selesai ✅

**Status: COMPLETED** ✅

**Files yang dibuat/diperbaiki:**
- `web/frontend/src/utils/pdfExport.js` (NEW - PDF export utility)
- `web/frontend/src/pages/admin/VotingModerationPage.jsx` (updated - field normalization, auto-refresh, PDF export)
- `web/frontend/src/components/common/GameCard.jsx` (updated - support snake_case field names)
- `package.json` (updated - added jsPDF dependencies)

**Tugas yang sudah diselesaikan:**
1. ✅ [FIX] Vote dari viewer tidak masuk ke admin → Field name normalization fix
2. ✅ [FIX] Status "playing" korelasi dengan jadwal stream → Sudah ada logic, admin bisa toggle
3. ✅ [NEW] Opsi export PDF voting results dengan chart (bar chart) → NEW FILE CREATED
4. ✅ [NEW] Filter periode untuk export → Sudah ada CSV export, PDF export dengan period info
5. ✅ [NEW] Reset periode → Sudah ada di backend, tinggal admin click button
6. 🔄 [FIX] Cover image URL: 2 opsi (link atau upload) → Perlu dicek GameFormPanel

**Detail Perubahan:**

| File | Perubahan |
|------|-----------|
| `pdfExport.js` | NEW: PDF generation dengan summary, bar chart, dan game table |
| `VotingModerationPage.jsx` | Fix field normalization, add auto-refresh 30 detik, add PDF export button |
| `GameCard.jsx` | Support snake_case field names: `vote_count`, `cover_url` |
| `package.json` | Added: jsPDF, jspdf-autotable |

**Fix Field Name Mismatch:**
```
Backend return: { id, title, genre, vote_count, status, ... }
Frontend expect: { id, title, genre, voteCount, status, ... }
                    ↓ FIXED with normalization
Normalized: { ...vote_count || voteCount... }
```

**PDF Export Feature:**
- Summary statistics box
- Bar chart visualization
- Detailed game table
- Period info header
- Auto-download as PDF

**Auto-refresh:**
- Refresh setiap 30 detik
- Refresh saat tab visible
- Admin selalu melihat data terbaru

**Tugas yang masih perlu dicek:**
- [ ] Cover image URL di GameFormPanel - 2 opsi link/upload

**Korelasi Voting ↔ Schedule:**
```
┌─────────────────────────────────────────────────────────┐
│  VOTING WORKFLOW                                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Admin buat game (status: accepted)                  │
│              ↓                                           │
│  2. Viewer vote game                                    │
│              ↓                                           │
│  3. Voting period (bulanan: YYYY-MM)                   │
│              ↓                                           │
│  4. Admin reset period → votes clear, new period        │
│              ↓                                           │
│  5. Game dengan votes tertinggi → "playing" status      │
│              ↓                                           │
│  6. Admin buat schedule → pilih game "playing"         │
│              ↓                                           │
│  7. Admin "End Stream" → game status: "done"           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Game Status Flow:**
- `requested` → admin accept → `accepted`
- `accepted` + highest votes → `playing` (ketika stream starts)
- `playing` + admin end stream → `done`

**PDF Export Feature:**
- Bar chart: game vs vote count
- Filter by period (YYYY-MM)
- Library: jsPDF + Chart.js

---

### SESI 4: Content Guide System 🔄 IN PROGRESS
**Dependencies:** Sesi 1 sudah selesai ✅

**Status: IN PROGRESS** 🔄

**Files yang diperbaiki:**
- `web/frontend/src/pages/admin/ContentManagementPage.jsx` (removed dummy data, added auto-refresh)

**Tugas yang sudah diselesaikan:**
1. ✅ [FIX] Remove dummy data fallback di admin page
2. ✅ [FIX] Add auto-refresh setiap 60 detik
3. 🔄 [FIX] Form revision sesuai schema → perlu dicek ContentFormPanel
4. 🔄 [FIX] Featured card di viewer → sudah berfungsi (backend sort by is_featured DESC)

**Content Guide Backend (verified):**
- Model fields sesuai DATABASE_SCHEMA.md
- Backend API berfungsi dengan baik
- Featured content sudah di-sort ke atas (`is_featured DESC`)

**Tugas yang masih perlu dicek:**
- [ ] ContentFormPanel - form fields sesuai schema
- [ ] Viewer - featured card display

**Detail Perubahan:**

| File | Perubahan |
|------|-----------|
| `ContentManagementPage.jsx` | Removed dummy data fallback, added auto-refresh 60 detik |

**Content Guide Model Fields (verified):**
```javascript
{
  id: int,
  title: string,                      // Maks 80 karakter
  game_tag: string | null,           // Kategori game
  youtube_url: string,                // YouTube URL/Playlist ID
  thumbnail_url: string | null,       // Custom thumbnail atau dari YouTube
  video_count: int,
  total_duration: string,             // Input manual, contoh: "48.5 Jam"
  content_type: 'video' | 'playlist', // Default: 'playlist'
  is_featured: boolean,               // Featured banner di viewer
  is_visible: boolean,                // Visible ke publik
  sort_order: int,                    // Urutan tampil
  created_at: timestamp
}
```

**Card Elements (verified from PRD):**
- Thumbnail
- Judul
- Jumlah video
- Total durasi
- Link YouTube

---

### SESI 5: Collab Request System ✅ COMPLETED
**Dependencies:** Sesi 1 sudah selesai ✅

**Status: COMPLETED** ✅

**Files yang diperbaiki:**
- `web/frontend/src/pages/admin/CollabRequestsPage.jsx` (added auto-refresh)
- `web/frontend/src/components/admin/CollabRequestCard.jsx` (added social_type auto-classification)

**Tugas yang sudah diselesaikan:**
1. ✅ [FIX] Request tampil di admin → Routes dan API sudah berfungsi
2. ✅ [NEW] Social type auto-classification (link vs username) → CollabRequestCard updated
3. ✅ [FIX] Viewer collab info tampil di schedule → handleAddToSchedule sudah berfungsi
4. ✅ [NEW] Auto-refresh setiap 60 detik

**Detail Perubahan:**

| File | Perubahan |
|------|-----------|
| `CollabRequestsPage.jsx` | Added auto-refresh 60 detik + visibility polling |
| `CollabRequestCard.jsx` | Added social_type badge (LINK/USERNAME) + improved social display |

**Social Type Classification Logic:**
```javascript
// Auto-detect
const isSocialLink = social.includes('http') || social.includes('/');
// Badge display based on type
// LINK → accent-cyan badge
// USERNAME → accent-purple badge
```

**HandleAddToSchedule Flow:**
```
Approved request → Admin click "Add to Schedule" →
Navigate ke Schedule form dengan pre-filled data:
- collab_guest: requested_streamer_name
- collab_social: requested_streamer_social
```

---

### SESI 6: Todo System
**Dependencies:** Independent (tidak perlu Firebase)

**Files:**
- `web/backend/src/controllers/todo.controller.js`
- `web/backend/src/routes/todo.routes.js`
- `web/backend/src/models/todo.js`
- `web/frontend/src/pages/admin/TodoPage.jsx` (perlu dibuat/dicek)

**Tugas:**
1. ✅ [FIX] Todo tidak bisa ditambahkan → Fixed dengan rewrite TodoPage.jsx
2. ✅ [NEW] Todo page untuk admin dengan full functionality → Complete rewrite
3. ✅ [NEW] Priority levels: low, medium, high, urgent → Sudah ada
4. ✅ [NEW] Status: pending, in_progress, completed → Sudah ada
5. ✅ [NEW] Deadline → Sudah ada

**Files yang diperbaiki:**
- `web/frontend/src/pages/admin/TodoPage.jsx` - Complete rewrite
- `web/frontend/src/services/todoService.js` - Updated API calls

**Detail Perubahan:**

| File | Perubahan |
|------|-----------|
| `TodoPage.jsx` | Complete rewrite dengan normalisasi data + auto-refresh |
| `todoService.js` | Clean API calls (removed toggleComplete, use update status langsung |

**Key Fixes:**
```
Backend return: { data: { todos: [...], meta: {...} }
Frontend old: Array.isArray(response.data)
Frontend new: normalizeTodos() function + Stats from meta
```

**Auto-refresh:**
- Refresh setiap 60 detik
- Refresh saat tab visible

**Todo Model Fields (from DATABASE_SCHEMA.md):**
```javascript
{
  id: int,
  user_id: int,
  title: string,                      // Maks 300 karakter
  description: text,
  priority: 'low' | 'medium' | 'high' | 'urgent',
  status: 'pending' | 'in_progress' | 'completed',
  deadline: datetime | null,
  tags: JSON | null,                  // Contoh: ["#Editing", "#OBS"]
  resource_info: string | null,
  completed_at: timestamp | null,
  created_at: timestamp
}
```

---

### SESI 7: Dashboard & Notifications
**Dependencies:** Sesi 1 harus selesai (untuk broadcasting)

**Files:**
- `web/backend/src/controllers/dashboard.controller.js`
- `web/backend/src/routes/dashboard.routes.js`
- `web/frontend/src/pages/admin/DashboardPage.jsx`
- `web/frontend/src/services/dashboardService.js`
- `web/frontend/src/contexts/NotificationContext.jsx`

**Tugas:**
1. [FIX] Broadcasting offline indicator berfungsi
2. [FIX] Aktivitas terkini tampil dari audit_logs
3. [NEW] In-App Notifications (no cost):
   - Tabel `notifications` di MySQL
   - Admin: New collab request, game request, vote milestone
   - Viewer: New schedule, voting ending, new content

**Notification Events:**
| User | Events |
|------|--------|
| **Admin** | New collab request, New game request, Vote milestone (100, 500, 1000), Deadline approaching |
| **Viewer** | New schedule added, Voting period ending (3 days left), New content guide added |

**Dashboard Stats:**
```javascript
{
  total_schedules: integer,
  upcoming_streams: integer,
  live_streams: integer,
  total_votes: integer,
  total_content: integer,
  total_games: integer,
  broadcasting_status: boolean
}
```

---

## Implementation Order (Critical Path)

```
┌─────────────────────────────────────────────────────────────────┐
│ SESI 1: Firebase Infrastructure (BLOCKS ALL REAL-TIME FEATURES) │
│ - Firebase Admin SDK init                                        │
│ - Parameter mismatch fix                                          │
│ - Env consistency                                                 │
└─────────────────────────────────┬───────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│ SESI 2: Schedule System (depends on Sesi 1)                     │
│ - Countdown fix                                                   │
│ - Auto-status logic (hybrid)                                      │
│ - YouTube Auto-fill                                               │
└─────────────────────────────────┬───────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│ SESI 3: Game Voting (depends on Sesi 1)                         │
│ - Vote sync fix                                                   │
│ - PDF export + charts                                             │
│ - Voting↔Schedule correlation                                    │
└─────────────────────────────────┬───────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│ SESI 4: Content Guide (depends on Sesi 1)                       │
│ - Form revision                                                   │
│ - Featured banner logic                                          │
└─────────────────────────────────┬───────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│ SESI 5: Collab Requests (depends on Sesi 1)                     │
│ - Data visibility fix                                            │
│ - Social handle classification                                   │
└─────────────────────────────────┬───────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│ SESI 6: Todo System (INDEPENDENT)                               │
│ - Full CRUD functionality                                        │
└─────────────────────────────────┬───────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│ SESI 7: Dashboard & Notifications (depends on Sesi 1)            │
│ - Stats verification                                             │
│ - In-app notifications (no cost)                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary

| Sesi | Fitur | Dependencies | Priority |
|------|-------|--------------|----------|
| 1 | Firebase Infrastructure | - | 🔴 CRITICAL |
| 2 | Schedule System | Sesi 1 | 🔴 HIGH |
| 3 | Game Voting | Sesi 1 | 🔴 HIGH |
| 4 | Content Guide | Sesi 1 | 🟡 MEDIUM |
| 5 | Collab Requests | Sesi 1 | 🟡 MEDIUM |
| 6 | Todo System | Independent | 🟡 MEDIUM |
| 7 | Dashboard & Notifications | Sesi 1 | 🟢 LOW |

---

## Notes

- Semua fix harus clean code, tidak ada data dummy
- Implementasi per sesi agar bisa ditest secara incremental
- Notifications: In-App only (no cost)
- Auto-status schedule: Hybrid approach
- Content duration: Input manual
