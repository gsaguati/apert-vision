from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QFrame, QScrollArea, QLineEdit, QSizePolicy, QTableWidget,
    QTableWidgetItem, QHeaderView,
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont, QColor

from app.styles import (
    C_BG, C_SURFACE, C_SURFACE2, C_BORDER, C_BORDER2,
    C_GREEN, C_GREENBG, C_RED, C_TEXT, C_MUTED, C_MUTED2,
)
import app.mock_data as mock


class AvatarLabel(QLabel):
    def __init__(self, initials: str, color: str = C_GREEN):
        super().__init__(initials)
        self.setFixedSize(34, 34)
        self.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.setStyleSheet(
            f"background-color: {color}; color: #000;"
            f"border-radius: 17px; font-size: 11px; font-weight: 800;")


POSITION_COLORS = {
    "Pilier": "#1a2a3a", "Hooker": "#1a3a2a", "Lock": "#2a1a3a",
    "Flanker": "#3a2a1a", "Nº 8": "#1a3a3a",
    "Medio Scrum": "#2a3a1a", "Apertura": "#3a1a2a",
}
AVATAR_COLORS = [
    "#00c853","#29b6f6","#ff9800","#ab47bc","#26c6da",
    "#66bb6a","#ffa726","#42a5f5","#ec407a","#26a69a",
]


class PlayersScreen(QWidget):
    def __init__(self):
        super().__init__()
        self._filter = "Todos"
        self._search = ""
        self._build_ui()

    def _build_ui(self):
        root = QVBoxLayout(self)
        root.setContentsMargins(32, 24, 32, 32)
        root.setSpacing(20)

        # Breadcrumb
        bc = QLabel("Apert Vision  ›  Jugadores")
        bc.setObjectName("breadcrumb")
        root.addWidget(bc)

        # Header
        hdr = QHBoxLayout()
        title_col = QVBoxLayout()
        title_col.setSpacing(3)
        title = QLabel("Plantel")
        title.setObjectName("pageTitle")
        sub = QLabel(f"{len(mock.PLAYERS)} jugadores registrados")
        sub.setObjectName("pageSub")
        title_col.addWidget(title)
        title_col.addWidget(sub)

        add_btn = QPushButton("＋  Agregar jugador")
        add_btn.setFixedHeight(38)
        add_btn.setFixedWidth(180)

        hdr.addLayout(title_col)
        hdr.addStretch()
        hdr.addWidget(add_btn)
        root.addLayout(hdr)

        # Search + filter pills
        filter_row = QHBoxLayout()
        filter_row.setSpacing(8)

        self._search_edit = QLineEdit()
        self._search_edit.setPlaceholderText("🔍  Buscar jugador...")
        self._search_edit.setFixedHeight(36)
        self._search_edit.setFixedWidth(220)
        self._search_edit.textChanged.connect(self._on_search)
        filter_row.addWidget(self._search_edit)

        self._pill_btns = {}
        for pos in mock.POSITIONS:
            btn = QPushButton(pos)
            btn.setFixedHeight(34)
            btn.setObjectName("pill" if pos == "Todos" else "pillInactive")
            btn.clicked.connect(lambda checked, p=pos: self._on_filter(p))
            filter_row.addWidget(btn)
            self._pill_btns[pos] = btn

        filter_row.addStretch()
        root.addLayout(filter_row)

        # Table
        self._table = QTableWidget(0, 6)
        self._table.setHorizontalHeaderLabels(
            ["#", "JUGADOR", "POSICIÓN", "EDAD", "PARTIDOS", "LINE-OUTS"])
        self._table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        self._table.horizontalHeader().setSectionResizeMode(0, QHeaderView.ResizeMode.Fixed)
        self._table.setColumnWidth(0, 40)
        self._table.verticalHeader().setVisible(False)
        self._table.setEditTriggers(QTableWidget.EditTrigger.NoEditTriggers)
        self._table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        self._table.setShowGrid(False)
        self._table.setStyleSheet(f"""
            QTableWidget {{ background-color: {C_SURFACE}; border: 1px solid {C_BORDER}; border-radius: 8px; }}
            QTableWidget::item {{ padding: 0 12px; border-bottom: 1px solid {C_BORDER}; }}
            QTableWidget::item:selected {{ background-color: {C_GREENBG}; color: {C_GREEN}; }}
            QHeaderView::section {{ background-color: {C_SURFACE}; padding: 10px 12px; }}
        """)
        self._table.setRowHeight(0, 52)
        root.addWidget(self._table, 1)

        self._populate()

    def _populate(self):
        players = mock.PLAYERS
        if self._filter != "Todos":
            players = [p for p in players if p["position"] == self._filter]
        if self._search:
            players = [p for p in players
                       if self._search.lower() in p["name"].lower()]

        self._table.setRowCount(len(players))
        for i, p in enumerate(players):
            self._table.setRowHeight(i, 52)

            # #
            num = QTableWidgetItem(str(p["id"]))
            num.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
            num.setForeground(QColor(C_MUTED))
            self._table.setItem(i, 0, num)

            # Jugador (avatar + nombre en un widget)
            player_widget = QWidget()
            pw_lay = QHBoxLayout(player_widget)
            pw_lay.setContentsMargins(8, 0, 0, 0)
            pw_lay.setSpacing(10)
            avatar = AvatarLabel(p["initials"],
                                  AVATAR_COLORS[(p["id"] - 1) % len(AVATAR_COLORS)])
            name_lbl = QLabel(p["name"])
            name_lbl.setFont(QFont("Segoe UI", 12, QFont.Weight.Bold))
            name_lbl.setStyleSheet(f"color: {C_TEXT};")
            pw_lay.addWidget(avatar)
            pw_lay.addWidget(name_lbl)
            self._table.setCellWidget(i, 1, player_widget)

            # Posición badge (compact pill, not full-width)
            pos_widget = QWidget()
            pos_lay = QHBoxLayout(pos_widget)
            pos_lay.setContentsMargins(12, 0, 0, 0)
            pos_lay.setSpacing(0)
            bg = POSITION_COLORS.get(p["position"], C_SURFACE2)
            badge = QLabel(p["position"])
            badge.setFixedHeight(24)
            badge.setStyleSheet(
                f"color: {C_MUTED}; background-color: {bg};"
                f"border-radius: 4px; padding: 2px 10px; font-size: 11px;")
            badge.setSizePolicy(
                badge.sizePolicy().horizontalPolicy(),
                badge.sizePolicy().verticalPolicy())
            badge.adjustSize()
            pos_lay.addWidget(badge, 0, Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignVCenter)
            pos_lay.addStretch()
            self._table.setCellWidget(i, 2, pos_widget)

            # Edad, Partidos
            for col, val in [(3, p["age"]), (4, p["matches"])]:
                item = QTableWidgetItem(str(val))
                item.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
                item.setForeground(QColor(C_TEXT))
                self._table.setItem(i, col, item)

            # Line-outs (verde)
            lo_item = QTableWidgetItem(str(p["lineouts"]))
            lo_item.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
            lo_item.setForeground(QColor(C_GREEN))
            lo_item.setFont(QFont("Segoe UI", 12, QFont.Weight.Bold))
            self._table.setItem(i, 5, lo_item)

    def _on_filter(self, position: str):
        self._filter = position
        for pos, btn in self._pill_btns.items():
            btn.setObjectName("pill" if pos == position else "pillInactive")
            btn.style().unpolish(btn)
            btn.style().polish(btn)
        self._populate()

    def _on_search(self, text: str):
        self._search = text
        self._populate()
