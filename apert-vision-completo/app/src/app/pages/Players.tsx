import { useState } from "react"
import { Plus, Search, Edit2, Trash2, ChevronUp, ChevronDown, Users } from "lucide-react"

interface Player {
  id: number; name: string; number: number; position: string; age: number; matches: number; lineouts: number
}

const POSITIONS = ["Todos","Pilier","Hooker","Lock","Flanker","Nº 8","Medio Scrum","Apertura","Wing","Centro","Fullback"]
const STORAGE_KEY = "apert_players"

function loadPlayers(): Player[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
}
function savePlayers(players: Player[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players))
}

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = ["#39e07a","#3b82f6","#f59e0b","#a855f7","#ef4444","#06b6d4","#ec4899","#14b8a6"]

export default function Players() {
  const [players, setPlayers] = useState<Player[]>(loadPlayers)
  const [search, setSearch]   = useState("")
  const [position, setPosition] = useState("Todos")
  const [showAdd, setShowAdd]   = useState(false)
  const [editId, setEditId]     = useState<number | null>(null)
  const [newPlayer, setNewPlayer] = useState({ name: "", number: "", position: "Pilier", age: "" })
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" }>({ key: "number", dir: "asc" })

  const toggleSort = (key: string) =>
    setSort(s => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" })

  const filtered = players
    .filter(p => {
      const q = search.toLowerCase()
      return (p.name.toLowerCase().includes(q) || String(p.number).includes(q)) &&
        (position === "Todos" || p.position === position)
    })
    .sort((a, b) => {
      const v = sort.dir === "asc" ? 1 : -1
      return (a as any)[sort.key] > (b as any)[sort.key] ? v : -v
    })

  const handleAdd = () => {
    if (!newPlayer.name || !newPlayer.number) return
    const p: Player = {
      id: Date.now(), name: newPlayer.name, number: Number(newPlayer.number),
      position: newPlayer.position, age: Number(newPlayer.age) || 20, matches: 0, lineouts: 0,
    }
    const updated = [...players, p].sort((a, b) => a.number - b.number)
    setPlayers(updated); savePlayers(updated)
    setNewPlayer({ name: "", number: "", position: "Pilier", age: "" })
    setShowAdd(false)
  }

  const handleDelete = (id: number) => {
    const updated = players.filter(p => p.id !== id)
    setPlayers(updated); savePlayers(updated)
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--secondary)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "var(--foreground)", outline: "none",
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
            <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{players.length} jugadores registrados</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer" }}>
            <Plus size={15} /> Agregar jugador
          </button>
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="rounded-xl border p-4 mb-5 grid grid-cols-5 gap-3" style={{ backgroundColor: "var(--card)", borderColor: "var(--primary)", borderWidth: 1 }}>
            <input className="col-span-2" style={inputStyle} placeholder="Nombre completo *" value={newPlayer.name} onChange={e => setNewPlayer(p => ({ ...p, name: e.target.value }))} />
            <input type="number" style={inputStyle} placeholder="Nº dorsal *" value={newPlayer.number} onChange={e => setNewPlayer(p => ({ ...p, number: e.target.value }))} />
            <input type="number" style={inputStyle} placeholder="Edad" value={newPlayer.age} onChange={e => setNewPlayer(p => ({ ...p, age: e.target.value }))} />
            <select style={inputStyle} value={newPlayer.position} onChange={e => setNewPlayer(p => ({ ...p, position: e.target.value }))}>
              {POSITIONS.slice(1).map(pos => <option key={pos}>{pos}</option>)}
            </select>
            <div className="col-span-5 flex gap-2 justify-end">
              <button onClick={() => setShowAdd(false)} style={{ fontSize: 13, color: "var(--muted-foreground)", padding: "6px 12px", background: "none", border: "none", cursor: "pointer" }}>Cancelar</button>
              <button onClick={handleAdd} style={{ ...inputStyle, padding: "6px 16px", backgroundColor: "var(--primary)", color: "var(--primary-foreground)", fontWeight: 500, cursor: "pointer" }}>Guardar jugador</button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {players.length === 0 && !showAdd && (
          <div className="rounded-xl border p-12 text-center" style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
            <Users size={40} style={{ color: "var(--muted-foreground)", opacity: 0.4, margin: "0 auto 16px" }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>No hay jugadores registrados</p>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 20 }}>Agregá los jugadores de tu plantel para hacer seguimiento de sus estadísticas.</p>
            <button onClick={() => setShowAdd(true)} style={{ padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, backgroundColor: "var(--primary)", color: "var(--primary-foreground)", border: "none", cursor: "pointer" }}>
              Agregar primer jugador
            </button>
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
                    {[["#","number"],["Jugador","name"],["Posición","position"],["Edad","age"],["Partidos","matches"],["Line-outs","lineouts"]].map(([label, key]) => (
                      <th key={key} onClick={() => toggleSort(key)} className="text-left px-4 py-3 cursor-pointer select-none"
                        style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 500, letterSpacing: "0.05em" }}>
                        <div className="flex items-center gap-1">{label.toUpperCase()}<SortIcon col={key} /></div>
                      </th>
                    ))}
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p.id} className="border-t transition-colors hover:bg-accent"
                      style={{ borderColor: "rgba(255,255,255,0.06)", backgroundColor: i % 2 === 0 ? "var(--card)" : "transparent" }}>
                      <td className="px-4 py-3 font-mono" style={{ fontSize: 13, color: "var(--muted-foreground)", width: 48 }}>{p.number}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: AVATAR_COLORS[p.id % AVATAR_COLORS.length] + "20", border: `1px solid ${AVATAR_COLORS[p.id % AVATAR_COLORS.length]}40` }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: AVATAR_COLORS[p.id % AVATAR_COLORS.length] }}>{initials(p.name)}</span>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded font-mono" style={{ fontSize: 11, backgroundColor: "var(--secondary)", color: "var(--muted-foreground)" }}>{p.position}</span>
                      </td>
                      <td className="px-4 py-3 font-mono" style={{ fontSize: 13, color: "var(--foreground)" }}>{p.age}</td>
                      <td className="px-4 py-3 font-mono" style={{ fontSize: 13, color: "var(--foreground)" }}>{p.matches}</td>
                      <td className="px-4 py-3"><span className="font-mono" style={{ fontSize: 13, color: "var(--primary)", fontWeight: 500 }}>{p.lineouts}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button className="p-1.5 rounded transition-colors hover:bg-secondary" style={{ background: "none", border: "none", cursor: "pointer" }}>
                            <Edit2 size={13} style={{ color: "var(--muted-foreground)" }} />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded" style={{ background: "none", border: "none", cursor: "pointer" }}>
                            <Trash2 size={13} style={{ color: "#ef4444" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
