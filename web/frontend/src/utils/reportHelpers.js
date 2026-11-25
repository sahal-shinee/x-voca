/**
 * ============================================================================
 * FILE: web/frontend/src/utils/reportHelpers.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Helper terpusat untuk agregasi data, pemetaan status Bahasa Indonesia,
 * pemformatan tanggal/periode WIB, serta konfigurasi grafik analitik yang
 * digunakan bersama oleh modul ekspor Excel (.xlsx) dan PDF (.pdf).
 * ============================================================================
 */

export const COLLAB_STATUS_META = {
  pending:   { label: 'Baru',                 excelBg: 'FFE0F2FE', excelColor: 'FF0369A1', chartColor: '#0EA5E9' },
  approved:  { label: 'Disimpan (Shortlist)', excelBg: 'FFEDE9FE', excelColor: 'FF6D28D9', chartColor: '#8B5CF6' },
  scheduled: { label: 'Dijadwalkan',          excelBg: 'FFD1FAE5', excelColor: 'FF047857', chartColor: '#10B981' },
  rejected:  { label: 'Arsip',                excelBg: 'FFF1F5F9', excelColor: 'FF475569', chartColor: '#64748B' },
  expired:   { label: 'Kedaluwarsa',          excelBg: 'FFFEF3C7', excelColor: 'FFB45309', chartColor: '#F59E0B' },
};

export const VOTING_STATUS_META = {
  requested: { label: 'Menunggu Review',  excelBg: 'FFFEF3C7', excelColor: 'FFB45309', chartColor: '#F59E0B' },
  accepted:  { label: 'Diterima',         excelBg: 'FFD1FAE5', excelColor: 'FF047857', chartColor: '#10B981' },
  playing:   { label: 'Sedang Dimainkan', excelBg: 'FFE0F2FE', excelColor: 'FF0369A1', chartColor: '#06B6D4' },
  done:      { label: 'Selesai',          excelBg: 'FFEDE9FE', excelColor: 'FF6D28D9', chartColor: '#6366F1' },
};

/**
 * Mengonversi kode periode ('2026-11') menjadi teks resmi ('November 2026').
 */
export function formatPeriodLabelID(periodKey) {
  if (!periodKey || periodKey === 'all') return 'Semua Periode';
  try {
    const [year, month] = periodKey.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  } catch {
    return periodKey;
  }
}

/**
 * Mengambil stempel waktu saat ini dalam zona Waktu Indonesia Barat (WIB).
 */
export function getNowWIBString() {
  return (
    new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    }) + ' WIB'
  );
}

/**
 * Mengagregasi data usulan kolaborasi & menyiapkan konfigurasi grafik bersama.
 */
export function summarizeCollabData({ requests = [], filterInfo = {} }) {
  const counts = { pending: 0, approved: 0, scheduled: 0, rejected: 0, expired: 0 };
  const streamerFrequency = new Map();

  requests.forEach((req) => {
    const s = counts[req.status] !== undefined ? req.status : 'pending';
    counts[s] += 1;

    const rawName = (req.requested_streamer_name || 'Tanpa Nama').trim();
    const key = rawName.toLowerCase();
    const existing = streamerFrequency.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      streamerFrequency.set(key, { name: rawName, count: 1 });
    }
  });

  const topStreamers = Array.from(streamerFrequency.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((item) => ({ label: item.name, value: item.count }));

  const filterParts = [];
  if (filterInfo.status && filterInfo.status !== 'all') {
    filterParts.push(`Status: ${COLLAB_STATUS_META[filterInfo.status]?.label || filterInfo.status}`);
  } else {
    filterParts.push('Status: Semua');
  }
  filterParts.push(`Periode: ${formatPeriodLabelID(filterInfo.period)}`);
  if (filterInfo.search) {
    filterParts.push(`Cari: "${filterInfo.search}"`);
  }

  const donutConfig = {
    title: 'Distribusi Status Usulan',
    subtitle: 'Proporsi status moderasi usulan kolaborasi',
    centerLabel: 'USULAN',
    accentColor: '#06B6D4',
    segments: [
      { label: 'Baru (Pending)',       value: counts.pending,   color: '#0EA5E9' },
      { label: 'Shortlist (Approved)', value: counts.approved,  color: '#8B5CF6' },
      { label: 'Dijadwalkan',          value: counts.scheduled, color: '#10B981' },
      { label: 'Arsip (Rejected)',     value: counts.rejected,  color: '#64748B' },
    ],
  };

  const barConfig = {
    title: 'Top Streamer Paling Banyak Diusulkan',
    subtitle: 'Frekuensi usulan komunitas berdasarkan nama streamer',
    items: topStreamers,
    unitLabel: 'usulan',
    accentColor: '#8B5CF6',
    emptyText: 'Belum ada usulan streamer',
  };

  return {
    counts,
    uniqueStreamerCount: streamerFrequency.size,
    topStreamers,
    filterSummaryText: filterParts.join('  •  '),
    donutConfig,
    barConfig,
  };
}

/**
 * Mengagregasi data voting game & menyiapkan konfigurasi grafik bersama.
 */
export function summarizeVotingData({ games = [], periodKey, stats = {} }) {
  const sortedGames = [...games].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
  const totalVotes = stats?.totalVotes ?? sortedGames.reduce((sum, g) => sum + (g.vote_count || 0), 0);
  const maxVotes = stats?.maxVotes ?? (sortedGames[0]?.vote_count || 0);
  const topGame = sortedGames[0] || null;

  const statusCounts = { requested: 0, accepted: 0, playing: 0, done: 0 };
  sortedGames.forEach((g) => {
    const s = VOTING_STATUS_META[g.status] ? g.status : 'requested';
    statusCounts[s] += 1;
  });

  const topVotedBars = sortedGames.slice(0, 6).map((g, idx) => ({
    label: `#${idx + 1} ${g.title || 'Game'}`,
    value: g.vote_count || 0,
    color: idx === 0 ? '#F59E0B' : undefined,
  }));

  const periodLabel = formatPeriodLabelID(periodKey);

  const donutConfig = {
    title: 'Distribusi Status Game',
    subtitle: `Periode ${periodLabel}`,
    centerLabel: 'GAME',
    accentColor: '#06B6D4',
    segments: [
      { label: 'Menunggu Review',  value: statusCounts.requested, color: '#F59E0B' },
      { label: 'Diterima',         value: statusCounts.accepted,  color: '#10B981' },
      { label: 'Sedang Dimainkan', value: statusCounts.playing,   color: '#06B6D4' },
      { label: 'Selesai',          value: statusCounts.done,      color: '#6366F1' },
    ],
  };

  const barConfig = {
    title: 'Peringkat Perolehan Suara (Top 6 Game)',
    subtitle: 'Perbandingan suara antar kandidat game',
    items: topVotedBars,
    unitLabel: 'suara',
    accentColor: '#F59E0B',
    emptyText: 'Belum ada suara voting pada periode ini',
  };

  return {
    sortedGames,
    totalVotes,
    maxVotes,
    topGame,
    statusCounts,
    topVotedBars,
    periodLabel,
    donutConfig,
    barConfig,
  };
}

export default {
  COLLAB_STATUS_META,
  VOTING_STATUS_META,
  formatPeriodLabelID,
  getNowWIBString,
  summarizeCollabData,
  summarizeVotingData,
};
