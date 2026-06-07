import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router"
import {
  Upload, Video, Activity, Clock, Zap,
  ChevronRight, Play, CheckCircle2, AlertCircle,
} from "lucide-react"
import { motion } from "motion/react"

// ── Carga datos reales desde localStorage ─────────────────────────────────────
function loadRealData() {
  const matches = JSON.parse(localStorage.getItem("analyzed_matches") || "[]")
    .filter((m: any) => m.analyzed)

  const totalLo  = matches.reduce((s: number, m: any) => s + (m.lineouts || 0), 0)
  const totalSec = matches.reduce((s: number, m: any) => s + (m.duration_sec || 0), 0)
  const n        = matches.length || 1

  return {
    matches,
    stats: [
      { label: "Partidos analizados",  value: String(matches.length), icon: Video,    delta: matches.length ? `${matches.length} en total` : "Aún sin análisis" },
      { label: "Posesión promedio",    value: matches.length ? "54%" : "—", icon: Activity, delta: matches.length ? "estimado" : "Sin datos aún" },
      { label: "Line-outs detectados", value: String(totalLo),        icon: Zap,      delta: matches.length ? `${(totalLo/n).toFixed(1)} por partido` : "—" },
      { label: "Horas de video",       value: totalSec > 0 ? `${(totalSec/3600).toFixed(1)}h` : "0h", icon: Clock, delta: matches.length ? `~${Math.round(totalSec/n/60)} min promedio` : "—" },
    ],
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const isElectron = typeof window !== 'undefined' && !!window.apertAPI

function buildDefaultOutput(videoPath: string): string {
  const dot = videoPath.lastIndexOf('.')
  const base = dot >= 0 ? videoPath.slice(0, dot) : videoPath
  return `${base}_detected.mp4`
}

// ── Phases que muestra la barra de progreso ───────────────────────────────────
const PHASES = [
  "Iniciando modelo YOLO...",
  "Procesando frames...",
  "Detectando formaciones...",
  "Analizando posesión...",
  "Generando reporte...",
]

// ── Componente ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [isDragging, setIsDragging]   = useState(false)
  const [uploading, setUploading]     = useState(false)
  const [progress, setProgress]       = useState(0)
  const [phase, setPhase]             = useState("")
  const [error, setError]             = useState<string | null>(null)
  const [videoName, setVideoName]     = useState("partido.mp4")
  const [events, setEvents]           = useState<any[]>([])
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cleanupRef   = useRef<(() => void)[]>([])

  // Limpiar listeners al desmontar
  useEffect(() => () => { cleanupRef.current.forEach(fn => fn()) }, [])

  // ── Iniciar análisis real (Electron) ────────────────────────────────────────
  const startRealAnalysis = async (videoPath: string) => {
    if (!window.apertAPI) return

    setError(null)
    setUploading(true)
    setProgress(0)
    setPhase(PHASES[0])
    setEvents([])
    setVideoName(videoPath.split(/[\\/]/).pop() ?? 'partido.mp4')

    const outputPath = buildDefaultOutput(videoPath)

    // Registrar listeners
    const rmProgress = window.apertAPI.onProgress(({ pct }) => {
      setProgress(pct)
      const idx = Math.min(Math.floor(pct / 20), PHASES.length - 1)
      setPhase(PHASES[idx])
    })
    const rmEvent = window.apertAPI.onEvent((ev) => {
      setEvents(prev => [...prev, ev])
    })
    const rmFinished = window.apertAPI.onFinished((stats) => {
      setProgress(100)
      setPhase("¡Análisis completado!")
      setTimeout(() => navigate('/analysis', { state: { videoPath } }), 800)
    })
    const rmError = window.apertAPI.onError(({ message }) => {
      setError(message)
      setUploading(false)
    })

    cleanupRef.current = [rmProgress, rmEvent, rmFinished, rmError]

    const result = await window.apertAPI.analyzeVideo({
      videoPath,
      outputPath,
      confidence: 0.4,
      mode: 'detection',
    })

    if (result.error) {
      setError(result.error)
      setUploading(false)
    }
  }

  // ── Simulación para cuando NO hay Electron (browser dev) ─────────────────────
  const simulateUpload = () => {
    setUploading(true)
    setProgress(0)
    setVideoName("partido_demo.mp4")
    let i = 0, current = 0
    const tick = setInterval(() => {
      if (i >= PHASES.length) {
        clearInterval(tick)
        setTimeout(() => navigate('/analysis?demo=1'), 600)
        return
      }
      setPhase(PHASES[i])
      if (current < (i + 1) * 20) {
        current += 2
        setProgress(Math.min(current, 100))
      } else { i++ }
    }, 80)
  }

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleSelectFile = async () => {
    if (isElectron) {
      const path = await window.apertAPI!.openFileDialog()
      if (path) {
        // Guardar para que Analysis lo lea si viene directo
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
    if (isElectron) {
      const file = e.dataTransfer.files[0]
      if (file) startRealAnalysis((file as any).path ?? file.name)
    } else {
      simulateUpload()
    }
  }

  const handleStop = async () => {
    if (isElectron && window.apertAPI) {
      await window.apertAPI.stopAnalysis()
    }
    cleanupRef.current.forEach(fn => fn())
    setUploading(false)
    setProgress(0)
    setError(null)
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  const { matches: recentMatches, stats: globalStats } = loadRealData()

  return (
    <div className="flex flex-col h-full">
    {/* Top bar */}
    <div
      className="flex items-center justify-between px-6 py-3 border-b shrink-0"
      style={{ backgroundColor: "var(--background)", borderColor: "rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center gap-2" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
        <span>Apert Vision</span>
        <span style={{ opacity: 0.4 }}>›</span>
        <span style={{ color: "var(--foreground)", fontWeight: 500 }}>Dashboard</span>
      </div>
    </div>
    <div className="flex-1 overflow-auto p-6 space-y-6">

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {globalStats.map(({ label, value, icon: Icon, delta }) => (
          <div
            key={label}
            className="rounded-xl p-4 border"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(57,224,122,0.1)" }}
              >
                <Icon size={16} style={{ color: "var(--primary)" }} />
              </div>
            </div>
            <div className="text-foreground mb-0.5" style={{ fontSize: 22, fontWeight: 600 }}>
              {value}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{label}</div>
            <div style={{ fontSize: 11, color: "var(--primary)", marginTop: 4 }}>{delta}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* ── Upload / Progress area ── */}
        <div>
          <h2 className="text-foreground mb-3" style={{ fontSize: 14, fontWeight: 600 }}>
            Nuevo Análisis
          </h2>

          {error && (
            <div
              className="flex items-start gap-2 rounded-lg p-3 mb-3"
              style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}
            >
              <AlertCircle size={14} style={{ color: "#ef4444", marginTop: 1 }} />
              <div style={{ fontSize: 12, color: "#ef4444" }}>{error}</div>
            </div>
          )}

          {!uploading ? (
            <motion.div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={handleSelectFile}
              animate={{ borderColor: isDragging ? "#39e07a" : "rgba(255,255,255,0.07)" }}
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all"
              style={{
                height: 220,
                backgroundColor: isDragging ? "rgba(57,224,122,0.04)" : "var(--card)",
              }}
            >
              {/* Hidden file input for browser mode */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp4,.mov,.avi,.mkv"
                className="hidden"
                onChange={() => simulateUpload()}
              />
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: "rgba(57,224,122,0.1)" }}
              >
                <Upload size={24} style={{ color: "var(--primary)" }} />
              </div>
              <div className="text-foreground mb-1" style={{ fontWeight: 500, fontSize: 14 }}>
                Arrastrá tu video aquí
              </div>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                MP4, MOV o AVI · máx. 2 GB
              </div>
              <div
                className="mt-4 px-4 py-1.5 rounded-lg"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                Seleccionar archivo
              </div>
            </motion.div>
          ) : (
            <div
              className="rounded-xl border p-6"
              style={{ height: 220, backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "rgba(57,224,122,0.1)" }}
                >
                  <Video size={18} style={{ color: "var(--primary)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-foreground truncate" style={{ fontSize: 13, fontWeight: 500 }}>
                    {videoName}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                    Procesando con YOLO v8...
                  </div>
                </div>
                {isElectron && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStop() }}
                    style={{ fontSize: 11, color: "var(--muted-foreground)", padding: "4px 8px" }}
                  >
                    Detener
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between" style={{ fontSize: 12 }}>
                  <span style={{ color: "var(--muted-foreground)" }}>{phase}</span>
                  <span className="font-mono" style={{ color: "var(--primary)", fontWeight: 500 }}>
                    {progress}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--secondary)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: "var(--primary)" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="font-mono" style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                  YOLO v8 · Rugby Formation Model · v2.1.4
                  {events.length > 0 && ` · ${events.length} evento${events.length > 1 ? 's' : ''} detectado${events.length > 1 ? 's' : ''}`}
                </div>
              </div>

              {progress === 100 && (
                <div className="flex items-center gap-2 mt-4" style={{ color: "var(--primary)", fontSize: 12 }}>
                  <CheckCircle2 size={14} />
                  <span>Análisis completado — redirigiendo...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Análisis Recientes ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-foreground" style={{ fontSize: 14, fontWeight: 600 }}>
              Análisis Recientes
            </h2>
            <button
              className="flex items-center gap-1 transition-opacity hover:opacity-70"
              style={{ fontSize: 12, color: "var(--primary)" }}
              onClick={() => navigate('/analysis')}
            >
              Ver todos <ChevronRight size={12} />
            </button>
          </div>

          <div className="space-y-2">
            {recentMatches.length === 0 && (
              <div className="p-4 rounded-xl border text-center" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
                <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                  Todavía no analizaste ningún partido.<br />Cargá un video para empezar.
                </p>
              </div>
            )}
            {recentMatches.slice(0, 4).map((a: any) => (
              <div
                key={a.id}
                className="flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all hover:border-primary/50"
                style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}
                onClick={() => navigate('/matches')}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(57,224,122,0.08)" }}>
                  <Play size={13} style={{ color: "var(--primary)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-foreground truncate" style={{ fontSize: 12, fontWeight: 500 }}>
                    Los Pumas RC vs. {a.rival}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                    {a.date} · {a.lineouts ?? 0} line-outs
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono" style={{ fontSize: 11, color: "var(--primary)", fontWeight: 500 }}>
                    {a.total_events ?? 0} eventos
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
