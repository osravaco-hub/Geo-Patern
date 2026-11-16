import { useState } from 'react';

// Cuando tengas un formulario o correo para comentarios, escríbelo aquí (ej. 'mailto:hola@tudominio.com')
export const FEEDBACK_URL = '';

export default function Footer() {
  const [open, setOpen] = useState(false);
  return (
    <footer className="px-4 sm:px-6 py-6 border-t border-border/40 text-sm text-text-secondary flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
      <span><strong className="text-text font-semibold">GeoPattern</strong> · versión beta</span>
      {FEEDBACK_URL && <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer" className="hover:text-accent-ink underline-offset-2 hover:underline">Enviar comentarios</a>}
      <button onClick={() => setOpen(true)} className="hover:text-accent-ink underline-offset-2 hover:underline">Privacidad y datos</button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Privacidad y datos">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-background text-text border border-border rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 space-y-3 text-base">
            <h2 className="text-3xl font-semibold">Privacidad y datos</h2>
            <p>GeoPattern está en beta. Esto es lo que hace hoy la página:</p>
            <ul className="list-disc pl-5 space-y-2 text-text-secondary">
              <li>Los patrones que generas se crean en tu navegador. No se suben a ningún servidor.</li>
              <li>Los patrones guardados y tus preferencias (como el modo claro u oscuro) se guardan solo en este navegador. Si borras los datos del sitio, se pierden.</li>
              <li>No hay cuentas de usuario todavía.</li>
              <li>La página muestra un anuncio de un proveedor externo (A-ADS), que puede recibir datos técnicos de tu visita según su propia política.</li>
            </ul>
            <button onClick={() => setOpen(false)} className="w-full h-11 rounded-xl bg-accent text-accent-text text-lg hover:brightness-110">Cerrar</button>
          </div>
        </div>
      )}
    </footer>
  );
}
