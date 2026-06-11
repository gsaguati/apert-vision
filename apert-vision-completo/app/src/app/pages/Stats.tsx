import { useEffect, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell,
} from "recharts"
import { Trophy, Home, Plane } from "lucide-react"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"

interface PartidoStats {
  id: string
  rival: string
  fecha: string
  resultado: "W" | "L" | "D" | null
  es_local: boolean
  lineouts: number
  scrums: number
  kickoffs: number
  total: number
  conf_avg: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border px-3 py-2 space-y-1"
      style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)", fontSize: 12 }}>
      <div style={{ color: "var(--muted-foreground)" }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.fill || p.stroke }}>{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

export default function Stats() {
  const { club } = useAuth()
  const [matches, setMatches] = useState<PartidoStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { (async () => {
    const { data, error } = await supabase
      .from("partidos")
      .select("*, eventos(tipo, confianza)")
      .order("fecha", { ascending: false })

    if (error) console.error(error)

    const processed: PartidoStats[] = (data ?? []).map((m: any) => {
      const eventos = m.eventos ?? []
      const lo = eventos.filter((e: any) => e.tipo === "lineout").length
      const sc = eventos.filter((e: any) => e.tipo === "scrum").length
      const ko = eventos.filter((e: any) => e.tipo === "kickoff").length
      const conf_avg = eventos.length
        ? eventos.reduce((s: number, e: any) => s + (e.confianza ?? 0), 0) / eventos.length
        : 0
      return {
        id: m.id, rival: m.rival, fecha: m.fecha,
        resultado: m.resultado, es_local: m.es_local,
        lineouts: lo, scrums: sc, kickoffs: ko,
        total: eventos.length, conf_avg,
      }
    }).filter(m => m.total > 0)

    setMatches(processed); setLoading(false)
  })() }, [])

  const totalLo = matches.reduce((s, m) => s + m.lineouts, 0)
  const totalSc = matches.reduce((s, m) => s + m.scrums, 0)
  const totalKo = matches.reduce((s, m) => s + m.kickoffs, 0)
  const totalEv = matches.reduce((s, m) => s + m.total, 0)
  const n = matches.length || 1
  const avgConf = matches.reduce((s, m) => s + m.conf_avg, 0) / n * 100

  // Récord local vs visitante
  const local     = matches.filter(m => m.es_local)
  const visitante = matches.filter(m => !m.es_local)
  const localWins = local.filter(m => m.resultado === "W").length
  const visiWins  = visitante.filter(m => m.resultado === "W").length

  // Datos para los gráficos
  const formationsByMatch = matches.slice(0, 5).reverse().map(m => ({
    match: m.rival?.slice(0, 6) || "???",
    lineouts: m.lineouts,
    scrums:   m.scrums,
    salidas:  m.kickoffs,
  }))

  const distribution = [
    { name: "Line-outs", value: totalLo, color: "#39e07a" },
    { name: "Scrums",    value: totalSc, color: "#3b82f6" },
    { name: "Salidas",   value: totalKo, color: "#f59e0b" },
  ].filter(d => d.value > 0)

  const radarData = [
    { stat: "Line-outs/partido", A: Math.min(100, totalLo / n * 8) },
    { stat: "Scrums/partido",    A: Math.min(100, totalSc / n * 15) },
    { stat: "Salidas/partido",   A: Math.min(100, totalKo / n * 15) },
    { stat: "Confianza IA",      A: Math.round(avgConf) },
    { stat: "Eventos/partido",   A: Math.min(100, totalEv / n * 3) },
    { stat: "Partidos jugados",  A: Math.min(100, matches.length * 10) },
  ]

  const kpis = [
    { label: "Total line-outs", value: String(totalLo), sub: `${(totalLo/n).toFixed(1)} por partido`, color: "#39e07a" },
    { label: "Total scrums",    value: String(totalSc), sub: `${(totalSc/n).toFixed(1)} por partido`, color: "#3b82f6" },
    { label: "Total salidas",   value: String(totalKo), sub: `${(totalKo/n).toFixed(1)} por partido`, color: "#f59e0b" },
    { label: "Confianza IA",    value: avgConf > 0 ? `${avgConf.toFixed(1)}%` : "—", sub: "precisión promedio YOLO", color: "#a855f7" },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-6 py-3 border-b shrink-0"
        style={{ backgroundColor: "var(--background)", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          <span>Apert Vision</span><span style={{ opacity: 0.4 }}>›</span>
          <span style={{ color: "var(--foreground)", fontWeight: 500 }}>Estadísticas</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-5">
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)" }}>Estadísticas Globales</h1>
          <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            {loading ? "Cargando..." : `${matches.length} partido${matches.length === 1 ? "" : "s"} analizado${matches.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {!loading && matches.length === 0 && (
          <div className="rounded-xl border p-8 text-center"
            style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
            <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
              Todavía no analizaste ningún partido.<br />Las estadísticas aparecerán acá automáticamente.
            </p>
          </div>
        )}

        {matches.length > 0 && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-4 gap-4">
              {kpis.map(({ label, value, sub, color }) => (
                <div key={label} className="rounded-xl border p-4"
                  style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
                  <div className="font-mono" style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)", marginTop: 2 }}>{label}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Local vs Visitante */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border p-4 flex items-center gap-4"
                style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(57,224,122,0.12)" }}>
                  <Home size={20} style={{ color: "#39e07a" }} />
                </div>
                <div className="flex-1">
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>De local</div>
                  <div className="font-mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)" }}>
                    {local.length} <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 400 }}>partidos</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--primary)" }}>
                    {localWins} victoria{localWins === 1 ? "" : "s"}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border p-4 flex items-center gap-4"
                style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(59,130,246,0.12)" }}>
                  <Plane size={20} style={{ color: "#3b82f6" }} />
                </div>
                <div className="flex-1">
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>De visitante</div>
                  <div className="font-mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)" }}>
                    {visitante.length} <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 400 }}>partidos</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#3b82f6" }}>
                    {visiWins} victoria{visiWins === 1 ? "" : "s"}
                  </div>
                </div>
              </div>
            </div>

            {/* Bar + Pie */}
            <div className="grid grid-cols-3 gap-5">
              <div className="col-span-2 rounded-xl border p-4"
                style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--foreground)", marginBottom: 12 }}>
                  Formaciones por Partido (últimos 5)
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={formationsByMatch} barGap={3} margin={{ left: -25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="match" tick={{ fill: "#6b7a99", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6b7a99", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="lineouts" name="Line-outs" fill="#39e07a" radius={[3,3,0,0]} />
                    <Bar dataKey="scrums"   name="Scrums"    fill="#3b82f6" radius={[3,3,0,0]} />
                    <Bar dataKey="salidas"  name="Salidas"   fill="#f59e0b" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-2">
                  {[["#39e07a","Line-outs"],["#3b82f6","Scrums"],["#f59e0b","Salidas"]].map(([c,l]) => (
                    <div key={l} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c }} />
                      <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border p-4"
                style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--foreground)", marginBottom: 8 }}>
                  Distribución de eventos
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={distribution} cx="50%" cy="50%" innerRadius={55} outerRadius={75} dataKey="value" strokeWidth={0}>
                      {distribution.map(d => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {distribution.map(d => (
                  <div key={d.name} className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{d.name}</span>
                    </div>
                    <span className="font-mono" style={{ fontSize: 12, color: "var(--foreground)", fontWeight: 500 }}>
                      {totalEv > 0 ? `${Math.round(d.value / totalEv * 100)}%` : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar */}
            <div className="rounded-xl border p-4"
              style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--foreground)", marginBottom: 8 }}>
                Perfil de detección — {club?.nombre ?? "Mi Club"}
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="stat" tick={{ fill: "#6b7a99", fontSize: 11 }} />
                  <PolarRadiusAxis tick={{ fill: "#6b7a99", fontSize: 9 }} axisLine={false} />
                  <Radar name={club?.nombre ?? "Mi Club"} dataKey="A" stroke="#39e07a" fill="#39e07a" fillOpacity={0.18} strokeWidth={2} dot />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
