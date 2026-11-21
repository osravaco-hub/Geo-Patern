import { useState, useEffect } from 'react';
import { X, Shield, FileText, Lock } from 'lucide-react';

export default function LegalModals() {
  const [modal, setModal] = useState<'privacy' | 'terms' | null>(null);

  useEffect(() => {
    const handleOpenPrivacy = () => setModal('privacy');
    const handleOpenTerms = () => setModal('terms');
    window.addEventListener('open-privacy', handleOpenPrivacy);
    window.addEventListener('open-terms', handleOpenTerms);
    return () => {
      window.removeEventListener('open-privacy', handleOpenPrivacy);
      window.removeEventListener('open-terms', handleOpenTerms);
    };
  }, []);

  if (!modal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)} />
      <div className="relative bg-background text-text border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            {modal === 'privacy' ? <Shield className="w-6 h-6 text-accent" /> : <FileText className="w-6 h-6 text-accent" />}
            <h2 className="text-2xl font-bold font-[family-name:var(--font-body)]">
              {modal === 'privacy' ? 'Política de Privacidad y Cookies' : 'Términos y Condiciones'}
            </h2>
          </div>
          <button onClick={() => setModal(null)} className="w-9 h-9 rounded-full bg-border/40 flex items-center justify-center hover:bg-border transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {modal === 'privacy' ? (
          <div className="space-y-4 text-text-secondary text-sm leading-relaxed">
            <p><strong>Última actualización:</strong> Noviembre 2026</p>
            <h3 className="text-lg font-semibold text-text">1. Información que recopilamos</h3>
            <p>GeoPattern opera principalmente de forma local en tu navegador. Los patrones generados, configuraciones y favoritos se almacenan en tu dispositivo (LocalStorage / SessionStorage).</p>
            <h3 className="text-lg font-semibold text-text">2. Autenticación y Cuentas</h3>
            <p>Si decides iniciar sesión o registrarte, utilizamos servicios seguros de terceros (Clerk) para gestionar tu identidad, correo electrónico y estado de suscripción Premium.</p>
            <h3 className="text-lg font-semibold text-text">3. Publicidad y Analítica</h3>
            <p>Mostramos anuncios mediante la red publicitaria A-ADS. Estos proveedores pueden recopilar datos técnicos anónimos (dirección IP, navegador) según sus propias políticas de privacidad.</p>
            <h3 className="text-lg font-semibold text-text">4. Cookies</h3>
            <p>Empleamos cookies técnicas para recordar tus preferencias de tema (claro/oscuro), estado de sesión y aceptación de este aviso.</p>
          </div>
        ) : (
          <div className="space-y-4 text-text-secondary text-sm leading-relaxed">
            <p><strong>Última actualización:</strong> Noviembre 2026</p>
            <h3 className="text-lg font-semibold text-text">1. Uso de la plataforma</h3>
            <p>GeoPattern Studio 3D permite generar patrones vectoriales y texturas 3D sin coste para uso personal y comercial, respetando los límites del plan gratuito o suscripción activa.</p>
            <h3 className="text-lg font-semibold text-text">2. Propiedad Intelectual</h3>
            <p>Los patrones generados por ti son tuyos. Puedes exportarlos en SVG y PNG sin marca de agua para utilizarlos en tus proyectos comerciales o personales.</p>
            <h3 className="text-lg font-semibold text-text">3. Planes y Pagos</h3>
            <p>Los pagos y suscripciones se procesan de forma segura a través de Dodo Payments. Las cancelaciones se pueden gestionar desde el panel de usuario en cualquier momento.</p>
            <h3 className="text-lg font-semibold text-text">4. Garantía y Disponibilidad</h3>
            <p>El servicio se ofrece "tal cual" durante su fase beta. Nos esforzamos por mantener alta disponibilidad pero no garantizamos ausencia absoluta de interrupciones.</p>
          </div>
        )}

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            onClick={() => setModal(null)}
            className="h-10 px-6 rounded-xl bg-accent text-accent-text font-semibold hover:brightness-110 transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
