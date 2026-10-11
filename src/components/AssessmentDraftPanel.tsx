import { D1_CANDIDATE_BASELINE } from '../data/d1CandidateBaseline';
import React, { useEffect, useState } from 'react';
import { getInstitutionalToken } from '../services/institutionalAuth';
interface Source {id:string;statement:string;capacity_code:string;validation_status:string}
interface Draft {id:string;analysis_text:string;methodology_version:string;created_at:string;source_unit_ids:string[];baseline_reference?:string;capability_code?:string;proposed_outcome?:string;human_reviewed_at?:string;human_review_justification?:string}
export function AssessmentDraftPanel({cycleId}:{cycleId:string}) {
  const [sources,setSources]=useState<Source[]>([]);
  const [drafts,setDrafts]=useState<Draft[]>([]);
  const [selected,setSelected]=useState<string[]>([]);
  const [text,setText]=useState('');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const [capability,setCapability]=useState('');
  const [outcome,setOutcome]=useState('NAO_CONCLUSIVO');
  const [reviewed,setReviewed]=useState(false);
  const [justification,setJustification]=useState('');
  useEffect(()=>{setReviewed(false);},[capability,outcome,selected,text,justification]);
  useEffect(()=>{
    let cancelled=false;
    setSources([]);setDrafts([]);setSelected([]);setText('');setMessage('');setCapability('');setOutcome('NAO_CONCLUSIVO');setReviewed(false);setJustification('');
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
      const r=await fetch('/api/data/assessment-drafts',{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify({cycleId,sourceUnitIds:selected,analysisText:text,...(capability?{capabilityCode:capability,proposedOutcome:outcome,humanReviewed:reviewed,reviewJustification:justification}:{})})});
      if(!r.ok) throw Error();
      const data=await r.json();setDrafts(prev=>[data.draft,...prev]);setText('');setSelected([]);setReviewed(false);setJustification('');setMessage('Rascunho salvo. Ainda não constitui avaliação validada.');
    } catch {setMessage('Rascunho não salvo. Confira sua autorização e selecione fontes deste ciclo.');}
    finally {setBusy(false);}
  }
  return <section className="rounded-xl border border-slate-200 p-4 space-y-3">
    <h3 className="font-bold text-slate-900">Rascunho de análise</h3>
    <p className="text-xs text-slate-600">Selecione as fontes e registre sua interpretação. A conclusão de capacidade ou maturidade depende das regras aplicáveis e da validação humana.</p>
    <details className="rounded-lg bg-slate-50 p-3 text-sm">
      <summary className="cursor-pointer font-semibold">Consultar a régua candidata D1</summary>
      <p className="text-xs text-slate-600 mt-2">Baseline de 03/10/2026, versão 1.0. Esta referência de análise não altera a versão da investigação histórica e não autoriza conclusão automática.</p>
      <dl className="space-y-2 mt-3">{D1_CANDIDATE_BASELINE.capacities.map(c=><div key={c.code}><dt className="font-semibold">{c.code} · {c.title}</dt><dd>{c.floor}</dd></div>)}</dl>
      <p className="text-xs text-slate-600 mt-3">Estados: suficiente; suficiente com evolução possível; suficiente com comprovação pendente; insuficiente; não conclusivo. Informação insuficiente não demonstra ausência de capacidade. Requisito de prova estrita exige sua comprovação específica.</p>
    </details>
    <div className="max-h-48 overflow-auto space-y-2">{sources.map(s=><label key={s.id} className="flex gap-2 text-sm"><input type="checkbox" checked={selected.includes(s.id)} onChange={e=>setSelected(prev=>e.target.checked?[...prev,s.id]:prev.filter(id=>id!==s.id))}/><span>{s.statement}<small className="block text-slate-500">{s.capacity_code} · {s.validation_status}</small></span></label>)}</div>
    <label className="block text-sm font-semibold">Capacidade em análise
      <select value={capability} onChange={e=>setCapability(e.target.value)} className="block w-full border rounded-lg p-2 mt-1">
        <option value="">Anotação livre</option>
        {D1_CANDIDATE_BASELINE.capacities.map(c=><option key={c.code} value={c.code}>{c.code} · {c.title}</option>)}
      </select>
    </label>
    {capability && <label className="block text-sm font-semibold">Estado proposto — régua candidata
      <select value={outcome} onChange={e=>setOutcome(e.target.value)} className="block w-full border rounded-lg p-2 mt-1">
        <option value="NAO_CONCLUSIVO">Não conclusivo</option><option value="SUFICIENTE">Suficiente</option><option value="SUFICIENTE_COM_EVOLUCAO_POSSIVEL">Suficiente com evolução possível</option><option value="SUFICIENTE_COM_COMPROVACAO_PENDENTE">Suficiente com comprovação pendente</option><option value="INSUFICIENTE">Insuficiente</option>
      </select>
    </label>}
    <textarea aria-label="Interpretação preliminar" value={text} maxLength={12000} onChange={e=>setText(e.target.value)} placeholder="Interpretação preliminar, limites e pontos a conferir" className="w-full border rounded-lg p-3 min-h-28"/>
    {capability && <div className="space-y-2">
      <textarea aria-label="Justificativa da conferência humana" value={justification} maxLength={12000} onChange={e=>setJustification(e.target.value)} placeholder="Justificativa da conferência humana: sustentação, divergências e limites" className="w-full border rounded-lg p-3 min-h-20"/>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={reviewed} disabled={justification.trim().length<20} onChange={e=>setReviewed(e.target.checked)}/>Conferi as fontes e esta interpretação preliminar. Esta conferência não homologa a régua nem valida maturidade.</label>
    </div>}
    <button type="button" disabled={busy||!selected.length||text.trim().length<20||(reviewed&&justification.trim().length<20)} onClick={save} className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm disabled:opacity-40">{busy?'Salvando…':'Salvar rascunho'}</button>
    {message&&<p role="status" className="text-sm">{message}</p>}
    {drafts.map(d=><article key={d.id} className="border-t pt-3"><p className="text-xs text-slate-500">Rascunho · versão {d.methodology_version} · {d.source_unit_ids.length} fontes · {new Date(d.created_at).toLocaleString('pt-BR')}</p>{d.capability_code && <p className="text-xs font-semibold">{d.capability_code} · proposta: {d.proposed_outcome?.replaceAll('_',' ').toLowerCase()} · {d.human_reviewed_at?'Interpretação conferida por humano':'Conferência humana pendente'}<span className="block font-normal">Régua candidata D1 de 03/10/2026 · versão 1.0</span></p>}<p className="text-sm whitespace-pre-wrap">{d.analysis_text}</p>{d.human_review_justification && <p className="text-sm whitespace-pre-wrap">Conferência: {d.human_review_justification}</p>}</article>)}
  </section>;
}
