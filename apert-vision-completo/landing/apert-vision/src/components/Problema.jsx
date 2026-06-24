import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useInView } from '../hooks/useInView'
import Icon from './Icon'

gsap.registerPlugin(ScrollTrigger)

function ProblemaCard({ icon, title, desc, delay, inView }) {
  return (
    <div
      className="card"
      style={{ padding:28, display:'flex', gap:20, alignItems:'flex-start', cursor:'default', opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(20px)', transition:'opacity .5s, transform .5s, border-color .3s, box-shadow .3s', transitionDelay:`${delay}ms` }}
    >
      <div className="icon-box" style={{ width:48, height:48 }}><Icon name={icon} size={22} /></div>
      <div>
        <h3 style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:21, textTransform:'uppercase', marginBottom:8, color:'var(--blanco)', letterSpacing:.3 }}>{title}</h3>
        <p style={{ fontSize:14.5, color:'var(--gris)', lineHeight:1.7 }}>{desc}</p>
      </div>
    </div>
  )
}

export default function Problema({ data }) {
  const [ref, inView] = useInView()

  return (
    <section id="problema" ref={ref} className="section-pad" style={{ background:'var(--negro2)' }}>
      <div style={{ opacity: inView?1:0, transform: inView?'translateY(0)':'translateY(20px)', transition:'opacity .6s, transform .6s', marginBottom:64 }}>
        <div className="section-tag">{data.tag}</div>
        <h2 className="display-lg">{data.title}<br/><span className="green">{data.titleGreen}</span></h2>
      </div>

      <div className='problema-grid' style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {data.cards.map((c, i) => (
            <ProblemaCard key={i} {...c} delay={i*80} inView={inView} />
          ))}
        </div>

        {/* Quote */}
        <div style={{ background:'var(--negro3)', borderLeft:'4px solid var(--verde)', borderRadius:'0 12px 12px 0', padding:'48px 44px', position:'relative', opacity: inView?1:0, transform: inView?'translateX(0)':'translateX(30px)', transition:'opacity .7s .3s, transform .7s .3s' }}>
          <div style={{ fontFamily:'var(--display)', fontSize:120, color:'var(--verde)', opacity:.07, position:'absolute', top:-10, left:20, lineHeight:1 }}>"</div>
          <p style={{ fontSize:20, lineHeight:1.7, color:'var(--blanco)', position:'relative', marginBottom:28, fontStyle:'italic' }}>{data.quote.text}</p>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, background:'var(--verde)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--display)', fontSize:18, fontWeight:800, color:'var(--negro)' }}>G</div>
            <div>
              <div style={{ fontWeight:600, fontSize:14 }}>{data.quote.author}</div>
              <div style={{ fontSize:12, color:'var(--gris)' }}>{data.quote.role}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
