from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QFrame,
    QScrollArea, QSizePolicy,
)
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QFont, QColor

from app.styles import (
    C_BG, C_SURFACE, C_SURFACE2, C_BORDER, C_BORDER2,
    C_GREEN, C_GREENBG, C_BLUE, C_ORANGE, C_TEXT, C_MUTED, C_MUTED2,
)
from app.charts import BarChart, DonutChart, RadarChart
import app.mock_data as mock


class BigStatCard(QFrame):
    def __init__(self, value: str, label: str, sub: str, color: str = C_TEXT):
        super().__init__()
        self.setObjectName("card")
        self.setFixedHeight(100)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        # Explicit style to ensure border is visible
        self.setStyleSheet(f"""
            QFrame#card {{
                background-color: {C_SURFACE};
                border: 1px solid {C_BORDER2};
                border-radius: 10px;
            }}
        """)

        lay = QVBoxLayout(self)
        lay.setContentsMargins(20, 16, 20, 12)
        lay.setSpacing(2)

        val = QLabel(value)
        val.setFont(QFont("Segoe UI", 28, QFont.Weight.ExtraBold))
        val.setStyleSheet(f"color: {color};")

        lbl = QLabel(label)
        lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 12px;")

        sub_lbl = QLabel(sub)
        sub_lbl.setObjectName("green")
        sub_lbl.setStyleSheet(f"color: {C_GREEN}; font-size: 11px; font-weight: 600;")

        lay.addWidget(val)
        lay.addWidget(lbl)
        lay.addWidget(sub_lbl)


class StatsScreen(QWidget):
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
        bc = QLabel("Apert Vision  ›  Estadísticas")
        bc.setObjectName("breadcrumb")
        lay.addWidget(bc)

        # Header
        stats = mock.get_global_stats()
        title = QLabel("Estadísticas Globales")
        title.setObjectName("pageTitle")
        sub = QLabel(
            f"Temporada 2026  ·  {stats['total_matches']} partidos analizados")
        sub.setObjectName("pageSub")
        lay.addWidget(title)
        lay.addWidget(sub)

        # Big stat cards
        cards_row = QHBoxLayout()
        cards_row.setSpacing(14)
        analyzed = [m for m in mock.MATCHES if m["analyzed"]]
        lo_per   = stats["total_lineouts"] / max(stats["total_matches"], 1)
        sc_per   = stats["total_scrums"]   / max(stats["total_matches"], 1)
        cards_row.addWidget(BigStatCard(
            str(stats["total_lineouts"]), "Total line-outs",
            f"{lo_per:.1f} por partido"))
        cards_row.addWidget(BigStatCard(
            str(stats["total_scrums"]), "Total scrums",
            f"{sc_per:.1f} por partido", C_BLUE))
        cards_row.addWidget(BigStatCard(
            f"{stats['avg_possession']:.0f}%", "Posesión promedio",
            "+8% vs rivales"))
        cards_row.addWidget(BigStatCard(
            f"{stats['avg_confidence']:.1f}%", "Confianza IA",
            "precisión YOLO", C_GREEN))
        lay.addLayout(cards_row)

        # Charts row 1: Bar + Donut
        charts_row = QHBoxLayout()
        charts_row.setSpacing(16)

        # Bar chart
        bar_card = QFrame()
        bar_card.setObjectName("card")
        bar_card.setMinimumHeight(280)
        bar_lay = QVBoxLayout(bar_card)
        bar_lay.setContentsMargins(16, 16, 16, 12)
        bar_lbl = QLabel("Formaciones por Partido")
        bar_lbl.setFont(QFont("Segoe UI", 13, QFont.Weight.Bold))
        bar_lbl.setStyleSheet(f"color: {C_TEXT};")
        bar_lay.addWidget(bar_lbl)
        bar_chart = BarChart()
        groups = []
        for m in analyzed:
            abbrev = m["team_visit"][:2].upper()
            groups.append({
                "label": abbrev,
                "values": [m["lineouts"], m["scrums"], m["kickoffs"]]
            })
        bar_chart.set_data(groups)
        bar_lay.addWidget(bar_chart, 1)

        # Donut + legend
        donut_card = QFrame()
        donut_card.setObjectName("card")
        donut_card.setFixedWidth(260)
        donut_card.setMinimumHeight(280)
        donut_lay = QVBoxLayout(donut_card)
        donut_lay.setContentsMargins(16, 16, 16, 16)
        donut_lay.setAlignment(Qt.AlignmentFlag.AlignTop)
        donut_lbl = QLabel("Posesión Promedio")
        donut_lbl.setFont(QFont("Segoe UI", 13, QFont.Weight.Bold))
        donut_lbl.setStyleSheet(f"color: {C_TEXT};")
        donut_lay.addWidget(donut_lbl)
        donut_lay.addSpacing(8)
        avg_poss = stats["avg_possession"]
        donut = DonutChart(int(avg_poss), mock.CLUB_NAME, "Rivales")
        donut_lay.addWidget(donut, 0, Qt.AlignmentFlag.AlignCenter)
        donut_lay.addSpacing(12)

        def legend_row(color, label, pct):
            w = QWidget()
            rl = QHBoxLayout(w)
            rl.setContentsMargins(0, 0, 0, 0)
            rl.setSpacing(10)
            dot = QLabel("●")
            dot.setStyleSheet(f"color: {color}; font-size: 12px;")
            name = QLabel(label)
            name.setStyleSheet(f"color: {C_TEXT}; font-size: 12px;")
            pct_lbl = QLabel(f"{pct:.0f}%")
            pct_lbl.setStyleSheet(
                f"color: {C_MUTED}; font-size: 12px; font-weight: 600;")
            rl.addWidget(dot)
            rl.addWidget(name, 1)
            rl.addWidget(pct_lbl)
            return w

        donut_lay.addWidget(legend_row(C_GREEN, mock.CLUB_NAME, avg_poss))
        donut_lay.addWidget(legend_row("#1c3a4a", "Rivales", 100 - avg_poss))
        donut_lay.addStretch()

        charts_row.addWidget(bar_card, 1)
        charts_row.addWidget(donut_card)
        lay.addLayout(charts_row)

        # Radar chart
        radar_card = QFrame()
        radar_card.setObjectName("card")
        radar_card.setMinimumHeight(300)
        radar_lay = QVBoxLayout(radar_card)
        radar_lay.setContentsMargins(16, 16, 16, 16)
        radar_lbl = QLabel("Perfil de Rendimiento del Equipo")
        radar_lbl.setFont(QFont("Segoe UI", 13, QFont.Weight.Bold))
        radar_lbl.setStyleSheet(f"color: {C_TEXT};")
        radar_lay.addWidget(radar_lbl)
        radar = RadarChart([0.85, 0.58, 0.72, 0.65, 0.70, 0.80])
        radar_lay.addWidget(radar, 1)
        lay.addWidget(radar_card)

        lay.addStretch()
        scroll.setWidget(content)
        root.addWidget(scroll, 1)
