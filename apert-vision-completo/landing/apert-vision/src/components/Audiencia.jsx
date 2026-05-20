import { useInView } from '../hooks/useInView'

function AudienceCard({ emoji, title, desc, items, delay, inView }) {
  return (
    <div
      style={{ background:'var(--negro2)', border:'1px solid var(--gris2)', borderRadius:16, padding:'44px 34px', position:'relative', overflow:'hidden', transition:'border-color .3s, transform .3s', cursor:'default', opacity: inView?1:0, transform: inView?'translateY(0)':'translateY(30px)', transitionDelay:`${delay}ms, ${delay}ms` }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(0,230,118,.22)'; e.currentTarget.style.transform='translateY(-6px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--gris2)'; e.currentTarget.style.transform='' }}
    >
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,var(--verde),transparent)' }}/>
      <span style={{ fontSize:40, marginBottom:20, display:'block' }}>{emoji}</span>
      <h3 style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:28, textTransform:'uppercase', marginBottom:14 }}>{title}</h3>
      <p style={{ fontSize:14, color:'var(--gris)', lineHeight:1.65, marginBottom:24 }}>{desc}</p>
      <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:10 }}>
        {items.map((item, i) => (
          <li key={i} style={{ fontSize:13, color:'var(--gris)', display:'flex', alignItems:'flex-start', gap:10 }}>
            <span style={{ color:'var(--verde)', flexShrink:0, fontWeight:700 }}>→</span>{item}
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
