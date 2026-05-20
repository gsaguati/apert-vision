import { useInView } from '../hooks/useInView'

function TechCard({ icon, name, role, delay, inView }) {
  return (
    <div
      style={{ background:'var(--negro3)', border:'1px solid var(--gris2)', borderRadius:12, padding:'28px 18px', textAlign:'center', transition:'border-color .3s, transform .3s', cursor:'default', opacity: inView?1:0, transform: inView?'translateY(0)':'translateY(20px)', transitionDelay:`${delay}ms, ${delay}ms` }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(0,230,118,.3)'; e.currentTarget.style.transform='translateY(-4px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--gris2)'; e.currentTarget.style.transform='' }}
    >
      <div style={{ fontSize:30, marginBottom:12 }}>{icon}</div>
      <div style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:18, textTransform:'uppercase', marginBottom:4 }}>{name}</div>
      <div style={{ fontSize:11, color:'var(--gris)', fontFamily:'var(--mono)' }}>{role}</div>
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
        <p style={{ fontSize:17, color:'var(--gris)', maxWidth:520, lineHeight:1.75, marginBottom:56 }}>{data.subtitle}</p>
      </div>
      <div className='grid-6' style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:14 }}>
        {data.items.map((item, i) => (
          <TechCard key={i} {...item} delay={i*60} inView={inView} />
        ))}
      </div>
    </section>
  )
}
