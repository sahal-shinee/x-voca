import React, { useState } from 'react';
import {
  ExternalLink,
  MessageSquare,
  Clock,
  CalendarPlus,
  FileText,
  Edit3,
  Trash2,
  ChevronDown
} from 'lucide-react';
import Badge from '../common/Badge';
import { safeFormatTimeAgo, safeFormatDate } from '../../utils/dateUtils';

/**
 * Workflow status configurations (Opsi B: Alur Kerja Kreator)
 */
export const STATUS_CONFIG = {
  pending: {
    key: 'pending',
    label: 'BARU',
    badgeVariant: 'cyan',
    dotVariant: 'cyan',
    avatarStyle: 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30',
    description: 'Usulan baru dari viewer'
  },
  approved: {
    key: 'approved',
    label: 'DISIMPAN',
    badgeVariant: 'gold',
    dotVariant: 'gold',
    avatarStyle: 'bg-accent-gold/15 text-accent-gold border border-accent-gold/30',
    description: 'Ide terpilih (Shortlist)'
  },
  scheduled: {
    key: 'scheduled',
    label: 'DIJADWALKAN',
    badgeVariant: 'done',
    dotVariant: 'done',
    avatarStyle: 'bg-status-done/15 text-status-done border border-status-done/30',
    description: 'Sudah diagendakan stream'
  },
  rejected: {
    key: 'rejected',
    label: 'ARSIP',
    badgeVariant: 'default',
    dotVariant: 'default',
    avatarStyle: 'bg-border-subtle/50 text-text-muted border border-border-subtle',
    description: 'Diarsipkan / tidak jadi'
  }
};

/**
 * CollabRequestRow - Compact, informative table row for collab requests
 *
 * @param {Object} props
 * @param {Object} props.request - Collab request object
 * @param {Function} props.onUpdateStatus - (id, newStatus) => Promise<void>
 * @param {Function} props.onOpenNoteModal - (request) => void
 * @param {Function} props.onOpenMessageModal - (request) => void
 * @param {Function} props.onAddToSchedule - (request) => void
 * @param {Function} props.onDelete - (id) => void
 */
export function CollabRequestRow({
  request,
  onUpdateStatus,
  onOpenNoteModal,
  onOpenMessageModal,
  onAddToSchedule,
  onDelete
}) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  if (!request) return null;

  const {
    id,
    requested_streamer_name,
    requested_streamer_social,
    message,
    status = 'pending',
    review_notes,
    created_at
  } = request;

  const currentStatusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  // Safe streamer initial
  const streamerInitial = requested_streamer_name
    ? requested_streamer_name.replace(/^@/, '').charAt(0).toUpperCase()
    : '?';

  // Format social link with http/https prefix if missing
  const formattedSocialLink = requested_streamer_social
    ? requested_streamer_social.startsWith('http://') || requested_streamer_social.startsWith('https://')
      ? requested_streamer_social
      : `https://${requested_streamer_social}`
    : null;

  const isSocialLink = requested_streamer_social?.startsWith('http://') ||
                      requested_streamer_social?.startsWith('https://') ||
                      requested_streamer_social?.includes('/');

  // Format social display label
  let socialDisplay = null;
  if (requested_streamer_social) {
    if (isSocialLink) {
      try {
        const urlObj = new URL(formattedSocialLink);
        socialDisplay = urlObj.hostname.replace('www.', '') + (urlObj.pathname.length > 1 ? urlObj.pathname : '');
      } catch {
        socialDisplay = requested_streamer_social;
      }
    } else {
      socialDisplay = `@${requested_streamer_social.replace(/^@/, '')}`;
    }
  }

  // Handle status selection change
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === status) return;
    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus(id, newStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const isMessageLong = message && message.length > 70;

  return (
    <tr className="border-b border-border-subtle/60 hover:bg-bg-surface/50 transition-colors duration-150 group">
      {/* 1. STREAMER INFO */}
      <td className="py-3.5 px-4 align-top">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-bold text-sm select-none ${currentStatusConfig.avatarStyle}`}
          >
            {streamerInitial}
          </div>
          <div className="min-w-0 max-w-[200px]">
            <p className="text-sm font-semibold text-text-primary truncate font-display" title={requested_streamer_name}>
              {requested_streamer_name.startsWith('@') ? requested_streamer_name : `@${requested_streamer_name}`}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-text-muted mt-0.5">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>{safeFormatTimeAgo(created_at)}</span>
            </div>
          </div>
        </div>
      </td>

      {/* 2. SALURAN / SOSMED */}
      <td className="py-3.5 px-4 align-top">
        {requested_streamer_social ? (
          <div className="flex items-center gap-1.5 flex-wrap max-w-[190px]">
            <span
              className={`text-[9px] px-1.5 py-0.5 font-mono uppercase rounded border tracking-wider ${
                isSocialLink
                  ? 'bg-accent-cyan/10 border-accent-cyan/20 text-accent-cyan'
                  : 'bg-accent-purple/10 border-accent-purple/20 text-accent-purple'
              }`}
            >
              {isSocialLink ? 'LINK' : 'USER'}
            </span>
            <a
              href={formattedSocialLink || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-cyan hover:underline inline-flex items-center gap-1 text-xs font-mono truncate max-w-[140px]"
              title={requested_streamer_social}
            >
              <span className="truncate">{socialDisplay}</span>
              <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-70 group-hover:opacity-100" />
            </a>
          </div>
        ) : (
          <span className="text-xs text-text-muted font-mono">-</span>
        )}
      </td>

      {/* 3. PESAN VIEWER */}
      <td className="py-3.5 px-4 align-top max-w-[260px]">
        {message ? (
          <div className="space-y-1">
            <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 italic">
              "{message}"
            </p>
            {isMessageLong && (
              <button
                type="button"
                onClick={() => onOpenMessageModal(request)}
                className="text-[11px] font-mono text-accent-cyan hover:underline inline-flex items-center gap-1"
              >
                <MessageSquare className="w-3 h-3" />
                <span>Lihat lengkap</span>
              </button>
            )}
          </div>
        ) : (
          <span className="text-xs text-text-muted italic">- Tidak ada pesan -</span>
        )}
      </td>

      {/* 4. STATUS WORKFLOW (Interactive Pill / Dropdown) */}
      <td className="py-3.5 px-4 align-top">
        <div className="relative inline-block">
          <select
            value={status}
            onChange={handleStatusChange}
            disabled={isUpdatingStatus}
            aria-label="Ubah Status Usulan"
            className={`
              appearance-none cursor-pointer pl-2.5 pr-6 py-1 rounded-lg text-[11px] font-mono font-semibold uppercase
              border transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-accent-cyan
              ${
                status === 'pending'
                  ? 'bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/20'
                  : status === 'approved'
                  ? 'bg-accent-gold/10 border-accent-gold/30 text-accent-gold hover:bg-accent-gold/20'
                  : status === 'scheduled'
                  ? 'bg-status-done/10 border-status-done/30 text-status-done hover:bg-status-done/20'
                  : 'bg-border-subtle/40 border-border-subtle text-text-muted hover:text-text-secondary'
              }
            `}
          >
            <option value="pending" className="bg-bg-surface text-text-primary">
              BARU
            </option>
            <option value="approved" className="bg-bg-surface text-text-primary">
              DISIMPAN
            </option>
            <option value="scheduled" className="bg-bg-surface text-text-primary">
              DIJADWALKAN
            </option>
            <option value="rejected" className="bg-bg-surface text-text-primary">
              ARSIP
            </option>
          </select>
          <ChevronDown className="w-3 h-3 text-current opacity-70 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
        </div>
      </td>

      {/* 5. CATATAN ADMIN (Notes Live) */}
      <td className="py-3.5 px-4 align-top max-w-[220px]">
        {review_notes ? (
          <div
            onClick={() => onOpenNoteModal(request)}
            className="p-2 rounded-xl bg-bg-surface/80 border border-border-subtle/80 hover:border-accent-cyan/40 cursor-pointer transition-all group/note"
            title="Klik untuk mengubah catatan"
          >
            <div className="flex items-start justify-between gap-1.5">
              <div className="flex items-start gap-1.5 min-w-0">
                <FileText className="w-3.5 h-3.5 text-accent-gold flex-shrink-0 mt-0.5" />
                <p className="text-xs text-text-primary font-mono line-clamp-2 leading-tight">
                  {review_notes}
                </p>
              </div>
              <Edit3 className="w-3 h-3 text-text-muted group-hover/note:text-accent-cyan flex-shrink-0 mt-0.5" />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onOpenNoteModal(request)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-text-muted hover:text-text-primary border border-dashed border-border-subtle hover:border-border-active hover:bg-bg-surface flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3 h-3" />
            <span>+ Catatan</span>
          </button>
        )}
      </td>

      {/* 6. AKSI CEPAT */}
      <td className="py-3.5 px-4 align-top text-right">
        <div className="flex items-center justify-end gap-1.5">
          {/* Tombol Jadwalkan Stream */}
          <button
            type="button"
            onClick={() => onAddToSchedule(request)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium bg-accent-cyan/10 hover:bg-accent-cyan text-accent-cyan hover:text-text-on-cta border border-accent-cyan/30 hover:border-accent-cyan flex items-center gap-1.5 transition-all duration-150 shadow-sm"
            title="Buka form jadwal stream dengan data streamer ini"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Jadwalkan</span>
          </button>

          {/* Tombol Hapus */}
          <button
            type="button"
            onClick={() => onDelete(id)}
            className="p-1.5 text-text-muted hover:text-status-live hover:bg-status-live/10 rounded-lg transition-colors"
            title="Hapus Usulan"
            aria-label="Hapus Usulan"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default CollabRequestRow;

