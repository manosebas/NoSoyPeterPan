# El juego

Cómo funciona No Soy Peter Pan por dentro: qué se guarda, qué se calcula y qué
se ve. Para el porqué y el léxico, ver `CLAUDE.md`.

---

## 1. La regla de todo

Un objetivo grande se parte en objetivos más chicos. Esos se vuelven a partir.
Se sigue partiendo hasta llegar a algo que se pueda hacer.

```
Cambiar de carrera                    4 años
  └ Portafolio que valga                1 año
      └ Tres casos escritos              90 días
          └ Elegir los tres proyectos     esta semana
```

No hay tipos distintos de objetivo. Hay un objetivo, y objetivos que cuelgan de
él. El Norte es el que no cuelga de nadie; una Misión es el que ya no se puede
partir. Son la misma cosa a distinta altura.

Esto es lo que hace que la regla 1 de `CLAUDE.md` se cumpla sola: **ninguna
misión es huérfana** porque toda hoja tiene, por construcción, un camino hasta
la raíz. La pregunta *"¿a qué objetivo de mi vida contribuye esto?"* se responde
subiendo por el árbol.

---

## 2. Qué se guarda

Una tabla: `objetivos`. Se apunta a sí misma por `padre_id`.

| Campo | Para qué |
|---|---|
| `usuario_id` | Dueño. Toda política de RLS cuelga de aquí. |
| `padre_id` | De quién cuelga. `null` = es una raíz, un Norte. |
| `titulo` | Lo que la persona escribe. |
| `detalle` | Opcional. El porqué, si quiere dejarlo escrito. |
| `vence_el` | Fecha. `null` = vive en Nunca Jamás. |
| `completado_en` | Cuándo se marcó. Solo lo llevan las hojas. |
| `orden` | Orden manual dentro de su nivel. |
| `profundidad` | Derivada del padre. Topa el desglose en 6 niveles. |

Tres reglas viven en la base, no en la UI, porque la anon key viaja al
navegador y cualquiera puede llamar a la API a mano:

1. Un hijo hereda `profundidad = padre + 1` y nadie puede colgar de otro árbol.
2. **Solo se marca lo que no tiene desglose.** Marcar un objetivo con hijos
   lanza error. Desglosar uno ya marcado lo devuelve a pendiente.
3. Borrar un objetivo se lleva su desglose completo (`on delete cascade`).

### Por qué el progreso no se guarda

El avance de un objetivo es cuántas de sus hojas están cumplidas. Guardarlo
sería un número que hay que mantener sincronizado en cada marca, desmarca,
alta y borrado: la clase de dato que se corrompe y miente. Se calcula en el
navegador con el árbol completo, que para una persona son decenas de filas, no
millones.

```
progreso(nodo) = hojas cumplidas bajo el nodo / hojas totales bajo el nodo
```

Se cuentan hojas, no hijos directos: así un objetivo con diez pasos pesa más
que uno con dos, que es la verdad.

---

## 3. Los plazos

`vence_el` es una fecha, no una categoría. Largo, mediano y corto plazo se
deducen de la distancia a hoy; nadie tiene que clasificar nada.

Al crear un objetivo se ofrece una fecha por defecto según su nivel, porque
mientras más abajo, más cerca:

| Nivel | Por defecto | Se lee como |
|---|---|---|
| Raíz (el Norte) | 4 años | Largo plazo |
| Primer desglose | 1 año | Mediano plazo |
| Segundo desglose | 90 días | Corto plazo |
| Más abajo | 7 días | Esta semana |

Siempre se puede cambiar, y siempre se puede dejar sin fecha. Sin fecha no es
un error: es Nunca Jamás, y el producto lo muestra como lo que es.

> Un objetivo sin fecha lleva 34 días esperando a que decidas cuándo.

---

## 4. Cómo se ve

**Un objetivo a la vez.** La pantalla nunca crece aunque el árbol tenga seis
niveles.

```
El Norte › Cambiar de carrera › Portafolio que valga

Portafolio que valga                          1 año · marzo 2027
████████████░░░░░░░░░░░░  50%
2 de 4 pasos

  ☑  Elegir los tres proyectos
  ☐  Escribir los casos                              › 2
  ☑  Comprar el dominio
  ☐  Publicar el sitio                        sin fecha

  + desglosar este objetivo
```

- **Migas arriba**: el camino completo hasta el Norte. Un toque sube un nivel.
  Es la respuesta permanente a *"¿esto para qué?"*.
- **Barra de progreso**: una sola, la del objetivo abierto. Se llena con las
  hojas cumplidas debajo, a cualquier profundidad.
- **La lista**: los hijos directos. Con desglose muestran `› n` y su propio
  avance; sin desglose muestran casilla. Un toque en el título entra, un toque
  en la casilla marca.
- **Sin fecha se ve distinto**: en gris, con la etiqueta a la vista. No es un
  regaño, es un dato incómodo.

### Lo que no va

- Nada de árbol completo desplegable: a tres niveles y veinte objetivos deja de
  leerse en un teléfono.
- Nada de porcentajes por todos lados. Una barra por pantalla.
- Nada de rachas ni insignias (regla 5 de `CLAUDE.md`). El premio es ver la
  cadena de un martes cualquiera hasta los cinco años.

---

## 5. Lo que falta decidir

- Qué se ve al entrar cuando todavía no hay ningún Norte.
- Si los Territorios (carrera, dinero, cuerpo…) etiquetan objetivos o
  desaparecen del modelo.
- Cómo se ve La Sombra: el costo acumulado de lo que lleva meses sin fecha.
