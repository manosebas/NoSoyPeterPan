import Image from 'next/image';
import Link from 'next/link';
import { FormularioAuth } from '@/components/FormularioAuth';

export const metadata = { title: 'Entrar — No Soy Peter Pan' };

export default async function Entrar({
  searchParams,
}: {
  searchParams: Promise<{ siguiente?: string }>;
}) {
  const { siguiente } = await searchParams;
  // Solo rutas internas: evita que un `siguiente` externo nos use de redirector.
  const destino = siguiente?.startsWith('/') ? siguiente : '/mapa';

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-10 flex items-center gap-3">
        <Image src="/logo.png" alt="" width={40} height={40} className="h-10 w-10 object-contain" />
        <span className="text-sm font-semibold tracking-tight">No Soy Peter Pan</span>
      </Link>

      <h1 className="text-3xl font-bold tracking-tight">Algún día no existe.</h1>
      <p className="mt-3 text-humo">
        Entra y convierte tus «algún día voy a…» en algo con fecha.
      </p>

      <div className="mt-10">
        <FormularioAuth siguiente={destino} />
      </div>
    </div>
  );
}
