import { Component, ReactNode } from 'react';
import { tNow } from '../i18n';

interface State { failed: boolean }

// Evita la pantalla en blanco si algo falla al dibujar o en cualquier componente
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State { return { failed: true }; }

  componentDidCatch(error: unknown) { console.error('GeoPattern error:', error); }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#282828', color: '#FFFFFF', fontFamily: 'Barlow, sans-serif', textAlign: 'center' }}>
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 44, margin: 0 }}>{tNow('errorBoundary.title')}</h1>
          <p style={{ opacity: 0.8, fontSize: 18 }}>{tNow('errorBoundary.text')}</p>
          <button onClick={() => window.location.reload()}
            style={{ marginTop: 12, height: 48, padding: '0 28px', borderRadius: 12, border: 'none', background: '#61DAD8', color: '#282828', fontSize: 20, cursor: 'pointer' }}>
            {tNow('errorBoundary.reload')}
          </button>
        </div>
      </div>
    );
  }
}
