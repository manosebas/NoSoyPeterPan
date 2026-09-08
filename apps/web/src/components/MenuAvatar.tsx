'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const OPCIONES = [{ href: '/ajustes', texto: 'Ajustes' }] as const;

/**
 * Menu del avatar: perfil, ajustes y salir. Es la unica navegacion de la app
 * estando dentro, a proposito: tres opciones y nada mas que memorizar.
 */
export function MenuAvatar({
  nombre,
  email,
  avatarUrl,
  iniciales,
}: {
  nombre: string;
  email: string | null;
  avatarUrl: string | null;
  iniciales: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const ruta = usePathname();

  // Cambiar de pagina cierra el menu: en navegacion cliente no se desmonta.
  useEffect(() => setAbierto(false), [ruta]);

  useEffect(() => {
    if (!abierto) return;

    function alClicFuera(e: MouseEvent) {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false);
    }
    function alEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setAbierto(false);
    }

    document.addEventListener('mousedown', alClicFuera);
    document.addEventListener('keydown', alEscape);
    return () => {
      document.removeEventListener('mousedown', alClicFuera);
      document.removeEventListener('keydown', alEscape);
    };
  }, [abierto]);

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-label="Tu cuenta"
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-linea bg-white text-sm font-semibold text-humo transition-colors hover:border-tinta hover:text-tinta"
      >
        {avatarUrl ? (
          // Imagen de Supabase Storage: host variable por ambiente, por eso no
          // pasa por next/image (exigiria configurar remotePatterns por proyecto).
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          iniciales
        )}
      </button>

      {abierto && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-linea bg-white shadow-lg"
        >
          <div className="border-b border-linea px-4 py-3">
            <p className="truncate text-sm font-semibold">{nombre}</p>
            {email && <p className="truncate text-xs text-humo">{email}</p>}
          </div>

          {OPCIONES.map((o) => (
            <Link
              key={o.href}
              href={o.href}
              role="menuitem"
              className="block px-4 py-2.5 text-sm transition-colors hover:bg-papel"
            >
              {o.texto}
            </Link>
          ))}

          <form action="/auth/salir" method="post" className="border-t border-linea">
            <button
              type="submit"
              role="menuitem"
              className="w-full px-4 py-2.5 text-left text-sm text-humo transition-colors hover:bg-papel hover:text-tinta"
            >
              Salir
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
