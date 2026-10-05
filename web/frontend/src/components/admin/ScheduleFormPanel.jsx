import { useState, useEffect } from 'react';
import { youtubeAPI } from '../../services/api';

/**
 * ScheduleFormPanel - Slide-in form panel dari kanan
 * Digunakan untuk tambah/edit jadwal
 */
function ScheduleFormPanel({
  isOpen,
  onClose,
  onSave,
  schedule = null, // Jika ada, berarti mode edit
  loading = false,
}) {
  const isEdit = !!schedule;

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    date: '',
    time: '',
    description: '',
    enableCountdown: true,
  });
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeError, setYoutubeError] = useState('');
  const [errors, setErrors] = useState({});

  // Initialize form data when schedule changes
  useEffect(() => {
    if (schedule) {
      const scheduleDate = new Date(schedule.datetime || schedule.date);
      setFormData({
        title: schedule.title || '',
        category: schedule.category || '',
        date: scheduleDate.toISOString().split('T')[0],
        time: scheduleDate.toTimeString().slice(0, 5),
        description: schedule.description || '',
        enableCountdown: schedule.enableCountdown ?? true,
      });
    } else {
      // Reset form for new schedule
      setFormData({
        title: '',
        category: '',
        date: '',
        time: '',
        description: '',
        enableCountdown: true,
      });
      setYoutubeUrl('');
    }
    setErrors({});
    setYoutubeError('');
  }, [schedule, isOpen]);

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
          category: data.category || prev.category,
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

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Combine date and time
    const datetime = new Date(`${formData.date}T${formData.time}:00`);

    onSave({
      ...formData,
      datetime: datetime.toISOString(),
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

      {/* Panel */}
      <div
        className={`
          fixed top-0 right-0 h-screen w-[400px] max-w-full
          bg-bg-nav border-l border-border-subtle
          z-50 flex flex-col
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-status-live">● MODIFIKASI JADWAL</span>
            </div>
            <h2 className="text-lg font-bold text-text-primary">
              {isEdit ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Entry langsung ke telemetry node broadcast
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-card transition-colors"
          >
            <span className="text-lg">✕</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {/* YouTube Auto-fill */}
            <div className="bg-bg-card border border-border-subtle rounded-lg p-4">
              <p className="text-xs font-mono text-text-muted mb-2">YOUTUBE AUTO-FILL</p>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-status-live">▶</span>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full pl-9 pr-3 py-2.5 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleYoutubeFetch}
                  disabled={youtubeLoading}
                  className="px-4 py-2.5 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-secondary hover:text-text-primary hover:border-accent-cyan transition-colors disabled:opacity-50"
                >
                  {youtubeLoading ? '...' : 'Fetch'}
                </button>
              </div>
              {youtubeError && (
                <p className="text-xs text-status-live mt-2">{youtubeError}</p>
              )}
              <p className="text-[10px] text-text-muted mt-2">
                Tempel URL video/playlist YouTube untuk auto-fill
              </p>
            </div>

            {/* Judul Stream */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono text-text-secondary uppercase tracking-wider">
                  Judul Stream
                </label>
                <span className="text-[10px] text-text-muted">Maks 80 Char</span>
              </div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Judul stream..."
                maxLength={80}
                className={`
                  w-full px-4 py-3 bg-bg-input border rounded-lg text-sm text-text-primary
                  placeholder:text-text-muted focus:outline-none transition-colors
                  ${errors.title ? 'border-status-live' : 'border-border-subtle focus:border-accent-cyan'}
                `}
              />
              {errors.title && (
                <p className="text-xs text-status-live mt-1">{errors.title}</p>
              )}
            </div>

            {/* Kategori */}
            <div>
              <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-2">
                Kategori Game
              </label>
              <div className="relative">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary appearance-none focus:border-accent-cyan focus:outline-none transition-colors"
                >
                  <option value="">Pilih kategori...</option>
                  <option value="SURVIVAL HORROR">Survival Horror</option>
                  <option value="ACTION RPG">Action RPG</option>
                  <option value="ADVENTURE">Adventure</option>
                  <option value="SIMULATION">Simulation</option>
                  <option value="STRATEGY">Strategy</option>
                  <option value="INDIE">Indie</option>
                  <option value="RETRO">Retro</option>
                  <option value="MULTIPLAYER">Multiplayer</option>
                  <option value="OTHER">Lainnya</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                  ▼
                </span>
              </div>
            </div>

            {/* Tanggal & Waktu */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-2">
                  Tanggal
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`
                    w-full px-4 py-3 bg-bg-input border rounded-lg text-sm text-text-primary
                    focus:outline-none transition-colors
                    ${errors.date ? 'border-status-live' : 'border-border-subtle focus:border-accent-cyan'}
                    [color-scheme:dark]
                  `}
                />
                {errors.date && (
                  <p className="text-xs text-status-live mt-1">{errors.date}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-2">
                  Waktu (WIB)
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className={`
                    w-full px-4 py-3 bg-bg-input border rounded-lg text-sm text-text-primary
                    focus:outline-none transition-colors
                    ${errors.time ? 'border-status-live' : 'border-border-subtle focus:border-accent-cyan'}
                    [color-scheme:dark]
                  `}
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
                placeholder="Deskripsi stream..."
                rows={3}
                className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Toggle Countdown */}
            <div className="bg-bg-card border border-border-subtle rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">Hitung Mundur Fansite</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Sinkronisasi banner publik portal!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'enableCountdown', value: !formData.enableCountdown, type: 'checkbox' } })}
                  className={`
                    relative w-12 h-6 rounded-full transition-colors duration-200
                    ${formData.enableCountdown ? 'bg-accent-cyan' : 'bg-bg-input border border-border-subtle'}
                  `}
                >
                  <span
                    className={`
                      absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200
                      ${formData.enableCountdown ? 'translate-x-7' : 'translate-x-1'}
                    `}
                  ></span>
                </button>
              </div>
              <p className="text-[10px] text-text-muted mt-3 italic">
                Countdown publik otomatis mulai T-24 jam sebelum siaran.
              </p>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="p-6 border-t border-border-subtle space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-cta text-text-on-cta font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
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
                  Simpan Jadwal
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full py-3 bg-transparent text-text-secondary font-medium rounded-lg hover:text-text-primary transition-colors disabled:opacity-50"
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
