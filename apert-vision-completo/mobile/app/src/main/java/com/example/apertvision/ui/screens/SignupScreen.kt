package com.example.apertvision.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.apertvision.auth.AuthViewModel
import com.example.apertvision.ui.theme.*

@Composable
fun SignupScreen(
    onBack: () -> Unit,
    viewModel: AuthViewModel = viewModel(),
) {
    val busy  by viewModel.busy.collectAsState()
    val error by viewModel.error.collectAsState()

    var nombre by remember { mutableStateOf("") }
    var codigo by remember { mutableStateOf("") }
    var email  by remember { mutableStateOf("") }
    var pass   by remember { mutableStateOf("") }
    var showPass by remember { mutableStateOf(false) }
    var dorsal by remember { mutableStateOf("") }
    var posicion by remember { mutableStateOf("") }
    var edad by remember { mutableStateOf("") }

    Surface(modifier = Modifier.fillMaxSize(), color = Background) {
        Column(
            modifier = Modifier.fillMaxSize().padding(24.dp).verticalScroll(rememberScrollState()),
        ) {
            TextButton(onClick = onBack, contentPadding = PaddingValues(0.dp)) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, tint = Muted, modifier = Modifier.size(14.dp))
                Spacer(Modifier.width(4.dp))
                Text("Volver al login", color = Muted, fontSize = 12.sp)
            }

            Spacer(Modifier.height(24.dp))
            Text("Crear cuenta", color = OnBackground, fontSize = 22.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(4.dp))
            Text("Ingresá el código que te compartió tu entrenador", color = Muted, fontSize = 13.sp)
            Spacer(Modifier.height(24.dp))

            Field(label = "Tu nombre completo", value = nombre, onChange = { nombre = it }, placeholder = "Juan Martínez")
            Spacer(Modifier.height(14.dp))
            Field(label = "Código del club", value = codigo, onChange = { codigo = it.uppercase() }, placeholder = "PUMAS-J-AB12", mono = true)
            Spacer(Modifier.height(14.dp))
            Field(label = "Correo electrónico", value = email, onChange = { email = it.trim() }, placeholder = "tu@email.com", keyboardType = KeyboardType.Email)
            Spacer(Modifier.height(14.dp))

            // Password con toggle
            Text("Contraseña", color = Muted, fontSize = 12.sp)
            Spacer(Modifier.height(6.dp))
            OutlinedTextField(
                value = pass, onValueChange = { pass = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Mínimo 6 caracteres", color = Muted.copy(alpha = 0.5f)) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                visualTransformation = if (showPass) VisualTransformation.None else PasswordVisualTransformation(),
                trailingIcon = {
                    IconButton(onClick = { showPass = !showPass }) {
                        Icon(if (showPass) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            contentDescription = null, tint = Muted)
                    }
                },
                colors = fieldColors(),
                shape = RoundedCornerShape(10.dp),
            )

            Spacer(Modifier.height(16.dp))
            Text("Opcional — si sos jugador", color = Muted, fontSize = 11.sp, fontWeight = FontWeight.Medium)
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(Modifier.weight(1f)) { Field(label = "Dorsal", value = dorsal, onChange = { dorsal = it.filter(Char::isDigit) }, placeholder = "10", keyboardType = KeyboardType.Number) }
                Box(Modifier.weight(1f)) { Field(label = "Edad",   value = edad,   onChange = { edad = it.filter(Char::isDigit) }, placeholder = "23", keyboardType = KeyboardType.Number) }
            }
            Spacer(Modifier.height(14.dp))
            Field(label = "Posición", value = posicion, onChange = { posicion = it }, placeholder = "Apertura")

            error?.let {
                Spacer(Modifier.height(12.dp))
                Surface(color = ErrorRed.copy(alpha = 0.1f), shape = RoundedCornerShape(8.dp)) {
                    Text(it, color = ErrorRed, fontSize = 12.sp, modifier = Modifier.padding(10.dp))
                }
            }

            Spacer(Modifier.height(24.dp))
            Button(
                onClick = {
                    viewModel.signupAndJoinClub(
                        email = email, password = pass,
                        codigo = codigo, nombre = nombre,
                        dorsal = dorsal.toIntOrNull(),
                        posicion = posicion.ifBlank { null },
                        edad = edad.toIntOrNull(),
                    )
                },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                enabled = !busy && nombre.isNotBlank() && codigo.isNotBlank() && email.isNotBlank() && pass.length >= 6,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Primary, contentColor = Color(0xFF080C14),
                    disabledContainerColor = Primary.copy(alpha = 0.4f),
                ),
                shape = RoundedCornerShape(10.dp),
            ) {
                if (busy) CircularProgressIndicator(color = Color(0xFF080C14), modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                else      Text("Crear cuenta y entrar", fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

@Composable
private fun Field(
    label: String, value: String, onChange: (String) -> Unit,
    placeholder: String = "", mono: Boolean = false,
    keyboardType: KeyboardType = KeyboardType.Text,
) {
    Text(label, color = Muted, fontSize = 12.sp)
    Spacer(Modifier.height(6.dp))
    OutlinedTextField(
        value = value, onValueChange = onChange,
        modifier = Modifier.fillMaxWidth(),
        placeholder = { Text(placeholder, color = Muted.copy(alpha = 0.5f),
            letterSpacing = if (mono) 1.sp else 0.sp) },
        singleLine = true,
        keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
        colors = fieldColors(),
        shape = RoundedCornerShape(10.dp),
    )
}

@Composable
private fun fieldColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = Primary, unfocusedBorderColor = Border,
    focusedContainerColor = Secondary, unfocusedContainerColor = Secondary,
    focusedTextColor = OnBackground, unfocusedTextColor = OnBackground,
)
