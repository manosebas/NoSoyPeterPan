-- 0006_plazos_por_defecto.sql
-- Largo plazo pasa de cinco anos a tres.
-- Se aplica igual en dev_NoSoyPeterPan y en prod_NoSoyPeterPan.

alter table public.preferencias alter column dias_largo set default 1095;

-- Solo a quien nunca lo toco: 1825 era el valor de fabrica anterior, asi que
-- una fila con ese numero es una que jamas se configuro.
update public.preferencias set dias_largo = 1095 where dias_largo = 1825;
