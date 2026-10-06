/**
 * VIPAZ — Minha Rota
 * Bloco 2.1 — Modelagem Canônica de Domínio (v0.4.1)
 *
 * Contratos canônicos de roteamento, candidatos, regimes decisórios,
 * relações com rastreabilidade de origem e contestabilidade.
 */

import { RouteSpace, UserRole } from '../types';

// ============================================================================
// REGIMES DECISÓRIOS E CONTESTABILIDADE
// ============================================================================

export type DecisionRegime = 'DETERMINISTICO' | 'ASSISTIDO' | 'HUMANO';

export type ContestType = 'FATO' | 'INTERPRETAÇÃO' | 'REGRA';

export type EventNature = 
  | 'OPERACIONAL' 
  | 'REVISAO_PROGRAMADA' 
  | 'MUDANCA_EXTERNA_OU_METODOLOGICA';

// ============================================================================
// NATUREZA E ALVO DO CANDIDATO (DESACOPLAMENTO ESTRITO)
// ============================================================================

/** Origem formal da demanda/necessidade (sem misturar com validação ou tipo de capacidade) */
export type RoutingCandidateSourceType = 
  | 'DIAGNOSTICO_GAP'             // Gap oriundo da investigação dimensional
  | 'NECESSIDADE_DECLARADA'       // Demanda manifestada expressamente pela instituição
  | 'ADEQUACAO_REGULATORIA'       // Exigência normativa externa identificada
  | 'OPORTUNIDADE_DE_EVOLUCAO';   // Oportunidade incremental não decorrente de não conformidade

export type CandidateTargetKind = 'CAPACIDADE' | 'PRATICA' | 'INSTRUMENTO' | 'PROCESSO';

export interface NextExpectedStateRef {
  targetKind: CandidateTargetKind;
  targetRefId?: string;           // Ex.: capacityId quando houver catálogo de capacidades vinculado
  description: string;            // Declaração compreensível do estado futuro pretendido
}

// ============================================================================
// RELAÇÕES E CONDICIONANTES COM RASTREABILIDADE DE ORIGEM
// ============================================================================

export type RelationOrigin = 
  | 'METODOLOGIA_CATALOGO'        // Precedência formal descrita na metodologia VIPAZ
  | 'DECLARADO_INSTITUICAO'       // Informado pelos interlocutores da Câmara
  | 'DETERMINADO_FACILITADOR'     // Registrado motivadamente pelo facilitador
  | 'ANALISE_ASSISTIDA_VALIDADA'; // Sugerido por IA e explicitamente ratificado

export interface CandidateRelation {
  targetCandidateId: string;
  relationType: 'DEPENDE_DE' | 'PRECEDE' | 'COEXISTE_COM';
  origin: RelationOrigin;
  rationale?: string;
}

export interface ConfirmedRegulatoryDeadline {
  deadlineDate: string;           // ISO 8601
  legalBasis: string;             // Ex.: "Lei Orgânica Art. 45", "Resolução ANPD nº 12"
  isMandatoryExternal: true;      // Confirmação de que o prazo não é discricionário
  verifiedAt: string;
  verifiedBy: string;             // Identificador da fonte ou validador
}

// ============================================================================
// ESTRATÉGIA DE INTERVENÇÃO (MENOR INTERVENÇÃO SUFICIENTE)
// ============================================================================

export type BasicInterventionModality = 
  | 'MANTER' 
  | 'APROVEITAR' 
  | 'ADAPTAR' 
  | 'INTEGRAR' 
  | 'CONSTRUIR';

export interface InterventionStrategyComposition {
  primaryModality: BasicInterventionModality;
  secondaryModalities?: BasicInterventionModality[]; // Não presume exclusividade única
  justification: string;
}

// ============================================================================
// TRIAGEM E AVALIAÇÃO DE SUFICIÊNCIA PROBATÓRIA (Bloco 2.2)
// ============================================================================

export type TriageOutcomeStatus = 
  | 'APTO_PARA_ROTEAMENTO' 
  | 'NECESSITA_ESCLARECIMENTO';

export interface TriageEvaluation {
  candidateId: string;
  status: TriageOutcomeStatus;
  hasSufficientInformation: boolean;
  missingInformationReason?: string;

  /**
   * Composição da menor intervenção suficiente identificada.
   * OPCIONAL: ausente (undefined) enquanto status === 'NECESSITA_ESCLARECIMENTO'
   * ou enquanto não houver informação probatória suficiente para determiná-la legitimamente.
   */
  identifiedInterventionComposition?: InterventionStrategyComposition;

  /**
   * Regime decisório recomendado para a decisão de rota posterior.
   * Governa COMO/POR QUEM será decidido (DETERMINISTICO, ASSISTIDO ou HUMANO),
   * e não se confunde com a estratégia de intervenção nem com o espaço de rota.
   */
  recommendedDecisionRegime: DecisionRegime;

  triageEvaluatedAt: string;
  triageNotes?: string;
}

// ============================================================================
// ESTADO E FUNDAMENTAÇÃO DO ROTEAMENTO
// ============================================================================

export interface StructuredRoutingReason {
  ruleCode?: string;              // Ex.: "REG_D1_01" (se aplicável)
  factualBasis: string;           // Fatos apurados que sustentam a rota
  evidentialBasis: string[];      // IDs de evidências que respaldam os fatos
  selectedInterventionStrategy?: InterventionStrategyComposition;
  contextualJustification: string;// Explicação textual compreensível para o usuário
  /** Referência ao PendingItem canônico de evidência pré-existente no ciclo, se comprovação estiver pendente */
  pendingEvidenceItemRefId?: string;
}


export interface CandidateRoutingState {
  routingRuleVersion: string;          // Ex.: "RULES_D1_v0.3"
  methodologyVersion: string;          // Ex.: "D1 v1.0"
  applicableRegime: DecisionRegime;    // DETERMINISTICO | ASSISTIDO | HUMANO
  
  /**
   * Espaço sugerido como recomendação para apreciação humana.
   * - No regime ASSISTIDO: preenchido com a recomendação algorítmica/IA.
   * - No regime DETERMINÍSTICO: AUSENTE / undefined / null, pois a regra produz a conclusão
   *   diretamente e não há sugestão pendente de confirmação humana.
   * - No regime HUMANO: AUSENTE / undefined / null (deliberação direta).
   */
  suggestedSpace?: RouteSpace | null;

  /**
   * Espaço formalmente consolidado.
   * - No regime DETERMINÍSTICO: preenchido diretamente pela regra com a conclusão normativa.
   * - Nos regimes ASSISTIDO e HUMANO: preenchido após a manifestação/decisão formal.
   * - Em estado de ESCLARECIMENTO: ausente (undefined).
   */
  effectiveSpace?: RouteSpace;

  routingReason: StructuredRoutingReason;
  lastDecisionRecordId?: string;
}

export interface ClarificationRequestRef {
  requestId: string;
  missingInformation: string;
  requestedAt: string;
  requestedBy: string;
  isResolved: boolean;
  resolutionNote?: string;
}

// ============================================================================
// ENTIDADE CANÔNICA DO PROCESSO DE ROTEAMENTO
// ============================================================================

export interface RoutingCandidate {
  candidateId: string;
  sourceType: RoutingCandidateSourceType;
  sourceRefId: string;            // ID do gap de origem, da evidência ou da declaração
  organizationId: string;
  cycleId: string;
  dimensionId: string;
  statementAsIs: string;          // O que a Câmara tem/faz hoje (descrição factual)
  nextExpectedState: NextExpectedStateRef; // Para onde queremos ir (estruturado)
  
  // Fonte única de evidência probatória (referenciada diretamente, sem flags duplicadas)
  supportingEvidenceIds: string[];

  // Condicionantes reais com lastro legítimo (sem inferência automática)
  confirmedDeadline?: ConfirmedRegulatoryDeadline;
  relations: CandidateRelation[];
  
  // Estado no fluxo de triagem/roteamento
  triageStatus: 'PENDENTE_DE_TRIAGEM' | 'TRIADO' | 'ESCLARECIMENTO_SOLICITADO';
  clarificationRequest?: ClarificationRequestRef;
  
  // Estado resultante do roteamento
  routing?: CandidateRoutingState;
  
  // Vínculo operacional (opcional: a rota é anterior e mais ampla que a ação)
  boundActionId?: string;
}

// ============================================================================
// REGISTRO DE CONTESTAÇÃO TIPADA
// ============================================================================

export interface ContestRecord {
  contestId: string;
  candidateId: string;
  contestType: ContestType;
  claim: string;                  // O que a instituição/usuário alega
  submittedEvidenceIds?: string[];// Evidências oferecidas
  submittedByUserId: string;
  submittedByRole: UserRole;
  submittedAt: string;
  status: 'RECEBIDA' | 'EM_ANALISE' | 'DEFERIDA' | 'INDEFERIDA';
  consequenceSummary?: string;    // Efeito na governança (saneamento, justificativa ou diário)
  resolvedAt?: string;
  resolvedByUserId?: string;
}

// ============================================================================
// RESULTADOS DA EXECUÇÃO DE ROTA E FOCO ATUAL (Bloco 2.3)
// ============================================================================

export interface RoutingExecutionResult {
  candidateId: string;
  targetSpace: RouteSpace;
  regimeApplied: DecisionRegime;
  reason: StructuredRoutingReason;
  passedIntegrityGuard: boolean;
  integrityViolations?: string[];
  updatedCandidate: RoutingCandidate;
}

export type FocusExclusionReason = 
  | 'NAO_PERTENCE_A_AGORA'
  | 'BLOQUEADO_POR_DEPENDENCIA'
  | 'IMPEDIMENTO_FATICO_DECLARADO'
  | 'SOB_ESCLARECIMENTO';

export interface FocusCandidateExclusion {
  candidateId: string;
  exclusionReason: FocusExclusionReason;
  detail: string;
  blockingRelation?: CandidateRelation;
}

export interface CurrentFocusEvaluation {
  cycleId: string;
  organizationId: string;
  /**
   * Conjunto plural de candidatos em Foco Atual.
   * Relação formal estrita: Foco Atual ⊆ AGORA.
   * Todos os candidatos aqui presentes possuem obrigatoriamente effectiveSpace === 'AGORA'.
   */
  focusCandidates: RoutingCandidate[];
  /** Candidatos que não entraram no Foco Atual com fundamentação de exclusão */
  excludedCandidatesSummary: FocusCandidateExclusion[];
  evaluationTimestamp: string;
  evaluationNotes?: string;
}

// ============================================================================
// CONTRATOS DE DECISÃO FORMAL E CONTESTABILIDADE (Bloco 2.4)
// ============================================================================

export interface FormalDecisionInput {
  candidateId: string;
  chosenSpace: RouteSpace;
  decidedByUserId?: string;       // Opcional em decisões DETERMINÍSTICAS (origem na regra)
  decidedByRole?: UserRole;       // Opcional em decisões DETERMINÍSTICAS
  decidedByMembershipId?: string; // Vínculo institucional formal futuro
  /** Campo canônico: justificativa obrigatória em regime ASSISTIDO quando chosenSpace !== suggestedSpace */
  divergenceReason?: string;
  /** @deprecated Preservado estritamente para compatibilidade retroativa com código legado */
  overrideReason?: string;
  rationale?: string;
}

export interface FormalDecisionResult {
  isSuccess: boolean;
  decisionRecord?: import('../types').RouteDecisionRecord;
  updatedCandidate?: RoutingCandidate;
  violations?: string[];
}

export interface SubmitContestInput {
  candidateId: string;
  contestType: ContestType; // 'FATO' | 'INTERPRETAÇÃO' | 'REGRA'
  claim: string;
  submittedEvidenceIds?: string[];
  submittedByUserId: string;
  submittedByRole: UserRole;
  submittedByMembershipId?: string;
}

export interface ContestResolutionResult {
  contestRecord: ContestRecord;
  consequenceType: 
    | 'SANEAMENTO_PROBATORIO' 
    | 'DECISAO_DIVERGENTE_ADMITIDA' 
    | 'ENCAMINHAMENTO_GOVERNANCA_METODOLOGICA';
  consequenceDetail: string;
  updatedCandidate: RoutingCandidate;
  methodologicalDiaryRef?: string;
}

// ============================================================================
// CONTRATOS DE EVENTOS, IMPACTO E REAVALIAÇÃO LOCALIZADA (Bloco 2.5)
// ============================================================================

export interface TargetEntityRef {
  entityType: 'CANDIDATE' | 'ACTION' | 'CAPACITY' | 'DOOR' | 'CYCLE';
  entityId: string;
}

export type EventImpactType = 
  | 'CORROBORANTE'                  // Confirma a conclusão fática prévia sem alterar a rota
  | 'COMPLEMENTAR'                  // Agrega detalhe ou documento sem invalidar a conclusão
  | 'CONTRADITORIO_OU_MODIFICADOR'  // Contradiz fatos anteriores ou altera requisitos materiais
  | 'IMPACTO_INDETERMINADO';        // Informação insuficiente para concluir; exige esclarecimento

export interface OperationalImpactAnalysis {
  eventId: string;
  sourceEntity: TargetEntityRef;
  impactType: EventImpactType;
  isPotentiallyRelevant: boolean;
  rationale: string;
  directlyAffectedEntities: TargetEntityRef[];
  requiresLocalReevaluation: boolean;
  requiresClarification: boolean;
  analyzedAt: string;
}

export type ReevaluationTriggerOrigin = 
  | 'EVENTO_OPERACIONAL' 
  | 'REVISAO_PROGRAMADA' 
  | 'MUDANCA_EXTERNA_OU_METODOLOGICA';

export type ReevaluationOutcomeType = 
  | 'EVOLUCAO'                  // Demonstração efetiva de nova capacidade
  | 'ESTABILIDADE'              // Confirmação de manutenção do estado sem alteração de maturidade
  | 'CORRECAO_DE_COMPREENSAO'   // Ajuste diagnóstico sem alteração fática da instituição
  | 'REGRESSAO_OU_PERDA';       // Perda ou enfraquecimento de capacidade anterior

export interface LocalizedReevaluationResult {
  reevaluationId: string;
  triggerOrigin: ReevaluationTriggerOrigin;
  targetScope: TargetEntityRef;
  outcome: ReevaluationOutcomeType;
  evidentialBasisIds: string[];
  reusedEvidenceIds: string[];  // Evidências prévias mantidas (zero retrabalho)
  statementAfterReevaluation: string;
  recognizedAt: string;
  producesNewAsIsMilestone: boolean;
  resultingMilestoneId?: string;
}

export interface PropagationResult {
  rootImpactedCandidateId: string;
  directlyAffectedCandidateIds: string[];
  dependentCandidateIds: string[];
  propagationTrace: {
    sourceCandidateId: string;
    targetCandidateId: string;
    relationType: string;
    origin: string;
  }[];
}

