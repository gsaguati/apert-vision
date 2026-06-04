from PyQt6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QLabel,
    QPushButton, QFrame, QStackedWidget, QSizePolicy,
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont, QPainter, QColor, QBrush

from app.styles import (
    C_BG, C_SURFACE, C_SURFACE2, C_BORDER, C_BORDER2,
    C_GREEN, C_GREEN3, C_GREENBG, C_TEXT, C_MUTED, C_MUTED2,
    C_SIDEBAR, C_SIDEBAR_BORDER,
)
from app.screens.dashboard       import DashboardScreen
from app.screens.analysis        import AnalysisScreen
from app.screens.analysis_viewer import AnalysisViewerScreen
from app.screens.matches         import MatchesScreen
from app.screens.players         import PlayersScreen
from app.screens.stats           import StatsScreen
from app.screens.config          import ConfigScreen
import app.mock_data  as mock
import app.history    as history
import app.user_state as user_state

PAGE_DASHBOARD = 0
PAGE_ANALYSIS  = 1
PAGE_MATCHES   = 2
PAGE_PLAYERS   = 3
PAGE_STATS     = 4
PAGE_VIEWER    = 5
PAGE_CONFIG    = 6


# ── Nav item ───────────────────────────────────────────────────────────────────

class NavItem(QWidget):
    clicked = pyqtSignal(int)

    def __init__(self, page: int, icon: str, label: str):
        super().__init__()
        self._page   = page
        self._active = False
        self.setFixedHeight(40)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.setCursor(Qt.CursorShape.PointingHandCursor)

        lay = QHBoxLayout(self)
        lay.setContentsMargins(16, 0, 12, 0)
        lay.setSpacing(10)

        self._icon_lbl = QLabel(icon)
        self._icon_lbl.setFixedWidth(18)
        self._icon_lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self._icon_lbl.setStyleSheet(f"font-size: 14px; color: {C_MUTED};")

        self._text_lbl = QLabel(label)
        self._text_lbl.setFont(QFont("Segoe UI", 12))
        self._text_lbl.setStyleSheet(f"color: {C_MUTED};")

        self._dot = QLabel("●")
        self._dot.setStyleSheet(f"color: {C_GREEN}; font-size: 7px;")
        self._dot.setVisible(False)

        lay.addWidget(self._icon_lbl)
        lay.addWidget(self._text_lbl, 1)
        lay.addWidget(self._dot)

        self._set_style(False)

    def set_active(self, active: bool):
        self._active = active
        self._set_style(active)
        self._dot.setVisible(active)

    def _set_style(self, active: bool):
        # JS: active = bg-sidebar-accent (#151d2e), text sidebar-primary (#39e07a)
        # JS: inactive = text-sidebar-foreground/60
        if active:
            self.setStyleSheet(
                "background-color: #151d2e; border-radius: 8px;")
            self._text_lbl.setStyleSheet(
                "color: #39e07a; font-weight: 600; font-size: 13px;")
            self._icon_lbl.setStyleSheet(
                "font-size: 13px; color: #39e07a;")
        else:
            self.setStyleSheet(
                "background-color: transparent; border-radius: 8px;")
            self._text_lbl.setStyleSheet(
                "color: #8a9ab8; font-size: 13px;")  # foreground/60
            self._icon_lbl.setStyleSheet(
                "font-size: 13px; color: #8a9ab8;")

    def enterEvent(self, _):
        if not self._active:
            self.setStyleSheet("background-color: #151d2e; border-radius: 8px;")
            self._text_lbl.setStyleSheet("color: #e8eaf0; font-size: 13px;")
            self._icon_lbl.setStyleSheet("font-size: 13px; color: #e8eaf0;")

    def leaveEvent(self, _):
        if not self._active:
            self._set_style(False)

    def mousePressEvent(self, _):
        self.clicked.emit(self._page)


# ── Sidebar ────────────────────────────────────────────────────────────────────

class NavSidebar(QWidget):
    navigate         = pyqtSignal(int)
    logout_requested = pyqtSignal()

    def __init__(self):
        super().__init__()
        self.setFixedWidth(240)
        self.setStyleSheet(
            f"background-color: {C_SIDEBAR}; border-right: 1px solid {C_SIDEBAR_BORDER};")
        self._items: dict[int, NavItem] = {}
        self._build()

    def _build(self):
        lay = QVBoxLayout(self)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(0)

        # ── Logo ──
        logo_box = QWidget()
        logo_box.setFixedHeight(64)
        logo_box.setStyleSheet(
            f"background-color: {C_SIDEBAR}; border-bottom: 1px solid {C_SIDEBAR_BORDER};")
        logo_lay = QHBoxLayout(logo_box)
        logo_lay.setContentsMargins(16, 0, 16, 0)
        logo_lay.setSpacing(10)

        eye = QLabel("👁")
        eye.setFixedSize(34, 34)
        eye.setAlignment(Qt.AlignmentFlag.AlignCenter)
        eye.setStyleSheet(
            f"background-color: {C_GREEN}; color: {C_BG};"
            f"border-radius: 8px; font-size: 16px;")

        brand_col = QVBoxLayout()
        brand_col.setSpacing(1)
        brand_name = QLabel("Apert Vision")
        brand_name.setFont(QFont("Inter", 13, QFont.Weight.Bold))
        brand_name.setStyleSheet(f"color: {C_TEXT};")
        brand_sub = QLabel("RUGBY AI")
        brand_sub.setStyleSheet(
            f"color: {C_MUTED}; font-size: 9px; letter-spacing: 2px; font-weight: 500;")
        brand_col.addWidget(brand_name)
        brand_col.addWidget(brand_sub)

        logo_lay.addWidget(eye)
        logo_lay.addLayout(brand_col)
        lay.addWidget(logo_box)

        # ── Club pill ──
        club_box = QWidget()
        club_box.setFixedHeight(52)
        club_box.setStyleSheet(
            f"background-color: {C_SIDEBAR}; border-bottom: 1px solid {C_SIDEBAR_BORDER};")
        club_lay = QHBoxLayout(club_box)
        club_lay.setContentsMargins(12, 0, 12, 0)

        club_pill = QFrame()
        club_pill.setStyleSheet(
            f"background-color: {C_SURFACE2}; border-radius: 18px;"
            f"border: 1px solid {C_BORDER};")
        cp_lay = QHBoxLayout(club_pill)
        cp_lay.setContentsMargins(12, 6, 14, 6)
        cp_lay.setSpacing(8)
        dot = QLabel("●")
        dot.setStyleSheet(f"color: {C_GREEN}; font-size: 8px;")
        club_name = QLabel(mock.CLUB_NAME)
        club_name.setStyleSheet(
            f"color: {C_TEXT}; font-size: 12px; font-weight: 600;")
        cp_lay.addWidget(dot)
        cp_lay.addWidget(club_name)
        club_lay.addWidget(club_pill)
        lay.addWidget(club_box)

        # ── Nav items ──
        nav_container = QWidget()
        nav_container.setStyleSheet("background: transparent;")
        nav_lay = QVBoxLayout(nav_container)
        nav_lay.setContentsMargins(10, 12, 10, 12)
        nav_lay.setSpacing(2)

        nav_defs = [
            (PAGE_DASHBOARD, "▣", "Dashboard"),
            (PAGE_ANALYSIS,  "▷", "Análisis"),
            (PAGE_MATCHES,   "▤", "Partidos"),
            (PAGE_PLAYERS,   "◉", "Jugadores"),
            (PAGE_STATS,     "▦", "Estadísticas"),
            (PAGE_CONFIG,    "◎", "Configuración"),
        ]
        for page, icon, label in nav_defs:
            item = NavItem(page, icon, label)
            item.clicked.connect(self._on_nav_click)
            nav_lay.addWidget(item)
            self._items[page] = item

        nav_lay.addStretch()
        lay.addWidget(nav_container, 1)

        # ── Separator ──
        sep = QFrame()
        sep.setFrameShape(QFrame.Shape.HLine)
        sep.setStyleSheet(
            f"background-color: {C_SIDEBAR_BORDER}; max-height: 1px;")
        lay.addWidget(sep)

        # ── User ── (JS: avatar gradient #39e07a → #1db954)
        user_box = QWidget()
        user_box.setStyleSheet(f"background-color: {C_SIDEBAR};")
        user_box.setFixedHeight(72)
        user_lay = QHBoxLayout(user_box)
        user_lay.setContentsMargins(14, 0, 14, 0)
        user_lay.setSpacing(10)

        u = user_state.get()
        initials = (u["name"][:2].upper() if u and len(u["name"]) >= 2
                    else (u["name"][0].upper() if u else "?"))

        avatar = QLabel(initials)
        avatar.setFixedSize(36, 36)
        avatar.setAlignment(Qt.AlignmentFlag.AlignCenter)
        # JS: linear-gradient(135deg, #39e07a 0%, #1db954 100%)
        # Qt doesn't support gradient on QLabel; use solid primary
        avatar.setStyleSheet(
            f"background-color: {C_GREEN}; color: {C_BG};"
            f"border-radius: 18px; font-size: 12px; font-weight: 700;")

        info_col = QVBoxLayout()
        info_col.setSpacing(1)
        name_lbl = QLabel(u["name"] if u else "Invitado")
        name_lbl.setFont(QFont("Inter", 12, QFont.Weight.Bold))
        name_lbl.setStyleSheet(f"color: {C_TEXT};")
        role_lbl = QLabel("Entrenador")
        role_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 11px;")
        info_col.addWidget(name_lbl)
        info_col.addWidget(role_lbl)

        logout_btn = QPushButton("→")
        logout_btn.setObjectName("ghost")
        logout_btn.setFixedSize(28, 28)
        logout_btn.setToolTip("Cerrar sesión")
        logout_btn.clicked.connect(self.logout_requested)

        user_lay.addWidget(avatar)
        user_lay.addLayout(info_col, 1)
        user_lay.addWidget(logout_btn)
        lay.addWidget(user_box)

        self._activate(PAGE_DASHBOARD)

    def _on_nav_click(self, page: int):
        self._activate(page)

    def _activate(self, page: int):
        for p, item in self._items.items():
            item.set_active(p == page)
        self.navigate.emit(page)

    def activate(self, page: int):
        self._activate(page)


# ── App Window ─────────────────────────────────────────────────────────────────

class AppWindow(QMainWindow):
    logout_requested = pyqtSignal()

    def __init__(self):
        super().__init__()
        self.setWindowTitle("Apert Vision  —  Rugby AI")
        self.setMinimumSize(1280, 800)
        self._build_ui()

    def _build_ui(self):
        central = QWidget()
        self.setCentralWidget(central)
        root = QHBoxLayout(central)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)

        self.nav = NavSidebar()
        self.nav.navigate.connect(self._on_navigate)
        self.nav.logout_requested.connect(self.logout_requested)
        root.addWidget(self.nav)

        self.stack = QStackedWidget()
        self.stack.setStyleSheet(f"background-color: {C_BG};")

        self.dashboard  = DashboardScreen()
        self.analysis   = AnalysisScreen()
        self.viewer     = AnalysisViewerScreen()
        self.matches    = MatchesScreen()
        self.players    = PlayersScreen()
        self.stats      = StatsScreen()
        self.config     = ConfigScreen()

        # Signals
        self.dashboard.new_analysis_requested.connect(self._start_new_analysis)
        self.dashboard.view_match_requested.connect(self._open_viewer)
        self.analysis.analysis_saved.connect(self._on_analysis_saved)
        self.matches.view_match_requested.connect(self._open_viewer)

        self.stack.addWidget(self.dashboard)  # 0
        self.stack.addWidget(self.analysis)   # 1
        self.stack.addWidget(self.matches)    # 2
        self.stack.addWidget(self.players)    # 3
        self.stack.addWidget(self.stats)      # 4
        self.stack.addWidget(self.viewer)     # 5
        self.stack.addWidget(self.config)     # 6

        root.addWidget(self.stack, 1)

    def _on_navigate(self, page: int):
        self.stack.setCurrentIndex(page)

    def _start_new_analysis(self, video_path: str = ""):
        """Abre la pantalla de análisis y precarga el video si se pasó uno."""
        if video_path:
            self.analysis.video_picker.set_path(video_path)
        self.nav.activate(PAGE_ANALYSIS)

    def _open_viewer(self, match_id: int):
        match = next((m for m in mock.MATCHES if m["id"] == match_id), None)
        if match:
            self.viewer.load_match(match)
            self.stack.setCurrentIndex(PAGE_VIEWER)
            # Update nav to show Análisis active
            for p, item in self.nav._items.items():
                item.set_active(p == PAGE_ANALYSIS)

    def _on_analysis_saved(self, stats: dict, team_local: str, team_visit: str, video_name: str):
        history.save_match(stats, team_local, team_visit, video_name)
        self.dashboard.refresh()
        self.nav.activate(PAGE_DASHBOARD)
