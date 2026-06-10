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
    // Sesión inicial
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      await loadUserData(data.session)
      setLoading(false)
    })

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      await loadUserData(newSession)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
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
