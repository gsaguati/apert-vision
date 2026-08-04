// Regenera 03_diseno_arquitectura.docx con la arquitectura ACTUAL del proyecto
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType,
} = require('docx')
const fs = require('fs')
const path = require('path')

const OUT = 'D:\\prueba\\apert-vision-completo\\apert-vision-completo\\documentacion'
const VERDE = '00A050'
const VERDE_OSC = '046230'
const GRIS = '6B7A99'

const BORDER = { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' }
const CELL_MARGINS = { top: 120, bottom: 120, left: 140, right: 140 }

const p = (text, opts = {}) => new Paragraph({
  children: [new TextRun({ text, ...opts })],
  spacing: { after: 160 },
})
const h1 = (text) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: 36, color: VERDE_OSC })],
  spacing: { before: 320, after: 200 },
  heading: HeadingLevel.HEADING_1,
})
const h2 = (text) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: 26, color: '000000' })],
  spacing: { before: 240, after: 140 },
  heading: HeadingLevel.HEADING_2,
})
const h3 = (text) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: 22, color: '333333' })],
  spacing: { before: 200, after: 120 },
  heading: HeadingLevel.HEADING_3,
})
const bullet = (text, level = 0) => new Paragraph({
  children: [new TextRun({ text })],
  bullet: { level },
  spacing: { after: 80 },
})
const bold = (t) => new TextRun({ text: t, bold: true })
const txt = (t) => new TextRun({ text: t })
const parr = (children) => new Paragraph({ children, spacing: { after: 160 } })

const cell = (text, opts = {}) => new TableCell({
  children: [new Paragraph({
    children: [new TextRun({ text, bold: opts.bold, color: opts.color, size: opts.size ?? 20 })],
    alignment: opts.align ?? AlignmentType.LEFT,
    spacing: { before: 40, after: 40 },
  })],
  width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
  shading: opts.bg ? { type: ShadingType.CLEAR, fill: opts.bg, color: 'auto' } : undefined,
  margins: CELL_MARGINS,
  verticalAlign: 'center',
})

const table = (rows) => new Table({
  rows: rows.map(r => new TableRow({ children: r, cantSplit: true })),
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: BORDER, bottom: BORDER, left: BORDER, right: BORDER,
    insideHorizontal: BORDER, insideVertical: BORDER,
  },
})

const doc = new Document({
  creator: 'Gonzalo Saguati',
  title: 'Diseño de Arquitectura - Apert Vision',
  sections: [{
    properties: { page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
    children: [
      new Paragraph({
        children: [new TextRun({ text: 'DISEÑO DE ARQUITECTURA', bold: true, size: 40, color: VERDE_OSC })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Apert Vision — Plataforma de análisis de rugby con IA', size: 24, bold: true })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Escuela Da Vinci · Analista de Sistemas · 2026', size: 20, color: GRIS, italics: true })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),

      h1('1. Introducción'),
      parr([
        txt('Este documento describe la '),
        bold('arquitectura del sistema Apert Vision'),
        txt(', una plataforma multi-aplicación para el análisis automático de partidos de rugby amateur mediante inteligencia artificial. El sistema se compone de tres aplicaciones cliente que consumen servicios de un backend en la nube, un motor de análisis de video basado en YOLOv8, y una integración con Mercado Pago para el modelo de negocio.'),
      ]),
      parr([
        txt('La arquitectura sigue un patrón de '),
        bold('cliente-servidor multi-tier'),
        txt(' con componentes desacoplados que se comunican mediante APIs REST, WebSockets para tiempo real, e IPC (inter-process communication) dentro de la app Desktop.'),
      ]),

      h1('2. Vista general'),
      p('El sistema se organiza en cuatro capas funcionales:'),
      table([
        [cell('Capa', { bold: true, bg: VERDE, color: 'FFFFFF', width: 25 }),
         cell('Componentes', { bold: true, bg: VERDE, color: 'FFFFFF', width: 45 }),
         cell('Tecnología', { bold: true, bg: VERDE, color: 'FFFFFF', width: 30 })],
        [cell('Presentación (Clientes)', { bold: true, bg: 'F0F7F0' }),
         cell('Landing Web · App Desktop · App Mobile'),
         cell('React · Electron · Kotlin')],
        [cell('Análisis de IA', { bold: true, bg: 'F0F7F0' }),
         cell('Motor Python + YOLOv8 + ffmpeg'),
         cell('Python 3.12 · Ultralytics 8.4')],
        [cell('Backend', { bold: true, bg: 'F0F7F0' }),
         cell('Auth · PostgreSQL · Storage · Realtime · Edge Functions'),
         cell('Supabase (BaaS)')],
        [cell('Servicios externos', { bold: true, bg: 'F0F7F0' }),
         cell('Procesamiento de pagos y webhooks'),
         cell('Mercado Pago Checkout Pro')],
      ]),

      h1('3. Capa de Presentación'),

      h2('3.1 Landing Web'),
      p('Sitio público servido estáticamente que actúa como presentación comercial del producto.'),
      table([
        [cell('Aspecto', { bold: true, bg: 'F0F0F0', width: 30 }), cell('Detalle', { width: 70 })],
        [cell('Stack'), cell('React 18 + Vite 6 + Tailwind CSS + Lucide icons')],
        [cell('Deployment'), cell('Servido como sitio estático (build en dist/)')],
        [cell('Función'), cell('Presentar el producto, mostrar features, permitir descarga de APK y Desktop')],
        [cell('Autenticación'), cell('No requiere — sitio público')],
      ]),

      h2('3.2 App Desktop (Entrenadores)'),
      p('Aplicación de escritorio construida con Electron. Es el punto de entrada del entrenador y el único componente que puede analizar partidos, porque necesita acceso local a la GPU/CPU para correr YOLO.'),
      table([
        [cell('Aspecto', { bold: true, bg: 'F0F0F0', width: 30 }), cell('Detalle', { width: 70 })],
        [cell('Stack'), cell('Electron 32 + React 18 + Vite 6 + TypeScript')],
        [cell('UI'), cell('Componentes propios con estilo dark mode brand-aligned (verde #39E07A + fondo #080C14)')],
        [cell('Estado global'), cell('React Context (AuthContext + AnalysisContext)')],
        [cell('Router'), cell('React Router v7')],
        [cell('Iconos'), cell('Lucide React (SVG)')],
        [cell('Reproducción video'), cell('HTML5 <video> tag nativo')],
        [cell('Charts'), cell('Recharts (para stats y gráficos)')],
        [cell('PDF'), cell('jsPDF (para exportar reportes)')],
      ]),
      p('Arquitectura interna de la app Desktop — 3 procesos separados:'),
      bullet('Main Process (electron/main.js): proceso Node.js principal. Crea la ventana, maneja IPC, spawn del proceso Python para análisis.'),
      bullet('Renderer Process (src/main.tsx): proceso Chromium con React. UI del usuario.'),
      bullet('Preload Script (electron/preload.js): puente seguro entre Main y Renderer usando contextBridge de Electron (contextIsolation activo).'),

      h2('3.3 App Mobile (Jugadores y Dirigentes)'),
      p('Aplicación Android nativa. Los usuarios consumen los clips y estadísticas generadas por el entrenador.'),
      table([
        [cell('Aspecto', { bold: true, bg: 'F0F0F0', width: 30 }), cell('Detalle', { width: 70 })],
        [cell('Stack'), cell('Kotlin 2.0 + Jetpack Compose Material 3')],
        [cell('Min SDK'), cell('26 (Android 8.0 Oreo)')],
        [cell('Target SDK'), cell('34 (Android 14)')],
        [cell('Navegación'), cell('Navigation Compose')],
        [cell('Cliente Supabase'), cell('Supabase Kotlin SDK 3.0.2 (auth-kt + postgrest-kt + storage-kt)')],
        [cell('Reproducción video'), cell('Media3 ExoPlayer')],
        [cell('Serialización'), cell('kotlinx.serialization')],
        [cell('Build'), cell('Android Gradle Plugin 9.0 + Gradle 9.2')],
      ]),

      h1('4. Motor de Análisis (Python + YOLOv8)'),
      parr([
        txt('El motor de análisis corre '),
        bold('localmente en la PC del entrenador'),
        txt(' como subprocess del proceso Main de Electron. Esta decisión evita subir videos pesados (partidos de 1+ GB) a la nube y aprovecha la GPU del usuario.'),
      ]),
      table([
        [cell('Aspecto', { bold: true, bg: 'F0F0F0', width: 30 }), cell('Detalle', { width: 70 })],
        [cell('Runtime'), cell('Python 3.12 (venv .venv312 con torch+CUDA)')],
        [cell('Framework de IA'), cell('Ultralytics 8.4 (YOLOv8)')],
        [cell('Procesamiento video'), cell('OpenCV 4.x + imageio-ffmpeg')],
        [cell('Modelo'), cell('YOLOv8n reentrenado — best.pt (6 MB) con 3 clases: lineout, scrum, kickoff')],
        [cell('Métricas del modelo'), cell('mAP50 = 97.8% (Precision 92.4% · Recall 94.5%)')],
        [cell('Dataset de entrenamiento'), cell('4024 imágenes propias etiquetadas en Roboflow (3421 train + 603 valid)')],
        [cell('Entrenamiento'), cell('50 epochs · batch 16 · imgsz 640 · GPU NVIDIA RTX 2060 Super')],
      ]),

      h2('4.1 Flujo de análisis'),
      bullet('El entrenador arrastra el video en la UI Desktop.'),
      bullet('El Renderer invoca al Main vía IPC (contextBridge → apertAPI.analyzeVideo).'),
      bullet('El Main spawnea el proceso Python (child_process.spawn) con los args del video.'),
      bullet('Python carga el modelo YOLOv8 (best.pt) en GPU y procesa el video frame por frame.'),
      bullet('Cada evento detectado (con filtro MIN_GAP=15s para evitar duplicados) se emite como línea JSON por stdout.'),
      bullet('El Main lee stdout, parsea el JSON y forwardea eventos al Renderer vía IPC events.'),
      bullet('Al terminar, Python usa ffmpeg para generar 3 clips comprimidos (480p H.264 CRF 28) por tipo de formación.'),
      bullet('El Renderer sube los clips a Supabase Storage vía TUS resumible (soporta archivos grandes).'),
      bullet('Los metadatos del partido + eventos + clips se insertan en PostgreSQL.'),

      h1('5. Capa de Backend (Supabase)'),
      p('Toda la infraestructura de backend se apoya en Supabase (Backend-as-a-Service). Esto reduce el time-to-market, elimina la necesidad de mantener servidores y provee servicios gestionados de nivel producción.'),

      h2('5.1 Servicios utilizados'),
      table([
        [cell('Servicio', { bold: true, bg: VERDE, color: 'FFFFFF', width: 25 }),
         cell('Función', { bold: true, bg: VERDE, color: 'FFFFFF', width: 45 }),
         cell('Endpoint', { bold: true, bg: VERDE, color: 'FFFFFF', width: 30 })],
        [cell('Auth'), cell('Registro, login, sesiones JWT, recuperación de password. Emails vía Resend (SMTP).'),
         cell('/auth/v1')],
        [cell('PostgreSQL 15'), cell('Base de datos relacional con Row Level Security (RLS) activo en todas las tablas.'),
         cell('/rest/v1 (PostgREST)')],
        [cell('Storage'), cell('Bucket "clips" con signed URLs de 1 hora. Soporta uploads resumibles TUS.'),
         cell('/storage/v1')],
        [cell('Realtime'), cell('Broadcast de cambios de tablas vía WebSocket usando postgres_changes.'),
         cell('/realtime/v1')],
        [cell('Edge Functions'), cell('Funciones serverless en Deno para lógica que requiere secrets.'),
         cell('/functions/v1')],
      ]),

      h2('5.2 Base de datos'),
      p('9 tablas organizadas en 4 grupos funcionales. Detalle completo en 04_DER.docx.'),
      bullet('Autenticación y clubes: auth.users (Supabase interna), clubes, miembros'),
      bullet('Análisis de partidos: partidos, eventos, clips'),
      bullet('Créditos y pagos: planes_creditos, creditos_movimientos'),
      bullet('Estadísticas: estadisticas_jugador'),
      parr([
        bold('Vista calculada: '), txt('saldo_creditos agrupa creditos_movimientos por club y devuelve el saldo actual como suma.'),
      ]),
      parr([
        bold('RPCs (funciones stored): '),
        txt('consumir_credito(club_id, partido_id) valida saldo y rol antes de consumir; saldo_del_club(club_id) devuelve el int del saldo.'),
      ]),
      parr([
        bold('Triggers: '),
        txt('tr_nuevo_club_credito inserta 1 crédito de bienvenida cuando se crea un club nuevo.'),
      ]),

      h2('5.3 Edge Functions'),
      p('Dos Edge Functions (Deno runtime) gestionan la integración con Mercado Pago:'),
      table([
        [cell('Función', { bold: true, bg: 'F0F0F0', width: 30 }),
         cell('Responsabilidad', { width: 70 })],
        [cell('crear-preferencia-pago'),
         cell('Recibe {plan_id, club_id} desde el Desktop. Valida que el usuario sea entrenador del club. Crea una preference en Mercado Pago con external_reference y devuelve init_point + sandbox_init_point.')],
        [cell('webhook-mp'),
         cell('Recibe la notificación de MP cuando un pago cambia de estado. Verifica el pago via GET /v1/payments/{id}. Si status=approved, inserta un movimiento tipo "compra" con la cantidad de créditos del plan (idempotente vía mp_payment_id UNIQUE).')],
      ]),
      parr([
        bold('Seguridad de las Edge Functions: '),
        txt('crear-preferencia-pago requiere JWT de usuario autenticado; webhook-mp se despliega con --no-verify-jwt porque MP no manda Authorization header. La verificación se hace consultando MP API directamente.'),
      ]),

      h2('5.4 Row Level Security (RLS)'),
      p('Todas las tablas tienen RLS activo. Reglas principales:'),
      bullet('miembros / partidos / eventos / clips: cada usuario ve solo datos de su propio club (filtro por club_id).'),
      bullet('planes_creditos: público de lectura (SELECT) para todos los usuarios activos.'),
      bullet('creditos_movimientos: SELECT filtrado por club_id; INSERT/UPDATE solo desde service_role (usado por las Edge Functions).'),
      bullet('estadisticas_jugador: SELECT/UPSERT permitido para cualquier miembro del club del jugador.'),

      h1('6. Servicios Externos'),

      h2('6.1 Mercado Pago Checkout Pro'),
      p('Se utiliza en modo sandbox para desarrollo y demo. El flujo de pago es:'),
      bullet('El Desktop llama a la Edge Function crear-preferencia-pago con el plan elegido.'),
      bullet('La Edge Function crea una preference en MP y devuelve la URL de checkout.'),
      bullet('El Desktop abre esa URL en el navegador externo (shell.openExternal).'),
      bullet('El usuario paga en MP con tarjeta de test (5031 7557 3453 0604 · CVV 123 · APRO).'),
      bullet('MP notifica el resultado a la Edge Function webhook-mp.'),
      bullet('La Edge Function suma créditos en la DB.'),
      bullet('Realtime broadcast → el badge del saldo se actualiza en la app Desktop sin refrescar.'),

      h1('7. Comunicación entre componentes'),
      table([
        [cell('Origen → Destino', { bold: true, bg: VERDE, color: 'FFFFFF', width: 40 }),
         cell('Protocolo', { bold: true, bg: VERDE, color: 'FFFFFF', width: 25 }),
         cell('Uso', { bold: true, bg: VERDE, color: 'FFFFFF', width: 35 })],
        [cell('Desktop Renderer → Electron Main'), cell('IPC contextBridge'), cell('Diálogos, análisis, settings')],
        [cell('Electron Main → Python'), cell('subprocess + stdin/stdout'), cell('Ejecutar YOLO, recibir eventos')],
        [cell('Cliente → Supabase Auth'), cell('HTTPS REST'), cell('Login, signup, refresh JWT')],
        [cell('Cliente → PostgreSQL'), cell('HTTPS REST (PostgREST)'), cell('CRUD sobre tablas')],
        [cell('Cliente → PostgreSQL'), cell('HTTPS RPC'), cell('Llamar a consumir_credito, saldo_del_club')],
        [cell('Cliente → Storage'), cell('HTTPS TUS resumable'), cell('Upload de clips >50MB')],
        [cell('Cliente → Realtime'), cell('WebSocket'), cell('Suscripción a postgres_changes')],
        [cell('Cliente → Edge Functions'), cell('HTTPS POST'), cell('Crear pref MP, otros')],
        [cell('Mercado Pago → webhook-mp'), cell('HTTPS POST'), cell('Notificación de pago')],
        [cell('Edge Functions → Mercado Pago'), cell('HTTPS REST'), cell('Crear pref, verificar pago')],
      ]),

      h1('8. Patrones y decisiones de diseño'),

      h2('8.1 Patrones aplicados'),
      bullet('Cliente-Servidor: apps cliente que consumen servicios de un backend gestionado.'),
      bullet('BaaS (Backend-as-a-Service): se delega infraestructura de auth, DB, storage y realtime a Supabase.'),
      bullet('Serverless Functions: la lógica de integración con MP corre en Edge Functions on-demand.'),
      bullet('Event-driven: el sistema de créditos usa eventos (webhooks + realtime) para propagar cambios.'),
      bullet('Multi-role authorization: 3 roles (entrenador, dirigente, jugador) con RLS por rol y por club.'),
      bullet('Optimistic UI: el Desktop muestra progreso de análisis en tiempo real sin esperar respuestas del servidor.'),
      bullet('Idempotencia: el webhook de MP usa mp_payment_id UNIQUE para evitar duplicar créditos ante reintentos.'),

      h2('8.2 Decisiones clave'),
      parr([
        bold('¿Por qué procesamiento local (Python) y no en la nube? '),
        txt('Subir un video de rugby de 1+ GB a la nube tarda horas con conexiones caseras. Procesar local reduce el tiempo a minutos y no consume ancho de banda. Además evita costos de infraestructura de GPU en la nube.'),
      ]),
      parr([
        bold('¿Por qué Electron y no un servicio SaaS? '),
        txt('Los entrenadores no quieren aprender a instalar Python + CUDA. Electron empaqueta todo en un instalador Windows y esconde la complejidad. La UI es la misma web (React) pero con acceso al filesystem y a spawn de procesos.'),
      ]),
      parr([
        bold('¿Por qué Supabase y no un backend propio? '),
        txt('Time-to-market: implementar auth + DB + storage + realtime + edge functions from scratch tomaría meses. Supabase provee todo eso listo con free tier suficiente para el MVP y RLS declarativo.'),
      ]),
      parr([
        bold('¿Por qué Mercado Pago y no Stripe? '),
        txt('El mercado objetivo es Argentina (400 clubes de rugby amateur). MP es el gateway más adoptado localmente, con tarjetas locales y billetera virtual.'),
      ]),
      parr([
        bold('¿Por qué YOLOv8 y no otro modelo? '),
        txt('Estado del arte en detección en tiempo real, ecosistema maduro (Ultralytics), fácil de reentrenar con datasets custom desde Roboflow, y con modelos "nano" (yolov8n.pt) que corren en GPUs consumer.'),
      ]),

      h1('9. Seguridad'),
      bullet('Autenticación con JWT firmado gestionado por Supabase Auth.'),
      bullet('Row Level Security en todas las tablas — imposible ver datos de otro club aunque se manipule el cliente.'),
      bullet('Edge Functions con service_role usan secrets inyectados vía env vars (nunca en el código).'),
      bullet('El MP_ACCESS_TOKEN se guarda solo en Supabase Edge Functions Secrets — nunca en el repo git.'),
      bullet('Signed URLs de Storage con expiración de 1 hora — los clips no son accesibles sin auth.'),
      bullet('El video original nunca sale de la PC del entrenador (procesamiento local).'),
      bullet('Preload script con contextIsolation activo — el Renderer no tiene acceso directo a Node.js APIs.'),
      bullet('El webhook-mp verifica el pago consultando MP API en lugar de confiar en el payload recibido.'),
      bullet('CORS configurado en Edge Functions para aceptar solo requests de orígenes autorizados.'),

      h1('10. Escalabilidad y performance'),
      parr([
        bold('Escalabilidad horizontal: '),
        txt('Supabase auto-escala Auth, PostgreSQL y Edge Functions. El bottleneck actual es el free tier (500 MB DB, 1 GB storage, 500K edge fn invocations/mes) — más que suficiente para el MVP y primeros clientes.'),
      ]),
      parr([
        bold('Escalabilidad del análisis: '),
        txt('El motor Python corre en la máquina del entrenador, así que la carga se distribuye naturalmente. Cada entrenador es autónomo — no hay servidor central que pueda saturarse.'),
      ]),
      parr([
        bold('Optimizaciones de red: '),
        txt('Los clips se comprimen con ffmpeg a 480p H.264 CRF 28 antes de subir (reduce ~10x el tamaño). Se usa upload resumible TUS para archivos >50 MB. Realtime evita polling constante.'),
      ]),
      parr([
        bold('Cache del cliente: '),
        txt('El renderer de Electron usa cache HTTP nativa. Vite sirve chunks cacheables en dev.'),
      ]),

      h1('11. Deployment'),
      table([
        [cell('Componente', { bold: true, bg: VERDE, color: 'FFFFFF', width: 30 }),
         cell('Método de deployment', { bold: true, bg: VERDE, color: 'FFFFFF', width: 70 })],
        [cell('Landing Web'), cell('npm run build → hosting estático (Vercel, Netlify, o similar)')],
        [cell('Desktop App'), cell('electron-builder → instalador .exe para Windows')],
        [cell('Mobile App'), cell('Android Studio → APK firmado (distribuido por WhatsApp / Google Drive)')],
        [cell('Backend'), cell('Supabase Cloud (managed) — gestión desde su dashboard')],
        [cell('Migraciones SQL'), cell('supabase/migrations/ ejecutadas manualmente via SQL Editor')],
        [cell('Edge Functions'), cell('supabase functions deploy <name> (via Supabase CLI)')],
      ]),

      h1('12. Referencias'),
      bullet('Documentación completa en carpeta documentacion/'),
      bullet('DER detallado: 04_DER.docx'),
      bullet('Diagrama de componentes: 05_diagrama_componentes.docx (o Lucidchart)'),
      bullet('Diagramas UML (clases, secuencia, casos de uso): 10_UML.docx'),
      bullet('Setup Mercado Pago: MERCADO_PAGO_SETUP.md'),
      bullet('Métricas del modelo YOLO: documentacion/yolo_training_results/'),
      bullet('Repositorio: https://github.com/gsaguati/apert-vision'),
    ],
  }],
})

;(async () => {
  const buf = await Packer.toBuffer(doc)
  const out = path.join(OUT, '03_diseno_arquitectura.docx')
  fs.writeFileSync(out, buf)
  console.log(`[OK] ${out}`)
})()
