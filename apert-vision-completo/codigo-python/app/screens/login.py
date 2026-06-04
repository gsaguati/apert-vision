from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QLineEdit,
    QPushButton, QFrame, QSizePolicy,
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont

from app.styles import C_BG, C_SURFACE, C_BORDER, C_GREEN, C_GREEN2, C_TEXT, C_MUTED
import app.user_state as user_state

# Credenciales de prueba (reemplazar con Auth0 en producción)
_DEMO_CREDENTIALS = {
    "admin@apert.com": "rugby2024",
    "demo@apert.com":  "demo",
}


class LoginScreen(QWidget):
    login_success = pyqtSignal()

    def __init__(self):
        super().__init__()
        self.setStyleSheet(f"background-color: {C_BG};")
        self._build_ui()

    def _build_ui(self):
        root = QVBoxLayout(self)
        root.setAlignment(Qt.AlignmentFlag.AlignCenter)
        root.setContentsMargins(0, 0, 0, 0)

        card = QFrame()
        card.setFixedWidth(420)
        card.setStyleSheet(f"""
            QFrame {{
                background-color: {C_SURFACE};
                border: 1px solid {C_BORDER};
                border-radius: 16px;
            }}
        """)
        card_lay = QVBoxLayout(card)
        card_lay.setContentsMargins(40, 44, 40, 44)
        card_lay.setSpacing(0)

        # Logo
        logo = QLabel("APERT\nVISION")
        logo.setFont(QFont("Segoe UI", 28, QFont.Weight.ExtraBold))
        logo.setStyleSheet(f"color: {C_GREEN}; letter-spacing: 3px; border: none;")
        logo.setAlignment(Qt.AlignmentFlag.AlignCenter)
        card_lay.addWidget(logo)

        tagline = QLabel("Detección inteligente de formaciones")
        tagline.setStyleSheet(f"color: {C_MUTED}; font-size: 13px; border: none;")
        tagline.setAlignment(Qt.AlignmentFlag.AlignCenter)
        card_lay.addWidget(tagline)
        card_lay.addSpacing(36)

        # Email
        email_lbl = QLabel("Correo electrónico")
        email_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 11px; letter-spacing: 0.5px; border: none;")
        card_lay.addWidget(email_lbl)
        card_lay.addSpacing(6)

        self.email_edit = QLineEdit()
        self.email_edit.setPlaceholderText("usuario@club.com")
        self.email_edit.setFixedHeight(42)
        self.email_edit.setText("admin@apert.com")
        card_lay.addWidget(self.email_edit)
        card_lay.addSpacing(16)

        # Password
        pass_lbl = QLabel("Contraseña")
        pass_lbl.setStyleSheet(f"color: {C_MUTED}; font-size: 11px; letter-spacing: 0.5px; border: none;")
        card_lay.addWidget(pass_lbl)
        card_lay.addSpacing(6)

        self.pass_edit = QLineEdit()
        self.pass_edit.setPlaceholderText("••••••••")
        self.pass_edit.setEchoMode(QLineEdit.EchoMode.Password)
        self.pass_edit.setFixedHeight(42)
        self.pass_edit.setText("rugby2024")
        self.pass_edit.returnPressed.connect(self._do_login)
        card_lay.addWidget(self.pass_edit)
        card_lay.addSpacing(8)

        self.error_lbl = QLabel("")
        self.error_lbl.setStyleSheet("color: #ef5350; font-size: 11px; border: none;")
        self.error_lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.error_lbl.setVisible(False)
        card_lay.addWidget(self.error_lbl)
        card_lay.addSpacing(20)

        # Botón
        self.login_btn = QPushButton("Ingresar")
        self.login_btn.setFixedHeight(46)
        self.login_btn.setStyleSheet(
            f"background-color: {C_GREEN}; color: #000; font-weight: 700;"
            f"font-size: 14px; border-radius: 8px; border: none;"
        )
        self.login_btn.clicked.connect(self._do_login)
        card_lay.addWidget(self.login_btn)
        card_lay.addSpacing(20)

        # Demo hint
        hint = QLabel("Demo: admin@apert.com / rugby2024")
        hint.setStyleSheet(f"color: {C_BORDER}; font-size: 10px; border: none;")
        hint.setAlignment(Qt.AlignmentFlag.AlignCenter)
        card_lay.addWidget(hint)

        root.addWidget(card)

    def _do_login(self):
        email = self.email_edit.text().strip()
        pwd   = self.pass_edit.text()

        if not email or not pwd:
            self._show_error("Completá todos los campos.")
            return

        # Validación demo (reemplazar con Auth0)
        expected = _DEMO_CREDENTIALS.get(email)
        if expected is None or expected != pwd:
            self._show_error("Credenciales incorrectas.")
            return

        user_state.login(email)
        self.login_success.emit()

    def _show_error(self, msg: str):
        self.error_lbl.setText(msg)
        self.error_lbl.setVisible(True)
