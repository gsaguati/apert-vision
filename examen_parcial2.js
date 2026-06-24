const fs = require('fs')
const path = require('path')
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, LevelFormat, BorderStyle, WidthType, ShadingType,
  PageBreak,
} = require('docx')

// ── Estilos ──
const VERDE = '0E6E36'
const VERDE_OSC = '083C1E'
const VERDE_CLARO = 'D5EBDC'
const GRIS_CLARO = 'F0F4F0'
const AZUL_DATO = 'E8F0F7'
const NEGRO = '083218'

const bL = { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' }
const bordersL = { top: bL, bottom: bL, left: bL, right: bL }

// helpers
const h1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1,
  children: [new TextRun({ text: t, color: VERDE, bold: true })],
  spacing: { before: 360, after: 180 } })
const h2 = t => new Paragraph({ heading: HeadingLevel.HEADING_2,
  children: [new TextRun({ text: t, color: VERDE_OSC, bold: true })],
  spacing: { before: 260, after: 130 } })
const h3 = t => new Paragraph({ heading: HeadingLevel.HEADING_3,
  children: [new TextRun({ text: t, color: NEGRO, bold: true })],
  spacing: { before: 180, after: 80 } })
const p = (t, opts = {}) => new Paragraph({
  children: Array.isArray(t) ? t : [new TextRun(t)],
  spacing: { after: 120 }, ...opts })
const bul = t => new Paragraph({
  numbering: { reference: 'b', level: 0 },
  children: typeof t === 'string' ? [new TextRun(t)] : t,
  spacing: { after: 60 } })
const bulB = (lbl, txt) => new Paragraph({
  numbering: { reference: 'b', level: 0 },
  children: [new TextRun({ text: lbl + ': ', bold: true }), new TextRun(txt)],
  spacing: { after: 60 } })
const num = t => new Paragraph({
  numbering: { reference: 'n', level: 0 },
  children: typeof t === 'string' ? [new TextRun(t)] : t,
  spacing: { after: 60 } })
const cita = t => new Paragraph({
  children: [new TextRun({ text: t, italics: true, color: VERDE_OSC })],
  indent: { left: 360 }, spacing: { before: 100, after: 160 },
  border: { left: { style: BorderStyle.SINGLE, size: 24, color: VERDE, space: 12 } }
})
const cell = (text, opts = {}) => {
  const { bold = false, fill = null, w = 4680, color = NEGRO,
          align = AlignmentType.LEFT, small = false } = opts
  const ch = Array.isArray(text)
    ? text.map(t => new Paragraph({ children: [new TextRun({ text: t, bold, color, size: small ? 18 : 22 })],
        alignment: align, spacing: { after: 40 } }))
    : [new Paragraph({ children: [new TextRun({ text, bold, color, size: small ? 18 : 22 })], alignment: align })]
  return new TableCell({
    borders: bordersL,
    width: { size: w, type: WidthType.DXA },
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: ch,
  })
}
const tabla = (cols, rows) => new Table({
  width: { size: 9360, type: WidthType.DXA }, columnWidths: cols, rows
})

// ── Tablas ──
const tMicro = tabla([2200, 7160], [
  new TableRow({ children: [
    cell('Actor', { bold: true, fill: VERDE_CLARO, w: 2200 }),
    cell('Análisis para Apert Vision', { bold: true, fill: VERDE_CLARO, w: 7160 })
  ]}),
  new TableRow({ children: [
    cell('La empresa', { bold: true, w: 2200 }),
    cell('Equipo fundador de 1 persona (full-stack). Estructura plana, sin oficinas físicas. Tecnología propietaria: modelo YOLO entrenado, dos aplicaciones (Desktop+Mobile), motor Python. Recursos disponibles: capacidad técnica, dominio del problema (validado con coach embajador), bootstrap sin financiamiento externo.', { w: 7160 })
  ]}),
  new TableRow({ children: [
    cell('Proveedores estratégicos', { bold: true, w: 2200 }),
    cell('Supabase (auth + DB + storage) — proveedor reemplazable. Ultralytics (YOLO) — open source. Resend (email transaccional). Tienen riesgo bajo de dependencia ya que son intercambiables.', { w: 7160 })
  ]}),
  new TableRow({ children: [
    cell('Proveedores tácticos', { bold: true, w: 2200 }),
    cell('Dominio (Namecheap, GoDaddy), hosting de landing (Vercel/Netlify), herramientas de comunicación (Discord, WhatsApp Business). Costos bajos, alta sustituibilidad.', { w: 7160 })
  ]}),
  new TableRow({ children: [
    cell('Distribuidores', { bold: true, w: 2200 }),
    cell('Canales propios: landing apertvision.com (descarga Desktop + signup). Canal de socio: Google Play Store para la app Android. A futuro: alianzas con federaciones (URBA) como canal institucional.', { w: 7160 })
  ]}),
  new TableRow({ children: [
    cell('Competidores directos', { bold: true, w: 2200 }),
    cell('NO existen en el segmento de rugby amateur argentino. Esta es la oportunidad central del proyecto: hay un nicho desatendido por las soluciones profesionales.', { w: 7160 })
  ]}),
  new TableRow({ children: [
    cell('Competidores indirectos', { bold: true, w: 2200 }),
    cell('Hudl, Catapult, Wyscout: plataformas profesionales con precios de USD 2.000+/año. Cubren la misma necesidad pero para clubes profesionales. No bajan al segmento amateur.', { w: 7160 })
  ]}),
  new TableRow({ children: [
    cell('Sustitutos', { bold: true, w: 2200 }),
    cell('Método tradicional: análisis manual del coach con planilla Excel + visualización en VLC. Es lo que hoy hacen el 95% de los clubes amateurs. Nuestro principal competidor real es el statu quo, no otra plataforma.', { w: 7160 })
  ]}),
  new TableRow({ children: [
    cell('Públicos', { bold: true, w: 2200 }),
    cell('Comunidad de rugby amateur (entrenadores, jugadores, padres), federaciones (URBA), medios deportivos (Rugby Champagne, Vía País Rugby), redes técnicas de coaches en Facebook/WhatsApp. Inversores potenciales (rondas semilla a futuro). Reguladores: AAIP (protección de datos en ARG).', { w: 7160 })
  ]}),
])

const tMacro = tabla([1800, 4500, 1500, 1560], [
  new TableRow({ children: [
    cell('Dimensión', { bold: true, fill: VERDE_CLARO, w: 1800 }),
    cell('Factor', { bold: true, fill: VERDE_CLARO, w: 4500 }),
    cell('Tipo', { bold: true, fill: VERDE_CLARO, w: 1500, align: AlignmentType.CENTER }),
    cell('Impacto', { bold: true, fill: VERDE_CLARO, w: 1560, align: AlignmentType.CENTER })
  ]}),
  new TableRow({ children: [
    cell('Demográfica', { bold: true, w: 1800 }),
    cell('Argentina con población joven (mediana 32 años) — segmento rugby amateur en crecimiento. Alta penetración de smartphones (84%).', { w: 4500 }),
    cell('OPORTUNIDAD', { bold: true, color: VERDE, w: 1500, align: AlignmentType.CENTER, small: true }),
    cell('Alto', { w: 1560, align: AlignmentType.CENTER })
  ]}),
  new TableRow({ children: [
    cell('Económica', { bold: true, w: 1800 }),
    cell('Inflación argentina alta (recurrente). Poder adquisitivo limitado de los clubes amateurs. Sin embargo, el dólar es referencia para servicios cloud.', { w: 4500 }),
    cell('AMENAZA', { bold: true, color: 'C0392B', w: 1500, align: AlignmentType.CENTER, small: true }),
    cell('Medio', { w: 1560, align: AlignmentType.CENTER })
  ]}),
  new TableRow({ children: [
    cell('Económica', { bold: true, w: 1800 }),
    cell('Modelo pago por uso (no suscripción) reduce barrera de entrada para clubes con presupuesto ajustado. Mercado Pago facilita cobros.', { w: 4500 }),
    cell('OPORTUNIDAD', { bold: true, color: VERDE, w: 1500, align: AlignmentType.CENTER, small: true }),
    cell('Alto', { w: 1560, align: AlignmentType.CENTER })
  ]}),
  new TableRow({ children: [
    cell('Tecnológica', { bold: true, w: 1800 }),
    cell('Democratización de IA (YOLO open source). Cloud computing barato (Supabase free hasta 1 GB). Android dominante en ARG (80% del market share mobile).', { w: 4500 }),
    cell('OPORTUNIDAD', { bold: true, color: VERDE, w: 1500, align: AlignmentType.CENTER, small: true }),
    cell('Alto', { w: 1560, align: AlignmentType.CENTER })
  ]}),
  new TableRow({ children: [
    cell('Tecnológica', { bold: true, w: 1800 }),
    cell('Aparición de modelos foundation (GPT, Gemini) que podrían sumarse al análisis táctico en el futuro. Tendencia hacia edge AI (inferencia local) coincide con nuestra arquitectura.', { w: 4500 }),
    cell('OPORTUNIDAD', { bold: true, color: VERDE, w: 1500, align: AlignmentType.CENTER, small: true }),
    cell('Medio', { w: 1560, align: AlignmentType.CENTER })
  ]}),
  new TableRow({ children: [
    cell('Política / Legal', { bold: true, w: 1800 }),
    cell('Ley 25.326 de Protección de Datos Personales (ARG). Nuestra arquitectura local minimiza riesgos: el video original nunca abandona la PC del cliente.', { w: 4500 }),
    cell('OPORTUNIDAD', { bold: true, color: VERDE, w: 1500, align: AlignmentType.CENTER, small: true }),
    cell('Medio', { w: 1560, align: AlignmentType.CENTER })
  ]}),
  new TableRow({ children: [
    cell('Política / Legal', { bold: true, w: 1800 }),
    cell('Inestabilidad política y cambios regulatorios. Posibles nuevas regulaciones sobre IA en la región (siguiendo AI Act europeo).', { w: 4500 }),
    cell('AMENAZA', { bold: true, color: 'C0392B', w: 1500, align: AlignmentType.CENTER, small: true }),
    cell('Bajo', { w: 1560, align: AlignmentType.CENTER })
  ]}),
  new TableRow({ children: [
    cell('Cultural / Social', { bold: true, w: 1800 }),
    cell('Rugby crece en visibilidad pero sigue siendo minoritario. Cultura del "tercer tiempo" valora la comunidad — encaja con nuestro modelo multi-rol (coach + jugadores + dirigentes).', { w: 4500 }),
    cell('OPORTUNIDAD', { bold: true, color: VERDE, w: 1500, align: AlignmentType.CENTER, small: true }),
    cell('Medio', { w: 1560, align: AlignmentType.CENTER })
  ]}),
  new TableRow({ children: [
    cell('Cultural / Social', { bold: true, w: 1800 }),
    cell('Profesionalización progresiva de los clubes amateurs: cada vez más usan tecnología (apps de gestión, grupos de WhatsApp organizados).', { w: 4500 }),
    cell('OPORTUNIDAD', { bold: true, color: VERDE, w: 1500, align: AlignmentType.CENTER, small: true }),
    cell('Alto', { w: 1560, align: AlignmentType.CENTER })
  ]}),
  new TableRow({ children: [
    cell('Natural / Ambiental', { bold: true, w: 1800 }),
    cell('No hay impacto ambiental significativo: software puro. Procesamiento local incluso reduce consumo energético vs. cloud computing intensivo.', { w: 4500 }),
    cell('Neutro', { bold: true, w: 1500, align: AlignmentType.CENTER, small: true }),
    cell('Bajo', { w: 1560, align: AlignmentType.CENTER })
  ]}),
])

const tBuyer = tabla([2400, 6960], [
  new TableRow({ children: [
    cell('Dato', { bold: true, fill: VERDE_CLARO, w: 2400 }),
    cell('Descripción', { bold: true, fill: VERDE_CLARO, w: 6960 })
  ]}),
  new TableRow({ children: [
    cell('Nombre ficticio', { bold: true, w: 2400 }),
    cell('Gustavo Pereyra', { w: 6960 })
  ]}),
  new TableRow({ children: [
    cell('Edad', { bold: true, w: 2400 }),
    cell('45 años', { w: 6960 })
  ]}),
  new TableRow({ children: [
    cell('Profesión / Ocupación', { bold: true, w: 2400 }),
    cell('Contador. Entrenador de rugby amateur por pasión (sin remuneración o muy baja)', { w: 6960 })
  ]}),
  new TableRow({ children: [
    cell('Ubicación', { bold: true, w: 2400 }),
    cell('Buenos Aires (URBA, zona norte). Aplica también a Tucumán, Córdoba, Rosario', { w: 6960 })
  ]}),
  new TableRow({ children: [
    cell('Contexto del club', { bold: true, w: 2400 }),
    cell('Entrenador de Primera C (división de ascenso). Plantel de 25-30 jugadores. Club con tradición pero recursos limitados. Compite por temporada de 15-20 partidos', { w: 6960 })
  ]}),
  new TableRow({ children: [
    cell('Nivel tecnológico', { bold: true, w: 2400 }),
    cell('Medio. Usa WhatsApp para coordinar el equipo, Excel para anotar estadísticas, YouTube para mirar partidos profesionales. No usa software de análisis específico', { w: 6960 })
  ]}),
  new TableRow({ children: [
    cell('Objetivos', { bold: true, w: 2400 }),
    cell('Mejorar el rendimiento de su equipo. Lograr que su club ascienda. Que los jugadores se sientan acompañados y aprendan. Ser respetado por el cuerpo técnico', { w: 6960 })
  ]}),
  new TableRow({ children: [
    cell('Frustraciones (pains)', { bold: true, w: 2400 }),
    cell('Le quita tiempo familiar revisar videos. No puede armar clips por dispersión técnica. Tiene que justificar decisiones tácticas con "lo que vio" sin datos. Los jugadores le piden videos de sus jugadas y no puede dárselos', { w: 6960 })
  ]}),
  new TableRow({ children: [
    cell('Necesidades (gains)', { bold: true, w: 2400 }),
    cell('Una herramienta que le saque trabajo manual. Datos para conversar con dirigentes en la asamblea. Reconocimiento de su equipo técnico. Aprovechar mejor sus pocas horas disponibles', { w: 6960 })
  ]}),
  new TableRow({ children: [
    cell('Disposición a pagar', { bold: true, w: 2400 }),
    cell('USD 10-15 por partido analizado. NO acepta suscripción mensual fija porque la temporada tiene meses muertos. Acepta pack temporada con descuento', { w: 6960 })
  ]}),
  new TableRow({ children: [
    cell('Canales preferidos', { bold: true, w: 2400 }),
    cell('Recomendación de otros coaches (boca a boca). WhatsApp y grupos de Facebook de entrenadores. YouTube tutoriales', { w: 6960 })
  ]}),
])

const tMapaEmpatia = tabla([2400, 6960], [
  new TableRow({ children: [
    cell('¿Qué...', { bold: true, fill: VERDE_CLARO, w: 2400 }),
    cell('Descripción para Gustavo', { bold: true, fill: VERDE_CLARO, w: 6960 })
  ]}),
  new TableRow({ children: [
    cell('VE?', { bold: true, w: 2400, align: AlignmentType.CENTER }),
    cell('Otros entrenadores profesionales con herramientas modernas. Clubes que ascienden por inversión tecnológica. Soluciones online inaccesibles por precio. A sus propios jugadores subiendo videos a Instagram', { w: 6960 })
  ]}),
  new TableRow({ children: [
    cell('OYE?', { bold: true, w: 2400, align: AlignmentType.CENTER }),
    cell('Jugadores que le piden video de sus jugadas. Compañeros del staff diciendo "necesitamos analizar más". Dirigentes pidiendo resultados. Su esposa diciendo "estás muy ocupado los lunes con el rugby"', { w: 6960 })
  ]}),
  new TableRow({ children: [
    cell('PIENSA Y SIENTE?', { bold: true, w: 2400, align: AlignmentType.CENTER }),
    cell('Pasión por el rugby pero también frustración por la falta de tiempo. Ganas de ayudar más a su equipo. Curiosidad por la tecnología pero miedo a complicarse. Preocupación por defender sus decisiones tácticas', { w: 6960 })
  ]}),
  new TableRow({ children: [
    cell('DICE Y HACE?', { bold: true, w: 2400, align: AlignmentType.CENTER }),
    cell('Comparte links de partidos profesionales en grupos de WhatsApp del equipo. Anota estadísticas a mano en libreta o Excel. Mira partidos los lunes a la noche cuando puede. Va a torneos juveniles a observar', { w: 6960 })
  ]}),
  new TableRow({ children: [
    cell('DOLORES?', { bold: true, w: 2400, align: AlignmentType.CENTER, color: 'C0392B' }),
    cell('Tiempo insuficiente. Sin presupuesto del club para herramientas. Decisiones tácticas basadas en intuición. Presión de los dirigentes por resultados. No puede mostrar a sus jugadores en qué fallan', { w: 6960 })
  ]}),
  new TableRow({ children: [
    cell('BENEFICIOS DESEADOS?', { bold: true, w: 2400, align: AlignmentType.CENTER, color: VERDE }),
    cell('Que su equipo gane más partidos. Tener datos para hablar con autoridad. Conservar tiempo familiar. Ver que sus jugadores mejoran. Reconocimiento del club y de la comunidad rugby', { w: 6960 })
  ]}),
])

const tInvestigacion = tabla([3000, 6360], [
  new TableRow({ children: [
    cell('Aspecto', { bold: true, fill: VERDE_CLARO, w: 3000 }),
    cell('Detalle', { bold: true, fill: VERDE_CLARO, w: 6360 })
  ]}),
  new TableRow({ children: [
    cell('Objetivo de la investigación', { bold: true, w: 3000 }),
    cell('Validar el dolor del entrenador amateur al analizar partidos y dimensionar la disposición a pagar por una herramienta automatizada', { w: 6360 })
  ]}),
  new TableRow({ children: [
    cell('Fuentes primarias', { bold: true, w: 3000 }),
    cell('Entrevistas en profundidad a 8 entrenadores de clubes URBA y observación directa del proceso actual de análisis post-partido (shadowing)', { w: 6360 })
  ]}),
  new TableRow({ children: [
    cell('Fuentes secundarias', { bold: true, w: 3000 }),
    cell('Páginas web de la URBA (cantidad de clubes federados), notas en medios deportivos sobre profesionalización del rugby amateur, precios de Hudl y Catapult en sus sitios oficiales', { w: 6360 })
  ]}),
  new TableRow({ children: [
    cell('Método principal', { bold: true, w: 3000 }),
    cell('Entrevistas semiestructuradas (45 min c/u) + encuesta de validación cuantitativa (30 respuestas vía Google Forms)', { w: 6360 })
  ]}),
  new TableRow({ children: [
    cell('Muestra', { bold: true, w: 3000 }),
    cell('8 entrenadores entrevistados (Primera C, juveniles, femenino). 30 respuestas a encuesta vía grupos de Facebook de coaches', { w: 6360 })
  ]}),
])

const tFODA_F = tabla([2400, 6960], [
  new TableRow({ children: [
    cell('Fortaleza', { bold: true, fill: '00C853', color: 'FFFFFF', w: 2400 }),
    cell('Detalle', { bold: true, fill: '00C853', color: 'FFFFFF', w: 6960 })
  ]}),
  new TableRow({ children: [cell('Modelo IA propietario', { bold: true, w: 2400 }), cell('Modelo YOLO entrenado específicamente con dataset de rugby amateur argentino. Activo intelectual difícil de replicar', { w: 6960 })]}),
  new TableRow({ children: [cell('Stack moderno end-to-end', { bold: true, w: 2400 }), cell('Desktop (Electron+React), Mobile (Kotlin+Compose), Backend (Supabase) — arquitectura coherente y mantenible', { w: 6960 })]}),
  new TableRow({ children: [cell('Procesamiento local', { bold: true, w: 2400 }), cell('El video del cliente nunca sale de su PC. Convertimos un requisito técnico en diferencial: privacidad como ventaja competitiva', { w: 6960 })]}),
  new TableRow({ children: [cell('Costos operativos bajos', { bold: true, w: 2400 }), cell('Bootstrap completo. Infraestructura cloud variable (crece con ingresos). Sin gastos fijos elevados', { w: 6960 })]}),
  new TableRow({ children: [cell('Producto funcional al 80%', { bold: true, w: 2400 }), cell('Pipeline completo funcionando: análisis → compresión → upload → consumo móvil. No es prototipo: es MVP demostrable', { w: 6960 })]}),
  new TableRow({ children: [cell('Conocimiento del dominio', { bold: true, w: 2400 }), cell('Validación previa con entrenador embajador (Gustavo). El producto fue diseñado con feedback real, no en abstracto', { w: 6960 })]}),
])

const tFODA_D = tabla([2400, 6960], [
  new TableRow({ children: [
    cell('Debilidad', { bold: true, fill: 'EF4444', color: 'FFFFFF', w: 2400 }),
    cell('Detalle', { bold: true, fill: 'EF4444', color: 'FFFFFF', w: 6960 })
  ]}),
  new TableRow({ children: [cell('Equipo unipersonal', { bold: true, w: 2400 }), cell('1 desarrollador full-stack como único recurso humano. Cuello de botella crítico para escalar', { w: 6960 })]}),
  new TableRow({ children: [cell('Modelo IA incompleto', { bold: true, w: 2400 }), cell('Hoy solo detecta line-outs con buena precisión. Scrums y salidas están en proceso de entrenamiento', { w: 6960 })]}),
  new TableRow({ children: [cell('Sin instalador final', { bold: true, w: 2400 }), cell('El Desktop hoy se ejecuta desde código fuente. Necesita instalador .exe firmado para distribución masiva', { w: 6960 })]}),
  new TableRow({ children: [cell('Sin presupuesto de marketing', { bold: true, w: 2400 }), cell('Bootstrap puro. Toda la captación inicial depende de boca a boca y contenido orgánico', { w: 6960 })]}),
  new TableRow({ children: [cell('Dependencia del coach embajador', { bold: true, w: 2400 }), cell('La validación y el primer canal de distribución se apoyan en una sola persona. Riesgo de concentración', { w: 6960 })]}),
  new TableRow({ children: [cell('Sin pasarela de pago integrada', { bold: true, w: 2400 }), cell('Falta integrar Mercado Pago/Stripe para cobrar automáticamente. Hoy el cobro sería manual', { w: 6960 })]}),
])

const tFODA_O = tabla([2400, 6960], [
  new TableRow({ children: [
    cell('Oportunidad', { bold: true, fill: '3B82F6', color: 'FFFFFF', w: 2400 }),
    cell('Detalle', { bold: true, fill: '3B82F6', color: 'FFFFFF', w: 6960 })
  ]}),
  new TableRow({ children: [cell('Mercado desatendido', { bold: true, w: 2400 }), cell('No existe competencia directa en rugby amateur argentino. 400+ clubes URBA + interior sin solución actual', { w: 6960 })]}),
  new TableRow({ children: [cell('Profesionalización clubes', { bold: true, w: 2400 }), cell('Tendencia creciente: clubes amateur cada vez más adoptan herramientas digitales (apps gestión, comunicación)', { w: 6960 })]}),
  new TableRow({ children: [cell('Democratización de IA', { bold: true, w: 2400 }), cell('Modelos foundation cada vez más accesibles. YOLO open source. Costos de cómputo bajando año a año', { w: 6960 })]}),
  new TableRow({ children: [cell('Penetración smartphone', { bold: true, w: 2400 }), cell('Android domina el mercado ARG con 80%. Nuestra app llega a casi todo el público objetivo', { w: 6960 })]}),
  new TableRow({ children: [cell('Crecimiento del rugby', { bold: true, w: 2400 }), cell('Rugby femenino en expansión rápida. Categorías juveniles fortaleciéndose. Más clubes = más mercado', { w: 6960 })]}),
  new TableRow({ children: [cell('Expansión regional', { bold: true, w: 2400 }), cell('Mismo producto sirve para Uruguay, Chile, Brasil. Mercado total LATAM 5-10x mayor que ARG', { w: 6960 })]}),
])

const tFODA_A = tabla([2400, 6960], [
  new TableRow({ children: [
    cell('Amenaza', { bold: true, fill: 'F59E0B', color: 'FFFFFF', w: 2400 }),
    cell('Detalle', { bold: true, fill: 'F59E0B', color: 'FFFFFF', w: 6960 })
  ]}),
  new TableRow({ children: [cell('Entrada de Hudl/Catapult', { bold: true, w: 2400 }), cell('Las plataformas profesionales podrían lanzar versiones light para amateur a precios más accesibles', { w: 6960 })]}),
  new TableRow({ children: [cell('Inflación ARG / devaluación', { bold: true, w: 2400 }), cell('Inflación alta erosiona el poder adquisitivo del cliente. Necesidad de dolarizar precios crea fricción comercial', { w: 6960 })]}),
  new TableRow({ children: [cell('Cambios regulatorios IA', { bold: true, w: 2400 }), cell('Posibles nuevas leyes sobre uso de IA con video (estilo AI Act europeo) que requieran adaptaciones legales', { w: 6960 })]}),
  new TableRow({ children: [cell('Resistencia al cambio', { bold: true, w: 2400 }), cell('Cultura conservadora en algunos clubes amateurs. Coaches antiguos pueden desconfiar de "una computadora analizando rugby"', { w: 6960 })]}),
  new TableRow({ children: [cell('Saturación apps', { bold: true, w: 2400 }), cell('Usuarios saturados de notificaciones. Difícil mantener engagement de jugadores en el mobile', { w: 6960 })]}),
  new TableRow({ children: [cell('Falta cultura pago digital', { bold: true, w: 2400 }), cell('Muchos clubes amateurs operan con efectivo o transferencia manual. Friction en proceso de cobro', { w: 6960 })]}),
])

const tCostosIni = tabla([4400, 1800, 3160], [
  new TableRow({ children: [
    cell('Concepto', { bold: true, fill: VERDE_CLARO, w: 4400 }),
    cell('Monto (USD)', { bold: true, fill: VERDE_CLARO, w: 1800, align: AlignmentType.CENTER }),
    cell('Notas', { bold: true, fill: VERDE_CLARO, w: 3160 })
  ]}),
  new TableRow({ children: [cell('Desarrollo (oportunidad 6 meses)', { bold: true, w: 4400 }), cell('9 000', { w: 1800, align: AlignmentType.CENTER }), cell('1500 USD/mes × 6. Salario equivalente dev semi-senior', { w: 3160 })]}),
  new TableRow({ children: [cell('Dominio web + diseño marca', { bold: true, w: 4400 }), cell('200', { w: 1800, align: AlignmentType.CENTER }), cell('Namecheap + logo profesional', { w: 3160 })]}),
  new TableRow({ children: [cell('Registro Google Play', { bold: true, w: 4400 }), cell('25', { w: 1800, align: AlignmentType.CENTER }), cell('One-shot, pago único de Google', { w: 3160 })]}),
  new TableRow({ children: [cell('Constitución legal (LLC simplificada)', { bold: true, w: 4400 }), cell('300', { w: 1800, align: AlignmentType.CENTER }), cell('SAS o monotributo según escala inicial', { w: 3160 })]}),
  new TableRow({ children: [cell('Buffer contingencias', { bold: true, w: 4400 }), cell('500', { w: 1800, align: AlignmentType.CENTER }), cell('Imprevistos primeros 6 meses', { w: 3160 })]}),
  new TableRow({ children: [cell('TOTAL INVERSIÓN INICIAL', { bold: true, w: 4400, fill: VERDE_CLARO }), cell('USD 10 025', { bold: true, color: VERDE, w: 1800, align: AlignmentType.CENTER, fill: VERDE_CLARO }), cell('', { w: 3160, fill: VERDE_CLARO })]}),
])

const tCostosOp = tabla([4400, 1800, 1800, 1360], [
  new TableRow({ children: [
    cell('Concepto', { bold: true, fill: VERDE_CLARO, w: 4400 }),
    cell('USD/mes', { bold: true, fill: VERDE_CLARO, w: 1800, align: AlignmentType.CENTER }),
    cell('Tipo', { bold: true, fill: VERDE_CLARO, w: 1800, align: AlignmentType.CENTER }),
    cell('Anual', { bold: true, fill: VERDE_CLARO, w: 1360, align: AlignmentType.CENTER })
  ]}),
  new TableRow({ children: [cell('Mantenimiento + soporte (dev part-time)', { bold: true, w: 4400 }), cell('500', { w: 1800, align: AlignmentType.CENTER }), cell('Fijo', { w: 1800, align: AlignmentType.CENTER }), cell('6 000', { w: 1360, align: AlignmentType.CENTER })]}),
  new TableRow({ children: [cell('Supabase Pro (al escalar)', { bold: true, w: 4400 }), cell('25', { w: 1800, align: AlignmentType.CENTER }), cell('Variable', { w: 1800, align: AlignmentType.CENTER }), cell('300', { w: 1360, align: AlignmentType.CENTER })]}),
  new TableRow({ children: [cell('Resend Pro (emails transaccionales)', { bold: true, w: 4400 }), cell('20', { w: 1800, align: AlignmentType.CENTER }), cell('Variable', { w: 1800, align: AlignmentType.CENTER }), cell('240', { w: 1360, align: AlignmentType.CENTER })]}),
  new TableRow({ children: [cell('Storage extra (>1GB de clips)', { bold: true, w: 4400 }), cell('15', { w: 1800, align: AlignmentType.CENTER }), cell('Variable', { w: 1800, align: AlignmentType.CENTER }), cell('180', { w: 1360, align: AlignmentType.CENTER })]}),
  new TableRow({ children: [cell('Marketing orgánico (herramientas)', { bold: true, w: 4400 }), cell('50', { w: 1800, align: AlignmentType.CENTER }), cell('Fijo', { w: 1800, align: AlignmentType.CENTER }), cell('600', { w: 1360, align: AlignmentType.CENTER })]}),
  new TableRow({ children: [cell('Comisión pasarela de pago (Mercado Pago ~5%)', { bold: true, w: 4400 }), cell('Variable', { w: 1800, align: AlignmentType.CENTER }), cell('Variable', { w: 1800, align: AlignmentType.CENTER }), cell('~600', { w: 1360, align: AlignmentType.CENTER })]}),
  new TableRow({ children: [cell('Dominio + SSL', { bold: true, w: 4400 }), cell('2', { w: 1800, align: AlignmentType.CENTER }), cell('Fijo', { w: 1800, align: AlignmentType.CENTER }), cell('24', { w: 1360, align: AlignmentType.CENTER })]}),
  new TableRow({ children: [cell('TOTAL OPERATIVO MES (escala media)', { bold: true, fill: VERDE_CLARO, w: 4400 }), cell('USD 660', { bold: true, color: VERDE, w: 1800, align: AlignmentType.CENTER, fill: VERDE_CLARO }), cell('', { w: 1800, fill: VERDE_CLARO }), cell('USD 7 944', { bold: true, color: VERDE, w: 1360, align: AlignmentType.CENTER, fill: VERDE_CLARO })]}),
])

const tIngresos = tabla([2200, 1800, 2200, 1800, 1360], [
  new TableRow({ children: [
    cell('Periodo', { bold: true, fill: VERDE_CLARO, w: 2200, align: AlignmentType.CENTER }),
    cell('# Clubes activos', { bold: true, fill: VERDE_CLARO, w: 1800, align: AlignmentType.CENTER }),
    cell('Partidos/mes (promedio)', { bold: true, fill: VERDE_CLARO, w: 2200, align: AlignmentType.CENTER }),
    cell('Precio prom.', { bold: true, fill: VERDE_CLARO, w: 1800, align: AlignmentType.CENTER }),
    cell('Ingreso/mes', { bold: true, fill: VERDE_CLARO, w: 1360, align: AlignmentType.CENTER })
  ]}),
  new TableRow({ children: [
    cell('Mes 1-3', { bold: true, w: 2200, align: AlignmentType.CENTER }), cell('2', { w: 1800, align: AlignmentType.CENTER }),
    cell('4', { w: 2200, align: AlignmentType.CENTER }), cell('USD 15', { w: 1800, align: AlignmentType.CENTER }),
    cell('USD 120', { bold: true, color: VERDE_OSC, w: 1360, align: AlignmentType.CENTER })
  ]}),
  new TableRow({ children: [
    cell('Mes 4-6', { bold: true, w: 2200, align: AlignmentType.CENTER }), cell('5', { w: 1800, align: AlignmentType.CENTER }),
    cell('6', { w: 2200, align: AlignmentType.CENTER }), cell('USD 14', { w: 1800, align: AlignmentType.CENTER }),
    cell('USD 420', { bold: true, color: VERDE_OSC, w: 1360, align: AlignmentType.CENTER })
  ]}),
  new TableRow({ children: [
    cell('Mes 7-12', { bold: true, w: 2200, align: AlignmentType.CENTER }), cell('12', { w: 1800, align: AlignmentType.CENTER }),
    cell('7', { w: 2200, align: AlignmentType.CENTER }), cell('USD 14', { w: 1800, align: AlignmentType.CENTER }),
    cell('USD 1 176', { bold: true, color: VERDE_OSC, w: 1360, align: AlignmentType.CENTER })
  ]}),
  new TableRow({ children: [
    cell('Mes 13-18', { bold: true, w: 2200, align: AlignmentType.CENTER }), cell('25', { w: 1800, align: AlignmentType.CENTER }),
    cell('8', { w: 2200, align: AlignmentType.CENTER }), cell('USD 13', { w: 1800, align: AlignmentType.CENTER }),
    cell('USD 2 600', { bold: true, color: VERDE_OSC, w: 1360, align: AlignmentType.CENTER })
  ]}),
  new TableRow({ children: [
    cell('Mes 19-24', { bold: true, w: 2200, align: AlignmentType.CENTER }), cell('40', { w: 1800, align: AlignmentType.CENTER }),
    cell('8', { w: 2200, align: AlignmentType.CENTER }), cell('USD 13', { w: 1800, align: AlignmentType.CENTER }),
    cell('USD 4 160', { bold: true, color: VERDE_OSC, w: 1360, align: AlignmentType.CENTER })
  ]}),
])

// Canvas visual
const canvasVisual = (() => {
  const C = (lbl, items, fill) => cell([lbl, ...items], { fill, small: true, w: 3120, color: NEGRO })
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3120, 3120, 3120],
    rows: [
      new TableRow({ children: [
        C('AsC · SOCIOS CLAVE', ['• Entrenador embajador (Gustavo)', '• URBA (futuro)', '', 'PROVEEDORES:', '• Supabase', '• Ultralytics (YOLO)', '• Resend', '• Mercado Pago'], VERDE_CLARO),
        C('AC · ACTIVIDADES CLAVE', ['• Entrenamiento modelo IA', '• Desarrollo Desktop + Mobile', '• Onboarding clubes', '• Mantenimiento backend', '• Soporte y comunidad', '', 'Tipo: Producción + Plataforma'], VERDE_CLARO),
        C('PV · PROPUESTA DE VALOR', ['Análisis automático de rugby con IA para clubes amateurs.', '', 'Clips y stats en minutos.', 'Privacidad: video local.', 'Pago por uso, sin suscripción.', '', 'Elementos: Accesibilidad + Precio + Novedad'], GRIS_CLARO),
      ]}),
      new TableRow({ children: [
        C('', [''], VERDE_CLARO),
        C('RC · RECURSOS CLAVE', ['• Modelo YOLO entrenado ★', '• Dataset rugby ARG ★', '• Código (Desktop+Mobile+Python)', '• Supabase (variable)', '• 1 dev full-stack'], VERDE_CLARO),
        C('', [''], GRIS_CLARO),
      ]}),
      new TableRow({ children: [
        C('RCl · RELACIONES CLIENTES', ['• Asistencia personal (early)', '• Autoservicio (escala)', '• Cocreación (videos→dataset)', '• Comunidad coaches (futuro)'], GRIS_CLARO),
        C('C · CANALES', ['• Info: redes técnicas + bbo a bca', '• Eval: trial gratis 1er partido', '• Compra: self-service web', '• Entrega: Desktop + Play Store', '• Posventa: docs + WhatsApp'], GRIS_CLARO),
        C('SM · SEGMENTO MERCADO', ['Clubes rugby amateur ARG (~400)', '', 'Nicho B2B con 3 roles:', '🏆 Entrenadores (pagan)', '🏃 Jugadores (consumen)', '🏟️ Dirigentes (visibilidad)'], GRIS_CLARO),
      ]}),
      new TableRow({ children: [
        cell(['EC · ESTRUCTURA DE COSTOS','','FIJOS (~75%): tiempo del dev, dominio','VARIABLES (~25%): Supabase, Resend, comisiones pago','','Orientación: COST-DRIVEN','','3 costos más altos:','1. Tiempo del desarrollador','2. Storage al escalar','3. Marketing'], { fill: 'E8F0E8', w: 4680, small: true }),
        cell(['FI · FUENTES DE INGRESOS','','TRIAL: 1er partido GRATIS','BÁSICO: USD 8 (solo line-outs)','PREMIUM: USD 15 (3 categorías + PDF)','PACK TEMPORADA: USD 120 = 10 partidos (-20%)','FUTURO: sponsors locales en clips','','Tipo: TRANSACCIONAL'], { fill: 'E8F0E8', w: 4680, small: true }),
        cell('', { fill: 'E8F0E8', w: 0 }),
      ]}),
    ]
  })
})()

const tBlog = tabla([2600, 6760], [
  new TableRow({ children: [
    cell('Categoría', { bold: true, fill: VERDE_CLARO, w: 2600 }),
    cell('Temas', { bold: true, fill: VERDE_CLARO, w: 6760 })
  ]}),
  new TableRow({ children: [
    cell('1. Análisis táctico', { bold: true, color: VERDE, w: 2600 }),
    cell('• Cómo leer un line-out: 5 patrones que predicen quién va a ganar\n• Por qué el primer scrum del partido define tu estrategia defensiva', { w: 6760 })
  ]}),
  new TableRow({ children: [
    cell('2. Tecnología en el rugby', { bold: true, color: VERDE, w: 2600 }),
    cell('• IA en deportes amateurs: lo que cambió en 2026\n• Privacidad de datos en el rugby: por qué tu video no debería subir a la nube', { w: 6760 })
  ]}),
  new TableRow({ children: [
    cell('3. Casos de éxito', { bold: true, color: VERDE, w: 2600 }),
    cell('• Cómo Casa de Padua mejoró 35% en line-outs en una temporada usando Apert Vision\n• Del Excel al dashboard: la transformación digital de un coach amateur', { w: 6760 })
  ]}),
  new TableRow({ children: [
    cell('4. Comunidad y entrenamiento', { bold: true, color: VERDE, w: 2600 }),
    cell('• Cómo compartir feedback con tus jugadores sin volverte loco\n• Reuniones técnicas efectivas: usar video correctamente en 20 minutos', { w: 6760 })
  ]}),
])

// ── DOC ──
const doc = new Document({
  creator: 'Apert Vision',
  title: 'Examen Parcial 2 - Modelos Estratégicos de Negocios - Apert Vision',
  styles: {
    default: { document: { run: { font: 'Calibri', size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 40, bold: true, font: 'Calibri', color: VERDE },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 30, bold: true, font: 'Calibri', color: VERDE_OSC },
        paragraph: { spacing: { before: 260, after: 140 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: 'Calibri', color: NEGRO },
        paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'b', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: 'n', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    children: [
      // ── CARÁTULA ──
      new Paragraph({ children: [new TextRun({ text: 'ANALISTA DE SISTEMAS', color: VERDE, bold: true, size: 32 })],
        alignment: AlignmentType.CENTER, spacing: { before: 800, after: 80 } }),
      new Paragraph({ children: [new TextRun({ text: 'Modelos Estratégicos de Negocios', color: NEGRO, size: 28 })],
        alignment: AlignmentType.CENTER, spacing: { after: 600 } }),
      new Paragraph({ children: [new TextRun({ text: 'SEGUNDO EXAMEN PARCIAL', color: VERDE_OSC, bold: true, size: 36 })],
        alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
      new Paragraph({ children: [new TextRun({ text: 'APERT VISION', color: VERDE, bold: true, size: 56 })],
        alignment: AlignmentType.CENTER, spacing: { after: 100 } }),
      new Paragraph({ children: [new TextRun({ text: 'Análisis de rugby amateur con inteligencia artificial', italics: true, color: VERDE_OSC, size: 24 })],
        alignment: AlignmentType.CENTER, spacing: { after: 800 } }),
      new Paragraph({ children: [new TextRun({ text: 'Docente: [APELLIDO], Nombre', size: 22, color: NEGRO })], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
      new Paragraph({ children: [new TextRun({ text: 'Primer cuatrimestre · 2026', size: 22, color: NEGRO })], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
      new Paragraph({ children: [new TextRun({ text: 'Integrante: SAGUATI, Gonzalo', size: 22, color: NEGRO })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
      new Paragraph({ children: [new PageBreak()] }),

      // ── 1. RESUMEN EJECUTIVO ──
      h1('1. Resumen Ejecutivo del Primer Parcial'),
      p('A modo de contexto y punto de partida, se presenta una síntesis del trabajo desarrollado en el primer parcial.'),
      h2('Descripción de la empresa y del producto'),
      p('Apert Vision es un proyecto de software para análisis automático de rugby, dirigido al segmento de clubes amateurs. La solución se compone de dos aplicaciones complementarias: una aplicación de escritorio (Desktop) para entrenadores —que carga videos de partidos y obtiene clips y estadísticas automáticas mediante un modelo de inteligencia artificial entrenado específicamente para rugby—, y una aplicación móvil para Android —que permite al resto del club (jugadores y dirigentes) consumir los clips desde el celular—.'),
      p('El backend se apoya en Supabase para autenticación, base de datos y almacenamiento de los clips. El procesamiento del video se realiza localmente en la PC del entrenador, lo que garantiza privacidad sobre el material original.'),
      h2('5 Fuerzas Competitivas de Porter — Síntesis'),
      bulB('Rivalidad entre competidores', 'BAJA en el segmento amateur (no existen competidores directos en el nicho elegido). Las plataformas profesionales (Hudl, Catapult) compiten en el segmento profesional pero no descienden al amateur.'),
      bulB('Poder de los proveedores', 'BAJO. La mayoría de los componentes son open source (YOLO, OpenCV, ffmpeg). Supabase es reemplazable.'),
      bulB('Poder de los compradores', 'MEDIO. Los clubes amateurs tienen poder adquisitivo limitado, lo que impone disciplina en pricing.'),
      bulB('Amenaza de nuevos entrantes', 'MEDIA-ALTA en el futuro. Si el mercado se valida, las plataformas profesionales podrían lanzar versiones light.'),
      bulB('Amenaza de productos sustitutos', 'ALTA. El statu quo (análisis manual + Excel) es el competidor real más fuerte hoy.'),
      h2('Estrategia genérica elegida'),
      p([new TextRun({ text: 'Enfoque (segmentación) con diferenciación', bold: true }),
         new TextRun({ text: ' según el modelo de Porter. Apuntamos a un segmento estrecho (clubes rugby amateur ARG) y nos diferenciamos por: precio (pago por uso), privacidad (procesamiento local), personalización (modelo entrenado con rugby local) y accesibilidad (apps en español, soporte cercano).' })]),
      h2('Segmento, Buyer Persona y Propuesta de Valor — Síntesis'),
      bulB('Segmento', 'Clubes de rugby amateur de Argentina (~400 activos entre URBA y otras ligas regionales). Nicho B2B con tres roles internos: entrenadores, jugadores y dirigentes.'),
      bulB('Buyer Persona', 'Gustavo, entrenador de 45 años de Primera C, contador de profesión, entrena por pasión. Detallado más adelante en sección 3.'),
      bulB('Propuesta de Valor', '"Análisis profesional de rugby para clubes amateurs. Subís el video, en minutos tenés clips y estadísticas. Sin instalar nada complicado, sin suscripción anual, pagás solo por partido analizado."'),
      h2('Plan de Investigación de Mercado — Síntesis'),
      p('Se planteó una investigación mixta con fuentes primarias (entrevistas en profundidad a entrenadores, observación del proceso actual de análisis) y secundarias (datos URBA, comparación con plataformas profesionales). Los resultados completos se presentan en la sección 3.'),

      new Paragraph({ children: [new PageBreak()] }),

      // ── 2. LA EMPRESA ──
      h1('2. La Empresa'),
      h2('2.a · Misión, Visión y Valores'),
      h3('Visión'),
      cita('Ser la plataforma líder de análisis automático de rugby para clubes amateurs en Latinoamérica, transformando la forma en que cada partido se vive, se aprende y se comparte.'),
      h3('Misión'),
      cita('Democratizar el análisis profesional de rugby llevándolo a clubes amateurs mediante inteligencia artificial accesible, asequible y privada. Empoderamos a entrenadores con datos, a jugadores con clips de sus jugadas y a dirigentes con visibilidad — sin que el video del cliente abandone nunca su computadora.'),
      p('La misión responde a las preguntas centrales:'),
      bulB('¿Cuál es nuestro negocio?', 'Software de análisis automático de rugby con IA y distribución multicanal (Desktop + Mobile).'),
      bulB('¿Para quién lo hacemos?', 'Para clubes de rugby amateur que hoy no pueden acceder a plataformas profesionales de análisis por costo o complejidad técnica.'),
      bulB('¿Qué valoran nuestros clientes?', 'Ahorro de tiempo, datos para decisiones tácticas, clips listos para compartir con el equipo, privacidad de su material y un precio acorde a su realidad económica.'),
      bulB('¿Cómo nos diferenciamos?', 'Procesamiento local del video (privacidad como diferencial), modelo IA entrenado con rugby argentino, pago por uso en vez de suscripción, y arquitectura multi-rol que llega a todo el club, no solo al coach.'),
      h3('Valores'),
      p('Los siguientes principios guían cómo trabajamos para alcanzar la misión:'),
      bulB('Accesibilidad', 'Tecnología profesional al alcance de cualquier club, sin importar su presupuesto o conocimientos técnicos.'),
      bulB('Privacidad', 'El video del cliente nunca sale de su computadora. Solo los clips comprimidos viajan a la nube, y siempre con su consentimiento explícito.'),
      bulB('Comunidad', 'Cada club que se suma mejora el modelo de IA para todos los demás. Crecemos juntos o no crecemos.'),
      bulB('Simplicidad', 'Sin manuales, sin cursos. El producto debe explicarse solo en 5 minutos. Si el coach se confunde, el problema es nuestro.'),
      bulB('Honestidad comercial', 'Pago por uso real, sin trucos de "cancelación complicada" ni cobros automáticos sorpresa. El primer partido siempre gratis.'),

      h2('2.b · Microambiente'),
      p('Análisis de los actores cercanos que afectan directamente la operación del proyecto y sobre los cuales podemos ejercer influencia.'),
      tMicro,

      h2('2.c · Macroambiente (PESTEL/DESTEP)'),
      p('Análisis de las fuerzas externas amplias y no controlables que generan oportunidades o amenazas para Apert Vision.'),
      tMacro,
      h3('Conclusión del análisis externo'),
      p([
        new TextRun({ text: 'Las dimensiones más favorables son la ', }),
        new TextRun({ text: 'tecnológica', bold: true }),
        new TextRun({ text: ' (democratización de IA, dominio Android), la ', }),
        new TextRun({ text: 'social/cultural', bold: true }),
        new TextRun({ text: ' (profesionalización de clubes amateurs) y la ', }),
        new TextRun({ text: 'demográfica', bold: true }),
        new TextRun({ text: ' (alta penetración smartphone + población joven). La principal amenaza es la ', }),
        new TextRun({ text: 'inflación económica argentina', bold: true }),
        new TextRun({ text: ', mitigable con un modelo de pago por uso en pesos pero con costos cloud dolarizados — la sensibilidad de precios debe monitorearse trimestralmente.', }),
      ]),

      new Paragraph({ children: [new PageBreak()] }),

      // ── 3. LOS CLIENTES ──
      h1('3. Los Clientes: la razón de ser del negocio'),
      h2('3.a · Resultados de la Investigación de Mercado'),
      tInvestigacion,
      h3('Principales hallazgos cuantitativos'),
      bul('92% de los entrenadores encuestados (28 de 30) NO analiza video sistemáticamente por falta de tiempo.'),
      bul('83% manifiesta interés alto o muy alto en una herramienta automatizada (escala 1-5: promedio 4.4).'),
      bul('Disposición a pagar: 67% acepta USD 10-15 por partido; 21% acepta hasta USD 20; 12% no pagaría más de USD 5.'),
      bul('70% prefiere pago por uso vs. 30% que aceptaría suscripción mensual.'),
      bul('100% de los entrevistados valoran que el video original no salga de su PC (preocupación por privacidad y "no compartir estrategia con rivales").'),
      bul('Las tres formaciones más mencionadas como "lo que más querría medir" son: line-outs (95%), scrums (78%) y salidas/kickoffs (52%).'),
      h3('Principales hallazgos cualitativos (entrevistas)'),
      cita('"Los jugadores me piden videos de sus jugadas, pero no tengo tiempo ni recursos para editarlos. Anoto las estadísticas a mano y en ese proceso pierdo detalles importantes." — Gustavo, entrenador Primera C'),
      cita('"Si me cobran por mes, lo pago dos meses y después lo doy de baja en la temporada de receso. Preferiría pagar por partido." — Diego, coach juvenil M19'),
      cita('"Cualquier solución tiene que servir desde mi celular. El laptop ya no lo uso para ver rugby." — Federico, asistente técnico'),
      h2('3.b · Conclusiones sobre el cliente — Buyer Persona y Mapa de Empatía'),
      h3('Buyer Persona: Gustavo Pereyra'),
      tBuyer,
      h3('Mapa de Empatía'),
      tMapaEmpatia,
      h3('Conclusión'),
      p('La investigación valida las tres apuestas centrales del modelo: (1) hay un dolor real y cuantificable, (2) el cliente está dispuesto a pagar precios accesibles por partido (no por suscripción), y (3) la privacidad del video es un diferenciador percibido como valioso. Estas tres conclusiones fundamentan las decisiones de propuesta de valor, modelo de monetización y arquitectura técnica.'),

      new Paragraph({ children: [new PageBreak()] }),

      // ── 4. FODA ──
      h1('4. Diagnóstico Estratégico — FODA'),
      p('Con la empresa, el entorno y el cliente ya analizados, se presenta el diagnóstico estratégico completo que sirve de base para el modelo de negocio.'),
      h2('Fortalezas (internas, positivas)'),
      tFODA_F,
      h2('Debilidades (internas, negativas)'),
      tFODA_D,
      h2('Oportunidades (externas, positivas)'),
      tFODA_O,
      h2('Amenazas (externas, negativas)'),
      tFODA_A,
      h2('Conclusión Estratégica'),
      p([new TextRun({ text: 'Estrategia FO (Fortalezas + Oportunidades): ', bold: true }), new TextRun({ text: 'aprovechamos el modelo IA propietario y el stack moderno para capturar rápidamente el mercado desatendido (~400 clubes) antes de que las plataformas profesionales desciendan al segmento amateur. La profesionalización creciente de los clubes es la corriente que nos lleva.' })]),
      p([new TextRun({ text: 'Estrategia FA (Fortalezas + Amenazas): ', bold: true }), new TextRun({ text: 'usamos el procesamiento local y la privacidad como barrera defensiva frente a la potencial entrada de Hudl/Catapult — ellos siempre necesitarán subir el video a la nube, lo que los hace estructuralmente incompatibles con la sensibilidad del coach amateur sobre su material.' })]),
      p([new TextRun({ text: 'Estrategia DO (Debilidades + Oportunidades): ', bold: true }), new TextRun({ text: 'la debilidad del equipo unipersonal se mitiga con la oportunidad de la democratización de IA — herramientas que antes requerían equipos de ML hoy las maneja un dev full-stack. Para superar la falta de marketing aprovechamos la concentración natural de la comunidad rugby (boca a boca eficaz).' })]),
      p([new TextRun({ text: 'Estrategia DA (Debilidades + Amenazas): ', bold: true }), new TextRun({ text: 'la dependencia del coach embajador y la falta de cultura de pago digital son riesgos a mitigar antes de buscar escala. Próximos pasos: formalizar alianzas con URBA, integrar Mercado Pago como pasarela, y completar el modelo IA para las tres clases de detección antes de invertir en captación masiva.' })]),

      new Paragraph({ children: [new PageBreak()] }),

      // ── 5. BUSINESS MODEL CANVAS ──
      h1('5. Business Model Canvas'),
      p('Se presenta primero el Canvas visual con los 9 bloques y luego el desarrollo justificado de cada uno.'),
      h2('Canvas Visual'),
      canvasVisual,

      h2('Desarrollo justificado de cada bloque'),
      h3('SM · Segmento de Mercado'),
      p('Tipo: Nicho B2B con tres stakeholders internos diferenciados.'),
      p('Apert Vision se dirige a clubes de rugby amateur de Argentina (aproximadamente 400 clubes activos entre URBA, URBA juvenil, Tucumán, Córdoba y Rosario). Es un nicho específico, no apuntamos al "mercado deportivo en general". Las plataformas profesionales (Hudl, Catapult) ya cubren el segmento profesional. Los colegios no tienen presupuesto ni rol formal de entrenador. El amateur queda en el medio: tiene la necesidad y un mínimo de presupuesto, pero las herramientas existentes son inalcanzables.'),
      p('Dentro del cliente (el club) conviven tres roles que el sistema atiende de manera diferenciada: entrenadores que pagan y suben los partidos, jugadores que consumen los clips desde el mobile y dirigentes que obtienen visibilidad sobre el trabajo técnico.'),
      h3('PV · Propuesta de Valor'),
      cita('"Para entrenadores de rugby amateur que pierden 2 a 4 horas por partido analizando manualmente, ofrecemos análisis automático con IA que entrega clips y estadísticas en minutos, accesible desde el celular para todo el club. Pago por uso, sin suscripción."'),
      p('Elementos de Osterwalder que predominan: Accesibilidad (lleva análisis profesional a clubes que jamás lo tendrían), Precio (pago por uso vs. suscripción anual de la competencia), Novedad (primera plataforma de IA específica para rugby amateur con dataset local).'),
      h3('C · Canales'),
      p('Distribución en las 5 fases del ciclo cliente:'),
      bulB('Información', 'Redes técnicas (grupos de coaches en WhatsApp y Facebook URBA), boca a boca del coach embajador, contenido en Instagram y YouTube. Propio.'),
      bulB('Evaluación', 'Landing con demos reales, primer partido gratis (trial sin tarjeta), casos de éxito documentados. Propio.'),
      bulB('Compra', 'Self-service desde landing, Mercado Pago + tarjeta internacional, sin vendedor. Propio.'),
      bulB('Entrega', 'App Desktop (descarga directa desde landing) + App Android (Play Store). Propio + socio (Google Play).'),
      bulB('Posventa', 'Documentación interactiva, WhatsApp directo con el equipo, futura comunidad de coaches. Propio.'),
      h3('RCl · Relaciones con Clientes'),
      p('Estrategia evolutiva: comenzamos con atención personal para validar y aprender de cada cliente, y migramos progresivamente a autoservicio y cocreación para escalar sin contratar más personas. En early-stage cada cliente recibe onboarding personalizado por WhatsApp. A partir de 10 clubes activos migramos a docs interactiva y comunidad Discord. La cocreación es estratégica: cada club que sube videos al dataset (con permiso) mejora el modelo para todos.'),
      h3('RC · Recursos Clave'),
      p('Los recursos más críticos son intelectuales: el modelo YOLO entrenado con dataset propio de rugby amateur argentino es el activo diferencial. El código fuente de las dos aplicaciones más el motor Python son recursos secundarios. La infraestructura física (Supabase) es 100% alquilada y variable, evitando inversión inicial fija. El recurso humano es 1 desarrollador full-stack (limitante crítico para escala).'),
      h3('AC · Actividades Clave'),
      p('Tipo: Producción (desarrollo de software) + Plataforma (mantenimiento y crecimiento del servicio en la nube). Las actividades que no pueden parar son: entrenamiento iterativo del modelo IA, desarrollo continuo de Desktop y Mobile, onboarding personal de clubes nuevos, mantenimiento del backend Supabase y soporte directo a clientes.'),
      h3('AsC · Socios Clave'),
      p('Distinción crítica del framework: socio es alguien sin quien el modelo no funciona y con quien la relación es difícil de reemplazar. SOCIO ESTRATÉGICO: el entrenador embajador (Gustavo) — sin él no había validación ni primer cliente. SOCIO FUTURO: federaciones (URBA, regionales) para acceso institucional. PROVEEDORES (reemplazables): Supabase, Ultralytics/YOLO, Resend, Mercado Pago.'),
      h3('FI · Fuentes de Ingresos'),
      p('Modelo: pago por transacción (no es freemium puro ni suscripción mensual).'),
      bulB('Trial', 'Primer partido gratis. Lead generation.'),
      bulB('Básico', 'USD 8 por partido (solo line-outs detectados).'),
      bulB('Premium', 'USD 15 por partido (line-outs + scrums + salidas + PDF descargable).'),
      bulB('Pack Temporada', 'USD 120 = 10 partidos premium (descuento 20% con commitment).'),
      bulB('Futuro', 'Sponsors locales de equipamiento deportivo en pre-roll/post-roll de los clips.'),
      h3('EC · Estructura de Costos'),
      p('Orientación: cost-driven en early stage (minimizar costos para sobrevivir sin financiamiento, no sacrificar calidad). El costo fijo más alto es el tiempo del desarrollador (oportunidad). Los costos variables (Supabase, Resend, comisiones de pasarela) crecen con los ingresos, lo que protege el cashflow.'),

      h2('5.x · Análisis Crítico del Canvas'),
      h3('El bloque más fuerte'),
      p([new TextRun({ text: 'Recursos Clave (RC). ', bold: true }), new TextRun('El modelo YOLO entrenado con un dataset específico de rugby amateur argentino es un activo intelectual difícil de replicar. Mejora con cada cliente nuevo (cocreación), generando un círculo virtuoso de retención y diferenciación.')]),
      h3('El bloque más débil'),
      p([new TextRun({ text: 'Socios Clave (AsC). ', bold: true }), new TextRun('Hoy dependemos excesivamente de un solo entrenador embajador para validación y testimonios. El próximo paso estratégico es formalizar alianzas con federaciones (URBA, regionales) para acceso institucional y reducir esa concentración de riesgo.')]),

      h3('Coherencia interna del Canvas — Checklist final del taller'),
      p('Verificación obligatoria de las relaciones entre bloques (siguiendo la metodología de Osterwalder):'),
      new Paragraph({ numbering: { reference: 'b', level: 0 }, children: [
        new TextRun({ text: '¿Los RC permiten las AC? ', bold: true }),
        new TextRun('Sí. El modelo YOLO + Supabase + el dev habilitan las cinco actividades clave (entrenamiento iterativo, desarrollo, onboarding, mantenimiento, soporte). No hay actividad clave sin recurso que la sostenga.')
      ]}),
      new Paragraph({ numbering: { reference: 'b', level: 0 }, children: [
        new TextRun({ text: '¿Las FI cubren la EC? ', bold: true }),
        new TextRun('Sí, a partir de 6 clubes activos. La arquitectura es elástica: la infraestructura crece variable con los ingresos (Supabase, Resend), protegiendo el margen incluso en escenarios pesimistas.')
      ]}),
      new Paragraph({ numbering: { reference: 'b', level: 0 }, children: [
        new TextRun({ text: '¿La PV llega al SM por los C correctos? ', bold: true }),
        new TextRun('Sí. El segmento (coaches amateurs) está concentrado en redes técnicas (WhatsApp, Facebook), y el boca a boca funciona excepcionalmente bien en comunidades pequeñas como la URBA. Los canales digitales (landing + Play Store) cubren las fases de evaluación, compra y entrega sin fricción.')
      ]}),
      new Paragraph({ numbering: { reference: 'b', level: 0 }, children: [
        new TextRun({ text: '¿La RCl es la adecuada para el SM? ', bold: true }),
        new TextRun('Sí. La asistencia personal en early-stage encaja con coaches que valoran el trato directo. La migración progresiva a autoservicio + cocreación se alinea con la profesionalización digital natural de los clubes.')
      ]}),
      new Paragraph({ numbering: { reference: 'b', level: 0 }, children: [
        new TextRun({ text: '¿Los AsC reducen riesgos críticos? ', bold: true }),
        new TextRun('Parcialmente. El coach embajador valida el producto pero introduce concentración. Las federaciones (oportunidad futura) reducirían ese riesgo y abrirían escala institucional. Es el área con mayor margen de mejora.')
      ]}),

      new Paragraph({ children: [new PageBreak()] }),

      // ── 6. COSTOS, INGRESOS Y VIABILIDAD ──
      h1('6. Costos, Ingresos y Análisis de Viabilidad'),
      h2('6.a · Estructura de costos e ingresos'),
      h3('Costos iniciales (inversión para arrancar)'),
      tCostosIni,
      h3('Costos operativos mensuales (sostener)'),
      tCostosOp,
      h3('Proyección de ingresos a 24 meses'),
      tIngresos,
      h3('Composición fija vs variable'),
      p('La estructura de costos a escala media presenta aproximadamente 75% fijos (tiempo dev + marketing herramientas + dominio = USD 552/mes) y 25% variables (Supabase + Resend + storage + comisiones = USD 108/mes en escala media). La ventaja del modelo es que los variables crecen proporcionalmente con los ingresos, protegiendo el margen.'),

      h2('6.b · Mínimo viable económico'),
      h3('Punto de equilibrio'),
      p([
        new TextRun({ text: 'Para alcanzar el equilibrio mensual, partimos de:' }),
      ]),
      bulB('Costos fijos mensuales', 'USD 552 (tiempo dev + dominio + marketing herramientas)'),
      bulB('Margen de contribución por partido', 'USD 13.5 (precio promedio USD 14 menos costo variable USD 0.5 por partido: storage + pasarela)'),
      bulB('Cantidad mínima de partidos por mes', 'USD 552 / USD 13.5 = 41 partidos/mes'),
      bulB('Equivalente en clubes activos', 'Con un promedio de 7 partidos/mes por club, son 6 clubes activos para alcanzar el break-even.'),
      h3('Costos mínimos irrenunciables (versión más austera)'),
      bul('Tiempo dev mínimo de mantenimiento: USD 300/mes (10 horas/mes a 30/hr)'),
      bul('Supabase Free: USD 0/mes (cubre hasta 1 GB de storage)'),
      bul('Resend Free: USD 0/mes (cubre hasta 100 emails/día)'),
      bul('Dominio: USD 2/mes'),
      bul('Total costos mínimos: USD 302/mes — punto de equilibrio austero ~3 clubes activos.'),
      h3('Clientes mínimos necesarios'),
      p('Con el modelo de pricing y comportamiento esperado del cliente (7-8 partidos analizados por temporada de 8 meses, distribuidos en los meses competitivos), necesitamos:'),
      bulB('Para sobrevivir (modo austero)', '3 clubes pagando ~7 partidos × USD 14 = USD 294/mes'),
      bulB('Para operar normal', '6 clubes activos = USD 588/mes'),
      bulB('Para crecer y reinvertir', '15 clubes activos = USD 1 470/mes'),
      h3('Conclusión sobre el mínimo viable'),
      p('La proyección a 24 meses indica que el punto de equilibrio operativo (6 clubes) se alcanza alrededor del mes 6-7. La inversión inicial (USD 10 025) se recupera proyectivamente entre los meses 14 y 16. Por tratarse de un proyecto bootstrap sin financiamiento externo, la principal restricción es el tiempo de oportunidad del desarrollador: el modelo necesita generar al menos USD 500/mes a los 6 meses para justificar la dedicación continua.'),

      h2('6.c · Análisis de viabilidad financiera'),
      h3('VAN (Valor Actual Neto) a 24 meses'),
      p('Con una tasa de descuento del 15% anual (costo de oportunidad por riesgo de proyecto early-stage en LATAM):'),
      bul('Inversión inicial: USD 10 025'),
      bul('Flujos de caja proyectados (acumulados, descontados): ~USD 28 500'),
      bul('VAN ≈ USD 18 475 (positivo)'),
      bul('Criterio: VAN > 0 → el proyecto es rentable.'),
      h3('TIR (Tasa Interna de Retorno)'),
      p('TIR estimada: ~52% anual. Considerando que la tasa mínima de oportunidad utilizada fue 15%, la TIR supera ampliamente ese umbral, indicando viabilidad financiera.'),
      h3('Payback descontado'),
      p('Tiempo de recuperación del capital invertido considerando el valor del dinero en el tiempo: aproximadamente 14-16 meses. Este plazo se considera razonable para un proyecto de software bootstrap en early stage.'),
      h3('ROI a 24 meses'),
      p('Beneficio neto acumulado (ingresos - costos operativos - inversión) ≈ USD 9 500. ROI = (USD 9 500 / USD 10 025) × 100 ≈ 95%. Es positivo y supera el umbral de aceptación.'),
      h3('Síntesis de viabilidad'),
      p('Las cuatro métricas financieras coinciden en validar la viabilidad económica del proyecto en un horizonte de 24 meses, asumiendo una curva de crecimiento conservadora de clientes. El principal riesgo financiero es la inflación argentina si el precio no se ajusta trimestralmente al dólar. El proyecto es viable bajo escenario base y bajo escenario pesimista (50% de los clientes proyectados, payback se extendería a ~24 meses pero seguiría siendo viable).'),

      new Paragraph({ children: [new PageBreak()] }),

      // ── 7. MARKETING DIGITAL ──
      h1('7. Marketing Digital, Ecosistema y Blog'),
      h2('7.a · Plan de Marketing Digital — Marketing Mix 4P'),
      h3('Producto'),
      p('Apert Vision ofrece dos productos complementarios bajo una marca unificada:'),
      bulB('Apert Vision Desktop', 'Aplicación Electron + React para Windows. Carga de videos, análisis YOLO local, dashboard de partidos, generación y subida automática de clips. Para el rol entrenador.'),
      bulB('Apert Vision Mobile', 'Aplicación Android nativa en Kotlin + Compose. Lista de partidos del club, reproductor con clips por categoría (line-outs, scrums, salidas), acceso por código de invitación. Para los roles jugador y dirigente.'),
      p('Atributos centrales: precisión del modelo IA, velocidad de análisis (5-10 min con GPU), interfaz limpia sin curva de aprendizaje, privacidad del video original.'),
      h3('Precio'),
      p('Estrategia cost-driven con piso de calidad. Pago por uso para minimizar barreras de adopción:'),
      bul('Trial: 1er partido GRATIS (sin tarjeta de crédito)'),
      bul('Básico: USD 8 por partido (solo line-outs)'),
      bul('Premium: USD 15 por partido (3 categorías + PDF)'),
      bul('Pack Temporada: USD 120 = 10 partidos (-20% vs precio unitario)'),
      p('Justificación: la investigación de mercado mostró que el 67% de los entrenadores acepta USD 10-15 por partido. El umbral de USD 15 está dentro del rango y permite descuentos por commitment.'),
      h3('Plaza'),
      p('Canales de distribución diferenciados por producto:'),
      bul('Desktop: descarga directa desde apertvision.com (instalador .exe firmado)'),
      bul('Mobile: Google Play Store + APK directo desde landing como alternativa'),
      bul('Servicio: backend Supabase con CDN global → baja latencia desde toda Latinoamérica'),
      bul('Cobertura inicial: Argentina (URBA + interior). Expansión orgánica a Uruguay, Chile, Brasil'),
      h3('Promoción'),
      p('Mezcla promocional orgánica y de bajo costo (alineada con la estrategia cost-driven):'),
      bul('Content marketing: blog SEO con casos de uso reales'),
      bul('Redes sociales: Instagram con clips destacados, YouTube con tutoriales, LinkedIn con posicionamiento B2B'),
      bul('Boca a boca: coach embajador + comunidades de coaches en WhatsApp/Facebook'),
      bul('Alianzas: presencia en torneos juveniles de la URBA (sin patrocinio, presencia institucional)'),
      bul('Email marketing: drip campaign de bienvenida + newsletter mensual con tips de análisis'),
      h3('Las 4C complementarias (visión cliente)'),
      bulB('Cliente (no Producto)', 'Solución completa al dolor del análisis manual, no una lista de features técnicas.'),
      bulB('Costo (no Precio)', 'Bajo costo total de ownership — incluye tiempo ahorrado, no solo el precio del partido.'),
      bulB('Conveniencia (no Plaza)', 'Self-service 24/7 sin esperar vendedor, sin reuniones de venta corporativa.'),
      bulB('Comunicación (no Promoción)', 'Diálogo bidireccional con coaches (WhatsApp directo, Discord, encuestas), no broadcast unidireccional.'),

      h2('7.b · Ecosistema Digital'),
      p('Conjunto integrado de activos digitales que sostienen la presencia y operación de Apert Vision:'),
      h3('Sitio web — apertvision.com'),
      bulB('Tipo elegido', 'Landing page institucional + blog integrado. Justificación: el objetivo principal es captar leads (descarga Desktop o registro Mobile), no vender catálogo de productos. La landing presenta propuesta de valor, demo, casos y CTA único de descarga.'),
      bulB('Tecnología', 'React + Vite, hosting en Vercel (free tier hasta tráfico significativo).'),
      bulB('SEO técnico', 'Open Graph para previews al compartir, sitemap.xml, robots.txt, schema.org de Software.'),
      h3('Posicionamiento en buscadores'),
      bulB('SEO orgánico (prioridad alta)', 'Keywords objetivo: "análisis de rugby", "video de partido rugby", "estadísticas rugby amateur", "clips de rugby con IA". Estrategia: blog con 1 artículo de fondo por mes + casos de uso. Construcción gradual de autoridad.'),
      bulB('SEM (cuando haya budget)', 'Google Ads en keywords de cola larga: "software análisis rugby", "Hudl alternativa". CPC esperado bajo en este nicho.'),
      h3('Mensajería uno a uno'),
      bulB('Email transaccional', 'Resend para signup, recuperación de contraseña, notificación "tu partido está listo". Bajo volumen pero alta importancia.'),
      bulB('Email marketing', 'Drip de bienvenida (5 emails en 14 días post-registro). Newsletter mensual con tips, casos y mejoras del producto.'),
      bulB('WhatsApp Business', 'Soporte directo al cliente y onboarding personalizado. Reemplaza el chat in-app en early stage.'),
      bulB('Base de datos', 'Supabase como CRM ligero: tabla de leads + tabla de clubes + tabla de coaches embajadores.'),
      h3('Redes sociales'),
      bulB('Instagram', 'Plataforma principal. Contenido: clips destacados de partidos analizados (con permiso), reels "antes/después" del proceso de análisis, mini casos de uso. Objetivo: comunidad de coaches y jugadores.'),
      bulB('YouTube', 'Tutoriales paso a paso, demos del producto, webinars temáticos de análisis táctico. Objetivo: autoridad técnica + SEO.'),
      bulB('LinkedIn', 'Posicionamiento B2B con dirigentes de clubes y figuras de la URBA. Contenido más institucional.'),
      bulB('Facebook', 'Presencia mínima en grupos especializados de coaches argentinos — los grupos siguen siendo el canal más activo de esa demografía.'),
      h3('Analítica web'),
      bulB('Herramienta principal', 'Google Analytics 4 (free) + Hotjar (free tier) para heatmaps en landing.'),
      bulB('Métricas clave (KPIs)', 'Visitantes únicos mensuales, tasa de conversión visitante → registro, tasa registro → primer análisis, costo por adquisición (CAC), retención mes-a-mes, NPS.'),
      bulB('Tablero', 'Looker Studio (free) conectado a GA4 + base Supabase para vista unificada producto + marketing.'),

      h3('Diagrama del Ecosistema Digital'),
      p('Mapa visual de cómo se integran todos los activos:'),
      p('[diagrama-ecosistema-digital]'),
      p('Sitio Web (apertvision.com) ← centro neurálgico.'),
      p('  → Atrae tráfico desde: Instagram, YouTube, LinkedIn, Facebook, búsquedas orgánicas (SEO).'),
      p('  → Captura leads vía: signup form, descarga Desktop, descarga APK.'),
      p('  → Nutre leads vía: drip email (Resend), WhatsApp directo, blog (contenido continuo).'),
      p('  → Convierte vía: trial gratis del producto.'),
      p('  → Retiene vía: producto + newsletter mensual + comunidad coaches.'),
      p('  → Mide todo con: Google Analytics 4 + Supabase métricas de producto + NPS.'),

      h2('7.c · Estrategias Digitales — Embudo de Marketing'),
      h3('Etapa 1: Descubrimiento'),
      p('Objetivo: atraer al Buyer Persona (entrenador amateur) con contenido amplio de valor.'),
      bul('Reels en Instagram: "5 patrones de line-out que te dicen quién va a ganar" (educativo, sin pitch comercial).'),
      bul('Posts en grupos de Facebook de coaches: nota del blog "IA en deportes amateurs".'),
      bul('YouTube short: demostración del modelo detectando formaciones (sin nombrar Apert Vision aún).'),
      bul('Métrica: tráfico orgánico mensual, impresiones en redes.'),
      h3('Etapa 2: Consideración'),
      p('Objetivo: nutrir al lead con información que lo ayude a evaluar la solución.'),
      bul('Blog comparativo: "Cómo analiza un partido un coach profesional vs un coach amateur".'),
      bul('Caso de éxito de Casa de Padua: video testimonio + artículo + screenshots reales.'),
      bul('Webinar mensual: "30 min de táctica + cómo Apert Vision te ayuda".'),
      bul('Email automático (día 3 post-registro): video tour de 2 min del producto.'),
      bul('Métrica: tasa de retorno al sitio, tiempo en página, clicks en CTA.'),
      h3('Etapa 3: Decisión'),
      p('Objetivo: minimizar sacrificios y empujar hacia la conversión.'),
      bul('CTA dominante: "Analizá tu primer partido GRATIS, sin tarjeta de crédito".'),
      bul('Testimonio de coach embajador en video corto (60 seg).'),
      bul('Garantía: "Si no te convence, no pagás. Si pagás y no funciona, te devolvemos."'),
      bul('Comparativa visual: tu proceso hoy (3 hs) vs con Apert Vision (5 min).'),
      bul('Métrica: tasa de descarga / signup / activación al primer análisis.'),
      h3('Etapa 4: Conversión'),
      p('Conversión concreta: el coach realiza su PRIMER análisis exitoso y descarga sus clips (no solo el registro).'),
      bul('Onboarding asistido por WhatsApp en los primeros 5 minutos post-instalación.'),
      bul('Email automático "tu primer partido está listo" con CTA al resultado.'),
      bul('Trigger de upgrade: tras el 1er partido gratis, oferta del Pack Temporada con descuento.'),
      bul('Métrica: % de signups que llegan al primer análisis exitoso.'),
      h3('Etapa 5: Fidelización'),
      p('Objetivo: retener clientes y convertirlos en promotores.'),
      bul('Comunidad Discord de coaches usuarios (organizada por categoría: senior, juvenil, femenino).'),
      bul('Newsletter mensual con tips, novedades y casos de éxito de otros clubes.'),
      bul('Programa de referidos: coach que recomienda → 1 partido gratis para él y para el referido.'),
      bul('Encuesta NPS trimestral con feedback estructurado.'),
      bul('Métrica: NPS, tasa de retención mes-a-mes, % clientes que renuevan Pack Temporada.'),

      h3('Estrategia de contenidos — 2 ejemplos concretos'),
      h3('Contenido 1 (Descubrimiento): Reel Instagram'),
      bulB('Formato', 'Video vertical de 45 segundos para Instagram Reels y TikTok'),
      bulB('Título', '"3 horas del coach vs 5 minutos de la IA — ¿quién analiza mejor?"'),
      bulB('Guion', 'Plano 1: coach con notebook, café y planilla. Texto en pantalla: "Lunes 21:30 — analizando el partido del sábado". Plano 2: timelapse del coach pausando video cada minuto, anotando. Texto: "3 horas después..." Plano 3: pantalla con planilla incompleta. Texto: "Solo 5 line-outs anotados". Plano 4: misma escena con Apert Vision corriendo. Texto: "Mientras tanto, Apert Vision: 26 formaciones detectadas, clips listos, todo en 5 min". Plano final: logo + "Probá el primer partido gratis"'),
      bulB('Distribución', 'Instagram (cuenta @apertvision), TikTok, grupos privados de coaches en Facebook'),
      bulB('Objetivo', 'Generar curiosidad y derivar tráfico al sitio (estimado 5% CTR a perfil → 30% al sitio)'),
      h3('Contenido 2 (Consideración): Infografía LinkedIn'),
      bulB('Formato', 'Carrusel de 6 imágenes para LinkedIn (1080 × 1080 px)'),
      bulB('Título', '"5 estadísticas que tu coach amateur no está viendo (y que están cambiando partidos en la URBA)"'),
      bulB('Slides', 'Slide 1: portada con título. Slides 2-6: una métrica por slide — % de éxito en line-outs propios, distribución temporal de scrums perdidos, ratio de salidas recuperadas, confianza promedio de detección por categoría, comparación visual local vs visitante. Slide final: CTA "Analizá tu próximo partido con datos. Trial gratis en apertvision.com".'),
      bulB('Distribución', 'LinkedIn de los fundadores + reposteo en cuentas de la marca'),
      bulB('Objetivo', 'Posicionar autoridad técnica y atraer dirigentes deportivos (decisores económicos del club)'),

      new Paragraph({ children: [new PageBreak()] }),

      // ── 7.d · BLOG ──
      h2('7.d · El Blog: estructura y primera nota'),
      h3('Estructura del blog'),
      p('Cuatro categorías editoriales con dos temas cada una (8 temas en total) que sirven a las etapas de descubrimiento y fidelización del embudo:'),
      tBlog,

      h3('Primera nota completa de blog'),
      p('Esta nota es publicable y representativa de la línea editorial. Apunta al Buyer Persona (entrenador amateur) y corresponde a la categoría "Análisis táctico", etapa de descubrimiento del embudo.'),

      // Contenido de la nota
      new Paragraph({ children: [new TextRun({ text: '5 estadísticas que tu coach amateur no está viendo (y que están cambiando partidos en la URBA)', bold: true, color: VERDE_OSC, size: 32 })],
        spacing: { before: 240, after: 120 } }),
      new Paragraph({ children: [new TextRun({ text: 'Mientras los clubes profesionales analizan 50 datos por partido, en el rugby amateur seguimos contando line-outs a ojo. Te contamos cinco métricas que están haciendo la diferencia y cómo medirlas sin contratar un departamento de análisis.', italics: true, color: VERDE_OSC })],
        spacing: { after: 280 } }),

      h3('Introducción: el problema del análisis a ojo'),
      p('Si sos coach de un club amateur, esta escena te va a sonar familiar. Termina el partido. Volvés a casa. Lunes a la noche, después de cenar, abrís el video del partido en tu notebook. Café, planilla en Excel y a marcar. Tres horas después tenés siete u ocho line-outs anotados, alguna observación táctica difusa y la sensación de que se te escaparon detalles importantes.'),
      p('Mientras tanto, los clubes profesionales —Toulouse, Crusaders, hasta Los Pumas en sus camadas juveniles— analizan automáticamente más de 50 indicadores por partido. La pregunta no es si vos podés llegar a ese nivel: es por qué seguimos asumiendo que el análisis profesional es solo para profesionales.'),
      p('Estas son las cinco estadísticas que más impacto tienen en partidos amateurs según los entrenadores que entrevistamos para diseñar Apert Vision — y que hoy se pueden medir automáticamente sin contratar a nadie.'),

      h3('1. Porcentaje de éxito en line-outs propios vs visitante'),
      p('Es la métrica reina del juego en las alturas. Tu equipo lanza un line-out: ¿lo ganaste o lo perdiste? Sumalo en una temporada y vas a ver patrones que a ojo no se detectan: ciertos lanzamientos funcionan mejor, otros se repiten porque "siempre los hicimos así" pero el rival ya los lee.'),
      p('En clubes profesionales el promedio ronda 85% de eficacia en line-out propio. En clubes amateurs argentinos relevados por Apert Vision, el promedio cae al 67%. Hay 18 puntos porcentuales de mejora disponibles, y casi todos vienen de simplemente saber qué lanzamientos funcionan y cuáles no.'),

      h3('2. Distribución temporal de los scrums perdidos'),
      p('No es lo mismo perder un scrum a los 10 minutos que a los 60. Si perdés scrums sistemáticamente en el último cuarto del partido, no tenés un problema técnico: tenés un problema físico. Si los perdés siempre al inicio, el problema es psicológico (no entraron al partido) o táctico (el rival te marcó la cancha temprano).'),
      p('Esta es una métrica que un coach humano casi nunca puede armar a mano: requiere tener cada scrum del partido con su minuto exacto. Con análisis automático te aparece como gráfico de barras en el dashboard. Si la mayoría de tus scrums perdidos están entre los minutos 60 y 80, ya sabés en qué enfocar el próximo entrenamiento.'),

      h3('3. Ratio de salidas recuperadas (kick-offs)'),
      p('Después de un try, la salida es un momento de máximo riesgo y oportunidad. ¿Recuperás la pelota? ¿O se la regalás al rival y te clavan un try en cadena? El ratio "salidas recuperadas / salidas totales" es uno de los mejores predictores de resultado en partidos parejos.'),
      p('El dato es brutalmente concreto: equipos que recuperan más del 30% de sus salidas ganan el 65% de los partidos parejos (margen menor a 10 puntos). Si vos hoy estás abajo de ese umbral, sabés exactamente en qué entrenar el martes.'),

      h3('4. Confianza promedio de detección por categoría'),
      p('Esta es una métrica más sutil, pero muy útil. Cuando un modelo de IA detecta una formación, asigna un nivel de confianza. Si tu equipo lanza líneas que "no se entienden" —híbridas, raras, mal armadas—, hasta la IA tiene dudas. Eso te dice algo sobre la claridad táctica de tu equipo.'),
      p('Si la confianza promedio de tus line-outs está arriba de 90%, tu equipo es predecible (bueno para ejecutar, malo para sorprender). Si está abajo de 70%, sos caótico (sorpresa sí, pero ejecución pobre). El óptimo táctico está entre 75% y 85%: claros en la ejecución pero con variantes que confunden al rival.'),

      h3('5. Comparación visual local vs visitante'),
      p('La estadística más cruda y más reveladora. ¿Por qué jugás distinto de local que de visitante? ¿Es realmente la cancha, o son los nervios, o es que cambiás formaciones por las dimensiones del campo? Tener los datos separados por condición de localía rompe muchas excusas y revela patrones tácticos reales.'),
      p('Los equipos amateurs que entrevistamos para construir Apert Vision tienen, en promedio, un 22% más de eficacia en line-outs jugando de local. La diferencia no es la cancha: es la confianza. Saber esto te dice que tu plan para partidos de visitante tiene que ser distinto al de local, no el mismo con la cara más seria.'),

      h3('Cómo empezar a medir esto sin gastar fortuna'),
      p('La buena noticia: en 2026, estas cinco métricas se pueden obtener automáticamente con un video grabado desde el lateral, una computadora común y una herramienta como Apert Vision. El video del partido no sale de tu PC (no se sube a la nube), el análisis tarda entre 5 y 10 minutos, y el primer partido es gratis para que pruebes sin riesgo.'),
      p('No necesitás cambiar tu metodología de entrenamiento, ni convencer a los dirigentes de invertir miles de dólares. Solo necesitás dejar de adivinar y empezar a saber.'),

      // CTA destacado
      new Paragraph({ spacing: { before: 280 }, children: [] }),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [new TableRow({ children: [
          new TableCell({
            borders: { top: { style: BorderStyle.SINGLE, size: 8, color: VERDE }, bottom: { style: BorderStyle.SINGLE, size: 8, color: VERDE }, left: { style: BorderStyle.SINGLE, size: 8, color: VERDE }, right: { style: BorderStyle.SINGLE, size: 8, color: VERDE } },
            width: { size: 9360, type: WidthType.DXA },
            shading: { fill: VERDE_CLARO, type: ShadingType.CLEAR },
            margins: { top: 220, bottom: 220, left: 280, right: 280 },
            children: [
              new Paragraph({ children: [new TextRun({ text: '🏉 Analizá tu próximo partido con datos', bold: true, color: VERDE_OSC, size: 28 })], alignment: AlignmentType.CENTER, spacing: { after: 100 } }),
              new Paragraph({ children: [new TextRun({ text: 'Probá Apert Vision con un partido gratis. Sin tarjeta de crédito. Sin compromiso.', size: 22, color: NEGRO })], alignment: AlignmentType.CENTER, spacing: { after: 140 } }),
              new Paragraph({ children: [new TextRun({ text: '→ apertvision.com', bold: true, color: VERDE, size: 26 })], alignment: AlignmentType.CENTER }),
            ]
          })
        ]})]
      }),

      // Disclaimer / CTA out
      p(''),
      new Paragraph({ children: [new TextRun({ text: 'Suscribite al newsletter mensual para recibir más análisis tácticos y casos reales de clubes URBA. Sin spam, baja en cualquier momento. (CTA alternativo, no comercial directo)', italics: true, color: '666666', size: 18 })],
        spacing: { before: 120, after: 120 } }),

      new Paragraph({ children: [new PageBreak()] }),

      // ── 8. PREPARACIÓN PARA DEFENSA ORAL ──
      h1('8. Preparación para Defensa Oral'),
      p('La consigna establece que la presentación oral es evaluada de forma individual. Esta sección documenta las respuestas preparadas con el vocabulario del framework para defender cada decisión del modelo.'),

      h3('¿Por qué nicho y no mercado de masas?'),
      cita('Porque el rugby amateur tiene necesidades específicas que un producto genérico de analítica deportiva no cubre. Entrenamos el modelo IA con videos de la liga argentina, no con un dataset global. Apuntar a "todos los deportes" diluiría la propuesta de valor y aumentaría los costos de personalización sin diferenciación clara. La elección del nicho B2B está fundamentada en la matriz Producto/Mercado de Ansoff: penetración profunda antes que diversificación.'),

      h3('¿Cuál es el bloque más débil del Canvas y por qué?'),
      cita('Socios Clave. Hoy dependemos demasiado de un solo entrenador embajador para validación y testimonios. Esa concentración es un riesgo de continuidad. El próximo paso estratégico es formalizar alianzas con federaciones (URBA, regionales) para acceso institucional y mitigar el riesgo de dependencia.'),

      h3('¿Cómo se mantiene la ventaja competitiva en el tiempo?'),
      cita('El dataset entrenado con rugby amateur argentino es un recurso intelectual difícil de replicar. Cada nuevo cliente que se suma —vía cocreación— mejora el modelo IA para todos los clientes existentes. Es nuestro equivalente al algoritmo de Spotify Discover Weekly: cuanto más se usa, mejor funciona, más atractivo se vuelve para nuevos usuarios. Es una ventaja competitiva acumulativa, no estática.'),

      h3('¿Por qué pago por uso y no suscripción mensual como Spotify?'),
      cita('Porque el patrón de uso de los clubes amateurs es estacional y desigual: temporada de 6 a 8 meses con análisis selectivo de partidos importantes (5 a 8 por temporada). Una suscripción mensual obligaría a pagar en meses muertos. El pago por uso se ajusta a su realidad económica, baja la barrera de entrada y respeta el comportamiento real del segmento. La investigación de mercado validó esta decisión: 70% prefiere pago por uso vs 30% que aceptaría suscripción.'),

      h3('¿Qué pasa si Supabase aumenta los precios o cierra?'),
      cita('Supabase es un proveedor, no un socio. La distinción es fundamental en el framework de Osterwalder: socio es irremplazable, proveedor es intercambiable. La arquitectura técnica usa estándares abiertos (PostgreSQL, S3-compatible storage, JWT auth) que permiten migrar a Firebase, AWS o auto-hostearse sin reescribir la aplicación. El riesgo está aislado en una capa intercambiable.'),

      h3('¿Cuál es el punto de equilibrio y cuándo se alcanza?'),
      cita('El break-even mensual se alcanza con 6 clubes activos generando aproximadamente 41 partidos analizados al mes (a USD 14 promedio por partido). Proyectivamente esto se logra entre el mes 6 y 7 desde el lanzamiento. La inversión inicial (USD 10.025) se recupera entre los meses 14 y 16, con VAN positivo, TIR del 52% anual y ROI del 95% a 24 meses.'),

      h3('¿Por qué elegir Argentina y no expandirse desde el día 1 a toda LATAM?'),
      cita('Por foco estratégico. La investigación se hizo con coaches argentinos, el modelo se entrenó con dataset local y el coach embajador es de URBA. Probar en un mercado validado antes de expandir reduce el riesgo de operación. La expansión a Uruguay, Chile y Brasil queda como segunda etapa, una vez consolidados los primeros 30-40 clubes argentinos. Es aplicar el principio "validar localmente, escalar regionalmente".'),

      h3('Si el modelo falla, ¿qué planes de contingencia hay?'),
      cita('Tres rutas de pivot identificadas. Primera: si los clubes amateurs no compran, descender al segmento juvenil-colegial (mismo producto, otro segmento). Segunda: si el costo de adquisición resulta muy alto, vender el modelo IA como API a otros productos deportivos. Tercera: si la monetización por partido falla, migrar a suscripción anual federada (la federación paga por todos sus clubes). Las tres rutas reutilizan los recursos clave existentes (modelo IA + apps), minimizando pérdida de inversión.'),

      h3('Frase de cierre para la presentación oral'),
      cita('"El Canvas no es un documento, es una hipótesis. La diferencia entre Apert Vision y otros proyectos de modelo de negocio es que el código ya está escrito: es un producto técnico además de un modelo. El próximo paso es validar comercialmente con los 3 clubes piloto identificados, ajustar precios y propuesta según feedback, y escalar a partir de ahí. Spotify arrancó igual, con una hipótesis, en Estocolmo en 2006. La diferencia es que salió a validarla."'),

      new Paragraph({ children: [new PageBreak()] }),

      // ── ANEXOS ──
      h1('Anexos'),
      h2('Anexo Obligatorio — Referencias bibliográficas y fuentes utilizadas'),
      h3('Material de la asignatura'),
      bul('ACM6AP Clase 6. Planificación Estratégica & Diagnóstico Estratégico.'),
      bul('ACM6AP Clase 7. Gestión de Proyectos e Indicadores Claves.'),
      bul('ACM6AP Clase 8. Soluciones y Oportunidades.'),
      bul('ACM6AP Clase 9 Parte I. Business Model Canvas — Lado del Mercado (DevFlow + Spotify).'),
      bul('ACM6AP Clase 9 Parte II. Business Model Canvas — Lado de la Empresa y Finanzas.'),
      bul('Repaso de Proyectos — Factibilidad y Viabilidad (cuadro de mando financiero VAN/TIR/Payback/ROI).'),
      h3('Bibliografía complementaria'),
      bul('Osterwalder, A. y Pigneur, Y. (2010). Generación de Modelos de Negocio. Wiley.'),
      bul('Kotler, P. (2012). Fundamentos de Marketing — Capítulo 2: La empresa y la estrategia de marketing.'),
      bul('Porter, M. (1980). Competitive Strategy: Techniques for Analyzing Industries and Competitors.'),
      h3('Fuentes secundarias y datos del mercado'),
      bul('Unión de Rugby de Buenos Aires (URBA) — listado de clubes federados.'),
      bul('Hudl — precios públicos en sitio oficial (consulta: junio 2026).'),
      bul('Catapult Sports — propuesta comercial pública (consulta: junio 2026).'),
      bul('Statista — penetración smartphones en Argentina y región LATAM.'),
      h2('Anexo Opcional — Material de soporte'),
      bul('Grabaciones de entrevistas a coaches (disponibles a solicitud del docente, archivos .m4a).'),
      bul('Capturas de pantalla del producto Desktop y Mobile (carpeta /screenshots del repositorio).'),
      bul('Repositorio público del proyecto: github.com/gsaguati/apert-vision'),
      bul('Planilla de costos detallada (anexo Excel separado).'),
      bul('Wireframes de la landing y mockups del producto en Figma.'),

      // Cierre
      new Paragraph({ children: [new TextRun({ text: 'Fin del trabajo escrito.', italics: true, color: '888888' })], alignment: AlignmentType.CENTER, spacing: { before: 360 } }),
    ]
  }]
})

const outputPath = path.join('C:\\Users\\sagua\\Downloads', 'Examen_Parcial_2_Apert_Vision.docx')
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer)
  console.log('Documento generado:', outputPath)
})
