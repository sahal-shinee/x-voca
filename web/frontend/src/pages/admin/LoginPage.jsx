import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoXion from '../../assets/logo_xion.png';

// ========== CLEAN VECTOR SVG ICONS (NO EMOJIS, ZERO AI SLOP) ==========
const MailIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

const ArrowLeftIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const AlertCircleIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

/**
 * LoginPage - Halaman login yang bersih, modern, dan profesional untuk Creator / Admin.
 */
function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [expiredMessage, setExpiredMessage] = useState('');

  // UX State
  const [capsOn, setCapsOn] = useState(false);
  const [emailInvalid, setEmailInvalid] = useState(false);

  // Check for return URL from redirect
  useEffect(() => {
    if (location.state?.reason === 'expired') {
      setExpiredMessage('Sesi Anda telah berakhir. Silakan login kembali.');
    } else if (location.state?.reason === 'unauthenticated') {
      setExpiredMessage('Silakan login untuk mengakses halaman admin.');
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExpiredMessage('');
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        const from = location.state?.from || '/admin/dashboard';
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Email atau password salah');
      }
    } catch {
      setError('Terjadi kesalahan saat memproses login. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Deteksi Caps Lock saat mengetik password
  const handlePasswordKey = (e) => {
    if (e.getModifierState) setCapsOn(e.getModifierState('CapsLock'));
  };

  return (
    <div className="min-h-screen bg-[#0D0B1A] relative overflow-hidden flex flex-col items-center justify-center px-4 py-12 text-white">
      {/* Calm Ambient Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#7ee0d2]/[0.03] blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#c084fc]/[0.025] blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Brand / Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7ee0d2] rounded-xl px-2 py-1 mb-3 transition-transform duration-200 hover:scale-[1.02]"
          >
            <img
              src={logoXion}
              alt="Xion Regalia Logo"
              className="h-12 w-auto object-contain drop-shadow-[0_2px_12px_rgba(126,224,210,0.25)]"
            />
            <span className="font-bold text-white text-xl tracking-wider font-display group-hover:text-[#7ee0d2] transition-colors">
              X-VOCA
            </span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Creator Login
          </h1>
          <p className="text-xs text-[#8E8AAB] mt-1 text-center">
            Masuk untuk mengelola jadwal siaran dan konten X-VOCA
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#141126] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-md">
          {/* Error / Notification Banner */}
          {(error || expiredMessage) && (
            <div
              role="alert"
              className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-150"
            >
              <AlertCircleIcon className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">{error || expiredMessage}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-[#C4C0D8] mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8AAB]">
                  <MailIcon className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailInvalid && e.target.validity.valid) setEmailInvalid(false);
                  }}
                  onBlur={(e) => setEmailInvalid(e.target.value !== '' && !e.target.validity.valid)}
                  placeholder="xion.regalia@gmail.com"
                  required
                  autoComplete="email"
                  inputMode="email"
                  spellCheck={false}
                  readOnly={loading}
                  aria-invalid={emailInvalid}
                  className={`w-full pl-10 pr-4 py-2.5 bg-[#0D0B1A] border rounded-xl text-sm text-white placeholder-[#8E8AAB]/40 focus:outline-none transition-colors ${
                    emailInvalid
                      ? 'border-rose-500/60 focus:border-rose-500'
                      : 'border-white/10 focus:border-[#7ee0d2]/70 focus:ring-1 focus:ring-[#7ee0d2]/20'
                  }`}
                />
              </div>
              {emailInvalid && (
                <p className="mt-1.5 text-xs text-rose-400">
                  Format email tidak valid.
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-[#C4C0D8]"
                >
                  Password
                </label>
                {capsOn && (
                  <span className="text-[11px] font-medium text-amber-300">
                    Caps Lock aktif
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8AAB]">
                  <LockIcon className="w-4 h-4" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handlePasswordKey}
                  onKeyUp={handlePasswordKey}
                  onBlur={() => setCapsOn(false)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  readOnly={loading}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#0D0B1A] border border-white/10 rounded-xl text-sm text-white placeholder-[#8E8AAB]/40 focus:border-[#7ee0d2]/70 focus:outline-none focus:ring-1 focus:ring-[#7ee0d2]/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8AAB] hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#7ee0d2] hover:bg-[#6bd6c7] text-[#0D0B1A] font-semibold text-sm rounded-xl transition-all duration-200 shadow-[0_4px_14px_rgba(126,224,210,0.2)] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Masuk</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs text-[#8E8AAB] hover:text-[#7ee0d2] transition-colors py-2 px-3 rounded-lg hover:bg-white/[0.03]"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Utama</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
