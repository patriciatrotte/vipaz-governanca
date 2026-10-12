import React, { useState } from 'react';
import { getInstitutionalAccessToken } from '../services/institutionalAuth';

export const ConfirmParticipantPanel: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const [name,setName]=useState('');
  const [role,setRole]=useState('');
  const [note,setNote]=useState('');
  const [confirmed,setConfirmed]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const submit=async (event:React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    const token=getInstitutionalAccessToken();
    if(!token){setMessage('Entre com sua conta institucional para confirmar.');return;}
    if(!name.trim()||!note.trim()){setMessage('Informe o nome e a justificativa da confirmação.');return;}
    if(!window.confirm('Você confirma que verificou a identidade e a participação desta pessoa na investigação?')) return;
    setBusy(true);
    try {
      const response=await fetch('/api/data/confirm-participant',{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
        body:JSON.stringify({
          sessionId,participantLegacyId:`confirmed-${crypto.randomUUID()}`,
          participantName:name.trim(),participantRole:role.trim()||null,confirmationNote:note.trim()
        })
      });
      if(!response.ok){setMessage(response.status===503?'Confirmação ainda não habilitada neste ambiente.':'Não foi possível confirmar. Nenhum sucesso foi presumido.');return;}
      const result=await response.json();
      if(result?.participant?.metadata?.confirmation_status!=='CONFIRMED')throw Error('unexpected response');
      setConfirmed(true);setMessage('Participação confirmada no registro central.');
    }catch{setMessage('Falha na confirmação. Consulte o registro central antes de tentar novamente.');}
    finally{setBusy(false);}
  };
  return <section className="rounded-xl border border-slate-300 p-4 my-4">
    <h3 className="font-semibold">Confirmar participação institucional</h3>
    <p className="text-sm mb-3">O contato do piloto não é uma participação confirmada. Registre somente após verificar a identidade e a atuação nesta sessão.</p>
    <form onSubmit={submit} className="flex flex-col gap-2">
      <label>Nome da pessoa<input className="w-full border rounded p-2" value={name} onChange={e=>setName(e.target.value)} required disabled={busy||confirmed}/></label>
      <label>Função institucional<input className="w-full border rounded p-2" value={role} onChange={e=>setRole(e.target.value)} disabled={busy||confirmed}/></label>
      <label>Como a participação foi confirmada?<textarea className="w-full border rounded p-2" value={note} onChange={e=>setNote(e.target.value)} required disabled={busy||confirmed}/></label>
      <button type="submit" disabled={busy||confirmed} className="rounded bg-slate-800 text-white p-2">{busy?'Confirmando...':'Confirmar participação'}</button>
    </form>
    {message&&<p role="status" className="text-sm mt-2">{message}</p>}
  </section>;
};
