const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const fs = require('fs')

// ── Config ────────────────────────────────────────────────────────────────────
const isDev = !app.isPackaged

// Ruta relativa al motor Python — app/ y codigo-python/ son carpetas hermanas
const PYTHON_PROJECT = path.join(__dirname, '..', '..', 'codigo-python')

function getPythonPath() {
  const candidates = [
    path.join(PYTHON_PROJECT, '.venv', 'Scripts', 'python.exe'), // venv Windows
    path.join(PYTHON_PROJECT, '.venv', 'bin', 'python'),          // venv Mac/Linux
    process.env.APERT_PYTHON || 'python',
  ]
  for (const p of candidates) {
    if (p !== 'python' && fs.existsSync(p)) return p
  }
  return 'python'
}

function getScriptPath() {
  return process.env.APERT_SCRIPT ||
    path.join(PYTHON_PROJECT, 'run_electron.py')
}

// ── Window ────────────────────────────────────────────────────────────────────
let mainWindow = null
let pythonProcess = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#080c14',
    title: 'Apert Vision',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false,          // permite cargar videos locales (file://)
    },
  })

  // Quitar menú de esta ventana específica
  mainWindow.removeMenu()

  if (isDev) {
    // Limpiar caché en dev para siempre ver los últimos cambios
    mainWindow.webContents.session.clearCache()
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  // Quitar la barra de menú (File, Edit, View, Window)
  Menu.setApplicationMenu(null)
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (pythonProcess) { pythonProcess.kill(); pythonProcess = null }
  if (process.platform !== 'darwin') app.quit()
})

// ── IPC: Diálogos de archivo ──────────────────────────────────────────────────
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Seleccionar video de partido',
    properties: ['openFile'],
    filters: [{ name: 'Video', extensions: ['mp4', 'avi', 'mov', 'mkv'] }],
  })
  return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle('save-file-dialog', async (_, defaultPath) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Guardar video anotado',
    defaultPath: defaultPath || 'partido_analizado.mp4',
    filters: [{ name: 'Video MP4', extensions: ['mp4'] }],
  })
  return result.canceled ? null : result.filePath
})

// ── IPC: Análisis de video ────────────────────────────────────────────────────
ipcMain.handle('analyze-video', async (event, params) => {
  const { videoPath, outputPath, confidence = 0.4, mode = 'detection' } = params

  // Matar proceso anterior si existe
  if (pythonProcess) {
    pythonProcess.kill()
    pythonProcess = null
  }

  const python = getPythonPath()
  const script = getScriptPath()

  if (!fs.existsSync(script)) {
    return { error: `Script Python no encontrado: ${script}` }
  }

  const args = [
    script,
    '--video', videoPath,
    '--output', outputPath,
    '--conf', String(confidence),
    '--mode', mode,
  ]

  console.log(`[Electron] Spawning: ${python} ${args.join(' ')}`)

  pythonProcess = spawn(python, args, { stdio: ['ignore', 'pipe', 'pipe'] })

  let buffer = ''
  pythonProcess.stdout.on('data', (data) => {
    buffer += data.toString()
    const lines = buffer.split('\n')
    buffer = lines.pop() // último fragmento incompleto
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      try {
        const msg = JSON.parse(trimmed)
        if (!mainWindow) return
        if (msg.type === 'progress')  mainWindow.webContents.send('analysis-progress', msg)
        else if (msg.type === 'event')    mainWindow.webContents.send('analysis-event', msg)
        else if (msg.type === 'finished') mainWindow.webContents.send('analysis-finished', msg)
        else if (msg.type === 'error')    mainWindow.webContents.send('analysis-error', msg)
      } catch {
        console.warn('[Python]', trimmed)
      }
    }
  })

  pythonProcess.stderr.on('data', (data) => {
    console.error('[Python stderr]', data.toString())
  })

  pythonProcess.on('close', (code) => {
    console.log(`[Python] exited with code ${code}`)
    pythonProcess = null
    if (code !== 0 && mainWindow) {
      mainWindow.webContents.send('analysis-error', {
        message: `El proceso Python terminó con código ${code}`,
      })
    }
  })

  pythonProcess.on('error', (err) => {
    console.error('[Python spawn error]', err)
    mainWindow?.webContents.send('analysis-error', {
      message: `No se pudo iniciar Python: ${err.message}. ¿Está instalado?`,
    })
    pythonProcess = null
  })

  return { started: true }
})

ipcMain.handle('stop-analysis', () => {
  if (pythonProcess) {
    pythonProcess.kill()
    pythonProcess = null
    return { stopped: true }
  }
  return { stopped: false }
})

// ── IPC: Utilidades ───────────────────────────────────────────────────────────
ipcMain.handle('open-external', async (_, filePath) => {
  await shell.openPath(filePath)
})

ipcMain.handle('read-file', async (_, filePath) => {
  try {
    const buf = await fs.promises.readFile(filePath)
    // Devolver como Uint8Array para que sea transferible al renderer
    return { ok: true, data: buf }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
})

ipcMain.handle('get-python-info', () => ({
  python: getPythonPath(),
  script: getScriptPath(),
  exists: fs.existsSync(getScriptPath()),
}))

// ── IPC: Notificación nativa ──────────────────────────────────────────────────
ipcMain.handle('show-notification', (_, title, body) => {
  const { Notification } = require('electron')
  if (Notification.isSupported()) {
    new Notification({ title, body, icon: undefined }).show()
  }
})

// ── IPC: Configuración persistente ───────────────────────────────────────────
const SETTINGS_PATH = path.join(app.getPath('userData'), 'apert-settings.json')

ipcMain.handle('get-settings', () => {
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'))
  } catch {
    return {}
  }
})

ipcMain.handle('save-settings', (_, settings) => {
  try {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf8')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
})
