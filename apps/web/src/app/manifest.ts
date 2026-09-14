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
    display: 'standalone',
    background_color: '#fafaf9',
    theme_color: '#0a0a0a',
    icons: [
      { src: '/icono-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icono-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
