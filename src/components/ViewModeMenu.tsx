import { useEffect, useRef, useState } from 'react';
import { PBRViewMode } from '../lib/pbrMaps';

const OPTIONS: { id: PBRViewMode; label: string; hint: string }[] = [
  { id: 'color', label: 'Color', hint: 'El patrón tal como se exporta' },
  { id: 'height', label: 'Altura', hint: 'Mapa de altura en grises' },
  { id: 'normal', label: 'Normales', hint: 'Relieve para motores 3D' },
  { id: 'alpha', label: 'Alpha', hint: 'Máscara blanco y negro' },
];

interface Props {
  value: PBRViewMode;
  onChange: (v: PBRViewMode) => void;
}

// Botón 3D: elige entre la vista de color y las vistas previas de mapas
export default function ViewModeMenu({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);

  const active = value !== 'color';
  const current = OPTIONS.find(o => o.id === value)!;

  return (
    <div className="relative ml-auto" ref={ref}>
      <button onClick={() => setOpen(o => !o)} aria-expanded={open} aria-haspopup="menu"
        title="Vista previa de mapas (altura, normales y alpha)"
        className={`h-11 px-6 sm:px-8 rounded-lg border text-xl transition ${active ? 'bg-accent text-accent-text border-accent' : 'border-text/70 text-text hover:border-accent'}`}>
        {active ? `3D · ${current.label}` : '3D'}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-background border border-border shadow-2xl p-2 z-30">
          {OPTIONS.map(o => (
            <button key={o.id} role="menuitemradio" aria-checked={value === o.id}
              onClick={() => { onChange(o.id); setOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg transition ${value === o.id ? 'bg-accent text-accent-text' : 'text-text hover:bg-text/10'}`}>
              <span className="block text-lg leading-tight">{o.label}</span>
              <span className={`block text-sm ${value === o.id ? 'text-accent-text/80' : 'text-text-secondary'}`}>{o.hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
