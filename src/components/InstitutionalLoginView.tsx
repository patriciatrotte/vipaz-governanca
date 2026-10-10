import React, { useState } from 'react';
import { signInInstitutionalUser } from '../services/institutionalAuth';

interface Props { onSuccess: () => void; onSimulation: () => void; }

export const InstitutionalLoginView: React.FC<Props> = ({ onSuccess, onSimulation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const configured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try { await signInInstitutionalUser(email, password); onSuccess(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível entrar.'); }
    finally { setBusy(false); }
  };
  return <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-8 shadow-sm space-y-5">
      <div><p className="text-xs font-semibold tracking-widest text-emerald-700">VIPAZ · ACESSO INSTITUCIONAL</p>
      <h1 className="text-2xl font-bold text-slate-900 mt-2">Entrar na plataforma</h1>
      <p className="text-sm text-slate-600 mt-2">O acesso aos registros institucionais exige identidade verificada e vínculo ativo com a organização.</p></div>
      <form onSubmit={submit} className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">E-mail institucional
          <input type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 p-3" />
        </label>
        <label className="block text-sm font-medium text-slate-700">Senha
          <input type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 p-3" />
        </label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {!configured && <p className="text-sm text-amber-800">Autenticação institucional ainda não configurada neste ambiente.</p>}
        <button disabled={busy || !configured} className="w-full rounded-lg bg-emerald-800 text-white p-3 font-semibold disabled:opacity-50" type="submit">{busy ? 'Verificando acesso…' : 'Entrar com minha conta'}</button>
      </form>
      <div className="border-t border-slate-200 pt-4 space-y-2">
        <button type="button" onClick={onSimulation} className="text-sm font-semibold text-slate-700 underline">Explorar modo de simulação</button>
        <p className="text-xs text-slate-500">O modo de simulação não concede autorização para consultar registros institucionais protegidos.</p>
      </div>
    </div>
  </main>;
};
