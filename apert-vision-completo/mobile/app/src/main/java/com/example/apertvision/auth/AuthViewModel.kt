package com.example.apertvision.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.apertvision.data.Club
import com.example.apertvision.data.Miembro
import com.example.apertvision.data.SupabaseClient
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.providers.builtin.Email
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

/**
 * Estado de autenticación de la app.
 *  - Idle      → cargando sesión inicial
 *  - LoggedOut → no hay sesión
 *  - NoMember  → hay sesión auth pero el usuario no es miembro de un club
 *  - Ready     → todo OK, tenemos miembro y club
 */
sealed class AuthState {
    object Idle      : AuthState()
    object LoggedOut : AuthState()
    object NoMember  : AuthState()
    data class Ready(val miembro: Miembro, val club: Club) : AuthState()
}

class AuthViewModel : ViewModel() {

    private val client = SupabaseClient.client

    private val _state = MutableStateFlow<AuthState>(AuthState.Idle)
    val state: StateFlow<AuthState> = _state.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _busy = MutableStateFlow(false)
    val busy: StateFlow<Boolean> = _busy.asStateFlow()

    init { checkSession() }

    fun checkSession() {
        viewModelScope.launch {
            val session = client.auth.currentSessionOrNull()
            if (session == null) {
                _state.value = AuthState.LoggedOut
                return@launch
            }
            loadMember()
        }
    }

    private suspend fun loadMember() {
        try {
            val userId = client.auth.currentUserOrNull()?.id ?: run {
                _state.value = AuthState.LoggedOut
                return
            }
            val miembros = client.from("miembros")
                .select { filter { eq("auth_user_id", userId) } }
                .decodeList<Miembro>()
            val miembro = miembros.firstOrNull() ?: run {
                _state.value = AuthState.NoMember
                return
            }
            val clubes = client.from("clubes")
                .select { filter { eq("id", miembro.clubId) } }
                .decodeList<Club>()
            val club = clubes.firstOrNull() ?: run {
                _state.value = AuthState.NoMember
                return
            }
            _state.value = AuthState.Ready(miembro, club)
        } catch (e: Exception) {
            _error.value = e.message ?: "Error cargando perfil"
        }
    }

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _busy.value = true; _error.value = null
            try {
                client.auth.signInWith(Email) {
                    this.email = email
                    this.password = password
                }
                loadMember()
            } catch (e: Exception) {
                _error.value = traducirError(e.message)
            } finally {
                _busy.value = false
            }
        }
    }

    fun signupAndJoinClub(
        email: String, password: String,
        codigo: String, nombre: String,
        dorsal: Int? = null, posicion: String? = null, edad: Int? = null
    ) {
        viewModelScope.launch {
            _busy.value = true; _error.value = null
            try {
                client.auth.signUpWith(Email) {
                    this.email = email
                    this.password = password
                }
                // Si email-confirm está activo, la sesión no queda → forzar login
                if (client.auth.currentSessionOrNull() == null) {
                    client.auth.signInWith(Email) {
                        this.email = email
                        this.password = password
                    }
                }

                val params = buildJsonObject {
                    put("p_codigo", codigo.trim().uppercase())
                    put("p_nombre", nombre)
                    dorsal?.let   { put("p_dorsal",   it) }
                    posicion?.let { put("p_posicion", it) }
                    edad?.let     { put("p_edad",     it) }
                }
                client.postgrest.rpc("unirse_a_club", params)
                loadMember()
            } catch (e: Exception) {
                _error.value = traducirError(e.message)
            } finally {
                _busy.value = false
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            client.auth.signOut()
            _state.value = AuthState.LoggedOut
        }
    }

    fun clearError() { _error.value = null }

    private fun traducirError(msg: String?): String = when {
        msg == null -> "Error desconocido"
        msg.contains("Invalid login credentials", true) -> "Email o contraseña incorrectos"
        msg.contains("inválido", true)                  -> "Código de club inválido"
        msg.contains("already registered", true)        -> "Este email ya tiene cuenta — usá Iniciar sesión"
        else -> msg
    }
}
