from PyQt6.QtWidgets import QFrame, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QLineEdit, QFileDialog, QWidget
from PyQt6.QtCore import Qt

from app.styles import C_SURFACE, C_BORDER, C_MUTED


class StatCard(QFrame):
    def __init__(self, number: str, label: str, color: str):
        super().__init__()
        self.setStyleSheet(f"""
            QFrame {{
                background-color: {C_SURFACE};
                border: 1px solid {C_BORDER};
                border-radius: 8px;
            }}
        """)
        lay = QVBoxLayout(self)
        lay.setSpacing(2)
        lay.setContentsMargins(12, 10, 12, 10)

        self._num = QLabel(number)
        self._num.setStyleSheet(f"font-size: 26px; font-weight: 800; color: {color};")
        self._num.setAlignment(Qt.AlignmentFlag.AlignCenter)

        lbl = QLabel(label.upper())
        lbl.setStyleSheet(f"font-size: 9px; color: {C_MUTED}; letter-spacing: 1px;")
        lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)

        lay.addWidget(self._num)
        lay.addWidget(lbl)

    def update_value(self, value: str):
        self._num.setText(value)


class FilePicker(QWidget):
    def __init__(self, label: str, placeholder: str, filters: str,
                 save_mode: bool = False):
        super().__init__()
        self._filters = filters
        self._save    = save_mode

        lay = QHBoxLayout(self)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(6)

        self.edit = QLineEdit()
        self.edit.setPlaceholderText(placeholder)

        btn = QPushButton(label)
        btn.setObjectName("secondary")
        btn.setFixedWidth(90)
        btn.clicked.connect(self._browse)

        lay.addWidget(self.edit)
        lay.addWidget(btn)

    def _browse(self):
        if self._save:
            path, _ = QFileDialog.getSaveFileName(self, "Guardar como", "", self._filters)
        else:
            path, _ = QFileDialog.getOpenFileName(self, "Abrir archivo", "", self._filters)
        if path:
            self.edit.setText(path)

    def path(self) -> str:
        return self.edit.text().strip()

    def set_path(self, p: str):
        self.edit.setText(p)
