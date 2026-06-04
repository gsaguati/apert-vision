"""Vista detallada de un análisis completado."""
import os
from pathlib import Path

from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QFrame, QScrollArea, QSizePolicy,
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont, QPainter, QColor, QBrush, QPen

from app.styles import (
    C_BG, C_SURFACE, C_SURFACE2, C_BORDER, C_BORDER2,
    C_GREEN, C_GREEN2, C_GREENBG, C_BLUE, C_BLUEBG,
    C_ORANGE, C_ORANGEBG, C_TEXT, C_MUTED, C_MUTED2,
)
from app.charts import AreaChart


# ── Small stat card for side panel ─────────────────────────────────────────────

class SideStatCard(QFrame):
    def __init__(self, icon: str, value: str, label: str,
                 icon_bg: str = C_GREENBG, icon_color: str = C_GREEN):
        super().__init__()
        self.setObjectName("card")
        self.setFixedHeight(68)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)

        lay = QHBoxLayout(self)
        lay.setContentsMargins(14, 0, 14, 0)
        lay.setSpacing(14)

        icon_lbl = QLabel(icon)
        icon_lbl.setFixedSize(36, 36)
        icon_lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
        icon_lbl.setStyleSheet(
            f"background-color: {icon_bg}; color: {icon_color};"
            f"border-radius: 8px; font-size: 16px;")

        info = QVBoxLayout()
        info.setSpacing(1)
        self._val = QLabel(value)
        self._val.setFont(QFont("Segoe UI", 16, QFont.Weight.Bold))
        self._val.setStyleSheet(f"color: {C_TEXT};")
        lbl = QLabel(label)
        lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 11px;")
        info.addWidget(self._val)
        info.addWidget(lbl)

        lay.addWidget(icon_lbl)
        lay.addLayout(info, 1)

    def update_value(self, v: str):
        self._val.setText(v)


# ── Fake video frame (shows mock detection) ────────────────────────────────────

class VideoFrame(QFrame):
    def __init__(self):
        super().__init__()
        self.setObjectName("card")
        self.setMinimumHeight(320)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
        self._team_a   = "Local"
        self._team_b   = "Visitante"
        self._poss_a   = 58
        self._has_data = False

    def set_match(self, match: dict):
        self._team_a   = match.get("team_local",  "Local")
        self._team_b   = match.get("team_visit",  "Visitante")
        self._poss_a   = match.get("possession_local", 50)
        self._has_data = match.get("analyzed", False)
        self.update()

    def paintEvent(self, _):
        p = QPainter(self)
        p.setRenderHint(QPainter.RenderHint.Antialiasing)
        W, H = self.width(), self.height()

        # Dark green field background
        p.setPen(Qt.PenStyle.NoPen)
        p.setBrush(QBrush(QColor("#0a1f10")))
        p.drawRoundedRect(0, 0, W, H, 10, 10)

        if not self._has_data:
            p.setPen(QPen(QColor(C_MUTED)))
            p.setFont(QFont("Segoe UI", 13))
            p.drawText(0, 0, W, H, Qt.AlignmentFlag.AlignCenter,
                       "Sin análisis de video disponible")
            p.end()
            return

        # Field lines (subtle)
        p.setPen(QPen(QColor("#1a3520"), 1))
        p.drawRect(40, 30, W - 80, H - 80)
        p.drawLine(W // 2, 30, W // 2, H - 50)
        p.drawEllipse(W // 2 - 40, H // 2 - 40 - 15, 80, 80)

        # LINE-OUT bounding box
        box_x, box_y, box_w, box_h = 120, 80, 220, 160
        p.setPen(QPen(QColor(C_GREEN), 2))
        p.setBrush(Qt.BrushStyle.NoBrush)
        p.drawRect(box_x, box_y, box_w, box_h)

        tag_w = 130
        p.setPen(Qt.PenStyle.NoPen)
        p.setBrush(QBrush(QColor(C_GREEN)))
        p.drawRoundedRect(box_x, box_y - 24, tag_w, 22, 4, 4)
        p.setPen(QPen(QColor("#000")))
        p.setFont(QFont("Segoe UI", 10, QFont.Weight.Bold))
        p.drawText(box_x + 4, box_y - 24, tag_w - 4, 22,
                   Qt.AlignmentFlag.AlignCenter, "LINE-OUT  97%")

        # PELOTA bounding box
        bx2, by2 = W - 260, H // 2 - 60
        p.setPen(QPen(QColor(C_BLUE), 2))
        p.setBrush(Qt.BrushStyle.NoBrush)
        p.drawRect(bx2, by2, 130, 100)
        p.setPen(Qt.PenStyle.NoPen)
        p.setBrush(QBrush(QColor(C_BLUE)))
        p.drawRoundedRect(bx2, by2 - 24, 120, 22, 4, 4)
        p.setPen(QPen(QColor("#000")))
        p.drawText(bx2 + 4, by2 - 24, 116, 22,
                   Qt.AlignmentFlag.AlignCenter, "PELOTA  89%")

        # Possession overlay bar
        bar_h = 32
        bar_y = H - bar_h - 16
        bar_x, bar_w = 60, W - 120

        # Semi-transparent bg
        bg = QColor("#000000")
        bg.setAlpha(140)
        p.setPen(Qt.PenStyle.NoPen)
        p.setBrush(QBrush(bg))
        p.drawRoundedRect(bar_x - 8, bar_y - 6, bar_w + 16, bar_h + 12, 6, 6)

        # Team A name
        p.setPen(QPen(QColor(C_GREEN)))
        p.setFont(QFont("Segoe UI", 10, QFont.Weight.Bold))
        a_text = f"{self._team_a.upper()[:12]}  {self._poss_a}%"
        p.drawText(bar_x, bar_y, 160, bar_h, Qt.AlignmentFlag.AlignVCenter, a_text)

        # Bar
        split = int(bar_w * 0.5 * self._poss_a / 50)  # normalized
        split = min(split, bar_w - 4)
        mid_x = bar_x + 170
        actual_bar_w = bar_w - 340
        if actual_bar_w > 0:
            p.setBrush(QBrush(QColor(C_GREEN)))
            p.drawRoundedRect(mid_x, bar_y + 10, actual_bar_w, 12, 6, 6)
            split_x = mid_x + int(actual_bar_w * self._poss_a / 100)
            p.setBrush(QBrush(QColor(C_BLUE)))
            p.drawRoundedRect(split_x, bar_y + 10, actual_bar_w - (split_x - mid_x), 12, 6, 6)

        # Team B name
        p.setPen(QPen(QColor(C_BLUE)))
        b_text = f"{100 - self._poss_a}%  {self._team_b.upper()[:12]}"
        p.drawText(bar_x + bar_w - 160, bar_y, 160, bar_h,
                   Qt.AlignmentFlag.AlignVCenter | Qt.AlignmentFlag.AlignRight, b_text)

        p.end()


# ── Event timeline row ─────────────────────────────────────────────────────────

class EventRow(QFrame):
    def __init__(self, ev: dict):
        super().__init__()
        self.setFixedHeight(40)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.setStyleSheet(f"""
            QFrame {{
                border-bottom: 1px solid {C_BORDER};
                background: transparent;
            }}
            QFrame:hover {{ background-color: {C_SURFACE2}; }}
        """)

        lay = QHBoxLayout(self)
        lay.setContentsMargins(12, 0, 12, 0)

        time_lbl = QLabel(ev.get("time_str", ""))
        time_lbl.setFixedWidth(44)
        time_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 12px; font-family: 'Consolas';")

        color_map = {"lineout": C_GREEN, "scrum": C_BLUE, "kickoff": C_ORANGE}
        bg_map    = {"lineout": C_GREENBG, "scrum": C_BLUEBG, "kickoff": C_ORANGEBG}
        c  = color_map.get(ev["type"], C_TEXT)
        bg = bg_map.get(ev["type"],    C_SURFACE2)

        badge = QLabel(ev["label"])
        badge.setFixedWidth(90)
        badge.setAlignment(Qt.AlignmentFlag.AlignCenter)
        badge.setStyleSheet(
            f"color: {c}; background-color: {bg};"
            f"border-radius: 4px; padding: 2px 6px;"
            f"font-size: 11px; font-weight: 700;")

        team_lbl = QLabel(ev.get("team", ""))
        team_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 12px;")

        conf_lbl = QLabel(f"{ev.get('confidence', 0):.0%}")
        conf_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 12px;")
        conf_lbl.setAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)

        lay.addWidget(time_lbl)
        lay.addWidget(badge)
        lay.addSpacing(8)
        lay.addWidget(team_lbl, 1)
        lay.addWidget(conf_lbl)


# ── Main viewer ────────────────────────────────────────────────────────────────

class AnalysisViewerScreen(QWidget):
    back_requested = pyqtSignal()

    def __init__(self):
        super().__init__()
        self._match = None
        self._build_ui()

    def _build_ui(self):
        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("background: transparent; border: none;")

        content = QWidget()
        content.setStyleSheet("background: transparent;")
        lay = QVBoxLayout(content)
        lay.setContentsMargins(32, 24, 32, 32)
        lay.setSpacing(20)

        # Breadcrumb
        bc = QLabel("Apert Vision  ›  Análisis")
        bc.setObjectName("breadcrumb")
        lay.addWidget(bc)

        # Header
        hdr_row = QHBoxLayout()
        self._title_lbl = QLabel("Partido")
        self._title_lbl.setFont(QFont("Segoe UI", 18, QFont.Weight.Bold))
        self._title_lbl.setStyleSheet(f"color: {C_TEXT};")
        self._sub_lbl = QLabel("")
        self._sub_lbl.setObjectName("pageSub")

        title_col = QVBoxLayout()
        title_col.setSpacing(3)
        title_col.addWidget(self._title_lbl)
        title_col.addWidget(self._sub_lbl)

        export_btn = QPushButton("⬇  Exportar PDF")
        export_btn.setFixedHeight(38)
        export_btn.setFixedWidth(150)

        hdr_row.addLayout(title_col)
        hdr_row.addStretch()
        hdr_row.addWidget(export_btn)
        lay.addLayout(hdr_row)

        # Main: video + side stats
        main_row = QHBoxLayout()
        main_row.setSpacing(16)

        # Video
        video_col = QVBoxLayout()
        self._video_frame = VideoFrame()
        video_col.addWidget(self._video_frame, 1)

        # Fake controls bar
        ctrl = QFrame()
        ctrl.setObjectName("card")
        ctrl.setFixedHeight(46)
        ctrl_lay = QHBoxLayout(ctrl)
        ctrl_lay.setContentsMargins(16, 0, 16, 0)
        for btn_text in ["▶", "⏭", "🔊"]:
            b = QLabel(btn_text)
            b.setStyleSheet(f"color: {C_MUTED}; font-size: 14px;")
            ctrl_lay.addWidget(b)
        ctrl_lay.addSpacing(8)
        self._time_lbl = QLabel("00:00 / 80:00")
        self._time_lbl.setStyleSheet(
            f"color: {C_MUTED}; font-size: 12px; font-family: Consolas;")
        ctrl_lay.addWidget(self._time_lbl)
        ctrl_lay.addStretch()
        speed_lbl = QLabel("1x")
        speed_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 11px;")
        ctrl_lay.addWidget(speed_lbl)
        video_col.addWidget(ctrl)

        main_row.addLayout(video_col, 3)

        # Side stat cards
        side_col = QVBoxLayout()
        side_col.setSpacing(10)
        self._card_lo   = SideStatCard("⚡", "0", "Line-outs detectados", C_GREENBG, C_GREEN)
        self._card_sc   = SideStatCard("⚡", "0", "Scrums detectados",    "#0a1a2a", C_BLUE)
        self._card_ko   = SideStatCard("⚡", "0", "Salidas 22",           C_ORANGEBG, C_ORANGE)
        self._card_dur  = SideStatCard("⏱", "80:00", "Duración del partido", C_SURFACE2, C_MUTED)
        self._card_conf = SideStatCard("〰", "—", "Confianza promedio",    C_GREENBG, C_GREEN)
        for card in (self._card_lo, self._card_sc, self._card_ko, self._card_dur, self._card_conf):
            side_col.addWidget(card)
        side_col.addStretch()
        main_row.addLayout(side_col, 1)

        lay.addLayout(main_row)

        # Bottom: possession chart + timeline
        bottom_row = QHBoxLayout()
        bottom_row.setSpacing(16)

        # Possession chart
        poss_card = QFrame()
        poss_card.setObjectName("card")
        poss_card.setMinimumHeight(220)
        poss_lay = QVBoxLayout(poss_card)
        poss_lay.setContentsMargins(16, 16, 16, 12)

        poss_title = QLabel("Posesión por Minuto")
        poss_title.setFont(QFont("Segoe UI", 13, QFont.Weight.Bold))
        poss_title.setStyleSheet(f"color: {C_TEXT};")

        self._legend_lbl = QLabel(
            f"<span style='color:{C_GREEN}'>●</span>  Local 58%"
            f"  <span style='color:{C_BLUE}'>●</span>  Visitante 42%")
        self._legend_lbl.setTextFormat(Qt.TextFormat.RichText)
        self._legend_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 11px;")

        self._area_chart = AreaChart()
        self._area_chart.setMinimumHeight(140)

        poss_lay.addWidget(poss_title)
        poss_lay.addWidget(self._legend_lbl)
        poss_lay.addWidget(self._area_chart, 1)

        # Timeline
        timeline_card = QFrame()
        timeline_card.setObjectName("card")
        timeline_card.setMinimumHeight(220)
        tl_lay = QVBoxLayout(timeline_card)
        tl_lay.setContentsMargins(16, 16, 0, 0)

        tl_title = QLabel("Timeline de Eventos")
        tl_title.setFont(QFont("Segoe UI", 13, QFont.Weight.Bold))
        tl_title.setStyleSheet(f"color: {C_TEXT};")
        tl_lay.addWidget(tl_title)
        tl_lay.addSpacing(6)

        events_scroll = QScrollArea()
        events_scroll.setWidgetResizable(True)
        events_scroll.setStyleSheet("background: transparent; border: none;")
        self._events_container = QWidget()
        self._events_container.setStyleSheet("background: transparent;")
        self._events_lay = QVBoxLayout(self._events_container)
        self._events_lay.setContentsMargins(0, 0, 0, 0)
        self._events_lay.setSpacing(0)
        events_scroll.setWidget(self._events_container)
        tl_lay.addWidget(events_scroll, 1)

        bottom_row.addWidget(poss_card, 55)
        bottom_row.addWidget(timeline_card, 45)
        lay.addLayout(bottom_row)

        scroll.setWidget(content)
        root.addWidget(scroll, 1)

    def load_match(self, match: dict):
        self._match = match
        tl = f"{match['date']}  ·  {match.get('duration_min', 80)}:00  ·  {match.get('competition', '')}"
        self._title_lbl.setText(f"{match['team_local']} vs. {match['team_visit']}")
        self._sub_lbl.setText(tl)
        self._video_frame.set_match(match)
        self._card_lo.update_value(str(match.get("lineouts",    0)))
        self._card_sc.update_value(str(match.get("scrums",      0)))
        self._card_ko.update_value(str(match.get("kickoffs",    0)))
        self._card_conf.update_value(f"{match.get('avg_confidence', 0):.1f}%")

        # Possession area chart
        series = match.get("possession_series", [])
        if series:
            b_series = [100 - v for v in series]
            self._area_chart.set_data(
                series, b_series,
                match["team_local"], match["team_visit"])
            poss = match.get("possession_local", 50)
            self._legend_lbl.setText(
                f"<span style='color:{C_GREEN}'>●</span>"
                f"  {match['team_local']} {poss}%"
                f"  <span style='color:{C_BLUE}'>●</span>"
                f"  {match['team_visit']} {100-poss}%")
            self._legend_lbl.setTextFormat(Qt.TextFormat.RichText)

        # Events timeline
        while self._events_lay.count():
            item = self._events_lay.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        for ev in match.get("events", []):
            self._events_lay.addWidget(EventRow(ev))
        self._events_lay.addStretch()
