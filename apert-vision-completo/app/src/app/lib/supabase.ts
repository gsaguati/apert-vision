import { createClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_KEY

if (!url || !key) {
  // No tirar excepción para evitar pantalla en negro — sólo loguear
  console.error("⚠️ Faltan VITE_SUPABASE_URL / VITE_SUPABASE_KEY en .env")
}

export const supabase = createClient(url || "https://placeholder.supabase.co", key || "placeholder", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// ─── Tipos ─────────────────────────────────────────────────────
export type Rol = "entrenador" | "dirigente" | "jugador"

export interface Club {
  id: string
  nombre: string
  codigo_entrenador: string
  codigo_dirigente: string
  codigo_jugador: string
  created_at: string
}

export interface Miembro {
  id: string
  auth_user_id: string
  club_id: string
  nombre: string
  rol: Rol
  dorsal: number | null
  posicion: string | null
  edad: number | null
  created_at: string
}

export interface Partido {
  id: string
  club_id: string
  creado_por: string | null
  rival: string
  fecha: string
  resultado: "W" | "L" | "D" | null
  marcador: string | null
  es_local: boolean
  video_path: string | null
  created_at: string
}

export interface Evento {
  id: string
  partido_id: string
  tipo: "lineout" | "scrum" | "kickoff"
  timestamp_seg: number
  confianza: number | null
}

export interface Clip {
  id: string
  partido_id: string
  tipo: "lineout" | "scrum" | "kickoff"
  url_storage: string
}

// ─── Créditos & Mercado Pago ───────────────────────────────────
export interface PlanCreditos {
  id:         string
  nombre:     string
  creditos:   number
  precio_usd: number
  precio_ars: number
  destacado:  boolean
  orden:      number
}

export type TipoMovimiento = "bienvenida" | "compra" | "consumo" | "ajuste"

export interface CreditoMovimiento {
  id:            string
  club_id:       string
  tipo:          TipoMovimiento
  cantidad:      number
  descripcion:   string | null
  plan_id:       string | null
  mp_payment_id: string | null
  mp_status:     string | null
  monto_ars:     number | null
  monto_usd:     number | null
  partido_id:    string | null
  creado_por:    string | null
  created_at:    string
}

export interface SaldoCreditos {
  club_id:              string
  club_nombre:          string
  saldo:                number
  partidos_consumidos:  number
  compras_realizadas:   number
}

export async function getSaldoCreditos(clubId: string): Promise<number> {
  const { data, error } = await supabase.rpc("saldo_del_club", { p_club_id: clubId })
  if (error) { console.error(error); return 0 }
  return data ?? 0
}

export async function consumirCredito(clubId: string, partidoId: string | null = null) {
  const { data, error } = await supabase.rpc("consumir_credito", {
    p_club_id: clubId,
    p_partido_id: partidoId,
  })
  if (error) throw error
  return data?.[0] ?? { nuevo_saldo: 0, movimiento_id: null }
}

// ─── Helpers ───────────────────────────────────────────────────
export async function getCurrentMiembro(): Promise<Miembro | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from("miembros")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle()
  if (error) { console.error(error); return null }
  return data
}

export async function getCurrentClub(): Promise<Club | null> {
  const miembro = await getCurrentMiembro()
  if (!miembro) return null
  const { data, error } = await supabase
    .from("clubes")
    .select("*")
    .eq("id", miembro.club_id)
    .maybeSingle()
  if (error) { console.error(error); return null }
  return data
}
