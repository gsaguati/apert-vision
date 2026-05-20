"""
CLI: python -m core.segmentor <video_entrada> [video_salida]
Segmentación por píxel de formaciones usando un modelo YOLOv8-seg.
Si el modelo no tiene cabeza de segmentación, usa bounding boxes como fallback.
"""

import cv2
import time
import json
import numpy as np
from pathlib import Path

MODEL_PATH     = "models/best_seg.pt"
CONF_THRESHOLD = 0.40
MASK_ALPHA     = 0.40

CLASS_CONFIG = {
    "apert-vision-lines-out": {"color": (0, 200, 80), "label": "Line-Out"},
    "lineout":                {"color": (0, 200, 80), "label": "Line-Out"},
    "scrum":                  {"color": (0, 160, 255), "label": "Scrum"},
    "kickoff":                {"color": (255, 160, 0), "label": "Salida"},
}
DEFAULT_CONFIG  = {"color": (200, 200, 200), "label": "Detección"}
MIN_GAP_SECONDS = 5.0


def segment_formations(video_path: str, output_path: str,
                       model_path: str = MODEL_PATH,
                       conf: float = CONF_THRESHOLD,
                       progress_callback=None) -> dict:
    """
    Procesa un video aplicando segmentación semántica por instancia.
    Genera máscaras de color translúcidas sobre cada formación detectada.

    Args:
        video_path:        ruta al video de entrada
        output_path:       ruta del video de salida anotado
        model_path:        ruta al modelo YOLOv8-seg (.pt)
        conf:              umbral de confianza mínima [0-1]
        progress_callback: función opcional(frame_actual, total_frames)

    Returns:
        dict con estadísticas de segmentación
    """
    from ultralytics import YOLO

    mp = Path(model_path)
    if not mp.exists():
        raise FileNotFoundError(
            f"Modelo no encontrado: {model_path}\n"
            "Entrenás con 'task=segment' en Ultralytics y guardás best.pt en models/"
        )

    model = YOLO(str(mp))

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"No se puede abrir el video: {video_path}")

    fps    = cap.get(cv2.CAP_PROP_FPS) or 25
    width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total  = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out    = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    events      = []
    last_seen   = {}
    frame_count = 0
    start_time  = time.time()

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        second  = frame_count / fps
        results = model(frame, conf=conf, verbose=False)[0]

        overlay    = frame.copy()
        boxes_data = results.boxes
        masks_data = getattr(results, "masks", None)

        for i, box in enumerate(boxes_data):
            conf_val   = float(box.conf[0])
            class_name = model.names[int(box.cls[0])]
            cfg        = CLASS_CONFIG.get(class_name.lower(), DEFAULT_CONFIG)
            color      = cfg["color"]
            x1, y1, x2, y2 = map(int, box.xyxy[0])

            if masks_data is not None and i < len(masks_data.data):
                mask_raw     = masks_data.data[i].cpu().numpy()
                mask_resized = cv2.resize(mask_raw, (width, height))
                mask_bool    = mask_resized > 0.5

                # Relleno translúcido con el color de la clase
                overlay[mask_bool] = (
                    overlay[mask_bool] * (1 - MASK_ALPHA)
                    + np.array(color, dtype=np.float32) * MASK_ALPHA
                ).astype(np.uint8)

                # Contorno nítido
                contours, _ = cv2.findContours(
                    mask_bool.astype(np.uint8),
                    cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                cv2.drawContours(overlay, contours, -1, color, 2)
            else:
                cv2.rectangle(overlay, (x1, y1), (x2, y2), color, 2)

            label = f"{cfg['label']} {conf_val:.0%}"
            (lw, lh), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)
            cv2.rectangle(overlay, (x1, y1 - lh - 10), (x1 + lw + 8, y1), color, -1)
            cv2.putText(overlay, label, (x1 + 4, y1 - 4),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 1, cv2.LINE_AA)

            if second - last_seen.get(class_name, -MIN_GAP_SECONDS - 1) >= MIN_GAP_SECONDS:
                last_seen[class_name] = second
                mins, secs = int(second // 60), int(second % 60)
                events.append({
                    "type": class_name, "label": cfg["label"],
                    "frame": frame_count, "second": round(second, 2),
                    "time_str": f"{mins:02d}:{secs:02d}",
                    "confidence": round(conf_val, 3),
                    "bbox": [x1, y1, x2, y2], "mode": "segmentation",
                    "has_mask": masks_data is not None,
                })

        frame = overlay
        mins_t, secs_t = int(second // 60), int(second % 60)
        cv2.putText(frame, f"{mins_t:02d}:{secs_t:02d}", (10, height - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2, cv2.LINE_AA)
        out.write(frame)

        if progress_callback and frame_count % 30 == 0:
            progress_callback(frame_count, total)

    cap.release()
    out.release()

    elapsed = time.time() - start_time
    counts  = {}
    for e in events:
        counts[e["type"]] = counts.get(e["type"], 0) + 1

    stats = {
        "total_frames": total, "processed_frames": frame_count,
        "video_duration_sec": round(total / fps, 1),
        "processing_time_sec": round(elapsed, 1),
        "event_counts": counts, "total_events": len(events),
        "events": events, "output_path": output_path, "mode": "segmentation",
    }

    json_path = output_path.replace(".mp4", "_stats.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)

    print(f"[OK] Segmentación completada en {elapsed:.1f}s")
    for k, v in counts.items():
        print(f"     {k}: {v}")
    return stats


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Uso: python -m core.segmentor <video> [salida.mp4]")
        sys.exit(1)
    video_in  = sys.argv[1]
    video_out = sys.argv[2] if len(sys.argv) > 2 else video_in.replace(".mp4", "_segmented.mp4")

    def _progress(c, t):
        print(f"\r  {c/t*100:.0f}% ({c}/{t})", end="")

    result = segment_formations(video_in, video_out, progress_callback=_progress)
    print(f"\n✓ Video: {video_out}  |  Eventos: {result['total_events']}")
