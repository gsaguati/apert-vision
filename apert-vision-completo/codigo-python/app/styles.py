# ── Palette (matched from mockup) ─────────────────────────────────────────────
C_BG       = "#0d1117"
C_SURFACE  = "#161b22"
C_SURFACE2 = "#1c2128"
C_BORDER   = "#21262d"
C_BORDER2  = "#30363d"

C_GREEN    = "#00e676"
C_GREEN2   = "#00c853"
C_GREEN3   = "#009e45"
C_GREENBG  = "#0d2a1a"   # icon bg / active nav bg

C_TEXT     = "#e6edf3"
C_MUTED    = "#8b949e"
C_MUTED2   = "#484f58"

C_RED      = "#ef5350"
C_REDBG    = "#2a1a1a"
C_ORANGE   = "#ff9800"
C_ORANGEBG = "#2a1e0a"
C_BLUE     = "#29b6f6"
C_BLUEBG   = "#0a1f2a"
C_GREEN3   = "#009e45"

STYLESHEET = f"""
/* ── Base ───────────────────────────────────────────────────────── */
QMainWindow, QWidget {{
    background-color: {C_BG};
    color: {C_TEXT};
    font-family: "Segoe UI", "Inter", Arial, sans-serif;
    font-size: 13px;
}}
QDialog {{
    background-color: {C_SURFACE};
    border: 1px solid {C_BORDER};
    border-radius: 12px;
}}

/* ── GroupBox ────────────────────────────────────────────────────── */
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

/* ── Buttons ─────────────────────────────────────────────────────── */
QPushButton {{
    background-color: {C_GREEN};
    color: #000;
    border: none;
    border-radius: 6px;
    padding: 9px 18px;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.3px;
}}
QPushButton:hover  {{ background-color: {C_GREEN2}; }}
QPushButton:pressed {{ background-color: {C_GREEN3}; }}
QPushButton:disabled {{ background-color: {C_BORDER}; color: {C_MUTED2}; }}

QPushButton#secondary {{
    background-color: transparent;
    color: {C_TEXT};
    border: 1px solid {C_BORDER2};
    border-radius: 6px;
}}
QPushButton#secondary:hover {{ border-color: {C_GREEN}; color: {C_GREEN}; }}

QPushButton#ghost {{
    background-color: transparent;
    color: {C_MUTED};
    border: none;
    padding: 6px 10px;
    font-size: 12px;
}}
QPushButton#ghost:hover {{ color: {C_TEXT}; }}

QPushButton#danger {{
    background-color: transparent;
    color: {C_RED};
    border: none;
    padding: 4px 8px;
}}
QPushButton#danger:hover {{ background-color: {C_REDBG}; border-radius: 4px; }}

QPushButton#pill {{
    background-color: {C_GREENBG};
    color: {C_GREEN};
    border: 1px solid {C_GREEN3};
    border-radius: 14px;
    padding: 5px 14px;
    font-size: 12px;
    font-weight: 600;
}}
QPushButton#pill:hover {{ background-color: #143320; }}

QPushButton#pillInactive {{
    background-color: {C_SURFACE2};
    color: {C_MUTED};
    border: 1px solid {C_BORDER};
    border-radius: 14px;
    padding: 5px 14px;
    font-size: 12px;
}}
QPushButton#pillInactive:hover {{ color: {C_TEXT}; border-color: {C_BORDER2}; }}

/* ── Inputs ──────────────────────────────────────────────────────── */
QLineEdit {{
    background-color: {C_SURFACE2};
    border: 1px solid {C_BORDER};
    border-radius: 6px;
    padding: 8px 12px;
    color: {C_TEXT};
    font-size: 13px;
}}
QLineEdit:focus {{ border-color: {C_GREEN}; }}

/* ── Progress ────────────────────────────────────────────────────── */
QProgressBar {{
    background-color: {C_SURFACE2};
    border: none;
    border-radius: 3px;
    height: 6px;
    text-align: center;
    font-size: 10px;
    color: transparent;
}}
QProgressBar::chunk {{ background-color: {C_GREEN}; border-radius: 3px; }}

/* ── Table ───────────────────────────────────────────────────────── */
QTableWidget {{
    background-color: transparent;
    border: none;
    gridline-color: {C_BORDER};
    color: {C_TEXT};
    font-size: 13px;
}}
QTableWidget::item {{
    padding: 10px 12px;
    border-bottom: 1px solid {C_BORDER};
}}
QTableWidget::item:selected {{
    background-color: {C_GREENBG};
    color: {C_GREEN};
}}
QHeaderView {{
    background-color: transparent;
}}
QHeaderView::section {{
    background-color: {C_SURFACE};
    color: {C_MUTED};
    border: none;
    border-bottom: 1px solid {C_BORDER};
    padding: 10px 12px;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
}}

/* ── Tabs ────────────────────────────────────────────────────────── */
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
    padding: 8px 18px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.3px;
    min-width: 90px;
}}
QTabBar::tab:selected {{
    background-color: {C_SURFACE};
    color: {C_GREEN};
    border-top: 2px solid {C_GREEN};
}}
QTabBar::tab:hover:!selected {{ color: {C_TEXT}; background-color: {C_SURFACE2}; }}

/* ── Scrollbars ──────────────────────────────────────────────────── */
QScrollBar:vertical {{
    background: transparent;
    width: 6px;
    margin: 0;
}}
QScrollBar::handle:vertical {{
    background: {C_BORDER2};
    border-radius: 3px;
    min-height: 24px;
}}
QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{ height: 0; }}
QScrollBar:horizontal {{
    background: transparent;
    height: 6px;
}}
QScrollBar::handle:horizontal {{
    background: {C_BORDER2};
    border-radius: 3px;
    min-width: 24px;
}}
QScrollBar::add-line:horizontal, QScrollBar::sub-line:horizontal {{ width: 0; }}

/* ── Slider ──────────────────────────────────────────────────────── */
QSlider::groove:horizontal {{
    height: 4px;
    background: {C_BORDER};
    border-radius: 2px;
}}
QSlider::handle:horizontal {{
    background: {C_GREEN};
    border: none;
    width: 14px; height: 14px;
    margin: -5px 0;
    border-radius: 7px;
}}
QSlider::sub-page:horizontal {{ background: {C_GREEN}; border-radius: 2px; }}

/* ── Radio ───────────────────────────────────────────────────────── */
QRadioButton {{ color: {C_TEXT}; font-size: 12px; spacing: 6px; }}
QRadioButton::indicator {{
    width: 14px; height: 14px;
    border-radius: 7px;
    border: 2px solid {C_BORDER};
    background: {C_SURFACE};
}}
QRadioButton::indicator:checked {{
    border-color: {C_GREEN};
    background: {C_GREEN};
}}

/* ── Tooltip ─────────────────────────────────────────────────────── */
QToolTip {{
    background-color: {C_SURFACE2};
    color: {C_TEXT};
    border: 1px solid {C_BORDER2};
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 11px;
}}

/* ── Scroll area ─────────────────────────────────────────────────── */
QScrollArea {{ border: none; background: transparent; }}

/* ── Named labels ────────────────────────────────────────────────── */
QLabel#pageTitle  {{ font-size: 20px; font-weight: 700; color: {C_TEXT}; }}
QLabel#pageSub    {{ font-size: 12px; color: {C_MUTED}; }}
QLabel#sectionHdr {{ font-size: 11px; color: {C_MUTED}; letter-spacing: 1px; text-transform: uppercase; }}
QLabel#breadcrumb {{ font-size: 12px; color: {C_MUTED}; }}
QLabel#caption    {{ font-size: 11px; color: {C_MUTED}; }}
QLabel#green      {{ color: {C_GREEN}; font-size: 11px; font-weight: 600; }}
QLabel#red        {{ color: {C_RED};   font-size: 11px; font-weight: 600; }}

QFrame#card {{
    background-color: {C_SURFACE};
    border: 1px solid {C_BORDER};
    border-radius: 10px;
}}
QFrame#divider {{
    background-color: {C_BORDER};
    max-height: 1px;
}}
"""
