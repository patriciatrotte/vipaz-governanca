import React, { useState } from 'react';
import { signInInstitutionalUser, requestPasswordRecovery, readRecoveryToken, updateRecoveredPassword } from '../services/institutionalAuth';

interface Props { onSuccess: () => void; onSimulation: () => void; }

export const InstitutionalLoginView: React.FC<Props> = ({ onSuccess, onSimulation }) => {
  const [recoveryToken, setRecoveryToken] = useState<string | null>(() => readRecoveryToken());
  const [mode, setMode] = useState<'login' | 'request' | 'reset'>(() => window.location.hash.includes('type=recovery') ? 'reset' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const configured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

  const switchMode = (next: 'login' | 'request') => {
    setMode(next); setError(''); setNotice(''); setPassword(''); setConfirmation('');
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(''); setNotice(''); setBusy(true);
    try {
      if (mode === 'request') {
        await requestPasswordRecovery(email);
        setNotice('Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.');
      } else if (mode === 'reset') {
        if (!recoveryToken) throw new Error('Link de recuperação inválido. Solicite um novo link.');
        if (password.length < 12) throw new Error('A nova senha deve ter pelo menos 12 caracteres.');
        if (password !== confirmation) throw new Error('As senhas não coincidem.');
        await updateRecoveredPassword(recoveryToken, password);
        setRecoveryToken(null); setPassword(''); setConfirmation('');
        setMode('login'); setNotice('Senha atualizada. Entre com sua nova senha.');
      } else {
        await signInInstitutionalUser(email, password);
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir a operação.');
    } finally { setBusy(false); }
  };

  return <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-8 shadow-sm space-y-5">
      <div>
        <p className="text-xs font-semibold tracking-widest text-emerald-700">VIPAZ · ACESSO INSTITUCIONAL</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">{mode === 'request' ? 'Recuperar senha' : mode === 'reset' ? 'Definir nova senha' : 'Entrar na plataforma'}</h1>
        <p className="text-sm text-slate-600 mt-2">{mode === 'login' ? 'O acesso aos registros institucionais exige identidade verificada e vínculo ativo com a organização.' : mode === 'request' ? 'Informe o e-mail cadastrado para receber as instruções de recuperação.' : 'Escolha uma nova senha para sua conta.'}</p>
      </div>
      <form onSubmit={submit} className="space-y-3">
        {mode !== 'reset' && <label className="block text-sm font-medium text-slate-700">E-mail
          <input type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 p-3" />
        </label>}
        {mode !== 'request' && <label className="block text-sm font-medium text-slate-700">{mode === 'reset' ? 'Nova senha' : 'Senha'}
          <input type="password" required minLength={mode === 'reset' ? 12 : undefined} autoComplete={mode === 'reset' ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 p-3" />
        </label>}
        {mode === 'reset' && <label className="block text-sm font-medium text-slate-700">Confirmar nova senha
          <input type="password" required autoComplete="new-password" value={confirmation} onChange={e => setConfirmation(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 p-3" />
        </label>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {notice && <p role="status" className="text-sm text-emerald-800">{notice}</p>}
        {!configured && <p className="text-sm text-amber-800">Autenticação institucional ainda não configurada neste ambiente.</p>}
        <button disabled={busy || !configured} className="w-full rounded-lg bg-emerald-800 text-white p-3 font-semibold disabled:opacity-50" type="submit">
          {busy ? 'Aguarde…' : mode === 'request' ? 'Enviar instruções' : mode === 'reset' ? 'Salvar nova senha' : 'Entrar com minha conta'}
        </button>
      </form>
      {mode === 'login' && <button type="button" onClick={() => switchMode('request')} className="text-sm font-semibold text-emerald-800 underline">Esqueci minha senha</button>}
      {mode === 'request' && <button type="button" onClick={() => switchMode('login')} className="text-sm font-semibold text-emerald-800 underline">Voltar ao login</button>}
      {mode === 'reset' && <button type="button" onClick={() => { setRecoveryToken(null); switchMode('request'); }} className="text-sm font-semibold text-emerald-800 underline">Solicitar outro link</button>}
      <div className="border-t border-slate-200 pt-4 space-y-2">
        <button type="button" onClick={onSimulation} className="text-sm font-semibold text-slate-700 underline">Explorar modo de simulação</button>
        <p className="text-xs text-slate-500">O modo de simulação não concede autorização para consultar registros institucionais protegidos.</p>
      </div>
    </div>
  </main>;
};
