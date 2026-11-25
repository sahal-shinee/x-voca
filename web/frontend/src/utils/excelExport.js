/**
 * ============================================================================
 * FILE: web/frontend/src/utils/excelExport.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Utility ekspor laporan Excel berformat profesional (.xlsx) untuk X-VOCA.
 * Dilengkapi banner eksekutif, kartu ringkasan KPI, grafik visual (Donut & Bar)
 * tertanam resolusi tinggi, tabel bergaris dengan pewarnaan status, auto-width,
 * serta text wrapping agar tampil rapi saat dibuka di WPS Office & Microsoft Excel.
 * ============================================================================
 */

import { safeFormatDate } from './dateUtils';
import { renderDonutChartBase64, renderHorizontalBarChartBase64 } from './chartCanvas';
import {
  COLLAB_STATUS_META,
  VOTING_STATUS_META,
  getNowWIBString,
  summarizeCollabData,
  summarizeVotingData,
} from './reportHelpers';

const COLORS = {
  bannerBg: 'FF1E1B4B',      // Midnight Dark Indigo
  subBannerBg: 'FF2E2A64',   // Deep Indigo
  bannerText: 'FFFFFFFF',
  bannerCyan: 'FF67E8F9',
  metaBg: 'FFF1F5F9',        // Slate 100
  metaText: 'FF475569',
  tableHeaderBg: 'FF1E293B', // Slate 800
  tableHeaderText: 'FFFFFFFF',
  zebraLight: 'FFF8FAFC',    // Slate 50
  white: 'FFFFFFFF',
  borderLight: 'FFE2E8F0',   // Slate 200
  borderMedium: 'FFCBD5E1',  // Slate 300
  textPrimary: 'FF0F172A',   // Slate 900
  textSecondary: 'FF334155', // Slate 700
  textMuted: 'FF64748B',     // Slate 500
  totalBg: 'FFEEF2FF',       // Indigo 50
  linkText: 'FF0284C7',      // Sky 600
};

/**
 * Memuat bundle browser ExcelJS secara lazy dan defensif agar kompatibel dengan Vite 8 / Rolldown.
 */
async function loadExcelJS() {
  const mod = await import('exceljs/dist/exceljs.min.js');
  const Excel =
    (mod?.Workbook ? mod : null) ||
    (mod?.default?.Workbook ? mod.default : null) ||
    (typeof window !== 'undefined' && window.ExcelJS?.Workbook ? window.ExcelJS : null);

  if (!Excel || !Excel.Workbook) {
    throw new Error('Pustaka ExcelJS gagal dimuat di peramban.');
  }
  return Excel;
}

/**
 * Menghitung tinggi baris yang aman untuk teks yang di-wrap agar tidak terpotong di WPS Office / Excel.
 */
function computeWrappedRowHeight(rowValues, colConfigs) {
  let maxLines = 1;
  rowValues.forEach((val, idx) => {
    const cfg = colConfigs[idx];
    if (!cfg?.wrapText || val === null || val === undefined) return;
    const text = String(val);
    const effectiveCharsPerLine = Math.max(12, (cfg.computedWidth || cfg.minWidth || 20) - 3);
    const segments = text.split(/\r?\n/);
    let totalLines = 0;
    segments.forEach((seg) => {
      totalLines += Math.max(1, Math.ceil(seg.length / effectiveCharsPerLine));
    });
    if (totalLines > maxLines) maxLines = totalLines;
  });
  return Math.min(150, Math.max(22, maxLines * 15 + 8));
}

/**
 * Menyusun worksheet laporan eksekutif seragam (Banner + 4 KPI + 2 Grafik + Tabel Data).
 */
async function buildAndDownloadExecutiveReport({
  fileName,
  sheetName,
  title,
  subtitle,
  metaText,
  kpis = [],
  donutConfig,
  barConfig,
  columns = [],
  rows = [],
  totalRowValues = null,
}) {
  const Excel = await loadExcelJS();
  const wb = new Excel.Workbook();
  wb.creator = 'X-VOCA Streaming Studio';
  wb.lastModifiedBy = 'X-VOCA Admin System';
  wb.created = new Date();
  wb.modified = new Date();

  const ws = wb.addWorksheet(sheetName, {
    views: [{ showGridLines: true }],
    pageSetup: {
      orientation: 'landscape',
      paperSize: 9, // A4
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
    },
  });

  const colCount = columns.length;
  const lastColLetter = String.fromCharCode(64 + colCount);

  // 1. Hitung lebar kolom dinamis agar judul & teks isi tidak terpotong
  const colConfigs = columns.map((col, cIdx) => {
    let maxLen = String(col.header || '').length + 4;
    rows.forEach((r) => {
      const cell = r.values[cIdx];
      const text = cell === null || cell === undefined ? '' : String(cell);
      const firstLineLen = text.split(/\r?\n/)[0].length;
      if (firstLineLen + 3 > maxLen) maxLen = firstLineLen + 3;
    });
    const minW = col.minWidth || 10;
    const maxW = col.maxWidth || 40;
    return {
      ...col,
      computedWidth: Math.max(minW, Math.min(maxW, maxLen)),
    };
  });

  ws.columns = colConfigs.map((c) => ({ key: c.key, width: c.computedWidth }));

  // 2. Banner Header (Baris 1-3)
  ws.mergeCells(`A1:${lastColLetter}1`);
  ws.getRow(1).height = 30;
  const c1 = ws.getCell('A1');
  c1.value = title;
  c1.font = { name: 'Calibri', size: 15, bold: true, color: { argb: COLORS.bannerText } };
  c1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.bannerBg } };
  c1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

  ws.mergeCells(`A2:${lastColLetter}2`);
  ws.getRow(2).height = 20;
  const c2 = ws.getCell('A2');
  c2.value = subtitle;
  c2.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.bannerCyan } };
  c2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.subBannerBg } };
  c2.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

  ws.mergeCells(`A3:${lastColLetter}3`);
  ws.getRow(3).height = 20;
  const c3 = ws.getCell('A3');
  c3.value = metaText;
  c3.font = { name: 'Calibri', size: 9.5, italic: true, color: { argb: COLORS.metaText } };
  c3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.metaBg } };
  c3.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  c3.border = { bottom: { style: 'thin', color: { argb: COLORS.borderMedium } } };

  ws.getRow(4).height = 10;

  // 3. Kartu Ringkasan KPI (Baris 5-7, dibagi 4 pasangan kolom: A:B, C:D, E:F, G:H)
  const kpiPairs = [
    ['A', 'B'],
    ['C', 'D'],
    ['E', 'F'],
    ['G', 'H'],
  ];
  ws.getRow(5).height = 18;
  ws.getRow(6).height = 26;
  ws.getRow(7).height = 18;

  kpis.slice(0, 4).forEach((kpi, idx) => {
    const [startCol, endCol] = kpiPairs[idx];
    const accent = kpi.accent || 'FF06B6D4';

    ws.mergeCells(`${startCol}5:${endCol}5`);
    ws.mergeCells(`${startCol}6:${endCol}6`);
    ws.mergeCells(`${startCol}7:${endCol}7`);

    const labelCell = ws.getCell(`${startCol}5`);
    labelCell.value = `  ${kpi.label}`;
    labelCell.font = { name: 'Calibri', size: 8.5, bold: true, color: { argb: COLORS.textMuted } };
    labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.white } };
    labelCell.alignment = { vertical: 'middle', horizontal: 'left' };

    const valueCell = ws.getCell(`${startCol}6`);
    valueCell.value = `  ${kpi.value}`;
    const isLongValue = String(kpi.value || '').length > 16;
    valueCell.font = {
      name: 'Calibri',
      size: isLongValue ? 12 : 15,
      bold: true,
      color: { argb: COLORS.textPrimary },
    };
    valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.white } };
    valueCell.alignment = { vertical: 'middle', horizontal: 'left' };

    const noteCell = ws.getCell(`${startCol}7`);
    noteCell.value = `  ${kpi.note || ''}`;
    noteCell.font = { name: 'Calibri', size: 8.5, italic: true, color: { argb: COLORS.textMuted } };
    noteCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraLight } };
    noteCell.alignment = { vertical: 'middle', horizontal: 'left' };

    const startColNum = startCol.charCodeAt(0) - 64;
    const endColNum = endCol.charCodeAt(0) - 64;
    for (let colNum = startColNum; colNum <= endColNum; colNum++) {
      const isLeft = colNum === startColNum;
      const isRight = colNum === endColNum;

      ws.getCell(5, colNum).border = {
        top: { style: 'medium', color: { argb: accent } },
        left: isLeft ? { style: 'thin', color: { argb: COLORS.borderMedium } } : undefined,
        right: isRight ? { style: 'thin', color: { argb: COLORS.borderMedium } } : undefined,
      };
      ws.getCell(6, colNum).border = {
        left: isLeft ? { style: 'thin', color: { argb: COLORS.borderMedium } } : undefined,
        right: isRight ? { style: 'thin', color: { argb: COLORS.borderMedium } } : undefined,
      };
      ws.getCell(7, colNum).border = {
        bottom: { style: 'thin', color: { argb: COLORS.borderMedium } },
        left: isLeft ? { style: 'thin', color: { argb: COLORS.borderMedium } } : undefined,
        right: isRight ? { style: 'thin', color: { argb: COLORS.borderMedium } } : undefined,
      };
    }
  });

  ws.getRow(8).height = 10;

  // 4. Seksi Grafik Visual (Baris 9-25)
  ws.mergeCells(`A9:${lastColLetter}9`);
  ws.getRow(9).height = 22;
  const chartTitleCell = ws.getCell('A9');
  chartTitleCell.value = 'RINGKASAN VISUAL & GRAFIK ANALITIK';
  chartTitleCell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: COLORS.textPrimary } };
  chartTitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  chartTitleCell.border = { bottom: { style: 'medium', color: { argb: 'FF06B6D4' } } };

  for (let rIdx = 10; rIdx <= 25; rIdx++) {
    ws.getRow(rIdx).height = 18.5;
  }

  const donutBase64 = donutConfig ? renderDonutChartBase64(donutConfig) : null;
  const barBase64 = barConfig ? renderHorizontalBarChartBase64(barConfig) : null;

  if (donutBase64) {
    const donutId = wb.addImage({ base64: donutBase64, extension: 'png' });
    ws.addImage(donutId, {
      tl: { col: 0, row: 9.2 },
      ext: { width: 470, height: 262 },
      editAs: 'oneCell',
    });
  }

  if (barBase64) {
    const barId = wb.addImage({ base64: barBase64, extension: 'png' });
    ws.addImage(barId, {
      tl: { col: 4, row: 9.2 },
      ext: { width: 510, height: 262 },
      editAs: 'oneCell',
    });
  }

  ws.getRow(26).height = 10;

  // 5. Tabel Data Rinci (Mulai Baris 27)
  const tableTitleRowNum = 27;
  ws.mergeCells(`A${tableTitleRowNum}:${lastColLetter}${tableTitleRowNum}`);
  ws.getRow(tableTitleRowNum).height = 22;
  const tTitleCell = ws.getCell(`A${tableTitleRowNum}`);
  tTitleCell.value = `RINCIAN DATA (${rows.length.toLocaleString('id-ID')} BARIS)`;
  tTitleCell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: COLORS.textPrimary } };
  tTitleCell.alignment = { vertical: 'middle', horizontal: 'left' };

  const headerRowNum = 28;
  const headerRow = ws.getRow(headerRowNum);
  headerRow.height = 28;
  colConfigs.forEach((col, cIdx) => {
    const cell = headerRow.getCell(cIdx + 1);
    cell.value = col.header;
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.tableHeaderText } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.tableHeaderBg } };
    cell.alignment = { vertical: 'middle', horizontal: col.headerAlign || col.align || 'left', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: COLORS.tableHeaderBg } },
      bottom: { style: 'medium', color: { argb: 'FF06B6D4' } },
      left: { style: 'thin', color: { argb: 'FF334155' } },
      right: { style: 'thin', color: { argb: 'FF334155' } },
    };
  });

  rows.forEach((rowItem, rIdx) => {
    const excelRowNum = headerRowNum + 1 + rIdx;
    const row = ws.getRow(excelRowNum);
    row.height = computeWrappedRowHeight(rowItem.values, colConfigs);
    const isEven = rIdx % 2 === 1;
    const defaultBg = isEven ? COLORS.zebraLight : COLORS.white;

    rowItem.values.forEach((val, cIdx) => {
      const cfg = colConfigs[cIdx];
      const cell = row.getCell(cIdx + 1);
      cell.value = val;

      const customStyle = rowItem.cellStyles?.[cIdx] || null;
      const cellBg = customStyle?.bg || defaultBg;
      const cellTextColor = customStyle?.color || (cfg.isLink && val && val !== '-' ? COLORS.linkText : COLORS.textSecondary);
      const isBold = customStyle?.bold ?? cfg.bold ?? false;

      cell.font = {
        name: 'Calibri',
        size: 10,
        bold: isBold,
        underline: cfg.isLink && val && val !== '-' && String(val).startsWith('http'),
        color: { argb: cellTextColor },
      };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cellBg } };
      cell.alignment = {
        vertical: 'middle',
        horizontal: cfg.align || 'left',
        wrapText: Boolean(cfg.wrapText),
      };
      if (cfg.numFmt && typeof val === 'number') {
        cell.numFmt = cfg.numFmt;
      }
      cell.border = {
        top: { style: 'thin', color: { argb: COLORS.borderLight } },
        bottom: { style: 'thin', color: { argb: COLORS.borderLight } },
        left: { style: 'thin', color: { argb: COLORS.borderLight } },
        right: { style: 'thin', color: { argb: COLORS.borderLight } },
      };
    });
  });

  const lastDataRowNum = headerRowNum + rows.length;
  if (totalRowValues && rows.length > 0) {
    const totalRowNum = lastDataRowNum + 1;
    const totalRow = ws.getRow(totalRowNum);
    totalRow.height = 24;
    colConfigs.forEach((cfg, cIdx) => {
      const cell = totalRow.getCell(cIdx + 1);
      const val = totalRowValues[cIdx] ?? '';
      cell.value = val;
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.bannerBg } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.totalBg } };
      cell.alignment = { vertical: 'middle', horizontal: cfg.align || 'left' };
      if (cfg.numFmt && typeof val === 'number') {
        cell.numFmt = cfg.numFmt;
      }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF6366F1' } },
        bottom: { style: 'medium', color: { argb: COLORS.bannerBg } },
        left: { style: 'thin', color: { argb: COLORS.borderMedium } },
        right: { style: 'thin', color: { argb: COLORS.borderMedium } },
      };
    });
  }

  if (rows.length > 0) {
    ws.autoFilter = {
      from: { row: headerRowNum, column: 1 },
      to: { row: lastDataRowNum, column: colCount },
    };
  }

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * EKSPOR 1: LAPORAN COLLAB REQUESTS (.xlsx)
 */
export async function exportCollabRequestsExcel({ requests = [], filterInfo = {} }) {
  const {
    counts,
    uniqueStreamerCount,
    filterSummaryText,
    donutConfig,
    barConfig,
  } = summarizeCollabData({ requests, filterInfo });

  const columns = [
    { key: 'no',       header: 'No',                minWidth: 6,  maxWidth: 8,  align: 'center', headerAlign: 'center', numFmt: '0' },
    { key: 'streamer', header: 'Nama Streamer',     minWidth: 20, maxWidth: 28, align: 'left',   bold: true, wrapText: true },
    { key: 'social',   header: 'Saluran / Sosmed',  minWidth: 24, maxWidth: 34, align: 'left',   isLink: true, wrapText: true },
    { key: 'status',   header: 'Status',            minWidth: 21, maxWidth: 24, align: 'center', headerAlign: 'center' },
    { key: 'message',  header: 'Pesan Penonton',    minWidth: 32, maxWidth: 42, align: 'left',   wrapText: true },
    { key: 'notes',    header: 'Catatan Admin',     minWidth: 24, maxWidth: 34, align: 'left',   wrapText: true },
    { key: 'period',   header: 'Periode',           minWidth: 13, maxWidth: 15, align: 'center', headerAlign: 'center' },
    { key: 'created',  header: 'Waktu Usulan',      minWidth: 18, maxWidth: 22, align: 'center', headerAlign: 'center' },
  ];

  const rows = requests.map((req, idx) => {
    const st = COLLAB_STATUS_META[req.status] || COLLAB_STATUS_META.pending;
    const formattedDate = safeFormatDate(req.created_at, { day: 'numeric', month: 'short', year: 'numeric' });
    const periodText = req.period_key || (req.created_at ? String(req.created_at).slice(0, 7) : '-');

    return {
      values: [
        idx + 1,
        req.requested_streamer_name || '-',
        req.requested_streamer_social || '-',
        st.label,
        req.message || '-',
        req.review_notes || '-',
        periodText,
        formattedDate,
      ],
      cellStyles: {
        3: { bg: st.excelBg, color: st.excelColor, bold: true },
      },
    };
  });

  const totalPendingOrShortlist = counts.pending + counts.approved;
  const kpis = [
    { label: 'TOTAL USULAN', value: requests.length.toLocaleString('id-ID'),  note: 'Total data sesuai filter aktif',          accent: 'FF06B6D4' },
    { label: 'USULAN BARU',  value: counts.pending.toLocaleString('id-ID'),   note: 'Menunggu peninjauan admin',              accent: 'FF0EA5E9' },
    { label: 'SHORTLIST',    value: counts.approved.toLocaleString('id-ID'),  note: `${totalPendingOrShortlist} aktif ditinjau`, accent: 'FF8B5CF6' },
    { label: 'DIJADWALKAN',  value: counts.scheduled.toLocaleString('id-ID'), note: `${counts.rejected} diarsipkan`,          accent: 'FF10B981' },
  ];

  const dateStamp = new Date().toISOString().slice(0, 10);

  await buildAndDownloadExecutiveReport({
    fileName: `laporan_collab_requests_${dateStamp}.xlsx`,
    sheetName: 'Laporan Collab Requests',
    title: 'LAPORAN USULAN KOLABORASI STREAMER',
    subtitle: 'X-VOCA STREAMING STUDIO • COMMUNITY COLLABORATION REPORT',
    metaText: `Dicetak: ${getNowWIBString()}   |   Filter: ${filterSummaryText}`,
    kpis,
    donutConfig,
    barConfig,
    columns,
    rows,
    totalRowValues: [
      '',
      'TOTAL KESELURUHAN',
      `${uniqueStreamerCount} Streamer Unik`,
      `${requests.length} Usulan`,
      `Baru: ${counts.pending}  |  Shortlist: ${counts.approved}  |  Jadwal: ${counts.scheduled}`,
      `Arsip: ${counts.rejected}`,
      '',
      '',
    ],
  });
}

/**
 * EKSPOR 2: LAPORAN REKAPITULASI VOTING GAME (.xlsx)
 */
export async function exportVotingResultsExcel({ games = [], periodKey, stats = {} }) {
  const {
    sortedGames,
    totalVotes,
    maxVotes,
    topGame,
    statusCounts,
    periodLabel,
    donutConfig,
    barConfig,
  } = summarizeVotingData({ games, periodKey, stats });

  const columns = [
    { key: 'rank',      header: 'Peringkat',        minWidth: 11, maxWidth: 13, align: 'center', headerAlign: 'center', bold: true },
    { key: 'title',     header: 'Judul Game',       minWidth: 26, maxWidth: 36, align: 'left',   bold: true, wrapText: true },
    { key: 'genre',     header: 'Kategori / Genre', minWidth: 18, maxWidth: 24, align: 'center', headerAlign: 'center', wrapText: true },
    { key: 'status',    header: 'Status',           minWidth: 20, maxWidth: 24, align: 'center', headerAlign: 'center' },
    { key: 'votes',     header: 'Jumlah Suara',     minWidth: 15, maxWidth: 18, align: 'right',  headerAlign: 'right', bold: true, numFmt: '#,##0' },
    { key: 'ratioMax',  header: 'Rasio (% Max)',    minWidth: 15, maxWidth: 18, align: 'right',  headerAlign: 'right' },
    { key: 'sharePct',  header: 'Porsi Total (%)',  minWidth: 16, maxWidth: 18, align: 'right',  headerAlign: 'right' },
    { key: 'submitter', header: 'Diusulkan Oleh',   minWidth: 22, maxWidth: 28, align: 'left',   wrapText: true },
  ];

  const rows = sortedGames.map((game, idx) => {
    const votes = game.vote_count || 0;
    const ratioMax = maxVotes > 0 ? `${Math.round((votes / maxVotes) * 100)}%` : '0%';
    const shareTotal = totalVotes > 0 ? `${Math.round((votes / totalVotes) * 100)}%` : '0%';
    const st = VOTING_STATUS_META[game.status] || VOTING_STATUS_META.requested;
    const submitter = game.isOfficial ? 'Creator (Admin)' : (game.addedBy || 'Viewer');

    return {
      values: [
        `#${idx + 1}`,
        game.title || '-',
        game.genre || game.category || '-',
        st.label,
        votes,
        ratioMax,
        shareTotal,
        submitter,
      ],
      cellStyles: {
        0: idx === 0 ? { bg: 'FFFEF3C7', color: 'FFB45309', bold: true } : null,
        3: { bg: st.excelBg, color: st.excelColor, bold: true },
      },
    };
  });

  const topTitle = topGame
    ? (topGame.title.length > 18 ? `${topGame.title.slice(0, 17)}...` : topGame.title)
    : '-';

  const kpis = [
    { label: 'TOTAL SUARA MASUK', value: totalVotes.toLocaleString('id-ID'),               note: 'Suara penonton terverifikasi',             accent: 'FF06B6D4' },
    { label: 'TOTAL USULAN GAME', value: `${sortedGames.length} Game`,                      note: `${statusCounts.requested} menunggu review`, accent: 'FF8B5CF6' },
    { label: 'PERINGKAT #1',      value: topTitle,                                          note: topGame ? `${(topGame.vote_count || 0).toLocaleString('id-ID')} suara` : 'Belum ada suara', accent: 'FFF59E0B' },
    { label: 'DITERIMA / MAIN',   value: `${statusCounts.accepted + statusCounts.playing}`, note: `${statusCounts.done} game selesai dimainkan`, accent: 'FF10B981' },
  ];

  await buildAndDownloadExecutiveReport({
    fileName: `laporan_voting_${periodKey || new Date().toISOString().slice(0, 7)}.xlsx`,
    sheetName: 'Rekapitulasi Voting',
    title: 'LAPORAN REKAPITULASI VOTING GAME',
    subtitle: 'X-VOCA STREAMING STUDIO • AUDIENCE GAME POLLING GOVERNANCE',
    metaText: `Dicetak: ${getNowWIBString()}   |   Periode: ${periodLabel} (${periodKey || '-'})`,
    kpis,
    donutConfig,
    barConfig,
    columns,
    rows,
    totalRowValues: [
      '',
      'TOTAL KESELURUHAN',
      `${sortedGames.length} Judul Game`,
      '',
      totalVotes,
      '',
      '100%',
      '',
    ],
  });
}

export default {
  exportCollabRequestsExcel,
  exportVotingResultsExcel,
};
