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

/**
 * Genera un % de posesión del equipo local (42-62%) de forma determinística
 * a partir de los datos del partido. El mismo partido siempre da el mismo valor.
 * Rangos realistas del rugby amateur — posesión suele estar entre 40-60%.
 */
export function mockPosesionLocal(seed: string): number {
  const rng = seededRandom("posesion:" + seed)
  return Math.round(42 + rng() * 20)  // 42-62
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
  tacklesPorPartido: number     // promedio de tackles intentados por partido (10-18)
  tacklesEfectivos:  number     // 0-100 (% de esos tackles que fueron efectivos)
  metrosGanados:     number     // metros ganados con la pelota (por partido promedio)
  partidosJugados:   number     // partidos participados (deprecado — usar count real de la DB)
}

/** Row cruda como está en la tabla `estadisticas_jugador` de Supabase */
export interface EstadisticaJugadorRow {
  jugador_id:                 string
  tackles_por_partido:        number
  tackles_efectivos_pct:      number
  metros_ganados_por_partido: number
  actualizado_en:             string
}

export function statsFromRow(row: EstadisticaJugadorRow): PlayerStats {
  return {
    tacklesPorPartido: row.tackles_por_partido,
    tacklesEfectivos:  row.tackles_efectivos_pct,
    metrosGanados:     row.metros_ganados_por_partido,
    partidosJugados:   0,  // no aplica — el count real viene de tabla partidos
  }
}

export function rowFromStats(playerId: string, s: PlayerStats): Omit<EstadisticaJugadorRow, "actualizado_en"> {
  return {
    jugador_id:                 playerId,
    tackles_por_partido:        s.tacklesPorPartido,
    tackles_efectivos_pct:      s.tacklesEfectivos,
    metros_ganados_por_partido: s.metrosGanados,
  }
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
  const partidosJugados  = Math.floor(rng() * 12) + 3  // 3-14 (fallback; ideal usar count real de la DB)

  // Tackles totales por partido: forwards más (14-19), backs menos (9-14)
  let tacklesBaseAbs = 11
  if (group === "forward") tacklesBaseAbs = 14
  else if (group === "back") tacklesBaseAbs = 9
  const tacklesPorPartido = Math.round(tacklesBaseAbs + rng() * 5)

  return { tacklesPorPartido, tacklesEfectivos, metrosGanados, partidosJugados }
}
