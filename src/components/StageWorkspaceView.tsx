import React, { useEffect, useState } from 'react';
import { loadHistoricalPilot } from '../utils/historicalHydration';
import { 
  DoorId, 
  DoorStatus, 
  DimensionalIntegration, 
  SnapshotD1, 
  PendingItem, 
  DivergenceRecord, 
  EvidenceRecord, 
  DistributedRequest, 
  EvolutionAction, 
  UserProfile, 
  Organization 
} from '../types';
import { JourneyStage, UserJourneyInfo } from '../utils/journeyEngine';
import { DOORS_DEFINITIONS, MOTHER_QUESTION } from '../data/methodologyConstants';
import { DoorStatusBadge } from './MethodologyBadges';
import { 
  formatMaturityLevel, 
  formatCapacityStatus, 
  formatUserRole, 
  formatStageLabel, 
  cleanPresentationText 
} from '../utils/formatters';
import { 
  Compass, 
  ArrowRight, 
  ArrowLeft, 
  Layers, 
  FileText, 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  Sparkles,
  Lock,
  Users,
  Download,
  Link2,
  Quote
} from 'lucide-react';
import { usePilot } from '../context/PilotContext';
import { EvidenceLinkModal, EvidenceLinkBadges } from './EvidenceLinkModal';

interface StageWorkspaceViewProps {
  selectedStageId: string;
  stages: JourneyStage[];
  onNavigateStage: (stageId: string) => void;
  currentUser: UserProfile;
  currentOrg: Organization;
  doorStatuses: Record<DoorId, DoorStatus>;
  activeDoorId: DoorId;
  setActiveDoorId: (doorId: DoorId) => void;
  setCurrentView: (view: any) => void;
  pendingItems: PendingItem[];
  divergences: DivergenceRecord[];
  evidences: EvidenceRecord[];
  distributedRequests: DistributedRequest[];
  integration: DimensionalIntegration;
  snapshot: SnapshotD1 | null;
  actions: EvolutionAction[];
  journeyInfo: UserJourneyInfo;
}

export const StageWorkspaceView: React.FC<StageWorkspaceViewProps> = ({
  selectedStageId,
  stages,
  onNavigateStage,
  currentUser,
  currentOrg,
  doorStatuses,
  activeDoorId,
  setActiveDoorId,
  setCurrentView,
  pendingItems,
  divergences,
  evidences,
  distributedRequests,
  integration,
  snapshot,
  actions,
  journeyInfo
}) => {
  // Estados sob demanda por etapa
  const { evidenceLinks, currentCycle } = usePilot();
  const [historicalDoorIds, setHistoricalDoorIds] = useState<DoorId[]>([]);
  useEffect(() => {
    let cancelled = false;
    if (!currentOrg?.id || currentOrg.id === 'org-camara-vila-esperanca-01') { setHistoricalDoorIds([]); return; }
    loadHistoricalPilot(currentOrg.id).then(h => {
      if (cancelled) return;
      const ids = Array.from(new Set((h?.responses || []).map(r => r.doorId))) as DoorId[];
      setHistoricalDoorIds(ids);
    }).catch(() => { if (!cancelled) setHistoricalDoorIds([]); });
    return () => { cancelled = true; };
  }, [currentOrg?.id]);
  const [linkingEvidence, setLinkingEvidence] = useState<EvidenceRecord | null>(null);
  const [showAllDoorsModal, setShowAllDoorsModal] = useState<boolean>(false);
  const [showMotherQuestionModal, setShowMotherQuestionModal] = useState<boolean>(false);
  const [showEvidencesList, setShowEvidencesList] = useState<boolean>(false);
  const [showPendingDetails, setShowPendingDetails] = useState<boolean>(false);
  const [showCapacitiesDetail, setShowCapacitiesDetail] = useState<boolean>(false);
  const [showSectorsDetail, setShowSectorsDetail] = useState<boolean>(false);

  const role = currentUser.role;
  const isFacilitator = role === 'FACILITADOR';
  const isInterlocutor = role === 'INTERLOCUTOR_PRINCIPAL';
  const isGestor = role === 'GESTOR_INSTITUCIONAL';
  const isParticipant = role === 'PARTICIPANTE';
  const isAdmin = role === 'ADMINISTRADOR';

  const currentIndex = Math.max(0, stages.findIndex(s => s.id === selectedStageId));
  const currentStage = stages[currentIndex] || stages[0];
  const prevStage = currentIndex > 0 ? stages[currentIndex - 1] : null;
  const nextStage = currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;

  // Contagens e diagnósticos
  const doorsArray = Object.keys(doorStatuses) as DoorId[];
  const exploredDoorsCount = doorsArray.filter(d => 
    doorStatuses[d] === 'SUFICIENTEMENTE_EXPLORADA' || 
    doorStatuses[d] === 'SUFICIENTEMENTE_EXPLORADA_COMPROVACAO_PENDENTE'
  ).length;

  const investigatedDoorIds = Array.from(new Set([
    ...doorsArray.filter(d => doorStatuses[d] !== 'NAO_INICIADA'),
    ...historicalDoorIds
  ]));
  const investigatedDoorsCount = investigatedDoorIds.length;
  const isInterviewFinished = Boolean(currentCycle?.interviewCompletedAt) || investigatedDoorsCount === 6;

  const blockingPending = pendingItems.filter(p => p.impact === 'BLOQUEANTE' && p.status !== 'RESOLVIDA');
  const activeDivergences = divergences.filter(d => d.status !== 'EXPLICADA');

  // Identificação da porta de atenção ou foco
  const attentionDoor = DOORS_DEFINITIONS.find(d => doorStatuses[d.id] === 'REQUER_APROFUNDAMENTO') ||
                        DOORS_DEFINITIONS.find(d => doorStatuses[d.id] === 'EM_DESCOBERTA') ||
                        DOORS_DEFINITIONS.find(d => d.id === activeDoorId) ||
                        DOORS_DEFINITIONS[0];

  // Contribuições
  const requestedDistributed = distributedRequests.filter(r => r.status === 'SOLICITADA');
  const answeredDistributed = distributedRequests.filter(r => r.status === 'RESPONDIDA');

  // Tração da governança
  const trackedPercentage = snapshot?.experimentalIndicatorBaseline 
    ? snapshot.experimentalIndicatorBaseline.trackedPercentage 
    : 35;

  // =========================================================================
  // RENDERIZAÇÃO ESPECÍFICA POR ETAPA
  // =========================================================================

  // ETAPA 1: DIAGNÓSTICO (Portas D1.1 a D1.6)
  const renderStage1Diagnostico = () => {
    return (
      <div className="space-y-4">
        {/* Banner do Workspace da Etapa 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Etapa 1 de 5 • Diagnóstico</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                Diagnóstico das 6 Portas D1
              </h2>
              <p className="text-xs text-slate-300 font-serif max-w-2xl leading-relaxed">
                Investigação de evidências e rotinas reais. A maturidade parte da prática sustentada, sem antecipar notas ou checklists superficiais.
              </p>
            </div>

            {/* Síntese Quantitativa da Investigação */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3.5 shrink-0 text-right self-start md:self-auto min-w-[170px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Situação da Investigação
              </span>
              <div className="text-2xl font-black text-emerald-400 mt-0.5 font-mono">
                {investigatedDoorsCount} / 6
              </div>
              <span className="text-[11px] text-slate-300 font-medium">
                {isInterviewFinished ? 'coleta concluída' : 'portas investigadas'}
              </span>
            </div>
          </div>
        </div>

        {/* Notificação de Conclusão da Coleta Fática */}
        {isInterviewFinished && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4.5 flex items-start gap-3.5 shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-emerald-950 font-serif leading-relaxed">
              <span className="font-bold font-sans text-emerald-900 block text-sm">
                Entrevista Fática Presencial Concluída ({currentCycle?.interviewCompletedAt ? new Date(currentCycle.interviewCompletedAt).toLocaleDateString('pt-BR') : '6/6 Portas'})
              </span>
              <p>
                As declarações fáticas das 6 portas de entrada foram registradas. O ciclo avança conforme as prioridades reais do diagnóstico, com conferência de evidências documentais, saneamento de pendências probatórias e validações conduzidas pelo Facilitador.
              </p>
            </div>
          </div>
        )}

        {/* Bloco Focal da Etapa: Preparação e Contextualização da Entrevista */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Condução da Entrevista de Governança
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Preparação e Contextualização da Entrevista D1
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Porta ativa:</span>
              <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded font-mono border border-emerald-200">
                {attentionDoor.code} — {attentionDoor.title}
              </span>
            </div>
          </div>

          {/* 1. Fala Sugerida de Abertura */}
          <div className="bg-emerald-50/60 border border-emerald-200/90 rounded-xl p-4 sm:p-5 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-emerald-700" />
                Sugestão de abertura
              </span>
              <span className="text-[11px] text-emerald-700 font-medium">
                O Facilitador pode utilizar ou adaptar esta fala para abrir a conversa
              </span>
            </div>
            <div className="border-l-2 border-emerald-500 pl-3.5 py-1">
              <p className="text-sm text-slate-800 leading-relaxed font-serif">
                “Antes de começarmos, queremos entender como a privacidade e a proteção de dados funcionam hoje na prática na Câmara. Esta conversa não é uma auditoria nem um checklist e não existem respostas certas ou erradas. Vamos conversar sobre situações e rotinas do dia a dia para compreender quem participa, como as coisas acontecem e como a Câmara costuma lidar com essas questões. É natural que algumas informações técnicas ou de outras áreas não estejam disponíveis agora. Quando surgir algo que dependa de outra pessoa, área ou documento, nós apenas registraremos para verificar posteriormente.”
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="text-xs text-slate-500 font-serif">
              {isInterviewFinished ? (
                <div className="flex items-center gap-2 text-emerald-800 font-sans font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Coleta fática concluída: <strong>Todas as 6 portas</strong> foram percorridas. Fase de escuta presencial finalizada.
                  </span>
                </div>
              ) : investigatedDoorsCount === 0 ? (
                <span>A entrevista percorrerá <strong>6 portas de investigação</strong> (D1.1 a D1.6), com perguntas abertas e foco prático.</span>
              ) : (
                <span>Investigação em andamento: <strong>{investigatedDoorsCount} de 6 portas</strong> já percorridas.</span>
              )}
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setActiveDoorId(attentionDoor.id);
                  setCurrentView('INTERVIEW');
                }}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
                  isInterviewFinished
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                    : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white'
                }`}
              >
                <span>
                  {isInterviewFinished
                    ? 'Visualizar respostas'
                    : investigatedDoorsCount === 0
                    ? 'Iniciar entrevista'
                    : `Continuar entrevista na Porta ${attentionDoor.code}`}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Recursos Sob Demanda da Etapa 1 */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setShowAllDoorsModal(prev => !prev)}
            className="text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>{showAllDoorsModal ? 'Ocultar matriz das 6 Portas' : `Ver todas as 6 Portas (${investigatedDoorsCount}/6)`}</span>
            {showAllDoorsModal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setShowMotherQuestionModal(prev => !prev)}
            className="text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
            <span>{showMotherQuestionModal ? 'Ocultar Pergunta-Mãe D1' : 'Entenda o que estamos avaliando (Pergunta-Mãe)'}</span>
            {showMotherQuestionModal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* MATRIZ COMPLETA DAS 6 PORTAS (Sob Demanda) */}
        {showAllDoorsModal && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                Estrutura das 6 Portas de Entrada D1
              </h4>
              <span className="text-[11px] text-slate-500">
                Selecione qualquer porta para investigar
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {DOORS_DEFINITIONS.map(door => (
                <div 
                  key={door.id}
                  className={`bg-white border rounded-xl p-3.5 shadow-2xs space-y-2 flex flex-col justify-between ${
                    door.id === attentionDoor.id ? 'border-emerald-400 ring-1 ring-emerald-300' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-800">{door.code}</span>
                      <DoorStatusBadge status={doorStatuses[door.id]} />
                    </div>
                    <h5 className="font-bold text-xs text-slate-900 leading-snug">{door.title}</h5>
                    <p className="text-[11px] text-slate-600 font-serif line-clamp-2">
                      {door.essentialQuestion}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveDoorId(door.id);
                      setCurrentView('INTERVIEW');
                    }}
                    className="w-full text-center py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-800 text-[11px] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1 mt-2"
                  >
                    <span>Investigar esta porta</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PERGUNTA-MÃE INTEGRAL D1 (Sob Demanda) */}
        {showMotherQuestionModal && (
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-300">
                Pergunta-Mãe da Dimensão D1 — Governança e Responsabilidades
              </h4>
            </div>
            <p className="text-slate-200 text-xs sm:text-sm font-serif leading-relaxed italic border-l-2 border-emerald-500 pl-3">
              “{MOTHER_QUESTION}”
            </p>
            <p className="text-[11px] text-slate-400 font-serif">
              Esta pergunta orienta todo o processo avaliativo, impedindo que aspectos puramente formais ou burocráticos sejam confundidos com capacidade institucional instalada.
            </p>
          </div>
        )}
      </div>
    );
  };

  // ETAPA 2: CONTRIBUIÇÕES INSTITUCIONAIS
  const renderStage2Contribuicoes = () => {
    return (
      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                <span>Etapa 2 de 5 • Contribuições</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                Contribuições Institucionais
              </h2>
              <p className="text-xs text-slate-300 font-serif max-w-2xl leading-relaxed">
                Averiguação com os setores identificados da instituição. Perguntas pontuais e neutras evitam viés de conformidade.
              </p>
            </div>

            {/* Painel de Status das Solicitações */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3.5 shrink-0 text-right self-start md:self-auto min-w-[170px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Informações Recebidas
              </span>
              <div className="text-2xl font-black text-sky-400 mt-0.5 font-mono">
                {answeredDistributed.length} / {distributedRequests.length}
              </div>
              <span className="text-[11px] text-slate-300 font-medium">
                {requestedDistributed.length} fonte(s) pendente(s)
              </span>
            </div>
          </div>
        </div>

        {/* Bloco Focal da Etapa 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Contribuições Solicitadas</span>
              <div className="text-xl font-bold text-slate-900">{distributedRequests.length}</div>
              <p className="text-[11px] text-slate-500">Mapeadas para as portas ativas</p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Informações Recebidas</span>
              <div className="text-xl font-bold text-emerald-800">{answeredDistributed.length}</div>
              <p className="text-[11px] text-emerald-600">Disponíveis para análise e conferência</p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-700 block">Fontes Pendentes</span>
              <div className="text-xl font-bold text-amber-800">{requestedDistributed.length}</div>
              <p className="text-[11px] text-amber-600">Aguardando preenchimento setorial</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-600 font-serif">
              {isParticipant 
                ? 'Responde somente às questões relacionadas à sua atuação ou ao processo sobre o qual possui conhecimento adequado.'
                : 'Consolide as informações recebidas ou envie novas consultas neutras aos setores identificados.'}
            </div>

            <button
              type="button"
              onClick={() => setCurrentView('DISTRIBUTED')}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>{isParticipant ? 'Responder Contribuição' : 'Acessar Contribuições'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Recursos Sob Demanda da Etapa 2 */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowSectorsDetail(prev => !prev)}
            className="text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-sky-600" />
            <span>{showSectorsDetail ? 'Ocultar detalhamento dos setores' : `Ver solicitações por setor (${distributedRequests.length})`}</span>
            {showSectorsDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showSectorsDetail && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 animate-in fade-in">
            <h4 className="text-xs font-bold text-slate-900">Solicitações Ativas</h4>
            <div className="space-y-2">
              {distributedRequests.map(req => (
                <div key={req.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{req.targetDepartment} • Porta {req.doorId}</div>
                    <div className="text-slate-600 font-serif text-[11px] mt-0.5">{req.minimalNeutralQuestion}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    req.status === 'RESPONDIDA' 
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}>
                    {req.status === 'RESPONDIDA' ? 'Respondida' : 'Aguardando Setor'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ETAPA 3: EVIDÊNCIAS E PENDÊNCIAS
  const renderStage3EvidenciasPendencias = () => {
    return (
      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Etapa 3 de 5 • Evidências e Pendências</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                Evidências e Tratamento de Pendências
              </h2>
              <p className="text-xs text-slate-300 font-serif max-w-2xl leading-relaxed">
                A conclusão considera a suficiência das informações e, quando necessário, das evidências disponíveis. A necessidade de comprovação documental depende da natureza de cada capacidade.
              </p>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3.5 shrink-0 text-right self-start md:self-auto min-w-[170px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Evidências Registradas
              </span>
              <div className="text-2xl font-black text-amber-400 mt-0.5 font-mono">
                {evidences.length}
              </div>
              <span className="text-[11px] text-slate-300 font-medium">
                evidências registradas
              </span>
            </div>
          </div>
        </div>

        {/* Bloco Focal: O que Requer Atenção */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              O Que Requer Atenção
            </span>

            {blockingPending.length > 0 ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-red-800 font-bold text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>1 pendência bloqueadora permanece em tratamento.</span>
                </div>
                <p className="text-xs text-red-900 font-serif leading-relaxed">
                  <strong>Item:</strong> {blockingPending[0].title}.
                  {blockingPending[0].description && ` ${blockingPending[0].description}`}
                </p>
                <p className="text-[11px] text-red-700 font-serif">
                  Esta pendência precisa ser tratada antes da conclusão da análise correspondente.
                </p>
              </div>
            ) : activeDivergences.length > 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{activeDivergences.length} divergência(s) entre informações setoriais</span>
                </div>
                <p className="text-xs text-amber-900 font-serif leading-relaxed">
                  {activeDivergences[0].title}: {activeDivergences[0].description}
                </p>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Não há pendências bloqueadoras abertas no momento. As informações disponíveis atendem aos critérios desta etapa.</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-600 font-serif">
              <strong>Próximo passo:</strong> Apresentar as informações ou evidências necessárias para o tratamento da pendência.
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setCurrentView('PENDING')}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Tratar Pendências ({pendingItems.filter(p => p.status !== 'RESOLVIDA').length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('EVIDENCES')}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Cadastrar Evidência</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Recursos Sob Demanda da Etapa 3 */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setShowPendingDetails(prev => !prev)}
            className="text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>{showPendingDetails ? 'Ocultar pendências' : `Ver pendências em aberto (${pendingItems.filter(p => p.status !== 'RESOLVIDA').length})`}</span>
            {showPendingDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setShowEvidencesList(prev => !prev)}
            className="text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>{showEvidencesList ? 'Ocultar evidências' : `Consultar evidências registradas (${evidences.length})`}</span>
            {showEvidencesList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showPendingDetails && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 animate-in fade-in">
            <h4 className="text-xs font-bold text-slate-900">Quadro de Pendências</h4>
            <div className="space-y-2">
              {pendingItems.filter(p => p.status !== 'RESOLVIDA').map(p => (
                <div key={p.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">{p.title}</div>
                    <div className="text-[11px] text-slate-600 font-serif">{p.description}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                    p.impact === 'BLOQUEANTE' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {p.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showEvidencesList && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 animate-in fade-in">
            <h4 className="text-xs font-bold text-slate-900">Evidências Registradas</h4>
            <div className="space-y-2">
              {evidences.map(ev => {
                const linksForEv = evidenceLinks.filter(l => l.evidenceId === ev.id);

                return (
                  <div key={ev.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1.5 flex-1">
                      <div>
                        <div className="font-bold text-slate-900">{ev.title}</div>
                        <div className="text-[11px] text-slate-600 font-serif">Tipo: {ev.type}</div>
                      </div>
                      <EvidenceLinkBadges links={linksForEv} />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(ev.date).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => setLinkingEvidence(ev)}
                        className="text-xs font-semibold text-purple-700 hover:text-purple-900 px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                        title="Gerenciar vínculos estruturais de suficiência por capacidade (EvidenceLink)"
                      >
                        <Link2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>Vínculos ({linksForEv.length})</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ETAPA 4: ANÁLISE E VALIDAÇÃO METODOLÓGICA
  const renderStage4AnaliseValidacao = () => {
    // 1. Perfil Gestor Institucional ou Participante Convidado: Apresentação orientada a acompanhamento executivo e evolução
    if (isGestor || isParticipant) {
      return (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xs">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <h2 className="text-base sm:text-lg font-bold">
                Etapa 4 de 5 • Análise e Validação das Capacidades
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-serif mt-1 max-w-2xl leading-relaxed">
              A análise técnica das capacidades e a validação metodológica humana são conduzidas pela facilitação.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-serif leading-relaxed">
              Como <strong>{formatUserRole(currentUser.role)}</strong>, você acompanha o resultado validado metodologicamente e as metas pactuadas no <strong>Plano de Evolução (Etapa 5)</strong> ou no <strong>Retrato Executivo</strong>.
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => onNavigateStage('plano_evolucao')}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Avançar para Etapa 5: Evolução</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('OUTPUTS')}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Consultar Retrato Executivo</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 2. Perfil Administrador Técnico: Privilégio Técnico ≠ Privilégio de Conteúdo
    if (isAdmin) {
      return (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xs">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <h2 className="text-base sm:text-lg font-bold">
                Etapa 4 de 5 • Análise e Validação (Acesso Técnico)
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-serif mt-1 max-w-2xl leading-relaxed">
              Privilégio Técnico ≠ Privilégio de Conteúdo. A integração metodológica C1–C6 e a validação de maturidade são instrumentos restritos à facilitação autorizada.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-serif leading-relaxed">
              O perfil <strong>Administrador Técnico</strong> possui atribuições estritas de infraestrutura, testes de integridade e rotinas operacionais de sustentação, sem acesso automático ao conteúdo analítico ou validação metodológica.
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setCurrentView('TESTS_HARNESS')}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Testes do Sistema</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('BACKUP')}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span>Backup &amp; Exportação</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 3. Perfil Interlocutor Principal / Encarregado: Apresentação própria simples e institucional (sem controles nem workspace da facilitação)
    if (isInterlocutor) {
      const isValidated = integration.humanValidation.isValidated;
      const validatedLevel = integration.humanValidation.validatedLevel;
      const hasNextLevelUnderAnalysis = isValidated && (
        validatedLevel !== 'N5_OTIMIZADO' && (
          pendingItems.some(p => p.status !== 'RESOLVIDA') ||
          Object.values(integration.capacities).some(c => c.status !== 'DEMONSTRADA')
        )
      );
      const activePendingCount = pendingItems.filter(p => p.status !== 'RESOLVIDA').length;

      return (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Etapa 4 de 5 • Análise e Validação</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Etapa 4 de 5 • Análise e Validação
                </h2>
                <p className="text-xs text-slate-300 font-serif max-w-2xl leading-relaxed">
                  As informações e evidências reunidas estão sendo analisadas para consolidar o resultado da Dimensão D1.
                </p>
              </div>

              <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3.5 shrink-0 text-right self-start md:self-auto min-w-[190px]">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Validação Metodológica
                </span>
                {isValidated ? (
                  <div className="mt-1 space-y-0.5">
                    <div className="text-sm sm:text-base font-black text-purple-400 font-mono">
                      Nível consolidado: {formatMaturityLevel(validatedLevel)}
                    </div>
                    {hasNextLevelUnderAnalysis && (
                      <div className="text-xs text-purple-300 font-sans font-medium">
                        Próximo nível: em análise
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm sm:text-base font-black text-amber-400 mt-1 font-mono">
                    Maturidade ainda não apurada
                  </div>
                )}
                <span className="text-[11px] text-slate-300 font-medium block mt-1">
                  {isValidated ? 'Validado metodologicamente' : 'Aguardando validação'}
                </span>
              </div>
            </div>
          </div>

          {/* Painel Institucional Agregado para o Interlocutor */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Situação Geral da Análise */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Situação Geral da Análise</span>
                <div className="font-bold text-slate-900 text-sm">
                  {exploredDoorsCount === 6 ? 'Todas as 6 Portas Percorridas' : `${exploredDoorsCount} de 6 Portas Percorridas`}
                </div>
                <p className="text-slate-600 text-[11px] font-serif">
                  Diagnóstico das portas concluído. As informações e evidências estão em apreciação técnica pela facilitação.
                </p>
              </div>

              {/* Pendências da Instituição */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Pendências da Instituição</span>
                <div className="font-bold text-slate-900 text-sm">
                  {activePendingCount > 0 ? `${activePendingCount} pendência(s) em tratamento` : 'Nenhuma pendência ativa'}
                </div>
                <p className="text-slate-600 text-[11px] font-serif">
                  {blockingPending.length > 0 
                    ? '1 pendência bloqueadora em tratamento requer fornecimento ou complementação de evidências.' 
                    : activePendingCount > 0
                    ? 'Existem pendências pontuais aguardando complementação documental.'
                    : 'Todas as pendências institucionais registradas foram sanadas.'}
                </p>
              </div>

              {/* Resultado Validado da D1 */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-purple-700 block">Resultado Validado</span>
                {isValidated ? (
                  <div className="space-y-0.5">
                    <div className="font-bold text-purple-950 text-sm font-mono">
                      Nível consolidado: {formatMaturityLevel(validatedLevel)}
                    </div>
                    {hasNextLevelUnderAnalysis && (
                      <div className="text-xs text-purple-700 font-semibold">
                        Próximo nível: em análise
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="font-bold text-purple-900 text-sm font-mono">
                    Maturidade ainda não apurada
                  </div>
                )}
                <p className="text-purple-700 text-[11px] font-serif">
                  {isValidated 
                    ? 'Resultado metodologicamente validado. Disponível para consulta institucional e alinhamento no plano de evolução.'
                    : 'Aguardando conclusão da análise metodológica para consolidação do nível de maturidade.'}
                </p>
              </div>
            </div>

            {/* Próximos Passos e Ações Permitidas ao Interlocutor */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="text-xs text-slate-600 font-serif">
                <strong>Próximo passo institucional:</strong>{' '}
                {activePendingCount > 0
                  ? 'Apresentar as informações ou evidências necessárias para o tratamento da pendência.'
                  : 'Acompanhar a consolidação dos resultados e seguir para o Plano de Evolução.'}
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {activePendingCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setCurrentView('PENDING')}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Tratar Pendências</span>
                  </button>
                )}

                {isValidated && (
                  <button
                    type="button"
                    onClick={() => setCurrentView('OUTPUTS')}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Consultar Resultado Validado</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onNavigateStage('plano_evolucao')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Seguir para Plano de Evolução</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 4. Perfil Facilitador Metodológico: Workspace técnico integral preservado
    const isValidated = integration.humanValidation.isValidated;
    const validatedLevel = integration.humanValidation.validatedLevel;
    const hasNextLevelUnderAnalysis = isValidated && (
      validatedLevel !== 'N5_OTIMIZADO' && (
        pendingItems.some(p => p.status !== 'RESOLVIDA') ||
        Object.values(integration.capacities).some(c => c.status !== 'DEMONSTRADA')
      )
    );

    return (
      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Etapa 4 de 5 • Análise e Validação</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                Análise das Capacidades da Dimensão D1
              </h2>
              <p className="text-xs text-slate-300 font-serif max-w-2xl leading-relaxed">
                O nível de maturidade considera o conjunto das capacidades essenciais demonstradas. Práticas mais avançadas, isoladamente, não compensam fragilidades estruturais de capacidades anteriores.
              </p>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3.5 shrink-0 text-right self-start md:self-auto min-w-[190px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Validação Metodológica
              </span>
              {isValidated ? (
                <div className="mt-1 space-y-0.5">
                  <div className="text-sm sm:text-base font-black text-purple-400 font-mono">
                    Nível consolidado: {formatMaturityLevel(validatedLevel)}
                  </div>
                  {hasNextLevelUnderAnalysis && (
                    <div className="text-xs text-purple-300 font-sans font-medium">
                      Próximo nível: em análise
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm sm:text-base font-black text-amber-400 mt-1 font-mono">
                  Maturidade ainda não apurada
                </div>
              )}
              <span className="text-[11px] text-slate-300 font-medium block mt-1">
                {isValidated ? 'Validado metodologicamente' : 'Aguardando validação'}
              </span>
            </div>
          </div>
        </div>

        {/* Bloco Focal da Etapa 4 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Situação da Análise</span>
              <div className="font-bold text-slate-900 text-sm">
                {exploredDoorsCount === 6 ? 'Todas as 6 Portas Percorridas' : `${exploredDoorsCount} de 6 Portas Percorridas`}
              </div>
              <p className="text-slate-600 text-[11px] font-serif">
                {blockingPending.length > 0 
                  ? '1 pendência bloqueadora permanece em tratamento.' 
                  : 'Nenhuma pendência impeditiva ativa.'}
              </p>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-purple-700 block">Nível de Maturidade</span>
              {isValidated ? (
                <div className="space-y-1">
                  <div className="font-bold text-purple-950 text-sm font-mono">
                    Nível consolidado: {formatMaturityLevel(validatedLevel)}
                  </div>
                  {hasNextLevelUnderAnalysis && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-100/90 border border-purple-200 text-purple-900 text-xs font-semibold">
                      <span>Próximo nível: em análise</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="font-bold text-purple-900 text-sm font-mono">
                  Maturidade ainda não apurada
                </div>
              )}
              <p className="text-purple-700 text-[11px] font-serif">
                {isValidated 
                  ? `Validado metodologicamente em ${new Date(integration.humanValidation.validatedAt || '').toLocaleDateString('pt-BR')} — responsável: ${cleanPresentationText(integration.humanValidation.facilitatorName) || 'Facilitador'}.` 
                  : 'Consolide a matriz de capacidades para emissão da validação metodológica.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-600 font-serif">
              <strong>Próximo passo da análise:</strong> Revisar as informações e evidências relacionadas às capacidades C1–C6 e registrar a conclusão metodológica.
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setCurrentView('INTEGRATION')}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Analisar Capacidades C1–C6</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {isValidated && (
                <button
                  type="button"
                  onClick={() => setCurrentView('SNAPSHOT')}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-purple-300" />
                  <span>Gerar Snapshot D1</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Recursos Sob Demanda da Etapa 4 */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowCapacitiesDetail(prev => !prev)}
            className="text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>{showCapacitiesDetail ? 'Ocultar síntese das capacidades' : 'Ver síntese das capacidades'}</span>
            {showCapacitiesDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showCapacitiesDetail && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 animate-in fade-in">
            <h4 className="text-xs font-bold text-slate-900">Capacidades Analisadas (C1 a C6)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {Object.keys(integration.capacities).map(key => {
                const cap = integration.capacities[key as keyof typeof integration.capacities];
                return (
                  <div key={key} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Capacidade {cap.capacityId}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {formatCapacityStatus(cap.status)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-serif line-clamp-2">
                      {cap.rationale}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ETAPA 5: EVOLUÇÃO E GOVERNANÇA
  const renderStage5Evolucao = () => {
    const isValidated = integration.humanValidation.isValidated;
    const validatedLevel = integration.humanValidation.validatedLevel;
    const hasNextLevelUnderAnalysis = isValidated && (
      validatedLevel !== 'N5_OTIMIZADO' && (
        pendingItems.some(p => p.status !== 'RESOLVIDA') ||
        Object.values(integration.capacities).some(c => c.status !== 'DEMONSTRADA')
      )
    );

    return (
      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Etapa 5 de 5 • Plano de Evolução</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                Plano de Evolução e Tração da Governança
              </h2>
              <p className="text-xs text-slate-300 font-serif max-w-2xl leading-relaxed">
                A avaliação institucional impulsiona ações práticas na Câmara. Acompanhamento das metas pactuadas e do indicador experimental de governança.
              </p>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3.5 shrink-0 text-right self-start md:self-auto min-w-[170px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Tração da Governança
              </span>
              <div className="text-2xl font-black text-emerald-400 mt-0.5 font-mono">
                {trackedPercentage}%
              </div>
              <span className="text-[11px] text-slate-300 font-medium">
                continuidade prática
              </span>
            </div>
          </div>
        </div>

        {/* Bloco Focal da Etapa 5 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* 1. Nível de Maturidade Validado */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Nível de Maturidade</span>
              {isValidated ? (
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-slate-900 font-mono">
                    Nível consolidado: {formatMaturityLevel(validatedLevel)}
                  </div>
                  {hasNextLevelUnderAnalysis && (
                    <div className="text-xs text-purple-700 font-semibold">
                      Próximo nível: em análise
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm font-bold text-slate-700 font-mono">
                  Maturidade ainda não apurada
                </div>
              )}
              <div className="text-emerald-700 font-bold text-[11px]">
                Validado metodologicamente
              </div>
              {blockingPending.length > 0 && (
                <div className="text-amber-800 text-[10px] font-semibold pt-1 border-t border-slate-200 mt-1">
                  1 pendência em tratamento antes de nível superior.
                </div>
              )}
            </div>

            {/* 2. Próxima Conquista Almejada */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Próxima Conquista</span>
              <div className="text-xs font-bold text-slate-900 leading-snug">
                Formalização dos Fluxos e Pactuações Setoriais
              </div>
              <p className="text-[11px] text-slate-600 font-serif">
                Consolidação de evidências operacionais de governança.
              </p>
            </div>

            {/* 3. Ações Estruturadas do Ciclo */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Ações Pactuadas</span>
              <div className="text-base font-bold text-slate-900">
                {actions.length} ação(ões)
              </div>
              <p className="text-[11px] text-slate-600 font-serif">
                Com responsáveis designados, prazos e critérios.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-600 font-serif">
              {isGestor 
                ? 'Acompanhe o cumprimento das prioridades do ciclo e aprove os apoios necessários deliberados pela Casa.'
                : 'Acompanhe as ações pactuadas para assegurar a continuidade da governança.'}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setCurrentView('ACTION_PLAN')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Acessar Plano de Evolução D1</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('OUTPUTS')}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Retrato Executivo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Seletor do Conteúdo da Etapa
  const renderStageContent = () => {
    switch (selectedStageId) {
      case 'portas':
        return renderStage1Diagnostico();
      case 'contribuicoes':
        return renderStage2Contribuicoes();
      case 'evidencias_pendencias':
        return renderStage3EvidenciasPendencias();
      case 'integracao_validacao':
        return renderStage4AnaliseValidacao();
      case 'plano_evolucao':
        return renderStage5Evolucao();
      default:
        return renderStage1Diagnostico();
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* CONTEÚDO CENTRAL DO WORKSPACE */}
      <div className="w-full">
        {renderStageContent()}
      </div>

      {/* ===================================================================== */}
      {/* NAVEGAÇÃO ANTERIOR / PRÓXIMA DA JORNADA                                */}
      {/* ===================================================================== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-200">
        <div>
          {prevStage ? (
            <button
              type="button"
              onClick={() => onNavigateStage(prevStage.id)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer group"
              title={`Voltar para o workspace da etapa: ${formatStageLabel(prevStage.id, prevStage.label)}`}
            >
              <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-emerald-700 transition-colors" />
              <span>Etapa Anterior: {formatStageLabel(prevStage.id, prevStage.label)}</span>
            </button>
          ) : (
            <div className="text-[11px] text-slate-400 font-medium text-center sm:text-left py-1">
              Primeira etapa da jornada
            </div>
          )}
        </div>

        <div>
          {nextStage ? (
            <button
              type="button"
              onClick={() => onNavigateStage(nextStage.id)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
              title={`Avançar para o workspace da etapa: ${formatStageLabel(nextStage.id, nextStage.label)}`}
            >
              <span>Próxima Etapa: {formatStageLabel(nextStage.id, nextStage.label)}</span>
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <div className="text-[11px] text-slate-400 font-medium text-center sm:text-right py-1">
              Última etapa da jornada D1
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Gerenciar Vínculos de Suficiência por Capacidade (EvidenceLink) */}
      {linkingEvidence && (
        <EvidenceLinkModal
          evidence={linkingEvidence}
          onClose={() => setLinkingEvidence(null)}
        />
      )}
    </div>
  );
};
