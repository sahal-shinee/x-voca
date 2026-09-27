# DATABASE_SCHEMA.md — X-VOCA
# Blueprint database MySQL — Single source of truth
# Dibaca oleh: Sahal (setup Railway + Sequelize)

---

## 1. GAMBARAN TABEL

```
users ──────────────┬──── schedules
                    ├──── content_guides
                    └──── todos

games ──────────────└──── votes
```

---

## 2. SQL CREATE TABLES

Jalankan script ini di Railway MySQL (via TablePlus atau Railway console):

```sql
-- ============================================================
-- DATABASE SETUP
-- ============================================================
CREATE DATABASE IF NOT EXISTS xvoca_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE xvoca_db;

-- ============================================================
-- TABLE: users
-- Menyimpan akun Creator (Xion Regalia)
-- ============================================================
CREATE TABLE users (
  id            INT           NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('admin', 'superadmin') NOT NULL DEFAULT 'admin',
  avatar_url    VARCHAR(500)  NULL,
  rig_name      VARCHAR(100)  NULL DEFAULT 'Obsidian Rig #03',
  rig_version   VARCHAR(20)   NULL DEFAULT 'v3.4',
  is_broadcasting BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: schedules
-- Menyimpan jadwal live stream Creator
-- ============================================================
CREATE TABLE schedules (
  id                  INT           NOT NULL AUTO_INCREMENT,
  user_id             INT           NOT NULL,
  title               VARCHAR(200)  NOT NULL,
  game_category       VARCHAR(100)  NULL,
  scheduled_at        DATETIME      NOT NULL,
  description         TEXT          NULL,
  youtube_url         VARCHAR(500)  NULL,
  thumbnail_url       VARCHAR(500)  NULL,
  stream_platform     VARCHAR(50)   NULL DEFAULT 'YouTube',
  countdown_enabled   BOOLEAN       NOT NULL DEFAULT TRUE,
  status              ENUM('upcoming', 'live', 'done', 'archived') NOT NULL DEFAULT 'upcoming',
  created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_scheduled_at (scheduled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: games
-- Menyimpan daftar game voting
-- ============================================================
CREATE TABLE games (
  id            INT           NOT NULL AUTO_INCREMENT,
  title         VARCHAR(200)  NOT NULL,
  genre         VARCHAR(100)  NULL,
  publisher     VARCHAR(100)  NULL,
  cover_url     VARCHAR(500)  NULL,
  vote_count    INT           NOT NULL DEFAULT 0,
  status        ENUM('requested', 'accepted', 'playing', 'done') NOT NULL DEFAULT 'requested',
  added_by      ENUM('viewer', 'creator') NOT NULL DEFAULT 'viewer',
  requester_info VARCHAR(100) NULL,
  period_key    VARCHAR(7)    NOT NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_status (status),
  INDEX idx_period_key (period_key),
  INDEX idx_vote_count (vote_count DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: votes
-- Log tracking setiap aktivitas vote
-- ============================================================
CREATE TABLE votes (
  id            INT           NOT NULL AUTO_INCREMENT,
  game_id       INT           NOT NULL,
  ip_address    VARCHAR(45)   NOT NULL,
  fingerprint   VARCHAR(255)  NOT NULL,
  period_key    VARCHAR(7)    NOT NULL,
  voted_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  UNIQUE INDEX idx_unique_vote (game_id, ip_address, period_key),
  UNIQUE INDEX idx_unique_fingerprint (game_id, fingerprint, period_key),
  INDEX idx_period (period_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: content_guides
-- Katalog konten YouTube yang dikelola Creator
-- ============================================================
CREATE TABLE content_guides (
  id            INT           NOT NULL AUTO_INCREMENT,
  user_id       INT           NOT NULL,
  title         VARCHAR(200)  NOT NULL,
  game_tag      VARCHAR(100)  NULL,
  youtube_url   VARCHAR(500)  NOT NULL,
  thumbnail_url VARCHAR(500)  NULL,
  video_count   INT           NULL DEFAULT 1,
  total_duration VARCHAR(20)  NULL,
  content_type  ENUM('video', 'playlist') NOT NULL DEFAULT 'playlist',
  is_featured   BOOLEAN       NOT NULL DEFAULT FALSE,
  is_visible    BOOLEAN       NOT NULL DEFAULT TRUE,
  sort_order    INT           NOT NULL DEFAULT 0,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_is_visible (is_visible),
  INDEX idx_is_featured (is_featured),
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: todos
-- To-do list internal Creator (TIDAK dipublikasikan ke viewer)
-- ============================================================
CREATE TABLE todos (
  id            INT           NOT NULL AUTO_INCREMENT,
  user_id       INT           NOT NULL,
  title         VARCHAR(300)  NOT NULL,
  description   TEXT          NULL,
  priority      ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
  status        ENUM('pending', 'in_progress', 'completed') NOT NULL DEFAULT 'pending',
  deadline      DATETIME      NULL,
  tags          JSON          NULL,
  resource_info VARCHAR(200)  NULL,
  completed_at  TIMESTAMP     NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_deadline (deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: audit_logs
-- Log aktivitas sistem untuk dashboard admin
-- ============================================================
CREATE TABLE audit_logs (
  id            INT           NOT NULL AUTO_INCREMENT,
  action_type   ENUM('vote_in', 'schedule_updated', 'game_requested', 'asset_archived', 'period_reset', 'content_added', 'status_changed') NOT NULL,
  detail        VARCHAR(500)  NOT NULL,
  sub_detail    VARCHAR(500)  NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_action_type (action_type),
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 3. SEED DATA (Data Awal)

```sql
-- ============================================================
-- SEED: Creator Account (Xion Regalia)
-- Password: xvoca2026 (hash ini adalah bcrypt dari password tersebut)
-- GANTI password_hash dengan hasil bcrypt yang sebenarnya!
-- ============================================================
INSERT INTO users (name, email, password_hash, role, rig_name, rig_version)
VALUES (
  'Xion Regalia',
  'xionregalia@gmail.com',
  '$2b$12$PLACEHOLDER_HASH_GANTI_INI',
  'superadmin',
  'Obsidian Rig #03',
  'v3.4'
);

-- ============================================================
-- SEED: Sample Games
-- ============================================================
INSERT INTO games (title, genre, publisher, vote_count, status, added_by, period_key) VALUES
('Elden Ring: Shadow of the Erdtree', 'Action RPG', 'FromSoftware', 247, 'requested', 'viewer', '2026-09'),
('Hollow Knight: Silksong', 'Metroidvania', 'Team Cherry', 198, 'accepted', 'viewer', '2026-09'),
('Minecraft: Regalia Sanctuary', 'Sandbox', 'Mojang', 156, 'playing', 'creator', '2026-09'),
('Silent Hill 2 Remake', 'Atmospheric Horror', 'Bloober Team', 142, 'requested', 'viewer', '2026-09'),
('Subnautica: Void Depths', 'Survival', 'Unknown Worlds', 95, 'done', 'creator', '2026-09');

-- ============================================================
-- SEED: Sample Schedules
-- ============================================================
INSERT INTO schedules (user_id, title, game_category, scheduled_at, countdown_enabled, status) VALUES
(1, 'Cyberpunk 2077 Night Stream', 'Cyberpunk 2077', '2026-09-27 20:00:00', TRUE, 'upcoming'),
(1, 'Minecraft Chill Stream – Mega Build Project', 'Minecraft', '2026-09-28 19:30:00', TRUE, 'upcoming'),
(1, 'Genshin Impact Live – New Region Pulls', 'Genshin Impact', '2026-09-28 21:00:00', TRUE, 'upcoming');

-- ============================================================
-- SEED: Sample Content Guides
-- ============================================================
INSERT INTO content_guides (user_id, title, game_tag, youtube_url, video_count, total_duration, content_type, is_featured, is_visible, sort_order) VALUES
(1, 'Elden Ring: Shadow of the Erdtree — Ekspedisi Gerbang Sunyi', 'Elden Ring', 'https://youtube.com/playlist?list=example1', 14, '48.5 Jam', 'playlist', TRUE, TRUE, 1),
(1, 'Signalis: Solitary Resonance — Full Story Arc', 'Signalis', 'https://youtube.com/playlist?list=example2', 6, '19 Jam', 'playlist', FALSE, TRUE, 2),
(1, 'Midnight Tea & Fan Letters: Season 2', 'Chat/Zatsu', 'https://youtube.com/playlist?list=example3', 21, '52 Jam', 'playlist', FALSE, TRUE, 3);

-- ============================================================
-- SEED: Sample Audit Logs
-- ============================================================
INSERT INTO audit_logs (action_type, detail, sub_detail) VALUES
('vote_in', '58 vote baru ditambahkan', 'Outer Wilds: Echoes of the Eye'),
('schedule_updated', 'Siaran diset ke LIVE NOW', 'Signalis: Solitary Resonance · Slot 21:00 UTC+7'),
('game_requested', 'Viewer #1042 mengajukan usulan baru', 'Silent Hill 2 Remake'),
('asset_archived', 'VOD Night 14 berhasil diekspor', 'Ghost in the Shell Soundscape Archive 4K');
```

---

## 4. SEQUELIZE MODELS

### Cara Setup di Backend

```javascript
// src/config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
```

### Contoh Model (Game)
```javascript
// src/models/Game.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Game = sequelize.define('Game', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  genre: DataTypes.STRING(100),
  publisher: DataTypes.STRING(100),
  cover_url: DataTypes.STRING(500),
  vote_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('requested', 'accepted', 'playing', 'done'),
    defaultValue: 'requested'
  },
  added_by: {
    type: DataTypes.ENUM('viewer', 'creator'),
    defaultValue: 'viewer'
  },
  requester_info: DataTypes.STRING(100),
  period_key: {
    type: DataTypes.STRING(7),
    allowNull: false
  }
}, {
  tableName: 'games',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Game;
```

---

## 5. QUERY PENTING

### Ambil Jadwal Berikutnya (untuk countdown web viewer)
```sql
SELECT id, title, game_category, scheduled_at, countdown_enabled
FROM schedules
WHERE status = 'upcoming'
  AND scheduled_at > NOW()
  AND countdown_enabled = TRUE
ORDER BY scheduled_at ASC
LIMIT 1;
```

### Ranking Game per Periode (untuk voting)
```sql
SELECT id, title, genre, cover_url, vote_count, status,
  ROUND(vote_count * 100.0 / SUM(vote_count) OVER(), 1) AS vote_percentage
FROM games
WHERE period_key = '2026-09'
ORDER BY vote_count DESC;
```

### Cek Anti-spam Vote
```sql
SELECT id FROM votes
WHERE game_id = ?
  AND (ip_address = ? OR fingerprint = ?)
  AND period_key = ?
LIMIT 1;
```

### Total Vote per Periode
```sql
SELECT
  COUNT(*) as total_votes,
  SUM(CASE WHEN status = 'requested' THEN 1 ELSE 0 END) as requested_count,
  SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted_count,
  SUM(CASE WHEN status = 'playing' THEN 1 ELSE 0 END) as playing_count
FROM games
WHERE period_key = ?;
```

### Reset Periode Voting
```sql
-- 1. Update semua game: reset vote_count, kembalikan status ke requested
UPDATE games
SET vote_count = 0,
    status = 'requested',
    period_key = '2026-10'  -- period_key baru
WHERE status != 'done';     -- game yang sudah done tidak di-reset

-- 2. Data votes lama tetap tersimpan (tidak dihapus, untuk arsip)
```

---

## 6. CATATAN PENTING

1. **Jangan hapus data votes** saat reset periode — data itu arsip berharga
2. **vote_count di tabel games** adalah denormalized counter — sengaja tidak dihitung dari JOIN ke tabel votes setiap saat, untuk efisiensi query
3. **period_key format: YYYY-MM** — misal `2026-09` untuk September 2026
4. **tags di todos** menggunakan tipe JSON — contoh: `["#Shorts", "#Editing", "#OBS"]`
5. **Timezone**: semua datetime disimpan dalam UTC, konversi ke WIB (UTC+7) dilakukan di frontend/Flutter
6. **password_hash**: gunakan bcrypt dengan salt rounds 12 minimum
