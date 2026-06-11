const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('apertAPI', {
  // ── Diálogos ──────────────────────────────────────────────────
  openFileDialog:  ()              => ipcRenderer.invoke('open-file-dialog'),
  saveFileDialog:  (defaultPath)   => ipcRenderer.invoke('save-file-dialog', defaultPath),
  openExternal:    (filePath)      => ipcRenderer.invoke('open-external', filePath),
  getPythonInfo:   ()              => ipcRenderer.invoke('get-python-info'),
  readFile:        (filePath)      => ipcRenderer.invoke('read-file', filePath),

  // ── Análisis ──────────────────────────────────────────────────
  analyzeVideo: (params)  => ipcRenderer.invoke('analyze-video', params),
  stopAnalysis: ()        => ipcRenderer.invoke('stop-analysis'),

  // ── Eventos del análisis ──────────────────────────────────────
  onProgress: (cb) => {
    const fn = (_, data) => cb(data)
    ipcRenderer.on('analysis-progress', fn)
    return () => ipcRenderer.removeListener('analysis-progress', fn)
  },
  onEvent: (cb) => {
    const fn = (_, data) => cb(data)
    ipcRenderer.on('analysis-event', fn)
    return () => ipcRenderer.removeListener('analysis-event', fn)
  },
  onFinished: (cb) => {
    const fn = (_, data) => cb(data)
    ipcRenderer.on('analysis-finished', fn)
    return () => ipcRenderer.removeListener('analysis-finished', fn)
  },
  onError: (cb) => {
    const fn = (_, data) => cb(data)
    ipcRenderer.on('analysis-error', fn)
    return () => ipcRenderer.removeListener('analysis-error', fn)
  },

  // ── Notificaciones ────────────────────────────────────────────
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),

  // ── Configuración persistente ─────────────────────────────────
  getSettings:  ()         => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
})
