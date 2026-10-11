import { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, Loader2, Sparkles, User, Link as LinkIcon, MessageSquare } from 'lucide-react';
import { collabRequestService } from '../../services/collabRequestService';
import { getFingerprint } from '../../utils/fingerprint';

/**
 * CollabRequestModal - Viewer modal to submit streamer collab requests
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Modal close handler
 * @param {Function} [props.onSuccess] - Callback after successful submission
 */
export function CollabRequestModal({ isOpen, onClose, onSuccess }) {
  const [streamerName, setStreamerName] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [message, setMessage] = useState('');

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState(null);

  const resetForm = useCallback(() => {
    setStreamerName('');
    setSocialLink('');
    setMessage('');
    setErrors({});
    setApiError(null);
    setIsSuccess(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, handleClose]);

  if (!isOpen) return null;

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!streamerName.trim()) {
      newErrors.streamerName = 'Nama streamer wajib diisi.';
    } else if (streamerName.trim().length < 2) {
      newErrors.streamerName = 'Nama streamer minimal 2 karakter.';
    }

    if (!socialLink.trim()) {
      newErrors.socialLink = 'Link sosial media wajib diisi.';
    } else {
      // Basic check for URL or handle pattern
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
      const handlePattern = /^@?[\w.-]{2,}$/;
      if (!urlPattern.test(socialLink.trim()) && !handlePattern.test(socialLink.trim())) {
        newErrors.socialLink = 'Format link sosial media tidak valid (contoh: twitter.com/name atau https://...).';
      }
    }

    if (message.length > 500) {
      newErrors.message = 'Pesan maksimal 500 karakter.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Get visitor fingerprint
      const fingerprint = await getFingerprint();

      // Submit via API
      const response = await collabRequestService.submitCollabRequest({
        requested_streamer_name: streamerName.trim(),
        requested_streamer_social: socialLink.trim(),
        message: message.trim() || undefined,
        viewer_identifier: fingerprint
      });

      if (response.data?.success) {
        setIsSuccess(true);
        if (onSuccess) {
          onSuccess(response.data.data);
        }

        // Auto close after 2 seconds
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setApiError(response.data?.message || 'Gagal mengirim request collab.');
      }
    } catch (err) {
      console.error('Submit collab request error:', err);
      const msg = err.response?.data?.message || err.message || 'Terjadi kesalahan saat mengirim request.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
        onClick={() => {
          if (!loading) handleClose();
        }}
      />

      {/* Modal Container */}
      <div
        className="
          relative w-full max-w-lg
          bg-[#18132b] border border-[rgba(192,132,252,0.3)]
          rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]
          overflow-hidden z-10 transition-all duration-300
          animate-scale-in text-white
        "
        style={{
          boxShadow: '0 0 35px rgba(126, 224, 210, 0.15), 0 25px 60px -15px rgba(0,0,0,0.8)'
        }}
      >
        {/* Top Glow Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-accent-cyan via-accent-lilac to-accent-cyan" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={loading}
          className="
            absolute top-5 right-5 p-2 rounded-full
            text-[#a89ec0] hover:text-white hover:bg-white/10
            transition-colors duration-150 focus:outline-none
          "
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* SUCCESS VIEW */}
        {isSuccess ? (
          <div className="p-8 sm:p-10 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-accent-cyan/15 border border-accent-cyan/40 flex items-center justify-center text-accent-cyan animate-bounce-gentle">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold font-display text-white">
                Request Collab Terkirim!
              </h3>
              <p className="text-sm text-[#a89ec0] max-w-sm mx-auto leading-relaxed">
                Terima kasih atas rekomendasimu! Permintaan collab untuk{' '}
                <strong className="text-accent-cyan">@{streamerName}</strong> telah diterima dan akan ditinjau oleh tim Xion.
              </p>
            </div>

            <p className="text-xs text-white/40 font-mono pt-2">
              Menutup otomatis dalam 2 detik...
            </p>
          </div>
        ) : (
          /* FORM VIEW */
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="mb-6 pr-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(192,132,252,0.12)] border border-[rgba(192,132,252,0.25)] text-accent-lilac text-[11px] font-mono uppercase tracking-wider mb-2.5">
                <Sparkles className="w-3 h-3 text-accent-cyan" />
                <span>Rekomendasi Siaran</span>
              </div>
              <h2 className="text-2xl font-bold font-display tracking-tight text-white">
                Request Collab Streamer
              </h2>
              <p className="text-sm text-[#a89ec0] mt-1">
                Ingin Xion Regalia collab bareng creator favoritmu? Tuliskan infonya di bawah!
              </p>
            </div>

            {/* API Error Notification */}
            {apiError && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <X className="w-4 h-4 flex-shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field 1: Streamer Name */}
              <div>
                <label className="block text-xs font-medium text-white/90 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-accent-cyan" />
                    Nama Streamer <span className="text-red-400">*</span>
                  </span>
                  <span className="text-[10px] text-[#a89ec0] font-mono">Wajib</span>
                </label>
                <input
                  type="text"
                  value={streamerName}
                  onChange={(e) => {
                    setStreamerName(e.target.value);
                    if (errors.streamerName) {
                      setErrors((prev) => ({ ...prev, streamerName: undefined }));
                    }
                  }}
                  placeholder="Contoh: Kobo Kanaeru, Mythia Batford, dll."
                  className={`
                    w-full px-4 py-2.5 rounded-xl bg-[#231f42] border text-sm text-white
                    placeholder:text-[#6d6494] focus:outline-none focus:ring-2
                    transition-all duration-150
                    ${
                      errors.streamerName
                        ? 'border-red-400 focus:ring-red-400/30'
                        : 'border-[#3d3560] focus:border-accent-cyan focus:ring-accent-cyan/20'
                    }
                  `}
                />
                {errors.streamerName && (
                  <p className="text-xs text-red-400 mt-1">{errors.streamerName}</p>
                )}
              </div>

              {/* Field 2: Social Media Link */}
              <div>
                <label className="block text-xs font-medium text-white/90 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-accent-lilac" />
                    Link Sosial Media / Channel <span className="text-red-400">*</span>
                  </span>
                  <span className="text-[10px] text-[#a89ec0] font-mono">Wajib</span>
                </label>
                <input
                  type="text"
                  value={socialLink}
                  onChange={(e) => {
                    setSocialLink(e.target.value);
                    if (errors.socialLink) {
                      setErrors((prev) => ({ ...prev, socialLink: undefined }));
                    }
                  }}
                  placeholder="twitter.com/streamer atau youtube.com/@streamer"
                  className={`
                    w-full px-4 py-2.5 rounded-xl bg-[#231f42] border text-sm text-white
                    placeholder:text-[#6d6494] focus:outline-none focus:ring-2
                    transition-all duration-150
                    ${
                      errors.socialLink
                        ? 'border-red-400 focus:ring-red-400/30'
                        : 'border-[#3d3560] focus:border-accent-lilac focus:ring-accent-lilac/20'
                    }
                  `}
                />
                {errors.socialLink && (
                  <p className="text-xs text-red-400 mt-1">{errors.socialLink}</p>
                )}
              </div>

              {/* Field 3: Message (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-white/90 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-accent-cyan" />
                    Pesan atau Ide Collab (Opsional)
                  </label>
                  <span className="text-[10px] font-mono text-[#a89ec0]">
                    {message.length}/500
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={message}
                  maxLength={500}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message) {
                      setErrors((prev) => ({ ...prev, message: undefined }));
                    }
                  }}
                  placeholder="Ceritakan alasan atau ide game/konten seru yang ingin mereka mainkan bareng..."
                  className={`
                    w-full px-4 py-2.5 rounded-xl bg-[#231f42] border text-sm text-white
                    placeholder:text-[#6d6494] focus:outline-none focus:ring-2 resize-none
                    transition-all duration-150
                    ${
                      errors.message
                        ? 'border-red-400 focus:ring-red-400/30'
                        : 'border-[#3d3560] focus:border-accent-cyan focus:ring-accent-cyan/20'
                    }
                  `}
                />
                {errors.message && (
                  <p className="text-xs text-red-400 mt-1">{errors.message}</p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="
                    px-4 py-2.5 rounded-xl border border-[#3d3560]
                    text-sm text-[#a89ec0] hover:text-white hover:bg-white/5
                    transition-all duration-150
                  "
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    px-6 py-2.5 rounded-xl font-semibold text-sm
                    bg-gradient-to-r from-accent-cyan to-accent-lilac
                    text-[#13111C] hover:opacity-95 active:scale-[0.98]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    shadow-[0_4px_20px_rgba(126,224,210,0.3)]
                    flex items-center gap-2 transition-all duration-150
                  "
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <span>Kirim Request</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default CollabRequestModal;
