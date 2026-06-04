import os
from pathlib import Path

from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QFrame, QScrollArea, QSizePolicy, QGridLayout,
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont, QPainter, QColor, QBrush, QPen, QLinearGradient

from app.styles import (
    C_BG, C_SURFACE, C_SURFACE2, C_BORDER, C_BORDER2,
    C_GREEN, C_BLUE, C_ORANGE, C_TEXT, C_MUTED, C_MUTED2,
)
import app.history as history
import app.user_state as user_state


class SummaryCard(QFrame):
    def __init__(self, value: str, label: str, sublabel: str, color: str):
        super().__init__()
        self.setObjectName("card")
        self.setFixedHeight(110)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        lay = QVBoxLayout(self)
        lay.setContentsMargins(22, 18, 22, 18)
        lay.setSpacing(2)

        val_lbl = QLabel(value)
        val_lbl.setFont(QFont("Segoe UI", 28, QFont.Weight.ExtraBold))
        val_lbl.setStyleSheet(f"color: {color};")

        name_lbl = QLabel(label.upper())
        name_lbl.setStyleSheet(
            f"color: {C_MUTED}; font-size: 9px; letter-spacing: 1.5px;")

        sub_lbl = QLabel(sublabel)
        sub_lbl.setStyleSheet(f"color: {C_MUTED2}; font-size: 10px;")

        lay.addWidget(val_lbl)
        lay.addWidget(name_lbl)
        lay.addStretch()
        lay.addWidget(sub_lbl)

        self._color = color

    def paintEvent(self, event):
        super().paintEvent(event)
        p = QPainter(self)
        p.setRenderHint(QPainter.RenderHint.Antialiasing)
        p.setPen(Qt.PenStyle.NoPen)
        p.setBrush(QBrush(QColor(self._color)))
        p.drawRect(0, 0, 3, self.height())
        p.end()


class PossessionBar(QWidget):
    def __init__(self, team_a: str, team_b: str, pct_a: float,
                 color_a: str = C_GREEN, color_b: str = C_BLUE):
        super().__init__()
        self.setFixedHeight(10)
        self._pct_a  = max(0.0, min(1.0, pct_a))
        self._color_a = color_a
        self._color_b = color_b

    def paintEvent(self, _):
        p = QPainter(self)
        p.setRenderHint(QPainter.RenderHint.Antialiasing)
        W = self.width()
        split = int(W * self._pct_a)
        p.setPen(Qt.PenStyle.NoPen)
        p.setBrush(QBrush(QColor(self._color_a)))
        p.drawRoundedRect(0, 0, split, self.height(), 5, 5)
        p.setBrush(QBrush(QColor(self._color_b)))
        p.drawRoundedRect(split, 0, W - split, self.height(), 5, 5)
        p.end()


class MatchCard(QFrame):
    def __init__(self, match: dict):
        super().__init__()
        self.match = match
        self.setObjectName("card")
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.setStyleSheet(f"""
            QFrame#card {{
                background-color: {C_SURFACE};
                border: 1px solid {C_BORDER};
                border-radius: 12px;
            }}
            QFrame#card:hover {{
                border-color: {C_BORDER2};
                background-color: {C_SURFACE2};
            }}
        """)
        self._build()

    def _build(self):
        m   = self.match
        lay = QVBoxLayout(self)
        lay.setContentsMargins(22, 20, 22, 20)
        lay.setSpacing(10)

        # Header
        header = QHBoxLayout()
        teams  = QLabel(f"{m['team_local']}  vs  {m['team_visit']}")
        teams.setFont(QFont("Segoe UI", 14, QFont.Weight.Bold))
        teams.setStyleSheet(f"color: {C_TEXT};")

        # Badge de modo (si existe)
        mode = m.get("mode", "")
        if mode:
            badge = QLabel(mode.upper())
            badge.setStyleSheet(
                f"color: {C_GREEN}; background-color: #0d2015;"
                f"border: 1px solid {C_GREEN}; border-radius: 4px;"
                f"padding: 2px 7px; font-size: 9px; font-weight: 700; letter-spacing: 1px;"
            )
            header.addWidget(badge)

        date_lbl = QLabel(m.get("date", ""))
        date_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 11px;")

        header.addWidget(teams)
        header.addStretch()
        header.addWidget(date_lbl)
        lay.addLayout(header)

        # Nombre del video
        vid_lbl = QLabel(f"📹  {m.get('video', '')}")
        vid_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 11px;")
        vid_lbl.setWordWrap(True)
        lay.addWidget(vid_lbl)

        # Duración
        dur = m.get("duration_sec", 0)
        if dur:
            mins, secs = divmod(int(dur), 60)
            dur_row = QHBoxLayout()
            dur_lbl = QLabel(f"⏱  {mins}:{secs:02d} min")
            dur_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 11px;")
            proc = m.get("processing_time", 0)
            proc_lbl = QLabel(f"⚡  Procesado en {proc:.0f}s")
            proc_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 11px;")
            dur_row.addWidget(dur_lbl)
            dur_row.addSpacing(16)
            dur_row.addWidget(proc_lbl)
            dur_row.addStretch()
            lay.addLayout(dur_row)

        # Separador
        sep = QFrame()
        sep.setFrameShape(QFrame.Shape.HLine)
        sep.setStyleSheet(f"background-color: {C_BORDER}; max-height: 1px;")
        lay.addWidget(sep)

        # Stats chips
        chips = QHBoxLayout()
        chips.setSpacing(8)
        chips.addWidget(self._chip(str(m.get("lineouts",     0)), "Line-Outs", C_GREEN))
        chips.addWidget(self._chip(str(m.get("scrums",       0)), "Scrums",    C_BLUE))
        chips.addWidget(self._chip(str(m.get("kickoffs",     0)), "Salidas",   C_ORANGE))
        chips.addWidget(self._chip(str(m.get("total_events", 0)), "Total",     C_TEXT))
        chips.addStretch()

        # Botón abrir video
        out = m.get("output_path", "")
        if out and Path(out).exists():
            btn = QPushButton("▶  Ver video anotado")
            btn.setFixedHeight(32)
            btn.setFixedWidth(170)
            btn.setObjectName("secondary")
            btn.clicked.connect(lambda: os.startfile(out))
            chips.addWidget(btn)

        lay.addLayout(chips)

    def _chip(self, number: str, label: str, color: str) -> QFrame:
        chip = QFrame()
        chip.setStyleSheet(f"""
            QFrame {{
                background-color: {C_BG};
                border: 1px solid {C_BORDER};
                border-radius: 8px;
            }}
        """)
        chip_lay = QVBoxLayout(chip)
        chip_lay.setContentsMargins(14, 8, 14, 8)
        chip_lay.setSpacing(0)
        chip.setFixedWidth(90)

        num = QLabel(number)
        num.setFont(QFont("Segoe UI", 20, QFont.Weight.ExtraBold))
        num.setStyleSheet(f"color: {color};")
        num.setAlignment(Qt.AlignmentFlag.AlignCenter)

        lbl = QLabel(label.upper())
        lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 8px; letter-spacing: 0.5px;")
        lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)

        chip_lay.addWidget(num)
        chip_lay.addWidget(lbl)
        return chip


class EmptyState(QWidget):
    def __init__(self):
        super().__init__()
        lay = QVBoxLayout(self)
        lay.setAlignment(Qt.AlignmentFlag.AlignCenter)
        lay.setSpacing(12)

        icon = QLabel("🏉")
        icon.setStyleSheet("font-size: 48px;")
        icon.setAlignment(Qt.AlignmentFlag.AlignCenter)

        title = QLabel("Todavía no analizaste ningún partido")
        title.setFont(QFont("Segoe UI", 16, QFont.Weight.Bold))
        title.setStyleSheet(f"color: {C_TEXT};")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)

        sub = QLabel(
            "Presioná \"Nuevo análisis\" para procesar tu primer video.\n"
            "Los resultados quedan guardados acá para consultarlos cuando quieras."
        )
        sub.setStyleSheet(f"color: {C_MUTED}; font-size: 13px;")
        sub.setAlignment(Qt.AlignmentFlag.AlignCenter)
        sub.setWordWrap(True)

        lay.addWidget(icon)
        lay.addWidget(title)
        lay.addWidget(sub)


class HomeScreen(QWidget):
    new_analysis_requested = pyqtSignal()

    def __init__(self):
        super().__init__()
        self.setStyleSheet(f"background-color: {C_BG};")
        self._build_ui()

    def _build_ui(self):
        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)

        # ── Top bar ──
        topbar = QWidget()
        topbar.setFixedHeight(70)
        topbar.setStyleSheet(
            f"background-color: {C_SURFACE}; border-bottom: 1px solid {C_BORDER};")
        tb_lay = QHBoxLayout(topbar)
        tb_lay.setContentsMargins(36, 0, 36, 0)

        u = user_state.get()
        greeting_name = u["name"] if u else "Entrenador"
        greeting = QLabel(f"Buenos días, {greeting_name} 👋")
        greeting.setFont(QFont("Segoe UI", 15, QFont.Weight.Bold))
        greeting.setStyleSheet(f"color: {C_TEXT};")

        new_btn = QPushButton("＋  Nuevo análisis")
        new_btn.setFixedHeight(38)
        new_btn.setFixedWidth(170)
        new_btn.setStyleSheet(
            f"background-color: {C_GREEN}; color: #000; font-weight: 700;"
            f"font-size: 13px; border-radius: 8px;"
        )
        new_btn.clicked.connect(self.new_analysis_requested)

        tb_lay.addWidget(greeting)
        tb_lay.addStretch()
        tb_lay.addWidget(new_btn)
        root.addWidget(topbar)

        # ── Contenido scrolleable ──
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.Shape.NoFrame)
        scroll.setStyleSheet("QScrollArea { background: transparent; border: none; }")

        content = QWidget()
        content.setStyleSheet("background: transparent;")
        content_lay = QVBoxLayout(content)
        content_lay.setContentsMargins(36, 28, 36, 36)
        content_lay.setSpacing(28)

        # Cards de resumen global
        self._summary_row = QHBoxLayout()
        self._summary_row.setSpacing(14)
        content_lay.addLayout(self._summary_row)

        # Sección partidos
        section_hdr = QHBoxLayout()
        section_title = QLabel("Partidos analizados")
        section_title.setObjectName("sectionTitle")
        section_hdr.addWidget(section_title)
        section_hdr.addStretch()
        content_lay.addLayout(section_hdr)

        # Lista de tarjetas
        self._cards_lay = QVBoxLayout()
        self._cards_lay.setSpacing(14)
        content_lay.addLayout(self._cards_lay)

        self._empty = EmptyState()
        content_lay.addWidget(self._empty)
        content_lay.addStretch()

        scroll.setWidget(content)
        root.addWidget(scroll, 1)

        self.refresh()

    def refresh(self):
        # Limpiar summary
        while self._summary_row.count():
            item = self._summary_row.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        # Limpiar tarjetas
        while self._cards_lay.count():
            item = self._cards_lay.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        matches = history.load()

        # Summary cards
        total_lo = sum(m.get("lineouts", 0) for m in matches)
        total_sc = sum(m.get("scrums",   0) for m in matches)
        total_ko = sum(m.get("kickoffs", 0) for m in matches)

        self._summary_row.addWidget(SummaryCard(
            str(len(matches)), "Partidos", "analizados con IA", C_GREEN))
        self._summary_row.addWidget(SummaryCard(
            str(total_lo), "Line-Outs", "detectados en total", C_GREEN))
        self._summary_row.addWidget(SummaryCard(
            str(total_sc), "Scrums", "detectados en total", C_BLUE))
        self._summary_row.addWidget(SummaryCard(
            str(total_ko), "Salidas", "detectadas en total", C_ORANGE))

        if not matches:
            self._empty.setVisible(True)
            return

        self._empty.setVisible(False)
        for m in matches:
            self._cards_lay.addWidget(MatchCard(m))
