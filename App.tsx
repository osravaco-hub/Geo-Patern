import { useState } from 'react';
import Home from './pages/Home';
import Generator from './pages/Generator';
import Dashboard from './pages/Dashboard';
import { PatternId } from './lib/patterns';
import { SavedPattern } from './lib/savedPatterns';

type Page = 'home' | 'generator' | 'dashboard';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [pattern, setPattern] = useState<PatternId>('concentricCircles');
  const [saved, setSaved] = useState<SavedPattern | null>(null);
  const [session, setSession] = useState(0); // fuerza un editor nuevo al abrir otro patrón

  if (page === 'dashboard') return <Dashboard onBack={() => setPage('home')} />;
  if (page === 'generator') {
    return (
      <Generator key={session} initialPattern={pattern} initialSaved={saved}
        onHome={() => setPage('home')} onNavigateDashboard={() => setPage('dashboard')} />
    );
  }
  return (
    <Home
      onSelectPattern={(id) => { setPattern(id); setSaved(null); setSession(n => n + 1); setPage('generator'); }}
      onSelectSaved={(sp) => { setPattern(sp.config.type); setSaved(sp); setSession(n => n + 1); setPage('generator'); }}
      onNavigateDashboard={() => setPage('dashboard')} />
  );
}
