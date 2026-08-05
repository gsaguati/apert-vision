const EMAIL = 'soporte@apertvision.com'
const WHATSAPP_NUM = '+54 9 11 0000 0000'
const WHATSAPP_LINK = 'https://wa.me/5491100000000?text=' + encodeURIComponent('Hola, tengo una consulta sobre Apert Vision:')
const MAILTO = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Consulta sobre Apert Vision')

export default function Soporte() {
  return (
    <section id="soporte" className="section-pad" style={{ background:'var(--negro2)' }}>
      <div style={{ maxWidth:960, margin:'0 auto', textAlign:'center' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--verde-dim)', border:'1px solid rgba(0,230,118,.18)', color:'var(--verde)', padding:'6px 18px', borderRadius:100, fontSize:11, fontWeight:600, letterSpacing:2, textTransform:'uppercase', marginBottom:32, fontFamily:'var(--mono)' }}>
          <span style={{ width:6, height:6, background:'var(--verde)', borderRadius:'50%' }}/>
          Soporte
        </div>

        <h2 className="display-xl" style={{ marginBottom:8 }}>¿Necesitás ayuda?</h2>
        <h2 className="display-xl green" style={{ marginBottom:24 }}>Estamos para vos.</h2>

        <p style={{ fontSize:16, color:'var(--gris)', lineHeight:1.75, marginBottom:48, maxWidth:560, margin:'0 auto 48px' }}>
          Escribinos por mail o mandanos un WhatsApp. Respondemos consultas técnicas, dudas sobre créditos y feedback del producto.
        </p>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:20, marginBottom:32 }}>
          {/* EMAIL CARD */}
          <a href={MAILTO}
            style={{ background:'var(--negro3)', border:'1px solid var(--gris2)', borderRadius:16, padding:'32px 24px', textDecoration:'none', display:'flex', flexDirection:'column', alignItems:'center', gap:12, transition:'all .25s', cursor:'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--verde)'; e.currentTarget.style.transform='translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--gris2)'; e.currentTarget.style.transform='none' }}
          >
            <div style={{ width:52, height:52, borderRadius:14, background:'var(--verde-dim)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>✉️</div>
            <div style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--verde)', letterSpacing:1.5, textTransform:'uppercase' }}>Email</div>
            <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:18, color:'var(--blanco)' }}>{EMAIL}</div>
            <div style={{ fontSize:12, color:'var(--gris)' }}>Respuesta en menos de 24 hs.</div>
          </a>

          {/* WHATSAPP CARD */}
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
            style={{ background:'var(--negro3)', border:'1px solid var(--gris2)', borderRadius:16, padding:'32px 24px', textDecoration:'none', display:'flex', flexDirection:'column', alignItems:'center', gap:12, transition:'all .25s', cursor:'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#25D366'; e.currentTarget.style.transform='translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--gris2)'; e.currentTarget.style.transform='none' }}
          >
            <div style={{ width:52, height:52, borderRadius:14, background:'rgba(37, 211, 102, .15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>💬</div>
            <div style={{ fontFamily:'var(--mono)', fontSize:11, color:'#25D366', letterSpacing:1.5, textTransform:'uppercase' }}>WhatsApp</div>
            <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:18, color:'var(--blanco)' }}>{WHATSAPP_NUM}</div>
            <div style={{ fontSize:12, color:'var(--gris)' }}>Lun a Vie, 9 a 18 hs.</div>
          </a>
        </div>

        <div style={{ fontSize:12, color:'var(--gris)', fontFamily:'var(--mono)' }}>
          Tiempo promedio de respuesta: <span style={{ color:'var(--verde)' }}>&lt; 4 hs.</span> en horario laboral.
        </div>
      </div>
    </section>
  )
}
