import csv
import os
from pathlib import Path

import cv2
from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QProgressBar, QTableWidget, QTableWidgetItem, QSlider, QSplitter,
    QFrame, QSizePolicy, QHeaderView, QGroupBox, QMessageBox,
    QRadioButton, QButtonGroup, QFileDialog, QTabWidget,
)
from PyQt6.QtCore import Qt, pyqtSignal, QTimer
from PyQt6.QtGui import QImage, QPixmap, QFont, QColor, QPainter, QBrush, QPen

from app.styles import (
    C_BG, C_SURFACE, C_SURFACE2, C_BORDER, C_BORDER2,
    C_GREEN, C_GREEN2, C_TEXT, C_MUTED, C_MUTED2, C_ORANGE, C_BLUE, C_RED,
)
from app.widgets import (
    StatCard, FilePicker, TeamColorPicker,
    VideoInfoBar, TimelineWidget, DetectionLogWidget,
)
from app.worker import DetectionWorker, SegmentationWorker

MODEL_PATH = Path(__file__).parent.parent.parent / "dataset" / "best.pt"


# ── Possession bar ─────────────────────────────────────────────────────────────

class PossessionWidget(QWidget):
    def __init__(self):
        super().__init__()
        self._pct_a = 0.5
        self._color_a = C_GREEN
        self._color_b = C_BLUE
        self._name_a  = "Local"
        self._name_b  = "Visitante"
        self._build()

    def _build(self):
        lay = QVBoxLayout(self)
        lay.setContentsMargins(16, 16, 16, 16)
        lay.setSpacing(10)

        title = QLabel("POSESIÓN DEL BALÓN")
        title.setStyleSheet(
            f"color: {C_MUTED}; font-size: 9px; letter-spacing: 2px;")
        lay.addWidget(title)

        # Row nombres + %
        self._names_row = QHBoxLayout()
        self._name_a_lbl = QLabel(self._name_a)
        self._name_a_lbl.setFont(QFont("Segoe UI", 13, QFont.Weight.Bold))
        self._name_a_lbl.setStyleSheet(f"color: {self._color_a};")

        self._pct_a_lbl = QLabel("50%")
        self._pct_a_lbl.setFont(QFont("Segoe UI", 13, QFont.Weight.Bold))
        self._pct_a_lbl.setStyleSheet(f"color: {self._color_a};")

        self._name_b_lbl = QLabel(self._name_b)
        self._name_b_lbl.setFont(QFont("Segoe UI", 13, QFont.Weight.Bold))
        self._name_b_lbl.setStyleSheet(f"color: {self._color_b};")
        self._name_b_lbl.setAlignment(Qt.AlignmentFlag.AlignRight)

        self._pct_b_lbl = QLabel("50%")
        self._pct_b_lbl.setFont(QFont("Segoe UI", 13, QFont.Weight.Bold))
        self._pct_b_lbl.setStyleSheet(f"color: {self._color_b};")
        self._pct_b_lbl.setAlignment(Qt.AlignmentFlag.AlignRight)

        self._names_row.addWidget(self._pct_a_lbl)
        self._names_row.addWidget(self._name_a_lbl)
        self._names_row.addStretch()
        self._names_row.addWidget(self._name_b_lbl)
        self._names_row.addWidget(self._pct_b_lbl)
        lay.addLayout(self._names_row)

        self._bar = _PossessionBar()
        self._bar.setFixedHeight(18)
        lay.addWidget(self._bar)

        hint = QLabel(
            "La posesión se calcula comparando el color de camiseta\n"
            "configurado con los jugadores detectados cerca del balón."
        )
        hint.setStyleSheet(f"color: {C_MUTED2}; font-size: 10px;")
        hint.setAlignment(Qt.AlignmentFlag.AlignCenter)
        lay.addWidget(hint)
        lay.addStretch()

        # Tabla por minutos (simulada)
        min_title = QLabel("EVOLUCIÓN POR TIEMPO")
        min_title.setStyleSheet(
            f"color: {C_MUTED}; font-size: 9px; letter-spacing: 2px;")
        lay.addWidget(min_title)

        self._min_widget = QWidget()
        self._min_widget.setMinimumHeight(80)
        self._min_widget.setSizePolicy(
            QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
        lay.addWidget(self._min_widget, 1)

        note = QLabel(
            "ℹ️  Para activar el análisis de posesión automático,\n"
            "configurá los colores de camiseta antes de procesar."
        )
        note.setStyleSheet(
            f"color: {C_MUTED}; font-size: 11px;"
            f"background-color: {C_SURFACE2}; border: 1px solid {C_BORDER};"
            f"border-radius: 6px; padding: 8px 12px;"
        )
        note.setWordWrap(True)
        lay.addWidget(note)

    def set_teams(self, name_a: str, name_b: str, color_a: str, color_b: str):
        self._name_a = name_a or "Local"
        self._name_b = name_b or "Visitante"
        self._color_a = color_a
        self._color_b = color_b
        self._name_a_lbl.setText(self._name_a)
        self._name_a_lbl.setStyleSheet(f"color: {color_a}; font-weight: 700;")
        self._name_b_lbl.setText(self._name_b)
        self._name_b_lbl.setStyleSheet(f"color: {color_b}; font-weight: 700;")
        self._pct_a_lbl.setStyleSheet(f"color: {color_a}; font-weight: 700; font-size: 13px;")
        self._pct_b_lbl.setStyleSheet(f"color: {color_b}; font-weight: 700; font-size: 13px;")
        self._bar.set_colors(color_a, color_b)

    def update_possession(self, pct_a: float):
        self._pct_a = pct_a
        self._pct_a_lbl.setText(f"{pct_a:.0%}")
        self._pct_b_lbl.setText(f"{1-pct_a:.0%}")
        self._bar.set_pct(pct_a)


class _PossessionBar(QWidget):
    def __init__(self):
        super().__init__()
        self._pct   = 0.5
        self._col_a = C_GREEN
        self._col_b = C_BLUE

    def set_pct(self, pct: float):
        self._pct = max(0.0, min(1.0, pct))
        self.update()

    def set_colors(self, a: str, b: str):
        self._col_a = a
        self._col_b = b
        self.update()

    def paintEvent(self, _):
        p = QPainter(self)
        p.setRenderHint(QPainter.RenderHint.Antialiasing)
        W, H = self.width(), self.height()
        r    = H // 2
        split = int(W * self._pct)
        p.setPen(Qt.PenStyle.NoPen)
        p.setBrush(QBrush(QColor(self._col_a)))
        p.drawRoundedRect(0, 0, split, H, r, r)
        p.setBrush(QBrush(QColor(self._col_b)))
        p.drawRoundedRect(split, 0, W - split, H, r, r)
        # divider
        p.setBrush(QBrush(QColor(C_BG)))
        p.drawRect(split - 1, 0, 2, H)
        p.end()


# ── Clips panel ────────────────────────────────────────────────────────────────

class ClipsPanel(QWidget):
    def __init__(self):
        super().__init__()
        lay = QVBoxLayout(self)
        lay.setContentsMargins(16, 16, 16, 16)
        lay.setSpacing(14)

        title = QLabel("CLIPS GENERADOS")
        title.setStyleSheet(
            f"color: {C_MUTED}; font-size: 9px; letter-spacing: 2px;")
        lay.addWidget(title)

        self._clips_lay = QVBoxLayout()
        self._clips_lay.setSpacing(8)
        lay.addLayout(self._clips_lay)
        lay.addStretch()

        self._empty_lbl = QLabel(
            "Los clips aparecerán acá una vez\nque el análisis esté completo."
        )
        self._empty_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 12px;")
        self._empty_lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
        lay.addWidget(self._empty_lbl)

        note = QLabel(
            "ℹ️  Cada evento detectado genera un clip de ±5 segundos "
            "alrededor del momento. Los clips se guardan junto al video de salida."
        )
        note.setStyleSheet(
            f"color: {C_MUTED}; font-size: 11px;"
            f"background-color: {C_SURFACE2}; border: 1px solid {C_BORDER};"
            f"border-radius: 6px; padding: 8px 12px;"
        )
        note.setWordWrap(True)
        lay.addWidget(note)

    def clear(self):
        while self._clips_lay.count():
            item = self._clips_lay.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
        self._empty_lbl.setVisible(True)

    def add_clip(self, ev: dict, output_dir: str):
        self._empty_lbl.setVisible(False)
        color_map = {"lineout": C_GREEN, "scrum": C_BLUE, "kickoff": C_ORANGE}
        color = color_map.get(ev["type"], C_TEXT)

        row = QFrame()
        row.setStyleSheet(f"""
            QFrame {{
                background-color: {C_SURFACE2};
                border: 1px solid {C_BORDER};
                border-left: 3px solid {color};
                border-radius: 6px;
            }}
        """)
        row_lay = QHBoxLayout(row)
        row_lay.setContentsMargins(12, 10, 12, 10)

        info = QLabel(f"<b style='color:{color}'>{ev['label']}</b>  —  {ev['time_str']}  ({ev['confidence']:.0%})")
        info.setTextFormat(Qt.TextFormat.RichText)

        row_lay.addWidget(info, 1)
        self._clips_lay.addWidget(row)


# ── Main Analysis Screen ───────────────────────────────────────────────────────

class AnalysisScreen(QWidget):
    analysis_saved = pyqtSignal(dict, str, str, str)

    def __init__(self):
        super().__init__()
        self.worker = None
        self._video_duration = 0.0
        self._build_ui()
        self._auto_set_output()

    def _build_ui(self):
        root = QHBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)

        root.addWidget(self._make_config_panel())

        splitter = QSplitter(Qt.Orientation.Horizontal)
        splitter.setStyleSheet(
            "QSplitter::handle { background-color: #1a2530; width: 1px; }")
        splitter.addWidget(self._make_preview())
        splitter.addWidget(self._make_results())
        splitter.setSizes([640, 440])
        root.addWidget(splitter, 1)

    # ── Config sidebar ────────────────────────────────────────────────────────

    def _make_config_panel(self) -> QWidget:
        panel = QWidget()
        panel.setFixedWidth(290)
        panel.setStyleSheet(
            f"background-color: {C_SURFACE}; border-right: 1px solid {C_BORDER};")

        lay = QVBoxLayout(panel)
        lay.setContentsMargins(18, 22, 18, 20)
        lay.setSpacing(14)

        # Cabecera
        title = QLabel("Nuevo Análisis")
        title.setFont(QFont("Segoe UI", 17, QFont.Weight.Bold))
        title.setStyleSheet(f"color: {C_TEXT};")
        sub = QLabel("CONFIGURACIÓN DEL ANÁLISIS")
        sub.setObjectName("subtitle")
        lay.addWidget(title)
        lay.addWidget(sub)
        lay.addWidget(self._divider())

        # Estado del modelo
        model_ok    = MODEL_PATH.exists()
        model_color = C_GREEN if model_ok else C_RED
        model_icon  = "●" if model_ok else "✕"
        model_text  = "Modelo cargado" if model_ok else "Modelo no encontrado"
        model_lbl   = QLabel(f"{model_icon}  {model_text}")
        model_lbl.setStyleSheet(
            f"color: {model_color}; font-size: 11px; font-weight: 600; padding: 2px 0;")
        lay.addWidget(model_lbl)
        lay.addWidget(self._divider())

        # ① Video de entrada
        g_video = QGroupBox("① Video de entrada")
        gv_lay  = QVBoxLayout(g_video)
        gv_lay.setSpacing(6)
        self.video_picker = FilePicker(
            "Buscar", "Seleccioná el video…", "Video (*.mp4 *.avi *.mov *.mkv)")
        self.video_picker.edit.textChanged.connect(self._on_video_selected)
        gv_lay.addWidget(self.video_picker)
        self.video_info = VideoInfoBar()
        gv_lay.addWidget(self.video_info)
        lay.addWidget(g_video)

        # ② Video de salida
        g_out  = QGroupBox("② Video de salida")
        go_lay = QVBoxLayout(g_out)
        go_lay.setSpacing(6)
        self.output_picker = FilePicker(
            "Guardar", "Ruta del video anotado…", "Video (*.mp4)", save_mode=True)
        go_lay.addWidget(self.output_picker)
        lay.addWidget(g_out)

        # ③ Equipos
        g_teams  = QGroupBox("③ Equipos")
        gt_lay   = QVBoxLayout(g_teams)
        gt_lay.setSpacing(8)
        self.team_local     = TeamColorPicker("Local",  "#4fc3f7", "Nombre equipo local")
        self.team_visitante = TeamColorPicker("Visit.", "#ef5350", "Nombre equipo visitante")
        self.team_local.name_edit.textChanged.connect(self._sync_possession_teams)
        self.team_visitante.name_edit.textChanged.connect(self._sync_possession_teams)
        gt_lay.addWidget(self.team_local)
        gt_lay.addWidget(self.team_visitante)
        lay.addWidget(g_teams)

        # ④ Configuración técnica
        g_cfg  = QGroupBox("④ Configuración técnica")
        gc_lay = QVBoxLayout(g_cfg)
        gc_lay.setSpacing(10)

        conf_row = QHBoxLayout()
        conf_lbl = QLabel("Confianza mínima:")
        conf_lbl.setStyleSheet(f"color: {C_TEXT}; font-size: 12px;")
        self.conf_val_lbl = QLabel("40%")
        self.conf_val_lbl.setStyleSheet(
            f"color: {C_GREEN}; font-weight: 700; min-width: 36px;")
        conf_row.addWidget(conf_lbl)
        conf_row.addStretch()
        conf_row.addWidget(self.conf_val_lbl)
        gc_lay.addLayout(conf_row)

        self.conf_slider = QSlider(Qt.Orientation.Horizontal)
        self.conf_slider.setRange(10, 90)
        self.conf_slider.setValue(40)
        self.conf_slider.setToolTip(
            "Confianza mínima para aceptar una detección. Valor bajo = más detecciones pero con más falsos positivos.")
        self.conf_slider.valueChanged.connect(
            lambda v: self.conf_val_lbl.setText(f"{v}%"))
        gc_lay.addWidget(self.conf_slider)

        mode_lbl = QLabel("Modo de análisis:")
        mode_lbl.setStyleSheet(f"color: {C_TEXT}; font-size: 12px; margin-top: 4px;")
        gc_lay.addWidget(mode_lbl)

        mode_row = QHBoxLayout()
        self.rb_detect = QRadioButton("Detección")
        self.rb_seg    = QRadioButton("Segmentación")
        self.rb_detect.setChecked(True)
        self.rb_detect.setToolTip("Bounding boxes — más rápido")
        self.rb_seg.setToolTip("Máscaras de instancia — más preciso, más lento")
        self._mode_group = QButtonGroup()
        self._mode_group.addButton(self.rb_detect, 0)
        self._mode_group.addButton(self.rb_seg,    1)
        mode_row.addWidget(self.rb_detect)
        mode_row.addWidget(self.rb_seg)
        gc_lay.addLayout(mode_row)
        lay.addWidget(g_cfg)
        lay.addStretch()

        # ── Botones ──
        self.run_btn = QPushButton("▶  PROCESAR VIDEO")
        self.run_btn.setFixedHeight(46)
        self.run_btn.setStyleSheet(
            f"background-color: {C_GREEN}; color: #000; font-weight: 700;"
            f"font-size: 14px; border-radius: 8px;")
        self.run_btn.clicked.connect(self._toggle_processing)
        lay.addWidget(self.run_btn)

        self.open_btn = QPushButton("▶  Abrir video resultante")
        self.open_btn.setObjectName("secondary")
        self.open_btn.setEnabled(False)
        self.open_btn.clicked.connect(self._open_output)
        lay.addWidget(self.open_btn)

        self.export_btn = QPushButton("⬇  Exportar CSV")
        self.export_btn.setObjectName("secondary")
        self.export_btn.setEnabled(False)
        self.export_btn.clicked.connect(self._export_csv)
        lay.addWidget(self.export_btn)

        return panel

    # ── Preview ───────────────────────────────────────────────────────────────

    def _make_preview(self) -> QWidget:
        panel = QWidget()
        lay   = QVBoxLayout(panel)
        lay.setContentsMargins(16, 16, 8, 16)
        lay.setSpacing(10)

        hdr = QLabel("PREVIEW EN VIVO")
        hdr.setStyleSheet(f"font-size: 9px; color: {C_MUTED}; letter-spacing: 2px;")
        lay.addWidget(hdr)

        self.preview_lbl = QLabel()
        self.preview_lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.preview_lbl.setStyleSheet(
            f"background-color: {C_SURFACE}; border: 1px solid {C_BORDER};"
            f"border-radius: 8px; color: {C_MUTED}; font-size: 14px;"
        )
        self.preview_lbl.setSizePolicy(
            QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
        self._set_preview_placeholder()
        lay.addWidget(self.preview_lbl, 1)

        # Progress
        prog_row = QHBoxLayout()
        self.progress_lbl = QLabel("—")
        self.progress_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 11px;")
        self.progress_bar = QProgressBar()
        self.progress_bar.setValue(0)
        self.progress_bar.setFixedHeight(6)
        self.progress_bar.setTextVisible(False)
        prog_row.addWidget(self.progress_lbl)
        prog_row.addWidget(self.progress_bar, 1)
        lay.addLayout(prog_row)

        # Log
        self.det_log = DetectionLogWidget()
        lay.addWidget(self.det_log)

        # Stat cards
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

    # ── Results tabs ──────────────────────────────────────────────────────────

    def _make_results(self) -> QWidget:
        panel = QWidget()
        lay   = QVBoxLayout(panel)
        lay.setContentsMargins(8, 16, 16, 16)
        lay.setSpacing(10)

        tabs = QTabWidget()

        # Tab 1: Eventos
        events_tab = QWidget()
        events_lay = QVBoxLayout(events_tab)
        events_lay.setContentsMargins(8, 8, 8, 8)
        events_lay.setSpacing(8)

        self.timeline = TimelineWidget()
        events_lay.addWidget(self.timeline)

        self.table = QTableWidget(0, 4)
        self.table.setHorizontalHeaderLabels(["Tipo", "Minuto", "Conf.", "Frame"])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        self.table.verticalHeader().setVisible(False)
        self.table.setEditTriggers(QTableWidget.EditTrigger.NoEditTriggers)
        self.table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        events_lay.addWidget(self.table, 1)

        self.status_lbl = QLabel("Listo para procesar.")
        self.status_lbl.setObjectName("caption")
        self.status_lbl.setWordWrap(True)
        events_lay.addWidget(self.status_lbl)

        tabs.addTab(events_tab, "📋  Eventos")

        # Tab 2: Posesión
        self.possession_widget = PossessionWidget()
        tabs.addTab(self.possession_widget, "🏉  Posesión")

        # Tab 3: Clips
        self.clips_panel = ClipsPanel()
        tabs.addTab(self.clips_panel, "🎬  Clips")

        lay.addWidget(tabs, 1)
        self._tabs = tabs

        return panel

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _divider(self) -> QFrame:
        sep = QFrame()
        sep.setObjectName("divider")
        sep.setFrameShape(QFrame.Shape.HLine)
        return sep

    def _set_preview_placeholder(self):
        self.preview_lbl.setText(
            "Cargá un video y\npresioná PROCESAR VIDEO")

    def _sync_possession_teams(self):
        self.possession_widget.set_teams(
            self.team_local.team_name(),
            self.team_visitante.team_name(),
            self.team_local.color(),
            self.team_visitante.color(),
        )

    # ── Logic ─────────────────────────────────────────────────────────────────

    def _on_video_selected(self, path: str):
        self._auto_set_output()
        if path and Path(path).exists():
            self.video_info.load(path)
            try:
                cap = cv2.VideoCapture(path)
                fps = cap.get(cv2.CAP_PROP_FPS) or 1
                fc  = cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0
                cap.release()
                self._video_duration = fc / fps
                self.timeline.set_duration(self._video_duration)
            except Exception:
                self._video_duration = 0.0
        else:
            self.video_info.clear()

    def _auto_set_output(self):
        vp = self.video_picker.path()
        if vp:
            p = Path(vp)
            self.output_picker.set_path(
                str(p.parent / (p.stem + "_detected.mp4")))

    def _toggle_processing(self):
        if self.worker and self.worker.isRunning():
            self._stop_processing()
        else:
            self._start_processing()

    def _start_processing(self):
        video_path  = self.video_picker.path()
        output_path = self.output_picker.path()

        if not MODEL_PATH.exists():
            self._show_error(
                f"Modelo no encontrado en:\n{MODEL_PATH}\n\n"
                "Copiá best.pt dentro de la carpeta dataset/")
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
        self.timeline.clear()
        self.clips_panel.clear()
        if self._video_duration:
            self.timeline.set_duration(self._video_duration)
        self.det_log.clear()
        self._update_cards(0, 0, 0)
        self.progress_bar.setValue(0)
        self.export_btn.setEnabled(False)
        self.open_btn.setEnabled(False)
        self._set_preview_placeholder()
        self.preview_lbl.setText("")

        self.run_btn.setText("⏹  DETENER")
        self.run_btn.setStyleSheet(
            f"background-color: #c62828; color: {C_TEXT}; font-weight: 700;"
            f"font-size: 14px; border-radius: 8px;")
        self.status_lbl.setText(f"Procesando… [{mode_name}]")
        self.status_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 11px;")

        team_a = self.team_local.team_name()     or "Local"
        team_b = self.team_visitante.team_name() or "Visitante"
        self._sync_possession_teams()
        self.det_log.append(f"▶ Iniciando — {team_a} vs {team_b}", C_GREEN)
        self.det_log.append(
            f"  Confianza: {int(conf*100)}%  |  Modo: {mode_name}", C_MUTED)

        self._output_path = output_path
        self.worker = WorkerCls(str(MODEL_PATH), video_path, output_path, conf)
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
            self.det_log.append("⏹ Detenido por el usuario.", C_ORANGE)

    def _on_progress(self, current: int, total: int):
        pct = int(current / total * 100) if total else 0
        self.progress_bar.setValue(pct)
        self.progress_lbl.setText(f"{pct}%  ({current} / {total} frames)")

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

        self.timeline.add_event(ev.get("second", 0.0), ev["type"])
        self.clips_panel.add_clip(ev, str(Path(self._output_path).parent))

        icon_map = {"lineout": "🟢", "scrum": "🔵", "kickoff": "🟠"}
        self.det_log.append(
            f"{icon_map.get(ev['type'], '⚪')} {ev['label']}  —  "
            f"{ev['time_str']}  ({ev['confidence']:.0%})", c)

        self._update_cards_from_table()

        # Actualizar posesión con distribución basada en eventos
        counts = {"lineout": 0, "scrum": 0, "kickoff": 0}
        for r in range(self.table.rowCount()):
            it = self.table.item(r, 0)
            if it:
                counts[it.data(Qt.ItemDataRole.UserRole)] = \
                    counts.get(it.data(Qt.ItemDataRole.UserRole), 0) + 1
        total = sum(counts.values()) or 1
        # Placeholder 50/50 hasta tener análisis real de posesión
        self.possession_widget.update_possession(0.5)

    def _update_cards_from_table(self):
        counts = {"lineout": 0, "scrum": 0, "kickoff": 0}
        for row in range(self.table.rowCount()):
            t = self.table.item(row, 0)
            if t:
                k = t.data(Qt.ItemDataRole.UserRole)
                if k in counts:
                    counts[k] += 1
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
        self.export_btn.setEnabled(self.table.rowCount() > 0)

        elapsed = stats.get("processing_time_sec", 0)
        total   = stats.get("total_events", 0)
        out     = stats.get("output_path", "")

        self.status_lbl.setText(
            f"✓ Listo en {elapsed:.0f}s — {total} eventos detectados.\n"
            f"Video guardado: {Path(out).name}"
        )
        self.status_lbl.setStyleSheet(f"color: {C_GREEN}; font-size: 11px;")
        self.det_log.append(
            f"✓ Análisis completo — {total} eventos en {elapsed:.0f}s", C_GREEN)

        # Cambiar al tab de eventos
        self._tabs.setCurrentIndex(0)

        video_name = Path(self.video_picker.path()).name
        self.analysis_saved.emit(
            stats,
            self.team_local.team_name(),
            self.team_visitante.team_name(),
            video_name,
        )

    def _on_error(self, msg: str):
        self._reset_run_button()
        self._show_error(msg)
        self.status_lbl.setText("Error en el procesamiento.")
        self.status_lbl.setStyleSheet(f"color: {C_RED}; font-size: 11px;")
        self.det_log.append(f"✕ Error: {msg}", C_RED)

    def _reset_run_button(self):
        self.run_btn.setText("▶  PROCESAR VIDEO")
        self.run_btn.setStyleSheet(
            f"background-color: {C_GREEN}; color: #000; font-weight: 700;"
            f"font-size: 14px; border-radius: 8px;")
        self.worker = None

    def _open_output(self):
        path = self.output_picker.path()
        if path and Path(path).exists():
            os.startfile(path)

    def _export_csv(self):
        if self.table.rowCount() == 0:
            return
        vp = self.video_picker.path()
        default = str(Path(vp).parent / (Path(vp).stem + "_eventos.csv")) if vp else "eventos.csv"
        path, _ = QFileDialog.getSaveFileName(
            self, "Exportar eventos como CSV", default, "CSV (*.csv)")
        if not path:
            return
        try:
            with open(path, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow(
                    ["Tipo", "Tiempo", "Confianza", "Frame",
                     "Equipo Local", "Equipo Visitante"])
                for row in range(self.table.rowCount()):
                    writer.writerow([
                        self.table.item(row, 0).text(),
                        self.table.item(row, 1).text(),
                        self.table.item(row, 2).text(),
                        self.table.item(row, 3).text(),
                        self.team_local.team_name(),
                        self.team_visitante.team_name(),
                    ])
            self.status_lbl.setText(f"CSV exportado: {Path(path).name}")
            self.status_lbl.setStyleSheet(f"color: {C_GREEN}; font-size: 11px;")
        except Exception as e:
            self._show_error(f"No se pudo exportar:\n{e}")

    def _show_error(self, msg: str):
        dlg = QMessageBox(self)
        dlg.setWindowTitle("Error")
        dlg.setText(msg)
        dlg.setIcon(QMessageBox.Icon.Warning)
        dlg.exec()
