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
