import { useState } from 'react'
import { useScrolled } from '../hooks/useScrolled'

const LINKS = [
  ['#solucion',  'Funcionalidades'],
  ['#preview',   'El producto'],
  ['#flujo',     'Cómo funciona'],
  ['#audiencia', 'Para quién'],
  ['#faq',       'FAQ'],
]

export default function Navbar() {
  const scrolled   = useScrolled()
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        {/* Logo */}
        <a href="#hero" style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:22, letterSpacing:3, color:'var(--blanco)', textDecoration:'none', display:'flex', alignItems:'center', gap:10, textTransform:'uppercase' }}>
          <span style={{ width:28, height:28, background:'var(--verde)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🏉</span>
          Apert<span style={{ color:'var(--verde)' }}>Vision</span>
        </a>

        {/* Links desktop */}
        <ul className="nav-links-desktop" style={{ display:'flex', gap:32, listStyle:'none' }}>
          {LINKS.map(([href, label]) => (
            <li key={href}>
              <a href={href}
                style={{ color:'var(--gris)', textDecoration:'none', fontSize:13, fontWeight:500, letterSpacing:.5, transition:'color .2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--verde)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--gris)'}
              >{label}</a>
            </li>
          ))}
        </ul>

        {/* CTA + hamburguesa */}
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <a href="#descarga" className="btn btn-solid" style={{ padding:'9px 22px', fontSize:13 }}>
            Descargar
          </a>
          {/* Hamburguesa mobile */}
          <button
            className="nav-hamburger"
            onClick={() => setOpen(!open)}
            aria-label="Menú"
            style={{ display:'none', background:'none', border:'1px solid var(--gris2)', borderRadius:8, padding:'8px 10px', cursor:'none', flexDirection:'column', gap:4 }}
          >
            <span style={{ width:18, height:2, background:'var(--blanco)', display:'block', borderRadius:2, transition:'all .3s', transform: open ? 'rotate(45deg) translateY(6px)' : 'none' }}/>
            <span style={{ width:18, height:2, background:'var(--blanco)', display:'block', borderRadius:2, opacity: open ? 0 : 1 }}/>
            <span style={{ width:18, height:2, background:'var(--blanco)', display:'block', borderRadius:2, transition:'all .3s', transform: open ? 'rotate(-45deg) translateY(-6px)' : 'none' }}/>
          </button>
        </div>
      </nav>

      {/* Menú mobile desplegable */}
      {open && (
        <div className="nav-mobile-menu" style={{ position:'fixed', top:80, left:16, right:16, background:'rgba(4,5,6,.97)', border:'1px solid var(--gris2)', borderRadius:16, padding:24, zIndex:199, backdropFilter:'blur(20px)' }}>
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}
              style={{ display:'block', padding:'14px 0', color:'var(--gris)', textDecoration:'none', fontSize:16, fontWeight:500, borderBottom:'1px solid var(--gris2)', transition:'color .2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--verde)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--gris)'}
            >{label}</a>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  )
}
