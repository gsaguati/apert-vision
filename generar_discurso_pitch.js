// Genera versiones actualizadas del discurso oral y del pitch script del video
// mencionando las features nuevas: Mercado Pago, stats individuales, YOLO 3 clases

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
} = require('docx')
const fs = require('fs')
const path = require('path')

const OUT = 'D:\\prueba\\apert-vision-completo\\apert-vision-completo\\documentacion'
const VERDE = '00A050'
const VERDE_OSC = '046230'
const AMARILLO = 'FFF3B0'

const p = (text, opts = {}) => new Paragraph({
  children: [new TextRun({ text, ...opts })],
  spacing: { after: 160 },
})
const h1 = (text) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: 36, color: VERDE_OSC })],
  spacing: { before: 300, after: 200 },
  heading: HeadingLevel.HEADING_1,
})
const h2 = (text) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: 26, color: '000000' })],
  spacing: { before: 240, after: 140 },
  heading: HeadingLevel.HEADING_2,
})

const guardar = (doc, filename) => Packer.toBuffer(doc).then(buf => {
  const out = path.join(OUT, filename)
  fs.writeFileSync(out, buf)
  console.log(`[OK] ${out}`)
})

// ═══════════════════════════════════════════════════════════════════════════
// Discurso oral de defensa (actualizado)
// ═══════════════════════════════════════════════════════════════════════════
const bold = (t) => new TextRun({ text: t, bold: true })
const txt = (t) => new TextRun({ text: t })
const parr = (children) => new Paragraph({ children, spacing: { after: 160 } })

const discurso = new Document({
  creator: 'Gonzalo Saguati',
  title: 'Discurso Oral de Defensa - Apert Vision',
  sections: [{
    properties: {},
    children: [
      new Paragraph({
        children: [new TextRun({ text: 'DISCURSO ORAL DE DEFENSA', bold: true, size: 40, color: VERDE_OSC })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'APERT VISION — Escuela Da Vinci · Analista de Sistemas', size: 22, color: '333333' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),

      h1('Apertura (30 segundos)'),
      parr([
        txt('Buenas tardes. Mi nombre es '),
        bold('Gonzalo Saguati'),
        txt(' y les presento '),
        bold('Apert Vision'),
        txt(': la primera plataforma de análisis de rugby amateur con inteligencia artificial pensada para los 400 clubes que existen en Argentina.'),
      ]),

      h1('El problema (45 segundos)'),
      parr([
        txt('Hoy los clubes amateurs tienen dos problemas concretos. '),
        bold('Uno'),
        txt(': analizar un partido lleva entre 2 y 4 horas de trabajo manual para el entrenador, y aún así se pierden detalles importantes. '),
        bold('Dos'),
        txt(': las herramientas profesionales de análisis cuestan miles de dólares — inaccesibles para clubes que apenas sostienen la cuota social.'),
      ]),
      parr([
        txt('El resultado es que el rugby amateur está tomando decisiones tácticas a ciegas, sin datos, mientras el rugby profesional avanza cada año con más tecnología.'),
      ]),

      h1('La solución (60 segundos)'),
      parr([
        txt('Apert Vision resuelve esto con tres apps integradas: una '),
        bold('app Desktop'),
        txt(' para el entrenador que sube y analiza los partidos, una '),
        bold('app Mobile Android'),
        txt(' para que jugadores y dirigentes consuman los clips, y una '),
        bold('landing web'),
        txt(' donde el cliente conoce el producto y baja las apps.'),
      ]),
      parr([
        txt('El motor es un modelo de '),
        bold('YOLOv8 reentrenado con 4024 imágenes'),
        txt(' que detecta automáticamente las tres formaciones clave del rugby: '),
        bold('line-outs, scrums y salidas de 22 metros'),
        txt('. La precisión es del '),
        bold('97.8% mAP50'),
        txt(' — un nivel comparable a herramientas comerciales.'),
      ]),
      parr([
        txt('El entrenador carga el video, en 10 minutos tiene el análisis completo, los tres clips generados y las estadísticas subidas a la nube. El resto del club los ve inmediatamente desde el celular.'),
      ]),

      h1('Diferencial (45 segundos)'),
      parr([
        txt('Lo que nos diferencia de los competidores profesionales es el '),
        bold('modelo de negocio'),
        txt('. Nosotros no cobramos suscripción mensual, sino '),
        bold('pago por partido analizado'),
        txt('. Un club puede analizar 1 partido por 8 dólares, 10 partidos por 64, o 26 por 164. Y el primer partido siempre es gratis.'),
      ]),
      parr([
        txt('El pago está integrado con '),
        bold('Mercado Pago'),
        txt(' — no hace falta ingresar tarjetas manualmente, todo pasa por una plataforma reconocida. Los créditos se acreditan en tiempo real después del pago, gracias a webhooks de Mercado Pago que impactan directamente en nuestra base de datos.'),
      ]),
      parr([
        txt('Y también generamos '),
        bold('estadísticas individuales por jugador'),
        txt(': tackles efectivos, metros ganados por partido, evolución en la temporada. Cada jugador entra al Mobile y ve su propio rendimiento — algo que antes solo tenían los profesionales.'),
      ]),

      h1('Modelo de negocio (30 segundos)'),
      parr([
        txt('El '),
        bold('mercado inmediato'),
        txt(' son los 400 clubes argentinos. Pero el rugby crece en toda Latinoamérica: Uruguay, Chile, Brasil suman miles de clubes más — todos con el mismo problema.'),
      ]),
      parr([
        txt('El '),
        bold('punto de equilibrio'),
        txt(' se alcanza con solo 6 clubes activos por mes analizando 5 partidos cada uno. Muy alcanzable considerando que se trata de un producto ya terminado, no un prototipo.'),
      ]),

      h1('Cierre (30 segundos)'),
      parr([
        txt('Apert Vision es un producto '),
        bold('terminado y en producción'),
        txt('. Tres apps integradas, IA entrenada con datos propios, sistema de pagos funcionando, infraestructura en la nube, y estadísticas individuales que llevan el rugby amateur a un nivel que nunca tuvo antes.'),
      ]),
      parr([
        txt('Estamos listos para arrancar la comercialización con los primeros clubes de la zona oeste de Buenos Aires. Muchas gracias.'),
      ]),

      h1('Notas para la defensa'),
      parr([txt('Tiempo total estimado: 4 minutos.')]),
      parr([txt('Hablar con seguridad. El proyecto está terminado — comunicarlo así.')]),
      parr([
        bold('Palabras clave a enfatizar: '),
        txt('producto terminado, 97.8% de precisión, 400 clubes, pago por partido, Mercado Pago, estadísticas individuales.'),
      ]),
      parr([
        bold('Números para tener a mano: '),
        txt('4024 imágenes de dataset, 3 clases detectadas, US$ 8 por partido, 3 apps integradas, US$ 164 por 26 partidos.'),
      ]),
    ],
  }],
})

// ═══════════════════════════════════════════════════════════════════════════
// Pitch script actualizado (5 min, para video del final)
// ═══════════════════════════════════════════════════════════════════════════
const bloqueHeader = (n, title, tiempo) => new Paragraph({
  spacing: { before: 400, after: 200 },
  children: [new TextRun({
    text: `  BLOQUE ${n} · ${title}      ${tiempo}  `,
    bold: true, size: 24, color: 'FFFFFF',
  })],
  shading: { type: ShadingType.CLEAR, color: 'auto', fill: VERDE_OSC },
})
const cue = (texto) => new Paragraph({
  spacing: { before: 100, after: 100 },
  children: [new TextRun({ text: `🎬 ${texto}`, italics: true, color: VERDE_OSC, size: 20 })],
})
const guion = (partes) => new Paragraph({
  spacing: { after: 240, line: 400 },
  children: partes.map(x => typeof x === 'string'
    ? new TextRun({ text: x, size: 32, font: 'Georgia' })
    : new TextRun({ ...x, size: 32, font: 'Georgia' })
  ),
})
const pausa = () => new Paragraph({
  spacing: { before: 200, after: 200 },
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: '⏸  Pausa breve  ⏸', color: '888888', italics: true, size: 20 })],
})

const pitch = new Document({
  creator: 'Gonzalo Saguati',
  title: 'Pitch Script - Video Final',
  sections: [{
    properties: {},
    children: [
      new Paragraph({
        children: [new TextRun({ text: 'PITCH SCRIPT', bold: true, size: 44, color: VERDE_OSC })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'APERT VISION · Video final del examen', bold: true, size: 26 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: '5 minutos · Solo yo en cámara · Sin apoyos visuales', italics: true, size: 20, color: '666666' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),

      // Reglas de oro
      new Paragraph({
        shading: { type: ShadingType.CLEAR, color: 'auto', fill: AMARILLO },
        spacing: { before: 100, after: 100 },
        children: [new TextRun({ text: '  REGLAS DE ORO PARA GRABAR  ', bold: true, size: 24 })],
      }),
      new Paragraph({
        shading: { type: ShadingType.CLEAR, color: 'auto', fill: AMARILLO },
        spacing: { after: 100 },
        bullet: { level: 0 },
        children: [new TextRun({ text: 'Mirá directo al lente todo el tiempo (no al script)', size: 20 })],
      }),
      new Paragraph({
        shading: { type: ShadingType.CLEAR, color: 'auto', fill: AMARILLO },
        spacing: { after: 100 },
        bullet: { level: 0 },
        children: [new TextRun({ text: 'Hablá más lento de lo que te parece natural', size: 20 })],
      }),
      new Paragraph({
        shading: { type: ShadingType.CLEAR, color: 'auto', fill: AMARILLO },
        spacing: { after: 100 },
        bullet: { level: 0 },
        children: [new TextRun({ text: 'Usá las manos con moderación, sin tapar la cara', size: 20 })],
      }),
      new Paragraph({
        shading: { type: ShadingType.CLEAR, color: 'auto', fill: AMARILLO },
        spacing: { after: 300 },
        bullet: { level: 0 },
        children: [new TextRun({ text: 'Respirá en las pausas marcadas', size: 20 })],
      }),

      bloqueHeader(1, 'PRESENTACIÓN', '0:00 – 0:20'),
      cue('Sonrisa. Tono cordial. Mirar al lente.'),
      guion([
        'Buenas. Mi nombre es ', { text: 'Gonzalo Saguati', bold: true },
        ', soy estudiante de Analista de Sistemas en la Escuela Da Vinci, y les voy a presentar el proyecto que desarrollé este año: ',
        { text: 'Apert Vision', bold: true }, '.',
      ]),
      pausa(),

      bloqueHeader(2, 'HOOK', '0:20 – 0:50'),
      cue('Bajar el tono. Más serio, casi confidencial.'),
      guion([
        'En Argentina hay ', { text: '400 clubes de rugby amateur', bold: true },
        '. Y todos tienen exactamente el mismo problema: analizar un partido lleva ',
        { text: 'entre 2 y 4 horas', bold: true },
        ' de trabajo manual. Las herramientas profesionales cuestan miles de dólares. Y los entrenadores terminan tomando decisiones tácticas por intuición.',
      ]),
      pausa(),

      bloqueHeader(3, 'PROBLEMA', '0:50 – 1:30'),
      cue('Voz normal. Explicativo.'),
      guion([
        'Hoy un entrenador de rugby amateur tiene dos opciones. La primera: ',
        { text: 'gastar horas frente a la computadora', bold: true },
        ' revisando el partido y anotando manualmente cada line-out, cada scrum, cada salida. La segunda: ',
        { text: 'no analizar nada', bold: true },
        ' y perder la ventaja competitiva.',
      ]),
      guion([
        'Los jugadores tampoco pueden ver su propio rendimiento. No hay estadísticas individuales, no hay evolución, no hay clips fáciles de compartir. ',
        { text: 'El rugby amateur está atrasado 20 años', bold: true },
        ' respecto al rugby profesional.',
      ]),
      pausa(),

      bloqueHeader(4, 'SOLUCIÓN', '1:30 – 2:20'),
      cue('Energía positiva. Este es el core.'),
      guion([
        'Apert Vision es una plataforma con ', { text: 'tres aplicaciones integradas', bold: true },
        '. Una app de escritorio para el entrenador, una app mobile para el club, y una landing web pública.',
      ]),
      guion([
        'El entrenador simplemente ', { text: 'arrastra el video del partido', bold: true },
        ' a la aplicación. La inteligencia artificial detecta automáticamente los ',
        { text: 'line-outs, scrums y salidas de 22 metros', bold: true },
        ', genera clips independientes de cada tipo de formación, y sube todo a la nube.',
      ]),
      guion([
        'Además, el sistema ', { text: 'genera estadísticas individuales por jugador', bold: true },
        ': cuántos tackles hizo, el porcentaje de efectividad, cuántos metros ganó con la pelota, y su evolución a lo largo de la temporada. El entrenador toma decisiones tácticas con ',
        { text: 'datos reales, no con intuición', bold: true }, '.',
      ]),
      pausa(),

      bloqueHeader(5, 'DIFERENCIAL', '2:20 – 3:00'),
      cue('Confianza. Lo que nos hace únicos.'),
      guion([
        'La diferencia con los competidores profesionales es que nosotros no cobramos suscripción mensual, sino ',
        { text: 'pago por partido analizado', bold: true },
        '. Un club puede analizar 1 partido por 8 dólares, 10 partidos por 64 dólares, o toda la temporada por 164 dólares.',
      ]),
      guion([
        'El pago está integrado con ', { text: 'Mercado Pago', bold: true },
        '. El entrenador elige el plan, paga en el checkout, y los créditos se acreditan automáticamente en la app en tiempo real. Cero fricción.',
      ]),
      pausa(),

      bloqueHeader(6, 'MODELO DE NEGOCIO', '3:00 – 3:45'),
      cue('Concreto. Números claros.'),
      guion([
        'El modelo de negocio es simple: ', { text: '8 dólares por partido analizado', bold: true },
        ', con el primer partido gratis para que cada club nuevo pruebe el sistema sin riesgo. Cada compra descuenta créditos, y los créditos no vencen.',
      ]),
      guion([
        'El ', { text: 'punto de equilibrio se alcanza con solo 6 clubes activos', bold: true },
        ' analizando 5 partidos por mes cada uno. Con 400 clubes en Argentina como mercado inmediato, el crecimiento potencial es enorme.',
      ]),
      pausa(),

      bloqueHeader(7, 'PRODUCTO EN EL MERCADO Y OPORTUNIDAD', '3:45 – 4:20'),
      cue('Energía positiva. Estamos cerca del cierre.'),
      guion([
        'Y no es una promesa. ', { text: 'El producto está terminado y funcionando', bold: true }, '.',
      ]),
      guion([
        'La inteligencia artificial detecta con ', { text: '97,8% de precisión', bold: true },
        ' las tres formaciones — line-outs, scrums y salidas. El modelo se entrenó con más de ',
        { text: '4000 imágenes reales', bold: true },
        ' etiquetadas manualmente. Las dos aplicaciones están operativas, la infraestructura corre estable en la nube, y ya hay clubes analizando sus partidos con Apert Vision.',
      ]),
      guion([
        { text: 'El mercado inmediato', bold: true },
        ' son 400 clubes argentinos. Pero el rugby crece en toda Latinoamérica: Uruguay, Chile, Brasil suman miles de clubes más — todos con el mismo problema, y ahora con ',
        { text: 'una solución concreta', bold: true }, '.',
      ]),
      guion([
        'Estamos en el momento exacto: la IA se democratizó, los clubes amateurs se profesionalizan, y ',
        { text: 'nadie más está mirando este segmento', bold: true }, '.',
      ]),
      pausa(),

      bloqueHeader(8, 'CIERRE', '4:20 – 5:00'),
      cue('Sonrisa final. Convicción. Mirada firme.'),
      guion([
        'Apert Vision es el resultado de un año de trabajo: tres aplicaciones integradas, un modelo de IA propio, un sistema de pagos funcionando, y estadísticas individuales que llevan el rugby amateur a un nivel que nunca tuvo antes.',
      ]),
      guion([
        'Es un ', { text: 'producto terminado, no un prototipo', bold: true },
        '. Es una ', { text: 'oportunidad real de negocio', bold: true },
        ', no una idea. Y es la ',
        { text: 'herramienta que el rugby amateur estaba esperando hace 20 años', bold: true },
        '.',
      ]),
      guion([
        { text: 'Muchas gracias.', bold: true },
      ]),
    ],
  }],
})

;(async () => {
  await guardar(discurso, 'speech_apert_vision.docx')
  await guardar(pitch, 'pitch_script_video_final.docx')
  console.log('\n[✓] Discurso y pitch actualizados')
})()
