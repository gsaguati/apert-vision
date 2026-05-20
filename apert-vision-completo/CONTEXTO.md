# APERT VISION — Contexto completo del proyecto
> Para Claude Code: leé este archivo antes de arrancar. Tiene todo el contexto necesario.

---

## ¿Qué es Apert Vision?

Plataforma de análisis automático de partidos de rugby con inteligencia artificial, orientada a **clubes amateurs** que no tienen presupuesto para análisis profesionales.

El nombre viene de la posición de "apertura" en rugby — el jugador que organiza, analiza y toma decisiones.

**Alumno:** Gonzalo Saguati  
**Carrera:** Analista de Sistemas  
**Escuela:** Da Vinci  
**Año:** 2025  

---

## El problema que resuelve

- Los entrenadores amateurs analizan partidos manualmente (2-4 horas por partido)
- No tienen estadísticas precisas ni datos confiables
- Los jugadores no reciben feedback individual ni pueden ver sus jugadas
- Las herramientas profesionales (Hudl, Catapult) cuestan miles de dólares — inaccesibles para amateurs

---

## MVP — Lo que se está construyendo ahora

**App de escritorio (PyQt6)** que:
1. Carga un video de partido localmente (nunca se sube a un servidor)
2. El entrenador configura el color de camiseta de cada equipo
3. YOLO v8 analiza cada frame detectando formaciones
4. Se generan clips automáticos, estadísticas JSON y dashboard de posesión

### Métricas del MVP (las 4 confirmadas):
| Métrica | Descripción |
|---|---|
| **Line-Out** | Detecta cada line-out con minuto y confianza |
| **Scrum** | Identifica formaciones de scrum |
| **Salida / Kick-off** | Detecta kick-offs al inicio y tras tries |
| **Posesión de pelota** | Por color de camiseta — quién tiene la pelota en cada frame |

---

## Stack tecnológico

| Capa | Tecnología | Para qué |
|---|---|---|
| Detección IA | **YOLO v8 (Ultralytics)** | Detecta formaciones frame por frame |
| Procesamiento | **OpenCV** | Procesa frames, dibuja bounding boxes, genera video |
| Motor | **Python 3.10+** | Lenguaje principal del backend/desktop |
| App Desktop | **PyQt6** | Interfaz de escritorio (reemplazó Flask web para evitar problema de almacenamiento) |
| Base de datos | **Firebase (Firestore)** | Usuarios, partidos, jugadores, eventos, posesiones |
| Autenticación | **Auth0** | Roles: entrenador, jugador, staff médico, dirigente |
| Dataset / Anotación | **Roboflow** | Anotación de imágenes y exportación en formato YOLOv8 |

**GPU de entrenamiento:** RTX 2060 Super (~5-10 minutos por formación)

### ¿Por qué app desktop en lugar de web?
El profe señaló el problema de almacenamiento — un partido pesa 3-8 GB. La solución fue mover el procesamiento a desktop: el video nunca sale de la PC del club, YOLO corre en la GPU local, y solo se sincronizan al servidor los **clips cortos** de cada formación detectada (5-15 MB por clip) y el JSON de estadísticas.

---

## Dataset

### ¿Por qué dataset propio y no uno público?
- Los datasets públicos de rugby son de competencias profesionales (Premier League, Super Rugby) — cámaras de TV en estadios cerrados, condiciones muy distintas a una cancha amateur argentina
- Concepto técnico: **domain shift** — el modelo pierde precisión cuando el entorno de entrenamiento difiere del real
- El dataset fue construido con videos de partidos de la **liga local** que va a usar la app
- Esto es una **ventaja competitiva**: el modelo funciona exactamente en las condiciones reales

### Proporción del dataset: 70% positivos / 30% negativos
- **Positivos:** imágenes con la formación presente (clips propios de line-outs, scrums, salidas)
- **Negativos:** frames de partidos completos cada 10 segundos (para que el modelo aprenda cuándo NO hay formación)

### Flujo de entrenamiento:
1. `extract_frames.py` — extrae 1 frame cada 2 segundos de los clips
2. Roboflow — anotación manual con bounding boxes, etiqueta por clase
3. Exportar en formato YOLOv8 → `dataset/data.yaml`
4. `yolo detect train data=dataset/data.yaml model=yolov8n.pt epochs=50 imgsz=640`
5. Copiar `runs/detect/train/weights/best.pt` → `lineout_model/best.pt`

### Orden de entrenamiento (plan 21 días):
- **Días 1–7:** Line-out (dataset principal)
- **Días 7–13:** Scrum (re-entrenamiento con line-out + scrum)
- **Días 12–16:** Salida/kick-off (modelo final con 3 formaciones)
- **Días 16–21:** Posesión + integración + web + pruebas

---

## Arquitectura del sistema

```
App Desktop (PyQt6)
    ├── detector.py          → YOLO + OpenCV, detección de formaciones
    ├── possession_analyzer.py → análisis de posesión por color de camiseta
    └── extract_frames.py    → utilidad para armar el dataset

    ↓ sincroniza solo clips + JSON (no el video completo)

Servidor Flask (API REST)
    ├── POST /upload         → recibe clips y estadísticas
    ├── GET  /status/<id>    → estado del job
    └── GET  /static/...     → sirve resultados

    ↓

Firebase Firestore          → usuarios, partidos, eventos, posesiones
Auth0                       → autenticación y roles
App Android (Java)          → jugadores acceden a stats y highlights
```

---

## Código Python existente

### `extract_frames.py`
Extrae frames de videos para armar el dataset. Dos modos:
- `extract_frames()` — un solo video
- `extract_multiple_videos()` — procesa toda una carpeta

### `detector.py`
Motor principal de detección. Función clave: `detect_formations(video_path, output_path, progress_callback)`
- Carga el modelo YOLO desde `lineout_model/best.pt`
- Analiza frame por frame
- Dibuja bounding boxes con OpenCV
- Anti-duplicados: gap mínimo de 5 segundos entre eventos del mismo tipo
- Genera video anotado + JSON de estadísticas

### `possession_analyzer.py` (a construir)
- Detecta la pelota en cada frame
- Identifica al jugador más cercano
- Compara color de camiseta con colores configurados por el entrenador
- Asigna posesión a local o visitante

---

## Landing page (React + Vite)

**Ruta:** `landing/apert-vision/`

### Levantar:
```bash
cd landing/apert-vision
npm install
npm run dev
# Abre en http://localhost:5173
```

### Tecnologías del landing:
- **React 18 + Vite**
- **GSAP** — animaciones de entrada y ScrollTrigger en sección Flujo
- **Barlow Condensed** — tipografía display (estilo editorial como veo.com)
- **Fondo:** cancha de rugby como textura (`src/assets/cancha.png`) con overlay 93% negro
- **Cursor:** pelota de rugby personalizada (`src/assets/pelota.png`)

### Estructura de componentes:
```
src/
├── App.jsx                    ← raíz, ensambla todo
├── main.jsx                   ← punto de entrada
├── data/content.js            ← TODO el contenido editable del sitio
├── styles/global.css          ← variables CSS, animaciones, responsive
├── hooks/
│   ├── useInView.js           ← animaciones al scrollear
│   ├── useScrolled.js         ← navbar scrolled state
│   └── useLocalStorage.js     ← persiste cambios del panel de gestión
├── assets/
│   ├── cancha.png             ← cancha de rugby (fondo del sitio)
│   └── pelota.png             ← pelota de rugby (cursor custom)
└── components/
    ├── ui/
    │   ├── Button.jsx         ← BtnPrimary y BtnSecondary (pill-shaped)
    │   ├── SectionTag.jsx     ← etiqueta verde con línea decorativa
    │   └── SectionTitle.jsx   ← título con parte en verde
    ├── Navbar.jsx             ← pill flotante + hamburguesa mobile
    ├── HeroVersionB.jsx       ← hero con cancha SVG en mockup + GSAP
    ├── Problema.jsx           ← 4 cards + cita del entrenador
    ├── Solucion.jsx           ← métricas 4-grid + features 3-grid
    ├── Flujo.jsx              ← pasos con números gigantes + GSAP ScrollTrigger
    ├── Audiencia.jsx          ← 3 cards: entrenadores, jugadores, clubes
    ├── Tecnologia.jsx         ← 6 tecnologías en grid
    ├── Descarga.jsx           ← sección de descarga de la app
    ├── Faq.jsx                ← acordeón estilo editorial
    ├── Footer.jsx
    └── GestionPanel.jsx       ← panel lateral para editar contenido en tiempo real
```

### Paleta de colores:
```css
--negro:     #040506
--negro2:    #0a0d0a
--negro3:    #111511
--negro4:    #181e18
--verde:     #00e676
--verde2:    #00c853
--verde3:    #009e45
--blanco:    #f0f4f0
--gris:      #6a8070
```

---

## Documentación entregada

| Archivo | Contenido |
|---|---|
| `01_casos_de_uso.docx` | CU-01 al CU-06: subir video, ver resultados, login, configurar colores, posesión, estadísticas jugador |
| `02_requisitos_funcionales_web.docx` | 18 RF con ID, descripción y prioridad |
| `03_diseno_arquitectura.docx` | Capas del sistema, flujo de procesamiento, endpoints REST |
| `04_DER.docx` | 7 entidades: Usuario, Club, Jugador, Partido, Evento, Posesion, Estadistica |
| `05_diagrama_componentes.docx` | Módulos del sistema y dependencias |
| `06_gantt.xlsx` | Plan 21 días (pre-entrega) + roadmap 16 semanas completo |
| `speech_apert_vision.docx` | Speech de 5 minutos para presentación oral, con preguntas frecuentes |

### Diagramas para Lucidchart / draw.io:
- `DER_drawio.xml` — DER estilo Chen (óvalos, rectángulos, rombos) para importar en draw.io o Lucidchart
- `DER_lucidchart.csv` — versión CSV para Lucidchart
- `Componentes_drawio.xml` — diagrama de componentes para draw.io
- `Componentes_lucidchart.csv` — versión CSV para Lucidchart

---

## Modelo de negocio

- **Pago por partido** — no suscripción mensual. El club paga solo cuando analiza un partido
- **Validado** con entrevista a Gustavo (55 años, 20 años de experiencia como entrenador): confirmó que pagaría si funciona
- **Mercado inicial:** liga local donde se entrenó el modelo — ya tienen el contexto y los datos
- **Segundo mercado:** jugadores que quieren datos para negociar su lugar en el equipo

### Ventaja competitiva clave:
El modelo fue entrenado con videos de la **propia liga** que va a usar la app. Ningún competidor puede replicar eso. Dataset propio = modelo que funciona en tu cancha, con tu luz, con tus camisetas.

---

## Competencia

| Competidor | Limitación |
|---|---|
| Rugby Analytics | Solo carga manual, sin IA, sin análisis en tiempo real |
| Hudl / Catapult | Profesionales, miles de dólares, no accesibles para amateurs |

**Apert Vision es el único** que combina: análisis automático con IA + precio accesible para amateurs + procesamiento local (sin subir el video) + dataset entrenado con la liga propia.

---

## Próximos pasos (después del MVP)

1. Sumar más formaciones al detector
2. Dashboard avanzado: mapas de calor, timeline completo
3. Perfiles individuales de jugadores con estadísticas
4. App Android para jugadores (estadísticas y highlights desde el celular)
5. Deploy del servidor Flask + Firebase en producción

---

## Comandos útiles

```bash
# Extraer frames para el dataset
python extract_frames.py partido.mp4

# Entrenar YOLO (con GPU)
yolo detect train data=dataset/data.yaml model=yolov8n.pt epochs=50 imgsz=640

# Levantar el landing
cd landing/apert-vision && npm install && npm run dev

# Instalar dependencias Python
pip install ultralytics opencv-python flask --break-system-packages
```
