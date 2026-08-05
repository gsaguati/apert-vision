# Apert Vision

Plataforma de análisis de rugby amateur con inteligencia artificial. Detecta line-outs, scrums y salidas automáticamente usando YOLOv8, genera clips por tipo y estadísticas por jugador. Tres apps (Desktop para entrenadores, Mobile para jugadores/dirigentes, Landing público) sobre un backend en Supabase e integración de pagos con Mercado Pago.

**Autor:** Gonzalo Saguati — Escuela Da Vinci, Analista de Sistemas.

---

## Estructura del repositorio

```
apert-vision-completo/
├── app/               → Desktop (Electron + React + Vite + TS)
├── mobile/            → Android (Kotlin + Jetpack Compose)
├── landing/           → Landing web (React + Vite)
├── codigo-python/     → Motor de análisis (Python + YOLOv8 + OpenCV)
└── supabase/          → Migraciones SQL + Edge Functions (Deno)
```

---

## Requisitos previos

| Componente | Versión mínima |
|---|---|
| Node.js  | 20 LTS |
| Python   | 3.12 |
| Android Studio | Ladybug (2024.2) o superior |
| JDK      | 17 |
| GPU NVIDIA (recomendado) | CUDA 12.1+ |

---

## Setup rápido en otra máquina

### 1. Clonar el repo

```bash
git clone https://github.com/gsaguati/apert-vision.git
cd apert-vision
```

### 2. Desktop App (Electron)

```bash
cd apert-vision-completo/app
npm install
npm run dev          # arranca Vite en http://localhost:5173
# en otra terminal:
npm run electron     # abre la ventana de Electron
```

El archivo `.env` con las credenciales de Supabase ya viene commiteado (son claves publishable/anon, seguras por diseño — la seguridad va por RLS).

### 3. Landing Web

```bash
cd apert-vision-completo/landing/apert-vision
npm install
npm run dev          # http://localhost:5174
```

### 4. Mobile App (Android)

```bash
cd apert-vision-completo/mobile
cp local.properties.example local.properties
# Editá local.properties y cambiá sdk.dir por la ruta a tu Android SDK
```

Después, abrí la carpeta `mobile/` en Android Studio, esperá a que Gradle sincronice y corré la app en un emulador o dispositivo con Android 8.0+ (API 26).

Para generar un APK release firmado:
```bash
./gradlew assembleRelease
```

### 5. Motor Python (análisis con YOLO)

```bash
cd apert-vision-completo/codigo-python
python -m venv .venv312
# Windows:
.venv312\Scripts\activate
# macOS/Linux:
source .venv312/bin/activate

# Con GPU NVIDIA (recomendado):
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
pip install -r requirements.txt
```

El modelo entrenado (`dataset/best.pt`, 6 MB) está incluido en el repo — no hace falta reentrenar.

### 6. Backend Supabase

Las migraciones SQL están en `apert-vision-completo/supabase/migrations/`. Para replicar el proyecto en tu propia instancia de Supabase:

1. Creá un proyecto nuevo en [supabase.com](https://supabase.com).
2. Aplicá las migraciones en orden desde el SQL Editor.
3. Deployá las Edge Functions:
   ```bash
   supabase functions deploy crear-preferencia-pago
   supabase functions deploy webhook-mp --no-verify-jwt
   ```
4. Configurá los secrets de Edge Functions (`MP_ACCESS_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`) desde el dashboard.
5. Reemplazá `SUPABASE_URL` y `SUPABASE_KEY` en `app/.env` y `mobile/local.properties` con las de tu proyecto.

Si vas a usar la instancia de Supabase ya existente (la que trae el repo por defecto), este paso no es necesario.

---

## Qué NO se sube al repo (y cómo se resuelve)

| Archivo/carpeta | Por qué está ignorado | Cómo se recupera |
|---|---|---|
| `node_modules/` | Muy pesado (>500 MB) | `npm install` en cada app |
| `.venv312/` (Python) | Ligado a tu SO/arquitectura | `python -m venv .venv312` |
| `mobile/local.properties` | Contiene tu path local del SDK | Copiar `local.properties.example` |
| `dataset/train/` y `dataset/valid/` | Miles de imágenes (varios GB) | Solo si querés reentrenar — se descargan de Roboflow |
| Videos MP4 originales | Muy pesados | Los usa el entrenador desde su PC — nunca suben al repo |
| Modelos base `yolov8n.pt`, `yolo26n.pt` | Se re-descargan automáticamente | Ultralytics los baja al primer run |
| `runs/` (logs de entrenamiento) | Solo útiles para debug del training | — |

---

## Documentación técnica

La documentación completa (Casos de Uso, Casos de Prueba, DER, UML, Manual de Usuario, Diseño de Arquitectura, Requisitos Funcionales) se entrega por separado (no versionada en el repo por decisión de entrega académica).

---

## Contacto / Soporte

- Email: `soporte@apertvision.com`
- WhatsApp: `+54 9 11 0000 0000`

---

## Stack técnico

- **Desktop:** Electron 32 · React 18 · Vite 6 · TypeScript
- **Mobile:** Kotlin 2.0 · Jetpack Compose Material 3 · Supabase Kotlin SDK 3.0
- **Landing:** React 18 · Vite 6 · Tailwind (paleta Apert)
- **Backend:** Supabase (Auth · PostgreSQL 15 · Storage · Realtime · Edge Functions Deno)
- **IA:** Python 3.12 · Ultralytics 8.4 · YOLOv8n reentrenado (mAP50 = 97.8%)
- **Pagos:** Mercado Pago Checkout Pro (sandbox)
