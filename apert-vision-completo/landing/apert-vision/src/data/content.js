// ─────────────────────────────────────────────────────────────────────────────
// CONTENIDO DEL SITIO — editá desde aquí o desde el panel de gestión en la web
// ─────────────────────────────────────────────────────────────────────────────

export const INITIAL_DATA = {
  hero: {
    tag: 'Computer Vision · Rugby Analytics',
    title: 'APERT',
    titleGreen: 'VISION',
    subtitle:
      'El primer asistente con IA para análisis de rugby amateur. Subí el video del partido y obtené formaciones detectadas, clips automáticos y estadísticas en minutos.',
    ctaPrimary: 'Solicitar acceso',
    ctaSecondary: 'Ver cómo funciona',
    stats: [
      { val: '10×',  label: 'Más rápido que análisis manual' },
      { val: '0',    label: 'Horas de edición' },
      { val: 'IA',   label: 'Detección automática' },
    ],
  },

  problema: {
    tag: 'El problema',
    title: 'El análisis amateur',
    titleGreen: 'está roto',
    cards: [
      { icon: '⏱', title: 'Horas de video manual',     desc: 'Revisar un partido de principio a fin puede llevar entre 2 y 4 horas. Lento, tedioso y propenso a errores.' },
      { icon: '📊', title: 'Sin estadísticas reales',   desc: 'Las decisiones tácticas se toman por memoria y observación subjetiva, sin datos que las respalden.' },
      { icon: '🎬', title: 'Clips imposibles de armar',  desc: 'Editar los momentos clave por jugador o jugada lleva más tiempo que el partido mismo. Casi nadie lo hace.' },
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
    title: '3 formaciones.',
    titleGreen: '100% automático.',
    subtitle:
      'Apert Vision analiza el video con IA local y genera el video anotado, los clips por tipo y las estadísticas. Los clips quedan en la nube para que cada miembro del club los vea desde el celular.',
    metricas: [
      { icon: '🏉', name: 'Line-Out', desc: 'YOLO detecta cada formación de line-out con su minuto exacto y nivel de confianza.' },
      { icon: '💪', name: 'Scrum',    desc: 'Identifica scrums y los marca en el timeline para revisión rápida.' },
      { icon: '🚀', name: 'Salida',   desc: 'Detecta kick-offs al inicio del partido y después de cada try.' },
    ],
    features: [
      { num: '01', title: 'Análisis en una sola pantalla',     desc: 'Cargás el video, completás los datos del partido (rival, local/visitante, marcador) y el sistema hace el resto.' },
      { num: '02', title: 'Timeline interactivo',              desc: 'Cada formación detectada marcada en la línea de tiempo. Hacés click y el video salta al momento exacto.' },
      { num: '03', title: 'Clips automáticos por tipo',        desc: 'Tres videos generados: uno con todos los line-outs, otro con los scrums y otro con las salidas. Sin editar nada.' },
      { num: '04', title: 'App mobile para todo el club',      desc: 'Jugadores, entrenadores y dirigentes acceden a los clips desde Android con un código de invitación.' },
      { num: '05', title: 'Procesamiento local + nube',         desc: 'El video pesado se procesa en tu PC con GPU. Solo los clips comprimidos se suben a la nube — privado y eficiente.' },
      { num: '06', title: 'Roles y permisos por club',         desc: 'Cada club tiene 3 códigos: entrenador (sube partidos), dirigente (consulta), jugador (ve clips).' },
    ],
  },

  flujo: {
    tag: 'Cómo funciona',
    title: 'El proceso,',
    titleGreen: 'paso a paso',
    steps: [
      { num: '1', title: 'Cargás el video',           desc: 'Desde la app Desktop arrastrás el video del partido. Cualquier formato común: MP4, MOV, AVI o MKV.',                                              tag: 'MP4 · MOV · AVI · MKV' },
      { num: '2', title: 'Completás los datos',       desc: 'Rival, fecha, si jugaron de local o visitante, marcador, resultado. Lo que va a quedar registrado del partido en la nube.',                       tag: '~30 segundos' },
      { num: '3', title: 'YOLO analiza cada frame',   desc: 'El modelo de visión analiza el video usando la GPU de tu PC. Va emitiendo eventos en tiempo real: minuto, tipo, confianza.',                       tag: 'YOLO v8 · OpenCV · GPU local' },
      { num: '4', title: 'Clips generados y subidos', desc: 'Al terminar se crean los clips por tipo, se comprimen con ffmpeg a 480p H.264 y se suben a la nube vía upload resumible.',                        tag: 'ffmpeg · TUS upload' },
      { num: '5', title: 'Disponible en el celular',  desc: 'Cualquier miembro del club abre la app Android, se autentica y ve los clips del partido recién subido. Listo para revisar.',                       tag: 'Android · Kotlin Compose' },
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
        desc:  'Sube los partidos desde el Desktop, accede a estadísticas globales y comparte los clips con el club. También los ve en el celular.',
        items: [
          'App Desktop para Windows con análisis YOLO',
          'Dashboard global con stats por temporada',
          'Récord local vs visitante y por tipo de evento',
          'Acceso desde Mobile para ver clips en cualquier lado',
        ],
      },
      {
        emoji: '🏃',
        title: 'Jugadores',
        desc:  'Reciben un código de invitación y entran a la app Android. Ven los clips de todos los partidos del club analizados.',
        items: [
          'App Mobile Android dedicada para ver los clips',
          'Acceso a Line-outs, Scrums y Salidas',
          'Reproductor con timeline navegable',
          'Histórico de todos los partidos del club',
        ],
      },
      {
        emoji: '🏟️',
        title: 'Dirigentes y clubes',
        desc:  'Visibilidad sobre el trabajo del cuerpo técnico. Modelo de pago por partido analizado — sin compromiso mensual.',
        items: [
          'Acceso solo-lectura desde el Mobile',
          'Pago por partido analizado, sin suscripción fija',
          'Sin infraestructura técnica requerida en el club',
          'Privacidad: el video original nunca sale de la PC',
        ],
      },
    ],
  },

  tecnologia: {
    tag: 'Stack',
    title: 'Tecnología',
    titleGreen: 'moderna',
    subtitle: 'Las mismas herramientas open-source que usan los equipos profesionales, integradas en un producto end-to-end.',
    items: [
      { icon: '🧠', name: 'YOLO v8',         role: 'Detección con IA' },
      { icon: '📹', name: 'OpenCV + ffmpeg', role: 'Procesamiento y compresión' },
      { icon: '🐍', name: 'Python',          role: 'Motor del análisis' },
      { icon: '⚡', name: 'Electron + React', role: 'App Desktop' },
      { icon: '📱', name: 'Kotlin + Compose', role: 'App Android' },
      { icon: '☁️', name: 'Supabase',         role: 'Auth, DB y Storage' },
    ],
  },

  descarga: {
    tag: 'Acceso anticipado',
    title: 'PEDÍ TU',
    titleGreen: 'ACCESO',
    desc: 'Apert Vision está en beta privada. Si entrenás o dirigís un club, dejanos tus datos y te contactamos para coordinar la prueba.',
    version: 'v0.2.0-MVP · BETA PRIVADA',
    appName: 'Apert Vision · Desktop + Mobile',
    meta:    'Desktop para Windows · App Android para el club',
    reqs: [
      'Windows 10 / 11 (64-bit) para el Desktop',
      'Android 8.0+ para el Mobile',
      'GPU NVIDIA recomendada (opcional)',
      'Conexión a internet al finalizar el análisis',
      'Pago por partido analizado · sin suscripción',
    ],
  },

  faq: {
    tag: 'FAQ',
    title: 'Preguntas',
    titleGreen: 'frecuentes',
    items: [
      { q: '¿Necesito una GPU para usar Apert Vision?',                a: 'No es obligatorio, pero sí muy recomendable. Con GPU NVIDIA el procesamiento tarda entre 5 y 10 minutos por partido. En CPU puede tardar entre 30 y 60 minutos.' },
      { q: '¿El video del partido se sube a la nube?',                  a: 'No, el video original nunca se sube. El análisis YOLO corre 100% en tu PC. Lo que sí se sube son los 3 clips comprimidos (line-outs, scrums, salidas) y las estadísticas, así el resto del club los puede ver desde el celular.' },
      { q: '¿Qué formatos de video acepta?',                            a: 'MP4, MOV, AVI y MKV. Cualquier resolución funciona; 1080p o 720p son ideales. Videos grabados con cámara fija desde el lateral del campo dan los mejores resultados.' },
      { q: '¿Cómo se reparten los códigos de acceso?',                  a: 'Cuando creás tu club, el sistema genera 3 códigos: uno para entrenadores, uno para dirigentes y uno para jugadores. Se los compartís por WhatsApp o email — al registrarse en la app Mobile el rol se asigna automáticamente.' },
      { q: '¿Cuánto cuesta por partido?',                               a: 'El modelo es de pago por uso — pagás por cada partido analizado, sin suscripción fija. Esto le permite a clubes con presupuesto ajustado usar el servicio solo cuando lo necesitan. Durante la beta privada el uso es gratuito.' },
      { q: '¿Para qué sirve la app Mobile?',                            a: 'Es la forma de que todo el club acceda a los clips: jugadores ven Line-outs, Scrums y Salidas para revisar jugadas; dirigentes pueden mirar el estado del análisis; entrenadores también la usan para ver clips fuera del entrenamiento.' },
    ],
  },
}
