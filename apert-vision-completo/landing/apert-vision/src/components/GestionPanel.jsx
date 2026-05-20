import { useState } from 'react'

// ── Campos del formulario ──────────────────────────────
function Field({ label, value, onChange, textarea }) {
  return (
    <div className="panel-field">
      <label className="panel-label">{label}</label>
      {textarea
        ? <textarea className="panel-textarea" value={value} onChange={e => onChange(e.target.value)} />
        : <input className="panel-input" value={value} onChange={e => onChange(e.target.value)} />
      }
    </div>
  )
}

function ArrayCard({ label, children }) {
  return (
    <div className="panel-array-card">
      <div className="panel-array-badge">{label}</div>
      {children}
    </div>
  )
}

// ── Secciones editables ────────────────────────────────
function HeroEditor({ data, update }) {
  return (
    <>
      <Field label="Tag"              value={data.tag}          onChange={v => update('tag', v)} />
      <Field label="Título"           value={data.title}        onChange={v => update('title', v)} />
      <Field label="Título (verde)"   value={data.titleGreen}   onChange={v => update('titleGreen', v)} />
      <Field label="Subtítulo"        value={data.subtitle}     onChange={v => update('subtitle', v)} textarea />
      <Field label="CTA principal"    value={data.ctaPrimary}   onChange={v => update('ctaPrimary', v)} />
      <Field label="CTA secundario"   value={data.ctaSecondary} onChange={v => update('ctaSecondary', v)} />
      <div className="panel-group-title" style={{ marginTop: 18 }}>Estadísticas</div>
      {data.stats.map((s, i) => (
        <ArrayCard key={i} label={`STAT ${i + 1}`}>
          <Field label="Valor"    value={s.val}   onChange={v => { const a = [...data.stats]; a[i] = { ...a[i], val: v };   update('stats', a) }} />
          <Field label="Etiqueta" value={s.label} onChange={v => { const a = [...data.stats]; a[i] = { ...a[i], label: v }; update('stats', a) }} />
        </ArrayCard>
      ))}
    </>
  )
}

function ProblemaEditor({ data, update }) {
  return (
    <>
      <Field label="Tag"            value={data.tag}          onChange={v => update('tag', v)} />
      <Field label="Título"         value={data.title}        onChange={v => update('title', v)} />
      <Field label="Título (verde)" value={data.titleGreen}   onChange={v => update('titleGreen', v)} />
      <div className="panel-group-title" style={{ marginTop: 18 }}>Cards de problema</div>
      {data.cards.map((c, i) => (
        <ArrayCard key={i} label={`CARD ${i + 1}`}>
          <Field label="Ícono"       value={c.icon}  onChange={v => { const a = [...data.cards]; a[i] = { ...a[i], icon: v };  update('cards', a) }} />
          <Field label="Título"      value={c.title} onChange={v => { const a = [...data.cards]; a[i] = { ...a[i], title: v }; update('cards', a) }} />
          <Field label="Descripción" value={c.desc}  onChange={v => { const a = [...data.cards]; a[i] = { ...a[i], desc: v };  update('cards', a) }} textarea />
        </ArrayCard>
      ))}
      <div className="panel-group-title" style={{ marginTop: 18 }}>Cita</div>
      <Field label="Texto"  value={data.quote.text}   onChange={v => update('quote', { ...data.quote, text: v })} textarea />
      <Field label="Autor"  value={data.quote.author} onChange={v => update('quote', { ...data.quote, author: v })} />
      <Field label="Rol"    value={data.quote.role}   onChange={v => update('quote', { ...data.quote, role: v })} />
    </>
  )
}

function SolucionEditor({ data, update }) {
  return (
    <>
      <Field label="Tag"            value={data.tag}        onChange={v => update('tag', v)} />
      <Field label="Título"         value={data.title}      onChange={v => update('title', v)} />
      <Field label="Título (verde)" value={data.titleGreen} onChange={v => update('titleGreen', v)} />
      <Field label="Subtítulo"      value={data.subtitle}   onChange={v => update('subtitle', v)} textarea />
      <div className="panel-group-title" style={{ marginTop: 18 }}>Métricas</div>
      {data.metricas.map((m, i) => (
        <ArrayCard key={i} label={`MÉTRICA ${i + 1}`}>
          <Field label="Ícono"       value={m.icon} onChange={v => { const a = [...data.metricas]; a[i] = { ...a[i], icon: v }; update('metricas', a) }} />
          <Field label="Nombre"      value={m.name} onChange={v => { const a = [...data.metricas]; a[i] = { ...a[i], name: v }; update('metricas', a) }} />
          <Field label="Descripción" value={m.desc} onChange={v => { const a = [...data.metricas]; a[i] = { ...a[i], desc: v }; update('metricas', a) }} textarea />
        </ArrayCard>
      ))}
      <div className="panel-group-title" style={{ marginTop: 18 }}>Features</div>
      {data.features.map((f, i) => (
        <ArrayCard key={i} label={`FEATURE ${f.num}`}>
          <Field label="Título"      value={f.title} onChange={v => { const a = [...data.features]; a[i] = { ...a[i], title: v }; update('features', a) }} />
          <Field label="Descripción" value={f.desc}  onChange={v => { const a = [...data.features]; a[i] = { ...a[i], desc: v };  update('features', a) }} textarea />
        </ArrayCard>
      ))}
    </>
  )
}

function FlujoEditor({ data, update }) {
  return (
    <>
      <Field label="Tag"            value={data.tag}        onChange={v => update('tag', v)} />
      <Field label="Título"         value={data.title}      onChange={v => update('title', v)} />
      <Field label="Título (verde)" value={data.titleGreen} onChange={v => update('titleGreen', v)} />
      {data.steps.map((s, i) => (
        <ArrayCard key={i} label={`PASO ${s.num}`}>
          <Field label="Título"      value={s.title} onChange={v => { const a = [...data.steps]; a[i] = { ...a[i], title: v }; update('steps', a) }} />
          <Field label="Descripción" value={s.desc}  onChange={v => { const a = [...data.steps]; a[i] = { ...a[i], desc: v };  update('steps', a) }} textarea />
          <Field label="Tag"         value={s.tag}   onChange={v => { const a = [...data.steps]; a[i] = { ...a[i], tag: v };   update('steps', a) }} />
        </ArrayCard>
      ))}
    </>
  )
}

function AudienciaEditor({ data, update }) {
  return (
    <>
      <Field label="Tag"            value={data.tag}        onChange={v => update('tag', v)} />
      <Field label="Título"         value={data.title}      onChange={v => update('title', v)} />
      <Field label="Título (verde)" value={data.titleGreen} onChange={v => update('titleGreen', v)} />
      {data.cards.map((c, i) => (
        <ArrayCard key={i} label={c.title.toUpperCase()}>
          <Field label="Emoji"       value={c.emoji} onChange={v => { const a = [...data.cards]; a[i] = { ...a[i], emoji: v }; update('cards', a) }} />
          <Field label="Título"      value={c.title} onChange={v => { const a = [...data.cards]; a[i] = { ...a[i], title: v }; update('cards', a) }} />
          <Field label="Descripción" value={c.desc}  onChange={v => { const a = [...data.cards]; a[i] = { ...a[i], desc: v };  update('cards', a) }} textarea />
        </ArrayCard>
      ))}
    </>
  )
}

function TecnologiaEditor({ data, update }) {
  return (
    <>
      <Field label="Tag"            value={data.tag}        onChange={v => update('tag', v)} />
      <Field label="Título"         value={data.title}      onChange={v => update('title', v)} />
      <Field label="Título (verde)" value={data.titleGreen} onChange={v => update('titleGreen', v)} />
      <Field label="Subtítulo"      value={data.subtitle}   onChange={v => update('subtitle', v)} textarea />
      {data.items.map((item, i) => (
        <ArrayCard key={i} label={`TECH ${i + 1}`}>
          <Field label="Ícono"  value={item.icon} onChange={v => { const a = [...data.items]; a[i] = { ...a[i], icon: v }; update('items', a) }} />
          <Field label="Nombre" value={item.name} onChange={v => { const a = [...data.items]; a[i] = { ...a[i], name: v }; update('items', a) }} />
          <Field label="Rol"    value={item.role} onChange={v => { const a = [...data.items]; a[i] = { ...a[i], role: v }; update('items', a) }} />
        </ArrayCard>
      ))}
    </>
  )
}

function DescargaEditor({ data, update }) {
  return (
    <>
      <Field label="Tag"            value={data.tag}        onChange={v => update('tag', v)} />
      <Field label="Título"         value={data.title}      onChange={v => update('title', v)} />
      <Field label="Título (verde)" value={data.titleGreen} onChange={v => update('titleGreen', v)} />
      <Field label="Descripción"    value={data.desc}       onChange={v => update('desc', v)} textarea />
      <Field label="Versión"        value={data.version}    onChange={v => update('version', v)} />
      <Field label="Nombre app"     value={data.appName}    onChange={v => update('appName', v)} />
      <Field label="Meta"           value={data.meta}       onChange={v => update('meta', v)} />
      <div className="panel-group-title" style={{ marginTop: 18 }}>Requisitos</div>
      {data.reqs.map((r, i) => (
        <Field key={i} label={`Req ${i + 1}`} value={r} onChange={v => { const a = [...data.reqs]; a[i] = v; update('reqs', a) }} />
      ))}
    </>
  )
}

function FaqEditor({ data, update }) {
  return (
    <>
      <Field label="Tag"            value={data.tag}        onChange={v => update('tag', v)} />
      <Field label="Título"         value={data.title}      onChange={v => update('title', v)} />
      <Field label="Título (verde)" value={data.titleGreen} onChange={v => update('titleGreen', v)} />
      {data.items.map((item, i) => (
        <ArrayCard key={i} label={`PREGUNTA ${i + 1}`}>
          <Field label="Pregunta"  value={item.q} onChange={v => { const a = [...data.items]; a[i] = { ...a[i], q: v }; update('items', a) }} />
          <Field label="Respuesta" value={item.a} onChange={v => { const a = [...data.items]; a[i] = { ...a[i], a: v }; update('items', a) }} textarea />
        </ArrayCard>
      ))}
    </>
  )
}

// ── Tabs de secciones ──────────────────────────────────
const TABS = [
  { key: 'hero',       label: 'Hero' },
  { key: 'problema',   label: 'Problema' },
  { key: 'solucion',   label: 'Solución' },
  { key: 'flujo',      label: 'Flujo' },
  { key: 'audiencia',  label: 'Audiencia' },
  { key: 'tecnologia', label: 'Tech' },
  { key: 'descarga',   label: 'Descarga' },
  { key: 'faq',        label: 'FAQ' },
]

const EDITORS = {
  hero:       HeroEditor,
  problema:   ProblemaEditor,
  solucion:   SolucionEditor,
  flujo:      FlujoEditor,
  audiencia:  AudienciaEditor,
  tecnologia: TecnologiaEditor,
  descarga:   DescargaEditor,
  faq:        FaqEditor,
}

// ── Panel principal ─────────────────────────────────────
export default function GestionPanel({ data, onChange, onClose, onSave }) {
  const [tab, setTab] = useState('hero')
  const [closing, setClosing] = useState(false)

  const handleClose = () => {
    setClosing(true)
    setTimeout(onClose, 280)
  }

  const update = (key, value) => {
    onChange({ ...data, [tab]: { ...data[tab], [key]: value } })
  }

  const Editor = EDITORS[tab]

  return (
    <div className="panel-overlay" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className={`panel-drawer${closing ? ' closing' : ''}`}>
        {/* Header */}
        <div className="panel-header">
          <span className="panel-logo">⚙ GESTIÓN</span>
          <button className="panel-close" onClick={handleClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="panel-tabs">
          {TABS.map(({ key, label }) => (
            <button key={key} className={`panel-tab${tab === key ? ' active' : ''}`} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>

        {/* Contenido editable */}
        <div className="panel-body">
          <div className="panel-group">
            <div className="panel-group-title">Sección: {tab.toUpperCase()}</div>
            <Editor data={data[tab]} update={update} />
          </div>
        </div>

        {/* Footer con botón guardar */}
        <div className="panel-footer">
          <button className="panel-save-btn" onClick={onSave}>
            ✓ Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}
