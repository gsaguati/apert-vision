// ═══════════════════════════════════════════════════════════════════════════
// Edge Function: webhook-mp
// Recibe notificaciones de Mercado Pago cuando cambia el estado de un pago.
// Al recibir "payment.approved", inserta el movimiento de créditos del plan
// correspondiente (usando external_reference que mandamos en la preference).
//
// Endpoint público — configurar en https://apert-vision.com/functions/webhook-mp
// o directo en el panel de la aplicación de Mercado Pago.
// ═══════════════════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

Deno.serve(async (req) => {
  try {
    // Mercado Pago manda POST — puede ser body JSON o query params
    let paymentId: string | null = null
    let topic: string | null = null

    const url = new URL(req.url)
    topic     = url.searchParams.get("topic") ?? url.searchParams.get("type")
    paymentId = url.searchParams.get("id") ?? url.searchParams.get("data.id")

    if (!paymentId && req.method === "POST") {
      try {
        const body = await req.json()
        topic     = body.type ?? body.topic ?? topic
        paymentId = body.data?.id ?? body.id ?? paymentId
      } catch {
        // Body vacío — usar solo query params
      }
    }

    console.log("webhook-mp recibido:", { topic, paymentId })

    // Solo nos importan los payment notifications
    if (topic !== "payment" || !paymentId) {
      return new Response("ignored", { status: 200 })
    }

    // ── 1) Consultar el pago en la API de MP ────────────────────────────
    const accessToken = Deno.env.get("MP_ACCESS_TOKEN")
    if (!accessToken) {
      console.error("MP_ACCESS_TOKEN no configurado")
      return new Response("config error", { status: 500 })
    }

    const paymentResp = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { "Authorization": `Bearer ${accessToken}` } },
    )

    if (!paymentResp.ok) {
      console.error("MP payment fetch failed:", paymentResp.status)
      return new Response("mp fetch failed", { status: 502 })
    }

    const payment = await paymentResp.json()
    const status  = payment.status  // approved | pending | rejected | ...
    const extRef  = payment.external_reference  // JSON con { club_id, plan_id, creditos, ... }

    if (!extRef) {
      console.error("Sin external_reference en el payment")
      return new Response("missing external_reference", { status: 400 })
    }

    let ref: { club_id: string; plan_id: string; miembro_id: string; creditos: number }
    try {
      ref = JSON.parse(extRef)
    } catch {
      console.error("external_reference no es JSON válido:", extRef)
      return new Response("bad external_reference", { status: 400 })
    }

    // ── 2) Cliente con service_role (bypassea RLS) ──────────────────────
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    )

    // ── 3) Idempotencia: ¿ya procesamos este payment? ───────────────────
    const { data: existente } = await admin
      .from("creditos_movimientos")
      .select("id, mp_status")
      .eq("mp_payment_id", String(paymentId))
      .maybeSingle()

    if (existente) {
      console.log(`Payment ${paymentId} ya procesado (mov ${existente.id})`)
      return new Response("already processed", { status: 200 })
    }

    // ── 4) Solo procesamos pagos APPROVED ───────────────────────────────
    if (status !== "approved") {
      console.log(`Payment ${paymentId} status=${status}, no se suman créditos`)
      return new Response("not approved", { status: 200 })
    }

    // ── 5) Insertar movimiento de compra ────────────────────────────────
    const { error: insertErr } = await admin
      .from("creditos_movimientos")
      .insert({
        club_id:       ref.club_id,
        tipo:          "compra",
        cantidad:      ref.creditos,
        descripcion:   `Compra de ${ref.creditos} crédito${ref.creditos === 1 ? "" : "s"} (${ref.plan_id})`,
        plan_id:       ref.plan_id,
        mp_payment_id: String(paymentId),
        mp_status:     status,
        monto_ars:     payment.transaction_amount,
        creado_por:    ref.miembro_id,
      })

    if (insertErr) {
      console.error("Insert error:", insertErr)
      return new Response("insert failed", { status: 500 })
    }

    console.log(`✓ ${ref.creditos} créditos acreditados al club ${ref.club_id}`)
    return new Response("ok", { status: 200 })

  } catch (err) {
    console.error("webhook-mp error:", err)
    return new Response("internal error", { status: 500 })
  }
})
