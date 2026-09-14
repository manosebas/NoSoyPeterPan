/** Contratos compartidos entre apps/api y apps/web. */

export interface RespuestaSalud {
  ok: true;
  servicio: 'nspp-api';
  entorno: string;
  version: string;
  hora: string;
}

export interface RespuestaError {
  error: {
    codigo: string;
    mensaje: string;
  };
}

export interface RespuestaYo {
  id: string;
  email: string | null;
  creadoEn: string;
}

// IA ---------------------------------------------------------------------------

export interface PeticionDesglose {
  objetivoId: string;
}

/**
 * Un paso que propone la IA. `ref` es un nombre temporal que solo vale dentro
 * de la propuesta; `padre` apunta a otra `ref`, o es null si cuelga directo
 * del objetivo analizado. Los padres siempre vienen antes que sus hijos.
 */
export interface PasoPropuesto {
  ref: string;
  padre: string | null;
  titulo: string;
  detalle: string;
  plazo: 'largo' | 'mediano' | 'corto' | 'semana' | 'hoy';
}

export interface PropuestaDesglose {
  /** Algo que la IA quiere advertir sobre el objetivo. Null si no hay nada. */
  observacion: string | null;
  pasos: PasoPropuesto[];
}

export type CodigoErrorIA =
  | 'sin_plan'
  | 'sin_saldo'
  | 'ocupado'
  | 'no_encontrado'
  | 'sin_niveles'
  | 'fallo_ia';
