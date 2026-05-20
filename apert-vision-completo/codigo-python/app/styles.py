C_BG      = "#040506"
C_SURFACE = "#0d1117"
C_BORDER  = "#1a2530"
C_GREEN   = "#00e676"
C_GREEN2  = "#00c853"
C_TEXT    = "#f0f4f0"
C_MUTED   = "#6a8070"
C_ORANGE  = "#ff9800"
C_BLUE    = "#29b6f6"

STYLESHEET = f"""
QMainWindow, QWidget {{
    background-color: {C_BG};
    color: {C_TEXT};
    font-family: "Segoe UI", Arial, sans-serif;
    font-size: 13px;
}}
QGroupBox {{
    border: 1px solid {C_BORDER};
    border-radius: 8px;
    margin-top: 12px;
    padding: 10px;
    font-size: 11px;
    color: {C_MUTED};
    text-transform: uppercase;
    letter-spacing: 1px;
}}
QGroupBox::title {{
    subcontrol-origin: margin;
    subcontrol-position: top left;
    padding: 0 6px;
    left: 10px;
}}
QPushButton {{
    background-color: {C_GREEN};
    color: #000000;
    border: none;
    border-radius: 6px;
    padding: 10px 18px;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.5px;
}}
QPushButton:hover {{ background-color: {C_GREEN2}; }}
QPushButton:disabled {{ background-color: {C_BORDER}; color: {C_MUTED}; }}
QPushButton#secondary {{
    background-color: {C_SURFACE};
    color: {C_TEXT};
    border: 1px solid {C_BORDER};
}}
QPushButton#secondary:hover {{ border-color: {C_GREEN}; color: {C_GREEN}; }}
QPushButton#danger {{ background-color: #c62828; color: {C_TEXT}; }}
QPushButton#danger:hover {{ background-color: #e53935; }}
QLineEdit {{
    background-color: {C_SURFACE};
    border: 1px solid {C_BORDER};
    border-radius: 5px;
    padding: 7px 10px;
    color: {C_TEXT};
    font-size: 12px;
}}
QLineEdit:focus {{ border-color: {C_GREEN}; }}
QProgressBar {{
    background-color: {C_SURFACE};
    border: 1px solid {C_BORDER};
    border-radius: 4px;
    height: 8px;
    text-align: center;
    font-size: 11px;
    color: {C_TEXT};
}}
QProgressBar::chunk {{ background-color: {C_GREEN}; border-radius: 4px; }}
QTableWidget {{
    background-color: {C_SURFACE};
    border: 1px solid {C_BORDER};
    border-radius: 6px;
    gridline-color: {C_BORDER};
    color: {C_TEXT};
    font-size: 12px;
}}
QTableWidget::item {{ padding: 6px 8px; }}
QTableWidget::item:selected {{ background-color: #1a2f20; color: {C_GREEN}; }}
QHeaderView::section {{
    background-color: {C_BG};
    color: {C_MUTED};
    border: none;
    border-bottom: 1px solid {C_BORDER};
    padding: 8px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}}
QSlider::groove:horizontal {{
    height: 4px;
    background: {C_BORDER};
    border-radius: 2px;
}}
QSlider::handle:horizontal {{
    background: {C_GREEN};
    border: none;
    width: 14px;
    height: 14px;
    margin: -5px 0;
    border-radius: 7px;
}}
QSlider::sub-page:horizontal {{ background: {C_GREEN}; border-radius: 2px; }}
QScrollBar:vertical {{
    background: {C_SURFACE};
    width: 6px;
    border-radius: 3px;
}}
QScrollBar::handle:vertical {{
    background: {C_BORDER};
    border-radius: 3px;
    min-height: 20px;
}}
QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{ height: 0px; }}
QRadioButton {{
    color: {C_TEXT};
    font-size: 12px;
    spacing: 6px;
}}
QRadioButton::indicator {{
    width: 14px;
    height: 14px;
    border-radius: 7px;
    border: 2px solid {C_BORDER};
    background: {C_SURFACE};
}}
QRadioButton::indicator:checked {{
    border-color: {C_GREEN};
    background: {C_GREEN};
}}
QLabel#title {{
    font-size: 22px;
    font-weight: 800;
    color: {C_GREEN};
    letter-spacing: 2px;
}}
QLabel#subtitle {{
    font-size: 11px;
    color: {C_MUTED};
    letter-spacing: 1px;
}}
QFrame#divider {{
    background-color: {C_BORDER};
    max-height: 1px;
}}
"""
