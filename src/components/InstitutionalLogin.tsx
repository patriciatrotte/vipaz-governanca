import React, { useState } from 'react';
import { clearInstitutionalSession, signInInstitutional } from '../services/institutionalAuth';

/** Separate authentication control; does not change simulated role or grant privileges. */
export const InstitutionalLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      setSignedInEmail(await signInInstitutional(email.trim(), password));
      setPassword('');
    } catch (err) {
      setSignedInEmail(null);
      setError(err instanceof Error ? err.message : 'Erro de autenticação.');
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    clearInstitutionalSession();
    setSignedInEmail(null);
    setPassword('');
    setError('');
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 text-xs" aria-label="Identidade institucional">
      <div className="flex flex-wrap items-center gap-3">
        <strong className="text-slate-800">Identidade institucional</strong>
        {signedInEmail ? (
          <>
            <span className="text-emerald-700">Autenticada: {signedInEmail}</span>
            <button type="button" onClick={logout} className="rounded border px-2 py-1">Sair</button>
          </>
        ) : (
          <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="vipaz-institutional-email">E-mail</label>
            <input id="vipaz-institutional-email" type="email" autoComplete="username" required
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="E-mail institucional" className="rounded border px-2 py-1.5" />
            <label className="sr-only" htmlFor="vipaz-institutional-password">Senha</label>
            <input id="vipaz-institutional-password" type="password" autoComplete="current-password" required
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Senha" className="rounded border px-2 py-1.5" />
            <button type="submit" disabled={busy} className="rounded bg-slate-900 px-3 py-1.5 text-white disabled:opacity-50">
              {busy ? 'Validando...' : 'Entrar'}
            </button>
          </form>
        )}
      </div>
      <p className="mt-1 text-slate-500">Identidade real separada do modo de simulação. O acesso às decisões depende também do vínculo institucional.</p>
      {error && <p role="alert" className="mt-2 text-red-700">{error}</p>}
    </section>
  );
};
