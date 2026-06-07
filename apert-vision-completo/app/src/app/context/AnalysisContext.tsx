/**
 * AnalysisContext — estado global del análisis.
 * Persiste mientras la app está abierta, independientemente de la navegación.
 * El análisis sigue corriendo en segundo plano aunque cambies de pantalla.
 */
import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react"

export interface DetectedEvent {
  event_type: string
  label: string
  time_str: string
  second: number
  frame: number
  confidence: number
}

export interface MatchInfo {
  rival: string
  date: string
  result: "W" | "L" | "D"
  score: string
}

export interface AnalysisResult {
  total_events: number
  event_counts: Record<string, number>
  video_duration_sec: number
  processing_time_sec: number
  output_path: string
  clips: Record<string, string>
  events: DetectedEvent[]
}

export type AnalysisPhase = "idle" | "analyzing" | "done" | "error"

interface AnalysisContextValue {
  phase: AnalysisPhase
  progress: number
  progressPhase: string
  events: DetectedEvent[]
  matchInfo: MatchInfo | null
  result: AnalysisResult | null
  videoPath: string
  error: string | null

  startAnalysis: (videoPath: string, outputPath: string, info: MatchInfo, conf?: number) => Promise<void>
  stopAnalysis: () => Promise<void>
  clearAnalysis: () => void
  setVideoPath: (p: string) => void
}

const Ctx = createContext<AnalysisContextValue | null>(null)

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase]               = useState<AnalysisPhase>("idle")
  const [progress, setProgress]         = useState(0)
  const [progressPhase, setProgressPhase] = useState("")
  const [events, setEvents]             = useState<DetectedEvent[]>([])
  const [matchInfo, setMatchInfo]       = useState<MatchInfo | null>(null)
  const [result, setResult]             = useState<AnalysisResult | null>(null)
  const [videoPath, setVideoPath]       = useState("")
  const [error, setError]               = useState<string | null>(null)
  const cleanupRef                      = useRef<(() => void)[]>([])

  // Limpiar listeners al desmontar
  useEffect(() => () => { cleanupRef.current.forEach(fn => fn()) }, [])

  const clearAnalysis = useCallback(() => {
    setPhase("idle")
    setProgress(0)
    setProgressPhase("")
    setEvents([])
    setMatchInfo(null)
    setResult(null)
    setError(null)
    setVideoPath("")
    localStorage.removeItem("apert_pending_video")
  }, [])

  const stopAnalysis = useCallback(async () => {
    cleanupRef.current.forEach(fn => fn())
    cleanupRef.current = []
    if (window.apertAPI) await window.apertAPI.stopAnalysis()
    setPhase("idle")
    setProgressPhase("Análisis detenido.")
  }, [])

  const startAnalysis = useCallback(async (
    vPath: string, outputPath: string, info: MatchInfo, conf = 0.45
  ) => {
    // Cancelar cualquier análisis previo
    cleanupRef.current.forEach(fn => fn())
    cleanupRef.current = []

    setVideoPath(vPath)
    localStorage.removeItem("apert_pending_video") // consumido, ya no persiste
    setMatchInfo(info)
    setPhase("analyzing")
    setProgress(0)
    setProgressPhase("Iniciando modelo YOLO...")
    setEvents([])
    setError(null)
    setResult(null)

    const PHASES = [
      "Iniciando modelo YOLO...",
      "Analizando frames...",
      "Detectando formaciones...",
      "Extrayendo clips...",
      "Generando reporte...",
    ]

    if (!window.apertAPI) {
      // Modo simulación (browser / sin Electron)
      let pct = 0
      const fakeEvents: DetectedEvent[] = [
        { event_type: "lineout", label: "Line-out", time_str: "02:14", second: 134, frame: 3350, confidence: 0.97 },
        { event_type: "scrum",   label: "Scrum",    time_str: "07:41", second: 461, frame: 11525, confidence: 0.94 },
        { event_type: "lineout", label: "Line-out", time_str: "12:08", second: 728, frame: 18200, confidence: 0.99 },
        { event_type: "kickoff", label: "Salida 22", time_str: "18:33", second: 1113, frame: 27825, confidence: 0.91 },
        { event_type: "lineout", label: "Line-out", time_str: "24:55", second: 1495, frame: 37375, confidence: 0.96 },
        { event_type: "scrum",   label: "Scrum",    time_str: "31:17", second: 1877, frame: 46925, confidence: 0.93 },
        { event_type: "lineout", label: "Line-out", time_str: "38:02", second: 2282, frame: 57050, confidence: 0.98 },
      ]
      let evIdx = 0
      const tick = setInterval(() => {
        pct += 1.5
        setProgress(Math.min(Math.round(pct), 100))
        setProgressPhase(PHASES[Math.min(Math.floor(pct / 20), PHASES.length - 1)])
        if (evIdx < fakeEvents.length && pct > (evIdx + 1) * (100 / fakeEvents.length)) {
          setEvents(prev => [...prev, fakeEvents[evIdx]])
          evIdx++
        }
        if (pct >= 100) {
          clearInterval(tick)
          const stats: AnalysisResult = {
            total_events: fakeEvents.length,
            event_counts: { lineout: 4, scrum: 2, kickoff: 1 },
            video_duration_sec: 4800, processing_time_sec: 87,
            output_path: outputPath, clips: {}, events: fakeEvents,
          }
          setResult(stats)
          setPhase("done")
          saveToStorage(info, stats)
        }
      }, 80)
      return
    }

    // Modo Electron — real
    const rmProgress = window.apertAPI.onProgress(({ pct }) => {
      setProgress(pct)
      setProgressPhase(PHASES[Math.min(Math.floor(pct / 20), PHASES.length - 1)])
    })
    const rmEvent = window.apertAPI.onEvent((ev) => {
      setEvents(prev => [...prev, ev])
    })
    const rmFinished = window.apertAPI.onFinished((stats) => {
      cleanupRef.current.forEach(fn => fn())
      cleanupRef.current = []
      setResult(stats)
      setPhase("done")
      saveToStorage(info, stats)
      // Notificación nativa
      window.apertAPI?.showNotification?.(
        "Análisis completado",
        `${stats.total_events} formaciones detectadas en el partido contra ${info.rival}`
      )
    })
    const rmError = window.apertAPI.onError(({ message }) => {
      cleanupRef.current.forEach(fn => fn())
      cleanupRef.current = []
      setError(message)
      setPhase("error")
    })
    cleanupRef.current = [rmProgress, rmEvent, rmFinished, rmError]

    const res = await window.apertAPI.analyzeVideo({
      videoPath: vPath, outputPath, confidence: conf, mode: "detection",
    })
    if (res.error) {
      setError(res.error)
      setPhase("error")
    }
  }, [])

  return (
    <Ctx.Provider value={{
      phase, progress, progressPhase, events, matchInfo,
      result, videoPath, error,
      startAnalysis, stopAnalysis, clearAnalysis, setVideoPath,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAnalysis() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useAnalysis must be inside AnalysisProvider")
  return ctx
}

// ── Guardar en localStorage ─────────────────────────────────────────────────
function saveToStorage(info: MatchInfo, stats: AnalysisResult) {
  const existing = JSON.parse(localStorage.getItem("analyzed_matches") || "[]")
  const match = {
    id: Date.now(),
    rival: info.rival, date: info.date, result: info.result, score: info.score,
    competition: "Super Rugby Doméstico", analyzed: true,
    lineouts:  stats.event_counts?.lineout  ?? 0,
    scrums:    stats.event_counts?.scrum    ?? 0,
    kickoffs:  stats.event_counts?.kickoff  ?? 0,
    total_events: stats.total_events,
    duration_sec: stats.video_duration_sec,
    processing_time_sec: stats.processing_time_sec,
    output_path: stats.output_path,
    clips: stats.clips ?? {},
    events: stats.events,
    analyzedAt: new Date().toISOString(),
  }
  localStorage.setItem("analyzed_matches", JSON.stringify([match, ...existing]))
}
