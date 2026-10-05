import React, { useState, useEffect } from 'react';
import { usePilot } from '../context/PilotContext';
import { 
  Compass, 
  HelpCircle, 
  Lock, 
  BookOpen, 
  Sparkles,
  Info,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { calculateUserJourney } from '../utils/journeyEngine';
import { GuidedJourneyCard } from './GuidedJourneyCard';
import { FourQuestionsCard } from './FourQuestionsCard';
import { StageProgressTracker } from './StageProgressTracker';
import { StageWorkspaceView } from './StageWorkspaceView';
import { formatUserRole, cleanPresentationText } from '../utils/formatters';
import { LocalSaveIndicator } from './LocalSaveIndicator';

const VALID_STAGES = ['portas', 'contribuicoes', 'evidencias_pendencias', 'integracao_validacao', 'plano_evolucao'];

// Chave contextual: journeyActiveStage:{organizationId}:{cycleId}:{profile}
const getStageStorageKey = (orgId: string, cycleId: string, role: string): string => {
  return `journeyActiveStage:${orgId}:${cycleId}:${role}`;
};

const checkStageRestrictedForRole = (stageId: string, role: string): boolean => {
  if (stageId === 'integracao_validacao') {
    return role === 'GESTOR_INSTITUCIONAL' || role === 'PARTICIPANTE';
  }
  return false;
};

const getInitialStageForCycle = (
  doorStatusesRecord: Record<string, string>,
  stagesProgress: { id: string; isCurrent?: boolean }[],
  role: string
): string => {
  const doors = Object.values(doorStatusesRecord);
  const exploredDoors = doors.filter(
    s => s === 'SUFICIENTEMENTE_EXPLORADA' || s === 'SUFICIENTEMENTE_EXPLORADA_COMPROVACAO_PENDENTE'
  );

  // Regra central: Para um novo ciclo / INITIAL_ASSESSMENT com 0/6 portas percorridas -> sempre Etapa 1
  if (exploredDoors.length === 0) {
    return 'portas';
  }

  // Ciclo existente com progresso sem etapa previamente salva para o perfil:
  // Retoma estágio corrente recomendado desde que não seja restrito ao perfil
  const currentStage = stagesProgress.find(s => s.isCurrent && !checkStageRestrictedForRole(s.id, role));
  if (currentStage && VALID_STAGES.includes(currentStage.id)) {
    return currentStage.id;
  }

  return 'portas';
};

const resolveContextActiveStage = (
  orgId: string,
  cycleId: string,
  role: string,
  doorStatusesRecord: Record<string, string>,
  stagesProgress: { id: string; isCurrent?: boolean }[]
): string => {
  // Limpeza defensiva de chave global legada (evita contaminação entre contextos)
  try {
    sessionStorage.removeItem('d1_active_workspace_stage');
    localStorage.removeItem('d1_active_workspace_stage');
  } catch {
    // noop
  }

  if (!orgId) return 'portas';

  const storageKey = getStageStorageKey(orgId, cycleId, role);
  let savedStage: string | null = null;
  try {
    savedStage = localStorage.getItem(storageKey);
  } catch {
    savedStage = null;
  }

  if (savedStage && VALID_STAGES.includes(savedStage) && !checkStageRestrictedForRole(savedStage, role)) {
    return savedStage;
  }

  return getInitialStageForCycle(doorStatusesRecord, stagesProgress, role);
};

export const HomeView: React.FC = () => {
  const { 
    currentOrg, 
    currentCycle,
    currentUser, 
    doorStatuses, 
    integration, 
    snapshot, 
    pendingItems, 
    divergences,
    evidences,
    distributedRequests,
    actions,
    activeDoorId,
    originalResponses,
    setCurrentView,
    setActiveDoorId
  } = usePilot();

  const role = currentUser.role;
  const isGestor = role === 'GESTOR_INSTITUCIONAL';
  const isParticipant = role === 'PARTICIPANTE';

  const orgId = currentOrg?.id || '';
  const cycleId = currentCycle?.id || 'cycle-default';

  // Cálculo da Jornada e determinação do estágio metodológico
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
    currentOrg: currentOrg || { 
      id: 'temp', 
      name: 'Carregando...', 
      type: 'CAMARA_MUNICIPAL', 
      vertical: 'Poder Público Municipal — Câmara Municipal', 
      municipality: '', 
      state: '', 
      cycleId: 'cycle-default',
      activeCycleName: '',
      methodologyVersion: 'D1 v1.0', 
      createdAt: ''
    },
    activeDoorId,
    originalResponses,
    currentCycle
  });

  // Controles sob demanda (redução de carga cognitiva na primeira dobra)
  const [selectedStageId, setSelectedStageId] = useState<string>(() => {
    if (!orgId) return 'portas';
    return resolveContextActiveStage(
      orgId,
      cycleId,
      role,
      doorStatuses,
      journeyInfo.stagesProgress
    );
  });
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);
  const [showFourQuestions, setShowFourQuestions] = useState<boolean>(false);
  const [showAITransparency, setShowAITransparency] = useState<boolean>(false);

  // Sincronização estrita de localização por ORGANIZAÇÃO + CICLO + PERFIL
  useEffect(() => {
    if (!orgId) return;
    const resolvedStage = resolveContextActiveStage(
      orgId,
      cycleId,
      role,
      doorStatuses,
      journeyInfo.stagesProgress
    );
    setSelectedStageId(resolvedStage);
  }, [orgId, cycleId, role]);

  const handleSelectStage = (stageId: string) => {
    if (!VALID_STAGES.includes(stageId)) return;
    if (checkStageRestrictedForRole(stageId, role)) return;

    setSelectedStageId(stageId);
    if (orgId) {
      const key = getStageStorageKey(orgId, cycleId, role);
      try {
        localStorage.setItem(key, stageId);
      } catch {
        // noop
      }
    }
  };

  const isRestrictedForRole = (stageId: string) => {
    return checkStageRestrictedForRole(stageId, role);
  };

  if (!currentOrg) return null;

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12 animate-in fade-in">
      {/* ===================================================================== */}
      {/* 1. CONTEXTO FIXO E COMPACTO (Section 3 & 13 do Prompt)                */}
      {/* Organização, Dimensão D1, Usuário/Perfil e Recursos Sob Demanda       */}
      {/* ===================================================================== */}
      <header className="bg-emerald-950 border border-emerald-800/90 rounded-2xl p-3.5 sm:p-4 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Dimensão D1 • {currentOrg.methodologyVersion}</span>
              </span>
              <LocalSaveIndicator />
            </div>

            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
              {currentOrg.name}
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto shrink-0">
            {/* Tag do Perfil do Usuário */}
            <div className="bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-xl text-xs flex items-center gap-1.5 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Perfil:</span>
              <span className="font-bold text-slate-100">{currentUser.name}</span>
              <span className="text-emerald-400 font-mono text-[10px] font-semibold">({formatUserRole(currentUser.role)})</span>
            </div>

            {/* Ações Discretas Sob Demanda */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowHowItWorks(prev => !prev)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                  showHowItWorks 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-50 border-emerald-800'
                }`}
                title="Conhecer o fluxo da jornada"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>Como funciona</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFourQuestions(prev => !prev)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                  showFourQuestions 
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' 
                    : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-50 border-emerald-800'
                }`}
                title="Onde estou e o que faço agora"
              >
                <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                <span>Precisa de orientação?</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ONBOARDING SOB DEMANDA ("Como funciona" - Section 13 do Prompt) */}
      {showHowItWorks && (
        <div className="animate-in fade-in">
          <GuidedJourneyCard 
            journeyInfo={journeyInfo} 
            forceOpen={true}
            onToggleForceOpen={() => setShowHowItWorks(false)}
          />
        </div>
      )}

      {/* ORIENTAÇÃO CONTEXTUAL DAS 4 PERGUNTAS SOB DEMANDA (Section 14 do Prompt) */}
      {showFourQuestions && (
        <div className="animate-in fade-in">
          <FourQuestionsCard 
            whereAmI={cleanPresentationText(journeyInfo.fourQuestions.whereAmI)}
            whatToDoNow={cleanPresentationText(journeyInfo.fourQuestions.whatToDoNow)}
            whyItMatters={cleanPresentationText(journeyInfo.fourQuestions.whyItMatters)}
            whatWillIGet={cleanPresentationText(journeyInfo.fourQuestions.whatWillIGet)}
            defaultExpanded={true}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. MAPA DA JORNADA / NAVEGADOR DE ETAPAS (Section 4, 6 e 24 do Prompt)  */}
      {/* Alta affordance visual, cliques substituem o workspace central         */}
      {/* ===================================================================== */}
      <StageProgressTracker 
        stages={journeyInfo.stagesProgress}
        selectedStageId={selectedStageId}
        onSelectStage={handleSelectStage}
        isRestrictedForRole={isRestrictedForRole}
      />

      {/* ===================================================================== */}
      {/* 3. WORKSPACE DA ETAPA SELECIONADA (Section 5 a 12 do Prompt)           */}
      {/* Renderiza SOMENTE o conteúdo da etapa ativa. Troca central imediata.   */}
      {/* ===================================================================== */}
      <main aria-label="Workspace da Etapa Selecionada">
        <StageWorkspaceView 
          selectedStageId={selectedStageId}
          stages={journeyInfo.stagesProgress}
          onNavigateStage={handleSelectStage}
          currentUser={currentUser}
          currentOrg={currentOrg}
          doorStatuses={doorStatuses}
          activeDoorId={activeDoorId}
          setActiveDoorId={setActiveDoorId}
          setCurrentView={setCurrentView}
          pendingItems={pendingItems}
          divergences={divergences}
          evidences={evidences}
          distributedRequests={distributedRequests}
          integration={integration}
          snapshot={snapshot}
          actions={actions}
          journeyInfo={journeyInfo}
        />
      </main>

      {/* ===================================================================== */}
      {/* 4. TRANSPARÊNCIA SOBRE USO DE IA (Sob demanda - Section 16 do Prompt)   */}
      {/* Preservado integralmente sob link / accordion discreto                 */}
      {/* ===================================================================== */}
      <footer className="border border-slate-200/90 bg-slate-50/80 rounded-xl p-3 text-xs text-slate-600 transition-all">
        <button
          type="button"
          onClick={() => setShowAITransparency(prev => !prev)}
          className="w-full flex items-center justify-between font-semibold text-slate-700 hover:text-slate-900 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span>Transparência no uso de IA</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <span>{showAITransparency ? 'Recolher' : 'Consultar diretrizes'}</span>
            {showAITransparency ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </button>

        {showAITransparency && (
          <p className="mt-2 pt-2 border-t border-slate-200 leading-relaxed font-serif text-[11px] text-slate-600 animate-in fade-in">
            Nesta plataforma, a Inteligência Artificial opera estritamente sob o princípio da <strong>Minimização de Dados</strong>:
            cada chamada à IA recebe exclusivamente o fragmento textual mínimo necessário para sua finalidade específica (sugerir sondagens neutras, explicar conceitos breves ou auxiliar na extração estruturada).
            A IA <strong>não recebe a base integral da organização</strong>, não inventa dados ou processos, e suas sugestões não possuem valor conclusivo sem validação metodológica humana registrada.
          </p>
        )}
      </footer>
    </div>
  );
};
