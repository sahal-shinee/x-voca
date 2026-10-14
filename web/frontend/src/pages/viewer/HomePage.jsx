import { useState, useEffect } from 'react';
import HeroSection from '../../components/viewer/HeroSection';
import ProfileSection from '../../components/viewer/ProfileSection';
import EquipmentSection from '../../components/viewer/EquipmentSection';
import ScheduleSection from '../../components/viewer/ScheduleSection';
import Footer from '../../components/viewer/Footer';
import { CollabRequestModal } from '../../components/viewer/CollabRequestModal';
import { Users } from 'lucide-react';

/**
 * HomePage - Landing page untuk web viewer
 * Referensi: Figma design - X-VOCA Profile & Schedule Sections
 */
function HomePage() {
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Scroll listener for floating button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-bg-base">
      {/* ========== HERO SECTION ========== */}
      <HeroSection onRequestCollab={() => setIsCollabModalOpen(true)} />

      {/* ========== PROFILE SECTION ========== */}
      <ProfileSection />

      {/* ========== EQUIPMENT SECTION ========== */}
      <EquipmentSection />

      {/* ========== SCHEDULE SECTION ========== */}
      <ScheduleSection />

      {/* ========== FOOTER ========== */}
      <Footer />

      {/* ========== FLOATING QUICK COLLAB BUTTON ========== */}
      {showScrollButton && (
        <button
          onClick={() => setIsCollabModalOpen(true)}
          className="fixed bottom-8 right-8 z-50
            px-5 py-3 rounded-full
            bg-gradient-to-r from-accent-cyan to-accent-purple
            text-bg-base font-semibold shadow-lg
            hover:scale-105 transition-transform
            flex items-center gap-2"
          aria-label="Request Collab"
        >
          <Users className="w-5 h-5" />
          <span>Request Collab</span>
        </button>
      )}

      {/* ========== COLLAB REQUEST MODAL ========== */}
      <CollabRequestModal
        isOpen={isCollabModalOpen}
        onClose={() => setIsCollabModalOpen(false)}
      />
    </div>
  );
}

export default HomePage;
