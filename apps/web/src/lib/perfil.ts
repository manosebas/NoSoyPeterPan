import type { Perfil } from '@nspp/shared';
import { createClienteServidor } from '@/lib/supabase/server';

/** Fila cruda de public.perfiles: snake_case, como vive en Postgres. */
type FilaPerfil = {
  id: string;
  nombre: string | null;
  avatar_url: string | null;
  creado_en: string;
};

export type SesionConPerfil = {
  usuarioId: string;
  email: string | null;
  perfil: Perfil | null;
};

/**
 * Usuario de la sesion mas su fila de perfiles.
 * Devuelve null si no hay sesion: cada pagina decide si redirige.
 * El perfil puede venir null si el trigger de alta todavia no corrio.
 */
export async function obtenerSesionConPerfil(): Promise<SesionConPerfil | null> {
  const supabase = await createClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('perfiles')
    .select('id, nombre, avatar_url, creado_en')
    .eq('id', user.id)
    .maybeSingle<FilaPerfil>();

  return {
    usuarioId: user.id,
    email: user.email ?? null,
    perfil: data
      ? { id: data.id, nombre: data.nombre, avatarUrl: data.avatar_url, creadoEn: data.creado_en }
      : null,
  };
}

/** Como llamar a alguien cuando aun no puso nombre. */
export function nombreVisible(perfil: Perfil | null, email: string | null): string {
  const nombre = perfil?.nombre?.trim();
  if (nombre) return nombre;
  return email?.split('@')[0] ?? 'Tú';
}

/** Iniciales para el avatar cuando no hay imagen. Maximo dos letras. */
export function iniciales(texto: string): string {
  const partes = texto.trim().split(/\s+/).slice(0, 2);
  const letras = partes.map((p) => p[0]).join('');
  return (letras || '?').toUpperCase();
}
