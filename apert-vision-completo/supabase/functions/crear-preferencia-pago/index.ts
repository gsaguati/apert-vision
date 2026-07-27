// ═══════════════════════════════════════════════════════════════════════════
// Edge Function: crear-preferencia-pago
// Recibe: { plan_id, club_id }
// Devuelve: { init_point, sandbox_init_point, preference_id }
// ═══════════════════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })

  try {
    const { plan_id, club_id } = await req.json()

    if (!plan_id || !club_id) {
      return json({ error: "plan_id y club_id requeridos" }, 400)
    }

    // ── 1) Auth: el que llama debe ser entrenador del club ─────────────
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) return json({ error: "No autorizado" }, 401)

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) return json({ error: "Sesión inválida" }, 401)

    const { data: miembro } = await supabase
      .from("miembros")
      .select("id, club_id, rol, nombre")
      .eq("auth_user_id", user.id)
      .eq("club_id", club_id)
      .maybeSingle()

    if (!miembro || miembro.rol !== "entrenador") {
      return json({ error: "Solo entrenadores pueden comprar créditos" }, 403)
    }

    // ── 2) Traer el plan ────────────────────────────────────────────────
    const { data: plan } = await supabase
      .from("planes_creditos")
      .select("id, nombre, creditos, precio_ars, precio_usd")
      .eq("id", plan_id)
      .eq("activo", true)
      .maybeSingle()

    if (!plan) return json({ error: "Plan no encontrado" }, 404)

    // ── 3) Crear preference en Mercado Pago ────────────────────────────
    const accessToken = Deno.env.get("MP_ACCESS_TOKEN")
    if (!accessToken) return json({ error: "MP_ACCESS_TOKEN no configurado" }, 500)

    const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/webhook-mp`

    const preferencePayload = {
      items: [{
        id:          plan.id,
        title:       `Apert Vision — ${plan.nombre}`,
        description: `${plan.creditos} crédito${plan.creditos === 1 ? "" : "s"} para análisis de partidos`,
        quantity:    1,
        currency_id: "ARS",
        unit_price:  Number(plan.precio_ars),
      }],
      payer: {
        name:  miembro.nombre,
        email: user.email,
      },
      external_reference: JSON.stringify({
        club_id,
        plan_id,
        miembro_id: miembro.id,
        creditos:   plan.creditos,
      }),
      back_urls: {
        success: "https://apert-vision.com/pago/exito",
        pending: "https://apert-vision.com/pago/pendiente",
        failure: "https://apert-vision.com/pago/error",
      },
      auto_return:      "approved",
      notification_url: webhookUrl,
      statement_descriptor: "APERTVISION",
      metadata: { club_id, plan_id, source: "apert-vision-desktop" },
    }

    const mpResp = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preferencePayload),
    })

    if (!mpResp.ok) {
      const errBody = await mpResp.text()
      console.error("MP error:", mpResp.status, errBody)
      return json({ error: "Error al crear preferencia MP", detail: errBody }, 502)
    }

    const pref = await mpResp.json()

    return json({
      preference_id:      pref.id,
      init_point:         pref.init_point,          // producción
      sandbox_init_point: pref.sandbox_init_point,  // test
      plan: {
        id:       plan.id,
        nombre:   plan.nombre,
        creditos: plan.creditos,
        precio_ars: plan.precio_ars,
        precio_usd: plan.precio_usd,
      },
    })

  } catch (err) {
    console.error("crear-preferencia-pago error:", err)
    return json({ error: (err as Error).message }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  })
}
