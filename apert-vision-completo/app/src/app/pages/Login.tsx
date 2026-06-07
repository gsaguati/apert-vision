import { useState } from "react"
import { useNavigate } from "react-router"
import { Eye, EyeOff } from "lucide-react"

const DEMO = { email: "admin@apert.com", password: "rugby2024" }

export default function Login() {
  const [email, setEmail]       = useState("admin@apert.com")
  const [password, setPassword] = useState("rugby2024")
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))

    if (email === DEMO.email && password === DEMO.password) {
      localStorage.setItem("apert_user", JSON.stringify({ email, name: "Juan Martínez", role: "Entrenador" }))
      navigate("/")
    } else {
      setError("Correo o contraseña incorrectos.")
    }
    setLoading(false)
  }

  const handleGuest = () => {
    localStorage.setItem("apert_user", JSON.stringify({ email: "invitado@apert.com", name: "Invitado", role: "Entrenador" }))
    navigate("/")
  }

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ backgroundColor: "var(--background)" }}>

      {/* ── Panel izquierdo — branding ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-12"
        style={{ backgroundColor: "#060b12", borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <Eye size={18} style={{ color: "var(--primary-foreground)" }} />
            </div>
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

        {/* Features */}
        <div className="space-y-4">
          {[
            ["🏉", "Detección automática de Line-Outs, Scrums y Salidas"],
            ["📊", "Dashboard de posesión y estadísticas por partido"],
            ["🎬", "Clips automáticos de cada formación detectada"],
            ["🔒", "Procesamiento 100% local — tu video no sale del equipo"],
          ].map(([icon, text]) => (
            <div key={text} className="flex items-start gap-3">
              <span style={{ fontSize: 16, lineHeight: 1 }}>{icon}</span>
              <span style={{ fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
          <div className="pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "var(--muted-foreground)" }}>
            v0.1.0-MVP · BETA · Da Vinci 2025
          </div>
        </div>
      </div>

      {/* ── Panel derecho — formulario ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[380px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--primary)" }}>
              <Eye size={15} style={{ color: "var(--primary-foreground)" }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Apert Vision</span>
          </div>

          <div className="mb-8">
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>
              Bienvenido de nuevo
            </h2>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
              Ingresá para acceder a tus análisis.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@club.com"
                required
                style={{
                  width: "100%", height: 42,
                  backgroundColor: "var(--secondary)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 8,
                  padding: "0 12px",
                  fontSize: 13,
                  color: "var(--foreground)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={e => e.target.style.borderColor = "var(--primary)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.07)"}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>
                Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%", height: 42,
                    backgroundColor: "var(--secondary)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 8,
                    padding: "0 40px 0 12px",
                    fontSize: 13,
                    color: "var(--foreground)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={e => e.target.style.borderColor = "var(--primary)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.07)"}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4 }}
                >
                  {showPass
                    ? <EyeOff size={15} style={{ color: "var(--muted-foreground)" }} />
                    : <Eye     size={15} style={{ color: "var(--muted-foreground)" }} />
                  }
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ fontSize: 12, color: "#ef4444", padding: "8px 12px", backgroundColor: "rgba(239,68,68,0.08)", borderRadius: 6, border: "1px solid rgba(239,68,68,0.2)" }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", height: 42,
                backgroundColor: loading ? "rgba(57,224,122,0.6)" : "var(--primary)",
                color: "var(--primary-foreground)",
                border: "none", borderRadius: 8,
                fontSize: 14, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "opacity 0.15s",
              }}
            >
              {loading ? "Ingresando..." : "Ingresar a Apert Vision"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.07)" }} />
              <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>o</span>
              <div style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.07)" }} />
            </div>

            {/* Guest */}
            <button
              type="button"
              onClick={handleGuest}
              style={{
                width: "100%", height: 42,
                backgroundColor: "transparent",
                color: "var(--muted-foreground)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 8, fontSize: 13, fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Continuar sin cuenta →
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 11, color: "var(--muted-foreground)", textAlign: "center" }}>
            Demo: admin@apert.com · rugby2024
          </p>
        </div>
      </div>
    </div>
  )
}
