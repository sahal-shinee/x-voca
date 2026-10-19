import { useState, useEffect } from 'react';
import { User, Lock, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { authAPI } from '../../services/api';
import { safeFormatDate } from '../../utils/dateUtils';

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

  // Account info state
  const [accountInfo, setAccountInfo] = useState(null);

  // Tab options
  const tabs = [
    { key: 'profile', label: 'Profil', icon: User },
    { key: 'password', label: 'Ubah Password', icon: Lock },
  ];

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
        setAccountInfo(prev => ({
          ...prev,
          name: profileData.name,
          email: profileData.email,
        }));
        setTimeout(() => setProfileSuccess(false), 3000);
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
      setPasswordError('Password baru tidak cocok dengan konfirmasi');
      return;
    }

    if (passwordData.new_password.length < 6) {
      setPasswordError('Password minimal 6 karakter');
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
        setTimeout(() => setPasswordSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError(error.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Pengaturan</h1>
        <p className="text-sm text-text-secondary mt-1">Kelola akun dan preferensi Anda</p>
      </div>

      {/* Account Info Card */}
      {accountInfo && (
        <div className="bg-bg-card border border-border-subtle rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-accent-purple/15 border border-accent-purple/30 flex items-center justify-center shadow-inner">
              <span className="text-xl font-bold font-mono text-accent-purple">
                {accountInfo.name?.charAt(0)?.toUpperCase() || 'X'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-text-primary">{accountInfo.name}</h3>
              <p className="text-sm text-text-muted">{accountInfo.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
                  {accountInfo.role?.toUpperCase() || 'ADMIN'}
                </span>
                {accountInfo.created_at && (
                  <span className="text-xs text-text-muted">
                    Bergabung {safeFormatDate(accountInfo.created_at, {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-accent-cyan text-bg-base shadow-lg shadow-accent-cyan/20'
                  : 'bg-bg-card border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-surface'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-bg-card border border-border-subtle rounded-xl p-6">

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSave} className="space-y-5">
            {/* Error Message */}
            {profileError && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-status-live/10 border border-status-live/20 text-status-live">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{profileError}</p>
              </div>
            )}

            <div>
              <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-2">
                Nama
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nama lengkap"
                className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-2">
                Email
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
                className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all"
              />
            </div>

            {/* Success Message */}
            {profileSuccess && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-status-done/10 border border-status-done/20 text-status-done">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">Perubahan berhasil disimpan</p>
              </div>
            )}

            <button
              type="submit"
              disabled={profileLoading || !profileData.name.trim()}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-accent-cyan text-bg-base font-semibold rounded-xl hover:bg-accent-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent-cyan/20"
            >
              {profileLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordChange} className="space-y-5">
            {/* Error Message */}
            {passwordError && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-status-live/10 border border-status-live/20 text-status-live">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{passwordError}</p>
              </div>
            )}

            <div>
              <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-2">
                Password Saat Ini <span className="text-status-live">*</span>
              </label>
              <input
                type="password"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                placeholder="Masukkan password saat ini"
                className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-2">
                Password Baru <span className="text-status-live">*</span>
              </label>
              <input
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                placeholder="Minimal 6 karakter"
                className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-2">
                Konfirmasi Password Baru <span className="text-status-live">*</span>
              </label>
              <input
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                placeholder="Ulangi password baru"
                className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all"
                required
              />
            </div>

            {/* Success Message */}
            {passwordSuccess && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-status-done/10 border border-status-done/20 text-status-done">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">Password berhasil diubah</p>
              </div>
            )}

            <button
              type="submit"
              disabled={passwordLoading || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-accent-cyan text-bg-base font-semibold rounded-xl hover:bg-accent-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent-cyan/20"
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengubah...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Ubah Password
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;
