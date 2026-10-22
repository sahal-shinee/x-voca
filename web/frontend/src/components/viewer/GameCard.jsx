import { useState } from 'react';

/**
 * GamepadIcon - Clean vector SVG controller icon (no emojis)
 */
const GamepadVector = ({ className = 'w-10 h-10', opacity = 'opacity-40' }) => (
  <svg
    className={`${className} ${opacity}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="6" width="20" height="12" rx="4" />
    <path d="M6 12h4" />
    <path d="M8 10v4" />
    <circle cx="15.5" cy="11.5" r=".75" fill="currentColor" />
    <circle cx="17.5" cy="13.5" r=".75" fill="currentColor" />
  </svg>
);

/**
 * GameCard - Modern, clean, user-friendly game card (Zero AI Slop)
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

  // Status configuration - Clean, harmonious color scheme
  const statusConfig = {
    playing: {
      badge: { text: 'Sedang Dimainkan', bg: 'bg-amber-500/15', textColor: 'text-amber-300', dot: 'bg-amber-400' },
      button: { text: 'Sedang Dimainkan di Stream', bg: 'bg-amber-500/10', textColor: 'text-amber-300', borderColor: 'border-amber-500/30' },
      progressGradient: 'from-amber-400 to-[#7ee0d2]',
      labelColor: 'text-amber-300',
    },
    accepted: {
      badge: { text: 'Diterima Komunitas', bg: 'bg-purple-500/15', textColor: 'text-purple-300' },
      button: { text: 'Beri Suara', bg: 'bg-accent-cyan hover:bg-accent-cyan/90 text-[#0c081e]', textColor: 'text-[#0c081e]', borderColor: 'border-accent-cyan' },
      progressGradient: 'from-[#7ee0d2] to-[#c084fc]',
      labelColor: 'text-purple-300',
    },
    requested: {
      badge: { text: 'Request Baru', bg: 'bg-cyan-500/15', textColor: 'text-cyan-300' },
      button: { text: 'Beri Suara', bg: 'bg-accent-cyan hover:bg-accent-cyan/90 text-[#0c081e]', textColor: 'text-[#0c081e]', borderColor: 'border-accent-cyan' },
      progressGradient: 'from-[#7ee0d2] to-cyan-400',
      labelColor: 'text-cyan-300',
    },
    done: {
      badge: { text: 'Selesai', bg: 'bg-white/10', textColor: 'text-[#a89ec0]' },
      button: { text: 'Selesai Dimainkan', bg: 'bg-white/5', textColor: 'text-[#a89ec0]', borderColor: 'border-white/10' },
      progressGradient: 'from-slate-500 to-slate-600',
      labelColor: 'text-[#a89ec0]',
    },
  };

  const status = game.status || 'requested';
  const config = statusConfig[status] || statusConfig.requested;

  // Determine button state
  const getButtonContent = () => {
    if (status === 'playing') {
      return (
        <span className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Sedang Dimainkan di Stream</span>
        </span>
      );
    }
    if (status === 'done') {
      return (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Selesai Dimainkan</span>
        </span>
      );
    }
    if (hasVoted) {
      return (
        <span className="flex items-center justify-center gap-2 text-accent-cyan">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Sudah Memilih</span>
        </span>
      );
    }
    if (voting) {
      return (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin w-4 h-4 text-[#0c081e]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Mencatat Suara...</span>
        </span>
      );
    }
    return (
      <span className="flex items-center justify-center gap-2">
        <svg className="w-4 h-4 fill-none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
        </svg>
        <span>Beri Suara</span>
      </span>
    );
  };

  const isButtonDisabled = status === 'playing' || status === 'done' || hasVoted || voting;
  const isTopCandidate = status === 'accepted' && percentage > 30;

  return (
    <div
      className={`
        relative flex flex-col rounded-2xl overflow-hidden
        transition-all duration-300 group
        bg-[#151128]/85 border
        ${status === 'playing' ? 'border-amber-500/40 shadow-lg shadow-amber-500/10' : 'border-white/[0.08] hover:border-accent-cyan/40 shadow-xl'}
        ${isHovered ? '-translate-y-1.5' : 'translate-y-0'}
        ${status === 'done' ? 'opacity-75 hover:opacity-100' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 16:9 Cover Image / Placeholder */}
      <div className="relative aspect-video overflow-hidden bg-[#100c22]">
        {game.cover_image ? (
          <img
            src={game.cover_image}
            alt={game.title}
            className={`w-full h-full object-cover transition-transform duration-500 ease-out ${isHovered ? 'scale-105' : 'scale-100'}`}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1435] via-[#120e26] to-[#0c081e] p-6 text-center">
            <GamepadVector className="w-10 h-10 text-accent-cyan/40 mb-2 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">
              {game.genre || 'Game Stream'}
            </span>
          </div>
        )}

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#151128] via-[#151128]/30 to-black/20" />

        {/* Status Badge - Top Right */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${config.badge.bg} ${config.badge.textColor} text-[11px] font-semibold tracking-wide backdrop-blur-md border border-white/10 shadow-sm`}>
            {status === 'playing' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
            {status === 'done' && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span>{config.badge.text}</span>
          </span>
        </div>

        {/* Top Candidate Tag */}
        {isTopCandidate && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-400 text-[#0c081e] shadow-md">
              Peringkat Teratas
            </span>
          </div>
        )}

        {/* Genre Tag Pill - Bottom Left */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 text-[11px] font-mono uppercase tracking-wider font-semibold text-accent-cyan">
            {game.genre || 'Umum'}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1">
        {/* Title */}
        <h3 className="text-base font-bold text-white mb-3 line-clamp-2 leading-snug group-hover:text-accent-cyan transition-colors duration-200">
          {game.title}
        </h3>

        {/* Vote Progress Section */}
        <div className="mt-auto space-y-2 pt-3 border-t border-white/[0.06]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#a89ec0]">Perolehan Suara</span>
            <span className="text-white font-mono font-semibold">
              {votes.toLocaleString()} Suara · {percentage.toFixed(1)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div
              className={`h-full bg-gradient-to-r ${config.progressGradient} rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 mt-2">
          <button
            type="button"
            onClick={() => !isButtonDisabled && onVote?.(game)}
            disabled={isButtonDisabled}
            className={`
              w-full py-2.5 px-4 rounded-xl text-xs font-semibold
              transition-all duration-150 flex items-center justify-center
              ${isButtonDisabled
                ? (hasVoted
                  ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 cursor-default'
                  : 'bg-white/[0.04] text-[#a89ec0] border border-white/10 opacity-70 cursor-not-allowed')
                : 'bg-accent-cyan hover:bg-accent-cyan/90 text-[#0c081e] active:scale-95 shadow-md shadow-accent-cyan/20 cursor-pointer'
              }
            `}
          >
            {getButtonContent()}
          </button>
        </div>

        {/* Completed note */}
        {status === 'done' && (
          <p className="text-[11px] font-mono text-[#a89ec0] text-center mt-2.5 opacity-75">
            Sesi permainan telah selesai ditayangkan
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * GameCardSkeleton - Clean loading placeholder
 */
export function GameCardSkeleton() {
  return (
    <div className="bg-[#151128]/70 border border-white/[0.08] rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-video bg-white/[0.03]" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 bg-white/5 rounded-lg" />
        <div className="space-y-2 pt-3">
          <div className="h-3 w-full bg-white/5 rounded" />
          <div className="h-2 w-full bg-white/5 rounded-full" />
        </div>
        <div className="h-9 w-full bg-white/5 rounded-xl pt-2" />
      </div>
    </div>
  );
}

export default GameCard;