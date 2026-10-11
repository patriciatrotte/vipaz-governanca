import React, { useEffect, useState } from 'react';
import { getInstitutionalToken } from '../services/institutionalAuth';
interface Source {id:string;statement:string;capacity_code:string;validation_status:string}
interface Draft {id:string;analysis_text:string;methodology_version:string;created_at:string;source_unit_ids:string[]}
export function AssessmentDraftPanel({cycleId}:{cycleId:string}) {
  const [sources,setSources]=useState<Source[]>([]);
  const [drafts,setDrafts]=useState<Draft[]>([]);
  const [selected,setSelected]=useState<string[]>([]);
  const [text,setText]=useState('');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  useEffect(()=>{
    let cancelled=false;
    setSources([]);setDrafts([]);setSelected([]);setText('');setMessage('');
    const token=getInstitutionalToken();
    fetch(`/api/data/assessment-drafts?cycleId=${encodeURIComponent(cycleId)}`,{headers:token?{Authorization:`Bearer ${token}`}:{}})
      .then(async r=>{if(!r.ok) throw Error(); return r.json();})
      .then(data=>{if(!cancelled){setSources(data.sources);setDrafts(data.drafts);}})
      .catch(()=>{if(!cancelled)setMessage('Não foi possível carregar os rascunhos e as fontes deste ciclo.');});
    return()=>{cancelled=true;};
  },[cycleId]);
  async function save() {
    setBusy(true);setMessage('');
    try {
      const token=getInstitutionalToken();
      const r=await fetch('/api/data/assessment-drafts',{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify({cycleId,sourceUnitIds:selected,analysisText:text})});
      if(!r.ok) throw Error();
      const data=await r.json();setDrafts(prev=>[data.draft,...prev]);setText('');setSelected([]);setMessage('Rascunho salvo. Ainda não constitui avaliação validada.');
    } catch {setMessage('Rascunho não salvo. Confira sua autorização e selecione fontes deste ciclo.');}
    finally {setBusy(false);}
  }
  return <section className="rounded-xl border border-slate-200 p-4 space-y-3">
    <h3 className="font-bold text-slate-900">Rascunho de análise</h3>
    <p className="text-xs text-slate-600">Selecione as fontes e registre sua interpretação. A conclusão de capacidade ou maturidade depende das regras aplicáveis e da validação humana.</p>
    <div className="max-h-48 overflow-auto space-y-2">{sources.map(s=><label key={s.id} className="flex gap-2 text-sm"><input type="checkbox" checked={selected.includes(s.id)} onChange={e=>setSelected(prev=>e.target.checked?[...prev,s.id]:prev.filter(id=>id!==s.id))}/><span>{s.statement}<small className="block text-slate-500">{s.capacity_code} · {s.validation_status}</small></span></label>)}</div>
    <textarea aria-label="Interpretação preliminar" value={text} maxLength={12000} onChange={e=>setText(e.target.value)} placeholder="Interpretação preliminar, limites e pontos a conferir" className="w-full border rounded-lg p-3 min-h-28"/>
    <button type="button" disabled={busy||!selected.length||text.trim().length<20} onClick={save} className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm disabled:opacity-40">{busy?'Salvando…':'Salvar rascunho'}</button>
    {message&&<p role="status" className="text-sm">{message}</p>}
    {drafts.map(d=><article key={d.id} className="border-t pt-3"><p className="text-xs text-slate-500">Rascunho · versão {d.methodology_version} · {d.source_unit_ids.length} fontes · {new Date(d.created_at).toLocaleString('pt-BR')}</p><p className="text-sm whitespace-pre-wrap">{d.analysis_text}</p></article>)}
  </section>;
}
