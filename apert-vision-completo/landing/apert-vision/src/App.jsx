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

function Toast({ message, visible }) {
  if (!visible) return null
  return <div className="toast">{message}</div>
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
