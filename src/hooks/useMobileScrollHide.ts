import { useState, useEffect } from 'react';

export function useMobileScrollHide(threshold = 50) {
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Only apply on mobile (< 1024px)
          if (window.innerWidth >= 1024) {
            setIsHidden(false);
            ticking = false;
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
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, threshold]);

  return isHidden;
}
