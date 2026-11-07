import { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Key,
  Eye,
  EyeOff,
  Sliders,
  Settings as SettingsIcon,
  ExternalLink,
  Calendar,
  Mail,
  Fingerprint,
  Check,
  Radio,
  Tv,
  Sparkles,
} from 'lucide-react';
import { authAPI } from '../../services/api';
import { safeFormatDate } from '../../utils/dateUtils';
import { isFirebaseConfigured } from '../../utils/firebase';

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  // Profile state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Account info state
  const [accountInfo, setAccountInfo] = useState(null);

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await authAPI.getMe();
        if (response.data?.data) {
          const user = response.data.data;
          setProfileData({
            name: user.name || '',
            email: user.email || '',
          });
          setAccountInfo({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  // Handle profile save
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileLoading(true);
    setProfileSuccess(false);

    try {
      const response = await authAPI.updateProfile(profileData);
      if (response.data?.success) {
        setProfileSuccess(true);
        setAccountInfo((prev) => ({
          ...prev,
          name: profileData.name,
          email: profileData.email,
        }));
        setTimeout(() => setProfileSuccess(false), 3500);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileError(error.response?.data?.message || 'Gagal menyimpan perubahan');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('Konfirmasi kata sandi baru tidak cocok');
      return;
    }

    if (passwordData.new_password.length < 6) {
      setPasswordError('Kata sandi baru minimal harus 6 karakter');
      return;
    }

    setPasswordLoading(true);
    setPasswordSuccess(false);

    try {
      const response = await authAPI.changePassword(
        passwordData.current_password,
        passwordData.new_password
      );
      if (response.data?.success) {
        setPasswordSuccess(true);
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        setTimeout(() => setPasswordSuccess(false), 3500);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError(error.response?.data?.message || 'Gagal mengubah kata sandi');
    } finally {
      setPasswordLoading(false);
    }
  };

  const firebaseActive = isFirebaseConfigured();

  return (
    <div className="space-y-6 animate-fade-in pb-12">

      {/* ── 1. Page Header & Command Toolbar ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-bg-card border border-border-subtle rounded-2xl p-5 sm:p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan shadow-sm">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                Pengaturan Studio
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Kelola profil akun, keamanan otentikasi, dan preferensi platform streaming
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-bg-surface border border-border-subtle text-text-secondary">
            <span className="w-2 h-2 rounded-full bg-status-done animate-pulse" />
            <span>Sesi Aktif</span>
          </span>
        </div>
      </div>

      {/* ── 2. Studio 2-Column Layout ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── Left Column (~35% / 4 cols on lg): Profile Card & Nav ── */}
        <div className="lg:col-span-4 space-y-4">

          {/* Profile Identity Card */}
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm text-center relative overflow-hidden">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-cyan/20 via-accent-purple/20 to-accent-gold/20 border border-accent-cyan/30 flex items-center justify-center mx-auto shadow-md mb-3">
              <span className="text-3xl font-bold font-mono text-accent-cyan select-none">
                {accountInfo?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>

            <h3 className="text-base font-bold text-text-primary truncate">
              {accountInfo?.name || 'Administrator'}
            </h3>
            <p className="text-xs text-text-muted truncate mt-0.5">
              {accountInfo?.email || 'admin@xvoca.com'}
            </p>

            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 uppercase tracking-wider">
                {accountInfo?.role?.toUpperCase() || 'SUPER ADMIN'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-text-muted bg-bg-surface border border-border-subtle">
                ID #{accountInfo?.id || '1'}
              </span>
            </div>

            {accountInfo?.created_at && (
              <p className="text-[11px] text-text-muted font-mono mt-3 pt-3 border-t border-border-subtle">
                Bergabung sejak: {safeFormatDate(accountInfo.created_at, { month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>

          {/* Vertical Tab Navigation */}
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-2 shadow-sm space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                activeTab === 'profile'
                  ? 'bg-accent-cyan text-text-on-cta shadow-sm font-bold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface'
              }`}
            >
              <User className="w-4 h-4 flex-shrink-0" />
              <span>Profil & Identitas Akun</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('password')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                activeTab === 'password'
                  ? 'bg-accent-cyan text-text-on-cta shadow-sm font-bold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface'
              }`}
            >
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>Keamanan & Kata Sandi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preferences')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                activeTab === 'preferences'
                  ? 'bg-accent-cyan text-text-on-cta shadow-sm font-bold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface'
              }`}
            >
              <Sliders className="w-4 h-4 flex-shrink-0" />
              <span>Koneksi & Preferensi Studio</span>
            </button>
          </div>

          {/* Quick System Badge */}
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-4 shadow-sm space-y-2.5">
            <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted font-semibold">
              Status Sistem Studio
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Realtime Database:</span>
                <span className={`font-mono font-semibold flex items-center gap-1 ${
                  firebaseActive ? 'text-status-done' : 'text-amber-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${firebaseActive ? 'bg-status-done' : 'bg-amber-400'}`} />
                  {firebaseActive ? 'Tersambung' : 'Mode Lokal'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Enkripsi Password:</span>
                <span className="font-mono text-text-primary">Bcrypt Hash (256-bit)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Otentikasi:</span>
                <span className="font-mono text-text-primary">JWT Token Berdurasi</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── Right Column (~65% / 8 cols on lg): Main Workspace ── */}
        <div className="lg:col-span-8">

          {/* TAB 1: PROFIL & IDENTITAS */}
          {activeTab === 'profile' && (
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-border-subtle pb-4">
                <h2 className="text-base sm:text-lg font-bold text-text-primary">
                  Profil & Identitas Akun
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Informasi ini digunakan sebagai tanda pengenal pada seluruh riwayat moderasi sistem
                </p>
              </div>

              {profileError && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-status-live/10 border border-status-live/30 text-status-live text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {profileSuccess && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-status-done/10 border border-status-done/30 text-status-done text-xs animate-in fade-in">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Perubahan profil berhasil disimpan ke database.</span>
                </div>
              )}

              <form onSubmit={handleProfileSave} className="space-y-4">
                {/* Nama */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text-secondary">
                    Nama Lengkap / Panggilan
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={profileData.name}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Masukkan nama lengkap"
                      className="w-full pl-10 pr-4 py-2.5 bg-bg-surface border border-border-subtle rounded-xl text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text-secondary">
                    Alamat Email Akun
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={profileData.email}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-bg-surface border border-border-subtle rounded-xl text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Role (Read only) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text-muted">
                    Tingkat Akses (Hak Akses)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={accountInfo?.role?.toUpperCase() || 'SUPER ADMIN'}
                    className="w-full px-4 py-2.5 bg-bg-surface/50 border border-border-subtle rounded-xl text-xs sm:text-sm text-text-muted font-mono cursor-not-allowed"
                  />
                  <p className="text-[11px] text-text-muted">
                    Hak akses ini ditentukan oleh arsitektur otentikasi backend.
                  </p>
                </div>

                <div className="pt-3 border-t border-border-subtle flex justify-end">
                  <button
                    type="submit"
                    disabled={profileLoading || !profileData.name.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-accent-cyan hover:bg-accent-cyan-hover text-text-on-cta font-semibold text-xs rounded-xl hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all shadow-sm"
                  >
                    {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: KEAMANAN & PASSWORD */}
          {activeTab === 'password' && (
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-border-subtle pb-4">
                <h2 className="text-base sm:text-lg font-bold text-text-primary">
                  Keamanan & Ganti Kata Sandi
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Perbarui kata sandi akun Anda secara berkala untuk menjaga keamanan akses studio
                </p>
              </div>

              {passwordError && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-status-live/10 border border-status-live/30 text-status-live text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-status-done/10 border border-status-done/30 text-status-done text-xs animate-in fade-in">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Kata sandi Anda berhasil diperbarui.</span>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text-secondary">
                    Kata Sandi Saat Ini <span className="text-status-live">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, current_password: e.target.value }))}
                      placeholder="Masukkan kata sandi lama"
                      className="w-full pl-10 pr-10 py-2.5 bg-bg-surface border border-border-subtle rounded-xl text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-0.5"
                      title={showCurrentPassword ? 'Sembunyikan password' : 'Lihat password'}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text-secondary">
                    Kata Sandi Baru <span className="text-status-live">*</span>
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, new_password: e.target.value }))}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-10 pr-10 py-2.5 bg-bg-surface border border-border-subtle rounded-xl text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-0.5"
                      title={showNewPassword ? 'Sembunyikan password' : 'Lihat password'}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text-secondary">
                    Konfirmasi Kata Sandi Baru <span className="text-status-live">*</span>
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, confirm_password: e.target.value }))}
                      placeholder="Ulangi kata sandi baru"
                      className="w-full pl-10 pr-10 py-2.5 bg-bg-surface border border-border-subtle rounded-xl text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-0.5"
                      title={showConfirmPassword ? 'Sembunyikan password' : 'Lihat password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-border-subtle flex justify-end">
                  <button
                    type="submit"
                    disabled={
                      passwordLoading ||
                      !passwordData.current_password ||
                      !passwordData.new_password ||
                      !passwordData.confirm_password
                    }
                    className="flex items-center gap-2 px-5 py-2.5 bg-accent-cyan hover:bg-accent-cyan-hover text-text-on-cta font-semibold text-xs rounded-xl hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all shadow-sm"
                  >
                    {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    <span>Ubah Kata Sandi</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: PREFERENSI SISTEM & STUDIO */}
          {activeTab === 'preferences' && (
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-border-subtle pb-4">
                <h2 className="text-base sm:text-lg font-bold text-text-primary">
                  Koneksi & Preferensi Studio
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Ikhtisar arsitektur integrasi data siaran, voting, dan portal komunitas
                </p>
              </div>

              <div className="space-y-4">
                {/* Firebase Connection Card */}
                <div className="p-4 rounded-xl bg-bg-surface border border-border-subtle flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-text-primary">Firebase Realtime Sync</p>
                    <p className="text-xs text-text-muted leading-relaxed">
                      Menyinkronkan status On Air siaran, notifikasi voting, dan pembaruan jadwal ke penonton secara instan tanpa reload browser.
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold shrink-0 border ${
                    firebaseActive
                      ? 'bg-status-done/15 text-status-done border-status-done/30'
                      : 'bg-amber-400/15 text-amber-400 border-amber-400/30'
                  }`}>
                    {firebaseActive ? 'TERHUBUNG' : 'LOKAL MODE'}
                  </span>
                </div>

                {/* Public Portal Access */}
                <div className="p-4 rounded-xl bg-bg-surface border border-border-subtle space-y-3">
                  <div>
                    <p className="text-xs font-bold text-text-primary">Pintasan Portal Komunitas</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Akses cepat untuk memverifikasi tampilan live dari sudut pandang penonton
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <a
                      href="/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl border border-border-subtle hover:border-accent-cyan/40 bg-bg-card hover:bg-bg-card-hover transition-colors text-xs text-text-primary font-semibold"
                    >
                      <span>Beranda Publik</span>
                      <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
                    </a>
                    <a
                      href="/content-guide"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl border border-border-subtle hover:border-accent-purple/40 bg-bg-card hover:bg-bg-card-hover transition-colors text-xs text-text-primary font-semibold"
                    >
                      <span>Content Guide Portal</span>
                      <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default SettingsPage;
