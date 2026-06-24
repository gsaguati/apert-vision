const fs = require('fs')
const path = require('path')
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, LevelFormat, BorderStyle, WidthType, ShadingType,
  PageOrientation, PageBreak,
} = require('docx')

// ── Constantes de estilo ──
const VERDE = '0E6E36'
const VERDE_OSCURO = '083C1E'
const VERDE_CLARO = 'D5EBDC'
const GRIS_CLARO = 'F0F4F0'
const NEGRO = '083218'

const border = { style: BorderStyle.SINGLE, size: 6, color: VERDE }
const borders = { top: border, bottom: border, left: border, right: border }
const borderLight = { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' }
const bordersLight = { top: borderLight, bottom: borderLight, left: borderLight, right: borderLight }

// ── Helpers ──
const titulo = (texto, level = HeadingLevel.HEADING_1) =>
  new Paragraph({
    heading: level,
    children: [new TextRun({ text: texto, color: VERDE, bold: true })],
    spacing: { before: 280, after: 160 },
  })

const subtitulo = (texto) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text: texto, color: VERDE_OSCURO, bold: true })],
    spacing: { before: 220, after: 120 },
  })

const subsub = (texto) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text: texto, color: NEGRO, bold: true })],
    spacing: { before: 160, after: 80 },
  })

const parrafo = (children, opts = {}) =>
  new Paragraph({
    children: Array.isArray(children) ? children : [new TextRun(children)],
    spacing: { after: 120 },
    ...opts,
  })

const bullet = (texto) =>
  new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    children: typeof texto === 'string' ? [new TextRun(texto)] : texto,
    spacing: { after: 60 },
  })

const bulletBold = (label, texto) =>
  new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    children: [
      new TextRun({ text: label + ': ', bold: true }),
      new TextRun(texto),
    ],
    spacing: { after: 60 },
  })

const cita = (texto) =>
  new Paragraph({
    children: [new TextRun({ text: texto, italics: true, color: VERDE_OSCURO })],
    indent: { left: 360 },
    spacing: { before: 100, after: 160 },
    border: {
      left: { style: BorderStyle.SINGLE, size: 24, color: VERDE, space: 12 },
    },
  })

// Celda de tabla con estilo
const cell = (text, opts = {}) => {
  const {
    bold = false,
    fillColor = null,
    width = 4680,
    fontColor = NEGRO,
    align = AlignmentType.LEFT,
    sizeSmall = false,
  } = opts
  const children = Array.isArray(text)
    ? text.map(t => new Paragraph({
        children: [new TextRun({ text: t, bold, color: fontColor, size: sizeSmall ? 18 : 22 })],
        alignment: align,
        spacing: { after: 40 },
      }))
    : [new Paragraph({
        children: [new TextRun({ text: text, bold, color: fontColor, size: sizeSmall ? 18 : 22 })],
        alignment: align,
      })]
  return new TableCell({
    borders: bordersLight,
    width: { size: width, type: WidthType.DXA },
    shading: fillColor ? { fill: fillColor, type: ShadingType.CLEAR } : undefined,
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children,
  })
}

// ── BLOQUE: Sección del bloque del Canvas ──
function bloqueCanvas(codigo, nombre, items) {
  const children = [
    subtitulo(`${codigo} · ${nombre}`),
  ]
  items.forEach(item => {
    if (item.tipo === 'parr') children.push(parrafo(item.texto))
    if (item.tipo === 'cita') children.push(cita(item.texto))
    if (item.tipo === 'sub')  children.push(subsub(item.texto))
    if (item.tipo === 'bullets') item.items.forEach(b => children.push(bullet(b)))
    if (item.tipo === 'bulletsBold') item.items.forEach(b => children.push(bulletBold(b.label, b.texto)))
    if (item.tipo === 'tabla') children.push(item.tabla)
  })
  return children
}

// ── TABLA: 9 bloques formato Canvas ──
function canvasGrande() {
  const C = (label, items, fill) => cell(
    [label, ...items],
    { fillColor: fill, sizeSmall: true, width: 3120, fontColor: NEGRO }
  )

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3120, 3120, 3120],
    rows: [
      // Fila 1: AsC | AC + RC (en columnas) | PV (placeholder)
      new TableRow({
        children: [
          C('AsC · SOCIOS CLAVE', [
            '• Entrenador embajador (Gustavo)',
            '• URBA / federaciones (futuro)',
            '',
            'PROVEEDORES (no socios):',
            '• Supabase',
            '• Ultralytics (YOLO)',
            '• Resend',
          ], VERDE_CLARO),
          C('AC · ACTIVIDADES CLAVE', [
            '• Entrenamiento iterativo del modelo IA',
            '• Desarrollo Desktop + Mobile',
            '• Onboarding de clubes nuevos',
            '• Mantenimiento backend',
            '• Soporte directo',
            '',
            'Tipo: Producción + Plataforma',
          ], VERDE_CLARO),
          C('PV · PROPUESTA DE VALOR', [
            'Análisis automático de rugby con IA',
            'para clubes amateurs.',
            '',
            'Sin horas de video manual.',
            'Clips para todo el club.',
            'Pago por uso, sin suscripción.',
            '',
            'Elementos: Accesibilidad + Precio + Novedad',
          ], GRIS_CLARO),
        ],
      }),
      // Fila 2: (vacío) | RC | (vacío) — la "media fila" típica del Canvas
      new TableRow({
        children: [
          C('', [''], VERDE_CLARO),
          C('RC · RECURSOS CLAVE', [
            '• Modelo YOLO entrenado ★',
            '• Dataset rugby amateur ARG ★',
            '• Código (Desktop+Mobile+Python)',
            '• Supabase (alquilado, variable)',
            '• 1 dev full-stack',
            '',
            'Tipos: Intelectuales + Humanos',
          ], VERDE_CLARO),
          C('', [''], GRIS_CLARO),
        ],
      }),
      // Fila 3: RCl | (vacío) | C | SM (en 3 columnas siguientes) — adaptado a 3 cols
      new TableRow({
        children: [
          C('RCl · RELACIONES CLIENTES', [
            '• Asistencia personal (early)',
            '• Autoservicio (escala)',
            '• Cocreación (videos→dataset)',
            '• Comunidad de coaches (futuro)',
          ], GRIS_CLARO),
          C('C · CANALES', [
            'Info: redes técnicas, boca a boca',
            'Eval: trial gratis 1er partido',
            'Compra: self-service web',
            'Entrega: Desktop + Mobile (Play Store)',
            'Posventa: docs + WhatsApp directo',
          ], GRIS_CLARO),
          C('SM · SEGMENTO MERCADO', [
            'Clubes rugby amateur ARG',
            '(~400 activos URBA + interior)',
            '',
            'Nicho B2B con 3 roles:',
            '🏆 Entrenadores (pagan)',
            '🏃 Jugadores (consumen)',
            '🏟️ Dirigentes (visibilidad)',
            '',
            'NO mercado de masas.',
          ], GRIS_CLARO),
        ],
      }),
      // Fila 4: EC | FI (combinados en 2 grandes celdas para imitar el footer del Canvas)
      new TableRow({
        children: [
          cell(['EC · ESTRUCTURA DE COSTOS',
                '',
                'FIJOS (~80%): tiempo del dev, dominio',
                'VARIABLES (~20%): Supabase storage crece con clientes',
                '',
                'Orientación: COST-DRIVEN',
                '(todo cloud, autoservicio, sin oficina)',
                '',
                '3 costos más altos:',
                '1. Tiempo del desarrollador',
                '2. Storage al escalar',
                '3. Marketing (futuro)'],
                { fillColor: 'E8F0E8', width: 4680, sizeSmall: true }),
          cell(['FI · FUENTES DE INGRESOS',
                '',
                'TRIAL: 1er partido GRATIS (lead gen)',
                'BÁSICO: $8 USD/partido (line-outs)',
                'PREMIUM: $15 USD/partido (3 categorías + PDF)',
                'PACK TEMPORADA: $120 USD = 10 partidos (-20%)',
                'FUTURO: sponsors locales en clips',
                '',
                'Tipo: TRANSACCIONAL',
                '(no suscripción — clubes analizan 5-8 partidos/temp)'],
                { fillColor: 'E8F0E8', width: 4680, sizeSmall: true }),
          cell('', { fillColor: 'E8F0E8', width: 0 }),
        ],
      }),
    ],
  })
}

// ── Construcción del documento ──
const tablaSegmento = new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [3120, 6240],
  rows: [
    new TableRow({ children: [
      cell('Tipo de mercado', { bold: true, fillColor: VERDE_CLARO, width: 3120 }),
      cell('Nicho de mercado B2B con 3 stakeholders internos', { width: 6240 }),
    ]}),
    new TableRow({ children: [
      cell('Mercado objetivo', { bold: true, fillColor: VERDE_CLARO, width: 3120 }),
      cell('Clubes rugby amateur de Argentina (~400 activos: URBA, URBA juvenil, Tucumán, Córdoba, Rosario)', { width: 6240 }),
    ]}),
    new TableRow({ children: [
      cell('Por qué no son los profesionales', { bold: true, fillColor: VERDE_CLARO, width: 3120 }),
      cell('Ya tienen Hudl o Catapult. El segmento amateur está desatendido', { width: 6240 }),
    ]}),
    new TableRow({ children: [
      cell('Por qué no son los colegios', { bold: true, fillColor: VERDE_CLARO, width: 3120 }),
      cell('No tienen presupuesto ni rol de entrenador profesional', { width: 6240 }),
    ]}),
  ],
})

const tablaPV = new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [2400, 6960],
  rows: [
    new TableRow({ children: [
      cell('Elemento', { bold: true, fillColor: VERDE_CLARO, align: AlignmentType.CENTER, width: 2400 }),
      cell('Cómo aplica en Apert Vision', { bold: true, fillColor: VERDE_CLARO, align: AlignmentType.CENTER, width: 6960 }),
    ]}),
    new TableRow({ children: [
      cell('Accesibilidad ★', { bold: true, width: 2400 }),
      cell('Lleva análisis profesional (USD 2.000+/año en competencia) a clubes que jamás lo tendrían', { width: 6960 }),
    ]}),
    new TableRow({ children: [
      cell('Precio ★', { bold: true, width: 2400 }),
      cell('Pago por partido vs suscripción anual de la competencia. ROI inmediato y sin compromiso', { width: 6960 }),
    ]}),
    new TableRow({ children: [
      cell('Novedad ★', { bold: true, width: 2400 }),
      cell('Primera plataforma de IA específicamente diseñada para rugby amateur con dataset local', { width: 6960 }),
    ]}),
    new TableRow({ children: [
      cell('Reducción de costos', { bold: true, width: 2400 }),
      cell('Elimina 2 a 4 horas de trabajo manual del entrenador por partido', { width: 6960 }),
    ]}),
    new TableRow({ children: [
      cell('Personalización', { bold: true, width: 2400 }),
      cell('Modelo entrenado con videos de la liga argentina — no es un modelo genérico', { width: 6960 }),
    ]}),
  ],
})

const tablaCanales = new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [1500, 6360, 1500],
  rows: [
    new TableRow({ children: [
      cell('Fase', { bold: true, fillColor: VERDE_CLARO, align: AlignmentType.CENTER, width: 1500 }),
      cell('Canal', { bold: true, fillColor: VERDE_CLARO, align: AlignmentType.CENTER, width: 6360 }),
      cell('Tipo', { bold: true, fillColor: VERDE_CLARO, align: AlignmentType.CENTER, width: 1500 }),
    ]}),
    new TableRow({ children: [
      cell('1. Información', { bold: true, width: 1500 }),
      cell('Redes técnicas (grupos de coaches en WhatsApp y Facebook URBA), boca a boca del entrenador embajador, presencia en torneos juveniles, contenido en Instagram y YouTube (antes/después)', { width: 6360 }),
      cell('Propio', { width: 1500, align: AlignmentType.CENTER }),
    ]}),
    new TableRow({ children: [
      cell('2. Evaluación', { bold: true, width: 1500 }),
      cell('Landing page con demos reales, primer partido gratis (trial), casos de uso documentados', { width: 6360 }),
      cell('Propio', { width: 1500, align: AlignmentType.CENTER }),
    ]}),
    new TableRow({ children: [
      cell('3. Compra', { bold: true, width: 1500 }),
      cell('Self-service desde landing, tarjeta o Mercado Pago, sin vendedor', { width: 6360 }),
      cell('Propio', { width: 1500, align: AlignmentType.CENTER }),
    ]}),
    new TableRow({ children: [
      cell('4. Entrega', { bold: true, width: 1500 }),
      cell('App Desktop (descarga directa) + App Android (Play Store)', { width: 6360 }),
      cell('Propio + Socio', { width: 1500, align: AlignmentType.CENTER, sizeSmall: true }),
    ]}),
    new TableRow({ children: [
      cell('5. Posventa', { bold: true, width: 1500 }),
      cell('Documentación interactiva, WhatsApp directo con el equipo, comunidad de usuarios (futuro)', { width: 6360 }),
      cell('Propio', { width: 1500, align: AlignmentType.CENTER }),
    ]}),
  ],
})

const tablaRCl = new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [2400, 2400, 4560],
  rows: [
    new TableRow({ children: [
      cell('Fase del negocio', { bold: true, fillColor: VERDE_CLARO, width: 2400 }),
      cell('Tipo de relación', { bold: true, fillColor: VERDE_CLARO, width: 2400 }),
      cell('Por qué', { bold: true, fillColor: VERDE_CLARO, width: 4560 }),
    ]}),
    new TableRow({ children: [
      cell('Etapa actual (0 a 10 clubes)', { width: 2400 }),
      cell('Asistencia personal', { bold: true, width: 2400 }),
      cell('Onboarding directo de cada coach. Aprendemos del cliente y ajustamos producto', { width: 4560 }),
    ]}),
    new TableRow({ children: [
      cell('Crecimiento (10 a 50 clubes)', { width: 2400 }),
      cell('Autoservicio + Comunidad', { bold: true, width: 2400 }),
      cell('Documentación, video tutoriales, grupo de coaches usuarios', { width: 4560 }),
    ]}),
    new TableRow({ children: [
      cell('Escala (50+ clubes)', { width: 2400 }),
      cell('Servicios automáticos + Cocreación', { bold: true, width: 2400 }),
      cell('Notificaciones push, recomendaciones, clubes contribuyen videos al dataset', { width: 4560 }),
    ]}),
  ],
})

const tablaRC = new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [2200, 4200, 2960],
  rows: [
    new TableRow({ children: [
      cell('Tipo', { bold: true, fillColor: VERDE_CLARO, width: 2200 }),
      cell('Recurso', { bold: true, fillColor: VERDE_CLARO, width: 4200 }),
      cell('Detalle', { bold: true, fillColor: VERDE_CLARO, width: 2960 }),
    ]}),
    new TableRow({ children: [
      cell('Intelectuales ★', { bold: true, width: 2200 }),
      cell('Modelo YOLO entrenado + dataset etiquetado de rugby amateur argentino', { width: 4200 }),
      cell('El activo más diferencial. Sin esto no hay producto', { width: 2960 }),
    ]}),
    new TableRow({ children: [
      cell('Intelectuales', { bold: true, width: 2200 }),
      cell('Código fuente Desktop (Electron + React), Mobile (Kotlin Compose), motor Python', { width: 4200 }),
      cell('Construido desde cero', { width: 2960 }),
    ]}),
    new TableRow({ children: [
      cell('Físicos', { bold: true, width: 2200 }),
      cell('Supabase (auth + DB + storage) — alquilado, variable', { width: 4200 }),
      cell('Crece con clientes, sin inversión inicial', { width: 2960 }),
    ]}),
    new TableRow({ children: [
      cell('Humanos', { bold: true, width: 2200 }),
      cell('Dev full-stack (etapa actual: 1 persona)', { width: 4200 }),
      cell('Limitante crítico para escalar', { width: 2960 }),
    ]}),
    new TableRow({ children: [
      cell('Económicos', { bold: true, width: 2200 }),
      cell('Bootstrap — sin financiamiento externo', { width: 4200 }),
      cell('Limita velocidad pero da independencia', { width: 2960 }),
    ]}),
  ],
})

const tablaAC = new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [3000, 6360],
  rows: [
    new TableRow({ children: [
      cell('Actividad', { bold: true, fillColor: VERDE_CLARO, width: 3000 }),
      cell('Por qué no puede parar', { bold: true, fillColor: VERDE_CLARO, width: 6360 }),
    ]}),
    new TableRow({ children: [
      cell('Entrenamiento iterativo del modelo IA', { bold: true, width: 3000 }),
      cell('Más videos = mejor detección. Es lo que justifica el precio. Si para, la competencia nos alcanza', { width: 6360 }),
    ]}),
    new TableRow({ children: [
      cell('Desarrollo continuo Desktop + Mobile', { bold: true, width: 3000 }),
      cell('El producto evoluciona con feedback de coaches. Sin nuevas features, el cliente no renueva', { width: 6360 }),
    ]}),
    new TableRow({ children: [
      cell('Onboarding de clubes nuevos', { bold: true, width: 3000 }),
      cell('En early-stage cada cliente es un caso de estudio y un testimonio para el siguiente', { width: 6360 }),
    ]}),
    new TableRow({ children: [
      cell('Mantenimiento del backend Supabase', { bold: true, width: 3000 }),
      cell('Si la nube cae, los clubes pierden sus clips. Continuidad operativa crítica', { width: 6360 }),
    ]}),
    new TableRow({ children: [
      cell('Soporte directo', { bold: true, width: 3000 }),
      cell('En esta etapa, alta atención = alta retención de los primeros clientes', { width: 6360 }),
    ]}),
  ],
})

const tablaAsC = new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [1700, 2900, 4760],
  rows: [
    new TableRow({ children: [
      cell('Es', { bold: true, fillColor: VERDE_CLARO, width: 1700, align: AlignmentType.CENTER }),
      cell('Quién', { bold: true, fillColor: VERDE_CLARO, width: 2900 }),
      cell('Por qué', { bold: true, fillColor: VERDE_CLARO, width: 4760 }),
    ]}),
    new TableRow({ children: [
      cell('SOCIO', { bold: true, fontColor: VERDE_OSCURO, width: 1700, align: AlignmentType.CENTER }),
      cell('Entrenador embajador (Gustavo)', { width: 2900 }),
      cell('Sin él no hay validación ni primer cliente. Su feedback co-crea el producto. Difícil de reemplazar', { width: 4760 }),
    ]}),
    new TableRow({ children: [
      cell('SOCIO (futuro)', { bold: true, fontColor: VERDE_OSCURO, width: 1700, align: AlignmentType.CENTER }),
      cell('URBA o federaciones regionales', { width: 2900 }),
      cell('Para acceso institucional al mercado. Alianza no-competidor', { width: 4760 }),
    ]}),
    new TableRow({ children: [
      cell('PROVEEDOR', { bold: true, width: 1700, align: AlignmentType.CENTER }),
      cell('Supabase', { width: 2900 }),
      cell('Reemplazable por Firebase, AWS, etc. Decisión técnica, no estratégica', { width: 4760 }),
    ]}),
    new TableRow({ children: [
      cell('PROVEEDOR', { bold: true, width: 1700, align: AlignmentType.CENTER }),
      cell('Ultralytics (YOLO)', { width: 2900 }),
      cell('Open source. Si dejan de mantenerlo, hay alternativas', { width: 4760 }),
    ]}),
    new TableRow({ children: [
      cell('PROVEEDOR', { bold: true, width: 1700, align: AlignmentType.CENTER }),
      cell('Resend (email transaccional)', { width: 2900 }),
      cell('Intercambiable por SendGrid o Mailgun', { width: 4760 }),
    ]}),
    new TableRow({ children: [
      cell('CANAL', { bold: true, fontColor: '8B5A00', width: 1700, align: AlignmentType.CENTER }),
      cell('Google Play Store', { width: 2900 }),
      cell('15-30% comisión si vendemos desde ahí. Por ahora APK directo evita esto', { width: 4760 }),
    ]}),
  ],
})

const tablaFI = new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [2200, 2900, 4260],
  rows: [
    new TableRow({ children: [
      cell('Plan', { bold: true, fillColor: VERDE_CLARO, width: 2200, align: AlignmentType.CENTER }),
      cell('Precio', { bold: true, fillColor: VERDE_CLARO, width: 2900, align: AlignmentType.CENTER }),
      cell('Tipo', { bold: true, fillColor: VERDE_CLARO, width: 4260 }),
    ]}),
    new TableRow({ children: [
      cell('Trial', { bold: true, width: 2200 }),
      cell('$0 — primer partido gratis', { bold: true, fontColor: VERDE_OSCURO, width: 2900 }),
      cell('Lead generation', { width: 4260 }),
    ]}),
    new TableRow({ children: [
      cell('Básico', { bold: true, width: 2200 }),
      cell('$8 USD por partido', { bold: true, width: 2900 }),
      cell('Transaccional (solo line-outs detectados)', { width: 4260 }),
    ]}),
    new TableRow({ children: [
      cell('Premium', { bold: true, width: 2200 }),
      cell('$15 USD por partido', { bold: true, width: 2900 }),
      cell('Transaccional (line-outs + scrums + salidas + PDF)', { width: 4260 }),
    ]}),
    new TableRow({ children: [
      cell('Pack Temporada', { bold: true, width: 2200 }),
      cell('$120 USD = 10 partidos', { bold: true, width: 2900 }),
      cell('Transaccional con commitment (-20% vs precio unitario)', { width: 4260 }),
    ]}),
    new TableRow({ children: [
      cell('Futuro', { bold: true, width: 2200 }),
      cell('Sponsors locales en clips', { width: 2900 }),
      cell('Publicidad + sponsors (marcas de equipamiento)', { width: 4260 }),
    ]}),
  ],
})

const tablaEC = new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [2900, 1500, 4960],
  rows: [
    new TableRow({ children: [
      cell('Costo', { bold: true, fillColor: VERDE_CLARO, width: 2900 }),
      cell('Tipo', { bold: true, fillColor: VERDE_CLARO, width: 1500, align: AlignmentType.CENTER }),
      cell('Estimado mensual', { bold: true, fillColor: VERDE_CLARO, width: 4960 }),
    ]}),
    new TableRow({ children: [
      cell('Dominio web', { bold: true, width: 2900 }),
      cell('Fijo', { width: 1500, align: AlignmentType.CENTER }),
      cell('~$2 USD/mes', { width: 4960 }),
    ]}),
    new TableRow({ children: [
      cell('Supabase (Free → Pro al crecer)', { bold: true, width: 2900 }),
      cell('Variable', { width: 1500, align: AlignmentType.CENTER }),
      cell('$0 → $25 USD/mes', { width: 4960 }),
    ]}),
    new TableRow({ children: [
      cell('Resend (Free → Pro)', { bold: true, width: 2900 }),
      cell('Variable', { width: 1500, align: AlignmentType.CENTER }),
      cell('$0 → $20 USD/mes', { width: 4960 }),
    ]}),
    new TableRow({ children: [
      cell('Storage extra (al pasar 1 GB)', { bold: true, width: 2900 }),
      cell('Variable', { width: 1500, align: AlignmentType.CENTER }),
      cell('$0.021 / GB / mes', { width: 4960 }),
    ]}),
    new TableRow({ children: [
      cell('Tiempo del desarrollador', { bold: true, width: 2900 }),
      cell('Fijo', { width: 1500, align: AlignmentType.CENTER }),
      cell('El costo más alto real (oportunidad)', { width: 4960 }),
    ]}),
    new TableRow({ children: [
      cell('Registro Google Play', { bold: true, width: 2900 }),
      cell('Fijo (única vez)', { width: 1500, align: AlignmentType.CENTER, sizeSmall: true }),
      cell('$25 USD (one-shot)', { width: 4960 }),
    ]}),
  ],
})

// ── Construcción del documento ──
const doc = new Document({
  creator: 'Apert Vision',
  title: 'Business Model Canvas - Apert Vision',
  description: 'Modelo de negocio completo aplicando el framework de Osterwalder',
  styles: {
    default: { document: { run: { font: 'Calibri', size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Calibri', color: VERDE },
        paragraph: { spacing: { before: 320, after: 200 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Calibri', color: VERDE_OSCURO },
        paragraph: { spacing: { before: 240, after: 140 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: 'Calibri', color: NEGRO },
        paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'bullets',
        levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: 'numbers',
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [
    // ── Sección 1: portada + contenido principal ──
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        // Portada
        new Paragraph({
          children: [new TextRun({ text: 'BUSINESS MODEL CANVAS', color: VERDE, bold: true, size: 48 })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 1200, after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'APERT VISION', color: NEGRO, bold: true, size: 72 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Análisis de rugby amateur con inteligencia artificial', italics: true, color: VERDE_OSCURO, size: 28 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Framework: Osterwalder & Pigneur — Generación de Modelos de Negocio (2010)', size: 22, color: '666666' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Trabajo de Modelo de Negocio · Materia: ACM6AP — Clase 9', size: 20, color: '888888' })],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ children: [new PageBreak()] }),

        // ── INTRODUCCIÓN ──
        titulo('Introducción'),
        parrafo([
          new TextRun({ text: 'Apert Vision ', bold: true }),
          new TextRun({ text: 'es una plataforma de análisis automático de rugby con inteligencia artificial, diseñada para clubes amateurs que no pueden acceder a las herramientas profesionales del mercado por su alto costo. El sistema procesa videos de partidos localmente, detecta formaciones (line-outs, scrums y salidas) y entrega clips automáticos accesibles desde el celular para todo el club.' }),
        ]),
        parrafo('Este documento aplica el framework Business Model Canvas (Osterwalder & Pigneur) a Apert Vision, definiendo los nueve bloques que componen el modelo de negocio en sus tres lados: mercado, empresa y finanzas.'),

        // ── LADO DEL MERCADO ──
        titulo('Lado del Mercado'),
        parrafo('Los cuatro bloques del lado del mercado describen a quién atendemos, qué ofrecemos, cómo llegamos y qué tipo de relación establecemos con nuestros clientes.'),

        ...bloqueCanvas('SM', 'Segmento de Mercado', [
          { tipo: 'parr', texto: 'Tipo de mercado: Nicho B2B con 3 stakeholders internos.' },
          { tipo: 'tabla', tabla: tablaSegmento },
          { tipo: 'sub', texto: 'Los tres roles dentro del cliente' },
          { tipo: 'bullets', items: [
            '🏆 Entrenadores: quienes pagan y suben los partidos al sistema',
            '🏃 Jugadores: consumidores principales del contenido (clips desde el celular)',
            '🏟️ Dirigentes: decisores económicos del club, stakeholders de visibilidad',
          ]},
          { tipo: 'parr', texto: 'No es plataforma multilateral porque los tres roles pertenecen al mismo cliente (el club). Es un nicho B2B con tres usuarios internos diferenciados.' },
        ]),

        ...bloqueCanvas('PV', 'Propuesta de Valor', [
          { tipo: 'cita', texto: 'Para entrenadores de rugby amateur que pierden 2 a 4 horas por partido analizando manualmente, ofrecemos análisis automático con IA que entrega clips y estadísticas en minutos, accesible desde el celular para todo el club. Pago por uso, sin suscripción.' },
          { tipo: 'sub', texto: 'Elementos de Osterwalder que predominan' },
          { tipo: 'tabla', tabla: tablaPV },
        ]),

        ...bloqueCanvas('C', 'Canales', [
          { tipo: 'parr', texto: 'Distribuimos la propuesta de valor a través de cinco fases. El producto digital es a la vez canal de entrega: costo marginal por cliente casi cero, ventaja competitiva clave del software.' },
          { tipo: 'tabla', tabla: tablaCanales },
        ]),

        ...bloqueCanvas('RCl', 'Relaciones con Clientes', [
          { tipo: 'parr', texto: 'Estrategia evolutiva: empezamos con atención personalizada para validar y aprender, y migramos progresivamente a autoservicio y cocreación para escalar.' },
          { tipo: 'tabla', tabla: tablaRCl },
          { tipo: 'parr', texto: 'La cocreación es estratégica: cada club que sube videos al dataset (con permiso explícito) mejora el modelo de IA para todos los clientes. Es un círculo virtuoso análogo a Spotify Wrapped, donde los propios usuarios generan el valor que retiene al resto.' },
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ── LADO DE LA EMPRESA ──
        titulo('Lado de la Empresa'),
        parrafo('Los tres bloques del lado de la empresa describen los activos necesarios, las actividades imprescindibles y los aliados estratégicos que hacen funcionar el modelo.'),

        ...bloqueCanvas('RC', 'Recursos Clave', [
          { tipo: 'parr', texto: 'Los recursos más críticos son intelectuales (modelo entrenado y código propio). La infraestructura física es 100% alquilada (Supabase), lo que permite crecer sin inversión inicial.' },
          { tipo: 'tabla', tabla: tablaRC },
        ]),

        ...bloqueCanvas('AC', 'Actividades Clave', [
          { tipo: 'parr', texto: 'Las actividades clave combinan Producción (desarrollo de software) y Plataforma (mantenimiento y crecimiento del servicio en la nube). En early-stage la producción domina; con el crecimiento la plataforma se vuelve dominante.' },
          { tipo: 'tabla', tabla: tablaAC },
        ]),

        ...bloqueCanvas('AsC', 'Socios Clave', [
          { tipo: 'parr', texto: 'Distinción crítica del framework: un socio es alguien sin quien el modelo no funciona y con quien la relación es difícil de reemplazar. Un proveedor es intercambiable. Confundir ambos lleva a sobreestimar riesgos o subestimar dependencias.' },
          { tipo: 'tabla', tabla: tablaAsC },
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ── FINANZAS ──
        titulo('Finanzas'),
        parrafo('Los dos bloques de finanzas cierran el modelo: definen cómo se obtienen ingresos y qué costos implica la operación.'),

        ...bloqueCanvas('FI', 'Fuentes de Ingresos', [
          { tipo: 'parr', texto: 'Modelo: pago por transacción (no es freemium puro ni suscripción). La elección está fundamentada en el comportamiento del cliente.' },
          { tipo: 'tabla', tabla: tablaFI },
          { tipo: 'sub', texto: '¿Por qué no suscripción?' },
          { tipo: 'parr', texto: 'Los clubes amateurs juegan entre 15 y 20 partidos por temporada, pero solo analizan a fondo entre 5 y 8 (los más importantes: clásicos, finales, partidos contra rivales directos). Una suscripción anual los percibirían como cara para su nivel de uso. El pago por partido baja la barrera de entrada y se ajusta a su realidad económica.' },
        ]),

        ...bloqueCanvas('EC', 'Estructura de Costos', [
          { tipo: 'parr', texto: 'Orientación: cost-driven en early-stage. Esto significa minimizar costos fijos para sobrevivir sin financiamiento, no sacrificar calidad del producto.' },
          { tipo: 'tabla', tabla: tablaEC },
          { tipo: 'sub', texto: 'Tres costos más altos' },
          { tipo: 'bullets', items: [
            'Tiempo del desarrollador (oportunidad, pre-revenue)',
            'Storage cuando escale (clips de muchos clubes acumulados)',
            'Marketing futuro (cuando salgamos de boca a boca)',
          ]},
          { tipo: 'sub', texto: 'Estructura típica de costos en software (clase 14)' },
          { tipo: 'bulletsBold', items: [
            { label: 'Investigación y Desarrollo', texto: '70% (alto en early-stage, normal)' },
            { label: 'Infraestructura', texto: '5% (Supabase es muy barato a esta escala)' },
            { label: 'Marketing', texto: '10% (mayormente orgánico vía boca a boca)' },
            { label: 'Soporte al cliente', texto: '15% (alta personalización en early)' },
          ]},
          { tipo: 'sub', texto: 'Punto de equilibrio' },
          { tipo: 'parr', texto: 'Con 3 clubes × 5 partidos por temporada × $15 USD = $225/mes ya cubrimos infraestructura básica. La rentabilidad real llega con 20+ clubes activos.' },
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ── CANVAS COMPLETO ──
        titulo('Canvas Completo · Vista General'),
        parrafo('A continuación, los nueve bloques en formato Canvas tradicional.'),
        canvasGrande(),

        new Paragraph({ children: [new PageBreak()] }),

        // ── ANÁLISIS CRÍTICO ──
        titulo('Análisis Crítico del Modelo'),
        subtitulo('El bloque más fuerte'),
        parrafo([
          new TextRun({ text: 'Recursos Clave (RC). ', bold: true }),
          new TextRun({ text: 'El modelo YOLO entrenado con un dataset específico de rugby amateur argentino es un activo intelectual difícil de replicar. Mejora con cada cliente nuevo (cocreación), generando un círculo virtuoso.' }),
        ]),

        subtitulo('El bloque más débil'),
        parrafo([
          new TextRun({ text: 'Socios Clave (AsC). ', bold: true }),
          new TextRun({ text: 'Hoy dependemos demasiado de un solo entrenador embajador para validación y testimonios. El próximo paso es formalizar alianzas con federaciones (URBA, regionales) para acceso institucional y reducir ese riesgo.' }),
        ]),

        subtitulo('Coherencia interna del Canvas'),
        parrafo('Verificación de las relaciones entre bloques (checklist final del taller):'),
        new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [
          new TextRun({ text: '¿Los RC permiten las AC? ', bold: true }),
          new TextRun('Sí. Modelo YOLO + Supabase + dev habilitan entrenamiento iterativo, desarrollo y mantenimiento.'),
        ]}),
        new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [
          new TextRun({ text: '¿Las FI cubren la EC? ', bold: true }),
          new TextRun('Con 3-5 clubes activos sí. El modelo escala bien porque la infraestructura crece con los ingresos (Supabase es variable).'),
        ]}),
        new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [
          new TextRun({ text: '¿La PV llega al SM por los C correctos? ', bold: true }),
          new TextRun('Sí. El segmento (coaches amateurs) está en las redes técnicas y el boca a boca funciona en una comunidad pequeña y conectada.'),
        ]}),

        new Paragraph({ children: [new PageBreak()] }),

        // ── PREGUNTAS PREPARADAS ──
        titulo('Preguntas Preparadas para Defensa Oral'),
        parrafo('Respuestas listas con el vocabulario del framework para defender el Canvas:'),

        subsub('¿Por qué nicho y no mercado de masas?'),
        cita('Porque el rugby amateur tiene necesidades específicas que un genérico de analítica deportiva no cubre. Entrenamos el modelo con videos de la liga argentina. Apuntar a "todos los deportes" diluiría la propuesta y aumentaría los costos de personalización sin diferenciación clara.'),

        subsub('¿Cuál es el bloque más débil hoy?'),
        cita('Socios Clave. Hoy dependemos demasiado de un solo entrenador embajador para validación. El próximo paso es formalizar alianzas con federaciones (URBA, regionales) para acceso institucional y reducir ese riesgo.'),

        subsub('¿Cómo se mantiene la ventaja competitiva?'),
        cita('El dataset entrenado con rugby amateur argentino es un recurso intelectual difícil de replicar. Cada nuevo cliente lo hace mejor (cocreación). Es nuestro algoritmo Spotify Discover Weekly: cuanto más se usa, mejor funciona, más atractivo para nuevos clubes.'),

        subsub('¿Por qué no suscripción mensual como Spotify?'),
        cita('Porque el patrón de uso de los clubes amateurs es estacional y desigual: temporada de 6-8 meses, análisis selectivo de partidos importantes. Una suscripción mensual los obligaría a pagar en meses muertos. El pago por uso se ajusta a su realidad y baja la barrera de entrada.'),

        subsub('¿Qué pasa si Supabase aumenta los precios o cierra?'),
        cita('Supabase es proveedor, no socio. La arquitectura usa estándares (PostgreSQL, S3-compatible storage, JWT auth) que permiten migrar a Firebase, AWS o auto-hostear sin reescribir la aplicación. El riesgo está aislado en una capa intercambiable.'),

        // ── CIERRE ──
        titulo('Cierre'),
        cita('El Canvas no es un documento. Es una hipótesis. La única forma de saber si funciona es hablar con 10 clientes potenciales antes de escribir una línea de código.'),
        parrafo('Apert Vision parte de esa hipótesis con la diferencia de que el código ya está escrito (es un proyecto técnico además de un modelo de negocio). El próximo paso es validar comercialmente con los 3 clubes piloto identificados, ajustar precios y propuesta según feedback, y escalar a partir de ahí.'),
        parrafo([
          new TextRun({ text: 'Spotify arrancó igual, con una hipótesis, en Estocolmo en 2006. ', italics: true }),
          new TextRun({ text: 'La diferencia es que salió a validarla. Es lo que sigue para Apert Vision.', italics: true, bold: true }),
        ]),
      ],
    },
  ],
})

// ── Generar ──
const outputPath = path.join('C:\\Users\\sagua\\Downloads', 'Canvas_Apert_Vision.docx')
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer)
  console.log('Documento creado:', outputPath)
})
