import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'No Soy Peter Pan — Un juego para salir de Nunca Jamás',
  description:
    'Algún día no existe. Convierte tus «algún día voy a…» en objetivos con fecha y misiones para hoy. Deja de vivir por accidente.',
  icons: { icon: '/logo.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
