# Panduan Strategi Pencadangan dan Pemulihan Basis Data (TiDB Cloud & MySQL)
**Sistem Aplikasi Full-Stack: X-VOCA (Web Viewer & Studio Admin)**

Dokumen ini memuat Standar Operasional Prosedur (SOP) untuk pencadangan (*backup*), mitigasi bencana data (*disaster recovery*), dan pemulihan (*restore*) basis data produksi X-VOCA yang dihosting di **TiDB Cloud Serverless**.

---

## 1. Arsitektur Basis Data Produksi

* **Engine:** TiDB Cloud Serverless (MySQL 8.0 Distributed Protocol Compatible)
* **Koneksi:** Enkripsi Wajib TLS/SSL v1.2 (`rejectUnauthorized: true`)
* **ORM:** Sequelize ORM (Node.js) di atas Vercel Serverless Functions
* **Karakteristik:** Multi-region ACID Distributed Transactions, Horizontal Scalability, Anti-Race Condition Concurrency.

---

## 2. Strategi Pencadangan (Backup Strategy)

### A. Pencadangan Otomatis Cloud (Automated Daily Snapshots)
Secara bawaan, TiDB Cloud Serverless telah dikonfigurasi dengan fitur cadangan otomatis terkelola:
1. **Automated Daily Snapshots:** Kluster membuat salinan kondisi basis data secara otomatis setiap 24 jam.
2. **Point-in-Time Recovery (PITR):** Memungkinkan pengembalian data ke titik waktu spesifik (menit/detik) dalam kurun waktu retensi jika terjadi kesalahan manusia (*human error*) atau korupsi data.

### B. Pencadangan Manual via TiDB Cloud Console (1-Click Snapshot)
Sebelum melakukan pembaruan skema besar (*schema migration*) atau peluncuran fitur baru:
1. Masuk ke **[TiDB Cloud Console](https://tidbcloud.com/)**.
2. Pilih kluster aktif Anda (misalnya `xvoca-cluster`).
3. Masuk ke tab **Backup & Restore**.
4. Klik tombol **Manual Backup** atau **Create Snapshot**.
5. Beri label keterangan (contoh: `pre-deployment-v1.0`). Snapshot akan tersimpan aman di infrastruktur cloud independen.

### C. Pencadangan Terjadwal via CLI (`npm run db:backup`)
Tersedia skrip otomatis terintegrasi pada backend:
```bash
cd web/backend
npm run db:backup
```
Perintah ini akan membaca kredensial `.env` secara aman dan membuat file dump SQL terkompresi dengan penamaan berstempel waktu:
`backup_<database>_<timestamp>.sql`

Contoh perintah manual menggunakan `mysqldump` dengan SSL wajib TiDB Cloud:
```bash
mysqldump -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS --ssl-mode=REQUIRED --single-transaction --quick --databases xvoca_db > backup_manual_xvoca.sql
```

---

## 3. Prosedur Pemulihan Data (Disaster Recovery & Restore)

### Skenario 1: Pemulihan Instan via TiDB Cloud Console (PITR)
Jika terjadi insiden data yang memerlukan pengembalian instan:
1. Buka TiDB Cloud Console -> Kluster Anda -> **Backup & Restore**.
2. Pilih snapshot terbaru sebelum insiden terjadi, atau pilih **Restore to a Point in Time**.
3. Tentukan cluster target (bisa ditimpa atau dibuat ke cluster uji baru).
4. Klik **Confirm Restore**. Data akan pulih dalam beberapa menit.

### Skenario 2: Pemulihan melalui File Dump SQL
Jika memulihkan dari file lokal:
```bash
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS --ssl-mode=REQUIRED xvoca_db < backup_xvoca_2026-xx-xx.sql
```

---

## 4. Kebijakan Retensi dan Keamanan Data

* **Enkripsi:** Seluruh transfer data pencadangan menggunakan enkripsi wajib TLS/SSL.
* **Isolasi Rahasia:** File dump SQL tidak boleh diunggah ke repositori Git publik. Aturan `*.sql` telah dilindungi dalam `.gitignore`.
* **Retensi:** Snapshot otomatis cloud dipertahankan selama 7–30 hari sesuai tier TiDB Cloud.
