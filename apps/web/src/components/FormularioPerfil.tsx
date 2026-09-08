'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { createClienteNavegador } from '@/lib/supabase/client';

const MAX_BYTES = 2 * 1024 * 1024;

/** Edicion del perfil: nombre y avatar. Nada mas, y esa es la idea. */
export function FormularioPerfil({
  usuarioId,
  nombreInicial,
  avatarInicial,
  iniciales,
}: {
  usuarioId: string;
  nombreInicial: string;
  avatarInicial: string | null;
  iniciales: string;
}) {
  const router = useRouter();
  const archivoRef = useRef<HTMLInputElement>(null);
  const [nombre, setNombre] = useState(nombreInicial);
  const [avatarUrl, setAvatarUrl] = useState(avatarInicial);
  const [cargando, setCargando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  async function guardarNombre(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    setAviso(null);

    try {
      const supabase = createClienteNavegador();
      const { error } = await supabase
        .from('perfiles')
        .upsert({ id: usuarioId, nombre: nombre.trim() || null });
      if (error) throw error;

      setAviso('Listo, así te llamamos ahora.');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar.');
    } finally {
      setCargando(false);
    }
  }

  async function subirAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setError(null);
    setAviso(null);

    if (!archivo.type.startsWith('image/')) {
      setError('Eso no es una imagen.');
      return;
    }
    if (archivo.size > MAX_BYTES) {
      setError('La imagen pesa más de 2 MB. Busca una más liviana.');
      return;
    }

    setSubiendo(true);
    try {
      const supabase = createClienteNavegador();
      // Ruta fija dentro de la carpeta del usuario: la politica de storage
      // exige que el primer segmento sea su uid, y el upsert evita basura.
      const ruta = `${usuarioId}/avatar`;

      const { error: errorSubida } = await supabase.storage
        .from('avatares')
        .upload(ruta, archivo, { upsert: true, contentType: archivo.type });
      if (errorSubida) throw errorSubida;

      const { data } = supabase.storage.from('avatares').getPublicUrl(ruta);
      // La ruta no cambia, asi que sin el sufijo el navegador seguiria
      // mostrando la imagen vieja desde cache.
      const url = `${data.publicUrl}?v=${Date.now()}`;

      const { error: errorPerfil } = await supabase
        .from('perfiles')
        .upsert({ id: usuarioId, avatar_url: url });
      if (errorPerfil) throw errorPerfil;

      setAvatarUrl(url);
      setAviso('Avatar actualizado.');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir la imagen.');
    } finally {
      setSubiendo(false);
      if (archivoRef.current) archivoRef.current.value = '';
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-5">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-linea bg-white text-xl font-semibold text-humo">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            iniciales
          )}
        </div>

        <div>
          <button
            type="button"
            disabled={subiendo}
            onClick={() => archivoRef.current?.click()}
            className="rounded-full border border-linea px-5 py-2 text-sm font-medium text-humo transition-colors hover:border-tinta hover:text-tinta disabled:opacity-40"
          >
            {subiendo ? 'Subiendo…' : avatarUrl ? 'Cambiar foto' : 'Subir foto'}
          </button>
          <p className="mt-2 text-xs text-humo">JPG o PNG, máximo 2 MB.</p>
          <input
            ref={archivoRef}
            type="file"
            accept="image/*"
            onChange={subirAvatar}
            className="hidden"
          />
        </div>
      </div>

      <form onSubmit={guardarNombre} className="space-y-5">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">Nombre</span>
          <input
            type="text"
            maxLength={80}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="mt-2 w-full rounded-lg border border-linea bg-white px-4 py-3 outline-none focus:border-tinta"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {aviso && <p className="text-sm text-humo">{aviso}</p>}

        <button
          type="submit"
          disabled={cargando}
          className="rounded-full bg-tinta px-6 py-3 text-sm font-semibold text-papel transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          {cargando ? 'Un momento…' : 'Guardar'}
        </button>
      </form>
    </div>
  );
}
