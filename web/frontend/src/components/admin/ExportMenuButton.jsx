/**
 * ============================================================================
 * FILE: web/frontend/src/components/admin/ExportMenuButton.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Komponen tombol dropdown "Ekspor Data" yang konsisten di seluruh halaman
 * moderasi Studio Kreator (Voting Moderation & Collab Requests).
 * Menyediakan dua opsi format laporan resmi:
 * 1. Unduh Laporan Excel (.xlsx) — Tabel rapi, kartu KPI & grafik analitik.
 * 2. Cetak Laporan PDF (.pdf) — Dokumen resmi siap cetak & presentasi.
 * ============================================================================
 */

import { useState, useEffect, useRef } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown, Loader2 } from 'lucide-react';

export function ExportMenuButton({
  onExportExcel,
  onExportPDF,
  isExporting = false,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (callback) => {
    setOpen(false);
    if (typeof callback === 'function') {
      callback();
    }
  };

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled || isExporting}
        className="h-10 flex items-center gap-2 px-3.5 text-xs font-semibold text-text-secondary bg-bg-surface border border-border-subtle rounded-xl hover:bg-bg-card-hover transition-colors disabled:opacity-50"
        title="Pilih format ekspor laporan (.xlsx atau .pdf)"
      >
        {isExporting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-purple" />
        ) : (
          <Download className="w-3.5 h-3.5 text-accent-purple" />
        )}
        <span>{isExporting ? 'Mengekspor...' : 'Ekspor Data'}</span>
        <ChevronDown className={`w-3 h-3 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 max-w-[calc(100vw-32px)] bg-bg-card border border-border-subtle rounded-xl shadow-xl z-30 py-1.5 animate-in fade-in zoom-in-95">
          <div className="px-3 py-1.5 border-b border-border-subtle">
            <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Format Laporan</p>
          </div>

          <button
            type="button"
            onClick={() => handleAction(onExportExcel)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text-primary hover:bg-bg-surface transition-colors text-left"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <p className="font-semibold">Unduh Laporan Excel (.xlsx)</p>
              <p className="text-[10px] text-text-muted">Tabel rapi, KPI &amp; grafik analitik</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleAction(onExportPDF)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text-primary hover:bg-bg-surface transition-colors text-left"
          >
            <FileText className="w-4 h-4 text-accent-purple shrink-0" />
            <div>
              <p className="font-semibold">Cetak Laporan PDF</p>
              <p className="text-[10px] text-text-muted">Rekap resmi siap cetak &amp; grafik</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

export default ExportMenuButton;
