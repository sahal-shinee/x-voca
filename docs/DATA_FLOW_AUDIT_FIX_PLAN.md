# DATA FLOW AUDIT & FIX PLAN
## X-VOCA Web Application

**Date:** 2024-10-13
**Status:** Analysis Complete - Ready for Implementation
**Priority:** CRITICAL

---

## 1. RINGKASAN MASALAH

### Masalah Utama Ditemukan:

| # | Masalah | Lokasi | Severity |
|---|---------|--------|----------|
| 1 | API URL Production tidak dikonfigurasi | `web/frontend/.env` | CRITICAL |
| 2 | Data format mismatch: backend vs frontend | Semua service files | CRITICAL |
| 3 | Firebase URL mismatch (frontend vs backend) | `.env` files | HIGH |
| 4 | YouTube API Key placeholder | `web/backend/.env` | MEDIUM |
| 5 | Collab request data tidak tampil | Admin page | HIGH |
| 6 | Content Guide admin kosong | ContentManagementPage | HIGH |
| 7 | Schedule tidak tampil di viewer | ScheduleSection | HIGH |
| 8 | Countdown tidak berfungsi | HeroSection | MEDIUM |

---

## 2. ROOT CAUSE ANALYSIS

### 2.1 API URL Configuration Issue (CRITICAL)

**File:** `web/frontend/.env`
```
VITE_API_URL=http://localhost:3001  ← LOCALHOST ONLY!
```

**File:** `web/backend/.env`
```
CORS_ORIGIN=http://localhost:5173  ← LOCALHOST ONLY!
```

**Impact:** Jika di-deploy, frontend tidak bisa connect ke backend karena:
- Frontend production URL berbeda dari `localhost:3001`
- Backend CORS tidak mengizinkan production origin

### 2.2 Data Format Mismatch (CRITICAL)

**Backend Response Format** (contoh: `/api/schedules`):
```json
{
  "success": true,
  "data": {
    "schedules": [...],
    "pagination": {...}
  },
  "message": "..."
}
```

**Frontend Expected Format:**
```json
{
  "success": true,
  "data": [...],
  "message": "..."
}
```

**Affected Endpoints:**
- `GET /api/schedules` → returns `{ schedules: [...] }` not array
- `GET /api/content` → returns `{ contents: [...] }` not array
- `GET /api/collab-requests` → returns array directly (OK)

### 2.3 Firebase URL Mismatch (HIGH)

**Frontend `.env`:**
```
VITE_FIREBASE_DATABASE_URL=https://xvoca-project-default-rtdb.firebaseio.com
```

**Backend `.env`:**
```
FIREBASE_DATABASE_URL=https://xvoca-project.firebaseio.com
```

**Impact:** Frontend dan backend sync ke Firebase berbeda!

### 2.4 Schedule Service Issue

**File:** `web/frontend/src/services/scheduleService.js`

```javascript
// Current (line 19)
const response = await api.get(`/api/schedules?${queryParams.toString()}`);
return response.data;  // Returns entire response object
```

**But ScheduleSection expects:**
```javascript
// Line 418-421
const allSchedules = [
  ...(Array.isArray(liveData) ? liveData : liveData.data || []),
  ...
].map(transformScheduleData).filter(Boolean);
```

**Problem:** `liveData.data` is `{ schedules: [...], pagination: {...} }` not an array!

### 2.5 Content Management Page Issue

**File:** `web/frontend/src/pages/admin/ContentManagementPage.jsx`

```javascript
// Line 86-87
if (response?.data) {
  let data = Array.isArray(response.data) ? response.data : response.data.content || [];
```

**Backend returns:**
```json
{
  "success": true,
  "data": {
    "contents": [...],  // ← "contents" not "content"
    "pagination": {...}
  }
}
```

### 2.6 Collab Request Issue

**Hook:** `web/frontend/src/hooks/useCollabRequests.js`

```javascript
// Line 51-56
if (listRes.data?.success) {
  setRequests(listRes.data.data || []);  // ← Returns direct array from backend
```

Backend `getCollabRequests` returns:
```json
{
  "success": true,
  "data": [...],  // Direct array - this is CORRECT
  "meta": {...}
}
```

**Analysis:** Hook correctly handles direct array. Issue might be:
1. Backend endpoint not connected to route
2. CORS/auth middleware blocking
3. Data actually empty in database

---

## 3. IMPLEMENTATION PLAN

### Priority 1: Fix Data Format (CRITICAL)

#### Step 1.1: Update Schedule Service
**File:** `web/frontend/src/services/scheduleService.js`

```javascript
// Current (broken)
export const getSchedules = async (params = {}) => {
  // ...
  const response = await api.get(`/api/schedules?${queryParams.toString()}`);
  return response.data;  // WRONG: returns { success, data: { schedules } }
};

// Fixed
export const getSchedules = async (params = {}) => {
  // ...
  const response = await api.get(`/api/schedules?${queryParams.toString()}`);
  // Return the schedules array, not the whole response
  return response.data?.data?.schedules || [];
};
```

#### Step 1.2: Update Content Service
**File:** `web/frontend/src/services/contentService.js`

```javascript
// Current (line 20-21)
const response = await api.get(`/api/content?${queryParams.toString()}`);
return response.data;

// Fixed
export const getContent = async (params = {}) => {
  // ...
  const response = await api.get(`/api/content?${queryParams.toString()}`);
  // Return properly structured data
  return {
    success: response.data?.success,
    data: {
      contents: response.data?.data?.contents || [],
      pagination: response.data?.data?.pagination
    }
  };
};
```

#### Step 1.3: Update ContentManagementPage
**File:** `web/frontend/src/pages/admin/ContentManagementPage.jsx`

```javascript
// Line 86-87 - Fix data extraction
if (response?.data) {
  // Backend returns { contents: [...] } not direct array
  let data = response.data?.contents || 
             response.data?.data?.contents || 
             Array.isArray(response.data) ? response.data : [];
```

### Priority 2: API URL Configuration (CRITICAL)

#### Step 2.1: Create Production Environment Files

**File:** `web/frontend/.env.production`
```
VITE_API_URL=https://xvoca-api.railway.app
VITE_FIREBASE_API_KEY=your_actual_firebase_api_key
VITE_FIREBASE_DATABASE_URL=https://xvoca-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=xvoca-project
VITE_FINGERPRINT_KEY=your_actual_fingerprint_key
```

**File:** `web/backend/.env.production`
```
PORT=3001
DB_HOST=your_railway_host
DB_PORT=3306
DB_NAME=xvoca_db
DB_USER=railway_user
DB_PASS=your_railway_password
JWT_SECRET=your_production_jwt_secret
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
FIREBASE_DATABASE_URL=https://xvoca-project-default-rtdb.firebaseio.com
YOUTUBE_API_KEY=your_youtube_api_key
CORS_ORIGIN=https://xvoca.vercel.app
```

#### Step 2.2: Update Backend CORS
**File:** `web/backend/src/app.js` (or similar)

```javascript
// Allow production Vercel URL
const allowedOrigins = [
  'http://localhost:5173',
  'https://xvoca.vercel.app',
  process.env.NODE_ENV === 'production' ? undefined : undefined
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### Priority 3: Firebase Configuration (HIGH)

#### Step 3.1: Align Firebase URLs
Ensure both frontend and backend use the same Firebase URL:
```
FIREBASE_DATABASE_URL=https://xvoca-project-default-rtdb.firebaseio.com
```

### Priority 4: Collab Request Debugging (HIGH)

#### Step 4.1: Verify Backend Route Connection
**File:** `web/backend/src/routes/` or `app.js`

Check that collab request routes are registered:
```javascript
const collabRequestRoutes = require('./routes/collabRequest.routes');
app.use('/api/collab-requests', collabRequestRoutes);
```

#### Step 4.2: Add Auth Middleware Check
**File:** `web/backend/src/routes/collabRequest.routes.js`

Collab requests endpoint for VIEWERS should be PUBLIC:
```javascript
// GET /api/collab-requests (admin only)
router.get('/', authMiddleware, collabRequestController.getCollabRequests);

// POST /api/collab-requests (PUBLIC - viewer)
router.post('/', collabRequestController.createCollabRequest);
```

### Priority 5: Countdown Timer Fix (MEDIUM)

#### Step 5.1: Verify Schedule Data Format
**File:** `web/frontend/src/components/viewer/HeroSection.jsx`

```javascript
// Line 809-814
const fetchNextSchedule = async () => {
  try {
    setLoading(true);
    const data = await getNextSchedule();
    // Backend returns { success, data: schedule || null }
    if (data?.success && data?.data) {
      setNextSchedule(data.data);
    } else {
      setNextSchedule(null);
    }
  } catch (err) {
    console.error('Error fetching next schedule:', err);
    setNextSchedule(null);
  } finally {
    setLoading(false);
  }
};
```

#### Step 5.2: Update Schedule Service for Next
**File:** `web/frontend/src/services/scheduleService.js`

```javascript
// Fix getNextSchedule
export const getNextSchedule = async () => {
  try {
    const response = await api.get('/api/schedules/next');
    // Backend returns { success, data: schedule || null }
    return response.data;
  } catch (error) {
    console.error('Error fetching next schedule:', error);
    return { success: false, data: null };
  }
};
```

---

## 4. TESTING CHECKLIST

After implementing fixes, verify:

### 4.1 Schedule Flow
- [ ] Admin can create schedule → data saved to DB
- [ ] Schedule appears in Admin list
- [ ] Schedule appears in Viewer ScheduleSection
- [ ] Countdown timer works in HeroSection
- [ ] Schedule data synced to Firebase (if configured)

### 4.2 Content Guide Flow
- [ ] Admin can create content → data saved to DB
- [ ] Content appears in Admin ContentManagementPage
- [ ] Content appears in Viewer ContentGuidePage
- [ ] Featured content shows correctly

### 4.3 Collab Request Flow
- [ ] Viewer can submit collab request
- [ ] Request saved to DB
- [ ] Request appears in Admin CollabRequestsPage
- [ ] Admin can approve/reject request
- [ ] Stats (pending/approved/rejected) update correctly

### 4.4 API Connectivity
- [ ] Frontend calls correct API URL
- [ ] CORS allows frontend origin
- [ ] Auth middleware works correctly

---

## 5. FILE CHANGES SUMMARY

### Files to Modify:
1. `web/frontend/src/services/scheduleService.js` - Fix data extraction
2. `web/frontend/src/services/contentService.js` - Fix data extraction
3. `web/frontend/src/pages/admin/ContentManagementPage.jsx` - Fix data extraction
4. `web/frontend/src/pages/viewer/ScheduleSection.jsx` - Update data handling
5. `web/frontend/src/components/viewer/HeroSection.jsx` - Update data handling
6. `web/frontend/.env.production` - Create production config
7. `web/backend/.env.production` - Create production config
8. `web/backend/src/app.js` - Update CORS configuration

### Files to Create:
1. `web/frontend/.env.production`
2. `web/backend/.env.production`

### Files to Check:
1. `web/backend/src/routes/` - Verify all routes connected
2. `web/backend/src/routes/collabRequest.routes.js` - Verify PUBLIC POST endpoint

---

## 6. QUESTIONS FOR USER

1. **Production URLs**: Apa URL production untuk:
   - Frontend (Vercel)? 
   - Backend API (Railway)?

2. **Firebase**: Apakah Anda sudah punya Firebase project dengan Realtime Database aktif? Jika ya, tolong berikan:
   - Firebase Database URL
   - Service Account JSON untuk backend

3. **YouTube API**: Apakah Anda ingin mengaktifkan YouTube auto-fill feature? Jika ya, perlu API key.

4. **Database**: Apakah Anda sudah mengecek apakah data ada di database? Bisa dicek via:
   - phpMyAdmin/Railway dashboard
   - Langsung query MySQL

---

## 7. NEXT STEPS

1. Konfirmasi pertanyaan di atas
2. Implementasi Priority 1 (Data Format Fix)
3. Testing lokal dengan data dummy
4. Konfigurasi production URLs
5. Testing production deployment
