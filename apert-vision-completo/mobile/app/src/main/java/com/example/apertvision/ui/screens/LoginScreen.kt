package com.example.apertvision.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.RemoveRedEye
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
fun LoginScreen(
    onSignupClick: () -> Unit,
    viewModel: AuthViewModel = viewModel(),
) {
    val busy  by viewModel.busy.collectAsState()
    val error by viewModel.error.collectAsState()

    var email by remember { mutableStateOf("") }
    var pass  by remember { mutableStateOf("") }
    var showPass by remember { mutableStateOf(false) }

    Surface(modifier = Modifier.fillMaxSize(), color = Background) {
        Column(
            modifier = Modifier.fillMaxSize().padding(24.dp).verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.Center,
        ) {
            // Logo / branding
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier.size(40.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    Surface(color = Primary, shape = RoundedCornerShape(10.dp), modifier = Modifier.fillMaxSize()) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(Icons.Default.RemoveRedEye, contentDescription = null,
                                tint = Color(0xFF080C14), modifier = Modifier.size(20.dp))
                        }
                    }
                }
                Spacer(Modifier.width(12.dp))
                Column {
                    Text("Apert Vision", color = OnBackground, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    Text("RUGBY  AI", color = Muted, fontSize = 10.sp, letterSpacing = 2.sp)
                }
            }
            Spacer(Modifier.height(40.dp))
            Text("Bienvenido", color = OnBackground, fontSize = 24.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(4.dp))
            Text("Iniciá sesión para ver los clips de tu club", color = Muted, fontSize = 13.sp)
            Spacer(Modifier.height(32.dp))

            // Email
            Text("Correo electrónico", color = Muted, fontSize = 12.sp)
            Spacer(Modifier.height(6.dp))
            OutlinedTextField(
                value = email, onValueChange = { email = it.trim() },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("usuario@club.com", color = Muted.copy(alpha = 0.5f)) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Primary,
                    unfocusedBorderColor = Border,
                    focusedContainerColor = Secondary,
                    unfocusedContainerColor = Secondary,
                    focusedTextColor = OnBackground,
                    unfocusedTextColor = OnBackground,
                ),
                shape = RoundedCornerShape(10.dp),
            )

            Spacer(Modifier.height(16.dp))

            // Password
            Text("Contraseña", color = Muted, fontSize = 12.sp)
            Spacer(Modifier.height(6.dp))
            OutlinedTextField(
                value = pass, onValueChange = { pass = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("••••••••", color = Muted.copy(alpha = 0.5f)) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                visualTransformation = if (showPass) VisualTransformation.None else PasswordVisualTransformation(),
                trailingIcon = {
                    IconButton(onClick = { showPass = !showPass }) {
                        Icon(
                            imageVector = if (showPass) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            contentDescription = null, tint = Muted,
                        )
                    }
                },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Primary, unfocusedBorderColor = Border,
                    focusedContainerColor = Secondary, unfocusedContainerColor = Secondary,
                    focusedTextColor = OnBackground, unfocusedTextColor = OnBackground,
                ),
                shape = RoundedCornerShape(10.dp),
            )

            // Error
            error?.let {
                Spacer(Modifier.height(12.dp))
                Surface(color = ErrorRed.copy(alpha = 0.1f), shape = RoundedCornerShape(8.dp)) {
                    Text(it, color = ErrorRed, fontSize = 12.sp, modifier = Modifier.padding(10.dp))
                }
            }

            Spacer(Modifier.height(24.dp))

            // Login button
            Button(
                onClick = { viewModel.login(email, pass) },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                enabled = !busy && email.isNotBlank() && pass.length >= 6,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Primary, contentColor = Color(0xFF080C14),
                    disabledContainerColor = Primary.copy(alpha = 0.4f),
                ),
                shape = RoundedCornerShape(10.dp),
            ) {
                if (busy) CircularProgressIndicator(color = Color(0xFF080C14), modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                else      Text("Ingresar", fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
            }

            Spacer(Modifier.height(16.dp))

            // Divider
            Row(verticalAlignment = Alignment.CenterVertically) {
                HorizontalDivider(modifier = Modifier.weight(1f), color = Border)
                Text("  o  ", color = Muted, fontSize = 11.sp)
                HorizontalDivider(modifier = Modifier.weight(1f), color = Border)
            }
            Spacer(Modifier.height(16.dp))

            OutlinedButton(
                onClick = onSignupClick,
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = OnBackground),
                border = androidx.compose.foundation.BorderStroke(1.dp, Border),
                shape = RoundedCornerShape(10.dp),
            ) {
                Text("Crear cuenta nueva", fontSize = 13.sp)
            }
        }
    }
}
