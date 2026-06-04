from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QLineEdit,
    QPushButton, QFrame, QSizePolicy,
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont, QLinearGradient, QBrush, QPainter, QColor, QPen

from app.styles import (
    C_BG, C_SURFACE, C_BORDER, C_GREEN, C_GREEN2, C_GREEN3,
    C_TEXT, C_MUTED, C_MUTED2, C_BORDER2, C_RED,
)
import app.user_state as user_state

_DEMO_CREDENTIALS = {
    "admin@apert.com": "rugby2024",
    "demo@apert.com":  "demo",
}


class BrandPanel(QWidget):
    """Panel izquierdo con branding y features."""

    def __init__(self):
        super().__init__()
        self.setStyleSheet(f"background-color: #060c08;")
        lay = QVBoxLayout(self)
        lay.setContentsMargins(50, 54, 50, 40)
        lay.setSpacing(0)

        # Logo
        logo = QLabel("APERT\nVISION")
        logo.setFont(QFont("Segoe UI", 36, QFont.Weight.ExtraBold))
        logo.setStyleSheet(f"color: {C_GREEN}; letter-spacing: 4px; line-height: 1.1;")
        lay.addWidget(logo)
        lay.addSpacing(6)

        tagline = QLabel("Rugby Analytics · IA · Local")
        tagline.setStyleSheet(f"color: {C_MUTED}; font-size: 12px; letter-spacing: 2px;")
        lay.addWidget(tagline)
        lay.addSpacing(48)

        # Headline
        headline = QLabel(
            "La primera plataforma\nde análisis automático\nde rugby con IA."
        )
        headline.setFont(QFont("Segoe UI", 20, QFont.Weight.Bold))
        headline.setStyleSheet(f"color: {C_TEXT}; line-height: 1.4;")
        lay.addWidget(headline)
        lay.addSpacing(8)

        sub = QLabel(
            "Sin analistas. Sin horas de video.\nResultados en minutos."
        )
        sub.setStyleSheet(f"color: {C_MUTED}; font-size: 14px; line-height: 1.6;")
        lay.addWidget(sub)
        lay.addSpacing(44)

        # Feature list
        features = [
            ("🏉", "Detección automática de Line-Outs, Scrums y Salidas"),
            ("📊", "Dashboard de posesión y estadísticas por partido"),
            ("🎬", "Video anotado + clips de cada formación"),
            ("🔒", "Procesamiento 100% local, tu video no sale del equipo"),
        ]
        for icon, text in features:
            row = QHBoxLayout()
            row.setSpacing(14)
            icon_lbl = QLabel(icon)
            icon_lbl.setFixedWidth(24)
            icon_lbl.setStyleSheet("font-size: 16px;")
            text_lbl = QLabel(text)
            text_lbl.setStyleSheet(f"color: {C_TEXT}; font-size: 12px;")
            text_lbl.setWordWrap(True)
            row.addWidget(icon_lbl)
            row.addWidget(text_lbl, 1)
            lay.addLayout(row)
            lay.addSpacing(14)

        lay.addStretch()

        # Version badge
        sep = QFrame()
        sep.setFrameShape(QFrame.Shape.HLine)
        sep.setStyleSheet(f"background-color: {C_BORDER}; max-height: 1px;")
        lay.addWidget(sep)
        lay.addSpacing(16)

        footer_row = QHBoxLayout()
        ver = QLabel("v0.1.0-MVP  ·  BETA")
        ver.setStyleSheet(f"color: {C_MUTED2}; font-size: 10px; letter-spacing: 1px;")
        school = QLabel("Da Vinci · 2025")
        school.setStyleSheet(f"color: {C_MUTED2}; font-size: 10px;")
        footer_row.addWidget(ver)
        footer_row.addStretch()
        footer_row.addWidget(school)
        lay.addLayout(footer_row)

    def paintEvent(self, event):
        super().paintEvent(event)
        p = QPainter(self)
        grad = QLinearGradient(self.width(), 0, self.width(), self.height())
        grad.setColorAt(0, QColor(0, 230, 118, 18))
        grad.setColorAt(1, QColor(0, 230, 118, 0))
        p.fillRect(self.width() - 2, 0, 2, self.height(), QBrush(grad))
        p.end()


class LoginScreen(QWidget):
    login_success = pyqtSignal()

    def __init__(self):
        super().__init__()
        self.setStyleSheet(f"background-color: {C_BG};")
        self._build_ui()

    def _build_ui(self):
        root = QHBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)

        # Panel izquierdo (branding)
        brand = BrandPanel()
        brand.setFixedWidth(460)
        root.addWidget(brand)

        # Panel derecho (formulario)
        form_container = QWidget()
        form_container.setStyleSheet(f"background-color: {C_BG};")
        form_lay = QVBoxLayout(form_container)
        form_lay.setAlignment(Qt.AlignmentFlag.AlignCenter)
        form_lay.setContentsMargins(60, 0, 60, 0)

        card = QFrame()
        card.setObjectName("card")
        card.setFixedWidth(380)
        card_lay = QVBoxLayout(card)
        card_lay.setContentsMargins(36, 40, 36, 40)
        card_lay.setSpacing(0)

        # Header del formulario
        welcome = QLabel("Bienvenido de nuevo")
        welcome.setFont(QFont("Segoe UI", 20, QFont.Weight.Bold))
        welcome.setStyleSheet(f"color: {C_TEXT};")
        card_lay.addWidget(welcome)
        card_lay.addSpacing(6)

        desc = QLabel("Ingresá para acceder a tus análisis.")
        desc.setStyleSheet(f"color: {C_MUTED}; font-size: 13px;")
        card_lay.addWidget(desc)
        card_lay.addSpacing(32)

        # Email
        self._add_field(card_lay, "Correo electrónico", "usuario@club.com")
        self.email_edit = self._last_field
        self.email_edit.setText("admin@apert.com")
        card_lay.addSpacing(16)

        # Password
        self._add_field(card_lay, "Contraseña", "••••••••", password=True)
        self.pass_edit = self._last_field
        self.pass_edit.setText("rugby2024")
        self.pass_edit.returnPressed.connect(self._do_login)
        card_lay.addSpacing(8)

        # Error label
        self.error_lbl = QLabel("")
        self.error_lbl.setStyleSheet(f"color: {C_RED}; font-size: 11px;")
        self.error_lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.error_lbl.setVisible(False)
        card_lay.addWidget(self.error_lbl)
        card_lay.addSpacing(20)

        # Login button
        login_btn = QPushButton("Ingresar a Apert Vision")
        login_btn.setFixedHeight(46)
        login_btn.setStyleSheet(
            f"background-color: {C_GREEN}; color: #000; font-weight: 700;"
            f"font-size: 14px; border-radius: 8px; border: none;"
        )
        login_btn.clicked.connect(self._do_login)
        card_lay.addWidget(login_btn)
        card_lay.addSpacing(12)

        # Guest button
        guest_btn = QPushButton("Continuar sin cuenta →")
        guest_btn.setObjectName("ghost")
        guest_btn.clicked.connect(self._guest_login)
        card_lay.addWidget(guest_btn)
        card_lay.addSpacing(28)

        # Divider + hint
        hint_sep = QFrame()
        hint_sep.setFrameShape(QFrame.Shape.HLine)
        hint_sep.setStyleSheet(f"background-color: {C_BORDER}; max-height: 1px;")
        card_lay.addWidget(hint_sep)
        card_lay.addSpacing(16)

        hint = QLabel("Demo: admin@apert.com / rugby2024")
        hint.setStyleSheet(f"color: {C_MUTED2}; font-size: 10px; letter-spacing: 0.5px;")
        hint.setAlignment(Qt.AlignmentFlag.AlignCenter)
        card_lay.addWidget(hint)

        form_lay.addWidget(card)
        root.addWidget(form_container, 1)

    def _add_field(self, lay, label_text: str, placeholder: str, password=False):
        lbl = QLabel(label_text)
        lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 11px; font-weight: 600; letter-spacing: 0.5px;")
        lay.addWidget(lbl)
        lay.addSpacing(6)
        field = QLineEdit()
        field.setPlaceholderText(placeholder)
        field.setFixedHeight(44)
        if password:
            field.setEchoMode(QLineEdit.EchoMode.Password)
        lay.addWidget(field)
        self._last_field = field

    def _do_login(self):
        email = self.email_edit.text().strip()
        pwd   = self.pass_edit.text()
        if not email or not pwd:
            self._show_error("Completá todos los campos.")
            return
        if _DEMO_CREDENTIALS.get(email) != pwd:
            self._show_error("Correo o contraseña incorrectos.")
            return
        user_state.login(email)
        self.login_success.emit()

    def _guest_login(self):
        user_state.login("invitado@apert.com", "Invitado")
        self.login_success.emit()

    def _show_error(self, msg: str):
        self.error_lbl.setText(msg)
        self.error_lbl.setVisible(True)
