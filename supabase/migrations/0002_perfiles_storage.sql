-- 0002_perfiles_storage.sql
-- Politicas para la foto de perfil. Se aplica igual en dev_NoSoyPeterPan y en
-- prod_NoSoyPeterPan (SQL Editor del dashboard de Supabase).
--
-- El bucket `perfiles` se crea a mano desde el dashboard: publico, limite de
-- 50 MB y mime types image/*. Aqui solo van los permisos, que la UI no cubre.
--
-- La condicion se escribe como `name like <uid>/%` en vez de usar
-- storage.foldername(): es la misma regla (el archivo cuelga de la carpeta del
-- usuario) sin depender de una funcion cuyo comportamiento cambia entre
-- versiones de storage.

-- Subir la foto por primera vez.
drop policy if exists "foto propia: subida" on storage.objects;
create policy "foto propia: subida"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'perfiles'
    and name like ((select auth.uid())::text || '/%')
  );

-- Reemplazarla: con upsert el objeto ya existe y storage hace un update.
drop policy if exists "foto propia: reemplazo" on storage.objects;
create policy "foto propia: reemplazo"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'perfiles'
    and name like ((select auth.uid())::text || '/%')
  )
  with check (
    bucket_id = 'perfiles'
    and name like ((select auth.uid())::text || '/%')
  );

-- Storage consulta el objeto antes de reemplazarlo: sin select, el upsert de
-- una foto que ya existe falla aunque las otras dos politicas esten bien.
drop policy if exists "foto propia: lectura" on storage.objects;
create policy "foto propia: lectura"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'perfiles');

-- Borrar la propia foto.
drop policy if exists "foto propia: borrado" on storage.objects;
create policy "foto propia: borrado"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'perfiles'
    and name like ((select auth.uid())::text || '/%')
  );

-- Alta del propio perfil en public.perfiles. El trigger de 0001 crea la fila al
-- registrarse; esta politica cubre a los usuarios creados antes del trigger,
-- que si no no podrian guardar ni nombre ni foto.
drop policy if exists "perfil propio: alta" on public.perfiles;
create policy "perfil propio: alta"
  on public.perfiles for insert
  to authenticated
  with check ((select auth.uid()) = id);
