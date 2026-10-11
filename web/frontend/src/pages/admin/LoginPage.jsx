import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ========== GATE VISUAL DATA ==========

// 72 garis skala untuk cincin gerbang (dihitung sekali, di luar komponen)
const TICKS = Array.from({ length: 72 }, (_, i) => {
  const a = (i * 5 * Math.PI) / 180;
  const major = i % 6 === 0;
  const r1 = 372;
  const r2 = major ? 394 : 384;
  return {
    x1: (400 + Math.cos(a) * r1).toFixed(2),
    y1: (400 + Math.sin(a) * r1).toFixed(2),
    x2: (400 + Math.cos(a) * r2).toFixed(2),
    y2: (400 + Math.sin(a) * r2).toFixed(2),
    major,
  };
});

// Status gerbang diturunkan dari state form yang nyata (bukan dekorasi acak)
const GATE = {
  standby: { label: 'STANDBY', tone: 'text-text-muted', ring: 'opacity-30', pulse: false },
  typing: { label: 'CREDENTIALS PENDING', tone: 'text-accent-cyan', ring: 'opacity-40', pulse: false },
  ready: { label: 'READY TO VERIFY', tone: 'text-accent-cyan', ring: 'opacity-60', pulse: false },
  verifying: { label: 'VERIFYING...', tone: 'text-accent-gold', ring: 'opacity-70', pulse: true },
  denied: { label: 'ACCESS DENIED', tone: 'text-status-live', ring: 'opacity-70', pulse: false },
  expired: { label: 'SESSION EXPIRED', tone: 'text-accent-gold', ring: 'opacity-60', pulse: false },
};

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

  // State khusus tampilan (tidak berhubungan dengan auth / data)
  const [capsOn, setCapsOn] = useState(false);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [shake, setShake] = useState(false);
  const rootRef = useRef(null);

  // Check for return URL from redirect
  useEffect(() => {
    if (location.state?.reason === 'expired') {
      setExpiredMessage('Sesi Anda telah berakhir. Silakan login kembali.');
    } else if (location.state?.reason === 'unauthenticated') {
      setExpiredMessage('Anda harus login untuk mengakses halaman tersebut.');
    }
  }, [location.state]);

  // Kartu bergetar sebentar setiap kali login gagal
  useEffect(() => {
    if (!error) return undefined;
    setShake(true);
    const t = setTimeout(() => setShake(false), 500);
    return () => clearTimeout(t);
  }, [error]);

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

  // Sorot cahaya halus mengikuti kursor (CSS variable, tanpa re-render)
  const handleMouseMove = (e) => {
    const el = rootRef.current;
    if (!el) return;
    el.style.setProperty('--mx', `${e.clientX}px`);
    el.style.setProperty('--my', `${e.clientY}px`);
  };

  // Deteksi Caps Lock saat mengetik password
  const handlePasswordKey = (e) => {
    if (e.getModifierState) setCapsOn(e.getModifierState('CapsLock'));
  };

  // Status gerbang
  let gateKey = 'standby';
  if (loading) gateKey = 'verifying';
  else if (error) gateKey = 'denied';
  else if (expiredMessage) gateKey = 'expired';
  else if (email && password) gateKey = 'ready';
  else if (email || password) gateKey = 'typing';
  const gate = GATE[gateKey];

  return (
    <div
      ref={rootRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-bg-base relative overflow-hidden flex items-center justify-center px-4 py-24"
      style={{ '--mx': '50%', '--my': '40%' }}
    >
      <style>{`
        @keyframes lg-spin { to { transform: rotate(360deg); } }
        @keyframes lg-spin-rev { to { transform: rotate(-360deg); } }
        @keyframes lg-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        @keyframes lg-shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 40% { transform: translateX(7px); } 60% { transform: translateX(-5px); } 80% { transform: translateX(3px); } }
        @keyframes lg-blink { 0%,49% { opacity: 1; } 50%,100% { opacity: .15; } }
        @keyframes lg-sweep { from { transform: translateX(-120%); } to { transform: translateX(420%); } }
        .lg-spin { animation: lg-spin 140s linear infinite; }
        .lg-spin-rev { animation: lg-spin-rev 90s linear infinite; }
        .lg-scan { animation: lg-spin 2.4s linear infinite; }
        .lg-rise { animation: lg-rise .6s cubic-bezier(.2,.8,.2,1) both; }
        .lg-shake { animation: lg-shake .45s ease-in-out; }
        .lg-blink { animation: lg-blink 1.1s steps(1) infinite; }
        .lg-sweep { animation: lg-sweep 1.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .lg-spin, .lg-spin-rev, .lg-scan, .lg-rise, .lg-shake, .lg-blink, .lg-sweep { animation: none !important; }
        }
      `}</style>

      {/* Background gradient radial */}
      <div className="absolute inset-0 bg-gradient-radial"></div>

      {/* Grid halus dengan masker, memberi kesan panel kontrol */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(168,158,192,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(168,158,192,0.07) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
        }}
      />

      {/* Sorot cahaya mengikuti kursor */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(480px circle at var(--mx) var(--my), rgba(126,224,210,0.06), transparent 65%)' }}
      />

      {/* Cincin gerbang: warna dan aktivitasnya mengikuti status form */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(150vw,900px)] aspect-square transition-all duration-500 ${gate.tone} ${gate.ring}`}
      >
        <svg viewBox="0 0 800 800" className="lg-spin absolute inset-0 w-full h-full" fill="none">
          <circle cx="400" cy="400" r="372" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          {TICKS.map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke="currentColor"
              strokeWidth={t.major ? 1.6 : 1}
              opacity={t.major ? 0.9 : 0.5}
            />
          ))}
        </svg>
        <svg viewBox="0 0 800 800" className="lg-spin-rev absolute inset-0 w-full h-full" fill="none">
          <circle cx="400" cy="400" r="330" stroke="currentColor" strokeWidth="1" strokeDasharray="2 10" opacity="0.55" />
          <circle cx="400" cy="70" r="4" fill="currentColor" />
          <circle cx="730" cy="400" r="3" fill="currentColor" opacity="0.7" />
          <circle cx="400" cy="730" r="4" fill="currentColor" />
          <circle cx="70" cy="400" r="3" fill="currentColor" opacity="0.7" />
        </svg>
        <svg viewBox="0 0 800 800" className="absolute inset-0 w-full h-full" fill="none">
          <circle cx="400" cy="400" r="260" stroke="currentColor" strokeWidth="1" opacity="0.25" />
          <path d="M400 120V160M400 640V680M120 400H160M640 400H680" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        </svg>
        {/* Busur pemindai: hanya tampil saat kredensial diverifikasi */}
        <svg
          viewBox="0 0 800 800"
          className={`lg-scan absolute inset-0 w-full h-full transition-opacity duration-300 ${loading ? 'opacity-100' : 'opacity-0'}`}
          fill="none"
        >
          <circle cx="400" cy="400" r="300" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="170 1715" />
        </svg>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-6 sm:top-8 inset-x-6 sm:inset-x-8 flex flex-col sm:flex-row sm:justify-between gap-1 text-[10px] sm:text-xs font-mono text-text-muted">
        <span>NODE // TOKYO-03 · LATENCY 12ms</span>
        <span>AUTH GATE // v2.0.3 STABLE</span>
      </div>

      {/* Login Card (pembungkus luar khusus untuk animasi getar) */}
      <div className={`relative w-full max-w-[480px] ${shake ? 'lg-shake' : ''}`}>
        {/* Siku sudut bergaya HUD, warnanya ikut status gerbang */}
        <div aria-hidden="true" className={`pointer-events-none transition-colors duration-500 ${gate.tone}`}>
          <span className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-current rounded-tl-md"></span>
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-current rounded-tr-md"></span>
          <span className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-current rounded-bl-md"></span>
          <span className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-current rounded-br-md"></span>
        </div>

        <div className="lg-rise relative w-full bg-bg-card border border-border-subtle rounded-2xl p-8 lg:p-10 shadow-[0_28px_90px_-28px_rgba(0,0,0,0.8)]">
          {/* Garis cahaya tipis di tepi atas card */}
          <div
            aria-hidden="true"
            className="absolute top-0 left-8 right-8 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(126,224,210,0.55), transparent)' }}
          />

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="lg-blink text-xl text-accent-cyan">|</span>
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

            {/* Status gerbang: mencerminkan kondisi form secara real-time */}
            <div
              className="mt-4 flex items-center gap-2 text-[11px] font-mono tracking-wider uppercase"
              role="status"
              aria-live="polite"
            >
              <span className="text-text-muted">GATE STATUS</span>
              <span className="h-px w-4 bg-border-subtle"></span>
              <span className={`inline-flex items-center gap-1.5 transition-colors duration-300 ${gate.tone}`}>
                <span className={`w-1.5 h-1.5 rounded-full bg-current ${gate.pulse ? 'animate-pulse' : ''}`}></span>
                {gate.label}
              </span>
            </div>
          </div>

          {/* Error / Session Expired Message */}
          {(error || expiredMessage) && (
            <div role="alert" className="lg-rise mb-6 p-4 bg-status-live/10 border border-status-live/30 rounded-lg">
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
              <div className="group relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-cyan transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
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
                  aria-describedby={emailInvalid ? 'email-hint' : undefined}
                  className={`w-full pl-12 pr-4 py-3.5 bg-bg-base border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:shadow-[0_0_0_3px_rgba(126,224,210,0.12)] transition-all ${emailInvalid ? 'border-status-live' : 'border-border-subtle focus:border-accent-cyan'}`}
                />
              </div>
              {emailInvalid && (
                <p id="email-hint" className="mt-2 text-xs font-mono text-status-live">
                  Format email tidak valid.
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-mono text-text-secondary uppercase tracking-wider">
                  Password
                </label>
                {capsOn && (
                  <span role="status" className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-accent-gold">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4l8 9h-5v4H9v-4H4l8-9zM9 20h6" />
                    </svg>
                    Caps Lock aktif
                  </span>
                )}
              </div>
              <div className="group relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-cyan transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
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
                  className="w-full pl-12 pr-12 py-3.5 bg-bg-base border border-border-subtle rounded-lg text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none focus:shadow-[0_0_0_3px_rgba(126,224,210,0.12)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  aria-pressed={showPassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary focus-visible:text-accent-cyan focus:outline-none transition-colors"
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
              className="group relative overflow-hidden w-full py-3.5 bg-gradient-cta text-text-on-cta font-bold text-base rounded-lg hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-bg-card transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {/* Kilau berjalan saat sedang memproses */}
              {loading && (
                <span
                  aria-hidden="true"
                  className="lg-sweep absolute inset-y-0 left-0 w-1/4"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)' }}
                />
              )}
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
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
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
      </div>

      {/* Back to viewer link */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <Link 
          to="/" 
          className="group relative flex items-center gap-2 px-6 py-2.5 rounded-full backdrop-blur-md bg-bg-card/50 border border-border-subtle/60 hover:bg-bg-card/90 hover:border-accent-cyan/50 hover:shadow-[0_0_20px_rgba(126,224,210,0.2)] transition-all duration-300 text-sm font-medium text-text-secondary hover:text-white overflow-hidden"
        >
          {/* Subtle glow effect inside button on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(126,224,210,0.08), transparent)' }}></div>
          
          <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1 group-hover:text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Portal Viewer
        </Link>
      </div>
    </div>
  );
}

export default LoginPage;