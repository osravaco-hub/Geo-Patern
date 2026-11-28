import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { PATTERN_DEFINITIONS, PatternId } from '../lib/patterns';
import { CATEGORIES, CategoryId, PATTERN_CATEGORY } from '../lib/categories';
import Header from '../components/Header';
import Hero from '../components/Hero';
import PatternPreview from '../components/PatternPreview';
import PricingModal from '../components/PricingModal';
import Footer from '../components/Footer';
import FeedbackModal from '../components/FeedbackModal';
import { SavedPattern, listSaved, deleteSaved } from '../lib/savedPatterns';
import { useUserContext } from '../context/UserContext';
import { useI18n } from '../i18n';

const MAX_VISIBLE_CATEGORIES = 11;

interface HomeProps {
  onSelectPattern: (id: PatternId) => void;
  onSelectSaved?: (saved: SavedPattern) => void;
  onNavigateDashboard: () => void;
}

export default function Home({ onSelectPattern, onSelectSaved, onNavigateDashboard }: HomeProps) {
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { user } = useUserContext();
  // La categoría elegida se recuerda para que, al volver con "atrás", la galería siga igual
  const [category, setCategory] = useState<CategoryId | 'todos' | 'guardados'>(() => {
    try {
      const v = sessionStorage.getItem('gp_category');
      const valid = v === 'todos' || (v === 'guardados' && listSaved().length > 0) || CATEGORIES.some(c => c.id === v);
      return valid ? (v as CategoryId | 'todos' | 'guardados') : 'todos';
    } catch {
      return 'todos';
    }
  });
  useEffect(() => {
    try { sessionStorage.setItem('gp_category', category); } catch { /* sin almacenamiento */ }
  }, [category]);
  const [saved, setSaved] = useState<SavedPattern[]>(() => listSaved());
  const [showAllCats, setShowAllCats] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const gridRef = useRef<HTMLElement>(null);
  // Al volver con "atrás" (hay un scroll guardado) la galería aparece al instante, sin repetir la animación
  const [revealed, setRevealed] = useState(() => (window.history.state?.scrollY ?? 0) > 0);
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    // Se miran todas las notificaciones recibidas: al volver con "atrás" el navegador puede entregar juntas
    // "no visible" (al montar) y "visible" (tras restaurar el scroll), y la primera no debe ganar.
    const io = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { setRevealed(true); io.disconnect(); } }, { threshold: 0.08 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cats: { id: CategoryId | 'todos' | 'guardados'; label: string }[] = [
    { id: 'todos', label: t('home.all') },
    ...CATEGORIES.map(c => ({ id: c.id, label: t(`category.${c.id}` as const) })),
    ...(saved.length > 0 ? [{ id: 'guardados' as const, label: t('home.saved', { n: saved.length }) }] : []),
  ];
  const visibleCats = showAllCats ? cats : cats.slice(0, MAX_VISIBLE_CATEGORIES);
  const patterns = category === 'guardados' ? [] : PATTERN_DEFINITIONS.filter(p => category === 'todos' || PATTERN_CATEGORY[p.id] === category);

  return (
    <div className="min-h-screen bg-background text-text">
      <Header theme={theme} onToggleTheme={toggleTheme} user={user}
        onNavigateDashboard={onNavigateDashboard}
        onPlans={() => setShowPlans(true)} />

      <Hero onExplore={() => gridRef.current?.scrollIntoView({ behavior: 'smooth' })} />

      <main ref={gridRef} id="patrones" className={`px-4 sm:px-6 scroll-mt-[60px] min-h-[calc(100svh-60px)] transition-all duration-700 ease-out ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <nav className="flex flex-wrap gap-3 py-6 border-b border-border" aria-label={t('home.categories')}>
          {visibleCats.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)}
              className={`h-11 px-6 rounded-xl text-lg uppercase transition ${category === c.id
                ? 'bg-accent text-accent-text'
                : 'border border-text/70 text-text hover:border-accent hover:text-accent-ink'}`}>
              {c.label}
            </button>
          ))}
          {!showAllCats && cats.length > MAX_VISIBLE_CATEGORIES && (
            <button onClick={() => setShowAllCats(true)} className="h-11 px-6 rounded-xl border border-text/70 text-lg uppercase hover:border-accent">{t('home.more')}</button>
          )}
        </nav>

        <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 py-8">
          {patterns.map(p => (
            <button key={p.id} onClick={() => onSelectPattern(p.id)}
              className="group text-left rounded-2xl border border-text/70 overflow-hidden bg-background hover:border-accent focus-visible:border-accent transition">
              <div className="aspect-[4/3] overflow-hidden"><PatternPreview type={p.id} theme={theme} /></div>
              <div className="px-3 py-3 text-center text-lg uppercase border-t border-text/70 transition group-hover:bg-accent group-hover:text-accent-text group-hover:border-accent group-focus-visible:bg-accent group-focus-visible:text-accent-text">
                {t(`pattern.${p.id}` as const)}
              </div>
            </button>
          ))}
        </section>

        {category === 'guardados' && (
          <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 py-8">
            {saved.map(sp => (
              <div key={sp.id} className="group relative rounded-2xl border border-text/70 overflow-hidden bg-background hover:border-accent transition">
                <button onClick={() => onSelectSaved?.(sp)} className="block w-full text-left">
                  <div className="aspect-[4/3] overflow-hidden"><PatternPreview type={sp.config.type} theme={theme} config={sp.config} seed={sp.seed} /></div>
                  <div className="px-3 py-3 text-center text-lg uppercase border-t border-text/70 truncate group-hover:bg-accent group-hover:text-accent-text group-hover:border-accent">{sp.name}</div>
                </button>
                <button onClick={() => setSaved(deleteSaved(sp.id))} aria-label={t('home.deleteSaved')} title={t('home.delete')}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 border border-border text-text hover:border-accent">×</button>
              </div>
            ))}
          </section>
        )}

        {/* BEGIN AADS AD UNIT 2462390 */}
      <div id="frame" className="py-6 flex justify-center">
        <iframe data-aa='2462390' src='//acceptable.a-ads.com/2462390/?size=Adaptive'
          style={{ border: 0, padding: 0, width: '70%', height: 'auto', overflow: 'hidden', display: 'block', margin: 'auto' }}></iframe>
      </div>
      {/* END AADS AD UNIT 2462390 */}

      </main>

      <Footer onOpenFeedback={() => setFeedbackOpen(true)} />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />

      <PricingModal isOpen={showPlans} onClose={() => setShowPlans(false)} currentTier={user.tier} />
    </div>
  );
}
