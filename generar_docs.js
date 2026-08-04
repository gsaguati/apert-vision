// Genera toda la documentación para la entrega final
// Uso: node generar_docs.js

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, PageBreak, ShadingType, LevelFormat,
  convertInchesToTwip,
} = require('docx')
const fs = require('fs')
const path = require('path')

const OUT = 'D:\\prueba\\apert-vision-completo\\apert-vision-completo\\documentacion'

const VERDE = '00A050'
const VERDE_OSC = '046230'
const GRIS = '6B7A99'
const AZUL = '3B82F6'

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════
const p = (text, opts = {}) => new Paragraph({
  children: [new TextRun({ text, ...opts })],
  spacing: { after: 120 },
})
const h1 = (text) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: 40, color: VERDE_OSC })],
  spacing: { before: 300, after: 200 },
  heading: HeadingLevel.HEADING_1,
})
const h2 = (text) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: 30, color: '000000' })],
  spacing: { before: 240, after: 160 },
  heading: HeadingLevel.HEADING_2,
})
const h3 = (text) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: 24, color: '333333' })],
  spacing: { before: 200, after: 120 },
  heading: HeadingLevel.HEADING_3,
})
const bullet = (text) => new Paragraph({
  children: [new TextRun({ text })],
  bullet: { level: 0 },
  spacing: { after: 80 },
})
const bold = (text) => new TextRun({ text, bold: true })
const italic = (text) => new TextRun({ text, italics: true })
const spacer = () => new Paragraph({ children: [new TextRun('')], spacing: { after: 100 } })

const BORDER = { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' }
const CELL_MARGINS = { top: 120, bottom: 120, left: 140, right: 140 }

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

const guardar = (doc, filename) => Packer.toBuffer(doc).then(buf => {
  const out = path.join(OUT, filename)
  fs.writeFileSync(out, buf)
  console.log(`[OK] ${out}`)
})

// ═══════════════════════════════════════════════════════════════════════════
// 1) PL03 — Entrega Final (planilla llenada)
// ═══════════════════════════════════════════════════════════════════════════
const pl03 = new Document({
  creator: 'Gonzalo Saguati',
  title: 'PL03 - Entrega Final - Apert Vision',
  sections: [{
    properties: { page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
    children: [
      new Paragraph({
        children: [new TextRun({ text: 'INFORMACIÓN PARA ENTREGA DEL PROYECTO', bold: true, size: 36, color: VERDE_OSC })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Escuela Da Vinci · Analista de Sistemas · Seminario de Sistemas', size: 22, color: GRIS })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),

      h1('1. Datos Generales'),
      table([
        [cell('Nombre del proyecto', { bold: true, bg: 'F0F0F0', width: 30 }),
         cell('Apert Vision — Análisis de rugby amateur con IA', { width: 70 })],
        [cell('Fecha de entrega', { bold: true, bg: 'F0F0F0' }),
         cell('Agosto 2026')],
        [cell('Alumno', { bold: true, bg: 'F0F0F0' }),
         cell('Gonzalo Saguati')],
        [cell('Carrera', { bold: true, bg: 'F0F0F0' }),
         cell('Analista de Sistemas')],
      ]),

      h1('2. Enlaces y Accesos'),

      h2('2.1 Material documental entregado'),
      table([
        [cell('Documento', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('Archivo', { bold: true, bg: VERDE, color: 'FFFFFF' })],
        [cell('Manual de usuario'), cell('07_manual_usuario.docx')],
        [cell('Casos de uso'), cell('01_casos_de_uso.docx')],
        [cell('Casos de prueba'), cell('08_casos_de_prueba.docx')],
        [cell('UML'), cell('10_UML.docx')],
        [cell('Requisitos funcionales Web'), cell('02_requisitos_funcionales_web.docx')],
        [cell('Requisitos funcionales APK'), cell('09_requisitos_funcionales_apk.docx')],
        [cell('DER'), cell('04_DER.docx (actualizado con tablas de créditos y estadísticas)')],
        [cell('Diseño de arquitectura'), cell('03_diseno_arquitectura.docx')],
        [cell('Diagrama de componentes'), cell('05_diagrama_componentes.docx')],
        [cell('Gantt'), cell('06_gantt.xlsx')],
        [cell('Business Model Canvas'), cell('Canvas_Apert_Vision.docx')],
        [cell('Setup Mercado Pago'), cell('MERCADO_PAGO_SETUP.md')],
        [cell('Discurso oral de defensa'), cell('speech_apert_vision.docx')],
        [cell('Resultados entrenamiento YOLO'), cell('yolo_training_results/ (gráficos)')],
      ]),

      h2('2.2 Accesos a aplicaciones'),
      table([
        [cell('Tipo', { bold: true, bg: VERDE, color: 'FFFFFF', width: 35 }),
         cell('URL / Instrucciones', { bold: true, bg: VERDE, color: 'FFFFFF', width: 65 })],
        [cell('APK Mobile Android'), cell('Se distribuye por WhatsApp — apert-vision.apk (~40 MB). Compilable desde mobile/ con Android Studio.')],
        [cell('App Desktop Windows'), cell('Ejecutable local. Instalable desde app/ con: npm install && npm run electron:dev')],
        [cell('Landing web'), cell('landing/apert-vision/ — servible con: npm run dev (puerto 3000)')],
        [cell('Repositorio código fuente'), cell('https://github.com/gsaguati/apert-vision')],
        [cell('Backend (Supabase)'), cell('https://ggndcadupigycdlhnurd.supabase.co')],
        [cell('Base de datos'), cell('PostgreSQL 15 gestionado por Supabase')],
      ]),

      h2('2.3 Usuarios de prueba'),
      table([
        [cell('Rol', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('Email / Usuario', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('Contraseña', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('Información adicional', { bold: true, bg: VERDE, color: 'FFFFFF' })],
        [cell('Entrenador'), cell('gsaguati@gmail.com'), cell('(a coordinar)'),
         cell('Cuenta principal del club "Casa de Padua". Acceso completo al Desktop.')],
        [cell('Jugador (demo 1)'), cell('demo_jugador1@apertvision.test'), cell('demo1234'),
         cell('Se registra desde app Mobile con código del club.')],
        [cell('Jugador (demo 2)'), cell('demo_jugador2@apertvision.test'), cell('demo1234'),
         cell('Idem — mismo club, distinto usuario.')],
        [cell('Dirigente'), cell('demo_dirigente@apertvision.test'), cell('demo1234'),
         cell('Solo consulta de partidos y estadísticas.')],
      ]),

      h1('3. Información adicional'),

      h2('3.1 Códigos de invitación del club "Casa de Padua"'),
      p('El sistema genera 3 códigos únicos por club al crearlo. Se comparten con los miembros para que se auto-registren con el rol correcto:'),
      bullet('Código entrenador: (visible en Configuración del Desktop)'),
      bullet('Código dirigente: (visible en Configuración del Desktop)'),
      bullet('Código jugador: (visible en Configuración del Desktop)'),

      h2('3.2 Credenciales Mercado Pago Sandbox'),
      p('El sistema de pagos usa el sandbox de Mercado Pago. Tarjetas de prueba para pagar:'),
      bullet('Mastercard: 5031 7557 3453 0604 · CVV 123 · Venc 11/30 · Titular APRO'),
      bullet('Visa: 4509 9535 6623 3704 · CVV 123 · Venc 11/30 · Titular APRO'),
      bullet('DNI: cualquier 8 dígitos'),

      h2('3.3 Planes de créditos disponibles'),
      table([
        [cell('Plan', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('Créditos', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('USD', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('ARS', { bold: true, bg: VERDE, color: 'FFFFFF' })],
        [cell('Un partido'), cell('1'), cell('US$ 8'), cell('AR$ 10.000')],
        [cell('Diez partidos'), cell('10'), cell('US$ 64'), cell('AR$ 80.000')],
        [cell('Temporada corta'), cell('26'), cell('US$ 164'), cell('AR$ 200.000')],
      ]),
      p('Al crear un club nuevo, se otorga 1 crédito de bienvenida automáticamente.'),

      h2('3.4 Modelo YOLO entrenado'),
      p('El sistema utiliza YOLOv8n reentrenado con 3 clases (line-out, scrum, kickoff):'),
      bullet('Dataset: 4024 imágenes (3421 train + 603 valid)'),
      bullet('Training: 50 epochs, batch 16, GPU NVIDIA RTX 2060 Super'),
      bullet('Métrica final: mAP50 = 97.8% (nivel producción)'),
      bullet('Precision por clase: lineout 94.6% · scrum 90.1% · kickoff 92.5%'),
      bullet('Recall por clase: lineout 93.0% · scrum 97.1% · kickoff 93.5%'),
      p('Gráficos de entrenamiento en documentacion/yolo_training_results/'),
    ],
  }],
})

// ═══════════════════════════════════════════════════════════════════════════
// 2) Manual de Usuario
// ═══════════════════════════════════════════════════════════════════════════
const manual = new Document({
  creator: 'Gonzalo Saguati',
  title: 'Manual de Usuario - Apert Vision',
  sections: [{
    properties: { page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
    children: [
      new Paragraph({
        children: [new TextRun({ text: 'MANUAL DE USUARIO', bold: true, size: 44, color: VERDE_OSC })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'APERT VISION', bold: true, size: 32, color: '000000' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Plataforma de análisis de rugby con inteligencia artificial', italics: true, size: 22, color: GRIS })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),

      h1('1. Introducción'),
      p('Apert Vision es una plataforma que utiliza inteligencia artificial (YOLOv8) para detectar y analizar automáticamente las formaciones clave de un partido de rugby: line-outs, scrums y salidas de 22 metros. El sistema está compuesto por tres aplicaciones:'),
      bullet('App Desktop (Windows): usada por los entrenadores. Analiza los videos, genera clips automáticos y sube todo a la nube.'),
      bullet('App Mobile (Android): usada por jugadores y dirigentes. Consumen los clips y las estadísticas desde el celular.'),
      bullet('Landing web: sitio público de presentación del producto.'),

      h1('2. Requisitos del sistema'),

      h2('2.1 Desktop'),
      bullet('Sistema operativo: Windows 10 / 11 (64-bit)'),
      bullet('Procesador: Intel i5 8ª gen o superior'),
      bullet('Memoria RAM: 8 GB (recomendado 16 GB)'),
      bullet('GPU: NVIDIA con CUDA (RTX 2060 o superior recomendada)'),
      bullet('Almacenamiento: 5 GB libres'),
      bullet('Conexión a internet: obligatoria al finalizar el análisis (para subir clips)'),

      h2('2.2 Mobile'),
      bullet('Android 8.0 o superior'),
      bullet('~150 MB libres'),
      bullet('Conexión a internet para descargar los clips'),

      h1('3. Roles del sistema'),
      table([
        [cell('Rol', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('Permisos', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('App que usa', { bold: true, bg: VERDE, color: 'FFFFFF' })],
        [cell('Entrenador'),
         cell('Crea el club, sube y analiza partidos, gestiona jugadores, compra créditos, ve stats globales.'),
         cell('Desktop + Mobile')],
        [cell('Dirigente'),
         cell('Solo consulta: ve partidos, clips y estadísticas del club.'),
         cell('Mobile')],
        [cell('Jugador'),
         cell('Ve los clips por tipo (line-outs, scrums, salidas) y sus estadísticas individuales.'),
         cell('Mobile')],
      ]),

      h1('4. Uso de la App Desktop (Entrenadores)'),

      h2('4.1 Registro y creación del club'),
      p('Al abrir Apert Vision Desktop por primera vez, hacé click en "Crear cuenta nueva":'),
      bullet('Ingresá tu nombre, email y contraseña.'),
      bullet('Elegí "Crear un club nuevo".'),
      bullet('Definí el nombre del club (ej: "Casa de Padua Rugby").'),
      bullet('El sistema genera automáticamente 3 códigos únicos de invitación: uno para entrenadores, uno para dirigentes y uno para jugadores. Se muestran en Configuración.'),
      bullet('Al crear el club se otorga automáticamente 1 crédito gratis para tu primer análisis.'),

      h2('4.2 Analizar un partido nuevo'),
      p('Desde el Dashboard:'),
      bullet('Arrastrá el video del partido (MP4/MOV/AVI/MKV) al panel de "Nuevo Análisis" o hacé click en "Seleccionar archivo".'),
      bullet('Completá los datos del partido: club rival, fecha, si jugaron de local o visitante, marcador y resultado (V/D/E).'),
      bullet('Hacé click en "Iniciar análisis". Si tenés al menos 1 crédito disponible, el análisis arranca.'),
      bullet('El sistema muestra el progreso en vivo. Podés navegar a otras pantallas mientras corre — el análisis sigue en background.'),
      bullet('Al terminar, se generan 3 clips automáticos (uno por tipo) y se suben a la nube junto con las estadísticas del partido.'),
      bullet('Se descuenta 1 crédito de tu saldo.'),

      h2('4.3 Ver partidos analizados'),
      p('En la sección "Partidos" del menú lateral:'),
      bullet('Listado de todos los partidos analizados por tu club, ordenados por fecha.'),
      bullet('Click en un partido para ver: el video completo, el timeline de eventos, los clips por tipo y el rendimiento individual de los mejores jugadores en ese partido.'),
      bullet('Botón "Exportar PDF" genera un reporte imprimible con estadísticas.'),

      h2('4.4 Gestionar jugadores'),
      p('En la sección "Jugadores":'),
      bullet('Ver todos los jugadores registrados en tu club (con su dorsal, posición y edad).'),
      bullet('Compartir el "Código de invitación de jugador" para que se registren desde la app mobile.'),
      bullet('Click en un jugador para ver sus estadísticas individuales: tackles efectivos, metros ganados por partido, y partidos analizados en la temporada.'),
      bullet('Filtrar por posición y ordenar por rendimiento.'),

      h2('4.5 Comprar créditos'),
      p('En la sección "Créditos":'),
      bullet('Ver saldo actual y elegir un plan: 1 partido (US$ 8), 10 partidos (US$ 64) o 26 partidos (US$ 164).'),
      bullet('Al hacer click en "Comprar ahora" se abre Mercado Pago en el navegador.'),
      bullet('Pagar con tarjeta o billetera virtual (Mercado Pago Wallet).'),
      bullet('Una vez confirmado el pago, los créditos se acreditan automáticamente en la app (en tiempo real, sin refrescar).'),
      bullet('Historial completo de movimientos disponible en la misma sección.'),

      h1('5. Uso de la App Mobile (Jugadores y Dirigentes)'),

      h2('5.1 Registro'),
      bullet('Descargá e instalá el APK de Apert Vision desde el link que te compartió el entrenador.'),
      bullet('Al abrir la app, hacé click en "Crear cuenta nueva".'),
      bullet('Ingresá tu nombre, email y contraseña.'),
      bullet('Ingresá el código de invitación que te dio el entrenador. El código define tu rol automáticamente (jugador / dirigente).'),
      bullet('Si sos jugador, completá tu dorsal, posición y edad.'),

      h2('5.2 Ver partidos y clips'),
      p('La pantalla principal muestra la lista de partidos con clips disponibles:'),
      bullet('Click en un partido para ver el detalle.'),
      bullet('Cada partido tiene 3 clips (Line-outs, Scrums, Salidas 22). Click en cualquiera para reproducirlo.'),
      bullet('El video se reproduce a pantalla completa con controles nativos.'),

      h2('5.3 Ver tus estadísticas (solo jugadores)'),
      bullet('En la pantalla principal, tocá el ícono de perfil (👤) en la esquina superior derecha.'),
      bullet('Vas a ver: Tackles por partido (con % efectivo), Metros ganados con la pelota, y Partidos analizados esta temporada.'),
      bullet('En cada partido individual, si sos jugador, aparece la sección "Tu rendimiento en este partido" con tus stats de ese encuentro.'),

      h1('6. Preguntas frecuentes'),

      h3('¿Necesito una GPU para usar Apert Vision?'),
      p('No es obligatorio pero sí muy recomendable. Con una GPU NVIDIA el procesamiento tarda entre 5 y 10 minutos por partido. Sin GPU (solo CPU) puede tardar entre 30 y 60 minutos.'),

      h3('¿El video del partido se sube a la nube?'),
      p('No, el video original nunca se sube. El análisis con IA corre 100% en tu PC. Lo que sí se sube son los 3 clips comprimidos (a 480p H.264 para reducir peso) y las estadísticas.'),

      h3('¿Puedo compartir mi cuenta con otro entrenador?'),
      p('No es recomendable — cada entrenador debería tener su propia cuenta. Todos comparten el mismo club a través del código de invitación de entrenador.'),

      h3('¿Qué pasa si el análisis falla en el medio?'),
      p('El crédito NO se consume si el análisis falla. Podés reintentar sin costo. Los créditos solo se descuentan cuando un análisis termina exitosamente y sube los clips a la nube.'),

      h3('¿Cuánto duran los créditos?'),
      p('No tienen vencimiento. Podés comprarlos y usarlos cuando quieras a lo largo de toda la temporada.'),
    ],
  }],
})

// ═══════════════════════════════════════════════════════════════════════════
// 3) Casos de Prueba
// ═══════════════════════════════════════════════════════════════════════════
const casoRow = (id, descripcion, entrada, esperado, real, estado) => [
  cell(id, { bold: true, width: 8 }),
  cell(descripcion, { width: 27 }),
  cell(entrada, { width: 22 }),
  cell(esperado, { width: 22 }),
  cell(real, { width: 15 }),
  cell(estado, { bold: true, color: estado === 'OK' ? VERDE_OSC : (estado === 'FALLA' ? 'CC0000' : GRIS), width: 6 }),
]
const casoHeader = () => [
  cell('ID', { bold: true, bg: VERDE, color: 'FFFFFF' }),
  cell('Descripción', { bold: true, bg: VERDE, color: 'FFFFFF' }),
  cell('Entrada', { bold: true, bg: VERDE, color: 'FFFFFF' }),
  cell('Resultado esperado', { bold: true, bg: VERDE, color: 'FFFFFF' }),
  cell('Resultado real', { bold: true, bg: VERDE, color: 'FFFFFF' }),
  cell('OK', { bold: true, bg: VERDE, color: 'FFFFFF' }),
]

const casos = new Document({
  creator: 'Gonzalo Saguati',
  title: 'Casos de Prueba - Apert Vision',
  sections: [{
    properties: { page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
    children: [
      new Paragraph({
        children: [new TextRun({ text: 'CASOS DE PRUEBA', bold: true, size: 40, color: VERDE_OSC })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Apert Vision', size: 26, color: '000000', bold: true })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),

      p('Este documento describe los casos de prueba de aceptación ejecutados sobre las tres aplicaciones (Desktop, Mobile, Backend). Los estados posibles son: OK (aprobado), FALLA (no aprobado) y N/A (no aplica).'),

      h1('CP-01 · Autenticación'),
      table([
        casoHeader(),
        casoRow('CP-01-1', 'Login exitoso con credenciales válidas',
                'email + password correctos', 'Redirige al Dashboard con sesión activa', 'Coincide', 'OK'),
        casoRow('CP-01-2', 'Login falla con credenciales incorrectas',
                'password inválido', 'Muestra mensaje "Correo o contraseña incorrectos"', 'Coincide', 'OK'),
        casoRow('CP-01-3', 'Registro con código de club válido',
                'nombre, email, password, código', 'Crea la cuenta y asigna al club con el rol del código', 'Coincide', 'OK'),
        casoRow('CP-01-4', 'Registro falla con código inválido',
                'código inexistente', 'Muestra mensaje "Código inválido"', 'Coincide', 'OK'),
        casoRow('CP-01-5', 'Bloqueo de app Desktop para no-entrenadores',
                'login con rol jugador', 'Muestra "Esta app es solo para entrenadores" y ofrece logout', 'Coincide', 'OK'),
        casoRow('CP-01-6', 'Persistencia de sesión al reabrir',
                'cerrar y reabrir la app', 'Mantiene la sesión activa (no re-pide login)', 'Coincide', 'OK'),
      ]),

      h1('CP-02 · Análisis de partidos (Desktop)'),
      table([
        casoHeader(),
        casoRow('CP-02-1', 'Cargar video por drag and drop',
                'video MP4 arrastrado', 'Se registra la ruta del video y habilita "Iniciar análisis"', 'Coincide', 'OK'),
        casoRow('CP-02-2', 'Formato de video no soportado',
                'archivo .txt', 'No permite cargarlo (filtro por extensión)', 'Coincide', 'OK'),
        casoRow('CP-02-3', 'Iniciar análisis sin créditos',
                'saldo = 0', 'Muestra modal "Sin créditos" con CTA a comprar', 'Coincide', 'OK'),
        casoRow('CP-02-4', 'Análisis exitoso completo',
                'video 8 min con formaciones', 'Detecta al menos 5 eventos, genera 3 clips, sube a Supabase, consume 1 crédito', 'Coincide', 'OK'),
        casoRow('CP-02-5', 'Detección de las 3 clases',
                'video con líneas + scrums + salidas', 'Se ven eventos de los 3 tipos en el timeline', 'Coincide', 'OK'),
        casoRow('CP-02-6', 'Filtro anti-duplicados',
                'formaciones consecutivas del mismo tipo', 'Aplica MIN_GAP = 15s (no registra 2 eventos iguales muy juntos)', 'Coincide', 'OK'),
        casoRow('CP-02-7', 'Cancelar análisis en curso',
                'click en "Cancelar"', 'Detiene el proceso Python y vuelve a estado idle', 'Coincide', 'OK'),
        casoRow('CP-02-8', 'Exportar PDF del partido',
                'click en "Exportar PDF"', 'Genera archivo con logo Apert, stats y timeline', 'Coincide', 'OK'),
      ]),

      h1('CP-03 · Créditos y Mercado Pago'),
      table([
        casoHeader(),
        casoRow('CP-03-1', 'Crédito de bienvenida automático',
                'crear club nuevo', 'Se acredita 1 crédito con tipo "bienvenida"', 'Coincide', 'OK'),
        casoRow('CP-03-2', 'Compra sandbox con tarjeta APRO',
                'plan_1 + tarjeta 5031...', 'Webhook recibe payment.approved y suma 1 crédito', 'Coincide', 'OK'),
        casoRow('CP-03-3', 'Idempotencia del webhook',
                'MP reenvía la misma notificación', 'No se duplica el movimiento (mp_payment_id unique)', 'Coincide', 'OK'),
        casoRow('CP-03-4', 'Rechazo de pago',
                'tarjeta OTHE (rejected)', 'No se suman créditos, saldo intacto', 'Coincide', 'OK'),
        casoRow('CP-03-5', 'Consumo al terminar análisis',
                'análisis exitoso', 'Insert de movimiento tipo "consumo" con cantidad -1', 'Coincide', 'OK'),
        casoRow('CP-03-6', 'Actualización realtime del saldo',
                'compra desde otra sesión', 'Badge del sidebar se actualiza sin refrescar', 'Coincide', 'OK'),
      ]),

      h1('CP-04 · App Mobile'),
      table([
        casoHeader(),
        casoRow('CP-04-1', 'Login del jugador',
                'email + password', 'Muestra lista de partidos del club', 'Coincide', 'OK'),
        casoRow('CP-04-2', 'Ver clip de line-outs',
                'tap en tarjeta Line-outs', 'Reproduce el video con controles nativos', 'Coincide', 'OK'),
        casoRow('CP-04-3', 'Ver "Mis Estadísticas"',
                'tap en ícono de perfil', 'Muestra tackles, metros y partidos jugados', 'Coincide', 'OK'),
        casoRow('CP-04-4', 'Rendimiento en partido específico',
                'abrir detalle del partido', 'Sección "Tu rendimiento en este partido" visible solo para jugadores', 'Coincide', 'OK'),
        casoRow('CP-04-5', 'Bloqueo de features de entrenador',
                'usuario con rol jugador', 'No ve opciones de análisis ni compra de créditos', 'Coincide', 'OK'),
      ]),

      h1('CP-05 · Backend / Seguridad'),
      table([
        casoHeader(),
        casoRow('CP-05-1', 'RLS en tabla partidos',
                'query desde otro club', 'No devuelve partidos ajenos (filtro por club_id)', 'Coincide', 'OK'),
        casoRow('CP-05-2', 'RLS en creditos_movimientos',
                'insert desde el cliente', 'Rechazado (solo service_role puede insertar)', 'Coincide', 'OK'),
        casoRow('CP-05-3', 'consumir_credito con saldo=0',
                'RPC call sin créditos', 'Lanza excepción "Sin créditos disponibles"', 'Coincide', 'OK'),
        casoRow('CP-05-4', 'consumir_credito con rol distinto',
                'RPC call desde un jugador', 'Rechazado ("Solo entrenadores")', 'Coincide', 'OK'),
        casoRow('CP-05-5', 'Trigger de bienvenida en clubes nuevos',
                'insert en tabla clubes', 'Insert automático de 1 crédito en creditos_movimientos', 'Coincide', 'OK'),
      ]),

      h1('CP-06 · Modelo YOLO'),
      table([
        casoHeader(),
        casoRow('CP-06-1', 'Precisión en validación',
                'dataset valid (603 imágenes)', 'mAP50 >= 90%', 'mAP50 = 97.8%', 'OK'),
        casoRow('CP-06-2', 'Detección de line-outs',
                'imagen con line-out claro', 'Bounding box con confianza > 0.7', 'Coincide', 'OK'),
        casoRow('CP-06-3', 'Detección de scrums',
                'imagen con scrum', 'Bounding box con confianza > 0.7', 'Coincide', 'OK'),
        casoRow('CP-06-4', 'Detección de kickoffs',
                'imagen con salida 22', 'Bounding box con confianza > 0.7', 'Coincide', 'OK'),
        casoRow('CP-06-5', 'No falsos positivos en frames vacíos',
                'imagen sin jugadores', 'Sin detecciones', 'Coincide', 'OK'),
      ]),

      h1('Resumen'),
      table([
        [cell('Módulo', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('Casos', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('OK', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('FALLA', { bold: true, bg: VERDE, color: 'FFFFFF' })],
        [cell('CP-01 Autenticación'), cell('6'), cell('6'), cell('0')],
        [cell('CP-02 Análisis'), cell('8'), cell('8'), cell('0')],
        [cell('CP-03 Créditos MP'), cell('6'), cell('6'), cell('0')],
        [cell('CP-04 Mobile'), cell('5'), cell('5'), cell('0')],
        [cell('CP-05 Backend'), cell('5'), cell('5'), cell('0')],
        [cell('CP-06 YOLO'), cell('5'), cell('5'), cell('0')],
        [cell('TOTAL', { bold: true }), cell('35', { bold: true }), cell('35', { bold: true, color: VERDE_OSC }), cell('0', { bold: true })],
      ]),
    ],
  }],
})

// ═══════════════════════════════════════════════════════════════════════════
// 4) Requisitos Funcionales APK
// ═══════════════════════════════════════════════════════════════════════════
const rfRow = (id, tipo, descripcion, prio) => [
  cell(id, { bold: true, width: 10 }),
  cell(tipo, { width: 15 }),
  cell(descripcion, { width: 60 }),
  cell(prio, { color: prio === 'Alta' ? 'CC0000' : (prio === 'Media' ? 'CC8800' : GRIS), width: 15 }),
]
const rfHeader = () => [
  cell('ID', { bold: true, bg: VERDE, color: 'FFFFFF' }),
  cell('Tipo', { bold: true, bg: VERDE, color: 'FFFFFF' }),
  cell('Descripción', { bold: true, bg: VERDE, color: 'FFFFFF' }),
  cell('Prioridad', { bold: true, bg: VERDE, color: 'FFFFFF' }),
]

const rfApk = new Document({
  creator: 'Gonzalo Saguati',
  title: 'Requisitos Funcionales APK - Apert Vision',
  sections: [{
    properties: { page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
    children: [
      new Paragraph({
        children: [new TextRun({ text: 'REQUISITOS FUNCIONALES', bold: true, size: 40, color: VERDE_OSC })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'App Mobile Android (APK) — Apert Vision', size: 26, color: '000000', bold: true })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),

      h1('1. Descripción general'),
      p('La app Mobile de Apert Vision está pensada para jugadores y dirigentes de un club de rugby amateur. Su función principal es permitir consumir los clips generados por el entrenador desde la app Desktop y visualizar las estadísticas individuales por jugador.'),
      p('La app se desarrolla en Kotlin con Jetpack Compose para Android 8.0+, y consume los mismos servicios de Supabase (auth, base de datos y storage) que la app Desktop.'),

      h1('2. Requisitos por módulo'),

      h2('2.1 Autenticación y roles'),
      table([
        rfHeader(),
        rfRow('RF-M-01', 'Funcional', 'La app debe permitir crear una cuenta nueva con email, contraseña y código de invitación del club.', 'Alta'),
        rfRow('RF-M-02', 'Funcional', 'El código de invitación debe determinar automáticamente el rol del usuario (jugador o dirigente).', 'Alta'),
        rfRow('RF-M-03', 'Funcional', 'El usuario debe poder iniciar sesión con email y contraseña.', 'Alta'),
        rfRow('RF-M-04', 'Funcional', 'La sesión debe persistir entre reaperturas de la app hasta que el usuario cierre sesión manualmente.', 'Alta'),
        rfRow('RF-M-05', 'Seguridad', 'Los códigos y contraseñas se envían por HTTPS a Supabase Auth. Nunca se guarda la contraseña en el dispositivo.', 'Alta'),
        rfRow('RF-M-06', 'Funcional', 'El jugador, al registrarse, debe completar dorsal, posición y edad (obligatorios).', 'Media'),
      ]),

      h2('2.2 Listado de partidos'),
      table([
        rfHeader(),
        rfRow('RF-M-10', 'Funcional', 'La pantalla principal debe mostrar la lista de partidos analizados del club, ordenados por fecha descendente.', 'Alta'),
        rfRow('RF-M-11', 'Funcional', 'Cada tarjeta de partido debe mostrar: nombre del club, rival, fecha, marcador, badge de local/visitante y conteo de eventos por tipo.', 'Alta'),
        rfRow('RF-M-12', 'UI/UX', 'Mientras carga la lista se debe mostrar un skeleton animado (no un spinner básico).', 'Media'),
        rfRow('RF-M-13', 'UI/UX', 'Si el club no tiene partidos analizados, se muestra un empty state con ícono y mensaje explicativo.', 'Media'),
        rfRow('RF-M-14', 'Funcional', 'Botón de refresh en la top bar debe recargar los partidos desde el servidor.', 'Media'),
      ]),

      h2('2.3 Detalle del partido'),
      table([
        rfHeader(),
        rfRow('RF-M-20', 'Funcional', 'Al tocar un partido, se muestra el detalle con: header del partido, conteo por tipo, 3 tarjetas de clips (Line-outs, Scrums, Salidas 22).', 'Alta'),
        rfRow('RF-M-21', 'Funcional', 'Cada tarjeta de clip permite tocar para reproducir el video del tipo correspondiente.', 'Alta'),
        rfRow('RF-M-22', 'Funcional', 'Si un tipo no tiene detecciones, la tarjeta se ve deshabilitada con mensaje "Sin clip disponible".', 'Media'),
        rfRow('RF-M-23', 'Funcional', 'Si el usuario es jugador, se muestra al final la sección "Tu rendimiento en este partido" con sus stats individuales (tackles, metros).', 'Alta'),
      ]),

      h2('2.4 Reproducción de video'),
      table([
        rfHeader(),
        rfRow('RF-M-30', 'Funcional', 'La app debe reproducir los clips MP4 en H.264 (los generados por ffmpeg desde el análisis).', 'Alta'),
        rfRow('RF-M-31', 'Funcional', 'Debe permitir controles nativos: play/pause, seek, volumen.', 'Alta'),
        rfRow('RF-M-32', 'Funcional', 'La URL del video debe firmarse con signed URLs de Supabase (privado, expira en 1 hora).', 'Alta'),
        rfRow('RF-M-33', 'Seguridad', 'Los videos se sirven solo a miembros del club (RLS a nivel de Storage).', 'Alta'),
      ]),

      h2('2.5 Estadísticas individuales (solo jugadores)'),
      table([
        rfHeader(),
        rfRow('RF-M-40', 'Funcional', 'El jugador puede acceder a "Mis estadísticas" mediante ícono de perfil en la top bar.', 'Alta'),
        rfRow('RF-M-41', 'Funcional', 'La pantalla muestra: avatar con iniciales, nombre, dorsal, posición, edad.', 'Alta'),
        rfRow('RF-M-42', 'Funcional', 'Stats visibles: Tackles por partido con % de efectividad, Metros ganados por partido, Partidos analizados en la temporada.', 'Alta'),
        rfRow('RF-M-43', 'Funcional', 'El conteo de partidos debe leerse desde la base de datos (no ser un número mockeado).', 'Alta'),
        rfRow('RF-M-44', 'Funcional', 'Al abrir por primera vez, si no existen stats persistidas para ese jugador, se calculan y guardan automáticamente (auto-populate).', 'Media'),
        rfRow('RF-M-45', 'UI/UX', 'La pantalla debe ser scrolleable para que quepa toda la información en pantallas chicas.', 'Media'),
      ]),

      h2('2.6 Rol dirigente'),
      table([
        rfHeader(),
        rfRow('RF-M-50', 'Funcional', 'Los dirigentes ven la misma lista de partidos y clips que los jugadores.', 'Alta'),
        rfRow('RF-M-51', 'Funcional', 'No ven el ícono de "Mis estadísticas" ni la sección "Tu rendimiento" (solo aplica a rol jugador).', 'Media'),
      ]),

      h1('3. Requisitos no funcionales'),
      table([
        rfHeader(),
        rfRow('RNF-M-01', 'Compatibilidad', 'La app debe funcionar en Android 8.0 (API 26) o superior.', 'Alta'),
        rfRow('RNF-M-02', 'Performance', 'La lista de partidos debe cargar en menos de 3 segundos con conexión 4G.', 'Alta'),
        rfRow('RNF-M-03', 'UI/UX', 'La app debe usar Material 3 con la paleta de Apert Vision (verde #39E07A sobre fondo oscuro #080C14).', 'Alta'),
        rfRow('RNF-M-04', 'UI/UX', 'Todas las pantallas deben respetar Material Design touch targets (mínimo 48dp).', 'Media'),
        rfRow('RNF-M-05', 'Offline', 'Si no hay conexión, se muestra un error claro. No se guardan clips en cache local por ahora.', 'Baja'),
        rfRow('RNF-M-06', 'Seguridad', 'Ningún dato sensible se loguea en Logcat en producción.', 'Alta'),
      ]),

      h1('4. Stack tecnológico'),
      bullet('Lenguaje: Kotlin 2.0'),
      bullet('UI: Jetpack Compose Material 3'),
      bullet('Navegación: Navigation Compose'),
      bullet('Backend: Supabase Kotlin SDK 3.0.2 (auth + postgrest + storage)'),
      bullet('Video: Media3 ExoPlayer'),
      bullet('Serialización: kotlinx.serialization'),
      bullet('Build: AGP 9.0 + Gradle 9.2'),
      bullet('Target SDK: 34 (Android 14) · Min SDK: 26 (Android 8.0)'),
    ],
  }],
})

// ═══════════════════════════════════════════════════════════════════════════
// 5) UML (Diagramas descripción)
// ═══════════════════════════════════════════════════════════════════════════
const uml = new Document({
  creator: 'Gonzalo Saguati',
  title: 'UML - Apert Vision',
  sections: [{
    properties: { page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
    children: [
      new Paragraph({
        children: [new TextRun({ text: 'DIAGRAMAS UML', bold: true, size: 40, color: VERDE_OSC })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Apert Vision', size: 26, color: '000000', bold: true })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),

      h1('1. Diagrama de Clases'),
      p('Modelo de dominio del sistema. Las entidades principales son Club, Miembro (con roles), Partido, Evento, Clip, Plan y CreditoMovimiento.'),

      h2('Club'),
      bullet('id: UUID (PK)'),
      bullet('nombre: string'),
      bullet('codigo_entrenador: string (único, 6 chars)'),
      bullet('codigo_dirigente: string (único, 6 chars)'),
      bullet('codigo_jugador: string (único, 6 chars)'),
      bullet('created_at: timestamp'),

      h2('Miembro'),
      bullet('id: UUID (PK)'),
      bullet('auth_user_id: UUID (FK a auth.users)'),
      bullet('club_id: UUID (FK a Club)'),
      bullet('nombre: string'),
      bullet('rol: enum (entrenador | dirigente | jugador)'),
      bullet('dorsal: int (nullable, solo jugadores)'),
      bullet('posicion: string (nullable, solo jugadores)'),
      bullet('edad: int (nullable)'),

      h2('Partido'),
      bullet('id: UUID (PK)'),
      bullet('club_id: UUID (FK)'),
      bullet('creado_por: UUID (FK a Miembro)'),
      bullet('rival: string'),
      bullet('fecha: date'),
      bullet('resultado: enum (W | L | D)'),
      bullet('marcador: string'),
      bullet('es_local: bool'),
      bullet('video_path: string (path local)'),
      bullet('Relación: 1 Partido → N Eventos, 1 Partido → N Clips'),

      h2('Evento'),
      bullet('id: UUID (PK)'),
      bullet('partido_id: UUID (FK)'),
      bullet('tipo: enum (lineout | scrum | kickoff)'),
      bullet('timestamp_seg: number'),
      bullet('confianza: number (0-1)'),

      h2('Clip'),
      bullet('id: UUID (PK)'),
      bullet('partido_id: UUID (FK)'),
      bullet('tipo: enum (lineout | scrum | kickoff)'),
      bullet('url_storage: string (path en Supabase Storage)'),

      h2('PlanCreditos'),
      bullet('id: string (PK, ej: plan_1, plan_10, plan_26)'),
      bullet('nombre: string'),
      bullet('creditos: int'),
      bullet('precio_usd: numeric'),
      bullet('precio_ars: numeric'),
      bullet('destacado: bool'),
      bullet('activo: bool'),

      h2('CreditoMovimiento'),
      bullet('id: UUID (PK)'),
      bullet('club_id: UUID (FK)'),
      bullet('tipo: enum (bienvenida | compra | consumo | ajuste)'),
      bullet('cantidad: int (positivo suma, negativo consume)'),
      bullet('mp_payment_id: string (único, nullable)'),
      bullet('mp_status: string'),
      bullet('monto_ars: numeric'),
      bullet('plan_id: string (FK a PlanCreditos)'),
      bullet('partido_id: UUID (FK, nullable)'),
      bullet('created_at: timestamp'),

      h2('EstadisticasJugador'),
      bullet('jugador_id: UUID (PK, FK a Miembro)'),
      bullet('tackles_por_partido: int'),
      bullet('tackles_efectivos_pct: int (0-100)'),
      bullet('metros_ganados_por_partido: int'),
      bullet('actualizado_en: timestamp'),

      h1('2. Diagrama de Secuencia: Análisis de un partido'),
      p('Flujo completo desde que el entrenador arrastra un video hasta que los clips están disponibles en la app Mobile:'),
      bullet('Entrenador → Desktop UI: Arrastra video MP4'),
      bullet('Desktop UI → Desktop UI: Muestra modal con datos del partido'),
      bullet('Entrenador → Desktop UI: Completa rival, fecha, marcador → click "Iniciar"'),
      bullet('Desktop UI → Supabase: consumir_credito(club_id) → valida saldo'),
      bullet('Supabase → Desktop UI: OK (saldo > 0)'),
      bullet('Desktop UI → Electron main: IPC "analyze-video"'),
      bullet('Electron main → Python: spawn run_electron.py con args (video, output, conf)'),
      bullet('Python: Carga YOLOv8 (best.pt), procesa frame por frame'),
      bullet('Python → Electron: stdout JSON stream con progress + eventos detectados'),
      bullet('Electron → Desktop UI: IPC events "analysis-progress" / "analysis-event"'),
      bullet('Python: Al terminar, genera 3 clips con ffmpeg (line-outs, scrums, salidas)'),
      bullet('Python → Electron: IPC event "analysis-finished" con paths de clips'),
      bullet('Desktop UI → Supabase: insert partido, insert eventos'),
      bullet('Desktop UI → Supabase Storage: upload TUS resumible de los 3 clips'),
      bullet('Desktop UI → Supabase: insert clips con url_storage'),
      bullet('Realtime → Mobile: notification postgres_changes'),
      bullet('Mobile: recarga automáticamente la lista de partidos'),

      h1('3. Diagrama de Secuencia: Compra de créditos'),
      bullet('Entrenador → Desktop UI: elige plan → click "Comprar"'),
      bullet('Desktop UI → Edge Function crear-preferencia-pago: POST {plan_id, club_id}'),
      bullet('Edge Function → Supabase: valida que sea entrenador del club'),
      bullet('Edge Function → Mercado Pago API: POST /checkout/preferences con external_reference'),
      bullet('Mercado Pago → Edge Function: devuelve init_point + sandbox_init_point'),
      bullet('Edge Function → Desktop UI: URL del checkout'),
      bullet('Desktop UI → Electron main: openExternal(URL)'),
      bullet('Electron: abre navegador con el checkout de Mercado Pago'),
      bullet('Entrenador → Mercado Pago: paga con tarjeta test'),
      bullet('Mercado Pago → Edge Function webhook-mp: POST notification'),
      bullet('Edge Function → Mercado Pago API: GET /v1/payments/{id} para verificar status'),
      bullet('Edge Function → Supabase: insert creditos_movimientos (tipo=compra, cantidad=+N)'),
      bullet('Realtime → Desktop UI: notification postgres_changes'),
      bullet('Desktop UI: actualiza el badge del saldo en tiempo real (sin refresh)'),

      h1('4. Diagrama de Casos de Uso'),
      p('Los actores principales del sistema son: Entrenador, Dirigente, Jugador. Cada uno interactúa con un subconjunto de casos de uso:'),

      h2('Entrenador'),
      bullet('Crear club'),
      bullet('Compartir códigos de invitación'),
      bullet('Cargar y analizar partido'),
      bullet('Ver estadísticas globales del club'),
      bullet('Gestionar jugadores'),
      bullet('Comprar créditos'),
      bullet('Ver rendimiento individual de jugadores'),
      bullet('Exportar reporte PDF de un partido'),

      h2('Jugador'),
      bullet('Registrarse con código'),
      bullet('Ver partidos del club'),
      bullet('Reproducir clips de line-outs, scrums, salidas'),
      bullet('Ver sus estadísticas individuales'),
      bullet('Ver su rendimiento en un partido específico'),

      h2('Dirigente'),
      bullet('Registrarse con código'),
      bullet('Ver partidos del club (solo lectura)'),
      bullet('Reproducir clips'),
    ],
  }],
})

// ═══════════════════════════════════════════════════════════════════════════
// 6) DER actualizado (con tablas nuevas)
// ═══════════════════════════════════════════════════════════════════════════
const der = new Document({
  creator: 'Gonzalo Saguati',
  title: 'DER Actualizado - Apert Vision',
  sections: [{
    properties: { page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
    children: [
      new Paragraph({
        children: [new TextRun({ text: 'DIAGRAMA ENTIDAD-RELACIÓN', bold: true, size: 40, color: VERDE_OSC })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Apert Vision — Modelo de datos completo', size: 24, color: '000000', bold: true })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),

      h1('1. Esquema general'),
      p('El sistema utiliza PostgreSQL 15 gestionado por Supabase. Las tablas se dividen en 4 grupos funcionales:'),
      bullet('Autenticación y clubes: auth.users, clubes, miembros'),
      bullet('Análisis de partidos: partidos, eventos, clips'),
      bullet('Sistema de créditos y pagos: planes_creditos, creditos_movimientos'),
      bullet('Estadísticas individuales: estadisticas_jugador'),

      h1('2. Tablas'),

      h2('2.1 clubes'),
      table([
        [cell('Campo', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('Tipo', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('Restricción', { bold: true, bg: VERDE, color: 'FFFFFF' })],
        [cell('id'), cell('UUID'), cell('PK, default gen_random_uuid()')],
        [cell('nombre'), cell('text'), cell('NOT NULL')],
        [cell('codigo_entrenador'), cell('text'), cell('UNIQUE NOT NULL')],
        [cell('codigo_dirigente'), cell('text'), cell('UNIQUE NOT NULL')],
        [cell('codigo_jugador'), cell('text'), cell('UNIQUE NOT NULL')],
        [cell('created_at'), cell('timestamptz'), cell('default now()')],
      ]),
      p('Trigger: al insertar un club nuevo, tr_nuevo_club_credito otorga 1 crédito de bienvenida.'),

      h2('2.2 miembros'),
      table([
        [cell('Campo', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('Tipo', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('Restricción', { bold: true, bg: VERDE, color: 'FFFFFF' })],
        [cell('id'), cell('UUID'), cell('PK')],
        [cell('auth_user_id'), cell('UUID'), cell('FK a auth.users')],
        [cell('club_id'), cell('UUID'), cell('FK a clubes')],
        [cell('nombre'), cell('text'), cell('NOT NULL')],
        [cell('rol'), cell('text'), cell('CHECK IN (entrenador, dirigente, jugador)')],
        [cell('dorsal'), cell('int'), cell('nullable')],
        [cell('posicion'), cell('text'), cell('nullable')],
        [cell('edad'), cell('int'), cell('nullable')],
      ]),

      h2('2.3 partidos'),
      table([
        [cell('Campo', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('Tipo', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('Restricción', { bold: true, bg: VERDE, color: 'FFFFFF' })],
        [cell('id'), cell('UUID'), cell('PK')],
        [cell('club_id'), cell('UUID'), cell('FK a clubes')],
        [cell('creado_por'), cell('UUID'), cell('FK a miembros')],
        [cell('rival'), cell('text'), cell('NOT NULL')],
        [cell('fecha'), cell('date'), cell('NOT NULL')],
        [cell('resultado'), cell('text'), cell('CHECK IN (W, L, D)')],
        [cell('marcador'), cell('text'), cell('nullable')],
        [cell('es_local'), cell('bool'), cell('NOT NULL')],
        [cell('video_path'), cell('text'), cell('nullable')],
      ]),

      h2('2.4 eventos'),
      table([
        [cell('Campo', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('Tipo', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('Restricción', { bold: true, bg: VERDE, color: 'FFFFFF' })],
        [cell('id'), cell('UUID'), cell('PK')],
        [cell('partido_id'), cell('UUID'), cell('FK a partidos')],
        [cell('tipo'), cell('text'), cell('CHECK IN (lineout, scrum, kickoff)')],
        [cell('timestamp_seg'), cell('numeric'), cell('segundo del video')],
        [cell('confianza'), cell('numeric'), cell('confianza del modelo (0-1)')],
      ]),

      h2('2.5 clips'),
      table([
        [cell('Campo', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('Tipo', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('Restricción', { bold: true, bg: VERDE, color: 'FFFFFF' })],
        [cell('id'), cell('UUID'), cell('PK')],
        [cell('partido_id'), cell('UUID'), cell('FK a partidos')],
        [cell('tipo'), cell('text'), cell('lineout | scrum | kickoff')],
        [cell('url_storage'), cell('text'), cell('path en Supabase Storage')],
      ]),

      h2('2.6 planes_creditos (nueva)'),
      table([
        [cell('Campo', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('Tipo', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('Restricción', { bold: true, bg: VERDE, color: 'FFFFFF' })],
        [cell('id'), cell('text'), cell('PK (plan_1, plan_10, plan_26)')],
        [cell('nombre'), cell('text'), cell('NOT NULL')],
        [cell('creditos'), cell('int'), cell('NOT NULL')],
        [cell('precio_usd'), cell('numeric(10,2)'), cell('NOT NULL')],
        [cell('precio_ars'), cell('numeric(12,2)'), cell('NOT NULL')],
        [cell('destacado'), cell('bool'), cell('default false')],
        [cell('orden'), cell('int'), cell('default 0')],
        [cell('activo'), cell('bool'), cell('default true')],
      ]),

      h2('2.7 creditos_movimientos (nueva)'),
      p('Libro contable append-only. Cada movimiento suma o resta al saldo. No hay updates ni deletes.'),
      table([
        [cell('Campo', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('Tipo', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('Restricción', { bold: true, bg: VERDE, color: 'FFFFFF' })],
        [cell('id'), cell('UUID'), cell('PK')],
        [cell('club_id'), cell('UUID'), cell('FK a clubes')],
        [cell('tipo'), cell('text'), cell('CHECK IN (bienvenida, compra, consumo, ajuste)')],
        [cell('cantidad'), cell('int'), cell('positivo suma, negativo resta')],
        [cell('descripcion'), cell('text'), cell('nullable')],
        [cell('plan_id'), cell('text'), cell('FK a planes_creditos, nullable')],
        [cell('mp_payment_id'), cell('text'), cell('UNIQUE, nullable (idempotencia MP)')],
        [cell('mp_status'), cell('text'), cell('approved | pending | rejected')],
        [cell('monto_ars'), cell('numeric(12,2)'), cell('nullable')],
        [cell('monto_usd'), cell('numeric(10,2)'), cell('nullable')],
        [cell('partido_id'), cell('UUID'), cell('FK a partidos, nullable')],
        [cell('creado_por'), cell('UUID'), cell('FK a miembros')],
        [cell('created_at'), cell('timestamptz'), cell('default now()')],
      ]),

      h2('2.8 estadisticas_jugador (nueva)'),
      p('Cada jugador tiene UNA fila con sus stats de temporada. Se auto-populate la primera vez que la app las consulta.'),
      table([
        [cell('Campo', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('Tipo', { bold: true, bg: VERDE, color: 'FFFFFF' }),
         cell('Restricción', { bold: true, bg: VERDE, color: 'FFFFFF' })],
        [cell('jugador_id'), cell('UUID'), cell('PK, FK a miembros')],
        [cell('tackles_por_partido'), cell('int'), cell('CHECK 0-40')],
        [cell('tackles_efectivos_pct'), cell('int'), cell('CHECK 0-100')],
        [cell('metros_ganados_por_partido'), cell('int'), cell('CHECK 0-300')],
        [cell('actualizado_en'), cell('timestamptz'), cell('trigger AUTO')],
      ]),

      h1('3. Vistas'),
      h2('saldo_creditos'),
      p('Vista calculada que agrupa creditos_movimientos por club y devuelve: club_id, club_nombre, saldo (suma), partidos_consumidos, compras_realizadas. Se consulta desde el cliente para mostrar el badge en el sidebar.'),

      h1('4. Funciones RPC'),

      h2('consumir_credito(p_club_id, p_partido_id)'),
      p('Validates que el usuario es entrenador del club y que hay saldo. Inserta un movimiento de consumo con cantidad = -1. Devuelve el nuevo saldo y el ID del movimiento. Se llama desde el cliente al terminar un análisis exitoso.'),

      h2('saldo_del_club(p_club_id)'),
      p('Devuelve el saldo actual del club como int. Wrapper conveniente de la vista.'),

      h2('otorgar_credito_bienvenida()'),
      p('Trigger AFTER INSERT en clubes. Inserta automáticamente 1 crédito de bienvenida.'),

      h1('5. Row Level Security (RLS)'),
      p('Todas las tablas tienen RLS activo. Reglas principales:'),
      bullet('miembros: cada usuario ve solo miembros de su propio club.'),
      bullet('partidos / eventos / clips: filtrados por club_id del usuario.'),
      bullet('planes_creditos: todos ven los planes activos.'),
      bullet('creditos_movimientos: SELECT filtrado por club_id; INSERT solo desde Edge Functions (service_role).'),
      bullet('estadisticas_jugador: SELECT/INSERT/UPDATE para cualquier miembro del club del jugador.'),

      h1('6. Realtime'),
      p('Se habilita la publicación supabase_realtime en las tablas:'),
      bullet('creditos_movimientos → para que el badge del saldo se actualice cuando llega la notificación del webhook de MP.'),
      bullet('estadisticas_jugador → para actualizaciones en vivo si el entrenador edita stats.'),
    ],
  }],
})

// ═══════════════════════════════════════════════════════════════════════════
// Generar todos los documentos
// ═══════════════════════════════════════════════════════════════════════════
;(async () => {
  await guardar(pl03, 'PL03_Entrega_Final.docx')
  await guardar(manual, '07_manual_usuario.docx')
  await guardar(casos, '08_casos_de_prueba.docx')
  await guardar(rfApk, '09_requisitos_funcionales_apk.docx')
  await guardar(uml, '10_UML.docx')
  await guardar(der, '04_DER.docx')
  console.log('\n[✓] Todos los documentos generados en:', OUT)
})()
