import { Gamepad2, Check, Play, CheckCircle, Trash2, Square, SquareCheck, Calendar, ArrowUpRight } from 'lucide-react';

/**
 * GameCard - Modern, rich, human-designed game card for Voting Moderation
 * Features:
 * - Clean horizontal layout that eliminates empty voids
 * - High-contrast cover preview with status badge
 * - Clear vote percentage bar
 * - Direct "Jadwalkan Stream" action linking Voting to Schedule
 * - 100% theme-adaptive (works in Light and Dark mode)
 */

const STATUS_CONFIG = {
  requested: {
    accent: 'border-border-subtle hover:border-amber-500/40',
    badgeBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    label: 'REQUESTED',
    glow: '',
  },
  accepted: {
    accent: 'border-border-subtle hover:border-accent-purple/40',
    badgeBg: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20',
    label: 'ACCEPTED',
    glow: '',
  },
  playing: {
    accent: 'border-accent-gold/50 shadow-sm',
    badgeBg: 'bg-accent-gold/15 text-accent-gold border-accent-gold/30',
    label: 'PLAYING',
    glow: 'ring-1 ring-accent-gold/30',
  },
  done: {
    accent: 'border-border-subtle hover:border-emerald-500/30',
    badgeBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    label: 'SELESAI',
    glow: '',
  },
};

export function GameCard({
  game,
  rank,
  maxVotes = 1,
  selected = false,
  onSelect,
  onAccept,
  onPlaying,
  onDone,
  onDelete,
  onSchedule,
}) {
  const cfg = STATUS_CONFIG[game.status] || STATUS_CONFIG.requested;
  const voteCount = game.vote_count || game.voteCount || 0;
  const percentage = maxVotes > 0 ? Math.round((voteCount / maxVotes) * 100) : 0;
  const isPlaying = game.status === 'playing';
  const isDone = game.status === 'done';
  const isAccepted = game.status === 'accepted';
  const isRequested = game.status === 'requested';

  return (
    <div
      className={`
        relative bg-bg-card rounded-2xl border p-4 sm:p-5 transition-all duration-200
        hover:shadow-md hover:bg-bg-card-hover
        ${cfg.accent} ${cfg.glow}
        ${selected ? 'ring-2 ring-accent-cyan ring-offset-2 ring-offset-bg-base' : ''}
        flex flex-col justify-between gap-4
      `}
    >
      {/* ── Top row: Checkbox, Status Pill, Rank ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onSelect?.(game.id)}
            aria-label="Pilih game untuk aksi massal"
            className="text-text-muted hover:text-accent-cyan transition-colors"
          >
            {selected
              ? <SquareCheck className="w-4 h-4 text-accent-cyan" />
              : <Square className="w-4 h-4" />
            }
          </button>

          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-mono font-semibold rounded-full border ${cfg.badgeBg}`}>
            {isPlaying && <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-ping" />}
            {cfg.label}
          </span>
        </div>

        <span className="text-xs font-mono font-bold text-text-muted bg-bg-surface border border-border-subtle rounded-md px-2 py-0.5 shadow-sm">
          #{rank}
        </span>
      </div>

      {/* ── Middle: Cover + Title + Details ── */}
      <div className="flex items-start gap-3.5">
        {/* Cover / Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-bg-surface border border-border-subtle flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm relative">
          {game.cover_url || game.thumbnail || game.cover ? (
            <img
              src={game.cover_url || game.thumbnail || game.cover}
              alt={game.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <Gamepad2 className="w-7 h-7 text-text-muted opacity-40" />
          )}
        </div>

        {/* Info & Progress */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm sm:text-base font-bold text-text-primary leading-tight truncate">
            {game.title}
          </h4>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {(game.category || game.genre) && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-bg-surface border border-border-subtle text-text-secondary truncate max-w-[140px]">
                {game.category || game.genre}
              </span>
            )}
            {game.publisher && (
              <span className="text-[10px] text-text-muted truncate max-w-[120px]">
                {game.publisher}
              </span>
            )}
          </div>

          {/* Vote Counter & Progress bar */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono font-bold text-text-primary">
                {voteCount.toLocaleString('id-ID')} <span className="text-text-muted font-normal">suara</span>
              </span>
              <span className="font-mono text-text-muted text-[11px]">{percentage}%</span>
            </div>
            <div className="h-1.5 bg-bg-surface rounded-full overflow-hidden border border-border-subtle p-[1px]">
              <div
                className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(percentage > 0 ? 8 : 0, percentage))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Requester info ── */}
      <div className="pt-2.5 border-t border-border-subtle flex items-center justify-between gap-2 text-xs text-text-muted">
        <p className="truncate">
          <span>Diusulkan oleh:</span>{' '}
          <span className="font-medium text-text-secondary">
            {game.addedBy || 'Viewer'}
          </span>
          {game.isOfficial && (
            <span className="ml-1 text-[10px] text-accent-cyan font-semibold">[Admin]</span>
          )}
        </p>
      </div>

      {/* ── Action Buttons Deck ── */}
      <div className="flex items-center gap-1.5 flex-wrap justify-between pt-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* If Requested: Accept button */}
          {isRequested && (
            <button
              type="button"
              onClick={() => onAccept?.(game)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-accent-cyan/15 hover:bg-accent-cyan/25 border border-accent-cyan/35 text-accent-cyan transition-all active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Terima Usulan</span>
            </button>
          )}

          {/* If Accepted: Set Playing button */}
          {isAccepted && (
            <button
              type="button"
              onClick={() => onPlaying?.(game)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-accent-gold/15 hover:bg-accent-gold/25 border border-accent-gold/35 text-accent-gold transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Mulai Mainkan</span>
            </button>
          )}

          {/* If Playing: Mark Done button */}
          {isPlaying && (
            <button
              type="button"
              onClick={() => onDone?.(game)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-500 transition-all active:scale-95"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Tandai Selesai</span>
            </button>
          )}

          {/* Fast Link to Schedule Stream for this game (for Accepted, Playing, Done) */}
          {(isAccepted || isPlaying || isDone) && onSchedule && (
            <button
              type="button"
              onClick={() => onSchedule(game)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-accent-purple/10 hover:bg-accent-purple/20 border border-accent-purple/30 text-accent-purple transition-all"
              title="Buat jadwal siaran untuk game ini"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Jadwalkan</span>
            </button>
          )}
        </div>

        {/* Delete button (available except when actively playing) */}
        {!isPlaying && (
          <button
            type="button"
            onClick={() => onDelete?.(game)}
            className="p-1.5 rounded-lg text-text-muted hover:text-status-live hover:bg-status-live/10 transition-colors ml-auto"
            aria-label="Hapus game"
            title="Hapus game"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default GameCard;
