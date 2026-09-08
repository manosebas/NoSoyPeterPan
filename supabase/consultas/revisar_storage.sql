-- Diagnostico de las politicas de la foto de perfil.
-- Correr en el SQL Editor del dashboard, con el proyecto dev_NoSoyPeterPan.

-- 1. El bucket existe y como quedo configurado.
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'perfiles';

-- 2. Que politicas ve Postgres sobre storage.objects.
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
order by policyname;

-- 3. Lo mismo para public.perfiles.
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'perfiles'
order by policyname;
