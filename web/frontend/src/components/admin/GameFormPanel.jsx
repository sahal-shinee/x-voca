import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function GameFormPanel({
  isOpen,
  onClose,
  onSave,
  game = null,
  loading = false,
}) {
  const isEdit = !!game;

  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    publisher: '',
    cover_url: '',
  });
  const [errors, setErrors] = useState({});

  // Initialize form
  useEffect(() => {
    if (game) {
      setFormData({
        title: game.title || '',
        genre: game.genre || '',
        publisher: game.publisher || '',
        cover_url: game.cover_url || '',
      });
    } else {
      setFormData({
        title: '',
        genre: '',
        publisher: '',
        cover_url: '',
      });
    }
    setErrors({});
  }, [game, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Judul game wajib diisi';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSave(formData);
  };

  // Animation
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
        className={`fixed inset-0 bg-bg-base/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`fixed top-0 right-0 h-screen w-[420px] max-w-full bg-bg-nav border-l border-border-subtle z-50 flex flex-col transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-accent-cyan">GAME MANAGEMENT</span>
            <h2 className="text-lg font-bold text-text-primary">
              {isEdit ? 'Edit Game' : 'Tambah Game Baru'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-text-muted hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form id="game-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="text-xs font-mono text-text-secondary uppercase block mb-2">
              Judul Game <span className="text-status-live">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Elden Ring"
              className={`w-full px-4 py-3 bg-bg-input border rounded-lg text-sm text-text-primary ${errors.title ? 'border-status-live' : 'border-border-subtle focus:border-accent-cyan'}`}
            />
            {errors.title && <p className="text-xs text-status-live mt-1">{errors.title}</p>}
          </div>

          {/* Genre */}
          <div>
            <label className="text-xs font-mono text-text-secondary uppercase block mb-2">
              Genre
            </label>
            <input
              type="text"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              placeholder="Action RPG, Souls-like"
              className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary"
            />
          </div>

          {/* Publisher */}
          <div>
            <label className="text-xs font-mono text-text-secondary uppercase block mb-2">
              Publisher
            </label>
            <input
              type="text"
              name="publisher"
              value={formData.publisher}
              onChange={handleChange}
              placeholder="FromSoftware"
              className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary"
            />
          </div>

          {/* Cover URL */}
          <div>
            <label className="text-xs font-mono text-text-secondary uppercase block mb-2">
              Cover Image URL
            </label>
            <input
              type="url"
              name="cover_url"
              value={formData.cover_url}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-border-subtle space-y-3">
          <button
            type="submit"
            form="game-form"
            disabled={loading}
            className="w-full py-3 bg-gradient-cta text-text-on-cta font-semibold rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan Game'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 text-text-secondary hover:text-text-primary"
          >
            Batal
          </button>
        </div>
      </div>
    </>
  );
}

export default GameFormPanel;

