/**
 * ============================================================================
 * FILE: web/frontend/src/utils/pdfExport.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Utility ekspor dokumen laporan resmi ke format PDF (A4) untuk X-VOCA:
 * 1. `downloadVotingPDF` — Rekapitulasi moderasi voting game bulanan.
 * 2. `downloadCollabPDF` — Rekapitulasi usulan kolaborasi streamer komunitas.
 * Dilengkapi header eksekutif, 3 kartu KPI, 2 grafik visual HiDPI (Donut & Bar),
 * tabel otomatis rapi dengan autoTable, dan penomoran halaman standar.
 * ============================================================================
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { safeFormatDate } from './dateUtils';
import { renderDonutChartBase64, renderHorizontalBarChartBase64 } from './chartCanvas';
import {
  COLLAB_STATUS_META,
  VOTING_STATUS_META,
  getNowWIBString,
  summarizeCollabData,
  summarizeVotingData,
} from './reportHelpers';

const PAGE_MARGIN = 14;

/**
 * Menjalankan plugin autoTable secara aman di berbagai bundler Vite/Rollup.
 */
const runAutoTable = (doc, options) => {
  if (typeof doc.autoTable === 'function') {
    return doc.autoTable(options);
  }
  if (typeof autoTable === 'function') {
    return autoTable(doc, options);
  }
  if (autoTable && typeof autoTable.default === 'function') {
    return autoTable.default(doc, options);
  }
  throw new Error('Plugin autoTable tidak dapat dimuat.');
};

/**
 * Merender header dokumen resmi seragam dan mengembalikan posisi Y berikutnya.
 */
function addExecutiveHeader(doc, { title, subtitle, rightLine1, rightLine2 }) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  let yPos = 15;

  // Garis aksen tema Midnight Indigo
  doc.setFillColor(30, 27, 46);
  doc.rect(PAGE_MARGIN, yPos, contentWidth, 3, 'F');
  yPos += 8.5;

  // Judul utama
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text(title, PAGE_MARGIN, yPos);

  yPos += 5.2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(subtitle, PAGE_MARGIN, yPos);

  // Metadata kanan
  doc.setFontSize(8.2);
  doc.setTextColor(71, 85, 105);
  if (rightLine1) {
    doc.text(rightLine1, pageWidth - PAGE_MARGIN, yPos - 5.2, { align: 'right' });
  }
  if (rightLine2) {
    doc.text(rightLine2, pageWidth - PAGE_MARGIN, yPos, { align: 'right' });
  }

  yPos += 5.5;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(PAGE_MARGIN, yPos, pageWidth - PAGE_MARGIN, yPos);

  return yPos + 5.5;
}

/**
 * Merender 3 kartu KPI ringkasan berdampingan dan mengembalikan posisi Y berikutnya.
 */
function addKpiCardRow(doc, startY, cards = []) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  const cardWidth = (contentWidth - 8) / 3;
  const cardHeight = 20;

  cards.slice(0, 3).forEach((card, idx) => {
    const cx = PAGE_MARGIN + idx * (cardWidth + 4);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cx, startY, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(100, 116, 139);
    doc.text(card.label || '', cx + 3.5, startY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(card.smallValue ? 9.5 : 12);
    doc.setTextColor(15, 23, 42);
    doc.text(String(card.value ?? '-'), cx + 3.5, startY + 12.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text(String(card.note ?? ''), cx + 3.5, startY + 17.5);
  });

  return startY + cardHeight + 6;
}

/**
 * Merender 2 grafik visual berdampingan (Donut + Horizontal Bar) langsung ke PDF.
 */
function addVisualChartRow(doc, startY, { donutConfig, barConfig }) {
  const donutB64 = donutConfig ? renderDonutChartBase64(donutConfig) : null;
  const barB64 = barConfig ? renderHorizontalBarChartBase64(barConfig) : null;

  if (!donutB64 && !barB64) {
    return startY;
  }

  let yPos = startY;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Ringkasan Visual & Grafik Analitik', PAGE_MARGIN, yPos);
  yPos += 3.5;

  // Lebar area konten A4 = 182mm -> 86mm (Donut) + 4mm gap + 92mm (Bar) = 182mm
  const donutW = 86;
  const donutH = 48;
  const barW = 92;
  const barH = 46;

  if (donutB64) {
    doc.addImage(donutB64, 'PNG', PAGE_MARGIN, yPos, donutW, donutH);
  }
  if (barB64) {
    doc.addImage(barB64, 'PNG', PAGE_MARGIN + donutW + 4, yPos + 1, barW, barH);
  }

  return yPos + donutH + 6.5;
}

/**
 * Menambahkan garis footer dan nomor halaman ke seluruh halaman dokumen PDF.
 */
function addStandardFooter(doc, footerText) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(PAGE_MARGIN, pageHeight - 12, pageWidth - PAGE_MARGIN, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(footerText, PAGE_MARGIN, pageHeight - 7);
    doc.text(`Halaman ${i} dari ${pageCount}`, pageWidth - PAGE_MARGIN, pageHeight - 7, { align: 'right' });
  }
}

/**
 * ============================================================================
 * 1. LAPORAN PDF VOTING GAME (`generateVotingPDF` / `downloadVotingPDF`)
 * ============================================================================
 */
export const generateVotingPDF = async ({ games = [], periodKey, stats = {}, onProgress }) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  if (onProgress) onProgress(15);

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

  let yPos = addExecutiveHeader(doc, {
    title: 'LAPORAN MODERASI VOTING GAME',
    subtitle: 'X-VOCA STREAMING & AUDIENCE GOVERNANCE',
    rightLine1: `Periode: ${periodLabel} (${periodKey || '-'})`,
    rightLine2: `Dicetak: ${getNowWIBString()}`,
  });

  if (onProgress) onProgress(35);

  const topTitle = topGame
    ? (topGame.title.length > 20 ? `${topGame.title.slice(0, 19)}...` : topGame.title)
    : '-';
  const topVotesCount = topGame ? (topGame.vote_count || 0) : 0;
  const topPercent = totalVotes > 0 ? Math.round((topVotesCount / totalVotes) * 100) : 0;

  yPos = addKpiCardRow(doc, yPos, [
    {
      label: 'TOTAL SUARA MASUK',
      value: totalVotes.toLocaleString('id-ID'),
      note: 'Suara penonton terverifikasi',
    },
    {
      label: 'GAME PERINGKAT #1',
      value: topTitle,
      smallValue: true,
      note: topGame ? `${topVotesCount.toLocaleString('id-ID')} suara (${topPercent}% total)` : 'Belum ada suara',
    },
    {
      label: 'STATUS USULAN GAME',
      value: `${sortedGames.length} Total Game`,
      smallValue: true,
      note: `${statusCounts.accepted} Diterima | ${statusCounts.playing} Main | ${statusCounts.done} Selesai`,
    },
  ]);

  yPos = addVisualChartRow(doc, yPos, { donutConfig, barConfig });

  if (onProgress) onProgress(65);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Daftar Hasil Voting Game', PAGE_MARGIN, yPos);
  yPos += 3.5;

  const tableData = sortedGames.map((game, index) => {
    const votes = game.vote_count || 0;
    const maxV = maxVotes || (sortedGames[0]?.vote_count || 1);
    const pct = maxV > 0 ? `${Math.round((votes / maxV) * 100)}%` : '0%';
    const statusLabel = VOTING_STATUS_META[game.status]?.label || game.status || '-';

    return [
      String(index + 1),
      game.title || '-',
      game.genre || game.category || '-',
      statusLabel,
      votes.toLocaleString('id-ID'),
      pct,
    ];
  });

  runAutoTable(doc, {
    startY: yPos,
    head: [['#', 'Judul Game', 'Kategori / Genre', 'Status', 'Jumlah Suara', 'Rasio Suara']],
    body: tableData,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: 18 },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.6,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [30, 27, 46],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 62 },
      2: { cellWidth: 36 },
      3: { cellWidth: 34, halign: 'center' },
      4: { cellWidth: 20, halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: 20, halign: 'right' },
    },
  });

  if (onProgress) onProgress(90);

  addStandardFooter(doc, 'X-VOCA Community Platform - Laporan resmi moderasi voting game.');

  if (onProgress) onProgress(100);
  return doc;
};

export const downloadVotingPDF = async (options) => {
  const doc = await generateVotingPDF(options);
  const periodKey = options.periodKey || new Date().toISOString().slice(0, 7);
  doc.save(`laporan_voting_${periodKey}.pdf`);
};

/**
 * ============================================================================
 * 2. LAPORAN PDF COLLAB REQUESTS (`generateCollabPDF` / `downloadCollabPDF`)
 * ============================================================================
 */
export const generateCollabPDF = async ({ requests = [], filterInfo = {}, onProgress }) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  if (onProgress) onProgress(15);

  const {
    counts,
    uniqueStreamerCount,
    filterSummaryText,
    donutConfig,
    barConfig,
  } = summarizeCollabData({ requests, filterInfo });

  const headerFilterLabel = filterSummaryText.length > 52
    ? `${filterSummaryText.slice(0, 51)}...`
    : filterSummaryText;

  let yPos = addExecutiveHeader(doc, {
    title: 'LAPORAN USULAN KOLABORASI STREAMER',
    subtitle: 'X-VOCA STREAMING STUDIO • COMMUNITY COLLABORATION REPORT',
    rightLine1: headerFilterLabel,
    rightLine2: `Dicetak: ${getNowWIBString()}`,
  });

  if (onProgress) onProgress(35);

  yPos = addKpiCardRow(doc, yPos, [
    {
      label: 'TOTAL USULAN',
      value: `${requests.length.toLocaleString('id-ID')} Usulan`,
      note: `${uniqueStreamerCount} streamer unik terdata`,
    },
    {
      label: 'BARU & SHORTLIST',
      value: `${(counts.pending + counts.approved).toLocaleString('id-ID')} Aktif`,
      note: `${counts.pending} Baru | ${counts.approved} Shortlist`,
    },
    {
      label: 'DIJADWALKAN & ARSIP',
      value: `${counts.scheduled.toLocaleString('id-ID')} Jadwal`,
      note: `${counts.rejected} usulan diarsipkan`,
    },
  ]);

  yPos = addVisualChartRow(doc, yPos, { donutConfig, barConfig });

  if (onProgress) onProgress(65);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Daftar Rincian Usulan Kolaborasi (${requests.length} Data)`, PAGE_MARGIN, yPos);
  yPos += 3.5;

  const tableData = requests.map((req, index) => {
    const statusLabel = COLLAB_STATUS_META[req.status]?.label || req.status || '-';
    const dateStr = safeFormatDate(req.created_at, { day: 'numeric', month: 'short', year: 'numeric' });
    return [
      String(index + 1),
      req.requested_streamer_name || '-',
      req.requested_streamer_social || '-',
      statusLabel,
      req.message || '-',
      req.review_notes || '-',
      dateStr,
    ];
  });

  runAutoTable(doc, {
    startY: yPos,
    head: [['No', 'Nama Streamer', 'Saluran / Sosmed', 'Status', 'Pesan Penonton', 'Catatan Admin', 'Tanggal']],
    body: tableData,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: 18 },
    styles: {
      font: 'helvetica',
      fontSize: 7.8,
      cellPadding: 2.5,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
      textColor: [30, 41, 59],
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [30, 27, 46],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.8,
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 9,  halign: 'center' },
      1: { cellWidth: 28, fontStyle: 'bold' },
      2: { cellWidth: 30 },
      3: { cellWidth: 23, halign: 'center' },
      4: { cellWidth: 40 },
      5: { cellWidth: 30 },
      6: { cellWidth: 22, halign: 'center' },
    },
  });

  if (onProgress) onProgress(90);

  addStandardFooter(doc, 'X-VOCA Community Platform - Laporan resmi usulan kolaborasi streamer.');

  if (onProgress) onProgress(100);
  return doc;
};

export const downloadCollabPDF = async (options) => {
  const doc = await generateCollabPDF(options);
  const dateStamp = new Date().toISOString().slice(0, 10);
  doc.save(`laporan_collab_requests_${dateStamp}.pdf`);
};

export default {
  generateVotingPDF,
  downloadVotingPDF,
  generateCollabPDF,
  downloadCollabPDF,
};
