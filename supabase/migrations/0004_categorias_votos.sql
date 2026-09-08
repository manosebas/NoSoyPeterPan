-- 0004_categorias_votos.sql
-- Las ramas de la vida: categorias, votos y la meta de cada barra.
-- Se aplica igual en dev_NoSoyPeterPan y en prod_NoSoyPeterPan.

-- ---------------------------------------------------------------------------
-- Catalogo de categorias
-- ---------------------------------------------------------------------------
-- Tabla de catalogo: las mismas filas para todo el mundo, sin dueno. El id es
-- un slug y no un uuid para que la semilla sea idempotente y las consultas se
-- lean solas (categoria_id = 'salud').

create table if not exists public.categorias (
  id text primary key check (id ~ '^[a-z_]{2,30}$'),
  nombre text not null,
  -- Acento de la rama. Vive en datos porque cada categoria nueva trae el suyo.
  color text not null check (color ~ '^#[0-9a-f]{6}$'),
  orden smallint not null default 100
);

insert into public.categorias (id, nombre, color, orden) values
  ('salud',          'Salud',          '#17876a', 10),
  ('dinero',         'Dinero',         '#9a6b1f', 20),
  ('carrera',        'Carrera',        '#2a5d9f', 30),
  ('relaciones',     'Relaciones',     '#b5476b', 40),
  ('mente',          'Mente',          '#6c4bb6', 50),
  ('aventura',       'Aventura',       '#c25a2a', 60),
  ('familia',        'Familia',        '#16777f', 70),
  ('hogar',          'Hogar',          '#7a6a53', 80),
  ('aprendizaje',    'Aprendizaje',    '#3f7a2e', 90),
  ('espiritualidad', 'Espiritualidad', '#5b5f8a', 100)
on conflict (id) do update
  set nombre = excluded.nombre, color = excluded.color, orden = excluded.orden;

alter table public.categorias enable row level security;

-- Catalogo: se lee entero y no se escribe desde la app. Filas nuevas entran
-- por SQL, no por la interfaz.
drop policy if exists "categorias: lectura" on public.categorias;
create policy "categorias: lectura"
  on public.categorias for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Categoria y objetivos sueltos
-- ---------------------------------------------------------------------------

alter table public.objetivos
  add column if not exists categoria_id text references public.categorias (id),
  -- Objetivo del dia sin arbol: "ir al doctor". Se adopta despues poniendole
  -- padre_id, sin mover la fila de tabla.
  add column if not exists suelto boolean not null default false;

update public.objetivos set categoria_id = 'salud' where categoria_id is null;
alter table public.objetivos alter column categoria_id set not null;

alter table public.objetivos drop constraint if exists objetivos_suelto_es_raiz;
alter table public.objetivos add constraint objetivos_suelto_es_raiz
  check (not suelto or padre_id is null);

create index if not exists objetivos_usuario_categoria_idx
  on public.objetivos (usuario_id, categoria_id);

-- Reglas del arbol. Reemplaza la version de 0003: suma categoria y fechas.
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

    if new.categoria_id is null then
      raise exception 'Elige a que parte de tu vida pertenece este objetivo.';
    end if;
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

    -- La categoria se hereda salvo que la persona diga otra cosa: un paso de
    -- dinero puede vivir dentro de un objetivo de salud y sumar a dinero.
    if new.categoria_id is null then
      new.categoria_id := padre.categoria_id;
    end if;

    -- Un paso no puede vencer despues de la meta que lo contiene. Sin esto la
    -- cascada se vuelve mentira: "hoy" cayendo despues del objetivo de 90 dias.
    if padre.vence_el is not null
       and new.vence_el is not null
       and new.vence_el > padre.vence_el then
      raise exception 'Ese paso vence despues del objetivo del que cuelga (%).', padre.vence_el;
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

-- Cambiar la categoria de un objetivo arrastra a su desglose, pero solo al que
-- venia heredando. Un hijo al que ya le pusiste categoria propia no se toca.
create or replace function public.propaga_categoria()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  with recursive rama as (
    select id from public.objetivos
      where padre_id = new.id and categoria_id = old.categoria_id
    union all
    select h.id from public.objetivos h
      join rama r on h.padre_id = r.id
      where h.categoria_id = old.categoria_id
  )
  update public.objetivos o
    set categoria_id = new.categoria_id
    from rama where o.id = rama.id;

  return null;
end;
$$;

drop trigger if exists objetivos_propaga_categoria on public.objetivos;
create trigger objetivos_propaga_categoria
  after update of categoria_id on public.objetivos
  for each row
  -- Solo el cambio que hace la persona: la propagacion no se propaga sola.
  when (old.categoria_id is distinct from new.categoria_id and pg_trigger_depth() = 1)
  execute function public.propaga_categoria();

-- ---------------------------------------------------------------------------
-- Votos
-- ---------------------------------------------------------------------------
-- Cada objetivo cumplido es un voto por la persona que quieres ser. Se guardan
-- aparte y no se borran: el acumulado de una rama no puede bajar porque
-- limpiaste un arbol viejo o desmarcaste una casilla.

create table if not exists public.votos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  -- Se queda en null si el objetivo desaparece: el voto sobrevive al objetivo.
  objetivo_id uuid references public.objetivos (id) on delete set null,
  categoria_id text not null references public.categorias (id),
  -- Copia del titulo: sirve para contar la historia cuando el objetivo ya no esta.
  titulo text not null,
  emitido_en timestamptz not null default now()
);

-- Un objetivo vota una sola vez: marcar, desmarcar y volver a marcar no infla
-- el acumulado.
create unique index if not exists votos_objetivo_unico
  on public.votos (objetivo_id) where objetivo_id is not null;

create index if not exists votos_usuario_categoria_idx
  on public.votos (usuario_id, categoria_id, emitido_en desc);

alter table public.votos enable row level security;

-- Solo lectura desde la app: los votos los emite el trigger, nadie los inventa
-- ni los borra a mano.
drop policy if exists "votos propios: lectura" on public.votos;
create policy "votos propios: lectura"
  on public.votos for select
  to authenticated
  using ((select auth.uid()) = usuario_id);

create or replace function public.emite_voto()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.completado_en is not null
     and (tg_op = 'INSERT' or old.completado_en is null) then
    insert into public.votos (usuario_id, objetivo_id, categoria_id, titulo, emitido_en)
    values (new.usuario_id, new.id, new.categoria_id, new.titulo, new.completado_en)
    on conflict (objetivo_id) do nothing;
  end if;

  return null;
end;
$$;

drop trigger if exists objetivos_emite_voto on public.objetivos;
create trigger objetivos_emite_voto
  after insert or update of completado_en on public.objetivos
  for each row execute function public.emite_voto();

-- ---------------------------------------------------------------------------
-- Metas por rama
-- ---------------------------------------------------------------------------
-- Cuantos votos llenan la barra de una rama. Es lo que se edita en Ajustes:
-- quien quiere gimnasio diario pone 30, quien apunta a una vez por semana
-- pone 12. Sin fila, vale el valor por defecto.

create table if not exists public.metas_categoria (
  usuario_id uuid not null references auth.users (id) on delete cascade,
  categoria_id text not null references public.categorias (id),
  votos_por_nivel smallint not null default 30 check (votos_por_nivel between 5 and 365),
  primary key (usuario_id, categoria_id)
);

alter table public.metas_categoria enable row level security;

drop policy if exists "metas propias: lectura" on public.metas_categoria;
create policy "metas propias: lectura"
  on public.metas_categoria for select
  to authenticated using ((select auth.uid()) = usuario_id);

drop policy if exists "metas propias: alta" on public.metas_categoria;
create policy "metas propias: alta"
  on public.metas_categoria for insert
  to authenticated with check ((select auth.uid()) = usuario_id);

drop policy if exists "metas propias: escritura" on public.metas_categoria;
create policy "metas propias: escritura"
  on public.metas_categoria for update
  to authenticated
  using ((select auth.uid()) = usuario_id)
  with check ((select auth.uid()) = usuario_id);

drop policy if exists "metas propias: borrado" on public.metas_categoria;
create policy "metas propias: borrado"
  on public.metas_categoria for delete
  to authenticated using ((select auth.uid()) = usuario_id);
