import { useState } from 'react';
import { useAuth, useClerk } from '@clerk/react';
import { X, Check, Crown, Sparkles, Lock, Loader2 } from 'lucide-react';
import { UserTier } from '../lib/userTier';
import { PLANS, PlanId, createCheckout } from '../lib/checkout';
import { useI18n, errorKey } from '../i18n';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: UserTier;
}

const FREE_FEATURES = ['plans.free.1', 'plans.free.2', 'plans.free.3', 'plans.free.4', 'plans.free.5'] as const;
const PRO_FEATURES = ['plans.pro.1', 'plans.pro.2', 'plans.pro.3', 'plans.pro.4'] as const;

export default function PricingModal({ isOpen, onClose, currentTier }: PricingModalProps) {
  const { isSignedIn, getToken } = useAuth();
  const clerk = useClerk();
  const { t } = useI18n();
  const [plan, setPlan] = useState<PlanId>('annual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;
  const isPro = currentTier === 'pro';

  const handleBuy = async () => {
    setError('');
    if (!isSignedIn) { clerk.openSignIn(); return; } // Pro se activa sobre una cuenta
    setLoading(true);
    const token = await getToken();
    if (!token) { setError(t('plans.sessionError')); setLoading(false); return; }
    const res = await createCheckout(token, plan);
    if (res.url) { window.location.href = res.url; return; }
    setError(t(errorKey(res.errorCode), { detail: res.detail ?? '' }));
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={t('header.plans')}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background text-text border border-border rounded-3xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 max-h-[95vh] overflow-y-auto">
        <button onClick={onClose} aria-label={t('common.close')} className="absolute top-4 right-4 p-2 rounded-lg text-text-secondary hover:text-text hover:bg-text/10 transition">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/15 mb-3">
            <Crown className="w-7 h-7 text-accent-ink" />
          </div>
          <h2 className="text-3xl font-semibold">{t('plans.title')}</h2>
          <p className="text-text-secondary mt-1">{t('plans.subtitle')}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className={`rounded-2xl border-2 p-6 flex flex-col ${!isPro ? 'border-accent bg-accent/10' : 'border-border bg-background'}`}>
            <h3 className="text-2xl font-semibold text-center">Free</h3>
            <p className="text-4xl font-bold text-center mt-1">$0</p>
            <p className="text-sm text-text-secondary text-center mb-4">{t('plans.noSignup')}</p>
            <ul className="space-y-2 flex-1">
              {FREE_FEATURES.map(k => <Feature key={k} text={t(k)} />)}
              <li className="flex items-center gap-2 text-text-secondary"><Lock className="w-4 h-4 shrink-0" />{t('plans.locked')}</li>
            </ul>
            <div className={`mt-5 w-full py-3 rounded-xl text-center border ${!isPro ? 'border-accent/40 text-text' : 'border-border text-text-secondary'}`}>
              {!isPro ? t('plans.current') : t('plans.included')}
            </div>
          </div>

          <div className="rounded-2xl border-2 border-accent p-6 flex flex-col bg-background">
            <h3 className="text-2xl font-semibold text-center flex items-center justify-center gap-2">Pro <Crown className="w-5 h-5 text-accent-ink" /></h3>
            <ul className="space-y-2 my-4">
              {PRO_FEATURES.map(k => <Feature key={k} text={t(k)} />)}
            </ul>

            <div role="radiogroup" aria-label="Pro" className="space-y-2 flex-1">
              {PLANS.map(p => {
                const on = plan === p.id;
                return (
                  <button key={p.id} role="radio" aria-checked={on} onClick={() => setPlan(p.id)} disabled={isPro}
                    className={`w-full text-left rounded-xl border px-4 py-3 transition flex items-center justify-between gap-3 ${on ? 'border-accent bg-accent/10' : 'border-border hover:border-accent'}`}>
                    <span>
                      <span className="flex items-center gap-2 font-semibold">
                        {t(`plan.${p.id}` as const)}
                        {p.id === 'annual' && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent text-accent-text text-[11px] rounded-full"><Sparkles className="w-3 h-3" />{t('plans.recommended')}</span>}
                      </span>
                      <span className="block text-sm text-text-secondary">{t(`plan.${p.id}.note` as const)}</span>
                    </span>
                    <span className="text-right shrink-0">
                      <span className="text-2xl font-bold">{p.price}</span>
                      <span className="block text-xs text-text-secondary">{t(`plan.${p.id}.period` as const)}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {isPro ? (
              <div className="mt-5 w-full py-3 rounded-xl text-center bg-accent/15 text-text font-medium">{t('plans.alreadyPro')}</div>
            ) : (
              <>
                <button onClick={handleBuy} disabled={loading}
                  className="mt-5 w-full py-3 bg-accent text-accent-text font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-70 flex items-center justify-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSignedIn ? t('plans.buy', { plan: t(`plan.${plan}` as const).toLowerCase(), price: PLANS.find(p => p.id === plan)!.price }) : t('plans.signInToBuy')}
                </button>
                <p className="mt-2 text-xs text-text-secondary text-center">
                  {t('plans.taxNote')}
                </p>
                {error && <p role="alert" className="mt-3 text-sm text-red-500 text-center">{error}</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2">
      <Check className="w-4 h-4 shrink-0 text-green-500" />
      <span>{text}</span>
    </li>
  );
}
