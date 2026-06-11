import { useState } from "react"
import { useNavigate } from "react-router"
import { IOSToggle } from "../components/IOSToggle"
import { Save, Info, Copy, RefreshCw, Check, LogOut, Trash2, Users, Briefcase, User } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../lib/supabase"

const teamColors = [
  { name: "Verde",    hex: "#16a34a" },
  { name: "Azul",     hex: "#2563eb" },
  { name: "Rojo",     hex: "#dc2626" },
  { name: "Blanco",   hex: "#f8fafc" },
  { name: "Negro",    hex: "#0f172a" },
  { name: "Amarillo", hex: "#ca8a04" },
  { name: "Celeste",  hex: "#0284c7" },
  { name: "Naranja",  hex: "#ea580c" },
]

export default function Settings() {
  const navigate = useNavigate()
  const { club, miembro, refresh, signOut } = useAuth()

  const [homeColor, setHomeColor]     = useState("#16a34a")
  const [awayColor, setAwayColor]     = useState("#2563eb")
  const [confidence, setConfidence]   = useState(85)
  const [saved, setSaved]             = useState(false)
  const [copiedCode, setCopiedCode]   = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState<string | null>(null)
  const [leaving, setLeaving]         = useState(false)
  const [deleting, setDeleting]       = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [toggles, setToggles] = useState({
    autoDetect: true,
    showBoundingBoxes: true,
    showConfidence: true,
    realtimePossession: true,
    audioFeedback: false,
    darkMode: true,
    emailNotifications: false,
    autoExport: false,
  })

  const setToggle = (key: keyof typeof toggles) => (v: boolean) =>
    setToggles(t => ({ ...t, [key]: v }))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleRegenerate = async (rol: "entrenador" | "dirigente" | "jugador") => {
    if (!confirm(`¿Regenerar código de ${rol}? El código actual dejará de funcionar.`)) return
    setRegenerating(rol)
    const { error } = await supabase.rpc("regenerar_codigo", { p_rol: rol })
    if (error) { alert("Error: " + error.message); setRegenerating(null); return }
    await refresh()
    setRegenerating(null)
  }

  const handleLeaveClub = async () => {
    if (!confirm("¿Salir del club? Vas a perder acceso a todos los partidos y clips.")) return
    setLeaving(true)
    const { error } = await supabase.rpc("salir_del_club")
    if (error) {
      alert(error.message)
      setLeaving(false); return
    }
    await signOut()
    navigate("/login")
  }

  const handleDeleteClub = async () => {
    setDeleting(true)
    const { error } = await supabase.rpc("eliminar_club")
    if (error) { alert("Error: " + error.message); setDeleting(false); return }
    await signOut()
    navigate("/login")
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-xl border" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
      <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <h2 className="text-foreground" style={{ fontSize: 13, fontWeight: 600 }}>{title}</h2>
      </div>
      <div className="divide-y" style={{ borderColor: "var(--border)" }}>
        {children}
      </div>
    </div>
  )

  const Row = ({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between px-5 py-4">
      <div>
        <div className="text-foreground" style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        {description && <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>{description}</div>}
      </div>
      {children}
    </div>
  )

  // ── Card de cada código ────────────────────────────────────────
  const CodeCard = ({ rol, label, code, icon: Icon, color, description }: {
    rol: "entrenador" | "dirigente" | "jugador"
    label: string; code: string; icon: any; color: string; description: string
  }) => {
    const isCopied = copiedCode === code
    const isRegenerating = regenerating === rol
    return (
      <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
            <Icon size={16} style={{ color }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{label}</div>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{description}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 rounded-lg font-mono"
            style={{ backgroundColor: "var(--secondary)", fontSize: 13, color: "var(--foreground)", letterSpacing: "0.05em" }}>
            {code}
          </div>
          <button onClick={() => handleCopy(code)} title="Copiar"
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ backgroundColor: "var(--secondary)", border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer" }}>
            {isCopied
              ? <Check size={14} style={{ color: "var(--primary)" }} />
              : <Copy  size={14} style={{ color: "var(--muted-foreground)" }} />}
          </button>
          <button onClick={() => handleRegenerate(rol)} disabled={isRegenerating} title="Regenerar"
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ backgroundColor: "var(--secondary)", border: "1px solid rgba(255,255,255,0.07)", cursor: isRegenerating ? "not-allowed" : "pointer" }}>
            <RefreshCw size={14} style={{ color: "var(--muted-foreground)", animation: isRegenerating ? "spin 1s linear infinite" : "none" }} />
          </button>
        </div>
      </div>
    )
  }

  if (!club || !miembro) {
    return (
      <div className="p-6 flex items-center justify-center">
        <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Cargando...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center px-6 py-3 border-b shrink-0" style={{ backgroundColor: "var(--background)", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          <span>Apert Vision</span><span style={{ opacity: 0.4 }}>›</span>
          <span style={{ color: "var(--foreground)", fontWeight: 500 }}>Configuración</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 max-w-3xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground" style={{ fontSize: 18, fontWeight: 700 }}>Configuración</h1>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Club, modelo y preferencias</div>
          </div>
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-80 transition-all"
            style={{ backgroundColor: saved ? "rgba(57,224,122,0.15)" : "var(--primary)",
              color: saved ? "var(--primary)" : "var(--primary-foreground)",
              fontSize: 13, fontWeight: 500, border: saved ? "1px solid var(--primary)" : "none", cursor: "pointer" }}>
            <Save size={14} /> {saved ? "¡Guardado!" : "Guardar cambios"}
          </button>
        </div>

        {/* ── MI CLUB ─────────────────────────────────────── */}
        <Section title="Mi Club">
          <div className="px-5 py-4 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: "var(--secondary)" }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Nombre del club</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--foreground)", marginTop: 2 }}>{club.nombre}</div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: "rgba(57,224,122,0.06)", border: "1px solid rgba(57,224,122,0.2)" }}>
              <Info size={14} style={{ color: "var(--primary)", marginTop: 1, flexShrink: 0 }} />
              <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                Compartí cada código con la persona correspondiente. Lo usan al registrarse para unirse a tu club.
                Si un código se filtra, podés regenerarlo (el viejo deja de funcionar).
              </div>
            </div>

            <div className="space-y-3">
              <CodeCard rol="entrenador" label="Entrenadores" code={club.codigo_entrenador}
                icon={Users} color="#39e07a" description="Otros entrenadores que suben partidos" />
              <CodeCard rol="dirigente" label="Dirigentes" code={club.codigo_dirigente}
                icon={Briefcase} color="#3b82f6" description="Solo ven clips desde el mobile" />
              <CodeCard rol="jugador" label="Jugadores" code={club.codigo_jugador}
                icon={User} color="#f59e0b" description="Solo ven clips desde el mobile" />
            </div>
          </div>
        </Section>

        {/* ── COLORES ─────────────────────────────────────── */}
        <Section title="Colores de Equipos">
          <div className="px-5 py-4">
            <div className="flex items-start gap-2 p-3 rounded-lg mb-4" style={{ backgroundColor: "rgba(57,224,122,0.06)", border: "1px solid rgba(57,224,122,0.2)" }}>
              <Info size={14} style={{ color: "var(--primary)", marginTop: 1, flexShrink: 0 }} />
              <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                Estos colores se usan para identificar posesión de pelota en el análisis.
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {[
                { label: "Equipo Local",     current: homeColor, set: setHomeColor },
                { label: "Equipo Visitante", current: awayColor, set: setAwayColor },
              ].map(({ label, current, set }) => (
                <div key={label}>
                  <div className="text-foreground mb-2" style={{ fontSize: 12, fontWeight: 500 }}>{label}</div>
                  <div className="flex flex-wrap gap-2">
                    {teamColors.map(c => (
                      <button key={c.hex} onClick={() => set(c.hex)} title={c.name}
                        className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                        style={{ backgroundColor: c.hex,
                          outline: current === c.hex ? "2px solid var(--primary)" : "2px solid transparent",
                          outlineOffset: 2,
                          border: c.hex === "#f8fafc" ? "1px solid rgba(255,255,255,0.15)" : "none" }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: current }} />
                    <span className="font-mono" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{current}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── IA ─────────────────────────────────────────── */}
        <Section title="Modelo de IA">
          <Row label="Umbral de confianza" description="Formaciones por debajo no se muestran">
            <div className="flex items-center gap-3">
              <input type="range" min={50} max={99} value={confidence} onChange={e => setConfidence(Number(e.target.value))}
                style={{ width: 100, accentColor: "var(--primary)" }} />
              <span className="font-mono" style={{ fontSize: 13, color: "var(--primary)", fontWeight: 500, minWidth: 36 }}>{confidence}%</span>
            </div>
          </Row>
          <Row label="Detección automática" description="YOLO detecta line-outs, scrums y salidas">
            <IOSToggle checked={toggles.autoDetect} onChange={setToggle("autoDetect")} size="sm" />
          </Row>
          <Row label="Bounding boxes en video" description="Recuadros sobre las formaciones detectadas">
            <IOSToggle checked={toggles.showBoundingBoxes} onChange={setToggle("showBoundingBoxes")} size="sm" />
          </Row>
          <Row label="Porcentaje de confianza" description="Superpone el score de confianza">
            <IOSToggle checked={toggles.showConfidence} onChange={setToggle("showConfidence")} size="sm" />
          </Row>
        </Section>

        {/* ── INTERFAZ ───────────────────────────────────── */}
        <Section title="Interfaz">
          <Row label="Feedback de audio">
            <IOSToggle checked={toggles.audioFeedback} onChange={setToggle("audioFeedback")} size="sm" />
          </Row>
          <Row label="Modo oscuro">
            <IOSToggle checked={toggles.darkMode} onChange={setToggle("darkMode")} size="sm" />
          </Row>
        </Section>

        {/* ── NOTIFICACIONES ─────────────────────────────── */}
        <Section title="Notificaciones">
          <Row label="Email al finalizar análisis">
            <IOSToggle checked={toggles.emailNotifications} onChange={setToggle("emailNotifications")} size="sm" />
          </Row>
          <Row label="PDF automático al finalizar">
            <IOSToggle checked={toggles.autoExport} onChange={setToggle("autoExport")} size="sm" />
          </Row>
        </Section>

        {/* ── ZONA PELIGROSA ─────────────────────────────── */}
        <div className="rounded-xl border" style={{ backgroundColor: "var(--card)", borderColor: "rgba(239,68,68,0.2)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(239,68,68,0.15)" }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: "#ef4444" }}>Zona peligrosa</h2>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>Salir del club</div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>
                  Vas a perder acceso. Si sos el único entrenador, se bloquea.
                </div>
              </div>
              <button onClick={handleLeaveClub} disabled={leaving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg"
                style={{ backgroundColor: "transparent", color: "#ef4444",
                  border: "1px solid rgba(239,68,68,0.3)", fontSize: 12, fontWeight: 500, cursor: leaving ? "not-allowed" : "pointer" }}>
                <LogOut size={13} /> {leaving ? "Saliendo..." : "Salir"}
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "rgba(239,68,68,0.1)" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>Eliminar club</div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>
                  Borra TODO: partidos, miembros, clips. No se puede deshacer.
                </div>
              </div>
              <button onClick={() => setShowDeleteConfirm(true)} disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg"
                style={{ backgroundColor: "#ef4444", color: "#fff",
                  border: "none", fontSize: 12, fontWeight: 500, cursor: deleting ? "not-allowed" : "pointer" }}>
                <Trash2 size={13} /> Eliminar club
              </button>
            </div>
          </div>
        </div>

        {/* Modal de confirmación de eliminar club */}
        {showDeleteConfirm && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
            <div className="rounded-xl border p-6 max-w-md" style={{ backgroundColor: "var(--card)", borderColor: "rgba(239,68,68,0.3)" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>
                ¿Eliminar el club "{club.nombre}"?
              </div>
              <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 20, lineHeight: 1.5 }}>
                Esta acción borra permanentemente:
                <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                  <li>Todos los miembros (entrenadores, dirigentes, jugadores)</li>
                  <li>Todos los partidos y eventos</li>
                  <li>Todos los clips subidos</li>
                </ul>
                <div style={{ marginTop: 12, color: "#ef4444" }}>Es irreversible.</div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowDeleteConfirm(false)}
                  style={{ padding: "8px 16px", backgroundColor: "var(--secondary)", color: "var(--foreground)",
                    border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
                  Cancelar
                </button>
                <button onClick={handleDeleteClub} disabled={deleting}
                  style={{ padding: "8px 16px", backgroundColor: "#ef4444", color: "#fff",
                    border: "none", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: deleting ? "not-allowed" : "pointer" }}>
                  {deleting ? "Eliminando..." : "Sí, eliminar todo"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Model info */}
        <div className="rounded-xl border p-4 flex items-center justify-between"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <div>
            <div className="text-foreground" style={{ fontSize: 13, fontWeight: 500 }}>Modelo activo</div>
            <div className="font-mono" style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>
              YOLO v8 · apert-vision-lines-out
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono"
            style={{ backgroundColor: "rgba(57,224,122,0.1)", fontSize: 11, color: "var(--primary)" }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--primary)" }} />
            ACTIVO
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
