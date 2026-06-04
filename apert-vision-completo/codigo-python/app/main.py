import sys
from PyQt6.QtWidgets import QApplication
from app.styles import STYLESHEET
from app.screens.login import LoginScreen
from app.app_window import AppWindow
import app.user_state as user_state


def main():
    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    app.setStyleSheet(STYLESHEET)

    login = LoginScreen()
    main_win: AppWindow | None = None

    def on_login_success():
        nonlocal main_win
        login.hide()
        main_win = AppWindow()
        main_win.logout_requested.connect(on_logout)
        main_win.show()

    def on_logout():
        user_state.logout()
        main_win.hide()
        login.show()

    login.login_success.connect(on_login_success)
    login.resize(900, 620)
    login.show()

    sys.exit(app.exec())


if __name__ == "__main__":
    main()
