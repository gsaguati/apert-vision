package com.example.apertvision.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColors = darkColorScheme(
    primary           = Primary,
    onPrimary         = Color(0xFF080C14),
    secondary         = Secondary,
    onSecondary       = OnSurface,
    background        = Background,
    onBackground      = OnBackground,
    surface           = Surface,
    onSurface         = OnSurface,
    surfaceVariant    = Secondary,
    onSurfaceVariant  = Muted,
    error             = ErrorRed,
)

@Composable
fun ApertVisionTheme(
    darkTheme: Boolean = true, // siempre oscuro (matchea Desktop)
    content: @Composable () -> Unit,
) {
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = Background.toArgb()
            window.navigationBarColor = Background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }
    MaterialTheme(
        colorScheme = DarkColors,
        typography  = Typography,
        content     = content
    )
}
