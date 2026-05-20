import { useInView } from '../hooks/useInView'

function MetricaCard({ icon, name, desc, delay, inView }) {
  return (
    <div
      style={{ background:'var(--negro2)', padding:'44px 32px', textAlign:'center', cursor:'default', transition:'background .3s', opacity: inView?1:0, transform: inView?'translateY(0)':'translateY(24px)', transitionDelay:`${delay}ms, ${delay}ms` }}
      onMouseEnter={e => e.currentTarget.style.background='var(--negro3)'}
      onMouseLeave={e => e.currentTarget.style.background='var(--negro2)'}
    >
      <div style={{ fontSize:34, marginBottom:16 }}>{icon}</div>
      <div style={{ fontFamily:'var(--display)', fontWeight:900, fontSize:32, color:'var(--verde)', letterSpacing:1, textTransform:'uppercase', marginBottom:10 }}>{name}</div>
      <div style={{ fontSize:13, color:'var(--gris)', lineHeight:1.6 }}>{desc}</div>
    </div>
  )
}

function FeatureCard({ num, title, desc, delay, inView }) {
  return (
    <div
      style={{ background:'var(--negro2)', border:'1px solid var(--gris2)', borderRadius:14, padding:32, transition:'border-color .3s, transform .3s', cursor:'default', opacity: inView?1:0, transform: inView?'translateY(0)':'translateY(20px)', transitionDelay:`${delay}ms, ${delay}ms` }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(0,230,118,.22)'; e.currentTarget.style.transform='translateY(-4px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--gris2)'; e.currentTarget.style.transform='' }}
    >
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
        <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--verde)', background:'var(--verde-dim)', border:'1px solid rgba(0,230,118,.14)', padding:'3px 12px', borderRadius:100 }}>{num}</span>
        <h3 style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:18, textTransform:'uppercase' }}>{title}</h3>
      </div>
      <p style={{ fontSize:14, color:'var(--gris)', lineHeight:1.65 }}>{desc}</p>
    </div>
  )
}

export default function Solucion({ data }) {
  const [ref, inView] = useInView()

  return (
    <section id="solucion" ref={ref} className="section-pad" style={{ background:'var(--negro)' }}>
      <div style={{ maxWidth:700, marginBottom:72 }}>
        <div className="section-tag">{data.tag}</div>
        <h2 className="display-lg" style={{ opacity: inView?1:0, transform: inView?'translateY(0)':'translateY(20px)', transition:'opacity .6s, transform .6s' }}>
          {data.title}<br/><span className="green">{data.titleGreen}</span>
        </h2>
        <p style={{ fontSize:17, color:'var(--gris)', lineHeight:1.75, marginTop:24 }}>{data.subtitle}</p>
      </div>

      {/* Métricas */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', className:'grid-4', gap:1, background:'var(--gris2)', border:'1px solid var(--gris2)', borderRadius:16, overflow:'hidden', marginBottom:72 }}>
        {data.metricas.map((m, i) => (
          <MetricaCard key={i} {...m} delay={i*80} inView={inView} />
        ))}
      </div>

      {/* Features */}
      <div className='grid-3' style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
        {data.features.map((f, i) => (
          <FeatureCard key={i} {...f} delay={(i+4)*70} inView={inView} />
        ))}
      </div>
    </section>
  )
}
