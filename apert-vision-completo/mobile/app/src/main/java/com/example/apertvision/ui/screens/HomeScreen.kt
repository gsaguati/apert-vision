package com.example.apertvision.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.apertvision.data.Club
import com.example.apertvision.data.Miembro
import com.example.apertvision.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    miembro: Miembro,
    club: Club,
    onLogout: () -> Unit,
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(club.nombre, color = OnBackground, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text("Hola, ${miembro.nombre.split(" ").first()}", color = Muted, fontSize = 11.sp)
                    }
                },
                actions = {
                    IconButton(onClick = onLogout) {
                        Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = "Salir", tint = Muted)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Background),
            )
        },
        containerColor = Background,
    ) { padding ->
        Box(
            modifier = Modifier.fillMaxSize().padding(padding).padding(24.dp),
            contentAlignment = Alignment.Center,
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("🏉", fontSize = 48.sp)
                Spacer(Modifier.height(16.dp))
                Text("Bienvenido a Apert Vision Mobile", color = OnBackground,
                    fontSize = 16.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(8.dp))
                Text("Tu rol: ${miembro.rol}", color = Muted, fontSize = 13.sp)
                Spacer(Modifier.height(24.dp))
                Surface(
                    color = Surface, shape = RoundedCornerShape(12.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Border),
                ) {
                    Text(
                        "Próximamente: lista de partidos con sus clips",
                        color = Muted, fontSize = 12.sp,
                        modifier = Modifier.padding(16.dp),
                    )
                }
            }
        }
    }
}
