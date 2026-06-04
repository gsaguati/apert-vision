import os
from pathlib import Path

from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QFrame, QScrollArea, QSizePolicy, QGridLayout,
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont

from app.styles import C_BG, C_SURFACE, C_BORDER, C_GREEN, C_BLUE, C_ORANGE, C_TEXT, C_MUTED
import app.history as history


class MatchCard(QFrame):
    open_video_requested = pyqtSignal(str)

    def __init__(self, match: dict):
        super().__init__()
        self.match = match
        self.setFixedHeight(200)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.setStyleSheet(f"""
            QFrame {{
                background-color: {C_SURFACE};
                border: 1px solid {C_BORDER};
                border-radius: 12px;
            }}
            QFrame:hover {{
                border-color: {C_GREEN};
            }}
        """)
        self._build()

    def _build(self):
        m   = self.match
        lay = QVBoxLayout(self)
        lay.setContentsMargins(20, 18, 20, 18)
        lay.setSpacing(8)

        # Header: equipos + fecha
        header = QHBoxLayout()
        teams  = QLabel(f"{m['team_local']}  vs  {m['team_visit']}")
        teams.setFont(QFont("Segoe UI", 14, QFont.Weight.Bold))
        teams.setStyleSheet(f"color: {C_TEXT};")
        date_lbl = QLabel(m.get("date", ""))
        date_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 11px;")
        header.addWidget(teams)
        header.addStretch()
        header.addWidget(date_lbl)
        lay.addLayout(header)

        # Video nombre
        vid_lbl = QLabel(m.get("video", ""))
        vid_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 11px;")
        vid_lbl.setWordWrap(True)
        lay.addWidget(vid_lbl)

        lay.addStretch()

        # Stats chips
        chips = QHBoxLayout()
        chips.setSpacing(8)
        chips.addWidget(self._chip(str(m.get("lineouts",  0)), "Line-Outs", C_GREEN))
        chips.addWidget(self._chip(str(m.get("scrums",    0)), "Scrums",    C_BLUE))
        chips.addWidget(self._chip(str(m.get("kickoffs",  0)), "Salidas",   C_ORANGE))
        chips.addWidget(self._chip(str(m.get("total_events", 0)), "Total",  C_TEXT))
        chips.addStretch()

        # Duración del video
        dur = m.get("duration_sec", 0)
        if dur:
            mins, secs = divmod(int(dur), 60)
            dur_lbl = QLabel(f"⏱ {mins}:{secs:02d}")
            dur_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 11px;")
            chips.addWidget(dur_lbl)

        lay.addLayout(chips)

        # Botón abrir video
        out = m.get("output_path", "")
        if out and Path(out).exists():
            btn = QPushButton("▶  Abrir video")
            btn.setFixedHeight(32)
            btn.setObjectName("secondary")
            btn.clicked.connect(lambda: os.startfile(out))
            lay.addWidget(btn)

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
        chip_lay.setContentsMargins(10, 6, 10, 6)
        chip_lay.setSpacing(0)

        num = QLabel(number)
        num.setFont(QFont("Segoe UI", 18, QFont.Weight.ExtraBold))
        num.setStyleSheet(f"color: {color};")
        num.setAlignment(Qt.AlignmentFlag.AlignCenter)

        lbl = QLabel(label.upper())
        lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 8px; letter-spacing: 0.5px;")
        lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)

        chip_lay.addWidget(num)
        chip_lay.addWidget(lbl)
        return chip


class HomeScreen(QWidget):
    new_analysis_requested = pyqtSignal()

    def __init__(self):
        super().__init__()
        self.setStyleSheet(f"background-color: {C_BG};")
        self._build_ui()

    def _build_ui(self):
        root = QVBoxLayout(self)
        root.setContentsMargins(36, 32, 36, 32)
        root.setSpacing(24)

        # Header
        header = QHBoxLayout()
        title_col = QVBoxLayout()
        title_col.setSpacing(4)
        title = QLabel("Mis Partidos")
        title.setFont(QFont("Segoe UI", 22, QFont.Weight.Bold))
        title.setStyleSheet(f"color: {C_TEXT};")
        subtitle = QLabel("Historial de análisis realizados con Apert Vision")
        subtitle.setStyleSheet(f"color: {C_MUTED}; font-size: 13px;")
        title_col.addWidget(title)
        title_col.addWidget(subtitle)

        new_btn = QPushButton("＋  Nuevo análisis")
        new_btn.setFixedHeight(42)
        new_btn.setFixedWidth(180)
        new_btn.setStyleSheet(
            f"background-color: {C_GREEN}; color: #000; font-weight: 700;"
            f"font-size: 13px; border-radius: 8px;"
        )
        new_btn.clicked.connect(self.new_analysis_requested)

        header.addLayout(title_col)
        header.addStretch()
        header.addWidget(new_btn)
        root.addLayout(header)

        # Scroll area con tarjetas
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.Shape.NoFrame)
        scroll.setStyleSheet("QScrollArea { background: transparent; border: none; }")

        self._cards_widget = QWidget()
        self._cards_widget.setStyleSheet("background: transparent;")
        self._cards_layout = QVBoxLayout(self._cards_widget)
        self._cards_layout.setSpacing(14)
        self._cards_layout.setContentsMargins(0, 0, 0, 0)

        scroll.setWidget(self._cards_widget)
        root.addWidget(scroll, 1)

        self._empty_lbl = QLabel(
            "Todavía no analizaste ningún partido.\n"
            "Presioná \"Nuevo análisis\" para empezar."
        )
        self._empty_lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self._empty_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 14px;")
        root.addWidget(self._empty_lbl)
        self._empty_lbl.setVisible(False)

        self.refresh()

    def refresh(self):
        # Limpiar tarjetas anteriores
        while self._cards_layout.count():
            item = self._cards_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        matches = history.load()
        if not matches:
            self._empty_lbl.setVisible(True)
            return

        self._empty_lbl.setVisible(False)
        for m in matches:
            card = MatchCard(m)
            self._cards_layout.addWidget(card)

        self._cards_layout.addStretch()
