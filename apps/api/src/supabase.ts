import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Env } from './env.js';

/**
 * Cliente con anon key: se usa unicamente para validar el access token que
 * manda el frontend. Nunca escribe datos.
 */
export function clienteAnon(env: Env): SupabaseClient {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Cliente con service role: salta RLS. Solo para operaciones de servidor.
 * Nunca exponer esta key ni su cliente al navegador.
 */
export function clienteAdmin(env: Env): SupabaseClient {
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
