'use client';

import type { RespuestaError } from '@nspp/shared';
import { urlApi } from '@/env';
import { createClienteNavegador } from '@/lib/supabase/client';

/** Un error que el API explico. `codigo` dice que paso; `message`, que mostrar. */
export class ErrorApi extends Error {
  constructor(
    readonly codigo: string,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = 'ErrorApi';
  }
}

/**
 * POST al API de Railway con el token de la sesion. El API valida ese token
 * con Supabase: sin sesion no hay llamada.
 */
export async function postApi<T>(ruta: string, cuerpo: unknown): Promise<T> {
  const base = urlApi();
  if (!base) throw new ErrorApi('sin_api', 'Falta NEXT_PUBLIC_API_URL en este ambiente.');

  const {
    data: { session },
  } = await createClienteNavegador().auth.getSession();
  if (!session) throw new ErrorApi('sin_sesion', 'Tu sesión expiró. Vuelve a entrar.');

  let respuesta: Response;
  try {
    respuesta = await fetch(`${base}${ruta}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cuerpo),
    });
  } catch {
    throw new ErrorApi('sin_red', 'No hubo conexión. Revisa tu internet e intenta de nuevo.');
  }

  const datos = (await respuesta.json().catch(() => null)) as T | RespuestaError | null;
  if (respuesta.ok && datos) return datos as T;

  const error = (datos as RespuestaError | null)?.error;
  throw new ErrorApi(error?.codigo ?? 'desconocido', error?.mensaje ?? 'Algo falló. Intenta de nuevo.');
}
