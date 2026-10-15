/**
 * PDF Export Utility for X-VOCA Voting Results
 *
 * Creates a formatted PDF report with:
 * - Header with title and period info
 * - Summary statistics
 * - Bar chart of game votes
 * - Detailed game table
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Helper to format date
const formatDate = () => {
  const options = { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date().toLocaleDateString('id-ID', options);
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
export const generateVotingPDF = async ({ games, periodKey, stats, onProgress }) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = 20;

  // Report title
  doc.setFontSize(20);
  doc.setTextColor(126, 224, 210); // accent-cyan
  doc.text('X-VOCA Voting Report', margin, yPos);
  yPos += 10;

  // Period info
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Periode: ${periodKey || 'Unknown'}`, margin, yPos);
  yPos += 6;
  doc.text(`Generated: ${formatDate()}`, margin, yPos);
  yPos += 15;

  // Progress callback
  if (onProgress) onProgress(20);

  // Summary Statistics Box
  doc.setFillColor(245, 245, 250);
  doc.rect(margin, yPos, pageWidth - (margin * 2), 25, 'F');

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);

  const totalVotes = stats?.totalVotes || games?.reduce((sum, g) => sum + (g.vote_count || 0), 0) || 0;
  const totalGames = games?.length || 0;

  const summaryCol1 = margin + 5;
  const summaryCol2 = margin + 55;
  const summaryCol3 = margin + 105;

  doc.text('Total Votes:', summaryCol1, yPos + 8);
  doc.setFontSize(14);
  doc.setTextColor(126, 224, 210);
  doc.text(String(totalVotes), summaryCol1, yPos + 18);

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text('Total Games:', summaryCol2, yPos + 8);
  doc.setFontSize(14);
  doc.setTextColor(192, 132, 252);
  doc.text(String(totalGames), summaryCol2, yPos + 18);

  const statusCounts = games?.reduce((acc, g) => {
    const status = g.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {}) || {};

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text('Active (Requested + Accepted):', summaryCol3, yPos + 8);
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  const activeCount = (statusCounts.requested || 0) + (statusCounts.accepted || 0);
  doc.text(String(activeCount), summaryCol3, yPos + 18);

  yPos += 35;

  if (onProgress) onProgress(40);

  // Bar Chart (simplified visual representation)
  if (games && games.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Vote Distribution', margin, yPos);
    yPos += 8;

    const maxVotes = Math.max(...games.map(g => g.vote_count || 0), 1);
    const chartHeight = 50;
    const barWidth = (pageWidth - (margin * 2) - 10) / Math.min(games.length, 10);
    const displayGames = games.slice(0, 10).sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));

    displayGames.forEach((game, index) => {
      const x = margin + (index * barWidth);
      const barHeight = ((game.vote_count || 0) / maxVotes) * chartHeight;
      const barY = yPos + chartHeight - barHeight;

      // Bar color gradient effect
      doc.setFillColor(126, 224, 210);
      if (index % 2 === 0) {
        doc.setFillColor(192, 132, 252);
      }

      doc.rect(x, barY, barWidth - 2, barHeight, 'F');

      // Vote count on top
      doc.setFontSize(7);
      doc.setTextColor(60, 60, 60);
      doc.text(String(game.vote_count || 0), x + (barWidth / 2) - 3, barY - 2);
    });

    yPos += chartHeight + 15;
  }

  if (onProgress) onProgress(60);

  // Game Table
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('Detailed Results', margin, yPos);
  yPos += 5;

  const tableData = games?.map((game, index) => [
    String(index + 1),
    game.title || 'Unknown',
    game.genre || game.category || '-',
    String(game.vote_count || 0),
    stats?.maxVotes > 0 ? `${Math.round(((game.vote_count || 0) / stats.maxVotes) * 100)}%` : '0%',
    game.status?.toUpperCase() || 'N/A',
  ]) || [];

  doc.autoTable({
    startY: yPos,
    head: [['#', 'Game Title', 'Genre', 'Votes', '%', 'Status']],
    body: tableData,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [35, 31, 66],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 248, 252],
    },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 60 },
      2: { cellWidth: 35 },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 25 },
    },
  });

  if (onProgress) onProgress(90);

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `X-VOCA Voting Report - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  if (onProgress) onProgress(100);

  return doc;
};

/**
 * Download PDF with generated filename
 *
 * @param {Object} options - Same as generateVotingPDF options
 */
export const downloadVotingPDF = async (options) => {
  const doc = await generateVotingPDF(options);
  const periodKey = options.periodKey || new Date().toISOString().slice(0, 7);
  doc.save(`xvoca-voting-report-${periodKey}.pdf`);
};

export default {
  generateVotingPDF,
  downloadVotingPDF,
};
