from PyQt6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QLabel,
    QPushButton, QFrame, QStackedWidget, QSizePolicy,
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont

from app.styles import C_BG, C_SURFACE, C_BORDER, C_GREEN, C_GREEN2, C_TEXT, C_MUTED
from app.screens.home     import HomeScreen
from app.screens.analysis import AnalysisScreen
import app.history     as history
import app.user_state  as user_state

# Índices del QStackedWidget
PAGE_HOME     = 0
PAGE_ANALYSIS = 1


class NavButton(QPushButton):
    def __init__(self, icon: str, label: str):
        super().__init__()
        self._active = False
        self._icon   = icon
        self._label  = label
        self.setText(f"  {icon}  {label}")
        self.setCheckable(True)
        self.setFixedHeight(44)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self._set_style(False)

    def set_active(self, active: bool):
        self._active = active
        self.setChecked(active)
        self._set_style(active)

    def _set_style(self, active: bool):
        if active:
            self.setStyleSheet(f"""
                QPushButton {{
                    background-color: #0d2015;
                    color: {C_GREEN};
                    border: none;
                    border-left: 3px solid {C_GREEN};
                    border-radius: 0px;
                    text-align: left;
                    padding-left: 14px;
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
                    padding-left: 14px;
                    font-size: 13px;
                }}
                QPushButton:hover {{
                    color: {C_TEXT};
                    background-color: #0a1a12;
                }}
            """)


class NavSidebar(QWidget):
    navigate = pyqtSignal(int)
    logout_requested = pyqtSignal()

    def __init__(self):
        super().__init__()
        self.setFixedWidth(220)
        self.setStyleSheet(
            f"background-color: {C_SURFACE}; border-right: 1px solid {C_BORDER};")
        self._build()

    def _build(self):
        lay = QVBoxLayout(self)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(0)

        # Logo
        logo_box = QWidget()
        logo_box.setStyleSheet(
            f"background-color: {C_SURFACE}; border-bottom: 1px solid {C_BORDER};")
        logo_lay = QVBoxLayout(logo_box)
        logo_lay.setContentsMargins(20, 20, 20, 18)
        logo_lay.setSpacing(2)

        title = QLabel("APERT\nVISION")
        title.setFont(QFont("Segoe UI", 17, QFont.Weight.ExtraBold))
        title.setStyleSheet(f"color: {C_GREEN}; letter-spacing: 2px;")
        sub = QLabel("RUGBY ANALYTICS")
        sub.setStyleSheet(f"color: {C_MUTED}; font-size: 9px; letter-spacing: 1.5px;")

        logo_lay.addWidget(title)
        logo_lay.addWidget(sub)
        lay.addWidget(logo_box)

        # Sección nav
        nav_section = QLabel("NAVEGACIÓN")
        nav_section.setStyleSheet(
            f"color: {C_BORDER}; font-size: 9px; letter-spacing: 1.5px;"
            f"padding: 16px 20px 6px 20px;")
        lay.addWidget(nav_section)

        self.btn_home     = NavButton("🏠", "Inicio")
        self.btn_analysis = NavButton("▶", "Nuevo análisis")

        self.btn_home.clicked.connect(lambda: self._activate(PAGE_HOME))
        self.btn_analysis.clicked.connect(lambda: self._activate(PAGE_ANALYSIS))

        lay.addWidget(self.btn_home)
        lay.addWidget(self.btn_analysis)

        lay.addStretch()

        # Separador
        sep = QFrame()
        sep.setFrameShape(QFrame.Shape.HLine)
        sep.setStyleSheet(f"background-color: {C_BORDER}; max-height: 1px;")
        lay.addWidget(sep)

        # Info usuario
        user_box = QWidget()
        user_box.setStyleSheet(f"background-color: {C_SURFACE};")
        user_lay = QVBoxLayout(user_box)
        user_lay.setContentsMargins(20, 14, 20, 16)
        user_lay.setSpacing(4)

        u = user_state.get()
        name_lbl = QLabel(u["name"] if u else "Usuario")
        name_lbl.setStyleSheet(f"color: {C_TEXT}; font-size: 13px; font-weight: 600;")
        email_lbl = QLabel(u["email"] if u else "")
        email_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 10px;")

        logout_btn = QPushButton("Cerrar sesión")
        logout_btn.setObjectName("secondary")
        logout_btn.setFixedHeight(30)
        logout_btn.clicked.connect(self.logout_requested)

        user_lay.addWidget(name_lbl)
        user_lay.addWidget(email_lbl)
        user_lay.addSpacing(6)
        user_lay.addWidget(logout_btn)
        lay.addWidget(user_box)

        self._activate(PAGE_HOME)

    def _activate(self, page: int):
        self.btn_home.set_active(page == PAGE_HOME)
        self.btn_analysis.set_active(page == PAGE_ANALYSIS)
        self.navigate.emit(page)


class AppWindow(QMainWindow):
    logout_requested = pyqtSignal()

    def __init__(self):
        super().__init__()
        self.setWindowTitle("Apert Vision")
        self.setMinimumSize(1280, 800)
        self._build_ui()

    def _build_ui(self):
        central = QWidget()
        self.setCentralWidget(central)
        root = QHBoxLayout(central)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)

        # Sidebar de navegación
        self.nav = NavSidebar()
        self.nav.navigate.connect(self._on_navigate)
        self.nav.logout_requested.connect(self.logout_requested)
        root.addWidget(self.nav)

        # Páginas
        self.stack = QStackedWidget()
        self.stack.setStyleSheet(f"background-color: {C_BG};")

        self.home_screen     = HomeScreen()
        self.analysis_screen = AnalysisScreen()

        # Cuando termine un análisis → guardar en historial y volver a home
        self.analysis_screen.analysis_saved.connect(self._on_analysis_saved)

        # Nuevo análisis desde la home screen
        self.home_screen.new_analysis_requested.connect(
            lambda: self.nav.btn_analysis.click())

        self.stack.addWidget(self.home_screen)     # PAGE_HOME = 0
        self.stack.addWidget(self.analysis_screen) # PAGE_ANALYSIS = 1

        root.addWidget(self.stack, 1)

    def _on_navigate(self, page: int):
        self.stack.setCurrentIndex(page)

    def _on_analysis_saved(self, stats: dict, team_local: str, team_visit: str, video_name: str):
        history.save_match(stats, team_local, team_visit, video_name)
        self.home_screen.refresh()
        # Navegar a home después de guardar
        self.nav.btn_home.click()
