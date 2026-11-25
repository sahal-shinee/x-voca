/**
 * ============================================================================
 * FILE: web/frontend/src/utils/chartCanvas.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Generator grafik visual (Donut Chart & Horizontal Bar Chart) berbasis HTML5 Canvas
 * resolusi tinggi (2x HiDPI) untuk disematkan ke dalam laporan Excel (.xlsx).
 * Tidak bergantung pada pustaka pihak ketiga eksternal agar ringan & bebas error.
 * ============================================================================
 */

const FONT_FAMILY = 'Inter, "Segoe UI", Roboto, Arial, sans-serif';

/**
 * Menggambar kotak dengan sudut membulat (cross-browser safe, tanpa roundRect polyfill).
 */
function fillRoundedRect(ctx, x, y, w, h, r, fillStyle, strokeStyle = null, lineWidth = 1) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();

  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  if (strokeStyle) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
  }
}

/**
 * Memotong teks agar tidak melewati batas lebar piksel tertentu.
 */
function truncateText(ctx, text, maxWidth) {
  const str = String(text ?? '-');
  if (ctx.measureText(str).width <= maxWidth) return str;
  let clipped = str;
  while (clipped.length > 1 && ctx.measureText(`${clipped}...`).width > maxWidth) {
    clipped = clipped.slice(0, -1);
  }
  return `${clipped}...`;
}

/**
 * Membuat kanvas HiDPI 2x agar grafik terlihat tajam di Excel & WPS Office.
 */
function createHiDPICanvas(width, height) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  const dpr = 2;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.scale(dpr, dpr);
  return { canvas, ctx, width, height };
}

/**
 * Menggambar header kartu grafik yang seragam.
 */
function drawCardFrame(ctx, width, height, title, subtitle, accentColor = '#06B6D4') {
  // Background luar kartu
  fillRoundedRect(ctx, 1, 1, width - 2, height - 2, 12, '#FFFFFF', '#CBD5E1', 1.5);

  // Strip aksen tipis di bagian atas kartu
  fillRoundedRect(ctx, 1, 1, width - 2, 6, 4, accentColor);

  // Judul & subjudul
  ctx.fillStyle = '#0F172A';
  ctx.font = `700 14px ${FONT_FAMILY}`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillText(title, 20, 18);

  if (subtitle) {
    ctx.fillStyle = '#64748B';
    ctx.font = `400 11px ${FONT_FAMILY}`;
    ctx.fillText(subtitle, 20, 38);
  }

  // Garis pemisah tipis
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, 58);
  ctx.lineTo(width - 20, 58);
  ctx.stroke();
}

/**
 * Menghasilkan gambar PNG base64 untuk Donut Chart + Legenda Lengkap.
 * @param {Object} params
 * @param {string} params.title
 * @param {string} [params.subtitle]
 * @param {Array<{label: string, value: number, color: string}>} params.segments
 * @param {string} [params.centerLabel]
 * @param {string} [params.accentColor]
 * @returns {string|null} base64 PNG tanpa prefix data URL
 */
export function renderDonutChartBase64({
  title,
  subtitle = '',
  segments = [],
  centerLabel = 'TOTAL',
  accentColor = '#06B6D4',
}) {
  const setup = createHiDPICanvas(520, 290);
  if (!setup) return null;
  const { canvas, ctx, width, height } = setup;

  drawCardFrame(ctx, width, height, title, subtitle, accentColor);

  const total = segments.reduce((sum, seg) => sum + (Number(seg.value) || 0), 0);
  const cx = 128;
  const cy = 172;
  const outerR = 78;
  const innerR = 48;

  if (total <= 0) {
    // Empty state ring
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2, true);
    ctx.fillStyle = '#E2E8F0';
    ctx.fill();
  } else {
    let startAngle = -Math.PI / 2;
    const positiveSegments = segments.filter((s) => (Number(s.value) || 0) > 0);
    const hasMultiple = positiveSegments.length > 1;

    positiveSegments.forEach((seg) => {
      const val = Number(seg.value) || 0;
      const sliceAngle = (val / total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, endAngle);
      ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = seg.color || '#6366F1';
      ctx.fill();

      if (hasMultiple) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      startAngle = endAngle;
    });
  }

  // Teks di tengah Donut
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#64748B';
  ctx.font = `600 10px ${FONT_FAMILY}`;
  ctx.fillText(centerLabel.toUpperCase(), cx, cy - 12);

  ctx.fillStyle = '#0F172A';
  ctx.font = `700 22px ${FONT_FAMILY}`;
  ctx.fillText(total.toLocaleString('id-ID'), cx, cy + 10);

  // Legenda kanan
  const legendX = 240;
  let legendY = 82;
  const rowGap = 46;
  const displaySegments = segments.slice(0, 5);

  displaySegments.forEach((seg) => {
    const val = Number(seg.value) || 0;
    const pct = total > 0 ? Math.round((val / total) * 100) : 0;

    // Kotak latar legenda halus
    fillRoundedRect(ctx, legendX, legendY, 258, 36, 8, '#F8FAFC', '#E2E8F0', 1);

    // Indikator titik warna
    ctx.beginPath();
    ctx.arc(legendX + 16, legendY + 18, 6, 0, Math.PI * 2);
    ctx.fillStyle = seg.color || '#6366F1';
    ctx.fill();

    // Label status
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1E293B';
    ctx.font = `600 12px ${FONT_FAMILY}`;
    ctx.fillText(truncateText(ctx, seg.label, 128), legendX + 30, legendY + 18);

    // Nilai & persentase di sebelah kanan
    ctx.textAlign = 'right';
    ctx.fillStyle = '#0F172A';
    ctx.font = `700 12px ${FONT_FAMILY}`;
    ctx.fillText(`${val.toLocaleString('id-ID')} (${pct}%)`, legendX + 246, legendY + 18);

    legendY += rowGap;
  });

  try {
    const dataUrl = canvas.toDataURL('image/png');
    return dataUrl.split(',')[1] || null;
  } catch {
    return null;
  }
}

/**
 * Menghasilkan gambar PNG base64 untuk Horizontal Bar Chart (Top Items).
 * @param {Object} params
 * @param {string} params.title
 * @param {string} [params.subtitle]
 * @param {Array<{label: string, value: number, color?: string}>} params.items
 * @param {string} [params.unitLabel]
 * @param {string} [params.accentColor]
 * @param {string} [params.emptyText]
 * @returns {string|null} base64 PNG tanpa prefix data URL
 */
export function renderHorizontalBarChartBase64({
  title,
  subtitle = '',
  items = [],
  unitLabel = '',
  accentColor = '#8B5CF6',
  emptyText = 'Belum ada data untuk ditampilkan',
}) {
  const setup = createHiDPICanvas(580, 290);
  if (!setup) return null;
  const { canvas, ctx, width, height } = setup;

  drawCardFrame(ctx, width, height, title, subtitle, accentColor);

  const visibleItems = items.slice(0, 6);
  if (visibleItems.length === 0) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#94A3B8';
    ctx.font = `500 13px ${FONT_FAMILY}`;
    ctx.fillText(emptyText, width / 2, height / 2 + 20);
    try {
      return canvas.toDataURL('image/png').split(',')[1] || null;
    } catch {
      return null;
    }
  }

  const maxVal = Math.max(...visibleItems.map((it) => Number(it.value) || 0), 1);
  const sumVal = visibleItems.reduce((sum, it) => sum + (Number(it.value) || 0), 0);

  const labelColWidth = 148;
  const chartLeft = 20 + labelColWidth + 10;
  const valueColWidth = 92;
  const barMaxWidth = width - chartLeft - valueColWidth - 20;

  const startY = 74;
  const availableH = height - startY - 16;
  const stepH = Math.min(34, Math.floor(availableH / visibleItems.length));
  const barH = Math.min(18, stepH - 12);

  // Garis grid vertikal halus (25%, 50%, 75%, 100%)
  ctx.strokeStyle = '#F1F5F9';
  ctx.lineWidth = 1;
  [0.25, 0.5, 0.75, 1].forEach((ratio) => {
    const gx = chartLeft + barMaxWidth * ratio;
    ctx.beginPath();
    ctx.moveTo(gx, startY - 4);
    ctx.lineTo(gx, startY + visibleItems.length * stepH - 4);
    ctx.stroke();
  });

  const barPalette = ['#06B6D4', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899'];

  visibleItems.forEach((item, idx) => {
    const rowY = startY + idx * stepH;
    const barY = rowY + (stepH - barH) / 2;
    const val = Number(item.value) || 0;
    const ratio = maxVal > 0 ? val / maxVal : 0;
    const barW = val > 0 ? Math.max(8, barMaxWidth * ratio) : 0;
    const barColor = item.color || barPalette[idx % barPalette.length];

    // Label item di kiri
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = idx === 0 ? '#0F172A' : '#334155';
    ctx.font = `${idx === 0 ? 700 : 600} 11.5px ${FONT_FAMILY}`;
    ctx.fillText(truncateText(ctx, item.label, labelColWidth - 4), 20 + labelColWidth, barY + barH / 2);

    // Track latar belakang batang
    fillRoundedRect(ctx, chartLeft, barY, barMaxWidth, barH, barH / 2, '#F1F5F9');

    // Batang nilai berwarna
    if (barW > 0) {
      fillRoundedRect(ctx, chartLeft, barY, barW, barH, barH / 2, barColor);
    }

    // Nilai angka & persentase di kanan batang
    const pct = sumVal > 0 ? Math.round((val / sumVal) * 100) : 0;
    const valStr = `${val.toLocaleString('id-ID')}${unitLabel ? ` ${unitLabel}` : ''} (${pct}%)`;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0F172A';
    ctx.font = `700 11px ${FONT_FAMILY}`;
    ctx.fillText(valStr, chartLeft + barMaxWidth + 10, barY + barH / 2);
  });

  try {
    const dataUrl = canvas.toDataURL('image/png');
    return dataUrl.split(',')[1] || null;
  } catch {
    return null;
  }
}

export default {
  renderDonutChartBase64,
  renderHorizontalBarChartBase64,
};
