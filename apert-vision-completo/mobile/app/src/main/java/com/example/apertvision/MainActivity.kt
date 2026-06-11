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
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.apertvision.auth.AuthState
import com.example.apertvision.auth.AuthViewModel
import com.example.apertvision.ui.screens.HomeScreen
import com.example.apertvision.ui.screens.LoginScreen
import com.example.apertvision.ui.screens.SignupScreen
import com.example.apertvision.ui.theme.ApertVisionTheme
import com.example.apertvision.ui.theme.Background
import com.example.apertvision.ui.theme.Primary

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
        is AuthState.Ready -> HomeScreen(
            miembro = s.miembro, club = s.club,
            onLogout = { authVm.logout() }
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
                onSignupClick = {
                    authVm.clearError()
                    nav.navigate("signup")
                },
                viewModel = authVm,
            )
        }
        composable("signup") {
            SignupScreen(
                onBack = {
                    authVm.clearError()
                    nav.popBackStack()
                },
                viewModel = authVm,
            )
        }
    }
}
