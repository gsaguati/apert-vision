# Código Python — Apert Vision

## Instalación

```bash
# Crear entorno virtual
python -m venv venv

# Activar (Windows)
venv\Scripts\activate

# Activar (Mac/Linux)
source venv/bin/activate

# Instalar con soporte GPU (recomendado — RTX 2060 Super)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
pip install -r requirements.txt
```

## Scripts

### `extract_frames.py`
Extrae frames de videos para armar el dataset de entrenamiento.
```bash
python extract_frames.py
# Editá las rutas en el __main__ del archivo
```

### `detector.py`
Motor de detección. Procesa un video y genera estadísticas.
```bash
python detector.py partido.mp4
# Genera partido_detected.mp4 y partido_stats.json
```

## Entrenamiento del modelo

### 1. Armar el dataset
- Extraer frames con `extract_frames.py` (cada 2s para positivos, cada 10s para negativos)
- Subir a Roboflow (roboflow.com)
- Anotar con bounding boxes: clases `lineout`, `scrum`, `kickoff`
- Exportar en formato YOLOv8 → descomprimir en `dataset/`

### 2. Entrenar
```bash
yolo detect train data=dataset/data.yaml model=yolov8n.pt epochs=50 imgsz=640
```

### 3. Usar el modelo
```bash
mkdir lineout_model
cp runs/detect/train/weights/best.pt lineout_model/best.pt
```

## Verificar GPU
```bash
python -c "import torch; print('GPU disponible:', torch.cuda.is_available())"
```
