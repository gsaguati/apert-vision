import { useState } from 'react'

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom:'1px solid var(--gris2)', transition:'border-color .3s' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width:'100%', padding:'24px 0', background:'none', border:'none', color:'var(--blanco)', fontFamily:'var(--display)', fontWeight:700, fontSize:20, textTransform:'uppercase', textAlign:'left', display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, cursor:'pointer', letterSpacing:.5 }}
      >
        {q}
        <div style={{ width:28, height:28, border:`1px solid ${open?'var(--verde)':'var(--gris2)'}`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0, background: open?'var(--verde)':'none', color: open?'var(--negro)':'var(--verde)', transform: open?'rotate(180deg)':'none', transition:'all .3s' }}>▾</div>
      </button>
      <div style={{ maxHeight: open?300:0, overflow:'hidden', transition:'max-height .4s ease', paddingBottom: open?24:0, fontSize:15, color:'var(--gris)', lineHeight:1.8, fontFamily:'var(--body)' }}>
        {a}
      </div>
    </div>
  )
}

export default function Faq({ data }) {
  return (
    <section id="faq" className="section-pad" style={{ background:'var(--negro2)' }}>
      <div className="section-tag">{data.tag}</div>
      <h2 className="display-lg" style={{ marginBottom:64 }}>{data.title}<br/><span className="green">{data.titleGreen}</span></h2>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 80px' }}>
        {data.items.map((item, i) => <FaqItem key={i} {...item}/>)}
      </div>
    </section>
  )
}
