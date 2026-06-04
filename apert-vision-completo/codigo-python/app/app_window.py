from PyQt6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QLabel,
    QPushButton, QFrame, QStackedWidget, QSizePolicy,
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont, QPainter, QColor, QBrush

from app.styles import (
    C_BG, C_SURFACE, C_SURFACE2, C_BORDER, C_BORDER2,
    C_GREEN, C_GREEN2, C_TEXT, C_MUTED, C_MUTED2,
)
from app.screens.home     import HomeScreen
from app.screens.analysis import AnalysisScreen
import app.history    as history
import app.user_state as user_state

PAGE_HOME     = 0
PAGE_ANALYSIS = 1


class NavItem(QPushButton):
    def __init__(self, icon: str, label: str):
        super().__init__()
        self._icon  = icon
        self._label = label
        self.setText(f"{icon}   {label}")
        self.setCheckable(True)
        self.setFixedHeight(42)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self._apply(False)

    def set_active(self, active: bool):
        self.setChecked(active)
        self._apply(active)

    def _apply(self, active: bool):
        if active:
            self.setStyleSheet(f"""
                QPushButton {{
                    background-color: #0d2015;
                    color: {C_GREEN};
                    border: none;
                    border-left: 3px solid {C_GREEN};
                    border-radius: 0px;
                    text-align: left;
                    padding: 0 0 0 18px;
                    font-size: 13px;
                    font-weight: 700;
                }}
            """)
        else:
            self.setStyleSheet(f"""
                QPushButton {{
                    background-color: transparent;
                    color: {C_MUTED};
                    border: none;
                    border-left: 3px solid transparent;
                    border-radius: 0px;
                    text-align: left;
                    padding: 0 0 0 18px;
                    font-size: 13px;
                }}
                QPushButton:hover {{
                    background-color: #0a1812;
                    color: {C_TEXT};
                }}
            """)


class NavSidebar(QWidget):
    navigate         = pyqtSignal(int)
    logout_requested = pyqtSignal()

    def __init__(self):
        super().__init__()
        self.setFixedWidth(230)
        self.setStyleSheet(
            f"background-color: {C_SURFACE}; border-right: 1px solid {C_BORDER};")
        self._build()

    def _build(self):
        lay = QVBoxLayout(self)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(0)

        # ── Logo ──
        logo_widget = QWidget()
        logo_widget.setFixedHeight(80)
        logo_widget.setStyleSheet(
            f"background-color: {C_SURFACE}; border-bottom: 1px solid {C_BORDER};")
        logo_lay = QVBoxLayout(logo_widget)
        logo_lay.setContentsMargins(20, 16, 20, 16)
        logo_lay.setSpacing(2)

        logo_title = QLabel("APERT VISION")
        logo_title.setFont(QFont("Segoe UI", 14, QFont.Weight.ExtraBold))
        logo_title.setStyleSheet(f"color: {C_GREEN}; letter-spacing: 2px;")

        logo_sub = QLabel("RUGBY  ·  IA  ·  ANALYTICS")
        logo_sub.setStyleSheet(
            f"color: {C_MUTED2}; font-size: 8px; letter-spacing: 2px;")

        logo_lay.addWidget(logo_title)
        logo_lay.addWidget(logo_sub)
        lay.addWidget(logo_widget)

        # ── Nav section label ──
        def section_lbl(text):
            lbl = QLabel(text)
            lbl.setStyleSheet(
                f"color: {C_MUTED2}; font-size: 8px; letter-spacing: 2px;"
                f"padding: 16px 20px 6px 20px; text-transform: uppercase;")
            return lbl

        lay.addWidget(section_lbl("MENÚ PRINCIPAL"))

        self.btn_home     = NavItem("🏠", "Inicio")
        self.btn_analysis = NavItem("▶", "Nuevo análisis")

        self.btn_home.clicked.connect(lambda: self._activate(PAGE_HOME))
        self.btn_analysis.clicked.connect(lambda: self._activate(PAGE_ANALYSIS))

        lay.addWidget(self.btn_home)
        lay.addWidget(self.btn_analysis)

        # ── Próximamente ──
        lay.addWidget(section_lbl("PRÓXIMAMENTE"))

        for icon, label in [("📊", "Estadísticas"), ("👥", "Jugadores"), ("📅", "Temporada")]:
            btn = NavItem(icon, label)
            btn.setEnabled(False)
            btn.setStyleSheet(btn.styleSheet() + "QPushButton { opacity: 0.4; }")
            lay.addWidget(btn)

        lay.addStretch()

        # ── Divider ──
        sep = QFrame()
        sep.setFrameShape(QFrame.Shape.HLine)
        sep.setStyleSheet(f"background-color: {C_BORDER}; max-height: 1px;")
        lay.addWidget(sep)

        # ── Usuario ──
        user_widget = QWidget()
        user_widget.setStyleSheet(f"background-color: {C_SURFACE};")
        user_lay = QVBoxLayout(user_widget)
        user_lay.setContentsMargins(20, 14, 20, 16)
        user_lay.setSpacing(2)

        u = user_state.get()

        # Avatar + nombre
        avatar_row = QHBoxLayout()
        avatar = QLabel(u["name"][0].upper() if u else "?")
        avatar.setFixedSize(32, 32)
        avatar.setAlignment(Qt.AlignmentFlag.AlignCenter)
        avatar.setStyleSheet(
            f"background-color: {C_GREEN}; color: #000; border-radius: 16px;"
            f"font-size: 14px; font-weight: 800;")

        name_col = QVBoxLayout()
        name_col.setSpacing(0)
        name_lbl  = QLabel(u["name"]  if u else "Invitado")
        name_lbl.setStyleSheet(f"color: {C_TEXT}; font-size: 12px; font-weight: 600;")
        email_lbl = QLabel(u["email"] if u else "")
        email_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 9px;")
        name_col.addWidget(name_lbl)
        name_col.addWidget(email_lbl)

        avatar_row.addWidget(avatar)
        avatar_row.addSpacing(10)
        avatar_row.addLayout(name_col, 1)
        user_lay.addLayout(avatar_row)
        user_lay.addSpacing(10)

        logout_btn = QPushButton("Cerrar sesión")
        logout_btn.setObjectName("secondary")
        logout_btn.setFixedHeight(30)
        logout_btn.clicked.connect(self.logout_requested)
        user_lay.addWidget(logout_btn)

        # Versión
        ver_lbl = QLabel("v0.1.0-MVP  ·  BETA")
        ver_lbl.setStyleSheet(
            f"color: {C_MUTED2}; font-size: 9px; letter-spacing: 0.5px;"
            f"padding-top: 6px;")
        user_lay.addWidget(ver_lbl)

        lay.addWidget(user_widget)

        self._activate(PAGE_HOME)

    def _activate(self, page: int):
        self.btn_home.set_active(page == PAGE_HOME)
        self.btn_analysis.set_active(page == PAGE_ANALYSIS)
        self.navigate.emit(page)


class AppWindow(QMainWindow):
    logout_requested = pyqtSignal()

    def __init__(self):
        super().__init__()
        self.setWindowTitle("Apert Vision  —  Rugby Analytics")
        self.setMinimumSize(1300, 820)
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

        self.home_screen     = HomeScreen()
        self.analysis_screen = AnalysisScreen()

        self.analysis_screen.analysis_saved.connect(self._on_analysis_saved)
        self.home_screen.new_analysis_requested.connect(
            lambda: self.nav.btn_analysis.click())

        self.stack.addWidget(self.home_screen)
        self.stack.addWidget(self.analysis_screen)

        root.addWidget(self.stack, 1)

    def _on_navigate(self, page: int):
        self.stack.setCurrentIndex(page)

    def _on_analysis_saved(self, stats: dict, team_local: str, team_visit: str, video_name: str):
        history.save_match(stats, team_local, team_visit, video_name)
        self.home_screen.refresh()
        self.nav.btn_home.click()
