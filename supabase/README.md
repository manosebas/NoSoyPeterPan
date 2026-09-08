# Supabase

Dos proyectos, un ambiente cada uno:

| Proyecto Supabase | Usado por |
| --- | --- |
| `dev_NoSoyPeterPan` | Vercel Preview + Railway dev (rama `dev`) |
| `prod_NoSoyPeterPan` | Vercel Production + Railway prod (rama `main`) |

## Aplicar migraciones

No usamos CLI local. Cada archivo de `migrations/` se pega en el **SQL Editor**
del dashboard, primero en `dev_NoSoyPeterPan` y despues en `prod_NoSoyPeterPan`.
Los scripts son idempotentes: se pueden correr mas de una vez.

Aplicadas hasta hoy en los dos proyectos: `0001_perfiles.sql`.

## Configuracion de Auth (una vez por proyecto)

En **Authentication > URL Configuration**:

- **Site URL**
  - dev: la URL estable del preview de la rama `dev` en Vercel.
  - prod: el dominio de produccion.
- **Redirect URLs**: agregar `https://*.vercel.app/**` en el proyecto de dev,
  porque cada push genera un dominio de preview distinto.

En **Authentication > Providers > Email**: en `dev_NoSoyPeterPan` conviene
desactivar *Confirm email* para poder probar el alta sin salir del navegador.
En `prod_NoSoyPeterPan` se deja activado.

## Como se usan las claves

| Clave | Donde vive | Por que |
| --- | --- | --- |
| Project URL | Vercel y Railway | publica |
| `anon` / publishable | Vercel y Railway | publica, la protege RLS |
| `service_role` / secret | **solo Railway** | salta RLS, jamas al navegador |

## Al crear tablas nuevas

Toda tabla del dominio lleva RLS activo y politicas por `auth.uid()`, como
`perfiles` en `0001`. Sin RLS, la anon key deja leer todo a cualquiera.
