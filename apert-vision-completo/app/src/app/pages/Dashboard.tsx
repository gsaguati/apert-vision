import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router"
import {
  Upload, Video, ChevronRight, Play, Home, Plane,
} from "lucide-react"
import { motion } from "motion/react"
import { supabase, Partido } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import { useAnalysis } from "../context/AnalysisContext"

const isElectron = typeof window !== "undefined" && !!window.apertAPI

interface PartidoConEventos extends Partido {
  eventos_count: number
  lineouts_count: number
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { club } = useAuth()
  const { phase: analysisPhase } = useAnalysis()

  const [matches, setMatches]     = useState<PartidoConEventos[]>([])
  const [loading, setLoading]     = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Cargar partidos analizados desde Supabase ─────────────────────────
  const loadMatches = async () => {
    const { data, error } = await supabase
      .from("partidos")
      .select("*, eventos(tipo)")
      .order("fecha", { ascending: false })

    if (error) console.error(error)

    const processed: PartidoConEventos[] = (data ?? []).map((m: any) => {
      const eventos = m.eventos ?? []
      return {
        ...m,
        eventos_count:  eventos.length,
        lineouts_count: eventos.filter((e: any) => e.tipo === "lineout").length,
      }
    }).filter((m: PartidoConEventos) => m.eventos_count > 0)

    setMatches(processed)
    setLoading(false)
  }

  useEffect(() => { loadMatches() }, [])

  // Recargar cuando el análisis termina (para que aparezca el partido nuevo)
  useEffect(() => {
    if (analysisPhase === "idle" || analysisPhase === "done") {
      loadMatches()
    }
  }, [analysisPhase])

  // ── Stats ─────────────────────────────────────────────────────────────
  const totalLo  = matches.reduce((s, m) => s + m.lineouts_count, 0)
  const totalEv  = matches.reduce((s, m) => s + m.eventos_count, 0)
  const avgPerMatch = matches.length ? Math.round(totalEv / matches.length) : 0

  // Hacer 4 stats reales
  const stats = [
    { label: "Partidos analizados", value: String(matches.length), color: "#39e07a" },
    { label: "Line-outs detectados", value: String(totalLo),     color: "#3b82f6" },
    { label: "Total eventos",       value: String(totalEv),       color: "#f59e0b" },
    { label: "Promedio por partido",value: String(avgPerMatch),   color: "#a855f7" },
  ]

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleSelectFile = async () => {
    if (isElectron) {
      const path = await window.apertAPI!.openFileDialog()
      if (path) {
        localStorage.setItem("apert_pending_video", path)
        navigate("/analysis", { state: { videoPath: path } })
      }
    } else {
      fileInputRef.current?.click()
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      const p = isElectron ? ((file as any).path ?? file.name) : file.name
      localStorage.setItem("apert_pending_video", p)
      navigate("/analysis", { state: { videoPath: p } })
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b shrink-0"
        style={{ backgroundColor: "var(--background)", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          <span>Apert Vision</span><span style={{ opacity: 0.4 }}>›</span>
          <span style={{ color: "var(--foreground)", fontWeight: 500 }}>Dashboard</span>
        </div>
        {club && (
          <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            Conectado a <span style={{ color: "var(--primary)", fontWeight: 500 }}>{club.nombre}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map(({ label, value, color }) => (
            <div key={label} className="rounded-xl p-4 border"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${color}15` }}>
                  <Video size={16} style={{ color }} />
                </div>
              </div>
              <div className="text-foreground font-mono mb-0.5" style={{ fontSize: 24, fontWeight: 700 }}>
                {loading ? "—" : value}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">

          {/* ── Upload zone ── */}
          <div>
            <h2 className="text-foreground mb-3" style={{ fontSize: 14, fontWeight: 600 }}>
              Nuevo Análisis
            </h2>
            <motion.div
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={handleSelectFile}
              animate={{ borderColor: isDragging ? "#39e07a" : "rgba(255,255,255,0.07)" }}
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all"
              style={{ height: 220, backgroundColor: isDragging ? "rgba(57,224,122,0.04)" : "var(--card)" }}>
              <input ref={fileInputRef} type="file" accept=".mp4,.mov,.avi,.mkv" className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) { localStorage.setItem("apert_pending_video", f.name); navigate("/analysis") }
                }} />
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: "rgba(57,224,122,0.1)" }}>
                <Upload size={24} style={{ color: "var(--primary)" }} />
              </div>
              <div className="text-foreground mb-1" style={{ fontWeight: 500, fontSize: 14 }}>
                Arrastrá tu video acá
              </div>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                MP4, MOV o AVI
              </div>
              <div className="mt-4 px-4 py-1.5 rounded-lg"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)",
                  fontSize: 12, fontWeight: 500 }}>
                Seleccionar archivo
              </div>
            </motion.div>
          </div>

          {/* ── Recent matches ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-foreground" style={{ fontSize: 14, fontWeight: 600 }}>
                Análisis Recientes
              </h2>
              <button className="flex items-center gap-1 transition-opacity hover:opacity-70"
                style={{ fontSize: 12, color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}
                onClick={() => navigate("/matches")}>
                Ver todos <ChevronRight size={12} />
              </button>
            </div>

            <div className="space-y-2">
              {loading && (
                <div className="p-4 rounded-xl border text-center"
                  style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
                  <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Cargando...</p>
                </div>
              )}

              {!loading && matches.length === 0 && (
                <div className="p-4 rounded-xl border text-center"
                  style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
                  <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                    Todavía no analizaste ningún partido.<br />Cargá un video para empezar.
                  </p>
                </div>
              )}

              {matches.slice(0, 4).map(m => (
                <div key={m.id}
                  className="flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all hover:border-primary/50"
                  style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}
                  onClick={() => navigate("/matches")}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "rgba(57,224,122,0.08)" }}>
                    <Play size={13} style={{ color: "var(--primary)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground truncate" style={{ fontSize: 12, fontWeight: 500 }}>
                        {club?.nombre ?? "Mi Club"} vs. {m.rival}
                      </span>
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded font-mono shrink-0"
                        style={{ fontSize: 9, backgroundColor: m.es_local ? "rgba(57,224,122,0.1)" : "rgba(59,130,246,0.1)",
                          color: m.es_local ? "#39e07a" : "#3b82f6" }}>
                        {m.es_local ? <Home size={8} /> : <Plane size={8} />}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                      {m.fecha} · {m.lineouts_count} line-outs
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono" style={{ fontSize: 11, color: "var(--primary)", fontWeight: 500 }}>
                      {m.eventos_count} eventos
                    </div>
                    <div style={{ fontSize: 10, color: "var(--muted-foreground)" }}>detectados</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
