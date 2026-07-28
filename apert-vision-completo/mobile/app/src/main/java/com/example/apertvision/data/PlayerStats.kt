package com.example.apertvision.data

/**
 * Genera estadísticas individuales por jugador de forma DETERMINÍSTICA.
 * El mismo jugador siempre devuelve las mismas stats (no cambian entre visitas)
 * porque el generador se siembra con el ID del jugador.
 *
 * Rangos ajustados por posición (forwards vs backs) para que los datos suenen
 * coherentes con el rugby real.
 */

data class PlayerStats(
    val tacklesPorPartido: Int,  // tackles intentados por partido (10-18)
    val tacklesEfectivos:  Int,  // % efectivos (0-100)
    val metrosGanados:     Int,  // metros ganados con la pelota (por partido)
    val partidosJugados:   Int,  // fallback si no hay count real del club
)

private enum class PositionGroup { FORWARD, BACK, HALF, MIXED }

private val FORWARDS = setOf("Pilier", "Hooker", "Lock", "Flanker", "Nº 8")
private val HALVES   = setOf("Medio Scrum", "Apertura")
private val BACKS    = setOf("Wing", "Centro", "Fullback")

private fun positionGroup(pos: String?): PositionGroup = when (pos) {
    in FORWARDS -> PositionGroup.FORWARD
    in HALVES   -> PositionGroup.HALF
    in BACKS    -> PositionGroup.BACK
    else        -> PositionGroup.MIXED
}

private class SeededRandom(seed: String) {
    // xmur3-like hash → LCG (mismo algoritmo que el Desktop en TS)
    private var state: Long = run {
        var h = 1779033703L
        for (c in seed) {
            h = ((h xor c.code.toLong()) * 3432918353L) and 0xFFFFFFFFL
            h = ((h shl 13) or (h ushr 19)) and 0xFFFFFFFFL
        }
        h
    }

    fun next(): Double {
        state = ((state xor (state ushr 16)) * 2246822507L) and 0xFFFFFFFFL
        state = ((state xor (state ushr 13)) * 3266489909L) and 0xFFFFFFFFL
        state = (state xor (state ushr 16)) and 0xFFFFFFFFL
        return state.toDouble() / 4294967296.0
    }
}

/**
 * @param playerId   UUID del jugador (semilla)
 * @param position   posición del jugador (ajusta rangos)
 * @param partidoId  opcional — si se pasa, las stats son de ESE partido
 */
fun getPlayerStats(
    playerId: String,
    position: String? = null,
    partidoId: String? = null,
): PlayerStats {
    val seed = if (partidoId != null) "$playerId:$partidoId" else playerId
    val rng  = SeededRandom(seed)
    val group = positionGroup(position)

    var tacklesPctBase = 72; var tacklesPctRange = 20
    var metrosBase = 35;     var metrosRange = 50
    var tacklesAbsBase = 11

    when (group) {
        PositionGroup.FORWARD -> {
            tacklesPctBase = 82; tacklesPctRange = 15
            metrosBase = 12;     metrosRange = 22
            tacklesAbsBase = 14
        }
        PositionGroup.HALF -> {
            tacklesPctBase = 68; tacklesPctRange = 18
            metrosBase = 40;     metrosRange = 45
            tacklesAbsBase = 11
        }
        PositionGroup.BACK -> {
            tacklesPctBase = 65; tacklesPctRange = 20
            metrosBase = 55;     metrosRange = 70
            tacklesAbsBase = 9
        }
        else -> {}
    }

    val tacklesEfectivos  = (tacklesPctBase + rng.next() * tacklesPctRange).toInt()
    val metrosGanados     = (metrosBase     + rng.next() * metrosRange).toInt()
    val partidosJugados   = (rng.next() * 12).toInt() + 3
    val tacklesPorPartido = (tacklesAbsBase + rng.next() * 5).toInt()

    return PlayerStats(tacklesPorPartido, tacklesEfectivos, metrosGanados, partidosJugados)
}
