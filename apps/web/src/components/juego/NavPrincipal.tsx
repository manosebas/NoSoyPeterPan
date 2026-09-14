'use client';

import Link from 'next/link';
import { useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';

/** Tres destinos y nada mas: la misma cascada a distinto zoom. */
const DESTINOS = [
  { href: '/hoy', texto: 'Hoy' },
  { href: '/mapa', texto: 'Mapa' },
  { href: '/perfil', texto: 'Perfil' },
] as const;

/**
 * El destino se enciende en cuanto se toca, antes de que la pantalla llegue.
 * Tiene que vivir dentro del Link: useLinkStatus lee la navegacion pendiente
 * del Link que lo contiene.
 */
function Destino({ texto, activo }: { texto: string; activo: boolean }) {
  const { pending } = useLinkStatus();

  return (
    <span
      className={`block rounded-full px-3 py-1.5 font-medium transition-colors sm:px-4 ${
        activo ? 'bg-tinta text-papel' : pending ? 'bg-tinta/10 text-tinta' : 'text-humo'
      }`}
    >
      {texto}
    </span>
  );
}

export function NavPrincipal() {
  const ruta = usePathname();

  return (
    <nav className="flex gap-1 text-sm">
      {DESTINOS.map((d) => {
        const activo = ruta === d.href || (d.href === '/mapa' && ruta.startsWith('/objetivo'));

        return (
          <Link key={d.href} href={d.href} className="group">
            <Destino texto={d.texto} activo={activo} />
          </Link>
        );
      })}
    </nav>
  );
}
