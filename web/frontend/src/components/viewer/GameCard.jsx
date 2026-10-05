import { useState } from 'react';

/**
 * GameCard - Enhanced game card with modern design
 * Based on Figma Game Voting Design
 */
function GameCard({
  game,
  votes = 0,
  totalVotes = 0,
  percentage = 0,
  hasVoted = false,
  onVote,
  voting = false,
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Status configuration with enhanced colors
  const statusConfig = {
    playing: {
      border: 'border-[#fbbf24] border-2',
      badge: { text: '● PLAYING', bg: 'bg-[#fbbf24]', textColor: 'text-[#0f0a22]' },
      button: { text: 'Sedang Dimainkan', bg: 'bg-[#fbbf24]/20', textColor: 'text-[#fbbf24]', borderColor: 'border-[#fbbf24]' },
      progressGradient: 'from-[#fbbf24] to-[#7ee0d2]',
      labelColor: '#fbbf24',
      glowColor: 'rgba(251, 191, 36, 0.3)',
    },
    accepted: {
      border: 'border-[#c084fc] border-2',
      badge: { text: '✦ ACCEPTED', bg: 'bg-[#c084fc]/20', textColor: 'text-[#c084fc]' },
      button: { text: 'Vote untuk Game Ini', bg: 'bg-[#7ee0d2]/10', textColor: 'text-[#7ee0d2]', borderColor: 'border-[#7ee0d2]' },
      progressGradient: 'from-[#c084fc] to-[#7ee0d2]',
      labelColor: '#c084fc',
      glowColor: 'rgba(192, 132, 252, 0.3)',
    },
    requested: {
      border: 'border-[#2a2645]',
      badge: { text: '✦ REQUESTED', bg: 'bg-[#c084fc]/10', textColor: 'text-[#c084fc]' },
      button: { text: 'Vote untuk Game Ini', bg: 'bg-[#7ee0d2]/10', textColor: 'text-[#7ee0d2]', borderColor: 'border-[#7ee0d2]' },
      progressGradient: 'from-[#7ee0d2] to-[#c084fc]',
      labelColor: '#7ee0d2',
      glowColor: 'rgba(126, 224, 210, 0.3)',
    },
    done: {
      border: 'border-[#2a2645]',
      badge: { text: '✓ DONE', bg: 'bg-[#6b7280]/20', textColor: 'text-[#6b7280]' },
      button: { text: 'Selesai Dimainkan', bg: 'bg-[#2a2645]', textColor: 'text-[#6b7280]', borderColor: 'border-[#2a2645]' },
      progressGradient: 'from-[#6b7280] to-[#6b7280]',
      labelColor: '#6b7280',
      glowColor: 'rgba(107, 114, 128, 0.3)',
    },
  };

  const status = game.status || 'requested';
  const config = statusConfig[status] || statusConfig.requested;

  // Determine button state
  const getButtonContent = () => {
    if (status === 'playing') {
      return (
        <span className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#fbbf24] animate-pulse"></span>
          {config.button.text}
        </span>
      );
    }
    if (status === 'done') {
      return (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {config.button.text}
        </span>
      );
    }
    if (hasVoted) {
      return (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Sudah Memberi Vote
        </span>
      );
    }
    if (voting) {
      return (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Memproses...
        </span>
      );
    }
    return (
      <span className="flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
        {config.button.text}
      </span>
    );
  };

  const isButtonDisabled = status === 'playing' || status === 'done' || hasVoted || voting;

  // Top Candidate Badge Logic
  const isTopCandidate = status === 'accepted' && percentage > 30;
  const topCandidateRank = isTopCandidate ? Math.ceil(percentage / 10) : null;

  return (
    <div
      className={`
        relative
        bg-[#1a1730] ${config.border}
        rounded-2xl overflow-hidden
        transition-all duration-300
        ${isHovered ? 'transform -translate-y-2 shadow-xl' : ''}
        ${status !== 'done' ? 'hover:shadow-lg' : 'opacity-80'}
      `}
      style={{
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: isHovered ? `0 20px 40px ${config.glowColor}` : '0 4px 20px rgba(0,0,0,0.3)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover Image with Badge */}
      <div className="relative aspect-[16/9] overflow-hidden">
        {/* Placeholder if no image */}
        {!game.cover_image && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#2d2855] to-[#1a1730] flex items-center justify-center">
            {/* Ambient glow */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#c084fc] blur-[40px]" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[#7ee0d2] blur-[40px]" />
            </div>
            <span className="relative text-5xl opacity-50">🎮</span>
          </div>
        )}

        {/* Actual image */}
        {game.cover_image && (
          <img
            src={game.cover_image}
            alt={game.title}
            className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `
                <div class="absolute inset-0 bg-gradient-to-br from-[#2d2855] to-[#1a1730] flex items-center justify-center">
                  <span class="text-5xl opacity-50">🎮</span>
                </div>
              `;
            }}
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1730] via-transparent to-transparent opacity-60" />

        {/* Status Badge - Top Right */}
        <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full ${config.badge.bg} ${config.badge.textColor} text-xs font-bold uppercase tracking-wider backdrop-blur-sm`}>
          {config.badge.text}
        </div>

        {/* Top Candidate Badge */}
        {isTopCandidate && (
          <div
            className="absolute top-3 left-3 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#fbbf24] text-[#0f0a22] shadow-lg"
            style={{ boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4)' }}
          >
            TOP CANDIDATE #{topCandidateRank}
          </div>
        )}

        {/* Playing duration */}
        {status === 'playing' && (
          <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg text-xs font-mono text-[#fbbf24] bg-[#0f0a22]/80 backdrop-blur-sm">
            WEEK 3 ON AIR
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Genre Label */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: config.labelColor }}
          >
            {game.genre || 'GAME'}
          </span>
          {status === 'done' && (
            <span className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider">
              ARCHIVED
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className={`text-base font-bold text-white mb-3 leading-snug ${status === 'done' ? 'opacity-60' : ''}`}>
          {game.title}
        </h3>

        {/* Vote Info */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[#a89ec0]">Voting Pool Result</span>
            <span className="text-white font-mono font-semibold">
              {votes.toLocaleString()} votes · {percentage.toFixed(1)}%
            </span>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="relative h-2 bg-[#0f0a22] rounded-full overflow-hidden">
            {/* Background glow */}
            <div
              className="absolute inset-0 opacity-30 blur-sm"
              style={{
                background: `linear-gradient(90deg, ${config.labelColor}33, transparent)`,
              }}
            />
            {/* Progress fill */}
            <div
              className={`relative h-full bg-gradient-to-r ${config.progressGradient} rounded-full transition-all duration-700`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
            </div>
          </div>
        </div>

        {/* Vote Button */}
        <button
          onClick={() => !isButtonDisabled && onVote?.(game)}
          disabled={isButtonDisabled}
          className={`
            w-full py-3 px-4
            rounded-xl font-semibold text-sm
            border transition-all duration-200
            flex items-center justify-center
            disabled:cursor-not-allowed
            ${isButtonDisabled ? config.button.bg : `${config.button.bg}`}
            ${config.button.textColor}
            ${!isButtonDisabled ? `border ${config.button.borderColor} hover:shadow-lg` : ''}
            ${hasVoted ? 'border-[#7ee0d2]/50' : ''}
          `}
          style={{
            backgroundColor: isButtonDisabled
              ? (status === 'done' ? '#1a1730' : config.button.bg)
              : hasVoted
                ? 'rgba(126, 224, 210, 0.15)'
                : config.button.bg,
            boxShadow: !isButtonDisabled && !hasVoted
              ? `0 4px 15px ${config.glowColor}`
              : 'none',
          }}
        >
          {getButtonContent()}
        </button>

        {/* Done badge for completed games */}
        {status === 'done' && (
          <div className="mt-3 pt-3 border-t border-[#2a2645] text-center">
            <span className="text-xs font-mono text-[#6b7280] uppercase tracking-wider">
              ✦ VOD Available
            </span>
          </div>
        )}
      </div>

      {/* Hover glow effect */}
      {status !== 'done' && (
        <div
          className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          style={{
            boxShadow: `inset 0 0 30px ${config.glowColor}`,
          }}
        />
      )}
    </div>
  );
}

/**
 * GameCard Skeleton - Loading placeholder
 */
export function GameCardSkeleton() {
  return (
    <div className="bg-[#1a1730] border border-[#2a2645] rounded-2xl overflow-hidden">
      {/* Image skeleton */}
      <div className="aspect-[16/9] bg-[#231f42] animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2d2855]/50 to-transparent animate-shimmer" />
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-2 w-20 bg-[#231f42] rounded animate-pulse" />
        <div className="h-5 w-3/4 bg-[#231f42] rounded animate-pulse" />

        {/* Vote info */}
        <div className="space-y-2 pt-2">
          <div className="h-3 w-full bg-[#231f42] rounded animate-pulse" />
          <div className="h-2 w-full bg-[#231f42] rounded-full animate-pulse" />
        </div>

        {/* Button skeleton */}
        <div className="h-10 w-full bg-[#231f42] rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

export default GameCard;
