"""
Combina los 3 datasets exportados de Roboflow (lineouts, scrums, salidas)
en un solo dataset con 3 clases, listo para entrenar YOLOv8.

- Remapea class_id: lineouts->0, scrums->1, kickoffs->2
- Prefija los nombres para evitar colisiones
- Rebalancea scrums: mueve el 15% de train a valid (venía con 1 sola imagen)
"""
import shutil
import random
from pathlib import Path

random.seed(42)

# ── Config ────────────────────────────────────────────────────────────────
SOURCE_ROOT = Path(r"D:\partido\scrums\detec")
DEST        = Path(__file__).resolve().parent / "dataset"

DATASETS = [
    ("lineout", "lineouts_extracted", 0),
    ("scrum",   "scrums_extracted",   1),
    ("kickoff", "salidas_extracted",  2),
]

# Fracción de scrums que movemos de train -> valid (viene con solo 1 valid)
SCRUM_TO_VALID_PCT = 0.15


# ── Prepara carpetas destino ──────────────────────────────────────────────
# Respalda el modelo viejo (entrenado con 1 clase) antes de sobrescribir
OLD_BEST = DEST / "best.pt"
BACKUP   = DEST.parent / "models" / "best_lineouts_only.pt"
if OLD_BEST.exists():
    BACKUP.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(OLD_BEST, BACKUP)
    print(f"[OK] Respaldado modelo viejo -> {BACKUP}")

if DEST.exists():
    print(f"[!] {DEST} ya existe — borrando para regenerar limpio")
    shutil.rmtree(DEST)

for split in ("train", "valid"):
    (DEST / split / "images").mkdir(parents=True, exist_ok=True)
    (DEST / split / "labels").mkdir(parents=True, exist_ok=True)

print(f"[OK] Creadas carpetas en {DEST}")


# ── Helper: procesa una imagen + su label, remapeando class_id ────────────
def procesar_par(img_src: Path, lbl_src: Path, img_dst: Path, lbl_dst: Path, new_class_id: int):
    shutil.copy2(img_src, img_dst)
    if lbl_src.exists():
        lineas_nuevas = []
        for linea in lbl_src.read_text().strip().splitlines():
            partes = linea.split()
            if len(partes) < 5:
                continue
            partes[0] = str(new_class_id)  # remapear clase
            lineas_nuevas.append(" ".join(partes))
        lbl_dst.write_text("\n".join(lineas_nuevas) + "\n")
    else:
        # Imagen sin label = background (yolo lo acepta como negativo)
        lbl_dst.write_text("")


# ── Procesar cada dataset ─────────────────────────────────────────────────
totales = {"train": {0: 0, 1: 0, 2: 0}, "valid": {0: 0, 1: 0, 2: 0}}

for prefix, folder, class_id in DATASETS:
    src = SOURCE_ROOT / folder
    print(f"\n[+] Procesando {prefix} (class_id={class_id}) desde {folder}")

    # Colectar todas las imágenes train y valid
    train_imgs = sorted((src / "train" / "images").glob("*.*")) if (src / "train" / "images").exists() else []
    valid_imgs = sorted((src / "valid" / "images").glob("*.*")) if (src / "valid" / "images").exists() else []
    # Algunos exports usan "val" en vez de "valid"
    if not valid_imgs and (src / "val" / "images").exists():
        valid_imgs = sorted((src / "val" / "images").glob("*.*"))

    print(f"    encontradas {len(train_imgs)} train + {len(valid_imgs)} valid")

    # Rebalance especial para scrums: mover 15% de train -> valid
    if prefix == "scrum" and len(train_imgs) > 100 and len(valid_imgs) < 100:
        n_move = int(len(train_imgs) * SCRUM_TO_VALID_PCT)
        random.shuffle(train_imgs)
        to_move = train_imgs[:n_move]
        train_imgs = train_imgs[n_move:]
        valid_imgs = list(valid_imgs) + to_move
        print(f"    rebalance: movidas {n_move} imágenes de train -> valid")

    # Copiar train
    for img_src in train_imgs:
        lbl_src = img_src.parent.parent / "labels" / (img_src.stem + ".txt")
        new_name = f"{prefix}_{img_src.name}"
        img_dst = DEST / "train" / "images" / new_name
        lbl_dst = DEST / "train" / "labels" / (Path(new_name).stem + ".txt")
        procesar_par(img_src, lbl_src, img_dst, lbl_dst, class_id)
        totales["train"][class_id] += 1

    # Copiar valid
    for img_src in valid_imgs:
        lbl_src = img_src.parent.parent / "labels" / (img_src.stem + ".txt")
        new_name = f"{prefix}_{img_src.name}"
        img_dst = DEST / "valid" / "images" / new_name
        lbl_dst = DEST / "valid" / "labels" / (Path(new_name).stem + ".txt")
        procesar_par(img_src, lbl_src, img_dst, lbl_dst, class_id)
        totales["valid"][class_id] += 1


# ── Escribir data.yaml combinado ──────────────────────────────────────────
yaml_content = f"""# Dataset combinado Apert Vision — generado por combinar_dataset.py
path: {DEST.as_posix()}
train: train/images
val:   valid/images

nc: 3
names:
  0: lineout
  1: scrum
  2: kickoff
"""
(DEST / "data.yaml").write_text(yaml_content)


# ── Resumen ───────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("RESUMEN DEL DATASET COMBINADO")
print("=" * 60)
print(f"Ubicación: {DEST}")
print()
print(f"{'Clase':<12} {'ID':<4} {'Train':<10} {'Valid':<10} {'Total':<10}")
print("-" * 46)
for name, folder, cid in DATASETS:
    tr = totales["train"][cid]
    va = totales["valid"][cid]
    print(f"{name:<12} {cid:<4} {tr:<10} {va:<10} {tr+va:<10}")
print("-" * 46)
train_total = sum(totales["train"].values())
valid_total = sum(totales["valid"].values())
print(f"{'TOTAL':<12} {'':4} {train_total:<10} {valid_total:<10} {train_total+valid_total:<10}")
print()
print("[OK] Listo — data.yaml generado. Ahora podés entrenar:")
print(f"    yolo train model=yolov8n.pt data={DEST / 'data.yaml'} epochs=100 imgsz=640 batch=8")
