-- 0003_objetivos.sql
-- La cascada de objetivos. Se aplica igual en dev_NoSoyPeterPan y en
-- prod_NoSoyPeterPan (SQL Editor del dashboard de Supabase).
--
-- Un solo arbol: cada objetivo puede colgar de otro. El Norte, las Rutas y las
-- Misiones no son tablas distintas, son la profundidad a la que vive la fila.

create table if not exists public.objetivos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  -- Al borrar un objetivo se lleva su desglose completo: no quedan huerfanos.
  padre_id uuid references public.objetivos (id) on delete cascade,
  titulo text not null check (char_length(btrim(titulo)) between 1 and 200),
  detalle text check (detalle is null or char_length(detalle) <= 2000),
  -- Sin fecha, el objetivo vive en Nunca Jamas. Es el antagonista del juego.
  vence_el date,
  -- Solo lo llevan las hojas: un objetivo con desglose se completa cuando sus
  -- hijos se completan, y eso se calcula, no se guarda.
  completado_en timestamptz,
  orden integer not null default 0,
  -- Derivada del padre por trigger. Existe para ordenar y para topar el
  -- desglose sin recorrer el arbol en cada consulta.
  profundidad smallint not null default 0 check (profundidad between 0 and 5),
  creado_en timestamptz not null default now()
);

create index if not exists objetivos_usuario_padre_idx
  on public.objetivos (usuario_id, padre_id, orden);

create index if not exists objetivos_usuario_vence_idx
  on public.objetivos (usuario_id, vence_el);

alter table public.objetivos enable row level security;

drop policy if exists "objetivos propios: lectura" on public.objetivos;
create policy "objetivos propios: lectura"
  on public.objetivos for select
  to authenticated
  using ((select auth.uid()) = usuario_id);

drop policy if exists "objetivos propios: alta" on public.objetivos;
create policy "objetivos propios: alta"
  on public.objetivos for insert
  to authenticated
  with check ((select auth.uid()) = usuario_id);

drop policy if exists "objetivos propios: escritura" on public.objetivos;
create policy "objetivos propios: escritura"
  on public.objetivos for update
  to authenticated
  using ((select auth.uid()) = usuario_id)
  with check ((select auth.uid()) = usuario_id);

drop policy if exists "objetivos propios: borrado" on public.objetivos;
create policy "objetivos propios: borrado"
  on public.objetivos for delete
  to authenticated
  using ((select auth.uid()) = usuario_id);

-- Reglas del arbol que no se pueden expresar como constraint de columna.
create or replace function public.valida_objetivo()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  padre public.objetivos%rowtype;
  ancestro uuid;
  saltos integer := 0;
begin
  if new.padre_id is null then
    new.profundidad := 0;
  else
    select * into padre from public.objetivos where id = new.padre_id;

    if not found then
      raise exception 'El objetivo del que quieres colgar este ya no existe.';
    end if;
    if padre.usuario_id <> new.usuario_id then
      raise exception 'No puedes colgar un objetivo del arbol de otra persona.';
    end if;

    new.profundidad := padre.profundidad + 1;
    if new.profundidad > 5 then
      raise exception 'Seis niveles de desglose son suficientes. Ese paso ya es de hoy.';
    end if;

    -- Un objetivo no puede terminar colgando de su propio desglose.
    ancestro := padre.id;
    while ancestro is not null and saltos <= 6 loop
      if ancestro = new.id then
        raise exception 'Un objetivo no puede colgar de si mismo.';
      end if;
      select padre_id into ancestro from public.objetivos where id = ancestro;
      saltos := saltos + 1;
    end loop;
  end if;

  -- Mover una rama dejaria la profundidad de sus hijos desfasada.
  if tg_op = 'UPDATE'
     and new.padre_id is distinct from old.padre_id
     and exists (select 1 from public.objetivos h where h.padre_id = new.id) then
    raise exception 'Primero mueve o borra su desglose.';
  end if;

  -- Solo se marca lo que ya no se puede partir en algo mas chico.
  if new.completado_en is not null
     and exists (select 1 from public.objetivos h where h.padre_id = new.id) then
    raise exception 'Este objetivo se cumple cuando se cumple su desglose.';
  end if;

  return new;
end;
$$;

drop trigger if exists objetivos_valida on public.objetivos;
create trigger objetivos_valida
  before insert or update on public.objetivos
  for each row execute function public.valida_objetivo();

-- Desglosar un objetivo ya marcado lo devuelve a pendiente: dejo de ser hoja.
create or replace function public.destapa_padre()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.padre_id is not null then
    update public.objetivos
      set completado_en = null
      where id = new.padre_id and completado_en is not null;
  end if;
  return new;
end;
$$;

drop trigger if exists objetivos_destapa_padre on public.objetivos;
create trigger objetivos_destapa_padre
  after insert on public.objetivos
  for each row execute function public.destapa_padre();
