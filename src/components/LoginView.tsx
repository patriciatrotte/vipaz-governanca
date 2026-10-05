import React, { useState } from 'react';
import { ShieldCheck, Mail, ArrowRight } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export type VipazSession = { accessToken: string; refreshToken: string; userId: string };

async function api(path:string, token:string, init:RequestInit={}) {
  return fetch(`${SUPABASE_URL}${path}`, { ...init, headers:{ apikey:SUPABASE_KEY!, Authorization:`Bearer ${token}`, 'Content-Type':'application/json', ...(init.headers||{}) } });
}

export const LoginView: React.FC<{ onAuthenticated:(session:VipazSession)=>void }> = ({ onAuthenticated }) => {
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [message,setMessage]=useState(''); const [busy,setBusy]=useState(false);

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault(); setMessage('');
    if(!SUPABASE_URL||!SUPABASE_KEY){setMessage('Autenticação ainda não configurada neste ambiente.');return;}
    setBusy(true);
    try{
      const response=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password})});
      const data=await response.json();
      if(!response.ok||!data.access_token||!data.user?.id) throw new Error('Acesso não autorizado. Verifique seu e-mail e sua senha.');

      const roleRes=await api(`/rest/v1/global_user_roles?select=role_code,status&user_id=eq.${data.user.id}&role_code=eq.ADMIN_VIPAZ&status=eq.ACTIVE`,data.access_token);
      const roles=await roleRes.json();
      if(!roleRes.ok||!Array.isArray(roles)||roles.length===0) throw new Error('Sua identidade não possui autorização ADMIN_VIPAZ ativa.');

      const profileRes=await api(`/rest/v1/profiles?select=metadata&user_id=eq.${data.user.id}`,data.access_token);
      const profiles=await profileRes.json();
      if(!profileRes.ok||!Array.isArray(profiles)||profiles.length===0) throw new Error('Perfil VIPAZ não localizado.');

      const session={accessToken:data.access_token,refreshToken:data.refresh_token,userId:data.user.id};
      sessionStorage.setItem('VIPAZ_SESSION',JSON.stringify(session));
      if(profiles[0]?.metadata?.must_change_password) sessionStorage.setItem('VIPAZ_MUST_CHANGE_PASSWORD','true');
      onAuthenticated(session);
    }catch(err:any){setMessage(err?.message||'Não foi possível autenticar.');}finally{setBusy(false);}
  };

  return <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4"><div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-7 sm:p-8">
    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-5"><ShieldCheck className="w-6 h-6 text-emerald-700"/></div>
    <div className="text-[11px] font-mono font-bold tracking-wider text-emerald-700 uppercase mb-2">VIPAZ · Acesso institucional</div>
    <h1 className="text-2xl font-black text-slate-950">Evolução contínua da governança</h1><p className="mt-2 text-sm text-slate-500">Entre com sua identidade individual para acessar o ambiente autorizado da VIPAZ.</p>
    <form onSubmit={submit} className="mt-7 space-y-4">
      <label className="block"><span className="text-xs font-bold text-slate-700">E-mail</span><div className="mt-1 relative"><Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400"/><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm" placeholder="seu@email.com"/></div></label>
      <label className="block"><span className="text-xs font-bold text-slate-700">Senha</span><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm" placeholder="••••••••"/></label>
      {message&&<div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">{message}</div>}
      <button disabled={busy} className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-sm rounded-lg py-2.5 flex items-center justify-center gap-2">{busy?'Entrando...':'Entrar'}<ArrowRight className="w-4 h-4"/></button>
    </form><p className="mt-6 text-[11px] text-slate-400 text-center">Acesso individual e rastreável · não compartilhe credenciais.</p>
  </div></div>;
};

export const ChangePasswordView:React.FC<{session:VipazSession,onDone:()=>void,onLogout:()=>void}>=({session,onDone,onLogout})=>{
 const [p1,setP1]=useState('');const[p2,setP2]=useState('');const[msg,setMsg]=useState('');const[busy,setBusy]=useState(false);
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setMsg('');if(p1.length<12){setMsg('Use uma senha com pelo menos 12 caracteres.');return;}if(p1!==p2){setMsg('As senhas não coincidem.');return;}setBusy(true);
 try{const r=await api('/auth/v1/user',session.accessToken,{method:'PUT',body:JSON.stringify({password:p1})});if(!r.ok)throw new Error('Não foi possível atualizar a senha.');
 const pr=await api(`/rest/v1/profiles?user_id=eq.${session.userId}`,session.accessToken,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({metadata:{must_change_password:false}})});
 if(!pr.ok)throw new Error('Senha alterada, mas não foi possível concluir a liberação do perfil.');sessionStorage.removeItem('VIPAZ_MUST_CHANGE_PASSWORD');onDone();}catch(e:any){setMsg(e.message||'Falha ao atualizar senha.');}finally{setBusy(false);}};
 return <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4"><div className="w-full max-w-md bg-white rounded-2xl p-8"><div className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase">Primeiro acesso</div><h1 className="text-2xl font-black mt-2">Crie sua senha pessoal</h1><p className="text-sm text-slate-500 mt-2">A senha temporária cumpriu sua função. Defina agora uma senha exclusiva para continuar.</p><form onSubmit={submit} className="mt-6 space-y-4"><input type="password" required value={p1} onChange={e=>setP1(e.target.value)} className="w-full px-3 py-2.5 border rounded-lg" placeholder="Nova senha"/><input type="password" required value={p2} onChange={e=>setP2(e.target.value)} className="w-full px-3 py-2.5 border rounded-lg" placeholder="Confirme a nova senha"/>{msg&&<div className="text-xs text-rose-700">{msg}</div>}<button disabled={busy} className="w-full bg-emerald-700 text-white font-bold rounded-lg py-2.5">{busy?'Salvando...':'Definir senha e continuar'}</button></form><button onClick={onLogout} className="w-full mt-3 text-xs text-slate-500">Sair</button></div></div>;
};
