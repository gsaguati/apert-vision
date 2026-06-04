from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QFrame, QScrollArea, QSizePolicy, QSlider, QColorDialog,
)
from PyQt6.QtCore import Qt, pyqtSignal, QPropertyAnimation, QEasingCurve, QRect, QPoint
from PyQt6.QtGui import QFont, QPainter, QColor, QBrush, QPen

from app.styles import (
    C_BG, C_SURFACE, C_SURFACE2, C_BORDER, C_BORDER2,
    C_GREEN, C_GREEN2, C_GREEN3, C_GREENBG,
    C_TEXT, C_MUTED, C_MUTED2,
)


# ── Toggle Switch ──────────────────────────────────────────────────────────────

class ToggleSwitch(QWidget):
    toggled = pyqtSignal(bool)

    def __init__(self, checked: bool = True):
        super().__init__()
        self._checked  = checked
        self._thumb_x  = 1.0 if checked else 0.0
        self.setFixedSize(46, 26)
        self.setCursor(Qt.CursorShape.PointingHandCursor)

        self._anim = QPropertyAnimation(self, b"")
        self._anim.setDuration(160)
        self._anim.setEasingCurve(QEasingCurve.Type.InOutCubic)

    @property
    def is_checked(self) -> bool:
        return self._checked

    def set_checked(self, val: bool):
        self._checked = val
        self._thumb_x = 1.0 if val else 0.0
        self.update()

    def mousePressEvent(self, _):
        self._checked = not self._checked
        target = 1.0 if self._checked else 0.0
        # Simple lerp via repaint steps
        self._thumb_x = target
        self.update()
        self.toggled.emit(self._checked)

    def paintEvent(self, _):
        p = QPainter(self)
        p.setRenderHint(QPainter.RenderHint.Antialiasing)
        W, H = self.width(), self.height()
        r = H / 2

        # Track
        track_color = QColor(C_GREEN if self._checked else C_MUTED2)
        p.setPen(Qt.PenStyle.NoPen)
        p.setBrush(QBrush(track_color))
        p.drawRoundedRect(0, 0, W, H, r, r)

        # Thumb
        margin   = 3
        thumb_d  = H - margin * 2
        max_tx   = W - thumb_d - margin
        tx       = margin + self._thumb_x * max_tx
        p.setBrush(QBrush(QColor("#ffffff")))
        p.drawEllipse(int(tx), margin, thumb_d, thumb_d)
        p.end()


# ── Color swatch ───────────────────────────────────────────────────────────────

PRESET_COLORS = ["#16a34a", "#2563eb", "#ef4444", "#ffffff",
                 "#f59e0b", "#06b6d4", "#f97316"]

class ColorSwatch(QWidget):
    selected = pyqtSignal(str)

    def __init__(self, color: str, active: bool = False):
        super().__init__()
        self._color  = color
        self._active = active
        self.setFixedSize(38, 38)
        self.setCursor(Qt.CursorShape.PointingHandCursor)

    def set_active(self, v: bool):
        self._active = v
        self.update()

    def color(self) -> str:
        return self._color

    def mousePressEvent(self, _):
        self.selected.emit(self._color)

    def paintEvent(self, _):
        p = QPainter(self)
        p.setRenderHint(QPainter.RenderHint.Antialiasing)
        W, H = self.width(), self.height()
        cx, cy, r = W // 2, H // 2, 13

        if self._active:
            # Outer ring
            p.setPen(QPen(QColor(self._color), 2))
            p.setBrush(Qt.BrushStyle.NoBrush)
            p.drawEllipse(cx - r - 4, cy - r - 4, (r + 4) * 2, (r + 4) * 2)

        p.setPen(Qt.PenStyle.NoPen)
        p.setBrush(QBrush(QColor(self._color)))
        p.drawEllipse(cx - r, cy - r, r * 2, r * 2)
        p.end()


class TeamColorPicker(QWidget):
    """Selector de color con swatches predefinidos para un equipo."""

    def __init__(self, label: str, default_color: str):
        super().__init__()
        self._color = default_color
        lay = QVBoxLayout(self)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(8)

        lbl = QLabel(label)
        lbl.setFont(QFont("Segoe UI", 11, QFont.Weight.Bold))
        lbl.setStyleSheet(f"color: {C_TEXT};")
        lay.addWidget(lbl)

        swatches_row = QHBoxLayout()
        swatches_row.setSpacing(4)
        self._swatches: list[ColorSwatch] = []

        for color in PRESET_COLORS:
            sw = ColorSwatch(color, color == default_color)
            sw.selected.connect(self._on_swatch)
            swatches_row.addWidget(sw)
            self._swatches.append(sw)

        # Custom color button
        custom_btn = QLabel("＋")
        custom_btn.setFixedSize(38, 38)
        custom_btn.setAlignment(Qt.AlignmentFlag.AlignCenter)
        custom_btn.setStyleSheet(
            f"background-color: {C_SURFACE2}; color: {C_MUTED};"
            f"border-radius: 19px; border: 1px dashed {C_BORDER2};"
            f"font-size: 16px; cursor: pointer;")
        swatches_row.addWidget(custom_btn)
        swatches_row.addStretch()
        lay.addLayout(swatches_row)

        # Hex display
        self._hex_lbl = QLabel(f"■  {default_color}")
        self._hex_lbl.setStyleSheet(
            f"color: {C_MUTED}; font-size: 11px; font-family: Consolas;")
        lay.addWidget(self._hex_lbl)

    def _on_swatch(self, color: str):
        self._color = color
        for sw in self._swatches:
            sw.set_active(sw.color() == color)
        c = QColor(color)
        self._hex_lbl.setText(
            f"<span style='color:{color}'>■</span>  {color}")
        self._hex_lbl.setTextFormat(Qt.TextFormat.RichText)

    def color(self) -> str:
        return self._color


# ── Section card ───────────────────────────────────────────────────────────────

class SectionCard(QFrame):
    def __init__(self, title: str):
        super().__init__()
        self.setObjectName("card")
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.setStyleSheet(f"""
            QFrame#card {{
                background-color: {C_SURFACE};
                border: 1px solid {C_BORDER2};
                border-radius: 10px;
            }}
        """)
        self._lay = QVBoxLayout(self)
        self._lay.setContentsMargins(20, 16, 20, 16)
        self._lay.setSpacing(0)

        title_lbl = QLabel(title)
        title_lbl.setFont(QFont("Segoe UI", 13, QFont.Weight.Bold))
        title_lbl.setStyleSheet(f"color: {C_TEXT};")
        self._lay.addWidget(title_lbl)
        self._lay.addSpacing(14)

    def add_widget(self, w: QWidget):
        self._lay.addWidget(w)


# ── Info banner ────────────────────────────────────────────────────────────────

class InfoBanner(QFrame):
    def __init__(self, text: str):
        super().__init__()
        self.setStyleSheet(f"""
            QFrame {{
                background-color: {C_GREENBG};
                border: 1px solid {C_GREEN3};
                border-radius: 6px;
            }}
        """)
        lay = QHBoxLayout(self)
        lay.setContentsMargins(14, 12, 14, 12)
        lay.setSpacing(10)

        icon = QLabel("ℹ")
        icon.setStyleSheet(f"color: {C_GREEN}; font-size: 14px;")
        icon.setFixedWidth(16)

        lbl = QLabel(text)
        lbl.setStyleSheet(f"color: {C_TEXT}; font-size: 12px;")
        lbl.setWordWrap(True)

        lay.addWidget(icon, 0, Qt.AlignmentFlag.AlignTop)
        lay.addWidget(lbl, 1)


# ── Toggle row ─────────────────────────────────────────────────────────────────

class ToggleRow(QFrame):
    def __init__(self, title: str, subtitle: str, checked: bool = True):
        super().__init__()
        self.setFixedHeight(64)
        self.setStyleSheet(f"""
            QFrame {{
                border-top: 1px solid {C_BORDER};
                background: transparent;
            }}
        """)
        lay = QHBoxLayout(self)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(16)

        info = QVBoxLayout()
        info.setSpacing(2)
        title_lbl = QLabel(title)
        title_lbl.setFont(QFont("Segoe UI", 12, QFont.Weight.Bold))
        title_lbl.setStyleSheet(f"color: {C_TEXT};")
        sub_lbl = QLabel(subtitle)
        sub_lbl.setStyleSheet(f"color: {C_GREEN}; font-size: 11px;")
        info.addWidget(title_lbl)
        info.addWidget(sub_lbl)

        self._toggle = ToggleSwitch(checked)

        lay.addLayout(info, 1)
        lay.addWidget(self._toggle, 0, Qt.AlignmentFlag.AlignVCenter)

    @property
    def toggle(self) -> ToggleSwitch:
        return self._toggle

    def is_checked(self) -> bool:
        return self._toggle.is_checked


# ── Confidence row ─────────────────────────────────────────────────────────────

class ConfidenceRow(QWidget):
    def __init__(self, value: int = 85):
        super().__init__()
        self.setFixedHeight(68)
        self.setStyleSheet(f"border-top: 1px solid {C_BORDER}; background: transparent;")
        lay = QVBoxLayout(self)
        lay.setContentsMargins(0, 10, 0, 0)
        lay.setSpacing(4)

        # Row 1: title + slider + value
        row1 = QHBoxLayout()
        title_lbl = QLabel("Umbral de confianza")
        title_lbl.setFont(QFont("Segoe UI", 12, QFont.Weight.Bold))
        title_lbl.setStyleSheet(f"color: {C_TEXT}; border: none;")
        self._slider = QSlider(Qt.Orientation.Horizontal)
        self._slider.setRange(10, 99)
        self._slider.setValue(value)
        self._slider.setFixedWidth(200)
        self._val_lbl = QLabel(f"{value}%")
        self._val_lbl.setFont(QFont("Segoe UI", 12, QFont.Weight.Bold))
        self._val_lbl.setStyleSheet(f"color: {C_GREEN}; border: none;")
        self._val_lbl.setFixedWidth(40)
        self._slider.valueChanged.connect(lambda v: self._val_lbl.setText(f"{v}%"))
        row1.addWidget(title_lbl, 1)
        row1.addWidget(self._slider)
        row1.addWidget(self._val_lbl)
        lay.addLayout(row1)

        # Row 2: subtitle
        sub_lbl = QLabel("Formaciones por debajo de este umbral no se muestran")
        sub_lbl.setStyleSheet(f"color: {C_GREEN}; font-size: 11px; border: none;")
        lay.addWidget(sub_lbl)

    def value(self) -> int:
        return self._slider.value()


# ── Model status card ──────────────────────────────────────────────────────────

class ModelStatusCard(QFrame):
    def __init__(self):
        super().__init__()
        self.setObjectName("card")
        self.setFixedHeight(62)
        lay = QHBoxLayout(self)
        lay.setContentsMargins(20, 0, 20, 0)

        info = QVBoxLayout()
        info.setSpacing(2)
        title_lbl = QLabel("Modelo activo")
        title_lbl.setFont(QFont("Segoe UI", 12, QFont.Weight.Bold))
        title_lbl.setStyleSheet(f"color: {C_TEXT};")
        sub_lbl = QLabel("YOLO v8  ·  Rugby Formation Model v2.1.4")
        sub_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 11px;")
        info.addWidget(title_lbl)
        info.addWidget(sub_lbl)

        badge = QLabel("● ACTIVO")
        badge.setStyleSheet(
            f"color: {C_GREEN}; background-color: {C_GREENBG};"
            f"border: 1px solid {C_GREEN3}; border-radius: 10px;"
            f"padding: 4px 12px; font-size: 11px; font-weight: 700;")

        lay.addLayout(info, 1)
        lay.addWidget(badge)


# ── Config Screen ──────────────────────────────────────────────────────────────

class ConfigScreen(QWidget):
    def __init__(self):
        super().__init__()
        self._build_ui()

    def _build_ui(self):
        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("background: transparent; border: none;")

        content = QWidget()
        content.setStyleSheet("background: transparent;")
        lay = QVBoxLayout(content)
        lay.setContentsMargins(32, 24, 32, 32)
        lay.setSpacing(20)

        # ── Breadcrumb ──
        bc = QLabel("Apert Vision  ›  Configuración")
        bc.setObjectName("breadcrumb")
        lay.addWidget(bc)

        # ── Header ──
        hdr = QHBoxLayout()
        title_col = QVBoxLayout()
        title_col.setSpacing(3)
        title = QLabel("Configuración")
        title.setObjectName("pageTitle")
        sub = QLabel("Preferencias del sistema de análisis")
        sub.setObjectName("pageSub")
        title_col.addWidget(title)
        title_col.addWidget(sub)

        save_btn = QPushButton("💾  Guardar cambios")
        save_btn.setFixedHeight(38)
        save_btn.setFixedWidth(180)
        save_btn.setStyleSheet(
            f"background-color: {C_GREEN}; color: #000; font-weight: 700;"
            f"border-radius: 8px; border: none; font-size: 13px;")
        save_btn.clicked.connect(self._save)

        hdr.addLayout(title_col)
        hdr.addStretch()
        hdr.addWidget(save_btn)
        lay.addLayout(hdr)

        # ── Sección: Colores de Equipos ──
        colors_card = SectionCard("Colores de Equipos")
        colors_card.add_widget(InfoBanner(
            "Estos colores se usan para identificar posesión de pelota en el análisis "
            "de vídeo. Si los colores son muy similares, la detección puede ser imprecisa."
        ))
        colors_card._lay.addSpacing(14)

        teams_row = QHBoxLayout()
        teams_row.setSpacing(40)
        self._local_picker = TeamColorPicker("Equipo Local",    "#16a34a")
        self._visit_picker = TeamColorPicker("Equipo Visitante","#2563eb")
        teams_row.addWidget(self._local_picker)
        teams_row.addWidget(self._visit_picker)
        teams_row.addStretch()

        teams_widget = QWidget()
        teams_widget.setLayout(teams_row)
        colors_card.add_widget(teams_widget)
        lay.addWidget(colors_card)

        # ── Sección: Modelo de IA ──
        ai_card = SectionCard("Modelo de IA")
        self._conf_row = ConfidenceRow(85)
        ai_card.add_widget(self._conf_row)

        self._toggle_detect  = ToggleRow("Detección automática de formaciones",
            "YOLO detecta line-outs, scrums y salidas automáticamente", True)
        self._toggle_bbox    = ToggleRow("Mostrar bounding boxes en vídeo",
            "Dibuja recuadros sobre las formaciones detectadas", True)
        self._toggle_conf    = ToggleRow("Mostrar porcentaje de confianza",
            "Superpone el score de confianza en cada detección", True)
        self._toggle_poss    = ToggleRow("Indicador de posesión en tiempo real",
            "Muestra el HUD de posesión superpuesto en el vídeo", True)

        for row in (self._toggle_detect, self._toggle_bbox,
                    self._toggle_conf, self._toggle_poss):
            ai_card.add_widget(row)
        lay.addWidget(ai_card)

        # ── Sección: Interfaz ──
        ui_card = SectionCard("Interfaz")
        self._toggle_audio = ToggleRow("Feedback de audio",
            "Sonido de confirmación al activar opciones", False)
        self._toggle_dark  = ToggleRow("Modo oscuro",
            "Tema oscuro para uso en vestuario o sala de análisis", True)
        ui_card.add_widget(self._toggle_audio)
        ui_card.add_widget(self._toggle_dark)
        lay.addWidget(ui_card)

        # ── Sección: Notificaciones ──
        notif_card = SectionCard("Notificaciones")
        self._toggle_email  = ToggleRow("Notificaciones por email",
            "Recibir email cuando finalice el procesamiento de un vídeo", False)
        self._toggle_export = ToggleRow("Exportación automática",
            "Generar PDF automáticamente al completar cada análisis", False)
        notif_card.add_widget(self._toggle_email)
        notif_card.add_widget(self._toggle_export)
        lay.addWidget(notif_card)

        # ── Modelo activo ──
        lay.addWidget(ModelStatusCard())

        lay.addStretch()
        # Wrap content in max-width container (like el mockup)
        outer = QWidget()
        outer.setStyleSheet("background: transparent;")
        outer_lay = QHBoxLayout(outer)
        outer_lay.setContentsMargins(0, 0, 0, 0)
        content.setMaximumWidth(700)
        outer_lay.addWidget(content)
        outer_lay.addStretch()
        scroll.setWidget(outer)
        root.addWidget(scroll, 1)

    def _save(self):
        # Aquí se persistirían los valores; por ahora muestra feedback visual
        pass

    def get_settings(self) -> dict:
        return {
            "color_local":    self._local_picker.color(),
            "color_visit":    self._visit_picker.color(),
            "confidence":     self._conf_row.value() / 100,
            "auto_detect":    self._toggle_detect.is_checked(),
            "show_bbox":      self._toggle_bbox.is_checked(),
            "show_conf":      self._toggle_conf.is_checked(),
            "show_poss":      self._toggle_poss.is_checked(),
            "audio_feedback": self._toggle_audio.is_checked(),
            "dark_mode":      self._toggle_dark.is_checked(),
            "email_notif":    self._toggle_email.is_checked(),
            "auto_export":    self._toggle_export.is_checked(),
        }
