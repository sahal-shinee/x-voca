import { useCountdown, formatCountdown } from '../../hooks/useCountdown';

/**
 * ScheduleCard Component
 * Komponen card untuk menampilkan jadwal stream
 */
const ScheduleCard = ({ schedule, variant = 'upcoming' }) => {
  const timeLeft = useCountdown(schedule?.scheduled_at);
  const { display, isLive } = formatCountdown(timeLeft);

  // Format date untuk ditampilkan
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const time = date.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
    });

    if (isToday) return `Hari ini · ${time} WIB`;
    if (isTomorrow) return `Besok · ${time} WIB`;

    return date.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB';
  };

  // Get status based on variant
  const getStatus = () => {
    if (variant === 'live' || isLive) return 'live';
    if (variant === 'upcoming') return 'upcoming';
    return schedule?.status || 'upcoming';
  };

  const status = getStatus();

  // Border color based on status
  const getBorderClass = () => {
    switch (status) {
      case 'live':
        return 'border-l-4 border-l-status-live';
      case 'upcoming':
        return 'border-l-4 border-l-accent-cyan';
      default:
        return 'border-l-4 border-l-accent-purple';
    }
  };

  // Badge color based on status
  const getBadgeClass = () => {
    switch (status) {
      case 'live':
        return 'bg-status-live-bg text-status-live';
      case 'upcoming':
        return 'bg-accent-cyan/10 text-accent-cyan';
      default:
        return 'bg-accent-purple/20 text-accent-purple';
    }
  };

  return (
    <div
      className={`
        bg-bg-card border border-border-subtle rounded-2xl p-6
        transition-all duration-200 hover:bg-bg-card-hover hover:border-border-active
        ${getBorderClass()}
      `}
    >
      {/* Badges Row */}
      <div className="flex items-center gap-2 mb-4">
        {/* Status Badge */}
        <span
          className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-mono uppercase tracking-wider
            ${getBadgeClass()}
          `}
        >
          {status === 'live' && (
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse"></span>
          )}
          {status === 'live' ? 'Live Now' : 'Upcoming'}
        </span>

        {/* Genre Badge */}
        {schedule?.game_category && (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono text-text-muted bg-bg-input">
            {schedule.game_category}
          </span>
        )}
      </div>

      {/* Game Icon */}
      <div className="w-12 h-12 rounded-xl bg-bg-input flex items-center justify-center mb-4">
        <svg
          className="w-6 h-6 text-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
          />
        </svg>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-text-primary mb-2 line-clamp-2">
        {schedule?.title || 'Judul Stream'}
      </h3>

      {/* Collab Indicator */}
      {schedule?.collab_guest && (
        <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg bg-accent-purple/10 border border-accent-purple/20 text-xs text-accent-purple">
          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="font-medium truncate">
            Collab with: {schedule.collab_guest.startsWith('@') ? schedule.collab_guest : `@${schedule.collab_guest}`}
          </span>
        </div>
      )}

      {/* Date/Time */}
      <p className="text-sm text-text-secondary mb-3">
        {formatDate(schedule?.scheduled_at)}
      </p>

      {/* Countdown or Status */}
      <div className="mb-4">
        {status === 'live' ? (
          <p className="text-sm font-semibold text-status-live flex items-center gap-2">
            <span className="w-2 h-2 bg-status-live rounded-full animate-pulse"></span>
            Sedang Berlangsung
          </p>
        ) : (
          <p className="text-sm text-text-muted">
            dalam {display}
          </p>
        )}
      </div>

      {/* CTA Button */}
      {status === 'live' ? (
        <a
          href={schedule?.youtube_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 text-center bg-status-live/10 border border-status-live/30 text-status-live font-semibold text-sm rounded-lg hover:bg-status-live/20 transition-colors"
        >
          Tonton Siaran Sekarang →
        </a>
      ) : (
        <a
          href={schedule?.youtube_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 text-center text-text-secondary text-sm hover:text-text-primary transition-colors"
        >
          Lihat Detail →
        </a>
      )}

      {/* Footer Info */}
      {schedule?.stream_platform && (
        <div className="mt-4 pt-3 border-t border-border-subtle">
          <p className="text-xs text-text-muted flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {schedule.stream_platform}
          </p>
        </div>
      )}
    </div>
  );
};

// Skeleton loader
export const ScheduleCardSkeleton = () => (
  <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 animate-pulse">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-20 h-6 bg-bg-input rounded-full"></div>
      <div className="w-16 h-6 bg-bg-input rounded-full"></div>
    </div>
    <div className="w-12 h-12 bg-bg-input rounded-xl mb-4"></div>
    <div className="h-5 bg-bg-input rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-bg-input rounded w-1/2 mb-4"></div>
    <div className="h-4 bg-bg-input rounded w-2/3 mb-6"></div>
    <div className="h-10 bg-bg-input rounded-lg"></div>
  </div>
);

export default ScheduleCard;
