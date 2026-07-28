-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Tabla estadisticas_jugador — persiste las stats individuales
-- Fecha:     2026-07-28
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Cada jugador tiene UNA fila con sus stats de temporada.
-- La primera vez que la app las necesita, si la fila no existe, el cliente
-- las calcula (con el helper determinístico) y hace INSERT — a partir de
-- ahí quedan persistidas y se leen de la DB.

create table if not exists estadisticas_jugador (
  jugador_id                 uuid primary key references miembros(id) on delete cascade,
  tackles_por_partido        int not null check (tackles_por_partido between 0 and 40),
  tackles_efectivos_pct      int not null check (tackles_efectivos_pct between 0 and 100),
  metros_ganados_por_partido int not null check (metros_ganados_por_partido between 0 and 300),
  actualizado_en             timestamptz default now()
);

comment on table  estadisticas_jugador is 'Estadísticas individuales de temporada por jugador';
comment on column estadisticas_jugador.tackles_por_partido        is 'Promedio de tackles intentados por partido';
comment on column estadisticas_jugador.tackles_efectivos_pct      is 'Porcentaje de tackles completados exitosamente (0-100)';
comment on column estadisticas_jugador.metros_ganados_por_partido is 'Metros que avanza corriendo con la pelota por partido';

alter table estadisticas_jugador enable row level security;

-- ── SELECT: cualquier miembro del club del jugador puede ver sus stats ────
drop policy if exists "ver_stats_del_club" on estadisticas_jugador;
create policy "ver_stats_del_club" on estadisticas_jugador for select
  using (
    jugador_id in (
      select m.id from miembros m
      where m.club_id in (
        select club_id from miembros where auth_user_id = auth.uid()
      )
    )
  );

-- ── INSERT / UPDATE: idem — cualquier miembro del club puede upsert ──────
-- (permitimos el auto-populate desde cualquier device del club)
drop policy if exists "upsert_stats_del_club" on estadisticas_jugador;
create policy "upsert_stats_del_club" on estadisticas_jugador
  for all
  using (
    jugador_id in (
      select m.id from miembros m
      where m.club_id in (
        select club_id from miembros where auth_user_id = auth.uid()
      )
    )
  )
  with check (
    jugador_id in (
      select m.id from miembros m
      where m.club_id in (
        select club_id from miembros where auth_user_id = auth.uid()
      )
    )
  );

-- ── Trigger para mantener actualizado_en ──────────────────────────────────
create or replace function tocar_actualizado_estadisticas()
returns trigger language plpgsql as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

drop trigger if exists tr_touch_estadisticas on estadisticas_jugador;
create trigger tr_touch_estadisticas
  before update on estadisticas_jugador
  for each row execute function tocar_actualizado_estadisticas();

-- ── Realtime (opcional) — permite que el club vea cambios en vivo ────────
alter publication supabase_realtime add table estadisticas_jugador;
