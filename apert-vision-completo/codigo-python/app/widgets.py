from PyQt6.QtWidgets import (
    QFrame, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QLineEdit, QFileDialog, QWidget, QTextEdit, QSizePolicy,
)
from PyQt6.QtCore import Qt, QPoint
from PyQt6.QtGui import QPainter, QPen, QBrush, QColor, QPolygon, QFont

from app.styles import C_SURFACE, C_BORDER, C_MUTED, C_TEXT, C_GREEN, C_BLUE, C_ORANGE


class StatCard(QFrame):
    def __init__(self, number: str, label: str, color: str):
        super().__init__()
        self.setStyleSheet(f"""
            QFrame {{
                background-color: {C_SURFACE};
                border: 1px solid {C_BORDER};
                border-radius: 8px;
            }}
        """)
        lay = QVBoxLayout(self)
        lay.setSpacing(2)
        lay.setContentsMargins(12, 10, 12, 10)

        self._num = QLabel(number)
        self._num.setStyleSheet(f"font-size: 26px; font-weight: 800; color: {color};")
        self._num.setAlignment(Qt.AlignmentFlag.AlignCenter)

        lbl = QLabel(label.upper())
        lbl.setStyleSheet(f"font-size: 9px; color: {C_MUTED}; letter-spacing: 1px;")
        lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)

        lay.addWidget(self._num)
        lay.addWidget(lbl)

    def update_value(self, value: str):
        self._num.setText(value)


class FilePicker(QWidget):
    def __init__(self, label: str, placeholder: str, filters: str,
                 save_mode: bool = False):
        super().__init__()
        self._filters = filters
        self._save    = save_mode

        lay = QHBoxLayout(self)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(6)

        self.edit = QLineEdit()
        self.edit.setPlaceholderText(placeholder)

        btn = QPushButton(label)
        btn.setObjectName("secondary")
        btn.setFixedWidth(90)
        btn.clicked.connect(self._browse)

        lay.addWidget(self.edit)
        lay.addWidget(btn)

    def _browse(self):
        if self._save:
            path, _ = QFileDialog.getSaveFileName(self, "Guardar como", "", self._filters)
        else:
            path, _ = QFileDialog.getOpenFileName(self, "Abrir archivo", "", self._filters)
        if path:
            self.edit.setText(path)

    def path(self) -> str:
        return self.edit.text().strip()

    def set_path(self, p: str):
        self.edit.setText(p)


class TeamColorPicker(QWidget):
    """Fila con label, nombre del equipo y selector de color."""

    def __init__(self, label: str, default_color: str, placeholder: str = "Nombre del equipo"):
        super().__init__()
        self._color = default_color

        lay = QHBoxLayout(self)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(6)

        team_lbl = QLabel(label)
        team_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 11px; min-width: 30px;")
        team_lbl.setFixedWidth(34)

        self.name_edit = QLineEdit()
        self.name_edit.setPlaceholderText(placeholder)
        self.name_edit.setFixedHeight(30)

        self.color_btn = QPushButton()
        self.color_btn.setFixedSize(30, 30)
        self.color_btn.setToolTip("Seleccionar color de camiseta")
        self._apply_color_style()
        self.color_btn.clicked.connect(self._pick_color)

        lay.addWidget(team_lbl)
        lay.addWidget(self.name_edit, 1)
        lay.addWidget(self.color_btn)

    def _apply_color_style(self):
        self.color_btn.setStyleSheet(
            f"background-color: {self._color}; border-radius: 5px;"
            f"border: 2px solid {C_BORDER}; min-width: 30px; min-height: 30px;"
        )

    def _pick_color(self):
        from PyQt6.QtWidgets import QColorDialog
        color = QColorDialog.getColor(QColor(self._color), self, "Color de camiseta")
        if color.isValid():
            self._color = color.name()
            self._apply_color_style()

    def color(self) -> str:
        return self._color

    def team_name(self) -> str:
        return self.name_edit.text().strip()


class VideoInfoBar(QWidget):
    """Muestra resolución, duración y FPS de un video cargado."""

    def __init__(self):
        super().__init__()
        self.setVisible(False)

        lay = QHBoxLayout(self)
        lay.setContentsMargins(0, 4, 0, 0)
        lay.setSpacing(12)

        style = f"color: {C_MUTED}; font-size: 10px;"
        self._res_lbl = QLabel()
        self._dur_lbl = QLabel()
        self._fps_lbl = QLabel()
        for lbl in (self._res_lbl, self._dur_lbl, self._fps_lbl):
            lbl.setStyleSheet(style)
            lay.addWidget(lbl)
        lay.addStretch()

    def load(self, video_path: str):
        try:
            import cv2
            cap = cv2.VideoCapture(video_path)
            w   = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            h   = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            fps = cap.get(cv2.CAP_PROP_FPS) or 0
            fc  = cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0
            cap.release()
            dur = fc / fps if fps else 0
            mins, secs = divmod(int(dur), 60)
            self._res_lbl.setText(f"📐 {w}×{h}")
            self._dur_lbl.setText(f"⏱ {mins}:{secs:02d}")
            self._fps_lbl.setText(f"🎞 {fps:.0f} fps")
            self.setVisible(True)
        except Exception:
            self.setVisible(False)

    def clear(self):
        self.setVisible(False)


class TimelineWidget(QWidget):
    """Timeline horizontal con marcadores de eventos."""

    _COLOR_MAP = {
        "lineout": C_GREEN,
        "scrum":   C_BLUE,
        "kickoff": C_ORANGE,
    }

    def __init__(self):
        super().__init__()
        self._events: list[tuple[float, str]] = []
        self._duration: float = 0.0
        self.setFixedHeight(52)
        self.setMinimumWidth(200)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)

    def set_duration(self, secs: float):
        self._duration = max(secs, 1.0)
        self.update()

    def add_event(self, time_sec: float, ev_type: str):
        self._events.append((time_sec, ev_type))
        self.update()

    def clear(self):
        self._events.clear()
        self._duration = 0.0
        self.update()

    def paintEvent(self, _event):
        p = QPainter(self)
        p.setRenderHint(QPainter.RenderHint.Antialiasing)
        W, H = self.width(), self.height()
        PAD  = 14
        track_y = H // 2 + 4
        track_h = 4

        # Track background
        p.setPen(Qt.PenStyle.NoPen)
        p.setBrush(QBrush(QColor(C_BORDER)))
        p.drawRoundedRect(PAD, track_y, W - PAD * 2, track_h, 2, 2)

        # Track fill progress
        if self._events and self._duration:
            last_t = max(t for t, _ in self._events)
            fill_w = int((last_t / self._duration) * (W - PAD * 2))
            p.setBrush(QBrush(QColor(C_GREEN).darker(170)))
            p.drawRoundedRect(PAD, track_y, fill_w, track_h, 2, 2)

        # Event markers
        for time_sec, ev_type in self._events:
            if not self._duration:
                continue
            x = int(PAD + (time_sec / self._duration) * (W - PAD * 2))
            color = QColor(self._COLOR_MAP.get(ev_type, C_TEXT))
            r = 6
            p.setBrush(QBrush(color))
            p.setPen(QPen(color.darker(140), 1))
            p.drawEllipse(x - r, track_y - r + track_h // 2, r * 2, r * 2)

        # Legend
        font = QFont("Segoe UI", 8)
        p.setFont(font)
        lx = PAD
        for name, color_hex in [("Line-out", C_GREEN), ("Scrum", C_BLUE), ("Salida", C_ORANGE)]:
            p.setBrush(QBrush(QColor(color_hex)))
            p.setPen(Qt.PenStyle.NoPen)
            p.drawEllipse(lx, 4, 7, 7)
            p.setPen(QPen(QColor(C_MUTED)))
            p.drawText(lx + 10, 13, name)
            lx += 62

        p.end()


class DetectionLogWidget(QWidget):
    """Log de texto en vivo que muestra las detecciones en tiempo real."""

    def __init__(self):
        super().__init__()
        lay = QVBoxLayout(self)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(0)

        hdr = QLabel("LOG EN VIVO")
        hdr.setStyleSheet(
            f"font-size: 9px; color: {C_MUTED}; letter-spacing: 2px;"
            f"padding: 4px 0 2px 0;"
        )
        lay.addWidget(hdr)

        self._text = QTextEdit()
        self._text.setReadOnly(True)
        self._text.setFixedHeight(90)
        self._text.setStyleSheet(f"""
            QTextEdit {{
                background-color: {C_SURFACE};
                border: 1px solid {C_BORDER};
                border-radius: 6px;
                color: {C_MUTED};
                font-family: "Consolas", monospace;
                font-size: 11px;
                padding: 4px 8px;
            }}
        """)
        lay.addWidget(self._text)

    def append(self, msg: str, color: str = C_MUTED):
        self._text.append(f'<span style="color:{color};">{msg}</span>')
        self._text.verticalScrollBar().setValue(
            self._text.verticalScrollBar().maximum()
        )

    def clear(self):
        self._text.clear()
