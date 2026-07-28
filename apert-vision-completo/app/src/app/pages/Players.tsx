import { useEffect, useState } from "react"
import { Search, Trash2, ChevronUp, ChevronDown, Users, Copy, Check, RefreshCw, Share2, Shield, Zap, X, TrendingUp } from "lucide-react"
import { supabase, Miembro } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import { getPlayerStats } from "../lib/playerStats"

const POSITIONS = ["Todos","Pilier","Hooker","Lock","Flanker","Nº 8","Medio Scrum","Apertura","Wing","Centro","Fullback"]
const AVATAR_COLORS = ["#39e07a","#3b82f6","#f59e0b","#a855f7","#ef4444","#06b6d4","#ec4899","#14b8a6"]

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
}

function hashColor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h) + id.charCodeAt(i)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

export default function Players() {
  const { club } = useAuth()
  const [players, setPlayers]   = useState<Miembro[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState("")
  const [position, setPosition] = useState("Todos")
  const [sort, setSort]         = useState<{ key: string; dir: "asc" | "desc" }>({ key: "dorsal", dir: "asc" })
  const [copied, setCopied]     = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Miembro | null>(null)
  const [partidosCount, setPartidosCount] = useState(0)

  const loadPlayers = async () => {
    setRefreshing(true)
    const [pRes, cRes] = await Promise.all([
      supabase.from("miembros").select("*").eq("rol", "jugador"),
      club ? supabase.from("partidos").select("id", { count: "exact", head: true }).eq("club_id", club.id) : Promise.resolve({ count: 0 }),
    ])
    if (pRes.error) console.error(pRes.error)
    setPlayers(pRes.data ?? [])
    setPartidosCount((cRes as any).count ?? 0)
    setLoading(false); setRefreshing(false)
  }

  useEffect(() => { loadPlayers() }, [club?.id])

  const toggleSort = (key: string) =>
    setSort(s => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" })

  const filtered = players
    .filter(p => {
      const q = search.toLowerCase()
      return (p.nombre.toLowerCase().includes(q) || String(p.dorsal ?? "").includes(q)) &&
        (position === "Todos" || p.posicion === position)
    })
    .sort((a, b) => {
      const v = sort.dir === "asc" ? 1 : -1
      let av: any, bv: any
      if (sort.key === "tackles") {
        av = getPlayerStats(a.id, a.posicion).tacklesEfectivos
        bv = getPlayerStats(b.id, b.posicion).tacklesEfectivos
      } else if (sort.key === "metros") {
        av = getPlayerStats(a.id, a.posicion).metrosGanados
        bv = getPlayerStats(b.id, b.posicion).metrosGanados
      } else {
        av = (a as any)[sort.key]
        bv = (b as any)[sort.key]
      }
      if (av == null) return 1
      if (bv == null) return -1
      return av > bv ? v : -v
    })

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Expulsar a ${nombre} del club?`)) return
    const { error } = await supabase.from("miembros").delete().eq("id", id)
    if (error) { alert("Error: " + error.message); return }
    setPlayers(p => p.filter(x => x.id !== id))
  }

  const handleCopy = () => {
    if (!club) return
    navigator.clipboard.writeText(club.codigo_jugador)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const SortIcon = ({ col }: { col: string }) =>
    sort.key === col
      ? sort.dir === "asc" ? <ChevronUp size={12} style={{ color: "var(--primary)" }} /> : <ChevronDown size={12} style={{ color: "var(--primary)" }} />
      : <ChevronUp size={12} style={{ color: "rgba(255,255,255,0.15)" }} />

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center px-6 py-3 border-b shrink-0" style={{ backgroundColor: "var(--background)", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          <span>Apert Vision</span><span style={{ opacity: 0.4 }}>›</span>
          <span style={{ color: "var(--foreground)", fontWeight: 500 }}>Jugadores</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)" }}>Plantel</h1>
            <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              {loading ? "Cargando..." : `${players.length} jugador${players.length === 1 ? "" : "es"} registrado${players.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <button onClick={loadPlayers} disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ backgroundColor: "var(--card)", border: "1px solid rgba(255,255,255,0.07)",
              fontSize: 12, color: "var(--muted-foreground)", cursor: refreshing ? "not-allowed" : "pointer" }}>
            <RefreshCw size={13} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
            Actualizar
          </button>
        </div>

        {/* Invite card */}
        {club && (
          <div className="rounded-xl border p-4 mb-5" style={{
            background: "linear-gradient(135deg, rgba(57,224,122,0.08) 0%, rgba(57,224,122,0.02) 100%)",
            borderColor: "rgba(57,224,122,0.2)"
          }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(57,224,122,0.12)" }}>
                <Share2 size={18} style={{ color: "var(--primary)" }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>Invitar jugadores</div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                  Compartí el código para que se registren desde la app móvil
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-3 rounded-lg font-mono"
                style={{ backgroundColor: "var(--card)", border: "1px solid rgba(255,255,255,0.07)",
                  fontSize: 16, fontWeight: 600, color: "var(--primary)", letterSpacing: "0.1em", textAlign: "center" }}>
                {club.codigo_jugador}
              </div>
              <button onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-3 rounded-lg"
                style={{ backgroundColor: copied ? "rgba(57,224,122,0.15)" : "var(--primary)",
                  color: copied ? "var(--primary)" : "var(--primary-foreground)",
                  border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar código</>}
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && players.length === 0 && (
          <div className="rounded-xl border p-12 text-center" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
            <Users size={40} style={{ color: "var(--muted-foreground)", opacity: 0.4, margin: "0 auto 16px" }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>No hay jugadores todavía</p>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
              Los jugadores aparecen acá cuando se registran usando el código de arriba.
            </p>
          </div>
        )}

        {players.length > 0 && (
          <>
            {/* Filters */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)", maxWidth: 280 }}>
                <Search size={14} style={{ color: "var(--muted-foreground)" }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar jugador..."
                  style={{ background: "none", border: "none", outline: "none", fontSize: 13, color: "var(--foreground)", width: "100%" }} />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {POSITIONS.map(pos => (
                  <button key={pos} onClick={() => setPosition(pos)} style={{
                    fontSize: 12, padding: "5px 12px", borderRadius: 20, cursor: "pointer", border: "1px solid",
                    backgroundColor: position === pos ? "var(--primary)" : "var(--card)",
                    color: position === pos ? "var(--primary-foreground)" : "var(--muted-foreground)",
                    borderColor: position === pos ? "var(--primary)" : "rgba(255,255,255,0.07)",
                  }}>{pos}</button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: "var(--secondary)" }}>
                    {[["#","dorsal"],["Jugador","nombre"],["Posición","posicion"],["Edad","edad"],["Tackles ef.","tackles"],["Metros/pt","metros"]].map(([label, key]) => (
                      <th key={key} onClick={() => toggleSort(key)} className="text-left px-4 py-3 cursor-pointer select-none"
                        style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 500, letterSpacing: "0.05em" }}>
                        <div className="flex items-center gap-1">{label.toUpperCase()}<SortIcon col={key} /></div>
                      </th>
                    ))}
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const stats = getPlayerStats(p.id, p.posicion)
                    return (
                    <tr key={p.id} onClick={() => setSelectedPlayer(p)} className="border-t transition-colors"
                      style={{ borderColor: "rgba(255,255,255,0.06)", backgroundColor: i % 2 === 0 ? "var(--card)" : "transparent", cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--secondary)"}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = i % 2 === 0 ? "var(--card)" : "transparent"}
                      >
                      <td className="px-4 py-3 font-mono" style={{ fontSize: 13, color: "var(--muted-foreground)", width: 48 }}>
                        {p.dorsal ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: hashColor(p.id) + "20", border: `1px solid ${hashColor(p.id)}40` }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: hashColor(p.id) }}>{initials(p.nombre)}</span>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{p.nombre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {p.posicion
                          ? <span className="px-2 py-0.5 rounded font-mono" style={{ fontSize: 11, backgroundColor: "var(--secondary)", color: "var(--muted-foreground)" }}>{p.posicion}</span>
                          : <span style={{ fontSize: 11, color: "var(--muted-foreground)", opacity: 0.5 }}>—</span>
                        }
                      </td>
                      <td className="px-4 py-3 font-mono" style={{ fontSize: 13, color: "var(--foreground)" }}>
                        {p.edad ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="font-mono tabular" style={{ fontSize: 13, fontWeight: 600, color: stats.tacklesEfectivos >= 85 ? "var(--primary)" : "var(--foreground)", minWidth: 32 }}>
                            {stats.tacklesEfectivos}%
                          </div>
                          <div style={{ width: 42, height: 4, borderRadius: 2, backgroundColor: "var(--secondary)", overflow: "hidden" }}>
                            <div style={{ width: `${stats.tacklesEfectivos}%`, height: "100%", backgroundColor: stats.tacklesEfectivos >= 85 ? "var(--primary)" : "#3b82f6" }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp size={11} style={{ color: "#f59e0b" }} />
                          <span className="font-mono tabular" style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>
                            {stats.metrosGanados}
                          </span>
                          <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>m</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={e => { e.stopPropagation(); handleDelete(p.id, p.nombre) }} title="Expulsar del club"
                            className="p-1.5 rounded" style={{ background: "none", border: "none", cursor: "pointer" }}>
                            <Trash2 size={13} style={{ color: "#ef4444" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {selectedPlayer && <PlayerDetailModal player={selectedPlayer} partidosReales={partidosCount} onClose={() => setSelectedPlayer(null)} />}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// Modal de detalle del jugador con stats individuales
// ────────────────────────────────────────────────────────────────
function PlayerDetailModal({ player, partidosReales, onClose }: { player: Miembro; partidosReales: number; onClose: () => void }) {
  const stats = getPlayerStats(player.id, player.posicion)
  const color = hashColor(player.id)
  // Partidos reales del club (los que analizó el entrenador). Si aún no hay ninguno,
  // usamos el fallback determinístico para que la demo no muestre 0.
  const partidosJugados = partidosReales > 0 ? partidosReales : stats.partidosJugados
  // Total absoluto de tackles en la temporada = por partido × partidos
  const tacklesTotalesTemporada = stats.tacklesPorPartido * partidosJugados
  const tacklesEfectivosTotales = Math.round(tacklesTotalesTemporada * stats.tacklesEfectivos / 100)

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div className="rounded-2xl border w-full max-w-md"
        style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}
        onClick={e => e.stopPropagation()}>

        {/* Header con avatar + close */}
        <div className="p-6 border-b relative" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <button onClick={onClose} aria-label="Cerrar"
            className="absolute" style={{ top: 12, right: 12, background: "none", border: "none", cursor: "pointer", padding: 6, color: "var(--muted-foreground)" }}>
            <X size={18} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: color + "20", border: `1px solid ${color}40` }}>
              <span style={{ fontSize: 22, fontWeight: 700, color }}>{initials(player.nombre)}</span>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)" }}>{player.nombre}</div>
              <div className="flex items-center gap-2 mt-1" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                {player.dorsal && <span className="font-mono">#{player.dorsal}</span>}
                {player.posicion && (
                  <>
                    <span style={{ opacity: 0.3 }}>·</span>
                    <span>{player.posicion}</span>
                  </>
                )}
                {player.edad && (
                  <>
                    <span style={{ opacity: 0.3 }}>·</span>
                    <span>{player.edad} años</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded" style={{ backgroundColor: "var(--primary)" }} />
            <span className="font-mono" style={{ fontSize: 10, color: "var(--muted-foreground)", letterSpacing: "0.1em" }}>
              RENDIMIENTO INDIVIDUAL · TEMPORADA
            </span>
          </div>

          {/* Tackles */}
          <div className="rounded-xl p-4" style={{ backgroundColor: "var(--secondary)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield size={14} style={{ color: "#3b82f6" }} />
                <span style={{ fontSize: 13, color: "var(--foreground)" }}>Tackles</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono tabular" style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)" }}>
                  {stats.tacklesPorPartido}
                </span>
                <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>por partido</span>
              </div>
            </div>
            <div style={{ height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
              <div style={{ width: `${stats.tacklesEfectivos}%`, height: "100%", background: stats.tacklesEfectivos >= 85 ? "linear-gradient(90deg,#3b82f6,var(--primary))" : "#3b82f6", transition: "width .3s" }} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                <span className="font-mono tabular" style={{ color: stats.tacklesEfectivos >= 85 ? "var(--primary)" : "#3b82f6", fontWeight: 600 }}>
                  {stats.tacklesEfectivos}%
                </span> efectivos
              </div>
              <div className="font-mono" style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                {tacklesEfectivosTotales} / {tacklesTotalesTemporada} en la temporada
              </div>
            </div>
          </div>

          {/* Metros ganados */}
          <div className="rounded-xl p-4" style={{ backgroundColor: "var(--secondary)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} style={{ color: "#f59e0b" }} />
                <span style={{ fontSize: 13, color: "var(--foreground)" }}>Metros ganados por partido</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono tabular" style={{ fontSize: 22, fontWeight: 700, color: "#f59e0b" }}>{stats.metrosGanados}</span>
                <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>m</span>
              </div>
            </div>
            <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginBottom: 8, lineHeight: 1.4 }}>
              Metros que avanza corriendo con la pelota antes de ser tacleado, patear o pasar.
            </div>
            <div className="grid grid-cols-5 gap-1">
              {Array.from({ length: 10 }, (_, i) => {
                const filled = i < Math.min(10, Math.round(stats.metrosGanados / 15))
                return (
                  <div key={i} style={{ height: 5, borderRadius: 2, backgroundColor: filled ? "#f59e0b" : "rgba(255,255,255,0.05)" }} />
                )
              })}
            </div>
            <div className="font-mono" style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 6, textAlign: "right" }}>
              ≈ {stats.metrosGanados * partidosJugados}m totales en la temporada
            </div>
          </div>

          {/* Partidos jugados — cuenta real del club */}
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "rgba(57,224,122,0.06)", border: "1px solid rgba(57,224,122,0.15)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(57,224,122,0.15)" }}>
              <Zap size={14} style={{ color: "var(--primary)" }} />
            </div>
            <div className="flex-1">
              <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Partidos analizados esta temporada</div>
              <div className="font-mono tabular" style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)" }}>
                {partidosJugados}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
