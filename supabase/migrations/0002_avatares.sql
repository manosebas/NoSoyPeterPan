-- 0002_avatares.sql
-- Almacenamiento del avatar del perfil. Se aplica igual en dev_NoSoyPeterPan y
-- en prod_NoSoyPeterPan (SQL Editor del dashboard de Supabase).

-- Bucket publico: la URL del avatar se guarda en perfiles.avatar_url y se
-- pinta en el menu. Publico solo de lectura; escribir sigue exigiendo sesion.
insert into storage.buckets (id, name, public)
values ('avatares', 'avatares', true)
on conflict (id) do update set public = true;

-- Cada usuario manda archivos unicamente dentro de su carpeta <uid>/...
drop policy if exists "avatar propio: subida" on storage.objects;
create policy "avatar propio: subida"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatares'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "avatar propio: reemplazo" on storage.objects;
create policy "avatar propio: reemplazo"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatares'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatares'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "avatar propio: borrado" on storage.objects;
create policy "avatar propio: borrado"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatares'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Lectura abierta: el bucket es publico, la politica lo hace explicito.
drop policy if exists "avatares: lectura publica" on storage.objects;
create policy "avatares: lectura publica"
  on storage.objects for select
  using (bucket_id = 'avatares');

-- Alta del propio perfil. El trigger de 0001 lo crea al registrarse, pero sin
-- esta politica un usuario viejo (creado antes del trigger) no podria guardar
-- su nombre ni su avatar: el upsert chocaria con RLS.
drop policy if exists "perfil propio: alta" on public.perfiles;
create policy "perfil propio: alta"
  on public.perfiles for insert
  to authenticated
  with check ((select auth.uid()) = id);
