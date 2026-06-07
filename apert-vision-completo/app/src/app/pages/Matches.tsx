import { useState } from "react"
import { useNavigate } from "react-router"
import { Plus, Calendar, Trophy, ChevronRight, Trash2, FolderOpen, ClipboardList } from "lucide-react"
import { useAnalysis } from "../context/AnalysisContext"

interface Match {
  id: number; rival: string; date: string; result: "W" | "L" | "D"; score: string
  competition: string; analyzed: boolean
  lineouts?: number; scrums?: number; kickoffs?: number; total_events?: number
  clips?: Record<string, string>; output_path?: string; events?: any[]
}

function loadMatches(): Match[] {
  return JSON.parse(localStorage.getItem("analyzed_matches") || "[]")
}
function saveMatches(matches: Match[]) {
  localStorage.setItem("analyzed_matches", JSON.stringify(matches))
}

const resultStyle = (r: string) => {
  if (r === "W") return { bg: "rgba(57,224,122,0.12)", color: "#39e07a" }
  if (r === "L") return { bg: "rgba(239,68,68,0.12)",  color: "#ef4444" }
  return              { bg: "rgba(107,122,153,0.15)",  color: "#6b7a99" }
}

const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--secondary)", border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "var(--foreground)", outline: "none",
}

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>(loadMatches)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ rival: "", date: "", score: "", competition: "Super Rugby Doméstico", result: "W" })
  const [filter, setFilter] = useState<"all" | "W" | "L" | "D" | "analyzed">("all")
  const navigate = useNavigate()
  const { clearAnalysis, setVideoPath } = useAnalysis()

  const wins   = matches.filter(m => m.result === "W").length
  const losses = matches.filter(m => m.result === "L").length
  const draws  = matches.filter(m => m.result === "D").length

  const filtered = matches.filter(m => {
    if (filter === "all") return true
    if (filter === "analyzed") return m.analyzed
    return m.result === filter
  })

  const handleAdd = () => {
    if (!form.rival || !form.date) return
    const m: Match = {
      id: Date.now(), rival: form.rival, date: form.date,
      result: form.result as "W"|"L"|"D", score: form.score,
      competition: form.competition, analyzed: false,
    }
    const updated = [m, ...matches]
    setMatches(updated); saveMatches(updated)
    setForm({ rival: "", date: "", score: "", competition: "Super Rugby Doméstico", result: "W" })
    setShowAdd(false)
  }

  const handleDelete = (id: number) => {
    const updated = matches.filter(m => m.id !== id)
    setMatches(updated); saveMatches(updated)
  }

  const openClip = (path: string) => {
    if (window.apertAPI) window.apertAPI.openExternal(path)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center px-6 py-3 border-b shrink-0" style={{ backgroundColor: "var(--background)", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          <span>Apert Vision</span><span style={{ opacity: 0.4 }}>›</span>
          <span style={{ color: "var(--foreground)", fontWeight: 500 }}>Partidos</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)" }}>Partidos</h1>
            <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              Temporada 2026 · {wins}V {draws}E {losses}D
            </p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer" }}>
            <Plus size={15} /> Registrar partido
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: "Victorias", value: wins,   color: "#39e07a" },
            { label: "Derrotas",  value: losses, color: "#ef4444" },
            { label: "Empates",   value: draws,  color: "#6b7a99" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border p-4 flex items-center gap-4" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                <Trophy size={20} style={{ color }} />
              </div>
              <div>
                <div className="font-mono" style={{ fontSize: 24, fontWeight: 600, color: "var(--foreground)" }}>{value}</div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="rounded-xl border p-4 mb-4 grid grid-cols-5 gap-3" style={{ backgroundColor: "var(--card)", borderColor: "var(--primary)", borderWidth: 1 }}>
            <input className="col-span-2" style={inputStyle} placeholder="Club rival *" value={form.rival} onChange={e => setForm(f => ({ ...f, rival: e.target.value }))} />
            <input style={inputStyle} placeholder="Fecha (DD/MM/AAAA) *" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <input style={inputStyle} placeholder="Marcador (Ej: 34-21)" value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} />
            <select style={inputStyle} value={form.result} onChange={e => setForm(f => ({ ...f, result: e.target.value }))}>
              <option value="W">Victoria</option>
              <option value="L">Derrota</option>
              <option value="D">Empate</option>
            </select>
            <input className="col-span-2" style={inputStyle} placeholder="Competición" value={form.competition} onChange={e => setForm(f => ({ ...f, competition: e.target.value }))} />
            <div className="col-span-3 flex gap-2 justify-end items-center">
              <button onClick={() => setShowAdd(false)} style={{ fontSize: 13, color: "var(--muted-foreground)", padding: "6px 12px", background: "none", border: "none", cursor: "pointer" }}>Cancelar</button>
              <button onClick={handleAdd} style={{ ...inputStyle, padding: "6px 16px", backgroundColor: "var(--primary)", color: "var(--primary-foreground)", fontWeight: 500, cursor: "pointer" }}>Guardar</button>
            </div>
          </div>
        )}

        {/* Filters */}
        {matches.length > 0 && (
          <div className="flex gap-2 mb-4">
            {[["all","Todos"],["W","Victorias"],["L","Derrotas"],["D","Empates"],["analyzed","Analizados"]].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val as any)} style={{
                fontSize: 12, padding: "5px 14px", borderRadius: 20, cursor: "pointer", border: "1px solid",
                backgroundColor: filter === val ? "var(--primary)" : "var(--card)",
                color: filter === val ? "var(--primary-foreground)" : "var(--muted-foreground)",
                borderColor: filter === val ? "var(--primary)" : "rgba(255,255,255,0.07)",
              }}>{label}</button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {matches.length === 0 && (
          <div className="rounded-xl border p-12 text-center" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
            <ClipboardList size={40} style={{ color: "var(--muted-foreground)", opacity: 0.4, margin: "0 auto 16px" }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>No hay partidos registrados</p>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 20 }}>
              Los partidos analizados aparecen acá automáticamente.<br />También podés registrar partidos manualmente.
            </p>
            <button onClick={() => setShowAdd(true)} style={{ padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, backgroundColor: "var(--primary)", color: "var(--primary-foreground)", border: "none", cursor: "pointer" }}>
              Registrar primer partido
            </button>
          </div>
        )}

        {/* Match list */}
        <div className="space-y-2">
          {filtered.map(m => {
            const rs = resultStyle(m.result)
            const hasClips = m.clips && Object.keys(m.clips).length > 0
            return (
              <div key={m.id} className="rounded-xl border" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-mono"
                    style={{ backgroundColor: rs.bg, color: rs.color, fontWeight: 700, fontSize: 14 }}>
                    {m.result}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontWeight: 500, fontSize: 14, color: "var(--foreground)" }}>
                      Los Pumas RC vs. {m.rival}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <div className="flex items-center gap-1" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                        <Calendar size={10} /> {m.date}
                      </div>
                      <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>· {m.competition}</span>
                      {m.analyzed && (
                        <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                          · {m.lineouts ?? 0} line-outs · {m.total_events ?? 0} eventos
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="font-mono" style={{ fontWeight: 600, fontSize: 15, color: "var(--foreground)", minWidth: 60, textAlign: "center" }}>
                    {m.score || "—"}
                  </div>
                  <div className="px-2.5 py-1 rounded-lg font-mono shrink-0"
                    style={{ fontSize: 11, backgroundColor: m.analyzed ? "rgba(57,224,122,0.1)" : "var(--secondary)", color: m.analyzed ? "#39e07a" : "var(--muted-foreground)" }}>
                    {m.analyzed ? "ANALIZADO" : "SIN ANÁLISIS"}
                  </div>
                  {!m.analyzed && (
                    <button
                      onClick={() => navigate("/analysis")}
                      className="flex items-center gap-1 shrink-0"
                      style={{ fontSize: 12, color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}
                    >
                      Analizar <ChevronRight size={12} />
                    </button>
                  )}
                  {m.analyzed && (
                    <button onClick={() => navigate("/analysis")} className="flex items-center gap-1 shrink-0"
                      style={{ fontSize: 12, color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}>
                      Ver <ChevronRight size={12} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded shrink-0"
                    style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <Trash2 size={13} style={{ color: "var(--muted-foreground)" }} />
                  </button>
                </div>
                {/* Clips */}
                {m.analyzed && hasClips && (
                  <div className="flex gap-2 px-4 pb-3 border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)", marginRight: 4, lineHeight: "22px" }}>Clips:</span>
                    {[
                      { key: "lineout", label: "Line-outs", color: "#39e07a" },
                      { key: "scrum",   label: "Scrums",    color: "#3b82f6" },
                      { key: "kickoff", label: "Salidas",   color: "#f59e0b" },
                    ].map(({ key, label, color }) => {
                      const path = m.clips?.[key]
                      if (!path) return null
                      return (
                        <button key={key} onClick={() => openClip(path)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                          style={{ backgroundColor: `${color}12`, color, fontSize: 11, fontWeight: 500, border: `1px solid ${color}30`, cursor: "pointer" }}>
                          <FolderOpen size={11} /> {label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
