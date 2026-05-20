// ─────────────────────────────────────────────────────────────────────────────
// CONTENIDO DEL SITIO — editá desde aquí o desde el panel de gestión en la web
// ─────────────────────────────────────────────────────────────────────────────

export const INITIAL_DATA = {
  hero: {
    tag: 'Computer Vision · Rugby Analytics',
    title: 'APERT',
    titleGreen: 'VISION',
    subtitle:
      'La primera plataforma de análisis automático de rugby con inteligencia artificial diseñada para clubes amateurs. Sin analistas. Sin horas de video.',
    ctaPrimary: 'Descargar gratis',
    ctaSecondary: 'Ver cómo funciona',
    stats: [
      { val: '4',  label: 'Métricas iniciales' },
      { val: 'IA', label: 'Detección automática' },
      { val: '0h', label: 'Análisis manual' },
    ],
  },

  problema: {
    tag: 'El problema',
    title: 'El análisis amateur',
    titleGreen: 'está roto',
    cards: [
      { icon: '⏱', title: 'Horas de video manual',     desc: 'Revisar un partido de principio a fin puede llevar entre 2 y 4 horas. Lento, tedioso y propenso a errores.' },
      { icon: '📊', title: 'Sin estadísticas reales',   desc: 'Las decisiones tácticas se toman por memoria y observación subjetiva, sin datos que las respalden.' },
      { icon: '👤', title: 'Jugadores sin feedback',    desc: 'Los jugadores no saben cuántos tackles hicieron ni pueden ver sus propias jugadas para corregirse.' },
      { icon: '💸', title: 'Tecnología solo para élite', desc: 'Las herramientas profesionales de análisis cuestan miles de dólares. Inaccesibles para clubes amateurs.' },
    ],
    quote: {
      text: 'Los jugadores me piden videos de sus jugadas, pero no tengo tiempo ni recursos para editarlos. Anoto las estadísticas a mano y en ese proceso pierdo detalles importantes.',
      author: 'Gustavo',
      role: 'Entrenador de rugby — 20 años de experiencia',
    },
  },

  solucion: {
    tag: 'La solución',
    title: '4 métricas.',
    titleGreen: '100% automático.',
    subtitle:
      'Apert Vision procesa el video localmente en tu computadora y detecta las formaciones clave del partido sin intervención manual.',
    metricas: [
      { icon: '🏉', name: 'Line-Out', desc: 'Detecta cada line-out del partido, marca el minuto exacto y la confianza de la detección.' },
      { icon: '💪', name: 'Scrum',    desc: 'Identifica formaciones de scrum y registra cuántos hubo y en qué momento del partido.' },
      { icon: '🚀', name: 'Salida',   desc: 'Detecta kick-offs y recepciones al inicio del partido y tras cada try anotado.' },
      { icon: '⚽', name: 'Posesión', desc: 'Analiza la posesión de pelota por equipo usando el color de camiseta configurado.' },
    ],
    features: [
      { num: '01', title: 'Video procesado con anotaciones',    desc: 'El video de salida tiene cada formación marcada con un bounding box y el indicador de posesión en tiempo real.' },
      { num: '02', title: 'Timeline de eventos',                desc: 'Línea de tiempo con cada formación detectada: qué fue, en qué minuto y con qué nivel de confianza.' },
      { num: '03', title: 'Dashboard de posesión',              desc: 'Porcentaje de posesión de cada equipo y cómo evolucionó minuto a minuto durante el partido.' },
      { num: '04', title: 'Clips automáticos de formaciones',   desc: 'El sistema genera clips cortos de cada evento. No necesitás editar el video manualmente.' },
      { num: '05', title: 'Procesamiento local sin subir video', desc: 'El video nunca sale de tu computadora. YOLO corre en tu GPU local garantizando velocidad y privacidad.' },
      { num: '06', title: 'Exportación de estadísticas',        desc: 'Los resultados se guardan en JSON y se sincronizan para que el staff acceda desde cualquier dispositivo.' },
    ],
  },

  flujo: {
    tag: 'Cómo funciona',
    title: 'El proceso,',
    titleGreen: 'paso a paso',
    steps: [
      { num: '1', title: 'Configurá los equipos',      desc: 'Seleccionás el color de camiseta de tu equipo y del rival. El sistema usa esos colores para asignar la posesión de pelota durante el análisis.',           tag: '~30 segundos' },
      { num: '2', title: 'Cargá el video del partido', desc: 'Seleccionás el archivo desde tu computadora. El video nunca se sube a ningún servidor — todo el procesamiento ocurre localmente.',                          tag: 'MP4 · MOV · AVI' },
      { num: '3', title: 'YOLO analiza cada frame',    desc: 'El modelo de IA analiza el video fotograma por fotograma usando tu GPU. Detecta line-outs, scrums y salidas con coordenadas exactas y nivel de confianza.', tag: 'YOLO v8 · OpenCV · GPU local' },
      { num: '4', title: 'Análisis de posesión',       desc: 'Para cada frame, detecta la pelota, identifica al jugador más cercano y compara su color de camiseta para determinar qué equipo tiene la posesión.',       tag: 'Detección por color de camiseta' },
      { num: '5', title: 'Resultados listos',          desc: 'El sistema genera el video anotado, los clips de cada formación, las estadísticas en JSON y el dashboard de posesión. Todo en minutos.',                     tag: 'Video · Clips · JSON · Dashboard' },
    ],
  },

  audiencia: {
    tag: 'Para quién',
    title: '¿Para',
    titleGreen: 'quién es?',
    cards: [
      {
        emoji: '🏆',
        title: 'Entrenadores',
        desc:  'La herramienta principal. Tomá decisiones tácticas basadas en datos reales en lugar de memoria y observación subjetiva.',
        items: [
          'Análisis automático sin horas de video manual',
          'Estadísticas por partido en minutos',
          'Timeline de cada formación con minuto exacto',
          'Dashboard de posesión para entender el juego',
        ],
      },
      {
        emoji: '🏃',
        title: 'Jugadores',
        desc:  'Accedé a tus estadísticas individuales y a los clips de tus formaciones desde la app.',
        items: [
          'Estadísticas personales por partido',
          'Clips de tus formaciones para ver y corregir',
          'Historial de rendimiento en la temporada',
        ],
      },
      {
        emoji: '🏟️',
        title: 'Clubes amateurs',
        desc:  'Análisis profesional a un precio accesible. Pagás por partido cuando lo necesitás, sin compromisos mensuales.',
        items: [
          'Modelo pago por partido — sin suscripción fija',
          'Sin infraestructura técnica requerida',
          'Dataset entrenado con videos de tu propia liga',
        ],
      },
    ],
  },

  tecnologia: {
    tag: 'Stack',
    title: 'Tecnología',
    titleGreen: 'de élite',
    subtitle: 'Las mismas herramientas que usan los equipos profesionales, adaptadas para correr en tu computadora.',
    items: [
      { icon: '🧠', name: 'YOLO v8',  role: 'Detección IA' },
      { icon: '📹', name: 'OpenCV',   role: 'Procesamiento de video' },
      { icon: '🐍', name: 'Python',   role: 'Motor del backend' },
      { icon: '🖥️', name: 'PyQt6',   role: 'App Desktop' },
      { icon: '🔥', name: 'Firebase', role: 'Base de datos' },
      { icon: '🔐', name: 'Auth0',    role: 'Autenticación' },
    ],
  },

  descarga: {
    tag: 'Disponible ahora',
    title: 'DESCARGÁ',
    titleGreen: 'GRATIS',
    desc: 'App de escritorio para Windows. Corre en tu computadora, usa tu GPU y no requiere conexión a internet para analizar videos.',
    version: 'v0.1.0-MVP · BETA',
    appName: 'Apert Vision Desktop',
    meta:    'Para Windows 10/11 · Requiere GPU NVIDIA · ~250 MB',
    reqs: [
      'Windows 10 / 11 (64-bit)',
      'GPU NVIDIA (recomendado)',
      '8 GB RAM mínimo',
      'Python 3.10+ incluido',
      '5 GB espacio en disco',
    ],
  },

  faq: {
    tag: 'FAQ',
    title: 'Preguntas',
    titleGreen: 'frecuentes',
    items: [
      { q: '¿Necesito una GPU para usar Apert Vision?',             a: 'No es obligatorio, pero sí muy recomendable. Con una GPU NVIDIA el procesamiento tarda entre 5 y 10 minutos por partido. Sin GPU puede tardar entre 30 y 60 minutos usando el procesador.' },
      { q: '¿El video del partido se sube a algún servidor?',        a: 'No. El video nunca sale de tu computadora. Todo el procesamiento corre localmente. Al servidor solo se sincronizan los clips cortos de formaciones y el JSON con estadísticas.' },
      { q: '¿Qué formatos de video acepta?',                        a: 'MP4, MOV y AVI. La resolución mínima recomendada es 1080p para una mejor detección. Videos grabados con celular o cámara fija desde el lateral funcionan perfectamente.' },
      { q: '¿Por qué el modelo fue entrenado con videos de la liga?', a: 'Los datasets públicos de rugby son de competencias profesionales con condiciones muy distintas a las de una cancha amateur. Entrenar con videos de la propia liga garantiza que el modelo funcione bien en las condiciones reales donde va a correr.' },
      { q: '¿Cómo funciona la detección de posesión?',              a: 'Antes del análisis configurás el color de camiseta de cada equipo. El sistema detecta la pelota en cada frame, identifica al jugador más cercano y compara su color de camiseta para asignar la posesión.' },
      { q: '¿Cuánto cuesta por partido?',                           a: 'El modelo es pago por uso — pagás por cada partido analizado, sin suscripción mensual. Esto permite a clubes con presupuesto ajustado usar el servicio solo cuando lo necesitan.' },
    ],
  },
}
