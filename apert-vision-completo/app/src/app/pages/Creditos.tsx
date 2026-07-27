import { useEffect, useState } from "react"
import {
  CreditCard, Check, Zap, TrendingUp, Star,
  ArrowUpRight, ArrowDownRight, Gift, Clock,
} from "lucide-react"
import { supabase, PlanCreditos, CreditoMovimiento, getSaldoCreditos } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"

const isElectron = typeof window !== "undefined" && !!window.apertAPI

export default function Creditos() {
  const { club, miembro } = useAuth()
  const [planes, setPlanes]           = useState<PlanCreditos[]>([])
  const [movimientos, setMovimientos] = useState<CreditoMovimiento[]>([])
  const [saldo, setSaldo]             = useState<number>(0)
  const [loading, setLoading]         = useState(true)
  const [buyingPlan, setBuyingPlan]   = useState<string | null>(null)
  const [error, setError]             = useState<string | null>(null)

  const load = async () => {
    if (!club) return
    const [{ data: planesData }, { data: movs }, saldoActual] = await Promise.all([
      supabase.from("planes_creditos").select("*").eq("activo", true).order("orden"),
      supabase.from("creditos_movimientos").select("*").eq("club_id", club.id).order("created_at", { ascending: false }).limit(20),
      getSaldoCreditos(club.id),
    ])
    setPlanes(planesData ?? [])
    setMovimientos(movs ?? [])
    setSaldo(saldoActual)
    setLoading(false)
  }

  useEffect(() => { load() }, [club?.id])

  // Realtime: si llega un movimiento nuevo, recargar
  useEffect(() => {
    if (!club) return
    const ch = supabase
      .channel(`movimientos-${club.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "creditos_movimientos", filter: `club_id=eq.${club.id}` },
        () => load(),
      )
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [club?.id])

  const handleComprar = async (plan: PlanCreditos) => {
    if (!club || !miembro) return
    setBuyingPlan(plan.id); setError(null)
    try {
      const { data, error } = await supabase.functions.invoke("crear-preferencia-pago", {
        body: { plan_id: plan.id, club_id: club.id },
      })
      if (error) throw error
      const url = data.sandbox_init_point || data.init_point
      if (!url) throw new Error("Sin URL de checkout")
      // Abrir en browser externo (Electron) o nueva pestaña (dev)
      if (isElectron && window.apertAPI?.openExternal) {
        window.apertAPI.openExternal(url)
      } else {
        window.open(url, "_blank", "noopener,noreferrer")
      }
    } catch (err: any) {
      setError(err.message ?? "Error al iniciar la compra")
    } finally {
      setBuyingPlan(null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b shrink-0"
        style={{ backgroundColor: "var(--background)", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          <span>Apert Vision</span><span style={{ opacity: 0.4 }}>›</span>
          <span style={{ color: "var(--foreground)", fontWeight: 500 }}>Créditos</span>
        </div>
        {club && (
          <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            Conectado a <span style={{ color: "var(--primary)", fontWeight: 500 }}>{club.nombre}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">

        {/* ─── Saldo actual ─────────────────────────────────── */}
        <div className="rounded-xl border p-6"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "rgba(57,224,122,0.2)",
            background: "linear-gradient(135deg, rgba(57,224,122,0.06) 0%, rgba(15,21,32,0) 60%)",
          }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center justify-center"
                  style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "rgba(57,224,122,0.12)" }}>
                  <Zap size={16} style={{ color: "var(--primary)" }} />
                </div>
                <span className="font-mono" style={{ fontSize: 11, color: "var(--muted-foreground)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Saldo actual
                </span>
              </div>
              {loading ? (
                <div style={{ height: 48, width: 100, background: "linear-gradient(90deg, var(--secondary) 0%, var(--accent) 50%, var(--secondary) 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s ease-in-out infinite", borderRadius: 8 }} />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="font-mono tabular" style={{ fontSize: 48, fontWeight: 700, color: "var(--foreground)", lineHeight: 1 }}>
                    {saldo}
                  </span>
                  <span style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
                    crédito{saldo === 1 ? "" : "s"} disponible{saldo === 1 ? "" : "s"}
                  </span>
                </div>
              )}
              <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted-foreground)" }}>
                Cada crédito permite analizar 1 partido completo.
              </div>
            </div>
            <div className="text-right" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
              <div>Partidos analizados: <span className="font-mono tabular" style={{ color: "var(--foreground)" }}>{movimientos.filter(m => m.tipo === "consumo").length}</span></div>
              <div>Compras realizadas: <span className="font-mono tabular" style={{ color: "var(--foreground)" }}>{movimientos.filter(m => m.tipo === "compra").length}</span></div>
            </div>
          </div>
        </div>

        {/* ─── Planes ─────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--foreground)" }}>Comprar más créditos</h2>
            <div className="flex items-center gap-1.5 font-mono" style={{ fontSize: 10, color: "var(--muted-foreground)", letterSpacing: "0.08em" }}>
              <CreditCard size={12} />
              <span>MERCADO PAGO · SANDBOX</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg border"
              style={{ backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)", fontSize: 12, color: "#ef4444" }}>
              {error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            {planes.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                loading={buyingPlan === plan.id}
                disabled={buyingPlan !== null}
                onComprar={() => handleComprar(plan)}
              />
            ))}
          </div>
        </div>

        {/* ─── Historial ─────────────────────────────────── */}
        <div>
          <h2 className="mb-3" style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>
            Historial de movimientos
          </h2>
          <div className="rounded-xl border overflow-hidden"
            style={{ backgroundColor: "var(--card)", borderColor: "rgba(255,255,255,0.07)" }}>
            {loading && (
              <div className="p-6 text-center" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Cargando...</div>
            )}
            {!loading && movimientos.length === 0 && (
              <div className="p-6 text-center" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                Todavía no hay movimientos.
              </div>
            )}
            {!loading && movimientos.map(mov => (
              <MovimientoRow key={mov.id} mov={mov} />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// PlanCard
// ────────────────────────────────────────────────────────────────
function PlanCard({ plan, loading, disabled, onComprar }: {
  plan: PlanCreditos
  loading: boolean
  disabled: boolean
  onComprar: () => void
}) {
  const precioPorCredito = plan.precio_usd / plan.creditos
  const ahorro = plan.creditos > 1
    ? Math.round((1 - precioPorCredito / 8) * 100)
    : 0

  return (
    <div className="relative rounded-xl border p-6 transition-all"
      style={{
        backgroundColor: "var(--card)",
        borderColor: plan.destacado ? "rgba(57,224,122,0.4)" : "rgba(255,255,255,0.07)",
        transform: plan.destacado ? "scale(1.02)" : "none",
        boxShadow: plan.destacado ? "0 10px 30px rgba(57,224,122,0.08)" : "none",
      }}>

      {plan.destacado && (
        <div className="absolute flex items-center gap-1 px-2 py-1 rounded-full font-mono"
          style={{
            top: -10, left: "50%", transform: "translateX(-50%)",
            backgroundColor: "var(--primary)", color: "var(--primary-foreground)",
            fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
          }}>
          <Star size={9} strokeWidth={3} /> MÁS ELEGIDO
        </div>
      )}

      <div className="mb-4">
        <div style={{ fontSize: 11, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
          {plan.nombre}
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-mono tabular" style={{ fontSize: 32, fontWeight: 700, color: plan.destacado ? "var(--primary)" : "var(--foreground)", lineHeight: 1 }}>
            {plan.creditos}
          </span>
          <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            partido{plan.creditos === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="pb-4 mb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-baseline gap-1">
          <span className="font-mono tabular" style={{ fontSize: 28, fontWeight: 700, color: "var(--foreground)" }}>
            US$ {plan.precio_usd}
          </span>
        </div>
        <div className="font-mono" style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 4 }}>
          ~ AR$ {Number(plan.precio_ars).toLocaleString("es-AR")}
        </div>
        {ahorro > 0 && (
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono"
            style={{ backgroundColor: "rgba(57,224,122,0.1)", color: "var(--primary)", fontSize: 10, fontWeight: 600 }}>
            <TrendingUp size={10} /> Ahorrás {ahorro}%
          </div>
        )}
      </div>

      <ul className="space-y-2 mb-5" style={{ fontSize: 12 }}>
        <li className="flex items-start gap-2">
          <Check size={13} style={{ color: "var(--primary)", marginTop: 2, flexShrink: 0 }} strokeWidth={2.5} />
          <span style={{ color: "var(--muted-foreground)" }}>
            US$ {precioPorCredito.toFixed(2)} por partido
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Check size={13} style={{ color: "var(--primary)", marginTop: 2, flexShrink: 0 }} strokeWidth={2.5} />
          <span style={{ color: "var(--muted-foreground)" }}>
            Análisis con IA (Line-outs, Scrums, Salidas)
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Check size={13} style={{ color: "var(--primary)", marginTop: 2, flexShrink: 0 }} strokeWidth={2.5} />
          <span style={{ color: "var(--muted-foreground)" }}>
            Sin vencimiento — usalos cuando quieras
          </span>
        </li>
      </ul>

      <button
        onClick={onComprar}
        disabled={disabled}
        style={{
          width: "100%", height: 42,
          backgroundColor: plan.destacado ? "var(--primary)" : "transparent",
          color: plan.destacado ? "var(--primary-foreground)" : "var(--foreground)",
          border: plan.destacado ? "none" : "1px solid rgba(255,255,255,0.15)",
          borderRadius: 8, fontSize: 13, fontWeight: 600,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled && !loading ? 0.5 : 1,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
        {loading ? "Abriendo checkout..." : "Comprar ahora"}
      </button>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// MovimientoRow
// ────────────────────────────────────────────────────────────────
function MovimientoRow({ mov }: { mov: CreditoMovimiento }) {
  const isPositivo = mov.cantidad > 0
  const Icon = mov.tipo === "bienvenida" ? Gift
    : mov.tipo === "compra"     ? ArrowUpRight
    : mov.tipo === "consumo"    ? ArrowDownRight
    : Clock

  const iconColor = isPositivo ? "var(--primary)" : "#f59e0b"
  const iconBg    = isPositivo ? "rgba(57,224,122,0.1)" : "rgba(245,158,11,0.1)"

  return (
    <div className="flex items-center gap-3 px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div className="flex items-center justify-center shrink-0"
        style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: iconBg }}>
        <Icon size={15} style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="truncate" style={{ fontSize: 13, color: "var(--foreground)", fontWeight: 500 }}>
          {mov.descripcion ?? mov.tipo}
        </div>
        <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          {new Date(mov.created_at).toLocaleString("es-AR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          {mov.mp_payment_id && <span className="font-mono ml-2" style={{ opacity: 0.6 }}>· MP #{mov.mp_payment_id.slice(-6)}</span>}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-mono tabular" style={{ fontSize: 14, fontWeight: 600, color: iconColor }}>
          {isPositivo ? "+" : ""}{mov.cantidad}
        </div>
        {mov.monto_ars && (
          <div className="font-mono" style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
            AR$ {Number(mov.monto_ars).toLocaleString("es-AR")}
          </div>
        )}
      </div>
    </div>
  )
}
