# El juego

Cómo funciona No Soy Peter Pan por dentro: qué se guarda, qué se calcula y qué
se ve. Para el porqué y el léxico, ver `CLAUDE.md`.

---

## 1. La regla de todo

Un objetivo grande se parte en objetivos más chicos. Esos se vuelven a partir.
Se sigue partiendo hasta llegar a algo que se pueda hacer.

```
Cambiar de carrera                    3 años
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

Seis tablas. Una es catálogo, cuatro son del usuario y una es historia.

### `objetivos` — el árbol

Se apunta a sí misma por `padre_id`.

| Campo | Para qué |
|---|---|
| `usuario_id` | Dueño. Toda política de RLS cuelga de aquí. |
| `padre_id` | De quién cuelga. `null` = es una raíz. |
| `categoria_id` | A qué rama de la vida aporta. Se hereda del padre. |
| `titulo` | Lo que la persona escribe. |
| `detalle` | Opcional, hasta 2000 caracteres. De qué se trata y por dónde: el contexto que hace falta para recomendar algo. Se pide al crear y se lee en la pantalla del objetivo. |
| `vence_el` | Fecha. `null` = vive en Nunca Jamás. |
| `completado_en` | Cuándo se marcó. Solo lo llevan las hojas. |
| `orden` | Orden manual dentro de su nivel. Todavía sin UI. |
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
sin dueño: es un catálogo, no datos de usuario, y por eso solo tiene política de
lectura. Diez de semilla — salud, dinero, carrera, relaciones, mente, aventura,
familia, hogar, aprendizaje, espiritualidad. Agregar una es una fila de SQL, no
un despliegue.

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
de significar algo.

### `metas_categoria` — cómo sube tu barra

`votos_por_nivel` por usuario y rama. Sin fila, valen 30.

### `preferencias` — cuánto dura cada plazo

`dias_largo`, `dias_mediano`, `dias_corto` por usuario, con un `check` que exige
largo > mediano > corto. Sin fila, valen 1095, 365 y 90.

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

## 3. Los plazos

Cinco, más la ausencia de fecha. `vence_el` es el dato real; el plazo solo
decide qué día se propone al crear y cómo se lee esa fecha después.

| Plazo | Dura | ¿Se configura? |
|---|---|---|
| Largo | 3 años | sí |
| Mediano | 1 año | sí |
| Corto | 90 días | sí |
| Esta semana | 7 días | no |
| Hoy | 0 días | no |
| Sin fecha | — | es Nunca Jamás |

Los tres primeros los ajusta cada persona en Ajustes, porque largo plazo no
significa lo mismo para todos. Una semana son siete días para todo el mundo, y
hoy es hoy.

Al crear, el plazo llega elegido **un escalón por debajo del padre**: lo que
cuelga de algo siempre vence antes que ese algo. Sin padre con fecha —una raíz,
o un padre en Nunca Jamás— se cae en la altura del árbol: raíz → largo, primer
desglose → mediano, después corto, más abajo esta semana. Si el padre está
vencido, el hijo nace para hoy. Y si la fecha propuesta se pasa de la del padre,
se recorta a la del padre antes de mandarla — la base la rechazaría, y un error
en la cara por algo que el producto puede resolver solo es mal producto.

Cambiar las duraciones no mueve ninguna fecha ya escrita.

---

## 4. La fuerza de una rama

Aquí el progreso **no** es un porcentaje de completado, y es a propósito: si la
fuerza de *salud* fuera *cumplidas / totales*, el día que te propones algo nuevo
tu rama se debilitaría. El producto castigaría la ambición.

```
nivel = ⌊ votos / votos_por_nivel ⌋ + 1
barra = (votos módulo votos_por_nivel) / votos_por_nivel
```

La barra empieza en cero, sube con cada objetivo cumplido y al llenarse pasa de
nivel y vuelve a empezar. Nunca baja. Quien quiere gimnasio diario pone 30 y
llena su barra en un mes; quien apunta a una vez por semana pone 12.

Al lado va el dato que la barra no puede dar, porque la barra solo sube:

> **Dinero** · Nivel 2 · 18 votos — quieta hace 3 semanas.

Eso es la regla 7: se dice sin humillar y sin maquillar.

---

## 5. Los to-do del día

«Sacar la basura» no cuelga de ningún objetivo grande y nunca va a colgar. La
regla 1 dice que ninguna *misión* es huérfana, y se sostiene: en `objetivos`
todo tiene rama, árbol y voto, sin una sola excepción.

Los to-do son otra cosa y por eso son otra tabla. La vida tiene mantenimiento, y
negarlo hace la herramienta inútil para el martes real; pero contarlo como
progreso sería mentir. Así que se pueden anotar, se marcan, desaparecen, y no
dejan rastro en ninguna barra.

---

## 6. Cómo se ve

Todas las pantallas con sesión pasan por `<Pagina>`: una sola medida (1152 px) y
el mismo padding, para que la barra superior no baile entre rutas. En desktop
cada una reparte ese ancho en columnas en vez de estirar una sola.

### Hoy — el nivel de las hojas

Entrada de la app, en dos columnas. A la derecha *To-do*: se escribe en una
línea, se marca, desaparece. A la izquierda *De tus objetivos*, en tres bloques,
y solo hojas: un objetivo con desglose se cumple cuando se cumplen sus pasos.

| Bloque | Qué trae | Cómo se ve |
|---|---|---|
| **Vencido** | `vence_el` anterior a hoy | primero y en color, con «venció hace 12 días» |
| **Hoy** | `vence_el` de hoy, más lo que se marcó hoy | con casilla |
| **Esta semana** | `vence_el` dentro de los próximos 7 días | plegado, sin casilla, con «Hacer hoy» |

Lo sin fecha no entra nunca: eso es Nunca Jamás y vive en el Mapa.

Cada paso es una tarjeta con la franja de su rama y el camino entero hasta el
objetivo grande del que cuelga — nunca marcas algo sin ver para qué. Aquí se
mezclan árboles distintos, y sin ese camino la pantalla vuelve a ser un checklist
sin dirección, que es el problema que atacamos.

«Esta semana» no tiene casillas a propósito: se mira, no se marca. Si algo de
ahí se va a hacer hoy, **«Hacer hoy»** le mueve la fecha al día de hoy y salta al
bloque de arriba. Esperar a que algo se venza para hacerlo es dejar que el
calendario decida por ti, que es exactamente lo que Peter Pan hace.

### La pantalla de un objetivo — un nodo

Migas hasta la raíz, «volver al mapa», el título con su casilla si es hoja, y
debajo la ficha en una línea chica: para cuándo, plazo y su duración. La rama no
se repite ahí porque ya va en las migas, y en color. Después el detalle si lo
hay, la barra de avance, y el desglose a todo el ancho, que es a lo que se viene.

Una fila del desglose que a su vez tiene desglose lo asoma sin cambiar de
pantalla: en desktop al pasar el mouse, en teléfono al tocarla una vez. Se ven
hasta seis pasos y un «Ver todos». En desktop el clic en el título sigue
entrando; donde no hay hover, el primer toque asoma y el segundo entra.

El engranaje de arriba a la derecha abre lo que se puede cambiar —detalle, rama,
fecha— y el borrado, que pide confirmación en su propio modal.

Solo las hojas tienen casilla. Esa diferencia visual es toda la explicación que
necesita la regla: se marca lo que ya no se puede partir.

### Mapa — todo, en dos modos

El botón «Agregar objetivo» abre un modal con título, detalle, rama y plazo;
cada plazo muestra su duración y la fecha exacta en que quedaría. Los dos modos
son el mismo árbol a distinta altura, y el elegido se recuerda en el navegador:

- **Cascada** — por plazo, con el desglose completo.
- **Categorías** — por parte de tu vida, cada una con su nivel y su fuerza.

Cada raíz es una tarjeta con la franja de su rama a la izquierda, y el desglose
dibuja las líneas que unen padre e hijo en ese color: sin ellas, seis niveles de
indentación son seis márgenes que medir a ojo.

```
LARGO PLAZO  3 años                                    2

┃ SALUD
┃ Correr un maratón                            dic 2028
┃ ████████░░░░░░  3 de 5 · 2 pasos
┃ ├─ ▸ 10K en junio              2/4      jun 2027
┃ │  ├─ ☑ Zapatillas nuevas               12 mar
┃ │  └─ ☐ Plan de 12 semanas              20 mar
┃ └─ ☐ Media maratón                      mar 2028
```

### Perfil — la suma

La vitrina, no la configuración. Avatar, nombre y el total de votos; cada rama
como tarjeta con su nivel, su barra, cuánto falta para el siguiente y su estado
real. Abajo, lo último que construiste y las ramas sin tocar.

### Ajustes — la única configuración

Dos columnas y una sola pantalla, sin scroll de página: la lista de secciones a
la izquierda y solo la abierta a la derecha. Tres secciones — *En qué nivel
juegas la vida* (duración de los plazos y votos por nivel), *Perfil* (foto,
nombre, correo, contraseña) y *Salir*.

### Lo que no va

- Nada de rachas ni insignias (regla 5). El premio es ver la trayectoria.
- Nada de porcentajes por todos lados. Una barra por bloque.
- El color solo señala rama y progreso. El resto es monocromo (sección 5 de
  `CLAUDE.md`).

---

## 7. Lo que falta decidir

- Cómo se ve La Sombra: el costo acumulado de lo que lleva meses sin fecha.
- Si «Sin fecha» debe mostrar cuánto lleva esperando cada objetivo.
- Cómo se reordena y se renombra un objetivo: `orden` existe en la tabla pero
  la interfaz todavía no lo mueve.
