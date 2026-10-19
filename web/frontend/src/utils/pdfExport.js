/**
 * PDF Export Utility for X-VOCA Voting Results
 *
 * Creates a clean, professional, highly readable PDF report:
 * - Executive header with period & timestamp
 * - 3 KPI summary metrics cards
 * - High-contrast, cleanly styled data table with Indonesian labels
 * - Standardized footer with page numbering
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to run autoTable safely across different bundlers
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

// Format period key like "2026-10" to Indonesian string "Oktober 2026"
const formatPeriodString = (periodKey) => {
  if (!periodKey) return '-';
  try {
    const [year, month] = periodKey.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  } catch {
    return periodKey;
  }
};

// Format timestamp in WIB
const formatDateTimeWIB = () => {
  return new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }) + ' WIB';
};

// Map database status to clean Indonesian label
const STATUS_LABELS = {
  requested: 'Menunggu Review',
  accepted: 'Diterima',
  playing: 'Sedang Dimainkan',
  done: 'Selesai',
};

/**
 * Generate PDF report for voting results
 *
 * @param {Object} options
 * @param {Array} options.games - Array of game objects
 * @param {string} options.periodKey - Period key (e.g., '2026-10')
 * @param {Object} options.stats - Summary statistics
 * @param {Function} options.onProgress - Progress callback (0-100)
 */
export const generateVotingPDF = async ({ games = [], periodKey, stats = {}, onProgress }) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2);

  let yPos = 16;

  if (onProgress) onProgress(15);

  // ── 1. Top Decorative Bar ──────────────────────────────────────────
  doc.setFillColor(30, 27, 46); // deep dark slate / indigo
  doc.rect(margin, yPos, contentWidth, 3, 'F');
  yPos += 9;

  // ── 2. Header Title & Subtitle ─────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('LAPORAN MODERASI VOTING GAME', margin, yPos);

  yPos += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('X-VOCA STREAMING & AUDIENCE GOVERNANCE', margin, yPos);

  // Period & Generation Date on the right
  const periodLabel = formatPeriodString(periodKey);
  const nowStr = formatDateTimeWIB();

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Periode: ${periodLabel} (${periodKey || '-'})`, pageWidth - margin, yPos - 5.5, { align: 'right' });
  doc.text(`Dicetak: ${nowStr}`, pageWidth - margin, yPos, { align: 'right' });

  yPos += 8;

  // Horizontal divider
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 6;

  if (onProgress) onProgress(35);

  // ── 3. Summary KPI Cards (3 Columns) ──────────────────────────────
  const totalVotes = stats?.totalVotes || games.reduce((sum, g) => sum + (g.vote_count || 0), 0) || 0;
  const totalGames = games.length;
  const sortedGames = [...games].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
  const topGame = sortedGames[0] || null;

  const statusCounts = games.reduce((acc, g) => {
    const s = g.status || 'requested';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const cardWidth = (contentWidth - 8) / 3;
  const cardHeight = 22;

  // Card 1: Total Votes
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, yPos, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL SUARA MASUK', margin + 4, yPos + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(totalVotes.toLocaleString('id-ID'), margin + 4, yPos + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Suara penonton terverifikasi', margin + 4, yPos + 19);

  // Card 2: Top Voted Game
  const card2X = margin + cardWidth + 4;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(card2X, yPos, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('GAME PERINGKAT #1', card2X + 4, yPos + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  const topTitle = topGame ? (topGame.title.length > 20 ? topGame.title.slice(0, 19) + '...' : topGame.title) : '-';
  doc.text(topTitle, card2X + 4, yPos + 13.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const topVotesCount = topGame ? (topGame.vote_count || 0) : 0;
  const topPercent = totalVotes > 0 ? Math.round((topVotesCount / totalVotes) * 100) : 0;
  doc.text(topGame ? `${topVotesCount.toLocaleString('id-ID')} suara (${topPercent}% dari total)` : 'Belum ada suara', card2X + 4, yPos + 19);

  // Card 3: Status Distribution
  const card3X = card2X + cardWidth + 4;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(card3X, yPos, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('STATUS USULAN GAME', card3X + 4, yPos + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`${totalGames} Total Game`, card3X + 4, yPos + 13.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`${statusCounts.accepted || 0} Diterima | ${statusCounts.playing || 0} Main | ${statusCounts.done || 0} Selesai`, card3X + 4, yPos + 19);

  yPos += cardHeight + 8;

  if (onProgress) onProgress(60);

  // ── 4. Detailed Results Table ──────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Daftar Hasil Voting Game', margin, yPos);
  yPos += 3.5;

  const tableData = sortedGames.map((game, index) => {
    const votes = game.vote_count || 0;
    const maxV = stats?.maxVotes || (sortedGames[0]?.vote_count || 1);
    const pct = maxV > 0 ? `${Math.round((votes / maxV) * 100)}%` : '0%';
    const statusLabel = STATUS_LABELS[game.status] || game.status || '-';

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
    margin: { left: margin, right: margin, bottom: 18 },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.8,
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

  // ── 5. Page Numbering & Footer ─────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Footer divider line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('X-VOCA Community Platform - Laporan resmi moderasi voting game.', margin, pageHeight - 7);
    doc.text(`Halaman ${i} dari ${pageCount}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  }

  if (onProgress) onProgress(100);

  return doc;
};

/**
 * Download PDF with formatted filename
 *
 * @param {Object} options - Same as generateVotingPDF options
 */
export const downloadVotingPDF = async (options) => {
  const doc = await generateVotingPDF(options);
  const periodKey = options.periodKey || new Date().toISOString().slice(0, 7);
  doc.save(`laporan_voting_${periodKey}.pdf`);
};

export default {
  generateVotingPDF,
  downloadVotingPDF,
};
