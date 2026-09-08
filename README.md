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

## Estado

Base del proyecto: monorepo, backend con verificación de tokens, landing y
autenticación con Supabase (alta, ingreso, sesión en cookies, ruta protegida
`/mapa`). El dominio del juego —Norte, Rutas, Misiones, Nunca Jamás— está
tipado en `packages/shared` pero todavía no implementado.
