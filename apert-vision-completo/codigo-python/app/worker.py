import cv2
import time
import json
import numpy as np
from pathlib import Path

from PyQt6.QtCore import QThread, pyqtSignal

CLASS_CONFIG = {
    "lineout": {"color": (0, 200, 80),   "label": "Line-Out"},
    "scrum":   {"color": (0, 160, 255),  "label": "Scrum"},
    "kickoff": {"color": (255, 160, 0),  "label": "Salida"},
}

# Normaliza nombres de clase del modelo al tipo canónico usado en CLASS_CONFIG
CLASS_ALIASES = {
    "apert-vision-lines-out": "lineout",
    "lines-out":               "lineout",
    "line-out":                "lineout",
    "lineout":                 "lineout",
    "scrum":                   "scrum",
    "kickoff":                 "kickoff",
}
DEFAULT_CFG = {"color": (200, 200, 200), "label": "Detección"}
MIN_GAP     = 15.0
MASK_ALPHA  = 0.40
FRAME_SKIP  = 3   # inferencia cada N frames (~3x más rápido)


def _get_device():
    """Retorna (device, half) usando GPU si está disponible."""
    try:
        import torch
        if torch.cuda.is_available():
            return "0", True
    except ImportError:
        pass
    return "cpu", False


def _draw_boxes(frame, boxes):
    """Redibuja la última lista de cajas conocidas sobre el frame."""
    for (x1, y1, x2, y2, color, lbl) in boxes:
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        (lw, lh), _ = cv2.getTextSize(lbl, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)
        cv2.rectangle(frame, (x1, y1 - lh - 10), (x1 + lw + 8, y1), color, -1)
        cv2.putText(frame, lbl, (x1 + 4, y1 - 4),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 1, cv2.LINE_AA)


class DetectionWorker(QThread):
    progress    = pyqtSignal(int, int)
    frame_ready = pyqtSignal(object)
    event_found = pyqtSignal(dict)
    finished    = pyqtSignal(dict)
    error       = pyqtSignal(str)

    def __init__(self, model_path: str, video_path: str, output_path: str,
                 conf: float, parent=None):
        super().__init__(parent)
        self.model_path  = model_path
        self.video_path  = video_path
        self.output_path = output_path
        self.conf        = conf
        self._stop       = False

    def stop(self):
        self._stop = True

    def run(self):
        try:
            from ultralytics import YOLO
        except ImportError:
            self.error.emit("ultralytics no está instalado.\nEjecutá: pip install ultralytics")
            return

        if not Path(self.model_path).exists():
            self.error.emit(f"Modelo no encontrado:\n{self.model_path}")
            return

        try:
            model = YOLO(str(self.model_path))
        except Exception as e:
            self.error.emit(f"Error al cargar el modelo:\n{e}")
            return

        device, half = _get_device()

        cap = cv2.VideoCapture(self.video_path)
        if not cap.isOpened():
            self.error.emit(f"No se pudo abrir el video:\n{self.video_path}")
            return

        fps    = cap.get(cv2.CAP_PROP_FPS) or 25
        width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total  = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out    = cv2.VideoWriter(self.output_path, fourcc, fps, (width, height))

        events     = []
        last_seen  = {}
        last_boxes = []   # cajas de la última inferencia (para frames saltados)
        frame_n    = 0
        t_start    = time.time()

        while not self._stop:
            ret, frame = cap.read()
            if not ret:
                break

            frame_n += 1
            second   = frame_n / fps

            if frame_n % FRAME_SKIP == 0:
                results    = model(frame, conf=self.conf, verbose=False,
                                   device=device, half=half)[0]
                last_boxes = []

                for box in results.boxes:
                    conf_val   = float(box.conf[0])
                    raw_name   = model.names[int(box.cls[0])]
                    class_name = CLASS_ALIASES.get(raw_name.lower(), raw_name.lower())
                    cfg        = CLASS_CONFIG.get(class_name, DEFAULT_CFG)
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    lbl = f"{cfg['label']} {conf_val:.0%}"
                    last_boxes.append((x1, y1, x2, y2, cfg["color"], lbl))

                    if second - last_seen.get(class_name, -MIN_GAP - 1) >= MIN_GAP:
                        last_seen[class_name] = second
                        mins, secs = int(second // 60), int(second % 60)
                        ev = {
                            "type":       class_name,
                            "label":      cfg["label"],
                            "frame":      frame_n,
                            "second":     round(second, 2),
                            "time_str":   f"{mins:02d}:{secs:02d}",
                            "confidence": round(conf_val, 3),
                            "bbox":       [x1, y1, x2, y2],
                            "mode":       "detection",
                        }
                        events.append(ev)
                        self.event_found.emit(ev)

            # Siempre dibuja las últimas cajas conocidas (video fluido)
            _draw_boxes(frame, last_boxes)
            _draw_overlays(frame, events, frame_n, fps, width, height)
            out.write(frame)

            if frame_n % 5  == 0: self.frame_ready.emit(frame.copy())
            if frame_n % 10 == 0: self.progress.emit(frame_n, total)

        cap.release()
        out.release()
        self.finished.emit(_build_stats(events, total, frame_n, fps, time.time() - t_start, self.output_path))


class SegmentationWorker(QThread):
    progress    = pyqtSignal(int, int)
    frame_ready = pyqtSignal(object)
    event_found = pyqtSignal(dict)
    finished    = pyqtSignal(dict)
    error       = pyqtSignal(str)

    def __init__(self, model_path: str, video_path: str, output_path: str,
                 conf: float, parent=None):
        super().__init__(parent)
        self.model_path  = model_path
        self.video_path  = video_path
        self.output_path = output_path
        self.conf        = conf
        self._stop       = False

    def stop(self):
        self._stop = True

    def run(self):
        try:
            from ultralytics import YOLO
        except ImportError:
            self.error.emit("ultralytics no está instalado.\nEjecutá: pip install ultralytics")
            return

        if not Path(self.model_path).exists():
            self.error.emit(f"Modelo no encontrado:\n{self.model_path}")
            return

        try:
            model = YOLO(str(self.model_path))
        except Exception as e:
            self.error.emit(f"Error al cargar el modelo:\n{e}")
            return

        device, half = _get_device()

        cap = cv2.VideoCapture(self.video_path)
        if not cap.isOpened():
            self.error.emit(f"No se pudo abrir el video:\n{self.video_path}")
            return

        fps    = cap.get(cv2.CAP_PROP_FPS) or 25
        width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total  = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out    = cv2.VideoWriter(self.output_path, fourcc, fps, (width, height))

        events     = []
        last_seen  = {}
        last_boxes = []   # cajas fallback cuando no hay inferencia
        frame_n    = 0
        t_start    = time.time()

        while not self._stop:
            ret, frame = cap.read()
            if not ret:
                break

            frame_n += 1
            second  = frame_n / fps

            if frame_n % FRAME_SKIP == 0:
                results    = model(frame, conf=self.conf, verbose=False,
                                   device=device, half=half)[0]
                overlay    = frame.copy()
                boxes_data = results.boxes
                masks_data = getattr(results, "masks", None)
                last_boxes = []

                for i, box in enumerate(boxes_data):
                    conf_val   = float(box.conf[0])
                    raw_name   = model.names[int(box.cls[0])]
                    class_name = CLASS_ALIASES.get(raw_name.lower(), raw_name.lower())
                    cfg        = CLASS_CONFIG.get(class_name, DEFAULT_CFG)
                    color      = cfg["color"]
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    lbl = f"{cfg['label']} {conf_val:.0%}"
                    last_boxes.append((x1, y1, x2, y2, color, lbl))

                    if masks_data is not None and i < len(masks_data.data):
                        mask_raw     = masks_data.data[i].cpu().numpy()
                        mask_resized = cv2.resize(mask_raw, (width, height))
                        mask_bool    = mask_resized > 0.5
                        overlay[mask_bool] = (
                            overlay[mask_bool] * (1 - MASK_ALPHA)
                            + np.array(color, dtype=np.float32) * MASK_ALPHA
                        ).astype(np.uint8)
                        contours, _ = cv2.findContours(
                            mask_bool.astype(np.uint8),
                            cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                        cv2.drawContours(overlay, contours, -1, color, 2)
                    else:
                        cv2.rectangle(overlay, (x1, y1), (x2, y2), color, 2)

                    if second - last_seen.get(class_name, -MIN_GAP - 1) >= MIN_GAP:
                        last_seen[class_name] = second
                        mins, secs = int(second // 60), int(second % 60)
                        ev = {
                            "type":       class_name,
                            "label":      cfg["label"],
                            "frame":      frame_n,
                            "second":     round(second, 2),
                            "time_str":   f"{mins:02d}:{secs:02d}",
                            "confidence": round(conf_val, 3),
                            "bbox":       [x1, y1, x2, y2],
                            "mode":       "segmentation",
                        }
                        events.append(ev)
                        self.event_found.emit(ev)

                frame = overlay
            else:
                # Frame saltado: repintar últimas cajas sin segmentación
                _draw_boxes(frame, last_boxes)

            _draw_overlays(frame, events, frame_n, fps, width, height)
            out.write(frame)

            if frame_n % 5  == 0: self.frame_ready.emit(frame.copy())
            if frame_n % 10 == 0: self.progress.emit(frame_n, total)

        cap.release()
        out.release()
        self.finished.emit(_build_stats(events, total, frame_n, fps, time.time() - t_start, self.output_path))


# ── helpers ───────────────────────────────────────────────────────────────────

def _draw_overlays(frame, events, frame_n, fps, width, height):
    second = frame_n / fps
    mins_t, secs_t = int(second // 60), int(second % 60)
    cv2.putText(frame, f"{mins_t:02d}:{secs_t:02d}", (10, height - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2, cv2.LINE_AA)

    lo_count = sum(1 for e in events if e["type"] == "lineout")
    if lo_count > 0:
        ct = f"Line-Outs: {lo_count}"
        (cw, ch), _ = cv2.getTextSize(ct, cv2.FONT_HERSHEY_SIMPLEX, 0.65, 2)
        cv2.rectangle(frame, (width - cw - 20, 8), (width - 8, ch + 16), (0, 0, 0), -1)
        cv2.putText(frame, ct, (width - cw - 14, ch + 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 200, 80), 2, cv2.LINE_AA)


def _build_stats(events, total, frame_n, fps, elapsed, output_path):
    counts = {}
    for e in events:
        counts[e["type"]] = counts.get(e["type"], 0) + 1

    stats = {
        "total_frames":        total,
        "processed_frames":    frame_n,
        "video_duration_sec":  round(total / fps, 1) if fps else 0,
        "processing_time_sec": round(elapsed, 1),
        "event_counts":        counts,
        "total_events":        len(events),
        "events":              events,
        "output_path":         output_path,
    }

    json_path = output_path.replace(".mp4", "_stats.json")
    try:
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(stats, f, indent=2, ensure_ascii=False)
    except Exception:
        pass

    return stats
