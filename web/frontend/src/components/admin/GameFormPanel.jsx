import { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Link2,
  Gamepad2,
  Image as ImageIcon,
  Check,
  CheckCircle,
  AlertCircle,
  Trash2,
  Loader2,
} from 'lucide-react';

// Suggested genres for quick selection
const GENRE_SUGGESTIONS = [
  'Action RPG',
  'Survival Horror',
  'Open World',
  'Adventure',
  'Gacha / Turn-based',
  'Simulation',
  'Strategy',
  'Roguelike',
];

// Helper to compress/resize uploaded device image to lightweight high-res JPEG data URL
const processUploadedImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File yang dipilih bukan gambar.'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Gagal membaca gambar.'));
    };
    reader.onerror = () => reject(new Error('Gagal membaca file dari perangkat.'));
  });
};

function GameFormPanel({
  isOpen,
  onClose,
  onSave,
  game = null,
  loading = false,
}) {
  const isEdit = !!game;
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    publisher: '',
    cover_url: '',
  });

  // Cover image mode: 'upload' (device) or 'url' (web link)
  const [imageMode, setImageMode] = useState('upload');
  const [urlInput, setUrlInput] = useState('');
  const [fileName, setFileName] = useState('');
  const [imageProcessing, setImageProcessing] = useState(false);
  const [imageLoadStatus, setImageLoadStatus] = useState('idle'); // 'idle' | 'loading' | 'valid' | 'error'
  const [errors, setErrors] = useState({});

  // Initialize form state
  useEffect(() => {
    if (game) {
      const existingCover = game.cover_url || game.coverUrl || '';
      setFormData({
        title: game.title || '',
        genre: game.genre || game.category || '',
        publisher: game.publisher || '',
        cover_url: existingCover,
      });

      if (existingCover) {
        if (existingCover.startsWith('data:image')) {
          setImageMode('upload');
          setFileName('Gambar Tersimpan');
        } else {
          setImageMode('url');
          setUrlInput(existingCover);
        }
        setImageLoadStatus('valid');
      } else {
        setImageMode('upload');
        setUrlInput('');
        setFileName('');
        setImageLoadStatus('idle');
      }
    } else {
      setFormData({
        title: '',
        genre: '',
        publisher: '',
        cover_url: '',
      });
      setImageMode('upload');
      setUrlInput('');
      setFileName('');
      setImageLoadStatus('idle');
    }
    setErrors({});
  }, [game, isOpen]);

  // Handle standard input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Select genre pill
  const handleSelectGenre = (genre) => {
    setFormData((prev) => ({ ...prev, genre }));
    if (errors.genre) {
      setErrors((prev) => ({ ...prev, genre: '' }));
    }
  };

  // Handle file upload from device
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, cover_url: 'Hanya file gambar (JPG, PNG, WebP) yang didukung.' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, cover_url: 'Ukuran file terlalu besar (maksimal 5MB).' }));
      return;
    }

    setImageProcessing(true);
    setImageLoadStatus('loading');
    setErrors((prev) => ({ ...prev, cover_url: '' }));

    try {
      const dataUrl = await processUploadedImage(file);
      setFormData((prev) => ({ ...prev, cover_url: dataUrl }));
      setFileName(file.name);
      setImageLoadStatus('valid');
    } catch (err) {
      console.error('File process error:', err);
      setErrors((prev) => ({ ...prev, cover_url: err.message || 'Gagal memproses file gambar.' }));
      setImageLoadStatus('error');
    } finally {
      setImageProcessing(false);
    }
  };

  // Handle URL input apply
  const handleUrlChange = (e) => {
    const val = e.target.value;
    setUrlInput(val);
    setFormData((prev) => ({ ...prev, cover_url: val }));
    if (val.trim()) {
      setImageLoadStatus('loading');
    } else {
      setImageLoadStatus('idle');
    }
    if (errors.cover_url) {
      setErrors((prev) => ({ ...prev, cover_url: '' }));
    }
  };

  // Clear current cover image
  const handleClearCover = () => {
    setFormData((prev) => ({ ...prev, cover_url: '' }));
    setUrlInput('');
    setFileName('');
    setImageLoadStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Judul game wajib diisi';
    }
    if (formData.cover_url && imageLoadStatus === 'error') {
      newErrors.cover_url = 'Tautan cover tidak dapat dimuat. Pastikan URL valid.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSave(formData);
  };

  // Animation open/close
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-bg-base/70 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Slide Panel */}
      <div
        className={`fixed top-0 right-0 h-screen w-[460px] max-w-full bg-bg-card border-l border-border-subtle z-50 flex flex-col shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-subtle flex items-center justify-between bg-bg-surface/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-purple/15 text-accent-purple border border-accent-purple/20 flex items-center justify-center shrink-0">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary leading-tight">
                {isEdit ? 'Edit Data Game' : 'Tambah Game Baru'}
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Kandidat tayang & voting penonton
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-card-hover border border-transparent hover:border-border-subtle transition-colors"
            aria-label="Tutup panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="game-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-5"
        >
          {/* Judul Game */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
              Judul Game <span className="text-status-live">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Contoh: Elden Ring: Shadow of the Erdtree"
              className={`w-full px-4 py-2.5 bg-bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors ${
                errors.title
                  ? 'border-status-live focus:border-status-live'
                  : 'border-border-subtle focus:border-accent-cyan'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-status-live flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Kategori / Genre */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
              Kategori / Genre
            </label>
            <input
              type="text"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              placeholder="Contoh: Action RPG, Souls-like"
              className="w-full px-4 py-2.5 bg-bg-surface border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none transition-colors"
            />
            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-text-muted mr-1">Rekomendasi:</span>
              {GENRE_SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleSelectGenre(sug)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                    formData.genre === sug
                      ? 'bg-accent-purple/15 text-accent-purple border-accent-purple/30 font-medium'
                      : 'bg-bg-surface text-text-muted border-border-subtle hover:text-text-secondary hover:border-border-active'
                  }`}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Publisher */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
              Publisher / Pengembang
            </label>
            <input
              type="text"
              name="publisher"
              value={formData.publisher}
              onChange={handleChange}
              placeholder="Contoh: FromSoftware, Bandai Namco"
              className="w-full px-4 py-2.5 bg-bg-surface border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none transition-colors"
            />
          </div>

          {/* Cover Image — 2 Pilihan Opsi */}
          <div className="space-y-3 pt-2 border-t border-border-subtle">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
                Cover Image Game
              </label>
              {formData.cover_url && (
                <button
                  type="button"
                  onClick={handleClearCover}
                  className="text-xs text-status-live hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Hapus Cover
                </button>
              )}
            </div>

            {/* Segmented Mode Control */}
            <div className="grid grid-cols-2 p-1 bg-bg-surface rounded-xl border border-border-subtle">
              <button
                type="button"
                onClick={() => setImageMode('upload')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                  imageMode === 'upload'
                    ? 'bg-bg-card text-text-primary shadow-sm border border-border-subtle'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Perangkat
              </button>
              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                  imageMode === 'url'
                    ? 'bg-bg-card text-text-primary shadow-sm border border-border-subtle'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                Tautan URL Web
              </button>
            </div>

            {/* Mode 1: Upload from device */}
            {imageMode === 'upload' && (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-5 border-2 border-dashed border-border-subtle hover:border-accent-purple/50 rounded-xl bg-bg-surface/50 hover:bg-bg-surface transition-colors cursor-pointer text-center group"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent-purple/10 text-accent-purple border border-accent-purple/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                    {imageProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-text-primary">
                    {fileName ? fileName : 'Klik untuk memilih gambar'}
                  </p>
                  <p className="text-[11px] text-text-muted mt-1">
                    Format JPG, PNG, atau WebP (Maks. 5MB)
                  </p>
                </div>
              </div>
            )}

            {/* Mode 2: Web URL input */}
            {imageMode === 'url' && (
              <div className="space-y-1.5">
                <div className="relative">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={handleUrlChange}
                    placeholder="https://example.com/cover.jpg"
                    className="w-full pl-9 pr-9 py-2.5 bg-bg-surface border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none transition-colors"
                  />
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  {urlInput && (
                    <button
                      type="button"
                      onClick={handleClearCover}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-text-muted">
                  Gunakan tautan gambar langsung yang dapat diakses publik.
                </p>
              </div>
            )}

            {/* Error Message */}
            {errors.cover_url && (
              <p className="text-xs text-status-live flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.cover_url}
              </p>
            )}

            {/* Live Image Preview Card */}
            {formData.cover_url ? (
              <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-accent-purple" />
                    Preview Cover
                  </span>
                  {imageLoadStatus === 'valid' && (
                    <span className="text-[10px] font-semibold text-accent-cyan flex items-center gap-1 bg-accent-cyan/10 px-2 py-0.5 rounded-full border border-accent-cyan/20">
                      <Check className="w-3 h-3" />
                      Gambar Siap
                    </span>
                  )}
                  {imageLoadStatus === 'error' && (
                    <span className="text-[10px] font-semibold text-status-live flex items-center gap-1 bg-status-live/10 px-2 py-0.5 rounded-full border border-status-live/20">
                      <AlertCircle className="w-3 h-3" />
                      Gagal Memuat
                    </span>
                  )}
                  {imageLoadStatus === 'loading' && (
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Memverifikasi...
                    </span>
                  )}
                </div>

                <div className="aspect-video w-full rounded-lg overflow-hidden bg-bg-card border border-border-subtle relative flex items-center justify-center">
                  <img
                    src={formData.cover_url}
                    alt="Preview Game Cover"
                    className={`w-full h-full object-cover ${imageLoadStatus === 'error' ? 'hidden' : 'block'}`}
                    onLoad={() => setImageLoadStatus('valid')}
                    onError={() => {
                      setImageLoadStatus('error');
                      setErrors((prev) => ({
                        ...prev,
                        cover_url: 'Gambar tidak dapat dimuat dari tautan ini. Periksa kembali URL.',
                      }));
                    }}
                  />
                  {imageLoadStatus === 'error' && (
                    <div className="absolute inset-0 bg-bg-surface flex flex-col items-center justify-center p-4 text-center">
                      <AlertCircle className="w-8 h-8 text-status-live opacity-80 mb-1" />
                      <p className="text-xs font-semibold text-status-live">Gambar Tidak Valid</p>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        Tautan tidak dapat diakses atau bukan file gambar.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-5 border-t border-border-subtle bg-bg-surface/40 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-active text-sm font-medium transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            form="game-form"
            disabled={loading || imageProcessing}
            className="flex-1 py-2.5 rounded-xl bg-gradient-cta text-text-on-cta text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{isEdit ? 'Simpan Perubahan' : 'Tambah Game'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export default GameFormPanel;
