import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { Plus, Calendar, Trophy, ChevronRight, Trash2, FolderOpen, ClipboardList, Home, Plane, RefreshCw } from "lucide-react"
import { supabase, Partido } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"

interface MatchWithStats extends Partido {
  lineouts_count?: number
  scrums_count?: number
  kickoffs_count?: number
  total_events?: number
  clips?: { lineout?: string; scrum?: string; kickoff?: string }
}

const resultStyle = (r: string | null) => {
  if (r === "W") return { bg: "rgba(57,224,122,0.12)", color: "#39e07a" }
  if (r === "L") return { bg: "rgba(239,68,68,0.12)",  color: "#ef4444" }
  if (r === "D") return { bg: "rgba(107,122,153,0.15)",  color: "#6b7a99" }
  return                { bg: "rgba(255,255,255,0.05)",  color: "var(--muted-foreground)" }
}

const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--secondary)", border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "var(--foreground)", outline: "none",
}

export default function Matches() {
  const navigate = useNavigate()
  const { club, miembro } = useAuth()
  const [matches, setMatches] = useState<MatchWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    rival: "", fecha: "", marcador: "", resultado: "W" as "W"|"L"|"D", es_local: true
  })
  const [filter, setFilter] = useState<"all" | "W" | "L" | "D" | "local" | "visitante">("all")
  const [saving, setSaving] = useState(false)

  const loadMatches = async () => {
    setRefreshing(true)
    const { data, error } = await supabase
      .from("partidos")
      .select("*, eventos(tipo), clips(tipo, url_storage)")
      .order("fecha", { ascending: false })

    if (error) console.error(error)

    // Procesar conteos y clips
    const processed: MatchWithStats[] = (data ?? []).map((m: any) => {
      const eventos = m.eventos ?? []
      const clips_raw = m.clips ?? []
      const clipMap: { [k: string]: string } = {}
      for (const c of clips_raw) clipMap[c.tipo] = c.url_storage
      return {
        ...m,
        lineouts_count: eventos.filter((e: any) => e.tipo === "lineout").length,
        scrums_count:   eventos.filter((e: any) => e.tipo === "scrum").length,
        kickoffs_count: eventos.filter((e: any) => e.tipo === "kickoff").length,
        total_events:   eventos.length,
        clips: clipMap,
      }
    })

    setMatches(processed)
    setLoading(false); setRefreshing(false)
  }

  useEffect(() => { loadMatches() }, [])

  const wins   = matches.filter(m => m.resultado === "W").length
  const losses = matches.filter(m => m.resultado === "L").length
  const draws  = matches.filter(m => m.resultado === "D").length

  const filtered = matches.filter(m => {
    if (filter === "all") return true
    if (filter === "local")     return m.es_local
    if (filter === "visitante") return !m.es_local
    return m.resultado === filter
  })

  const handleAdd = async () => {
    if (!form.rival || !form.fecha || !club || !miembro) return
    setSaving(true)
    const { error } = await supabase.from("partidos").insert({
      club_id: club.id,
      creado_por: miembro.id,
      rival: form.rival,
      fecha: form.fecha,
      resultado: form.resultado,
      marcador: form.marcador || null,
      es_local: form.es_local,
    })
    if (error) { alert("Error: " + error.message); setSaving(false); return }
    setForm({ rival: "", fecha: "", marcador: "", resultado: "W", es_local: true })
    setShowAdd(false)
    await loadMatches()
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este partido? Se borran también los eventos y clips.")) return
    const { error } = await supabase.from("partidos").delete().eq("id", id)
    if (error) { alert("Error: " + error.message); return }
    setMatches(m => m.filter(x => x.id !== id))
  }

  const openClip = async (path: string) => {
    // path es algo como "clubId/partidoId/lineout.mp4" en Supabase Storage
    const { data, error } = await supabase.storage.from("clips").createSignedUrl(path, 3600)
    if (error) { alert("Error abriendo clip: " + error.message); return }
    if (window.apertAPI) window.apertAPI.openExternal(data.signedUrl)
    else window.open(data.signedUrl, "_blank")
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
              {loading ? "Cargando..." : `${wins}V ${draws}E ${losses}D`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadMatches} disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ backgroundColor: "var(--card)", border: "1px solid rgba(255,255,255,0.07)",
                fontSize: 12, color: "var(--muted-foreground)", cursor: refreshing ? "not-allowed" : "pointer" }}>
              <RefreshCw size={13} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
            </button>
            <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer" }}>
              <Plus size={15} /> Registrar partido
            </button>
          </div>
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
          <div className="rounded-xl border p-4 mb-4" style={{ backgroundColor: "var(--card)", borderColor: "var(--primary)", borderWidth: 1 }}>
            <div className="grid grid-cols-5 gap-3 mb-3">
              <input className="col-span-2" style={inputStyle} placeholder="Club rival *" value={form.rival}
                onChange={e => setForm(f => ({ ...f, rival: e.target.value }))} />
              <input type="date" style={inputStyle} value={form.fecha}
                onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
              <input style={inputStyle} placeholder="Marcador (34-21)" value={form.marcador}
                onChange={e => setForm(f => ({ ...f, marcador: e.target.value }))} />
              <select style={inputStyle} value={form.resultado}
                onChange={e => setForm(f => ({ ...f, resultado: e.target.value as any }))}>
                <option value="W">Victoria</option>
                <option value="L">Derrota</option>
                <option value="D">Empate</option>
              </select>
            </div>

            {/* Local / Visitante toggle */}
            <div className="flex items-center gap-2 mb-3">
              <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Jugamos de:</span>
              <button type="button" onClick={() => setForm(f => ({ ...f, es_local: true }))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                style={{ fontSize: 12, fontWeight: 500, border: "1px solid",
                  backgroundColor: form.es_local ? "rgba(57,224,122,0.12)" : "var(--secondary)",
                  color: form.es_local ? "#39e07a" : "var(--muted-foreground)",
                  borderColor: form.es_local ? "rgba(57,224,122,0.3)" : "rgba(255,255,255,0.07)",
                  cursor: "pointer" }}>
                <Home size={12} /> Local
              </button>
              <button type="button" onClick={() => setForm(f => ({ ...f, es_local: false }))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                style={{ fontSize: 12, fontWeight: 500, border: "1px solid",
                  backgroundColor: !form.es_local ? "rgba(59,130,246,0.12)" : "var(--secondary)",
                  color: !form.es_local ? "#3b82f6" : "var(--muted-foreground)",
                  borderColor: !form.es_local ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.07)",
                  cursor: "pointer" }}>
                <Plane size={12} /> Visitante
              </button>
            </div>

            <div className="flex gap-2 justify-end items-center">
              <button onClick={() => setShowAdd(false)}
                style={{ fontSize: 13, color: "var(--muted-foreground)", padding: "6px 12px", background: "none", border: "none", cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={handleAdd} disabled={saving}
                style={{ ...inputStyle, padding: "6px 16px", backgroundColor: "var(--primary)", color: "var(--primary-foreground)", fontWeight: 500, cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        {matches.length > 0 && (
          <div className="flex gap-2 mb-4">
            {[["all","Todos"],["W","Victorias"],["L","Derrotas"],["D","Empates"],["local","Local"],["visitante","Visitante"]].map(([val, label]) => (
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
        {!loading && matches.length === 0 && (
          <div className="rounded-xl border p-12 text-center" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
            <ClipboardList size={40} style={{ color: "var(--muted-foreground)", opacity: 0.4, margin: "0 auto 16px" }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>No hay partidos registrados</p>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 20 }}>
              Cargá un partido o analizá uno desde Análisis.
            </p>
            <button onClick={() => setShowAdd(true)} style={{ padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, backgroundColor: "var(--primary)", color: "var(--primary-foreground)", border: "none", cursor: "pointer" }}>
              Registrar primer partido
            </button>
          </div>
        )}

        {/* Match list */}
        <div className="space-y-2">
          {filtered.map(m => {
            const rs = resultStyle(m.resultado)
            const analyzed = (m.total_events ?? 0) > 0
            const hasClips = m.clips && Object.keys(m.clips).length > 0
            return (
              <div key={m.id} className="rounded-xl border" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={(e) => {
                    // Solo navega si no se clickeó un botón hijo
                    if ((e.target as HTMLElement).closest("button")) return
                    navigate(`/matches/${m.id}`)
                  }}>

                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-mono"
                    style={{ backgroundColor: rs.bg, color: rs.color, fontWeight: 700, fontSize: 14 }}>
                    {m.resultado ?? "—"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 500, fontSize: 14, color: "var(--foreground)" }}>
                        {club?.nombre ?? "Mi Club"} vs. {m.rival}
                      </span>
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded font-mono"
                        style={{ fontSize: 10, backgroundColor: m.es_local ? "rgba(57,224,122,0.1)" : "rgba(59,130,246,0.1)",
                          color: m.es_local ? "#39e07a" : "#3b82f6" }}>
                        {m.es_local ? <><Home size={9} /> LOCAL</> : <><Plane size={9} /> VISITANTE</>}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <div className="flex items-center gap-1" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                        <Calendar size={10} /> {m.fecha}
                      </div>
                      {analyzed && (
                        <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                          · {m.lineouts_count} line-outs · {m.total_events} eventos
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="font-mono" style={{ fontWeight: 600, fontSize: 15, color: "var(--foreground)", minWidth: 60, textAlign: "center" }}>
                    {m.marcador || "—"}
                  </div>
                  <div className="px-2.5 py-1 rounded-lg font-mono shrink-0"
                    style={{ fontSize: 11, backgroundColor: analyzed ? "rgba(57,224,122,0.1)" : "var(--secondary)", color: analyzed ? "#39e07a" : "var(--muted-foreground)" }}>
                    {analyzed ? "ANALIZADO" : "SIN ANÁLISIS"}
                  </div>
                  {!analyzed && (
                    <button onClick={() => navigate("/analysis")} className="flex items-center gap-1 shrink-0"
                      style={{ fontSize: 12, color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}>
                      Analizar <ChevronRight size={12} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded shrink-0"
                    style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <Trash2 size={13} style={{ color: "var(--muted-foreground)" }} />
                  </button>
                </div>
                {/* Clips */}
                {analyzed && hasClips && (
                  <div className="flex gap-2 px-4 pb-3 border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)", marginRight: 4, lineHeight: "22px" }}>Clips:</span>
                    {[
                      { key: "lineout", label: "Line-outs", color: "#39e07a" },
                      { key: "scrum",   label: "Scrums",    color: "#3b82f6" },
                      { key: "kickoff", label: "Salidas",   color: "#f59e0b" },
                    ].map(({ key, label, color }) => {
                      const path = m.clips?.[key as "lineout"|"scrum"|"kickoff"]
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

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
