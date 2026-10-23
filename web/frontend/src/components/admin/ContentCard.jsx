import { useState } from 'react';
import {
  Play,
  ExternalLink,
  Edit3,
  Eye,
  EyeOff,
  Star,
  Trash2,
  Tv,
  Layers,
  Clock
} from 'lucide-react';

/**
 * ContentCard - Card komponen untuk grid konten di ContentManagementPage
 * Modern Studio standard, clean UI, standard Lucide icons & reliable thumbnail rendering
 */
function ContentCard({
  content,
  onEdit,
  onToggleVisibility,
  onToggleFeatured,
  onDelete,
}) {
  const [imageError, setImageError] = useState(false);

  if (!content) return null;

  // Resolve thumbnail from various possible field aliases
  const thumbnailSrc = content.thumbnail_url || content.thumbnailUrl || content.thumbnail || null;
  const isFeatured = Boolean(content.is_featured);
  const isVisible = content.is_visible !== false;
  const sortOrder = content.sort_order ?? content.sortOrder ?? 1;
  const categoryLabel = content.game_tag || content.category || 'LAINNYA';
  const isPlaylist = content.content_type === 'playlist' || (content.video_count && content.video_count > 1);

  // Status Badge Configuration
  const renderStatusBadge = () => {
    if (isFeatured) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full border bg-accent-gold/20 text-accent-gold border-accent-gold/40 shadow-sm backdrop-blur-md">
          <Star className="w-3 h-3 fill-accent-gold flex-shrink-0" />
          <span>Sorotan</span>
        </span>
      );
    }
    if (!isVisible) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase rounded-full border bg-status-live/20 text-status-live border-status-live/40 shadow-sm backdrop-blur-md">
          <EyeOff className="w-3 h-3 flex-shrink-0" />
          <span>Draft / Hidden</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase rounded-full border bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm backdrop-blur-md">
        <Eye className="w-3 h-3 flex-shrink-0" />
        <span>Publik</span>
      </span>
    );
  };

  return (
    <div
      className={`
        bg-bg-card border rounded-2xl overflow-hidden
        transition-all duration-200 group flex flex-col justify-between shadow-sm
        hover:shadow-md hover:bg-bg-card-hover
        ${isFeatured ? 'border-accent-gold/50 ring-1 ring-accent-gold/20' : 'border-border-subtle hover:border-border-active'}
      `}
    >
      <div>
        {/* ── THUMBNAIL AREA ─────────────────────────────────────────── */}
        <div className="relative aspect-video bg-bg-surface overflow-hidden border-b border-border-subtle">
          {thumbnailSrc && !imageError ? (
            <img
              src={thumbnailSrc}
              alt={content.title || 'Thumbnail'}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-surface text-text-muted gap-2">
              <Tv className="w-10 h-10 opacity-30" />
              <span className="text-[11px] font-mono opacity-60">Tidak ada thumbnail</span>
            </div>
          )}

          {/* Top-left: Status badge */}
          <div className="absolute top-3 left-3">
            {renderStatusBadge()}
          </div>

          {/* Top-right: Type / Count badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1">
            {isPlaylist ? (
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-bg-base/90 text-accent-purple rounded-full border border-accent-purple/30 backdrop-blur-md flex items-center gap-1 shadow-sm">
                <Layers className="w-3 h-3" />
                <span>{content.video_count || 1} Video</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-semibold bg-bg-base/90 text-text-secondary rounded-full border border-border-subtle backdrop-blur-md shadow-sm">
                Single Video
              </span>
            )}
          </div>

          {/* Hover Play Button Overlay */}
          {content.youtube_url && (
            <a
              href={content.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-bg-base/40 backdrop-blur-[2px]"
              title="Buka di YouTube"
            >
              <div className="w-12 h-12 rounded-full bg-accent-cyan text-bg-base flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <Play className="w-5 h-5 ml-0.5 fill-current" />
              </div>
            </a>
          )}
        </div>

        {/* ── CONTENT INFO ────────────────────────────────────────────── */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* Category & Sort Order */}
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="px-2 py-0.5 bg-bg-surface border border-border-subtle text-accent-cyan rounded-md font-semibold uppercase tracking-wider">
              {categoryLabel}
            </span>
            <span className="text-text-muted">
              Urutan: <strong className="text-text-primary">#{sortOrder}</strong>
            </span>
          </div>

          {/* Title */}
          <h3
            className="text-sm sm:text-base font-bold text-text-primary line-clamp-2 leading-snug"
            title={content.title}
          >
            {content.title || 'Tanpa Judul'}
          </h3>

          {/* Metadata info: Total Duration / Video Count */}
          {(content.total_duration || (isPlaylist && content.video_count)) && (
            <div className="flex items-center gap-3 text-xs text-text-muted font-mono pt-0.5">
              {content.total_duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-text-muted" />
                  <span>{content.total_duration}</span>
                </span>
              )}
              {isPlaylist && content.video_count && (
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-text-muted" />
                  <span>{content.video_count} video dalam seri</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── ACTION FOOTER ───────────────────────────────────────────── */}
      <div className="px-4 sm:px-5 py-3 border-t border-border-subtle bg-bg-surface/30 flex items-center justify-between gap-2">
        {/* Left: YouTube Link */}
        {content.youtube_url ? (
          <a
            href={content.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-text-muted hover:text-accent-cyan transition-colors flex items-center gap-1 font-mono truncate max-w-[130px]"
            title="Buka link YouTube"
          >
            <span>YouTube</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        ) : (
          <span className="text-xs text-text-muted font-mono">-</span>
        )}

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Toggle Visibility */}
          <button
            type="button"
            onClick={() => onToggleVisibility?.(content)}
            className={`
              p-2 rounded-xl transition-colors border text-xs
              ${
                isVisible
                  ? 'text-status-done hover:bg-status-done/15 border-status-done/30 bg-status-done/5'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-surface border-border-subtle'
              }
            `}
            title={isVisible ? 'Klik untuk Sembunyikan (Jadikan Draft)' : 'Klik untuk Publikasikan'}
            aria-label="Ubah Visibilitas"
          >
            {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          {/* Toggle Featured */}
          <button
            type="button"
            onClick={() => onToggleFeatured?.(content)}
            className={`
              p-2 rounded-xl transition-colors border text-xs
              ${
                isFeatured
                  ? 'text-accent-gold bg-accent-gold/15 border-accent-gold/40'
                  : 'text-text-muted hover:text-accent-gold hover:bg-bg-surface border-border-subtle'
              }
            `}
            title={isFeatured ? 'Copot dari Sorotan Utama' : 'Jadikan Sorotan Utama (Featured)'}
            aria-label="Ubah Status Sorotan"
          >
            <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-accent-gold' : ''}`} />
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={() => onEdit?.(content)}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-surface rounded-xl border border-border-subtle transition-colors"
            title="Edit Detail Konten"
            aria-label="Edit Konten"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => onDelete?.(content)}
            className="p-2 text-text-muted hover:text-status-live hover:bg-status-live/10 rounded-xl border border-border-subtle hover:border-status-live/30 transition-colors"
            title="Hapus Konten"
            aria-label="Hapus Konten"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContentCard;
