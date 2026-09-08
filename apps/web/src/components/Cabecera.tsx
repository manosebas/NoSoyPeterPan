import Image from 'next/image';
import Link from 'next/link';
import { NavPrincipal } from '@/components/juego/NavPrincipal';
import { MenuAvatar } from '@/components/MenuAvatar';
import { iniciales, nombreVisible, type SesionConPerfil } from '@/lib/perfil';

/** Cabecera de la app con sesion: logo, los tres destinos y el avatar. */
export function Cabecera({ sesion }: { sesion: SesionConPerfil }) {
  const nombre = nombreVisible(sesion.perfil, sesion.email);

  return (
    <header className="flex items-center justify-between gap-4 border-b border-linea pb-5">
      <Link href="/hoy" aria-label="Inicio" className="shrink-0">
        <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
      </Link>

      <NavPrincipal />

      <MenuAvatar
        nombre={nombre}
        email={sesion.email}
        avatarUrl={sesion.perfil?.avatarUrl ?? null}
        iniciales={iniciales(nombre)}
      />
    </header>
  );
}
