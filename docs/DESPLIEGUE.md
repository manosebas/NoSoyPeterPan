# Despliegue

## Ramas

| Rama | Ambiente |
| --- | --- |
| `dev` | Vercel Preview + Railway dev + `dev_NoSoyPeterPan` |
| `main` | Vercel Production + Railway prod + `prod_NoSoyPeterPan` |

Todo cambio va a `dev`. `main` solo se actualiza cuando se pide explicitamente.

## Dominios

| Servicio | dev | prod |
| --- | --- | --- |
| Frontend | `dev-nosoypeterpan.vercel.app` | `nosoypeterpan.vercel.app` |
| API | `nosoypeterpan-dev.up.railway.app` | `nosoypeterpan-production.up.railway.app` |
| Supabase | `dev_NoSoyPeterPan` | `prod_NoSoyPeterPan` |

Verificado de punta a punta el 2026-09-08: `/mapa` > "Probar conexion con el
API" devuelve 200 con el id del usuario en los dos ambientes.

## Detalle: Vercel salta builds por ruta

Con Root Directory en `apps/web`, Vercel ignora los pushes que no tocan esa
carpeta. Eso dejaba fuera `packages/shared`, del que el frontend si depende, y
tambien los commits vacios. `apps/web/vercel.json` fuerza el build en cada push
con `ignoreCommand: "exit 1"`.

Otro detalle: si `dev` y `main` apuntan al mismo commit, Vercel reusa el
deployment y una de las dos ramas no construye. Para forzar los dos, cada rama
necesita su propio commit.

## Vercel (frontend)

Al importar el repo:

- **Root Directory**: `apps/web`
- **Framework**: Next.js (se detecta solo)
- Dejar activada la opcion de incluir archivos fuera del root directory, porque
  el build depende de `packages/shared`.
- **Production Branch**: `main`. Cualquier otra rama genera preview.

`apps/web/vercel.json` ya fija el install y el build para que Turborepo compile
primero `@nspp/shared`.

## Railway (backend)

**Un solo servicio: el API.** Al importar el repo, Railway detecta el monorepo
pnpm y propone un servicio por workspace (`@nspp/api` y `@nspp/web`). El de web
se elimina: el frontend vive en Vercel. Dejarlo en los dos lados duplica costo y
rompe el flujo de previews.

Configuracion del servicio que queda:

- **Root Directory**: la raiz del repo (`/`), no `apps/api`. El build necesita
  el workspace completo para compilar antes `@nspp/shared`.
- El dominio publico (Settings > Networking) y todas las variables se
  configuran **en este servicio**.

Un proyecto con dos ambientes, cada uno conectado a su rama:

- ambiente dev -> rama `dev`
- ambiente prod -> rama `main`

`railway.json` en la raiz define build, arranque y healthcheck en `/health`, y
limita los redespliegues a cambios que tocan el backend (`watchPatterns`): un
cambio solo de frontend ya no reconstruye el API.

## Orden de la primera puesta en marcha

1. Aplicar `supabase/migrations/0001_perfiles.sql` en los dos proyectos de Supabase.
2. Configurar Auth en Supabase (ver `supabase/README.md`).
3. Vercel: importar repo, cargar variables, desplegar.
4. Railway: conectar repo, cargar variables, desplegar los dos ambientes.
5. Volver a Vercel y agregar `NEXT_PUBLIC_API_URL` con los dominios de Railway.
6. Volver a Railway y ajustar `CORS_ORIGINS` con los dominios reales de Vercel.
7. Redesplegar el frontend para que tome `NEXT_PUBLIC_API_URL`.

## Verificacion

- `GET https://<api>/health` responde `{"ok":true,...}`.
- La landing carga y `/entrar` permite crear cuenta.
- Tras entrar, `/mapa` muestra el correo del usuario.
- En `/mapa`, "Probar conexion con el API" devuelve `200` con el id del usuario:
  eso confirma sesion, cookies, token y CORS de punta a punta.
