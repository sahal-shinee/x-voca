import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

/**
 * ErrorBoundary - Catches React component crashes and renders a polished
 * Cyber Nocturne recovery interface, preventing unhandled blank screens.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled React error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDev = Boolean(import.meta.env?.DEV);

      return (
        <div className="min-h-screen bg-[#0D0B14] text-[#F8F9FC] flex items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden">
          {/* Subtle Cyber Glow Backdrop */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-accent-cyan/5 rounded-full blur-[140px] pointer-events-none" />

          {/* Recovery Card */}
          <div className="relative z-10 w-full max-w-lg bg-[#141126] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] text-center">
            {/* Top Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-mono tracking-wider uppercase mb-5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Crash Recovery Shield</span>
            </div>

            {/* Error Graphic Icon */}
            <div className="w-16 h-16 rounded-2xl mx-auto mb-5 bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.15)]">
              <AlertTriangle className="w-8 h-8" />
            </div>

            {/* Title & Description */}
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white mb-2">
              Terjadi Gangguan Sistem
            </h1>
            <p className="text-sm text-[#a89ec0] leading-relaxed max-w-md mx-auto mb-6">
              Antarmuka mendeteksi kesalahan tak terduga pada sesi ini. Data Anda tetap aman. Silakan muat ulang halaman untuk memulihkan transmisi.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent-cyan text-[#0D0B14] font-bold text-sm hover:bg-accent-cyan-hover transition-all duration-150 shadow-[0_0_20px_rgba(94,234,212,0.25)] cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Muat Ulang Halaman</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white font-medium text-sm hover:bg-white/[0.12] transition-all duration-150 cursor-pointer active:scale-95"
              >
                <Home className="w-4 h-4" />
                <span>Kembali ke Beranda</span>
              </button>
            </div>

            {/* Developer Details in DEV Mode */}
            {isDev && this.state.error && (
              <details className="mt-6 text-left border border-white/10 rounded-xl bg-[#0d0b1a] p-3 text-xs">
                <summary className="font-mono text-rose-400 cursor-pointer focus:outline-none hover:underline">
                  Lihat Detail Kesalahan (Khusus Pengembang)
                </summary>
                <pre className="mt-2.5 p-3 rounded-lg bg-black/60 text-slate-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap max-h-48">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
