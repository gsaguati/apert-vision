-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Sistema de créditos + integración Mercado Pago
-- Fecha:     2026-07-27
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1) Tabla de planes disponibles ────────────────────────────────────────
create table if not exists planes_creditos (
  id           text primary key,
  nombre       text not null,
  creditos     int  not null,
  precio_usd   numeric(10, 2) not null,
  precio_ars   numeric(12, 2) not null,
  destacado    boolean default false,
  orden        int default 0,
  activo       boolean default true,
  created_at   timestamptz default now()
);

insert into planes_creditos (id, nombre, creditos, precio_usd, precio_ars, destacado, orden)
values
  ('plan_1',  'Un partido',       1,  8.00,   10000.00, false, 1),
  ('plan_10', 'Diez partidos',    10, 64.00,  80000.00, true,  2),
  ('plan_26', 'Temporada corta',  26, 164.00, 200000.00, false, 3)
on conflict (id) do update set
  nombre     = excluded.nombre,
  creditos   = excluded.creditos,
  precio_usd = excluded.precio_usd,
  precio_ars = excluded.precio_ars,
  destacado  = excluded.destacado,
  orden      = excluded.orden;

alter table planes_creditos enable row level security;

drop policy if exists "ver_planes_todos" on planes_creditos;
create policy "ver_planes_todos" on planes_creditos for select
  using (activo = true);

-- ── 2) Movimientos de créditos (libro contable append-only) ───────────────
create table if not exists creditos_movimientos (
  id             uuid primary key default gen_random_uuid(),
  club_id        uuid references clubes(id) on delete cascade not null,
  tipo           text not null check (tipo in ('bienvenida', 'compra', 'consumo', 'ajuste')),
  cantidad       int  not null,
  descripcion    text,
  plan_id        text references planes_creditos(id),
  mp_payment_id  text unique,
  mp_status      text,
  monto_ars      numeric(12, 2),
  monto_usd      numeric(10, 2),
  partido_id     uuid references partidos(id) on delete set null,
  creado_por     uuid references miembros(id),
  created_at     timestamptz default now()
);

create index if not exists idx_movimientos_club     on creditos_movimientos (club_id, created_at desc);
create index if not exists idx_movimientos_partido  on creditos_movimientos (partido_id);

alter table creditos_movimientos enable row level security;

drop policy if exists "ver_movimientos_club" on creditos_movimientos;
create policy "ver_movimientos_club" on creditos_movimientos for select
  using (
    club_id in (
      select club_id from miembros where auth_user_id = auth.uid()
    )
  );

-- No insert desde el cliente — solo desde Edge Functions con service_role
-- (que bypassea RLS). Sin policy de insert, nadie desde el cliente puede meter.

-- ── 3) Vista de saldo ─────────────────────────────────────────────────────
create or replace view saldo_creditos as
select
  c.id as club_id,
  c.nombre as club_nombre,
  coalesce(sum(m.cantidad), 0)::int as saldo,
  count(m.id) filter (where m.tipo = 'consumo')::int as partidos_consumidos,
  count(m.id) filter (where m.tipo = 'compra')::int  as compras_realizadas
from clubes c
left join creditos_movimientos m on m.club_id = c.id
group by c.id, c.nombre;

grant select on saldo_creditos to anon, authenticated;

-- ── 4) Trigger: al crear club, otorgar 1 crédito de bienvenida ─────────────
create or replace function otorgar_credito_bienvenida()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into creditos_movimientos (club_id, tipo, cantidad, descripcion)
  values (new.id, 'bienvenida', 1, 'Crédito de bienvenida — primer partido gratis');
  return new;
end;
$$;

drop trigger if exists tr_nuevo_club_credito on clubes;
create trigger tr_nuevo_club_credito
  after insert on clubes
  for each row execute function otorgar_credito_bienvenida();

-- ── 5) RPC: consumir_credito (llamado al terminar el análisis) ────────────
create or replace function consumir_credito(
  p_club_id    uuid,
  p_partido_id uuid default null
)
returns table (nuevo_saldo int, movimiento_id uuid)
language plpgsql
security definer
as $$
declare
  v_saldo int;
  v_miembro_id uuid;
  v_nuevo_id uuid;
begin
  -- Validar: el usuario debe ser miembro del club (entrenador)
  select id into v_miembro_id
  from miembros
  where auth_user_id = auth.uid()
    and club_id      = p_club_id
    and rol          = 'entrenador'
  limit 1;

  if v_miembro_id is null then
    raise exception 'No autorizado: solo entrenadores del club pueden consumir créditos';
  end if;

  -- Verificar saldo
  select saldo into v_saldo from saldo_creditos where club_id = p_club_id;

  if coalesce(v_saldo, 0) < 1 then
    raise exception 'Sin créditos disponibles. Comprá un plan para seguir analizando partidos.';
  end if;

  -- Insertar consumo
  insert into creditos_movimientos (club_id, tipo, cantidad, descripcion, partido_id, creado_por)
  values (p_club_id, 'consumo', -1, 'Consumo por análisis de partido', p_partido_id, v_miembro_id)
  returning id into v_nuevo_id;

  return query
    select saldo, v_nuevo_id from saldo_creditos where club_id = p_club_id;
end;
$$;

grant execute on function consumir_credito(uuid, uuid) to authenticated;

-- ── 6) RPC: saldo_del_club (helper conveniente) ───────────────────────────
create or replace function saldo_del_club(p_club_id uuid)
returns int
language sql
security definer
as $$
  select coalesce(saldo, 0)::int from saldo_creditos where club_id = p_club_id;
$$;

grant execute on function saldo_del_club(uuid) to authenticated;

-- ── 7) Backfill: darle 1 crédito a los clubes existentes que no tengan ────
insert into creditos_movimientos (club_id, tipo, cantidad, descripcion)
select c.id, 'bienvenida', 1, 'Crédito de bienvenida retroactivo'
from clubes c
where not exists (
  select 1 from creditos_movimientos m
  where m.club_id = c.id and m.tipo = 'bienvenida'
);

-- ── 8) Realtime: habilitar publicación para que el cliente reciba INSERTS ─
-- Necesario para que el badge del sidebar y la página de créditos se actualicen
-- solos cuando el webhook de MP suma créditos.
alter publication supabase_realtime add table creditos_movimientos;
