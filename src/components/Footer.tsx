import { useState } from 'react';
import { X, Shield, FileText } from 'lucide-react';

interface FooterProps {
  onOpenFeedback?: () => void;
}

export default function Footer({ onOpenFeedback }: FooterProps) {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <>
      <footer className="px-4 sm:px-6 py-6 border-t border-border/40 text-sm text-text-secondary flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <span><strong className="text-text font-semibold">GeoPattern</strong> · versión beta</span>
        <button onClick={() => setPrivacyOpen(true)} className="hover:text-accent-ink underline-offset-2 hover:underline">Privacidad y datos</button>
        <button onClick={() => setTermsOpen(true)} className="hover:text-accent-ink underline-offset-2 hover:underline">Términos y condiciones</button>
        <button onClick={onOpenFeedback} className="hover:text-accent-ink underline-offset-2 hover:underline">Enviar comentarios</button>
      </footer>

      {/* Modal Privacidad */}
      {privacyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPrivacyOpen(false)} />
          <div className="relative bg-background text-text border border-border rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-bold">Privacidad y datos</h2>
              </div>
              <button onClick={() => setPrivacyOpen(false)} className="p-1.5 rounded-lg hover:bg-border/50"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-text-secondary">GeoPattern está en fase beta. Esto es lo que debes saber sobre tus datos:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary">
              <li>Los patrones que generas se procesan localmente en tu navegador. No se almacenan en servidores externos.</li>
              <li>Las preferencias (modo oscuro, patrones guardados) se guardan exclusivamente en el almacenamiento local (`localStorage`) de tu dispositivo.</li>
              <li>La autenticación opcional de usuarios se gestiona de forma segura a través de Clerk.</li>
              <li>Se pueden mostrar anuncios de la red publicitaria A-ADS con fines de sostenibilidad de la plataforma.</li>
            </ul>
            <button onClick={() => setPrivacyOpen(false)} className="w-full h-10 rounded-xl bg-accent text-accent-text font-semibold hover:brightness-110">Cerrar</button>
          </div>
        </div>
      )}

      {/* Modal Términos */}
      {termsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setTermsOpen(false)} />
          <div className="relative bg-background text-text border border-border rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-bold">Términos y condiciones</h2>
              </div>
              <button onClick={() => setTermsOpen(false)} className="p-1.5 rounded-lg hover:bg-border/50"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-text-secondary">Términos de uso para la versión beta de GeoPattern Studio 3D:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary">
              <li>El software se proporciona "tal cual", sin garantías formales de disponibilidad continua durante la fase beta.</li>
              <li>Eres libre de utilizar los patrones vectoriales y texturas 3D generadas tanto para proyectos personales como comerciales.</li>
              <li>Cualquier intento de vulnerar la seguridad o interferir con la infraestructura de la plataforma resultará en la restricción de acceso.</li>
            </ul>
            <button onClick={() => setTermsOpen(false)} className="w-full h-10 rounded-xl bg-accent text-accent-text font-semibold hover:brightness-110">Cerrar</button>
          </div>
        </div>
      )}
    </>
  );
}
