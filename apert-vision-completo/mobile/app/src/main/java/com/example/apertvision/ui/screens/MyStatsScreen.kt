package com.example.apertvision.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.SupportAgent
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import android.content.Intent
import android.net.Uri
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Columns
import kotlinx.serialization.Serializable
import com.example.apertvision.data.Miembro
import com.example.apertvision.data.PlayerStats
import com.example.apertvision.data.SupabaseClient
import com.example.apertvision.data.getPlayerStats
import com.example.apertvision.data.loadPlayerStatsFromDb
import com.example.apertvision.ui.theme.*

@Serializable
private data class PartidoIdOnly(val id: String)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MyStatsScreen(
    miembro: Miembro,
    clubId: String,
    onBack: () -> Unit,
) {
    var partidosCount by remember { mutableIntStateOf(0) }
    var loading       by remember { mutableStateOf(true) }
    // Fallback instantáneo con el helper local para que la UI no tenga loading state feo
    var stats         by remember { mutableStateOf<PlayerStats>(getPlayerStats(miembro.id, miembro.posicion)) }

    LaunchedEffect(clubId, miembro.id) {
        // Contamos partidos y traemos stats de DB en paralelo
        try {
            val partidos = SupabaseClient.client.from("partidos")
                .select(Columns.list("id")) {
                    filter { eq("club_id", clubId) }
                }
                .decodeList<PartidoIdOnly>()
            partidosCount = partidos.size
        } catch (_: Exception) { partidosCount = 0 }

        // Trae de DB (o auto-populate si no existe) y sobrescribe con lo persistido
        stats = loadPlayerStatsFromDb(miembro)
        loading = false
    }
    val partidosReales = if (partidosCount > 0) partidosCount else stats.partidosJugados
    val tacklesTemporada  = stats.tacklesPorPartido * partidosReales
    val tacklesEfTemp     = (tacklesTemporada * stats.tacklesEfectivos / 100)
    val metrosTemporada   = stats.metrosGanados * partidosReales

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mis estadísticas", color = OnBackground, fontSize = 15.sp) },
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
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            // Header con avatar + info
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = Surface,
                shape = RoundedCornerShape(16.dp),
                border = BorderStroke(1.dp, Border),
            ) {
                Row(
                    modifier = Modifier.padding(18.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Box(
                        modifier = Modifier.size(56.dp).clip(RoundedCornerShape(16.dp))
                            .background(Primary.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            miembro.nombre.split(" ").take(2).joinToString("") { it.take(1) }.uppercase(),
                            color = Primary, fontSize = 20.sp, fontWeight = FontWeight.Bold,
                        )
                    }
                    Spacer(Modifier.width(14.dp))
                    Column(Modifier.weight(1f)) {
                        Text(miembro.nombre, color = OnBackground, fontSize = 17.sp, fontWeight = FontWeight.Bold)
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            miembro.dorsal?.let {
                                Text("#$it", color = Muted, fontSize = 12.sp)
                                Spacer(Modifier.width(6.dp))
                            }
                            miembro.posicion?.let {
                                Text("· $it", color = Muted, fontSize = 12.sp)
                            }
                            miembro.edad?.let {
                                Spacer(Modifier.width(6.dp))
                                Text("· ${it} años", color = Muted, fontSize = 12.sp)
                            }
                        }
                    }
                }
            }

            // Título sección
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(modifier = Modifier.width(3.dp).height(14.dp).background(Primary))
                Spacer(Modifier.width(8.dp))
                Text("RENDIMIENTO INDIVIDUAL · TEMPORADA",
                    color = Muted, fontSize = 10.sp, letterSpacing = 1.2.sp, fontWeight = FontWeight.Medium)
            }

            // Tackles
            StatCard(
                iconColor = ScrumColor,
                icon = { Icon(Icons.Default.Shield, contentDescription = null, tint = ScrumColor, modifier = Modifier.size(16.dp)) },
                label = "Tackles",
                bigValue = stats.tacklesPorPartido.toString(),
                bigValueUnit = "por partido",
                progressPct = stats.tacklesEfectivos,
                progressColor = if (stats.tacklesEfectivos >= 85) Primary else ScrumColor,
                bottomLeft = buildString {
                    append("${stats.tacklesEfectivos}% efectivos")
                },
                bottomRight = if (partidosReales > 0) "$tacklesEfTemp / $tacklesTemporada en la temporada" else null,
            )

            // Metros ganados
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = Surface,
                shape = RoundedCornerShape(14.dp),
                border = BorderStroke(1.dp, Border),
            ) {
                Column(Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.TrendingUp, contentDescription = null, tint = KickoffColor, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Metros ganados por partido", color = OnBackground, fontSize = 13.sp, modifier = Modifier.weight(1f))
                        Row(verticalAlignment = Alignment.Bottom) {
                            Text(stats.metrosGanados.toString(), color = KickoffColor, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                            Spacer(Modifier.width(3.dp))
                            Text("m", color = Muted, fontSize = 12.sp, modifier = Modifier.padding(bottom = 3.dp))
                        }
                    }
                    Spacer(Modifier.height(8.dp))
                    Text(
                        "Metros que avanzás corriendo con la pelota antes de ser tacleado, patear o pasar.",
                        color = Muted, fontSize = 10.sp, lineHeight = 14.sp,
                    )
                    Spacer(Modifier.height(10.dp))
                    // 10 barras horizontales en grid de 5
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp), modifier = Modifier.fillMaxWidth()) {
                        val filled = (stats.metrosGanados / 15).coerceAtMost(10)
                        for (i in 0 until 10) {
                            Box(
                                modifier = Modifier.weight(1f).height(6.dp)
                                    .clip(RoundedCornerShape(2.dp))
                                    .background(if (i < filled) KickoffColor else Muted.copy(alpha = 0.15f))
                            )
                        }
                    }
                    if (partidosReales > 0) {
                        Spacer(Modifier.height(8.dp))
                        Text(
                            "≈ ${metrosTemporada}m totales en la temporada",
                            color = Muted, fontSize = 10.sp,
                            modifier = Modifier.fillMaxWidth(),
                        )
                    }
                }
            }

            // Partidos analizados (número real)
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = Primary.copy(alpha = 0.06f),
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(1.dp, Primary.copy(alpha = 0.15f)),
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Box(
                        modifier = Modifier.size(36.dp).clip(RoundedCornerShape(10.dp))
                            .background(Primary.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(Icons.Default.Bolt, contentDescription = null, tint = Primary, modifier = Modifier.size(18.dp))
                    }
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Text("Partidos analizados esta temporada", color = Muted, fontSize = 12.sp)
                        if (loading) {
                            Text("Cargando...", color = OnBackground, fontSize = 14.sp)
                        } else {
                            Text(partidosReales.toString(),
                                color = OnBackground, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            Spacer(Modifier.height(8.dp))

            // ── SOPORTE ──────────────────────────────────
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(modifier = Modifier.width(3.dp).height(14.dp).background(Primary))
                Spacer(Modifier.width(8.dp))
                Text("SOPORTE AL CLIENTE",
                    color = Muted, fontSize = 10.sp, letterSpacing = 1.2.sp, fontWeight = FontWeight.Medium)
            }

            SupportSection()

            Spacer(Modifier.height(8.dp))
        }
    }
}

@Composable
private fun SupportSection() {
    val context = LocalContext.current
    val openEmail = {
        val intent = Intent(Intent.ACTION_SENDTO).apply {
            data = Uri.parse("mailto:soporte@apertvision.com")
            putExtra(Intent.EXTRA_SUBJECT, "Consulta sobre Apert Vision")
        }
        try { context.startActivity(intent) } catch (_: Exception) {}
    }
    val openWhatsApp = {
        val url = "https://wa.me/5491100000000?text=" +
            Uri.encode("Hola, tengo una consulta sobre Apert Vision:")
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        try { context.startActivity(intent) } catch (_: Exception) {}
    }

    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Surface,
        shape = RoundedCornerShape(14.dp),
        border = BorderStroke(1.dp, Border),
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.SupportAgent, contentDescription = null, tint = Primary, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(8.dp))
                Text("¿Necesitás ayuda?", color = OnBackground, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
            }
            Spacer(Modifier.height(6.dp))
            Text(
                "Escribinos por mail o WhatsApp. Respondemos en menos de 24 hs.",
                color = Muted, fontSize = 11.sp, lineHeight = 15.sp,
            )
            Spacer(Modifier.height(14.dp))

            // Email
            Surface(
                modifier = Modifier.fillMaxWidth(),
                onClick = openEmail,
                color = Primary.copy(alpha = 0.08f),
                shape = RoundedCornerShape(10.dp),
                border = BorderStroke(1.dp, Primary.copy(alpha = 0.2f)),
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Icon(Icons.Default.Email, contentDescription = null, tint = Primary, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Text("Email", color = Muted, fontSize = 10.sp, letterSpacing = 1.sp)
                        Text("soporte@apertvision.com", color = OnBackground, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                    }
                }
            }
            Spacer(Modifier.height(10.dp))

            // WhatsApp
            val whatsappColor = Color(0xFF25D366)
            Surface(
                modifier = Modifier.fillMaxWidth(),
                onClick = openWhatsApp,
                color = whatsappColor.copy(alpha = 0.08f),
                shape = RoundedCornerShape(10.dp),
                border = BorderStroke(1.dp, whatsappColor.copy(alpha = 0.25f)),
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Icon(Icons.Default.Chat, contentDescription = null, tint = whatsappColor, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Text("WhatsApp", color = Muted, fontSize = 10.sp, letterSpacing = 1.sp)
                        Text("+54 9 11 0000 0000", color = OnBackground, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                    }
                }
            }
        }
    }
}

@Composable
private fun StatCard(
    iconColor: Color,
    icon: @Composable () -> Unit,
    label: String,
    bigValue: String,
    bigValueUnit: String,
    progressPct: Int,
    progressColor: Color,
    bottomLeft: String,
    bottomRight: String?,
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Surface,
        shape = RoundedCornerShape(14.dp),
        border = BorderStroke(1.dp, Border),
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                icon()
                Spacer(Modifier.width(8.dp))
                Text(label, color = OnBackground, fontSize = 13.sp, modifier = Modifier.weight(1f))
                Row(verticalAlignment = Alignment.Bottom) {
                    Text(bigValue, color = OnBackground, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.width(4.dp))
                    Text(bigValueUnit, color = Muted, fontSize = 11.sp, modifier = Modifier.padding(bottom = 3.dp))
                }
            }
            Spacer(Modifier.height(10.dp))
            // Progress bar
            Box(
                modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp))
                    .background(Muted.copy(alpha = 0.15f)),
            ) {
                Box(
                    modifier = Modifier.fillMaxWidth(progressPct / 100f).height(6.dp)
                        .clip(RoundedCornerShape(3.dp))
                        .background(progressColor)
                )
            }
            Spacer(Modifier.height(8.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(bottomLeft, color = Muted, fontSize = 11.sp, modifier = Modifier.weight(1f))
                bottomRight?.let {
                    Text(it, color = Muted, fontSize = 10.sp)
                }
            }
        }
    }
}
