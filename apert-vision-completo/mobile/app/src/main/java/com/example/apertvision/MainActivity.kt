package com.example.apertvision

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.apertvision.auth.AuthState
import com.example.apertvision.auth.AuthViewModel
import com.example.apertvision.matches.ClipConUrl
import com.example.apertvision.ui.screens.LoginScreen
import com.example.apertvision.ui.screens.MatchDetailScreen
import com.example.apertvision.ui.screens.MatchesScreen
import com.example.apertvision.ui.screens.SignupScreen
import com.example.apertvision.ui.screens.VideoPlayerScreen
import com.example.apertvision.ui.theme.ApertVisionTheme
import com.example.apertvision.ui.theme.Background
import com.example.apertvision.ui.theme.Primary
import java.net.URLDecoder
import java.net.URLEncoder

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ApertVisionTheme {
                Root()
            }
        }
    }
}

@Composable
private fun Root() {
    val authVm: AuthViewModel = viewModel()
    val state by authVm.state.collectAsState()

    when (val s = state) {
        AuthState.Idle -> LoadingScreen()
        AuthState.LoggedOut, AuthState.NoMember -> AuthFlow(authVm)
        is AuthState.Ready -> MainFlow(
            miembroNombre = s.miembro.nombre,
            miembroRol    = s.miembro.rol,
            clubNombre    = s.club.nombre,
            onLogout      = { authVm.logout() },
        )
    }
}

@Composable
private fun LoadingScreen() {
    Surface(modifier = Modifier.fillMaxSize(), color = Background) {
        Box(contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = Primary)
        }
    }
}

@Composable
private fun AuthFlow(authVm: AuthViewModel) {
    val nav = rememberNavController()
    NavHost(navController = nav, startDestination = "login") {
        composable("login") {
            LoginScreen(
                onSignupClick = { authVm.clearError(); nav.navigate("signup") },
                viewModel = authVm,
            )
        }
        composable("signup") {
            SignupScreen(
                onBack = { authVm.clearError(); nav.popBackStack() },
                viewModel = authVm,
            )
        }
    }
}

@Composable
private fun MainFlow(
    miembroNombre: String,
    miembroRol: String,
    clubNombre: String,
    onLogout: () -> Unit,
) {
    val authVm: AuthViewModel = viewModel()
    val state by authVm.state.collectAsState()
    val ready = state as? AuthState.Ready ?: return

    val nav = rememberNavController()
    NavHost(navController = nav, startDestination = "matches") {
        composable("matches") {
            MatchesScreen(
                miembro = ready.miembro,
                club    = ready.club,
                onLogout = onLogout,
                onMatchClick = { id -> nav.navigate("match/$id") },
            )
        }
        composable(
            route = "match/{id}",
            arguments = listOf(navArgument("id") { type = NavType.StringType }),
        ) { entry ->
            val id = entry.arguments?.getString("id") ?: return@composable
            MatchDetailScreen(
                partidoId  = id,
                clubNombre = clubNombre,
                onBack = { nav.popBackStack() },
                onClipClick = { clip ->
                    val encoded = URLEncoder.encode(clip.signedUrl, "UTF-8")
                    nav.navigate("video/${clip.tipo}/$encoded")
                },
            )
        }
        composable(
            route = "video/{tipo}/{url}",
            arguments = listOf(
                navArgument("tipo") { type = NavType.StringType },
                navArgument("url")  { type = NavType.StringType },
            ),
        ) { entry ->
            val tipo = entry.arguments?.getString("tipo") ?: ""
            val url  = URLDecoder.decode(entry.arguments?.getString("url") ?: "", "UTF-8")
            val title = when (tipo) {
                "lineout" -> "Line-outs"
                "scrum"   -> "Scrums"
                "kickoff" -> "Salidas 22"
                else -> tipo
            }
            VideoPlayerScreen(
                title = title, videoUrl = url,
                onBack = { nav.popBackStack() },
            )
        }
    }
}
