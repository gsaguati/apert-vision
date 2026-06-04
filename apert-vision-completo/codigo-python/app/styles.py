# ── Exact colors from JS source (theme.css) ───────────────────────────────────
C_BG       = "#080c14"   # --background
C_SURFACE  = "#0f1520"   # --card
C_SURFACE2 = "#151d2e"   # --secondary / --muted / --input-background
C_ACCENT   = "#1a2540"   # --accent

# Borders: rgba(255,255,255,0.07) on #080c14 → computed solid approx
C_BORDER   = "#191d25"   # rgba(255,255,255,0.07)
C_BORDER2  = "#2a3550"   # --switch-background / more visible border
# Sidebar border: rgba(255,255,255,0.06) on #0a0f1c → computed
C_SIDEBAR_BORDER = "#191d2a"

C_GREEN    = "#39e07a"   # --primary
C_GREEN2   = "#2bc466"   # hover
C_GREEN3   = "#1db954"   # pressed / gradient end
C_GREENBG  = "#0d2218"   # rgba(57,224,122,0.1) on dark ≈

C_TEXT     = "#e8eaf0"   # --foreground
C_MUTED    = "#6b7a99"   # --muted-foreground
C_MUTED2   = "#3a4a66"   # darker muted

C_RED      = "#ef4444"   # --destructive
C_REDBG    = "#2a1414"
C_ORANGE   = "#f59e0b"   # --chart-3 amber
C_ORANGEBG = "#261e08"
C_BLUE     = "#3b82f6"   # --chart-2
C_BLUEBG   = "#0a1630"

C_SIDEBAR  = "#0a0f1c"   # --sidebar

STYLESHEET = f"""
/* ── Base ───────────────────────────────────────────────────────── */
QMainWindow, QWidget {{
    background-color: {C_BG};
    color: {C_TEXT};
    font-family: "Inter", "Segoe UI", Arial, sans-serif;
    font-size: 14px;
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
    color: {C_BG};
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-weight: 600;
    font-size: 13px;
}}
QPushButton:hover  {{ background-color: {C_GREEN2}; }}
QPushButton:pressed {{ background-color: {C_GREEN3}; }}
QPushButton:disabled {{ background-color: {C_BORDER2}; color: {C_MUTED2}; }}

QPushButton#secondary {{
    background-color: transparent;
    color: {C_TEXT};
    border: 1px solid {C_BORDER2};
    border-radius: 8px;
}}
QPushButton#secondary:hover {{ border-color: {C_GREEN}; color: {C_GREEN}; }}

QPushButton#ghost {{
    background-color: transparent;
    color: {C_MUTED};
    border: none;
    padding: 6px 10px;
    font-size: 12px;
}}
QPushButton#ghost:hover {{ color: {C_TEXT}; background-color: {C_SURFACE2}; border-radius: 6px; }}

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
    padding: 4px 14px;
    font-size: 12px;
    font-weight: 600;
}}
QPushButton#pillInactive {{
    background-color: transparent;
    color: {C_MUTED};
    border: 1px solid {C_BORDER};
    border-radius: 14px;
    padding: 4px 14px;
    font-size: 12px;
}}
QPushButton#pillInactive:hover {{ color: {C_TEXT}; border-color: {C_BORDER2}; }}

/* ── Inputs ──────────────────────────────────────────────────────── */
QLineEdit {{
    background-color: {C_SURFACE2};
    border: 1px solid {C_BORDER};
    border-radius: 8px;
    padding: 8px 12px;
    color: {C_TEXT};
    font-size: 13px;
}}
QLineEdit:focus {{ border-color: {C_GREEN}; }}

/* ── Progress ────────────────────────────────────────────────────── */
QProgressBar {{
    background-color: {C_SURFACE2};
    border: none;
    border-radius: 4px;
    height: 8px;
    color: transparent;
}}
QProgressBar::chunk {{ background-color: {C_GREEN}; border-radius: 4px; }}

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
    font-size: 11px;
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
    width: 6px; margin: 0;
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
    background: {C_BORDER2};
    border-radius: 2px;
}}
QSlider::handle:horizontal {{
    background: {C_GREEN};
    border: none;
    width: 16px; height: 16px;
    margin: -6px 0;
    border-radius: 8px;
}}
QSlider::sub-page:horizontal {{ background: {C_GREEN}; border-radius: 2px; }}

/* ── Radio ───────────────────────────────────────────────────────── */
QRadioButton {{ color: {C_TEXT}; font-size: 13px; spacing: 6px; }}
QRadioButton::indicator {{
    width: 16px; height: 16px; border-radius: 8px;
    border: 2px solid {C_BORDER2};
    background: {C_SURFACE2};
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
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 11px;
}}

/* ── Scroll area ─────────────────────────────────────────────────── */
QScrollArea {{ border: none; background: transparent; }}

/* ── Named labels ────────────────────────────────────────────────── */
QLabel#pageTitle  {{ font-size: 22px; font-weight: 700; color: {C_TEXT}; }}
QLabel#pageSub    {{ font-size: 13px; color: {C_MUTED}; }}
QLabel#sectionHdr {{ font-size: 11px; color: {C_MUTED}; letter-spacing: 1px; }}
QLabel#breadcrumb {{ font-size: 12px; color: {C_MUTED}; }}
QLabel#caption    {{ font-size: 11px; color: {C_MUTED}; }}
QLabel#green      {{ color: {C_GREEN}; font-size: 11px; font-weight: 600; }}
QLabel#red        {{ color: {C_RED};   font-size: 11px; font-weight: 600; }}

QFrame#card {{
    background-color: {C_SURFACE};
    border: 1px solid {C_BORDER};
    border-radius: 12px;
}}
QFrame#divider {{
    background-color: {C_BORDER};
    max-height: 1px;
}}
"""
