const LINKS = [['#solucion','Funcionalidades'],['#descarga','Descargar'],['#faq','FAQ'],['#soporte','Soporte']]
const EMAIL = 'soporte@apertvision.com'
const WA_LINK = 'https://wa.me/5491100000000?text=' + encodeURIComponent('Hola, tengo una consulta sobre Apert Vision:')

export default function Footer() {
  return (
    <footer style={{ background:'var(--negro)', borderTop:'1px solid var(--gris2)', padding:'64px 72px' }}>
      <div className='footer-grid' style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:40 }}>
        <div>
          <div style={{ fontFamily:'var(--display)', fontWeight:900, fontSize:36, letterSpacing:3, color:'var(--verde)', textTransform:'uppercase', marginBottom:14 }}>Apert Vision</div>
          <p style={{ fontSize:14, color:'var(--gris)', maxWidth:320, lineHeight:1.65, marginBottom:18 }}>
            Análisis de rugby con inteligencia artificial para clubes amateurs.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <a href={'mailto:' + EMAIL} style={{ fontSize:13, color:'var(--gris)', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:8, transition:'color .2s' }}
              onMouseEnter={e=>e.currentTarget.style.color='var(--verde)'}
              onMouseLeave={e=>e.currentTarget.style.color='var(--gris)'}
            >✉️ {EMAIL}</a>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{ fontSize:13, color:'var(--gris)', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:8, transition:'color .2s' }}
              onMouseEnter={e=>e.currentTarget.style.color='#25D366'}
              onMouseLeave={e=>e.currentTarget.style.color='var(--gris)'}
            >💬 +54 9 11 0000 0000</a>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ display:'flex', gap:28, justifyContent:'flex-end', marginBottom:16, flexWrap:'wrap' }}>
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
