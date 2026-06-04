"""Widgets de gráficos custom (QPainter). Sin dependencias externas."""
import math
from PyQt6.QtWidgets import QWidget, QSizePolicy
from PyQt6.QtCore import Qt, QPointF, QRectF
from PyQt6.QtGui import (
    QPainter, QPen, QBrush, QColor, QFont, QPainterPath,
    QLinearGradient, QFontMetrics,
)
from app.styles import (
    C_BG, C_SURFACE, C_SURFACE2, C_BORDER, C_BORDER2,
    C_GREEN, C_BLUE, C_BLUEBG, C_ORANGE, C_TEXT, C_MUTED, C_MUTED2,
    C_GREENBG,
)


# ── Area Chart ─────────────────────────────────────────────────────────────────

class AreaChart(QWidget):
    """Gráfico de área para posesión por minuto (dos series)."""

    def __init__(self, series_a=None, series_b=None,
                 color_a=C_GREEN, color_b=C_BLUE,
                 label_a="Local", label_b="Visitante"):
        super().__init__()
        self._series_a = series_a or []
        self._series_b = series_b or []
        self._color_a  = color_a
        self._color_b  = color_b
        self._label_a  = label_a
        self._label_b  = label_b
        self.setMinimumHeight(160)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Preferred)

    def set_data(self, series_a, series_b, label_a="Local", label_b="Visitante"):
        self._series_a = series_a
        self._series_b = series_b
        self._label_a  = label_a
        self._label_b  = label_b
        self.update()

    def paintEvent(self, _):
        p = QPainter(self)
        p.setRenderHint(QPainter.RenderHint.Antialiasing)
        W, H = self.width(), self.height()
        PAD_L, PAD_R, PAD_T, PAD_B = 38, 16, 16, 28

        chart_w = W - PAD_L - PAD_R
        chart_h = H - PAD_T - PAD_B

        # Background
        p.setPen(Qt.PenStyle.NoPen)
        p.setBrush(QBrush(QColor(C_BG)))
        p.drawRect(0, 0, W, H)

        # Grid lines
        p.setPen(QPen(QColor(C_BORDER), 1, Qt.PenStyle.SolidLine))
        for i in range(5):
            y = PAD_T + int(chart_h * i / 4)
            p.drawLine(PAD_L, y, PAD_L + chart_w, y)

        # Y axis labels
        p.setPen(QPen(QColor(C_MUTED)))
        font = QFont("Segoe UI", 8)
        p.setFont(font)
        for i in range(5):
            val = 80 - i * 20
            y   = PAD_T + int(chart_h * i / 4)
            p.drawText(0, y + 4, PAD_L - 4, 12, Qt.AlignmentFlag.AlignRight, str(val))

        if not self._series_a:
            p.end()
            return

        n = len(self._series_a)

        def pts(series):
            return [QPointF(PAD_L + chart_w * i / (n - 1),
                            PAD_T + chart_h * (1 - (v / 100)))
                    for i, v in enumerate(series)]

        def smooth_path(points):
            path = QPainterPath()
            if not points:
                return path
            path.moveTo(points[0])
            for i in range(1, len(points)):
                cx = (points[i - 1].x() + points[i].x()) / 2
                path.cubicTo(cx, points[i - 1].y(), cx, points[i].y(), points[i].x(), points[i].y())
            return path

        def draw_area(series, color_hex):
            pts_list = pts(series)
            path = smooth_path(pts_list)
            # Fill with gradient
            area = QPainterPath(path)
            area.lineTo(pts_list[-1].x(), PAD_T + chart_h)
            area.lineTo(pts_list[0].x(),  PAD_T + chart_h)
            area.closeSubpath()
            grad = QLinearGradient(0, PAD_T, 0, PAD_T + chart_h)
            c = QColor(color_hex)
            c.setAlphaF(0.25)
            grad.setColorAt(0, c)
            c2 = QColor(color_hex)
            c2.setAlphaF(0.03)
            grad.setColorAt(1, c2)
            p.setPen(Qt.PenStyle.NoPen)
            p.setBrush(QBrush(grad))
            p.drawPath(area)
            # Line
            pen = QPen(QColor(color_hex), 2)
            p.setPen(pen)
            p.setBrush(Qt.BrushStyle.NoBrush)
            p.drawPath(path)

        draw_area(self._series_b, self._color_b)
        draw_area(self._series_a, self._color_a)

        # X-axis labels (every 5 min approx)
        p.setPen(QPen(QColor(C_MUTED)))
        total_min = 80
        step = max(1, n // 8)
        for i in range(0, n, step):
            x   = PAD_L + chart_w * i / (n - 1)
            min_val = int(total_min * i / (n - 1))
            p.drawText(int(x) - 10, H - PAD_B + 4, 20, 14,
                       Qt.AlignmentFlag.AlignCenter, f"{min_val}'")

        p.end()


# ── Bar Chart ──────────────────────────────────────────────────────────────────

class BarChart(QWidget):
    """Gráfico de barras agrupadas por partido."""

    def __init__(self):
        super().__init__()
        self._groups  = []   # [{"label": "CB", "values": [lo, sc, ko]}, ...]
        self._colors  = [C_GREEN, C_BLUE, C_ORANGE]
        self._legends = ["Line-outs", "Scrums", "Salidas 22"]
        self.setMinimumHeight(200)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Preferred)

    def set_data(self, groups):
        self._groups = groups
        self.update()

    def paintEvent(self, _):
        p = QPainter(self)
        p.setRenderHint(QPainter.RenderHint.Antialiasing)
        W, H = self.width(), self.height()
        PAD_L, PAD_R, PAD_T, PAD_B = 36, 16, 16, 40

        chart_w = W - PAD_L - PAD_R
        chart_h = H - PAD_T - PAD_B

        p.setPen(Qt.PenStyle.NoPen)
        p.setBrush(QBrush(QColor(C_BG)))
        p.drawRect(0, 0, W, H)

        if not self._groups:
            p.end()
            return

        max_val = max(v for g in self._groups for v in g["values"]) or 1
        y_steps = 4
        font = QFont("Segoe UI", 8)
        p.setFont(font)

        # Grid + Y labels
        p.setPen(QPen(QColor(C_BORDER), 1))
        for i in range(y_steps + 1):
            y   = PAD_T + chart_h - int(chart_h * i / y_steps)
            val = int(max_val * i / y_steps)
            p.drawLine(PAD_L, y, PAD_L + chart_w, y)
            p.setPen(QPen(QColor(C_MUTED)))
            p.drawText(0, y - 6, PAD_L - 4, 14, Qt.AlignmentFlag.AlignRight, str(val))
            p.setPen(QPen(QColor(C_BORDER), 1))

        # Bars
        n_groups  = len(self._groups)
        n_bars    = len(self._colors)
        group_w   = chart_w / n_groups
        bar_w     = group_w * 0.18
        gap       = group_w * 0.06

        for gi, group in enumerate(self._groups):
            gx = PAD_L + gi * group_w + group_w * 0.1

            for bi, val in enumerate(group["values"]):
                bh = int(chart_h * val / max_val)
                bx = gx + bi * (bar_w + gap)
                by = PAD_T + chart_h - bh
                color = QColor(self._colors[bi])
                p.setPen(Qt.PenStyle.NoPen)
                p.setBrush(QBrush(color))
                p.drawRoundedRect(int(bx), by, int(bar_w), bh, 3, 3)

            # X label
            cx = PAD_L + gi * group_w + group_w / 2
            p.setPen(QPen(QColor(C_MUTED)))
            p.drawText(int(cx) - 20, PAD_T + chart_h + 6, 40, 14,
                       Qt.AlignmentFlag.AlignCenter, group["label"])

        # Legend
        lx = PAD_L
        ly = H - 16
        p.setFont(QFont("Segoe UI", 9))
        for i, lbl in enumerate(self._legends):
            p.setPen(Qt.PenStyle.NoPen)
            p.setBrush(QBrush(QColor(self._colors[i])))
            p.drawEllipse(lx, ly - 5, 8, 8)
            p.setPen(QPen(QColor(C_MUTED)))
            p.drawText(lx + 12, ly - 6, 80, 14,
                       Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignVCenter, lbl)
            lx += 95

        p.end()


# ── Donut Chart ────────────────────────────────────────────────────────────────

class DonutChart(QWidget):
    """Gráfico de dona para posesión promedio."""

    def __init__(self, pct_a=54, label_a="Local", label_b="Rivales",
                 color_a=C_GREEN, color_b=C_BLUEBG):
        from app.styles import C_BLUEBG
        super().__init__()
        self._pct_a   = pct_a
        self._label_a = label_a
        self._label_b = label_b
        self._color_a = color_a
        self._color_b = "#1c3a4a"
        self.setFixedSize(200, 200)

    def set_data(self, pct_a, label_a="Local", label_b="Rivales"):
        self._pct_a   = pct_a
        self._label_a = label_a
        self._label_b = label_b
        self.update()

    def paintEvent(self, _):
        p = QPainter(self)
        p.setRenderHint(QPainter.RenderHint.Antialiasing)
        W, H = self.width(), self.height()

        cx, cy = W // 2, H // 2
        r_outer = min(W, H) // 2 - 10
        r_inner = r_outer - 28

        rect = QRectF(cx - r_outer, cy - r_outer, r_outer * 2, r_outer * 2)

        # Background arc (rival)
        p.setPen(Qt.PenStyle.NoPen)
        p.setBrush(QBrush(QColor(self._color_b)))
        p.drawEllipse(rect)

        # Local arc
        span = int(self._pct_a / 100 * 360 * 16)
        p.setBrush(QBrush(QColor(self._color_a)))
        p.drawPie(rect, 90 * 16, -span)

        # Inner hole
        inner_rect = QRectF(cx - r_inner, cy - r_inner, r_inner * 2, r_inner * 2)
        p.setBrush(QBrush(QColor(C_SURFACE)))
        p.drawEllipse(inner_rect)

        # Center text
        p.setPen(QPen(QColor(C_TEXT)))
        p.setFont(QFont("Segoe UI", 18, QFont.Weight.Bold))
        p.drawText(rect, Qt.AlignmentFlag.AlignCenter, f"{self._pct_a:.0f}%")

        p.end()


# ── Radar Chart ───────────────────────────────────────────────────────────────

class RadarChart(QWidget):
    """Gráfico de radar / spider para perfil del equipo."""

    AXES = ["Line-outs", "Posesión", "Scrums", "Salidas", "Presión", "Continuidad"]

    def __init__(self, values=None):
        super().__init__()
        self._values = values or [0.85, 0.58, 0.72, 0.65, 0.70, 0.80]
        self.setMinimumHeight(240)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Preferred)

    def set_data(self, values):
        self._values = values
        self.update()

    def paintEvent(self, _):
        p = QPainter(self)
        p.setRenderHint(QPainter.RenderHint.Antialiasing)
        W, H = self.width(), self.height()
        cx, cy = W // 2, H // 2
        R = min(W, H) // 2 - 40
        n = len(self.AXES)

        p.setPen(Qt.PenStyle.NoPen)
        p.setBrush(QBrush(QColor(C_BG)))
        p.drawRect(0, 0, W, H)

        def axis_pt(i, r):
            angle = math.pi / 2 - 2 * math.pi * i / n
            return QPointF(cx + r * math.cos(angle), cy - r * math.sin(angle))

        # Grid rings
        for ring in range(1, 5):
            rr = R * ring / 4
            pts = [axis_pt(i, rr) for i in range(n)]
            path = QPainterPath()
            path.moveTo(pts[0])
            for pt in pts[1:]:
                path.lineTo(pt)
            path.closeSubpath()
            p.setPen(QPen(QColor(C_BORDER), 1))
            p.setBrush(Qt.BrushStyle.NoBrush)
            p.drawPath(path)

        # Axes
        p.setPen(QPen(QColor(C_BORDER2), 1))
        for i in range(n):
            p.drawLine(QPointF(cx, cy), axis_pt(i, R))

        # Data polygon
        data_pts = [axis_pt(i, R * v) for i, v in enumerate(self._values)]
        path = QPainterPath()
        path.moveTo(data_pts[0])
        for pt in data_pts[1:]:
            path.lineTo(pt)
        path.closeSubpath()

        fill_color = QColor(C_GREEN)
        fill_color.setAlphaF(0.2)
        p.setBrush(QBrush(fill_color))
        p.setPen(QPen(QColor(C_GREEN), 2))
        p.drawPath(path)

        # Dots
        p.setBrush(QBrush(QColor(C_GREEN)))
        p.setPen(Qt.PenStyle.NoPen)
        for pt in data_pts:
            p.drawEllipse(pt, 4, 4)

        # Labels
        p.setPen(QPen(QColor(C_MUTED)))
        p.setFont(QFont("Segoe UI", 9))
        for i, label in enumerate(self.AXES):
            pt = axis_pt(i, R + 20)
            p.drawText(int(pt.x()) - 40, int(pt.y()) - 8, 80, 16,
                       Qt.AlignmentFlag.AlignCenter, label)

        p.end()
