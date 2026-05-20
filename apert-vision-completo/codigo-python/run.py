"""
Punto de entrada de la aplicación Apert Vision.
Ejecutar desde la carpeta codigo-python/:
    python run.py
"""

import sys
from pathlib import Path

# Asegura que el directorio raíz esté en el path para los imports de app/ y core/
sys.path.insert(0, str(Path(__file__).parent))

from PyQt6.QtWidgets import QApplication
from app.styles import STYLESHEET
from app.window import MainWindow


def main():
    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    app.setStyleSheet(STYLESHEET)
    win = MainWindow()
    win.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
