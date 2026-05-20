import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import canchaImg from '../assets/cancha.png'

function HeroMockup() {
  return (
    <div style={{ background:'rgba(4,5,6,.85)', border:'1px solid rgba(0,230,118,.15)', borderRadius:16, overflow:'hidden', boxShadow:'0 40px 80px rgba(0,0,0,.8), 0 0 0 1px rgba(0,230,118,.07)', backdropFilter:'blur(12px)' }}>
      <div style={{ background:'rgba(10,13,10,.9)', padding:'11px 16px', display:'flex', alignItems:'center', gap:8, borderBottom:'1px solid rgba(0,230,118,.1)' }}>
        {['#ff5f57','#febc2e','#28c840'].map((c,i)=>(
          <div key={i} style={{ width:10, height:10, borderRadius:'50%', background:c, opacity:.8 }}/>
        ))}
        <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'rgba(240,244,240,.5)', marginLeft:8 }}>Apert Vision — partido.mp4</span>
      </div>
      <div style={{ padding:18 }}>
        <div style={{ background:'rgba(0,0,0,.6)', borderRadius:8, aspectRatio:'16/9', position:'relative', overflow:'hidden', marginBottom:14, border:'1px solid rgba(0,230,118,.1)' }}>
          <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,rgba(14,31,14,.9),rgba(6,15,6,.95),rgba(14,31,14,.9))' }}>
            <div style={{ position:'absolute', inset:'12%', border:'1px solid rgba(255,255,255,.05)', borderRadius:2 }}/>
            <div style={{ position:'absolute', left:'50%', top:0, bottom:0, width:1, background:'rgba(255,255,255,.04)' }}/>
            <div style={{ position:'absolute', top:'28%', left:'18%', width:'44%', height:'32%', border:'2px solid var(--verde)', borderRadius:3, animation:'blink 2s infinite' }}>
              <div style={{ position:'absolute', top:-20, left:0, background:'var(--verde)', color:'var(--negro)', fontFamily:'var(--mono)', fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:2 }}>Line-Out 96%</div>
            </div>
            <div style={{ position:'absolute', bottom:8, left:10, fontFamily:'var(--mono)', fontSize:11, color:'rgba(255,255,255,.7)', background:'rgba(0,0,0,.5)', padding:'2px 7px', borderRadius:3 }}>00:18</div>
            <div style={{ position:'absolute', top:8, right:10, background:'rgba(0,0,0,.6)', border:'1px solid rgba(0,230,118,.3)', borderRadius:4, padding:'3px 10px', fontFamily:'var(--mono)', fontSize:10, color:'var(--verde)' }}>● PROCESANDO</div>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:12 }}>
          {[['7','Line-Outs'],['4','Scrums'],['3','Salidas']].map(([val,lbl])=>(
            <div key={lbl} style={{ background:'rgba(10,13,10,.9)', border:'1px solid rgba(0,230,118,.1)', borderRadius:8, padding:'10px 8px', textAlign:'center' }}>
              <div style={{ fontFamily:'var(--display)', fontWeight:900, fontSize:26, color:'var(--verde)' }}>{val}</div>
              <div style={{ fontSize:10, color:'rgba(240,244,240,.5)', textTransform:'uppercase', letterSpacing:.5, marginTop:2 }}>{lbl}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'rgba(240,244,240,.4)', marginBottom:6, display:'flex', justifyContent:'space-between' }}>
          <span>Local — 62%</span><span>38% — Visitante</span>
        </div>
        <div style={{ height:5, background:'rgba(26,34,24,.8)', borderRadius:3, overflow:'hidden' }}>
          <div style={{ height:'100%', width:'62%', background:'linear-gradient(90deg,var(--verde),var(--verde2))', borderRadius:3 }}/>
        </div>
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
    </div>
  )
}

export default function HeroVersionA({ data }) {
  const tagRef    = useRef(null)
  const titleRef  = useRef(null)
  const subRef    = useRef(null)
  const actRef    = useRef(null)
  const statsRef  = useRef(null)
  const visualRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline({ defaults:{ ease:'power3.out' } })
    tl.fromTo(tagRef.current,   { opacity:0, y:20 }, { opacity:1, y:0, duration:.6 })
      .fromTo(titleRef.current, { opacity:0, y:44 }, { opacity:1, y:0, duration:.9 }, '-=.3')
      .fromTo(subRef.current,   { opacity:0, y:24 }, { opacity:1, y:0, duration:.6 }, '-=.5')
      .fromTo(actRef.current,   { opacity:0, y:20 }, { opacity:1, y:0, duration:.5 }, '-=.4')
      .fromTo(statsRef.current, { opacity:0, y:16 }, { opacity:1, y:0, duration:.5 }, '-=.3')
      .fromTo(visualRef.current,{ opacity:0, x:44 }, { opacity:1, x:0, duration:.9 }, '-=.8')
  }, [])

  return (
    <section id="hero" style={{ minHeight:'100vh', display:'flex', alignItems:'center', position:'relative', overflow:'hidden', padding:'140px 72px 100px' }}>

      {/* ── FONDO: CANCHA DE RUGBY ── */}
      <div style={{
        position:'absolute', inset:0, zIndex:0,
        backgroundImage: `url(${canchaImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: 'saturate(0.6) brightness(0.22)',
        transform: 'scale(1.05)',
      }}/>

      {/* ── OVERLAY GRADIENTE ── */}
      <div style={{
        position:'absolute', inset:0, zIndex:1,
        background: 'linear-gradient(135deg, rgba(4,5,6,.92) 0%, rgba(4,5,6,.75) 40%, rgba(4,5,6,.88) 100%)',
      }}/>

      {/* ── OVERLAY VERDE SUTIL ── */}
      <div style={{
        position:'absolute', inset:0, zIndex:1,
        background: 'radial-gradient(ellipse 70% 70% at 25% 50%, rgba(0,230,118,.06) 0%, transparent 70%)',
      }}/>

      {/* ── LÍNEAS DE CANCHA como decoración ── */}
      <div style={{
        position:'absolute', inset:0, zIndex:1,
        backgroundImage: `url(${canchaImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.04,
        mixBlendMode: 'screen',
      }}/>

      {/* ── CONTENIDO ── */}
      <div style={{ position:'relative', zIndex:2, maxWidth:640 }}>

        {/* Tag */}
        <div ref={tagRef} style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(0,230,118,.08)', border:'1px solid rgba(0,230,118,.2)', color:'var(--verde)', padding:'6px 18px', borderRadius:100, fontSize:11, fontWeight:600, letterSpacing:2, textTransform:'uppercase', marginBottom:32, opacity:0, fontFamily:'var(--mono)' }}>
          <span style={{ width:6, height:6, background:'var(--verde)', borderRadius:'50%', animation:'pulse 2s infinite' }}/>
          {data.tag}
        </div>

        {/* Título */}
        <div ref={titleRef} style={{ opacity:0 }}>
          <h1 className="display-xl" style={{ marginBottom:4, textShadow:'0 4px 40px rgba(0,0,0,.8)' }}>{data.title}</h1>
          <h1 className="display-xl green" style={{ marginBottom:0, textShadow:'0 4px 40px rgba(0,230,118,.3)' }}>{data.titleGreen}</h1>
        </div>

        {/* Línea */}
        <div style={{ width:60, height:3, background:'var(--verde)', borderRadius:2, margin:'24px 0', boxShadow:'0 0 12px rgba(0,230,118,.5)' }}/>

        <p ref={subRef} style={{ fontSize:18, color:'rgba(240,244,240,.8)', maxWidth:460, lineHeight:1.75, marginBottom:42, opacity:0, textShadow:'0 2px 20px rgba(0,0,0,.6)' }}>
          {data.subtitle}
        </p>

        {/* CTAs */}
        <div ref={actRef} style={{ display:'flex', gap:14, flexWrap:'wrap', opacity:0 }}>
          <a href="#descarga" className="btn btn-solid" style={{ boxShadow:'0 0 20px rgba(0,230,118,.3)' }}>⬇ {data.ctaPrimary}</a>
          <a href="#flujo" className="btn btn-outline" style={{ backdropFilter:'blur(8px)', background:'rgba(255,255,255,.05)' }}>{data.ctaSecondary} →</a>
        </div>

        {/* Stats */}
        <div ref={statsRef} style={{ display:'flex', gap:0, marginTop:60, opacity:0 }}>
          {data.stats.map((s,i) => (
            <div key={i} style={{ paddingRight:44, borderRight: i < data.stats.length-1 ? '1px solid rgba(0,230,118,.15)' : 'none', marginRight: i < data.stats.length-1 ? 44 : 0 }}>
              <div className="display-md green" style={{ fontSize:'clamp(40px,5vw,56px)', textShadow:'0 0 20px rgba(0,230,118,.4)' }}>{s.val}</div>
              <div style={{ fontSize:12, color:'rgba(240,244,240,.5)', letterSpacing:1, textTransform:'uppercase', marginTop:4, fontFamily:'var(--mono)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mockup */}
      <div ref={visualRef} className="hero-visual" style={{ position:'absolute', right:72, top:'50%', transform:'translateY(-50%)', width:470, opacity:0, zIndex:2 }}>
        <HeroMockup/>
      </div>

      {/* Scroll indicator */}
      <div style={{ position:'absolute', bottom:40, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:8, opacity:.4, zIndex:2 }}>
        <span style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'var(--gris)' }}>scroll</span>
        <div style={{ width:1, height:48, background:'linear-gradient(to bottom,var(--verde),transparent)' }}/>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}`}</style>
    </section>
  )
}
