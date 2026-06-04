from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QFrame, QScrollArea, QSizePolicy,
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont, QPainter, QColor, QBrush

from app.styles import (
    C_BG, C_SURFACE, C_SURFACE2, C_BORDER, C_BORDER2,
    C_GREEN, C_GREENBG, C_RED, C_REDBG, C_TEXT, C_MUTED, C_MUTED2,
)
import app.mock_data as mock


class ResultBadge(QLabel):
    _STYLES = {
        "W": (C_GREEN, C_GREENBG),
        "L": (C_RED,   C_REDBG),
        "D": (C_MUTED, C_SURFACE2),
    }

    def __init__(self, result: str):
        super().__init__(result)
        color, bg = self._STYLES.get(result, (C_MUTED, C_SURFACE2))
        self.setFixedSize(32, 32)
        self.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.setStyleSheet(
            f"background-color: {bg}; color: {color};"
            f"border-radius: 16px; font-size: 13px; font-weight: 800;")


class SummaryCard(QFrame):
    def __init__(self, icon: str, value: str, label: str,
                 icon_color: str, icon_bg: str):
        super().__init__()
        self.setObjectName("card")
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.setFixedHeight(80)

        lay = QHBoxLayout(self)
        lay.setContentsMargins(20, 0, 20, 0)
        lay.setSpacing(16)

        icon_lbl = QLabel(icon)
        icon_lbl.setFixedSize(36, 36)
        icon_lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
        icon_lbl.setStyleSheet(
            f"background-color: {icon_bg}; color: {icon_color};"
            f"border-radius: 8px; font-size: 18px;")

        val_lbl = QLabel(value)
        val_lbl.setFont(QFont("Segoe UI", 22, QFont.Weight.Bold))
        val_lbl.setStyleSheet(f"color: {icon_color};")

        lbl = QLabel(label)
        lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 12px;")

        lay.addWidget(icon_lbl)
        val_col = QVBoxLayout()
        val_col.setSpacing(1)
        val_col.addWidget(val_lbl)
        val_col.addWidget(lbl)
        lay.addLayout(val_col, 1)


class MatchRow(QFrame):
    view_clicked   = pyqtSignal(int)
    delete_clicked = pyqtSignal(int)

    def __init__(self, match: dict):
        super().__init__()
        self._id = match["id"]
        self.setObjectName("card")
        self.setFixedHeight(68)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.setStyleSheet(f"""
            QFrame#card {{
                background-color: {C_SURFACE};
                border: 1px solid {C_BORDER};
                border-radius: 8px;
            }}
            QFrame#card:hover {{ background-color: {C_SURFACE2}; }}
        """)
        self._build(match)

    def _build(self, m: dict):
        lay = QHBoxLayout(self)
        lay.setContentsMargins(14, 0, 14, 0)
        lay.setSpacing(14)

        lay.addWidget(ResultBadge(m["result"]))

        # Match info
        info = QVBoxLayout()
        info.setSpacing(2)
        name = QLabel(f"{m['team_local']} vs. {m['team_visit']}")
        name.setFont(QFont("Segoe UI", 13, QFont.Weight.Bold))
        name.setStyleSheet(f"color: {C_TEXT};")
        sub = QLabel(f"📅  {m['date']}  ·  {m.get('competition', '')}")
        sub.setStyleSheet(f"color: {C_MUTED}; font-size: 11px;")
        info.addWidget(name)
        info.addWidget(sub)
        lay.addLayout(info, 1)

        # Score
        score = m.get("score_local", 0)
        score_v = m.get("score_visit", 0)
        score_lbl = QLabel(f"{score}-{score_v}")
        score_lbl.setFont(QFont("Segoe UI", 15, QFont.Weight.Bold))
        score_lbl.setStyleSheet(f"color: {C_TEXT};")
        score_lbl.setFixedWidth(70)
        score_lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
        lay.addWidget(score_lbl)

        # Status badge
        if m.get("analyzed"):
            status = QLabel("ANALIZADO")
            status.setStyleSheet(
                f"color: {C_GREEN}; background-color: {C_GREENBG};"
                f"border: 1px solid {C_GREEN}; border-radius: 4px;"
                f"padding: 3px 8px; font-size: 10px; font-weight: 700; letter-spacing: 1px;")
            ver_btn = QPushButton("Ver  ›")
            ver_btn.setObjectName("ghost")
            ver_btn.setStyleSheet(
                f"color: {C_GREEN}; background: transparent; border: none;"
                f"font-size: 12px; font-weight: 600;")
            ver_btn.clicked.connect(lambda: self.view_clicked.emit(self._id))
            lay.addWidget(status)
            lay.addWidget(ver_btn)
        else:
            status = QLabel("SIN ANÁLISIS")
            status.setStyleSheet(
                f"color: {C_MUTED}; background-color: {C_SURFACE2};"
                f"border: 1px solid {C_BORDER}; border-radius: 4px;"
                f"padding: 3px 8px; font-size: 10px; font-weight: 600; letter-spacing: 1px;")
            lay.addWidget(status)

        del_btn = QPushButton("🗑")
        del_btn.setObjectName("danger")
        del_btn.setFixedSize(30, 30)
        del_btn.clicked.connect(lambda: self.delete_clicked.emit(self._id))
        lay.addWidget(del_btn)


class MatchesScreen(QWidget):
    view_match_requested = pyqtSignal(int)

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

        # Breadcrumb
        bc = QLabel("Apert Vision  ›  Partidos")
        bc.setObjectName("breadcrumb")
        lay.addWidget(bc)

        # Header
        stats = mock.get_global_stats()
        hdr = QHBoxLayout()
        title_col = QVBoxLayout()
        title_col.setSpacing(3)
        title = QLabel("Partidos")
        title.setObjectName("pageTitle")
        sub = QLabel(
            f"Temporada 2026  ·  "
            f"{stats['wins']}V {stats['draws']}E {stats['losses']}D")
        sub.setObjectName("pageSub")
        title_col.addWidget(title)
        title_col.addWidget(sub)

        reg_btn = QPushButton("＋  Registrar partido")
        reg_btn.setFixedHeight(38)
        reg_btn.setFixedWidth(190)

        hdr.addLayout(title_col)
        hdr.addStretch()
        hdr.addWidget(reg_btn)
        lay.addLayout(hdr)

        # Summary cards
        cards_row = QHBoxLayout()
        cards_row.setSpacing(14)
        cards_row.addWidget(SummaryCard("🏆", str(stats["wins"]),   "Victorias", C_GREEN, C_GREENBG))
        cards_row.addWidget(SummaryCard("🏆", str(stats["losses"]), "Derrotas",  C_RED,   C_REDBG))
        cards_row.addWidget(SummaryCard("🏆", str(stats["draws"]),  "Empates",   C_MUTED, C_SURFACE2))
        lay.addLayout(cards_row)

        # Match list
        self._matches_lay = QVBoxLayout()
        self._matches_lay.setSpacing(10)
        lay.addLayout(self._matches_lay)
        lay.addStretch()

        scroll.setWidget(content)
        root.addWidget(scroll, 1)

        self._populate()

    def _populate(self):
        while self._matches_lay.count():
            item = self._matches_lay.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        for m in mock.MATCHES:
            row = MatchRow(m)
            row.view_clicked.connect(self.view_match_requested)
            self._matches_lay.addWidget(row)
