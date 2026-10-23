import { useState } from 'react';
import {
  ExternalLink,
  Edit3,
  Eye,
  EyeOff,
  Star,
  Trash2,
  Tv,
  Layers,
  Clock,
  Play
} from 'lucide-react';

/**
 * ContentRow - Compact table row for Content Management
 */
export function ContentRow({
  content,
  onEdit,
  onToggleVisibility,
  onToggleFeatured,
  onDelete,
}) {
  const [imageError, setImageError] = useState(false);

  if (!content) return null;

  const thumbnailSrc = content.thumbnail_url || content.thumbnailUrl || content.thumbnail || null;
  const isFeatured = Boolean(content.is_featured);
  const isVisible = content.is_visible !== false;
  const sortOrder = content.sort_order ?? content.sortOrder ?? 1;
  const categoryLabel = content.game_tag || content.category || 'LAINNYA';
  const isPlaylist = content.content_type === 'playlist' || (content.video_count && content.video_count > 1);

  return (
    <tr className="border-b border-border-subtle/60 hover:bg-bg-surface/50 transition-colors duration-150 group">
      {/* 1. THUMBNAIL & TITLE */}
      <td className="py-3.5 px-4 align-middle">
        <div className="flex items-center gap-3">
          {/* Mini 16:9 Thumbnail */}
          <div className="w-16 h-10 rounded-lg bg-bg-surface border border-border-subtle overflow-hidden flex-shrink-0 relative group/thumb shadow-sm">
            {thumbnailSrc && !imageError ? (
              <img
                src={thumbnailSrc}
                alt={content.title || 'Thumbnail'}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted">
                <Tv className="w-4 h-4 opacity-40" />
              </div>
            )}
            {content.youtube_url && (
              <a
                href={content.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 bg-bg-base/50 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity text-accent-cyan"
                title="Tonton di YouTube"
              >
                <Play className="w-4 h-4 fill-current" />
              </a>
            )}
          </div>

          {/* Title & Tag */}
          <div className="min-w-0 max-w-[280px]">
            <p className="text-xs sm:text-sm font-semibold text-text-primary truncate" title={content.title}>
              {content.title || 'Tanpa Judul'}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-bg-surface border border-border-subtle text-accent-cyan uppercase">
                {categoryLabel}
              </span>
              {content.total_duration && (
                <span className="text-[11px] text-text-muted font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {content.total_duration}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* 2. TIPE KONTEN */}
      <td className="py-3.5 px-4 align-middle">
        {isPlaylist ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-semibold rounded-md border bg-accent-purple/10 text-accent-purple border-accent-purple/20">
            <Layers className="w-3.5 h-3.5" />
            <span>Playlist ({content.video_count || 1} Video)</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-medium rounded-md border bg-bg-surface text-text-secondary border-border-subtle">
            <span>Single Video</span>
          </span>
        )}
      </td>

      {/* 3. URUTAN TAMPIL */}
      <td className="py-3.5 px-4 align-middle">
        <span className="text-xs font-mono font-bold text-text-secondary bg-bg-surface px-2.5 py-1 rounded-md border border-border-subtle">
          #{sortOrder}
        </span>
      </td>

      {/* 4. VISIBILITAS */}
      <td className="py-3.5 px-4 align-middle">
        <button
          type="button"
          onClick={() => onToggleVisibility?.(content)}
          className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold border transition-all
            ${isVisible
              ? 'bg-status-done/15 text-status-done border-status-done/30 hover:bg-status-done/25'
              : 'bg-status-live/15 text-status-live border-status-live/30 hover:bg-status-live/25'}
          `}
          title={isVisible ? 'Klik untuk Sembunyikan (Jadikan Draft)' : 'Klik untuk Publikasikan'}
        >
          {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{isVisible ? 'PUBLIK' : 'DRAFT'}</span>
        </button>
      </td>

      {/* 5. SOROTAN UTAMA */}
      <td className="py-3.5 px-4 align-middle">
        <button
          type="button"
          onClick={() => onToggleFeatured?.(content)}
          className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold border transition-all
            ${isFeatured
              ? 'bg-accent-gold/15 text-accent-gold border-accent-gold/40 hover:bg-accent-gold/25'
              : 'bg-bg-surface text-text-muted border-border-subtle hover:text-accent-gold hover:border-accent-gold/30'}
          `}
          title={isFeatured ? 'Copot dari Sorotan' : 'Jadikan Sorotan Utama'}
        >
          <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-accent-gold' : ''}`} />
          <span>{isFeatured ? 'SOROTAN' : 'STANDAR'}</span>
        </button>
      </td>

      {/* 6. TAUTAN YOUTUBE */}
      <td className="py-3.5 px-4 align-middle">
        {content.youtube_url ? (
          <a
            href={content.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent-cyan hover:underline inline-flex items-center gap-1 font-mono"
            title="Buka link YouTube"
          >
            <span>YouTube</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-xs text-text-muted font-mono">-</span>
        )}
      </td>

      {/* 7. AKSI */}
      <td className="py-3.5 px-4 align-middle text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onEdit?.(content)}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card border border-border-subtle transition-colors"
            title="Edit Detail Konten"
            aria-label="Edit Konten"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(content)}
            className="p-1.5 rounded-lg text-text-muted hover:text-status-live hover:bg-status-live/10 border border-border-subtle hover:border-status-live/30 transition-colors"
            title="Hapus Konten"
            aria-label="Hapus Konten"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default ContentRow;

