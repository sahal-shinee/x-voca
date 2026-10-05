import { useCountdown, formatCountdown } from '../../hooks/useCountdown';

/**
 * CountdownCard Component
 * Komponen countdown reusable untuk menampilkan waktu mundur ke jadwal stream berikutnya
 * Referensi: UI_SPEC_WEB.md Section 1.1 Countdown Card
 */
const CountdownCard = ({ schedule, isLoading = false, error = null }) => {
  const timeLeft = useCountdown(schedule?.scheduled_at);
  const { display, isLive } = formatCountdown(timeLeft);

  // Format WIB time
  const formatWIB = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-bg-card border border-border-subtle rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono text-text-secondary uppercase tracking-wider">
            📡 Stream Berikutnya
          </span>
          <span className="text-xs font-mono text-text-muted">● Loading...</span>
        </div>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 bg-bg-input rounded-lg p-4 text-center">
              <div className="h-12 w-12 mx-auto bg-bg-card rounded mb-2 animate-shimmer"></div>
              <span className="text-xs text-text-muted uppercase">...</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-bg-card border border-status-live/40 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono text-text-secondary uppercase tracking-wider">
            📡 Stream Berikutnya
          </span>
          <span className="text-xs font-mono text-status-live">● Error</span>
        </div>
        <p className="text-sm text-text-muted text-center py-4">
          Gagal memuat jadwal. Coba refresh halaman.
        </p>
      </div>
    );
  }

  // No schedule state
  if (!schedule) {
    return (
      <div className="bg-bg-card border border-border-subtle rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono text-text-secondary uppercase tracking-wider">
            📡 Stream Berikutnya
          </span>
          <span className="text-xs font-mono text-text-muted">● Tidak Ada</span>
        </div>
        <div className="text-center py-4">
          <p className="text-text-muted text-sm">Tidak ada jadwal stream mendatang</p>
          <p className="text-text-muted text-xs mt-1">Pastikan Creator membuat jadwal baru</p>
        </div>
      </div>
    );
  }

  // Live state
  if (isLive) {
    return (
      <div className="bg-bg-card border-l-4 border-status-live rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-text-secondary uppercase tracking-wider">
            📡 Sedang Live
          </span>
          <span className="flex items-center gap-2 text-xs font-mono text-status-live">
            <span className="w-2 h-2 bg-status-live rounded-full animate-pulse"></span>
            LIVE NOW
          </span>
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">{schedule.title}</h3>
        <p className="text-sm text-text-secondary mb-3">{schedule.game_category}</p>
        <a
          href={schedule.youtube_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-status-live/20 border border-status-live/40 text-status-live text-sm font-semibold rounded-lg hover:bg-status-live/30 transition-colors"
        >
          <span>●</span> Tonton Siaran Sekarang
        </a>
      </div>
    );
  }

  // Countdown state - sesuai mockup
  return (
    <div className="bg-bg-card border border-border-subtle rounded-xl p-5">
      {/* Header - sesuai mockup */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono text-text-secondary uppercase tracking-wider">
          📡 STREAM BERIKUTNYA
        </span>
        <span className="text-xs font-mono text-accent-cyan">
          ● SYNCED {formatWIB(schedule.scheduled_at)} WIB
        </span>
      </div>

      {/* Schedule Title */}
      <h3 className="text-sm font-semibold text-text-primary mb-1 line-clamp-2">
        {schedule.title}
      </h3>
      {schedule.game_category && (
        <p className="text-xs text-text-muted mb-4">{schedule.game_category}</p>
      )}

      {/* Countdown Timer - sesuai mockup */}
      <div className="flex gap-2 mb-4">
        {/* JAM */}
        <div className="flex-1 bg-bg-input rounded-lg p-3 text-center">
          <div className="text-[48px] font-bold font-mono text-accent-cyan leading-none">
            {String(timeLeft.hours || 0).padStart(2, '0')}
          </div>
          <span className="text-[11px] text-text-secondary uppercase tracking-wider">Jam</span>
        </div>
        {/* MIN */}
        <div className="flex-1 bg-bg-input rounded-lg p-3 text-center">
          <div className="text-[48px] font-bold font-mono text-accent-cyan leading-none">
            {String(timeLeft.minutes || 0).padStart(2, '0')}
          </div>
          <span className="text-[11px] text-text-secondary uppercase tracking-wider">Min</span>
        </div>
        {/* DET */}
        <div className="flex-1 bg-bg-input rounded-lg p-3 text-center">
          <div className="text-[48px] font-bold font-mono text-accent-cyan leading-none">
            {String(timeLeft.seconds || 0).padStart(2, '0')}
          </div>
          <span className="text-[11px] text-text-secondary uppercase tracking-wider">Det</span>
        </div>
      </div>

      {/* Footer - sesuai mockup */}
      <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
        <span className="text-[13px] text-text-secondary line-clamp-1">
          ✦ {schedule.title || 'Stream berikutnya'}
        </span>
        <span className="text-[13px] font-semibold text-accent-cyan uppercase tracking-wider">
          Reserve
        </span>
      </div>
    </div>
  );
};

export default CountdownCard;
