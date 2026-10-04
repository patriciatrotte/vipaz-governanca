import React, { useState } from 'react';
import { ShieldCheck, Mail, ArrowRight } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const LoginView: React.FC<{ onAuthenticated: (token: string) => void }> = ({ onAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setMessage('');
    if (!SUPABASE_URL || !SUPABASE_KEY) { setMessage('Autenticação ainda não configurada neste ambiente.'); return; }
    setBusy(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, { method:'POST', headers:{ apikey:SUPABASE_KEY, 'Content-Type':'application/json' }, body:JSON.stringify({email,password}) });
      const data = await response.json();
      if (!response.ok || !data.access_token) throw new Error('Acesso não autorizado. Verifique seu e-mail e sua senha.');
      localStorage.setItem('VIPAZ_AUTH_TOKEN', data.access_token);
      onAuthenticated(data.access_token);
    } catch (err:any) { setMessage(err?.message || 'Não foi possível autenticar.'); } finally { setBusy(false); }
  };

  return <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-7 sm:p-8">
      <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-5"><ShieldCheck className="w-6 h-6 text-emerald-700" /></div>
      <div className="text-[11px] font-mono font-bold tracking-wider text-emerald-700 uppercase mb-2">VIPAZ · Acesso institucional</div>
      <h1 className="text-2xl font-black text-slate-950">Evolução contínua da governança</h1>
      <p className="mt-2 text-sm text-slate-500">Entre com sua identidade individual para acessar o ambiente autorizado da VIPAZ.</p>
      <form onSubmit={submit} className="mt-7 space-y-4">
        <label className="block"><span className="text-xs font-bold text-slate-700">E-mail</span><div className="mt-1 relative"><Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400"/><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="seu@email.com"/></div></label>
        <label className="block"><span className="text-xs font-bold text-slate-700">Senha</span><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="••••••••"/></label>
        {message && <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">{message}</div>}
        <button disabled={busy} className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-sm rounded-lg py-2.5 flex items-center justify-center gap-2">{busy?'Entrando...':'Entrar'}<ArrowRight className="w-4 h-4"/></button>
      </form>
      <p className="mt-6 text-[11px] text-slate-400 text-center">Acesso individual e rastreável · não compartilhe credenciais.</p>
    </div>
  </div>;
};
