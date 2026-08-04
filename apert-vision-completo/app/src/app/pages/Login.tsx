import { useState } from "react"
import { useNavigate, Link } from "react-router"
import { Eye, EyeOff, Target, BarChart3, Film, Lock } from "lucide-react"
import { supabase } from "../lib/supabase"

export default function Login() {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(""); setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message === "Invalid login credentials"
        ? "Correo o contraseña incorrectos."
        : authError.message)
      setLoading(false)
      return
    }
    navigate("/")
  }

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ backgroundColor: "var(--background)" }}>

      {/* Panel izquierdo */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-12"
        style={{ backgroundColor: "#060b12", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <div className="flex items-center gap-3 mb-12">
            <img src="/logo.png" alt="Apert Vision" style={{ height: 40, width: "auto" }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)" }}>Apert Vision</div>
              <div className="font-mono" style={{ fontSize: 9, color: "var(--muted-foreground)", letterSpacing: "0.1em" }}>RUGBY AI</div>
            </div>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--foreground)", lineHeight: 1.3, marginBottom: 12 }}>
            La primera plataforma de análisis automático de rugby con IA.
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)", lineHeight: 1.7 }}>
            Sin analistas. Sin horas de video.<br />Resultados en minutos.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { Icon: Target,     text: "Detección automática de Line-Outs, Scrums y Salidas" },
            { Icon: BarChart3,  text: "Dashboard de posesión y estadísticas por partido" },
            { Icon: Film,       text: "Clips automáticos de cada formación detectada" },
            { Icon: Lock,       text: "Procesamiento 100% local — tu video no sale del equipo" },
          ].map(({ Icon, text }) => (
            <div key={text} className="flex items-start gap-3">
              <div className="flex items-center justify-center shrink-0"
                style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(57,224,122,0.1)", border: "1px solid rgba(57,224,122,0.18)" }}>
                <Icon size={14} style={{ color: "var(--primary)" }} strokeWidth={2} />
              </div>
              <span style={{ fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.5, paddingTop: 5 }}>{text}</span>
            </div>
          ))}
          <div className="pt-4 font-mono" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "var(--muted-foreground)", letterSpacing: "0.02em" }}>
            v1.0.0 · Estable · Da Vinci 2025
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[380px]">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img src="/logo.png" alt="Apert Vision" style={{ height: 32, width: "auto" }} />
            <span style={{ fontSize: 15, fontWeight: 700 }}>Apert Vision</span>
          </div>

          <div className="mb-8">
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>
              Bienvenido de nuevo
            </h2>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
              Ingresá para acceder a tu club.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>
                Correo electrónico
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="usuario@club.com" required
                style={{ width: "100%", height: 42, backgroundColor: "var(--secondary)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 8, padding: "0 12px", fontSize: 13, color: "var(--foreground)", outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "var(--primary)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.07)"} />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>
                Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{ width: "100%", height: 42, backgroundColor: "var(--secondary)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 8, padding: "0 40px 0 12px", fontSize: 13, color: "var(--foreground)", outline: "none", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "var(--primary)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.07)"} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  {showPass
                    ? <EyeOff size={15} style={{ color: "var(--muted-foreground)" }} />
                    : <Eye     size={15} style={{ color: "var(--muted-foreground)" }} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ fontSize: 12, color: "#ef4444", padding: "8px 12px", backgroundColor: "rgba(239,68,68,0.08)", borderRadius: 6, border: "1px solid rgba(239,68,68,0.2)" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: "100%", height: 42,
                backgroundColor: loading ? "rgba(57,224,122,0.6)" : "var(--primary)",
                color: "var(--primary-foreground)", border: "none", borderRadius: 8,
                fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", transition: "opacity 0.15s" }}>
              {loading ? "Ingresando..." : "Ingresar"}
            </button>

            <div className="flex items-center gap-3">
              <div style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.07)" }} />
              <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>o</span>
              <div style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.07)" }} />
            </div>

            <Link to="/signup" style={{ display: "block", width: "100%", height: 42,
              backgroundColor: "transparent", color: "var(--foreground)",
              border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8,
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              textAlign: "center", lineHeight: "42px", textDecoration: "none" }}>
              Crear cuenta nueva →
            </Link>
          </form>

          <p style={{ marginTop: 24, fontSize: 11, color: "var(--muted-foreground)", textAlign: "center" }}>
            Acceso solo para entrenadores
          </p>
        </div>
      </div>
    </div>
  )
}
