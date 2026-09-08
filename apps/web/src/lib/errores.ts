/**
 * Texto de un error para mostrarle al usuario.
 *
 * Supabase no lanza `Error`: sus fallos (PostgrestError, StorageError) son
 * objetos planos con `message`. Con `instanceof Error` el motivo real se perdia
 * y todo terminaba en el mensaje de respaldo.
 */
export function mensajeError(e: unknown, respaldo: string): string {
  if (typeof e === 'object' && e !== null && 'message' in e) {
    const mensaje = (e as { message?: unknown }).message;
    if (typeof mensaje === 'string' && mensaje.trim() !== '') return mensaje;
  }
  return respaldo;
}
