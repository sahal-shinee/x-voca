# X-VOCA System Improvement Plan
**Versi: 3.0 | Status: 🔴 NEEDS VERIFICATION**
**Dibuat berdasarkan analisis 8 point keluhan user**
**Last Updated: 2026-01-26**

---

## ⚠️ HONEST STATUS REPORT

### ✅ YANG SUDAH DIFIX (dan seharusnya working setelah redeploy):
1. `/api/todos` - Route di-import (masalah: route exists but not mounted)
2. `/api/youtube/fetch` - Route di-import (masalah: route exists but not mounted)
3. Collab list - Filter params fix
4. Firebase - Null safety check

### ❌ YANG MASIH PERLU DICEK/VERIFIKASI:

#### 1. Schedule System (SESI 2)
- [ ] **YouTube auto-fill** - Backend FIXED (route mounted), tapi perlu test apakah frontend button berfungsi
- [ ] **"End Stream" button** - Belum dicek ada/tidak di admin
- [ ] **Countdown viewer** - Perlu dicek apakah berfungsi setelah Firebase fix

#### 2. Content Guide (SESI 4)
- [ ] **Form fields** - Belum dicek apakah sesuai schema
- [ ] **YouTube auto-fill** - BELUM ada di frontend ContentFormPanel
- [ ] **Featured card** - Perlu dicek apakah berfungsi

#### 3. Dashboard & Notifications (SESI 7)
- [ ] **Aktivitas Terkini** - Stats "5 dari 0" masih salah
- [ ] **Notifications** - BELUM implementasi sama sekali
- [ ] **Broadcasting status** - Firebase error, perlu dicek setelah env var diset

#### 4. Firebase Production
- [ ] **FIREBASE_SERVICE_ACCOUNT** env var perlu diset di Railway
- [ ] Test apakah voting sync berfungsi setelah env var diset

---

## Root Cause Analysis

### Masalah Utama: Routes Not Mounted

```
MASALAH: Semua routes SUDAH ADA di folder src/routes/ dan src/controllers/
         tapi TIDAK di-import/mount di app.js!

Yang ditemukan tidak di-import:
- ❌ /api/todos (BARU DIFIX)
- ❌ /api/youtube/fetch (BARU DIFIX)

Kemungkinan ada lagi yang tidak di-import...
```

### Checklist Route yang Sudah Dicek:

| Route | File | Mounted? | Status |
|-------|------|----------|--------|
| /api/auth | auth.routes.js | ✅ | OK |
| /api/admin | admin.routes.js | ✅ | OK |
| /api/schedules | schedule.routes.js | ✅ | OK |
| /api/games | game.routes.js | ✅ | OK |
| /api/votes | vote.routes.js | ✅ | OK |
| /api/content | content.routes.js | ✅ | OK |
| /api/collab-requests | collabRequest.routes.js | ✅ | OK |
| /api/dashboard | dashboard.routes.js | ✅ | OK |
| /api/audit-logs | auditLog.routes.js | ✅ | OK |
| /api/todos | todo.routes.js | ✅ | BARU DIFIX |
| /api/youtube | youtube.routes.js | ✅ | BARU DIFIX |

---

## Files yang Sudah Diubah (Session 1-7)

### Sesi 1: Firebase Infrastructure ✅
- `web/frontend/src/services/api.js` - Fix parameter mismatch
- `web/backend/src/config/firebase.js` - Refactored facade
- `web/backend/src/utils/firebase.helper.js` - Added null safety
- `.env` files - Database URL fix

### Sesi 2: Schedule System 🔄
- `web/backend/src/utils/scheduleCron.js` - NEW cron job
- `web/backend/server.js` - Import cron job
- `web/frontend/src/components/viewer/ScheduleSection.jsx` - Data parsing fix

### Sesi 3: Game Voting ✅
- `web/frontend/src/utils/pdfExport.js` - NEW PDF export
- `web/frontend/src/pages/admin/VotingModerationPage.jsx` - Field normalization
- `web/frontend/src/components/common/GameCard.jsx` - Snake_case support

### Sesi 4: Content Guide 🔄
- `web/frontend/src/pages/admin/ContentManagementPage.jsx` - Remove dummy data

### Sesi 5: Collab Requests ✅
- `web/frontend/src/pages/admin/CollabRequestsPage.jsx` - Auto-refresh
- `web/frontend/src/components/admin/CollabRequestCard.jsx` - Social type badge
- `web/frontend/src/hooks/useCollabRequests.js` - Filter fix

### Sesi 6: Todo ✅ (but route not mounted!)
- `web/frontend/src/pages/admin/TodoPage.jsx` - Complete rewrite
- `web/frontend/src/services/todoService.js` - API calls
- `app.js` - Route mount (BARU DIFIX)

### Sesi 7: Dashboard & Notifications ❌
- **BELUM ADA YANG WORKING**

---

## Todo untuk Implementasi Lanjutan

### Priority 1: VERIFIKASI (SETELAH REDEPLOY)
- [ ] Test `/api/todos` - Apakah bisa GET dan POST?
- [ ] Test `/api/youtube/fetch` - Apakah auto-fill berfungsi?
- [ ] Test Collab list - Apakah data tampil?
- [ ] Test Firebase - Apakah warning masih muncul?

### Priority 2: SESI 2 - Schedule
- [ ] Cek "End Stream" button di admin SchedulePage
- [ ] Test countdown berfungsi
- [ ] Test YouTube auto-fill

### Priority 3: SESI 4 - Content Guide
- [ ] Add YouTube auto-fill ke ContentFormPanel
- [ ] Verify form fields sesuai schema
- [ ] Test featured card

### Priority 4: SESI 7 - Dashboard & Notifications
- [ ] Fix "Aktivitas Terkini" stats "5 dari 0"
- [ ] Implementasi notifications table
- [ ] Test broadcasting status

---

## Notes

- Semua fix dilakukan dengan clean code, tidak ada data dummy
- Backend routes yang tidak berfungsi biasanya karena TIDAK di-mount di app.js
- Frontend services harus di-test manual setelah backend di-redeploy
- Firebase membutuhkan FIREBASE_SERVICE_ACCOUNT environment variable

