-- ---------------------------------------------------------------------------
-- 0009 — Desmarcar retira el voto
-- ---------------------------------------------------------------------------
-- 0004 protegia el acumulado de una rama con una sola regla para dos casos
-- distintos: "no baja al limpiar un arbol viejo NI al desmarcar una casilla".
-- El primero ya estaba resuelto aparte, con `objetivo_id on delete set null`:
-- borras el objetivo y el voto sobrevive, con su copia del titulo. El segundo
-- se colgo de esa regla sin merecerlo.
--
-- Desmarcar es decir "esto no esta hecho". Si no esta hecho no hay voto que
-- contar, y un Perfil que presume algo que no hiciste es justo lo que prohibe
-- la regla 7 de CLAUDE.md. Volver a marcar lo vuelve a emitir, asi que quien
-- desmarco para reabrir algo que si cumplio lo recupera solo.

create or replace function public.emite_voto()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Marcar emite el voto. El predicado del `on conflict` es el del indice
  -- parcial `votos_objetivo_unico`: sin el, Postgres no lo infiere (ver 0008).
  if new.completado_en is not null
     and (tg_op = 'INSERT' or old.completado_en is null) then
    insert into public.votos (usuario_id, objetivo_id, categoria_id, titulo, emitido_en)
    values (new.usuario_id, new.id, new.categoria_id, new.titulo, new.completado_en)
    on conflict (objetivo_id) where objetivo_id is not null do nothing;

  -- Desmarcar lo retira. Borrar el objetivo es otra cosa: ahi el voto se queda,
  -- con `objetivo_id` en null.
  elsif tg_op = 'UPDATE'
        and new.completado_en is null
        and old.completado_en is not null then
    delete from public.votos where objetivo_id = new.id;
  end if;

  return null;
end;
$$;

-- El trigger de 0004 ya escucha `update of completado_en`: no hay que tocarlo.

-- Los votos que quedaron de objetivos que ya no estan marcados.
delete from public.votos v
using public.objetivos o
where v.objetivo_id = o.id and o.completado_en is null;
