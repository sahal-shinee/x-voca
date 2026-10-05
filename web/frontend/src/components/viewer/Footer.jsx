import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

// Custom hook for scroll reveal animation
const useScrollReveal = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (options.once !== false) {
            observer.unobserve(entry.target);
          }
        } else if (options.once === false) {
          setIsVisible(false);
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px',
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options.threshold, options.rootMargin, options.once]);

  return [ref, isVisible];
};

// Footer Component
const Footer = () => {
  const [footerRef, footerVisible] = useScrollReveal({ threshold: 0.1 });

  return (
    <footer
      ref={footerRef}
      className={`bg-[#0f0a22] border-t border-[rgba(61,53,96,0.4)] py-10 lg:py-12 px-4 sm:px-6 lg:px-8 transition-all duration-700 ${footerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 lg:gap-8 mb-8">
          {/* Logo & Description */}
          <div className="flex flex-col gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-accent-cyan-light text-lg group-hover:scale-110 transition-transform duration-200">✦</span>
              <span className="font-semibold text-white text-lg font-display group-hover:text-accent-cyan-light transition-colors">
                X-VOCA PORTAL
              </span>
            </Link>
            <p className="text-[#a89ec0] text-sm max-w-sm">
              Cosmic telemetry and broadcast sanctuary for Xion Regalia.
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
            <Link to="/" className="text-[#a89ec0] text-sm hover:text-white hover:text-accent-cyan-light transition-colors duration-200">
              Home
            </Link>
            <Link to="/voting" className="text-[#a89ec0] text-sm hover:text-white hover:text-accent-cyan-light transition-colors duration-200">
              Voting
            </Link>
            <Link to="/content" className="text-[#a89ec0] text-sm hover:text-white hover:text-accent-cyan-light transition-colors duration-200">
              Content Guide
            </Link>
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-[rgba(61,53,96,0.2)] pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Copyright */}
            <p className="font-bold text-[#5c5480] text-[10px] sm:text-xs tracking-wider font-sans order-2 sm:order-1">
              © 2025 X-VOCA PROJECT. ALL BROADCAST RIGHTS RESERVED.
            </p>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 order-1 sm:order-2">
              <span className="font-bold text-[#5c5480] text-[10px] sm:text-xs tracking-wider font-sans cursor-pointer hover:text-[#a89ec0] transition-colors">
                TERMS OF SERVICE
              </span>
              <span className="font-bold text-[#5c5480] text-[10px] sm:text-xs tracking-wider font-sans cursor-pointer hover:text-[#a89ec0] transition-colors">
                FAN WORK POLICY
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
