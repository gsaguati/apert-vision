-- ═══════════════════════════════════════════════════════════════
-- Super Admin — visibilidad y control total de la plataforma
-- ═══════════════════════════════════════════════════════════════
--
-- Agrega un rol "super admin" gestionado por una tabla dedicada
-- (public.super_admins) más policies extra en todas las tablas que
-- se SUMAN a las existentes (no las reemplazan). También expone
-- un set de RPCs para gestionar la plataforma desde el panel /admin.
--
-- Todo es idempotente — se puede re-ejecutar sin efectos secundarios.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1) Tabla super_admins ─────────────────────────────────────
create table if not exists public.super_admins (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  nombre       text,
  created_at   timestamptz default now()
);

alter table public.super_admins enable row level security;

drop policy if exists "propio_super_admin_lee" on public.super_admins;
create policy "propio_super_admin_lee"
  on public.super_admins for select
  using (auth_user_id = auth.uid());

-- ─── 2) Helper: is_super_admin() ───────────────────────────────
create or replace function public.is_super_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.super_admins where auth_user_id = auth.uid());
$$;

grant execute on function public.is_super_admin() to authenticated;

-- ─── 3) Policies extra: super admin ve TODO (aditivas) ─────────
drop policy if exists "super_admin_all_clubes"       on public.clubes;
drop policy if exists "super_admin_all_miembros"     on public.miembros;
drop policy if exists "super_admin_all_partidos"    on public.partidos;
drop policy if exists "super_admin_all_eventos"     on public.eventos;
drop policy if exists "super_admin_all_clips"       on public.clips;
drop policy if exists "super_admin_all_creditos_mov" on public.creditos_movimientos;
drop policy if exists "super_admin_all_estad"       on public.estadisticas_jugador;

create policy "super_admin_all_clubes"       on public.clubes               as permissive for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy "super_admin_all_miembros"     on public.miembros             as permissive for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy "super_admin_all_partidos"    on public.partidos             as permissive for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy "super_admin_all_eventos"     on public.eventos              as permissive for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy "super_admin_all_clips"       on public.clips                as permissive for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy "super_admin_all_creditos_mov" on public.creditos_movimientos as permissive for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy "super_admin_all_estad"       on public.estadisticas_jugador as permissive for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ─── 4) RPCs de admin ──────────────────────────────────────────

-- 4.1) Listar todos los clubes con métricas
create or replace function public.admin_listar_clubes()
returns table (
  id uuid, nombre text, created_at timestamptz,
  cant_miembros bigint, cant_entrenadores bigint, cant_jugadores bigint,
  cant_partidos bigint, saldo_creditos bigint
)
language sql stable security definer set search_path = public
as $$
  select c.id, c.nombre, c.created_at,
    (select count(*) from miembros m where m.club_id = c.id) as cant_miembros,
    (select count(*) from miembros m where m.club_id = c.id and m.rol = 'entrenador') as cant_entrenadores,
    (select count(*) from miembros m where m.club_id = c.id and m.rol = 'jugador') as cant_jugadores,
    (select count(*) from partidos p where p.club_id = c.id) as cant_partidos,
    coalesce((select sum(cantidad) from creditos_movimientos cm where cm.club_id = c.id), 0)::bigint
  from clubes c
  where public.is_super_admin()
  order by c.created_at desc;
$$;
grant execute on function public.admin_listar_clubes() to authenticated;

-- 4.2) Estadísticas globales
create or replace function public.admin_estadisticas_globales()
returns table (
  total_clubes bigint, total_miembros bigint, total_partidos bigint,
  total_clips bigint, total_eventos bigint,
  creditos_emitidos bigint, creditos_consumidos bigint, monto_ars_total numeric
)
language sql stable security definer set search_path = public
as $$
  select
    (select count(*) from clubes),
    (select count(*) from miembros),
    (select count(*) from partidos),
    (select count(*) from clips),
    (select count(*) from eventos),
    coalesce((select sum(cantidad) from creditos_movimientos where cantidad > 0), 0)::bigint,
    coalesce((select -sum(cantidad) from creditos_movimientos where cantidad < 0), 0)::bigint,
    coalesce((select sum(monto_ars) from creditos_movimientos where monto_ars is not null), 0)::numeric
  where public.is_super_admin();
$$;
grant execute on function public.admin_estadisticas_globales() to authenticated;

-- 4.3) Listar movimientos de créditos recientes (todos los clubes)
create or replace function public.admin_listar_movimientos(p_limit int default 50)
returns table (
  id uuid, club_id uuid, club_nombre text, tipo text, cantidad int,
  descripcion text, monto_ars numeric, mp_status text, created_at timestamptz
)
language sql stable security definer set search_path = public
as $$
  select cm.id, cm.club_id, c.nombre, cm.tipo, cm.cantidad, cm.descripcion,
         cm.monto_ars, cm.mp_status, cm.created_at
  from creditos_movimientos cm
  join clubes c on c.id = cm.club_id
  where public.is_super_admin()
  order by cm.created_at desc
  limit p_limit;
$$;
grant execute on function public.admin_listar_movimientos(int) to authenticated;

-- 4.4) Listar miembros con datos de club y email
create or replace function public.admin_listar_miembros()
returns table (
  id uuid, auth_user_id uuid, nombre text, rol text,
  club_id uuid, club_nombre text,
  dorsal int, posicion text, edad int, email text
)
language sql stable security definer set search_path = public
as $$
  select m.id, m.auth_user_id, m.nombre, m.rol, m.club_id, c.nombre,
         m.dorsal, m.posicion, m.edad, u.email::text
  from miembros m
  join clubes c on c.id = m.club_id
  left join auth.users u on u.id = m.auth_user_id
  where public.is_super_admin()
  order by c.nombre, m.rol, m.nombre;
$$;
grant execute on function public.admin_listar_miembros() to authenticated;

-- 4.5) Ajustar créditos manualmente (tipo 'ajuste')
create or replace function public.admin_ajustar_creditos(
  p_club_id uuid, p_cantidad int, p_motivo text
) returns uuid
language plpgsql security definer set search_path = public
as $$
declare v_id uuid;
begin
  if not public.is_super_admin() then raise exception 'No autorizado'; end if;
  insert into creditos_movimientos (club_id, tipo, cantidad, descripcion, creado_por)
  values (p_club_id, 'ajuste', p_cantidad, coalesce(p_motivo, 'Ajuste manual del super admin'), null)
  returning id into v_id;
  return v_id;
end;
$$;
grant execute on function public.admin_ajustar_creditos(uuid, int, text) to authenticated;

-- 4.6) Eliminar un club en cascada (miembros, partidos, eventos, clips, movimientos)
create or replace function public.admin_eliminar_club(p_club_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_super_admin() then raise exception 'No autorizado'; end if;
  delete from creditos_movimientos where club_id = p_club_id;
  delete from clips where partido_id in (select id from partidos where club_id = p_club_id);
  delete from eventos where partido_id in (select id from partidos where club_id = p_club_id);
  delete from estadisticas_jugador where jugador_id in (select id from miembros where club_id = p_club_id);
  delete from partidos where club_id = p_club_id;
  delete from miembros where club_id = p_club_id;
  delete from clubes where id = p_club_id;
end;
$$;
grant execute on function public.admin_eliminar_club(uuid) to authenticated;

-- 4.7) Eliminar un miembro específico
create or replace function public.admin_eliminar_miembro(p_miembro_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_super_admin() then raise exception 'No autorizado'; end if;
  delete from estadisticas_jugador where jugador_id = p_miembro_id;
  delete from miembros where id = p_miembro_id;
end;
$$;
grant execute on function public.admin_eliminar_miembro(uuid) to authenticated;

-- 4.8) Crear miembro (crea auth.users si no existe + inserta en miembros)
-- Nota: pgcrypto vive en el schema `extensions` en Supabase → hay que incluirlo en el search_path
create or replace function public.admin_crear_miembro(
  p_club_id  uuid,
  p_email    text,
  p_password text,
  p_nombre   text,
  p_rol      text,
  p_dorsal   int  default null,
  p_posicion text default null,
  p_edad     int  default null
) returns uuid
language plpgsql security definer set search_path = public, extensions
as $$
declare
  v_user_id    uuid;
  v_miembro_id uuid;
  v_email_norm text := lower(trim(p_email));
begin
  if not public.is_super_admin() then raise exception 'No autorizado'; end if;
  if p_rol not in ('entrenador','dirigente','jugador') then raise exception 'Rol inválido: %', p_rol; end if;
  if not exists (select 1 from clubes where id = p_club_id) then raise exception 'Club no existe'; end if;

  select id into v_user_id from auth.users where lower(email) = v_email_norm;

  if v_user_id is null then
    if length(coalesce(p_password, '')) < 6 then
      raise exception 'Password debe tener al menos 6 caracteres';
    end if;

    v_user_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, email_change, email_change_token_new, email_change_token_current,
      recovery_token, phone_change, phone_change_token, reauthentication_token,
      is_sso_user, is_anonymous
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id, 'authenticated', 'authenticated',
      v_email_norm, extensions.crypt(p_password, extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
      '', '', '', '', '', '', '', '',
      false, false
    );

    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email_norm, 'email_verified', true),
      'email', v_user_id::text, now(), now(), now()
    );
  end if;

  if exists (select 1 from miembros where auth_user_id = v_user_id and club_id = p_club_id) then
    raise exception 'Ese usuario ya es miembro de este club';
  end if;

  insert into miembros (auth_user_id, club_id, nombre, rol, dorsal, posicion, edad)
  values (v_user_id, p_club_id, p_nombre, p_rol, p_dorsal, p_posicion, p_edad)
  returning id into v_miembro_id;
  return v_miembro_id;
end;
$$;
grant execute on function public.admin_crear_miembro(uuid, text, text, text, text, int, text, int) to authenticated;

-- 4.9) Editar miembro (permite mover a otro club)
drop function if exists public.admin_editar_miembro(uuid, text, text, int, text, int);
create or replace function public.admin_editar_miembro(
  p_miembro_id uuid,
  p_nombre     text,
  p_rol        text,
  p_club_id    uuid,
  p_dorsal     int  default null,
  p_posicion   text default null,
  p_edad       int  default null
) returns void
language plpgsql security definer set search_path = public
as $$
declare v_auth_user_id uuid;
begin
  if not public.is_super_admin() then raise exception 'No autorizado'; end if;
  if p_rol not in ('entrenador','dirigente','jugador') then raise exception 'Rol inválido: %', p_rol; end if;
  if not exists (select 1 from clubes where id = p_club_id) then raise exception 'Club destino no existe'; end if;

  select auth_user_id into v_auth_user_id from miembros where id = p_miembro_id;
  if v_auth_user_id is null then raise exception 'Miembro no encontrado'; end if;

  if exists (
    select 1 from miembros
    where auth_user_id = v_auth_user_id and club_id = p_club_id and id <> p_miembro_id
  ) then
    raise exception 'Ese usuario ya es miembro del club destino';
  end if;

  update miembros
     set nombre = coalesce(p_nombre, nombre),
         rol = p_rol, club_id = p_club_id,
         dorsal = p_dorsal, posicion = p_posicion, edad = p_edad
   where id = p_miembro_id;
end;
$$;
grant execute on function public.admin_editar_miembro(uuid, text, text, uuid, int, text, int) to authenticated;

-- ─── 5) Semilla del super admin ────────────────────────────────
-- Crea la cuenta admin@gmail.com / admin1234 si no existe y la registra
-- como super admin. Idempotente: no falla si ya está creada.
do $$
declare v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = 'admin@gmail.com';
  if v_user_id is null then
    v_user_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, email_change, email_change_token_new, email_change_token_current,
      recovery_token, phone_change, phone_change_token, reauthentication_token,
      is_sso_user, is_anonymous
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id, 'authenticated', 'authenticated',
      'admin@gmail.com', extensions.crypt('admin1234', extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
      '', '', '', '', '', '', '', '',
      false, false
    );
    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', 'admin@gmail.com', 'email_verified', true),
      'email', v_user_id::text, now(), now(), now()
    );
  end if;

  insert into public.super_admins (auth_user_id, nombre)
  values (v_user_id, 'Super Admin')
  on conflict (auth_user_id) do nothing;
end $$;
