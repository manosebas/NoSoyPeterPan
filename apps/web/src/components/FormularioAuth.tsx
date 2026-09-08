'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClienteNavegador } from '@/lib/supabase/client';

type Modo = 'entrar' | 'crear';

export function FormularioAuth({ siguiente }: { siguiente: string }) {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>('entrar');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    setAviso(null);

    try {
      const supabase = createClienteNavegador();

      if (modo === 'entrar') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(siguiente);
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Lo lee el trigger maneja_usuario_nuevo() y lo copia a perfiles.nombre.
          data: { nombre: nombre.trim() },
          // El origen se resuelve en runtime: sirve igual en prod y en cada preview.
          emailRedirectTo: `${window.location.origin}/auth/callback?siguiente=${encodeURIComponent(siguiente)}`,
        },
      });
      if (error) throw error;

      if (data.session) {
        router.push(siguiente);
        router.refresh();
        return;
      }
      setAviso('Revisa tu correo y confirma la cuenta para entrar.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-5">
      <div className="flex gap-1 rounded-full border border-linea p-1 text-sm">
        {(['entrar', 'crear'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setModo(m);
              setError(null);
              setAviso(null);
            }}
            className={`flex-1 rounded-full px-4 py-2 font-medium transition-colors ${
              modo === m ? 'bg-tinta text-papel' : 'text-humo hover:text-tinta'
            }`}
          >
            {m === 'entrar' ? 'Ya tengo cuenta' : 'Crear cuenta'}
          </button>
        ))}
      </div>

      {modo === 'crear' && (
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">Nombre</span>
          <input
            type="text"
            required
            maxLength={80}
            autoComplete="name"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="mt-2 w-full rounded-lg border border-linea bg-white px-4 py-3 outline-none focus:border-tinta"
          />
        </label>
      )}

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

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">
          Contraseña
        </span>
        <input
          type="password"
          required
          minLength={8}
          autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-lg border border-linea bg-white px-4 py-3 outline-none focus:border-tinta"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {aviso && <p className="text-sm text-humo">{aviso}</p>}

      <button
        type="submit"
        disabled={cargando}
        className="w-full rounded-full bg-tinta px-6 py-3.5 text-sm font-semibold text-papel transition-opacity hover:opacity-80 disabled:opacity-40"
      >
        {cargando ? 'Un momento…' : modo === 'entrar' ? 'Entrar' : 'Salir de Nunca Jamás'}
      </button>
    </form>
  );
}
