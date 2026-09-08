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
| `NEXT_PUBLIC_API_URL` | dominio prod del API | dominio dev del API | URL de Railway, sin `/` final |

`NEXT_PUBLIC_*` se inlinea en build: cambiarla exige un redeploy, no basta con
guardar. Nunca poner aqui la service role key: todo lo que empieza con
`NEXT_PUBLIC_` viaja al navegador.

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

Valor sugerido de `CORS_ORIGINS`:

- dev: `https://*.vercel.app`
- prod: `https://tudominio.com,https://www.tudominio.com`

## Donde se sacan las claves de Supabase

Dashboard del proyecto > Settings > API:

- *Project URL* -> `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
- *anon public* -> `SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- *service_role* -> `SUPABASE_SERVICE_ROLE_KEY` (solo Railway)
