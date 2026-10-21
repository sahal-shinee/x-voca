import { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';
import { youtubeAPI } from '../../services/api';
import { getGames } from '../../services/gameService';
import Toggle from '../common/Toggle';
import CustomSelect from '../common/CustomSelect';

/**
 * ScheduleFormPanel - Slide-in panel untuk Tambah / Edit Jadwal Siaran
 */
function ScheduleFormPanel({
  isOpen,
  onClose,
  onSave,
  schedule = null,
  loading = false,
  /**
   * initialCollabData - Pre-fill collab fields when opening from Collab Requests page.
   * Format: { collab_guest?: string, collab_social?: string, sourceLabel?: string }
   * Only used when schedule is null (new schedule, not edit).
   */
  initialCollabData = null,
}) {
  const isEdit = !!schedule;
  // Flag: form was opened from Collab Requests (to show contextual header)
  const isFromCollab = !isEdit && !!initialCollabData;

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

  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeError, setYoutubeError] = useState('');
  const [errors, setErrors] = useState({});
  const [showCollab, setShowCollab] = useState(false);

  // Accepted games from voting system
  const [acceptedGames, setAcceptedGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(false);

  // Initialize form data when schedule changes or opens
  useEffect(() => {
    if (schedule) {
      const scheduleDate = new Date(schedule.scheduled_at || schedule.datetime || schedule.date);
      const hasCollab = !!(schedule.collab_guest || schedule.collab_social);
      setFormData({
        title: schedule.title || '',
        game_category: schedule.game_category || schedule.category || '',
        date: scheduleDate.toISOString().split('T')[0],
        time: scheduleDate.toTimeString().slice(0, 5),
        description: schedule.description || '',
        collab_guest: schedule.collab_guest || '',
        collab_social: schedule.collab_social || '',
        youtube_url: schedule.youtube_url || '',
        countdown_enabled: schedule.countdown_enabled !== false,
      });
      setShowCollab(hasCollab);
    } else if (initialCollabData) {
      // New schedule pre-filled with collab data from Collab Requests
      const guestName = initialCollabData.collab_guest || '';
      const guestSocial = initialCollabData.collab_social || '';
      setFormData({
        title: '',
        game_category: '',
        date: '',
        time: '',
        description: '',
        collab_guest: guestName,
        collab_social: guestSocial,
        youtube_url: '',
        countdown_enabled: true,
      });
      // Auto-expand collab section since it's pre-filled
      setShowCollab(true);
    } else {
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
      setShowCollab(false);
    }
    setErrors({});
    setYoutubeError('');
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

  // Handle YouTube auto-fill
  const handleYoutubeFetch = async () => {
    if (!formData.youtube_url) {
      setYoutubeError('Masukkan URL YouTube terlebih dahulu');
      return;
    }

    setYoutubeLoading(true);
    setYoutubeError('');

    try {
      const response = await youtubeAPI.fetch(formData.youtube_url);
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
      newErrors.time = 'Waktu wajib diisi';
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

      {/* Drawer Panel */}
      <div
        className={`
          fixed top-0 right-0 h-screen w-[440px] max-w-full
          bg-bg-nav border-l border-border-subtle
          z-50 flex flex-col shadow-2xl
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between flex-shrink-0 bg-bg-card/50">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-accent-cyan" />
              <span className="text-[10px] font-mono text-accent-cyan tracking-wider uppercase">
                {isEdit ? 'EDIT JADWAL' : isFromCollab ? 'JADWAL DARI COLLAB REQUEST' : 'JADWAL BARU'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-text-primary font-display">
              {isEdit ? 'Edit Jadwal Siaran' : 'Tambah Jadwal Siaran'}
            </h2>
            {isFromCollab && initialCollabData?.collab_guest ? (
              <p className="text-xs text-accent-purple mt-0.5 flex items-center gap-1.5">
                <Users className="w-3 h-3 flex-shrink-0" />
                <span>
                  Data collab dari:{' '}
                  <strong className="font-semibold">
                    {initialCollabData.collab_guest.startsWith('@')
                      ? initialCollabData.collab_guest
                      : `@${initialCollabData.collab_guest}`}
                  </strong>
                </span>
              </p>
            ) : (
              <p className="text-xs text-text-muted mt-0.5">
                Atur detail siaran dan sinkronisasi ke portal publik
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-card transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 overscroll-contain">
          {/* Tautan YouTube & Auto-fill */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-red-500" />
                Tautan YouTube
              </label>
              {formData.youtube_url && (
                <a
                  href={formData.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent-cyan hover:underline flex items-center gap-1"
                >
                  <span>Uji tautan</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                name="youtube_url"
                value={formData.youtube_url}
                onChange={handleChange}
                placeholder="https://youtube.com/live/... atau https://youtu.be/..."
                className="w-full px-3.5 py-2.5 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-colors"
              />
              <button
                type="button"
                onClick={handleYoutubeFetch}
                disabled={youtubeLoading || !formData.youtube_url}
                className="px-3.5 py-2.5 bg-bg-card border border-border-subtle hover:border-accent-cyan/50 text-text-primary rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
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
              <p className="text-xs text-status-live mt-1.5">{youtubeError}</p>
            )}
            <p className="text-[11px] text-text-muted mt-1.5">
              Opsional. Masukkan URL video atau live YouTube untuk mengisi judul dan kategori secara otomatis.
            </p>
          </div>

          <div className="border-t border-border-subtle/60 pt-4 space-y-4">
            {/* Judul Siaran */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono text-text-secondary uppercase tracking-wider">
                  Judul Siaran <span className="text-status-live">*</span>
                </label>
                <span className={`text-[10px] font-mono ${formData.title.length > 70 ? 'text-status-live' : 'text-text-muted'}`}>
                  {formData.title.length}/80
                </span>
              </div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Masukkan judul siaran..."
                maxLength={80}
                className={`w-full px-3.5 py-2.5 bg-bg-input border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-colors ${
                  errors.title ? 'border-status-live' : 'border-border-subtle'
                }`}
              />
              {errors.title && (
                <p className="text-xs text-status-live mt-1">{errors.title}</p>
              )}
            </div>

            {/* Kategori Game */}
            <div>
              <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-2">
                Kategori Siaran / Game
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

            {/* Jadwal Tanggal & Waktu */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-2">
                  Tanggal <span className="text-status-live">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 bg-bg-input border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-colors ${
                    errors.date ? 'border-status-live' : 'border-border-subtle'
                  }`}
                />
                {errors.date && (
                  <p className="text-xs text-status-live mt-1">{errors.date}</p>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono text-text-secondary uppercase tracking-wider">
                    Waktu <span className="text-status-live">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-accent-cyan bg-accent-cyan/10 px-1.5 py-0.5 rounded">
                    WIB
                  </span>
                </div>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 bg-bg-input border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-colors ${
                    errors.time ? 'border-status-live' : 'border-border-subtle'
                  }`}
                />
                {errors.time && (
                  <p className="text-xs text-status-live mt-1">{errors.time}</p>
                )}
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-2">
                Deskripsi
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Deskripsi atau catatan siaran (opsional)..."
                rows={3}
                className="w-full px-3.5 py-2.5 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-colors resize-none"
              />
            </div>
          </div>

          {/* Kolaborasi Streamer (Collapsible) */}
          <div className={`border rounded-xl overflow-hidden ${isFromCollab ? 'border-accent-purple/40 bg-accent-purple/5' : 'border-border-subtle bg-bg-input/20'}`}>
            <button
              type="button"
              onClick={() => setShowCollab(!showCollab)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-bg-input/40 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <Users className={`w-4 h-4 ${isFromCollab ? 'text-accent-purple' : 'text-accent-purple'}`} />
                <span className="text-xs font-semibold text-text-primary">
                  Kolaborasi Streamer
                </span>
                {isFromCollab ? (
                  <span className="text-[10px] font-mono bg-accent-purple/15 border border-accent-purple/30 text-accent-purple px-2 py-0.5 rounded">
                    Dari Request
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-text-muted bg-bg-card px-2 py-0.5 rounded border border-border-subtle">
                    Opsional
                  </span>
                )}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-text-muted transition-transform duration-200 ${showCollab ? 'rotate-180' : ''}`}
              />
            </button>
            {showCollab && (
              <div className="p-4 pt-2 space-y-3 border-t border-border-subtle/50 bg-bg-base/30">
                {isFromCollab && (
                  <div className="flex items-start gap-2 p-2.5 bg-accent-purple/10 border border-accent-purple/20 rounded-lg">
                    <Users className="w-3.5 h-3.5 text-accent-purple flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-accent-purple leading-relaxed">
                      Data streamer diisi otomatis dari usulan Collab Request. Anda bisa mengubah data ini sebelum menyimpan jadwal.
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider mb-1.5 block">
                    Nama Streamer Tamu
                  </label>
                  <input
                    type="text"
                    name="collab_guest"
                    value={formData.collab_guest}
                    onChange={handleChange}
                    placeholder="@streamer"
                    className="w-full px-3 py-2 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider mb-1.5 block">
                    Tautan Media Sosial / Channel
                  </label>
                  <input
                    type="url"
                    name="collab_social"
                    value={formData.collab_social}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan"
                  />
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Informasi kolaborasi akan ditampilkan pada kartu jadwal di portal penonton.
                </p>
              </div>
            )}
          </div>

          {/* Pengaturan Countdown Fansite */}
          <div className="flex items-center justify-between p-4 bg-bg-input/20 border border-border-subtle rounded-xl">
            <div className="pr-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent-cyan" />
                <p className="text-xs font-semibold text-text-primary">Hitung Mundur Fansite</p>
              </div>
              <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                Tampilkan banner hitung mundur siaran di halaman utama portal fansite.
              </p>
            </div>
            <Toggle
              checked={formData.countdown_enabled}
              onChange={(checked) => setFormData(prev => ({ ...prev, countdown_enabled: checked }))}
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-5 border-t border-border-subtle space-y-2.5 flex-shrink-0 bg-bg-nav">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-accent-cyan to-accent-purple text-bg-base font-semibold rounded-xl hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{isEdit ? 'Simpan Perubahan' : 'Simpan Jadwal'}</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full py-2.5 bg-transparent text-text-secondary font-medium rounded-xl hover:text-text-primary hover:bg-bg-card transition-colors disabled:opacity-50 text-sm"
          >
            Batal
          </button>
        </div>
      </div>
    </>
  );
}

export default ScheduleFormPanel;
