-- 0007_pendientes.sql
-- Los to-do del dia y el retiro de `objetivos.suelto`.
-- Se aplica igual en dev_NoSoyPeterPan y en prod_NoSoyPeterPan.
--
-- Un to-do no es un objetivo: no tiene rama, ni fecha, ni padre, y cumplirlo no
-- construye nada a tres anos. Por eso vive aparte y no emite voto: si contara,
-- "sacar la basura" pesaria lo mismo que "terminar el portafolio".

create table if not exists public.pendientes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null check (char_length(btrim(titulo)) between 1 and 200),
  creado_en timestamptz not null default now()
);

create index if not exists pendientes_usuario_idx
  on public.pendientes (usuario_id, creado_en);

alter table public.pendientes enable row level security;

drop policy if exists "pendientes propios: lectura" on public.pendientes;
create policy "pendientes propios: lectura"
  on public.pendientes for select
  to authenticated using ((select auth.uid()) = usuario_id);

drop policy if exists "pendientes propios: alta" on public.pendientes;
create policy "pendientes propios: alta"
  on public.pendientes for insert
  to authenticated with check ((select auth.uid()) = usuario_id);

drop policy if exists "pendientes propios: escritura" on public.pendientes;
create policy "pendientes propios: escritura"
  on public.pendientes for update
  to authenticated
  using ((select auth.uid()) = usuario_id)
  with check ((select auth.uid()) = usuario_id);

-- Marcar un to-do es borrarlo: no hay estado que guardar.
drop policy if exists "pendientes propios: borrado" on public.pendientes;
create policy "pendientes propios: borrado"
  on public.pendientes for delete
  to authenticated using ((select auth.uid()) = usuario_id);

-- Con los to-do en su propia tabla, todo lo que queda en `objetivos` tiene
-- rama, arbol y voto. La excepcion sobra.
delete from public.objetivos where suelto;

alter table public.objetivos drop constraint if exists objetivos_suelto_es_raiz;
alter table public.objetivos drop column if exists suelto;
