/**
 * Custom hooks for scroll-based animations
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useScrollReveal - Animate elements when they scroll into view
 *
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Intersection threshold (0-1)
 * @param {string} options.rootMargin - Root margin for intersection
 * @param {boolean} options.once - Only trigger once (default: true)
 * @returns {[React.RefObject, boolean]} - [ref, isVisible]
 */
export const useScrollReveal = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (options.once !== false) {
            observer.unconnect();
          }
        } else if (options.once === false) {
          setIsVisible(false);
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px 0px -50px 0px',
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

/**
 * useParallax - Create parallax effect based on mouse position
 *
 * @param {number} intensity - Parallax intensity (default: 20)
 * @returns {Object} - { x, y, handlers }
 */
export const useParallax = (intensity = 20) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (!isHovering) return;

    const x = (e.clientX / window.innerWidth - 0.5) * intensity;
    const y = (e.clientY / window.innerHeight - 0.5) * intensity;
    setPosition({ x, y });
  }, [intensity, isHovering]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  return {
    x: position.x,
    y: position.y,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
};

/**
 * useCountUp - Animate a number counting up
 *
 * @param {number} end - End value
 * @param {number} duration - Animation duration in ms (default: 2000)
 * @param {boolean} start - Start animation (default: true)
 * @returns {number} - Current value
 */
export const useCountUp = (end, duration = 2000, start = true) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime = null;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start]);

  return count;
};

/**
 * useScrollProgress - Track scroll progress through the page
 *
 * @returns {Object} - { progress (0-1), direction ('up'|'down'), atTop, atBottom }
 */
export const useScrollProgress = () => {
  const [scrollData, setScrollData] = useState({
    progress: 0,
    direction: 'down',
    atTop: true,
    atBottom: false,
  });

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollData = () => {
      const scrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = documentHeight > 0 ? scrollY / documentHeight : 0;

      setScrollData({
        progress,
        direction: scrollY > lastScrollY ? 'down' : 'up',
        atTop: scrollY === 0,
        atBottom: scrollY + window.innerHeight >= documentHeight,
      });

      lastScrollY = scrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollData);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollData;
};

/**
 * useMediaQuery - Hook to track media query matches
 *
 * @param {string} query - Media query string
 * @returns {boolean} - Whether the query matches
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (e) => setMatches(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

/**
 * useLocalStorage - Sync state with localStorage
 *
 * @param {string} key - localStorage key
 * @param {*} initialValue - Initial value
 * @returns {[*, Function]} - [value, setValue]
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};
