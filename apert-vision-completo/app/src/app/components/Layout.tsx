import { useEffect, useState } from "react"
import { NavLink, Outlet, useNavigate, Navigate, useLocation } from "react-router"
import logoUrl from "../../assets/logo.png"
import {
  LayoutDashboard, Video, Users,
  Calendar, BarChart2, Settings, LogOut, Eye, Coins, Shield,
} from "lucide-react"
import { useAnalysis } from "../context/AnalysisContext"
import { useAuth } from "../context/AuthContext"
import { supabase, getSaldoCreditos } from "../lib/supabase"

const navItems = [
  { to: "/",         icon: LayoutDashboard, label: "Dashboard"     },
  { to: "/analysis", icon: Video,           label: "Análisis"      },
  { to: "/matches",  icon: Calendar,        label: "Partidos"      },
  { to: "/players",  icon: Users,           label: "Jugadores"     },
  { to: "/stats",    icon: BarChart2,       label: "Estadísticas"  },
  { to: "/creditos", icon: Coins,           label: "Créditos"      },
  { to: "/settings", icon: Settings,        label: "Configuración" },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, miembro, club, isSuperAdmin, loading, signOut } = useAuth()
  const { phase, progress } = useAnalysis()
  const isAnalyzing = phase === "analyzing"

  const [saldo, setSaldo] = useState<number | null>(null)

  useEffect(() => {
    if (!club?.id) { setSaldo(null); return }
    getSaldoCreditos(club.id).then(setSaldo)
    const ch = supabase
      .channel(`saldo-layout-${club.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "creditos_movimientos", filter: `club_id=eq.${club.id}` },
        () => getSaldoCreditos(club.id).then(setSaldo),
      )
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [club?.id])

  // Mientras se valida la sesión, evitamos parpadeos
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Cargando...</div>
      </div>
    )
  }

  // Sin sesión → al login
  if (!session) return <Navigate to="/login" replace />

  // Super admin sin club puede entrar directo al panel
  if (isSuperAdmin && !miembro) {
    // Si va a la home o algo que no sea /admin, redirigir a /admin
    if (location.pathname === "/" || location.pathname === "") {
      return <Navigate to="/admin" replace />
    }
    // permitir el render (nav se adapta abajo)
  } else if (!miembro) {
    // Hay sesión pero no es miembro de ningún club → al signup
    return <Navigate to="/signup" replace />
  } else if (miembro.rol !== "entrenador" && !isSuperAdmin) {
    // Solo entrenadores (o super admins) pueden usar el Desktop
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-4" style={{ backgroundColor: "var(--background)" }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "var(--foreground)" }}>
          Esta app es solo para entrenadores
        </div>
        <div style={{ fontSize: 13, color: "var(--muted-foreground)", textAlign: "center", maxWidth: 320 }}>
          {miembro.rol === "jugador" ? "Como jugador, accedés desde la app móvil." : "Como dirigente, accedés desde la app móvil."}
        </div>
        <button onClick={async () => { await signOut(); navigate("/login") }}
          style={{ padding: "8px 16px", backgroundColor: "var(--primary)", color: "var(--primary-foreground)",
            border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", marginTop: 12 }}>
          Cerrar sesión
        </button>
      </div>
    )
  }

  const handleLogout = async () => {
    await signOut()
    navigate("/login")
  }

  const displayName = miembro?.nombre ?? (isSuperAdmin ? "Super Admin" : session.user.email ?? "Usuario")
  const displayRol  = miembro?.rol ?? (isSuperAdmin ? "super admin" : "")
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
  const showClubBadge = !!club
  const visibleNavItems = miembro ? navItems : []

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ backgroundColor: "var(--background)" }}>

      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col w-60 shrink-0 border-r"
        style={{ backgroundColor: "var(--sidebar)", borderColor: "var(--sidebar-border)" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center px-5 py-4 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
          <img src={logoUrl} alt="Apert Vision" style={{ height: 68, width: "auto", display: "block" }} />
        </div>
        <div className="font-mono text-center pb-3" style={{ fontSize: 9, color: "var(--muted-foreground)", letterSpacing: "0.15em", borderBottom: "1px solid var(--sidebar-border)" }}>
          RUGBY AI
        </div>

        {/* Club badge + créditos (solo si hay club) */}
        {showClubBadge && (
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
            <div className="flex flex-col gap-1.5 px-3 py-2.5 rounded-lg" style={{ backgroundColor: "var(--sidebar-accent)" }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: "var(--primary)" }} />
                <span className="truncate" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{club?.nombre ?? "Mi Club"}</span>
              </div>
              <NavLink to="/creditos"
                className="flex items-center gap-1.5"
                style={{ textDecoration: "none", cursor: "pointer" }}
                title="Ver créditos">
                <Coins size={12} style={{ color: "var(--primary)" }} strokeWidth={2.2} />
                <span className="font-mono tabular" style={{ fontSize: 11, fontWeight: 600, color: "var(--primary)" }}>
                  {saldo ?? "—"}
                </span>
                <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                  crédito{saldo === 1 ? "" : "s"}
                </span>
              </NavLink>
            </div>
          </div>
        )}

        {/* Badge de Super Admin (solo si no hay club) */}
        {isSuperAdmin && !showClubBadge && (
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ backgroundColor: "rgba(57,224,122,0.08)", border: "1px solid rgba(57,224,122,0.2)" }}>
              <Shield size={12} style={{ color: "var(--primary)" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--primary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Modo Super Admin
              </span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {isSuperAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  isActive ? "" : "text-muted-foreground hover:text-foreground"
                }`
              }
              style={({ isActive }) =>
                isActive ? { backgroundColor: "var(--sidebar-accent)", color: "var(--primary)" } : {}
              }
            >
              {({ isActive }) => (
                <>
                  <Shield size={16} style={{ color: isActive ? "var(--primary)" : undefined }} />
                  <span style={{ fontWeight: isActive ? 500 : 400 }}>Admin</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
                  )}
                </>
              )}
            </NavLink>
          )}
          {visibleNavItems.map(({ to, icon: Icon, label }) => {
            const isAnalysisItem = to === "/analysis"
            return (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                    isActive ? "" : "text-muted-foreground hover:text-foreground"
                  }`
                }
                style={({ isActive }) =>
                  isActive ? { backgroundColor: "var(--sidebar-accent)", color: "var(--primary)" } : {}
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} style={{ color: isActive ? "var(--primary)" : undefined }} />
                    <span style={{ fontWeight: isActive ? 500 : 400 }}>{label}</span>
                    <div className="ml-auto flex items-center gap-1.5">
                      {isAnalysisItem && isAnalyzing && (
                        <div className="flex items-center gap-1">
                          <span style={{ fontSize: 10, color: "var(--primary)", fontWeight: 600 }}>
                            {progress}%
                          </span>
                          <div className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{ backgroundColor: "var(--primary)" }} />
                        </div>
                      )}
                      {isActive && !isAnalyzing && (
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
                      )}
                    </div>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* User */}
        <div className="px-3 pb-4 pt-3 border-t" style={{ borderColor: "var(--sidebar-border)" }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #39e07a 0%, #1db954 100%)" }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: "#080c14" }}>{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm truncate" style={{ fontWeight: 500, color: "var(--foreground)" }}>{displayName}</div>
              <div style={{ fontSize: 11, color: "var(--muted-foreground)", textTransform: "capitalize" }}>{displayRol}</div>
            </div>
            <button onClick={handleLogout} title="Cerrar sesión" aria-label="Cerrar sesión"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LogOut size={14} style={{ color: "var(--muted-foreground)" }} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Content ── */}
      <main className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
