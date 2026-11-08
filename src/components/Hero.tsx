import { ChevronDown } from 'lucide-react';

// Círculos concéntricos: de línea desde la esquina inferior derecha, menta desde la superior derecha
const ring = (n: number, step: number) => Array.from({ length: n }, (_, i) => (i + 1) * step);

interface HeroProps {
  onExplore: () => void;
}

// Colores por variables CSS (--hero-*), así sigue el modo claro/oscuro
export default function Hero({ onExplore }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-[var(--hero-bg)] min-h-[420px] transition-colors duration-300" style={{ height: 'calc(100svh - 60px)' }}>
      {/* Panel lateral: solo en pantallas anchas */}
      <div className="hidden md:block absolute inset-y-0 left-0 w-[33.333%] bg-[var(--hero-panel)] transition-colors duration-300" />

      {/* Círculos: opacidad baja en móvil */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.14] md:opacity-100" viewBox="0 0 1920 1080" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
        <g fill="none" strokeWidth="3">
          {ring(33, 29).map(r => <circle key={`w${r}`} cx="1920" cy="1080" r={r} stroke="var(--hero-line)" vectorEffect="non-scaling-stroke" />)}
          {ring(26, 36).map(r => <circle key={`m${r}`} cx="1920" cy="75" r={r} stroke="#61DAD8" vectorEffect="non-scaling-stroke" />)}
        </g>
      </svg>

      {/* Título: centrado en móvil, a la izquierda en escritorio */}
      <h1 className="absolute inset-x-0 md:inset-x-auto md:left-[8.3%] top-1/2 -translate-y-1/2 text-center md:text-left text-[var(--hero-text)] leading-[0.85] select-none">
        <span className="block font-[family-name:var(--font-display)] font-bold uppercase text-[min(52vw,34svh)] md:text-[clamp(96px,22vw,420px)]">Geo</span>
        <span className="block font-[family-name:var(--font-display)] font-light text-[min(34vw,22svh)] md:text-[clamp(64px,14vw,270px)] -mt-[0.02em]">Pattern</span>
      </h1>

      <button onClick={onExplore} aria-label="Ver patrones"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[var(--hero-text)]/90 hover:text-[#61DAD8] transition">
        <span className="text-sm uppercase tracking-[0.2em]">Explorar patrones</span>
        <ChevronDown className="w-6 h-6 animate-bounce" />
      </button>
    </section>
  );
}
