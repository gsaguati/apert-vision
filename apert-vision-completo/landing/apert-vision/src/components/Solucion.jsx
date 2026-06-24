import { useInView } from '../hooks/useInView'
import Icon from './Icon'

function MetricaCard({ icon, name, desc, delay, inView }) {
  return (
    <div
      style={{ background:'var(--negro2)', padding:'46px 32px', textAlign:'center', cursor:'default', transition:'background .3s', opacity: inView?1:0, transform: inView?'translateY(0)':'translateY(24px)', transitionDelay:`${delay}ms` }}
      onMouseEnter={e => e.currentTarget.style.background='var(--negro3)'}
      onMouseLeave={e => e.currentTarget.style.background='var(--negro2)'}
    >
      <div className="icon-box" style={{ width:56, height:56, margin:'0 auto 18px' }}><Icon name={icon} size={26} /></div>
      <div style={{ fontFamily:'var(--display)', fontWeight:900, fontSize:32, color:'var(--blanco)', letterSpacing:1, textTransform:'uppercase', marginBottom:10 }}>{name}</div>
      <div style={{ fontSize:13.5, color:'var(--gris)', lineHeight:1.65 }}>{desc}</div>
    </div>
  )
}

function FeatureCard({ num, title, desc, delay, inView }) {
  return (
    <div
      className="card"
      style={{ padding:32, cursor:'default', opacity: inView?1:0, transform: inView?'translateY(0)':'translateY(20px)', transition:'opacity .5s, transform .5s, border-color .3s, box-shadow .3s', transitionDelay:`${delay}ms` }}
    >
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        <span style={{ fontFamily:'var(--mono)', fontSize:12, fontWeight:600, color:'var(--verde)', background:'var(--verde-dim)', border:'1px solid rgba(0,230,118,.16)', padding:'4px 11px', borderRadius:8 }}>{num}</span>
        <h3 style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:19, textTransform:'uppercase', color:'var(--blanco)', letterSpacing:.3 }}>{title}</h3>
      </div>
      <p style={{ fontSize:14.5, color:'var(--gris)', lineHeight:1.7 }}>{desc}</p>
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
        <p style={{ fontSize:17, color:'var(--texto)', lineHeight:1.75, marginTop:24 }}>{data.subtitle}</p>
      </div>

      {/* Métricas */}
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${data.metricas.length},1fr)`, gap:1, background:'var(--gris2)', border:'1px solid var(--gris2)', borderRadius:16, overflow:'hidden', marginBottom:72 }}>
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
