import { useState, useEffect } from 'react';

/**
 * Hook to track window scroll position
 * @returns {{ scrollY: number, isScrolled: boolean }}
 */
export function useScrollPosition(threshold = 20) {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(currentScrollY);
          setIsScrolled(currentScrollY > threshold);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return { scrollY, isScrolled };
}

export default useScrollPosition;
