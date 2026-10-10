import React, { useState } from 'react';
import { usePilot } from '../context/PilotContext';
import { DOORS_DEFINITIONS } from '../data/methodologyConstants';
import { DoorStatusBadge } from './MethodologyBadges';
import {
  Layers,
  ArrowRight,
  GitPullRequest,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileCheck,
  HelpCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { DistributedInvestigationView } from './DistributedInvestigationView';
import { IntegrationView } from './IntegrationView';
import { ParticipantContributionView } from './ParticipantContributionView';

export const DiagnosticModuleView: React.FC = () => {
  const {
    currentOrg,
    currentCycle,
    currentUser,
    doorStatuses,
    originalResponses,
    activeDoorId,
    setActiveDoorId,
    setCurrentView,
    integration,
    pendingItems,
    divergences
  } = usePilot();

  // Sub-contextos do Diagnóstico D1:
  // - 'portas': Investigação das 6 Portas D1
  // - 'contribuicoes': Contribuições Setoriais
  // - 'validacao': Análise e Validação Humana (Integração C1–C6)
  const [activeTab, setActiveTab] = useState<'portas' | 'contribuicoes' | 'validacao'>('portas');

  const role = currentUser.role;
  const isFacilitator = role === 'FACILITADOR';
  const isInterlocutor = role === 'INTERLOCUTOR_PRINCIPAL';
  const isGestor = role === 'GESTOR_INSTITUCIONAL';
  const isParticipant = role === 'PARTICIPANTE';

  if (!currentOrg) return null;

  const totalAspects = DOORS_DEFINITIONS.length;
  const doors = Object.values(doorStatuses || {});
  const exploredDoorsCount = doors.filter(
    s => s === 'SUFICIENTEMENTE_EXPLORADA' || s === 'SUFICIENTEMENTE_EXPLORADA_COMPROVACAO_PENDENTE'
  ).length;

  const doorsWithResponses = new Set(originalResponses.map(response => response.doorId)).size;

  const doorsConsolidatedCount = doors.filter(
    s => s === 'SUFICIENTEMENTE_EXPLORADA'
  ).length;

  const isMaturityValidated =
    integration?.humanValidation?.isValidated === true &&
    Boolean(integration?.humanValidation?.validatedLevel);

  const handleOpenDoor = (doorId: any) => {
    setActiveDoorId(doorId);
    setCurrentView('INTERVIEW');
  };

  // Se o perfil for participante, exibir diretamente a tela de contribuições
  if (isParticipant) {
    return <ParticipantContributionView />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in">
      
      {/* ==================================================================== */}
      {/* 1. CABEÇALHO DO MÓDULO DIAGNÓSTICO E CONTEXTO DIMENSIONAL (D1 A D5)  */}
      {/* ==================================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Diagnóstico Institucional
                </h1>
                <p className="text-xs text-slate-300 mt-0.5">
                  Apuração fática e governança na Câmara Municipal • Ciclo Vigente: <strong>{currentCycle?.name || currentOrg.activeCycleName}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <span className="text-xs text-slate-300 font-mono">
              Com respostas: <strong className="text-emerald-400">{doorsWithResponses}/{totalAspects} portas</strong>
              <span className="mx-2 text-slate-500">·</span>
              Suficientemente exploradas: <strong className="text-emerald-400">{exploredDoorsCount}/{totalAspects}</strong>
            </span>
          </div>
        </div>

        {/* Barra das 5 Dimensões Metodológicas (D1 ativa, D2–D5 previstas sem dados fictícios) */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Dimensões Metodológicas da VIPAZ (5 Dimensões)</span>
            <span className="text-slate-500 font-normal">D1 ativa no ciclo atual • D2–D5 previstas</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
            {/* D1 - ATIVA */}
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold font-mono text-[11px] text-emerald-400">D1</span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded">
                  Ciclo Ativo
                </span>
              </div>
              <div className="font-semibold text-[11px] leading-tight text-white">
                Governança &amp; Responsabilidades
              </div>
            </div>

            {/* D2 - PREVISTA */}
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-400 opacity-75">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold font-mono text-[11px] text-slate-500">D2</span>
                <span className="text-[9px] font-medium bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded">
                  Prevista
                </span>
              </div>
              <div className="font-medium text-[11px] leading-tight text-slate-300">
                Políticas &amp; Normas Internas
              </div>
            </div>

            {/* D3 - PREVISTA */}
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-400 opacity-75">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold font-mono text-[11px] text-slate-500">D3</span>
                <span className="text-[9px] font-medium bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded">
                  Prevista
                </span>
              </div>
              <div className="font-medium text-[11px] leading-tight text-slate-300">
                Inventário &amp; Fluxos de Dados
              </div>
            </div>

            {/* D4 - PREVISTA */}
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-400 opacity-75">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold font-mono text-[11px] text-slate-500">D4</span>
                <span className="text-[9px] font-medium bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded">
                  Prevista
                </span>
              </div>
              <div className="font-medium text-[11px] leading-tight text-slate-300">
                Segurança da Informação
              </div>
            </div>

            {/* D5 - PREVISTA */}
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-400 opacity-75">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold font-mono text-[11px] text-slate-500">D5</span>
                <span className="text-[9px] font-medium bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded">
                  Prevista
                </span>
              </div>
              <div className="font-medium text-[11px] leading-tight text-slate-300">
                Direitos &amp; Incidentes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. SUB-ABAS CONTEXTUAIS DO DIAGNÓSTICO D1                            */}
      {/* ==================================================================== */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('portas')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'portas'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Investigação D1</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
              activeTab === 'portas' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {exploredDoorsCount}/{totalAspects}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contribuicoes')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'contribuicoes'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <GitPullRequest className="w-4 h-4" />
            <span>Contribuições Setoriais</span>
          </button>

          {(isFacilitator || isInterlocutor) && (
            <button
              type="button"
              onClick={() => setActiveTab('validacao')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'validacao'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Análise &amp; Validação (C1–C6)</span>
              {isMaturityValidated && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                  activeTab === 'validacao' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Validada
                </span>
              )}
            </button>
          )}
        </div>

        {/* Atalho rápido para Evidências */}
        <button
          type="button"
          onClick={() => setCurrentView('EVIDENCES')}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs text-purple-700 hover:text-purple-800 font-semibold px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Ver Evidências &amp; Pendências</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* 3. CONTEÚDO DA SUB-ABA ATIVA                                         */}
      {/* ==================================================================== */}
      {activeTab === 'portas' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Aspectos da investigação
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Investigação situacional estruturada da Dimensão D1 (Governança e Responsabilidades).
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveDoorId(activeDoorId || 'DOOR_1');
                setCurrentView('INTERVIEW');
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
            >
              <span>Abrir Entrevista Investigativa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cards das 6 Portas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DOORS_DEFINITIONS.map(door => {
              const status = doorStatuses[door.id] || 'NAO_INICIADA';
              const isConsolidated = status === 'SUFICIENTEMENTE_EXPLORADA';
              const isExploredPending = status === 'SUFICIENTEMENTE_EXPLORADA_COMPROVACAO_PENDENTE';
              const isExplored = isConsolidated || isExploredPending;

              return (
                <div
                  key={door.id}
                  onClick={() => handleOpenDoor(door.id)}
                  className={`bg-white border rounded-2xl p-4 transition-all duration-150 cursor-pointer flex flex-col justify-between hover:shadow-md ${
                    activeDoorId === door.id
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {door.code}
                      </span>
                      <DoorStatusBadge status={status} />
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
                      {door.title}
                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed font-sans line-clamp-2">
                      {door.essentialQuestion}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px] truncate max-w-[170px]" title={door.objective}>
                      {door.objective}
                    </span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0">
                      <span>Investigar</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'contribuicoes' && (
        <div className="space-y-4">
          <DistributedInvestigationView />
        </div>
      )}

      {activeTab === 'validacao' && (
        <div className="space-y-4">
          <IntegrationView />
        </div>
      )}

    </div>
  );
};
