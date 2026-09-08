# No Soy Peter Pan

> Un juego para salir de Nunca Jamás. Algún día no existe.

Plataforma web donde la gente define hacia dónde quiere ir y convierte esa
dirección en acciones concretas de hoy. La idea, el léxico del producto y las
reglas de diseño viven en [`CLAUDE.md`](./CLAUDE.md).

## Monorepo

```
apps/
  web/       Next.js 15 (App Router) + Tailwind v4  -> Vercel
  api/       Fastify 5 + TypeScript                 -> Railway
packages/
  shared/    Tipos del dominio y contratos HTTP
supabase/
  migrations/  SQL idempotente, se aplica desde el dashboard
docs/
  ENTORNO.md    Qué variable va en qué servicio
  DESPLIEGUE.md Cómo se despliega y cómo se verifica
```

pnpm workspaces + Turborepo.

## Cómo se trabaja

Este proyecto **no corre en local** y **no usa archivos `.env`**. Todas las
claves viven en las variables de Vercel y Railway. Se prueba haciendo push a
`dev` y abriendo el preview de Vercel.

| Rama | Ambiente |
| --- | --- |
| `dev` | Vercel Preview + Railway dev + `dev_NoSoyPeterPan` |
| `main` | Vercel Production + Railway prod + `prod_NoSoyPeterPan` |

Todo cambio va a `dev`. `main` solo se toca cuando se pide.

## Ambientes en vivo

| Servicio | dev | prod |
| --- | --- | --- |
| Frontend | `dev-nosoypeterpan.vercel.app` | `nosoypeterpan.vercel.app` |
| API | `nosoypeterpan-dev.up.railway.app` | `nosoypeterpan-production.up.railway.app` |
| Supabase | `dev_NoSoyPeterPan` | `prod_NoSoyPeterPan` |

## Estado

**Base terminada y verificada de punta a punta** (2026-09-08):

- Monorepo desplegándose solo: push a `dev` levanta un preview de Vercel y el
  ambiente dev de Railway.
- Autenticación completa con Supabase: alta, ingreso, sesión en cookies,
  `/mapa` protegida por middleware.
- El API valida el token de Supabase que emite el navegador. `/mapa` tiene un
  botón que hace ese viaje completo y devuelve `200` con el id del usuario.
- Cero secretos en el repo. Ninguna variable quemada, ningún `.env`.

**Lo que falta es el producto.** El dominio del juego —Norte, Rutas, Misiones,
Nunca Jamás, Votos— está tipado en `packages/shared` pero no implementado: no
existe todavía ninguna tabla suya en Supabase. El plan está en `CLAUDE.md`.

## Verificar que todo sigue vivo

1. `https://<api>/health` responde `{"ok":true,...}` con el `entorno` correcto.
2. La landing carga y `/entrar` deja crear cuenta.
3. En `/mapa`, "Probar conexión con el API" devuelve `200` con tu id.

El sello de build en `/mapa` (`preview · a0d8243`) dice qué versión estás viendo.
