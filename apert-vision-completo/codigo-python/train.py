import sys
print("Iniciando entrenamiento...", flush=True)

from pathlib import Path
print("Importando YOLO...", flush=True)

from ultralytics import YOLO
print("YOLO importado OK", flush=True)

DATA_YAML = Path(__file__).parent / "dataset" / "data.yaml"
OUTPUT    = Path(__file__).parent / "runs"

print(f"Dataset: {DATA_YAML}", flush=True)
print(f"Existe data.yaml: {DATA_YAML.exists()}", flush=True)

if not DATA_YAML.exists():
    print("ERROR: No se encontro data.yaml en dataset/", flush=True)
    sys.exit(1)

print("Cargando modelo base yolov8n.pt...", flush=True)
model = YOLO("yolov8n.pt")
print("Modelo base listo. Comenzando entrenamiento...", flush=True)

model.train(
    data=str(DATA_YAML),
    epochs=50,
    imgsz=512,
    batch=4,
    workers=0,
    project=str(OUTPUT),
    name="apert-vision",
    exist_ok=True,
)

print("Entrenamiento terminado. Copiando best.pt...", flush=True)

best = OUTPUT / "apert-vision" / "weights" / "best.pt"
dest = Path(__file__).parent / "dataset" / "best.pt"

import shutil
shutil.copy(best, dest)
print(f"Modelo guardado en: {dest}", flush=True)
