import React from 'react';
import { usePilot } from '../context/PilotContext';
import { calculateUserJourney } from '../utils/journeyEngine';
import { DOORS_DEFINITIONS } from '../data/methodologyConstants';
import {
  Compass,
  ArrowRight,
  Layers,
  Target,
  AlertTriangle,
  Award,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { cleanPresentationText } from '../utils/formatters';

export const InstitutionalOverviewView: React.FC = () => {
  const {
    currentOrg,
    currentCycle,
    currentUser,
    doorStatuses,
    pendingItems,
    divergences,
    evidences,
    distributedRequests,
    integration,
    snapshot,
    actions,
    activeDoorId,
    originalResponses,
    setCurrentView,
    setActiveDoorId
  } = usePilot();

  if (!currentOrg) return null;

  // Cálculo determinístico seguro da Jornada e Próxima Ação
  const journeyInfo = calculateUserJourney({
    doorStatuses,
    pendingItems,
    divergences,
    evidences,
    distributedRequests,
    integration,
    snapshot,
    actions,
    currentUser,
    currentOrg,
    activeDoorId,
    originalResponses,
    currentCycle
  });

  const totalAspects = DOORS_DEFINITIONS.length;

  // Métricas reais e auditáveis existentes
  const doors = Object.values(doorStatuses || {});
  const exploredDoorsCount = doors.filter(
    s => s === 'SUFICIENTEMENTE_EXPLORADA' || s === 'SUFICIENTEMENTE_EXPLORADA_COMPROVACAO_PENDENTE'
  ).length;

  const doorsConsolidatedCount = doors.filter(
    s => s === 'SUFICIENTEMENTE_EXPLORADA'
  ).length;

  const blockingPendingCount = pendingItems.filter(
    p => p.impact === 'BLOQUEANTE' && p.status !== 'RESOLVIDA'
  ).length;

  const activeDivergencesCount = divergences.filter(
    d => d.status !== 'EXPLICADA'
  ).length;

  const isMaturityValidated =
    integration?.humanValidation?.isValidated === true &&
    Boolean(integration?.humanValidation?.validatedLevel);

  // Mapeamento seguro de destino para o botão de ação principal "Seu Próximo Passo"
  const handleNextStepNavigation = () => {
    const nextStep = journeyInfo.recommendedNextStep;
    if (nextStep.actionDoorId) {
      setActiveDoorId(nextStep.actionDoorId);
      setCurrentView('INTERVIEW');
      return;
    }

    if (nextStep.actionView) {
      setCurrentView(nextStep.actionView);
      return;
    }

    setCurrentView('DIAGNOSTIC');
  };

  const currentStage = journeyInfo.stagesProgress.find(s => s.isCurrent);
  const hasActions = actions && actions.length > 0;
  const hasSnapshot = Boolean(snapshot?.isLockedImmutable);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in">
      
      {/* ==================================================================== */}
      {/* CAMADA PRINCIPAL: SEU PRÓXIMO PASSO (Destaque visual proeminente)    */}
      {/* ==================================================================== */}
      <section 
        aria-label="Seu próximo passo"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-emerald-500/40 p-5 sm:p-7 text-white shadow-lg"
      >
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Seu Próximo Passo</span>
              </span>
              {currentStage && (
                <span className="text-xs text-slate-400 font-mono">
                  {currentStage.label}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
              {journeyInfo.recommendedNextStep.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {cleanPresentationText(journeyInfo.recommendedNextStep.reason || journeyInfo.recommendedNextStep.description)}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              type="button"
              onClick={handleNextStepNavigation}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md hover:shadow-emerald-900/30 cursor-pointer active:scale-[0.99]"
            >
              <span>{journeyInfo.recommendedNextStep.actionLabel || 'Prosseguir'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* CAMADA OPERACIONAL: DIAGNÓSTICO, JORNADA DE EVOLUÇÃO, ATENÇÃO       */}
      {/* (O card redundante de Ciclo Atual foi retirado da área principal)    */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* CARD 1: DIAGNÓSTICO */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                Diagnóstico
              </span>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                {exploredDoorsCount}/{totalAspects}
              </span>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Investigação D1
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Governança &amp; Responsabilidades na Câmara Municipal
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Investigação:</span>
                <span className="font-semibold text-slate-800">{exploredDoorsCount} de {totalAspects}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div 
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.round((exploredDoorsCount / totalAspects) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2">
            <button
              type="button"
              onClick={() => setCurrentView('DIAGNOSTIC')}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Acessar Diagnóstico D1</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 2: JORNADA DE EVOLUÇÃO */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-teal-600" />
                Jornada de Evolução
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                hasActions 
                  ? 'bg-teal-100 text-teal-800 border-teal-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {hasActions ? `${actions.length} em curso` : 'Em estruturação'}
              </span>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Ações de Evolução &amp; Metas
              </h2>
              {hasActions ? (
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Ações de evolução cadastradas para acompanhamento: <strong>{actions?.length || 0}</strong>.
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Gaps confirmados na investigação podem originar orientações e ações de melhoria institucional.
                </p>
              )}
            </div>

            {hasActions && (
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 flex justify-between">
                <span>Ações pactuadas:</span>
                <span className="font-semibold text-slate-800">{actions.length} em acompanhamento</span>
              </div>
            )}
          </div>

          <div className="pt-4 mt-2">
            <button
              type="button"
              onClick={() => setCurrentView('ACTION_PLAN')}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Acessar Jornada de Evolução</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 3: ATENÇÃO NECESSÁRIA */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <AlertTriangle className={`w-3.5 h-3.5 ${blockingPendingCount > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
                Atenção Necessária
              </span>
              {blockingPendingCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  {blockingPendingCount} bloqueante{blockingPendingCount > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                  Sem bloqueios
                </span>
              )}
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Pendências &amp; Divergências
              </h2>
              {blockingPendingCount > 0 || activeDivergencesCount > 0 ? (
                <p className="text-xs text-rose-700 mt-1">
                  Existem <strong>{blockingPendingCount}</strong> pendência(s) bloqueante(s) e <strong>{activeDivergencesCount}</strong> divergência(s) fática(s) ativa(s).
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-1">
                  Nenhuma pendência bloqueante ou divergência fática não resolvida identificada no ciclo vigente.
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
              <div className="flex justify-between items-center">
                <span>Pendências bloqueantes:</span>
                <span className={`font-semibold ${blockingPendingCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                  {blockingPendingCount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Divergências ativas:</span>
                <span className={`font-semibold ${activeDivergencesCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                  {activeDivergencesCount}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2">
            <button
              type="button"
              onClick={() => setCurrentView('EVIDENCES')}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Ver Evidências &amp; Pendências</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* CAMADA SECUNDÁRIA: Exibida SOMENTE quando houver dados reais úteis   */}
      {/* (Atualizações relevantes sem dados é omitida; blocos vazios não      */}
      {/* ocupam espaço de tela desnecessário)                                 */}
      {/* ==================================================================== */}
      {(hasActions || hasSnapshot) && (
        <div className="pt-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
            Informações Consolidadas do Ciclo
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {hasActions && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                      Acompanhamento da Evolução
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-600">
                      {actions.length} ações
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Ações pactuadas em execução
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Acompanhamento sistemático dos responsáveis, prazos e próximos passos estruturantes da Câmara.
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentView('ACTION_PLAN')}
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Ver Acompanhamento da Evolução</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {hasSnapshot && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      Documentos Emitidos
                    </span>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Imutável
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Snapshot Metodológico Registrado
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Marco temporal imutável formalmente registrado para homologação e emissão de saídas executivas.
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentView('OUTPUTS')}
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Consultar no Hub de Relatórios</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
