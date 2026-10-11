import { useState } from 'react';
import {
  ExternalLink,
  MessageSquare,
  Clock,
  Check,
  X,
  Trash2,
  CalendarPlus,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

/**
 * Format relative time in Indonesian
 */
function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Baru saja';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} hari yang lalu`;

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * CollabRequestCard - Card component for displaying and moderating a collab request
 *
 * @param {Object} props
 * @param {Object} props.request - Collab request object
 * @param {Function} props.onApprove - (id, notes) => Promise|void
 * @param {Function} props.onReject - (id, notes) => Promise|void
 * @param {Function} props.onDelete - (id) => Promise|void
 * @param {Function} props.onAddToSchedule - (request) => void
 */
export function CollabRequestCard({
  request,
  onApprove,
  onReject,
  onDelete,
  onAddToSchedule
}) {
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [reviewNoteInput, setReviewNoteInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!request) return null;

  const {
    id,
    requested_streamer_name,
    requested_streamer_social,
    message,
    status = 'pending',
    reviewer,
    reviewed_at,
    review_notes,
    created_at
  } = request;

  // Status badge config
  const statusConfig = {
    pending: { label: 'PENDING', variant: 'gold' },
    approved: { label: 'APPROVED', variant: 'done' },
    rejected: { label: 'REJECTED', variant: 'live' },
    expired: { label: 'EXPIRED', variant: 'default' }
  };

  const currentStatus = statusConfig[status] || statusConfig.pending;

  // Handle Approve with optional notes
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(id, reviewNoteInput || undefined);
      setIsNotesOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Reject with optional notes
  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await onReject(id, reviewNoteInput || undefined);
      setIsNotesOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format social link with http prefix if missing
  const formattedSocialLink = requested_streamer_social
    ? requested_streamer_social.startsWith('http://') || requested_streamer_social.startsWith('https://')
      ? requested_streamer_social
      : `https://${requested_streamer_social}`
    : null;

  const streamerInitial = requested_streamer_name
    ? requested_streamer_name.replace(/^@/, '').charAt(0).toUpperCase()
    : '?';

  return (
    <div
      className={`
        bg-bg-card rounded-2xl p-5 border
        transition-all duration-200 ease-out
        hover:shadow-card hover:border-border-active
        ${status === 'pending' ? 'border-border-subtle bg-bg-card' : ''}
        ${status === 'approved' ? 'border-accent-cyan/20 bg-gradient-to-br from-accent-cyan/5 via-bg-card to-bg-card' : ''}
        ${status === 'rejected' ? 'border-status-live/20 bg-bg-card/80 opacity-80 hover:opacity-100' : ''}
      `}
    >
      {/* HEADER SECTION */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar Icon */}
          <div
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-bold text-base
              ${
                status === 'approved'
                  ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30'
                  : status === 'rejected'
                  ? 'bg-status-live/15 text-status-live border border-status-live/30'
                  : 'bg-accent-purple/15 text-accent-purple border border-accent-purple/30'
              }
            `}
          >
            {streamerInitial}
          </div>

          <div className="min-w-0">
            <h3 className="text-base font-semibold text-text-primary truncate font-display flex items-center gap-1.5">
              <span>{requested_streamer_name.startsWith('@') ? requested_streamer_name : `@${requested_streamer_name}`}</span>
            </h3>

            {/* Time ago */}
            <div className="flex items-center gap-1.5 text-xs text-text-muted mt-0.5">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Diajukan {formatTimeAgo(created_at)}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <Badge variant={currentStatus.variant} size="sm" dot>
          {currentStatus.label}
        </Badge>
      </div>

      {/* SOCIAL MEDIA LINK */}
      {requested_streamer_social && (
        <div className="mb-3 text-xs flex items-center gap-2">
          <span className="text-text-muted font-mono">Social:</span>
          <a
            href={formattedSocialLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-cyan hover:underline inline-flex items-center gap-1 truncate font-mono text-[11px]"
            title={requested_streamer_social}
          >
            <span className="truncate">{requested_streamer_social}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        </div>
      )}

      {/* VIEWER MESSAGE */}
      {message && (
        <div className="mb-4 p-3 rounded-xl bg-bg-surface/70 border border-border-subtle/60 text-sm">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-accent-purple/80 flex-shrink-0 mt-0.5" />
            <p className="text-text-secondary italic text-xs leading-relaxed">
              "{message}"
            </p>
          </div>
        </div>
      )}

      {/* REVIEW DETAILS (IF REVIEWED) */}
      {(reviewer || reviewed_at || review_notes) && (
        <div className="mb-4 pt-2 border-t border-border-subtle/50 text-[11px] text-text-muted flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan flex-shrink-0" />
            <span>
              Direview oleh <strong className="text-text-secondary">{reviewer?.name || 'Admin'}</strong>
              {reviewed_at ? ` • ${formatTimeAgo(reviewed_at)}` : ''}
            </span>
          </div>
          {review_notes && (
            <p className="pl-5 text-text-secondary font-mono text-[10px]">
              Catatan: {review_notes}
            </p>
          )}
        </div>
      )}

      {/* OPTIONAL NOTES INPUT TOGGLE */}
      {isNotesOpen && (
        <div className="mb-4 pt-3 border-t border-border-subtle animate-fade-in">
          <label className="block text-[11px] font-mono text-text-muted mb-1.5">
            Catatan Review (Opsional):
          </label>
          <input
            type="text"
            value={reviewNoteInput}
            onChange={(e) => setReviewNoteInput(e.target.value)}
            placeholder="Tulis alasan atau catatan untuk arsip..."
            className="w-full px-3 py-1.5 text-xs bg-bg-surface border border-border-subtle rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-cyan"
          />
        </div>
      )}

      {/* ACTIONS FOOTER */}
      <div className="pt-3 border-t border-border-subtle/60 flex items-center justify-between gap-2 flex-wrap">
        {/* Left: Notes Toggle & Delete */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsNotesOpen(!isNotesOpen)}
            className="text-[11px] font-mono text-text-muted hover:text-text-primary px-2 py-1 rounded hover:bg-bg-surface flex items-center gap-1 transition-colors"
          >
            <span>{isNotesOpen ? 'Tutup Catatan' : '+ Catatan'}</span>
            {isNotesOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(id)}
              className="p-1.5 text-text-muted hover:text-status-live hover:bg-status-live/10 rounded-lg transition-colors"
              title="Hapus Request"
              aria-label="Hapus Request"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Primary Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Approved state: Add to Schedule action */}
          {status === 'approved' && onAddToSchedule && (
            <Button
              size="sm"
              variant="primary"
              leftIcon={CalendarPlus}
              onClick={() => onAddToSchedule(request)}
            >
              Add to Schedule
            </Button>
          )}

          {/* Pending state: Approve and Reject buttons */}
          {status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="outline"
                loading={isSubmitting}
                leftIcon={Check}
                onClick={handleApprove}
                className="hover:bg-accent-cyan hover:text-text-on-cta transition-colors"
              >
                Approve
              </Button>

              <Button
                size="sm"
                variant="danger"
                loading={isSubmitting}
                leftIcon={X}
                onClick={handleReject}
              >
                Reject
              </Button>
            </>
          )}

          {/* If already approved, allow revoking/rejecting */}
          {status === 'approved' && (
            <Button
              size="sm"
              variant="ghost"
              loading={isSubmitting}
              leftIcon={X}
              onClick={handleReject}
              className="text-text-muted hover:text-status-live hover:bg-status-live/10 text-xs"
            >
              Tolak
            </Button>
          )}

          {/* If already rejected, allow re-approving */}
          {status === 'rejected' && (
            <Button
              size="sm"
              variant="outline"
              loading={isSubmitting}
              leftIcon={Check}
              onClick={handleApprove}
            >
              Setujui
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CollabRequestCard;
