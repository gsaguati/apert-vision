package com.example.apertvision.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Club(
    val id: String,
    val nombre: String,
    @SerialName("codigo_entrenador") val codigoEntrenador: String,
    @SerialName("codigo_dirigente")  val codigoDirigente:  String,
    @SerialName("codigo_jugador")    val codigoJugador:    String,
)

@Serializable
data class Miembro(
    val id: String,
    @SerialName("auth_user_id") val authUserId: String,
    @SerialName("club_id")      val clubId:     String,
    val nombre: String,
    val rol: String, // 'entrenador' | 'dirigente' | 'jugador'
    val dorsal:   Int? = null,
    val posicion: String? = null,
    val edad:     Int? = null,
)

@Serializable
data class Partido(
    val id: String,
    @SerialName("club_id")    val clubId:    String,
    @SerialName("creado_por") val creadoPor: String? = null,
    val rival: String,
    val fecha: String,
    val resultado: String? = null, // 'W' | 'L' | 'D'
    val marcador:  String? = null,
    @SerialName("es_local")   val esLocal: Boolean,
    @SerialName("video_path") val videoPath: String? = null,
)

@Serializable
data class Evento(
    val id: String,
    @SerialName("partido_id") val partidoId: String,
    val tipo: String, // 'lineout' | 'scrum' | 'kickoff'
    @SerialName("timestamp_seg") val timestampSeg: Double,
    val confianza: Double? = null,
)

@Serializable
data class Clip(
    val id: String,
    @SerialName("partido_id") val partidoId: String,
    val tipo: String,
    @SerialName("url_storage") val urlStorage: String,
)
