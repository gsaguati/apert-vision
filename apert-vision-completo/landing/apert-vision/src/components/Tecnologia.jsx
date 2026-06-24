import { useInView } from '../hooks/useInView'
import Icon from './Icon'

function TechCard({ icon, name, role, delay, inView }) {
  return (
    <div
      className="card"
      style={{ padding:'30px 18px', textAlign:'center', cursor:'default', opacity: inView?1:0, transform: inView?'translateY(0)':'translateY(20px)', transition:'opacity .5s, transform .5s, border-color .3s, box-shadow .3s', transitionDelay:`${delay}ms` }}
    >
      <div className="icon-box" style={{ width:50, height:50, margin:'0 auto 14px' }}><Icon name={icon} size={24} /></div>
      <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:18, textTransform:'uppercase', marginBottom:5, color:'var(--blanco)', letterSpacing:.3 }}>{name}</div>
      <div style={{ fontSize:10.5, color:'var(--gris)', fontFamily:'var(--mono)', letterSpacing:.3 }}>{role}</div>
    </div>
  )
}

export default function Tecnologia({ data }) {
  const [ref, inView] = useInView()

  return (
    <section id="tecnologia" ref={ref} className="section-pad" style={{ background:'var(--negro2)' }}>
      <div style={{ opacity: inView?1:0, transform: inView?'translateY(0)':'translateY(20px)', transition:'opacity .6s, transform .6s' }}>
        <div className="section-tag">{data.tag}</div>
        <h2 className="display-lg" style={{ marginBottom:20 }}>{data.title}<br/><span className="green">{data.titleGreen}</span></h2>
        <p style={{ fontSize:17, color:'var(--texto)', maxWidth:520, lineHeight:1.75, marginBottom:56 }}>{data.subtitle}</p>
      </div>
      <div className='grid-6' style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:14 }}>
        {data.items.map((item, i) => (
          <TechCard key={i} {...item} delay={i*60} inView={inView} />
        ))}
      </div>
    </section>
  )
}
