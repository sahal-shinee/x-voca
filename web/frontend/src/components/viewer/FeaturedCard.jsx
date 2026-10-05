import { useState } from 'react';

/**
 * FeaturedCard - Featured content card component
 * Modern design with gradient backgrounds and interactive elements
 */
function FeaturedCard({ content, onSavePlaylist }) {
  const [imageError, setImageError] = useState(false);

  // Handle YouTube link
  const handleWatch = () => {
    if (content?.youtube_url) {
      window.open(content.youtube_url, '_blank', 'noopener,noreferrer');
    }
  };

  // Format view count
  const formatViews = (views) => {
    if (!views) return '0';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views;
  };

  return (
    <div className="group relative bg-[#231f42] border border-[rgba(61,53,96,0.7)] rounded-2xl overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2d2855] via-[#231f42] to-[#1a1730]">
        <div className="absolute inset-0 opacity-40">
          {/* Ambient glow effects */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#c084fc] blur-[100px] opacity-50" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#7ee0d2] blur-[80px] opacity-40" />
        </div>
      </div>

      {/* Content */}
      <div className="relative flex flex-col lg:flex-row gap-6 p-6 lg:p-8">
        {/* Thumbnail */}
        <div className="lg:w-[420px] flex-shrink-0">
          <div
            className="relative aspect-video rounded-xl overflow-hidden bg-[#1a1730] border border-[rgba(61,53,96,0.5)] cursor-pointer"
            onClick={handleWatch}
          >
            {/* Thumbnail Image or Placeholder */}
            {!imageError && content?.thumbnail ? (
              <img
                src={content.thumbnail}
                alt={content.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2d2855] to-[#1a1730]">
                <div className="w-20 h-20 rounded-full bg-[#7ee0d2]/20 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-[#7ee0d2] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-[#0f0a22] ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Play Overlay on Hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                <svg className="w-7 h-7 text-[#0f0a22] ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>

            {/* Duration Badge */}
            <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-white text-sm font-mono">
              {content?.duration || '00:00'}
            </div>

            {/* Featured Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#c084fc] shadow-lg">
              <span className="text-[#0f0a22] text-[10px] font-bold uppercase tracking-wider">Featured</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Category & Stats */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-[rgba(126,224,210,0.15)] text-[#7ee0d2] text-xs font-bold uppercase tracking-wider">
              {content?.game_tag || 'FEATURED'}
            </span>
            <span className="text-[#5c5480] text-xs">•</span>
            <span className="text-[#a89ec0] text-sm font-medium">
              {formatViews(content?.view_count || 0)} views
            </span>
            <span className="text-[#5c5480] text-xs">•</span>
            <span className="text-[#a89ec0] text-sm">
              {content?.video_count || 1} video{content?.video_count > 1 ? 's' : ''}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3 font-display leading-tight">
            {content?.title || 'Featured Content'}
          </h2>

          {/* Description */}
          {content?.description && (
            <p className="text-[#a89ec0] text-sm leading-relaxed mb-4 line-clamp-2">
              {content.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleWatch}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#7ee0d2] text-[#0f0a22] font-bold text-sm rounded-xl hover:bg-[#7ee0d2]/90 hover:shadow-lg hover:shadow-[#7ee0d2]/20 transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Watch Now
            </button>

            {onSavePlaylist && (
              <button
                onClick={() => onSavePlaylist(content)}
                className="inline-flex items-center gap-2 px-4 py-3 border border-[#3d3560] text-[#a89ec0] font-medium text-sm rounded-xl hover:border-[#7ee0d2] hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-4M16 2l4 4m0 0l-4 4m4-4H8" />
                </svg>
                Copy Link
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * FeaturedCardSkeleton - Loading placeholder
 */
export function FeaturedCardSkeleton() {
  return (
    <div className="bg-[#231f42] border border-[rgba(61,53,96,0.7)] rounded-2xl overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-6 p-6 lg:p-8">
        {/* Thumbnail skeleton */}
        <div className="lg:w-[420px] flex-shrink-0">
          <div className="aspect-video bg-[#1a1730] rounded-xl animate-pulse" />
        </div>

        {/* Info skeleton */}
        <div className="flex-1 space-y-4">
          <div className="flex gap-3">
            <div className="h-6 w-24 bg-[#1a1730] rounded-full animate-pulse" />
            <div className="h-6 w-20 bg-[#1a1730] rounded-full animate-pulse" />
          </div>
          <div className="h-10 w-3/4 bg-[#1a1730] rounded-lg animate-pulse" />
          <div className="h-4 w-full bg-[#1a1730] rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-[#1a1730] rounded animate-pulse" />
          <div className="flex gap-3 pt-4">
            <div className="h-11 w-32 bg-[#1a1730] rounded-xl animate-pulse" />
            <div className="h-11 w-28 bg-[#1a1730] rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeaturedCard;
