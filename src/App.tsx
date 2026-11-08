import { useState } from 'react';
import Home from './pages/Home';
import Generator from './pages/Generator';
import Dashboard from './pages/Dashboard';
import { PatternId } from './lib/patterns';

type Page = 'home' | 'generator' | 'dashboard';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [pattern, setPattern] = useState<PatternId>('concentricCircles');

  if (page === 'dashboard') return <Dashboard onBack={() => setPage('home')} />;
  if (page === 'generator') {
    return <Generator initialPattern={pattern} onHome={() => setPage('home')} onNavigateDashboard={() => setPage('dashboard')} />;
  }
  return <Home onSelectPattern={(id) => { setPattern(id); setPage('generator'); }} onNavigateDashboard={() => setPage('dashboard')} />;
}
