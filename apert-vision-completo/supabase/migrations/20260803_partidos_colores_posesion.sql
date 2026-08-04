-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Agregar campos de colores de camisetas y posesión al partido
-- Fecha:     2026-08-03
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Nuevos campos en la tabla `partidos` para enriquecer la información
-- del encuentro:
--   - color_local:      hex color de la camiseta del equipo local (ej: '#39E07A')
--   - color_visitante:  hex color del rival
--   - posesion_local:   % de posesión de la pelota del equipo local (0-100)
--
-- Todos son nullable — no rompe partidos existentes.
-- ═══════════════════════════════════════════════════════════════════════════

alter table partidos
  add column if not exists color_local     text,
  add column if not exists color_visitante text,
  add column if not exists posesion_local  int check (posesion_local between 0 and 100);

comment on column partidos.color_local     is 'Hex color de la camiseta del equipo local (ej: #FF5733)';
comment on column partidos.color_visitante is 'Hex color de la camiseta del equipo visitante';
comment on column partidos.posesion_local  is 'Porcentaje de posesión de la pelota del equipo local (0-100)';
