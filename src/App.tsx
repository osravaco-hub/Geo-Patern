import { useCallback, useEffect, useState } from 'react';
import Home from './pages/Home';
import Generator from './pages/Generator';
import Dashboard from './pages/Dashboard';
import { PATTERN_DEFINITIONS, PatternId } from './lib/patterns';
import { listSaved } from './lib/savedPatterns';
import { UserProvider } from './context/UserContext';
import PaymentBanner from './components/PaymentBanner';

// Rutas: "/" (galería), "/editor/<patrón>[?guardado=<id>]" y "/cuenta".
// Se usa el historial del navegador, así el botón "atrás" vuelve a la pantalla anterior
// y cada pantalla tiene su propia URL (se puede recargar o compartir).
type Route =
  | { page: 'home' }
  | { page: 'generator'; pattern: PatternId; savedId: string | null }
  | { page: 'dashboard' };

function parseLocation(): Route {
  const { pathname, search } = window.location;
  const editor = pathname.match(/^\/editor\/([^/]+)\/?$/);
  if (editor) {
    const id = decodeURIComponent(editor[1]);
    if (PATTERN_DEFINITIONS.some(p => p.id === id)) {
      return { page: 'generator', pattern: id as PatternId, savedId: new URLSearchParams(search).get('guardado') };
    }
  }
  if (/^\/cuenta\/?$/.test(pathname)) return { page: 'dashboard' };
  return { page: 'home' };
}

function urlFor(route: Route): string {
  if (route.page === 'generator') {
    return `/editor/${route.pattern}${route.savedId ? `?guardado=${encodeURIComponent(route.savedId)}` : ''}`;
  }
  return route.page === 'dashboard' ? '/cuenta' : '/';
}

function AppContent() {
  // "session" cambia en cada navegación para empezar con un editor limpio
  const [nav, setNav] = useState(() => ({ route: parseLocation(), session: 0 }));

  const go = useCallback((route: Route) => {
    // Guarda el scroll de la pantalla actual para poder volver exactamente a ese punto
    window.history.replaceState({ ...(window.history.state ?? {}), scrollY: window.scrollY }, '');
    window.history.pushState({ scrollY: 0 }, '', urlFor(route));
    setNav(n => ({ route, session: n.session + 1 }));
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    const onPop = (e: PopStateEvent) => {
      setNav(n => ({ route: parseLocation(), session: n.session + 1 }));
      const y: number = e.state?.scrollY ?? 0;
      setTimeout(() => requestAnimationFrame(() => window.scrollTo(0, y)), 0);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Título de la pestaña según la pantalla
  useEffect(() => {
    const { route } = nav;
    const base = 'GeoPattern - Generador de Patrones Geométricos';
    if (route.page === 'generator') {
      const label = PATTERN_DEFINITIONS.find(p => p.id === route.pattern)?.label;
      document.title = label ? `${label} · GeoPattern` : base;
    } else {
      document.title = route.page === 'dashboard' ? 'Mi cuenta · GeoPattern' : base;
    }
  }, [nav]);

  const { route, session } = nav;

  if (route.page === 'dashboard') return <Dashboard onBack={() => go({ page: 'home' })} />;

  if (route.page === 'generator') {
    const saved = route.savedId ? listSaved().find(s => s.id === route.savedId) ?? null : null;
    return (
      <Generator key={session} initialPattern={route.pattern} initialSaved={saved}
        onHome={() => go({ page: 'home' })} onNavigateDashboard={() => go({ page: 'dashboard' })} />
    );
  }

  return (
    <Home
      onSelectPattern={id => go({ page: 'generator', pattern: id, savedId: null })}
      onSelectSaved={sp => go({ page: 'generator', pattern: sp.config.type, savedId: sp.id })}
      onNavigateDashboard={() => go({ page: 'dashboard' })} />
  );
}

export default function App() {
  return (
    <UserProvider>
      <PaymentBanner />
      <AppContent />
    </UserProvider>
  );
}
