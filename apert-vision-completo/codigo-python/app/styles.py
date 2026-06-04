C_BG      = "#040506"
C_SURFACE = "#0d1117"
C_SURFACE2= "#111820"
C_BORDER  = "#1a2530"
C_BORDER2 = "#243040"
C_GREEN   = "#00e676"
C_GREEN2  = "#00c853"
C_GREEN3  = "#009e45"
C_TEXT    = "#f0f4f0"
C_MUTED   = "#6a8070"
C_MUTED2  = "#4a5c50"
C_ORANGE  = "#ff9800"
C_BLUE    = "#29b6f6"
C_RED     = "#ef5350"

STYLESHEET = f"""
/* ── Base ──────────────────────────────────── */
QMainWindow, QWidget {{
    background-color: {C_BG};
    color: {C_TEXT};
    font-family: "Segoe UI", Arial, sans-serif;
    font-size: 13px;
}}

/* ── GroupBox ───────────────────────────────── */
QGroupBox {{
    border: 1px solid {C_BORDER};
    border-radius: 8px;
    margin-top: 12px;
    padding: 10px;
    font-size: 10px;
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

/* ── Buttons ─────────────────────────────────── */
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
QPushButton:pressed {{ background-color: {C_GREEN3}; }}
QPushButton:disabled {{ background-color: {C_BORDER}; color: {C_MUTED2}; }}
QPushButton#secondary {{
    background-color: {C_SURFACE};
    color: {C_TEXT};
    border: 1px solid {C_BORDER};
}}
QPushButton#secondary:hover {{ border-color: {C_GREEN}; color: {C_GREEN}; }}
QPushButton#ghost {{
    background-color: transparent;
    color: {C_MUTED};
    border: none;
    padding: 6px 12px;
    font-size: 12px;
}}
QPushButton#ghost:hover {{ color: {C_TEXT}; }}
QPushButton#danger {{ background-color: #c62828; color: {C_TEXT}; }}
QPushButton#danger:hover {{ background-color: #e53935; }}

/* ── Inputs ──────────────────────────────────── */
QLineEdit {{
    background-color: {C_SURFACE};
    border: 1px solid {C_BORDER};
    border-radius: 6px;
    padding: 8px 12px;
    color: {C_TEXT};
    font-size: 13px;
}}
QLineEdit:focus {{ border-color: {C_GREEN}; }}
QLineEdit::placeholder {{ color: {C_MUTED2}; }}

/* ── Progress ────────────────────────────────── */
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

/* ── Table ───────────────────────────────────── */
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
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}}

/* ── Tabs ────────────────────────────────────── */
QTabWidget::pane {{
    border: 1px solid {C_BORDER};
    border-top: none;
    border-radius: 0 0 8px 8px;
    background-color: {C_SURFACE};
}}
QTabBar::tab {{
    background-color: {C_BG};
    color: {C_MUTED};
    border: 1px solid {C_BORDER};
    border-bottom: none;
    padding: 8px 16px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
    min-width: 80px;
}}
QTabBar::tab:selected {{
    background-color: {C_SURFACE};
    color: {C_GREEN};
    border-top: 2px solid {C_GREEN};
}}
QTabBar::tab:hover:!selected {{
    color: {C_TEXT};
    background-color: {C_SURFACE2};
}}

/* ── Slider ──────────────────────────────────── */
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

/* ── Scrollbars ──────────────────────────────── */
QScrollBar:vertical {{
    background: {C_SURFACE};
    width: 6px;
    border-radius: 3px;
    margin: 0;
}}
QScrollBar::handle:vertical {{
    background: {C_BORDER2};
    border-radius: 3px;
    min-height: 24px;
}}
QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{ height: 0px; }}
QScrollBar:horizontal {{
    background: {C_SURFACE};
    height: 6px;
    border-radius: 3px;
}}
QScrollBar::handle:horizontal {{
    background: {C_BORDER2};
    border-radius: 3px;
    min-width: 24px;
}}
QScrollBar::add-line:horizontal, QScrollBar::sub-line:horizontal {{ width: 0px; }}

/* ── Radio ───────────────────────────────────── */
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

/* ── Tooltip ─────────────────────────────────── */
QToolTip {{
    background-color: {C_SURFACE2};
    color: {C_TEXT};
    border: 1px solid {C_BORDER2};
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 11px;
}}

/* ── Named labels ────────────────────────────── */
QLabel#title {{
    font-size: 22px;
    font-weight: 800;
    color: {C_GREEN};
    letter-spacing: 2px;
}}
QLabel#subtitle {{
    font-size: 10px;
    color: {C_MUTED};
    letter-spacing: 1.5px;
    text-transform: uppercase;
}}
QLabel#sectionTitle {{
    font-size: 18px;
    font-weight: 700;
    color: {C_TEXT};
}}
QLabel#caption {{
    font-size: 11px;
    color: {C_MUTED};
}}
QFrame#divider {{
    background-color: {C_BORDER};
    max-height: 1px;
}}
QFrame#card {{
    background-color: {C_SURFACE};
    border: 1px solid {C_BORDER};
    border-radius: 12px;
}}
"""
