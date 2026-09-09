-- ---------------------------------------------------------------------------
-- 0008 — El voto vuelve a emitirse
-- ---------------------------------------------------------------------------
-- `votos_objetivo_unico` es un indice unico PARCIAL:
--
--   create unique index votos_objetivo_unico
--     on public.votos (objetivo_id) where objetivo_id is not null;
--
-- Postgres solo infiere un indice parcial si el `on conflict` repite su
-- predicado. Sin el, el trigger de 0004 fallaba con "there is no unique or
-- exclusion constraint matching the ON CONFLICT specification", y como el
-- insert es lo ultimo que hace, la excepcion se llevaba el update entero: no
-- se perdia solo el voto, no se podia ni marcar la casilla.
--
-- El predicado es siempre verdadero aqui (`new.id` nunca es null), pero hay que
-- escribirlo para que la inferencia encuentre el indice.

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
    on conflict (objetivo_id) where objetivo_id is not null do nothing;
  end if;

  return null;
end;
$$;

-- Lo que se marco antes de este arreglo no llego a existir: el update fallaba
-- entero, asi que no hay objetivos completados sin su voto. Aun asi se emiten
-- los que falten, por si alguno entro por otra via.
insert into public.votos (usuario_id, objetivo_id, categoria_id, titulo, emitido_en)
select o.usuario_id, o.id, o.categoria_id, o.titulo, o.completado_en
from public.objetivos o
where o.completado_en is not null
on conflict (objetivo_id) where objetivo_id is not null do nothing;
