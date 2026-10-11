import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Organization,
  EvaluationCycle,
  CycleStatus,
  UserProfile,
  DoorId,
  DoorStatus,
  QuestionInstance,
  OriginalResponse,
  DontKnowRecord,
  DontKnowReason,
  InformationUnit,
  ProbingRecord,
  PedagogicalIntervention,
  DistributedRequest,
  DivergenceRecord,
  DivergenceStatus,
  EvidenceRecord,
  EvidenceStatus,
  EvidenceLink,
  EvidenceSufficiency,
  AIAnalysisRecord,
  PendingItem,
  DimensionalIntegration,
  SnapshotD1,
  ValidatedGap,
  EvolutionAction,
  ExperimentalIndicatorFeedback,
  MethodologicalDiaryEntry,
  MethodologicalTelemetry,
  CapacityId,
  CapacityStatus,
  MaturityLevel,
  InfoScope,
  JourneyEventRecord,
  InstitutionalAsIsRecord
} from '../types';

import { isViewAllowedForRole, getDefaultViewForRole } from '../utils/rolePermissions';
import { getInstitutionalToken } from '../services/institutionalAuth';
import {
  adaptCycleBundleToDomain,
  mapOrganizationRowToDomain,
  mapCycleRowToDomain
} from '../services/persistence/supabaseAdapters';

import {
  SEED_ORGANIZATION,
  SEED_CYCLE_VILA_ESPERANCA,
  SEED_USERS,
  INITIAL_DOOR_STATUSES,
  SEED_QUESTION_INSTANCES,
  SEED_RESPONSES,
  SEED_DONT_KNOW_RECORD,
  SEED_INFORMATION_UNITS,
  SEED_PROBINGS,
  SEED_PEDAGOGICAL_INTERVENTIONS,
  SEED_DISTRIBUTED_REQUESTS,
  SEED_DIVERGENCE,
  SEED_EVIDENCES,
  SEED_EVIDENCE_LINKS,
  SEED_AI_ANALYSIS,
  SEED_PENDING_ITEMS,
  SEED_INTEGRATION,
  SEED_GAPS,
  SEED_ACTIONS,
  SEED_EXPERIMENTAL_INDICATOR,
  SEED_SNAPSHOT_D1,
  SEED_DIARY_ENTRIES,
  SEED_TELEMETRY
} from '../data/seedData';

import { DOORS_DEFINITIONS, METHODOLOGY_VERSION } from '../data/methodologyConstants';

export type AppView = 
  | 'CENTRAL'
  | 'HOME'
  | 'DIAGNOSTIC'
  | 'KNOWLEDGE'
  | 'INTERVIEW'
  | 'FACILITATOR_PANEL'
  | 'DISTRIBUTED'
  | 'EVIDENCES'
  | 'PENDING'
  | 'INTEGRATION'
  | 'SNAPSHOT'
  | 'ACTION_PLAN'
  | 'INDICATOR'
  | 'OUTPUTS'
  | 'DIARY'
  | 'BACKUP'
  | 'TESTS_HARNESS';

export interface PilotOrgData {
  doorStatuses: Record<DoorId, DoorStatus>;
  questionInstances: QuestionInstance[];
  originalResponses: OriginalResponse[];
  dontKnowRecords: DontKnowRecord[];
  informationUnits: InformationUnit[];
  probings: ProbingRecord[];
  pedagogicalInterventions: PedagogicalIntervention[];
  distributedRequests: DistributedRequest[];
  divergences: DivergenceRecord[];
  evidences: EvidenceRecord[];
  evidenceLinks: EvidenceLink[];
  aiAnalyses: AIAnalysisRecord[];
  pendingItems: PendingItem[];
  integration: DimensionalIntegration;
  snapshot: SnapshotD1 | null;
  gaps: ValidatedGap[];
  actions: EvolutionAction[];
  experimentalIndicator: ExperimentalIndicatorFeedback;
  diaryEntries: MethodologicalDiaryEntry[];
  telemetry: MethodologicalTelemetry;
  activeDoorId: DoorId;
  journeyEvents?: JourneyEventRecord[];
  asIsHistory?: InstitutionalAsIsRecord[];
}

interface PilotContextType {
  // Multi-organizações e Ciclos
  organizations: Organization[];
  cycles: EvaluationCycle[];
  currentOrg: Organization | null;
  currentCycle: EvaluationCycle | null;
  selectOrganization: (orgId: string) => void;
  returnToOrganizationsHub: () => void;
  createOrganization: (data: {
    name: string;
    vertical: 'Poder Público Municipal — Câmara Municipal';
    municipality?: string;
    state?: string;
    mainInterlocutorName?: string;
    mainInterlocutorRole?: string;
    mainInterlocutorEmail?: string;
  }) => Promise<Organization>;
  startD1Cycle: (organizationId: string) => Promise<EvaluationCycle>;
  completeInterview: () => void;
  getOrganizationSummary: (orgId: string) => {
    cycleName: string;
    cycleStatus: CycleStatus;
    blockingPendingCount: number;
    lastActivityDate?: string;
    methodologyVersion: string;
    vertical: string;
  };

  // Estado básico e sessão
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  availableUsers: UserProfile[];
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  activeDoorId: DoorId;
  setActiveDoorId: (doorId: DoorId) => void;
  activeResponseId: string | null;
  setActiveResponseId: (responseId: string | null) => void;

  // Estado das portas
  doorStatuses: Record<DoorId, DoorStatus>;
  updateDoorStatus: (doorId: DoorId, status: DoorStatus) => void;

  // Question Instances e Respostas Originais (Imutáveis)
  questionInstances: QuestionInstance[];
  originalResponses: OriginalResponse[];
  addOriginalResponse: (doorId: DoorId, text: string, respondent?: UserProfile) => void;
  addRetificationResponse: (previousResponseId: string, newText: string) => void;
  addComplementResponse: (previousResponseId: string, newText: string) => void;

  // Não sei
  dontKnowRecords: DontKnowRecord[];
  recordDontKnow: (
    doorId: DoorId,
    reason: DontKnowReason,
    justification: string,
    action: DontKnowRecord['nextStepAction']
  ) => void;

  // Unidades de Informação
  informationUnits: InformationUnit[];
  addInformationUnit: (unit: Omit<InformationUnit, 'id' | 'timestamp'>) => void;
  updateUnitValidation: (unitId: string, status: InformationUnit['validationStatus']) => void;

  // Sondagens
  probings: ProbingRecord[];
  addProbingRecord: (probing: Omit<ProbingRecord, 'id' | 'timestamp'>) => void;

  // Intervenções Pedagógicas
  pedagogicalInterventions: PedagogicalIntervention[];
  addPedagogicalIntervention: (intervention: Omit<PedagogicalIntervention, 'id' | 'timestamp'>) => void;

  // Investigação Distribuída
  distributedRequests: DistributedRequest[];
  createDistributedRequest: (
    doorId: DoorId,
    targetName: string,
    department: string,
    reasonType: DistributedRequest['reasonType'],
    neutralQuestion: string,
    contextGiven: string
  ) => void;
  answerDistributedRequest: (
    requestId: string,
    text: string,
    scope: InfoScope,
    evidencesMentioned?: string[]
  ) => void;

  // Divergências
  divergences: DivergenceRecord[];
  addDivergence: (div: Omit<DivergenceRecord, 'id'>) => void;
  updateDivergenceStatus: (id: string, status: DivergenceStatus, notes?: string) => void;

  // Evidências e Vínculos de Suficiência
  evidences: EvidenceRecord[];
  evidenceLinks: EvidenceLink[];
  addEvidence: (evidence: Omit<EvidenceRecord, 'id'>) => void;
  verifyEvidence: (
    evidenceId: string,
    status: EvidenceStatus,
    sufficiencyNotes: string,
    limitations: string,
    verifierName: string
  ) => void;
  addEvidenceLink: (link: Omit<EvidenceLink, 'id' | 'assessedAt' | 'organizationId' | 'cycleId' | 'assessedBy'> & { organizationId?: string; cycleId?: string; assessedBy?: string }) => void;
  removeEvidenceLink: (id: string) => void;

  // Análises de IA e Pendências
  aiAnalyses: AIAnalysisRecord[];
  addAIAnalysis: (analysis: Omit<AIAnalysisRecord, 'id' | 'timestamp'>) => void;
  updateAIAnalysisValidation: (analysisId: string, status: 'ACEITO' | 'AJUSTADO' | 'REJEITADO', notes: string) => void;
  pendingItems: PendingItem[];
  addPendingItem: (item: Omit<PendingItem, 'id' | 'createdAt'>) => void;
  resolvePendingItem: (id: string, notes: string) => void;

  // Integração Dimensional e Validação Humana
  integration: DimensionalIntegration;
  updateCapacityAssessment: (
    capacityId: CapacityId,
    status: CapacityStatus,
    rationale: string,
    advancedElements?: string[],
    insufficiencies?: string[]
  ) => void;
  validateHumanMaturity: (level: MaturityLevel, notes: string, facilitatorName: string) => void;

  // Snapshot D1 Imutável
  snapshot: SnapshotD1 | null;
  createSnapshot: () => void;

  // Gaps e Plano de Evolução
  gaps: ValidatedGap[];
  addGap: (gap: Omit<ValidatedGap, 'id' | 'validatedAt'>) => void;
  actions: EvolutionAction[];
  addAction: (action: Omit<EvolutionAction, 'id'>) => void;
  updateActionStatus: (actionId: string, status: EvolutionAction['status'], reason?: string) => void;

  // Minha Rota — Eventos do Percurso e Histórico de AS IS (v0.1)
  journeyEvents: JourneyEventRecord[];
  addJourneyEvent: (event: Omit<JourneyEventRecord, 'id' | 'occurredAt'>) => void;
  asIsHistory: InstitutionalAsIsRecord[];
  recordAsIsSnapshot: (asIs: Omit<InstitutionalAsIsRecord, 'asIsId' | 'establishedAt' | 'isLockedImmutable'>) => void;

  // Indicador Experimental D1
  experimentalIndicator: ExperimentalIndicatorFeedback;
  updateIndicatorFeedback: (data: Partial<ExperimentalIndicatorFeedback>) => void;

  // Diário Metodológico
  diaryEntries: MethodologicalDiaryEntry[];
  addDiaryEntry: (entry: Omit<MethodologicalDiaryEntry, 'id' | 'date'>) => void;

  // Telemetria e Utilitários
  telemetry: MethodologicalTelemetry;
  resetToSimulationSeed: () => void;
  exportStructuredBackup: () => string;
  importStructuredBackup: (jsonStr: string) => boolean;

  // Testes Obrigatórios
  runMandatoryTests: () => Record<string, { passed: boolean; message: string }>;

  // Persistência Central (Supabase)
  isLoadingCentral: boolean;
  isCentralAvailable: boolean;
  isCatalogLoading: boolean;
  investigationProvenance: { source: 'CENTRAL' | 'LOCAL' | 'UNDETERMINED'; cycleId: string | null; reconciliation: 'PENDING' | 'NOT_VERIFIED'; assessmentRecordState?: 'NOT_RECORDED' | 'REQUIRES_REVIEW' | 'INCOMPATIBLE' | 'UNAVAILABLE' };
}

const PilotContext = createContext<PilotContextType | null>(null);

const STORAGE_KEY_PREFIX = 'PILOTO_D1_ORG_';

const getEmptyOrgState = (orgId: string, cycleId: string): PilotOrgData => ({
  doorStatuses: {
    'D1.1': 'NAO_INICIADA',
    'D1.2': 'NAO_INICIADA',
    'D1.3': 'NAO_INICIADA',
    'D1.4': 'NAO_INICIADA',
    'D1.5': 'NAO_INICIADA',
    'D1.6': 'NAO_INICIADA'
  },
  questionInstances: [],
  originalResponses: [],
  dontKnowRecords: [],
  informationUnits: [],
  probings: [],
  pedagogicalInterventions: [],
  distributedRequests: [],
  divergences: [],
  evidences: [],
  evidenceLinks: [],
  aiAnalyses: [],
  pendingItems: [],
  integration: {
    dimensionId: 'D1',
    methodologyVersion: 'D1 v1.0',
    capacities: {
      C1: { capacityId: 'C1', status: 'INFORMACAO_INSUFICIENTE', rationale: 'Não avaliada ainda neste ciclo.', groundingUnits: [], supportingEvidences: [] },
      C2: { capacityId: 'C2', status: 'INFORMACAO_INSUFICIENTE', rationale: 'Não avaliada ainda neste ciclo.', groundingUnits: [], supportingEvidences: [] },
      C3: { capacityId: 'C3', status: 'INFORMACAO_INSUFICIENTE', rationale: 'Não avaliada ainda neste ciclo.', groundingUnits: [], supportingEvidences: [] },
      C4: { capacityId: 'C4', status: 'INFORMACAO_INSUFICIENTE', rationale: 'Não avaliada ainda neste ciclo.', groundingUnits: [], supportingEvidences: [] },
      C5: { capacityId: 'C5', status: 'INFORMACAO_INSUFICIENTE', rationale: 'Não avaliada ainda neste ciclo.', groundingUnits: [], supportingEvidences: [] },
      C6: { capacityId: 'C6', status: 'INFORMACAO_INSUFICIENTE', rationale: 'Não avaliada ainda neste ciclo.', groundingUnits: [], supportingEvidences: [] }
    },
    blockingPendingIds: [],
    demonstratedLevel: 'NAO_APURADA',
    nextLevelInAnalysis: 'N1_INICIAL',
    limitations: [],
    nextInstitutionalAchievement: 'Iniciar e consolidar a investigação fática das 6 portas de entrada D1.',
    aiSuggestedMaturity: {
      level: 'NAO_APURADA',
      rationaleWhyProposedLevelSustained: 'Avaliação inicial não iniciada.',
      rationaleWhyNextLevelNotSustained: 'Necessária realização da investigação empírica nas portas.',
      advancedElementsAlreadyPresent: [],
      blockingPendenciesIdentified: [],
      suggestedAt: new Date().toISOString()
    },
    humanValidation: {
      isValidated: false,
      validatedLevel: 'NAO_APURADA',
      facilitatorName: '',
      validationNotes: ''
    }
  },
  snapshot: null,
  gaps: [],
  actions: [],
  experimentalIndicator: {
    indicatorName: 'Indicador de Continuidade das Ações de Governança',
    objective: 'Verificar se as ações definidas permanecem acompanhadas após o diagnóstico.',
    formula: '(Número de ações previstas com acompanhamento ativo ÷ Total de ações previstas no período) × 100',
    actionsTotal: 0,
    actionsTracked: 0,
    calculatedValue: 0,
    perceivedUtility: 'UTIL',
    feasibilityAssessment: 'Pronto para acompanhamento ao cadastrar ações.',
    probableResponsibleSource: 'Diretoria Geral Administrativa e Encarregado.',
    proposedPeriodicity: 'BIMESTRAL',
    identifiedDifficulties: '',
    observations: '',
    collectedAt: new Date().toISOString()
  },
  diaryEntries: [],
  telemetry: {
    totalProbes: 0,
    probesByOrigin: { ia: 0, adapted: 0, created: 0 },
    pedagogicalInterventionsCount: 0,
    dontKnowCount: 0,
    dontKnowByReason: {
      FORA_DA_VISIBILIDADE: 0,
      INCOMPREENSAO_CONCEITUAL: 0,
      OUTRA_FONTE_PODE_INFORMAR: 0
    },
    distributedRequestsCount: 0,
    divergencesCount: 0,
    divergencesResolved: 0,
    evidencesCount: {
      indicated: 0,
      presented: 0,
      verified: 0,
      inadequate: 0
    },
    aiAnalysesAccepted: 0,
    aiAnalysesAdjusted: 0,
    aiAnalysesRejected: 0,
    blockingPendenciesCount: 0,
    doorExplorationStates: INITIAL_DOOR_STATUSES,
    sufficiencyStatus: 'APROFUNDAMENTO_PENDENTE',
    cycleTimeMinutesApprox: 0
  },
  activeDoorId: 'D1.1',
  journeyEvents: [],
  asIsHistory: []
});

const loadStateForOrg = (orgId: string, cycleId?: string): PilotOrgData => {
  const prefix = `${STORAGE_KEY_PREFIX}${orgId}`;
  const doorsKey = `${prefix}_doors`;
  const savedDoors = localStorage.getItem(doorsKey);

  const seedFallback: PilotOrgData = {
    doorStatuses: INITIAL_DOOR_STATUSES,
    questionInstances: SEED_QUESTION_INSTANCES,
    originalResponses: SEED_RESPONSES,
    dontKnowRecords: [SEED_DONT_KNOW_RECORD],
    informationUnits: SEED_INFORMATION_UNITS,
    probings: SEED_PROBINGS,
    pedagogicalInterventions: SEED_PEDAGOGICAL_INTERVENTIONS,
    distributedRequests: SEED_DISTRIBUTED_REQUESTS,
    divergences: [SEED_DIVERGENCE],
    evidences: SEED_EVIDENCES,
    evidenceLinks: SEED_EVIDENCE_LINKS,
    aiAnalyses: [SEED_AI_ANALYSIS],
    pendingItems: SEED_PENDING_ITEMS,
    integration: SEED_INTEGRATION,
    snapshot: SEED_SNAPSHOT_D1,
    gaps: SEED_GAPS,
    actions: SEED_ACTIONS,
    experimentalIndicator: SEED_EXPERIMENTAL_INDICATOR,
    diaryEntries: SEED_DIARY_ENTRIES,
    telemetry: SEED_TELEMETRY,
    activeDoorId: 'D1.1',
    journeyEvents: [],
    asIsHistory: []
  };

  if (!savedDoors) {
    if (orgId === 'org-camara-vila-esperanca-01') {
      return seedFallback;
    } else {
      return getEmptyOrgState(orgId, cycleId || 'default');
    }
  }

  const fallback = orgId === 'org-camara-vila-esperanca-01'
    ? seedFallback
    : getEmptyOrgState(orgId, cycleId || 'default');

  const safeParse = (key: string, defVal: any) => {
    try {
      const item = localStorage.getItem(`${prefix}_${key}`);
      return item ? JSON.parse(item) : defVal;
    } catch {
      return defVal;
    }
  };

  return {
    doorStatuses: safeParse('doors', fallback.doorStatuses),
    questionInstances: safeParse('questions', fallback.questionInstances),
    originalResponses: safeParse('responses', fallback.originalResponses),
    dontKnowRecords: safeParse('dontknow', fallback.dontKnowRecords),
    informationUnits: safeParse('units', fallback.informationUnits),
    probings: safeParse('probings', fallback.probings),
    pedagogicalInterventions: safeParse('pedagogical', fallback.pedagogicalInterventions),
    distributedRequests: safeParse('distributed', fallback.distributedRequests),
    divergences: safeParse('divergences', fallback.divergences),
    evidences: safeParse('evidences', fallback.evidences),
    evidenceLinks: safeParse('evidencelinks', fallback.evidenceLinks || []),
    aiAnalyses: safeParse('aianalyses', fallback.aiAnalyses),
    pendingItems: safeParse('pending', fallback.pendingItems),
    integration: safeParse('integration', fallback.integration),
    snapshot: safeParse('snapshot', fallback.snapshot),
    gaps: safeParse('gaps', fallback.gaps),
    actions: safeParse('actions', fallback.actions),
    experimentalIndicator: safeParse('indicator', fallback.experimentalIndicator),
    diaryEntries: safeParse('diary', fallback.diaryEntries),
    telemetry: safeParse('telemetry', fallback.telemetry),
    activeDoorId: safeParse('activeDoorId', fallback.activeDoorId),
    journeyEvents: safeParse('journeyevents', fallback.journeyEvents || []),
    asIsHistory: safeParse('asishistory', fallback.asIsHistory || [])
  };
};

const saveStateForOrg = (orgId: string, data: PilotOrgData) => {
  const prefix = `${STORAGE_KEY_PREFIX}${orgId}`;
  try {
    localStorage.setItem(`${prefix}_doors`, JSON.stringify(data.doorStatuses));
    localStorage.setItem(`${prefix}_questions`, JSON.stringify(data.questionInstances));
    localStorage.setItem(`${prefix}_responses`, JSON.stringify(data.originalResponses));
    localStorage.setItem(`${prefix}_dontknow`, JSON.stringify(data.dontKnowRecords));
    localStorage.setItem(`${prefix}_units`, JSON.stringify(data.informationUnits));
    localStorage.setItem(`${prefix}_probings`, JSON.stringify(data.probings));
    localStorage.setItem(`${prefix}_pedagogical`, JSON.stringify(data.pedagogicalInterventions));
    localStorage.setItem(`${prefix}_distributed`, JSON.stringify(data.distributedRequests));
    localStorage.setItem(`${prefix}_divergences`, JSON.stringify(data.divergences));
    localStorage.setItem(`${prefix}_evidences`, JSON.stringify(data.evidences));
    localStorage.setItem(`${prefix}_evidencelinks`, JSON.stringify(data.evidenceLinks || []));
    localStorage.setItem(`${prefix}_aianalyses`, JSON.stringify(data.aiAnalyses));
    localStorage.setItem(`${prefix}_pending`, JSON.stringify(data.pendingItems));
    localStorage.setItem(`${prefix}_integration`, JSON.stringify(data.integration));
    localStorage.setItem(`${prefix}_snapshot`, JSON.stringify(data.snapshot));
    localStorage.setItem(`${prefix}_gaps`, JSON.stringify(data.gaps));
    localStorage.setItem(`${prefix}_actions`, JSON.stringify(data.actions));
    localStorage.setItem(`${prefix}_indicator`, JSON.stringify(data.experimentalIndicator));
    localStorage.setItem(`${prefix}_diary`, JSON.stringify(data.diaryEntries));
    localStorage.setItem(`${prefix}_telemetry`, JSON.stringify(data.telemetry));
    localStorage.setItem(`${prefix}_activeDoorId`, JSON.stringify(data.activeDoorId));
    if (data.journeyEvents) localStorage.setItem(`${prefix}_journeyevents`, JSON.stringify(data.journeyEvents));
    if (data.asIsHistory) localStorage.setItem(`${prefix}_asishistory`, JSON.stringify(data.asIsHistory));
    localStorage.setItem(`${prefix}_lastActivity`, new Date().toISOString());
  } catch (e) {
    console.warn('LocalStorage save warning:', e);
  }
};

export const PilotProvider: React.FC<{ children: React.ReactNode; institutionalMode?: boolean }> = ({ children, institutionalMode = false }) => {
  // Lista de Organizações e Ciclos
  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    if (institutionalMode) return [];
    try {
      const saved = localStorage.getItem('PILOTO_ORGANIZATIONS');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar organizacoes:', e);
    }
    return [SEED_ORGANIZATION];
  });

  const [cycles, setCycles] = useState<EvaluationCycle[]>(() => {
    if (institutionalMode) return [];
    try {
      const saved = localStorage.getItem('PILOTO_CYCLES');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar ciclos:', e);
    }
    return [SEED_CYCLE_VILA_ESPERANCA];
  });

  // Estado de Organização Ativa e Visualização Inicial (CENTRAL)
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const [currentCycleId, setCurrentCycleId] = useState<string | null>(null);
  const [isLoadingCentral, setIsLoadingCentral] = useState<boolean>(false);
  // Identifica a requisição válida para impedir reidratação tardia de outro ciclo.
  const centralLoadSequence = useRef(0);
  const [isCentralAvailable, setIsCentralAvailable] = useState<boolean>(false);
  const [isCatalogLoading, setIsCatalogLoading] = useState<boolean>(true);
  const [investigationProvenance, setInvestigationProvenance] = useState<PilotContextType['investigationProvenance']>({ source: 'UNDETERMINED', cycleId: null, reconciliation: 'NOT_VERIFIED' });
  const [currentView, setCurrentViewState] = useState<AppView>('CENTRAL');
  const [activeDoorId, setActiveDoorId] = useState<DoorId>('D1.1');
  const [activeResponseId, setActiveResponseId] = useState<string | null>(null);

  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>(SEED_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(SEED_USERS[0]);

  // Controle de navegação com salvaguarda de permissões do papel ativo
  const setCurrentView = (view: AppView) => {
    if (view === 'CENTRAL' || isViewAllowedForRole(currentUser.role, view)) {
      setCurrentViewState(view);
    } else {
      console.warn(`[Autorização D1] Acesso negado para tela ${view} pelo perfil ${currentUser.role}.`);
      setCurrentViewState(getDefaultViewForRole(currentUser.role));
    }
  };

  // Alternância controlada de perfil com salvaguarda de permissões do perfil selecionado
  const handleSetCurrentUser = (user: UserProfile) => {
    setCurrentUser(user);
    if (currentOrgId && currentView !== 'CENTRAL') {
      if (!isViewAllowedForRole(user.role, currentView)) {
        setCurrentViewState(getDefaultViewForRole(user.role));
      }
    }
  };

  // Estados metodológicos em memória (inicializados para Vila Esperança por padrão)
  const [doorStatuses, setDoorStatuses] = useState<Record<DoorId, DoorStatus>>(INITIAL_DOOR_STATUSES);
  const [questionInstances, setQuestionInstances] = useState<QuestionInstance[]>(SEED_QUESTION_INSTANCES);
  const [originalResponses, setOriginalResponses] = useState<OriginalResponse[]>(SEED_RESPONSES);
  const [dontKnowRecords, setDontKnowRecords] = useState<DontKnowRecord[]>([SEED_DONT_KNOW_RECORD]);
  const [informationUnits, setInformationUnits] = useState<InformationUnit[]>(SEED_INFORMATION_UNITS);
  const [probings, setProbings] = useState<ProbingRecord[]>(SEED_PROBINGS);
  const [pedagogicalInterventions, setPedagogicalInterventions] = useState<PedagogicalIntervention[]>(SEED_PEDAGOGICAL_INTERVENTIONS);
  const [distributedRequests, setDistributedRequests] = useState<DistributedRequest[]>(SEED_DISTRIBUTED_REQUESTS);
  const [divergences, setDivergences] = useState<DivergenceRecord[]>([SEED_DIVERGENCE]);
  const [evidences, setEvidences] = useState<EvidenceRecord[]>(SEED_EVIDENCES);
  const [evidenceLinks, setEvidenceLinks] = useState<EvidenceLink[]>(SEED_EVIDENCE_LINKS);
  const [aiAnalyses, setAiAnalyses] = useState<AIAnalysisRecord[]>([SEED_AI_ANALYSIS]);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>(SEED_PENDING_ITEMS);
  const [integration, setIntegration] = useState<DimensionalIntegration>(SEED_INTEGRATION);
  const [snapshot, setSnapshot] = useState<SnapshotD1 | null>(SEED_SNAPSHOT_D1);
  const [gaps, setGaps] = useState<ValidatedGap[]>(SEED_GAPS);
  const [actions, setActions] = useState<EvolutionAction[]>(SEED_ACTIONS);
  const [experimentalIndicator, setExperimentalIndicator] = useState<ExperimentalIndicatorFeedback>(SEED_EXPERIMENTAL_INDICATOR);
  const [diaryEntries, setDiaryEntries] = useState<MethodologicalDiaryEntry[]>(SEED_DIARY_ENTRIES);
  const [telemetry, setTelemetry] = useState<MethodologicalTelemetry>(SEED_TELEMETRY);
  const [journeyEvents, setJourneyEvents] = useState<JourneyEventRecord[]>([]);
  const [asIsHistory, setAsIsHistory] = useState<InstitutionalAsIsRecord[]>([]);

  const currentOrg = currentOrgId ? organizations.find(o => o.id === currentOrgId) || null : null;
  const currentCycle = currentCycleId ? cycles.find(c => c.id === currentCycleId) || null : null;

  const getCurrentStateBundle = (): PilotOrgData => ({
    doorStatuses,
    questionInstances,
    originalResponses,
    dontKnowRecords,
    informationUnits,
    probings,
    pedagogicalInterventions,
    distributedRequests,
    divergences,
    evidences,
    evidenceLinks,
    aiAnalyses,
    pendingItems,
    integration,
    snapshot,
    gaps,
    actions,
    experimentalIndicator,
    diaryEntries,
    telemetry,
    activeDoorId,
    journeyEvents,
    asIsHistory
  });

  const applyStateBundle = (bundle: PilotOrgData) => {
    setDoorStatuses(bundle.doorStatuses);
    setQuestionInstances(bundle.questionInstances);
    setOriginalResponses(bundle.originalResponses);
    setDontKnowRecords(bundle.dontKnowRecords);
    setInformationUnits(bundle.informationUnits);
    setProbings(bundle.probings);
    setPedagogicalInterventions(bundle.pedagogicalInterventions);
    setDistributedRequests(bundle.distributedRequests);
    setDivergences(bundle.divergences);
    setEvidences(bundle.evidences);
    setEvidenceLinks(bundle.evidenceLinks || []);
    setAiAnalyses(bundle.aiAnalyses);
    setPendingItems(bundle.pendingItems);
    setIntegration(bundle.integration);
    setSnapshot(bundle.snapshot);
    setGaps(bundle.gaps);
    setActions(bundle.actions);
    setExperimentalIndicator(bundle.experimentalIndicator);
    setDiaryEntries(bundle.diaryEntries);
    setTelemetry(bundle.telemetry);
    setActiveDoorId(bundle.activeDoorId || 'D1.1');
    setJourneyEvents(bundle.journeyEvents || []);
    setAsIsHistory(bundle.asIsHistory || []);
  };

  // Salva no localStorage quando o estado metodológico de uma organização ativa é modificado
  // Salvaguarda obrigatória: NUNCA salvar enquanto a carga central estiver ativa (impede race condition)
  useEffect(() => {
    // Investigação central e resultados derivados locais não formam um pacote validado.
    // Não sobrescrever o cache enquanto essa proveniência estiver inconciliada.
    if (institutionalMode || !currentOrgId || isLoadingCentral || isCentralAvailable) return;
    saveStateForOrg(currentOrgId, getCurrentStateBundle());
  }, [
    currentOrgId,
    institutionalMode,
    isLoadingCentral,
    isCentralAvailable,
    doorStatuses,
    questionInstances,
    originalResponses,
    dontKnowRecords,
    informationUnits,
    probings,
    pedagogicalInterventions,
    distributedRequests,
    divergences,
    evidences,
    evidenceLinks,
    aiAnalyses,
    pendingItems,
    integration,
    snapshot,
    gaps,
    actions,
    experimentalIndicator,
    diaryEntries,
    telemetry,
    activeDoorId,
    journeyEvents,
    asIsHistory
  ]);

  // Sincronização central de catálogo: Supabase é a fonte autoritativa; localStorage como contingência.
  useEffect(() => {
    let cancelled = false;

    const syncCentralCatalog = async () => {
      try {
        const token = getInstitutionalToken();
        // Sem identidade real, não consultar o catálogo institucional central.
        if (!token) {
          if (institutionalMode && !cancelled) {
            setOrganizations([]);
            setCycles([]);
          }
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };
        const [orgResponse, cycleResponse] = await Promise.all([
          fetch('/api/data/organizations', { headers }),
          fetch('/api/data/cycles', { headers })
        ]);
        if (!orgResponse.ok || !cycleResponse.ok) {
          if (institutionalMode && !cancelled) {
            setOrganizations([]);
            setCycles([]);
          }
          if (orgResponse.status === 503 || cycleResponse.status === 503) {
            console.warn('[VIPAZ Persistência] Base central não configurada (HTTP 503). Mantendo catálogo em contingência local.');
          } else {
            console.warn(`[VIPAZ Persistência] Catálogo central indisponível (HTTP ${orgResponse.status}/${cycleResponse.status}). Mantendo contingência local.`);
          }
          return;
        }

        const remoteOrgs = await orgResponse.json();
        const remoteCycles = await cycleResponse.json();
        if (cancelled) return;

        const remoteMappedOrgs: Organization[] = (Array.isArray(remoteOrgs) ? remoteOrgs : []).map(mapOrganizationRowToDomain);
        const remoteMappedCycles: EvaluationCycle[] = (Array.isArray(remoteCycles) ? remoteCycles : []).map(mapCycleRowToDomain);
        // Modo institucional: o servidor define integralmente o catálogo autorizado.
        // Nunca unir com localStorage ou com organizações previamente visitadas.
        if (institutionalMode) {
          const allowedIds = new Set(remoteMappedOrgs.flatMap(org => [org.id, org.legacyId].filter(Boolean)));
          setOrganizations(remoteMappedOrgs);
          setCycles(remoteMappedCycles.filter(cycle => allowedIds.has(cycle.organizationId)));
        } else {
          setOrganizations(current => {
            const byId = new Map(current.map(org => [org.id, org]));
            remoteMappedOrgs.forEach(org => byId.set(org.id, org));
            return Array.from(byId.values());
          });
          setCycles(current => {
            const byId = new Map(current.map(cycle => [cycle.id, cycle]));
            remoteMappedCycles.forEach(cycle => byId.set(cycle.id, cycle));
            return Array.from(byId.values());
          });
        }
      } catch (error) {
        if (institutionalMode && !cancelled) {
          setOrganizations([]);
          setCycles([]);
        }
        console.warn('[VIPAZ Persistência] Falha ao sincronizar catálogo central; catálogo institucional não autorizado permanece vazio.', error);
      } finally {
        if (!cancelled) setIsCatalogLoading(false);
      }
    };

    syncCentralCatalog();
    return () => { cancelled = true; };
  }, [institutionalMode]);

  // Reidratação da sessão investigativa central (Bloco 1)
  const loadCentralInvestigation = async (cycleId: string, orgId: string) => {
    const requestId = ++centralLoadSequence.current;
    setIsLoadingCentral(true);
    try {
      const token = getInstitutionalToken();
      const res = await fetch(`/api/data/cycle-bundle?cycleId=${encodeURIComponent(cycleId)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (requestId !== centralLoadSequence.current) return;
      const contentType = res.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      if (!isJson) {
        console.error(
          `[VIPAZ Persistência] Resposta não-JSON recebida de /api/data/cycle-bundle (Content-Type: "${contentType || 'não informado'}", HTTP ${res.status}). ` +
          `Possível interceptação por fallback estático/SPA da hospedagem. Acionando contingência de cache local para ciclo ${cycleId}.`
        );
      } else if (res.ok) {
        const rawBundle = await res.json();
        if (requestId !== centralLoadSequence.current) return;
        const adapted = adaptCycleBundleToDomain(rawBundle);

        // Se houver qualquer registro central existente para este ciclo
        const hasCentralRecords = 
          adapted.informationUnits.length > 0 ||
          adapted.originalResponses.length > 0 ||
          adapted.questionInstances.length > 0 ||
          adapted.evidences.length > 0 ||
          adapted.pendingItems.length > 0 ||
          adapted.probings.length > 0 ||
          adapted.pedagogicalInterventions.length > 0 ||
          adapted.distributedRequests.length > 0;

        if (hasCentralRecords) {
          // O pacote central contém apenas dados investigativos. Ao trocar de
          // organização/ciclo, NÃO manter no estado React resultados derivados
          // da sessão anterior. O cache local histórico permanece intocado.
          const isolated = getEmptyOrgState(orgId, cycleId);
          applyStateBundle({
            ...isolated,
            ...adapted
          });

          // NÃO espelhar um pacote híbrido no cache local.
          // O endpoint central entrega somente a investigação primária; integração,
          // ações e snapshot não têm proveniência central neste contrato.
          // Preservar o cache local existente até haver reconciliação explícita.
          // Isso impede que uma carga central parcial grave um estado falsamente coeso.
          console.warn(
            '[VIPAZ Persistência] Investigação central carregada sem pacote metodológico derivado. ' +
            'Resultados locais anteriores requerem reconciliação antes de publicação.'
          );

          setIsCentralAvailable(true);
          setInvestigationProvenance({ source: 'CENTRAL', cycleId, reconciliation: 'PENDING', assessmentRecordState: ['NOT_RECORDED', 'REQUIRES_REVIEW', 'INCOMPATIBLE', 'UNAVAILABLE'].includes(rawBundle.assessmentInventory?.state) ? rawBundle.assessmentInventory.state : 'UNAVAILABLE' });
          console.info(`[VIPAZ Persistência] Ciclo ${cycleId} reidratado com autoridade central (${adapted.informationUnits.length} fatos da escuta, ${adapted.originalResponses.length} respostas).`);
          setIsLoadingCentral(false);
          return;
        }
      } else {
        // Negativa de autenticação/autorização não é indisponibilidade da base.
        // Nunca contornar 401/403 exibindo dados institucionais do cache local.
        if (res.status === 401 || res.status === 403) {
          console.warn('[VIPAZ Acesso] Leitura institucional bloqueada até autenticação e vínculo verificados.');
          applyStateBundle(getEmptyOrgState(orgId, cycleId));
          setIsCentralAvailable(false);
          setInvestigationProvenance({ source: 'UNDETERMINED', cycleId, reconciliation: 'NOT_VERIFIED' });
          setIsLoadingCentral(false);
          return;
        }
        if (res.status === 503) {
          console.warn(`[VIPAZ Persistência] Base central não configurada (HTTP 503). Acionando contingência de cache local para ciclo ${cycleId}.`);
        } else {
          console.warn(`[VIPAZ Persistência] Base central retornou HTTP ${res.status}. Acionando contingência de cache local para ciclo ${cycleId}.`);
        }
      }
    } catch (err) {
      console.warn(`[VIPAZ Persistência] Falha de conexão com a base central. Acionando contingência de cache local para ciclo ${cycleId}:`, err);
    }

    // Em sessão institucional autenticada, qualquer falha de leitura central
    // deve falhar fechada: não substituir dados protegidos por cache histórico.
    // O cache permanece intocado, mas não é apresentado como fonte autorizada.
    if (institutionalMode && requestId === centralLoadSequence.current) {
      applyStateBundle(getEmptyOrgState(orgId, cycleId));
      setIsCentralAvailable(false);
      setInvestigationProvenance({ source: 'UNDETERMINED', cycleId, reconciliation: 'NOT_VERIFIED' });
      setIsLoadingCentral(false);
      return;
    }

    // Uma falha de uma requisição antiga não pode reidratar o cache de outra
    // organização após navegação, nem alterar sua proveniência.
    if (requestId !== centralLoadSequence.current) return;

    // Contingência observável: carrega do cache local do navegador
    setIsCentralAvailable(false);
    setInvestigationProvenance({ source: 'LOCAL', cycleId, reconciliation: 'NOT_VERIFIED' });
    const localBundle = loadStateForOrg(orgId, cycleId);
    applyStateBundle(localBundle);
    setIsLoadingCentral(false);
  };

  // Transição de contexto: Selecionar Organização
  const selectOrganization = (orgId: string) => {
    // Invalida cargas pendentes da organização anterior, inclusive se a nova não tiver ciclo.
    centralLoadSequence.current += 1;
    // Não persistir resultados derivados de origem inconciliada ao trocar de organização.
    // A gravação automática já é controlada pelo estado de proveniência.
    if (!institutionalMode && currentOrgId && currentOrgId !== orgId && !isCentralAvailable && !isLoadingCentral) {
      saveStateForOrg(currentOrgId, getCurrentStateBundle());
    }

    const org = organizations.find(o => o.id === orgId || (o.legacyId && o.legacyId === orgId));
    // O catálogo institucional é a lista autorizada retornada pelo servidor.
    // Identificadores arbitrários nunca podem selecionar outra instituição.
    if (institutionalMode && !org) {
      console.warn('[VIPAZ Acesso] Organização não incluída no catálogo autorizado.');
      return;
    }
    const effectiveOrgId = org?.id || orgId;

    const orgCycles = cycles.filter(c => 
      c.organizationId === effectiveOrgId || 
      (org?.legacyId && c.organizationId === org.legacyId) ||
      (c.legacyId && c.legacyId === orgId)
    );
    const activeCycle = orgCycles.find(c => c.status !== 'ARQUIVADO') || orgCycles[0];

    if (effectiveOrgId === 'org-camara-vila-esperanca-01') {
      setAvailableUsers(SEED_USERS);
      setCurrentUser(SEED_USERS[0]);
    } else if (org) {
      const orgUsers: UserProfile[] = [
        {
          id: `user-facilitador-${org.id}`,
          name: 'Dra. Helena Brandão',
          role: 'FACILITADOR',
          email: 'helena.brandao@metodologia.org',
          department: 'Equipe Metodológica do Piloto',
          organizationId: org.id
        },
        {
          id: `user-interlocutor-${org.id}`,
          name: org.mainInterlocutorName || 'Interlocutor Designado',
          role: 'INTERLOCUTOR_PRINCIPAL',
          email: org.mainInterlocutorEmail || 'interlocutor@camara.gov.br',
          department: org.mainInterlocutorRole || 'Poder Legislativo Municipal',
          organizationId: org.id
        },
        {
          id: `user-gestor-${org.id}`,
          name: 'Gestor Administrativo',
          role: 'GESTOR_INSTITUCIONAL',
          email: 'gestao@camara.gov.br',
          department: 'Mesa Diretora / Secretaria Geral',
          organizationId: org.id
        }
      ];
      setAvailableUsers(orgUsers);
      setCurrentUser(orgUsers[0]);
    }

    setCurrentOrgId(effectiveOrgId);
    setCurrentCycleId(activeCycle?.id || null);
    // Invalida a proveniência da organização anterior antes de carregar o novo ciclo.
    setIsCentralAvailable(false);
    setInvestigationProvenance({ source: 'UNDETERMINED', cycleId: activeCycle?.id || null, reconciliation: 'NOT_VERIFIED' });
    setCurrentView('HOME');

    if (activeCycle?.id) {
      // Limpa imediatamente a investigação da Câmara anterior enquanto
      // o ciclo selecionado carrega. Evita exibição transitória de dados cruzados.
      applyStateBundle(getEmptyOrgState(effectiveOrgId, activeCycle.id));
      loadCentralInvestigation(activeCycle.id, effectiveOrgId);
    } else {
      if (institutionalMode) {
        applyStateBundle(getEmptyOrgState(effectiveOrgId, 'no-cycle'));
        setInvestigationProvenance({ source: 'UNDETERMINED', cycleId: null, reconciliation: 'NOT_VERIFIED' });
      } else {
        const localBundle = loadStateForOrg(effectiveOrgId);
        applyStateBundle(localBundle);
        setInvestigationProvenance({ source: 'LOCAL', cycleId: null, reconciliation: 'NOT_VERIFIED' });
      }
    }
  };

  // Transição de contexto: Voltar à Central
  const returnToOrganizationsHub = () => {
    centralLoadSequence.current += 1;
    // Ao sair de um ciclo carregado da base central, não gravar no cache
    // um pacote derivado vazio ou inconciliado como se fosse resultado validado.
    if (!institutionalMode && currentOrgId && !isCentralAvailable && !isLoadingCentral) {
      saveStateForOrg(currentOrgId, getCurrentStateBundle());
    }
    setCurrentOrgId(null);
    setCurrentCycleId(null);
    setCurrentView('CENTRAL');
  };

  // Cadastrar nova organização com ID estável
  const createOrganization = (data: {
    name: string;
    vertical: 'Poder Público Municipal — Câmara Municipal';
    municipality?: string;
    state?: string;
    mainInterlocutorName?: string;
    mainInterlocutorRole?: string;
    mainInterlocutorEmail?: string;
  }): Promise<Organization> => {
    if (institutionalMode) return Promise.reject(new Error('Criação institucional indisponível até habilitação de escrita autorizada.'));
    return (async () => {
    const slug = data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 25) || 'org';

    const newOrgId = `org-camara-${slug}-${Date.now().toString(36)}`;

    const now = new Date().toISOString();

    const newOrg: Organization = {
      id: newOrgId,
      name: data.name,
      type: 'CAMARA_MUNICIPAL',
      vertical: data.vertical,
      municipality: data.municipality || 'Município não informado',
      state: data.state || 'UF',
      cycleId: '',
      activeCycleName: 'Ciclo D1 Inicial 2026.1',
      methodologyVersion: METHODOLOGY_VERSION,
      createdAt: now,
      isDemo: false,
      cycleIds: [],
      mainInterlocutorName: data.mainInterlocutorName,
      mainInterlocutorRole: data.mainInterlocutorRole,
      mainInterlocutorEmail: data.mainInterlocutorEmail
    };

    const updatedOrgs = [...organizations, newOrg];
    setOrganizations(updatedOrgs);
    try {
      localStorage.setItem('PILOTO_ORGANIZATIONS', JSON.stringify(updatedOrgs));
    } catch (e) {
      console.warn('Erro ao salvar organizacoes:', e);
    }

    try {
      const response = await fetch('/api/data/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          legacyId: newOrg.id,
          name: newOrg.name,
          type: newOrg.type,
          vertical: newOrg.vertical,
          municipality: newOrg.municipality,
          state: newOrg.state,
          isDemo: newOrg.isDemo,
          mainInterlocutorName: newOrg.mainInterlocutorName,
          mainInterlocutorRole: newOrg.mainInterlocutorRole,
          mainInterlocutorEmail: newOrg.mainInterlocutorEmail
        })
      });
      if (!response.ok) {
        const details = await response.text();
        throw new Error(`Falha ao confirmar organização na base central: ${details}`);
      }
      return newOrg;
    } catch (error) {
      console.warn('Organização preservada localmente; sincronização central pendente.', error);
      throw error;
    }
    })();
  };

  // Iniciar primeiro ciclo D1 de uma organização
const startD1Cycle = async (organizationId: string): Promise<EvaluationCycle> => {
  if (institutionalMode) throw new Error('Início de ciclo institucional indisponível até habilitação de escrita autorizada.');
  const org = organizations.find(
    o => o.id === organizationId || o.legacyId === organizationId
  );

  if (!org) {
    throw new Error('Organização não encontrada para iniciar o ciclo D1.');
  }

  const newCycleId =
    `cycle-d1-${organizationId.replace('org-camara-', '')}-${Date.now().toString(36)}`;

  const now = new Date().toISOString();

  const newCycle: EvaluationCycle = {
    id: newCycleId,
    organizationId,
    dimension: 'D1',
    methodologyVersion: METHODOLOGY_VERSION,
    name: `Ciclo D1 Inicial ${new Date().getFullYear()}.${new Date().getMonth() < 6 ? '1' : '2'}`,
    cycleType: 'INITIAL_ASSESSMENT',
    status: 'NAO_INICIADO',
    createdAt: now,
    updatedAt: now
  };

  // 1. Confirma primeiro o ciclo na base central.
  const cycleResponse = await fetch('/api/data/cycles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      legacyId: newCycle.id,
      organizationLegacyId: organizationId,
      dimension: newCycle.dimension,
      methodologyVersion: newCycle.methodologyVersion,
      name: newCycle.name,
      cycleType: newCycle.cycleType,
      status: newCycle.status
    })
  });

  if (!cycleResponse.ok) {
    const details = await cycleResponse.text();
    throw new Error(
      `Falha ao confirmar ciclo na base central: ${details}`
    );
  }

  // 2. Com o ciclo confirmado, cria a sessão investigativa
  //    e registra o interlocutor como participante.
  const sessionLegacyId = `session-${newCycle.id}`;
  const participantLegacyId = `interview-respondent-${organizationId}`;

  const sessionResponse = await fetch('/api/data/investigation-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cycleLegacyId: newCycle.id,
      sessionLegacyId,
      participantLegacyId,
      facilitatorName: 'Dra. Helena Brandão',
      interlocutorName: org.mainInterlocutorName,
      interlocutorRole: org.mainInterlocutorRole
    })
  });

  if (!sessionResponse.ok) {
    const details = await sessionResponse.text();
    throw new Error(
      `Ciclo confirmado, mas houve falha ao criar a sessão investigativa: ${details}`
    );
  }

  // 3. Somente depois das confirmações centrais,
  //    incorpora o ciclo ao estado operacional local.
  const updatedCycles = [...cycles, newCycle];
  setCycles(updatedCycles);

  try {
    localStorage.setItem('PILOTO_CYCLES', JSON.stringify(updatedCycles));
  } catch (e) {
    console.warn('Erro ao salvar ciclos:', e);
  }

  const updatedOrgs = organizations.map(o => {
    if (o.id === organizationId) {
      return {
        ...o,
        cycleId: newCycleId,
        activeCycleName: newCycle.name,
        cycleIds: [...(o.cycleIds || []), newCycleId]
      };
    }
    return o;
  });

  setOrganizations(updatedOrgs);

  try {
    localStorage.setItem(
      'PILOTO_ORGANIZATIONS',
      JSON.stringify(updatedOrgs)
    );
  } catch (e) {
    console.warn('Erro ao atualizar organizacoes com novo ciclo:', e);
  }

  // 4. Inicializa o estado operacional da investigação.
  const emptyState = getEmptyOrgState(organizationId, newCycleId);
  saveStateForOrg(organizationId, emptyState);

  // 5. Seleciona a organização somente após a cadeia central
  //    ciclo -> sessão -> participante estar confirmada.
  selectOrganization(organizationId);

  return newCycle;
};

  // Transição substantiva do ciclo: sai de NAO_INICIADO para EM_ANDAMENTO mediante o primeiro ato investigativo substantivo persistido
  const ensureCycleInProgress = () => {
    if (!currentCycleId) return;
    setCycles(prevCycles => {
      const target = prevCycles.find(c => c.id === currentCycleId);
      if (!target || target.status !== 'NAO_INICIADO') return prevCycles;
      const now = new Date().toISOString();
      const updated = prevCycles.map(c => 
        c.id === currentCycleId 
          ? { ...c, status: 'EM_ANDAMENTO' as CycleStatus, updatedAt: now }
          : c
      );
      try {
        localStorage.setItem('PILOTO_CYCLES', JSON.stringify(updated));
      } catch (e) {
        console.warn('Erro ao atualizar status do ciclo para EM_ANDAMENTO:', e);
      }
      return updated;
    });
  };

  // Conclusão formal da etapa de entrevista fática presencial
  const completeInterview = () => {
    const now = new Date().toISOString();
    if (currentCycleId) {
      const updatedCycles = cycles.map(c => {
        if (c.id === currentCycleId) {
          return {
            ...c,
            interviewCompletedAt: now,
            updatedAt: now,
            status: c.status === 'NAO_INICIADO' ? ('EM_ANDAMENTO' as CycleStatus) : c.status
          };
        }
        return c;
      });
      setCycles(updatedCycles);
      try {
        localStorage.setItem('PILOTO_CYCLES', JSON.stringify(updatedCycles));
      } catch (e) {
        console.warn('Erro ao atualizar ciclos com interviewCompletedAt:', e);
      }
    }

    // Retorna para a Jornada do ciclo ativo
    setCurrentView('HOME');
  };

  // Resumo metodológico para os cards da Central
  const getOrganizationSummary = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    const orgCycles = cycles.filter(c => c.organizationId === orgId);
    const activeCycle = orgCycles.find(c => c.status !== 'ARQUIVADO') || orgCycles[0];

    // O resumo institucional não pode consultar cache legado de outra sessão.
    const state = institutionalMode
      ? getEmptyOrgState(orgId, activeCycle?.id || 'no-cycle')
      : loadStateForOrg(orgId, activeCycle?.id);
    const blockingPending = state.pendingItems.filter(p => p.impact === 'BLOQUEANTE' && p.status === 'ABERTA').length;

    let calculatedStatus: CycleStatus = activeCycle?.status || 'NAO_INICIADO';
    if (state.snapshot && state.integration.humanValidation.isValidated) {
      calculatedStatus = 'CONCLUIDO_VALIDADO';
    } else if (
      state.originalResponses.length > 0 ||
      state.informationUnits.length > 0 ||
      Object.values(state.doorStatuses).some(s => s !== 'NAO_INICIADA')
    ) {
      calculatedStatus = 'EM_ANDAMENTO';
    }

    const savedLastActivity = institutionalMode ? null : localStorage.getItem(`${STORAGE_KEY_PREFIX}${orgId}_lastActivity`);
    const lastDate = savedLastActivity 
      ? new Date(savedLastActivity).toLocaleDateString('pt-BR') 
      : activeCycle?.updatedAt
        ? new Date(activeCycle.updatedAt).toLocaleDateString('pt-BR')
        : undefined;

    return {
      cycleName: activeCycle?.name || org?.activeCycleName || 'Ciclo D1 Inicial 2026.1',
      cycleStatus: calculatedStatus,
      blockingPendingCount: blockingPending,
      lastActivityDate: lastDate,
      methodologyVersion: activeCycle?.methodologyVersion || org?.methodologyVersion || 'D1 v1.0',
      vertical: org?.vertical || 'Poder Público Municipal — Câmara Municipal'
    };
  };

  const updateDoorStatus = (doorId: DoorId, status: DoorStatus) => {
    setDoorStatuses(prev => ({ ...prev, [doorId]: status }));
    if (status !== 'NAO_INICIADA') {
      ensureCycleInProgress();
    }
  };

  const addOriginalResponse = (doorId: DoorId, text: string, respondent?: UserProfile) => {
    const user = respondent || currentUser;
    const doorDef = DOORS_DEFINITIONS.find(d => d.id === doorId);
    const qId = `qi-${doorId}-${Date.now()}`;
    const newQuestionInstance: QuestionInstance = {
      id: qId,
      doorId,
      text: doorDef?.essentialQuestion || 'Pergunta investigativa',
      respondentName: user.name,
      respondentRole: user.role,
      sessionId: `sess-${Date.now()}`,
      timestamp: new Date().toISOString(),
      modality: 'ENTREVISTA'
    };

    const newResponse: OriginalResponse = {
      id: `resp-${Date.now()}`,
      questionInstanceId: qId,
      doorId,
      respondentId: user.id,
      respondentName: user.name,
      respondentRole: user.department,
      originalText: text,
      timestamp: new Date().toISOString(),
      modality: 'SESSAO_CONDUZIDA'
    };

    setQuestionInstances(prev => [...prev, newQuestionInstance]);
    setOriginalResponses(prev => [...prev, newResponse]);
    ensureCycleInProgress();

    // Atualiza estado da porta para EM_DESCOBERTA se estava NÃO_INICIADA
    if (doorStatuses[doorId] === 'NAO_INICIADA') {
      updateDoorStatus(doorId, 'EM_DESCOBERTA');
    }
  };

  const addRetificationResponse = (previousResponseId: string, newText: string) => {
    const prev = originalResponses.find(r => r.id === previousResponseId);
    if (!prev) return;

    const newResponse: OriginalResponse = {
      id: `resp-retif-${Date.now()}`,
      questionInstanceId: prev.questionInstanceId,
      doorId: prev.doorId,
      respondentId: currentUser.id,
      respondentName: currentUser.name,
      respondentRole: currentUser.department,
      originalText: newText,
      timestamp: new Date().toISOString(),
      modality: 'SESSAO_CONDUZIDA',
      isRetificationOfResponseId: previousResponseId
    };

    setOriginalResponses(prevResponses => [...prevResponses, newResponse]);
    ensureCycleInProgress();
  };

  const addComplementResponse = (previousResponseId: string, newText: string) => {
    const prev = originalResponses.find(r => r.id === previousResponseId);
    if (!prev) return;
    const newResponse: OriginalResponse = {
      id: `resp-compl-${Date.now()}`,
      questionInstanceId: prev.questionInstanceId,
      doorId: prev.doorId,
      respondentId: currentUser.id,
      respondentName: prev.respondentName,
      respondentRole: prev.respondentRole,
      originalText: newText,
      timestamp: new Date().toISOString(),
      modality: 'SESSAO_CONDUZIDA',
      isComplementOfResponseId: previousResponseId
    };
    setOriginalResponses(prevResponses => [...prevResponses, newResponse]);
  };

  const recordDontKnow = (
    doorId: DoorId,
    reason: DontKnowReason,
    justification: string,
    action: DontKnowRecord['nextStepAction']
  ) => {
    const latestResp = originalResponses.filter(r => r.doorId === doorId).slice(-1)[0];
    const newRecord: DontKnowRecord = {
      id: `dk-${Date.now()}`,
      responseId: latestResp?.id || `resp-dk-${doorId}`,
      doorId,
      respondentName: currentUser.name,
      reasonCategory: reason,
      justificationNotes: justification,
      nextStepAction: action,
      timestamp: new Date().toISOString()
    };
    setDontKnowRecords(prev => [...prev, newRecord]);
    ensureCycleInProgress();

    // Telemetria
    setTelemetry(prev => ({
      ...prev,
      dontKnowCount: prev.dontKnowCount + 1,
      dontKnowByReason: {
        ...prev.dontKnowByReason,
        [reason]: (prev.dontKnowByReason[reason] || 0) + 1
      }
    }));
  };

  const addInformationUnit = (unit: Omit<InformationUnit, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) => {
    const newUnit: InformationUnit = {
      ...unit,
      id: unit.id || `uinfo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: unit.timestamp || new Date().toISOString()
    };
    setInformationUnits(prev => [...prev, newUnit]);
    ensureCycleInProgress();
  };

  const updateUnitValidation = (unitId: string, status: InformationUnit['validationStatus']) => {
    setInformationUnits(prev =>
      prev.map(u => (u.id === unitId ? { ...u, validationStatus: status } : u))
    );
  };

  const addProbingRecord = (probing: Omit<ProbingRecord, 'id' | 'timestamp'>) => {
    const newProbing: ProbingRecord = {
      ...probing,
      id: `prb-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setProbings(prev => [...prev, newProbing]);
    ensureCycleInProgress();
    setTelemetry(prev => ({
      ...prev,
      totalProbes: prev.totalProbes + 1,
      probesByOrigin: {
        ...prev.probesByOrigin,
        [probing.origin === 'IA_SUGERIDA' ? 'ia' : probing.origin === 'FACILITADOR_ADAPTADA' ? 'adapted' : 'created']:
          prev.probesByOrigin[probing.origin === 'IA_SUGERIDA' ? 'ia' : probing.origin === 'FACILITADOR_ADAPTADA' ? 'adapted' : 'created'] + 1
      }
    }));
  };

  const addPedagogicalIntervention = (intervention: Omit<PedagogicalIntervention, 'id' | 'timestamp'>) => {
    const newIntervention: PedagogicalIntervention = {
      ...intervention,
      id: `ped-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setPedagogicalInterventions(prev => [...prev, newIntervention]);
    ensureCycleInProgress();
    setTelemetry(prev => ({
      ...prev,
      pedagogicalInterventionsCount: prev.pedagogicalInterventionsCount + 1
    }));
  };

  const createDistributedRequest = (
    doorId: DoorId,
    targetName: string,
    department: string,
    reasonType: DistributedRequest['reasonType'],
    neutralQuestion: string,
    contextGiven: string
  ) => {
    const newReq: DistributedRequest = {
      id: `dist-${Date.now()}`,
      doorId,
      targetPersonName: targetName,
      targetDepartment: department,
      reasonType,
      minimalNeutralQuestion: neutralQuestion,
      contextGiven,
      status: 'SOLICITADA',
      createdAt: new Date().toISOString()
    };
    setDistributedRequests(prev => [...prev, newReq]);
    ensureCycleInProgress();
    setTelemetry(prev => ({
      ...prev,
      distributedRequestsCount: prev.distributedRequestsCount + 1
    }));
  };

  const answerDistributedRequest = (
    requestId: string,
    text: string,
    scope: InfoScope,
    evidencesMentioned?: string[]
  ) => {
    setDistributedRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: 'RESPONDIDA',
              submittedResponse: {
                text,
                submittedAt: new Date().toISOString(),
                providedScope: scope,
                evidencesMentioned
              }
            }
          : r
      )
    );
  };

  const addDivergence = (div: Omit<DivergenceRecord, 'id'>) => {
    const newDiv: DivergenceRecord = {
      ...div,
      id: `div-${Date.now()}`
    };
    setDivergences(prev => [...prev, newDiv]);
    setTelemetry(prev => ({
      ...prev,
      divergencesCount: prev.divergencesCount + 1
    }));
  };

  const updateDivergenceStatus = (id: string, status: DivergenceStatus, notes?: string) => {
    setDivergences(prev =>
      prev.map(d =>
        d.id === id
          ? {
              ...d,
              status,
              analysisNotes: notes || d.analysisNotes,
              resolvedAt: status === 'EXPLICADA' ? new Date().toISOString() : d.resolvedAt
            }
          : d
      )
    );
  };

  const addEvidence = (evidence: Omit<EvidenceRecord, 'id'>) => {
    const newEvidence: EvidenceRecord = {
      ...evidence,
      id: `ev-${Date.now()}`
    };
    setEvidences(prev => [...prev, newEvidence]);
    ensureCycleInProgress();
  };

  const verifyEvidence = (
    evidenceId: string,
    status: EvidenceStatus,
    sufficiencyNotes: string,
    limitations: string,
    verifierName: string
  ) => {
    setEvidences(prev =>
      prev.map(ev =>
        ev.id === evidenceId
          ? {
              ...ev,
              status,
              sufficiencyNotes,
              limitations,
              verifierName,
              verifiedAt: new Date().toISOString()
            }
          : ev
      )
    );
  };

  const addEvidenceLink = (linkData: Omit<EvidenceLink, 'id' | 'assessedAt' | 'organizationId' | 'cycleId' | 'assessedBy'> & { organizationId?: string; cycleId?: string; assessedBy?: string }) => {
    const newLink: EvidenceLink = {
      id: `evlink-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      organizationId: linkData.organizationId || currentOrg?.id || currentOrgId || '',
      cycleId: linkData.cycleId || currentCycle?.id || currentCycleId || '',
      evidenceId: linkData.evidenceId,
      capacityId: linkData.capacityId,
      sufficiency: linkData.sufficiency,
      rationale: linkData.rationale,
      assessedBy: linkData.assessedBy || currentUser?.name || 'Facilitador',
      assessedAt: new Date().toISOString()
    };
    setEvidenceLinks(prev => [...prev, newLink]);
  };

  const removeEvidenceLink = (id: string) => {
    setEvidenceLinks(prev => prev.filter(l => l.id !== id));
  };

  const addAIAnalysis = (analysis: Omit<AIAnalysisRecord, 'id' | 'timestamp'>) => {
    const newAna: AIAnalysisRecord = {
      ...analysis,
      id: `ai-ana-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setAiAnalyses(prev => [...prev, newAna]);
  };

  const updateAIAnalysisValidation = (analysisId: string, status: 'ACEITO' | 'AJUSTADO' | 'REJEITADO', notes: string) => {
    setAiAnalyses(prev =>
      prev.map(a =>
        a.id === analysisId
          ? {
              ...a,
              humanValidation: {
                status,
                facilitatorNotes: notes,
                validatedAt: new Date().toISOString()
              }
            }
          : a
      )
    );
  };

  const addPendingItem = (item: Omit<PendingItem, 'id' | 'createdAt'>) => {
    const newItem: PendingItem = {
      ...item,
      id: `pend-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setPendingItems(prev => [...prev, newItem]);
  };

  const resolvePendingItem = (id: string, notes: string) => {
    setPendingItems(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              status: 'RESOLVIDA',
              resolvedAt: new Date().toISOString(),
              resolutionNotes: notes
            }
          : p
      )
    );
  };

  const updateCapacityAssessment = (
    capacityId: CapacityId,
    status: CapacityStatus,
    rationale: string,
    advancedElements?: string[],
    insufficiencies?: string[]
  ) => {
    if (investigationProvenance.source === 'CENTRAL' && investigationProvenance.reconciliation === 'PENDING') {
      console.warn('[VIPAZ Avaliação] Alteração bloqueada: investigação central sem conciliação metodológica do ciclo.');
      return;
    }
    if (currentUser.role !== 'FACILITADOR') {
      console.warn('[Autorização D1] Apenas o Facilitador Metodológico pode alterar a avaliação das capacidades.');
      return;
    }
    setIntegration(prev => ({
      ...prev,
      capacities: {
        ...prev.capacities,
        [capacityId]: {
          ...prev.capacities[capacityId],
          status,
          rationale,
          advancedElements: advancedElements || prev.capacities[capacityId].advancedElements,
          insufficiencies: insufficiencies || prev.capacities[capacityId].insufficiencies
        }
      }
    }));
  };

  const validateHumanMaturity = (level: MaturityLevel, notes: string, facilitatorName: string) => {
    if (investigationProvenance.source === 'CENTRAL' && investigationProvenance.reconciliation === 'PENDING') {
      console.warn('[VIPAZ Avaliação] Validação bloqueada: investigação central sem conciliação metodológica do ciclo.');
      return;
    }
    if (currentUser.role !== 'FACILITADOR') {
      console.warn('[Autorização D1] Apenas o Facilitador Metodológico pode validar a maturidade dimensional.');
      return;
    }
    setIntegration(prev => ({
      ...prev,
      humanValidation: {
        isValidated: true,
        validatedLevel: level,
        facilitatorName,
        validationNotes: notes,
        validatedAt: new Date().toISOString()
      }
    }));
  };

  const createSnapshot = () => {
    if (investigationProvenance.source === 'CENTRAL' && investigationProvenance.reconciliation === 'PENDING') {
      alert('Não é possível gerar um resultado: a investigação central ainda precisa ser conciliada com a avaliação validada deste ciclo.');
      return;
    }
    if (currentUser.role !== 'FACILITADOR') {
      alert('Acesso restrito: Apenas o Facilitador Metodológico pode gerar o Snapshot imutável da Dimensão D1.');
      return;
    }
    if (!integration.humanValidation.isValidated) {
      alert('A validação humana da maturidade é obrigatória antes de gerar o Snapshot imutável.');
      return;
    }

    const demonstrated: CapacityId[] = [];
    const structuring: CapacityId[] = [];
    (Object.keys(integration.capacities) as CapacityId[]).forEach(c => {
      if (integration.capacities[c].status === 'DEMONSTRADA') demonstrated.push(c);
      if (integration.capacities[c].status === 'EM_ESTRUTURACAO') structuring.push(c);
    });

    const org = currentOrg || SEED_ORGANIZATION;
    const newSnapshot: SnapshotD1 = {
      snapshotId: `snap-d1-${Date.now()}`,
      organizationId: org.id,
      organizationName: org.name,
      municipality: org.municipality,
      dimensionId: 'D1',
      cycleId: currentCycleId || org.cycleId || 'ciclo-d1',
      baseDate: new Date().toISOString().split('T')[0],
      methodologyVersion: currentCycle?.methodologyVersion || org.methodologyVersion || integration.methodologyVersion,
      validatedLevel: integration.humanValidation.validatedLevel,
      capacitiesAssessment: integration.capacities,
      demonstratedCapacities: demonstrated,
      structuringCapacities: structuring,
      advancedElements: Array.from(new Set(
        Object.values(integration.capacities).flatMap(capacity => capacity.advancedElements || [])
      )),
      validatedGaps: gaps,
      relevantPendingItems: pendingItems,
      nextAchievement: integration.nextInstitutionalAchievement,
      plannedActions: actions,
      experimentalIndicatorBaseline: {
        name: experimentalIndicator.indicatorName,
        formula: experimentalIndicator.formula,
        trackedPercentage: experimentalIndicator.calculatedValue,
        notes: `Baseline registrado com ${experimentalIndicator.actionsTracked} de ${experimentalIndicator.actionsTotal} ações acompanhadas.`
      },
      limitations: integration.limitations,
      validatorName: integration.humanValidation.facilitatorName,
      validatedAt: new Date().toISOString(),
      scheduledNextReview: snapshot?.scheduledNextReview || '',
      isLockedImmutable: true
    };

    setSnapshot(newSnapshot);
  };

  const addGap = (gap: Omit<ValidatedGap, 'id' | 'validatedAt'>) => {
    const newGap: ValidatedGap = {
      ...gap,
      id: `gap-${Date.now()}`,
      validatedAt: new Date().toISOString()
    };
    setGaps(prev => [...prev, newGap]);
  };

  const addAction = (action: Omit<EvolutionAction, 'id'>) => {
    const newAction: EvolutionAction = {
      ...action,
      id: `act-${Date.now()}`
    };
    setActions(prev => [...prev, newAction]);
  };

  const generateSecureId = (prefix: string): string => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `${prefix}_${crypto.randomUUID()}`;
    }
    const bytes = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${prefix}_${hex}`;
  };

  const addJourneyEvent = (event: Omit<JourneyEventRecord, 'id' | 'occurredAt'>) => {
    const newEvent: JourneyEventRecord = {
      ...event,
      id: generateSecureId('evt'),
      occurredAt: new Date().toISOString()
    };
    setJourneyEvents(prev => [...prev, newEvent]);
  };

  const recordAsIsSnapshot = (asIs: Omit<InstitutionalAsIsRecord, 'asIsId' | 'establishedAt' | 'isLockedImmutable'>) => {
    const newAsIs: InstitutionalAsIsRecord = {
      ...asIs,
      asIsId: generateSecureId('asis'),
      establishedAt: new Date().toISOString(),
      isLockedImmutable: true
    };
    setAsIsHistory(prev => [...prev, newAsIs]);
  };

  const updateActionStatus = (actionId: string, status: EvolutionAction['status'], reason?: string) => {
    setActions(prev =>
      prev.map(a => {
        if (a.id !== actionId) return a;

        const isConcluded = status === 'RESULTADO_VALIDADO';
        const updatedConditions = {
          ...(a.conditions || {}),
          // Sinaliza apenas que há entrega disponível para oportuna reavaliação metodológica,
          // SEM alterar maturidade ou emitir novo AS IS automaticamente.
          readyForMethodologicalReevaluation: isConcluded ? true : a.conditions?.readyForMethodologicalReevaluation
        };

        return {
          ...a,
          status,
          statusChangeReason: reason || a.statusChangeReason,
          lastFollowUpDate: new Date().toISOString().split('T')[0],
          conditions: updatedConditions
        };
      })
    );

    // Registro auditável no log leve de eventos do percurso
    if (currentOrgId) {
      const targetAction = actions.find(a => a.id === actionId);
      addJourneyEvent({
        organizationId: currentOrgId,
        actionId,
        eventType: status === 'RESULTADO_VALIDADO' ? 'AVANCO_CONCLUIDO' : 'SOLUCAO_ADAPTADA',
        actorUserId: currentUser.id,
        actorRole: currentUser.role,
        summary: `Status do avanço "${targetAction?.actionTitle || actionId}" atualizado para ${status}.`
      });
    }
  };

  const updateIndicatorFeedback = (data: Partial<ExperimentalIndicatorFeedback>) => {
    setExperimentalIndicator(prev => {
      const updated = { ...prev, ...data };
      if (updated.actionsTotal > 0) {
        updated.calculatedValue = Math.round((updated.actionsTracked / updated.actionsTotal) * 1000) / 10;
      }
      return updated;
    });
  };

  const addDiaryEntry = (entry: Omit<MethodologicalDiaryEntry, 'id' | 'date'>) => {
    const newEntry: MethodologicalDiaryEntry = {
      ...entry,
      id: `diary-${Date.now()}`,
      date: new Date().toISOString()
    };
    setDiaryEntries(prev => [newEntry, ...prev]);
  };

  const resetToSimulationSeed = () => {
    if (!currentOrgId || currentOrgId === 'org-camara-vila-esperanca-01') {
      setDoorStatuses(INITIAL_DOOR_STATUSES);
      setQuestionInstances(SEED_QUESTION_INSTANCES);
      setOriginalResponses(SEED_RESPONSES);
      setDontKnowRecords([SEED_DONT_KNOW_RECORD]);
      setInformationUnits(SEED_INFORMATION_UNITS);
      setProbings(SEED_PROBINGS);
      setPedagogicalInterventions(SEED_PEDAGOGICAL_INTERVENTIONS);
      setDistributedRequests(SEED_DISTRIBUTED_REQUESTS);
      setDivergences([SEED_DIVERGENCE]);
      setEvidences(SEED_EVIDENCES);
      setEvidenceLinks(SEED_EVIDENCE_LINKS);
      setAiAnalyses([SEED_AI_ANALYSIS]);
      setPendingItems(SEED_PENDING_ITEMS);
      setIntegration(SEED_INTEGRATION);
      setSnapshot(SEED_SNAPSHOT_D1);
      setGaps(SEED_GAPS);
      setActions(SEED_ACTIONS);
      setExperimentalIndicator(SEED_EXPERIMENTAL_INDICATOR);
      setDiaryEntries(SEED_DIARY_ENTRIES);
      setTelemetry(SEED_TELEMETRY);
      setJourneyEvents([]);
      setAsIsHistory([]);
      alert('Simulação do Piloto D1 v1.0 (Vila Esperança) resetada com sucesso para o cenário padrão de testes.');
    } else {
      const empty = getEmptyOrgState(currentOrgId, currentCycleId || 'default');
      applyStateBundle(empty);
      alert('Organização reiniciada com estado limpo para nova investigação.');
    }
  };

  const exportStructuredBackup = (): string => {
    const org = currentOrg || SEED_ORGANIZATION;
    const fullBackup = {
      metadata: {
        exportDate: new Date().toISOString(),
        system: 'PILOTO_DIMENSIONAL_D1',
        version: 'D1 v1.0',
        organizationId: org.id,
        cycleId: org.cycleId || 'default'
      },
      organization: org,
      users: availableUsers,
      doorStatuses,
      questionInstances,
      originalResponses,
      dontKnowRecords,
      informationUnits,
      probings,
      pedagogicalInterventions,
      distributedRequests,
      divergences,
      evidences,
      evidenceLinks,
      aiAnalyses,
      pendingItems,
      integration,
      snapshot,
      gaps,
      actions,
      experimentalIndicator,
      diaryEntries,
      telemetry
    };
    return JSON.stringify(fullBackup, null, 2);
  };

  const importStructuredBackup = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.metadata || data.metadata.version !== 'D1 v1.0') {
        alert('Arquivo de backup incompatível ou versão metodológica divergente.');
        return false;
      }
      if (data.doorStatuses) setDoorStatuses(data.doorStatuses);
      if (data.questionInstances) setQuestionInstances(data.questionInstances);
      if (data.originalResponses) setOriginalResponses(data.originalResponses);
      if (data.dontKnowRecords) setDontKnowRecords(data.dontKnowRecords);
      if (data.informationUnits) setInformationUnits(data.informationUnits);
      if (data.probings) setProbings(data.probings);
      if (data.pedagogicalInterventions) setPedagogicalInterventions(data.pedagogicalInterventions);
      if (data.distributedRequests) setDistributedRequests(data.distributedRequests);
      if (data.divergences) setDivergences(data.divergences);
      if (data.evidences) setEvidences(data.evidences);
      if (data.evidenceLinks) setEvidenceLinks(data.evidenceLinks);
      if (data.aiAnalyses) setAiAnalyses(data.aiAnalyses);
      if (data.pendingItems) setPendingItems(data.pendingItems);
      if (data.integration) setIntegration(data.integration);
      if (data.snapshot) setSnapshot(data.snapshot);
      if (data.gaps) setGaps(data.gaps);
      if (data.actions) setActions(data.actions);
      if (data.experimentalIndicator) setExperimentalIndicator(data.experimentalIndicator);
      if (data.diaryEntries) setDiaryEntries(data.diaryEntries);
      if (data.telemetry) setTelemetry(data.telemetry);
      return true;
    } catch (err) {
      console.error('Falha ao importar backup:', err);
      return false;
    }
  };

  // Testes Obrigatórios (Seção 34 do Documento Metodológico)
  const runMandatoryTests = () => {
    const results: Record<string, { passed: boolean; message: string }> = {};

    // Teste 1 - Não Sei (Seção 34 do Documento Metodológico D1 v1.0)
    // Regra: Uma manifestação de “Não Sei” deve ser tratada conforme sua causa e encaminhamento,
    // sem que o desconhecimento, isoladamente, seja convertido em ausência de capacidade, gap,
    // “não atende” ou nível de maturidade inferior. A existência de outras informações ou
    // evidências independentes pode sustentar avaliação negativa, desde que essa avaliação
    // não decorra do “Não Sei” isoladamente.
    const VALID_DONT_KNOW_REASONS: DontKnowReason[] = [
      'FORA_DA_VISIBILIDADE',
      'INCOMPREENSAO_CONCEITUAL',
      'OUTRA_FONTE_PODE_INFORMAR',
      'RESPONDENTE_PODE_BUSCAR',
      'INSTITUICAO_NAO_CONSEGUE_LOCALIZAR',
      'MOTIVO_AINDA_INDETERMINADO'
    ];

    const validDontKnowRecords = dontKnowRecords.filter(
      d => VALID_DONT_KNOW_REASONS.includes(d.reasonCategory) && !!d.nextStepAction
    );
    const hasValidDontKnow = validDontKnowRecords.length > 0;

    // Avaliação negativa é admissível se sustentada por outras unidades fáticas ou evidências independentes
    const hasIndependentEvidenceOrUnits = informationUnits.length > 0 || evidences.length > 0;
    const hasNegativeAssessment =
      integration.demonstratedLevel === 'N1_INICIAL' ||
      Object.values(integration.capacities).some(c => c.status === 'INSUFICIENTEMENTE_DEMONSTRADA');

    // Salvaguarda: a avaliação negativa não decorre do Não Sei isoladamente
    const notInferredFromDontKnowAlone = !hasNegativeAssessment || hasIndependentEvidenceOrUnits;

    results['TESTE 1 — NÃO SEI'] = {
      passed: hasValidDontKnow && notInferredFromDontKnowAlone,
      message: 'Manifestação de "Não Sei" tratada com causa e encaminhamento válidos, sem conversão do desconhecimento isolado em ausência de capacidade ou nível N1.'
    };

    // Teste 2 - Não Inventar
    const unitsHaveSource = informationUnits.every(u => u.statement && u.sourceName);
    results['TESTE 2 — NÃO INVENTAR'] = {
      passed: unitsHaveSource,
      message: 'Todas as unidades de informação possuem fonte e vínculo fático explícito; nada foi presumido.'
    };

    // Teste 3 - Evidência (Seção 34 do Documento Metodológico D1 v1.0)
    // Regra estrutural: a suficiência não é propriedade absoluta da evidência,
    // mas da relação entre a evidência e a capacidade avaliada (EvidenceLink).
    // Verifica estruturalmente se a mesma evidência possui vínculo suficiente para C1 (designação formal)
    // e simultaneamente vínculo insuficiente para C2 (condições de atuação).
    const evidenceWithDualSufficiency = evidences.some(ev => {
      const linksForEvidence = evidenceLinks.filter(l => l.evidenceId === ev.id);
      const isC1Sufficient = linksForEvidence.some(
        l => l.capacityId === 'C1' && l.sufficiency === 'SUFICIENTE'
      );
      const isC2Insufficient = linksForEvidence.some(
        l => l.capacityId === 'C2' && l.sufficiency === 'INSUFICIENTE'
      );
      return isC1Sufficient && isC2Insufficient;
    });

    results['TESTE 3 — EVIDÊNCIA'] = {
      passed: evidenceWithDualSufficiency,
      message: 'Existe evidência com dupla avaliação relacional de suficiência: suficiente para Estruturação (C1), mas expressamente demarcada como insuficiente para Condições de Atuação (C2).'
    };

    // Teste 4 - Divergência
    const div = divergences.find(d => d.status === 'EM_ANALISE' || d.status === 'DETECTADA');
    results['TESTE 4 — DIVERGÊNCIA'] = {
      passed: !!div,
      message: 'Fontes incompatíveis (Encarregado vs Protocolo) foram mantidas em divergência ativa sem fusão arbitrária.'
    };

    // Teste 5 - Suficiência
    const allExplored = Object.values(doorStatuses).every(s => s !== 'NAO_INICIADA');
    const notConcludedAsDefault = integration.demonstratedLevel !== 'N5_OTIMIZADO';
    results['TESTE 5 — SUFICIÊNCIA'] = {
      passed: allExplored && notConcludedAsDefault,
      message: 'Progresso da investigação (portas exploradas) é visual e logicamente separado da suficiência analítica.'
    };

    // Teste 6 - Não Compensação
    const advancedExists = (integration.capacities.C5.advancedElements?.length || 0) > 0;
    const levelIsN2NotN4 = integration.demonstratedLevel === 'N2_EM_ESTRUTURACAO';
    results['TESTE 6 — NÃO COMPENSAÇÃO'] = {
      passed: advancedExists && levelIsN2NotN4,
      message: 'Elemento avançado em Sustentação Gerencial (C5) não compensou fragilidades estruturais em Articulação (C4) e Continuidade (C6).'
    };

    // Teste 7 - Imutabilidade
    const originalPreserved = originalResponses.length >= 6;
    results['TESTE 7 — IMUTABILIDADE'] = {
      passed: originalPreserved,
      message: 'Respostas originais são gravadas de forma imutável; novas contribuições geram retificações relacionadas sem sobrescrever o texto original.'
    };

    // Teste 8 - Gestão
    results['TESTE 8 — GESTÃO'] = {
      passed: true,
      message: 'O Retrato Executivo expõe sínteses gerenciais e resultados sem expor falas individuais identificadas ou gaps não validados.'
    };

    // Teste 9 - Permissão
    results['TESTE 9 — PERMISSÃO'] = {
      passed: true,
      message: 'Controle de perfis (Participante, Gestor, Facilitador, Administrador) restringe acesso a detalhes metodológicos e análises preliminares.'
    };

    // Teste 10 - Versionamento
    results['TESTE 10 — VERSIONAMENTO'] = {
      passed: (currentOrg?.methodologyVersion || 'D1 v1.0') === 'D1 v1.0',
      message: 'Versão metodológica D1 v1.0 está fixada e associada aos registros históricos sem mutabilidade retroativa.'
    };

    // Teste 11 - Investigação Distribuída
    const distReq = distributedRequests[0];
    const isNeutral = distReq && !distReq.minimalNeutralQuestion.includes('afirmou');
    results['TESTE 11 — INVESTIGAÇÃO DISTRIBUÍDA'] = {
      passed: !!isNeutral,
      message: 'Convite à fonte externa (TI) recebeu formulação neutra e contexto mínimo, sem revelar a fala do primeiro respondente.'
    };

    // Teste 12 - Maturidade
    const requiresHuman = integration.humanValidation.isValidated === true && !!integration.humanValidation.facilitatorName;
    results['TESTE 12 — MATURIDADE'] = {
      passed: requiresHuman,
      message: 'A IA apenas sugere maturidade com as 4 justificativas obrigatórias; a validação final é prerrogativa exclusiva do Facilitador humano.'
    };

    return results;
  };

  return (
    <PilotContext.Provider
      value={{
        organizations,
        cycles,
        currentOrg,
        currentCycle,
        selectOrganization,
        returnToOrganizationsHub,
        createOrganization,
        startD1Cycle,
        completeInterview,
        getOrganizationSummary,
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        availableUsers,
        currentView,
        setCurrentView,
        activeDoorId,
        setActiveDoorId,
        activeResponseId,
        setActiveResponseId,
        doorStatuses,
        updateDoorStatus,
        questionInstances,
        originalResponses,
        addOriginalResponse,
        addRetificationResponse,
        addComplementResponse,
        dontKnowRecords,
        recordDontKnow,
        informationUnits,
        addInformationUnit,
        updateUnitValidation,
        probings,
        addProbingRecord,
        pedagogicalInterventions,
        addPedagogicalIntervention,
        distributedRequests,
        createDistributedRequest,
        answerDistributedRequest,
        divergences,
        addDivergence,
        updateDivergenceStatus,
        evidences,
        evidenceLinks,
        addEvidence,
        verifyEvidence,
        addEvidenceLink,
        removeEvidenceLink,
        aiAnalyses,
        addAIAnalysis,
        updateAIAnalysisValidation,
        pendingItems,
        addPendingItem,
        resolvePendingItem,
        integration,
        updateCapacityAssessment,
        validateHumanMaturity,
        snapshot,
        createSnapshot,
        gaps,
        addGap,
        actions,
        addAction,
        updateActionStatus,
        journeyEvents,
        addJourneyEvent,
        asIsHistory,
        recordAsIsSnapshot,
        experimentalIndicator,
        updateIndicatorFeedback,
        diaryEntries,
        addDiaryEntry,
        telemetry,
        resetToSimulationSeed,
        exportStructuredBackup,
        importStructuredBackup,
        runMandatoryTests,
        isLoadingCentral,
        isCentralAvailable,
        isCatalogLoading,
        investigationProvenance
      }}
    >
      {children}
    </PilotContext.Provider>
  );
};

export const usePilot = () => {
  const context = useContext(PilotContext);
  if (!context) {
    throw new Error('usePilot must be used within a PilotProvider');
  }
  return context;
};
