# No Soy Peter Pan

> Un juego para salir de Nunca Jamás.
> Algún día no existe.
> Deja de vivir por accidente.

Plataforma web donde las personas definen hacia dónde quieren ir y convierten esa dirección en acciones concretas del día de hoy.

---

## 1. La idea

Peter Pan no es simplemente "el niño que no crece". Representa una forma de vivir: permanecer en un presente eterno, sin asumir del todo las consecuencias del futuro. Vive aventuras, improvisa, reacciona a lo que aparece, sigue lo que le provoca en el momento. No tiene dirección: vive lo que el día le pone delante.

Hay una diferencia enorme entre:

- *"Hoy me desperté. ¿Qué tengo que hacer?"*
- *"Sé hacia dónde quiero ir. ¿Qué tengo que hacer hoy para acercarme?"*

En el primer caso el día decide por ti. Aparecen WhatsApps, trabajo, invitaciones, pendientes, problemas, ideas nuevas, cansancio, entretenimiento… y vas respondiendo. Puedes estar ocupadísimo, sentir que hiciste mil cosas, y que ninguna construya la vida que querías. Eso es muy Peter Pan: aventura tras aventura, día tras día, sin trayectoria consciente.

**No soy Peter Pan = acepto que mi vida tiene dirección.**

Crecer no consiste solamente en pagar cuentas, trabajar o "tener responsabilidades". Consiste en aceptar algo más incómodo:

> **Mi yo de hoy es responsable de la vida que va a recibir mi yo del futuro.**

Si quieres cierta carrera, empresa, cuerpo, relación, patrimonio, familia, estilo de vida o libertad dentro de cinco años, esa persona no aparece mágicamente dentro de cinco años. **Se construye un martes cualquiera**, con decisiones pequeñas que muchas veces no tienen recompensa inmediata.

### La paradoja

Peter Pan parece libre porque no tiene responsabilidades. Pero la verdadera libertad *requiere* responsabilidad:

- Si nunca administras tu dinero, dependes del dinero.
- Si nunca cuidas tu cuerpo, dependes de las consecuencias.
- Si nunca construyes tu carrera, dependes de las oportunidades que aparezcan.
- Si nunca decides qué quieres, dependes de lo que los demás quieran para ti.

Asumir responsabilidad no significa volverte aburrido. Significa ganarte la capacidad de elegir tu vida.

### La tesis

> **Crecer no significa dejar de jugar. Significa dejar de jugar con tu futuro.**

No eliminamos la espontaneidad. La meta *no* es convertir la vida en una hoja de Excel donde cada minuto tiene función. Peter Pan tiene algo que vale la pena conservar: curiosidad, juego, aventura, imaginación.

La evolución es: **conservar al niño, pero darle un volante al adulto.**

---

## 2. Conceptos del producto (léxico canónico)

Estos nombres son parte de la identidad. Usarlos en UI, copy, nombres de modelos y de rutas siempre que sea natural.

| Concepto | Qué es | Equivalente aburrido |
|---|---|---|
| **Nunca Jamás** | El lugar donde viven todas las cosas que dices "algún día voy a…". Bandeja de intenciones sin fecha. | Backlog / someday list |
| **Algún Día** | Un deseo aún no aterrizado. Vive en Nunca Jamás hasta que se le pone calendario. | Idea sin plan |
| **El Norte / Destino** | La visión a 5 años. Quién quieres ser. | Long-term vision |
| **Territorios** | Áreas de vida donde ocurre el crecimiento (carrera, dinero, cuerpo, relaciones, mente, aventura). | Life areas |
| **Rutas** | Objetivos de 1 año y de 90 días que conectan el hoy con el Norte. | Goals / OKRs |
| **Misiones** | Acciones de la semana y del día. Siempre trazables a una Ruta. | Tasks |
| **Votos** | Cada misión completada es un voto por la persona que quieres ser. Es la unidad de progreso, no el "check". | XP / points |
| **El Mapa** | Vista que muestra la cadena completa: Norte → Año → 90 días → Semana → Hoy. | Roadmap |
| **La Sombra** | Lo que se pierde por no actuar. El costo de quedarse en Nunca Jamás. | Cost of inaction |
| **Salir de Nunca Jamás** | Acto de convertir un "Algún Día" en algo con fecha, dueño y primer paso. | Planning |

### La conversión central del producto

```
Algún día  →  5 años  →  1 año  →  90 días  →  esta semana  →  hoy
```

Todo el producto existe para hacer que esa cadena sea fácil de crear, visible y difícil de romper.

---

## 3. Reglas de diseño (no negociables)

1. **Ninguna misión es huérfana.** Cada tarea diaria debe poder responder: *"¿A qué objetivo de mi vida está contribuyendo esto?"* Si no puede, el producto lo señala. Un checklist sin dirección es exactamente el problema que atacamos.
2. **El resultado se resignifica, no se lista.** La UI no dice "tarea completada". Dice qué compraste con esa acción:
   - No fuiste al gimnasio → *votaste por la persona que quieres ser*.
   - No terminaste una propuesta → *construiste una parte de tu futuro profesional*.
   - No ahorraste $200 → *compraste un poquito de libertad futura*.
3. **La dirección primero, la ejecución después.** No se puede crear misiones antes de tener un Norte. El onboarding obliga a definir destino antes que to-dos.
4. **Nunca Jamás es visible, no oculto.** El usuario debe *ver* su lista de "algún día" y sentir su peso. Es el antagonista del juego.
5. **Juego sí, gamificación barata no.** Nada de badges vacíos ni streaks que castiguen. La recompensa es ver la trayectoria, no coleccionar confeti.
6. **Se conserva la espontaneidad.** Debe existir espacio explícito para aventura/curiosidad sin culpa. El producto no persigue el 100% de ocupación.
7. **Honestidad con el usuario.** Si lleva 3 semanas sin avanzar en una Ruta, se dice. Sin humillar, sin maquillar.

---

## 4. Tono de voz

- Rebelde, con humor seco, pero con filosofía seria detrás.
- Segunda persona, directo, corto. Frases que golpean.
- Nunca corporativo ("optimiza tu productividad", "maximiza tu rendimiento"). Nunca coach de superación tóxico.
- Ejemplos del registro correcto: *"Algún día no existe en el calendario."* / *"Eso lleva 8 meses en Nunca Jamás."* / *"Se construye un martes cualquiera."*

### La frase de oro

Manifiesto fundacional. Cita textual, no parafrasear:

> "Una vida, solo una, ¿por qué no corremos como si estuviéramos en llamas hacia nuestros sueños más salvajes? Tenemos una sola oportunidad en esto. Quiero que la gente me vea y diga: ese tipo está loco. Bien. Tengo una sola oportunidad en esta vida, prefiero que me llames loco y soñador que conformista. Estás hecho para destacar."

Es la vara para medir tono y decisiones. Si un copy o una feature suena tibio, corporativo o conformista, contradice la frase.

---

## 5. Identidad visual

- **Logo**: `logo.png` — avión de papel de línea continua trazando una trayectoria ascendente. El juego (avión de papel, infancia) que *sube* con dirección. Resume la tesis entera.
- **Estilo**: monocromo, mucho blanco, línea fina, sans-serif geométrica. Minimal y adulto, no infantil.
- Color de acento: pendiente de definir; usar con extrema moderación (solo para señalar dirección/progreso).

---

## 6. Alcance y estado

Plataforma web donde la gente entra a organizar sus objetivos y cumplirlos. Ese es el core; todo lo demás es secundario hasta nuevo aviso.

**Estado actual**: base desplegada y verificada de punta a punta (2026-09-08). Landing, autenticación con Supabase (alta, ingreso, sesión en cookies), ruta protegida `/mapa` y API en Railway validando el token. Los cuatro ambientes viven y se hablan entre sí; los dominios están en `docs/DESPLIEGUE.md`.

Lo que falta es el producto: el dominio del juego está tipado en `packages/shared` pero no implementado. No existe todavía ninguna tabla de Norte, Rutas, Misiones ni Nunca Jamás.

### Decisiones pendientes

- [ ] Modelo de datos completo (Norte, Rutas, Misiones, Nunca Jamás) y sus migraciones
- [ ] Alcance del MVP
- [ ] Onboarding: cómo se define el Norte por primera vez
- [ ] Web-only o también móvil
- [ ] Modelo de negocio
- [ ] Tipografía de marca y color de acento

---

## 7. Arquitectura

```
apps/
  web/       Next.js 15 (App Router) + React 19 + Tailwind v4  -> Vercel
  api/       Fastify 5 + TypeScript                            -> Railway
packages/
  shared/    Tipos del dominio y contratos HTTP  (@nspp/shared)
supabase/
  migrations/  SQL idempotente, se aplica desde el dashboard
docs/
  ENTORNO.md    qué variable va en qué servicio
  DESPLIEGUE.md cómo se despliega y cómo se verifica
```

pnpm workspaces + Turborepo. Auth y base de datos en Supabase.

### Ambientes

| Rama | Vercel | Railway | Supabase |
| --- | --- | --- | --- |
| `dev` | Preview | ambiente dev | `dev_NoSoyPeterPan` |
| `main` | Production | ambiente prod | `prod_NoSoyPeterPan` |

---

## 8. Reglas de trabajo (operativas)

1. **Todo push va a `dev`.** `main` solo se toca cuando el usuario lo pide explícitamente.
2. **Push a `dev` después de cada cambio.** Es el mecanismo de prueba: no hay entorno local.
3. **El proyecto no corre en local y no usa archivos `.env`.** Se prueba en el preview de Vercel.
4. **Cero secretos en el repo.** Toda clave vive en las variables de Vercel y Railway. Si algo necesita una variable nueva, se documenta en `docs/ENTORNO.md` y el código falla con un mensaje que la nombra.
5. **El build no puede depender de secretos.** CI compila sin ninguna variable definida; si eso rompe, hay una key quemada.
6. **La `service_role` key jamás sale del backend.** Nada sensible detrás de un prefijo `NEXT_PUBLIC_`.

---

## 9. Notas para Claude

- Idioma del proyecto: **español** para producto, copy, UI y documentación. Código en inglés (identificadores, nombres de archivo) salvo los términos del léxico canónico de la sección 2, que se conservan en español (`nuncaJamas`, `mision`, `ruta`, `norte`) porque son dominio, no vocabulario genérico.
- Antes de proponer features, verificar que respeten las reglas de la sección 3. Especialmente la regla 1: si una feature permite crear tareas sueltas sin conexión al Norte, está mal planteada.
- Este archivo es la fuente de verdad conceptual. Actualizarlo cuando cambien decisiones, no dejarlo obsoleto.
