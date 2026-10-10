import React, { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, FileCheck2, Info, ShieldCheck } from 'lucide-react';
import { usePilot } from '../context/PilotContext';

/**
 * CONH-001: apresentação honesta do estado da base referenciada.
 * Não simula consulta, IA, nem conteúdo normativo sem fontes publicadas.
 */
type KnowledgeEntry = {
  id: string; entry_code: string; version: string; question: string;
  foundational_answer: string; explanation?: string;
  sources: { title: string; authority?: string; provision?: string; version_or_date?: string; source_url: string; grounding_note?: string }[];
};
export const KnowledgeModuleView: React.FC = () => {
  const { setCurrentView } = usePilot();
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [state, setState] = useState<'loading'|'ready'|'error'>('loading');
  const [filter, setFilter] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/data/knowledge', { signal: controller.signal })
      .then(async response => { if (!response.ok) throw new Error('Knowledge unavailable'); return response.json(); })
      .then(data => { if (!controller.signal.aborted) { setEntries(Array.isArray(data.entries) ? data.entries : []); setState('ready'); } })
      .catch(() => { if (!controller.signal.aborted) setState('error'); });
    return () => controller.abort();
  }, []);
  const visible = entries.filter(entry => (entry.question + ' ' + entry.foundational_answer).toLocaleLowerCase('pt-BR').includes(filter.toLocaleLowerCase('pt-BR')));
  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-12 animate-in fade-in">
      <button type="button" onClick={() => setCurrentView('HOME')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 rounded-md">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Voltar à minha jornada
      </button>
      <header className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-7 text-white">
        <div className="flex gap-3 items-start">
          <BookOpen className="w-7 h-7 text-amber-300 shrink-0" aria-hidden="true" />
          <div>
            <h1 className="text-xl font-bold">Aprender ou tirar dúvidas</h1>
            <p className="text-sm text-slate-300 mt-2">O conhecimento de base referenciado vem primeiro. Depois, a explicação e, quando pertinente, a orientação para sua instituição.</p>
          </div>
        </div>
      </header>
      <section aria-labelledby="knowledge-state" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 id="knowledge-state" className="text-lg font-bold text-slate-900">Conhecimento fundamentado</h2>
        {state === 'loading' && <p role="status" className="text-sm text-slate-600">Consultando conteúdos publicados…</p>}
        {state === 'error' && <p role="alert" className="text-sm text-rose-700">A consulta está temporariamente indisponível. Nenhuma resposta sem fonte será apresentada.</p>}
        {state === 'ready' && entries.length === 0 && <p className="text-sm text-slate-600">Ainda não há conteúdos referenciados publicados para consulta. Você pode voltar à sua jornada.</p>}
        {state === 'ready' && entries.length > 0 && <>
          <label htmlFor="knowledge-filter" className="block text-sm font-semibold">Pesquisar nos conteúdos publicados</label>
          <input id="knowledge-filter" value={filter} onChange={event => setFilter(event.target.value)}
            placeholder="Digite uma palavra ou assunto" className="w-full rounded-xl border border-slate-300 p-3 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600" />
          <p className="text-xs text-slate-500">Busca por conteúdo já publicado. Não é um assistente de respostas geradas por IA.</p>
          {visible.length === 0 && <p className="text-sm text-slate-600">Nenhum conteúdo publicado corresponde à busca.</p>}
          {visible.map(entry => <article key={entry.id} className="rounded-xl border border-slate-200 p-4 space-y-3">
            <h3 className="font-semibold text-slate-900">{entry.question}</h3>
            <div><p className="text-xs font-bold uppercase text-emerald-700">Fundamento</p><p className="text-sm text-slate-700 whitespace-pre-wrap">{entry.foundational_answer}</p></div>
            {entry.explanation && <div><p className="text-xs font-bold uppercase text-emerald-700">Explicação</p><p className="text-sm text-slate-700 whitespace-pre-wrap">{entry.explanation}</p></div>}
            <div><p className="text-xs font-bold uppercase text-emerald-700 mb-2">Fontes verificáveis</p>
              {entry.sources.map((source, index) => <p key={index} className="text-sm">
                <a className="text-emerald-700 underline break-words" href={source.source_url} target="_blank" rel="noopener noreferrer">{source.authority ? source.authority + ' — ' : ''}{source.title}</a>
                {source.provision && <span className="text-slate-600"> · {source.provision}</span>}
                {source.version_or_date && <span className="text-slate-600"> · {source.version_or_date}</span>}
              </p>)}
            </div>
            <p className="text-[11px] text-slate-500">Conteúdo {entry.entry_code} · versão {entry.version}</p>
          </article>)}
        </>}
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
          <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <p>Consultar conhecimento não exige iniciar diagnóstico ou registrar dados. Você pode voltar à sua jornada a qualquer momento.</p>
        </div>
      </section>
    </div>
  );
};
