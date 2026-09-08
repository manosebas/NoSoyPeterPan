-- 0005_preferencias.sql
-- Cuanto dura cada plazo para cada persona.
-- Se aplica igual en dev_NoSoyPeterPan y en prod_NoSoyPeterPan.
--
-- Largo, mediano y corto no significan lo mismo para todos: hay vidas que se
-- planean a diez anos y proyectos que a dos anos ya son largo plazo. La fecha
-- sigue siendo el dato real; esto solo decide que dia se propone al crear.

create table if not exists public.preferencias (
  usuario_id uuid primary key references auth.users (id) on delete cascade,
  dias_largo integer not null default 1825,
  dias_mediano integer not null default 365,
  dias_corto integer not null default 90,
  constraint preferencias_plazos_ordenados
    check (dias_largo > dias_mediano and dias_mediano > dias_corto and dias_corto >= 1),
  constraint preferencias_plazos_razonables
    check (dias_largo <= 18250)
);

alter table public.preferencias enable row level security;

drop policy if exists "preferencias propias: lectura" on public.preferencias;
create policy "preferencias propias: lectura"
  on public.preferencias for select
  to authenticated using ((select auth.uid()) = usuario_id);

drop policy if exists "preferencias propias: alta" on public.preferencias;
create policy "preferencias propias: alta"
  on public.preferencias for insert
  to authenticated with check ((select auth.uid()) = usuario_id);

drop policy if exists "preferencias propias: escritura" on public.preferencias;
create policy "preferencias propias: escritura"
  on public.preferencias for update
  to authenticated
  using ((select auth.uid()) = usuario_id)
  with check ((select auth.uid()) = usuario_id);
