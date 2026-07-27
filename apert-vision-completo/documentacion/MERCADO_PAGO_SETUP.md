# Setup — Mercado Pago (Sandbox)

Guía paso a paso para dejar operativa la compra de créditos en Apert Vision Desktop.

> **Modo elegido:** Sandbox (test) — se paga con tarjetas de prueba de MP, no cobra plata real. Cuando quieras pasar a producción, cambiás 2 variables de entorno y listo.

---

## 1. Crear la aplicación en Mercado Pago Developers

1. Andá a https://www.mercadopago.com.ar/developers/panel/app
2. Iniciá sesión (o creá cuenta) con tu email personal
3. Click en **Crear aplicación**
4. Nombre: `Apert Vision`
5. Producto: **Checkout Pro** (o "Pagos online")
6. Modelo de integración: **No, no soy un CMS**
7. Al crearla, entrá y anotá dos valores del panel:
   - **Public Key TEST** (arranca con `TEST-`)
   - **Access Token TEST** (arranca con `TEST-`)

> Estas son las credenciales **de test**. Las de producción están en la misma página, pero solo aparecen cuando homologás la aplicación (más adelante).

---

## 2. Ejecutar la migration SQL

En Supabase → **SQL Editor** → **New query** → pegá el contenido de:

```
supabase/migrations/20260727_creditos_mercadopago.sql
```

Y ejecutá. Crea:

- Tabla `planes_creditos` (con los 3 planes)
- Tabla `creditos_movimientos` (libro contable append-only)
- Vista `saldo_creditos`
- Trigger `tr_nuevo_club_credito` (1 crédito gratis al crear club)
- RPC `consumir_credito(club_id, partido_id)`
- RPC `saldo_del_club(club_id)`
- Backfill: da 1 crédito de bienvenida a los clubes que ya existían

Después de ejecutar, verificalo:

```sql
select * from planes_creditos;
select * from saldo_creditos;
```

---

## 3. Configurar las variables de entorno de Supabase

En Supabase → **Project Settings** → **Edge Functions** → **Environment variables**, agregá:

| Variable | Valor |
|---|---|
| `MP_ACCESS_TOKEN` | Tu Access Token TEST (paso 1) |

> `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` ya vienen inyectadas por Supabase — no las agregues manualmente.

---

## 4. Deploy de las Edge Functions

Necesitás Supabase CLI (`npm i -g supabase`). Desde la raíz del monorepo:

```bash
cd apert-vision-completo
supabase login
supabase link --project-ref <tu-project-ref>
supabase functions deploy crear-preferencia-pago
supabase functions deploy webhook-mp --no-verify-jwt
```

> El `--no-verify-jwt` en el webhook es crítico: MP no manda Authorization header cuando notifica.

Verificá:
- `https://<tu-project-ref>.functions.supabase.co/crear-preferencia-pago` → debe responder 401 si le pegás sin token
- `https://<tu-project-ref>.functions.supabase.co/webhook-mp` → debe responder 200 (con "ignored") si le pegás vacío

---

## 5. Configurar el webhook en Mercado Pago

En MP Developers → tu app → **Notificaciones** → **Webhooks** → **Configurar notificaciones**:

- **URL de producción:** (dejá vacío por ahora)
- **URL de pruebas:** `https://<tu-project-ref>.functions.supabase.co/webhook-mp`
- **Eventos:** marcá solo **Pagos** (`payment`)

Click en **Guardar** y después en **Simular** para verificar que llegue un 200 OK.

---

## 6. Tarjetas de prueba para probar el checkout

Cuando el usuario haga click en "Comprar" desde Apert Vision, se abre el checkout de MP. Usá estas tarjetas:

| Marca      | Número               | CVV | Vencimiento | Resultado esperado |
|------------|---------------------|-----|-------------|--------------------|
| Mastercard | `5031 7557 3453 0604` | 123 | 11/30 | **Approved** |
| Visa       | `4509 9535 6623 3704` | 123 | 11/30 | **Approved** |
| Amex       | `3711 8030 3257 522`  | 1234| 11/30 | **Approved** |

**Nombre del titular:** `APRO` (para approved), `OTHE` (para rejected), `CONT` (para pending).

**Docs Argentina:** DNI cualquiera de 8 dígitos.

Docs completos: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/your-integrations/test/cards

---

## 7. Cambiar precios de planes

Los precios se guardan en la tabla `planes_creditos`. Para modificarlos:

```sql
update planes_creditos set precio_ars = 12000 where id = 'plan_1';
```

O desde el Table Editor de Supabase.

---

## 8. Pasar a producción (cuando corresponda)

Solo cambiás:

1. `MP_ACCESS_TOKEN` en las env vars de Supabase → poné el **Access Token PROD** (sin `TEST-`)
2. En la UI Desktop (`Creditos.tsx`), cambiá `data.sandbox_init_point || data.init_point` por solo `data.init_point`
3. Configurá la URL de producción del webhook en MP
4. Homologar la app en MP siguiendo el checklist de MP Developers

---

## Troubleshooting

**"Sin créditos disponibles" pero el pago se procesó:**
- Ver logs de la Edge Function: `supabase functions logs webhook-mp`
- Chequear en la tabla `creditos_movimientos` que se haya insertado el registro con `tipo='compra'`
- Verificar que el `external_reference` haya llegado bien (debe ser JSON válido)

**El webhook no se dispara:**
- MP puede tardar 30s–2min en enviar la notificación en sandbox
- Verificar en MP Developers → Notificaciones que la URL esté bien configurada
- Los reintentos automáticos de MP son 5 veces en 24hs si falla

**"Error al crear preferencia MP":**
- Chequear que `MP_ACCESS_TOKEN` esté seteado en las env vars
- Ver logs: `supabase functions logs crear-preferencia-pago`

---

## Precios actuales (editables en DB)

| Plan | Créditos | USD | ARS |
|------|----------|-----|-----|
| `plan_1`  | 1  | 8    | 10.000  |
| `plan_10` | 10 | 64   | 80.000  |
| `plan_26` | 26 | 164  | 200.000 |

Al crear un club nuevo, se otorga **1 crédito de bienvenida** automáticamente por trigger.
