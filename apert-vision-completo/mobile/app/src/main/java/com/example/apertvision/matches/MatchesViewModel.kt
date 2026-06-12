package com.example.apertvision.matches

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.apertvision.data.Partido
import com.example.apertvision.data.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** Partido + conteo de eventos por tipo (denormalizado en el cliente). */
data class PartidoConStats(
    val partido: Partido,
    val lineouts: Int,
    val scrums: Int,
    val kickoffs: Int,
) { val total get() = lineouts + scrums + kickoffs }

/** Helper para parsear el join partidos + eventos. */
@Serializable
private data class PartidoConEventosRaw(
    val id: String,
    @SerialName("club_id")    val clubId:    String,
    @SerialName("creado_por") val creadoPor: String? = null,
    val rival: String,
    val fecha: String,
    val resultado: String? = null,
    val marcador:  String? = null,
    @SerialName("es_local")   val esLocal: Boolean,
    @SerialName("video_path") val videoPath: String? = null,
    val eventos: List<EventoTipo> = emptyList(),
) {
    @Serializable
    data class EventoTipo(val tipo: String)
}

class MatchesViewModel : ViewModel() {

    private val client = SupabaseClient.client

    private val _matches = MutableStateFlow<List<PartidoConStats>>(emptyList())
    val matches: StateFlow<List<PartidoConStats>> = _matches.asStateFlow()

    private val _loading = MutableStateFlow(true)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _loading.value = true; _error.value = null
            try {
                val raw = client.from("partidos")
                    .select(Columns.raw("*, eventos(tipo)")) {
                        order("fecha", Order.DESCENDING)
                    }
                    .decodeList<PartidoConEventosRaw>()

                _matches.value = raw.map { r ->
                    PartidoConStats(
                        partido = Partido(
                            id = r.id, clubId = r.clubId, creadoPor = r.creadoPor,
                            rival = r.rival, fecha = r.fecha,
                            resultado = r.resultado, marcador = r.marcador,
                            esLocal = r.esLocal, videoPath = r.videoPath,
                        ),
                        lineouts = r.eventos.count { it.tipo == "lineout" },
                        scrums   = r.eventos.count { it.tipo == "scrum" },
                        kickoffs = r.eventos.count { it.tipo == "kickoff" },
                    )
                }.filter { it.total > 0 } // solo partidos analizados
            } catch (e: Exception) {
                _error.value = e.message ?: "Error cargando partidos"
            } finally {
                _loading.value = false
            }
        }
    }
}
