import { useUserContext } from '../context/UserContext';
import { useI18n } from '../i18n';

// Aviso tras volver de la pantalla de pago de Dodo
export default function PaymentBanner() {
  const { t } = useI18n();
  const { paymentStatus, dismissPayment } = useUserContext();
  if (paymentStatus === 'idle') return null;

  const text =
    paymentStatus === 'checking' ? t('payment.checking')
    : paymentStatus === 'success' ? t('payment.success')
    : t('payment.timeout');

  return (
    <div role="status" aria-live="polite"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[60] max-w-[92vw] flex items-center gap-3 rounded-xl border border-border bg-background text-text shadow-2xl px-4 py-3 text-base">
      <span>{text}</span>
      {paymentStatus !== 'checking' && (
        <button onClick={dismissPayment} aria-label={t('payment.dismiss')} className="text-text-secondary hover:text-accent-ink">✕</button>
      )}
    </div>
  );
}
