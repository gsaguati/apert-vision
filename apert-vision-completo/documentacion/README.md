# Documentación del Proyecto — Apert Vision

Análisis de rugby amateur con inteligencia artificial · Escuela Da Vinci · Analista de Sistemas · 2026

---

## 📋 Índice de documentos

### Documentación técnica (según PL03 de la entrega)

| # | Documento | Archivo | Descripción |
|---|-----------|---------|-------------|
| 01 | Casos de uso | `01_casos_de_uso.docx` | Actores y casos de uso principales del sistema |
| 02 | Requisitos funcionales Web | `02_requisitos_funcionales_web.docx` | Especificación funcional de la app Desktop y la landing |
| 03 | Diseño de arquitectura | `03_diseno_arquitectura.docx` | Arquitectura general del sistema |
| 04 | DER | `04_DER.docx` | Modelo entidad-relación completo (incluye tablas de créditos y estadísticas) |
| 05 | Diagrama de componentes | `05_diagrama_componentes.docx` | Componentes del sistema y sus interfaces |
| 06 | Gantt | `06_gantt.xlsx` | Planificación del proyecto |
| 07 | Manual de usuario | `07_manual_usuario.docx` | Guía de uso para entrenadores, jugadores y dirigentes |
| 08 | Casos de prueba | `08_casos_de_prueba.docx` | 35 casos de prueba de aceptación (todos OK) |
| 09 | Requisitos funcionales APK | `09_requisitos_funcionales_apk.docx` | Especificación funcional de la app Mobile |
| 10 | UML | `10_UML.docx` | Diagramas de clases, secuencia y casos de uso |
| — | **PL03 Entrega Final** | `PL03_Entrega_Final.docx` | **Planilla oficial de entrega con todos los datos** |

### Business / Comercial

| Documento | Archivo | Descripción |
|-----------|---------|-------------|
| Business Model Canvas | `Canvas_Apert_Vision.docx` | Modelo de negocio según Osterwalder & Pigneur |
| Discurso oral de defensa | `speech_apert_vision.docx` | Guión para exposición del proyecto (4 min) |
| Pitch script del video final | `pitch_script_video_final.docx` | Script para el video de 5 min del examen |

### Setup y operación

| Documento | Archivo | Descripción |
|-----------|---------|-------------|
| Setup Mercado Pago | `MERCADO_PAGO_SETUP.md` | Guía paso a paso para configurar el sistema de pagos |
| Datos demo | `datos_demo_jugadores.sql` | SQL para poblar la app con jugadores de ejemplo |

### Resultados del entrenamiento de IA

Carpeta: `yolo_training_results/`

| Archivo | Descripción |
|---------|-------------|
| `results.png` | Métricas por epoch (loss, mAP, precision, recall) |
| `confusion_matrix.png` | Matriz de confusión entre las 3 clases |
| `BoxPR_curve.png` | Curva Precision-Recall |
| `BoxF1_curve.png` | Curva F1 score |
| `val_batch0_pred.jpg` | Ejemplo de predicciones del modelo sobre imágenes de validación |

---

## 🎯 Resumen del proyecto

**Apert Vision** es una plataforma de análisis de rugby amateur con inteligencia artificial, compuesta por 3 aplicaciones integradas:

- **App Desktop** (Electron + React) — usada por entrenadores para analizar partidos
- **App Mobile Android** (Kotlin + Compose) — usada por jugadores y dirigentes para ver clips y estadísticas
- **Landing web** (React + Vite) — sitio público de presentación

### Stack tecnológico

- **IA:** YOLOv8n reentrenado con 4024 imágenes propias — **97.8% mAP50**
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Desktop:** Electron 32 + React 18 + Vite 6
- **Mobile:** Kotlin 2.0 + Jetpack Compose Material 3
- **Análisis de video:** Python 3.12 + Ultralytics + OpenCV + ffmpeg
- **Pagos:** Mercado Pago Checkout Pro (sandbox y producción)

### Métricas destacadas del modelo YOLO (3 clases)

| Clase | Precisión | Recall | mAP50 |
|-------|-----------|--------|-------|
| Line-out | 94.6% | 93.0% | **98.1%** |
| Scrum | 90.1% | 97.1% | **96.8%** |
| Kickoff (Salida) | 92.5% | 93.5% | **98.5%** |
| **Promedio** | **92.4%** | **94.5%** | **97.8%** |

---

## 🔗 Enlaces

- **Repositorio:** https://github.com/gsaguati/apert-vision
- **Autor:** Gonzalo Saguati · gsaguati@gmail.com
