import { useState, useEffect, lazy, Suspense } from 'react'
import { decompressFromEncodedURIComponent } from 'lz-string'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from './useTheme'

// Lazy load pages for performance (Code Splitting)
const MakerPage = lazy(() => import('./pages/MakerPage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));

function getRouteFromHash() {
  const hash = window.location.hash
  const compactMatch = hash.match(/^#p=([^&]+)&d=(.+)$/)
  if (compactMatch) {
    const compressed = compactMatch[2]
    try {
      const json = decompressFromEncodedURIComponent(compressed)
      if (!json) return { route: 'error', data: null }
      const data = JSON.parse(json)
      return { route: 'portfolio', data }
    } catch {
      return { route: 'error', data: null }
    }
  }
  if (hash.startsWith('#portfolio=')) {
    const encoded = hash.slice('#portfolio='.length)
    try {
      const data = JSON.parse(decodeURIComponent(escape(atob(encoded))))
      return { route: 'portfolio', data }
    } catch {
      return { route: 'error', data: null }
    }
  }
  return { route: 'maker', data: null }
}

export default function App() {
  const [{ route, data }, setRouteState] = useState(getRouteFromHash)
  const [token, setToken] = useState(() => localStorage.getItem('userToken'))
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('userData');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const onHash = () => setRouteState(getRouteFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const handleLogin = (t, u) => {
    setToken(t);
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setToken(null);
    setUser(null);
  };

  let content;
  if (route === 'portfolio' && data) content = <div className="page-transition" key="portfolio"><PortfolioPage data={data} /></div>;
  else if (route === 'error') content = <div className="page-transition" key="error"><PortfolioPage data={null} /></div>;
  else if (!token) content = <div className="page-transition" key="auth"><AuthPage onLogin={handleLogin} /></div>;
  else content = <div className="page-transition" key="maker"><MakerPage user={user} onLogout={handleLogout} /></div>;

  return (
    <HelmetProvider>
      <ThemeProvider>
        {/* Global SEO Fallback */}
        <Helmet>
          <title>port-make | Professional Portfolio Builder</title>
          <meta name="description" content="Build and share your professional portfolio in seconds with port-make." />
        </Helmet>

        <Suspense fallback={
          <div className="text-animate" style={{
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '1rem',
            color: 'var(--text-secondary)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--accent-bg)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontWeight: '600', letterSpacing: '0.05em' }}>PREPARING EXPERIENCE...</span>

          </div>
        }>
          {content}
        </Suspense>

      </ThemeProvider>
    </HelmetProvider>
  );
}
