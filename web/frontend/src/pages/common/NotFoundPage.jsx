import { Link } from 'react-router-dom';
import { Compass, Home, LayoutDashboard, Calendar, ArrowLeft } from 'lucide-react';
import logoXion from '../../assets/logo_xion.webp';

/**
 * NotFoundPage - 404 Error page tailored in Cyber Nocturne aesthetic.
 * Solves B1 (layout consistency) and B2 (intuitive user flow / navigation).
 */
export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0D0B1A] text-[#F8F9FC] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Background Ambience & Cyber Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent-cyan/[0.04] rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-accent-purple/[0.04] rounded-full blur-[160px]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(rgba(126,224,210,0.15) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-lg text-center flex flex-col items-center">
        {/* Chibi Icon Avatar */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[2px] bg-gradient-to-tr from-accent-cyan/60 via-white/20 to-accent-purple/50 shadow-[0_0_24px_rgba(94,234,212,0.3)] flex items-center justify-center mb-6">
          <div className="w-full h-full rounded-full bg-[#120e28] overflow-hidden flex items-center justify-center p-2">
            <img
              src={logoXion}
              alt="X-VOCA Logo"
              width="64"
              height="64"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-accent-cyan text-xs font-mono tracking-widest uppercase mb-4 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
          <span>TRANSMISSION OFFLINE : 404</span>
        </div>

        {/* Large 404 Header */}
        <h1 className="text-6xl sm:text-8xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan via-white to-accent-purple mb-2">
          404
        </h1>

        <h2 className="text-xl sm:text-2xl font-bold font-display text-white mb-3">
          Halaman Tidak Ditemukan
        </h2>

        <p className="text-sm sm:text-base text-[#a89ec0] max-w-md mx-auto leading-relaxed mb-8">
          Sinyal koordinat yang Anda tuju tidak terdeteksi atau telah berpindah sektor. Silakan kembali ke navigasi utama.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent-cyan text-[#0D0B14] font-bold text-sm hover:bg-accent-cyan-hover transition-all duration-200 shadow-[0_0_20px_rgba(94,234,212,0.3)] active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>

          <Link
            to="/admin/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white font-medium text-sm hover:bg-white/[0.12] hover:border-white/20 transition-all duration-200 active:scale-95"
          >
            <LayoutDashboard className="w-4 h-4 text-accent-purple" />
            <span>Studio Admin</span>
          </Link>
        </div>

        {/* Quick Links Footer */}
        <div className="mt-10 pt-6 border-t border-white/[0.08] w-full flex items-center justify-center gap-6 text-xs text-[#a89ec0] font-mono">
          <Link to="/voting" className="hover:text-accent-cyan transition-colors">
            ✦ Voting Game
          </Link>
          <span className="text-white/20">•</span>
          <Link to="/content" className="hover:text-accent-cyan transition-colors">
            ✦ Content Guide
          </Link>
          <span className="text-white/20">•</span>
          <Link to="/#schedule" className="hover:text-accent-cyan transition-colors">
            ✦ Jadwal Siaran
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
