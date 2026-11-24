/**
 * ============================================================================
 * FILE: web/frontend/src/pages/viewer/HomePage.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Halaman beranda utama portal fansite X-VOCA.
 * Mengintegrasikan:
 * 1. HeroSection: Kartu karakter interaktif, selector aura/mood, dan status Live Ready.
 * 2. CountdownCard: Timer dinamis menghitung mundur ke jadwal siaran streaming terdekat.
 * 3. ScheduleSection: Kalender siaran streaming mingguan.
 * 4. EquipmentSection: Profil perangkat keras dan rig virtual streaming.
 * ============================================================================
 */

import { useState } from 'react';
import SkipToContent from '../../components/common/SkipToContent';
import HeroSection from '../../components/viewer/HeroSection';
import ProfileSection from '../../components/viewer/ProfileSection';
import EquipmentSection from '../../components/viewer/EquipmentSection';
import ScheduleSection from '../../components/viewer/ScheduleSection';
import Footer from '../../components/viewer/Footer';
import { CollabRequestModal } from '../../components/viewer/CollabRequestModal';

/**
 * HomePage - Landing page untuk web viewer
 * Referensi: Figma design - X-VOCA Profile & Schedule Sections
 */
function HomePage() {
  // State: Mengontrol buka/tutup jendela modal formulir pengajuan kolaborasi streamer penonton
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0D0B14] text-[#F8F9FC]">
      {/* 1. Aksesibilitas Keyboard: Tombol lewati langsung ke konten utama bagi pengguna disabilitas / screen reader */}
      <SkipToContent targetId="main-content" />

      {/* 2. HERO SECTION: Kartu karakter interaktif, mood aura switcher, live status, dan countdown siaran */}
      <HeroSection onRequestCollab={() => setIsCollabModalOpen(true)} />

      {/* 3. WADAH KONTEN UTAMA */}
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        {/* Profil biografi karakter virtual talent Xion Regalia */}
        <ProfileSection />

        {/* Spesifikasi teknis perangkat keras komputer dan rig Live2D yang digunakan streamer */}
        <EquipmentSection />

        {/* Kalender agenda siaran mingguan terintegrasi YouTube streaming */}
        <ScheduleSection />
      </main>

      {/* 4. FOOTER: Informasi hak cipta, tautan sosial media, dan tombol floating scroll-to-top */}
      <Footer />

      {/* 5. MODAL FORM: Dialog pengajuan usulan kolaborasi streamer dari penonton */}
      <CollabRequestModal
        isOpen={isCollabModalOpen}
        onClose={() => setIsCollabModalOpen(false)}
      />
    </div>
  );
}

export default HomePage;
