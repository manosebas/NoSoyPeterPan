import Image from 'next/image';
import Link from 'next/link';
import { MenuAvatar } from '@/components/MenuAvatar';
import { iniciales, nombreVisible, type SesionConPerfil } from '@/lib/perfil';

/** Cabecera de la app con sesion. Titulo a la izquierda, avatar a la derecha. */
export function Cabecera({ sesion, titulo }: { sesion: SesionConPerfil; titulo: string }) {
  const nombre = nombreVisible(sesion.perfil, sesion.email);

  return (
    <header className="flex items-center justify-between border-b border-linea pb-6">
      <div className="flex items-center gap-3">
        <Link href="/mapa" aria-label="El Mapa">
          <Image
            src="/logo.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
      </div>

      <MenuAvatar
        nombre={nombre}
        email={sesion.email}
        avatarUrl={sesion.perfil?.avatarUrl ?? null}
        iniciales={iniciales(nombre)}
      />
    </header>
  );
}
