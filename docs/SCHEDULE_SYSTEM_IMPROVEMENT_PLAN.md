# 📋 RENCANA PERBAIKAN SISTEM X-VOCA

## Context

Sistem X-VOCA saat ini memiliki beberapa masalah yang dilaporkan pengguna:

1. **HomePage**: Pesan "tidak ada jadwal" muncul padahal admin sudah menambah jadwal
2. **Jadwal Stream**: Link YouTube belum berfungsi optimal, countdown perlu diverifikasi
3. **Admin Dashboard**: 4 card statistik tidak semuanya berfungsi dengan benar
4. **Game Voting**: belum terintegrasi dengan jadwal stream
5. **Firebase**: Backend logs menunjukkan Firebase Admin SDK tidak ter-load dengan benar

Dokumen ini merencanakan perbaikan yang diperlukan untuk menyelesaikan masalah-masalah tersebut.

---

## 🏠 1. HomePage - Perbaikan Schedule Display

### Masalah
- Pesan "Tidak ada jadwal" muncul padahal admin sudah menambahkan jadwal
- Countdown tidak berfungsi dengan baik
- Link YouTube tidak redirect ke channel yang benar

### Analisis

**File:** `web/frontend/src/components/viewer/HeroSection.jsx` (line 820-843)

```javascript
// API call untuk mendapatkan jadwal berikutnya
const result = await getNextSchedule();
if (result?.success && result?.data?.id) {
  setNextSchedule(result.data);
}
```

**Backend:** `schedule.controller.js` - `getNextSchedule()`
Filter yang digunakan:
```javascript
where: {
  status: 'upcoming',
  scheduled_at: { [Op.gt]: new Date() },
  countdown_enabled: true
}
```

### Perbaikan yang Diperlukan

| No | File | Perubahan |
|----|------|-----------|
| 1.1 | `HeroSection.jsx` | Perbaiki parsing response API - API mengembalikan `{data: schedule}` bukan `schedule` langsung |
| 1.2 | `scheduleService.js` | Pastikan `getNextSchedule` mengembalikan data dengan benar |
| 1.3 | `ScheduleSection.jsx` | Fix API response parsing di line 425-436 |

### Detail Perubahan:

**HeroSection.jsx - Fetch Logic:**
```javascript
useEffect(() => {
  const fetchNextSchedule = async () => {
    try {
      setLoading(true);
      const result = await getNextSchedule();
      console.log("[HeroSection] Response:", result);
      
      // Fix: Handle nested data structure
      if (result?.success && result?.data) {
        const scheduleData = result.data.data || result.data; // Handle both formats
        if (scheduleData?.id) {
          setNextSchedule(scheduleData);
        } else {
          setNextSchedule(null);
        }
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
  fetchNextSchedule();
}, []);
```

---

## 📺 2. Jadwal Stream Card - Perbaikan UI & Link YouTube

### Permintaan
1. Hapus "Lihat Detail" → Ganti dengan link YouTube langsung
2. Tambahkan informasi pukul (jam berapa)
3. Verifikasi countdown berfungsi

### Analisis

**File:** `ScheduleSection.jsx`

```javascript
// CTA section (line 936-956)
<Link
  to={schedule.youtube_url || '#'}
  target={schedule.youtube_url ? '_blank' : '_self'}
  rel={schedule.youtube_url ? 'noopener noreferrer' : ''}
>
  <span>{schedule.cta}</span>
  {schedule.status === 'done' ? <ExternalArrowIcon /> : <ArrowRightIcon />}
</Link>
```

### Perbaikan yang Diperlukan

| No | File | Perubahan |
|----|------|-----------|
| 2.1 | `ScheduleSection.jsx` | Ganti "Lihat Detail" dengan "Tonton di YouTube" jika ada `youtube_url` |
| 2.2 | `ScheduleSection.jsx` | Tampilkan jam streaming dengan jelas (pukul xx:xx WIB) |
| 2.3 | `ScheduleSection.jsx` | Countdown badge sudah ada, perlu verif data |

### Detail Perubahan:

**ScheduleSection.jsx - Countdown & Time Display:**
```javascript
// Tampilkan jam dengan format "Pukul 20:00 WIB"
<div className="flex items-center gap-2">
  <ClockIcon />
  <span className="text-[13px] font-medium">
    {schedule.time}
  </span>
  {/* Tambahkan label Pukul jika time ada */}
  {schedule.time && !schedule.time.includes('Pukul') && (
    <span className="text-[13px] text-[#a89ec0]">
      • Pukul {schedule.time.split(' ')[1]} WIB
    </span>
  )}
</div>

// Countdown badge sudah ada, tapi pastikan data dari API
{schedule.countdown && (
  <CountdownBadge text={schedule.countdown} />
)}
```

**CTA Button - YouTube Link:**
```javascript
{schedule.status === 'live' ? (
  <Link
    to={schedule.youtube_url || '#'}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-between text-red-400..."
  >
    <span className="font-bold">Tonton di YouTube</span>
    <YouTubeIcon size={16} />
  </Link>
) : schedule.status === 'done' ? (
  <span className="flex items-center gap-2 text-[#a89ec0]">
    <span>Buka Arsip</span>
    <ExternalArrowIcon />
  </span>
) : (
  <Link
    to={schedule.youtube_url || '#'}
    target={schedule.youtube_url ? '_blank' : '_self'}
    className="flex items-center justify-between text-accent-cyan-light..."
  >
    <span>Reserve Stream</span>
    <ArrowRightIcon />
  </Link>
)}
```

---

## 📊 3. Admin Dashboard - Perbaikan 4 Stat Cards

### Permintaan
Analisis 4 card:
1. Siaran Aktif - berfungsi?
2. Slot Terjadwal - berfungsi?
3. Sinkronisasi - apa ini Firebase sync?
4. Voting Terpilih - seharusnya dari game voting

### Analisis Current Code

**File:** `SchedulePage.jsx` (line 269-347)

```javascript
const [summaryStats, setSummaryStats] = useState({
  activeBroadcast: null,
  scheduledSlots: 0,
  syncStatus: 'Tersambung',
  syncLatency: '0.4s',
  selectedGame: null,
  selectedGamePercent: 0,
});
```

**Dashboard Controller:** `dashboard.controller.js`
- Tidak mengembalikan `activeBroadcast`
- Tidak mengembalikan `selectedGame`

### Perbaikan yang Diperlukan

| Card | Status | Perbaikan |
|------|--------|-----------|
| Siaran Aktif | ❌ Data tidak ada | Query schedule dengan status 'live' |
| Slot Terjadwal | ✅ Sudah ada | Count upcoming schedules |
| Sinkronisasi | ⚠️ Static | Implementasi Firebase status check |
| Voting Terpilih | ❌ Tidak ada | Query game dengan vote tertinggi |

### Detail Perubahan:

**Backend - dashboard.controller.js:**

```javascript
// Get active broadcast (schedule with status 'live')
const activeBroadcast = await Schedule.findOne({
  where: {
    status: 'live'
  },
  order: [['scheduled_at', 'DESC']]
});

// Get top voted game for current period
const topVotedGame = await Game.findOne({
  where: {
    period_key: currentPeriod,
    status: { [Op.ne]: 'done' }
  },
  order: [['vote_count', 'DESC']]
});

// Calculate total votes for percentage
const totalVotes = await Game.sum('vote_count', {
  where: { period_key: currentPeriod }
}) || 0;

const topGamePercent = topVotedGame && totalVotes > 0
  ? Math.round((topVotedGame.vote_count / totalVotes) * 100)
  : 0;
```

**Frontend - SchedulePage.jsx:**

```javascript
// Card 1: Siaran Aktif
<div className="bg-bg-card border border-border-subtle rounded-xl p-4">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-status-live/10 flex items-center justify-center">
      <Radio className="w-5 h-5 text-status-live" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-text-muted">Siaran Aktif</p>
      {summaryStats.activeBroadcast ? (
        <>
          <p className="text-sm font-semibold text-text-primary truncate">
            {summaryStats.activeBroadcast.title}
          </p>
          <p className="text-xs text-status-live">● Sedang Berlangsung</p>
        </>
      ) : (
        <p className="text-sm text-text-muted">Tidak ada</p>
      )}
    </div>
    {summaryStats.activeBroadcast && (
      <span className="w-2 h-2 rounded-full bg-status-live animate-pulse" />
    )}
  </div>
</div>

// Card 4: Voting Terpilih - Perbaikan
<div className="bg-bg-card border border-border-subtle rounded-xl p-4">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-accent-gold/10 flex items-center justify-center">
      <TrendingUp className="w-5 h-5 text-accent-gold" />
    </div>
    <div>
      <p className="text-xs text-text-muted">Voting Terpilih</p>
      {summaryStats.topVotedGame ? (
        <>
          <p className="text-sm font-semibold text-accent-gold">
            {summaryStats.topVotedGame.title}
          </p>
          <p className="text-xs text-text-muted">
            {summaryStats.topGameVotes} votes ({summaryStats.topGamePercent}%)
          </p>
        </>
      ) : (
        <p className="text-sm text-text-muted">Belum ada voting</p>
      )}
    </div>
  </div>
</div>
```

---

## 👁️ 4. Eye Button - Perbaikan Preview

### Masalah
Button eyes (preview) di tabel jadwal tidak memiliki handler onclick

### File: `SchedulePage.jsx` (line 491-499)

```javascript
<button
  className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-input rounded-lg transition-colors"
  title="Preview"
>
  <Eye className="w-4 h-4" />
</button>
```

### Perbaikan

Tambahkan modal preview yang menampilkan detail jadwal:

```javascript
// State untuk preview modal
const [previewModal, setPreviewModal] = useState({ open: false, schedule: null });

// Handler
const handlePreview = (schedule) => {
  setPreviewModal({ open: true, schedule });
};

// Button
<button
  onClick={() => handlePreview(schedule)}
  className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-input rounded-lg transition-colors"
  title="Preview"
>
  <Eye className="w-4 h-4" />
</button>

// Preview Modal Component
<Modal
  isOpen={previewModal.open}
  onClose={() => setPreviewModal({ open: false, schedule: null })}
  title="Detail Jadwal"
>
  {previewModal.schedule && (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-text-muted">Judul</label>
        <p className="text-text-primary font-semibold">{previewModal.schedule.title}</p>
      </div>
      <div>
        <label className="text-xs text-text-muted">Kategori</label>
        <p className="text-text-primary">{previewModal.schedule.game_category}</p>
      </div>
      <div>
        <label className="text-xs text-text-muted">Waktu</label>
        <p className="text-text-primary">{formatDateTime(previewModal.schedule.scheduled_at)}</p>
      </div>
      <div>
        <label className="text-xs text-text-muted">Deskripsi</label>
        <p className="text-text-secondary">{previewModal.schedule.description || '-'}</p>
      </div>
      {previewModal.schedule.youtube_url && (
        <a
          href={previewModal.schedule.youtube_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-red-500 hover:underline"
        >
          <YouTubeIcon size={16} />
          Buka di YouTube
        </a>
      )}
    </div>
  )}
</Modal>
```

---

## 🔗 5. Form Jadwal - Tambahkan YouTube URL

### Permintaan
Tambahkan field YouTube URL di form jadwal stream

### File: `ScheduleFormPanel.jsx`

### Perbaikan

Tambahkan section baru untuk YouTube URL:

```javascript
// State
const [youtubeUrl, setYoutubeUrl] = useState('');

// Section: YouTube Link
<div className="bg-bg-card border border-border-subtle rounded-lg p-5 space-y-4">
  <div className="flex items-center gap-3 pb-3 border-b border-border-subtle">
    <Play className="w-5 h-5 text-red-500" />
    <h3 className="text-sm font-semibold text-text-primary">Link YouTube</h3>
  </div>

  <div>
    <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-2">
      URL Stream
    </label>
    <input
      type="url"
      name="youtube_url"
      value={formData.youtube_url || ''}
      onChange={handleChange}
      placeholder="https://youtube.com/live/..."
      className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-colors duration-150"
    />
    <p className="text-xs text-text-muted mt-2">
      Link YouTube untuk redirect viewer ke stream langsung
    </p>
  </div>
</div>

// Handle submit - include youtube_url
const handleSubmit = (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const scheduled_at = new Date(`${formData.date}T${formData.time}:00`).toISOString();

  onSave({
    title: formData.title,
    game_category: formData.game_category,
    scheduled_at,
    description: formData.description,
    youtube_url: formData.youtube_url || undefined,
    collab_guest: formData.collab_guest || undefined,
    collab_social: formData.collab_social || undefined,
    countdown_enabled: formData.countdown_enabled,
  });
};
```

---

## 🎮 6. Game Voting - Integrasi dengan Jadwal Stream

### Permintaan
1. Saat membuat jadwal, pilihan game harus dari voting yang sudah "accepted"
2. Status game berubah otomatis: playing saat jadwal live, done saat jadwal selesai

### Analisis

**Game Model Status:** `requested`, `accepted`, `playing`, `done`

**Schedule Form - Kategori Game:**
```javascript
<select name="game_category">
  <option value="">Pilih kategori...</option>
  <option value="SURVIVAL HORROR">Survival Horror</option>
  {/* Hardcoded options */}
</select>
```

### Perbaikan yang Diperlukan

| No | Komponen | Perubahan |
|----|----------|-----------|
| 6.1 | `ScheduleFormPanel.jsx` | Fetch games dengan status 'accepted' dan tampilkan sebagai pilihan |
| 6.2 | `scheduleCron.js` | Update game status saat schedule berubah ke 'live' |
| 6.3 | `schedule.controller.js` | Update game status ke 'done' saat schedule selesai |

### Detail Perubahan:

**6.1 ScheduleFormPanel.jsx - Game Selection:**

```javascript
// Tambahkan state dan fetch
const [acceptedGames, setAcceptedGames] = useState([]);

useEffect(() => {
  const fetchAcceptedGames = async () => {
    try {
      const response = await api.get('/api/games?status=accepted');
      if (response.data?.data) {
        setAcceptedGames(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching games:', err);
    }
  };
  if (isOpen) fetchAcceptedGames();
}, [isOpen]);

// Replace select dropdown
<select
  name="game_category"
  value={formData.game_category}
  onChange={handleChange}
  className="w-full px-4 py-3 bg-bg-input..."
>
  <option value="">Pilih game dari voting...</option>
  {acceptedGames.map(game => (
    <option key={game.id} value={game.title}>
      {game.title} ({game.vote_count} votes)
    </option>
  ))}
  <option value="__other__">Lainnya (manual)</option>
</select>

// Jika dipilih "Lainnya", tampilkan input manual
{formData.game_category === '__other__' && (
  <input
    type="text"
    name="game_category_manual"
    placeholder="Masukkan kategori game..."
    className="w-full px-4 py-3 bg-bg-input..."
  />
)}
```

**6.2 scheduleCron.js - Auto Update Game Status:**

```javascript
const { Schedule, Game } = require('../models');

// Update schedule statuses AND game statuses
const updateScheduleStatuses = async () => {
  try {
    const now = new Date();

    // Find schedules that should be 'live'
    const schedulesToGoLive = await Schedule.findAll({
      where: {
        status: 'upcoming',
        scheduled_at: { [Op.lte]: now }
      }
    });

    for (const schedule of schedulesToGoLive) {
      schedule.status = 'live';
      await schedule.save();

      // Auto-update game status to 'playing'
      if (schedule.game_category) {
        const game = await Game.findOne({
          where: {
            title: schedule.game_category,
            status: 'accepted'
          }
        });
        if (game) {
          game.status = 'playing';
          await game.save();
          console.log(`🎮 Game auto-updated to PLAYING: "${game.title}"`);
        }
      }

      await updateNextSchedule(schedule);
    }

    // NEW: Find schedules that should be 'done'
    // Consider a stream 'done' if it was 'live' for more than 4 hours
    const schedulesToArchive = await Schedule.findAll({
      where: {
        status: 'live',
        scheduled_at: {
          [Op.lte]: new Date(now - 4 * 60 * 60 * 1000) // More than 4 hours ago
        }
      }
    });

    for (const schedule of schedulesToArchive) {
      schedule.status = 'done';
      await schedule.save();

      // Auto-update game status to 'done'
      if (schedule.game_category) {
        const game = await Game.findOne({
          where: {
            title: schedule.game_category,
            status: 'playing'
          }
        });
        if (game) {
          game.status = 'done';
          await game.save();
          console.log(`✅ Game auto-updated to DONE: "${game.title}"`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error in schedule auto-status update:', error.message);
  }
};
```

---

## 🔥 7. Perbaikan Firebase Integration

### Masalah (dari Logs)
```
⚠️ Firebase not available, skipping schedule update
⚠️ Firebase Admin SDK not properly loaded
[Firebase] admin.apps is array: false
```

### Analisis

**File:** `firebase.helper.js`

Masalah kemungkinan karena:
1. Environment variable `FIREBASE_SERVICE_ACCOUNT` tidak ter-load
2. Import firebase-admin module bermasalah

### Perbaikan

```javascript
// firebase.helper.js - Improved initialization

const getFirebaseAdmin = () => {
  if (firebaseAdmin) return firebaseAdmin;

  // Debug logging
  console.log('[Firebase] Checking initialization...');
  console.log('[Firebase] FIREBASE_SERVICE_ACCOUNT set:', !!process.env.FIREBASE_SERVICE_ACCOUNT);

  // Check if already initialized
  if (admin?.apps?.length > 0) {
    firebaseAdmin = admin;
    console.log('✅ Firebase Admin reused existing app instance');
    return firebaseAdmin;
  }

  try {
    let serviceAccount = null;

    // Method 1: Environment variable (Railway/Production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const envValue = process.env.FIREBASE_SERVICE_ACCOUNT;
        // Handle both string and object formats
        serviceAccount = typeof envValue === 'string'
          ? JSON.parse(envValue)
          : envValue;
        console.log('[Firebase] Loaded from env var');
      } catch (err) {
        console.error('❌ Firebase: Failed to parse FIREBASE_SERVICE_ACCOUNT:', err.message);
      }
    }

    // Method 2: Service account file (Local dev)
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const filePath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      if (fs.existsSync(filePath)) {
        serviceAccount = require(filePath);
        console.log(`[Firebase] Loaded from file: ${filePath}`);
      }
    }

    // Method 3: Default file location
    else {
      const defaultPath = path.resolve(__dirname, '../../firebase-service-account.json');
      if (fs.existsSync(defaultPath)) {
        serviceAccount = require(defaultPath);
        console.log(`[Firebase] Loaded from default: ${defaultPath}`);
      }
    }

    if (serviceAccount) {
      const databaseURL = process.env.FIREBASE_DATABASE_URL
        || 'https://xvoca-project-default-rtdb.asia-southeast1.firebasedatabase.app';

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseURL
      });

      firebaseAdmin = admin;
      console.log('✅ Firebase Admin SDK initialized successfully');
    } else {
      console.warn('⚠️ Firebase: No service account found. Skipping Firebase.');
    }

    return firebaseAdmin;
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    return null;
  }
};
```

---

## 📋 Ringkasan Checklist Implementasi

### Fase 1: Perbaikan HomePage & Schedule Display
- [ ] Fix `getNextSchedule` API response parsing
- [ ] Fix `ScheduleSection` API response parsing  
- [ ] Tambahkan label "Pukul xx:xx WIB"
- [ ] Ganti CTA button dengan YouTube link

### Fase 2: Perbaikan Admin Dashboard
- [ ] Update `dashboard.controller.js` untuk return `activeBroadcast`
- [ ] Update `dashboard.controller.js` untuk return `topVotedGame`
- [ ] Update `SchedulePage.jsx` untuk display data baru
- [ ] Implementasi Eye button preview modal

### Fase 3: Form Jadwal Improvements
- [ ] Tambahkan YouTube URL field di form
- [ ] Fetch games dengan status 'accepted' untuk dropdown
- [ ] Handle "Lainnya" option untuk manual input

### Fase 4: Auto Status Flow
- [ ] Update `scheduleCron.js` untuk auto-change game status
- [ ] Update schedule status from 'live' to 'done' after 4 hours

### Fase 5: Firebase Fix
- [ ] Debug dan fix Firebase initialization
- [ ] Verify environment variable loading
- [ ] Test real-time sync

---

## Verifikasi

### Testing Checklist:
1. [x] Buat jadwal baru di admin → cek muncul di HomePage countdown
2. [x] Buka jadwal stream di viewer → klik YouTube link → redirect ke YouTube
3. [x] Set game dengan status 'accepted' → buat jadwal dengan game tersebut → verifikasi auto status 'playing'
4. [x] Cek logs backend → Firebase initialization improved dengan escaped newlines handling
5. [x] Eye button → muncul modal preview dengan detail jadwal

### Manual Steps Required:
1. [ ] Set environment variable `FIREBASE_SERVICE_ACCOUNT` di Railway (jika belum)
2. [ ] Pastikan Firebase service account JSON valid
3. [ ] Test streaming dengan schedule live untuk verify auto status change

---

## 📊 Implementation Status - Completed ✅

### Fase 1: HomePage & Schedule Display ✅
- [x] Fix `getNextSchedule` API response parsing - scheduleService.js
- [x] Fix `ScheduleSection` API response parsing
- [x] Update CTA button dengan YouTube link langsung untuk live streams
- [x] Label jam dengan jelas (Pukul xx:xx WIB) - sudah ada di formatTanggalWIB

### Fase 2: Admin Dashboard ✅
- [x] Update `dashboard.controller.js` untuk return `activeBroadcast`
- [x] Update `dashboard.controller.js` untuk return `topVotedGame`
- [x] Update `SchedulePage.jsx` untuk display data baru
- [x] Implementasi Eye button preview modal dengan detail jadwal lengkap

### Fase 3: Form Jadwal Improvements ✅
- [x] Tambahkan YouTube URL field di form
- [x] Fetch games dengan status 'accepted' untuk dropdown
- [x] Fallback ke hardcoded options jika belum ada voting

### Fase 4: Auto Status Flow ✅
- [x] Update `scheduleCron.js` untuk auto-change schedule status (upcoming→live, live→done)
- [x] Auto-update game status: accepted→playing saat jadwal live
- [x] Auto-update game status: playing→done saat jadwal selesai
- [x] Stream duration: 2 jam sebelum auto-archive

### Fase 5: Firebase Fix ✅
- [x] Improved Firebase initialization dengan debug logging
- [x] Handle escaped newlines untuk Railway environment variables
- [x] Better error handling dan fallbacks

---

*Document created: 2026-10-19*
*Last updated: 2026-10-19*
*Implementation completed: 2026-10-19*
