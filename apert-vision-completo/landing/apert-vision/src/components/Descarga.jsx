import { useState } from 'react'

export default function Descarga({ data }) {
  const [hovWin, setHovWin] = useState(false)
  const [hovApk, setHovApk] = useState(false)

  return (
    <section id="descarga" className="section-pad" style={{ background:'var(--negro)', textAlign:'center' }}>
      <div style={{ maxWidth:720, margin:'0 auto' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--verde-dim)', border:'1px solid rgba(0,230,118,.18)', color:'var(--verde)', padding:'6px 18px', borderRadius:100, fontSize:11, fontWeight:600, letterSpacing:2, textTransform:'uppercase', marginBottom:32, fontFamily:'var(--mono)' }}>
          <span style={{ width:6, height:6, background:'var(--verde)', borderRadius:'50%', animation:'pulse 2s infinite' }}/>
          {data.tag}
        </div>

        <h2 className="display-xl" style={{ marginBottom:8 }}>{data.title}</h2>
        <h2 className="display-xl green" style={{ marginBottom:32 }}>{data.titleGreen}</h2>

        <p style={{ fontSize:17, color:'var(--gris)', lineHeight:1.75, marginBottom:52, maxWidth:560, margin:'0 auto 52px' }}>{data.desc}</p>

        <div style={{ background:'var(--negro3)', border:'1px solid var(--gris2)', borderRadius:20, padding:56, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,var(--verde),transparent)' }}/>

          <div style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--verde)', marginBottom:18, letterSpacing:1 }}>APERT VISION · {data.version}</div>
          <div style={{ fontFamily:'var(--display)', fontWeight:800, fontSize:28, textTransform:'uppercase', marginBottom:8 }}>{data.appName}</div>
          <div style={{ fontSize:13, color:'var(--gris)', marginBottom:36 }}>{data.meta}</div>

          <div style={{ display:'flex', justifyContent:'center', gap:14, flexWrap:'wrap', marginBottom:14 }}>
            <button
              className="btn btn-solid"
              onMouseEnter={() => setHovWin(true)}
              onMouseLeave={() => setHovWin(false)}
              style={{ background: hovWin ? 'var(--verde2)' : 'var(--verde)', transform: hovWin ? 'translateY(-2px)' : 'none', boxShadow: hovWin ? '0 8px 28px var(--verde-glow)' : 'none' }}
            >🪟 Windows 10 / 11</button>
            <button
              className="btn btn-solid"
              onMouseEnter={() => setHovApk(true)}
              onMouseLeave={() => setHovApk(false)}
              style={{ background: hovApk ? 'var(--verde2)' : 'var(--verde)', transform: hovApk ? 'translateY(-2px)' : 'none', boxShadow: hovApk ? '0 8px 28px var(--verde-glow)' : 'none' }}
            >🤖 Descargar APK</button>
          </div>

          <div style={{ display:'flex', justifyContent:'center', gap:14, flexWrap:'wrap', marginBottom:28 }}>
            {['🍎 macOS — Próximamente','🐧 Linux — Próximamente'].map((l,i)=>(
              <button key={i} className="btn" style={{ background:'transparent', color:'var(--gris)', border:'1.5px solid var(--gris2)', cursor:'not-allowed', opacity:.5 }}>{l}</button>
            ))}
          </div>

          <div style={{ fontSize:12, color:'var(--gris)', marginBottom:24 }}>Mobile compatible con Android 8.0 o superior · Desktop requiere Windows 10/11 64-bit.</div>

          <div style={{ display:'flex', justifyContent:'center', gap:24, flexWrap:'wrap', paddingTop:24, borderTop:'1px solid var(--gris2)' }}>
            {data.reqs.map((r,i)=>(
              <div key={i} style={{ fontSize:12, color:'var(--gris)', display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ color:'var(--verde)' }}>✓</span>{r}
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}`}</style>
    </section>
  )
}
