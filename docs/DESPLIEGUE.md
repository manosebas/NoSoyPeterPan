# Despliegue

## Ramas

| Rama | Ambiente |
| --- | --- |
| `dev` | Vercel Preview + Railway dev + `dev_NoSoyPeterPan` |
| `main` | Vercel Production + Railway prod + `prod_NoSoyPeterPan` |

Todo cambio va a `dev`. `main` solo se actualiza cuando se pide explicitamente.

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

Un proyecto con dos ambientes, cada uno conectado a su rama:

- ambiente dev -> rama `dev`
- ambiente prod -> rama `main`

`railway.json` en la raiz define build, arranque y healthcheck en `/health`.
El servicio apunta a la raiz del repo, no a `apps/api`.

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
