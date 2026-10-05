import { useState } from 'react';

/**
 * ContentCard - Modern content card with hover effects and category colors
 */
function ContentCard({ content }) {
  const [imageError, setImageError] = useState(false);

  // Category color mapping
  const getCategoryColor = (category) => {
    const colors = {
      'ZATSU': '#c084fc',
      'LIVE2D': '#7ee0d2',
      'INDIE GAMES': '#fbbf24',
      'KARAOKE': '#f472b6',
      'SURVIVAL HORROR': '#ef4444',
      'EXPLORATION': '#22c55e',
      'CHIT-CHAT': '#a78bfa',
    };
    return colors[category] || '#a89ec0';
  };

  // Handle YouTube link
  const handleWatch = (e) => {
    e.stopPropagation();
    if (content?.youtube_url) {
      window.open(content.youtube_url, '_blank', 'noopener,noreferrer');
    }
  };

  // Format video count display
  const getVideoCountDisplay = () => {
    const count = content?.video_count || 1;
    if (count === 1) {
      return content?.duration || '00:00';
    }
    return `${count} VIDEO`;
  };

  // Get status badge
  const getStatusBadge = () => {
    if (content?.is_featured) {
      return (
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#c084fc] text-white text-[10px] font-bold uppercase tracking-wider z-10">
          Featured
        </span>
      );
    }
    if (content?.is_new) {
      return (
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#7ee0d2] text-[#0f0a22] text-[10px] font-bold uppercase tracking-wider z-10">
          New
        </span>
      );
    }
    return null;
  };

  const categoryColor = getCategoryColor(content?.game_tag);

  return (
    <div
      className="group bg-[#1a1730] border border-[#2a2645] rounded-xl overflow-hidden hover:border-[rgba(126,224,210,0.3)] transition-all duration-300 hover:shadow-lg hover:shadow-black/20 cursor-pointer hover:-translate-y-1"
      onClick={handleWatch}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[#231f42] overflow-hidden">
        {/* Thumbnail Image or Placeholder */}
        {!imageError && content?.thumbnail ? (
          <img
            src={content.thumbnail}
            alt={content.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Gradient placeholder */}
            <div
              className="absolute inset-0 opacity-30"
              style={{ background: `linear-gradient(135deg, ${categoryColor}44 0%, transparent 100%)` }}
            />

            {/* Play icon */}
            <div className="relative w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[#7ee0d2] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                <svg className="w-5 h-5 text-[#0f0a22] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <svg className="absolute w-6 h-6 text-white/60 group-hover:opacity-0 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        )}

        {/* Status Badge */}
        {getStatusBadge()}

        {/* Video Count Badge - Top Right */}
        <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono uppercase tracking-wider">
          {getVideoCountDisplay()}
        </div>

        {/* Duration - Bottom Right */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono">
          {content?.duration || '00:00'}
        </div>

        {/* Category Icon - Bottom Left */}
        <div
          className="absolute bottom-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur-sm"
          style={{ backgroundColor: `${categoryColor}33` }}
        >
          <span style={{ color: categoryColor }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </span>
        </div>
      </div>

      {/* Content Info */}
      <div className="p-4">
        {/* Category Tag */}
        <p
          className="text-[10px] font-bold uppercase tracking-wider mb-2"
          style={{ color: categoryColor }}
        >
          {content?.game_tag || 'CONTENT'}
        </p>

        {/* Title */}
        <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2 leading-snug group-hover:text-[#7ee0d2] transition-colors">
          {content?.title || 'Judul Konten'}
        </h3>

        {/* Stats Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-[#5c5480]">
            {/* View Count */}
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              {content?.view_count ? (
                content.view_count >= 1000
                  ? `${(content.view_count / 1000).toFixed(1)}K`
                  : content.view_count
              ) : '0'}
            </span>

            {/* Video Count */}
            {(content?.video_count || 1) > 1 && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
                {content.video_count}
              </span>
            )}
          </div>

          {/* External Link Icon */}
          <svg className="w-4 h-4 text-[#7ee0d2] opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

/**
 * ContentCardSkeleton - Loading placeholder
 */
export function ContentCardSkeleton() {
  return (
    <div className="bg-[#1a1730] border border-[#2a2645] rounded-xl overflow-hidden">
      {/* Thumbnail skeleton */}
      <div className="aspect-video bg-[#231f42] animate-pulse" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-2 w-16 bg-[#231f42] rounded animate-pulse" />
        <div className="h-4 w-full bg-[#231f42] rounded animate-pulse" />
        <div className="h-3 w-3/4 bg-[#231f42] rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-[#231f42] rounded animate-pulse" />
      </div>
    </div>
  );
}

export default ContentCard;
