package com.example.apertvision.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Flight
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.PlayCircle
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.ViewModelStoreOwner
import androidx.lifecycle.viewmodel.compose.LocalViewModelStoreOwner
import com.example.apertvision.data.Miembro
import com.example.apertvision.data.getPlayerStats
import com.example.apertvision.matches.ClipConUrl
import com.example.apertvision.matches.MatchDetailViewModel
import com.example.apertvision.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MatchDetailScreen(
    partidoId: String,
    clubNombre: String,
    miembro: Miembro,
    onBack: () -> Unit,
    onClipClick: (ClipConUrl) -> Unit,
) {
    val owner = LocalViewModelStoreOwner.current ?: return
    val viewModel = remember(partidoId) {
        ViewModelProvider(
            owner,
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T =
                    MatchDetailViewModel(partidoId) as T
            }
        )[partidoId, MatchDetailViewModel::class.java]
    }
    val state by viewModel.state.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Detalle del partido", color = OnBackground, fontSize = 15.sp) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver", tint = OnBackground)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Background),
            )
        },
        containerColor = Background,
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) {
            when {
                state.loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Primary)
                }
                state.error != null -> Box(Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                    Text(state.error ?: "", color = ErrorRed, fontSize = 13.sp)
                }
                state.partido != null -> Content(
                    state = state,
                    clubNombre = clubNombre,
                    miembro = miembro,
                    partidoId = partidoId,
                    onClipClick = onClipClick,
                )
            }
        }
    }
}

@Composable
private fun Content(
    state: com.example.apertvision.matches.MatchDetailState,
    clubNombre: String,
    miembro: Miembro,
    partidoId: String,
    onClipClick: (ClipConUrl) -> Unit,
) {
    val p = state.partido ?: return
    val countLO = state.eventos.count { it.tipo == "lineout" }
    val countSC = state.eventos.count { it.tipo == "scrum" }
    val countKO = state.eventos.count { it.tipo == "kickoff" }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)
        .verticalScroll(rememberScrollState())) {
        // Header del partido
        Surface(
            modifier = Modifier.fillMaxWidth(),
            color = Surface, shape = RoundedCornerShape(14.dp),
            border = BorderStroke(1.dp, Border),
        ) {
            Column(Modifier.padding(16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(clubNombre, color = OnBackground, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                    Spacer(Modifier.width(6.dp))
                    Text("vs.", color = Muted, fontSize = 13.sp)
                    Spacer(Modifier.width(6.dp))
                    Text(p.rival, color = OnBackground, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                }
                Spacer(Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    LocalVisitanteBadge(p.esLocal)
                    Spacer(Modifier.width(8.dp))
                    Text(p.fecha, color = Muted, fontSize = 12.sp)
                    if (!p.marcador.isNullOrBlank()) {
                        Spacer(Modifier.width(8.dp))
                        Text("·", color = Muted, fontSize = 12.sp)
                        Spacer(Modifier.width(8.dp))
                        Text(p.marcador, color = OnBackground, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }

        Spacer(Modifier.height(20.dp))

        Text("Clips disponibles", color = OnBackground,
            fontSize = 14.sp, fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(start = 4.dp))
        Spacer(Modifier.height(10.dp))

        // 3 cards de clips
        ClipCard("Line-outs",  countLO, LineoutColor, state.clips.find { it.tipo == "lineout" }, onClipClick)
        Spacer(Modifier.height(10.dp))
        ClipCard("Scrums",     countSC, ScrumColor,   state.clips.find { it.tipo == "scrum"   }, onClipClick)
        Spacer(Modifier.height(10.dp))
        ClipCard("Salidas", countKO, KickoffColor, state.clips.find { it.tipo == "kickoff" }, onClipClick)

        // Rendimiento del jugador en este partido (solo si el usuario es jugador)
        if (miembro.rol == "jugador") {
            Spacer(Modifier.height(24.dp))
            MyPerformanceInMatch(miembro, partidoId)
        }

        Spacer(Modifier.height(16.dp))
    }
}

@Composable
private fun MyPerformanceInMatch(miembro: Miembro, partidoId: String) {
    val stats = remember(miembro.id, partidoId) {
        getPlayerStats(miembro.id, miembro.posicion, partidoId)
    }
    val tacklesEfectivosAbs = (stats.tacklesPorPartido * stats.tacklesEfectivos / 100)

    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(start = 4.dp)) {
        Box(modifier = Modifier.width(3.dp).height(14.dp).background(Primary))
        Spacer(Modifier.width(8.dp))
        Text("TU RENDIMIENTO EN ESTE PARTIDO",
            color = Muted, fontSize = 10.sp, letterSpacing = 1.2.sp, fontWeight = FontWeight.Medium)
    }
    Spacer(Modifier.height(10.dp))

    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Surface,
        shape = RoundedCornerShape(14.dp),
        border = BorderStroke(1.dp, Border),
    ) {
        Column(Modifier.padding(16.dp)) {
            // Tackles + Metros lado a lado
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Column(Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Shield, contentDescription = null, tint = ScrumColor, modifier = Modifier.size(14.dp))
                        Spacer(Modifier.width(6.dp))
                        Text("Tackles", color = Muted, fontSize = 11.sp)
                    }
                    Spacer(Modifier.height(6.dp))
                    Row(verticalAlignment = Alignment.Bottom) {
                        Text(stats.tacklesPorPartido.toString(), color = OnBackground, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                        Spacer(Modifier.width(4.dp))
                        Text("(${tacklesEfectivosAbs} ef.)", color = Muted, fontSize = 11.sp, modifier = Modifier.padding(bottom = 4.dp))
                    }
                    Spacer(Modifier.height(4.dp))
                    Text("${stats.tacklesEfectivos}% efectivos",
                        color = if (stats.tacklesEfectivos >= 85) Primary else ScrumColor,
                        fontSize = 11.sp, fontWeight = FontWeight.Medium)
                }

                Box(modifier = Modifier.width(1.dp).height(70.dp).background(Border))

                Column(Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.TrendingUp, contentDescription = null, tint = KickoffColor, modifier = Modifier.size(14.dp))
                        Spacer(Modifier.width(6.dp))
                        Text("Metros ganados", color = Muted, fontSize = 11.sp)
                    }
                    Spacer(Modifier.height(6.dp))
                    Row(verticalAlignment = Alignment.Bottom) {
                        Text(stats.metrosGanados.toString(), color = KickoffColor, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                        Spacer(Modifier.width(3.dp))
                        Text("m", color = Muted, fontSize = 12.sp, modifier = Modifier.padding(bottom = 4.dp))
                    }
                    Spacer(Modifier.height(4.dp))
                    Text("con la pelota", color = Muted, fontSize = 11.sp)
                }
            }
        }
    }
}

@Composable
private fun LocalVisitanteBadge(esLocal: Boolean) {
    val color = if (esLocal) Primary else ScrumColor
    val icon  = if (esLocal) Icons.Default.Home else Icons.Default.Flight
    val label = if (esLocal) "LOCAL" else "VISITANTE"
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .clip(RoundedCornerShape(4.dp))
            .background(color.copy(alpha = 0.12f))
            .padding(horizontal = 6.dp, vertical = 2.dp),
    ) {
        Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(10.dp))
        Spacer(Modifier.width(3.dp))
        Text(label, color = color, fontSize = 9.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun ClipCard(
    label: String, count: Int, color: Color, clip: ClipConUrl?,
    onClick: (ClipConUrl) -> Unit,
) {
    val available = clip != null && count > 0
    Surface(
        modifier = Modifier.fillMaxWidth()
            .let { if (available) it.clickable { onClick(clip) } else it },
        color = Surface,
        shape = RoundedCornerShape(14.dp),
        border = BorderStroke(1.dp, if (available) color.copy(alpha = 0.3f) else Border),
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                modifier = Modifier.size(48.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(color.copy(alpha = if (available) 0.15f else 0.05f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Default.PlayCircle, contentDescription = null,
                    tint = if (available) color else Muted.copy(alpha = 0.4f),
                    modifier = Modifier.size(28.dp))
            }
            Spacer(Modifier.width(14.dp))
            Column(Modifier.weight(1f)) {
                Text(label, color = if (available) OnBackground else Muted,
                    fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(2.dp))
                Text(
                    if (available) "$count detección${if (count == 1) "" else "es"}  ·  Tocá para reproducir"
                    else "Sin clip disponible",
                    color = Muted, fontSize = 12.sp,
                )
            }
        }
    }
}
