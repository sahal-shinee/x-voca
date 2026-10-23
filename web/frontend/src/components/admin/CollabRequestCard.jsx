import React, { useState } from 'react';
import {
  ExternalLink,
  MessageSquare,
  Clock,
  CalendarPlus,
  FileText,
  Edit3,
  Trash2,
  Calendar,
  Share2,
  CheckCircle,
  Bookmark,
  Sparkles,
  Inbox,
  User,
  Radio
} from 'lucide-react';
import CustomSelect from '../common/CustomSelect';
import { safeFormatTimeAgo, safeFormatDate } from '../../utils/dateUtils';
import { STATUS_CONFIG } from './CollabRequestRow';

/**
 * Detect social platform from url or username
 */
const detectPlatform = (social) => {
  if (!social) return { label: 'PROFIL', color: 'text-text-muted bg-bg-surface border-border-subtle' };
  const s = social.toLowerCase();
  if (s.includes('youtube.com') || s.includes('youtu.be')) {
    return { label: 'YOUTUBE', color: 'text-red-500 bg-red-500/10 border-red-500/20' };
  }
  if (s.includes('twitch.tv')) {
    return { label: 'TWITCH', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' };
  }
  if (s.includes('twitter.com') || s.includes('x.com')) {
    return { label: 'X (TWITTER)', color: 'text-sky-400 bg-sky-400/10 border-sky-400/20' };
  }
  if (s.includes('tiktok.com')) {
    return { label: 'TIKTOK', color: 'text-pink-400 bg-pink-400/10 border-pink-400/20' };
  }
  if (s.includes('instagram.com')) {
    return { label: 'INSTAGRAM', color: 'text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/20' };
  }
  if (s.startsWith('http://') || s.startsWith('https://')) {
    return { label: 'LINK', color: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20' };
  }
  return { label: 'USER', color: 'text-accent-purple bg-accent-purple/10 border-accent-purple/20' };
};

/**
 * CollabRequestCard - Modern, rich, human-designed card for streamer collaboration requests
 */
export function CollabRequestCard({
  request,
  onUpdateStatus,
  onOpenNoteModal,
  onOpenMessageModal,
  onAddToSchedule,
  onDelete,
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
    created_at,
  } = request;

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const platform = detectPlatform(requested_streamer_social);

  const streamerInitial = requested_streamer_name
    ? requested_streamer_name.replace(/^@/, '').charAt(0).toUpperCase()
    : '?';

  const cleanName = requested_streamer_name.startsWith('@')
    ? requested_streamer_name
    : `@${requested_streamer_name}`;

  const formattedSocialLink = requested_streamer_social
    ? requested_streamer_social.startsWith('http://') || requested_streamer_social.startsWith('https://')
      ? requested_streamer_social
      : `https://${requested_streamer_social}`
    : null;

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

  const isScheduled = status === 'scheduled';
  const isApproved = status === 'approved';
  const isPending = status === 'pending';

  return (
    <div
      className={`
        relative bg-bg-card rounded-2xl border p-5 transition-all duration-200
        hover:shadow-md hover:bg-bg-card-hover flex flex-col justify-between gap-4
        ${isScheduled ? 'border-status-done/40 ring-1 ring-status-done/20' :
          isApproved ? 'border-accent-gold/40' :
          isPending ? 'border-accent-cyan/30' : 'border-border-subtle'}
      `}
    >
      {/* ── Top Row: Avatar, Streamer Name, Social Tag, Status Pill ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-base shadow-sm ${cfg.avatarStyle}`}
          >
            {streamerInitial}
          </div>

          {/* Info */}
          <div className="min-w-0">
            <h3 className="text-base font-bold text-text-primary truncate leading-tight">
              {cleanName}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${platform.color}`}>
                {platform.label}
              </span>
              <span className="text-[11px] text-text-muted flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                {safeFormatTimeAgo(created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Status Dropdown (Wide & Never Clipped) */}
        <div className="w-36 flex-shrink-0">
          <CustomSelect
            value={status}
            onChange={handleStatusChange}
            disabled={isUpdatingStatus}
            options={[
              { value: 'pending', label: 'BARU' },
              { value: 'approved', label: 'DISIMPAN' },
              { value: 'scheduled', label: 'DIJADWALKAN' },
              { value: 'rejected', label: 'ARSIP' },
            ]}
            size="sm"
            aria-label="Ubah Status Usulan"
          />
        </div>
      </div>

      {/* ── Social Link Preview (If Available) ── */}
      {requested_streamer_social && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-bg-surface border border-border-subtle text-xs">
          <span className="text-text-muted text-[11px]">Tautan:</span>
          <a
            href={formattedSocialLink || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-cyan hover:underline inline-flex items-center gap-1.5 font-mono truncate flex-1"
          >
            <span className="truncate">{requested_streamer_social}</span>
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
          </a>
        </div>
      )}

      {/* ── Viewer Pitch Quote Bubble ── */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-3.5 relative">
        <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
          <span className="inline-flex items-center gap-1.5 font-semibold text-text-secondary text-[11px]">
            <MessageSquare className="w-3.5 h-3.5 text-accent-cyan" />
            Ide & Pesan Penonton
          </span>
          {message && message.length > 90 && (
            <button
              type="button"
              onClick={() => onOpenMessageModal(request)}
              className="text-[10px] text-accent-cyan hover:underline font-mono"
            >
              Baca Selengkapnya
            </button>
          )}
        </div>
        {message ? (
          <p className="text-xs text-text-primary leading-relaxed line-clamp-3 italic">
            "{message}"
          </p>
        ) : (
          <p className="text-xs text-text-muted italic">Tidak ada pesan tambahan dari penonton.</p>
        )}
      </div>

      {/* ── Admin Note Box ── */}
      <div className="pt-1">
        {review_notes ? (
          <div
            onClick={() => onOpenNoteModal(request)}
            className="p-2.5 rounded-xl bg-accent-gold/5 border border-accent-gold/25 hover:border-accent-gold/45 cursor-pointer transition-all flex items-start justify-between gap-2"
            title="Klik untuk mengubah catatan admin"
          >
            <div className="flex items-start gap-2 min-w-0">
              <FileText className="w-3.5 h-3.5 text-accent-gold flex-shrink-0 mt-0.5" />
              <p className="text-xs font-mono text-text-primary line-clamp-2 leading-tight">
                {review_notes}
              </p>
            </div>
            <Edit3 className="w-3.5 h-3.5 text-text-muted hover:text-accent-gold flex-shrink-0 mt-0.5" />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onOpenNoteModal(request)}
            className="w-full py-1.5 px-3 rounded-xl border border-dashed border-border-subtle hover:border-accent-cyan/40 hover:bg-bg-surface text-[11px] font-mono text-text-muted hover:text-text-primary flex items-center justify-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>+ Tambah Catatan Koordinasi</span>
          </button>
        )}
      </div>

      {/* ── Action Buttons Footer ── */}
      <div className="pt-2 border-t border-border-subtle flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Jadwalkan Stream */}
          <button
            type="button"
            onClick={() => onAddToSchedule(request)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-accent-cyan/15 hover:bg-accent-cyan text-accent-cyan hover:text-bg-base border border-accent-cyan/35 hover:border-accent-cyan transition-all active:scale-95 shadow-sm"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>Jadwalkan Stream</span>
          </button>
        </div>

        {/* Hapus usulan */}
        <button
          type="button"
          onClick={() => onDelete(id)}
          className="p-1.5 rounded-lg text-text-muted hover:text-status-live hover:bg-status-live/10 transition-colors"
          title="Hapus usulan"
          aria-label="Hapus usulan"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default CollabRequestCard;
