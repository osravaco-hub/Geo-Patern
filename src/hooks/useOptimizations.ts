import { useState, useEffect, useRef } from 'react';

/**
 * Hook de debounce para optimizar actualizaciones de estado
 * @param value - Valor a debounce
 * @param delay - Delay en milisegundos (default: 100ms)
 * @returns Valor debounced
 */
export function useDebounce<T>(value: T, delay: number = 100): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para lazy loading con Intersection Observer
 * @param options - Opciones de Intersection Observer
 * @returns [ref, isIntersecting]
 */
export function useLazyLoad(options?: IntersectionObserverInit): [React.RefObject<HTMLElement>, boolean] {
  const ref = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        observer.disconnect();
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return [ref as React.RefObject<HTMLElement>, isIntersecting];
}

/**
 * Hook para detectar el tamaño de pantalla actual
 * @returns 'mobile' | 'tablet' | 'desktop'
 */
export function useScreenSize(): 'mobile' | 'tablet' | 'desktop' {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
}
