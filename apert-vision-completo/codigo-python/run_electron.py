#!/usr/bin/env python3
"""
run_electron.py — Bridge entre Electron y el motor YOLO.
Emite JSON lines a stdout para que Electron los lea via IPC.

Tipos de mensaje:
  {"type": "progress",  "current": N, "total": N, "pct": N}
  {"type": "event",     "event_type": "lineout", "label": "Line-out", ...}
  {"type": "clip_progress", "event_type": "lineout", "done": N, "total": N}
  {"type": "finished",  "total_events": N, "event_counts": {...}, "clips": {...}, ...}
  {"type": "error",     "message": "..."}
"""
import sys, json, argparse, time, os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))


def emit(msg: dict):
    print(json.dumps(msg, ensure_ascii=False), flush=True)


# ── Constantes ────────────────────────────────────────────────────────────────
CLASS_ALIASES = {
    "apert-vision-lines-out": "lineout",
    "lines-out": "lineout", "line-out": "lineout", "lineout": "lineout",
    "scrum": "scrum", "kickoff": "kickoff", "salida": "kickoff", "salida-22": "kickoff",
}
CLASS_LABELS = {"lineout": "Line-out", "scrum": "Scrum", "kickoff": "Salida 22"}
CLASS_COLORS_BGR = {
    "lineout": (80, 224, 57),
    "scrum":   (246, 130, 59),
    "kickoff": (11, 158, 245),
}
MIN_GAP    = 8.0   # segundos mínimos entre detecciones del mismo tipo
FRAME_SKIP = 3     # analizar 1 de cada N frames (velocidad)
CLIP_SECS  = 10    # segundos alrededor de cada evento para los clips


# ── Extracción de clips por tipo ──────────────────────────────────────────────
def extract_clips(video_path: str, events: list, output_dir: str, fps: float,
                  width: int, height: int) -> dict:
    """
    Para cada tipo de formación, genera un video con todos los clips concatenados.
    Devuelve {"lineout": "path.mp4", "scrum": "path.mp4", "kickoff": "path.mp4"}
    """
    import cv2

    by_type: dict[str, list] = {}
    for ev in events:
        by_type.setdefault(ev["event_type"], []).append(ev)

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    half_frames = int(CLIP_SECS / 2 * fps)
    clips = {}

    type_names = {"lineout": "lineouts", "scrum": "scrums", "kickoff": "salidas"}

    for event_type, evs in by_type.items():
        if not evs:
            continue
        name = type_names.get(event_type, event_type)
        out_path = str(Path(output_dir) / f"{name}.mp4")
        out = cv2.VideoWriter(out_path, fourcc, fps, (width, height))

        cap = cv2.VideoCapture(video_path)
        total_evs = len(evs)

        for idx, ev in enumerate(evs):
            emit({"type": "clip_progress", "event_type": event_type,
                  "label": CLASS_LABELS.get(event_type, event_type),
                  "done": idx, "total": total_evs})

            center = ev["frame"]
            start  = max(0, center - half_frames)
            end    = center + half_frames

            cap.set(cv2.CAP_PROP_POS_FRAMES, start)
            frame_pos = start
            while frame_pos < end:
                ret, frame = cap.read()
                if not ret:
                    break
                frame_pos += 1

                # Overlay con info del evento
                color_bgr = CLASS_COLORS_BGR.get(event_type, (180, 180, 180))
                label_txt = f"{ev['label']} - {ev['time_str']}  {ev['confidence']:.0%}"
                (tw, th), _ = cv2.getTextSize(label_txt, cv2.FONT_HERSHEY_SIMPLEX, 0.65, 2)
                cv2.rectangle(frame, (10, 10), (tw + 20, th + 24), (0, 0, 0), -1)
                cv2.putText(frame, label_txt, (14, th + 14),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.65, color_bgr, 2, cv2.LINE_AA)
                # Número de clip
                clip_lbl = f"Clip {idx + 1}/{total_evs}"
                cv2.putText(frame, clip_lbl, (14, th + 36),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.45, (180, 180, 180), 1, cv2.LINE_AA)
                out.write(frame)

        cap.release()
        out.release()
        clips[event_type] = out_path
        emit({"type": "clip_progress", "event_type": event_type,
              "label": CLASS_LABELS.get(event_type, event_type),
              "done": total_evs, "total": total_evs})

    return clips


# ── Análisis principal ────────────────────────────────────────────────────────
def run(video_path: str, output_path: str, conf: float, mode: str):
    try:
        import cv2
    except ImportError:
        emit({"type": "error", "message": "OpenCV no instalado: pip install opencv-python"})
        sys.exit(1)
    try:
        from ultralytics import YOLO
    except ImportError:
        emit({"type": "error", "message": "Ultralytics no instalado: pip install ultralytics"})
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

    fps    = cap.get(cv2.CAP_PROP_FPS) or 25.0
    total  = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 1
    width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out    = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    device = "cpu"
    try:
        import torch
        if torch.cuda.is_available():
            device = "0"
    except ImportError:
        pass

    events, last_seen, last_boxes = [], {}, []
    frame_n = 0
    t_start = time.time()

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frame_n += 1
            second = frame_n / fps

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

            for (x1, y1, x2, y2, color, lbl) in last_boxes:
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                (tw, th), _ = cv2.getTextSize(lbl, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 1)
                cv2.rectangle(frame, (x1, y1 - th - 8), (x1 + tw + 6, y1), color, -1)
                cv2.putText(frame, lbl, (x1 + 3, y1 - 3),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.55, (8, 12, 20), 1, cv2.LINE_AA)
            out.write(frame)

            if frame_n % 10 == 0:
                # 0-80% para el análisis, 80-100% para clips
                pct = int(frame_n / total * 80)
                emit({"type": "progress", "current": frame_n, "total": total, "pct": pct})
    finally:
        cap.release()
        out.release()

    # ── Extraer clips ─────────────────────────────────────────────────────────
    clips = {}
    if events:
        output_dir = str(Path(output_path).parent)
        emit({"type": "progress", "current": total, "total": total, "pct": 82})
        clips = extract_clips(video_path, events, output_dir, fps, width, height)
        emit({"type": "progress", "current": total, "total": total, "pct": 98})

    # ── Stats finales ─────────────────────────────────────────────────────────
    counts = {}
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
        "clips":               clips,
        "events": [
            {k: v for k, v in ev.items() if k != "type"}
            for ev in events
        ],
    })


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--video",  required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--conf",   type=float, default=0.4)
    parser.add_argument("--mode",   default="detection")
    args = parser.parse_args()
    run(args.video, args.output, args.conf, args.mode)
