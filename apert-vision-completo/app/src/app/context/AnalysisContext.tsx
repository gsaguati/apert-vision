/**
 * AnalysisContext — estado global del análisis.
 * Persiste mientras la app está abierta, independientemente de la navegación.
 * El análisis sigue corriendo en segundo plano aunque cambies de pantalla.
 * Cuando finaliza, sube automáticamente clips a Supabase Storage y registra el partido.
 */
import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react"
import { useAuth } from "./AuthContext"
import { supabase } from "../lib/supabase"

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
  fecha: string                          // YYYY-MM-DD
  es_local: boolean
  resultado: "W" | "L" | "D"
  marcador: string
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
export type UploadPhase   = "idle" | "uploading" | "uploaded" | "error"

interface AnalysisContextValue {
  phase: AnalysisPhase
  progress: number
  progressPhase: string
  events: DetectedEvent[]
  matchInfo: MatchInfo | null
  result: AnalysisResult | null
  videoPath: string
  error: string | null

  // Upload a Supabase
  uploadPhase: UploadPhase
  uploadProgress: number
  uploadPhaseLabel: string
  uploadError: string | null
  partidoId: string | null
  saveToCloud: () => Promise<void>

  startAnalysis: (videoPath: string, outputPath: string, info: MatchInfo, conf?: number) => Promise<void>
  stopAnalysis:  () => Promise<void>
  clearAnalysis: () => void
  setVideoPath:  (p: string) => void
}

const Ctx = createContext<AnalysisContextValue | null>(null)

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const { club, miembro } = useAuth()

  const [phase, setPhase]               = useState<AnalysisPhase>("idle")
  const [progress, setProgress]         = useState(0)
  const [progressPhase, setProgressPhase] = useState("")
  const [events, setEvents]             = useState<DetectedEvent[]>([])
  const [matchInfo, setMatchInfo]       = useState<MatchInfo | null>(null)
  const [result, setResult]             = useState<AnalysisResult | null>(null)
  const [videoPath, setVideoPath]       = useState("")
  const [error, setError]               = useState<string | null>(null)

  const [uploadPhase, setUploadPhase]     = useState<UploadPhase>("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadPhaseLabel, setUploadPhaseLabel] = useState("")
  const [uploadError, setUploadError]     = useState<string | null>(null)
  const [partidoId, setPartidoId]         = useState<string | null>(null)

  const cleanupRef    = useRef<(() => void)[]>([])
  const autoSavedRef  = useRef(false)

  // Limpiar listeners al desmontar
  useEffect(() => () => { cleanupRef.current.forEach(fn => fn()) }, [])

  const clearAnalysis = useCallback(() => {
    setPhase("idle"); setProgress(0); setProgressPhase("")
    setEvents([]); setMatchInfo(null); setResult(null)
    setError(null); setVideoPath("")
    setUploadPhase("idle"); setUploadProgress(0); setUploadPhaseLabel("")
    setUploadError(null); setPartidoId(null)
    autoSavedRef.current = false
    localStorage.removeItem("apert_pending_video")
  }, [])

  const stopAnalysis = useCallback(async () => {
    cleanupRef.current.forEach(fn => fn())
    cleanupRef.current = []
    if (window.apertAPI) await window.apertAPI.stopAnalysis()
    setPhase("idle")
    setProgressPhase("Análisis detenido.")
  }, [])

  // ── Subir a Supabase ────────────────────────────────────────────
  const saveToCloud = useCallback(async () => {
    if (!club || !miembro) { setUploadError("Sin sesión activa"); setUploadPhase("error"); return }
    if (!result || !matchInfo) { setUploadError("Sin datos para guardar"); setUploadPhase("error"); return }

    setUploadPhase("uploading"); setUploadError(null); setUploadProgress(0)

    try {
      // 1) Crear partido — o reutilizar si ya existe (retry)
      let pid = partidoId
      if (!pid) {
        setUploadPhaseLabel("Creando partido en la nube...")
        const { data: partidoData, error: pErr } = await supabase
          .from("partidos")
          .insert({
            club_id:    club.id,
            creado_por: miembro.id,
            rival:      matchInfo.rival,
            fecha:      matchInfo.fecha,
            es_local:   matchInfo.es_local,
            resultado:  matchInfo.resultado,
            marcador:   matchInfo.marcador || null,
          })
          .select("id")
          .single()
        if (pErr) throw pErr
        pid = partidoData.id as string
        setPartidoId(pid)
      }
      setUploadProgress(10)

      // 2) Insertar eventos — borrar previos y reinsertar (idempotente)
      setUploadPhaseLabel(`Guardando ${result.events.length} eventos...`)
      await supabase.from("eventos").delete().eq("partido_id", pid)
      if (result.events.length > 0) {
        const eventosRows = result.events.map(ev => ({
          partido_id:    pid,
          tipo:          ev.event_type,
          timestamp_seg: ev.second,
          confianza:     ev.confidence,
        }))
        const { error: eErr } = await supabase.from("eventos").insert(eventosRows)
        if (eErr) throw eErr
      }
      setUploadProgress(20)

      // Limpiar entradas viejas en tabla clips (storage usa upsert)
      await supabase.from("clips").delete().eq("partido_id", pid)

      // 3) Subir clips uno por uno
      const tipos: Array<"lineout" | "scrum" | "kickoff"> = ["lineout", "scrum", "kickoff"]
      const tiposConClip = tipos.filter(t => result.clips?.[t])
      const totalClips = tiposConClip.length || 1

      for (let i = 0; i < tiposConClip.length; i++) {
        const tipo = tiposConClip[i]
        const localPath = result.clips[tipo]
        setUploadPhaseLabel(`Subiendo clip ${i + 1}/${tiposConClip.length}: ${tipo}...`)

        // Leer archivo local vía IPC (devuelve Buffer)
        if (!window.apertAPI?.readFile) {
          throw new Error("readFile no disponible (modo browser)")
        }
        const fileRes = await window.apertAPI.readFile(localPath)
        if (!fileRes.ok) throw new Error(`Error leyendo clip ${tipo}: ${fileRes.error}`)

        // Buffer/Uint8Array -> Blob para Supabase
        const blob = new Blob([fileRes.data], { type: "video/mp4" })
        const storagePath = `${club.id}/${pid}/${tipo}.mp4`

        const { error: upErr } = await supabase.storage
          .from("clips")
          .upload(storagePath, blob, { contentType: "video/mp4", upsert: true })
        if (upErr) throw upErr

        // Registrar el clip en la tabla
        const { error: cErr } = await supabase.from("clips").insert({
          partido_id:  pid,
          tipo,
          url_storage: storagePath,
        })
        if (cErr) throw cErr

        setUploadProgress(20 + Math.round(((i + 1) / totalClips) * 75))
      }

      setUploadProgress(100)
      setUploadPhaseLabel("¡Listo!")
      setUploadPhase("uploaded")
    } catch (e: any) {
      console.error("[saveToCloud] error:", e)
      setUploadError(e?.message ?? String(e))
      setUploadPhase("error")
    }
  }, [club, miembro, result, matchInfo, partidoId])

  // Auto-subir cuando termina el análisis
  useEffect(() => {
    if (phase === "done" && !autoSavedRef.current && club && miembro && result && matchInfo) {
      autoSavedRef.current = true
      saveToCloud()
    }
  }, [phase, club, miembro, result, matchInfo, saveToCloud])

  const startAnalysis = useCallback(async (
    vPath: string, outputPath: string, info: MatchInfo, conf = 0.45
  ) => {
    cleanupRef.current.forEach(fn => fn())
    cleanupRef.current = []
    autoSavedRef.current = false

    setVideoPath(vPath)
    localStorage.removeItem("apert_pending_video")
    setMatchInfo(info)
    setPhase("analyzing"); setProgress(0); setProgressPhase("Iniciando modelo YOLO...")
    setEvents([]); setError(null); setResult(null)
    setUploadPhase("idle"); setUploadProgress(0); setUploadPhaseLabel("")
    setUploadError(null); setPartidoId(null)

    const PHASES = [
      "Iniciando modelo YOLO...",
      "Analizando frames...",
      "Detectando formaciones...",
      "Extrayendo clips...",
      "Generando reporte...",
    ]

    if (!window.apertAPI) {
      // Simulación
      let pct = 0
      const fakeEvents: DetectedEvent[] = [
        { event_type: "lineout", label: "Line-out", time_str: "02:14", second: 134,  frame: 3350,  confidence: 0.97 },
        { event_type: "scrum",   label: "Scrum",    time_str: "07:41", second: 461,  frame: 11525, confidence: 0.94 },
        { event_type: "lineout", label: "Line-out", time_str: "12:08", second: 728,  frame: 18200, confidence: 0.99 },
        { event_type: "kickoff", label: "Salida 22", time_str: "18:33", second: 1113, frame: 27825, confidence: 0.91 },
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
            event_counts: { lineout: 2, scrum: 1, kickoff: 1 },
            video_duration_sec: 4800, processing_time_sec: 87,
            output_path: outputPath, clips: {}, events: fakeEvents,
          }
          setResult(stats); setPhase("done")
        }
      }, 80)
      return
    }

    // Electron — real
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
      setResult(stats); setPhase("done")
      window.apertAPI?.showNotification?.(
        "Análisis completado",
        `${stats.total_events} formaciones detectadas en el partido contra ${info.rival}`
      )
    })
    const rmError = window.apertAPI.onError(({ message }) => {
      cleanupRef.current.forEach(fn => fn())
      cleanupRef.current = []
      setError(message); setPhase("error")
    })
    cleanupRef.current = [rmProgress, rmEvent, rmFinished, rmError]

    const res = await window.apertAPI.analyzeVideo({
      videoPath: vPath, outputPath, confidence: conf, mode: "detection",
    })
    if (res.error) { setError(res.error); setPhase("error") }
  }, [])

  return (
    <Ctx.Provider value={{
      phase, progress, progressPhase, events, matchInfo,
      result, videoPath, error,
      uploadPhase, uploadProgress, uploadPhaseLabel, uploadError, partidoId, saveToCloud,
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
