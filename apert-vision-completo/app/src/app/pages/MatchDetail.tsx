import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router"
import { Play, Pause, Download, Zap, ArrowLeft, Home, Plane, Film, AlertCircle, Trash2 } from "lucide-react"
import { supabase, Partido, Evento } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import jsPDF from "jspdf"

type ClipRow = { tipo: "lineout" | "scrum" | "kickoff"; url_storage: string }
type VideoSource = "full" | "lineout" | "scrum" | "kickoff"

const typeColor: Record<string, string> = {
  lineout: "#39e07a",
  scrum:   "#3b82f6",
  kickoff: "#f59e0b",
}
const typeLabel: Record<string, string> = {
  lineout: "Line-out",
  scrum:   "Scrum",
  kickoff: "Salida 22",
}

// ── Video Player ───────────────────────────────────────────────────────────
function VideoPlayer({ src, events, seekable }: {
  src: string
  events?: Evento[]
  seekable: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying]         = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration]       = useState(0)

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setPlaying(true) }
    else          { v.pause(); setPlaying(false) }
  }

  const seekTo = (sec: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = sec
      videoRef.current.play(); setPlaying(true)
    }
  }

  const fmt = (s: number) => `${Math.floor(s/60).toString().padStart(2,"0")}:${Math.floor(s%60).toString().padStart(2,"0")}`

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const v = videoRef.current
      if (!v) return
      if (e.code === "Space") { e.preventDefault(); togglePlay() }
      if (e.code === "ArrowLeft")  v.currentTime = Math.max(0, v.currentTime - 10)
      if (e.code === "ArrowRight") v.currentTime = Math.min(v.duration, v.currentTime + 10)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  return (
    <div className="rounded-xl overflow-hidden border" style={{ backgroundColor: "#000", borderColor: "rgba(255,255,255,0.07)" }}>
      <div style={{ width: "100%", aspectRatio: "16/9", backgroundColor: "#000", overflow: "hidden" }}>
        <video ref={videoRef} src={src} key={src}
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", backgroundColor: "#000" }}
          onTimeUpdate={e => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
          onLoadedMetadata={e => setDuration((e.target as HTMLVideoElement).duration)}
          onEnded={() => setPlaying(false)} controls={false} />
      </div>
      <div className="px-4 py-3 border-t" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="relative h-1.5 rounded-full mb-3 cursor-pointer"
          style={{ backgroundColor: "var(--secondary)" }}
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect()
            const pct = (e.clientX - rect.left) / rect.width
            seekTo(pct * duration)
          }}>
          <div className="absolute h-full rounded-full left-0 top-0"
            style={{ width: duration ? `${(currentTime/duration)*100}%` : "0%",
              backgroundColor: "var(--primary)", transition: "width 0.1s" }} />
          {duration > 0 && seekable && (events ?? []).map((ev, i) => (
            <div key={i} className="absolute w-2 h-2 rounded-full -top-0.5 cursor-pointer hover:scale-150 transition-transform"
              style={{ left: `calc(${(ev.timestamp_seg / duration) * 100}% - 4px)`,
                backgroundColor: typeColor[ev.tipo], zIndex: 2 }}
              onClick={e => { e.stopPropagation(); seekTo(ev.timestamp_seg) }}
              title={`${typeLabel[ev.tipo]} - ${fmt(ev.timestamp_seg)}`} />
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={togglePlay} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
            {playing ? <Pause size={18} style={{ color: "var(--foreground)" }} /> : <Play size={18} style={{ color: "var(--foreground)" }} />}
          </button>
          <span className="font-mono" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            {fmt(currentTime)} / {fmt(duration)}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function MatchDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { club } = useAuth()

  const [partido, setPartido] = useState<Partido | null>(null)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [clips, setClips]     = useState<ClipRow[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const [videoSource, setVideoSource] = useState<VideoSource>("full")
  const [videoSrc, setVideoSrc]       = useState<string>("")
  const [videoStatus, setVideoStatus] = useState<"loading"|"ok"|"missing">("loading")

  // Load match
  useEffect(() => { (async () => {
    if (!id) return
    const [pRes, eRes, cRes] = await Promise.all([
      supabase.from("partidos").select("*").eq("id", id).maybeSingle(),
      supabase.from("eventos").select("*").eq("partido_id", id).order("timestamp_seg", { ascending: true }),
      supabase.from("clips").select("tipo, url_storage").eq("partido_id", id),
    ])
    if (pRes.error || !pRes.data) { setNotFound(true); setLoading(false); return }
    setPartido(pRes.data)
    setEventos(eRes.data ?? [])
    setClips(cRes.data ?? [])
    setLoading(false)
  })() }, [id])

  // Resolve video source
  useEffect(() => { (async () => {
    if (!partido) return
    setVideoStatus("loading"); setError(null)

    if (videoSource === "full") {
      if (!partido.video_path) { setVideoStatus("missing"); return }
      const fileUrl = `file:///${partido.video_path.replace(/\\/g, "/")}`
      // No tenemos forma trivial de chequear si el archivo existe; intentamos cargar
      setVideoSrc(fileUrl); setVideoStatus("ok")
    } else {
      // Clip de Supabase Storage
      const clip = clips.find(c => c.tipo === videoSource)
      if (!clip) { setVideoStatus("missing"); return }
      const { data, error } = await supabase.storage.from("clips").createSignedUrl(clip.url_storage, 3600)
      if (error || !data) { setError(error?.message ?? "Error firmando URL"); setVideoStatus("missing"); return }
      setVideoSrc(data.signedUrl); setVideoStatus("ok")
    }
  })() }, [partido, videoSource, clips])

  const counts = {
    lineout: eventos.filter(e => e.tipo === "lineout").length,
    scrum:   eventos.filter(e => e.tipo === "scrum").length,
    kickoff: eventos.filter(e => e.tipo === "kickoff").length,
  }
  const confAvg = eventos.length
    ? eventos.reduce((s, e) => s + (e.confianza ?? 0), 0) / eventos.length * 100
    : 0

  const handleDelete = async () => {
    if (!partido) return
    if (!confirm("¿Eliminar este partido? Se borran eventos y clips. No se puede deshacer.")) return
    const { error } = await supabase.from("partidos").delete().eq("id", partido.id)
    if (error) { alert(error.message); return }
    navigate("/matches")
  }

  // ── PDF export ────────────────────────────────────────────────────────────
  const exportPDF = () => {
    if (!partido) return
    const doc = new jsPDF()
    const green: [number,number,number] = [57, 224, 122]
    const dark:  [number,number,number] = [8,  12,  20]
    const gray:  [number,number,number] = [107, 122, 153]
    const clubName = club?.nombre ?? "Mi Club"

    doc.setFillColor(...dark)
    doc.rect(0, 0, 210, 297, "F")
    doc.setFillColor(...green)
    doc.rect(0, 0, 210, 40, "F")
    doc.setTextColor(8, 12, 20).setFontSize(20).setFont("helvetica", "bold")
    doc.text("APERT VISION", 15, 18)
    doc.setFontSize(10).text("Rugby Analytics — Reporte de partido", 15, 27)
    doc.setFontSize(11).text(`${clubName} vs. ${partido.rival}`, 15, 35)

    doc.setTextColor(232, 234, 240).setFontSize(13)
    doc.text(`${clubName} vs. ${partido.rival}`, 15, 55)
    doc.setFontSize(10).setTextColor(...gray)
    const res = partido.resultado === "W" ? "Victoria" : partido.resultado === "L" ? "Derrota" : "Empate"
    const ven = partido.es_local ? "Local" : "Visitante"
    doc.text(`Fecha: ${partido.fecha}   ${ven}   Resultado: ${res} ${partido.marcador ?? ""}`, 15, 63)

    doc.setDrawColor(...green).setLineWidth(0.5).line(15, 78, 195, 78)
    doc.setTextColor(232, 234, 240).setFontSize(12).text("Estadísticas", 15, 86)
    const statsData = [
      ["Line-outs", String(counts.lineout)],
      ["Scrums",    String(counts.scrum)],
      ["Salidas",   String(counts.kickoff)],
      ["Total",     String(eventos.length)],
      ["Confianza promedio", `${confAvg.toFixed(1)}%`],
    ]
    doc.setFontSize(10)
    statsData.forEach(([l, v], i) => {
      doc.setTextColor(...gray).text(l, 15, 96 + i * 8)
      doc.setTextColor(...green).setFont("helvetica", "bold").text(v, 100, 96 + i * 8)
      doc.setFont("helvetica", "normal")
    })

    doc.line(15, 140, 195, 140)
    doc.setTextColor(232, 234, 240).setFontSize(12).text("Timeline de eventos", 15, 149)
    const headers = ["Minuto", "Tipo", "Confianza"]; const colX = [15, 55, 130]
    doc.setTextColor(...gray).setFontSize(9)
    headers.forEach((h, i) => doc.text(h, colX[i], 158))
    doc.line(15, 161, 195, 161)
    eventos.slice(0, 20).forEach((ev, i) => {
      const y = 169 + i * 8; if (y > 280) return
      doc.setTextColor(232, 234, 240)
      const m = Math.floor(ev.timestamp_seg/60), s = Math.floor(ev.timestamp_seg%60)
      doc.text(`${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`, colX[0], y)
      const c = ev.tipo === "lineout" ? [57,224,122] : ev.tipo === "scrum" ? [59,130,246] : [245,158,11]
      doc.setTextColor(...(c as [number,number,number])).text(typeLabel[ev.tipo], colX[1], y)
      doc.setTextColor(...gray).text(`${((ev.confianza ?? 0)*100).toFixed(0)}%`, colX[2], y)
    })

    doc.save(`partido_${partido.rival.replace(/\s/g,"_")}_${partido.fecha}.pdf`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Cargando partido...</span>
      </div>
    )
  }

  if (notFound || !partido) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <AlertCircle size={32} style={{ color: "var(--muted-foreground)" }} />
        <div style={{ fontSize: 15, color: "var(--foreground)" }}>Partido no encontrado</div>
        <button onClick={() => navigate("/matches")}
          style={{ padding: "8px 16px", borderRadius: 8, backgroundColor: "var(--primary)", color: "var(--primary-foreground)",
            border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
          Volver a Partidos
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b shrink-0"
        style={{ backgroundColor: "var(--background)", borderColor: "rgba(255,255,255,0.07)", minHeight: 52 }}>
        <div>
          <button onClick={() => navigate("/matches")}
            className="flex items-center gap-1.5"
            style={{ fontSize: 12, color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer", marginBottom: 2 }}>
            <ArrowLeft size={12} /> Partidos
          </button>
          <div className="flex items-center gap-2" style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)" }}>
            <span>{club?.nombre ?? "Mi Club"} vs. {partido.rival}</span>
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded font-mono"
              style={{ fontSize: 10, backgroundColor: partido.es_local ? "rgba(57,224,122,0.1)" : "rgba(59,130,246,0.1)",
                color: partido.es_local ? "#39e07a" : "#3b82f6" }}>
              {partido.es_local ? <><Home size={9} /> LOCAL</> : <><Plane size={9} /> VISITANTE</>}
            </span>
            {partido.marcador && (
              <span className="font-mono px-2 py-0.5 rounded" style={{ fontSize: 12, backgroundColor: "var(--secondary)", color: "var(--foreground)" }}>
                {partido.marcador}
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 1 }}>
            {partido.fecha} · {eventos.length} formaciones detectadas
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg"
            style={{ backgroundColor: "transparent", color: "#ef4444",
              border: "1px solid rgba(239,68,68,0.3)", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
            <Trash2 size={12} /> Eliminar
          </button>
          <button onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)",
              border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            <Download size={13} /> Exportar PDF
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-5">
        {/* Selector de video */}
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ fontSize: 12, color: "var(--muted-foreground)", marginRight: 6 }}>Reproducir:</span>
          {[
            { key: "full", label: "Partido completo", color: "#6b7a99", icon: Film, available: !!partido.video_path },
            { key: "lineout", label: `Line-outs (${counts.lineout})`, color: "#39e07a", icon: Film, available: !!clips.find(c => c.tipo === "lineout") },
            { key: "scrum",   label: `Scrums (${counts.scrum})`,     color: "#3b82f6", icon: Film, available: !!clips.find(c => c.tipo === "scrum") },
            { key: "kickoff", label: `Salidas (${counts.kickoff})`,  color: "#f59e0b", icon: Film, available: !!clips.find(c => c.tipo === "kickoff") },
          ].map(({ key, label, color, icon: Icon, available }) => (
            <button key={key} onClick={() => available && setVideoSource(key as VideoSource)} disabled={!available}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ fontSize: 12, fontWeight: 500, border: "1px solid",
                backgroundColor: videoSource === key && available ? `${color}15` : "var(--card)",
                color: !available ? "var(--muted-foreground)" : videoSource === key ? color : "var(--foreground)",
                borderColor: videoSource === key && available ? `${color}50` : "rgba(255,255,255,0.07)",
                cursor: available ? "pointer" : "not-allowed",
                opacity: available ? 1 : 0.5 }}>
              <Icon size={11} /> {label}
            </button>
          ))}
        </div>

        {/* Video + stats */}
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2">
            {videoStatus === "loading" && (
              <div className="rounded-xl border flex items-center justify-center"
                style={{ aspectRatio: "16/9", backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
                <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Cargando video...</span>
              </div>
            )}
            {videoStatus === "missing" && (
              <div className="rounded-xl border flex flex-col items-center justify-center gap-3"
                style={{ aspectRatio: "16/9", backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
                <Film size={40} style={{ color: "var(--muted-foreground)", opacity: 0.4 }} />
                <div style={{ fontSize: 14, color: "var(--foreground)" }}>
                  {videoSource === "full"
                    ? (partido.video_path ? "Video local no encontrado en este equipo" : "Video original no disponible")
                    : "Clip no disponible"}
                </div>
                {videoSource === "full" && partido.video_path && (
                  <div className="font-mono px-3 py-1 rounded" style={{ fontSize: 10, color: "var(--muted-foreground)", backgroundColor: "var(--secondary)" }}>
                    {partido.video_path}
                  </div>
                )}
              </div>
            )}
            {videoStatus === "ok" && videoSrc && (
              <VideoPlayer src={videoSrc}
                events={videoSource === "full" ? eventos : []}
                seekable={videoSource === "full"} />
            )}
            {error && (
              <div className="mt-2 px-3 py-2 rounded-lg flex items-center gap-2"
                style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 12, color: "#ef4444" }}>
                <AlertCircle size={13} /> {error}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {[
              { label: "Line-outs", value: String(counts.lineout), color: "#39e07a" },
              { label: "Scrums",    value: String(counts.scrum),   color: "#3b82f6" },
              { label: "Salidas 22",value: String(counts.kickoff), color: "#f59e0b" },
              { label: "Total formaciones", value: String(eventos.length), color: "#a855f7" },
              { label: "Confianza IA promedio", value: eventos.length ? `${confAvg.toFixed(1)}%` : "—", color: "#39e07a" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl border"
                style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}15` }}>
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

        {/* Timeline de eventos */}
        <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--foreground)", marginBottom: 12 }}>
            Timeline de eventos
          </div>
          {eventos.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Sin eventos detectados.</p>
          ) : (
            <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: 320 }}>
              {eventos.map((ev) => {
                const m = Math.floor(ev.timestamp_seg/60), s = Math.floor(ev.timestamp_seg%60)
                const timeStr = `${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`
                return (
                  <div key={ev.id} className="flex items-center gap-3 py-1.5 border-b"
                    style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <span className="font-mono shrink-0" style={{ fontSize: 11, color: "var(--muted-foreground)", width: 44 }}>{timeStr}</span>
                    <div className="px-2 py-0.5 rounded text-xs font-mono shrink-0"
                      style={{ backgroundColor: `${typeColor[ev.tipo]}18`, color: typeColor[ev.tipo], fontWeight: 500 }}>
                      {typeLabel[ev.tipo]}
                    </div>
                    <span style={{ fontSize: 11, color: "var(--foreground)", flex: 1 }}>
                      {partido.es_local ? "Local" : "Visitante"}
                    </span>
                    <span className="font-mono shrink-0" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                      {Math.round((ev.confianza ?? 0) * 100)}%
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
