const LINKS = [['#solucion','Funcionalidades'],['#descarga','Descargar'],['#faq','FAQ']]

export default function Footer() {
  return (
    <footer style={{ background:'var(--negro)', borderTop:'1px solid var(--gris2)', padding:'64px 72px' }}>
      <div className='footer-grid' style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:40 }}>
        <div>
          <div style={{ fontFamily:'var(--display)', fontWeight:900, fontSize:36, letterSpacing:3, color:'var(--verde)', textTransform:'uppercase', marginBottom:14 }}>Apert Vision</div>
          <p style={{ fontSize:14, color:'var(--gris)', maxWidth:320, lineHeight:1.65 }}>
            Análisis de rugby con inteligencia artificial para clubes amateurs.
          </p>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ display:'flex', gap:28, justifyContent:'flex-end', marginBottom:16 }}>
            {LINKS.map(([href,label])=>(
              <a key={href} href={href} style={{ fontSize:12, color:'var(--gris)', textDecoration:'none', letterSpacing:1, textTransform:'uppercase', fontFamily:'var(--mono)', transition:'color .2s' }}
                onMouseEnter={e=>e.currentTarget.style.color='var(--verde)'}
                onMouseLeave={e=>e.currentTarget.style.color='var(--gris)'}
              >{label}</a>
            ))}
          </div>
          <div style={{ fontSize:12, color:'var(--gris)', fontFamily:'var(--mono)' }}>
            © 2025 Apert Vision · Gonzalo Saguati<br/>
            Escuela Da Vinci — Analista de Sistemas
          </div>
        </div>
      </div>
    </footer>
  )
}
