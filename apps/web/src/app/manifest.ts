import type { MetadataRoute } from 'next';

/**
 * Lo que usa Android al agregar el sitio a la pantalla de inicio: nombre corto
 * bajo el icono y el logo. En iPhone manda `appleWebApp` del layout y
 * `apple-icon.png`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'No Soy Peter Pan',
    short_name: 'NoSoyPeterPan',
    description: 'Algún día no existe.',
    start_url: '/hoy',
    // Abre como pestaña normal: en modo app la sesion no se comparte con el
    // navegador y el link del correo de verificacion caeria afuera.
    display: 'browser',
    background_color: '#fafaf9',
    theme_color: '#ffffff',
    icons: [
      { src: '/icono-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icono-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
