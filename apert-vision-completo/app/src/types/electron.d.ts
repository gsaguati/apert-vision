export interface AnalysisParams {
  videoPath: string; outputPath: string; confidence: number; mode: "detection" | "segmentation"
}
export interface ProgressMsg { type: "progress"; current: number; total: number; pct: number }
export interface EventMsg { type: "event"; event_type: string; label: string; frame: number; second: number; time_str: string; confidence: number }
export interface FinishedMsg { type: "finished"; total_events: number; event_counts: Record<string, number>; video_duration_sec: number; processing_time_sec: number; output_path: string; clips: Record<string, string>; events: Omit<EventMsg, "type">[] }
export interface ErrorMsg { type: "error"; message: string }

export interface ApertAPI {
  openFileDialog:   ()                           => Promise<string | null>
  saveFileDialog:   (defaultPath?: string)       => Promise<string | null>
  openExternal:     (filePath: string)           => Promise<void>
  getPythonInfo:    ()                           => Promise<{ python: string; script: string; exists: boolean }>
  analyzeVideo:     (params: AnalysisParams)     => Promise<{ started?: boolean; error?: string }>
  stopAnalysis:     ()                           => Promise<{ stopped: boolean }>
  onProgress:       (cb: (d: ProgressMsg)  => void) => () => void
  onEvent:          (cb: (d: EventMsg)     => void) => () => void
  onFinished:       (cb: (d: FinishedMsg)  => void) => () => void
  onError:          (cb: (d: ErrorMsg)     => void) => () => void
  showNotification: (title: string, body: string) => Promise<void>
  getSettings:      ()                           => Promise<Record<string, any>>
  saveSettings:     (s: Record<string, any>)     => Promise<{ ok: boolean }>
  readFile:         (filePath: string)           => Promise<{ ok: true; data: Uint8Array } | { ok: false; error: string }>
}

declare global {
  interface Window { apertAPI?: ApertAPI }
}
