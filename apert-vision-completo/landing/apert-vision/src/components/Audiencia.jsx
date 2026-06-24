import { useInView } from '../hooks/useInView'
import Icon from './Icon'

function AudienceCard({ emoji, title, desc, items, delay, inView }) {
  return (
    <div
      className="card"
      style={{ padding:'40px 34px', position:'relative', cursor:'default', opacity: inView?1:0, transform: inView?'translateY(0)':'translateY(30px)', transition:'opacity .55s, transform .55s, border-color .3s, box-shadow .3s', transitionDelay:`${delay}ms` }}
    >
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,var(--verde),transparent)' }}/>
      <div className="icon-box" style={{ width:54, height:54, marginBottom:22 }}><Icon name={emoji} size={26} /></div>
      <h3 style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:28, textTransform:'uppercase', marginBottom:14, color:'var(--blanco)', letterSpacing:.3 }}>{title}</h3>
      <p style={{ fontSize:14.5, color:'var(--gris)', lineHeight:1.7, marginBottom:26 }}>{desc}</p>
      <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:12 }}>
        {items.map((item, i) => (
          <li key={i} style={{ fontSize:13.5, color:'var(--texto)', display:'flex', alignItems:'flex-start', gap:11, lineHeight:1.55 }}>
            <Icon name="check" size={16} strokeWidth={2.2} style={{ color:'var(--verde)', flexShrink:0, marginTop:2 }} />{item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Audiencia({ data }) {
  const [ref, inView] = useInView()

  return (
    <section id="audiencia" ref={ref} className="section-pad" style={{ background:'var(--negro)' }}>
      <div style={{ opacity: inView?1:0, transform: inView?'translateY(0)':'translateY(20px)', transition:'opacity .6s, transform .6s', marginBottom:60 }}>
        <div className="section-tag">{data.tag}</div>
        <h2 className="display-lg">{data.title}<br/><span className="green">{data.titleGreen}</span></h2>
      </div>
      <div className='grid-3' style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
        {data.cards.map((c, i) => (
          <AudienceCard key={i} {...c} delay={i*120} inView={inView} />
        ))}
      </div>
    </section>
  )
}
