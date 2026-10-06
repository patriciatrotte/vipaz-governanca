import React, { useState } from 'react';
import { usePilot } from '../context/PilotContext';
import {
  FileCheck,
  Clock,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Info
} from 'lucide-react';
import { EvidencesView } from './EvidencesView';
import { PendingItemsView } from './PendingItemsView';

export const EvidencesModuleView: React.FC = () => {
  const { currentView, pendingItems, evidences } = usePilot();

  // Permite alternar entre visualização de Evidências e Pendências dentro do módulo
  const [activeTab, setActiveTab] = useState<'evidencias' | 'pendencias'>(() => {
    return currentView === 'PENDING' ? 'pendencias' : 'evidencias';
  });

  const blockingCount = pendingItems.filter(
    p => p.impact === 'BLOQUEANTE' && p.status !== 'RESOLVIDA'
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in">
      
      {/* Cabeçalho do Módulo Evidências (Conforme Precisão 3: foco na referência nas fontes de origem, sem rótulo de repositório centralizador) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <FileCheck className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Evidências &amp; Referências Probatórias
                </h1>
                <p className="text-xs text-slate-300 mt-0.5">
                  Localização e comprovação documental nas fontes de origem • Rastreabilidade metodológica
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">
              Evidências: <strong className="text-purple-300">{evidences.length}</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">
              Pendências bloqueantes: <strong className={blockingCount > 0 ? 'text-rose-400' : 'text-emerald-400'}>{blockingCount}</strong>
            </span>
          </div>
        </div>

        {/* Nota Institucional de Arquitetura Probatória (Precisão 3) */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-300 flex items-start gap-2 leading-relaxed">
          <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <span>
            A metodologia VIPAZ privilegia a <strong>referência, localização e rastreabilidade fática</strong> das evidências em suas fontes institucionais de origem, evitando armazenamento documental centralizado desnecessário.
          </span>
        </div>
      </div>

      {/* Sub-abas do Módulo Evidências */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('evidencias')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'evidencias'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Evidências e Fontes de Origem</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
            activeTab === 'evidencias' ? 'bg-purple-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {evidences.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pendencias')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'pendencias'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pendências &amp; Bloqueios Metodológicos</span>
          {blockingCount > 0 && (
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md font-bold ${
              activeTab === 'pendencias' ? 'bg-rose-800 text-white' : 'bg-rose-500 text-white'
            }`}>
              {blockingCount}
            </span>
          )}
        </button>
      </div>

      {/* Conteúdo Provisório Reutilizado sem Alteração da Lógica */}
      {activeTab === 'evidencias' ? (
        <EvidencesView />
      ) : (
        <PendingItemsView />
      )}

    </div>
  );
};
