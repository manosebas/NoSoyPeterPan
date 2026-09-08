-- 0002_foto_perfiles.sql
-- Almacenamiento de la foto de perfil. Se aplica igual en dev_NoSoyPeterPan y
-- en prod_NoSoyPeterPan (SQL Editor del dashboard de Supabase).

-- El bucket se creo desde el dashboard; esto deja su configuracion escrita y
-- reproducible. Publico de lectura: la URL vive en perfiles.avatar_url.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('foto_perfiles', 'foto_perfiles', true, 209715200, array['image/*'])
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Cada usuario escribe unicamente dentro de su carpeta <uid>/...
drop policy if exists "foto propia: subida" on storage.objects;
create policy "foto propia: subida"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'foto_perfiles'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "foto propia: reemplazo" on storage.objects;
create policy "foto propia: reemplazo"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'foto_perfiles'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'foto_perfiles'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "foto propia: borrado" on storage.objects;
create policy "foto propia: borrado"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'foto_perfiles'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Lectura abierta: el bucket es publico, la politica lo hace explicito.
drop policy if exists "foto_perfiles: lectura publica" on storage.objects;
create policy "foto_perfiles: lectura publica"
  on storage.objects for select
  using (bucket_id = 'foto_perfiles');

-- Alta del propio perfil. El trigger de 0001 crea la fila al registrarse, pero
-- sin esta politica un usuario viejo (creado antes del trigger) no podria
-- guardar nada: el insert de respaldo chocaria con RLS.
drop policy if exists "perfil propio: alta" on public.perfiles;
create policy "perfil propio: alta"
  on public.perfiles for insert
  to authenticated
  with check ((select auth.uid()) = id);
