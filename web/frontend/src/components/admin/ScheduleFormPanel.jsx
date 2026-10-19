import { useState, useEffect } from 'react';
import { ChevronDown, Play, Calendar, Clock, AlignLeft, Users, ExternalLink } from 'lucide-react';
import { youtubeAPI } from '../../services/api';
import { getGames } from '../../services/gameService';
import Toggle from '../common/Toggle';

/**
 * ScheduleFormPanel - Slide-in form panel dari kanan
 * Digunakan untuk tambah/edit jadwal
 * Includes: YouTube auto-fill, collab info (collapsible), countdown toggle
 */
function ScheduleFormPanel({
  isOpen,
  onClose,
  onSave,
  schedule = null, // Jika ada, berarti mode edit
  loading = false,
}) {
  const isEdit = !!schedule;

  // Form state — field names match backend API
  const [formData, setFormData] = useState({
    title: '',
    game_category: '',
    date: '',
    time: '',
    description: '',
    collab_guest: '',
    collab_social: '',
    youtube_url: '',
    countdown_enabled: true,
  });
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeError, setYoutubeError] = useState('');
  const [errors, setErrors] = useState({});
  const [showCollab, setShowCollab] = useState(false);

  // Accepted games from voting system
  const [acceptedGames, setAcceptedGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(false);

  // Initialize form data when schedule changes
  useEffect(() => {
    if (schedule) {
      const scheduleDate = new Date(schedule.scheduled_at || schedule.datetime || schedule.date);
      const hasCollab = !!(schedule.collab_guest || schedule.collab_social);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        title: schedule.title || '',
        game_category: schedule.game_category || schedule.category || '',
        date: scheduleDate.toISOString().split('T')[0],
        time: scheduleDate.toTimeString().slice(0, 5),
        description: schedule.description || '',
        collab_guest: schedule.collab_guest || '',
        collab_social: schedule.collab_social || '',
        youtube_url: schedule.youtube_url || '',
        countdown_enabled: schedule.countdown_enabled ?? true,
      });
      setYoutubeUrl(schedule.youtube_url || '');
      setShowCollab(hasCollab);
    } else {
      // Reset form for new schedule
      setFormData({
        title: '',
        game_category: '',
        date: '',
        time: '',
        description: '',
        collab_guest: '',
        collab_social: '',
        youtube_url: '',
        countdown_enabled: true,
      });
      setYoutubeUrl('');
      setShowCollab(false);
    }
    setErrors({});
    setYoutubeError('');
  }, [schedule, isOpen]);

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
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle YouTube auto-fill
  const handleYoutubeFetch = async () => {
    if (!youtubeUrl) {
      setYoutubeError('Masukkan URL YouTube terlebih dahulu');
      return;
    }

    setYoutubeLoading(true);
    setYoutubeError('');

    try {
      const response = await youtubeAPI.fetch(youtubeUrl);
      if (response.data?.data) {
        const data = response.data.data;
        setFormData(prev => ({
          ...prev,
          title: data.title || prev.title,
          game_category: data.category || prev.game_category,
        }));
      }
    } catch (error) {
      console.error('YouTube fetch error:', error);
      setYoutubeError(error.response?.data?.message || 'Gagal mengambil data dari YouTube');
    } finally {
      setYoutubeLoading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Judul stream wajib diisi';
    }
    if (!formData.date) {
      newErrors.date = 'Tanggal wajib diisi';
    }
    if (!formData.time) {
      newErrors.time = 'Waktu wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit — build payload with backend field names
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const scheduled_at = new Date(`${formData.date}T${formData.time}:00`).toISOString();

    onSave({
      title: formData.title,
      game_category: formData.game_category,
      scheduled_at,
      description: formData.description,
      youtube_url: formData.youtube_url || undefined,
      collab_guest: formData.collab_guest || undefined,
      collab_social: formData.collab_social || undefined,
      countdown_enabled: formData.countdown_enabled,
    });
  };

  // Animation state
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = '';
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-bg-base/60 backdrop-blur-sm z-40
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`
          fixed top-0 right-0 h-screen w-[420px] max-w-full
          bg-bg-nav border-l border-border-subtle
          z-50 flex flex-col
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-status-live tracking-widest uppercase">
                ● {isEdit ? 'EDIT JADWAL' : 'JADWAL BARU'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-text-primary font-display">
              {isEdit ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Entry langsung ke telemetry node broadcast
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-card transition-colors"
          >
            <span className="text-lg leading-none">✕</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">

            {/* ── Section: YouTube Auto-fill ─────────────────────────────── */}
            <div className="bg-bg-card border border-border-subtle rounded-lg p-5 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-border-subtle">
                <Play className="w-5 h-5 text-status-live" />
                <h3 className="text-sm font-semibold text-text-primary">YouTube Auto-Fill</h3>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-status-live">▶</span>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full pl-9 pr-4 py-3 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-colors duration-150"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleYoutubeFetch}
                  disabled={youtubeLoading}
                  className="px-5 py-3 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-secondary hover:text-text-primary hover:border-accent-cyan transition-colors duration-150 disabled:opacity-50 flex-shrink-0 font-medium"
                >
                  {youtubeLoading ? '...' : 'Fetch'}
                </button>
              </div>
              {youtubeError && (
                <p className="text-xs text-status-live">{youtubeError}</p>
              )}
              <p className="text-xs text-text-muted">
                Tempel URL video/playlist YouTube untuk auto-fill judul & kategori.
              </p>
            </div>

            {/* ── Section: Stream Info ───────────────────────────────────── */}
            <div className="bg-bg-card border border-border-subtle rounded-lg p-5 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-border-subtle">
                <AlignLeft className="w-5 h-5 text-accent-cyan" />
                <h3 className="text-sm font-semibold text-text-primary">Info Stream</h3>
              </div>

              {/* Judul Stream */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono text-text-secondary uppercase tracking-wider">
                    Judul Stream <span className="text-status-live">*</span>
                  </label>
                  <span className={`text-[10px] ${formData.title.length > 70 ? 'text-status-live' : 'text-text-muted'}`}>
                    {formData.title.length}/80
                  </span>
                </div>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Judul stream..."
                  maxLength={80}
                  className={`w-full px-4 py-3 bg-bg-input border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-colors duration-150 ${
                    errors.title ? 'border-status-live' : 'border-border-subtle'
                  }`}
                />
                {errors.title && (
                  <p className="text-xs text-status-live mt-1">{errors.title}</p>
                )}
              </div>

              {/* Kategori Game - dari Voting System */}
              <div>
                <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-2">
                  Kategori Game
                </label>
                <div className="relative">
                  <select
                    name="game_category"
                    value={formData.game_category}
                    onChange={handleChange}
                    disabled={gamesLoading}
                    className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-colors duration-150 disabled:opacity-50"
                  >
                    <option value="">Pilih game dari voting...</option>
                    {acceptedGames.length > 0 ? (
                      acceptedGames.map(game => (
                        <option key={game.id} value={game.title}>
                          {game.title} ({game.vote_count} votes)
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="SURVIVAL HORROR">Survival Horror</option>
                        <option value="ACTION RPG">Action RPG</option>
                        <option value="ADVENTURE">Adventure</option>
                        <option value="SIMULATION">Simulation</option>
                        <option value="STRATEGY">Strategy</option>
                        <option value="INDIE">Indie</option>
                        <option value="RETRO">Retro</option>
                        <option value="MULTIPLAYER">Multiplayer</option>
                        <option value="OTHER">Lainnya</option>
                      </>
                    )}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none text-xs">▼</span>
                </div>
                {acceptedGames.length > 0 && (
                  <p className="text-[10px] text-text-muted mt-1">
                    Game diambil dari voting yang sudah di-accept
                  </p>
                )}
              </div>
            </div>

            {/* ── Section: Jadwal ───────────────────────────────────────── */}
            <div className="bg-bg-card border border-border-subtle rounded-lg p-5 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-border-subtle">
                <Calendar className="w-5 h-5 text-accent-purple" />
                <h3 className="text-sm font-semibold text-text-primary">Jadwal</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-2">
                    Tanggal <span className="text-status-live">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-bg-input border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-colors duration-150 [color-scheme:dark] ${
                      errors.date ? 'border-status-live' : 'border-border-subtle'
                    }`}
                  />
                  {errors.date && (
                    <p className="text-xs text-status-live mt-1">{errors.date}</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <label className="text-xs font-mono text-text-secondary uppercase tracking-wider">
                      Waktu <span className="text-status-live">*</span>
                    </label>
                    <Clock className="w-3 h-3 text-text-muted" />
                    <span className="text-[10px] text-text-muted">WIB</span>
                  </div>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-bg-input border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-colors duration-150 [color-scheme:dark] ${
                      errors.time ? 'border-status-live' : 'border-border-subtle'
                    }`}
                  />
                  {errors.time && (
                    <p className="text-xs text-status-live mt-1">{errors.time}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Section: Deskripsi ────────────────────────────────────── */}
            <div className="bg-bg-card border border-border-subtle rounded-lg p-5 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-border-subtle">
                <AlignLeft className="w-5 h-5 text-accent-gold" />
                <h3 className="text-sm font-semibold text-text-primary">Deskripsi</h3>
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Deskripsi stream (opsional)..."
                rows={3}
                className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-colors duration-150 resize-none"
              />
            </div>

            {/* ── Section: Collab Info (Collapsible) ────────────────────── */}
            <div className="border border-border-subtle rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setShowCollab(!showCollab)}
                className="w-full px-5 py-4 flex items-center justify-between bg-bg-surface hover:bg-bg-card transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-accent-purple" />
                  <span className="text-sm font-semibold text-text-primary">
                    Collab Info
                  </span>
                  <span className="text-[10px] font-mono text-text-muted bg-bg-card px-2 py-0.5 rounded">
                    Opsional
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-text-muted transition-transform duration-200 ${showCollab ? 'rotate-180' : ''}`}
                />
              </button>

              {showCollab && (
                <div className="p-5 space-y-4 border-t border-border-subtle bg-bg-base/30">
                  <div>
                    <label className="text-xs font-mono text-text-secondary uppercase tracking-wider mb-2 block">
                      Nama Streamer Collab
                    </label>
                    <input
                      type="text"
                      name="collab_guest"
                      value={formData.collab_guest}
                      onChange={handleChange}
                      placeholder="@streamername"
                      className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-colors duration-150"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-text-secondary uppercase tracking-wider mb-2 block">
                      Social Link Streamer
                    </label>
                    <input
                      type="url"
                      name="collab_social"
                      value={formData.collab_social}
                      onChange={handleChange}
                      placeholder="https://twitter.com/streamer"
                      className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-colors duration-150"
                    />
                  </div>

                  <p className="text-xs text-text-muted italic">
                    ✦ Field ini opsional. Isi jika stream ini akan kolaborasi dengan streamer lain.
                    Info collab akan tampil otomatis di viewer portal.
                  </p>
                </div>
              )}
            </div>

            {/* ── Section: YouTube Link ───────────────────────────────── */}
            <div className="bg-bg-card border border-border-subtle rounded-lg p-5 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-border-subtle">
                <Play className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-semibold text-text-primary">Link YouTube</h3>
              </div>

              <div>
                <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-2">
                  URL Stream / Video
                </label>
                <div className="relative">
                  <input
                    type="url"
                    name="youtube_url"
                    value={formData.youtube_url || ''}
                    onChange={handleChange}
                    placeholder="https://youtube.com/live/... atau https://youtu.be/..."
                    className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-colors duration-150"
                  />
                  <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                </div>
                <p className="text-xs text-text-muted mt-2">
                  Link YouTube untuk redirect viewer ke stream langsung atau video arsip
                </p>
              </div>

              {formData.youtube_url && (
                <a
                  href={formData.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Test link</span>
                </a>
              )}
            </div>

            {/* ── Section: Countdown Toggle ─────────────────────────────── */}
            <div className="bg-bg-card border border-border-subtle rounded-lg p-5 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-border-subtle">
                <Clock className="w-5 h-5 text-accent-cyan" />
                <h3 className="text-sm font-semibold text-text-primary">Countdown Fansite</h3>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">Hitung Mundur Publik</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Sinkronisasi banner publik portal!
                  </p>
                </div>
                <Toggle
                  checked={formData.countdown_enabled}
                  onChange={(checked) => setFormData(prev => ({ ...prev, countdown_enabled: checked }))}
                />
              </div>
              <p className="text-xs text-text-muted italic">
                Countdown publik otomatis mulai T-24 jam sebelum siaran.
              </p>
            </div>

          </div>

          {/* Footer Buttons */}
          <div className="p-5 border-t border-border-subtle space-y-3 flex-shrink-0">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-cta text-text-on-cta font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <span>✓</span>
                  {isEdit ? 'Simpan Perubahan' : 'Simpan Jadwal'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full py-3 bg-transparent text-text-secondary font-medium rounded-xl hover:text-text-primary hover:bg-bg-card transition-colors disabled:opacity-50 text-sm"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default ScheduleFormPanel;
