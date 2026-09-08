import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { envSupabase } from '@/env';

/**
 * Cliente para Server Components y Route Handlers.
 * En Server Components `setAll` no puede escribir cookies: el refresco de token
 * lo hace el middleware, asi que ahi se ignora el error a proposito.
 */
export async function createClienteServidor() {
  const { url, anonKey } = envSupabase();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component: el middleware ya refresco la sesion.
        }
      },
    },
  });
}
