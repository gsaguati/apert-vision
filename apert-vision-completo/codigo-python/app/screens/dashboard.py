import os
from pathlib import Path

from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QFrame, QScrollArea, QSizePolicy, QFileDialog,
)
from PyQt6.QtCore import Qt, pyqtSignal, QMimeData
from PyQt6.QtGui import QFont, QDragEnterEvent, QDropEvent, QPainter, QColor, QPen

from app.styles import (
    C_BG, C_SURFACE, C_SURFACE2, C_BORDER, C_BORDER2,
    C_GREEN, C_GREEN2, C_GREENBG, C_BLUE, C_ORANGE,
    C_TEXT, C_MUTED, C_MUTED2,
)
import app.mock_data as mock


# ── Stat card ──────────────────────────────────────────────────────────────────

class StatCard(QFrame):
    def __init__(self, icon: str, value: str, label: str, trend: str = "",
                 icon_bg: str = C_GREENBG, icon_color: str = C_GREEN):
        super().__init__()
        self.setObjectName("card")
        self.setFixedHeight(120)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)

        lay = QVBoxLayout(self)
        lay.setContentsMargins(20, 18, 20, 16)
        lay.setSpacing(6)

        # Icon box
        icon_box = QLabel(icon)
        icon_box.setFixedSize(32, 32)
        icon_box.setAlignment(Qt.AlignmentFlag.AlignCenter)
        icon_box.setStyleSheet(
            f"background-color: {icon_bg}; color: {icon_color};"
            f"border-radius: 8px; font-size: 15px;")

        # Value
        self._val_lbl = QLabel(value)
        self._val_lbl.setFont(QFont("Segoe UI", 24, QFont.Weight.Bold))
        self._val_lbl.setStyleSheet(f"color: {C_TEXT};")

        # Label
        lbl = QLabel(label)
        lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 12px;")

        # Trend
        self._trend_lbl = QLabel(trend)
        self._trend_lbl.setObjectName("green")
        self._trend_lbl.setVisible(bool(trend))

        lay.addWidget(icon_box)
        lay.addWidget(self._val_lbl)
        lay.addWidget(lbl)
        if trend:
            lay.addWidget(self._trend_lbl)

    def update_value(self, value: str, trend: str = ""):
        self._val_lbl.setText(value)
        self._trend_lbl.setText(trend)
        self._trend_lbl.setVisible(bool(trend))


# ── Drop zone ──────────────────────────────────────────────────────────────────

class DropZone(QFrame):
    file_selected = pyqtSignal(str)

    def __init__(self):
        super().__init__()
        self.setAcceptDrops(True)
        self.setObjectName("card")
        self.setMinimumHeight(200)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self._hover = False
        self._build()

    def _build(self):
        lay = QVBoxLayout(self)
        lay.setAlignment(Qt.AlignmentFlag.AlignCenter)
        lay.setSpacing(10)

        upload_icon = QLabel("⬆")
        upload_icon.setFixedSize(52, 52)
        upload_icon.setAlignment(Qt.AlignmentFlag.AlignCenter)
        upload_icon.setStyleSheet(
            f"background-color: {C_GREENBG}; color: {C_GREEN};"
            f"border-radius: 26px; font-size: 22px;")

        main_lbl = QLabel("Arrastrá tu video aquí")
        main_lbl.setFont(QFont("Segoe UI", 14, QFont.Weight.Bold))
        main_lbl.setStyleSheet(f"color: {C_TEXT};")
        main_lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)

        sub_lbl = QLabel("MP4, MOV o AVI · máx. 2 GB")
        sub_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 12px;")
        sub_lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)

        self._btn = QPushButton("Seleccionar archivo")
        self._btn.setFixedWidth(180)
        self._btn.setFixedHeight(36)
        self._btn.clicked.connect(self._browse)

        lay.addWidget(upload_icon, 0, Qt.AlignmentFlag.AlignCenter)
        lay.addWidget(main_lbl)
        lay.addWidget(sub_lbl)
        lay.addSpacing(6)
        lay.addWidget(self._btn, 0, Qt.AlignmentFlag.AlignCenter)

    def _browse(self):
        path, _ = QFileDialog.getOpenFileName(
            self, "Seleccionar video", "",
            "Video (*.mp4 *.avi *.mov *.mkv)")
        if path:
            self.file_selected.emit(path)

    def dragEnterEvent(self, e: QDragEnterEvent):
        if e.mimeData().hasUrls():
            self._hover = True
            self.update()
            e.acceptProposedAction()

    def dragLeaveEvent(self, _):
        self._hover = False
        self.update()

    def dropEvent(self, e: QDropEvent):
        self._hover = False
        self.update()
        urls = e.mimeData().urls()
        if urls:
            self.file_selected.emit(urls[0].toLocalFile())

    def paintEvent(self, _):
        p = QPainter(self)
        p.setRenderHint(QPainter.RenderHint.Antialiasing)
        W, H = self.width(), self.height()
        border_color = C_GREEN if self._hover else C_BORDER2
        bg_color = C_GREENBG if self._hover else C_SURFACE

        p.setPen(Qt.PenStyle.NoPen)
        p.setBrush(QColor(bg_color))
        p.drawRoundedRect(0, 0, W, H, 10, 10)

        pen = QPen(QColor(border_color), 1.5, Qt.PenStyle.DashLine)
        p.setPen(pen)
        p.setBrush(Qt.BrushStyle.NoBrush)
        p.drawRoundedRect(1, 1, W - 2, H - 2, 10, 10)
        p.end()
        super().paintEvent(_)


# ── Recent match row ───────────────────────────────────────────────────────────

class RecentMatchRow(QFrame):
    clicked = pyqtSignal(int)

    def __init__(self, match: dict):
        super().__init__()
        self._id = match["id"]
        self.setObjectName("card")
        self.setFixedHeight(62)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self.setStyleSheet(f"""
            QFrame#card {{
                background-color: {C_SURFACE};
                border: 1px solid {C_BORDER};
                border-radius: 8px;
            }}
            QFrame#card:hover {{
                background-color: {C_SURFACE2};
                border-color: {C_BORDER2};
            }}
        """)

        lay = QHBoxLayout(self)
        lay.setContentsMargins(14, 0, 14, 0)

        # Play button
        play = QLabel("▶")
        play.setFixedSize(30, 30)
        play.setAlignment(Qt.AlignmentFlag.AlignCenter)
        play.setStyleSheet(
            f"background-color: {C_SURFACE2}; color: {C_MUTED};"
            f"border-radius: 15px; font-size: 10px;")

        # Match info
        info_col = QVBoxLayout()
        info_col.setSpacing(2)
        name_lbl = QLabel(f"{match['team_local']} vs. {match['team_visit']}")
        name_lbl.setFont(QFont("Segoe UI", 12, QFont.Weight.Bold))
        name_lbl.setStyleSheet(f"color: {C_TEXT};")
        sub_lbl  = QLabel(
            f"{match['date']}  ·  {match.get('lineouts', 0)} line-outs")
        sub_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 11px;")
        info_col.addWidget(name_lbl)
        info_col.addWidget(sub_lbl)

        # Possession
        poss = match.get("possession_local", 0)
        rival_poss = 100 - poss
        poss_lbl = QLabel(
            f"<span style='color:{C_GREEN};font-weight:700'>{poss}%</span>"
            f" <span style='color:{C_MUTED}'>→</span> "
            f"<span style='color:{C_BLUE};font-weight:700'>{rival_poss}%</span>"
            f"<br><span style='color:{C_MUTED};font-size:10px'>posesión</span>"
        )
        poss_lbl.setTextFormat(Qt.TextFormat.RichText)
        poss_lbl.setAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)

        lay.addWidget(play)
        lay.addSpacing(10)
        lay.addLayout(info_col, 1)
        lay.addWidget(poss_lbl)

    def mousePressEvent(self, _):
        self.clicked.emit(self._id)


# ── Dashboard screen ───────────────────────────────────────────────────────────

class DashboardScreen(QWidget):
    new_analysis_requested = pyqtSignal(str)   # emite path del video
    view_match_requested   = pyqtSignal(int)   # emite match id

    def __init__(self):
        super().__init__()
        self._build_ui()

    def _build_ui(self):
        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("QScrollArea { background: transparent; border: none; }")

        content = QWidget()
        content.setStyleSheet("background: transparent;")
        lay = QVBoxLayout(content)
        lay.setContentsMargins(32, 28, 32, 32)
        lay.setSpacing(24)

        # ── Breadcrumb ──
        bc = QLabel("Apert Vision  ›  Dashboard")
        bc.setObjectName("breadcrumb")
        lay.addWidget(bc)

        # ── Stat cards row ──
        stats = mock.get_global_stats()
        cards_row = QHBoxLayout()
        cards_row.setSpacing(14)
        cards_row.addWidget(StatCard("📹", str(stats["total_matches"]),
            "Partidos analizados", "+3 este mes"))
        cards_row.addWidget(StatCard("〰", f"{stats['avg_possession']:.0f}%",
            "Posesión promedio", "+2% vs anterior",
            icon_bg=C_GREENBG, icon_color=C_GREEN))
        cards_row.addWidget(StatCard("⚡", str(stats["total_lineouts"]),
            "Line-outs detectados",
            f"{stats['total_lineouts']/max(stats['total_matches'],1):.1f} por partido",
            icon_bg="#1a2a0a", icon_color=C_GREEN))
        cards_row.addWidget(StatCard("⏱", f"{stats['total_hours']}h",
            "Horas de video", "80 min promedio",
            icon_bg="#1a1a2a", icon_color=C_BLUE))
        lay.addLayout(cards_row)

        # ── Two column layout ──
        two_col = QHBoxLayout()
        two_col.setSpacing(20)

        # Left: Nuevo Análisis
        left_col = QVBoxLayout()
        left_col.setSpacing(12)
        nuevo_lbl = QLabel("Nuevo Análisis")
        nuevo_lbl.setFont(QFont("Segoe UI", 14, QFont.Weight.Bold))
        nuevo_lbl.setStyleSheet(f"color: {C_TEXT};")
        left_col.addWidget(nuevo_lbl)
        self._drop_zone = DropZone()
        self._drop_zone.file_selected.connect(self.new_analysis_requested)
        left_col.addWidget(self._drop_zone)
        left_col.addStretch()

        # Right: Análisis recientes
        right_col = QVBoxLayout()
        right_col.setSpacing(10)

        rec_hdr = QHBoxLayout()
        rec_lbl = QLabel("Análisis Recientes")
        rec_lbl.setFont(QFont("Segoe UI", 14, QFont.Weight.Bold))
        rec_lbl.setStyleSheet(f"color: {C_TEXT};")
        ver_btn = QPushButton("Ver todos  ›")
        ver_btn.setObjectName("ghost")
        ver_btn.setStyleSheet(
            f"color: {C_GREEN}; font-size: 12px; font-weight: 600;"
            f"background: transparent; border: none;")
        rec_hdr.addWidget(rec_lbl)
        rec_hdr.addStretch()
        rec_hdr.addWidget(ver_btn)
        right_col.addLayout(rec_hdr)

        self._recent_lay = QVBoxLayout()
        self._recent_lay.setSpacing(8)
        right_col.addLayout(self._recent_lay)
        right_col.addStretch()

        two_col.addLayout(left_col, 55)
        two_col.addLayout(right_col, 45)
        lay.addLayout(two_col)

        scroll.setWidget(content)
        root.addWidget(scroll, 1)

        self._refresh_recent()

    def _refresh_recent(self):
        while self._recent_lay.count():
            item = self._recent_lay.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        analyzed = [m for m in mock.MATCHES if m["analyzed"]][:4]
        for m in analyzed:
            row = RecentMatchRow(m)
            row.clicked.connect(self.view_match_requested)
            self._recent_lay.addWidget(row)

    def refresh(self):
        self._refresh_recent()
