package com.example.apertvision.matches

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.apertvision.data.Clip
import com.example.apertvision.data.Evento
import com.example.apertvision.data.Partido
import com.example.apertvision.data.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order
import io.github.jan.supabase.storage.storage
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlin.time.Duration.Companion.hours

/** Clip de un tipo con su signed URL ya resuelta. */
data class ClipConUrl(
    val tipo: String,        // "lineout" | "scrum" | "kickoff"
    val storagePath: String,
    val signedUrl: String,
)

data class MatchDetailState(
    val partido: Partido? = null,
    val eventos: List<Evento> = emptyList(),
    val clips: List<ClipConUrl> = emptyList(),
    val loading: Boolean = true,
    val error: String? = null,
)

class MatchDetailViewModel(private val partidoId: String) : ViewModel() {

    private val client = SupabaseClient.client

    private val _state = MutableStateFlow(MatchDetailState())
    val state: StateFlow<MatchDetailState> = _state.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.value = MatchDetailState(loading = true)
            try {
                val partido = client.from("partidos").select {
                    filter { eq("id", partidoId) }
                }.decodeSingleOrNull<Partido>()

                if (partido == null) {
                    _state.value = MatchDetailState(loading = false, error = "Partido no encontrado")
                    return@launch
                }

                val eventos = client.from("eventos").select {
                    filter { eq("partido_id", partidoId) }
                    order("timestamp_seg", Order.ASCENDING)
                }.decodeList<Evento>()

                val clipsRaw = client.from("clips").select {
                    filter { eq("partido_id", partidoId) }
                }.decodeList<Clip>()

                // Firmar URLs (válidas 1 hora)
                val clips = clipsRaw.map { c ->
                    val signed = client.storage.from("clips")
                        .createSignedUrl(c.urlStorage, expiresIn = 1.hours)
                    ClipConUrl(tipo = c.tipo, storagePath = c.urlStorage, signedUrl = signed)
                }

                _state.value = MatchDetailState(
                    partido = partido, eventos = eventos, clips = clips, loading = false,
                )
            } catch (e: Exception) {
                _state.value = MatchDetailState(loading = false, error = e.message ?: "Error")
            }
        }
    }
}
