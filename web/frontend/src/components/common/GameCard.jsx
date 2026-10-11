import { Gamepad2, Check, Play, CheckCircle, Trash2, Square, SquareCheck } from 'lucide-react';

/**
 * GameCard - Card-based game display for Voting Moderation
 *
 * Props:
 *  game          - game data object
 *  rank          - numeric rank in sorted list
 *  maxVotes      - highest vote count across all games (for % bar)
 *  selected      - bool, is this card selected for bulk action
 *  onSelect      - fn(id) toggle selection
 *  onAccept      - fn(game)
 *  onPlaying     - fn(game)
 *  onDone        - fn(game)
 *  onDelete      - fn(game)
 */

// Status → visual accent config
const STATUS_CONFIG = {
  requested: {
    accent: 'border-status-requested/50',
    badgeBg: 'bg-status-requested/10 text-status-requested border-status-requested/20',
    label: 'REQUESTED',
    glow: '',
  },
  accepted: {
    accent: 'border-accent-purple/50',
    badgeBg: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20',
    label: 'ACCEPTED',
    glow: '',
  },
  playing: {
    accent: 'border-accent-gold/60',
    badgeBg: 'bg-accent-gold/10 text-accent-gold border-accent-gold/20',
    label: 'PLAYING',
    glow: 'shadow-[0_0_16px_-2px] shadow-accent-gold/20',
  },
  done: {
    accent: 'border-status-done/30',
    badgeBg: 'bg-status-done/10 text-status-done border-status-done/20',
    label: 'DONE',
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
}) {
  const cfg = STATUS_CONFIG[game.status] || STATUS_CONFIG.requested;
  const voteCount = game.voteCount || 0;
  const percentage = maxVotes > 0 ? Math.round((voteCount / maxVotes) * 100) : 0;
  const isPlaying = game.status === 'playing';
  const isDone = game.status === 'done';

  return (
    <div
      className={`
        relative bg-bg-card rounded-xl border transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-lg
        ${cfg.accent} ${cfg.glow}
        ${selected ? 'ring-2 ring-accent-cyan ring-offset-1 ring-offset-bg-base' : ''}
        ${isPlaying ? 'bg-gradient-to-br from-accent-gold/5 to-transparent' : ''}
      `}
    >
      {/* ── Checkbox (top-left) ── */}
      <button
        onClick={() => onSelect?.(game.id)}
        aria-label="Select game"
        className="absolute top-3 left-3 z-10 text-text-muted hover:text-accent-cyan transition-colors"
      >
        {selected
          ? <SquareCheck className="w-4 h-4 text-accent-cyan" />
          : <Square className="w-4 h-4" />
        }
      </button>

      {/* ── Rank badge (top-right) ── */}
      <div className="absolute top-3 right-3 z-10">
        <span className="text-xs font-mono font-bold text-text-muted bg-bg-surface border border-border-subtle rounded px-1.5 py-0.5">
          #{rank}
        </span>
      </div>

      <div className="p-4">
        {/* ── Cover + Info row ── */}
        <div className="flex gap-4 mt-1">
          {/* Cover image */}
          <div className="w-20 h-20 rounded-lg bg-bg-surface border border-border-subtle flex items-center justify-center overflow-hidden flex-shrink-0">
            {game.thumbnail || game.cover ? (
              <img
                src={game.thumbnail || game.cover}
                alt={game.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Gamepad2 className="w-8 h-8 text-text-muted opacity-40" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-1">
            {/* Status badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-semibold rounded border mb-1.5 ${cfg.badgeBg}`}>
              {isPlaying && <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse" />}
              {cfg.label}
            </span>

            <p className="text-sm font-semibold text-text-primary leading-tight truncate">
              {game.title}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {game.category || game.genre}
              {game.publisher && <span className="text-text-muted"> • {game.publisher}</span>}
            </p>

            {/* Vote bar */}
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-bold text-text-primary">
                  {voteCount.toLocaleString()} <span className="text-text-muted font-normal">votes</span>
                </span>
                <span className="text-xs font-mono text-text-muted">{percentage}%</span>
              </div>
              <div className="h-1 bg-bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Requester info ── */}
        <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
          <p className="text-xs text-text-muted truncate">
            <span className="text-text-secondary">Oleh:</span>{' '}
            {game.addedBy || 'Unknown'}
            {game.isOfficial && (
              <span className="ml-1.5 text-accent-cyan font-medium">[Admin]</span>
            )}
          </p>
        </div>

        {/* ── Action buttons ── */}
        {!isDone && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {/* Accept */}
            <button
              onClick={() => onAccept?.(game)}
              disabled={game.status !== 'requested'}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors
                ${game.status === 'requested'
                  ? 'border-accent-cyan text-accent-cyan hover:bg-accent-cyan/10'
                  : 'border-border-subtle text-text-muted opacity-30 cursor-not-allowed'
                }
              `}
            >
              <Check className="w-3.5 h-3.5" />
              Accept
            </button>

            {/* Set Playing */}
            <button
              onClick={() => onPlaying?.(game)}
              disabled={game.status !== 'accepted'}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors
                ${game.status === 'accepted'
                  ? 'border-accent-gold text-accent-gold hover:bg-accent-gold/10'
                  : 'border-border-subtle text-text-muted opacity-30 cursor-not-allowed'
                }
              `}
            >
              <Play className="w-3.5 h-3.5" />
              Set Playing
            </button>

            {/* Mark Done */}
            <button
              onClick={() => onDone?.(game)}
              disabled={game.status !== 'playing'}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors
                ${game.status === 'playing'
                  ? 'border-status-done text-status-done hover:bg-status-done/10'
                  : 'border-border-subtle text-text-muted opacity-30 cursor-not-allowed'
                }
              `}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Mark Done
            </button>

            {/* Delete — always available except when playing */}
            <button
              onClick={() => onDelete?.(game)}
              disabled={isPlaying}
              className={`
                ml-auto p-1.5 rounded-lg border transition-colors
                ${!isPlaying
                  ? 'border-transparent text-status-live hover:bg-status-live/10 hover:border-status-live/30'
                  : 'border-transparent text-text-muted opacity-30 cursor-not-allowed'
                }
              `}
              aria-label="Delete game"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Done state — no actions */}
        {isDone && (
          <div className="mt-3 flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-status-done opacity-60" />
            <span className="text-xs text-text-muted">Sudah selesai ditayangkan</span>

            {/* Still allow delete for done games */}
            <button
              onClick={() => onDelete?.(game)}
              className="ml-auto p-1.5 rounded-lg border border-transparent text-status-live hover:bg-status-live/10 hover:border-status-live/30 transition-colors"
              aria-label="Delete game"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameCard;

