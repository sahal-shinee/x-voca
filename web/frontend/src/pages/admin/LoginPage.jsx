import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * LoginPage - Halaman login untuk Creator/Admin
 * Referensi: UI_SPEC_WEB.md — HALAMAN 4
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

  // Check for return URL from redirect
  useEffect(() => {
    if (location.state?.reason === 'expired') {
      setExpiredMessage('Sesi Anda telah berakhir. Silakan login kembali.');
    } else if (location.state?.reason === 'unauthenticated') {
      setExpiredMessage('Anda harus login untuk mengakses halaman tersebut.');
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
        // Redirect to the page they were trying to access, or dashboard
        const from = location.state?.from || '/admin/dashboard';
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Email atau password salah');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base relative overflow-hidden flex items-center justify-center px-4">
      {/* Background gradient radial */}
      <div className="absolute inset-0 bg-gradient-radial"></div>

      {/* Decorative elements */}
      <div className="absolute top-8 left-8 text-xs font-mono text-text-muted">
        NODE // TOKYO-03 · LATENCY 12ms
      </div>
      <div className="absolute top-8 right-8 text-xs font-mono text-text-muted">
        AUTH GATE // v2.0.3 STABLE
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-[480px] bg-bg-card border border-border-subtle rounded-2xl p-8 lg:p-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-xl">|</span>
            <h1 className="text-xl font-bold text-text-primary">X-VOCA 🔒</h1>
          </div>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-input text-accent-gold text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-gold"></span>
            ● RESTRICTED ACCESS
          </span>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-2xl lg:text-[28px] font-bold text-text-primary mb-2">
            Creator Login
          </h2>
          <p className="text-sm text-text-secondary">
            Hanya untuk <span className="text-accent-cyan">Xion Regalia</span>
          </p>
        </div>

        {/* Error / Session Expired Message */}
        {(error || expiredMessage) && (
          <div className="mb-6 p-4 bg-status-live/10 border border-status-live/30 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-status-live flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-status-live text-sm">{error || expiredMessage}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-xs font-mono text-text-secondary uppercase tracking-wider mb-2">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="xion.regalia@gmail.com"
                required
                className="w-full pl-12 pr-4 py-3.5 bg-bg-base border border-border-subtle rounded-lg text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-xs font-mono text-text-secondary uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-12 pr-12 py-3.5 bg-bg-base border border-border-subtle rounded-lg text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-cta text-text-on-cta font-bold text-base rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Memproses...
              </>
            ) : (
              <>
                Masuk
                <span>→</span>
              </>
            )}
          </button>
        </form>

        {/* Forgot Password */}
        <p className="text-center mt-6 text-sm text-text-muted">
          Lupa password? Hubungi admin.
        </p>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border-subtle text-center">
          <p className="text-[11px] font-mono text-text-muted mb-1">
            ● TLS 1.3 SECURE ENCLAVE
          </p>
          <p className="text-[10px] text-text-muted">
            © 2025 X-VOCA REGALIA OPS · ENCRYPTED CREATOR SESSION
          </p>
        </div>
      </div>

      {/* Back to viewer link */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <Link to="/" className="text-text-muted hover:text-accent-cyan transition-colors text-sm flex items-center gap-2">
          <span>←</span>
          Kembali ke Portal Viewer
        </Link>
      </div>
    </div>
  );
}

export default LoginPage;
