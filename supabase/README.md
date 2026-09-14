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
  - prod: `https://nosoypeterpan.com`.
- **Redirect URLs**
  - dev: `https://*.vercel.app/**`, porque cada push genera un dominio de
    preview distinto.
  - prod: `https://nosoypeterpan.com/**` y `https://www.nosoypeterpan.com/**`.

Si la URL que pide la app no esta en *Redirect URLs*, Supabase la descarta
**sin avisar** y manda al Site URL pelado con `?code=`. Nadie canjea ese codigo
y el usuario queda en la landing sin sesion. Paso el 2026-09-14 al estrenar el
dominio con `www`.

## Correo (prod)

SMTP propio con Resend y template de *Confirm signup* propio. Configuracion
completa en `docs/DESPLIEGUE.md` > Correo.

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
