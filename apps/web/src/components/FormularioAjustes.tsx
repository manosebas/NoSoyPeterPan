'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { mensajeError } from '@/lib/errores';
import { createClienteNavegador } from '@/lib/supabase/client';

/** Ajustes de la cuenta: correo y contraseña. Cada bloque guarda por separado. */
export function FormularioAjustes({ emailActual }: { emailActual: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(emailActual);
  const [password, setPassword] = useState('');
  const [pendiente, setPendiente] = useState<'correo' | 'password' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  async function cambiarCorreo(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim() === emailActual) {
      setError('Ese ya es tu correo.');
      return;
    }

    setPendiente('correo');
    setError(null);
    setAviso(null);

    try {
      const supabase = createClienteNavegador();
      const { error } = await supabase.auth.updateUser(
        { email: email.trim() },
        { emailRedirectTo: `${window.location.origin}/auth/callback?siguiente=/ajustes` },
      );
      if (error) throw error;

      // Supabase no cambia el correo hasta que se confirma desde la bandeja.
      setAviso('Te mandamos un correo de confirmación. Hasta que lo abras, sigue el anterior.');
      router.refresh();
    } catch (e) {
      setError(mensajeError(e, 'No se pudo cambiar el correo.'));
    } finally {
      setPendiente(null);
    }
  }

  async function cambiarPassword(e: React.FormEvent) {
    e.preventDefault();
    setPendiente('password');
    setError(null);
    setAviso(null);

    try {
      const supabase = createClienteNavegador();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setPassword('');
      setAviso('Contraseña actualizada.');
    } catch (e) {
      setError(mensajeError(e, 'No se pudo cambiar la contraseña.'));
    } finally {
      setPendiente(null);
    }
  }

  return (
    <div className="space-y-12">
      <form onSubmit={cambiarCorreo} className="space-y-4">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">Correo</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-lg border border-linea bg-white px-4 py-3 outline-none focus:border-tinta"
          />
        </label>
        <button
          type="submit"
          disabled={pendiente !== null}
          className="rounded-full border border-linea px-6 py-3 text-sm font-semibold transition-colors hover:border-tinta disabled:opacity-40"
        >
          {pendiente === 'correo' ? 'Un momento…' : 'Cambiar correo'}
        </button>
      </form>

      <form onSubmit={cambiarPassword} className="space-y-4 border-t border-linea pt-10">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">
            Nueva contraseña
          </span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border border-linea bg-white px-4 py-3 outline-none focus:border-tinta"
          />
        </label>
        <button
          type="submit"
          disabled={pendiente !== null}
          className="rounded-full border border-linea px-6 py-3 text-sm font-semibold transition-colors hover:border-tinta disabled:opacity-40"
        >
          {pendiente === 'password' ? 'Un momento…' : 'Cambiar contraseña'}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {aviso && <p className="text-sm text-humo">{aviso}</p>}
    </div>
  );
}
