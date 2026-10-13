# PANDUAN CEK KONFIGURASI X-VOCA
## Untuk Memastikan Semua Sistem Berfungsi

**Tujuan:** Memverifikasi konfigurasi backend, database, dan service pihak ketiga

---

## 📋 CHECKLIST SEBELUM MULAI

- [ ] Akses ke Railway Dashboard
- [ ] Akses ke Firebase Console
- [ ] Akses ke project Vercel (jika ada)
- [ ] GitHub repository untuk cek deployment

---

## 1. CEK JWT_SECRET (KRITICAL)

### Di Railway Dashboard:

1. Buka https://railway.app/dashboard
2. Pilih project Anda (x-voca atau similar)
3. Klik tab **"Variables"** atau **"Environment Variables"**
4. Cari variabel `JWT_SECRET`

### Yang Harus Dicek:

| Status | Nilai | Aksi |
|--------|-------|------|
| ❌ Tidak ada | - | Buat baru |
| ❌ `your_super_secret_jwt_key_here_change_in_production` | Placeholder | GANTI SEGERA! |
| ❌ Less than 32 characters | Pendek | GANTI dengan yang lebih panjang |
| ✅ Minimal 32+ karakter acak | Example: `xK9#mP2$vL8@nQ4@wY7&jR5` | ✅ OK |

### Cara Generate JWT_SECRET Baru:

```bash
# Pilih salah satu cara:

# Cara 1: Openssl
openssl rand -base64 64

# Cara 2: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Cara 3: Online generator
# Buka https://1password.com/password-generator/
# Pilih: 32+ characters, Symbols included
```

### Nilai JWT_SECRET yang Baik:
```
 Contoh: 5f8J2k#L9mP$3nQ4@vW7&xY1!jR6^K8*mB5
 Panjang: 32+ karakter
 Terdapat: huruf besar, huruf kecil, angka, simbol
```

---

## 2. CEK YOUTUBE API KEY

### Apakah Anda Butuh YouTube Auto-fill?

| Kebutuhan | Aksi |
|----------|------|
| Ingin fitur auto-fill jadwal dari YouTube | Perlu API Key |
| Tidak butuh auto-fill | Boleh kosong/tidak dikonfigurasi |

### Jika Butuh YouTube API Key:

#### Langkah 1: Buat Project di Google Cloud Console
1. Buka https://console.cloud.google.com/
2. Login dengan akun Google
3. Buat project baru: **"X-VOCA"**

#### Langkah 2: Aktifkan YouTube Data API v3
1. Buka **"APIs & Services"** → **"Library"**
2. Cari **"YouTube Data API v3"**
3. Klik **"Enable"**

#### Langkah 3: Buat API Key
1. Buka **"APIs & Services"** → **"Credentials"**
2. Klik **"Create Credentials"** → **"API Key"**
3. Copy API Key yang dihasilkan

#### Langkah 4: Batasi API Key (Recommended)
1. Klik **"Edit API Key"**
2. **Application restrictions**: HTTP referrers
3. **Website restrictions**: Tambahkan domain Anda:
   - `xvoca.vercel.app`
   - `xvoca-api.railway.app`
   - `localhost` (untuk development)
4. **API restrictions**: Select **"YouTube Data API v3"**

#### Langkah 5: Tambahkan ke Railway
1. Railway Dashboard → Variables
2. Tambah: `YOUTUBE_API_KEY=AIzaSy...` (key yang baru dibuat)

---

## 3. CEK FIREBASE CONFIGURATION

### Buka Firebase Console:
1. Buka https://console.firebase.google.com/
2. Pilih project Anda (xvoca-project)

### Yang Harus Dicek:

#### A. Realtime Database Aktif?

1. Di sidebar kiri: **"Realtime Database"**
2. Jika ada tombol **"Create Database"** → Belum dibuat
3. Jika menampilkan data tree → Sudah aktif

#### B. Cek Service Account (untuk Backend):

1. **Settings** (gear icon) → **"Project settings"**
2. Pilih tab **"Service accounts"**
3. Klik **"Generate new private key"**
4. Simpan file JSON tersebut

#### C. Download Service Account File:

1. Buka Railway Dashboard → Variables
2. Buat variable baru: `FIREBASE_SERVICE_ACCOUNT_PATH`
3. Value: `./firebase-service-account.json`

4. Upload file JSON ke Railway:
   - Railway Dashboard → Project
   - Tab **"Settings"** → **"Domains"**
   - Section **"Deploy from GitHub"** → cek file yang di-deploy
   - Upload file JSON ke root folder backend

---

## 4. CEK URL PRODUCTION

### Backend API URL:

Dari `.env.example`, terlihat:
```
VITE_API_URL=https://xvoca-api.railway.app
```

**Verifikasi di Railway:**
1. Buka Railway Dashboard
2. Pilih service Backend/Express
3. Tab **"Settings"** → **"Domains"**
4. Copy domain yang diberikan (biasanya: `xvoca-api.railway.app`)

### Frontend URL:

Buka Vercel Dashboard:
1. https://vercel.com/dashboard
2. Pilih project
3. Lihat **"Domains"** - ini adalah URL production frontend

### CORS Configuration:

**Di Railway:**
1. Buka Railway Dashboard
2. Variables
3. Pastikan ada:
   ```
   CORS_ORIGIN=https://xvoca.vercel.app
   ```

---

## 5. CEK DATABASE (MySQL)

### A. Via Railway Dashboard:

1. Railway Dashboard → Project
2. Klik **"MySQL"** plugin (tab atau service)
3. Klik **"Connect"** atau **"phpMyAdmin"**
4. Login dengan kredensial yang diberikan

### B. Yang Harus Dicek:

Buka phpMyAdmin, lalu cek tabel-tabel berikut:

#### Tabel: `schedules`
```sql
SELECT COUNT(*) as total FROM schedules;
```
| Hasil | Status |
|-------|--------|
| 0 | ❌ Belum ada data |
| > 0 | ✅ Ada data |

#### Tabel: `content_guides`
```sql
SELECT COUNT(*) as total FROM content_guides;
```

#### Tabel: `collab_requests`
```sql
SELECT COUNT(*) as total FROM collab_requests;
```

#### Tabel: `users`
```sql
SELECT id, email, role, is_active FROM users LIMIT 5;
```
| Yang harus ada | Status |
|----------------|--------|
| User dengan role: admin/superadmin | ✅ |
| is_active = 1 | ✅ |

### C. Lihat Sample Data:

```sql
-- Cek schedule terbaru
SELECT id, title, scheduled_at, status FROM schedules 
ORDER BY scheduled_at DESC LIMIT 5;

-- Cek content guide
SELECT id, title, game_tag, is_visible, is_featured 
FROM content_guides LIMIT 5;

-- Cek collab request
SELECT id, requested_streamer_name, status, created_at 
FROM collab_requests ORDER BY created_at DESC LIMIT 5;
```

---

## 6. CEK API ENDPOINT (Testing)

### A. Test Health Check:
Buka di browser:
```
https://xvoca-api.railway.app/health
```
Harus muncul:
```json
{"success":true,"data":{"status":"healthy",...}}
```

### B. Test Schedule Endpoint (Public):
```
https://xvoca-api.railway.app/api/schedules
```
Harus muncul jadwal jika ada data.

### C. Test Content Endpoint (Public):
```
https://xvoca-api.railway.app/api/content
```

### D. Test Collab Request Submit (Public):
```bash
curl -X POST https://xvoca-api.railway.app/api/collab-requests \
  -H "Content-Type: application/json" \
  -d '{"requested_streamer_name":"Test Streamer"}'
```
Harus return success.

---

## 7. CEK DEPLOYMENT STATUS

### Railway:
1. https://railway.app/dashboard
2. Pilih project
3. Cek tab **"Deployments"**
4. Pastikan deployment terakhir: ✅ **Successful**

### Vercel:
1. https://vercel.com/dashboard
2. Pilih project
3. Cek status deployment terakhir

### Jika Deployment Gagal:
1. Klik deployment yang gagal
2. Lihat logs untuk error message
3. Error umum:
   - Missing environment variables
   - Build failed
   - Runtime error

---

## 📊 RINGKASAN STATUS

| Item | Cek di | Status Sekarang | Status yang Diinginkan |
|------|--------|----------------|----------------------|
| JWT_SECRET | Railway Variables | Placeholder? | Minimal 32 karakter acak |
| YouTube API Key | Railway Variables | Kosong/Placeholder | Jika perlu auto-fill |
| Firebase Database | Firebase Console | Aktif/Belum | Aktif |
| Firebase Service Account | File JSON | Ada/Tidak | Ada |
| CORS_ORIGIN | Railway Variables | localhost? | URL Vercel production |
| VITE_API_URL | Vercel/Frontend | localhost? | URL Railway |
| Database Connection | Railway MySQL | Connected? | Connected |
| schedules table | phpMyAdmin | Ada data? | Data ada |
| content_guides table | phpMyAdmin | Ada data? | Data ada |
| collab_requests table | phpMyAdmin | Ada data? | Data ada |

---

## 🚨 JIKA MASIH ADA MASALAH

### Error: "Akses ditolak. Token tidak ditemukan"
→ JWT_SECRET belum dikonfigurasi dengan benar di Railway

### Error: "CORS not allowed"
→ CORS_ORIGIN belum pointing ke URL Vercel yang benar

### Error: "Firebase initialization failed"
→ Service account JSON belum diupload atau path salah

### Error: "Connection refused" ke database
→ DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS belum benar

### Error: "No data found" di semua endpoint
→ Cek apakah tabel benar-benar ada data

---

## ✅ FINAL CHECKLIST

Setelah semua dicek, paste output ini ke chat:

```
JWT_SECRET: [Ada/Tidak/Placeholder]
YouTube API: [Ada/Kosong/TidakPerlu]
Firebase DB: [Aktif/Tidak]
Firebase Service: [Ada/Tidak]
CORS_ORIGIN: [URL yang digunakan]
Database schedules: [Jumlah data]
Database content: [Jumlah data]
Database collab_requests: [Jumlah data]
```

Ini akan membantu saya melihat apa yang perlu diperbaiki!
