import React, { useState } from 'react';
import { getInstitutionalAccessToken, getInstitutionalSignedInUserId } from '../services/institutionalAuth';
import { confirmationKey, getOrCreateConfirmationId } from '../services/persistence/pendingParticipantConfirmation';

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
    const userId=getInstitutionalSignedInUserId();
    if(!token||!userId){setMessage('Entre com sua conta institucional para confirmar.');return;}
    if(!name.trim()||!note.trim()){setMessage('Informe o nome e a justificativa da confirmação.');return;}
    if(!window.confirm('Você confirma que verificou a identidade e a participação desta pessoa na investigação?')) return;
    setBusy(true);
    try {
      const key=confirmationKey(userId,sessionId);
      const participantLegacyId=getOrCreateConfirmationId(localStorage,key,()=>crypto.randomUUID());
      const response=await fetch('/api/data/confirm-participant',{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
        body:JSON.stringify({
          sessionId,participantLegacyId,
          participantName:name.trim(),participantRole:role.trim()||null,confirmationNote:note.trim()
        })
      });
      if(!response.ok){setMessage(response.status===503?'Confirmação ainda não habilitada neste ambiente.':'Não foi possível confirmar. Nenhum sucesso foi presumido.');return;}
      const result=await response.json();
      if(result?.participant?.metadata?.confirmation_status!=='CONFIRMED')throw Error('unexpected response');
      setConfirmed(true);setMessage('Participação confirmada no registro central.');
      try{localStorage.removeItem(key);}catch{ /* Central confirmation succeeded; leave retry marker for reconciliation. */ }
    }catch{setMessage('Falha na confirmação. O identificador foi preservado; repita somente com os mesmos dados ou solicite reconciliação.');}
    finally{setBusy(false);}
  };
  return <section className="rounded-xl border border-slate-300 p-4 my-4">
    <h3 className="font-semibold">Confirmar participação institucional</h3>
    <p className="text-sm mb-3">O contato do piloto não é uma participação confirmada. Registre somente após verificar a identidade e a atuação nesta sessão. Em caso de falha, repita com os mesmos dados; a operação pendente não armazena nome ou justificativa.</p>
    <form onSubmit={submit} className="flex flex-col gap-2">
      <label>Nome da pessoa<input className="w-full border rounded p-2" value={name} onChange={e=>setName(e.target.value)} required disabled={busy||confirmed}/></label>
      <label>Função institucional<input className="w-full border rounded p-2" value={role} onChange={e=>setRole(e.target.value)} disabled={busy||confirmed}/></label>
      <label>Como a participação foi confirmada?<textarea className="w-full border rounded p-2" value={note} onChange={e=>setNote(e.target.value)} required disabled={busy||confirmed}/></label>
      <button type="submit" disabled={busy||confirmed} className="rounded bg-slate-800 text-white p-2">{busy?'Confirmando...':'Confirmar participação'}</button>
    </form>
    {message&&<p role="status" className="text-sm mt-2">{message}</p>}
  </section>;
};
