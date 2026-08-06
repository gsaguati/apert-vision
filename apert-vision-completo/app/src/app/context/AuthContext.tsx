import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { supabase, getCurrentMiembro, getCurrentClub, Miembro, Club } from "../lib/supabase"
import type { Session } from "@supabase/supabase-js"

interface AuthState {
  session: Session | null
  miembro: Miembro | null
  club: Club | null
  isSuperAdmin: boolean
  loading: boolean
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  session: null, miembro: null, club: null, isSuperAdmin: false, loading: true,
  refresh: async () => {}, signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [miembro, setMiembro] = useState<Miembro | null>(null)
  const [club, setClub]       = useState<Club | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadUserData = async (currentSession: Session | null) => {
    if (!currentSession) {
      setMiembro(null); setClub(null); setIsSuperAdmin(false); return
    }
    const [m, c, admin] = await Promise.all([
      getCurrentMiembro(),
      getCurrentClub(),
      supabase.rpc("is_super_admin").then(r => Boolean(r.data)).catch(() => false),
    ])
    setMiembro(m); setClub(c); setIsSuperAdmin(admin)
  }

  useEffect(() => {
    // Timeout de seguridad: si Supabase no responde en 5s, asumimos sin sesión.
    // Previene que la pantalla "Cargando..." se cuelgue indefinidamente cuando
    // la red o el servicio están lentos.
    const timeoutId = setTimeout(() => {
      console.warn("[Auth] Timeout de 5s alcanzado — asumiendo sin sesión")
      setLoading(false)
    }, 5000)

    // Sesión inicial
    supabase.auth.getSession().then(async ({ data }) => {
      clearTimeout(timeoutId)
      setSession(data.session)
      await loadUserData(data.session).catch(e => console.error("[Auth] loadUserData:", e))
      setLoading(false)
    }).catch(e => {
      clearTimeout(timeoutId)
      console.error("[Auth] getSession error:", e)
      setLoading(false)
    })

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      // Reset inmediato para que no queden restos del usuario anterior
      // (evita mostrar la pantalla de "solo entrenadores" mientras carga el nuevo user)
      setMiembro(null); setClub(null); setIsSuperAdmin(false); setLoading(true)
      setSession(newSession)
      await loadUserData(newSession).catch(e => console.error("[Auth] loadUserData onChange:", e))
      setLoading(false)
    })

    return () => {
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const refresh = async () => {
    setLoading(true)
    await loadUserData(session)
    setLoading(false)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setMiembro(null); setClub(null); setIsSuperAdmin(false); setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, miembro, club, isSuperAdmin, loading, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
