import { useEffect, useRef } from 'react';
import { generatePattern, defaultConfig, PatternId } from '../lib/patterns';
import { Theme } from '../hooks/useTheme';

// Dibuja la previsual solo cuando la tarjeta entra en pantalla
export default function PatternPreview({ type, theme }: { type: PatternId; theme: Theme }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const dark = theme === 'dark';
      generatePattern(ctx, canvas.width, canvas.height, {
        ...defaultConfig, type,
        color: dark ? '#FFFFFF' : '#282828',
        backgroundColor: dark ? '#282828' : '#FFFFFF',
      }, 42);
    };
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { draw(); io.disconnect(); }
    }, { rootMargin: '200px' });
    io.observe(canvas);
    return () => io.disconnect();
  }, [type, theme]);

  return <canvas ref={ref} width={400} height={300} className="w-full h-full block object-cover" />;
}
