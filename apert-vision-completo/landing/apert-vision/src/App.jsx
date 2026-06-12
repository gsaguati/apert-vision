import { useState, useCallback, useEffect } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { INITIAL_DATA } from './data/content'

import Navbar         from './components/Navbar'
import HeroVersionB, { GlobalBgB } from './components/HeroVersionB'
import Problema       from './components/Problema'
import Solucion       from './components/Solucion'
import Preview        from './components/Preview'
import Flujo          from './components/Flujo'
import Audiencia      from './components/Audiencia'
import Tecnologia     from './components/Tecnologia'
import Descarga       from './components/Descarga'
import Faq            from './components/Faq'
import Footer         from './components/Footer'
import GestionPanel   from './components/GestionPanel'
import pelotaImg      from './assets/pelota.png'

function Toast({ message, visible }) {
  if (!visible) return null
  return <div className="toast">{message}</div>
}

// ── Cursor personalizado con la pelota ───────────────
function BallCursor() {
  useEffect(() => {
    const cursor = document.createElement('div')
    cursor.id = 'ball-cursor'
    cursor.style.cssText = `
      width:40px; height:40px;
      position:fixed; pointer-events:none; z-index:9999;
      transform:translate(-50%,-50%);
      transition:transform .08s ease;
      will-change:transform;
      background:url(${pelotaImg}) center/contain no-repeat;
    `
    document.body.appendChild(cursor)
    document.body.style.cursor = 'none'

    let raf
    let mx = 0, my = 0

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        cursor.style.left = mx + 'px'
        cursor.style.top  = my + 'px'
      })
    }

    // Agrandar en hover de elementos interactivos
    const onEnter = () => { cursor.style.width = '56px'; cursor.style.height = '56px' }
    const onLeave = () => { cursor.style.width = '40px'; cursor.style.height = '40px' }

    document.addEventListener('mousemove', onMove, { passive: true })
    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.body.removeChild(cursor)
      document.body.style.cursor = ''
      cancelAnimationFrame(raf)
    }
  }, [])

  return null
}

export default function App() {
  const [data, setData]           = useLocalStorage('apertVisionData', INITIAL_DATA)
  const [panelOpen, setPanelOpen] = useState(false)
  const [toast, setToast]         = useState({ visible: false, message: '' })

  // Aplicar clase versión B al body
  useEffect(() => {
    document.body.classList.add('version-b')
    return () => document.body.classList.remove('version-b')
  }, [])

  const showToast = useCallback((msg) => {
    setToast({ visible: true, message: msg })
    setTimeout(() => setToast({ visible: false, message: '' }), 2600)
  }, [])

  const handleSave = () => {
    showToast('✓ Cambios guardados')
    setPanelOpen(false)
  }

  return (
    <>
      <GlobalBgB />
      <BallCursor />

      <Navbar onOpenPanel={() => setPanelOpen(true)} />

      <main>
        <HeroVersionB data={data.hero} />
        <Problema     data={data.problema} />
        <Solucion     data={data.solucion} />
        <Preview />
        <Flujo        data={data.flujo} />
        <Audiencia    data={data.audiencia} />
        <Tecnologia   data={data.tecnologia} />
        <Descarga     data={data.descarga} />
        <Faq          data={data.faq} />
      </main>

      <Footer />

      {panelOpen && (
        <GestionPanel
          data={data}
          onChange={setData}
          onClose={() => setPanelOpen(false)}
          onSave={handleSave}
        />
      )}

      <Toast message={toast.message} visible={toast.visible} />
    </>
  )
}
