import React from 'react';
import { ArrowLeft, BookOpen, FileCheck2, Info, ShieldCheck } from 'lucide-react';
import { usePilot } from '../context/PilotContext';

/**
 * CONH-001: apresentação honesta do estado da base referenciada.
 * Não simula consulta, IA, nem conteúdo normativo sem fontes publicadas.
 */
export const KnowledgeModuleView: React.FC = () => {
  const { setCurrentView } = usePilot();
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
        <h2 id="knowledge-state" className="text-lg font-bold text-slate-900">Conteúdos em preparação</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          A base de conhecimento referenciada está sendo estruturada. Ainda não há conteúdos publicados para consulta nesta interface. Nenhuma resposta normativa será apresentada sem a respectiva fundamentação.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <ShieldCheck className="w-5 h-5 text-emerald-700 mb-2" aria-hidden="true" />
            <h3 className="font-semibold text-sm">1. Fundamento</h3>
            <p className="text-xs text-slate-600 mt-1">Normas, dispositivos, fontes e versões identificáveis.</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <BookOpen className="w-5 h-5 text-emerald-700 mb-2" aria-hidden="true" />
            <h3 className="font-semibold text-sm">2. Explicação</h3>
            <p className="text-xs text-slate-600 mt-1">Linguagem clara e aprendizagem aplicada.</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <FileCheck2 className="w-5 h-5 text-emerald-700 mb-2" aria-hidden="true" />
            <h3 className="font-semibold text-sm">3. Contexto</h3>
            <p className="text-xs text-slate-600 mt-1">Orientação institucional quando disponível e autorizada.</p>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
          <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <p>Consultar conhecimento não exige iniciar diagnóstico ou registrar dados. Você pode voltar à sua jornada a qualquer momento.</p>
        </div>
      </section>
    </div>
  );
};
