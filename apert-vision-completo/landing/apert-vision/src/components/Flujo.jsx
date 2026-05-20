import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useInView } from '../hooks/useInView'

gsap.registerPlugin(ScrollTrigger)

function FlowStep({ num, title, desc, tag, index }) {
  const numRef     = useRef(null)
  const contentRef = useRef(null)
  const isEven     = index % 2 === 0

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(numRef.current,
        { opacity:0, x: isEven ? -60 : 60 },
        { opacity:1, x:0, duration:1, ease:'power3.out',
          scrollTrigger: { trigger: numRef.current, start:'top 85%', toggleActions:'play none none none' }
        }
      )
      gsap.fromTo(contentRef.current,
        { opacity:0, y:30 },
        { opacity:1, y:0, duration:.8, delay:.15, ease:'power3.out',
          scrollTrigger: { trigger: contentRef.current, start:'top 85%', toggleActions:'play none none none' }
        }
      )
    })
    return () => ctx.revert()
  }, [isEven])

  return (
    <div style={{ display:'grid', gridTemplateColumns: isEven ? '1fr 1fr' : '1fr 1fr', gap:80, alignItems:'center', padding:'80px 0', borderBottom:'1px solid var(--gris2)' }}>
      {/* Número lado izquierdo o derecho según index */}
      <div ref={numRef} style={{ order: isEven ? 0 : 1, display:'flex', alignItems:'center', justifyContent: isEven ? 'flex-start' : 'flex-end' }}>
        <span style={{ fontFamily:'var(--display)', fontWeight:900, fontSize:'clamp(120px,16vw,200px)', lineHeight:1, color:'transparent', WebkitTextStroke:'1px rgba(0,230,118,.18)', letterSpacing:'-6px', userSelect:'none' }}>
          {num.padStart(2,'0')}
        </span>
      </div>

      {/* Contenido */}
      <div ref={contentRef} style={{ order: isEven ? 1 : 0 }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--verde)', letterSpacing:2, textTransform:'uppercase', marginBottom:16 }}>Paso {num}</div>
        <h3 style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:'clamp(28px,3.5vw,48px)', lineHeight:.95, textTransform:'uppercase', marginBottom:20 }}>{title}</h3>
        <p style={{ fontSize:15, color:'var(--gris)', lineHeight:1.8, maxWidth:440, marginBottom:20 }}>{desc}</p>
        <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--verde)', background:'var(--verde-dim)', border:'1px solid rgba(0,230,118,.15)', padding:'4px 14px', borderRadius:100, display:'inline-block' }}>{tag}</span>
      </div>
    </div>
  )
}

export default function Flujo({ data }) {
  const [ref, inView] = useInView()

  return (
    <section id="flujo" className="section-pad" style={{ background:'var(--negro2)' }}>
      <div ref={ref}>
        <div style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(20px)', transition:'opacity .6s, transform .6s', marginBottom:80 }}>
          <div className="section-tag">{data.tag}</div>
          <h2 className="display-lg">
            {data.title}<br/><span className="green">{data.titleGreen}</span>
          </h2>
        </div>

        {data.steps.map((step, i) => (
          <FlowStep key={i} {...step} num={String(i+1)} index={i} />
        ))}
      </div>
    </section>
  )
}
