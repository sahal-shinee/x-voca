import { useState, useEffect, useRef } from 'react';
import {
  AlignLeft,
  Play,
  Image as ImageIcon,
  Layers,
  Settings,
  Tag,
  Save,
  X,
  RefreshCw,
  Upload,
  Link2,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader2,
  Tv
} from 'lucide-react';
import { youtubeAPI } from '../../services/api';
import Toggle from '../common/Toggle';

// Suggested categories for quick selection
const CATEGORY_PRESETS = [
  'Gaming',
  'Zatsu / Talk',
  'Karaoke',
  'Horror',
  'Indie Games',
  'Special / Collab',
  'Lainnya',
];

// Helper to compress uploaded device image (16:9 ratio)
const processUploadedImage = (file, maxWidth = 960, maxHeight = 540, quality = 0.85) => {
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
      img.onerror = () => reject(new Error('Gagal membaca format gambar.'));
    };
    reader.onerror = () => reject(new Error('Gagal membaca file dari perangkat.'));
  });
};

// Helper to extract YouTube video ID directly
const extractYouTubeVideoId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|live\/)|youtu\.be\/)([^&\n?#]+)/);
  return match && match[1] ? match[1] : null;
};

/**
 * ContentFormPanel - Slide-in panel untuk Tambah / Edit Konten Katalog (Content Guide)
 * 100% Zero emojis, auto-fetch YouTube, dual-mode thumbnail, clean professional design
 */
function ContentFormPanel({
  isOpen,
  onClose,
  onSave,
  content = null,
  loading = false,
}) {
  const isEdit = Boolean(content && content.id);
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    game_tag: 'Gaming',
    youtube_url: '',
    thumbnail_url: '',
    content_type: 'video', // 'video' | 'playlist'
    video_count: 1,
    total_duration: '',
    is_featured: false,
    is_visible: true,
    sort_order: 1,
  });

  // Thumbnail mode: 'youtube' | 'upload' | 'url'
  const [thumbMode, setThumbMode] = useState('youtube');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [thumbnailError, setThumbnailError] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);

  // YouTube auto-fetch state
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState('');
  const [ytSuccess, setYtSuccess] = useState('');
  const [errors, setErrors] = useState({});

  // Initialize form data when content changes or opens
  useEffect(() => {
    if (content) {
      const initialThumb = content.thumbnail_url || content.thumbnailUrl || content.thumbnail || '';
      const initialType = content.content_type || (content.video_count && content.video_count > 1 ? 'playlist' : 'video');

      setFormData({
        title: content.title || '',
        game_tag: content.game_tag || content.category || 'Gaming',
        youtube_url: content.youtube_url || content.youtubeUrl || '',
        thumbnail_url: initialThumb,
        content_type: initialType,
        video_count: content.video_count || 1,
        total_duration: content.total_duration || '',
        is_featured: Boolean(content.is_featured),
        is_visible: content.is_visible !== false,
        sort_order: content.sort_order ?? 1,
      });

      setThumbnailPreview(initialThumb);
      setThumbnailError(false);

      if (initialThumb.startsWith('data:image')) {
        setThumbMode('upload');
        setUploadedFileName('Gambar dari perangkat');
      } else if (initialThumb.includes('ytimg.com') || initialThumb.includes('youtube.com')) {
        setThumbMode('youtube');
      } else if (initialThumb) {
        setThumbMode('url');
        setCustomUrlInput(initialThumb);
      } else {
        setThumbMode('youtube');
      }

      // If no thumbnail was set but a YouTube URL is present, extract fallback thumbnail immediately
      if (!initialThumb && content.youtube_url) {
        const videoId = extractYouTubeVideoId(content.youtube_url);
        if (videoId) {
          const ytThumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          setThumbnailPreview(ytThumb);
          setFormData((prev) => ({ ...prev, thumbnail_url: ytThumb }));
          setThumbMode('youtube');
        }
      }
    } else {
      setFormData({
        title: '',
        game_tag: 'Gaming',
        youtube_url: '',
        thumbnail_url: '',
        content_type: 'video',
        video_count: 1,
        total_duration: '',
        is_featured: false,
        is_visible: true,
        sort_order: 1,
      });
      setThumbnailPreview('');
      setThumbnailError(false);
      setThumbMode('youtube');
      setCustomUrlInput('');
      setUploadedFileName('');
    }
    setErrors({});
    setYtError('');
    setYtSuccess('');
  }, [content, isOpen]);

  // Handle generic input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Auto-fetch YouTube info (Title & Thumbnail)
  const handleYoutubeFetch = async () => {
    const url = formData.youtube_url.trim();
    if (!url) {
      setYtError('Masukkan URL video atau playlist YouTube terlebih dahulu.');
      return;
    }

    setYtLoading(true);
    setYtError('');
    setYtSuccess('');

    // Instant client-side fallback thumbnail from video ID
    const videoId = extractYouTubeVideoId(url);
    if (videoId && !formData.thumbnail_url) {
      const fallbackThumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      setThumbnailPreview(fallbackThumb);
      setFormData((prev) => ({ ...prev, thumbnail_url: fallbackThumb }));
    }

    try {
      const res = await youtubeAPI.fetch(url);
      if (res?.data?.data) {
        const d = res.data.data;
        const newTitle = d.title || formData.title;
        const newThumb = d.thumbnail_url || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : formData.thumbnail_url);
        const newCount = d.video_count || formData.video_count;
        const detectedType = d.type || (url.includes('playlist') ? 'playlist' : 'video');

        setFormData((prev) => ({
          ...prev,
          title: newTitle || prev.title,
          thumbnail_url: newThumb || prev.thumbnail_url,
          content_type: detectedType,
          video_count: newCount || prev.video_count,
        }));

        if (newThumb) {
          setThumbnailPreview(newThumb);
          setThumbnailError(false);
          setThumbMode('youtube');
        }

        setYtSuccess('Data video/playlist berhasil diambil dari YouTube.');
      } else if (videoId) {
        setYtSuccess('Thumbnail berhasil diekstrak langsung dari URL YouTube.');
      }
    } catch (err) {
      // If server API fails but we have videoId, use fallback thumbnail
      if (videoId) {
        const fallbackThumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        setFormData((prev) => ({ ...prev, thumbnail_url: fallbackThumb }));
        setThumbnailPreview(fallbackThumb);
        setThumbnailError(false);
        setYtSuccess('Thumbnail berhasil diekstrak langsung dari YouTube.');
      } else {
        setYtError(err?.response?.data?.message || 'Gagal mengambil informasi dari YouTube.');
      }
    } finally {
      setYtLoading(false);
    }
  };

  // Handle device file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageProcessing(true);
    setThumbnailError(false);
    try {
      const compressedDataUrl = await processUploadedImage(file, 960, 540, 0.85);
      setFormData((prev) => ({ ...prev, thumbnail_url: compressedDataUrl }));
      setThumbnailPreview(compressedDataUrl);
      setUploadedFileName(file.name);
      setThumbMode('upload');
    } catch (err) {
      alert(err.message || 'Gagal memproses gambar dari perangkat.');
    } finally {
      setImageProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle custom URL input
  const handleCustomUrlApply = () => {
    const url = customUrlInput.trim();
    if (!url) return;
    setFormData((prev) => ({ ...prev, thumbnail_url: url }));
    setThumbnailPreview(url);
    setThumbnailError(false);
  };

  // Reset thumbnail
  const handleResetThumbnail = () => {
    setFormData((prev) => ({ ...prev, thumbnail_url: '' }));
    setThumbnailPreview('');
    setCustomUrlInput('');
    setUploadedFileName('');
    setThumbnailError(false);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Judul konten wajib diisi.';
    } else if (formData.title.length > 120) {
      newErrors.title = 'Judul maksimal 120 karakter.';
    }

    if (!formData.youtube_url.trim()) {
      newErrors.youtube_url = 'URL YouTube wajib diisi.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      title: formData.title.trim(),
      game_tag: formData.game_tag.trim() || 'Lainnya',
      category: formData.game_tag.trim() || 'Lainnya',
      youtube_url: formData.youtube_url.trim(),
      thumbnail_url: formData.thumbnail_url || undefined,
      thumbnail: formData.thumbnail_url || undefined,
      content_type: formData.content_type,
      video_count: formData.content_type === 'playlist' ? (parseInt(formData.video_count, 10) || 1) : 1,
      total_duration: formData.total_duration ? formData.total_duration.trim() : undefined,
      is_featured: Boolean(formData.is_featured),
      is_visible: Boolean(formData.is_visible),
      sort_order: parseInt(formData.sort_order, 10) || 1,
    };

    onSave(payload);
  };

  // Animation visibility
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
        className={`fixed inset-0 bg-bg-base/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Slide-in Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-[480px] max-w-full bg-bg-nav border-l border-border-subtle z-50 flex flex-col shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between flex-shrink-0 bg-bg-card/50">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Layers className="w-3.5 h-3.5 text-accent-cyan" />
              <span className="text-[10px] font-mono text-accent-cyan tracking-wider uppercase font-semibold">
                {isEdit ? 'EDIT KATALOG' : (content?.isNew ? 'KONVERSI JADWAL KE KATALOG' : 'TAMBAH KONTEN BARU')}
              </span>
            </div>
            <h2 className="text-lg font-bold text-text-primary font-display">
              {isEdit ? 'Edit Konten Katalog' : (content?.isNew ? 'Tambah Konten dari Jadwal' : 'Tambah Konten Katalog')}
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Kurasi video atau seri playlist YouTube untuk portal penonton
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-card transition-colors"
            title="Tutup Form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 overscroll-contain">
          {/* ── 1. URL YOUTUBE & AUTO-FETCH ───────────────────────────── */}
          <div className="p-4 bg-bg-card border border-border-subtle rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-text-secondary uppercase tracking-wider flex items-center gap-1.5 font-medium">
                <Play className="w-3.5 h-3.5 text-status-live" />
                <span>Tautan YouTube</span>
                <span className="text-status-live">*</span>
              </label>
              <span className="text-[10px] text-text-muted font-mono">Video / Playlist</span>
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                name="youtube_url"
                value={formData.youtube_url}
                onChange={handleChange}
                placeholder="https://youtube.com/watch?v=... atau playlist?list=..."
                className={`w-full px-3.5 py-2.5 bg-bg-surface border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-colors ${
                  errors.youtube_url ? 'border-status-live' : 'border-border-subtle'
                }`}
              />
              <button
                type="button"
                onClick={handleYoutubeFetch}
                disabled={ytLoading || !formData.youtube_url}
                className="px-3 py-2 bg-accent-cyan/10 hover:bg-accent-cyan text-accent-cyan hover:text-text-on-cta border border-accent-cyan/30 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                title="Ambil judul dan thumbnail otomatis dari YouTube"
              >
                {ytLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>{ytLoading ? 'Mengambil...' : 'Ambil Info'}</span>
              </button>
            </div>

            {errors.youtube_url && (
              <p className="text-xs text-status-live flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.youtube_url}</span>
              </p>
            )}
            {ytError && (
              <p className="text-xs text-status-live flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{ytError}</span>
              </p>
            )}
            {ytSuccess && (
              <p className="text-xs text-status-done flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{ytSuccess}</span>
              </p>
            )}
          </div>

          {/* ── 2. DETAIL KONTEN ───────────────────────────────────────── */}
          <div className="p-4 bg-bg-card border border-border-subtle rounded-2xl space-y-4">
            {/* Judul Konten */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono text-text-secondary uppercase tracking-wider font-medium">
                  Judul Konten <span className="text-status-live">*</span>
                </label>
                <span className={`text-[10px] font-mono ${formData.title.length > 90 ? 'text-status-live' : 'text-text-muted'}`}>
                  {formData.title.length}/100
                </span>
              </div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Contoh: Persona 3 Reload Full Walkthrough Episode 1..."
                maxLength={100}
                className={`w-full px-3.5 py-2.5 bg-bg-surface border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-colors ${
                  errors.title ? 'border-status-live' : 'border-border-subtle'
                }`}
              />
              {errors.title && (
                <p className="text-xs text-status-live mt-1">{errors.title}</p>
              )}
            </div>

            {/* Kategori Konten */}
            <div>
              <label className="text-xs font-mono text-text-secondary uppercase tracking-wider font-medium block mb-1.5">
                Kategori Konten
              </label>

              {/* Preset Category Pills */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {CATEGORY_PRESETS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, game_tag: cat }))}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
                      formData.game_tag === cat
                        ? 'bg-accent-cyan text-text-on-cta font-bold shadow-sm'
                        : 'bg-bg-surface border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-card'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <div className="relative">
                <input
                  type="text"
                  name="game_tag"
                  value={formData.game_tag}
                  onChange={handleChange}
                  placeholder="Kategori atau genre kustom..."
                  className="w-full px-3.5 py-2 bg-bg-surface border border-border-subtle rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-cyan font-mono"
                />
                <Tag className="w-3.5 h-3.5 text-text-muted absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Tipe Konten: Single Video vs Playlist */}
            <div>
              <label className="text-xs font-mono text-text-secondary uppercase tracking-wider font-medium block mb-1.5">
                Format Konten
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, content_type: 'video', video_count: 1 }))}
                  className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-center gap-2 transition-all ${
                    formData.content_type === 'video'
                      ? 'bg-accent-cyan/15 border-accent-cyan/40 text-accent-cyan font-bold shadow-sm'
                      : 'bg-bg-surface border-border-subtle text-text-muted hover:text-text-primary'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Video Tunggal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, content_type: 'playlist' }))}
                  className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-center gap-2 transition-all ${
                    formData.content_type === 'playlist'
                      ? 'bg-accent-purple/15 border-accent-purple/40 text-accent-purple font-bold shadow-sm'
                      : 'bg-bg-surface border-border-subtle text-text-muted hover:text-text-primary'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Playlist / Seri</span>
                </button>
              </div>
            </div>

            {/* Detail jika Playlist */}
            {formData.content_type === 'playlist' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-bg-surface/50 border border-border-subtle/70 rounded-xl animate-fade-in">
                <div>
                  <label className="text-[11px] font-mono text-text-secondary uppercase block mb-1">
                    Jumlah Video
                  </label>
                  <input
                    type="number"
                    name="video_count"
                    min="1"
                    value={formData.video_count || ''}
                    onChange={handleChange}
                    placeholder="12"
                    className="w-full px-3 py-1.5 bg-bg-surface border border-border-subtle rounded-lg text-xs text-text-primary font-mono focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-text-secondary uppercase block mb-1">
                    Estimasi Durasi
                  </label>
                  <input
                    type="text"
                    name="total_duration"
                    value={formData.total_duration}
                    onChange={handleChange}
                    placeholder="Contoh: 24 Jam"
                    className="w-full px-3 py-1.5 bg-bg-surface border border-border-subtle rounded-lg text-xs text-text-primary font-mono focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── 3. THUMBNAIL (DUAL MODE) ──────────────────────────────── */}
          <div className="p-4 bg-bg-card border border-border-subtle rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-text-secondary uppercase tracking-wider font-medium flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-accent-purple" />
                <span>Thumbnail Cover</span>
              </label>
              <span className="text-[10px] font-mono text-text-muted">Rasio 16:9</span>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex items-center gap-1 p-1 bg-bg-surface border border-border-subtle rounded-xl text-xs font-mono">
              <button
                type="button"
                onClick={() => setThumbMode('youtube')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                  thumbMode === 'youtube'
                    ? 'bg-bg-card text-accent-cyan shadow-sm font-semibold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Auto YouTube
              </button>
              <button
                type="button"
                onClick={() => setThumbMode('upload')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                  thumbMode === 'upload'
                    ? 'bg-bg-card text-accent-cyan shadow-sm font-semibold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setThumbMode('url')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                  thumbMode === 'url'
                    ? 'bg-bg-card text-accent-cyan shadow-sm font-semibold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Tautan Web
              </button>
            </div>

            {/* Upload from Device Mode */}
            {thumbMode === 'upload' && (
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageProcessing}
                  className="w-full py-3 px-4 border border-dashed border-border-subtle hover:border-accent-cyan/50 bg-bg-surface/50 rounded-xl text-xs font-mono text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center gap-2"
                >
                  {imageProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin text-accent-cyan" />
                  ) : (
                    <Upload className="w-4 h-4 text-accent-cyan" />
                  )}
                  <span>{uploadedFileName || 'Pilih gambar dari perangkat...'}</span>
                </button>
              </div>
            )}

            {/* Custom URL Mode */}
            {thumbMode === 'url' && (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://domain.com/gambar.jpg"
                  className="flex-1 px-3 py-2 bg-bg-surface border border-border-subtle rounded-xl text-xs text-text-primary font-mono placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                />
                <button
                  type="button"
                  onClick={handleCustomUrlApply}
                  className="px-3 py-2 bg-bg-surface border border-border-subtle hover:border-accent-cyan rounded-xl text-xs font-mono text-text-primary transition-colors"
                >
                  Terapkan
                </button>
              </div>
            )}

            {/* Thumbnail Preview Area */}
            {thumbnailPreview ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-border-subtle bg-bg-surface group/preview">
                {thumbnailError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-status-live gap-1.5 p-4 text-center">
                    <AlertCircle className="w-6 h-6" />
                    <span className="text-xs font-mono">Gagal memuat pratinjau thumbnail</span>
                  </div>
                ) : (
                  <img
                    src={thumbnailPreview}
                    alt="Pratinjau Thumbnail"
                    onError={() => setThumbnailError(true)}
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={handleResetThumbnail}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-bg-base/80 hover:bg-status-live text-text-muted hover:text-white transition-colors"
                  title="Hapus Thumbnail"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="aspect-video rounded-xl border border-dashed border-border-subtle flex flex-col items-center justify-center text-text-muted gap-1 bg-bg-surface/30">
                <Tv className="w-8 h-8 opacity-40" />
                <span className="text-[11px] font-mono opacity-60">
                  Thumbnail akan terisi otomatis saat mengambil info YouTube
                </span>
              </div>
            )}
          </div>

          {/* ── 4. URUTAN & PENGATURAN STATUS ─────────────────────────── */}
          <div className="p-4 bg-bg-card border border-border-subtle rounded-2xl space-y-4">
            {/* Sort Order Input */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-mono text-text-secondary uppercase tracking-wider font-medium block">
                  Urutan Prioritas (Sort Order)
                </label>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Nomor urut tampil (1 = paling atas di katalog)
                </p>
              </div>
              <input
                type="number"
                name="sort_order"
                min="1"
                max="999"
                value={formData.sort_order}
                onChange={handleChange}
                className="w-20 px-3 py-1.5 bg-bg-surface border border-border-subtle rounded-xl text-center text-sm font-mono font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-cyan"
              />
            </div>

            <div className="border-t border-border-subtle/60 pt-3 space-y-3">
              {/* Featured Banner Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-text-primary">Sorotan Utama (Featured Banner)</p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Tampilkan di banner besar paling atas halaman Content Guide
                  </p>
                </div>
                <Toggle
                  checked={formData.is_featured}
                  onChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_featured: checked }))
                  }
                />
              </div>

              {/* Visible Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-text-primary">Status Publik (Visible)</p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Aktifkan agar tayang untuk penonton. Matikan untuk simpan sebagai Draft
                  </p>
                </div>
                <Toggle
                  checked={formData.is_visible}
                  onChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_visible: checked }))
                  }
                />
              </div>
            </div>
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
                <Save className="w-4 h-4" />
                <span>{isEdit ? 'Simpan Perubahan' : 'Simpan Konten'}</span>
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

export default ContentFormPanel;
