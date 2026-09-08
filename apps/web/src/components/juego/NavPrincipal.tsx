'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Tres destinos y nada mas: la misma cascada a distinto zoom. */
const DESTINOS = [
  { href: '/hoy', texto: 'Hoy' },
  { href: '/mapa', texto: 'Mapa' },
  { href: '/ramas', texto: 'Ramas' },
] as const;

export function NavPrincipal() {
  const ruta = usePathname();

  return (
    <nav className="flex gap-1 text-sm">
      {DESTINOS.map((d) => {
        const activo = ruta === d.href || (d.href === '/mapa' && ruta.startsWith('/objetivo'));

        return (
          <Link
            key={d.href}
            href={d.href}
            className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
              activo ? 'bg-tinta text-papel' : 'text-humo hover:text-tinta'
            }`}
          >
            {d.texto}
          </Link>
        );
      })}
    </nav>
  );
}
