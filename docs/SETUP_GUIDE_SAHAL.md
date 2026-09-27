# SETUP_GUIDE_SAHAL.md
# Panduan setup lengkap untuk Sahal (Web Frontend + Backend + Database)
# Ikuti langkah ini SECARA URUT sebelum mulai coding

---

## TAHAP 1 — Persiapan Akun & Tools

### 1.1 Install Tools yang Dibutuhkan
- [ ] **Node.js v20+** → https://nodejs.org (pilih LTS)
  Cek: buka terminal → `node -v` → harus muncul v20.x.x
- [ ] **VSCode** → https://code.visualstudio.com
- [ ] **TablePlus** (free tier) → https://tableplus.com
- [ ] **Git** → https://git-scm.com

### 1.2 Install VSCode Extensions
- [ ] ESLint
- [ ] Prettier
- [ ] Tailwind CSS IntelliSense
- [ ] Thunder Client (untuk test API, pengganti Postman)
- [ ] GitLens

### 1.3 Buat Akun di Platform Hosting
- [ ] **Vercel** → https://vercel.com (daftar dengan GitHub)
- [ ] **Railway** → https://railway.app (daftar dengan GitHub)
- [ ] **Firebase** → https://console.firebase.google.com (daftar dengan Google)
- [ ] **Google Cloud Console** → https://console.cloud.google.com (untuk YouTube API)

---

## TAHAP 2 — Setup Database di Railway

### 2.1 Buat Project Railway
1. Login ke railway.app
2. Klik **"New Project"**
3. Pilih **"Empty Project"**
4. Beri nama: `x-voca`

### 2.2 Tambahkan MySQL
1. Di project x-voca, klik **"+ New"**
2. Pilih **"Database"** → **"Add MySQL"**
3. Tunggu beberapa detik sampai MySQL siap
4. Klik pada MySQL service yang baru dibuat
5. Pergi ke tab **"Variables"**
6. Catat/copy semua variable ini:
   ```
   MYSQLHOST=...
   MYSQLPORT=...
   MYSQLDATABASE=...
   MYSQLUSER=...
   MYSQLPASSWORD=...
   ```

### 2.3 Connect ke MySQL via TablePlus
1. Buka TablePlus
2. Klik **"+"** (tambah koneksi baru)
3. Pilih **MySQL**
4. Isi form:
   ```
   Name     : X-VOCA Railway
   Host     : (dari MYSQLHOST di Railway)
   Port     : (dari MYSQLPORT, biasanya 3306)
   User     : (dari MYSQLUSER)
   Password : (dari MYSQLPASSWORD)
   Database : (dari MYSQLDATABASE)
   ```
5. Klik **"Test"** → harus muncul pesan hijau "Connected"
6. Klik **"Save"** lalu **"Connect"**

### 2.4 Jalankan SQL Schema
1. Di TablePlus, klik tombol **"SQL"** (ikon terminal di toolbar)
2. Copy seluruh isi blok SQL dari `DATABASE_SCHEMA.md` (bagian "SQL CREATE TABLES")
3. Paste ke SQL editor TablePlus
4. Klik **"Run"** (atau Cmd+Enter / Ctrl+Enter)
5. Verifikasi: di sidebar kiri harus muncul 7 tabel:
   `users`, `schedules`, `games`, `votes`, `content_guides`, `todos`, `audit_logs`

### 2.5 Jalankan Seed Data
1. Masih di SQL editor TablePlus
2. **PENTING**: Sebelum jalankan seed, generate bcrypt hash dulu untuk password:
   - Buka terminal
   - Jalankan: `node -e "const bcrypt = require('bcrypt'); bcrypt.hash('xvoca2026', 12).then(h => console.log(h))"`
   - Jika bcrypt belum ada: `npm install bcrypt` dulu
   - Copy hasil hash yang muncul
3. Di seed data bagian users, ganti `$2b$12$PLACEHOLDER_HASH_GANTI_INI` dengan hash asli
4. Copy seluruh isi blok "SEED DATA" dari `DATABASE_SCHEMA.md`
5. Paste ke SQL editor, klik Run
6. Verifikasi: klik tabel `users` → harus ada 1 row (Xion Regalia)

---

## TAHAP 3 — Setup Firebase

### 3.1 Buat Firebase Project
1. Buka https://console.firebase.google.com
2. Klik **"Add project"**
3. Nama project: `xvoca-project`
4. Google Analytics: **disable** (tidak perlu)
5. Klik **"Create project"**

### 3.2 Aktifkan Realtime Database
1. Di sidebar Firebase, klik **"Build"** → **"Realtime Database"**
2. Klik **"Create Database"**
3. Pilih region: **"asia-southeast1 (Singapore)"** (paling dekat WIB)
4. Mode: pilih **"Start in test mode"** (untuk development)
5. Klik **"Enable"**

### 3.3 Set Firebase Rules (untuk keamanan)
1. Di Realtime Database, klik tab **"Rules"**
2. Ganti dengan rules ini:
```json
{
  "rules": {
    ".read": true,
    ".write": "auth != null"
  }
}
```
3. Klik **"Publish"**

### 3.4 Dapatkan Service Account (untuk backend)
1. Di Firebase Console, klik ikon ⚙️ (Settings) → **"Project settings"**
2. Tab **"Service accounts"**
3. Klik **"Generate new private key"**
4. Download file JSON yang dihasilkan
5. Simpan file ini di folder backend project (jangan di-commit ke GitHub!)
6. Rename file menjadi `firebase-service-account.json`

### 3.5 Dapatkan Config Web (untuk frontend)
1. Di Project settings, tab **"General"**
2. Scroll ke bawah ke bagian **"Your apps"**
3. Klik **"</>"** (tambah web app)
4. App nickname: `xvoca-web`
5. Copy `firebaseConfig` yang muncul — ini untuk frontend React

---

## TAHAP 4 — Setup YouTube Data API

1. Buka https://console.cloud.google.com
2. Klik dropdown project di atas → **"New Project"**
3. Nama project: `xvoca-youtube`
4. Klik **"Create"**
5. Di project baru, buka **"APIs & Services"** → **"Library"**
6. Search: **"YouTube Data API v3"**
7. Klik hasilnya → klik **"Enable"**
8. Pergi ke **"APIs & Services"** → **"Credentials"**
9. Klik **"+ Create Credentials"** → **"API Key"**
10. Copy API Key yang muncul
11. (Opsional tapi disarankan) Klik **"Edit API key"** → **"Restrict key"** → pilih "YouTube Data API v3"
12. Simpan API key ini — akan dimasukkan ke .env backend

---

## TAHAP 5 — Setup Project Backend (Express.js)

### 5.1 Buat Folder & Init Project
```bash
# Di terminal, masuk ke folder project
cd x-voca/web/backend

# Init project Node.js
npm init -y

# Install dependencies
npm install express sequelize mysql2 bcrypt jsonwebtoken cors dotenv
npm install firebase-admin axios googleapis

# Install dev dependencies
npm install --save-dev nodemon
```

### 5.2 Buat File .env
Buat file `.env` di root folder backend:
```env
PORT=3001
NODE_ENV=development

# Database (dari Railway)
DB_HOST=your_railway_host
DB_PORT=3306
DB_NAME=railway_database_name
DB_USER=railway_user
DB_PASS=railway_password

# JWT
JWT_SECRET=buat_random_string_panjang_minimal_32_karakter

# Firebase (path ke file service account)
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
FIREBASE_DATABASE_URL=https://xvoca-project-default-rtdb.asia-southeast1.firebasedatabase.app

# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 5.3 Tambahkan Script di package.json
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 5.4 Test Backend Berjalan
```bash
npm run dev
# Harus muncul: "Server running on port 3001"
# "Database connected successfully"
```

---

## TAHAP 6 — Setup Project Frontend (React.js)

### 6.1 Buat React App
```bash
# Di folder x-voca/web/frontend
npx create-react-app . --template cra-template

# Install dependencies
npm install react-router-dom axios firebase
npm install @fingerprintjs/fingerprintjs

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 6.2 Konfigurasi Tailwind
Buka `tailwind.config.js` dan ganti seluruh isinya dengan config dari `DESIGN_TOKENS.md` (bagian Tailwind Configuration).

### 6.3 Setup CSS Global
Di `src/index.css`, ganti seluruh isi dengan:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* CSS Variables dari DESIGN_TOKENS.md */
:root {
  --color-bg-base: #0D0B1A;
  /* ... paste semua CSS variables dari DESIGN_TOKENS.md */
}
```

### 6.4 Buat File .env
Buat file `.env` di root folder frontend:
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=xvoca-project.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://xvoca-project-default-rtdb.asia-southeast1.firebasedatabase.app
REACT_APP_FIREBASE_PROJECT_ID=xvoca-project
REACT_APP_FINGERPRINT_KEY=your_fingerprint_public_key
```

### 6.5 Test Frontend Berjalan
```bash
npm start
# Browser otomatis buka http://localhost:3000
```

---

## TAHAP 7 — Verifikasi Setup Lengkap

Sebelum mulai coding fitur, pastikan semua checklist ini ✅:

**Database:**
- [ ] Railway MySQL terhubung di TablePlus
- [ ] Semua 7 tabel sudah ada
- [ ] Seed data sudah masuk (cek tabel users, games, schedules)

**Backend:**
- [ ] `npm run dev` berjalan tanpa error
- [ ] Bisa akses `http://localhost:3001` di browser
- [ ] Koneksi MySQL berhasil (tidak ada error di terminal)

**Frontend:**
- [ ] `npm start` berjalan tanpa error
- [ ] Browser buka `http://localhost:3000`
- [ ] Tailwind bekerja (test dengan tambahkan class `bg-red-500` di App.js)

**Firebase:**
- [ ] Project firebase sudah ada
- [ ] Realtime Database sudah aktif
- [ ] Service account JSON sudah di folder backend

**YouTube API:**
- [ ] API key sudah ada dan disimpan di .env backend

---

## TAHAP 8 — Cara Menggunakan AI di VSCode

### Attach File yang Benar di Setiap Sesi
**Fase 1 (Setup):**
- Attach: `PROJECT_CONTEXT.md` + `AI_RULES_WEB.md` + `ARCHITECTURE.md`

**Fase 2 (Backend):**
- Attach: `PROJECT_CONTEXT.md` + `AI_RULES_WEB.md` + `API_CONTRACT.md` + `DATABASE_SCHEMA.md`
- Tambah file yang sedang dikerjakan (misal: `game.controller.js`)

**Fase 3-4 (Frontend):**
- Attach: `PROJECT_CONTEXT.md` + `AI_RULES_WEB.md` + `DESIGN_TOKENS.md`
- Tambah file yang sedang dikerjakan (misal: `VotingPage.jsx`)

### Jika Token Habis di Tengah Sesi
1. Buka sesi AI baru
2. Attach file-file yang sama seperti sebelumnya
3. Mulai dengan template prompt dari `AI_RULES_WEB.md`
4. Paste kode terakhir yang dibuat sebagai konteks
5. Minta AI melanjutkan dari titik terakhir

### Tips Vibe Coding yang Efektif
- Kerjakan **satu file/fitur per sesi** — jangan minta terlalu banyak sekaligus
- Selalu **review kode yang dihasilkan AI** sebelum dijalankan
- Jika ada error, **paste error message lengkap** ke AI (jangan parafrase)
- Gunakan **Thunder Client** di VSCode untuk test API endpoint yang baru dibuat
- **Commit ke Git** setiap kali satu fitur selesai dan berjalan

---

## URUTAN PENGERJAAN YANG DISARANKAN

```
Minggu 1:
✦ Fase 1: Setup project + Database (1-2 hari)
✦ Fase 2: Backend API — Auth + Schedule (2-3 hari)

Minggu 2:
✦ Fase 2: Backend API — Games + Votes + Content + Todo (3-4 hari)
✦ Mulai Fase 3: Web Viewer — HomePage (1 hari)

Minggu 3:
✦ Fase 3: Web Viewer — VotingPage + ContentGuidePage (3 hari)
✦ Fase 4: Web Admin — Login + Dashboard (2 hari)

Minggu 4:
✦ Fase 4: Web Admin — Schedule + Voting Mod + Content (3 hari)
✦ Fase 5: Integrasi + Testing (2 hari)
```
