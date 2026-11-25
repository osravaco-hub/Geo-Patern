import { useState, useEffect, useRef } from 'react';

export function useMobileScrollHide(threshold = 50) {
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const tickingRef = useRef(false);
  const rafRef = useRef(0);

  useEffect(() => {
    let mounted = true;

    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      rafRef.current = window.requestAnimationFrame(() => {
        if (!mounted) {
          tickingRef.current = false;
          return;
        }

        // Only apply on mobile (< lg = 1024px)
        if (window.innerWidth >= 1024) {
          setIsHidden(false);
          tickingRef.current = false;
          return;
        }

        const currentScrollY = window.scrollY;

        if (currentScrollY <= 20) {
          setIsHidden(false);
        } else if (currentScrollY > lastScrollY && currentScrollY > threshold) {
          // Scrolling down
          setIsHidden(true);
        } else if (currentScrollY < lastScrollY) {
          // Scrolling up
          setIsHidden(false);
        }

        setLastScrollY(currentScrollY);
        tickingRef.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      mounted = false;
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [lastScrollY, threshold]);

  return isHidden;
}