import { useState } from "react"
import { useNavigate, Link } from "react-router"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import { supabase } from "../lib/supabase"

type Mode = "choose" | "create-club" | "join-club"

export default function Signup() {
  const [mode, setMode] = useState<Mode>("choose")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [nombre, setNombre]     = useState("")
  const [nombreClub, setNombreClub] = useState("")
  const [codigo, setCodigo]     = useState("")
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(""); setLoading(true)

    // 1) Sign up en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) {
      setError(authError.message); setLoading(false); return
    }
    if (!authData.session) {
      // Si la confirmación por email está activada
      setError("Tenés que confirmar tu email antes de continuar.")
      setLoading(false); return
    }

    // 2) Crear club o unirse, según el modo
    if (mode === "create-club") {
      const { error: rpcError } = await supabase.rpc("crear_club", {
        p_nombre_club: nombreClub,
        p_nombre_entrenador: nombre,
      })
      if (rpcError) {
        setError("Error creando el club: " + rpcError.message)
        setLoading(false); return
      }
    } else if (mode === "join-club") {
      const { error: rpcError } = await supabase.rpc("unirse_a_club", {
        p_codigo: codigo.trim().toUpperCase(),
        p_nombre: nombre,
      })
      if (rpcError) {
        setError(rpcError.message.includes("inválido")
          ? "Código de club inválido."
          : "Error: " + rpcError.message)
        setLoading(false); return
      }
    }

    navigate("/")
  }

  // ── Vista de elección ────────────────────────────────────────
  if (mode === "choose") {
    return (
      <div className="flex h-screen w-full items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <div className="w-full max-w-[420px] p-8">
          <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--muted-foreground)", textDecoration: "none", marginBottom: 24 }}>
            <ArrowLeft size={13} /> Volver al login
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--primary)" }}>
              <Eye size={18} style={{ color: "var(--primary-foreground)" }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)" }}>Apert Vision</div>
              <div className="font-mono" style={{ fontSize: 9, color: "var(--muted-foreground)", letterSpacing: "0.1em" }}>RUGBY AI</div>
            </div>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>
            Empezar
          </h2>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 32 }}>
            ¿Cómo querés entrar?
          </p>

          <div className="space-y-3">
            <button onClick={() => setMode("create-club")}
              style={{ width: "100%", textAlign: "left", padding: 20,
                backgroundColor: "var(--card)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12, cursor: "pointer", transition: "border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>
                🏛️ Crear un club nuevo
              </div>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                Sos el primer entrenador. Vas a crear el club y obtener los códigos de invitación.
              </div>
            </button>

            <button onClick={() => setMode("join-club")}
              style={{ width: "100%", textAlign: "left", padding: 20,
                backgroundColor: "var(--card)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12, cursor: "pointer", transition: "border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>
                🔑 Tengo un código de entrenador
              </div>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                Sumate como entrenador adicional a un club que ya existe.
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Formulario (crear o unirse) ──────────────────────────────
  const isCreate = mode === "create-club"

  return (
    <div className="flex h-screen w-full items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
      <div className="w-full max-w-[420px] p-8">
        <button onClick={() => setMode("choose")} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer", marginBottom: 24, padding: 0 }}>
          <ArrowLeft size={13} /> Volver
        </button>

        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>
          {isCreate ? "Crear tu club" : "Sumarte como entrenador"}
        </h2>
        <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 32 }}>
          {isCreate ? "Vas a ser el entrenador fundador del club." : "Ingresá el código que te compartieron."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Tu nombre completo" value={nombre} onChange={setNombre} placeholder="Juan Martínez" required />

          {isCreate
            ? <Field label="Nombre del club" value={nombreClub} onChange={setNombreClub} placeholder="Los Pumas RC" required />
            : <Field label="Código de entrenador" value={codigo} onChange={v => setCodigo(v.toUpperCase())} placeholder="PUMAS-E-A8K2" required mono />
          }

          <Field label="Correo electrónico" type="email" value={email} onChange={setEmail} placeholder="entrenador@club.com" required />

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Contraseña</label>
            <div style={{ position: "relative" }}>
              <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres" required minLength={6}
                style={inputStyle("padding-right")} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                {showPass ? <EyeOff size={15} style={{ color: "var(--muted-foreground)" }} /> : <Eye size={15} style={{ color: "var(--muted-foreground)" }} />}
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
            {loading ? "Creando cuenta..." : (isCreate ? "Crear club y entrar" : "Sumarme y entrar")}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────
function inputStyle(variant?: "padding-right"): React.CSSProperties {
  return {
    width: "100%", height: 42,
    backgroundColor: "var(--secondary)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 8,
    padding: variant === "padding-right" ? "0 40px 0 12px" : "0 12px",
    fontSize: 13, color: "var(--foreground)", outline: "none", boxSizing: "border-box",
  }
}

function Field({ label, value, onChange, placeholder, type = "text", required, mono }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean; mono?: boolean
}) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>
        {label}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
        className={mono ? "font-mono" : ""}
        style={{ ...inputStyle(), letterSpacing: mono ? "0.05em" : undefined }}
        onFocus={e => e.target.style.borderColor = "var(--primary)"}
        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.07)"} />
    </div>
  )
}
