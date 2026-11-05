import { useState } from 'react';
import Landing from './pages/Landing';
import Generator from './pages/Generator';
import Dashboard from './pages/Dashboard';

type Page = 'landing' | 'generator' | 'dashboard';

export default function App() {
  const [page, setPage] = useState<Page>('landing');

  if (page === 'landing') {
    return <Landing onStart={() => setPage('generator')} onNavigateDashboard={() => setPage('dashboard')} />;
  }

  if (page === 'dashboard') {
    return <Dashboard onBack={() => setPage('generator')} />;
  }

  return <Generator onNavigateDashboard={() => setPage('dashboard')} />;
}
