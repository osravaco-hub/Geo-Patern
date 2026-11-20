import { useUserContext } from '../context/UserContext';

// Aviso tras volver de la pantalla de pago de Dodo
export default function PaymentBanner() {
  const { paymentStatus, dismissPayment } = useUserContext();
  if (paymentStatus === 'idle') return null;

  const text =
    paymentStatus === 'checking' ? 'Confirmando tu pago…'
    : paymentStatus === 'success' ? '¡Gracias! Tu cuenta ya es Pro.'
    : 'Recibimos tu pago, pero la activación tarda más de lo normal. Recarga la página en un minuto.';

  return (
    <div role="status" aria-live="polite"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[60] max-w-[92vw] flex items-center gap-3 rounded-xl border border-border bg-background text-text shadow-2xl px-4 py-3 text-base">
      <span>{text}</span>
      {paymentStatus !== 'checking' && (
        <button onClick={dismissPayment} aria-label="Cerrar aviso" className="text-text-secondary hover:text-accent-ink">✕</button>
      )}
    </div>
  );
}
