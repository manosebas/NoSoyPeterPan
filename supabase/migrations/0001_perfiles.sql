-- 0001_perfiles.sql
-- Espejo publico de auth.users. Se aplica igual en dev_NoSoyPeterPan y en
-- prod_NoSoyPeterPan (SQL Editor del dashboard de Supabase).

create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text,
  avatar_url text,
  creado_en timestamptz not null default now()
);

alter table public.perfiles enable row level security;

-- Cada quien ve y edita unicamente su perfil.
drop policy if exists "perfil propio: lectura" on public.perfiles;
create policy "perfil propio: lectura"
  on public.perfiles for select
  using ((select auth.uid()) = id);

drop policy if exists "perfil propio: escritura" on public.perfiles;
create policy "perfil propio: escritura"
  on public.perfiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Alta automatica del perfil al registrarse un usuario.
create or replace function public.maneja_usuario_nuevo()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre)
  values (new.id, new.raw_user_meta_data ->> 'nombre')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.maneja_usuario_nuevo();
