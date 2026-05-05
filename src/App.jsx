import { useState, useEffect } from 'react'
import { decompressFromEncodedURIComponent } from 'lz-string'
import MakerPage from './pages/MakerPage'
import PortfolioPage from './pages/PortfolioPage'

const ACCESS_PASSWORD = '3bdduo'
const ACCESS_KEY = 'portfolio_maker_access_granted'

/**
 * Hash-based router:
 *   /           → MakerPage  (form)
 *   /#portfolio=<b64data> → PortfolioPage (viewer)
 *
 * The Maker generates a link like:
 *   https://your-site.com/#portfolio=eyJuYW1l...
 * The PortfolioPage reads that hash and renders the portfolio.
 */
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
  const [isAuthorized, setIsAuthorized] = useState(() => sessionStorage.getItem(ACCESS_KEY) === 'true')
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    const onHash = () => setRouteState(getRouteFromHash())
    window.addEventListener('hashchange', onHash)

    // Disable right-click context menu
    const handleContextMenu = (e) => e.preventDefault()
    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      window.removeEventListener('hashchange', onHash)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  const handleUnlock = (e) => {
    e.preventDefault()
    if (passwordInput === ACCESS_PASSWORD) {
      sessionStorage.setItem(ACCESS_KEY, 'true')
      setIsAuthorized(true)
      setAuthError('')
      return
    }
    setAuthError('Incorrect password. Try again.')
  }

  if (!isAuthorized) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '1.2rem', background: '#0f172a' }}>
        <form
          onSubmit={handleUnlock}
          style={{
            width: '100%',
            maxWidth: '420px',
            background: '#111827',
            border: '1px solid #334155',
            borderRadius: '14px',
            padding: '1.4rem',
            color: '#e2e8f0',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '1.2rem' }}>Enter Website Password</h1>
          <p style={{ margin: '.6rem 0 1rem', color: '#94a3b8', fontSize: '.9rem' }}>This page is protected.</p>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value)
              if (authError) setAuthError('')
            }}
            placeholder="Password"
            style={{
              width: '100%',
              padding: '.7rem .8rem',
              borderRadius: '10px',
              border: '1px solid #475569',
              background: '#0b1220',
              color: '#e2e8f0',
              outline: 'none',
            }}
          />
          {authError && <p style={{ margin: '.6rem 0 0', color: '#f87171', fontSize: '.85rem' }}>{authError}</p>}
          <button
            type="submit"
            style={{
              width: '100%',
              marginTop: '.9rem',
              border: 'none',
              borderRadius: '10px',
              padding: '.7rem .9rem',
              background: 'linear-gradient(135deg,#8b5cf6,#38bdf8)',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Enter
          </button>
        </form>
      </div>
    )
  }

  if (route === 'portfolio' && data) return <PortfolioPage data={data} />
  if (route === 'error') return <PortfolioPage data={null} />
  return <MakerPage />
}
