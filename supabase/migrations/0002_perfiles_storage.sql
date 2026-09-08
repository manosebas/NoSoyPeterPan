-- 0002_perfiles_storage.sql
-- Politicas para la foto de perfil. Se aplica igual en dev_NoSoyPeterPan y en
-- prod_NoSoyPeterPan (SQL Editor del dashboard de Supabase).
--
-- El bucket `perfiles` se crea a mano desde el dashboard: publico, limite de
-- 50 MB y mime types image/*. Aqui solo van los permisos, que no se pueden
-- configurar desde la UI.

-- Cada usuario escribe unicamente dentro de su carpeta <uid>/...
drop policy if exists "foto propia: subida" on storage.objects;
create policy "foto propia: subida"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'perfiles'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Reemplazar la foto es un update sobre el objeto que ya existe.
drop policy if exists "foto propia: reemplazo" on storage.objects;
create policy "foto propia: reemplazo"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'perfiles'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'perfiles'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Alta del propio perfil en public.perfiles. El trigger de 0001 crea la fila al
-- registrarse; esta politica cubre a los usuarios creados antes del trigger,
-- que si no no podrian guardar ni nombre ni foto.
drop policy if exists "perfil propio: alta" on public.perfiles;
create policy "perfil propio: alta"
  on public.perfiles for insert
  to authenticated
  with check ((select auth.uid()) = id);
