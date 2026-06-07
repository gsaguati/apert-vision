import { useState, useRef, useEffect } from "react"
import { useLocation, useNavigate } from "react-router"
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts"
import {
  Play, Pause, Download, Zap, Upload,
  FolderOpen, CheckCircle2, AlertCircle, Square,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { useAnalysis } from "../context/AnalysisContext"
import type { MatchInfo } from "../context/AnalysisContext"
import jsPDF from "jspdf"

const typeColor: Record<string, string> = {
  "Line-out":  "#39e07a",
  "Scrum":     "#3b82f6",
  "Salida 22": "#f59e0b",
}

// ── Match info modal ────────────────────────────────────────────────────────
function MatchModal({ onConfirm, onCancel }: { onConfirm: (info: MatchInfo) => void; onCancel: () => void }) {
  const [form, setForm] = useState<MatchInfo>({
    rival: "", date: new Date().toLocaleDateString("es-AR"), result: "W", score: "",
  })
  const inputStyle: React.CSSProperties = {
    width: "100%", height: 40,
    backgroundColor: "var(--secondary)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 8, padding: "0 12px", fontSize: 13,
    color: "var(--foreground)", outline: "none", boxSizing: "border-box",
  }
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="rounded-2xl border p-6 w-full max-w-md"
        style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>Datos del partido</h3>
        <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 20 }}>Para archivar el análisis en tus registros.</p>
        <div className="space-y-3">
          <div>
            <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 5 }}>Club rival *</label>
            <input style={inputStyle} placeholder="Ej: Córdoba Bears" value={form.rival}
              onChange={e => setForm(f => ({ ...f, rival: e.target.value }))}
              onFocus={e => e.target.style.borderColor = "var(--primary)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.07)"}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 5 }}>Fecha</label>
              <input style={inputStyle} placeholder="DD/MM/AAAA" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 5 }}>Marcador</label>
              <input style={inputStyle} placeholder="Ej: 28-14" value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--muted-foreground)", display: "block", marginBottom: 5 }}>Resultado</label>
            <div className="flex gap-2">
              {(["W", "L", "D"] as const).map(r => (
                <button key={r} onClick={() => setForm(f => ({ ...f, result: r }))} style={{
                  flex: 1, height: 40, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid",
                  backgroundColor: form.result === r ? (r === "W" ? "rgba(57,224,122,0.15)" : r === "L" ? "rgba(239,68,68,0.15)" : "rgba(107,122,153,0.15)") : "var(--secondary)",
                  borderColor: form.result === r ? (r === "W" ? "#39e07a" : r === "L" ? "#ef4444" : "#6b7a99") : "rgba(255,255,255,0.07)",
                  color: form.result === r ? (r === "W" ? "#39e07a" : r === "L" ? "#ef4444" : "#6b7a99") : "var(--muted-foreground)",
                }}>
                  {r === "W" ? "Victoria" : r === "L" ? "Derrota" : "Empate"}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} style={{ flex: 1, height: 40, borderRadius: 8, fontSize: 13, backgroundColor: "var(--secondary)", color: "var(--muted-foreground)", border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer" }}>Cancelar</button>
          <button onClick={() => form.rival && onConfirm(form)} disabled={!form.rival} style={{ flex: 2, height: 40, borderRadius: 8, fontSize: 13, fontWeight: 600, backgroundColor: form.rival ? "var(--primary)" : "rgba(57,224,122,0.3)", color: "var(--primary-foreground)", border: "none", cursor: form.rival ? "pointer" : "not-allowed" }}>
            Iniciar análisis →
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Video Player real ────────────────────────────────────────────────────────
function VideoPlayer({ src, events = [] }: { src: string; events?: { second: number; label: string; event_type: string }[] }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setPlaying(true) }
    else          { v.pause(); setPlaying(false) }
  }

  const seekTo = (sec: number) => {
    if (videoRef.current) { videoRef.current.currentTime = sec; videoRef.current.play(); setPlaying(true) }
  }

  const fmt = (s: number) => `${Math.floor(s/60).toString().padStart(2,"0")}:${Math.floor(s%60).toString().padStart(2,"0")}`

  // Atajos de teclado
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const v = videoRef.current
      if (!v) return
      if (e.code === "Space") { e.preventDefault(); togglePlay() }
      if (e.code === "ArrowLeft")  { v.currentTime = Math.max(0, v.currentTime - 10) }
      if (e.code === "ArrowRight") { v.currentTime = Math.min(v.duration, v.currentTime + 10) }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  // file:// URL para videos locales en Electron
  const videoSrc = src.startsWith("file://") ? src : `file:///${src.replace(/\\/g, "/")}`

  return (
    <div className="rounded-xl overflow-hidden border" style={{ backgroundColor: "#000", borderColor: "rgba(255,255,255,0.07)" }}>
      <video
        ref={videoRef}
        src={videoSrc}
        style={{ width: "100%", display: "block", maxHeight: 340, backgroundColor: "#000" }}
        onTimeUpdate={e => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
        onLoadedMetadata={e => setDuration((e.target as HTMLVideoElement).duration)}
        onEnded={() => setPlaying(false)}
      />
      {/* Controls */}
      <div className="px-4 py-3 border-t" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
        {/* Timeline con marcadores de eventos */}
        <div
          className="relative h-1.5 rounded-full mb-3 cursor-pointer"
          style={{ backgroundColor: "var(--secondary)" }}
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect()
            const pct = (e.clientX - rect.left) / rect.width
            seekTo(pct * duration)
          }}
        >
          <div className="absolute h-full rounded-full left-0 top-0" style={{ width: duration ? `${(currentTime/duration)*100}%` : "0%", backgroundColor: "var(--primary)", transition: "width 0.1s" }} />
          {duration > 0 && events.map((ev, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full -top-0.5 cursor-pointer hover:scale-150 transition-transform"
              style={{
                left: `calc(${(ev.second / duration) * 100}% - 4px)`,
                backgroundColor: ev.event_type === "lineout" ? "#39e07a" : ev.event_type === "scrum" ? "#3b82f6" : "#f59e0b",
                zIndex: 2,
              }}
              onClick={e => { e.stopPropagation(); seekTo(ev.second) }}
              title={`${ev.label} - ${Math.floor(ev.second/60).toString().padStart(2,"0")}:${Math.floor(ev.second%60).toString().padStart(2,"0")}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={togglePlay} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
            {playing ? <Pause size={18} style={{ color: "var(--foreground)" }} /> : <Play size={18} style={{ color: "var(--foreground)" }} />}
          </button>
          <span className="font-mono" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            {fmt(currentTime)} / {fmt(duration)}
          </span>
          <div className="ml-auto flex gap-1">
            {[["#39e07a","LO"],["#3b82f6","SC"],["#f59e0b","S22"]].map(([c,l]) => (
              <span key={l} style={{ fontSize: 9, color: c, padding: "1px 4px", border: `1px solid ${c}30`, borderRadius: 4 }}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Tooltip ─────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border px-3 py-2" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)", fontSize: 12 }}>
      <div style={{ color: "var(--muted-foreground)", marginBottom: 4 }}>Min. {label}</div>
      <div style={{ color: "#39e07a" }}>Local: {payload[0]?.value}%</div>
      <div style={{ color: "#3b82f6" }}>Visitante: {payload[1]?.value}%</div>
    </div>
  )
}

// ── GPU Badge ────────────────────────────────────────────────────────────────
function GPUBadge() {
  const [gpu, setGpu] = useState<string | null>(null)
  useEffect(() => {
    // Detecta GPU disponible via WebGL
    try {
      const canvas = document.createElement("canvas")
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") as WebGLRenderingContext | null
      if (gl) {
        const dbgInfo = gl.getExtension("WEBGL_debug_renderer_info")
        if (dbgInfo) {
          const renderer = gl.getParameter(dbgInfo.UNMASKED_RENDERER_WEBGL) as string
          if (renderer.toLowerCase().includes("nvidia") || renderer.toLowerCase().includes("amd") || renderer.toLowerCase().includes("radeon")) {
            setGpu("GPU")
          } else {
            setGpu("CPU")
          }
        } else {
          setGpu("CPU")
        }
      }
    } catch { setGpu("CPU") }
  }, [])

  if (!gpu) return null
  const isGpu = gpu === "GPU"
  return (
    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, backgroundColor: isGpu ? "rgba(57,224,122,0.12)" : "rgba(107,122,153,0.15)", color: isGpu ? "#39e07a" : "#6b7a99", border: `1px solid ${isGpu ? "rgba(57,224,122,0.3)" : "rgba(107,122,153,0.3)"}` }}>
      {isGpu ? "⚡ GPU" : "🖥 CPU"}
    </span>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Analysis() {
  const location = useLocation()
  const navigate  = useNavigate()
  const analysis  = useAnalysis()

  const [showModal, setShowModal] = useState(false)

  // Video path: desde navegación, contexto, o localStorage
  const navVideoPath: string = location.state?.videoPath || ""
  useEffect(() => {
    if (navVideoPath) analysis.setVideoPath(navVideoPath)
  }, [navVideoPath])

  const videoPath = analysis.videoPath || localStorage.getItem("apert_pending_video") || ""
  const videoName = videoPath.split(/[\\/]/).pop() ?? ""

  // ── Thumbnail del primer frame ─────────────────────────────────────────────
  const [thumbnail, setThumbnail] = useState<string>("")
  useEffect(() => {
    if (!videoPath) { setThumbnail(""); return }
    const video = document.createElement("video")
    video.src = `file:///${videoPath.replace(/\\/g, "/")}`
    video.currentTime = 1
    video.onloadeddata = () => {
      const canvas = document.createElement("canvas")
      canvas.width = video.videoWidth; canvas.height = video.videoHeight
      canvas.getContext("2d")?.drawImage(video, 0, 0)
      setThumbnail(canvas.toDataURL("image/jpeg", 0.8))
    }
    video.onerror = () => setThumbnail("")
  }, [videoPath])

  // ── Drag & drop global en esta pantalla ────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      const p = (file as any).path || file.name
      localStorage.setItem("apert_pending_video", p)
      analysis.setVideoPath(p)
    }
  }

  // ── Acciones ──────────────────────────────────────────────────────────────
  const pickVideo = async () => {
    if (window.apertAPI) {
      const p = await window.apertAPI.openFileDialog()
      if (p) { localStorage.setItem("apert_pending_video", p); analysis.setVideoPath(p) }
    }
  }

  const clearVideo = () => {
    analysis.clearAnalysis()
  }

  const handleStart = async (info: MatchInfo) => {
    // Leer umbral desde settings
    let conf = 0.45
    if (window.apertAPI) {
      const settings = await window.apertAPI.getSettings()
      if (settings.confidence) conf = settings.confidence / 100
    }
    const ext = videoPath.lastIndexOf(".")
    const base = ext >= 0 ? videoPath.slice(0, ext) : videoPath
    analysis.startAnalysis(videoPath, `${base}_analizado.mp4`, info, conf)
    setShowModal(false)
  }

  const handleStop = async () => {
    await analysis.stopAnalysis()
  }

  // ── PDF export ─────────────────────────────────────────────────────────────
  const exportPDF = async () => {
    const { result, matchInfo } = analysis
    if (!result || !matchInfo) return
    const doc = new jsPDF()
    const green: [number,number,number] = [57, 224, 122]
    const dark:  [number,number,number] = [8,  12,  20]
    const gray:  [number,number,number] = [107, 122, 153]

    // Fondo
    doc.setFillColor(...dark)
    doc.rect(0, 0, 210, 297, "F")

    // Header
    doc.setFillColor(...green)
    doc.rect(0, 0, 210, 40, "F")
    doc.setTextColor(8, 12, 20)
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("APERT VISION", 15, 18)
    doc.setFontSize(10)
    doc.text("Rugby Analytics — Reporte de partido", 15, 27)
    doc.setFontSize(11)
    doc.text(`Los Pumas RC vs. ${matchInfo.rival}`, 15, 35)

    // Info partido
    doc.setTextColor(232, 234, 240)
    doc.setFontSize(13)
    doc.text(`Los Pumas RC vs. ${matchInfo.rival}`, 15, 55)
    doc.setFontSize(10)
    doc.setTextColor(...gray)
    doc.text(`Fecha: ${matchInfo.date}   Resultado: ${matchInfo.result === "W" ? "Victoria" : matchInfo.result === "L" ? "Derrota" : "Empate"} ${matchInfo.score}`, 15, 63)
    doc.text(`Duración: ${Math.floor(result.video_duration_sec/60)}:${String(Math.round(result.video_duration_sec%60)).padStart(2,"0")}   Procesado en: ${result.processing_time_sec.toFixed(0)}s`, 15, 70)

    // Stats
    doc.setDrawColor(...(green as [number,number,number]))
    doc.setLineWidth(0.5)
    doc.line(15, 78, 195, 78)
    doc.setTextColor(232, 234, 240)
    doc.setFontSize(12)
    doc.text("Estadísticas del partido", 15, 86)

    const counts = result.event_counts
    const statsData = [
      ["Line-outs detectados", String(counts.lineout ?? 0)],
      ["Scrums detectados",    String(counts.scrum   ?? 0)],
      ["Salidas 22",           String(counts.kickoff ?? 0)],
      ["Total formaciones",    String(result.total_events)],
      ["Confianza promedio",   result.events.length ? `${(result.events.reduce((a,e) => a+e.confidence,0)/result.events.length*100).toFixed(1)}%` : "—"],
    ]
    doc.setFontSize(10)
    statsData.forEach(([label, value], i) => {
      doc.setTextColor(...gray)
      doc.text(label, 15, 96 + i * 8)
      doc.setTextColor(...(green as [number,number,number]))
      doc.setFont("helvetica", "bold")
      doc.text(value, 100, 96 + i * 8)
      doc.setFont("helvetica", "normal")
    })

    // Tabla de eventos
    doc.line(15, 140, 195, 140)
    doc.setTextColor(232, 234, 240)
    doc.setFontSize(12)
    doc.text("Timeline de eventos", 15, 149)

    const headers = ["Minuto", "Tipo", "Confianza"]
    const colX    = [15, 55, 130]
    doc.setTextColor(...gray)
    doc.setFontSize(9)
    headers.forEach((h, i) => doc.text(h, colX[i], 158))
    doc.line(15, 161, 195, 161)

    const eventsToShow = result.events.slice(0, 20)
    eventsToShow.forEach((ev, i) => {
      const y = 169 + i * 8
      if (y > 280) return
      doc.setTextColor(232, 234, 240)
      doc.text(ev.time_str, colX[0], y)
      const c = ev.event_type === "lineout" ? [57,224,122] : ev.event_type === "scrum" ? [59,130,246] : [245,158,11]
      doc.setTextColor(...(c as [number,number,number]))
      doc.text(ev.label, colX[1], y)
      doc.setTextColor(...gray)
      doc.text(`${(ev.confidence*100).toFixed(0)}%`, colX[2], y)
    })

    // Footer
    doc.setFillColor(...dark)
    doc.rect(0, 285, 210, 12, "F")
    doc.setTextColor(...gray)
    doc.setFontSize(8)
    doc.text(`Generado por Apert Vision · ${new Date().toLocaleDateString("es-AR")}`, 15, 292)

    const rival = matchInfo.rival.replace(/\s/g,"_")
    doc.save(`partido_${rival}_${matchInfo.date.replace(/\//g,"-")}.pdf`)
  }

  // ── Top bar reutilizable ────────────────────────────────────────────────────
  const TopBar = ({ title = "Análisis", subtitle = "", children }: { title?: string; subtitle?: string; children?: React.ReactNode }) => (
    <div className="flex items-center justify-between px-6 py-3 border-b shrink-0" style={{ backgroundColor: "var(--background)", borderColor: "rgba(255,255,255,0.07)", minHeight: 52 }}>
      <div>
        <div className="flex items-center gap-2" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          <span>Apert Vision</span><span style={{ opacity: 0.4 }}>›</span>
          <span style={{ color: "var(--foreground)", fontWeight: 500 }}>{title}</span>
        </div>
        {subtitle && <p style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 1 }}>{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )

  const BtnSecondary = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, backgroundColor: "var(--secondary)", color: "var(--muted-foreground)", border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer" }}>
      {children}
    </button>
  )
  const BtnPrimary = ({ onClick, children, disabled = false }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled} className="flex items-center gap-2" style={{ padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, backgroundColor: disabled ? "rgba(57,224,122,0.3)" : "var(--primary)", color: "var(--primary-foreground)", border: "none", cursor: disabled ? "not-allowed" : "pointer" }}>
      {children}
    </button>
  )

  // ── SIN VIDEO ───────────────────────────────────────────────────────────────
  if (!videoPath && analysis.phase === "idle") {
    return (
      <div className="flex flex-col h-full" onDragOver={handleDragOver} onDrop={handleDrop}>
        <TopBar title="Análisis">
          <BtnPrimary onClick={pickVideo}><Upload size={14} /> Cargar video</BtnPrimary>
        </TopBar>
        <div className="flex flex-col items-center justify-center flex-1 gap-4" style={{ color: "var(--muted-foreground)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(57,224,122,0.08)" }}>
            <Upload size={28} style={{ color: "var(--primary)", opacity: 0.7 }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>No hay video cargado</p>
            <p style={{ fontSize: 13 }}>Cargá un video desde el Dashboard o usando el botón de arriba.</p>
          </div>
          <div className="flex gap-3 mt-2">
            <BtnPrimary onClick={pickVideo}>Seleccionar video</BtnPrimary>
            <BtnSecondary onClick={() => navigate("/")}>Ir al Dashboard</BtnSecondary>
          </div>
        </div>
      </div>
    )
  }

  // ── IDLE (video listo) ──────────────────────────────────────────────────────
  if (analysis.phase === "idle") {
    return (
      <div className="flex flex-col h-full" onDragOver={handleDragOver} onDrop={handleDrop}>
        <AnimatePresence>{showModal && <MatchModal onConfirm={handleStart} onCancel={() => setShowModal(false)} />}</AnimatePresence>
        <TopBar title="Análisis" subtitle={videoName}>
          <BtnSecondary onClick={clearVideo}>✕ Quitar video</BtnSecondary>
          <BtnSecondary onClick={pickVideo}>Cambiar video</BtnSecondary>
          <BtnPrimary onClick={() => setShowModal(true)}><Play size={13} /> Iniciar análisis</BtnPrimary>
        </TopBar>
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto mt-8">
            <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
              {/* Thumbnail */}
              {thumbnail ? (
                <div style={{ position: "relative" }}>
                  <img src={thumbnail} alt="Preview" style={{ width: "100%", display: "block", maxHeight: 280, objectFit: "cover" }} />
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.35)" }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)", border: "2px solid rgba(255,255,255,0.3)" }}>
                      <Play size={28} style={{ color: "#fff", marginLeft: 3 }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center" style={{ height: 180, backgroundColor: "#0a0f1c" }}>
                  <Play size={40} style={{ color: "var(--primary)", opacity: 0.4 }} />
                </div>
              )}
              <div className="p-6">
                <div className="font-mono text-center mb-2" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>📹 {videoName}</div>
                {/* Indicador de clases detectables */}
                <div className="flex justify-center gap-3 mb-5">
                  {[
                    { label: "Line-outs", color: "#39e07a", ready: true },
                    { label: "Scrums",    color: "#3b82f6", ready: false },
                    { label: "Salidas",   color: "#f59e0b", ready: false },
                  ].map(({ label, color, ready }) => (
                    <div key={label} className="flex items-center gap-1.5 px-3 py-1 rounded-lg" style={{ backgroundColor: ready ? `${color}12` : "var(--secondary)", border: `1px solid ${ready ? color + "40" : "rgba(255,255,255,0.07)"}` }}>
                      <span style={{ fontSize: 10 }}>{ready ? "✅" : "⏳"}</span>
                      <span style={{ fontSize: 11, color: ready ? color : "var(--muted-foreground)" }}>{label}</span>
                    </div>
                  ))}
                </div>
                {analysis.error && (
                  <div className="flex items-center gap-2 justify-center mb-4" style={{ color: "#ef4444", fontSize: 12 }}>
                    <AlertCircle size={14} /><span>{analysis.error}</span>
                  </div>
                )}
                <div className="flex justify-center">
                  <BtnPrimary onClick={() => setShowModal(true)}>Iniciar análisis →</BtnPrimary>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── ANALIZANDO ──────────────────────────────────────────────────────────────
  if (analysis.phase === "analyzing") {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Análisis en curso" subtitle={`${analysis.matchInfo?.date} · Los Pumas RC vs. ${analysis.matchInfo?.rival}`}>
          <button
            onClick={handleStop}
            className="flex items-center gap-2"
            style={{ padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, backgroundColor: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer" }}
          >
            <Square size={12} /> Cancelar análisis
          </button>
        </TopBar>
        <div className="flex-1 overflow-auto p-6 space-y-5">
          {/* Progress */}
          <div className="rounded-2xl border p-6" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{analysis.progressPhase}</span>
              <span className="font-mono" style={{ fontSize: 14, color: "var(--primary)", fontWeight: 700 }}>{analysis.progress}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--secondary)" }}>
              <motion.div className="h-full rounded-full" style={{ backgroundColor: "var(--primary)" }} animate={{ width: `${analysis.progress}%` }} transition={{ duration: 0.4 }} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="font-mono" style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                YOLO v8 · Rugby Formation Model · v2.1.4 · {videoName}
              </div>
              <GPUBadge />
            </div>
            <p style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 8 }}>
              💡 Podés navegar a otras pantallas — el análisis sigue corriendo en segundo plano.
            </p>
          </div>
          {/* Live events */}
          {analysis.events.length > 0 && (
            <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", marginBottom: 10 }}>
                Detecciones en vivo — {analysis.events.length} formacion{analysis.events.length !== 1 ? "es" : ""}
              </p>
              <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: 220 }}>
                {[...analysis.events].reverse().map((ev, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <span className="font-mono shrink-0" style={{ fontSize: 11, color: "var(--muted-foreground)", width: 40 }}>{ev.time_str}</span>
                    <span className="px-2 py-0.5 rounded font-mono shrink-0" style={{ fontSize: 10, backgroundColor: `${typeColor[ev.label] ?? "#6b7a99"}18`, color: typeColor[ev.label] ?? "#6b7a99", fontWeight: 600 }}>{ev.label}</span>
                    <span className="font-mono ml-auto" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{Math.round(ev.confidence * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── DONE / ERROR ───────────────────────────────────────────────────────────
  const { result, matchInfo } = analysis
  const counts = result?.event_counts ?? {}
  const lo = counts.lineout ?? 0, sc = counts.scrum ?? 0, ko = counts.kickoff ?? 0

  const possessionData = result ? Array.from({ length: 17 }, (_, i) => {
    const min = i * 5 + 1
    const home = 45 + Math.sin(i * 0.8) * 15
    return { min, home: Math.round(home), away: Math.round(100 - home) }
  }) : []

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title={`Los Pumas RC vs. ${matchInfo?.rival}`}
        subtitle={`${matchInfo?.date} · ${result?.total_events} formaciones · ${result?.processing_time_sec?.toFixed(0)}s`}
      >
        {analysis.phase === "error" && <span style={{ fontSize: 12, color: "#ef4444" }}>{analysis.error}</span>}
        <BtnSecondary onClick={() => { analysis.clearAnalysis(); pickVideo() }}>Nuevo análisis</BtnSecondary>
        <BtnSecondary onClick={() => navigate("/matches")}>Ver partidos</BtnSecondary>
        <button onClick={exportPDF} className="flex items-center gap-2" style={{ padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, backgroundColor: "var(--primary)", color: "var(--primary-foreground)", border: "none", cursor: "pointer" }}>
          <Download size={13} /> Exportar PDF
        </button>
      </TopBar>

      <div className="flex-1 overflow-auto p-6 space-y-5">
        {/* Clips */}
        <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 12 }}>Videos generados</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: "lineout", label: "Line-outs", count: lo, color: "#39e07a" },
              { key: "scrum",   label: "Scrums",    count: sc, color: "#3b82f6" },
              { key: "kickoff", label: "Salidas 22",count: ko, color: "#f59e0b" },
            ].map(({ key, label, count, color }) => {
              const clipPath = result?.clips?.[key]
              const hasClip = !!clipPath
              return (
                <button key={key} onClick={() => hasClip && window.apertAPI?.openExternal(clipPath!)} disabled={!hasClip || count === 0}
                  style={{ padding: 14, borderRadius: 10, cursor: hasClip && count > 0 ? "pointer" : "default", backgroundColor: hasClip && count > 0 ? `${color}10` : "var(--secondary)", border: `1px solid ${hasClip && count > 0 ? color + "40" : "rgba(255,255,255,0.07)"}`, textAlign: "left" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <FolderOpen size={16} style={{ color: count > 0 ? color : "var(--muted-foreground)" }} />
                    {hasClip && count > 0 && <CheckCircle2 size={13} style={{ color }} />}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: count > 0 ? color : "var(--muted-foreground)" }}>{count}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{label}</div>
                  <div style={{ fontSize: 10, color: hasClip && count > 0 ? color : "var(--muted-foreground)", marginTop: 4 }}>
                    {hasClip && count > 0 ? "▶ Abrir video" : count === 0 ? "Sin detecciones" : "Sin dataset aún"}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Video + stats */}
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2">
            {result?.output_path
              ? <VideoPlayer src={result.output_path} events={result.events} />
              : <div className="rounded-xl border flex items-center justify-center" style={{ height: 300, backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)", color: "var(--muted-foreground)", fontSize: 13 }}>Video no disponible</div>
            }
          </div>
          <div className="space-y-3">
            {[
              { label: "Line-outs detectados", value: String(lo), color: "#39e07a" },
              { label: "Scrums detectados",    value: String(sc), color: "#3b82f6" },
              { label: "Salidas 22",           value: String(ko), color: "#f59e0b" },
              { label: "Duración del partido", value: `${Math.floor((result?.video_duration_sec??0)/60)}:${String(Math.round((result?.video_duration_sec??0)%60)).padStart(2,"0")}`, color: "#6b7a99" },
              { label: "Confianza promedio",   value: result?.events?.length ? `${(result.events.reduce((a,e)=>a+e.confidence,0)/result.events.length*100).toFixed(1)}%` : "—", color: "#39e07a" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl border" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
                  <Zap size={14} style={{ color }} />
                </div>
                <div>
                  <div className="font-mono" style={{ fontWeight: 600, fontSize: 16, color: "var(--foreground)" }}>{value}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-5">
          <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 8 }}>Posesión por Minuto</div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={possessionData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="gH" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#39e07a" stopOpacity={0.3} /><stop offset="95%" stopColor="#39e07a" stopOpacity={0.02} /></linearGradient>
                  <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="min" tick={{ fill: "#6b7a99", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}'`} />
                <YAxis tick={{ fill: "#6b7a99", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="home" stroke="#39e07a" strokeWidth={2} fill="url(#gH)" dot={false} />
                <Area type="monotone" dataKey="away" stroke="#3b82f6" strokeWidth={2} fill="url(#gA)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 12 }}>Timeline de Eventos</div>
            <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: 200 }}>
              {(result?.events ?? []).map((ev, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <span className="font-mono shrink-0" style={{ fontSize: 11, color: "var(--muted-foreground)", width: 40 }}>{ev.time_str}</span>
                  <div className="px-2 py-0.5 rounded text-xs font-mono shrink-0" style={{ backgroundColor: `${typeColor[ev.label] ?? "#6b7a99"}18`, color: typeColor[ev.label] ?? "#6b7a99", fontWeight: 500 }}>{ev.label}</div>
                  <span style={{ fontSize: 11, color: "var(--foreground)", flex: 1 }}>Local</span>
                  <span className="font-mono shrink-0" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{Math.round(ev.confidence * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
