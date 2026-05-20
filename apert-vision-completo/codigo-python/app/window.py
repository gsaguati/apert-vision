import sys
from pathlib import Path

import cv2
from PyQt6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QProgressBar, QTableWidget, QTableWidgetItem, QSlider, QSplitter,
    QFrame, QSizePolicy, QHeaderView, QGroupBox, QScrollArea, QMessageBox,
    QRadioButton, QButtonGroup,
)
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QImage, QPixmap, QFont, QColor

from app.styles import C_BG, C_SURFACE, C_BORDER, C_GREEN, C_GREEN2, C_TEXT, C_MUTED, C_ORANGE, C_BLUE
from app.widgets import StatCard, FilePicker
from app.worker import DetectionWorker, SegmentationWorker

MODEL_PATH = Path(__file__).parent.parent / "dataset" / "best.pt"


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Apert Vision — Detección de Formaciones")
        self.setMinimumSize(1100, 720)
        self.worker = None
        self._build_ui()
        self._auto_set_output()

    # ── UI ────────────────────────────────────────────────────────────────────

    def _build_ui(self):
        central = QWidget()
        self.setCentralWidget(central)
        root = QHBoxLayout(central)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)

        root.addWidget(self._make_sidebar())

        splitter = QSplitter(Qt.Orientation.Horizontal)
        splitter.setStyleSheet("QSplitter::handle { background-color: #1a2530; width: 1px; }")
        splitter.addWidget(self._make_preview())
        splitter.addWidget(self._make_results())
        splitter.setSizes([640, 360])
        root.addWidget(splitter, 1)

    def _make_sidebar(self) -> QWidget:
        panel = QWidget()
        panel.setFixedWidth(280)
        panel.setStyleSheet(f"background-color: {C_SURFACE}; border-right: 1px solid {C_BORDER};")

        lay = QVBoxLayout(panel)
        lay.setContentsMargins(18, 20, 18, 20)
        lay.setSpacing(16)

        title = QLabel("APERT\nVISION")
        title.setObjectName("title")
        title.setAlignment(Qt.AlignmentFlag.AlignLeft)
        sub = QLabel("DETECCIÓN DE FORMACIONES")
        sub.setObjectName("subtitle")
        lay.addWidget(title)
        lay.addWidget(sub)

        sep = QFrame()
        sep.setObjectName("divider")
        sep.setFrameShape(QFrame.Shape.HLine)
        lay.addWidget(sep)

        # Estado del modelo (solo informativo, no editable)
        model_ok = MODEL_PATH.exists()
        model_color = C_GREEN if model_ok else "#ef5350"
        model_icon  = "●" if model_ok else "✕"
        model_text  = "Modelo cargado" if model_ok else "Modelo no encontrado"
        model_lbl   = QLabel(f"{model_icon}  {model_text}")
        model_lbl.setStyleSheet(
            f"color: {model_color}; font-size: 11px; font-weight: 600; padding: 4px 0;")
        lay.addWidget(model_lbl)

        sep2 = QFrame()
        sep2.setObjectName("divider")
        sep2.setFrameShape(QFrame.Shape.HLine)
        lay.addWidget(sep2)

        # Video entrada
        g_video = QGroupBox("Video de entrada")
        gv_lay  = QVBoxLayout(g_video)
        gv_lay.setSpacing(8)
        self.video_picker = FilePicker("Buscar", "Seleccioná el video…",
                                       "Video (*.mp4 *.avi *.mov *.mkv)")
        self.video_picker.edit.textChanged.connect(self._auto_set_output)
        gv_lay.addWidget(self.video_picker)
        lay.addWidget(g_video)

        # Video salida
        g_out  = QGroupBox("Video de salida")
        go_lay = QVBoxLayout(g_out)
        go_lay.setSpacing(8)
        self.output_picker = FilePicker("Guardar", "Ruta del video anotado…",
                                        "Video (*.mp4)", save_mode=True)
        go_lay.addWidget(self.output_picker)
        lay.addWidget(g_out)

        # Configuración
        g_cfg  = QGroupBox("Configuración")
        gc_lay = QVBoxLayout(g_cfg)
        gc_lay.setSpacing(10)

        # Confianza
        conf_row = QHBoxLayout()
        conf_lbl = QLabel("Confianza mínima:")
        conf_lbl.setStyleSheet(f"color: {C_TEXT}; font-size: 12px;")
        self.conf_val_lbl = QLabel("40%")
        self.conf_val_lbl.setStyleSheet(f"color: {C_GREEN}; font-weight: 700; min-width: 36px;")
        conf_row.addWidget(conf_lbl)
        conf_row.addStretch()
        conf_row.addWidget(self.conf_val_lbl)
        gc_lay.addLayout(conf_row)

        self.conf_slider = QSlider(Qt.Orientation.Horizontal)
        self.conf_slider.setRange(10, 90)
        self.conf_slider.setValue(40)
        self.conf_slider.valueChanged.connect(lambda v: self.conf_val_lbl.setText(f"{v}%"))
        gc_lay.addWidget(self.conf_slider)

        # Modo: detección / segmentación
        mode_lbl = QLabel("Modo de análisis:")
        mode_lbl.setStyleSheet(f"color: {C_TEXT}; font-size: 12px; margin-top: 4px;")
        gc_lay.addWidget(mode_lbl)

        mode_row = QHBoxLayout()
        self.rb_detect = QRadioButton("Detección")
        self.rb_seg    = QRadioButton("Segmentación")
        self.rb_detect.setChecked(True)
        self._mode_group = QButtonGroup()
        self._mode_group.addButton(self.rb_detect, 0)
        self._mode_group.addButton(self.rb_seg,    1)
        mode_row.addWidget(self.rb_detect)
        mode_row.addWidget(self.rb_seg)
        gc_lay.addLayout(mode_row)

        lay.addWidget(g_cfg)
        lay.addStretch()

        # Botones
        self.run_btn = QPushButton("▶  PROCESAR VIDEO")
        self.run_btn.setFixedHeight(44)
        self.run_btn.setStyleSheet(
            f"background-color: {C_GREEN}; color: #000000; font-weight: 700;")
        self.run_btn.clicked.connect(self._toggle_processing)
        lay.addWidget(self.run_btn)

        self.open_btn = QPushButton("Abrir video resultante")
        self.open_btn.setObjectName("secondary")
        self.open_btn.setEnabled(False)
        self.open_btn.clicked.connect(self._open_output)
        lay.addWidget(self.open_btn)

        return panel

    def _make_preview(self) -> QWidget:
        panel = QWidget()
        lay   = QVBoxLayout(panel)
        lay.setContentsMargins(16, 16, 8, 16)
        lay.setSpacing(10)

        hdr = QLabel("PREVIEW")
        hdr.setStyleSheet(f"font-size: 10px; color: {C_MUTED}; letter-spacing: 2px;")
        lay.addWidget(hdr)

        self.preview_lbl = QLabel("Cargá un video y\npresioná PROCESAR VIDEO")
        self.preview_lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.preview_lbl.setStyleSheet(
            f"background-color: {C_SURFACE}; border: 1px solid {C_BORDER};"
            f"border-radius: 8px; color: {C_MUTED}; font-size: 14px;"
        )
        self.preview_lbl.setSizePolicy(
            QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
        lay.addWidget(self.preview_lbl, 1)

        progress_row = QHBoxLayout()
        self.progress_lbl = QLabel("—")
        self.progress_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 11px;")
        self.progress_bar = QProgressBar()
        self.progress_bar.setValue(0)
        self.progress_bar.setFixedHeight(8)
        self.progress_bar.setTextVisible(False)
        progress_row.addWidget(self.progress_lbl)
        progress_row.addWidget(self.progress_bar, 1)
        lay.addLayout(progress_row)

        stats_row = QHBoxLayout()
        stats_row.setSpacing(8)
        self.card_lineouts = StatCard("0", "Line-Outs", C_GREEN)
        self.card_scrums   = StatCard("0", "Scrums",    C_BLUE)
        self.card_kickoffs = StatCard("0", "Salidas",   C_ORANGE)
        self.card_total    = StatCard("0", "Total",     C_TEXT)
        for c in (self.card_lineouts, self.card_scrums, self.card_kickoffs, self.card_total):
            stats_row.addWidget(c)
        lay.addLayout(stats_row)

        return panel

    def _make_results(self) -> QWidget:
        panel = QWidget()
        lay   = QVBoxLayout(panel)
        lay.setContentsMargins(8, 16, 16, 16)
        lay.setSpacing(10)

        hdr = QLabel("EVENTOS DETECTADOS")
        hdr.setStyleSheet(f"font-size: 10px; color: {C_MUTED}; letter-spacing: 2px;")
        lay.addWidget(hdr)

        self.table = QTableWidget(0, 4)
        self.table.setHorizontalHeaderLabels(["Tipo", "Min.", "Conf.", "Frame"])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        self.table.verticalHeader().setVisible(False)
        self.table.setEditTriggers(QTableWidget.EditTrigger.NoEditTriggers)
        self.table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        lay.addWidget(self.table, 1)

        self.status_lbl = QLabel("Listo para procesar.")
        self.status_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 11px;")
        self.status_lbl.setWordWrap(True)
        lay.addWidget(self.status_lbl)

        return panel

    # ── lógica ────────────────────────────────────────────────────────────────

    def _auto_set_output(self):
        vp = self.video_picker.path()
        if vp:
            p   = Path(vp)
            out = str(p.parent / (p.stem + "_detected.mp4"))
            self.output_picker.set_path(out)

    def _toggle_processing(self):
        if self.worker and self.worker.isRunning():
            self._stop_processing()
        else:
            self._start_processing()

    def _start_processing(self):
        model_path  = str(MODEL_PATH)
        video_path  = self.video_picker.path()
        output_path = self.output_picker.path()

        if not MODEL_PATH.exists():
            self._show_error(
                f"Modelo no encontrado en:\n{MODEL_PATH}\n\n"
                "Copiá el archivo best.pt dentro de la carpeta dataset/")
            return
        if not video_path:
            self._show_error("Seleccioná un video de entrada.")
            return
        if not output_path:
            self._show_error("Especificá dónde guardar el video de salida.")
            return
        if not Path(video_path).exists():
            self._show_error(f"El video no existe:\n{video_path}")
            return

        conf      = self.conf_slider.value() / 100.0
        use_seg   = self.rb_seg.isChecked()
        WorkerCls = SegmentationWorker if use_seg else DetectionWorker
        mode_name = "Segmentación" if use_seg else "Detección"

        self.table.setRowCount(0)
        self._update_cards(0, 0, 0)
        self.progress_bar.setValue(0)
        self.open_btn.setEnabled(False)
        self.preview_lbl.setText("")
        self.run_btn.setText("⏹  DETENER")
        self.run_btn.setStyleSheet(
            f"background-color: #c62828; color: {C_TEXT}; font-weight: 700;")
        self.status_lbl.setText(f"Procesando… [{mode_name}]")

        self.worker = WorkerCls(model_path, video_path, output_path, conf)
        self.worker.progress.connect(self._on_progress)
        self.worker.frame_ready.connect(self._on_frame)
        self.worker.event_found.connect(self._on_event)
        self.worker.finished.connect(self._on_finished)
        self.worker.error.connect(self._on_error)
        self.worker.start()

    def _stop_processing(self):
        if self.worker:
            self.worker.stop()
            self.status_lbl.setText("Deteniendo…")

    def _on_progress(self, current: int, total: int):
        pct = int(current / total * 100) if total else 0
        self.progress_bar.setValue(pct)
        self.progress_lbl.setText(f"{pct}%  ({current}/{total})")

    def _on_frame(self, frame):
        h, w = frame.shape[:2]
        rgb  = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        img  = QImage(rgb.data, w, h, 3 * w, QImage.Format.Format_RGB888)
        pix  = QPixmap.fromImage(img)
        self.preview_lbl.setPixmap(
            pix.scaled(self.preview_lbl.size(),
                       Qt.AspectRatioMode.KeepAspectRatio,
                       Qt.TransformationMode.SmoothTransformation))

    def _on_event(self, ev: dict):
        row = self.table.rowCount()
        self.table.insertRow(row)

        color_map = {"lineout": C_GREEN, "scrum": C_BLUE, "kickoff": C_ORANGE}
        c         = color_map.get(ev["type"], C_TEXT)

        type_item = QTableWidgetItem(ev["label"])
        type_item.setData(Qt.ItemDataRole.UserRole, ev["type"])
        type_item.setForeground(QColor(c))
        type_item.setFont(QFont("Segoe UI", 12, QFont.Weight.Bold))

        self.table.setItem(row, 0, type_item)
        self.table.setItem(row, 1, QTableWidgetItem(ev["time_str"]))
        self.table.setItem(row, 2, QTableWidgetItem(f"{ev['confidence']:.0%}"))
        self.table.setItem(row, 3, QTableWidgetItem(str(ev["frame"])))
        self.table.scrollToBottom()

        self._update_cards_from_table()

    def _update_cards_from_table(self):
        counts = {"lineout": 0, "scrum": 0, "kickoff": 0}
        for row in range(self.table.rowCount()):
            t = self.table.item(row, 0)
            if t:
                key = t.data(Qt.ItemDataRole.UserRole)
                if key in counts:
                    counts[key] += 1
        self._update_cards(counts["lineout"], counts["scrum"], counts["kickoff"])

    def _update_cards(self, lo: int, sc: int, ko: int):
        self.card_lineouts.update_value(str(lo))
        self.card_scrums.update_value(str(sc))
        self.card_kickoffs.update_value(str(ko))
        self.card_total.update_value(str(lo + sc + ko))

    def _on_finished(self, stats: dict):
        self._reset_run_button()
        self.progress_bar.setValue(100)
        self.open_btn.setEnabled(True)
        elapsed = stats.get("processing_time_sec", 0)
        total   = stats.get("total_events", 0)
        out     = stats.get("output_path", "")
        self.status_lbl.setText(
            f"Listo en {elapsed:.0f}s — {total} eventos detectados.\n"
            f"Video: {Path(out).name}"
        )
        self.status_lbl.setStyleSheet(f"color: {C_GREEN}; font-size: 11px;")

    def _on_error(self, msg: str):
        self._reset_run_button()
        self._show_error(msg)
        self.status_lbl.setText("Error.")
        self.status_lbl.setStyleSheet("color: #ef5350; font-size: 11px;")

    def _reset_run_button(self):
        self.run_btn.setText("▶  PROCESAR VIDEO")
        self.run_btn.setStyleSheet(
            f"background-color: {C_GREEN}; color: #000000; font-weight: 700;")
        self.worker = None

    def _open_output(self):
        import os
        path = self.output_picker.path()
        if path and Path(path).exists():
            os.startfile(path)

    def _show_error(self, msg: str):
        dlg = QMessageBox(self)
        dlg.setWindowTitle("Error")
        dlg.setText(msg)
        dlg.setIcon(QMessageBox.Icon.Warning)
        dlg.exec()
