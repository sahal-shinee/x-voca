import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar,
  Clock,
  Play,
  Users,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  Loader2,
  Check,
  X,
  Radio,
  Tv,
  Eye,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  Info
} from 'lucide-react';
import { youtubeAPI } from '../../services/api';
import { getGames } from '../../services/gameService';
import Toggle from '../common/Toggle';
import CustomSelect from '../common/CustomSelect';
import { useTheme } from '../../hooks/useTheme';

/**
 * Extract YouTube video ID from various URL formats
 */
const extractYouTubeVideoId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/))([\w-]{11})/);
  return match ? match[1] : null;
};

/**
 * Calculate dynamic countdown text for preview
 */
const getPreviewCountdown = (date, time) => {
  if (!date || !time) return null;
  try {
    const target = new Date(`${date}T${time}:00`);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    if (isNaN(diffMs)) return null;
    if (diffMs <= 0) return 'Siaran berlangsung atau telah lewat';
    const totalSecs = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    if (days > 0) return `${days} Hari ${hours} Jam Lagi`;
    if (hours > 0) return `${hours} Jam ${mins} Menit Lagi`;
    return `${mins} Menit Lagi`;
  } catch {
    return null;
  }
};

/**
 * Format date nicely for preview card
 */
const formatPreviewDate = (dateStr, timeStr) => {
  if (!dateStr) return 'Tanggal belum diatur';
  try {
    const [year, month, day] = dateStr.split('-');
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    const dateFormatted = d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    return `${dateFormatted}${timeStr ? ` • ${timeStr} WIB` : ''}`;
  } catch {
    return dateStr;
  }
};

/**
 * ScheduleFormPanel - Studio Broadcast Deck untuk Tambah & Edit Jadwal Siaran
 * Desain Split-Pane Bersih: Form Kontrol (Kiri) + Live Fansite Card Preview (Kanan)
 * Mendukung penuh Light & Dark mode tanpa AI-slop atau emoji berlebihan.
 */
function ScheduleFormPanel({
  isOpen,
  onClose,
  onSave,
  schedule = null,
  loading = false,
  initialCollabData = null,
}) {
  const isEdit = !!(schedule && schedule.id);
  const isFromCollab = !isEdit && !!initialCollabData;

  // Retrieve active theme to scope the portal properly
  let theme = 'dark';
  try {
    const themeContext = useTheme();
    if (themeContext?.theme) theme = themeContext.theme;
  } catch {
    theme = 'dark';
  }

  const [formData, setFormData] = useState({
    title: '',
    game_category: '',
    date: '',
    time: '',
    collab_guest: '',
    collab_social: '',
    youtube_url: '',
    countdown_enabled: true,
  });

  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeError, setYoutubeError] = useState('');
  const [youtubeSuccess, setYoutubeSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [showCollab, setShowCollab] = useState(false);

  // Accepted games from voting system
  const [acceptedGames, setAcceptedGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(false);

  // Initialize form data when schedule changes or opens
  useEffect(() => {
    if (schedule) {
      let dateStr = '';
      let timeStr = '';
      const rawDate = schedule.scheduled_at || schedule.datetime || schedule.date;
      if (rawDate) {
        try {
          const parsed = new Date(rawDate);
          if (!isNaN(parsed.getTime())) {
            dateStr = parsed.toISOString().split('T')[0];
            timeStr = parsed.toTimeString().slice(0, 5);
          }
        } catch {
          dateStr = '';
          timeStr = '';
        }
      }

      const hasCollab = !!(schedule.collab_guest || schedule.collab_social);
      setFormData({
        title: schedule.title || '',
        game_category: schedule.game_category || schedule.category || '',
        date: dateStr,
        time: timeStr,
        collab_guest: schedule.collab_guest || '',
        collab_social: schedule.collab_social || '',
        youtube_url: schedule.youtube_url || '',
        countdown_enabled: schedule.countdown_enabled !== false,
      });
      setShowCollab(hasCollab);
    } else if (initialCollabData) {
      const guestName = initialCollabData.collab_guest || '';
      const guestSocial = initialCollabData.collab_social || '';
      setFormData({
        title: '',
        game_category: '',
        date: '',
        time: '',
        collab_guest: guestName,
        collab_social: guestSocial,
        youtube_url: '',
        countdown_enabled: true,
      });
      setShowCollab(true);
    } else {
      setFormData({
        title: '',
        game_category: '',
        date: '',
        time: '',
        collab_guest: '',
        collab_social: '',
        youtube_url: '',
        countdown_enabled: true,
      });
      setShowCollab(false);
    }
    setErrors({});
    setYoutubeError('');
    setYoutubeSuccess(false);
  }, [schedule, initialCollabData, isOpen]);

  // Fetch accepted games from voting system
  useEffect(() => {
    const fetchAcceptedGames = async () => {
      if (!isOpen) return;

      setGamesLoading(true);
      try {
        const response = await getGames({ status: 'accepted' });
        if (response?.data && Array.isArray(response.data)) {
          setAcceptedGames(response.data);
        } else if (response?.success && Array.isArray(response)) {
          setAcceptedGames(response);
        }
      } catch (err) {
        console.error('Error fetching accepted games:', err);
        setAcceptedGames([]);
      } finally {
        setGamesLoading(false);
      }
    };

    fetchAcceptedGames();
  }, [isOpen]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Smart Presets for quick timing
  const handleApplyPreset = (presetType) => {
    const now = new Date();
    if (presetType === 'tonight') {
      const dateStr = now.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: dateStr, time: '19:30' }));
    } else if (presetType === 'tomorrow') {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: dateStr, time: '20:00' }));
    } else if (presetType === 'weekend') {
      const weekend = new Date(now);
      const day = weekend.getDay();
      const diff = day === 6 ? 0 : (6 - day);
      weekend.setDate(weekend.getDate() + (diff === 0 ? 0 : diff));
      const dateStr = weekend.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: dateStr, time: '13:00' }));
    }
    if (errors.date || errors.time) {
      setErrors(prev => ({ ...prev, date: '', time: '' }));
    }
  };

  const isPresetActive = (presetType) => {
    const now = new Date();
    if (presetType === 'tonight') {
      return formData.date === now.toISOString().split('T')[0] && formData.time === '19:30';
    }
    if (presetType === 'tomorrow') {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return formData.date === tomorrow.toISOString().split('T')[0] && formData.time === '20:00';
    }
    if (presetType === 'weekend') {
      const weekend = new Date(now);
      const day = weekend.getDay();
      const diff = day === 6 ? 0 : (6 - day);
      weekend.setDate(weekend.getDate() + (diff === 0 ? 0 : diff));
      return formData.date === weekend.toISOString().split('T')[0] && formData.time === '13:00';
    }
    return false;
  };

  // Handle YouTube auto-fill
  const handleYoutubeFetch = async () => {
    if (!formData.youtube_url) {
      setYoutubeError('Masukkan tautan YouTube terlebih dahulu');
      return;
    }

    setYoutubeLoading(true);
    setYoutubeError('');
    setYoutubeSuccess(false);

    try {
      const response = await youtubeAPI.fetch(formData.youtube_url);
      if (response.data?.data) {
        const data = response.data.data;
        setFormData(prev => ({
          ...prev,
          title: data.title || prev.title,
          game_category: data.category || prev.game_category,
        }));
        setYoutubeSuccess(true);
        setTimeout(() => setYoutubeSuccess(false), 3500);
      }
    } catch (error) {
      console.error('YouTube fetch error:', error);
      setYoutubeError(error.response?.data?.message || 'Gagal mengambil data dari tautan YouTube');
    } finally {
      setYoutubeLoading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Judul siaran wajib diisi';
    }
    if (!formData.date) {
      newErrors.date = 'Tanggal wajib diisi';
    }
    if (!formData.time) {
      newErrors.time = 'Waktu siaran wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const scheduled_at = new Date(`${formData.date}T${formData.time}:00`).toISOString();

    onSave({
      title: formData.title,
      game_category: formData.game_category,
      scheduled_at,
      youtube_url: formData.youtube_url || undefined,
      collab_guest: formData.collab_guest || undefined,
      collab_social: formData.collab_social || undefined,
      countdown_enabled: formData.countdown_enabled,
    });
  };

  // Animation state & Escape key handling
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = '';
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  // Extract video ID for real-time preview thumbnail
  const videoId = extractYouTubeVideoId(formData.youtube_url);
  const previewThumbnail = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null;
  const countdownPreview = getPreviewCountdown(formData.date, formData.time);

  return createPortal(
    <div
      data-admin-theme={theme}
      data-theme={theme}
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 lg:p-6 overflow-hidden transition-all duration-200 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modern Center Studio Split-Pane Dialog */}
      <div
        className={`
          relative w-full max-w-5xl max-h-[92vh]
          bg-bg-card border border-border-subtle rounded-3xl shadow-2xl
          flex flex-col z-10 overflow-hidden
          transition-all duration-200 ease-out
          ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-2 opacity-0'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Clean, Spacious Header */}
        <div className="px-7 py-5.5 sm:px-8 sm:py-6 border-b border-border-subtle flex items-center justify-between flex-shrink-0 bg-bg-surface/85 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/25 flex items-center justify-center shrink-0 shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-text-primary leading-tight">
                {isEdit ? 'Edit Jadwal Siaran' : 'Tambah Jadwal Siaran'}
              </h2>
              <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                {isFromCollab && initialCollabData?.collab_guest
                  ? `Jadwal dari usulan kolaborasi bersama @${initialCollabData.collab_guest.replace(/^@/, '')}`
                  : 'Atur jadwal penayangan siaran langsung untuk portal penonton'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors border border-transparent hover:border-border-subtle shrink-0"
            title="Tutup (Esc)"
            aria-label="Tutup Form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Split-Pane Content Hub */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* ================================================================= */}
          {/* LEFT COLUMN: Controls & Form Inputs (7 cols = ~58%)               */}
          {/* ================================================================= */}
          <form
            id="schedule-form"
            onSubmit={handleSubmit}
            className="lg:col-span-7 flex flex-col min-h-0 overflow-y-auto px-7 py-6 sm:px-8 sm:py-7 space-y-6 border-b lg:border-b-0 lg:border-r border-border-subtle overscroll-contain"
          >
            {/* Tautan YouTube Auto-Fill */}
            <div className="p-4 bg-bg-surface border border-border-subtle rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-text-secondary flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 text-red-500 fill-current" />
                  <span>Tautan YouTube</span>
                  <span className="text-[11px] text-text-muted font-normal">(Opsional)</span>
                </label>

                {formData.youtube_url && (
                  <a
                    href={formData.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent-cyan hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Uji Tautan</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="url"
                  name="youtube_url"
                  value={formData.youtube_url}
                  onChange={handleChange}
                  placeholder="https://youtube.com/live/... atau https://youtu.be/..."
                  className="flex-1 px-3.5 py-2.5 bg-bg-input border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-colors"
                />
                <button
                  type="button"
                  onClick={handleYoutubeFetch}
                  disabled={youtubeLoading || !formData.youtube_url}
                  className="px-4 py-2.5 bg-bg-card border border-border-subtle hover:border-accent-cyan/50 text-text-primary rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 hover:bg-bg-surface"
                >
                  {youtubeLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-cyan" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5 text-accent-cyan" />
                  )}
                  <span>{youtubeLoading ? 'Mengambil...' : 'Ambil Info'}</span>
                </button>
              </div>

              {youtubeError && (
                <div className="flex items-center gap-2 text-xs text-status-live bg-status-live/10 border border-status-live/20 px-3 py-2 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{youtubeError}</span>
                </div>
              )}

              {youtubeSuccess && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Data judul dan kategori berhasil diekstrak otomatis.</span>
                </div>
              )}

              <p className="text-[11px] text-text-muted leading-relaxed">
                Tempel tautan video atau live stream YouTube untuk mengisi judul dan thumbnail secara otomatis.
              </p>
            </div>

            {/* Judul Siaran */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-text-secondary">
                  Judul Siaran <span className="text-status-live">*</span>
                </label>
                <span className={`text-[11px] font-medium ${formData.title.length > 70 ? 'text-amber-500' : 'text-text-muted'}`}>
                  {formData.title.length}/80
                </span>
              </div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Contoh: Sesi Mabar & Obrolan Santai Akhir Pekan"
                maxLength={80}
                className={`w-full px-3.5 py-2.5 bg-bg-input border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-colors ${
                  errors.title ? 'border-status-live' : 'border-border-subtle'
                }`}
              />
              {errors.title && (
                <p className="text-xs text-status-live mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.title}</span>
                </p>
              )}
            </div>

            {/* Kategori Siaran / Game */}
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                Kategori Siaran atau Game
              </label>
              <CustomSelect
                name="game_category"
                value={formData.game_category}
                onChange={handleChange}
                disabled={gamesLoading}
                placeholder="Pilih kategori atau game..."
                options={[
                  ...(acceptedGames.length > 0
                    ? acceptedGames.map(game => ({
                        value: game.title,
                        label: `${game.title} (${game.vote_count || 0} suara)`,
                        badge: 'Voting',
                      }))
                    : []),
                  { value: 'SURVIVAL HORROR', label: 'Survival Horror' },
                  { value: 'ACTION RPG', label: 'Action RPG' },
                  { value: 'ADVENTURE', label: 'Adventure' },
                  { value: 'SIMULATION', label: 'Simulation' },
                  { value: 'STRATEGY', label: 'Strategy' },
                  { value: 'INDIE', label: 'Indie' },
                  { value: 'RETRO', label: 'Retro' },
                  { value: 'MULTIPLAYER', label: 'Multiplayer' },
                  { value: 'JUST CHATTING', label: 'Just Chatting' },
                  { value: 'SPECIAL EVENT', label: 'Special Event' },
                  { value: 'OTHER', label: 'Lainnya' },
                ]}
              />
            </div>

            {/* Jadwal Tayang & Presets */}
            <div className="p-4 bg-bg-surface border border-border-subtle rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-text-secondary flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent-cyan" />
                  <span>Jadwal Tayang</span>
                  <span className="text-status-live">*</span>
                </label>

                <span className="text-[11px] font-medium text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20 px-2 py-0.5 rounded-md">
                  Zona Waktu: WIB
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-text-muted mr-1">Preset:</span>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('tonight')}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                    isPresetActive('tonight')
                      ? 'bg-accent-cyan text-white border-accent-cyan font-semibold shadow-xs'
                      : 'bg-bg-card border-border-subtle text-text-secondary hover:text-text-primary hover:border-accent-cyan/40'
                  }`}
                >
                  Malam Ini (19:30)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('tomorrow')}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                    isPresetActive('tomorrow')
                      ? 'bg-accent-cyan text-white border-accent-cyan font-semibold shadow-xs'
                      : 'bg-bg-card border-border-subtle text-text-secondary hover:text-text-primary hover:border-accent-cyan/40'
                  }`}
                >
                  Besok Malam (20:00)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('weekend')}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                    isPresetActive('weekend')
                      ? 'bg-accent-cyan text-white border-accent-cyan font-semibold shadow-xs'
                      : 'bg-bg-card border-border-subtle text-text-secondary hover:text-text-primary hover:border-accent-cyan/40'
                  }`}
                >
                  Weekend (13:00)
                </button>
              </div>

              {/* Date & Time Input Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-medium text-text-secondary block mb-1.5">
                    Tanggal Siaran
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 bg-bg-input border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-colors ${
                      errors.date ? 'border-status-live' : 'border-border-subtle'
                    }`}
                  />
                  {errors.date && (
                    <p className="text-xs text-status-live mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.date}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-medium text-text-secondary block mb-1.5">
                    Jam Mulai (WIB)
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 bg-bg-input border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-colors ${
                      errors.time ? 'border-status-live' : 'border-border-subtle'
                    }`}
                  />
                  {errors.time && (
                    <p className="text-xs text-status-live mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.time}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Kolaborasi Streamer (Collapsible) */}
            <div className={`border rounded-xl overflow-hidden transition-all ${
              isFromCollab
                ? 'border-accent-purple/40 bg-accent-purple/5'
                : 'border-border-subtle bg-bg-surface'
            }`}>
              <button
                type="button"
                onClick={() => setShowCollab(!showCollab)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-bg-card-hover/40 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-accent-purple/15 text-accent-purple flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-text-primary block">
                      Kolaborasi Streamer (Opsional)
                    </span>
                    <span className="text-[11px] text-text-muted">
                      {formData.collab_guest ? `Tamu: @${formData.collab_guest.replace(/^@/, '')}` : 'Informasi guest creator atau streamer kolaborasi'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isFromCollab && (
                    <span className="text-[10px] bg-accent-purple/15 border border-accent-purple/30 text-accent-purple px-2 py-0.5 rounded-full font-medium">
                      Dari Request
                    </span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-text-muted transition-transform duration-200 ${
                      showCollab ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {showCollab && (
                <div className="p-4 pt-2 space-y-3.5 border-t border-border-subtle/50 bg-bg-card/30">
                  {isFromCollab && (
                    <div className="flex items-start gap-2.5 p-3 bg-accent-purple/10 border border-accent-purple/20 rounded-xl">
                      <Users className="w-4 h-4 text-accent-purple flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-accent-purple leading-relaxed">
                        Data kolaborasi diisi otomatis dari usulan penonton. Anda dapat mengubahnya sebelum jadwal disimpan.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-medium text-text-secondary mb-1.5 block">
                      Nama Streamer Tamu
                    </label>
                    <input
                      type="text"
                      name="collab_guest"
                      value={formData.collab_guest}
                      onChange={handleChange}
                      placeholder="@streamer"
                      className="w-full px-3.5 py-2.5 bg-bg-input border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-text-secondary mb-1.5 block">
                      Tautan Media Sosial atau Kanal Tamu
                    </label>
                    <input
                      type="url"
                      name="collab_social"
                      value={formData.collab_social}
                      onChange={handleChange}
                      placeholder="https://youtube.com/@channel..."
                      className="w-full px-3.5 py-2.5 bg-bg-input border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Pengaturan Hitung Mundur Fansite */}
            <div className="p-4 rounded-xl bg-bg-surface border border-border-subtle space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    formData.countdown_enabled
                      ? 'bg-accent-cyan/15 text-accent-cyan'
                      : 'bg-bg-card text-text-muted'
                  }`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-text-primary">
                      Hitung Mundur di Halaman Utama
                    </h4>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Tampilkan banner countdown jadwal ini pada beranda portal fansite.
                    </p>
                  </div>
                </div>

                <Toggle
                  checked={formData.countdown_enabled}
                  onChange={(checked) => setFormData(prev => ({ ...prev, countdown_enabled: checked }))}
                />
              </div>

              <div className={`p-2.5 rounded-lg border text-[11px] leading-relaxed transition-all ${
                formData.countdown_enabled
                  ? 'bg-accent-cyan/10 border-accent-cyan/25 text-accent-cyan'
                  : 'bg-bg-card border-border-subtle text-text-muted'
              }`}>
                {formData.countdown_enabled ? (
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Banner hitung mundur aktif dan akan tampil di halaman depan.</span>
                  </div>
                ) : (
                  <span>Banner countdown tidak ditampilkan di halaman depan.</span>
                )}
              </div>
            </div>
          </form>

          {/* ================================================================= */}
          {/* RIGHT COLUMN: Live Fansite Card Preview (5 cols = ~42%)           */}
          {/* ================================================================= */}
          <div className="lg:col-span-5 flex flex-col min-h-0 overflow-y-auto p-5 sm:p-6 bg-bg-surface/50 space-y-4">
            {/* Header Pratinjau di Kolom Kanan */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-accent-cyan" />
                <h3 className="text-xs font-semibold text-text-secondary">
                  Pratinjau Kartu Publik
                </h3>
              </div>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Pratinjau Langsung</span>
              </span>
            </div>

            {/* Live Fansite Card Preview (Replika Kartu Fansite Penonton) */}
            <div className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden shadow-md transition-all">
              {/* Media Thumbnail Banner */}
              <div className="relative aspect-video w-full bg-slate-900 overflow-hidden flex items-center justify-center">
                {previewThumbnail ? (
                  <img
                    src={previewThumbnail}
                    alt="Pratinjau Thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/20 via-bg-card to-accent-cyan/15 flex flex-col items-center justify-center p-4 text-center">
                    <Tv className="w-7 h-7 text-text-muted/60 mb-1.5" />
                    <span className="text-xs font-medium text-text-muted">
                      Thumbnail YouTube Otomatis
                    </span>
                    <span className="text-[10px] text-text-muted/70 mt-0.5">
                      Tempel tautan YouTube untuk menampilkan cover
                    </span>
                  </div>
                )}

                {/* Overlaid Status Badge */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-accent-purple/90 text-white shadow-sm backdrop-blur-md">
                    <Clock className="w-3 h-3" />
                    Akan Datang
                  </span>
                </div>

                {/* Overlaid Category Badge */}
                {formData.game_category && (
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/60 text-white border border-white/10 backdrop-blur-md">
                      {formData.game_category}
                    </span>
                  </div>
                )}

                {/* Live Countdown Banner (If enabled) */}
                {formData.countdown_enabled && (
                  <div className="absolute bottom-0 inset-x-0 bg-black/75 backdrop-blur-md px-3 py-1.5 border-t border-white/10 flex items-center justify-between text-white">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-accent-cyan">
                      <Clock className="w-3 h-3 text-accent-cyan animate-pulse" />
                      <span>{countdownPreview || 'Hitung Mundur Aktif'}</span>
                    </div>
                    <span className="text-[10px] text-white/70">
                      Beranda Fansite
                    </span>
                  </div>
                )}
              </div>

              {/* Card Meta Content */}
              <div className="p-4 space-y-2.5">
                <div className="text-[11px] font-medium text-accent-cyan flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>{formatPreviewDate(formData.date, formData.time)}</span>
                </div>

                <h4 className="text-sm font-bold text-text-primary leading-snug line-clamp-2">
                  {formData.title || 'Judul siaran akan ditampilkan di sini...'}
                </h4>

                {formData.collab_guest && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border-subtle/70 text-xs">
                    <Users className="w-3.5 h-3.5 text-accent-purple shrink-0" />
                    <span className="text-text-muted">Streaming bersama:</span>
                    <span className="font-semibold text-text-primary">
                      @{formData.collab_guest.replace(/^@/, '')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Subtle Explanatory Footnote */}
            <div className="p-3.5 rounded-xl bg-bg-surface border border-border-subtle text-[11px] text-text-muted leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
              <span>
                Kartu ini akan otomatis tersinkronisasi dan tampil pada jadwal siaran di portal penonton.
              </span>
            </div>
          </div>
        </div>

        {/* 3. Sticky Action Footer */}
        <div className="px-7 py-4.5 sm:px-8 sm:py-5 border-t border-border-subtle bg-bg-surface/85 backdrop-blur-md flex items-center justify-between gap-3.5 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-xs text-text-muted">
            <kbd className="px-2 py-0.5 rounded-lg bg-bg-card border border-border-subtle font-mono text-[10px] text-text-secondary">
              Esc
            </kbd>
            <span>untuk membatalkan</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-border-subtle text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              form="schedule-form"
              disabled={loading}
              className="px-6 py-2.5 bg-accent-cyan text-white text-xs font-bold rounded-xl hover:bg-accent-cyan-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{isEdit ? 'Simpan Perubahan' : 'Simpan Jadwal'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ScheduleFormPanel;
