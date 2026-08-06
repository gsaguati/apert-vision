import { useEffect, useState } from "react"
import { useNavigate, Navigate } from "react-router"
import {
  Shield, Users, Trophy, Video, Zap, Coins, TrendingUp,
  Plus, Minus, Trash2, RefreshCw, DollarSign, X, UserX, Pencil, UserPlus,
} from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../lib/supabase"

type Stats = {
  total_clubes: number
  total_miembros: number
  total_partidos: number
  total_clips: number
  total_eventos: number
  creditos_emitidos: number
  creditos_consumidos: number
  monto_ars_total: number
}

type ClubRow = {
  id: string
  nombre: string
  created_at: string
  cant_miembros: number
  cant_entrenadores: number
  cant_jugadores: number
  cant_partidos: number
  saldo_creditos: number
}

type Movimiento = {
  id: string
  club_id: string
  club_nombre: string
  tipo: string
  cantidad: number
  descripcion: string | null
  monto_ars: number | null
  mp_status: string | null
  created_at: string
}

type Miembro = {
  id: string
  auth_user_id: string
  nombre: string
  rol: string
  club_id: string
  club_nombre: string
  dorsal: number | null
  posicion: string | null
  edad: number | null
  email: string | null
}

export default function Admin() {
  const navigate = useNavigate()
  const { isSuperAdmin, loading } = useAuth()

  const [stats, setStats] = useState<Stats | null>(null)
  const [clubes, setClubes] = useState<ClubRow[]>([])
  const [movs, setMovs]   = useState<Movimiento[]>([])
  const [miembros, setMiembros] = useState<Miembro[]>([])
  const [filtroRol, setFiltroRol] = useState<string>("todos")
  const [reloading, setReloading] = useState(false)
  const [deleteMemberTarget, setDeleteMemberTarget] = useState<Miembro | null>(null)
  const [deletingMember, setDeletingMember] = useState(false)

  // Modal de crear/editar miembro
  const [memberModal, setMemberModal] = useState<null | { mode: "create" | "edit"; miembro?: Miembro }>(null)
  const [mfNombre,   setMfNombre]   = useState("")
  const [mfEmail,    setMfEmail]    = useState("")
  const [mfPassword, setMfPassword] = useState("")
  const [mfRol,      setMfRol]      = useState<"entrenador" | "dirigente" | "jugador">("jugador")
  const [mfClubId,   setMfClubId]   = useState("")
  const [mfDorsal,   setMfDorsal]   = useState("")
  const [mfPosicion, setMfPosicion] = useState("")
  const [mfEdad,     setMfEdad]     = useState("")
  const [savingMember, setSavingMember] = useState(false)

  // Modal de ajuste
  const [adjustClub, setAdjustClub] = useState<ClubRow | null>(null)
  const [adjustAmount, setAdjustAmount] = useState<string>("")
  const [adjustReason, setAdjustReason] = useState<string>("")
  const [adjusting, setAdjusting] = useState(false)

  // Modal de eliminar club
  const [deleteTarget, setDeleteTarget] = useState<ClubRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadAll = async () => {
    setReloading(true)
    const [s, c, m, mem] = await Promise.all([
      supabase.rpc("admin_estadisticas_globales").then(r => r.data?.[0] ?? null),
      supabase.rpc("admin_listar_clubes").then(r => r.data ?? []),
      supabase.rpc("admin_listar_movimientos", { p_limit: 30 }).then(r => r.data ?? []),
      supabase.rpc("admin_listar_miembros").then(r => r.data ?? []),
    ])
    setStats(s)
    setClubes(c)
    setMovs(m)
    setMiembros(mem)
    setReloading(false)
  }

  const handleDeleteMember = async () => {
    if (!deleteMemberTarget) return
    setDeletingMember(true)
    const { error } = await supabase.rpc("admin_eliminar_miembro", { p_miembro_id: deleteMemberTarget.id })
    setDeletingMember(false)
    if (error) { alert("Error: " + error.message); return }
    setDeleteMemberTarget(null)
    await loadAll()
  }

  const openCreateMember = () => {
    setMfNombre(""); setMfEmail(""); setMfPassword(""); setMfRol("jugador")
    setMfClubId(clubes[0]?.id ?? ""); setMfDorsal(""); setMfPosicion(""); setMfEdad("")
    setMemberModal({ mode: "create" })
  }

  const openEditMember = (m: Miembro) => {
    setMfNombre(m.nombre); setMfEmail(m.email ?? ""); setMfPassword("")
    setMfRol(m.rol as any); setMfClubId(m.club_id)
    setMfDorsal(m.dorsal?.toString() ?? "")
    setMfPosicion(m.posicion ?? "")
    setMfEdad(m.edad?.toString() ?? "")
    setMemberModal({ mode: "edit", miembro: m })
  }

  const handleSaveMember = async () => {
    if (!memberModal) return
    if (!mfNombre.trim()) { alert("Nombre es obligatorio"); return }

    setSavingMember(true)
    let error: any = null

    if (memberModal.mode === "create") {
      if (!mfClubId) { alert("Elegí un club"); setSavingMember(false); return }
      if (!mfEmail.trim()) { alert("Email es obligatorio"); setSavingMember(false); return }
      if (mfPassword.length < 6) { alert("Password debe tener al menos 6 caracteres"); setSavingMember(false); return }
      const res = await supabase.rpc("admin_crear_miembro", {
        p_club_id:  mfClubId,
        p_email:    mfEmail.trim(),
        p_password: mfPassword,
        p_nombre:   mfNombre.trim(),
        p_rol:      mfRol,
        p_dorsal:   mfDorsal ? parseInt(mfDorsal, 10) : null,
        p_posicion: mfPosicion.trim() || null,
        p_edad:     mfEdad ? parseInt(mfEdad, 10) : null,
      })
      error = res.error
    } else if (memberModal.miembro) {
      if (!mfClubId) { alert("Elegí un club"); setSavingMember(false); return }
      const res = await supabase.rpc("admin_editar_miembro", {
        p_miembro_id: memberModal.miembro.id,
        p_nombre:     mfNombre.trim(),
        p_rol:        mfRol,
        p_club_id:    mfClubId,
        p_dorsal:     mfDorsal ? parseInt(mfDorsal, 10) : null,
        p_posicion:   mfPosicion.trim() || null,
        p_edad:       mfEdad ? parseInt(mfEdad, 10) : null,
      })
      error = res.error
    }

    setSavingMember(false)
    if (error) { alert("Error: " + error.message); return }
    setMemberModal(null)
    await loadAll()
  }

  useEffect(() => {
    if (isSuperAdmin) loadAll()
  }, [isSuperAdmin])

  if (loading) return (
    <div className="flex h-full w-full items-center justify-center">
      <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Cargando...</div>
    </div>
  )
  if (!isSuperAdmin) return <Navigate to="/" replace />

  const handleAdjust = async () => {
    if (!adjustClub) return
    const amount = parseInt(adjustAmount, 10)
    if (!amount || isNaN(amount)) { alert("Ingresá una cantidad válida (positiva o negativa)"); return }
    setAdjusting(true)
    const { error } = await supabase.rpc("admin_ajustar_creditos", {
      p_club_id: adjustClub.id,
      p_cantidad: amount,
      p_motivo: adjustReason || "Ajuste manual del super admin",
    })
    setAdjusting(false)
    if (error) { alert("Error: " + error.message); return }
    setAdjustClub(null); setAdjustAmount(""); setAdjustReason("")
    await loadAll()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const { error } = await supabase.rpc("admin_eliminar_club", { p_club_id: deleteTarget.id })
    setDeleting(false)
    if (error) { alert("Error: " + error.message); return }
    setDeleteTarget(null)
    await loadAll()
  }

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon size={15} style={{ color }} />
        </div>
        <div style={{ fontSize: 11, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      </div>
      <div className="font-mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)" }}>
        {value}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b shrink-0" style={{ backgroundColor: "var(--background)", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          <span>Apert Vision</span><span style={{ opacity: 0.4 }}>›</span>
          <span style={{ color: "var(--foreground)", fontWeight: 500 }}>Panel de administración</span>
        </div>
        <button onClick={loadAll} disabled={reloading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: "var(--secondary)", border: "1px solid rgba(255,255,255,0.07)", color: "var(--foreground)", fontSize: 12, cursor: reloading ? "not-allowed" : "pointer" }}>
          <RefreshCw size={12} style={{ animation: reloading ? "spin 1s linear infinite" : "none" }} /> Actualizar
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(57,224,122,0.15)" }}>
            <Shield size={20} style={{ color: "var(--primary)" }} />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--foreground)" }}>Panel de Super Admin</h1>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Visión global de la plataforma</div>
          </div>
        </div>

        {/* Métricas globales */}
        <div>
          <h2 style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            Métricas globales
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={Trophy}    label="Clubes"       value={stats?.total_clubes    ?? "—"} color="#39e07a" />
            <StatCard icon={Users}     label="Miembros"     value={stats?.total_miembros  ?? "—"} color="#3b82f6" />
            <StatCard icon={Video}     label="Partidos"     value={stats?.total_partidos  ?? "—"} color="#f59e0b" />
            <StatCard icon={Zap}       label="Eventos IA"   value={stats?.total_eventos   ?? "—"} color="#a855f7" />
            <StatCard icon={Coins}     label="Créditos emitidos"  value={stats?.creditos_emitidos ?? "—"} color="#39e07a" />
            <StatCard icon={TrendingUp} label="Créditos consumidos" value={stats?.creditos_consumidos ?? "—"} color="#ef4444" />
            <StatCard icon={Video}     label="Clips subidos" value={stats?.total_clips    ?? "—"} color="#0ea5e9" />
            <StatCard icon={DollarSign} label="Ingresos ARS" value={stats?.monto_ars_total != null ? `$${Number(stats.monto_ars_total).toLocaleString("es-AR")}` : "—"} color="#39e07a" />
          </div>
        </div>

        {/* Clubes */}
        <div>
          <h2 style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            Clubes ({clubes.length})
          </h2>
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <table className="w-full" style={{ fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: "var(--secondary)", fontSize: 11, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ textAlign: "left", padding: "10px 14px" }}>Club</th>
                  <th style={{ textAlign: "center", padding: "10px 14px" }}>Miembros</th>
                  <th style={{ textAlign: "center", padding: "10px 14px" }}>Entren.</th>
                  <th style={{ textAlign: "center", padding: "10px 14px" }}>Jug.</th>
                  <th style={{ textAlign: "center", padding: "10px 14px" }}>Partidos</th>
                  <th style={{ textAlign: "center", padding: "10px 14px" }}>Saldo</th>
                  <th style={{ textAlign: "right", padding: "10px 14px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clubes.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: "var(--muted-foreground)", fontSize: 12 }}>
                    {reloading ? "Cargando..." : "No hay clubes"}
                  </td></tr>
                )}
                {clubes.map(c => (
                  <tr key={c.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontWeight: 500, color: "var(--foreground)" }}>{c.nombre}</div>
                      <div style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{new Date(c.created_at).toLocaleDateString("es-AR")}</div>
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>{c.cant_miembros}</td>
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>{c.cant_entrenadores}</td>
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>{c.cant_jugadores}</td>
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>{c.cant_partidos}</td>
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
                      <span className="font-mono" style={{ color: c.saldo_creditos > 0 ? "var(--primary)" : "var(--muted-foreground)", fontWeight: 600 }}>
                        {c.saldo_creditos}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      <div className="flex gap-1.5 justify-end">
                        <button onClick={() => { setAdjustClub(c); setAdjustAmount(""); setAdjustReason("") }} title="Ajustar créditos"
                          className="p-1.5 rounded-md hover:opacity-80"
                          style={{ backgroundColor: "rgba(57,224,122,0.12)", border: "1px solid rgba(57,224,122,0.25)", cursor: "pointer" }}>
                          <Coins size={12} style={{ color: "var(--primary)" }} />
                        </button>
                        <button onClick={() => setDeleteTarget(c)} title="Eliminar club"
                          className="p-1.5 rounded-md hover:opacity-80"
                          style={{ backgroundColor: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", cursor: "pointer" }}>
                          <Trash2 size={12} style={{ color: "#ef4444" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Miembros */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Miembros ({miembros.length})
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {["todos", "entrenador", "dirigente", "jugador"].map(r => (
                  <button key={r} onClick={() => setFiltroRol(r)}
                    className="px-3 py-1 rounded-md"
                    style={{
                      backgroundColor: filtroRol === r ? "var(--primary)" : "var(--secondary)",
                      color: filtroRol === r ? "var(--primary-foreground)" : "var(--muted-foreground)",
                      border: "1px solid rgba(255,255,255,0.07)", fontSize: 11, fontWeight: 500,
                      textTransform: "capitalize", cursor: "pointer",
                    }}>
                    {r}
                  </button>
                ))}
              </div>
              <button onClick={openCreateMember}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)", border: "none", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>
                <UserPlus size={12} /> Nuevo miembro
              </button>
            </div>
          </div>
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <table className="w-full" style={{ fontSize: 12 }}>
              <thead>
                <tr style={{ backgroundColor: "var(--secondary)", fontSize: 10, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ textAlign: "left",   padding: "10px 14px" }}>Nombre</th>
                  <th style={{ textAlign: "left",   padding: "10px 14px" }}>Rol</th>
                  <th style={{ textAlign: "left",   padding: "10px 14px" }}>Club</th>
                  <th style={{ textAlign: "left",   padding: "10px 14px" }}>Email</th>
                  <th style={{ textAlign: "center", padding: "10px 14px" }}>#</th>
                  <th style={{ textAlign: "left",   padding: "10px 14px" }}>Posición</th>
                  <th style={{ textAlign: "center", padding: "10px 14px" }}>Edad</th>
                  <th style={{ textAlign: "right",  padding: "10px 14px" }}></th>
                </tr>
              </thead>
              <tbody>
                {miembros.filter(m => filtroRol === "todos" || m.rol === filtroRol).length === 0 && (
                  <tr><td colSpan={8} style={{ padding: 24, textAlign: "center", color: "var(--muted-foreground)" }}>
                    Sin miembros
                  </td></tr>
                )}
                {miembros.filter(m => filtroRol === "todos" || m.rol === filtroRol).map(m => {
                  const rolColor: Record<string, string> = {
                    entrenador: "#39e07a", dirigente: "#3b82f6", jugador: "#f59e0b",
                  }
                  return (
                    <tr key={m.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "10px 14px", color: "var(--foreground)", fontWeight: 500 }}>{m.nombre}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: rolColor[m.rol] ?? "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.rol}</span>
                      </td>
                      <td style={{ padding: "10px 14px", color: "var(--muted-foreground)" }}>{m.club_nombre}</td>
                      <td style={{ padding: "10px 14px", color: "var(--muted-foreground)", fontSize: 11 }}>{m.email ?? "—"}</td>
                      <td style={{ padding: "10px 14px", textAlign: "center", color: "var(--muted-foreground)" }} className="font-mono">{m.dorsal ?? "—"}</td>
                      <td style={{ padding: "10px 14px", color: "var(--muted-foreground)" }}>{m.posicion ?? "—"}</td>
                      <td style={{ padding: "10px 14px", textAlign: "center", color: "var(--muted-foreground)" }}>{m.edad ?? "—"}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right" }}>
                        <div className="flex gap-1.5 justify-end">
                          <button onClick={() => openEditMember(m)} title="Editar miembro"
                            className="p-1.5 rounded-md hover:opacity-80"
                            style={{ backgroundColor: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", cursor: "pointer" }}>
                            <Pencil size={12} style={{ color: "#3b82f6" }} />
                          </button>
                          <button onClick={() => setDeleteMemberTarget(m)} title="Eliminar miembro"
                            className="p-1.5 rounded-md hover:opacity-80"
                            style={{ backgroundColor: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", cursor: "pointer" }}>
                            <UserX size={12} style={{ color: "#ef4444" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Movimientos recientes */}
        <div>
          <h2 style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            Movimientos de créditos recientes
          </h2>
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <table className="w-full" style={{ fontSize: 12 }}>
              <thead>
                <tr style={{ backgroundColor: "var(--secondary)", fontSize: 10, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ textAlign: "left",  padding: "10px 14px" }}>Fecha</th>
                  <th style={{ textAlign: "left",  padding: "10px 14px" }}>Club</th>
                  <th style={{ textAlign: "left",  padding: "10px 14px" }}>Tipo</th>
                  <th style={{ textAlign: "center",padding: "10px 14px" }}>Cantidad</th>
                  <th style={{ textAlign: "left",  padding: "10px 14px" }}>Descripción</th>
                  <th style={{ textAlign: "right", padding: "10px 14px" }}>Monto ARS</th>
                </tr>
              </thead>
              <tbody>
                {movs.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "var(--muted-foreground)" }}>
                    Sin movimientos
                  </td></tr>
                )}
                {movs.map(m => {
                  const isPositive = m.cantidad > 0
                  const tipoColor: Record<string, string> = {
                    bienvenida: "#39e07a", compra: "#3b82f6", consumo: "#ef4444", ajuste: "#f59e0b",
                  }
                  return (
                    <tr key={m.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "10px 14px", color: "var(--muted-foreground)" }}>{new Date(m.created_at).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                      <td style={{ padding: "10px 14px", color: "var(--foreground)" }}>{m.club_nombre}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: tipoColor[m.tipo] ?? "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.tipo}</span>
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "center" }}>
                        <span className="font-mono" style={{ color: isPositive ? "var(--primary)" : "#ef4444", fontWeight: 600 }}>
                          {isPositive ? "+" : ""}{m.cantidad}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px", color: "var(--muted-foreground)" }}>{m.descripcion ?? "—"}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", color: "var(--muted-foreground)" }} className="font-mono">
                        {m.monto_ars ? `$${Number(m.monto_ars).toLocaleString("es-AR")}` : "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal ajustar créditos */}
      {adjustClub && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div className="rounded-xl border p-6 w-full max-w-md" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)" }}>Ajustar créditos</div>
              <button onClick={() => setAdjustClub(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={16} style={{ color: "var(--muted-foreground)" }} />
              </button>
            </div>
            <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 16 }}>
              Club: <span style={{ color: "var(--foreground)", fontWeight: 500 }}>{adjustClub.nombre}</span>
              <span style={{ marginLeft: 8, fontSize: 11 }}>(saldo actual: {adjustClub.saldo_creditos})</span>
            </div>

            <div className="mb-3">
              <label style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>
                Cantidad (positivo = sumar / negativo = restar)
              </label>
              <div className="flex gap-2">
                <button onClick={() => setAdjustAmount(String((parseInt(adjustAmount) || 0) - 1))}
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "var(--secondary)", border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer" }}>
                  <Minus size={14} style={{ color: "var(--muted-foreground)" }} />
                </button>
                <input type="number" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)}
                  placeholder="Ej: 5 o -3"
                  className="flex-1 h-10 rounded-lg px-3 font-mono"
                  style={{ backgroundColor: "var(--secondary)", border: "1px solid rgba(255,255,255,0.07)", color: "var(--foreground)", fontSize: 14, textAlign: "center", outline: "none" }} />
                <button onClick={() => setAdjustAmount(String((parseInt(adjustAmount) || 0) + 1))}
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "var(--secondary)", border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer" }}>
                  <Plus size={14} style={{ color: "var(--muted-foreground)" }} />
                </button>
              </div>
            </div>

            <div className="mb-5">
              <label style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>
                Motivo (opcional)
              </label>
              <input type="text" value={adjustReason} onChange={e => setAdjustReason(e.target.value)}
                placeholder="Compensación por bug, cortesía, etc."
                className="w-full h-10 rounded-lg px-3"
                style={{ backgroundColor: "var(--secondary)", border: "1px solid rgba(255,255,255,0.07)", color: "var(--foreground)", fontSize: 13, outline: "none" }} />
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setAdjustClub(null)}
                style={{ padding: "8px 16px", backgroundColor: "var(--secondary)", color: "var(--foreground)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={handleAdjust} disabled={adjusting || !adjustAmount}
                style={{ padding: "8px 16px", backgroundColor: "var(--primary)", color: "var(--primary-foreground)", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: adjusting ? "not-allowed" : "pointer" }}>
                {adjusting ? "Aplicando..." : "Aplicar ajuste"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminar club */}
      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div className="rounded-xl border p-6 w-full max-w-md" style={{ backgroundColor: "var(--card)", borderColor: "rgba(239,68,68,0.3)" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>
              ¿Eliminar el club "{deleteTarget.nombre}"?
            </div>
            <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 20, lineHeight: 1.5 }}>
              Se van a borrar en cascada:
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                <li>{deleteTarget.cant_miembros} miembros</li>
                <li>{deleteTarget.cant_partidos} partidos (con sus eventos y clips)</li>
                <li>Todo el historial de créditos del club</li>
              </ul>
              <div style={{ marginTop: 12, color: "#ef4444", fontWeight: 500 }}>Esta acción es irreversible.</div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteTarget(null)}
                style={{ padding: "8px 16px", backgroundColor: "var(--secondary)", color: "var(--foreground)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ padding: "8px 16px", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: deleting ? "not-allowed" : "pointer" }}>
                {deleting ? "Eliminando..." : "Sí, eliminar todo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal crear / editar miembro */}
      {memberModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div className="rounded-xl border p-6 w-full max-w-lg" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="flex items-center justify-between mb-4">
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)" }}>
                {memberModal.mode === "create" ? "Nuevo miembro" : "Editar miembro"}
              </div>
              <button onClick={() => setMemberModal(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={16} style={{ color: "var(--muted-foreground)" }} />
              </button>
            </div>

            {/* Club — visible en create y edit (permite mover de club) */}
            <div className="mb-3">
              <label style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>
                Club {memberModal.mode === "edit" && <span style={{ color: "var(--muted-foreground)", fontWeight: 400, marginLeft: 6 }}>(cambialo para mover al miembro a otro club)</span>}
              </label>
              <select value={mfClubId} onChange={e => setMfClubId(e.target.value)}
                className="w-full h-10 rounded-lg px-3"
                style={{ backgroundColor: "var(--secondary)", border: "1px solid rgba(255,255,255,0.07)", color: "var(--foreground)", fontSize: 13, outline: "none" }}>
                <option value="">Elegí un club...</option>
                {clubes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

            {memberModal.mode === "create" && (
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Email</label>
                  <input type="email" value={mfEmail} onChange={e => setMfEmail(e.target.value)}
                    placeholder="usuario@ejemplo.com"
                    className="w-full h-10 rounded-lg px-3"
                    style={{ backgroundColor: "var(--secondary)", border: "1px solid rgba(255,255,255,0.07)", color: "var(--foreground)", fontSize: 13, outline: "none" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Password (mín. 6)</label>
                  <input type="password" value={mfPassword} onChange={e => setMfPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 rounded-lg px-3"
                    style={{ backgroundColor: "var(--secondary)", border: "1px solid rgba(255,255,255,0.07)", color: "var(--foreground)", fontSize: 13, outline: "none" }} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Nombre</label>
                <input type="text" value={mfNombre} onChange={e => setMfNombre(e.target.value)}
                  className="w-full h-10 rounded-lg px-3"
                  style={{ backgroundColor: "var(--secondary)", border: "1px solid rgba(255,255,255,0.07)", color: "var(--foreground)", fontSize: 13, outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Rol</label>
                <select value={mfRol} onChange={e => setMfRol(e.target.value as any)}
                  className="w-full h-10 rounded-lg px-3"
                  style={{ backgroundColor: "var(--secondary)", border: "1px solid rgba(255,255,255,0.07)", color: "var(--foreground)", fontSize: 13, outline: "none" }}>
                  <option value="entrenador">Entrenador</option>
                  <option value="dirigente">Dirigente</option>
                  <option value="jugador">Jugador</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Dorsal</label>
                <input type="number" value={mfDorsal} onChange={e => setMfDorsal(e.target.value)}
                  placeholder="—"
                  className="w-full h-10 rounded-lg px-3 font-mono"
                  style={{ backgroundColor: "var(--secondary)", border: "1px solid rgba(255,255,255,0.07)", color: "var(--foreground)", fontSize: 13, outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Posición</label>
                <input type="text" value={mfPosicion} onChange={e => setMfPosicion(e.target.value)}
                  placeholder="Hooker, Wing…"
                  className="w-full h-10 rounded-lg px-3"
                  style={{ backgroundColor: "var(--secondary)", border: "1px solid rgba(255,255,255,0.07)", color: "var(--foreground)", fontSize: 13, outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Edad</label>
                <input type="number" value={mfEdad} onChange={e => setMfEdad(e.target.value)}
                  placeholder="—"
                  className="w-full h-10 rounded-lg px-3 font-mono"
                  style={{ backgroundColor: "var(--secondary)", border: "1px solid rgba(255,255,255,0.07)", color: "var(--foreground)", fontSize: 13, outline: "none" }} />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setMemberModal(null)}
                style={{ padding: "8px 16px", backgroundColor: "var(--secondary)", color: "var(--foreground)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={handleSaveMember} disabled={savingMember}
                style={{ padding: "8px 16px", backgroundColor: "var(--primary)", color: "var(--primary-foreground)", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: savingMember ? "not-allowed" : "pointer" }}>
                {savingMember ? "Guardando..." : (memberModal.mode === "create" ? "Crear" : "Guardar cambios")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminar miembro */}
      {deleteMemberTarget && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div className="rounded-xl border p-6 w-full max-w-md" style={{ backgroundColor: "var(--card)", borderColor: "rgba(239,68,68,0.3)" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>
              ¿Eliminar a "{deleteMemberTarget.nombre}"?
            </div>
            <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 20, lineHeight: 1.5 }}>
              Rol: <span style={{ color: "var(--foreground)", textTransform: "capitalize" }}>{deleteMemberTarget.rol}</span> ·
              Club: <span style={{ color: "var(--foreground)" }}> {deleteMemberTarget.club_nombre}</span>
              <div style={{ marginTop: 8 }}>
                Se van a borrar también sus estadísticas persistidas.
              </div>
              <div style={{ marginTop: 12, color: "#ef4444", fontWeight: 500 }}>Esta acción es irreversible.</div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteMemberTarget(null)}
                style={{ padding: "8px 16px", backgroundColor: "var(--secondary)", color: "var(--foreground)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={handleDeleteMember} disabled={deletingMember}
                style={{ padding: "8px 16px", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: deletingMember ? "not-allowed" : "pointer" }}>
                {deletingMember ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
