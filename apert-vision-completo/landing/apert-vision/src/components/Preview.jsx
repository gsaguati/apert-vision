import { useInView } from '../hooks/useInView'

// ── Mockup del Desktop ────────────────────────────────────────────
function DesktopMockup() {
  return (
    <div style={{
      width: '100%', maxWidth: 720,
      background: '#0f1520', borderRadius: 14, overflow: 'hidden',
      border: '1px solid rgba(0,230,118,0.15)',
      boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
    }}>
      {/* Title bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '10px 12px', background: '#080c14',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
        <span style={{ marginLeft: 14, fontSize: 11, color: '#6b7a99' }}>Apert Vision · Desktop</span>
      </div>

      <div style={{ display: 'flex', minHeight: 340 }}>
        {/* Sidebar */}
        <div style={{ width: 150, background: '#0a0f1a', padding: 12, borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: '#39e07a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 11, color: '#080c14' }}>👁</span>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#e8eaf0' }}>Apert Vision</div>
              <div style={{ fontSize: 7, color: '#6b7a99', letterSpacing: 1 }}>RUGBY AI</div>
            </div>
          </div>
          <div style={{
            padding: '6px 8px', borderRadius: 6, marginBottom: 12,
            background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#39e07a' }} />
            <span style={{ fontSize: 9, color: '#aab4c5' }}>Los Pumas RC</span>
          </div>
          {['Dashboard', 'Análisis', 'Partidos', 'Jugadores', 'Estadísticas'].map((item, i) => (
            <div key={item} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px',
              borderRadius: 5, marginBottom: 2,
              background: i === 0 ? 'rgba(57,224,122,0.1)' : 'transparent',
            }}>
              <span style={{ width: 9, height: 9, background: i === 0 ? '#39e07a' : '#3a4456', borderRadius: 2 }} />
              <span style={{ fontSize: 10, color: i === 0 ? '#39e07a' : '#aab4c5' }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: '14px 16px', background: '#080c14' }}>
          <div style={{ fontSize: 10, color: '#6b7a99', marginBottom: 12 }}>Apert Vision › Dashboard</div>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
            {[
              { val: '12', label: 'Partidos', color: '#39e07a' },
              { val: '264', label: 'Line-outs', color: '#3b82f6' },
              { val: '417', label: 'Eventos', color: '#f59e0b' },
              { val: '35', label: 'Promedio', color: '#a855f7' },
            ].map(s => (
              <div key={s.label} style={{ background: '#0f1520', padding: 8, borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: `${s.color}25`, marginBottom: 6 }} />
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace', color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 8, color: '#6b7a99' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Chart placeholder */}
          <div style={{
            background: '#0f1520', padding: 12, borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.04)', height: 130,
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#e8eaf0', marginBottom: 10 }}>Formaciones por Partido</div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: 4 }}>
              {[60, 80, 45, 90, 70].map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: '100%' }}>
                  <div style={{ width: 8, background: '#39e07a', height: `${h}%`, borderRadius: '2px 2px 0 0' }} />
                  <div style={{ width: 8, background: '#3b82f6', height: `${h * 0.6}%`, borderRadius: '2px 2px 0 0' }} />
                  <div style={{ width: 8, background: '#f59e0b', height: `${h * 0.4}%`, borderRadius: '2px 2px 0 0' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Mockup del Mobile ─────────────────────────────────────────────
function MobileMockup() {
  return (
    <div style={{
      width: 240, height: 480,
      background: '#080c14', borderRadius: 32, padding: 8,
      border: '6px solid #1a1f2c',
      boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
      position: 'relative',
    }}>
      {/* Notch */}
      <div style={{
        position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
        width: 80, height: 18, background: '#1a1f2c', borderRadius: '0 0 12px 12px',
      }} />

      <div style={{ height: '100%', borderRadius: 24, overflow: 'hidden', background: '#080c14' }}>
        {/* Status bar */}
        <div style={{
          padding: '24px 14px 8px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
          fontSize: 9, color: '#e8eaf0',
        }}>
          <span style={{ fontWeight: 600 }}>3:42</span>
          <span>● ▲ ▮</span>
        </div>

        {/* App bar */}
        <div style={{ padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e8eaf0' }}>Los Pumas RC</div>
            <div style={{ fontSize: 8, color: '#6b7a99' }}>Hola, Tomás · Jugador</div>
          </div>
          <span style={{ fontSize: 12, color: '#6b7a99' }}>↻ ⎋</span>
        </div>

        <div style={{ padding: 10, fontSize: 8, color: '#6b7a99', marginBottom: 4 }}>3 partidos con clips</div>

        {/* Match cards */}
        {[
          { result: 'V', resColor: '#39e07a', rival: 'Vicentinos', date: '06/06/2026', local: true, lo: 24, sc: 8, ko: 3 },
          { result: 'D', resColor: '#ef4444', rival: 'Daom',      date: '30/05/2026', local: false, lo: 19, sc: 6, ko: 4 },
          { result: 'V', resColor: '#39e07a', rival: 'Areco',     date: '23/05/2026', local: true, lo: 28, sc: 11, ko: 2 },
        ].map((m, i) => (
          <div key={i} style={{
            margin: '0 12px 8px', padding: 10, borderRadius: 10,
            background: '#0f1520', border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: 6,
              background: `${m.resColor}20`, color: m.resColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700,
            }}>{m.result}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 9, color: '#e8eaf0', fontWeight: 600 }}>vs. {m.rival}</span>
                <span style={{
                  fontSize: 6, padding: '1px 4px', borderRadius: 2,
                  background: m.local ? 'rgba(57,224,122,0.12)' : 'rgba(59,130,246,0.12)',
                  color:      m.local ? '#39e07a' : '#3b82f6',
                  fontWeight: 700,
                }}>{m.local ? 'LOCAL' : 'VISITA'}</span>
              </div>
              <div style={{ fontSize: 7, color: '#6b7a99', marginTop: 1 }}>📅 {m.date}</div>
              <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                <span style={{ fontSize: 6, color: '#39e07a' }}>● {m.lo}</span>
                <span style={{ fontSize: 6, color: '#3b82f6' }}>● {m.sc}</span>
                <span style={{ fontSize: 6, color: '#f59e0b' }}>● {m.ko}</span>
              </div>
            </div>
            <span style={{ fontSize: 10, color: '#6b7a99' }}>›</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Sección principal ─────────────────────────────────────────────
export default function Preview() {
  const [ref, inView] = useInView()

  return (
    <section
      id="preview"
      ref={ref}
      className="section-pad"
      style={{ background: 'var(--negro2)', borderTop: '1px solid var(--gris2)', borderBottom: '1px solid var(--gris2)' }}
    >
      <div style={{ maxWidth: 700, marginBottom: 60 }}>
        <div className="section-tag">El producto</div>
        <h2 className="display-lg" style={{
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity .6s, transform .6s',
        }}>
          Cómo<br /><span className="green">se ve</span>
        </h2>
        <p style={{
          marginTop: 18, fontSize: 16, color: 'var(--gris)', lineHeight: 1.7, maxWidth: 540,
          opacity: inView ? 1 : 0, transition: 'opacity .8s .15s',
        }}>
          Dos apps que trabajan en conjunto: el Desktop donde el entrenador analiza,
          el Mobile donde todo el club consume los clips.
        </p>
      </div>

      {/* Mockups */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
        gap: 48, marginTop: 40,
      }}>
        {/* Desktop */}
        <div style={{
          flex: '1 1 600px', maxWidth: 760,
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateX(0)' : 'translateX(-30px)',
          transition: 'opacity .8s .2s, transform .8s .2s',
        }}>
          <DesktopMockup />
          <div style={{
            marginTop: 22, padding: '0 8px',
          }}>
            <div style={{
              fontFamily: 'var(--display)', fontWeight: 800, fontSize: 18,
              color: 'var(--verde)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
            }}>Apert Vision · Desktop</div>
            <div style={{ fontSize: 13, color: 'var(--gris)', lineHeight: 1.6 }}>
              Análisis YOLO local, dashboard de partidos, generación y subida automática
              de clips. Para entrenadores con Windows.
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div style={{
          flex: '0 0 auto',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateX(0)' : 'translateX(30px)',
          transition: 'opacity .8s .35s, transform .8s .35s',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <MobileMockup />
          <div style={{
            marginTop: 22, textAlign: 'center', maxWidth: 280,
          }}>
            <div style={{
              fontFamily: 'var(--display)', fontWeight: 800, fontSize: 18,
              color: 'var(--verde)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
            }}>Apert Vision · Mobile</div>
            <div style={{ fontSize: 13, color: 'var(--gris)', lineHeight: 1.6 }}>
              Android nativo en Kotlin. Lista de partidos, reproductor con clips
              por tipo y acceso para todo el club con código.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
