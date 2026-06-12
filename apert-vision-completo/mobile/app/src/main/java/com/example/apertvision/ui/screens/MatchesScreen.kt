package com.example.apertvision.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Flight
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Sports
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.apertvision.data.Club
import com.example.apertvision.data.Miembro
import com.example.apertvision.matches.MatchesViewModel
import com.example.apertvision.matches.PartidoConStats
import com.example.apertvision.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MatchesScreen(
    miembro: Miembro,
    club: Club,
    onLogout: () -> Unit,
    onMatchClick: (String) -> Unit,
    viewModel: MatchesViewModel = viewModel(),
) {
    val matches by viewModel.matches.collectAsState()
    val loading by viewModel.loading.collectAsState()
    val error   by viewModel.error.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(club.nombre, color = OnBackground, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text("Hola, ${miembro.nombre.split(" ").first()} · ${miembro.rol.replaceFirstChar { it.uppercase() }}",
                            color = Muted, fontSize = 11.sp)
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.load() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Recargar", tint = Muted)
                    }
                    IconButton(onClick = onLogout) {
                        Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = "Salir", tint = Muted)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Background),
            )
        },
        containerColor = Background,
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            when {
                loading && matches.isEmpty() -> {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = Primary)
                    }
                }
                error != null && matches.isEmpty() -> {
                    Box(Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                        Text(error ?: "", color = ErrorRed, fontSize = 13.sp)
                    }
                }
                matches.isEmpty() -> {
                    EmptyState()
                }
                else -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                        contentPadding = PaddingValues(vertical = 16.dp),
                    ) {
                        item {
                            Text(
                                "${matches.size} partido${if (matches.size == 1) "" else "s"} con clips disponibles",
                                color = Muted, fontSize = 12.sp,
                                modifier = Modifier.padding(start = 4.dp, bottom = 4.dp),
                            )
                        }
                        items(matches, key = { it.partido.id }) { m ->
                            MatchCard(m, onClick = { onMatchClick(m.partido.id) })
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun EmptyState() {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text("🏉", fontSize = 56.sp)
        Spacer(Modifier.height(16.dp))
        Text("Todavía no hay partidos", color = OnBackground, fontSize = 16.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(8.dp))
        Text("Cuando tu entrenador suba un partido analizado, aparece acá.",
            color = Muted, fontSize = 13.sp,
            modifier = Modifier.padding(horizontal = 24.dp))
    }
}

@Composable
private fun MatchCard(m: PartidoConStats, onClick: () -> Unit) {
    val resultadoColor = when (m.partido.resultado) {
        "W" -> Primary
        "L" -> ErrorRed
        else -> Muted
    }
    val resultadoLabel = when (m.partido.resultado) {
        "W" -> "V"; "L" -> "D"; "D" -> "E"; else -> "—"
    }

    Surface(
        modifier = Modifier.fillMaxWidth().clickable { onClick() },
        color = Surface,
        shape = RoundedCornerShape(14.dp),
        border = BorderStroke(1.dp, Border),
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            // Resultado badge
            Box(
                modifier = Modifier.size(40.dp).clip(RoundedCornerShape(10.dp))
                    .background(resultadoColor.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center,
            ) {
                Text(resultadoLabel, color = resultadoColor, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }

            Spacer(Modifier.width(12.dp))

            Column(Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("vs. ${m.partido.rival}", color = OnBackground,
                        fontSize = 14.sp, fontWeight = FontWeight.SemiBold,
                        maxLines = 1)
                    Spacer(Modifier.width(6.dp))
                    LocalVisitanteBadge(m.partido.esLocal)
                }
                Spacer(Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.CalendarToday, contentDescription = null, tint = Muted, modifier = Modifier.size(10.dp))
                    Spacer(Modifier.width(4.dp))
                    Text(m.partido.fecha, color = Muted, fontSize = 11.sp)
                    if (!m.partido.marcador.isNullOrBlank()) {
                        Text("  ·  ${m.partido.marcador}", color = Muted, fontSize = 11.sp)
                    }
                }
                Spacer(Modifier.height(6.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (m.lineouts > 0) StatChip(m.lineouts, "line-outs", LineoutColor)
                    if (m.scrums   > 0) StatChip(m.scrums,   "scrums",    ScrumColor)
                    if (m.kickoffs > 0) StatChip(m.kickoffs, "salidas",   KickoffColor)
                }
            }

            Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Muted)
        }
    }
}

@Composable
private fun LocalVisitanteBadge(esLocal: Boolean) {
    val color = if (esLocal) Primary else ScrumColor
    val icon  = if (esLocal) Icons.Default.Home else Icons.Default.Flight
    val label = if (esLocal) "LOCAL" else "VISITA"
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .clip(RoundedCornerShape(4.dp))
            .background(color.copy(alpha = 0.12f))
            .padding(horizontal = 6.dp, vertical = 2.dp),
    ) {
        Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(9.dp))
        Spacer(Modifier.width(3.dp))
        Text(label, color = color, fontSize = 9.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun StatChip(count: Int, label: String, color: Color) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(color.copy(alpha = 0.1f))
            .padding(horizontal = 7.dp, vertical = 3.dp),
    ) {
        Text(count.toString(), color = color, fontSize = 11.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.width(3.dp))
        Text(label, color = color.copy(alpha = 0.85f), fontSize = 10.sp)
    }
}
