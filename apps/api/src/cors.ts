/**
 * Los previews de Vercel usan dominios efimeros distintos en cada push
 * (ej. nspp-git-dev-xxxx.vercel.app), asi que CORS_ORIGINS admite comodines.
 * Ej: https://*.vercel.app
 */
export function creaValidadorOrigen(patrones: string[]) {
  return (origen: string | undefined, cb: (err: Error | null, permitido: boolean) => void) => {
    // Requests sin Origin (curl, healthchecks de Railway) pasan.
    if (!origen) return cb(null, true);
    cb(null, patrones.some((patron) => coincide(patron, origen)));
  };
}

/**
 * Coincidencia con comodines sin construir expresiones regulares: un `*` cubre
 * cualquier texto salvo `/`, para que el comodin no se salte el dominio.
 */
export function coincide(patron: string, texto: string): boolean {
  const partes = patron.split('*');
  if (partes.length === 1) return patron === texto;

  const primera = partes[0]!;
  const ultima = partes[partes.length - 1]!;

  if (!texto.startsWith(primera)) return false;
  if (!texto.endsWith(ultima)) return false;
  if (texto.length < primera.length + ultima.length) return false;

  // El comodin no debe cruzar separadores de ruta.
  let cursor = primera.length;
  const fin = texto.length - ultima.length;

  for (const parte of partes.slice(1, -1)) {
    const encontrado = texto.indexOf(parte, cursor);
    if (encontrado === -1 || encontrado + parte.length > fin) return false;
    if (texto.slice(cursor, encontrado).includes('/')) return false;
    cursor = encontrado + parte.length;
  }

  return !texto.slice(cursor, fin).includes('/');
}
