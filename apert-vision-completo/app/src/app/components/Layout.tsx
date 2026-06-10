import { NavLink, Outlet, useNavigate, Navigate } from "react-router"
import {
  LayoutDashboard, Video, Users,
  Calendar, BarChart2, Settings, LogOut, Eye,
} from "lucide-react"
import { useAnalysis } from "../context/AnalysisContext"
import { useAuth } from "../context/AuthContext"

const navItems = [
  { to: "/",         icon: LayoutDashboard, label: "Dashboard"     },
  { to: "/analysis", icon: Video,           label: "Análisis"      },
  { to: "/matches",  icon: Calendar,        label: "Partidos"      },
  { to: "/players",  icon: Users,           label: "Jugadores"     },
  { to: "/stats",    icon: BarChart2,       label: "Estadísticas"  },
  { to: "/settings", icon: Settings,        label: "Configuración" },
]

export default function Layout() {
  const navigate = useNavigate()
  const { session, miembro, club, loading, signOut } = useAuth()
  const { phase, progress } = useAnalysis()
  const isAnalyzing = phase === "analyzing"

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

  // Hay sesión pero no es miembro de ningún club → al signup
  if (!miembro) return <Navigate to="/signup" replace />

  // Solo entrenadores pueden usar el Desktop
  if (miembro.rol !== "entrenador") {
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

  const initials = miembro.nombre.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ backgroundColor: "var(--background)" }}>

      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col w-60 shrink-0 border-r"
        style={{ backgroundColor: "var(--sidebar)", borderColor: "var(--sidebar-border)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0" style={{ backgroundColor: "var(--primary)" }}>
            <Eye size={16} style={{ color: "var(--primary-foreground)" }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>Apert Vision</div>
            <div className="font-mono" style={{ fontSize: 10, color: "var(--muted-foreground)", letterSpacing: "0.08em" }}>RUGBY AI</div>
          </div>
        </div>

        {/* Club badge */}
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: "var(--sidebar-accent)" }}>
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: "var(--primary)" }} />
            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{club?.nombre ?? "Mi Club"}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => {
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
              <div className="text-sm truncate" style={{ fontWeight: 500, color: "var(--foreground)" }}>{miembro.nombre}</div>
              <div style={{ fontSize: 11, color: "var(--muted-foreground)", textTransform: "capitalize" }}>{miembro.rol}</div>
            </div>
            <button onClick={handleLogout} title="Cerrar sesión" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6 }}>
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
