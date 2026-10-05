import HeroSection from '../../components/viewer/HeroSection';
import ProfileSection from '../../components/viewer/ProfileSection';
import EquipmentSection from '../../components/viewer/EquipmentSection';
import ScheduleSection from '../../components/viewer/ScheduleSection';
import Footer from '../../components/viewer/Footer';

/**
 * HomePage - Landing page untuk web viewer
 * Referensi: Figma design - X-VOCA Profile & Schedule Sections
 */
function HomePage() {
  return (
    <div className="min-h-screen bg-bg-base">
      {/* ========== HERO SECTION ========== */}
      <HeroSection />

      {/* ========== PROFILE SECTION ========== */}
      <ProfileSection />

      {/* ========== EQUIPMENT SECTION ========== */}
      <EquipmentSection />

      {/* ========== SCHEDULE SECTION ========== */}
      <ScheduleSection />

      {/* ========== FOOTER ========== */}
      <Footer />
    </div>
  );
}

export default HomePage;
