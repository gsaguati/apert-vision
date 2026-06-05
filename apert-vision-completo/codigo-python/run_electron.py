#!/usr/bin/env python3
"""
run_electron.py — Bridge entre Electron y el motor de detección YOLO.

Recibe: --video <path> --output <path> --conf <float> --mode <detection|segmentation>
Emite:  líneas JSON por stdout que Electron lee vía IPC:
  {"type": "progress",  "current": N, "total": N, "pct": N}
  {"type": "event",     "event_type": "lineout", "label": "Line-out", ...}
  {"type": "finished",  "total_events": N, "event_counts": {...}, ...}
  {"type": "error",     "message": "..."}
"""
import sys
import json
import argparse
import time
from pathlib import Path

# Asegura que los imports del proyecto funcionen
sys.path.insert(0, str(Path(__file__).parent))


def emit(msg: dict):
    """Escribe un objeto JSON a stdout y hace flush inmediato."""
    print(json.dumps(msg, ensure_ascii=False), flush=True)


CLASS_ALIASES = {
    "apert-vision-lines-out": "lineout",
    "lines-out":               "lineout",
    "line-out":                "lineout",
    "lineout":                 "lineout",
    "scrum":                   "scrum",
    "kickoff":                 "kickoff",
    "salida":                  "kickoff",
    "salida-22":               "kickoff",
}
CLASS_LABELS = {
    "lineout": "Line-out",
    "scrum":   "Scrum",
    "kickoff": "Salida 22",
}
CLASS_COLORS_BGR = {
    "lineout": (80, 224, 57),    # verde #39e07a
    "scrum":   (246, 130, 59),   # azul  #3b82f6
    "kickoff": (11,  158, 245),  # ámbar #f59e0b
}
MIN_GAP    = 15.0   # segundos mínimos entre detecciones del mismo tipo
FRAME_SKIP = 3      # analizar 1 de cada N frames (velocidad)


def run(video_path: str, output_path: str, conf: float, mode: str):
    try:
        import cv2
    except ImportError:
        emit({"type": "error", "message": "OpenCV no está instalado: pip install opencv-python"})
        sys.exit(1)

    try:
        from ultralytics import YOLO
    except ImportError:
        emit({"type": "error", "message": "Ultralytics no está instalado: pip install ultralytics"})
        sys.exit(1)

    model_path = Path(__file__).parent / "dataset" / "best.pt"
    if not model_path.exists():
        emit({"type": "error", "message": f"Modelo no encontrado: {model_path}"})
        sys.exit(1)

    try:
        model = YOLO(str(model_path))
    except Exception as e:
        emit({"type": "error", "message": f"Error cargando modelo: {e}"})
        sys.exit(1)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        emit({"type": "error", "message": f"No se puede abrir el video: {video_path}"})
        sys.exit(1)

    fps    = cap.get(cv2.CAP_PROP_FPS)   or 25.0
    total  = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 1
    width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out    = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    # Detectar GPU
    device = "cpu"
    try:
        import torch
        if torch.cuda.is_available():
            device = "0"
    except ImportError:
        pass

    events     = []
    last_seen  = {}
    last_boxes = []
    frame_n    = 0
    t_start    = time.time()

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            frame_n += 1
            second = frame_n / fps

            # Inferencia cada FRAME_SKIP frames
            if frame_n % FRAME_SKIP == 0:
                results    = model(frame, conf=conf, verbose=False, device=device)[0]
                last_boxes = []

                for box in results.boxes:
                    conf_val   = float(box.conf[0])
                    raw_name   = model.names[int(box.cls[0])].lower()
                    class_name = CLASS_ALIASES.get(raw_name, raw_name)
                    color      = CLASS_COLORS_BGR.get(class_name, (180, 180, 180))
                    label_text = f"{CLASS_LABELS.get(class_name, class_name)} {conf_val:.0%}"
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    last_boxes.append((x1, y1, x2, y2, color, label_text))

                    # Emitir evento si pasaron MIN_GAP segundos
                    if second - last_seen.get(class_name, -MIN_GAP - 1) >= MIN_GAP:
                        last_seen[class_name] = second
                        mins, secs = int(second // 60), int(second % 60)
                        ev = {
                            "type":       "event",
                            "event_type": class_name,
                            "label":      CLASS_LABELS.get(class_name, class_name),
                            "frame":      frame_n,
                            "second":     round(second, 2),
                            "time_str":   f"{mins:02d}:{secs:02d}",
                            "confidence": round(conf_val, 3),
                        }
                        events.append(ev)
                        emit(ev)

            # Dibujar cajas en el frame
            for (x1, y1, x2, y2, color, lbl) in last_boxes:
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                (tw, th), _ = cv2.getTextSize(lbl, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 1)
                cv2.rectangle(frame, (x1, y1 - th - 8), (x1 + tw + 6, y1), color, -1)
                cv2.putText(frame, lbl, (x1 + 3, y1 - 3),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.55, (8, 12, 20), 1, cv2.LINE_AA)

            out.write(frame)

            # Emitir progreso cada 10 frames
            if frame_n % 10 == 0:
                pct = int(frame_n / total * 100)
                emit({"type": "progress", "current": frame_n, "total": total, "pct": pct})

    finally:
        cap.release()
        out.release()

    # Stats finales
    counts  = {}
    for ev in events:
        counts[ev["event_type"]] = counts.get(ev["event_type"], 0) + 1

    elapsed = time.time() - t_start
    emit({
        "type":                "finished",
        "total_events":        len(events),
        "event_counts":        counts,
        "video_duration_sec":  round(total / fps, 1),
        "processing_time_sec": round(elapsed, 1),
        "output_path":         output_path,
        "events":              [
            {k: v for k, v in ev.items() if k != "type"}
            for ev in events
        ],
    })


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Apert Vision — YOLO bridge for Electron")
    parser.add_argument("--video",  required=True,        help="Ruta del video de entrada")
    parser.add_argument("--output", required=True,        help="Ruta del video de salida anotado")
    parser.add_argument("--conf",   type=float, default=0.4, help="Umbral de confianza (0.1-0.9)")
    parser.add_argument("--mode",   default="detection",  help="detection | segmentation")
    args = parser.parse_args()
    run(args.video, args.output, args.conf, args.mode)
