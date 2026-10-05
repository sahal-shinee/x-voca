import { useState } from 'react';

/**
 * ContentCard - Card komponen untuk grid konten di ContentManagementPage
 */
function ContentCard({
  content,
  onEdit,
  onToggleVisibility,
  onToggleFeatured,
  onDelete,
}) {
  const [imageError, setImageError] = useState(false);

  // Badge configuration
  const getStatusBadge = () => {
    if (content.is_featured) {
      return { label: '★ FEATURED', class: 'bg-accent-gold/20 text-accent-gold border-accent-gold/30' };
    }
    if (!content.is_visible) {
      return { label: '⊗ HIDDEN', class: 'bg-status-live/20 text-status-live border-status-live/30' };
    }
    return { label: '● VISIBLE', class: 'bg-status-done/20 text-status-done border-status-done/30' };
  };

  const badge = getStatusBadge();

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="bg-bg-card border border-border-subtle rounded-xl overflow-hidden hover:border-border-active transition-all group">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-bg-input overflow-hidden">
        {content.thumbnail && !imageError ? (
          <img
            src={content.thumbnail}
            alt={content.title}
            onError={handleImageError}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-input">
            <span className="text-4xl opacity-30">📺</span>
          </div>
        )}

        {/* Top-left badge */}
        <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-medium rounded border ${badge.class}`}>
          {badge.label}
        </span>

        {/* Top-right badge - video count or duration */}
        {content.video_count && (
          <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-mono bg-bg-base/80 text-text-secondary rounded">
            {content.video_count} VIDEO
          </span>
        )}

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-bg-base/40">
          <div className="w-12 h-12 rounded-full bg-bg-base/80 flex items-center justify-center">
            <span className="text-xl text-text-primary ml-0.5">▶</span>
          </div>
        </div>
      </div>

      {/* Content Info */}
      <div className="p-4">
        {/* Genre & Sort Order */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
            {content.game_tag || content.category || 'LAINNYA'}
          </span>
          {content.sort_order !== undefined && (
            <span className="text-[10px] font-mono text-text-muted">
              #{content.sort_order}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-text-primary line-clamp-2 mb-2">
          {content.title}
        </h3>

        {/* URL */}
        {content.youtube_url && (
          <p className="text-xs text-text-muted truncate mb-2">
            {content.youtube_url.replace(/(https?:\/\/)?(www\.)?(youtu\.be\/|youtube\.com\/)/g, '').slice(0, 40)}...
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-text-muted mb-3">
          {content.video_count && (
            <span>{content.video_count} Video</span>
          )}
          {content.total_duration && (
            <span>{content.total_duration}</span>
          )}
          {content.quality && (
            <span>{content.quality}</span>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
          {/* Left - External link */}
          {content.youtube_url && (
            <a
              href={content.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-text-muted hover:text-accent-cyan transition-colors flex items-center gap-1"
            >
              <span>↗</span>
              YouTube
            </a>
          )}

          {/* Right - Actions */}
          <div className="flex items-center gap-1">
            {/* Edit */}
            <button
              onClick={() => onEdit?.(content)}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-input rounded-lg transition-colors"
              title="Edit"
            >
              <span className="text-sm">✏</span>
            </button>

            {/* Toggle Visibility */}
            <button
              onClick={() => onToggleVisibility?.(content)}
              className={`p-2 rounded-lg transition-colors ${
                content.is_visible
                  ? 'text-status-done hover:bg-status-done/10'
                  : 'text-text-muted hover:bg-status-live/10'
              }`}
              title={content.is_visible ? 'Sembunyikan' : 'Tampilkan'}
            >
              <span className="text-sm">
                {content.is_visible ? '👁' : '👁‍🗨'}
              </span>
            </button>

            {/* Toggle Featured */}
            <button
              onClick={() => onToggleFeatured?.(content)}
              className={`p-2 rounded-lg transition-colors ${
                content.is_featured
                  ? 'text-accent-gold hover:bg-accent-gold/10'
                  : 'text-text-muted hover:bg-bg-input'
              }`}
              title={content.is_featured ? 'Hapus Featured' : 'Jadikan Featured'}
            >
              <span className="text-sm">★</span>
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete?.(content)}
              className="p-2 text-text-muted hover:text-status-live hover:bg-status-live/10 rounded-lg transition-colors"
              title="Hapus"
            >
              <span className="text-sm">🗑</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContentCard;
