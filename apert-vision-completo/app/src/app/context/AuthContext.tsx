import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { supabase, getCurrentMiembro, getCurrentClub, Miembro, Club } from "../lib/supabase"
import type { Session } from "@supabase/supabase-js"

interface AuthState {
  session: Session | null
  miembro: Miembro | null
  club: Club | null
  loading: boolean
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  session: null, miembro: null, club: null, loading: true,
  refresh: async () => {}, signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [miembro, setMiembro] = useState<Miembro | null>(null)
  const [club, setClub]       = useState<Club | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUserData = async (currentSession: Session | null) => {
    if (!currentSession) {
      setMiembro(null); setClub(null); return
    }
    const [m, c] = await Promise.all([getCurrentMiembro(), getCurrentClub()])
    setMiembro(m); setClub(c)
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
    setMiembro(null); setClub(null); setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, miembro, club, loading, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
