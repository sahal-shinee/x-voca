import { useState, useEffect } from 'react';

/**
 * ContentFormPanel - Slide-in form panel dari kanan untuk tambah/edit konten
 */
function ContentFormPanel({
  isOpen,
  onClose,
  onSave,
  content = null,
  loading = false,
}) {
  const isEdit = !!content;

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    game_tag: '',
    youtube_url: '',
    thumbnail: '',
    is_featured: false,
    is_visible: true,
    sort_order: 1,
    video_count: null,
    total_duration: '',
    quality: 'HD 1080p',
  });
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [thumbnailError, setThumbnailError] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form data when content changes
  useEffect(() => {
    if (content) {
      setFormData({
        title: content.title || '',
        game_tag: content.game_tag || content.category || '',
        youtube_url: content.youtube_url || '',
        thumbnail: content.thumbnail || '',
        is_featured: content.is_featured || false,
        is_visible: content.is_visible !== false,
        sort_order: content.sort_order || 1,
        video_count: content.video_count || null,
        total_duration: content.total_duration || '',
        quality: content.quality || 'HD 1080p',
      });
      if (content.thumbnail) {
        setThumbnailPreview(content.thumbnail);
        setThumbnailError(false);
      }
    } else {
      setFormData({
        title: '',
        game_tag: '',
        youtube_url: '',
        thumbnail: '',
        is_featured: false,
        is_visible: true,
        sort_order: 1,
        video_count: null,
        total_duration: '',
        quality: 'HD 1080p',
      });
      setThumbnailPreview('');
      setThumbnailError(false);
    }
    setErrors({});
  }, [content, isOpen]);

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

  // Handle thumbnail URL change
  const handleThumbnailChange = (url) => {
    setFormData(prev => ({ ...prev, thumbnail: url }));
    setThumbnailError(false);
    if (url) {
      setThumbnailPreview(url);
    } else {
      setThumbnailPreview('');
    }
  };

  // Handle thumbnail load error
  const handleThumbnailError = () => {
    setThumbnailError(true);
  };

  // Sort order stepper
  const handleSortOrderChange = (delta) => {
    const newValue = Math.max(1, (formData.sort_order || 1) + delta);
    setFormData(prev => ({ ...prev, sort_order: newValue }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Judul konten wajib diisi';
    } else if (formData.title.length > 80) {
      newErrors.title = 'Judul maksimal 80 karakter';
    }

    if (!formData.youtube_url.trim()) {
      newErrors.youtube_url = 'URL YouTube wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Prepare data for API
    const data = {
      title: formData.title,
      game_tag: formData.game_tag,
      youtube_url: formData.youtube_url,
      thumbnail: formData.thumbnail || undefined,
      is_featured: formData.is_featured,
      is_visible: formData.is_visible,
      sort_order: formData.sort_order,
      video_count: formData.video_count ? parseInt(formData.video_count) : undefined,
      total_duration: formData.total_duration || undefined,
      quality: formData.quality,
    };

    onSave(data);
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
          fixed top-0 right-0 h-screen w-[420px] max-w-full
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
              <span className="text-xs font-mono text-accent-purple">● FORM KURASI</span>
            </div>
            <h2 className="text-lg font-bold text-text-primary">
              {isEdit ? 'Edit Konten' : 'Tambah Konten Baru'}
            </h2>
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
            {/* Judul */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono text-text-secondary uppercase tracking-wider">
                  Judul Konten
                </label>
                <span className={`text-[10px] ${formData.title.length > 80 ? 'text-status-live' : 'text-text-muted'}`}>
                  {formData.title.length}/80
                </span>
              </div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Persona 3 Reload: Tartarus Midnight..."
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

            {/* Game Tag */}
            <div>
              <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-2">
                Game Tag
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="game_tag"
                  value={formData.game_tag}
                  onChange={handleChange}
                  placeholder="JRPG / Narrative"
                  className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">🏷</span>
              </div>
            </div>

            {/* YouTube URL */}
            <div>
              <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-2">
                YouTube URL
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-status-live text-sm">▶</span>
                <input
                  type="url"
                  name="youtube_url"
                  value={formData.youtube_url}
                  onChange={handleChange}
                  placeholder="https://youtube.com/playlist?list=..."
                  className={`
                    w-full pl-9 pr-4 py-3 bg-bg-input border rounded-lg text-sm text-text-primary
                    placeholder:text-text-muted focus:outline-none transition-colors
                    ${errors.youtube_url ? 'border-status-live' : 'border-border-subtle focus:border-accent-cyan'}
                  `}
                />
              </div>
              {errors.youtube_url && (
                <p className="text-xs text-status-live mt-1">{errors.youtube_url}</p>
              )}
            </div>

            {/* Thumbnail URL */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono text-text-secondary uppercase tracking-wider">
                  Thumbnail URL
                </label>
                <span className="text-[10px] text-text-muted bg-bg-input px-2 py-0.5 rounded">
                  16:9 Aspect
                </span>
              </div>
              <input
                type="url"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={(e) => handleThumbnailChange(e.target.value)}
                placeholder="https://i.ytimg.com/vi/..."
                className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none transition-colors"
              />

              {/* Thumbnail Preview */}
              {thumbnailPreview && (
                <div className="mt-3 relative">
                  {thumbnailError ? (
                    <div className="aspect-video bg-bg-input rounded-lg flex items-center justify-center border border-status-live/30">
                      <span className="text-text-muted text-sm">Thumbnail tidak bisa dimuat</span>
                    </div>
                  ) : (
                    <>
                      <div className="aspect-video bg-bg-input rounded-lg overflow-hidden border border-status-done/30">
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          onError={handleThumbnailError}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="absolute top-2 left-2 text-[10px] font-mono bg-status-done/20 text-status-done px-2 py-0.5 rounded">
                        THUMBNAIL TERDETEKSI
                      </span>
                      <button
                        type="button"
                        onClick={() => handleThumbnailChange('')}
                        className="absolute top-2 right-2 w-6 h-6 bg-bg-base/80 rounded flex items-center justify-center text-text-muted hover:text-text-primary"
                        title="Hapus thumbnail"
                      >
                        <span className="text-xs">✕</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-2">
                  Jumlah Video
                </label>
                <input
                  type="number"
                  name="video_count"
                  value={formData.video_count || ''}
                  onChange={handleChange}
                  placeholder="14"
                  min="1"
                  className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-2">
                  Durasi Total
                </label>
                <input
                  type="text"
                  name="total_duration"
                  value={formData.total_duration}
                  onChange={handleChange}
                  placeholder="48.5 Jam"
                  className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Quality */}
            <div>
              <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-2">
                Quality
              </label>
              <div className="relative">
                <select
                  name="quality"
                  value={formData.quality}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary appearance-none focus:border-accent-cyan focus:outline-none transition-colors"
                >
                  <option value="HD 720p">HD 720p</option>
                  <option value="HD 1080p">HD 1080p</option>
                  <option value="FHD 1080p">FHD 1080p</option>
                  <option value="4K">4K</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none text-xs">▼</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="bg-bg-card border border-border-subtle rounded-lg p-4 space-y-4">
              {/* Featured Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary flex items-center gap-2">
                    <span className="text-accent-gold">★</span> Featured Banner
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">Set sebagai sorotan di halaman utama</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'is_featured', value: !formData.is_featured, type: 'checkbox' } })}
                  className={`
                    relative w-12 h-6 rounded-full transition-colors duration-200
                    ${formData.is_featured ? 'bg-accent-gold' : 'bg-bg-input border border-border-subtle'}
                  `}
                >
                  <span
                    className={`
                      absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200
                      ${formData.is_featured ? 'translate-x-7' : 'translate-x-1'}
                    `}
                  ></span>
                </button>
              </div>

              {/* Visible Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary flex items-center gap-2">
                    <span>👁</span> Visible di Publik
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">Tampilkan langsung ke katalog publik</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'is_visible', value: !formData.is_visible, type: 'checkbox' } })}
                  className={`
                    relative w-12 h-6 rounded-full transition-colors duration-200
                    ${formData.is_visible ? 'bg-accent-cyan' : 'bg-bg-input border border-border-subtle'}
                  `}
                >
                  <span
                    className={`
                      absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200
                      ${formData.is_visible ? 'translate-x-7' : 'translate-x-1'}
                    `}
                  ></span>
                </button>
              </div>
            </div>

            {/* Sort Order */}
            <div>
              <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-2">
                Sort Order
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSortOrderChange(-1)}
                  className="w-10 h-10 rounded-lg bg-bg-input border border-border-subtle text-text-primary hover:bg-bg-card transition-colors flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-12 text-center text-lg font-mono text-text-primary">
                  {formData.sort_order}
                </span>
                <button
                  type="button"
                  onClick={() => handleSortOrderChange(1)}
                  className="w-10 h-10 rounded-lg bg-bg-input border border-border-subtle text-text-primary hover:bg-bg-card transition-colors flex items-center justify-center"
                >
                  +
                </button>
                <span className="text-xs text-text-muted ml-2">Nomor urut prioritas katalog</span>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="p-6 border-t border-border-subtle space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent-purple text-white font-semibold rounded-lg hover:bg-accent-purple/90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
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
                  <span>💾</span>
                  Simpan Konten
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

export default ContentFormPanel;
