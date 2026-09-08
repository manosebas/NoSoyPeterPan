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
