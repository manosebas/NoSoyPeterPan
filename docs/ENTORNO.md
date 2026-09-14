# Variables de entorno

Regla del proyecto: **nada quemado en codigo y sin archivos `.env`**. El proyecto
no corre en local; se prueba haciendo push a `dev` y abriendo el preview de Vercel.

Cada variable vive en el dashboard del servicio que la necesita, con un valor
distinto por ambiente. Si falta alguna, el arranque falla con un mensaje que la
nombra: preferimos romper el deploy antes que servir trafico mal configurado.

## Vercel — `apps/web`

Settings > Environment Variables. Marcar el ambiente correspondiente.

| Variable | Production | Preview | Que es |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | prod_NoSoyPeterPan | dev_NoSoyPeterPan | Project URL de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | prod_NoSoyPeterPan | dev_NoSoyPeterPan | Clave publica (anon) |
| `NEXT_PUBLIC_API_URL` | `https://nosoypeterpan-production.up.railway.app` | `https://nosoypeterpan-dev.up.railway.app` | URL de Railway, sin `/` final |

La misma variable se define dos veces, cambiando el ambiente marcado. Nunca
marcar Production y Preview en la misma entrada: produccion terminaria pegandole
a la base de dev. *Development* no se usa nunca: el proyecto no corre en local.

`NEXT_PUBLIC_*` se inlinea en build: cambiarla exige un redeploy, no basta con
guardar. Nunca poner aqui la service role key: todo lo que empieza con
`NEXT_PUBLIC_` viaja al navegador.

Al pegar valores: sin comillas, sin `/` al final y sin espacios invisibles.

## Railway — `apps/api`

Variables del servicio, un set por ambiente.

| Variable | Que es |
| --- | --- |
| `APP_ENV` | `dev` o `prod` |
| `SUPABASE_URL` | Project URL del proyecto de Supabase que corresponda |
| `SUPABASE_ANON_KEY` | Clave publica. Solo se usa para validar tokens |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave secreta. Salta RLS, jamas sale del servidor |
| `CORS_ORIGINS` | Origenes permitidos, separados por coma. Admite `*` |
| `PORT` | La inyecta Railway. No definirla a mano |

Valor actual de `CORS_ORIGINS`:

- dev: `https://*.vercel.app` — el comodin es necesario, cada push genera un
  dominio de preview distinto.
- prod: `https://nosoypeterpan.com,https://nosoypeterpan.vercel.app`. El segundo
  solo redirige al primero; se puede quitar cuando no quede nadie entrando por ahi.
  Si el principal pasara a ser `www`, hay que agregarlo: sin eso la web carga
  pero toda llamada al API falla por CORS.

## Fuera de Vercel y Railway

La API key de **Resend** vive solo en Supabase prod (SMTP Settings). No es una
variable de la app y ningun servicio nuestro la lee. Detalle en `DESPLIEGUE.md`.

## Donde se sacan las claves de Supabase

Dashboard del proyecto > Settings > API:

- *Project URL* -> `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
- *anon public* -> `SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- *service_role* -> `SUPABASE_SERVICE_ROLE_KEY` (solo Railway)
