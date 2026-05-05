import { useState, useEffect } from 'react'
import MakerPage from './pages/MakerPage'
import PortfolioPage from './pages/PortfolioPage'

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

  if (route === 'portfolio' && data) return <PortfolioPage data={data} />
  if (route === 'error') return <PortfolioPage data={null} />
  return <MakerPage />
}
