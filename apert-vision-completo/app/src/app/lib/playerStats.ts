/**
 * Genera estadísticas individuales por jugador de forma DETERMINÍSTICA.
 * El mismo jugador siempre devuelve las mismas stats (no cambian entre visitas)
 * porque el generador se siembra con el ID del jugador.
 *
 * Si se pasa un partidoId, las stats varían por partido pero siguen siendo
 * determinísticas: el jugador X en el partido Y siempre da los mismos números.
 *
 * Los rangos se ajustan por posición: los forwards hacen más tackles y menos
 * metros, los backs al revés — así los datos suenan coherentes.
 */

function seededRandom(seed: string): () => number {
  // xmur3-like hash → LCG. Rápido y determinístico.
  let h = 1779033703
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

export type PositionGroup = "forward" | "back" | "half" | "mixed"

const FORWARDS = ["Pilier", "Hooker", "Lock", "Flanker", "Nº 8"]
const HALVES   = ["Medio Scrum", "Apertura"]
const BACKS    = ["Wing", "Centro", "Fullback"]

export function positionGroup(pos?: string | null): PositionGroup {
  if (!pos) return "mixed"
  if (FORWARDS.includes(pos)) return "forward"
  if (HALVES.includes(pos))   return "half"
  if (BACKS.includes(pos))    return "back"
  return "mixed"
}

export interface PlayerStats {
  tacklesEfectivos: number      // 0-100 (%)
  metrosGanados:    number      // metros ganados con la pelota (por partido promedio)
  partidosJugados:  number      // partidos participados
}

/**
 * @param playerId   UUID del jugador (usado como seed)
 * @param position   posición del jugador (ajusta los rangos)
 * @param partidoId  opcional — si se pasa, las stats son de ESE partido puntual
 */
export function getPlayerStats(
  playerId: string,
  position?: string | null,
  partidoId?: string,
): PlayerStats {
  const seed = partidoId ? `${playerId}:${partidoId}` : playerId
  const rng  = seededRandom(seed)

  const group = positionGroup(position)

  // Base ranges por grupo
  let tacklesBase = 72, tacklesRange = 20  // default (mixed)
  let metrosBase  = 35, metrosRange  = 50

  if (group === "forward") {
    tacklesBase = 82; tacklesRange = 15   // 82-97%
    metrosBase  = 12; metrosRange  = 22   // 12-34m
  } else if (group === "half") {
    tacklesBase = 68; tacklesRange = 18   // 68-86%
    metrosBase  = 40; metrosRange  = 45   // 40-85m
  } else if (group === "back") {
    tacklesBase = 65; tacklesRange = 20   // 65-85%
    metrosBase  = 55; metrosRange  = 70   // 55-125m
  }

  const tacklesEfectivos = Math.round(tacklesBase + rng() * tacklesRange)
  const metrosGanados    = Math.round(metrosBase  + rng() * metrosRange)
  const partidosJugados  = Math.floor(rng() * 12) + 3  // 3-14 (solo tiene sentido sin partidoId)

  return { tacklesEfectivos, metrosGanados, partidosJugados }
}
