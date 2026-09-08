/** Lado maximo del avatar. Se pinta a 80 px como mucho; 512 sobra para retina. */
const LADO_MAX = 512;
const CALIDAD = 0.85;

export type ImagenReducida = { blob: Blob; tipo: string; extension: string };

/**
 * Reduce una imagen en el navegador antes de subirla.
 *
 * Una foto de camara pesa varios MB y se muestra en un circulo de 80 px: subir
 * el original es tirar ancho de banda del usuario y espacio del bucket. Se
 * recorta al cuadrado central y se reescala a 512 px de lado.
 */
export async function reducirImagen(archivo: File): Promise<ImagenReducida> {
  const bitmap = await decodificar(archivo);

  // Cuadrado central: el avatar es redondo, los bordes se pierden igual.
  const lado = Math.min(bitmap.width, bitmap.height);
  const destino = Math.min(lado, LADO_MAX);
  const origenX = (bitmap.width - lado) / 2;
  const origenY = (bitmap.height - lado) / 2;

  const lienzo = document.createElement('canvas');
  lienzo.width = destino;
  lienzo.height = destino;

  const contexto = lienzo.getContext('2d');
  if (!contexto) throw new Error('Tu navegador no pudo procesar la imagen.');
  contexto.drawImage(bitmap, origenX, origenY, lado, lado, 0, 0, destino, destino);
  if ('close' in bitmap) bitmap.close();

  const webp = await aBlob(lienzo, 'image/webp');
  if (webp) return { blob: webp, tipo: 'image/webp', extension: 'webp' };

  // Safari viejo no exporta webp desde canvas.
  const jpeg = await aBlob(lienzo, 'image/jpeg');
  if (jpeg) return { blob: jpeg, tipo: 'image/jpeg', extension: 'jpg' };

  throw new Error('Tu navegador no pudo procesar la imagen.');
}

function aBlob(lienzo: HTMLCanvasElement, tipo: string): Promise<Blob | null> {
  return new Promise((resolver) => {
    lienzo.toBlob((blob) => resolver(blob && blob.type === tipo ? blob : null), tipo, CALIDAD);
  });
}

/** `createImageBitmap` respeta la orientacion EXIF; el `<img>` es el respaldo. */
async function decodificar(archivo: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(archivo, { imageOrientation: 'from-image' });
    } catch {
      // Sigue por el respaldo.
    }
  }

  const url = URL.createObjectURL(archivo);
  try {
    const imagen = new Image();
    imagen.src = url;
    await imagen.decode();
    return imagen;
  } finally {
    URL.revokeObjectURL(url);
  }
}
