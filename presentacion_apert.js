const pptxgen = require('pptxgenjs')

const pres = new pptxgen()
pres.layout = 'LAYOUT_WIDE' // 13.3 x 7.5
pres.author = 'Gonzalo Saguati'
pres.title = 'Apert Vision - Examen Parcial 2'
pres.subject = 'Modelos Estratégicos de Negocios'

// ── Paleta de colores ──
const COL = {
  verde: '00E676',
  verdeOsc: '083C1E',
  verdeOsc2: '0A4422',
  verdeMuyOsc: '041F0E',
  negro: '080C14',
  blanco: 'F8FAF9',
  card: 'FFFFFF',
  cardTint: 'E8F3EC',
  borde: 'D5EBDC',
  texto: '083218',
  textoSec: '4A5D52',
  muted: '6A8070',
  rojo: 'EF4444',
  azul: '3B82F6',
  ambar: 'F59E0B',
  rosa: 'D946EF',
}

const W = 13.3, H = 7.5
const FONT_BODY = 'Calibri'
const FONT_TITLE = 'Cambria'

// ── Helpers ──
const titleBar = (slide, text) => {
  slide.addText(text, {
    x: 0.6, y: 0.45, w: W - 1.2, h: 0.7,
    fontFace: FONT_TITLE, fontSize: 32, bold: true, color: COL.verdeOsc,
    align: 'left', valign: 'middle', margin: 0,
  })
  // Línea sutil de separación (no es accent stripe, es separador funcional)
  slide.addShape(pres.shapes.LINE, {
    x: 0.6, y: 1.20, w: 1.2, h: 0,
    line: { color: COL.verde, width: 4 },
  })
}

const footer = (slide, num, total) => {
  slide.addText('APERT VISION · Modelo de Negocio', {
    x: 0.6, y: H - 0.45, w: 6, h: 0.3,
    fontFace: FONT_BODY, fontSize: 9, color: COL.muted, align: 'left', margin: 0,
  })
  slide.addText(`${num} / ${total}`, {
    x: W - 1.6, y: H - 0.45, w: 1, h: 0.3,
    fontFace: FONT_BODY, fontSize: 9, color: COL.muted, align: 'right', margin: 0,
  })
}

const card = (slide, x, y, w, h, opts = {}) => {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h,
    fill: { color: opts.fill || COL.card },
    line: { color: opts.border || COL.borde, width: 1 },
    rectRadius: 0.1,
    shadow: opts.shadow !== false ? { type: 'outer', color: '000000', blur: 8, offset: 2, angle: 90, opacity: 0.06 } : undefined,
  })
}

const TOTAL = 15

// ════════════════════════════════════════════════════════════════════════
// SLIDE 1 — PORTADA
// ════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide()
  s.background = { color: COL.negro }

  // Tag superior
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: W/2 - 2.2, y: 1.4, w: 4.4, h: 0.5,
    fill: { color: COL.verdeOsc2 }, line: { color: COL.verde, width: 1 }, rectRadius: 0.25,
  })
  s.addText('● COMPUTER VISION · RUGBY ANALYTICS', {
    x: W/2 - 2.2, y: 1.4, w: 4.4, h: 0.5,
    fontFace: FONT_BODY, fontSize: 11, bold: true, color: COL.verde,
    align: 'center', valign: 'middle', charSpacing: 4, margin: 0,
  })

  // Título APERT VISION
  s.addText('APERT VISION', {
    x: 0.5, y: 2.4, w: W - 1, h: 1.4,
    fontFace: FONT_TITLE, fontSize: 88, bold: true, color: COL.verde,
    align: 'center', valign: 'middle', margin: 0, charSpacing: 6,
  })

  // Subtítulo
  s.addText('Análisis automático de rugby amateur con inteligencia artificial', {
    x: 1, y: 4.0, w: W - 2, h: 0.6,
    fontFace: FONT_BODY, fontSize: 18, italic: true, color: COL.blanco,
    align: 'center', margin: 0,
  })

  // Separador
  s.addShape(pres.shapes.LINE, {
    x: W/2 - 0.6, y: 4.8, w: 1.2, h: 0,
    line: { color: COL.verde, width: 3 },
  })

  // Datos
  s.addText([
    { text: 'Modelos Estratégicos de Negocios · Segundo Examen Parcial', options: { breakLine: true, fontSize: 14 } },
    { text: 'Primer cuatrimestre · 2026', options: { breakLine: true, fontSize: 13 } },
    { text: ' ', options: { breakLine: true, fontSize: 6 } },
    { text: 'Integrante: SAGUATI, Gonzalo', options: { breakLine: true, fontSize: 14, bold: true } },
    { text: 'Docente: [APELLIDO], Nombre', options: { fontSize: 12 } },
  ], {
    x: 1, y: 5.3, w: W - 2, h: 1.4,
    fontFace: FONT_BODY, color: COL.blanco, align: 'center',
  })

  s.addNotes('Buenas. Voy a presentarles Apert Vision, un sistema de análisis automático de rugby con IA que desarrollé para clubes amateurs. El proyecto combina la parte técnica (que ya existe y está funcionando al 80%) con un modelo de negocios completo aplicando el framework Business Model Canvas de Osterwalder.')
}

// ════════════════════════════════════════════════════════════════════════
// SLIDE 2 — EL PROBLEMA
// ════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide()
  s.background = { color: COL.blanco }
  titleBar(s, 'El problema: el análisis amateur está roto')

  const dolores = [
    { ic: '⏱', n: '2–4 hs', l: 'Tiempo manual por partido', c: 'Revisar un partido lleva horas. Lento, tedioso, propenso a errores.' },
    { ic: '📊', n: '0%', l: 'Estadísticas reales', c: 'Decisiones tácticas tomadas por memoria, sin datos que las respalden.' },
    { ic: '🎬', n: '95%', l: 'No edita clips', c: 'Editar clips por jugador o jugada lleva más tiempo que el partido mismo.' },
    { ic: '💸', n: 'USD 2k+', l: 'Costo herramientas pro', c: 'Hudl, Catapult y Wyscout son inaccesibles para clubes amateurs.' },
  ]

  dolores.forEach((d, i) => {
    const x = 0.6 + (i % 2) * 6.15
    const y = 1.6 + Math.floor(i / 2) * 2.45
    card(s, x, y, 5.95, 2.2)
    // Número grande
    s.addText(d.n, {
      x: x + 0.3, y: y + 0.3, w: 1.7, h: 0.9,
      fontFace: FONT_TITLE, fontSize: 36, bold: true, color: COL.verde,
      align: 'left', valign: 'middle', margin: 0,
    })
    // Etiqueta
    s.addText(d.l, {
      x: x + 0.3, y: y + 1.1, w: 5.3, h: 0.4,
      fontFace: FONT_BODY, fontSize: 14, bold: true, color: COL.verdeOsc,
      align: 'left', valign: 'top', margin: 0,
    })
    // Descripción
    s.addText(d.c, {
      x: x + 0.3, y: y + 1.5, w: 5.3, h: 0.6,
      fontFace: FONT_BODY, fontSize: 11, color: COL.textoSec,
      align: 'left', valign: 'top', margin: 0,
    })
    // Icono emoji a la derecha grande
    s.addText(d.ic, {
      x: x + 4.6, y: y + 0.2, w: 1.2, h: 1.2,
      fontSize: 40, align: 'center', valign: 'middle', margin: 0,
    })
  })

  // Cita inferior
  s.addText('"Los jugadores me piden videos de sus jugadas, pero no tengo tiempo para editarlos." — Gustavo, entrenador URBA', {
    x: 0.6, y: 6.55, w: W - 1.2, h: 0.4,
    fontFace: FONT_BODY, fontSize: 13, italic: true, color: COL.verdeOsc, align: 'center', margin: 0,
  })

  footer(s, 2, TOTAL)
  s.addNotes('Empecé estudiando el dominio: hablé con entrenadores de clubes de la primera C. La realidad es clara. Un coach amateur dedica entre 2 y 4 horas por partido a mirar video manualmente, anotar a mano y editar clips si tiene tiempo. La mayoría no llega ni a editar. Las plataformas profesionales que automatizan esto cuestan arriba de USD 2.000 al año — los clubes amateurs quedan afuera.')
}

// ════════════════════════════════════════════════════════════════════════
// SLIDE 3 — LA SOLUCIÓN
// ════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide()
  s.background = { color: COL.blanco }
  titleBar(s, 'La solución: análisis automático con IA, accesible y privado')

  // Sub-texto
  s.addText('Dos aplicaciones complementarias que trabajan en conjunto', {
    x: 0.6, y: 1.3, w: W - 1.2, h: 0.4,
    fontFace: FONT_BODY, fontSize: 14, italic: true, color: COL.muted, align: 'left', margin: 0,
  })

  // Card Desktop (izquierda)
  card(s, 0.6, 1.95, 6.1, 4.7, { fill: COL.cardTint })
  s.addText('🖥', {
    x: 0.6, y: 2.1, w: 6.1, h: 1.0,
    fontSize: 48, align: 'center', valign: 'middle', margin: 0,
  })
  s.addText('APERT VISION DESKTOP', {
    x: 0.6, y: 3.05, w: 6.1, h: 0.5,
    fontFace: FONT_TITLE, fontSize: 18, bold: true, color: COL.verdeOsc, align: 'center', margin: 0,
  })
  s.addText('Para entrenadores', {
    x: 0.6, y: 3.5, w: 6.1, h: 0.3,
    fontFace: FONT_BODY, fontSize: 11, italic: true, color: COL.muted, align: 'center', margin: 0,
  })
  s.addText([
    { text: 'Carga el video del partido', options: { bullet: true, breakLine: true } },
    { text: 'YOLO v8 analiza en tu PC (privado)', options: { bullet: true, breakLine: true } },
    { text: 'Genera clips por categoría', options: { bullet: true, breakLine: true } },
    { text: 'Dashboard de estadísticas', options: { bullet: true, breakLine: true } },
    { text: 'Exporta PDF para el staff', options: { bullet: true } },
  ], {
    x: 1.0, y: 4.0, w: 5.3, h: 2.4,
    fontFace: FONT_BODY, fontSize: 13, color: COL.texto, paraSpaceAfter: 4,
  })

  // Card Mobile (derecha)
  card(s, 6.85, 1.95, 5.85, 4.7, { fill: COL.cardTint })
  s.addText('📱', {
    x: 6.85, y: 2.1, w: 5.85, h: 1.0,
    fontSize: 48, align: 'center', valign: 'middle', margin: 0,
  })
  s.addText('APERT VISION MOBILE', {
    x: 6.85, y: 3.05, w: 5.85, h: 0.5,
    fontFace: FONT_TITLE, fontSize: 18, bold: true, color: COL.verdeOsc, align: 'center', margin: 0,
  })
  s.addText('Para todo el club', {
    x: 6.85, y: 3.5, w: 5.85, h: 0.3,
    fontFace: FONT_BODY, fontSize: 11, italic: true, color: COL.muted, align: 'center', margin: 0,
  })
  s.addText([
    { text: 'Jugadores ven sus clips desde Android', options: { bullet: true, breakLine: true } },
    { text: 'Dirigentes con visibilidad técnica', options: { bullet: true, breakLine: true } },
    { text: 'Acceso por código de invitación', options: { bullet: true, breakLine: true } },
    { text: 'Reproductor con timeline navegable', options: { bullet: true, breakLine: true } },
    { text: 'Histórico de partidos del club', options: { bullet: true } },
  ], {
    x: 7.25, y: 4.0, w: 5.05, h: 2.4,
    fontFace: FONT_BODY, fontSize: 13, color: COL.texto, paraSpaceAfter: 4,
  })

  // Stack
  s.addText('Stack: Electron + React (Desktop) · Kotlin Compose (Mobile) · Python + YOLO v8 · Supabase', {
    x: 0.6, y: 6.78, w: W - 1.2, h: 0.3,
    fontFace: FONT_BODY, fontSize: 10, color: COL.muted, align: 'center', italic: true, margin: 0,
  })

  footer(s, 3, TOTAL)
  s.addNotes('Apert Vision son dos apps complementarias. La Desktop la usa el entrenador para procesar partidos — el video nunca sale de su PC, lo cual es un diferencial de privacidad. La Mobile la usa todo el club para ver los clips ya procesados. Comparten el mismo backend Supabase.')
}

// ════════════════════════════════════════════════════════════════════════
// SLIDE 4 — VISIÓN, MISIÓN, VALORES
// ════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide()
  s.background = { color: COL.blanco }
  titleBar(s, 'Identidad organizacional')

  // Tres bloques horizontales
  const items = [
    { t: 'VISIÓN', c: COL.verde, txt: 'Ser la plataforma líder de análisis automático de rugby para clubes amateurs en Latinoamérica.', sub: 'El sueño fundacional · largo plazo' },
    { t: 'MISIÓN', c: COL.verdeOsc, txt: 'Democratizar el análisis profesional de rugby con IA accesible, asequible y privada. El video del cliente nunca abandona su PC.', sub: 'El propósito en el mercado · qué hacemos' },
    { t: 'VALORES', c: COL.azul, txt: 'Accesibilidad · Privacidad · Comunidad · Simplicidad · Honestidad comercial', sub: 'Cómo trabajamos · cultura' },
  ]
  items.forEach((it, i) => {
    const x = 0.6 + i * 4.15
    const y = 1.6
    card(s, x, y, 3.95, 5.2)
    // Header
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.4, y: y + 0.5, w: 3.15, h: 0.5,
      fill: { color: it.c }, line: { color: it.c, width: 0 }, rectRadius: 0.1,
    })
    s.addText(it.t, {
      x: x + 0.4, y: y + 0.5, w: 3.15, h: 0.5,
      fontFace: FONT_BODY, fontSize: 14, bold: true, color: COL.blanco,
      align: 'center', valign: 'middle', charSpacing: 4, margin: 0,
    })
    s.addText(it.sub, {
      x: x + 0.4, y: y + 1.15, w: 3.15, h: 0.3,
      fontFace: FONT_BODY, fontSize: 10, italic: true, color: COL.muted,
      align: 'center', margin: 0,
    })
    // Texto principal
    s.addText(it.txt, {
      x: x + 0.4, y: y + 1.7, w: 3.15, h: 3.2,
      fontFace: FONT_BODY, fontSize: 14, color: COL.texto,
      align: 'left', valign: 'top', margin: 0,
    })
  })

  footer(s, 4, TOTAL)
  s.addNotes('La visión es el sueño: ser líderes en rugby amateur en LATAM. La misión es lo que hacemos hoy: democratizar el análisis con IA local y privada. Los valores guían cómo trabajamos: accesibilidad, privacidad, comunidad, simplicidad y honestidad comercial — particularmente el pago por uso sin trucos.')
}

// ════════════════════════════════════════════════════════════════════════
// SLIDE 5 — ANÁLISIS DEL ENTORNO
// ════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide()
  s.background = { color: COL.blanco }
  titleBar(s, 'Análisis del entorno: micro y macro')

  // MICROAMBIENTE - izquierda
  card(s, 0.6, 1.5, 6.1, 5.4)
  s.addText('MICROAMBIENTE', {
    x: 0.6, y: 1.7, w: 6.1, h: 0.4,
    fontFace: FONT_TITLE, fontSize: 16, bold: true, color: COL.verde,
    align: 'center', charSpacing: 3, margin: 0,
  })
  s.addText('Actores cercanos · podemos influir', {
    x: 0.6, y: 2.1, w: 6.1, h: 0.3,
    fontFace: FONT_BODY, fontSize: 11, italic: true, color: COL.muted,
    align: 'center', margin: 0,
  })
  s.addText([
    { text: 'Competidores directos: ', options: { bold: true, color: COL.verde } },
    { text: 'NO existen en amateur ARG ★', options: { breakLine: true } },
    { text: 'Indirectos: ', options: { bold: true, color: COL.verdeOsc } },
    { text: 'Hudl, Catapult (USD 2k+/año, segmento pro)', options: { breakLine: true } },
    { text: 'Sustitutos: ', options: { bold: true, color: COL.verdeOsc } },
    { text: 'análisis manual del coach con Excel', options: { breakLine: true } },
    { text: 'Proveedores: ', options: { bold: true, color: COL.verdeOsc } },
    { text: 'Supabase, YOLO, Resend (todos reemplazables)', options: { breakLine: true } },
    { text: 'Distribuidores: ', options: { bold: true, color: COL.verdeOsc } },
    { text: 'web propia + Google Play Store', options: { breakLine: true } },
    { text: 'Públicos: ', options: { bold: true, color: COL.verdeOsc } },
    { text: 'comunidad rugby, URBA, medios, redes técnicas', options: {} },
  ], {
    x: 1.0, y: 2.6, w: 5.3, h: 4.0,
    fontFace: FONT_BODY, fontSize: 12, color: COL.texto, paraSpaceAfter: 6,
  })

  // MACROAMBIENTE - derecha
  card(s, 6.85, 1.5, 5.85, 5.4)
  s.addText('MACROAMBIENTE (PESTEL)', {
    x: 6.85, y: 1.7, w: 5.85, h: 0.4,
    fontFace: FONT_TITLE, fontSize: 16, bold: true, color: COL.azul,
    align: 'center', charSpacing: 3, margin: 0,
  })
  s.addText('Fuerzas externas · no controlables', {
    x: 6.85, y: 2.1, w: 5.85, h: 0.3,
    fontFace: FONT_BODY, fontSize: 11, italic: true, color: COL.muted,
    align: 'center', margin: 0,
  })
  s.addText([
    { text: '✅ ', options: { color: COL.verde, bold: true } },
    { text: 'Demográfico: ', options: { bold: true } },
    { text: '84% penetración smartphone en ARG', options: { breakLine: true } },
    { text: '✅ ', options: { color: COL.verde, bold: true } },
    { text: 'Tecnológico: ', options: { bold: true } },
    { text: 'democratización IA + cloud barato', options: { breakLine: true } },
    { text: '✅ ', options: { color: COL.verde, bold: true } },
    { text: 'Social/Cultural: ', options: { bold: true } },
    { text: 'profesionalización de clubes amateurs', options: { breakLine: true } },
    { text: '✅ ', options: { color: COL.verde, bold: true } },
    { text: 'Legal: ', options: { bold: true } },
    { text: 'Ley 25.326 nos favorece (procesamiento local)', options: { breakLine: true } },
    { text: '⚠️ ', options: { color: COL.ambar, bold: true } },
    { text: 'Económico: ', options: { bold: true } },
    { text: 'inflación ARG + costos cloud dolarizados', options: { breakLine: true } },
    { text: '○ ', options: { color: COL.muted, bold: true } },
    { text: 'Ambiental: ', options: { bold: true } },
    { text: 'sin impacto significativo (software puro)', options: {} },
  ], {
    x: 7.2, y: 2.6, w: 5.15, h: 4.0,
    fontFace: FONT_BODY, fontSize: 11.5, color: COL.texto, paraSpaceAfter: 4,
  })

  footer(s, 5, TOTAL)
  s.addNotes('En el microambiente la noticia es que NO hay competencia directa en rugby amateur — esa es nuestra oportunidad central. En el macroambiente PESTEL hay cuatro dimensiones favorables (demográfica, tecnológica, social y legal) y una amenaza concreta: la inflación argentina con costos cloud en dólares. Lo mitigamos con un pricing por partido en pesos pero ajustable trimestralmente.')
}

// ════════════════════════════════════════════════════════════════════════
// SLIDE 6 — BUYER PERSONA
// ════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide()
  s.background = { color: COL.blanco }
  titleBar(s, 'El cliente: Gustavo, entrenador amateur URBA')

  // Avatar circular
  s.addShape(pres.shapes.OVAL, {
    x: 0.8, y: 1.7, w: 2.4, h: 2.4,
    fill: { color: COL.verde }, line: { color: COL.verdeOsc, width: 4 },
  })
  s.addText('GP', {
    x: 0.8, y: 1.7, w: 2.4, h: 2.4,
    fontFace: FONT_TITLE, fontSize: 60, bold: true, color: COL.negro,
    align: 'center', valign: 'middle', margin: 0,
  })
  // Nombre
  s.addText('Gustavo Pereyra', {
    x: 0.4, y: 4.2, w: 3.2, h: 0.5,
    fontFace: FONT_TITLE, fontSize: 22, bold: true, color: COL.verdeOsc,
    align: 'center', margin: 0,
  })
  s.addText('45 años · Contador · Entrenador Primera C', {
    x: 0.4, y: 4.7, w: 3.2, h: 0.3,
    fontFace: FONT_BODY, fontSize: 11, italic: true, color: COL.muted,
    align: 'center', margin: 0,
  })
  s.addText('Buenos Aires (URBA)', {
    x: 0.4, y: 5.0, w: 3.2, h: 0.3,
    fontFace: FONT_BODY, fontSize: 11, color: COL.muted,
    align: 'center', margin: 0,
  })
  // Tag rol
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 1.2, y: 5.4, w: 1.6, h: 0.4,
    fill: { color: COL.cardTint }, line: { color: COL.verde, width: 1 }, rectRadius: 0.15,
  })
  s.addText('🏉 RUGBY x PASIÓN', {
    x: 1.2, y: 5.4, w: 1.6, h: 0.4,
    fontFace: FONT_BODY, fontSize: 9, bold: true, color: COL.verdeOsc,
    align: 'center', valign: 'middle', charSpacing: 2, margin: 0,
  })

  // Cuadrantes a la derecha (mapa empatía resumido)
  const cuadrantes = [
    { t: 'OBJETIVOS', c: COL.verde, txt: 'Mejorar el rendimiento del equipo, lograr ascenso, dar feedback a sus jugadores, ser respetado por el staff técnico.' },
    { t: 'FRUSTRACIONES', c: COL.rojo, txt: 'Sin tiempo para analizar video, decisiones basadas en intuición, no puede armar clips, presión de dirigentes.' },
    { t: 'DICE Y HACE', c: COL.azul, txt: 'Anota stats a mano en Excel, mira partidos los lunes, comparte links de partidos profesionales en WhatsApp del equipo.' },
    { t: 'DISPONIBILIDAD', c: COL.ambar, txt: 'Paga USD 10-15 por partido. NO acepta suscripción mensual (temporada con meses muertos). Sí acepta packs.' },
  ]
  cuadrantes.forEach((q, i) => {
    const x = 4.2 + (i % 2) * 4.3
    const y = 1.7 + Math.floor(i / 2) * 2.4
    card(s, x, y, 4.1, 2.15)
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.3, y: y + 0.3, w: 1.8, h: 0.35,
      fill: { color: q.c }, line: { color: q.c, width: 0 }, rectRadius: 0.1,
    })
    s.addText(q.t, {
      x: x + 0.3, y: y + 0.3, w: 1.8, h: 0.35,
      fontFace: FONT_BODY, fontSize: 10, bold: true, color: COL.blanco,
      align: 'center', valign: 'middle', charSpacing: 2, margin: 0,
    })
    s.addText(q.txt, {
      x: x + 0.3, y: y + 0.8, w: 3.5, h: 1.3,
      fontFace: FONT_BODY, fontSize: 11, color: COL.texto,
      align: 'left', valign: 'top', margin: 0,
    })
  })

  footer(s, 6, TOTAL)
  s.addNotes('Gustavo es nuestro buyer persona — basado en entrevistas reales con coaches URBA. Es contador que entrena por pasión, sin remuneración. Tiene el dolor concreto, dispone de presupuesto chico (acepta hasta USD 15/partido) y prefiere pago por uso porque la temporada tiene meses muertos. Esto sustenta la decisión de monetización transaccional, no suscripción.')
}

// ════════════════════════════════════════════════════════════════════════
// SLIDE 7 — RESULTADOS INVESTIGACIÓN
// ════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide()
  s.background = { color: COL.blanco }
  titleBar(s, 'Investigación de mercado: 5 hallazgos que validan el modelo')

  const datos = [
    { n: '92%', l: 'no analiza video sistemáticamente', d: 'Falta de tiempo es la razón #1' },
    { n: '83%', l: 'interés alto en herramienta automatizada', d: 'Promedio 4.4/5 en la escala de interés' },
    { n: '67%', l: 'acepta USD 10–15 por partido', d: 'Validamos el rango de pricing' },
    { n: '70%', l: 'prefiere pago por uso (vs suscripción)', d: 'Confirma elección de monetización' },
    { n: '100%', l: 'valora privacidad del video original', d: 'Procesamiento local = diferencial real' },
  ]
  datos.forEach((d, i) => {
    const x = 0.6 + (i % 3) * 4.15
    const y = 1.6 + Math.floor(i / 3) * 2.6
    card(s, x, y, 3.95, 2.3)
    s.addText(d.n, {
      x: x + 0.3, y: y + 0.3, w: 3.35, h: 1.0,
      fontFace: FONT_TITLE, fontSize: 48, bold: true, color: COL.verde,
      align: 'left', valign: 'middle', margin: 0,
    })
    s.addText(d.l, {
      x: x + 0.3, y: y + 1.25, w: 3.35, h: 0.5,
      fontFace: FONT_BODY, fontSize: 12, bold: true, color: COL.verdeOsc,
      align: 'left', valign: 'top', margin: 0,
    })
    s.addText(d.d, {
      x: x + 0.3, y: y + 1.75, w: 3.35, h: 0.4,
      fontFace: FONT_BODY, fontSize: 10, italic: true, color: COL.muted,
      align: 'left', valign: 'top', margin: 0,
    })
  })

  s.addText('Muestra: 8 entrevistas en profundidad + 30 respuestas a encuesta online · Coaches URBA y regionales', {
    x: 0.6, y: 6.78, w: W - 1.2, h: 0.3,
    fontFace: FONT_BODY, fontSize: 10, color: COL.muted, italic: true, align: 'center', margin: 0,
  })

  footer(s, 7, TOTAL)
  s.addNotes('La investigación validó las tres apuestas centrales: el dolor existe (92% no analiza por tiempo), hay disposición a pagar pero acotada (USD 10-15) y la privacidad es un diferencial percibido por el 100% de los entrevistados. Estas tres conclusiones sostienen las decisiones del Canvas, especialmente el modelo de monetización y la arquitectura local.')
}

// ════════════════════════════════════════════════════════════════════════
// SLIDE 8 — FODA
// ════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide()
  s.background = { color: COL.blanco }
  titleBar(s, 'FODA: diagnóstico estratégico')

  const cuadrantes = [
    { t: 'FORTALEZAS', sub: 'Internas · Positivas', c: COL.verde, items: ['Modelo YOLO propio con dataset ARG ★', 'Stack moderno end-to-end', 'Procesamiento local = privacidad', 'Costos operativos bajos', 'Producto 80% funcional'] },
    { t: 'DEBILIDADES', sub: 'Internas · Negativas', c: COL.rojo, items: ['Equipo unipersonal (1 dev)', 'Modelo IA incompleto (solo line-outs)', 'Sin instalador final del Desktop', 'Sin presupuesto de marketing', 'Dependencia del coach embajador'] },
    { t: 'OPORTUNIDADES', sub: 'Externas · Positivas', c: COL.azul, items: ['Mercado amateur desatendido (400+ clubes)', 'Profesionalización de clubes', 'Democratización de IA', 'Android domina ARG (80%)', 'Expansión regional LATAM'] },
    { t: 'AMENAZAS', sub: 'Externas · Negativas', c: COL.ambar, items: ['Entrada futura Hudl/Catapult al amateur', 'Inflación ARG / devaluación', 'Cambios regulatorios IA', 'Resistencia cultural al cambio', 'Falta cultura de pago digital'] },
  ]
  cuadrantes.forEach((q, i) => {
    const x = 0.6 + (i % 2) * 6.15
    const y = 1.5 + Math.floor(i / 2) * 2.7
    card(s, x, y, 5.95, 2.5)
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.3, y: y + 0.25, w: 2.3, h: 0.5,
      fill: { color: q.c }, line: { color: q.c, width: 0 }, rectRadius: 0.1,
    })
    s.addText(q.t, {
      x: x + 0.3, y: y + 0.25, w: 2.3, h: 0.5,
      fontFace: FONT_BODY, fontSize: 12, bold: true, color: COL.blanco,
      align: 'center', valign: 'middle', charSpacing: 3, margin: 0,
    })
    s.addText(q.sub, {
      x: x + 2.7, y: y + 0.3, w: 2.5, h: 0.4,
      fontFace: FONT_BODY, fontSize: 10, italic: true, color: COL.muted,
      align: 'left', valign: 'middle', margin: 0,
    })
    s.addText(q.items.map((it, idx) => ({ text: it, options: { bullet: true, breakLine: idx < q.items.length - 1 } })), {
      x: x + 0.5, y: y + 0.85, w: 5.4, h: 1.55,
      fontFace: FONT_BODY, fontSize: 11, color: COL.texto, paraSpaceAfter: 2,
    })
  })

  footer(s, 8, TOTAL)
  s.addNotes('FODA completo: como fortalezas, el modelo IA propio con dataset local es nuestro activo diferencial. Como debilidad más crítica, el equipo unipersonal. La oportunidad clave es el mercado desatendido (~400 clubes) y la amenaza principal es la inflación ARG. La estrategia FO es: usar el modelo propio para capturar rápido el mercado antes de que los profesionales bajen al amateur.')
}

// ════════════════════════════════════════════════════════════════════════
// SLIDE 9 — BUSINESS MODEL CANVAS
// ════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide()
  s.background = { color: COL.blanco }
  titleBar(s, 'Business Model Canvas — los 9 bloques')

  // Layout Osterwalder real: 3 cols arriba grandes + 2 cols abajo
  const drawBlock = (x, y, w, h, codigo, titulo, items, fill) => {
    card(s, x, y, w, h, { fill, shadow: false })
    s.addText(codigo + ' · ' + titulo, {
      x: x + 0.15, y: y + 0.1, w: w - 0.3, h: 0.35,
      fontFace: FONT_BODY, fontSize: 9, bold: true, color: COL.verdeOsc,
      align: 'left', charSpacing: 1, margin: 0,
    })
    s.addText(items.map((it, idx) => ({ text: it, options: { bullet: true, breakLine: idx < items.length - 1 } })), {
      x: x + 0.2, y: y + 0.5, w: w - 0.4, h: h - 0.6,
      fontFace: FONT_BODY, fontSize: 9, color: COL.texto, paraSpaceAfter: 1,
    })
  }

  // Coordenadas
  const yTop = 1.45, yMid = 4.05, yBot = 5.8
  const altaCol = 2.6, mediaCol = 1.75, bajoRow = 1.55

  // Fila 1 (arriba) — 5 columnas: AsC | AC | PV | RCl | SM
  drawBlock(0.6, yTop, 2.4, altaCol, 'AsC', 'SOCIOS CLAVE', [
    'Coach embajador (Gustavo)',
    'URBA (futuro)',
    'Proveedores: Supabase, YOLO, Resend',
  ], COL.cardTint)

  drawBlock(3.0, yTop, 2.4, mediaCol, 'AC', 'ACTIVIDADES CLAVE', [
    'Entrenamiento modelo IA',
    'Desarrollo Desktop + Mobile',
    'Onboarding de clubes',
  ], COL.cardTint)

  drawBlock(5.4, yTop, 2.5, altaCol, 'PV', 'PROPUESTA DE VALOR', [
    'IA detecta formaciones automático',
    'Clips listos para el club',
    'Privacidad: video local',
    'Pago por uso, sin suscripción',
  ], COL.card)

  drawBlock(7.9, yTop, 2.4, mediaCol, 'RCl', 'RELACIONES CLIENTES', [
    'Asistencia personal (early)',
    'Autoservicio (escala)',
    'Cocreación (videos→dataset)',
  ], COL.cardTint)

  drawBlock(10.3, yTop, 2.4, altaCol, 'SM', 'SEGMENTO MERCADO', [
    'Clubes rugby amateur ARG',
    '~400 (URBA + interior)',
    'Nicho B2B · 3 roles',
  ], COL.cardTint)

  // Fila 2 (medio) — RC y C (filas del medio de AC y RCl)
  drawBlock(3.0, yTop + mediaCol, 2.4, mediaCol - 0.05, 'RC', 'RECURSOS CLAVE', [
    'Modelo YOLO ★',
    'Dataset rugby ARG ★',
    'Código fuente',
    '1 dev full-stack',
  ], COL.cardTint)

  drawBlock(7.9, yTop + mediaCol, 2.4, mediaCol - 0.05, 'C', 'CANALES', [
    'Info: redes técnicas + bbo a bca',
    'Eval: trial gratis',
    'Compra: self-service web',
    'Entrega: Desktop + Play Store',
  ], COL.cardTint)

  // Fila 3 (abajo) — EC y FI
  drawBlock(0.6, yBot, 6.05, bajoRow, 'EC', 'ESTRUCTURA DE COSTOS', [
    'FIJOS ~75%: tiempo dev, dominio',
    'VARIABLES ~25%: Supabase, Resend, pasarela',
    'Orientación: COST-DRIVEN',
  ], '#E8F0E8')

  drawBlock(6.65, yBot, 6.05, bajoRow, 'FI', 'FUENTES DE INGRESOS', [
    'Trial: 1er partido GRATIS',
    'Básico USD 8 · Premium USD 15',
    'Pack Temporada USD 120 (10 partidos -20%)',
  ], '#E8F0E8')

  footer(s, 9, TOTAL)
  s.addNotes('El Canvas completo muestra cómo se articulan los 9 bloques. Del lado del mercado: nicho B2B con 3 roles, propuesta de valor centrada en accesibilidad y privacidad, canales orgánicos. Del lado de la empresa: recursos intelectuales como activo crítico, actividades de producción + plataforma, socios estratégicos vs proveedores intercambiables. En finanzas: estructura cost-driven y monetización transaccional.')
}

// ════════════════════════════════════════════════════════════════════════
// SLIDE 10 — MONETIZACIÓN
// ════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide()
  s.background = { color: COL.blanco }
  titleBar(s, 'Modelo de monetización: pago por uso')

  // Tabla de planes
  const planes = [
    { t: 'TRIAL', precio: 'GRATIS', desc: '1er partido', extra: 'Lead generation', c: COL.muted },
    { t: 'BÁSICO', precio: 'USD 8', desc: 'por partido', extra: 'Solo line-outs', c: COL.azul },
    { t: 'PREMIUM', precio: 'USD 15', desc: 'por partido', extra: 'Line-outs + Scrums + Salidas + PDF', c: COL.verde },
    { t: 'PACK TEMPORADA', precio: 'USD 120', desc: '10 partidos (-20%)', extra: 'Pack con commitment', c: COL.verdeOsc },
  ]
  planes.forEach((p, i) => {
    const x = 0.6 + i * 3.1
    const y = 1.6
    card(s, x, y, 2.95, 4.0)
    // Header del plan
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.25, y: y + 0.25, w: 2.45, h: 0.6,
      fill: { color: p.c }, line: { color: p.c, width: 0 }, rectRadius: 0.1,
    })
    s.addText(p.t, {
      x: x + 0.25, y: y + 0.25, w: 2.45, h: 0.6,
      fontFace: FONT_BODY, fontSize: 13, bold: true, color: COL.blanco,
      align: 'center', valign: 'middle', charSpacing: 3, margin: 0,
    })
    // Precio
    s.addText(p.precio, {
      x: x + 0.2, y: y + 1.1, w: 2.55, h: 1.0,
      fontFace: FONT_TITLE, fontSize: 30, bold: true, color: p.c,
      align: 'center', valign: 'middle', margin: 0,
    })
    s.addText(p.desc, {
      x: x + 0.2, y: y + 2.1, w: 2.55, h: 0.4,
      fontFace: FONT_BODY, fontSize: 12, italic: true, color: COL.muted,
      align: 'center', margin: 0,
    })
    // Extras
    s.addText(p.extra, {
      x: x + 0.3, y: y + 2.8, w: 2.35, h: 1.0,
      fontFace: FONT_BODY, fontSize: 11, color: COL.texto,
      align: 'center', valign: 'top', margin: 0,
    })
  })

  // Justificación
  card(s, 0.6, 5.85, W - 1.2, 1.05, { fill: COL.cardTint })
  s.addText([
    { text: '¿Por qué no suscripción mensual? ', options: { bold: true, color: COL.verdeOsc, fontSize: 13 } },
    { text: 'Los clubes amateurs juegan 15-20 partidos por temporada pero solo analizan a fondo 5-8. Una suscripción anual los percibirían como cara. El pago por partido se ajusta a su realidad económica. ', options: { fontSize: 12 } },
    { text: '70% de los encuestados confirmó esta preferencia.', options: { bold: true, color: COL.verde, fontSize: 12 } },
  ], {
    x: 0.85, y: 5.95, w: W - 1.7, h: 0.85,
    fontFace: FONT_BODY, color: COL.texto, valign: 'middle', margin: 0,
  })

  footer(s, 10, TOTAL)
  s.addNotes('Pricing escalonado: gratis para captar leads, USD 8 plan básico, USD 15 premium con las 3 categorías de detección, y un pack de temporada con descuento del 20% para los que se comprometen. La decisión de pago por uso en vez de suscripción está validada por la investigación: 70% lo prefiere.')
}

// ════════════════════════════════════════════════════════════════════════
// SLIDE 11 — VIABILIDAD ECONÓMICA
// ════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide()
  s.background = { color: COL.blanco }
  titleBar(s, 'Viabilidad económica: punto de equilibrio y métricas')

  // Big number arriba
  card(s, 0.6, 1.5, 6.1, 2.5)
  s.addText('Punto de equilibrio', {
    x: 0.6, y: 1.7, w: 6.1, h: 0.4,
    fontFace: FONT_BODY, fontSize: 13, italic: true, color: COL.muted, align: 'center', margin: 0,
  })
  s.addText('6', {
    x: 0.6, y: 2.1, w: 6.1, h: 1.4,
    fontFace: FONT_TITLE, fontSize: 96, bold: true, color: COL.verde,
    align: 'center', valign: 'middle', margin: 0,
  })
  s.addText('clubes activos = 41 partidos/mes', {
    x: 0.6, y: 3.55, w: 6.1, h: 0.35,
    fontFace: FONT_BODY, fontSize: 14, bold: true, color: COL.verdeOsc,
    align: 'center', margin: 0,
  })

  // 4 KPIs derecha
  const kpis = [
    { l: 'INVERSIÓN INICIAL', v: 'USD 10 025', c: COL.azul },
    { l: 'COSTO OPERATIVO/MES', v: 'USD 660', c: COL.ambar },
    { l: 'PAYBACK', v: '14–16 meses', c: COL.verde },
    { l: 'TIR ANUAL', v: '~52%', c: COL.verdeOsc },
  ]
  kpis.forEach((k, i) => {
    const x = 6.85 + (i % 2) * 2.95
    const y = 1.5 + Math.floor(i / 2) * 1.3
    card(s, x, y, 2.75, 1.15)
    s.addText(k.v, {
      x: x + 0.1, y: y + 0.15, w: 2.55, h: 0.55,
      fontFace: FONT_TITLE, fontSize: 22, bold: true, color: k.c,
      align: 'center', valign: 'middle', margin: 0,
    })
    s.addText(k.l, {
      x: x + 0.1, y: y + 0.7, w: 2.55, h: 0.3,
      fontFace: FONT_BODY, fontSize: 9, color: COL.muted,
      align: 'center', charSpacing: 1, margin: 0,
    })
  })

  // Chart bar abajo: proyección 24 meses
  s.addChart(pres.charts.BAR, [{
    name: 'Ingresos proyectados USD/mes',
    labels: ['M1-3', 'M4-6', 'M7-12', 'M13-18', 'M19-24'],
    values: [120, 420, 1176, 2600, 4160],
  }], {
    x: 0.6, y: 4.2, w: W - 1.2, h: 2.6, barDir: 'col',
    chartColors: [COL.verde],
    chartArea: { fill: { color: 'FFFFFF' }, roundedCorners: true },
    catAxisLabelColor: COL.muted, catAxisLabelFontSize: 10,
    valAxisLabelColor: COL.muted, valAxisLabelFontSize: 9,
    valGridLine: { color: 'E2E8F0', size: 0.5 },
    catGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'outEnd', dataLabelColor: COL.verdeOsc, dataLabelFontSize: 10,
    showLegend: false,
    showTitle: true, title: 'Proyección de ingresos mensuales · 24 meses', titleColor: COL.verdeOsc, titleFontSize: 12, titleFontFace: FONT_BODY,
  })

  footer(s, 11, TOTAL)
  s.addNotes('El break-even se alcanza con 6 clubes activos, proyectivamente entre el mes 6-7. La inversión inicial de USD 10.025 se recupera entre los meses 14-16. La TIR anual es del 52%, muy por encima del costo de oportunidad del 15%. El gráfico muestra la curva de ingresos esperada: arrancamos con USD 120/mes y proyectamos USD 4.160/mes al mes 24.')
}

// ════════════════════════════════════════════════════════════════════════
// SLIDE 12 — MARKETING MIX 4P
// ════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide()
  s.background = { color: COL.blanco }
  titleBar(s, 'Marketing Mix 4P · Plan de marketing digital')

  const ps = [
    { p: 'P', n: 'PRODUCTO', txt: 'Software Desktop (Electron + React) + Mobile (Kotlin Compose). Análisis IA local + clips automáticos + dashboard.', c: COL.verde },
    { p: '$', n: 'PRECIO', txt: 'Pago por uso. Trial gratis, USD 8 básico, USD 15 premium, USD 120 pack temporada. Cost-driven en early stage.', c: COL.azul },
    { p: '📍', n: 'PLAZA', txt: 'Web propia (apertvision.com) + Google Play Store. Self-service 24/7. Cobertura ARG y expansión LATAM.', c: COL.ambar },
    { p: '📣', n: 'PROMOCIÓN', txt: 'Content marketing + boca a boca del coach embajador + Instagram/YouTube/LinkedIn + email drip + alianzas URBA.', c: COL.rosa },
  ]
  ps.forEach((it, i) => {
    const x = 0.6 + (i % 2) * 6.15
    const y = 1.5 + Math.floor(i / 2) * 2.75
    card(s, x, y, 5.95, 2.55)
    // Big P
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.3, y: y + 0.4, w: 1.2, h: 1.2,
      fill: { color: it.c }, line: { color: it.c, width: 0 },
    })
    s.addText(it.p, {
      x: x + 0.3, y: y + 0.4, w: 1.2, h: 1.2,
      fontFace: FONT_TITLE, fontSize: 36, bold: true, color: COL.blanco,
      align: 'center', valign: 'middle', margin: 0,
    })
    // Nombre
    s.addText(it.n, {
      x: x + 1.65, y: y + 0.45, w: 4.1, h: 0.5,
      fontFace: FONT_TITLE, fontSize: 18, bold: true, color: it.c,
      align: 'left', valign: 'middle', charSpacing: 2, margin: 0,
    })
    // Texto
    s.addText(it.txt, {
      x: x + 1.65, y: y + 1.0, w: 4.1, h: 1.4,
      fontFace: FONT_BODY, fontSize: 11.5, color: COL.texto,
      align: 'left', valign: 'top', margin: 0,
    })
  })

  // Footer cita 4C
  s.addText('Complementariamente las 4C de Kotler: Cliente · Costo · Conveniencia · Comunicación', {
    x: 0.6, y: 6.78, w: W - 1.2, h: 0.3,
    fontFace: FONT_BODY, fontSize: 10, italic: true, color: COL.muted, align: 'center', margin: 0,
  })

  footer(s, 12, TOTAL)
  s.addNotes('Las 4P estándar de Kotler: Producto son las dos apps end-to-end, Precio es pago por uso transaccional, Plaza es self-service web + Play Store, y Promoción es 100% orgánica en early-stage. Complementariamente las 4C: Cliente, Costo, Conveniencia y Comunicación — el mismo análisis pero desde la óptica del cliente.')
}

// ════════════════════════════════════════════════════════════════════════
// SLIDE 13 — EMBUDO DE MARKETING
// ════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide()
  s.background = { color: COL.blanco }
  titleBar(s, 'Embudo de marketing · 5 etapas del recorrido del cliente')

  const fases = [
    { n: '1', t: 'DESCUBRIMIENTO', txt: 'Reels Instagram · Posts en grupos coaches · YouTube short demostrativo', c: COL.azul },
    { n: '2', t: 'CONSIDERACIÓN', txt: 'Blog comparativo · Caso éxito Casa de Padua · Webinar mensual', c: COL.verde },
    { n: '3', t: 'DECISIÓN', txt: '"1er partido GRATIS, sin tarjeta" · Testimonio del coach embajador · Garantía', c: COL.verdeOsc },
    { n: '4', t: 'CONVERSIÓN', txt: 'Onboarding WhatsApp en 5 min · Email "tu partido está listo" · Trigger upgrade', c: COL.ambar },
    { n: '5', t: 'FIDELIZACIÓN', txt: 'Comunidad Discord · Newsletter mensual · Programa de referidos · NPS', c: COL.rosa },
  ]

  fases.forEach((f, i) => {
    const x = 0.6
    const y = 1.5 + i * 1.05
    // Número circle
    s.addShape(pres.shapes.OVAL, {
      x: x, y: y, w: 0.85, h: 0.85,
      fill: { color: f.c }, line: { color: f.c, width: 0 },
    })
    s.addText(f.n, {
      x: x, y: y, w: 0.85, h: 0.85,
      fontFace: FONT_TITLE, fontSize: 32, bold: true, color: COL.blanco,
      align: 'center', valign: 'middle', margin: 0,
    })
    // Card al lado
    card(s, x + 1.05, y, W - 2.25, 0.85, { fill: COL.card, shadow: false })
    // Título
    s.addText(f.t, {
      x: x + 1.25, y: y + 0.05, w: 3.5, h: 0.4,
      fontFace: FONT_BODY, fontSize: 13, bold: true, color: f.c,
      align: 'left', valign: 'middle', charSpacing: 2, margin: 0,
    })
    // Texto
    s.addText(f.txt, {
      x: x + 1.25, y: y + 0.42, w: W - 2.5, h: 0.4,
      fontFace: FONT_BODY, fontSize: 11, color: COL.texto,
      align: 'left', valign: 'middle', margin: 0,
    })
  })

  footer(s, 13, TOTAL)
  s.addNotes('El embudo va de descubrimiento (atraer con contenido valor amplio) a fidelización (retener y generar referidos). La métrica de conversión real no es el signup: es que el coach complete su PRIMER análisis. Por eso el onboarding por WhatsApp en los primeros 5 minutos es crítico.')
}

// ════════════════════════════════════════════════════════════════════════
// SLIDE 14 — ESTADO ACTUAL Y ROADMAP
// ════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide()
  s.background = { color: COL.blanco }
  titleBar(s, 'Estado actual del proyecto y roadmap')

  // Big % 80
  s.addShape(pres.shapes.OVAL, {
    x: 0.8, y: 1.7, w: 3.2, h: 3.2,
    fill: { color: COL.cardTint }, line: { color: COL.verde, width: 6 },
  })
  s.addText('80%', {
    x: 0.8, y: 1.7, w: 3.2, h: 3.2,
    fontFace: FONT_TITLE, fontSize: 64, bold: true, color: COL.verde,
    align: 'center', valign: 'middle', margin: 0,
  })
  s.addText('MVP completado', {
    x: 0.6, y: 5.0, w: 3.6, h: 0.4,
    fontFace: FONT_BODY, fontSize: 14, bold: true, color: COL.verdeOsc,
    align: 'center', margin: 0,
  })
  s.addText('Funciona end-to-end', {
    x: 0.6, y: 5.4, w: 3.6, h: 0.4,
    fontFace: FONT_BODY, fontSize: 12, italic: true, color: COL.muted,
    align: 'center', margin: 0,
  })

  // Bloque "Ya funciona"
  card(s, 4.4, 1.7, 4.0, 5.0, { fill: COL.cardTint })
  s.addText('✅ YA FUNCIONA', {
    x: 4.4, y: 1.85, w: 4.0, h: 0.4,
    fontFace: FONT_BODY, fontSize: 13, bold: true, color: COL.verde,
    align: 'center', charSpacing: 2, margin: 0,
  })
  s.addText([
    { text: 'Detección de line-outs con YOLO v8', options: { bullet: true, breakLine: true } },
    { text: 'App Desktop Electron + React', options: { bullet: true, breakLine: true } },
    { text: 'App Mobile Kotlin + Compose', options: { bullet: true, breakLine: true } },
    { text: 'Backend Supabase (auth + DB + storage)', options: { bullet: true, breakLine: true } },
    { text: 'Pipeline: análisis → compresión → upload', options: { bullet: true, breakLine: true } },
    { text: 'Roles diferenciados (entrenador, jugador, dirigente)', options: { bullet: true, breakLine: true } },
    { text: 'Distribución de clips multi-dispositivo', options: { bullet: true, breakLine: true } },
    { text: 'Landing page profesional', options: { bullet: true } },
  ], {
    x: 4.6, y: 2.35, w: 3.6, h: 4.2,
    fontFace: FONT_BODY, fontSize: 11, color: COL.texto, paraSpaceAfter: 4,
  })

  // Bloque "Próximo"
  card(s, 8.6, 1.7, 4.1, 5.0)
  s.addText('⏳ PRÓXIMOS PASOS', {
    x: 8.6, y: 1.85, w: 4.1, h: 0.4,
    fontFace: FONT_BODY, fontSize: 13, bold: true, color: COL.ambar,
    align: 'center', charSpacing: 2, margin: 0,
  })
  s.addText([
    { text: 'Entrenar modelo para scrums + salidas', options: { bullet: true, breakLine: true } },
    { text: 'Instalador .exe firmado del Desktop', options: { bullet: true, breakLine: true } },
    { text: 'APK firmado para distribución', options: { bullet: true, breakLine: true } },
    { text: 'Integración Mercado Pago', options: { bullet: true, breakLine: true } },
    { text: 'Notificaciones push al mobile', options: { bullet: true, breakLine: true } },
    { text: '3 clubes piloto identificados', options: { bullet: true, breakLine: true } },
    { text: 'Alianza institucional con URBA', options: { bullet: true, breakLine: true } },
    { text: 'Expansión a Uruguay/Chile (mediano plazo)', options: { bullet: true } },
  ], {
    x: 8.8, y: 2.35, w: 3.7, h: 4.2,
    fontFace: FONT_BODY, fontSize: 11, color: COL.texto, paraSpaceAfter: 4,
  })

  footer(s, 14, TOTAL)
  s.addNotes('El proyecto está al 80% del MVP completo: funciona end-to-end y los clientes pueden usarlo. Lo que queda para llegar al 100%: completar el modelo IA para las otras dos categorías de detección, hacer el instalador firmado del Desktop, integrar Mercado Pago y agregar notificaciones push. A mediano plazo: alianzas institucionales y expansión regional.')
}

// ════════════════════════════════════════════════════════════════════════
// SLIDE 15 — CIERRE
// ════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide()
  s.background = { color: COL.negro }

  // Tag superior
  s.addText('CIERRE', {
    x: 0, y: 0.9, w: W, h: 0.4,
    fontFace: FONT_BODY, fontSize: 12, bold: true, color: COL.verde,
    align: 'center', charSpacing: 6, margin: 0,
  })

  // Cita central — la frase del Canvas del PDF
  s.addText('"El Canvas no es un documento.', {
    x: 1, y: 1.8, w: W - 2, h: 0.9,
    fontFace: FONT_TITLE, fontSize: 44, bold: true, color: COL.blanco, italic: true,
    align: 'center', margin: 0,
  })
  s.addText('Es una hipótesis."', {
    x: 1, y: 2.7, w: W - 2, h: 0.9,
    fontFace: FONT_TITLE, fontSize: 44, bold: true, color: COL.verde, italic: true,
    align: 'center', margin: 0,
  })

  // Línea separadora
  s.addShape(pres.shapes.LINE, {
    x: W/2 - 0.8, y: 4.0, w: 1.6, h: 0,
    line: { color: COL.verde, width: 2 },
  })

  // Subtexto
  s.addText([
    { text: 'Apert Vision parte de esa hipótesis con una diferencia importante:', options: { breakLine: true, fontSize: 16, color: COL.blanco } },
    { text: 'el código ya está escrito.', options: { breakLine: true, fontSize: 16, bold: true, color: COL.verde } },
    { text: ' ', options: { breakLine: true, fontSize: 8 } },
    { text: 'El próximo paso es salir a validarla con los 3 clubes piloto.', options: { fontSize: 14, italic: true, color: 'CCCCCC' } },
  ], {
    x: 1, y: 4.3, w: W - 2, h: 1.8,
    fontFace: FONT_BODY, align: 'center', valign: 'top',
  })

  // ¿Preguntas?
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: W/2 - 1.8, y: 6.2, w: 3.6, h: 0.7,
    fill: { color: COL.verde }, line: { color: COL.verde, width: 0 }, rectRadius: 0.35,
  })
  s.addText('¿PREGUNTAS?', {
    x: W/2 - 1.8, y: 6.2, w: 3.6, h: 0.7,
    fontFace: FONT_TITLE, fontSize: 20, bold: true, color: COL.negro,
    align: 'center', valign: 'middle', charSpacing: 4, margin: 0,
  })

  s.addNotes('Cierre con la frase clave del material de clase: "El Canvas no es un documento, es una hipótesis". La diferencia de Apert Vision es que el código ya está escrito, no es solo papel — es un producto técnico además de un modelo de negocio. El próximo paso es salir a validarlo comercialmente con 3 clubes piloto. Spotify arrancó igual con una hipótesis en 2006. La diferencia es que salió a validarla. Es lo que sigue.')
}

// ── Generar ──
pres.writeFile({ fileName: 'C:\\Users\\sagua\\Downloads\\Apert_Vision_Presentacion.pptx' })
  .then(f => console.log('Generado:', f))
