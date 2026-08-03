-- ═══════════════════════════════════════════════════════════════════════════
-- Datos demo para la defensa — 12 jugadores del club "Casa de Padua"
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Estos jugadores NO tienen cuenta de auth real (auth_user_id = null).
-- Sirven solo para poblar la lista de "Jugadores" en la app Desktop y que
-- se vean las estadísticas individuales durante la demo.
--
-- Al correr esto, la tabla estadisticas_jugador se autopopula automáticamente
-- la primera vez que se abre la página Jugadores en el Desktop.
--
-- Uso: pegá esto en Supabase → SQL Editor → Run.
-- ═══════════════════════════════════════════════════════════════════════════

do $$
declare
  v_club_id uuid;
begin
  -- Buscar el club por nombre
  select id into v_club_id from clubes where nombre = 'casa de padua' limit 1;

  if v_club_id is null then
    raise exception 'Club "casa de padua" no encontrado. Ajustá el nombre en el SQL.';
  end if;

  -- Insertar jugadores (idempotente: no duplica si ya existen por nombre en el club)
  insert into miembros (id, auth_user_id, club_id, nombre, rol, dorsal, posicion, edad)
  values
    (gen_random_uuid(), null, v_club_id, 'Martín Rodríguez',   'jugador', 1,  'Pilier',       28),
    (gen_random_uuid(), null, v_club_id, 'Diego Fernández',    'jugador', 2,  'Hooker',       26),
    (gen_random_uuid(), null, v_club_id, 'Lucas Gómez',        'jugador', 3,  'Pilier',       30),
    (gen_random_uuid(), null, v_club_id, 'Federico Álvarez',   'jugador', 4,  'Lock',         27),
    (gen_random_uuid(), null, v_club_id, 'Nicolás Herrera',    'jugador', 5,  'Lock',         25),
    (gen_random_uuid(), null, v_club_id, 'Juan Cruz Ruiz',     'jugador', 6,  'Flanker',      24),
    (gen_random_uuid(), null, v_club_id, 'Facundo Ortiz',      'jugador', 7,  'Flanker',      23),
    (gen_random_uuid(), null, v_club_id, 'Mateo Domínguez',    'jugador', 8,  'Nº 8',         26),
    (gen_random_uuid(), null, v_club_id, 'Tomás Molina',       'jugador', 9,  'Medio Scrum',  22),
    (gen_random_uuid(), null, v_club_id, 'Bruno Sosa',         'jugador', 10, 'Apertura',     24),
    (gen_random_uuid(), null, v_club_id, 'Ignacio Peralta',    'jugador', 11, 'Wing',         21),
    (gen_random_uuid(), null, v_club_id, 'Santiago Vega',      'jugador', 12, 'Centro',       25),
    (gen_random_uuid(), null, v_club_id, 'Franco Ramírez',     'jugador', 13, 'Centro',       27),
    (gen_random_uuid(), null, v_club_id, 'Agustín Correa',     'jugador', 14, 'Wing',         22),
    (gen_random_uuid(), null, v_club_id, 'Bautista Silva',     'jugador', 15, 'Fullback',     26)
  on conflict do nothing;

  raise notice 'Jugadores demo cargados en el club %', v_club_id;
end $$;

-- Verificar
select nombre, dorsal, posicion, edad
from miembros
where club_id = (select id from clubes where nombre = 'casa de padua')
  and rol = 'jugador'
order by dorsal;
