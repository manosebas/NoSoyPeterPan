'use client';

import { createBrowserClient } from '@supabase/ssr';
import { envSupabase } from '@/env';

/**
 * Cliente de navegador. Escribe la sesion en cookies, lo que permite que el
 * middleware y los Server Components la lean sin pasarla a mano.
 */
export function createClienteNavegador() {
  const { url, anonKey } = envSupabase();
  return createBrowserClient(url, anonKey);
}
