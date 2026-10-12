// Tipos centrais do Piloto Dimensional D1 v1.0 - Governança e Responsabilidades

export type UserRole = 
  | 'PARTICIPANTE'
  | 'INTERLOCUTOR_PRINCIPAL'
  | 'GESTOR_INSTITUCIONAL'
  | 'FACILITADOR'
  | 'ADMINISTRADOR';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  department: string;
  organizationId: string;
}

export type CycleType = 'INITIAL_ASSESSMENT' | 'PERIODIC_REVIEW' | 'SPECIAL_ASSESSMENT';
export type CycleStatus = 'NAO_INICIADO' | 'EM_ANDAMENTO' | 'CONCLUIDO_VALIDADO' | 'ARQUIVADO';

export interface EvaluationCycle {
  id: string; // cycle_id (UUID Canônico)
  legacyId?: string;
  investigationSessionId?: string; // UUID returned by the atomic opening RPC
  organizationId: string;
  name: string; // ex: "Ciclo D1 Inicial 2026.1"
  dimension: 'D1';
  methodologyVersion: string;
  cycleType: CycleType;
  status: CycleStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  interviewCompletedAt?: string;
  isDemo?: boolean;
}

export interface Organization {
  id: string; // UUID Canônico ou ID estável
  legacyId?: string;
  name: string;
  municipality: string;
  state: string;
  type: 'CAMARA_MUNICIPAL';
  vertical: 'Poder Público Municipal — Câmara Municipal';
  mainInterlocutorName?: string;
  mainInterlocutorRole?: string;
  mainInterlocutorEmail?: string;
  cycleId: string;
  activeCycleName: string;
  methodologyVersion: string;
  createdAt: string;
  isDemo?: boolean;
  cycleIds?: string[];
}

export type DoorId = 'D1.1' | 'D1.2' | 'D1.3' | 'D1.4' | 'D1.5' | 'D1.6';

export type DoorStatus = 
  | 'NAO_INICIADA'
  | 'EM_DESCOBERTA'
  | 'SUFICIENTEMENTE_EXPLORADA'
  | 'SUFICIENTEMENTE_EXPLORADA_COMPROVACAO_PENDENTE'
  | 'REQUER_OUTRA_FONTE'
  | 'REQUER_APROFUNDAMENTO'
  | 'NAO_APROFUNDADA_POR_PROPORCIONALIDADE';

export interface DoorDefinition {
  id: DoorId;
  code: string;
  title: string;
  essentialQuestion: string;
  adaptedQuestion?: string;
  objective: string;
  focusAreas: string[];
  internalLenses?: string[];
  contextualHelp?: {
    scopeExplanation: string;
    practicalSituations: string[];
  };
}

export type MaturityLevel = 
  | 'N1_INICIAL'
  | 'N2_EM_ESTRUTURACAO'
  | 'N3_IMPLEMENTADO'
  | 'N4_GERENCIADO'
  | 'N5_OTIMIZADO'
  | 'NAO_APURADA';

export type CapacityId = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6';

export type CapacityStatus = 
  | 'DEMONSTRADA'
  | 'EM_ESTRUTURACAO'
  | 'INSUFICIENTEMENTE_DEMONSTRADA'
  | 'INFORMACAO_INSUFICIENTE'
  | 'ELEMENTO_AVANCADO';

export interface CapacityDefinition {
  id: CapacityId;
  name: string;
  description: string;
}

// Respostas Originais Imutáveis
export interface QuestionInstance {
  id: string;
  doorId: DoorId;
  text: string;
  respondentName: string;
  respondentRole: string;
  sessionId: string;
  timestamp: string;
  modality: 'ENTREVISTA' | 'FORMULARIO_DIRIGIDO' | 'COMPLEMENTACAO';
  contextNote?: string;
}

export interface OriginalResponse {
  id: string;
  questionInstanceId: string;
  doorId: DoorId;
  respondentId: string;
  respondentName: string;
  respondentRole: string;
  originalText: string;
  timestamp: string;
  modality: 'ORAL_GRAVADA' | 'TEXTO_DIRETO' | 'SESSAO_CONDUZIDA';
  isRetificationOfResponseId?: string; // se for retificação de resposta anterior
  isComplementOfResponseId?: string; // se apenas amplia uma resposta anterior, sem corrigi-la
}

// Tratamento do "Não sei"
export type DontKnowReason = 
  | 'INCOMPREENSAO_CONCEITUAL'
  | 'FORA_DA_VISIBILIDADE'
  | 'OUTRA_FONTE_PODE_INFORMAR'
  | 'RESPONDENTE_PODE_BUSCAR'
  | 'INSTITUICAO_NAO_CONSEGUE_LOCALIZAR'
  | 'MOTIVO_AINDA_INDETERMINADO';

export interface DontKnowRecord {
  id: string;
  responseId: string;
  doorId: DoorId;
  respondentName: string;
  reasonCategory: DontKnowReason;
  justificationNotes: string;
  nextStepAction: 'EXPLICACAO_PEDAGOGICA' | 'BUSCA_INTERNA' | 'CONVITE_OUTRA_FONTE' | 'REGISTRO_PENDENCIA';
  timestamp: string;
}

// Alcances e Unidades de Informação
export type InfoScope = 
  | 'ACAO_PROPRIA'
  | 'CONHECIMENTO_DIRETO'
  | 'PERCEPCAO_SOBRE_TERCEIRO'
  | 'FORA_DA_VISIBILIDADE_DESCONHECIDO';

export interface InformationUnit {
  id: string;
  responseId: string;
  doorId: DoorId;
  statement: string;
  sourceName: string;
  sourceRole: string;
  scope: InfoScope;
  extractedBy: 'IA_SUGESTAO' | 'FACILITADOR';
  validationStatus: 'VALIDADO' | 'EM_ANALISE' | 'AJUSTADO' | 'REJEITADO';
  relatedCapacity?: CapacityId;
  mentionedActors?: string[];
  mentionedEvidenceTitles?: string[];
  timestamp: string;
  // Proveniência expandida (ST-D1-005)
  organizationId?: string;
  cycleId?: string;
  aiSuggestedText?: string;
  humanEdited?: boolean;
  registeredBy?: string;
}

// Sondagens Adaptativas
export interface ProbingRecord {
  id: string;
  doorId: DoorId;
  origin: 'IA_SUGERIDA' | 'FACILITADOR_ADAPTADA' | 'FACILITADOR_CRIADA';
  reason: string;
  suggestedQuestionText?: string;
  questionEffectivelyAsked: string;
  responseText?: string;
  relatedCriterionOrCapacity?: string;
  timestamp: string;
}

// Intervenção Pedagógica
export interface PedagogicalIntervention {
  id: string;
  doorId: DoorId;
  concept: string;
  reason: string;
  contentPresented: string;
  concreteExample: string;
  followUpQuestion: string;
  previousResponseText?: string;
  subsequentResponseText?: string;
  timestamp: string;
}

// Investigação Distribuída / Solicitação dirigida
export interface DistributedRequest {
  id: string;
  doorId: DoorId;
  targetPersonName: string;
  targetDepartment: string;
  reasonType: 'VALIDACAO' | 'COMPLEMENTACAO' | 'DIVERGENCIA';
  minimalNeutralQuestion: string;
  contextGiven: string; // Neutro, nunca contendo a fala original do primeiro respondente
  status: 'SOLICITADA' | 'RESPONDIDA' | 'CANCELADA';
  submittedResponse?: {
    text: string;
    submittedAt: string;
    providedScope: InfoScope;
    evidencesMentioned?: string[];
  };
  createdAt: string;
}

// Divergências
export type DivergenceStatus = 
  | 'DETECTADA'
  | 'EM_ANALISE'
  | 'EXPLICADA'
  | 'MANTIDA_COMO_DIVERGENCIA'
  | 'REQUER_OUTRA_FONTE';

export interface DivergenceRecord {
  id: string;
  doorId: DoorId;
  title: string;
  description: string;
  sourceA: { name: string; statement: string; scope: InfoScope; responseId: string };
  sourceB: { name: string; statement: string; scope: InfoScope; responseId: string };
  status: DivergenceStatus;
  analysisNotes?: string;
  resolvedAt?: string;
}

// Evidências
export type EvidenceStatus = 
  | 'INDICADA'
  | 'APRESENTADA'
  | 'VERIFICADA'
  | 'NAO_VERIFICAVEL_OU_INADEQUADA';

export interface EvidenceRecord {
  id: string;
  title: string;
  type: 'PORTARIA' | 'CONTRATO' | 'FLUXOGRAMA' | 'RELATORIO' | 'EMAIL' | 'SISTEMA_TICKET' | 'ATA_REUNIAO' | 'OUTRO';
  origin: string;
  indicatedBy: string;
  date: string;
  status: EvidenceStatus;
  verifierName?: string;
  verifiedAt?: string;
  sufficiencyNotes: string; // Ex: Suficiente para demonstrar designação, insuficiente para demonstrar condições de atuação
  limitations: string;
  relatedCapacities: CapacityId[];
  sensitivity: 'PUBLICA' | 'INTERNA_RESTRITA' | 'CONFIDENCIAL';
  aiUsageRule: 'AUTORIZADO_RESUMO' | 'RESTRITO_HUMANO';
  fileAttachmentName?: string;
}

// Vínculos de Suficiência Relacional de Evidência (EvidenceLink)
export type EvidenceSufficiency = 
  | 'SUFICIENTE'
  | 'PARCIALMENTE_SUFICIENTE'
  | 'INSUFICIENTE';

export interface EvidenceLink {
  id: string;
  organizationId: string;
  cycleId: string;
  evidenceId: string;
  capacityId: CapacityId;
  sufficiency: EvidenceSufficiency;
  rationale: string;
  assessedBy: string;
  assessedAt: string;
}

// Análise de Apoio da IA
export type AIAnalysisCategory = 
  | 'CONSTATADO'
  | 'INFORMADO_AINDA_NAO_COMPROVADO'
  | 'REQUER_OUTRA_FONTE'
  | 'NAO_APURADO'
  | 'RECOMENDACAO';

export interface AIAnalysisRecord {
  id: string;
  doorId: DoorId;
  category: AIAnalysisCategory;
  summary: string;
  signalsOfCapacity: string[];
  potentialGaps: string[];
  suggestedProbes: string[];
  dataScopeUsed: 'TEXTO_DA_PORTA_MINIMIZADO';
  timestamp: string;
  humanValidation: {
    status: 'PENDENTE' | 'ACEITO' | 'AJUSTADO' | 'REJEITADO';
    facilitatorNotes?: string;
    validatedAt?: string;
  };
}

// Pendências
export type PendingType = 
  | 'INFORMACAO'
  | 'FONTE'
  | 'EVIDENCIA'
  | 'DECISAO'
  | 'ACAO'
  | 'VALIDACAO';

export type PendingImpact = 
  | 'BLOQUEANTE'
  | 'RELEVANTE_NAO_BLOQUEANTE'
  | 'COMPLEMENTAR';

export type PendingStatus = 
  | 'ABERTA'
  | 'EM_TRATAMENTO'
  | 'RESOLVIDA'
  | 'CANCELADA';

export interface PendingItem {
  id: string;
  doorId: DoorId;
  title: string;
  description: string;
  type: PendingType;
  impact: PendingImpact;
  status: PendingStatus;
  responsible: string;
  createdAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

// Integração Dimensional C1-C6
export interface CapacityAssessment {
  capacityId: CapacityId;
  status: CapacityStatus;
  rationale: string;
  groundingUnits: string[]; // IDs de InformationUnit
  supportingEvidences: string[]; // IDs de EvidenceRecord
  advancedElements?: string[];
  insufficiencies?: string[];
}

export interface DimensionalIntegration {
  dimensionId: 'D1';
  methodologyVersion: 'D1 v1.0';
  capacities: Record<CapacityId, CapacityAssessment>;
  blockingPendingIds: string[];
  demonstratedLevel: MaturityLevel;
  nextLevelInAnalysis: MaturityLevel;
  limitations: string[];
  nextInstitutionalAchievement: string;
  aiSuggestedMaturity: {
    level: MaturityLevel;
    rationaleWhyProposedLevelSustained: string;
    rationaleWhyNextLevelNotSustained: string;
    advancedElementsAlreadyPresent: string[];
    blockingPendenciesIdentified: string[];
    suggestedAt: string;
  };
  humanValidation: {
    isValidated: boolean;
    validatedLevel: MaturityLevel;
    facilitatorName: string;
    validationNotes: string;
    validatedAt?: string;
  };
}

// Snapshot D1 Imutável
export interface SnapshotD1 {
  snapshotId: string;
  organizationId: string;
  organizationName: string;
  municipality: string;
  dimensionId: 'D1';
  cycleId: string;
  baseDate: string;
  methodologyVersion: string;
  validatedLevel: MaturityLevel;
  capacitiesAssessment: Record<CapacityId, CapacityAssessment>;
  demonstratedCapacities: CapacityId[];
  structuringCapacities: CapacityId[];
  advancedElements: string[];
  validatedGaps: ValidatedGap[];
  relevantPendingItems: PendingItem[];
  nextAchievement: string;
  plannedActions: EvolutionAction[];
  experimentalIndicatorBaseline?: {
    name: string;
    formula: string;
    trackedPercentage: number;
    notes: string;
  };
  limitations: string[];
  validatorName: string;
  validatedAt: string;
  scheduledNextReview?: string;
  isLockedImmutable: true;
}

// Gaps
export type GapMarker = 
  | 'ESTRUTURANTE'
  | 'OBRIGATORIO'
  | 'CAPACIDADE'
  | 'MATURIDADE'
  | 'OPORTUNIDADE_DE_MELHORIA';

export interface ValidatedGap {
  id: string;
  doorId: DoorId;
  capacityId: CapacityId;
  title: string;
  description: string;
  markers: GapMarker[];
  rootCauseType: 'CONHECIMENTO_COMPETENCIA' | 'FLUXO_INSTITUCIONAL' | 'RECURSO_FERRAMENTA' | 'DEFINICAO_PAPEL' | 'DECISAO_GERENCIAL';
  requiresTraining: boolean; // Só true se for conhecimento/competência!
  trainingJustification?: string;
  isValidatedByHuman: boolean;
  validatedAt: string;
}

// Plano de Evolução e Ações
export type ActionStatus = 
  | 'NAO_INICIADA'
  | 'EM_ANDAMENTO'
  | 'EVIDENCIA_APRESENTADA'
  | 'EVIDENCIA_VERIFICADA'
  | 'RESULTADO_EM_VALIDACAO'
  | 'RESULTADO_VALIDADO'
  | 'PRONTA_PARA_REAVALIACAO'
  | 'SUSPENSA'
  | 'CANCELADA'
  | 'REFORMULADA';

// ============================================================================
// MINHA ROTA — TIPOS CANÔNICOS (v0.1)
// ============================================================================

/** Espaços funcionais da superfície de Minha Rota (Seção 2) */
export type RouteSpace = 
  | 'JA_CONSTRUIDO' 
  | 'AGORA' 
  | 'QUANDO_PRECISAR' 
  | 'NO_HORIZONTE';

/** Status de triagem do avanço antes da decisão formal */
export type RouteTriageStatus = 
  | 'PENDENTE_DE_TRIAGEM' 
  | 'TRIADO_AUTOMATICO' 
  | 'CONFIRMADO_HUMANO';

/** Registro auditável de decisão de rota (Seção 4 e Bloco 2.1) */
export interface RouteDecisionRecord {
  decisionId: string; // UUID imutável
  organizationId: string; // Vínculo institucional onde a decisão ocorreu
  /**
   * Rota sugerida como recomendação para apreciação humana.
   * - No regime ASSISTIDO: preenchido com a recomendação da metodologia/IA.
   * - No regime DETERMINÍSTICO: ausente/null (a regra produz a conclusão diretamente sem sugestão prévia).
   * - No regime HUMANO: ausente/null.
   */
  suggestedRoute?: RouteSpace | 'ESCLARECER' | null;
  confirmedRoute: RouteSpace;
  decidedByUserId?: string; // Opcional em decisões de regime DETERMINÍSTICO originadas por regra
  decidedByRole?: UserRole; // Opcional em decisões de regime DETERMINÍSTICO
  decidedByMembershipId?: string; // Vínculo institucional formal futuro
  decidedAt: string; // ISO 8601
  overrideReason?: string; // Legado preservado para compatibilidade retroativa
  divergenceReason?: string; // Campo canônico de semântica de decisão divergente (Bloco 2.4)
  
  // Auditoria da autoridade normativa e fundamentação
  regime?: 'DETERMINISTICO' | 'ASSISTIDO' | 'HUMANO';
  ruleCode?: string;              // Identificador da regra formal (ex.: "REG_D1_01")
  routingRuleVersion?: string;     // Versão da regra vigente (ex.: "RULES_D1_v0.3")
  rationale?: string;             // Fundamentação objetiva da decisão
}

/** Subcontrato de Decisão de Rota e Triagem */
export interface EvolutionRouteInfo {
  currentSpace?: RouteSpace | null; // Opcional/nulo enquanto em PENDENTE_DE_TRIAGEM
  triageStatus: RouteTriageStatus;
  decisionHistory: RouteDecisionRecord[]; // Coleção acumulativa sem sobrescrita
}

/** Subcontrato de Governança Temporal e Prazos (Seção 3) */
export interface EvolutionPacing {
  legalOrRegulatoryDeadline?: string;   // Prazo externo improrrogável (ANPD, LAI, Lei Orgânica)
  institutionalAgreedDeadline?: string; // Prazo pactuado pela gestão da Câmara
  vipazSuggestedDeadline?: string;      // Horizonte sugerido pela metodologia VIPAZ
  effectiveDeadline?: string;           // Prazo de referência operacional ativo (opcional)
  
  // Condução e Governança da Jornada
  leadActorName: string;                // Nome do condutor responsável
  leadActorRole: 'ENCARREGADO' | 'GESTOR_INSTITUCIONAL' | 'RESPONSAVEL_DESIGNADO';
  leadActorUserId?: string;             // Identidade do condutor
  contributingActors: string[];         // Servidores, comissões ou setores participantes
}

/** Menor intervenção suficiente (Seção 3) */
export type SuggestedInterventionLevel = 
  | 'MANTER' 
  | 'APROVEITAR' 
  | 'ADAPTAR' 
  | 'INTEGRAR' 
  | 'CONSTRUIR';

/** Subcontrato de Aprendizagem Contextual e Caminho (Seção 3 e 3.2) */
export interface EvolutionPedagogy {
  whereYouAre: string;                  // Síntese curta do AS IS local
  whereWeAreGoing: string;              // Próximo estado alcançável
  whyItMatters: string;                 // Microaprendizagem contextual
  interventionLevel: SuggestedInterventionLevel;
  suggestedSolution: string;            // Menor intervenção recomendada pela VIPAZ
  effectivelyAdoptedSolution?: string;  // Solução real quando a Câmara adota caminho próprio
  vipazSupportTools: string[];          // Modelos, portarias-tipo, checklists vinculados
}

/** Condições de contorno que não viram novos status visíveis (Seção 5.1) */
export interface AvancoConditions {
  isAwaitingDependency?: boolean;
  dependencyDescription?: string;
  isDeadlineOverdue?: boolean;
  isPreexistingStructureDiscovered?: boolean;
  hasOperationalEvidenceAttached?: boolean;
  readyForMethodologicalReevaluation?: boolean;
}

/** Estados visíveis simplificados na experiência do usuário (Seção 5) */
export type VisibleAvancoStatus = 'A_INICIAR' | 'EM_ANDAMENTO' | 'CONCLUIDO';

/**
 * Entidade Canônica de Evolução da VIPAZ
 * Representa o Próximo Avanço (evolução semântica de EvolutionAction).
 * Preserva compatibilidade integral com dados, snapshots e relatórios legados.
 */
export interface EvolutionAction {
  id: string;
  gapId: string;
  expectedResult: string; // Separado de Ação!
  actionTitle: string;
  actionDetails: string;
  actors: string[];
  deadlineOrPhase: string;
  nextImmediateStep: string;
  supportInstrument: string;
  expectedEvidence: string;
  /**
   * @deprecated Preservado para retrocompatibilidade nesta fase. 
   * Marcado para revisão semântica futura; não expressa efetividade institucional final (entrega != efetividade).
   */
  successCriterion: string;
  /**
   * @deprecated Preservado para retrocompatibilidade nesta fase. Candidato à descontinuação futura.
   */
  relatedIndicatorName: string;
  status: ActionStatus;
  statusChangeReason?: string;
  lastFollowUpDate: string;
  followUpOwner: string;

  // Subcontratos modulares de Minha Rota (v0.1)
  route?: EvolutionRouteInfo;
  pacing?: EvolutionPacing;
  pedagogy?: EvolutionPedagogy;
  conditions?: AvancoConditions;
}

// ============================================================================
// LOG LEVE DE EVENTOS DO PERCURSO (Seção 6.1)
// ============================================================================

export type JourneyEventType = 
  | 'ROTA_ATRIBUIDA'
  | 'AVANCO_INICIADO'
  | 'PRAZO_REPACTUADO'
  | 'SOLUCAO_ADAPTADA'
  | 'EVIDENCIA_VINCULADA'
  | 'AVANCO_CONCLUIDO'
  | 'MARCO_REAVALIACAO_SOLICITADO';

export interface JourneyEventRecord {
  id: string; // UUID imutável
  organizationId: string; // Contexto institucional da ocorrência
  actionId: string;
  eventType: JourneyEventType;
  occurredAt: string; // ISO 8601
  actorUserId: string; // Pessoa que praticou o ato
  actorRole: UserRole; // Papel contextual na organização
  actorMembershipId?: string; // Vínculo institucional futuro
  summary: string;
  metadata?: {
    previousSpace?: RouteSpace | null;
    newSpace?: RouteSpace | null;
    previousDeadline?: string;
    newDeadline?: string;
    evidenceId?: string;
    note?: string;
    [key: string]: unknown;
  };
}

// ============================================================================
// AS IS HISTÓRICO CONTÍNUO — MARCOS DELIBERADOS (Seção 6.1)
// ============================================================================

export type AsIsTriggerOrigin = 
  | 'DIAGNOSTICO_INICIAL_VALIDADO'  // Marco zero (AS IS 0)
  | 'REAVALIACAO_DE_CAPACIDADE'     // Reconhecimento formal de capacidade evoluída
  | 'REVISAO_FORMAL_DE_CICLO'       // Fechamento ou repactuação periódica
  | 'HOMOLOGACAO_EXTERNA'           // Reconhecimento de iniciativa externa à VIPAZ
  | 'OUTRO_MARCO_METODOLOGICO';

export interface InstitutionalAsIsRecord {
  asIsId: string; // UUID imutável
  organizationId: string; // Câmara detentora do AS IS
  cycleId: string;
  sequenceNumber: number; // 0, 1, 2, 3... sequencial estrito
  versionLabel: string; // "AS IS 0", "AS IS 1", etc.
  triggerOrigin: AsIsTriggerOrigin;
  establishedAt: string; // ISO 8601
  validatedByUserId: string; // Identidade autenticada do validador
  validatedByRole: UserRole; // Papel contextual do validador
  validatedByMembershipId?: string; // Vínculo institucional futuro
  methodologyVersion: string; // Ex: "D1 v1.0"
  demonstratedCapacities: CapacityId[];
  structuringCapacities: CapacityId[];
  synthesisSummary: string; // Síntese qualitativa formal do estado institucional
  evidentialBasisIds: string[]; // Referências probatórias que sustentam o marco
  isLockedImmutable: true; // Imutabilidade garantida por contrato
}

// Indicador Experimental D1
export interface ExperimentalIndicatorFeedback {
  indicatorName: string;
  objective: string;
  formula: string;
  actionsTotal: number;
  actionsTracked: number; // com responsável, situação, prazo e próximo passo
  calculatedValue: number; // %
  perceivedUtility: 'MUITO_UTIL' | 'UTIL' | 'POUCO_UTIL' | 'INVIAVEL';
  feasibilityAssessment: string;
  probableResponsibleSource: string;
  proposedPeriodicity: 'QUINZENAL' | 'MENSAL' | 'BIMESTRAL' | 'TRIMESTRAL' | 'POR_CICLO';
  identifiedDifficulties: string;
  observations: string;
  collectedAt: string;
}

// Diário de Desenvolvimento Metodológico
export type MethodologicalObservationOrigin = 
  | 'CONCEITUAL'
  | 'SIMULACAO'
  | 'CAMPO'
  | 'FEEDBACK'
  | 'FALHA_TECNICA'
  | 'ALTERACAO_REGULATORIA';

export type MethodologicalTheme = 
  | 'PEDAGOGIA'
  | 'FONTE_ADEQUADA'
  | 'SUFICIENCIA'
  | 'MATURIDADE'
  | 'INVESTIGACAO_DISTRIBUIDA'
  | 'CONTINUIDADE'
  | 'IA'
  | 'EVIDENCIA'
  | 'INDICADOR'
  | 'USABILIDADE'
  | 'OUTRO';

export interface MethodologicalDiaryEntry {
  id: string;
  organizationId: string;
  dimensionId: 'D1';
  doorId: DoorId;
  sessionId: string;
  methodologyVersion: 'D1 v1.0';
  date: string;
  origin: MethodologicalObservationOrigin;
  theme: MethodologicalTheme;
  hypothesis: string;
  observedProblem: string;
  decisionTaken: string;
  justification: string;
  fieldEvidence: string;
  proposedChange: string;
  howToTest: string;
  result: string;
  methodologicalImplication: string;
  productImplication: string;
  researchImplication: string;
  authorName: string;
}

// Telemetria Metodológica
export interface MethodologicalTelemetry {
  totalProbes: number;
  probesByOrigin: { ia: number; adapted: number; created: number };
  pedagogicalInterventionsCount: number;
  dontKnowCount: number;
  dontKnowByReason: Record<string, number>;
  distributedRequestsCount: number;
  divergencesCount: number;
  divergencesResolved: number;
  evidencesCount: { indicated: number; presented: number; verified: number; inadequate: number };
  aiAnalysesAccepted: number;
  aiAnalysesAdjusted: number;
  aiAnalysesRejected: number;
  blockingPendenciesCount: number;
  doorExplorationStates: Record<DoorId, DoorStatus>;
  sufficiencyStatus: 'SUFICIENTE_PARA_NIVEL' | 'APROFUNDAMENTO_PENDENTE';
  cycleTimeMinutesApprox: number;
}

// ============================================================================
// REEXPORTAÇÃO DOS CONTRATOS CANÔNICOS DE ROTEAMENTO (Bloco 2.1)
// ============================================================================
export * from './types/routing';
