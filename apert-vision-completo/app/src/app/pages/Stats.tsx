import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell,
} from "recharts"

interface Match {
  rival: string; lineouts: number; scrums: number; kickoffs: number
  total_events: number; events?: any[]
}

function loadMatches(): Match[] {
  return JSON.parse(localStorage.getItem("analyzed_matches") || "[]").filter((m: any) => m.analyzed)
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border px-3 py-2 space-y-1" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)", fontSize: 12 }}>
      <div style={{ color: "var(--muted-foreground)" }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.fill || p.stroke }}>{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

export default function Stats() {
  const matches = loadMatches()

  const totalLo  = matches.reduce((s, m) => s + (m.lineouts  || 0), 0)
  const totalSc  = matches.reduce((s, m) => s + (m.scrums    || 0), 0)
  const totalEv  = matches.reduce((s, m) => s + (m.total_events || 0), 0)
  const n        = matches.length || 1
  const avgConf  = matches.length
    ? matches.reduce((s, m) => {
        const evs = m.events || []
        return s + (evs.length ? evs.reduce((a: number, e: any) => a + (e.confidence ?? 0), 0) / evs.length : 0)
      }, 0) / matches.length * 100
    : 0

  const formationsByMatch = matches.slice(0, 5).map(m => ({
    match: m.rival?.slice(0, 3).toUpperCase() || "???",
    lineouts: m.lineouts || 0,
    scrums:   m.scrums   || 0,
    salidas:  m.kickoffs || 0,
  }))

  const possessionPie = [
    { name: "Los Pumas RC", value: 54 },
    { name: "Rivales",      value: 46 },
  ]

  const radarData = [
    { stat: "Line-outs",   A: Math.min(100, totalLo / n * 6) },
    { stat: "Posesión",    A: 54 },
    { stat: "Scrums",      A: Math.min(100, totalSc / n * 12) },
    { stat: "Salidas",     A: 65 },
    { stat: "Presión",     A: 60 },
    { stat: "Continuidad", A: 72 },
  ]

  const kpis = [
    { label: "Total line-outs",   value: String(totalLo), sub: `${(totalLo/n).toFixed(1)} por partido` },
    { label: "Total scrums",      value: String(totalSc), sub: `${(totalSc/n).toFixed(1)} por partido` },
    { label: "Posesión promedio", value: "54%",           sub: "+8% vs rivales" },
    { label: "Confianza IA",      value: avgConf > 0 ? `${avgConf.toFixed(1)}%` : "—", sub: "precisión YOLO" },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-6 py-3 border-b shrink-0" style={{ backgroundColor: "var(--background)", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          <span>Apert Vision</span><span style={{ opacity: 0.4 }}>›</span>
          <span style={{ color: "var(--foreground)", fontWeight: 500 }}>Estadísticas</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-5">
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)" }}>Estadísticas Globales</h1>
          <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            Temporada 2026 · {matches.length} partidos analizados
          </p>
        </div>

        {matches.length === 0 && (
          <div className="rounded-xl border p-8 text-center" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
            <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
              Todavía no analizaste ningún partido.<br />Las estadísticas aparecerán acá automáticamente.
            </p>
          </div>
        )}

        {matches.length > 0 && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-4 gap-4">
              {kpis.map(({ label, value, sub }) => (
                <div key={label} className="rounded-xl border p-4" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
                  <div className="font-mono" style={{ fontSize: 24, fontWeight: 600, color: "var(--foreground)" }}>{value}</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)", marginTop: 2 }}>{label}</div>
                  <div style={{ fontSize: 11, color: "var(--primary)", marginTop: 2 }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Bar + Pie */}
            <div className="grid grid-cols-3 gap-5">
              <div className="col-span-2 rounded-xl border p-4" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--foreground)", marginBottom: 12 }}>Formaciones por Partido</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={formationsByMatch} barGap={3} margin={{ left: -25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="match" tick={{ fill: "#6b7a99", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6b7a99", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="lineouts" name="Line-outs" fill="#39e07a" radius={[3,3,0,0]} />
                    <Bar dataKey="scrums"   name="Scrums"    fill="#3b82f6" radius={[3,3,0,0]} />
                    <Bar dataKey="salidas"  name="Salidas 22" fill="#f59e0b" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-2">
                  {[["#39e07a","Line-outs"],["#3b82f6","Scrums"],["#f59e0b","Salidas 22"]].map(([c,l]) => (
                    <div key={l} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c }} />
                      <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--foreground)", marginBottom: 8 }}>Posesión Promedio</div>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={possessionPie} cx="50%" cy="50%" innerRadius={55} outerRadius={75} dataKey="value" strokeWidth={0}>
                      <Cell fill="#39e07a" />
                      <Cell fill="#1a2540" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {possessionPie.map((entry, i) => (
                  <div key={entry.name} className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: i === 0 ? "#39e07a" : "#1a2540", border: i === 1 ? "1px solid #3b82f6" : "none" }} />
                      <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{entry.name}</span>
                    </div>
                    <span className="font-mono" style={{ fontSize: 12, color: "var(--foreground)", fontWeight: 500 }}>{entry.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar */}
            <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--foreground)", marginBottom: 8 }}>Perfil de Rendimiento del Equipo</div>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="stat" tick={{ fill: "#6b7a99", fontSize: 11 }} />
                  <PolarRadiusAxis tick={{ fill: "#6b7a99", fontSize: 9 }} axisLine={false} />
                  <Radar name="Los Pumas RC" dataKey="A" stroke="#39e07a" fill="#39e07a" fillOpacity={0.18} strokeWidth={2} dot />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
