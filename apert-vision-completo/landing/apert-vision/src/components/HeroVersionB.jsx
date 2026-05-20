import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import canchaImg from '../assets/cancha.png'

export function GlobalBgB() {
  return (
    <style>{`
      body {
        cursor: none;
        background-color: var(--negro);
        background-image: url(${canchaImg});
        background-size: 900px auto;
        background-repeat: repeat;
        background-attachment: fixed;
        background-position: center;
        position: relative;
      }
      body::before {
        content: '';
        position: fixed;
        inset: 0;
        background: rgba(4,5,6,.93);
        pointer-events: none;
        z-index: 0;
      }
      body > #root { position: relative; z-index: 1; }
      * { cursor: none !important; }
    `}</style>
  )
}

// ── Cancha de rugby SVG dentro del mockup ───────────
function CancharSVG() {
  return (
    <svg viewBox="0 0 400 230" xmlns="http://www.w3.org/2000/svg"
      style={{ width:'100%', height:'100%', position:'absolute', inset:0 }}>
      {/* Fondo */}
      <rect width="400" height="230" fill="#061a06"/>

      {/* Franjas alternadas de césped */}
      {[0,1,2,3,4,5,6].map(i => (
        <rect key={i} x={i*57} y="0" width="57" height="230"
          fill={i%2===0 ? '#071e07' : '#082208'} opacity=".6"/>
      ))}

      {/* Borde exterior */}
      <rect x="10" y="10" width="380" height="210" fill="none"
        stroke="rgba(255,255,255,.35)" strokeWidth="1.5"/>

      {/* In-goal areas */}
      <rect x="10" y="10" width="46" height="210" fill="none"
        stroke="rgba(255,255,255,.25)" strokeWidth="1"/>
      <rect x="344" y="10" width="46" height="210" fill="none"
        stroke="rgba(255,255,255,.25)" strokeWidth="1"/>

      {/* Línea central */}
      <line x1="200" y1="10" x2="200" y2="220"
        stroke="rgba(255,255,255,.3)" strokeWidth="1.5"/>

      {/* Líneas de 22m */}
      <line x1="110" y1="10" x2="110" y2="220"
        stroke="rgba(255,255,255,.2)" strokeWidth="1"/>
      <line x1="290" y1="10" x2="290" y2="220"
        stroke="rgba(255,255,255,.2)" strokeWidth="1"/>

      {/* Líneas de 10m */}
      <line x1="155" y1="10" x2="155" y2="220"
        stroke="rgba(255,255,255,.12)" strokeWidth=".8" strokeDasharray="4 4"/>
      <line x1="245" y1="10" x2="245" y2="220"
        stroke="rgba(255,255,255,.12)" strokeWidth=".8" strokeDasharray="4 4"/>

      {/* Líneas de 5m */}
      <line x1="56" y1="10" x2="56" y2="220"
        stroke="rgba(255,255,255,.1)" strokeWidth=".6" strokeDasharray="3 6"/>
      <line x1="344" y1="10" x2="344" y2="220"
        stroke="rgba(255,255,255,.1)" strokeWidth=".6" strokeDasharray="3 6"/>

      {/* Líneas horizontales de line-out */}
      {[55,115,175].map(y => (
        <line key={y} x1="56" y1={y} x2="344" y2={y}
          stroke="rgba(255,255,255,.12)" strokeWidth=".7" strokeDasharray="5 8"/>
      ))}

      {/* Postes izquierda */}
      <line x1="56" y1="90" x2="56" y2="10"
        stroke="rgba(255,255,255,.5)" strokeWidth="1.5"/>
      <line x1="46" y1="90" x2="66" y2="90"
        stroke="rgba(255,255,255,.5)" strokeWidth="1.5"/>
      <line x1="46" y1="90" x2="46" y2="80"
        stroke="rgba(255,255,255,.4)" strokeWidth="1"/>
      <line x1="66" y1="90" x2="66" y2="80"
        stroke="rgba(255,255,255,.4)" strokeWidth="1"/>

      {/* Postes derecha */}
      <line x1="344" y1="90" x2="344" y2="10"
        stroke="rgba(255,255,255,.5)" strokeWidth="1.5"/>
      <line x1="334" y1="90" x2="354" y2="90"
        stroke="rgba(255,255,255,.5)" strokeWidth="1.5"/>
      <line x1="334" y1="90" x2="334" y2="80"
        stroke="rgba(255,255,255,.4)" strokeWidth="1"/>
      <line x1="354" y1="90" x2="354" y2="80"
        stroke="rgba(255,255,255,.4)" strokeWidth="1"/>

      {/* Círculo central */}
      <circle cx="200" cy="115" r="18"
        fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="1"/>

      {/* Bounding box animado — Line-out */}
      <rect x="130" y="60" width="90" height="60" rx="3"
        fill="none" stroke="#00e676" strokeWidth="1.5"
        style={{ animation:'bboxBlink 2s infinite' }}/>

      {/* Etiqueta del bbox */}
      <rect x="130" y="44" width="72" height="16" rx="3" fill="#00e676"/>
      <text x="166" y="55" textAnchor="middle"
        fill="#040506" fontSize="8" fontFamily="monospace" fontWeight="700">
        Line-Out 96%
      </text>

      {/* Jugadores (puntos) */}
      {[
        [145,75],[155,90],[165,105],[145,105],
        [230,75],[240,90],[250,105]
      ].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="4"
          fill={i < 4 ? 'rgba(255,255,255,.6)' : 'rgba(0,230,118,.7)'}/>
      ))}

      {/* Pelota */}
      <ellipse cx="200" cy="88" rx="6" ry="4"
        fill="#f5f5dc" stroke="rgba(0,0,0,.4)" strokeWidth=".5"/>

      {/* Tiempo */}
      <rect x="12" y="206" width="36" height="12" rx="3"
        fill="rgba(0,0,0,.5)"/>
      <text x="30" y="215" textAnchor="middle"
        fill="rgba(255,255,255,.7)" fontSize="7" fontFamily="monospace">
        00:18
      </text>

      {/* Badge procesando */}
      <rect x="300" y="14" width="78" height="16" rx="8"
        fill="rgba(0,0,0,.6)" stroke="rgba(0,230,118,.3)" strokeWidth=".8"/>
      <circle cx="312" cy="22" r="3" fill="#00e676"
        style={{ animation:'pulseDot 1.5s infinite' }}/>
      <text x="350" y="26" textAnchor="middle"
        fill="#00e676" fontSize="7" fontFamily="monospace" fontWeight="600">
        PROCESANDO
      </text>

      <style>{`
        @keyframes bboxBlink { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes pulseDot  { 0%,100%{opacity:1} 50%{opacity:.2} }
      `}</style>
    </svg>
  )
}

function HeroMockup() {
  return (
    <div style={{ background:'rgba(4,5,6,.9)', border:'1px solid rgba(0,230,118,.15)', borderRadius:16, overflow:'hidden', boxShadow:'0 40px 80px rgba(0,0,0,.8), 0 0 0 1px rgba(0,230,118,.07)', backdropFilter:'blur(12px)' }}>
      {/* Barra de título */}
      <div style={{ background:'rgba(8,12,8,.95)', padding:'11px 16px', display:'flex', alignItems:'center', gap:8, borderBottom:'1px solid rgba(0,230,118,.1)' }}>
        {['#ff5f57','#febc2e','#28c840'].map((c,i) => (
          <div key={i} style={{ width:10, height:10, borderRadius:'50%', background:c, opacity:.8 }}/>
        ))}
        <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'rgba(240,244,240,.5)', marginLeft:8 }}>
          Apert Vision — partido.mp4
        </span>
      </div>

      <div style={{ padding:18 }}>
        {/* Video con cancha SVG */}
        <div style={{ borderRadius:8, aspectRatio:'16/9', position:'relative', overflow:'hidden', marginBottom:14, border:'1px solid rgba(0,230,118,.12)' }}>
          <CancharSVG />
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:12 }}>
          {[['7','Line-Outs'],['4','Scrums'],['3','Salidas']].map(([val,lbl]) => (
            <div key={lbl} style={{ background:'rgba(8,12,8,.9)', border:'1px solid rgba(0,230,118,.1)', borderRadius:8, padding:'10px 8px', textAlign:'center' }}>
              <div style={{ fontFamily:'var(--display)', fontWeight:900, fontSize:26, color:'var(--verde)' }}>{val}</div>
              <div style={{ fontSize:10, color:'rgba(240,244,240,.45)', textTransform:'uppercase', letterSpacing:.5, marginTop:2 }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Posesión */}
        <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'rgba(240,244,240,.4)', marginBottom:6, display:'flex', justifyContent:'space-between' }}>
          <span>Local — 62%</span><span>38% — Visitante</span>
        </div>
        <div style={{ height:5, background:'rgba(26,34,24,.8)', borderRadius:3, overflow:'hidden' }}>
          <div style={{ height:'100%', width:'62%', background:'linear-gradient(90deg,var(--verde),var(--verde2))', borderRadius:3 }}/>
        </div>
      </div>
    </div>
  )
}

export default function HeroVersionB({ data }) {
  const tagRef    = useRef(null)
  const titleRef  = useRef(null)
  const subRef    = useRef(null)
  const actRef    = useRef(null)
  const statsRef  = useRef(null)
  const visualRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline({ defaults:{ ease:'power3.out' } })
    tl.fromTo(tagRef.current,    { opacity:0, y:20 }, { opacity:1, y:0, duration:.6 })
      .fromTo(titleRef.current,  { opacity:0, y:44 }, { opacity:1, y:0, duration:.9 }, '-=.3')
      .fromTo(subRef.current,    { opacity:0, y:24 }, { opacity:1, y:0, duration:.6 }, '-=.5')
      .fromTo(actRef.current,    { opacity:0, y:20 }, { opacity:1, y:0, duration:.5 }, '-=.4')
      .fromTo(statsRef.current,  { opacity:0, y:16 }, { opacity:1, y:0, duration:.5 }, '-=.3')
      .fromTo(visualRef.current, { opacity:0, x:44 }, { opacity:1, x:0, duration:.9 }, '-=.8')
  }, [])

  return (
    <section id="hero" style={{ minHeight:'100vh', display:'flex', alignItems:'center', position:'relative', overflow:'hidden', padding:'140px 72px 100px' }}>
      {/* Glows */}
      <div style={{ position:'absolute', width:800, height:800, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,230,118,.07) 0%,transparent 70%)', top:-150, right:-100, pointerEvents:'none', zIndex:0 }}/>
      <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,200,83,.05) 0%,transparent 70%)', bottom:-50, left:'5%', pointerEvents:'none', zIndex:0 }}/>

      {/* Contenido */}
      <div style={{ position:'relative', zIndex:2, maxWidth:640 }}>
        {/* Tag */}
        <div ref={tagRef} style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--verde-dim)', border:'1px solid rgba(0,230,118,.18)', color:'var(--verde)', padding:'6px 18px', borderRadius:100, fontSize:11, fontWeight:600, letterSpacing:2, textTransform:'uppercase', marginBottom:32, opacity:0, fontFamily:'var(--mono)' }}>
          <span style={{ width:6, height:6, background:'var(--verde)', borderRadius:'50%', animation:'pulse 2s infinite' }}/>
          {data.tag}
        </div>

        {/* Título */}
        <div ref={titleRef} style={{ opacity:0 }}>
          <h1 className="display-xl" style={{ marginBottom:4 }}>{data.title}</h1>
          <h1 className="display-xl green">{data.titleGreen}</h1>
        </div>

        <div style={{ width:60, height:3, background:'var(--verde)', borderRadius:2, margin:'24px 0' }}/>

        <p ref={subRef} style={{ fontSize:18, color:'var(--gris)', maxWidth:460, lineHeight:1.75, marginBottom:42, opacity:0 }}>
          {data.subtitle}
        </p>

        {/* CTAs */}
        <div ref={actRef} style={{ display:'flex', gap:14, flexWrap:'wrap', opacity:0 }}>
          <a href="#descarga" className="btn btn-solid">⬇ {data.ctaPrimary}</a>
          <a href="#flujo"    className="btn btn-outline">{data.ctaSecondary} →</a>
        </div>

        {/* Stats */}
        <div ref={statsRef} style={{ display:'flex', gap:0, marginTop:60, opacity:0, flexWrap:'wrap' }}>
          {data.stats.map((s, i) => (
            <div key={i} style={{ paddingRight:44, borderRight: i < data.stats.length-1 ? '1px solid var(--gris2)' : 'none', marginRight: i < data.stats.length-1 ? 44 : 0, marginBottom:16 }}>
              <div className="display-md green" style={{ fontSize:'clamp(40px,5vw,56px)' }}>{s.val}</div>
              <div style={{ fontSize:12, color:'var(--gris)', letterSpacing:1, textTransform:'uppercase', marginTop:4, fontFamily:'var(--mono)' }}>{s.label}</div>
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
