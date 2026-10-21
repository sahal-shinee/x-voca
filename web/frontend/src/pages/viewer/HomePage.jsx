import { useState } from 'react';
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
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0D0B14] text-[#F8F9FC]">
      {/* ========== HERO SECTION ========== */}
      <HeroSection onRequestCollab={() => setIsCollabModalOpen(true)} />

      {/* ========== PROFILE SECTION ========== */}
      <ProfileSection />

      {/* ========== EQUIPMENT SECTION ========== */}
      <EquipmentSection />

      {/* ========== SCHEDULE SECTION ========== */}
      <ScheduleSection />

      {/* ========== FOOTER (Includes Official Floating Scroll-To-Top) ========== */}
      <Footer />

      {/* ========== COLLAB REQUEST MODAL ========== */}
      <CollabRequestModal
        isOpen={isCollabModalOpen}
        onClose={() => setIsCollabModalOpen(false)}
      />
    </div>
  );
}

export default HomePage;
