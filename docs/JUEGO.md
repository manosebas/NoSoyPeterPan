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

Cuatro tablas. Una es catálogo, dos son del usuario y una es historia.

### `objetivos` — el árbol

Se apunta a sí misma por `padre_id`.

| Campo | Para qué |
|---|---|
| `usuario_id` | Dueño. Toda política de RLS cuelga de aquí. |
| `padre_id` | De quién cuelga. `null` = es una raíz. |
| `categoria_id` | A qué rama de la vida aporta. Se hereda del padre. |
| `titulo` | Lo que la persona escribe. |
| `detalle` | Opcional. El porqué, si quiere dejarlo escrito. |
| `vence_el` | Fecha. `null` = vive en Nunca Jamás. |
| `completado_en` | Cuándo se marcó. Solo lo llevan las hojas. |
| `orden` | Orden manual dentro de su nivel. |
| `profundidad` | Derivada del padre. Topa el desglose en 6 niveles. |

Las reglas viven en la base, no en la UI, porque la anon key viaja al navegador
y cualquiera puede llamar a la API a mano:

1. **Solo se marca lo que no tiene desglose.** Marcar un objetivo con hijos
   lanza error. Desglosar uno ya marcado lo devuelve a pendiente.
2. **La categoría se hereda al crear.** Si la cambias, el desglose que venía
   heredando te sigue; un hijo con categoría propia se queda donde está.
3. **Un paso no puede vencer después de la meta que lo contiene.** Desglosas
   algo de 90 días, sus hijos caen dentro de esos 90 días. Sin esta regla la
   cascada se vuelve mentira.
4. Un hijo hereda `profundidad = padre + 1`, tope de seis niveles, y no puede
   colgar del árbol de otra persona ni de su propio desglose.
5. Borrar un objetivo se lleva su desglose completo.

### `categorias` — catálogo

`id` (slug), `nombre`, `color`, `orden`. Las mismas filas para todo el mundo,
sin dueño: es un catálogo, no datos de usuario. Diez de semilla — salud, dinero,
carrera, relaciones, mente, aventura, familia, hogar, aprendizaje,
espiritualidad. Agregar una es una fila de SQL, no un despliegue.

### `votos` — la historia

Cada objetivo cumplido emite un voto, por trigger. Guarda `categoria_id` y una
copia del título.

Vive aparte de `objetivos` por una razón: **el acumulado de una rama no puede
bajar**. Si se contara sobre `objetivos.completado_en`, tu historia se borraría
al limpiar un árbol viejo o al desmarcar una casilla. Un objetivo vota una sola
vez (índice único), así que marcar y desmarcar no infla nada, y si borras el
objetivo el voto sobrevive con `objetivo_id` en null.

### `pendientes` — los to-do del día

`id`, `usuario_id`, `titulo`, `creado_en`. Nada más: sin rama, sin fecha, sin
padre y sin `completado_en`, porque marcar un to-do es borrar la fila.

Vive fuera de `objetivos` a propósito. Si «sacar la basura» emitiera voto,
pesaría lo mismo que «terminar el portafolio», y la fuerza de una rama dejaría
de significar algo. Un to-do no construye nada: existe para que la cabeza lo
suelte.

### `metas_categoria` — cómo sube tu barra

`votos_por_nivel` por usuario y rama. Es lo único de esto que se edita en
Ajustes. Sin fila, valen 30.

### Por qué el progreso de un objetivo no se guarda

El avance de un objetivo es cuántas de sus hojas están cumplidas. Guardarlo
sería un número que hay que mantener sincronizado en cada marca, desmarca, alta
y borrado: la clase de dato que se corrompe y miente. Se calcula en el navegador
con el árbol completo, que para una persona son decenas de filas.

```
progreso(nodo) = hojas cumplidas bajo el nodo / hojas totales bajo el nodo
```

Se cuentan hojas, no hijos directos: así un objetivo con diez pasos pesa más
que uno con dos, que es la verdad.

---

## 3. La fuerza de una rama

Aquí el progreso **no** es un porcentaje de completado, y es a propósito: si la
fuerza de *salud* fuera *cumplidas / totales*, el día que te propones algo nuevo
tu rama se debilitaría. El producto castigaría la ambición.

```
nivel    = ⌊ votos / votos_por_nivel ⌋ + 1
barra    = (votos módulo votos_por_nivel) / votos_por_nivel
```

La barra empieza en cero, sube con cada objetivo cumplido y al llenarse pasa de
nivel y vuelve a empezar. Nunca baja. Quien quiere gimnasio diario pone 30 y
llena su barra en un mes; quien apunta a una vez por semana pone 12.

Al lado va el dato que la barra no puede dar, porque la barra solo sube:

> **Dinero** · Nivel 2 · 18 votos — quieta hace 3 semanas.

Eso es la regla 7: se dice sin humillar y sin maquillar.

---

## 4. Los to-do del día

«Sacar la basura» no cuelga de ningún objetivo grande y nunca va a colgar. La
regla 1 dice que ninguna *misión* es huérfana, y se sostiene: en `objetivos`
todo tiene rama, árbol y voto, sin una sola excepción.

Los to-do son otra cosa y por eso son otra tabla. La vida tiene mantenimiento, y
negarlo hace la herramienta inútil para el martes real; pero contarlo como
progreso sería mentir. Así que se pueden anotar, se marcan, desaparecen, y no
dejan rastro en ninguna barra.

---

## 5. Cómo se ve

Cuatro pantallas sobre el mismo árbol, a distinto zoom. Nada se guarda dos
veces. Tres viven en la barra —Hoy, Mapa y Perfil—; a la cuarta se entra
tocando un objetivo.

### Hoy — el nivel de las hojas

Entrada de la app, en dos secciones. Arriba, *De tus objetivos*: lo que vence
hoy o antes de cualquier árbol, cada línea con el color de su rama y, en letra
chica, la meta de la que cuelga — nunca marcas algo sin ver para qué. Abajo,
*To-do*: lo que hay que hacer y no construye nada. Se escribe en una línea, se
marca, se borra.

### Enfoque — un nodo

Un objetivo a la vez. La pantalla nunca crece aunque el árbol tenga seis niveles.

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

Las migas son la respuesta permanente a *"¿esto para qué?"*. Una sola barra por
pantalla. Lo que tiene desglose muestra `› n`; lo que no, muestra casilla.

### Mapa — todo

Tres secciones, una por plazo, cada una con su botón de agregar. Solo se listan
**raíces**: lo que cuelga de un objetivo se ve dentro de su árbol, nunca
repetido arriba. Lo vencido se lee como corto plazo, que es lo que reclama
atención; lo que quedó sin fecha, como largo.

```
LARGO PLAZO                                         2

  SALUD
  ▸ Correr un maratón        ██████░░  3 de 5   dic 2031
    ├── ▸ 10K en junio       ████░░░░  2 de 4    jun 2027
    │   ├── ☑ Zapatillas nuevas                  12 mar
    │   └── ☐ Plan de 12 semanas                 20 mar
    └── ☐ Media maratón en marzo                 mar 2028

  + agrega un objetivo de largo plazo
```

### Perfil — la suma

Las ramas con su nivel, su acumulado, su estado real y lo último que
construiste. Es la vitrina, no la configuración: lo que se ajusta vive en
Ajustes, en tres secciones — cómo sube cada barra, tus datos y salir.

### Lo que no va

- Nada de rachas ni insignias (regla 5). El premio es ver la trayectoria.
- Nada de porcentajes por todos lados. Una barra por pantalla.
- El color solo señala rama y progreso. El resto es monocromo (sección 5 de
  `CLAUDE.md`).

---

## 6. Lo que falta decidir

- Qué se ve al entrar cuando todavía no hay ningún objetivo.
- Cómo se ve La Sombra: el costo acumulado de lo que lleva meses sin fecha.
- Si «adoptar» un objetivo suelto se ofrece solo o hay que buscarlo.
