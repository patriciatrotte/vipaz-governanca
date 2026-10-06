/**
 * VIPAZ — Minha Rota
 * Bloco D1-A — Camada Estrutural de Domínio (v2.2 Refinada)
 *
 * Contratos canônicos de inferência de capacidade D1:
 * - 6 Capacidades e 19 Critérios canônicos
 * - Objeto de Verificação (VerificationObject) com aplicabilidade condicionada (ApplicabilityStatus)
 * - Referencial/Requisito Compartilhável (RequirementReference) com relação N:N com OVs
 * - Remoção de proofRequirementApplied singular de CriterionResult (força probatória isolada no OV)
 * - Formalização estrita da semântica de allowNonTriggered (false = condição atual investigável; true = admite ausência de oportunidade)
 * - Dimensão epistemológica cumulativa (ManifestationNature[]) separada do canal e do contexto
 * - Teste prospectivo de prontidão atual (investigationContext) !== intenção futura (PROSPECTIVA)
 * - Relação N:N entre unidades de informação, critérios e objetos de verificação
 * - Estados canônicos estritos de OV, critério e capacidade
 * - Salvaguarda explícita: COMPROVACAO_PENDENTE !== requisito comprovado
 * - Salvaguarda explícita: NAO_APLICAVEL !== NAO_ACIONADO
 * - Estruturação para materialidade em dois níveis (OV → Critério e Critério → Capacidade)
 * - Sem scores, pesos numéricos, médias ou compensações
 */

// ============================================================================
// 1. DIMENSÃO EPISTEMOLÓGICA, ELICITAÇÃO E CONTEXTO INVESTIGATIVO
// ============================================================================

/**
 * Dimensão epistemológica estrita da manifestação (qualidade da apreensão do fato).
 * Cumulativa: uma mesma unidade de informação pode acumular múltiplas naturezas.
 *
 * REGRA METODOLÓGICA:
 * PROSPECTIVA refere-se exclusivamente a intenção, plano ou expectativa futura.
 * Não confunda com teste/cenário prospectivo de prontidão atual (que é contexto de elicitação).
 */
export type ManifestationNature =
  | 'DECLARADA'     // Afirmação oral ou escrita sobre o fato
  | 'VIVENCIADA'    // Relato fundado na prática, esforço ou rotina direta
  | 'DEMONSTRADA'   // Constatação prática empírica em operação observada
  | 'COMPROVADA'    // Lastreada em artefato documental ou registro objetivo
  | 'CORROBORADA'   // Sustentada independentemente por fontes convergentes
  | 'PROSPECTIVA';  // Intenção declarada, plano ou expectativa futura

/** Modalidade e canal físico de coleta (modelado separadamente da epistemologia) */
export type ElicitationChannel =
  | 'ENTREVISTA_ORAL'
  | 'QUESTIONARIO_ESTRUTURADO'
  | 'DOCUMENTO_ANEXADO'
  | 'OBSERVACAO_DIRETA'
  | 'REGISTRO_DE_SISTEMA'
  | 'AUDIENCIA_DE_ALINHAMENTO';

/**
 * Contexto investigativo de obtenção da informação.
 * Permite registrar se o fato foi colhido na rotina observada ou mediante
 * simulação/cenário prospectivo de prontidão atual.
 */
export type InvestigationContext =
  | 'ROTINA_OPERACIONAL'            // Fato decorrente da rotina regular
  | 'TESTE_PROSPECTIVO_PRONTIDAO';  // Fato colhido em teste/cenário prospectivo de prontidão atual

export type InformantRole =
  | 'ENCARREGADO'
  | 'GESTOR_DIRIGENTE'
  | 'EQUIPE_TI'
  | 'JURIDICO'
  | 'CONTROLE_INTERNO'
  | 'SETOR_OPERACIONAL'
  | 'TITULAR_OU_CIDADAO'
  | 'FACILITADOR_DIAGNOSTICO';

export interface InformationProvenance {
  authorName: string;
  authorRole: InformantRole;
  channel: ElicitationChannel;
  collectedAt: string; // ISO-8601
  institutionalScope: string;
  externalRefId?: string;
  /** Contexto investigativo: rotina vs teste de prontidão atual (separado da natureza PROSPECTIVA) */
  investigationContext?: InvestigationContext;
}

export type FactPertinenceDegree =
  | 'PERTINENCIA_DIRETA_ESPECIFICA' // Aborda diretamente o fato em questão
  | 'PERTINENCIA_CONTEXTUAL_GERAL'   // Trata do ambiente/setor, mas não do fato específico
  | 'SEM_PERTINENCIA_PROBATORIA';    // Não possui pertinência fática com o critério/OV

export interface CriterionBinding {
  criterionId: CanonicalCriterionId;
  verificationObjectId?: string;   // Vínculo granular opcional com OV mantendo relação N:N
  pertinence: FactPertinenceDegree;
  supportsExistence: boolean;       // true = atesta existência; false = atesta inexistência/falha
  specificFactSummary: string;      // Síntese objetiva do fato atestado
}

/** Unidade Canônica de Informação Investigada */
export interface InformationUnit {
  id: string; // UUID imutável
  doorOrCapabilityScope: CanonicalCapacityId;
  rawContent: string;
  /** Natureza epistemológica CUMULATIVA: uma unidade pode acumular múltiplas naturezas */
  manifestationNatures: ManifestationNature[];
  /** Modalidade de coleta e contexto investigativo */
  provenance: InformationProvenance;
  /** Relação N:N canônica com critérios e objetos de verificação */
  bindings: CriterionBinding[];
  attachedEvidenceId?: string;
}

// ============================================================================
// 2. DIVERGÊNCIAS E SUFICIÊNCIA
// ============================================================================

export type DivergenceType =
  | 'NARRATIVA_VS_ESTRUTURADO'
  | 'DOCUMENTO_VS_RELATO'
  | 'FONTES_DISTINTAS_MESMO_FATO'
  | 'DIVERGENCIA_TEMPORAL_ROTINA_SUPERADA';

export interface Divergence {
  id: string;
  criterionId: CanonicalCriterionId;
  verificationObjectId?: string;
  conflictingUnitIds: [string, string, ...string[]];
  divergenceType: DivergenceType;
  description: string;
  isMaterial: boolean;
  resolved: boolean;
  resolutionRationale?: string;
  resolutionDecidedBy?: 'PERTINENCIA_PROBATORIA' | 'DELIBERACAO_FACILITADOR';
}

export type InvestigationSufficiency =
  | 'SUFICIENTEMENTE_EXPLORADA'
  | 'EXPLORACAO_PENDENTE'
  | 'NAO_INFORMADO' // "Não sei" ou desconhecimento registrado
  | 'DIVERGENCIA_MATERIAL_PENDENTE';

// ============================================================================
// 3. CAPACIDADES, CRITÉRIOS, OVs E REQUISITOS COMPARTILHÁVEIS
// ============================================================================

export type CanonicalCapacityId =
  | 'D1.1' // Organização institucional (2 critérios)
  | 'D1.2' // Encarregado (4 critérios)
  | 'D1.3' // Responsabilidades (3 critérios)
  | 'D1.4' // Articulação (3 critérios)
  | 'D1.5' // Gestão (3 critérios)
  | 'D1.6'; // Continuidade (4 critérios)

export type CanonicalCriterionId =
  // D1.1 — Organização institucional (2)
  | 'C1.1-A' // Arranjo funcional reconhecível e acionável
  | 'C1.1-B' // Cobertura funcional mínima
  // D1.2 — Encarregado (4)
  | 'C1.2-A' // Instituição regular da função
  | 'C1.2-B' // Exercício funcional
  | 'C1.2-C' // Acesso e condições institucionais
  | 'C1.2-D' // Compatibilidade funcional
  // D1.3 — Responsabilidades (3)
  | 'C1.3-A' // Distribuição funcional
  | 'C1.3-B' // Apropriação da responsabilidade
  | 'C1.3-C' // Exercício
  // D1.4 — Articulação (3)
  | 'C1.4-A' // Participação responsiva
  | 'C1.4-B' // Coordenação funcional
  | 'C1.4-C' // Encaminhamento e fechamento
  // D1.5 — Gestão (3)
  | 'C1.5-A' // Acesso decisório
  | 'C1.5-B' // Resposta decisória
  | 'C1.5-C' // Viabilização proporcional
  // D1.6 — Continuidade (4)
  | 'C1.6-A' // Substituibilidade funcional
  | 'C1.6-B' // Recuperabilidade da informação e do conhecimento
  | 'C1.6-C' // Recuperabilidade das pendências
  | 'C1.6-D'; // Reutilização da aprendizagem institucional

export type ProofRequirementLevel =
  | 'FUNCIONAL'
  | 'ESTRITA';

/** Natureza do Objeto de Verificação (não presume que todo OV é obrigação jurídica) */
export type VerificationObjectNature =
  | 'REQUISITO_NORMATIVO'
  | 'MANIFESTACAO_FUNCIONAL';

/**
 * Estados de Aplicabilidade do Objeto de Verificação (quando condicionado):
 * Avaliada antes do VerificationObjectResult.
 * - APLICAVEL: Permite investigação e resultado do OV;
 * - NAO_APLICAVEL: Não produz SATISFEITO/NAO_SATISFEITO/NAO_ACIONADO e não participa da composição do critério;
 * - APLICABILIDADE_NAO_CONCLUSIVA: Preserva pendência e impede conclusão do critério enquanto materialmente relevante.
 *
 * NOTA: NAO_APLICAVEL !== NAO_ACIONADO.
 */
export type ApplicabilityStatus =
  | 'APLICAVEL'
  | 'NAO_APLICAVEL'
  | 'APLICABILIDADE_NAO_CONCLUSIVA';

export interface VerificationObjectApplicabilityEvaluation {
  verificationObjectId: string;
  status: ApplicabilityStatus;
  rationale: string;
  supportingInformationUnitIds?: string[];
  evaluatedAt: string; // ISO-8601
}

/** Efeito de NAO_ACIONADO determinado primariamente no Objeto de Verificação */
export type NonTriggeredOVEffect =
  | 'NEUTRALIDADE_ESTRITA'
  | 'EXIGE_TESTE_PROSPECTIVO'
  | 'BLOQUEIA_CONCLUSAO_CRITERIO';

/**
 * Referencial / Requisito Compartilhável (RequirementReference):
 * Permite que um mesmo requisito normativo ou referencial metodológico fundamente
 * múltiplos OVs e/ou critérios sem ser duplicado como obrigação.
 * Relação N:N canônica: 1 RequirementReference -> N VerificationObjects e vice-versa.
 */
export interface RequirementReference {
  id: string; // Ex: "REQ-D1-SUBST-FORMAL"
  code: string;
  title: string;
  sourceNorm: string; // Ex: "LGPD art. 41", "Resolução ANPD", etc.
  statement: string; // Enunciado formal da exigência
  externalRefId?: string;
}

/**
 * Objeto de Verificação (VerificationObject):
 * Unidade metodológica sobre a qual informação/evidência é analisada
 * antes da composição do resultado do critério.
 */
export interface VerificationObjectDefinition {
  id: string; // Ex: "OV-C1.2-A-01"
  criterionId: CanonicalCriterionId;
  code: string;
  title: string;
  description: string;
  nature: VerificationObjectNature;
  /**
   * Indica se a incidência do OV é condicionada a contexto específico.
   * Se true, requer avaliação prévia de aplicabilidade (ApplicabilityStatus).
   * Se false (padrão), o OV possui aplicabilidade incondicionada/direta.
   */
  isConditionedApplicability: boolean;
  /**
   * Semântica canônica de allowNonTriggered:
   * - false: O objeto possui condição atual investigável e não deve ser
   *   classificado como NAO_ACIONADO simplesmente pela ausência de episódio concreto anterior.
   *   Não significa que experiência histórica real seja obrigatória.
   * - true: A ausência legítima de oportunidade de manifestação pode produzir NAO_ACIONADO,
   *   sujeito ao nonTriggeredEffect definido externamente pela Matriz Mestra.
   */
  allowNonTriggered: boolean;
  /** Vínculos N:N com requisitos normativos compartilháveis */
  requirementReferenceIds?: string[];
  // Campos definidos externamente pela Matriz Mestra D1 v2 / crosswalk:
  proofRequirement?: ProofRequirementLevel; // Primariamente por OV!
  nonTriggeredEffect?: NonTriggeredOVEffect; // Primariamente por OV!
  pointsOfValidation?: string[];
}

export interface CanonicalCriterionDefinition {
  id: CanonicalCriterionId;
  capacityId: CanonicalCapacityId;
  code: string;
  title: string;
  description: string;
  allowNonTriggered: boolean;
  verificationObjectIds?: string[];
  // Campos cujo valor depende estritamente da Matriz Mestra D1 v2:
  nonTriggeredEffect?: NonTriggeredOVEffect;
  pointsOfValidation?: string[];
}

export interface CanonicalCapacityDefinition {
  id: CanonicalCapacityId;
  code: string;
  title: string;
  description: string;
  criteriaIds: CanonicalCriterionId[];
}

// ============================================================================
// 4. RESULTADOS DE OV, CRITÉRIO E CAPACIDADE
// ============================================================================

/**
 * Status estritos e taxativos de resultado (OV e Critério).
 *
 * REGRA METODOLÓGICA CONGELADA:
 * COMPROVACAO_PENDENTE !== requisito comprovado.
 * A pendência probatória indica que o fato alegado ou exercido ainda necessita
 * de sustentação probatória estrita exigida, não podendo ser equiparado a SATISFEITO.
 */
export type CriterionResultStatus =
  | 'SATISFEITO'
  | 'NAO_SATISFEITO'
  | 'COMPROVACAO_PENDENTE'
  | 'NAO_CONCLUSIVO'
  | 'NAO_ACIONADO';

export type VerificationObjectResultStatus = CriterionResultStatus;

export interface ObservedPointOfValidation {
  pointDescription: string;
  verified: boolean;
  evidenceNotes?: string;
}

/** Resultado formal do Objeto de Verificação */
export interface VerificationObjectResult {
  verificationObjectId: string;
  criterionId: CanonicalCriterionId;
  status: VerificationObjectResultStatus;
  sufficiency: InvestigationSufficiency;
  proofRequirementApplied: ProofRequirementLevel; // Força probatória preservada estritamente no OV
  supportingInformationUnitIds: string[];
  divergenceIds: string[];
  pointsOfValidationObserved: ObservedPointOfValidation[];
  identifiedDeficiencySummary?: string;
  rationale: string;
}

/**
 * Resultado formal do Critério Canônico.
 * NOTA: O campo proofRequirementApplied foi removido deste nível para não sugerir
 * falsamente que todo o critério foi submetido a uma única força probatória.
 * A força probatória aplicada permanece registrada individualmente em cada VerificationObjectResult.
 */
export interface CriterionResult {
  criterionId: CanonicalCriterionId;
  status: CriterionResultStatus;
  sufficiency: InvestigationSufficiency;
  supportingInformationUnitIds: string[];
  divergenceIds: string[];
  verificationObjectResults?: VerificationObjectResult[]; // Resultados individuais dos OVs
  pointsOfValidationObserved: ObservedPointOfValidation[];
  identifiedDeficiencySummary?: string;
  rationale: string;
}

/** Status estritos e taxativos de CapabilityResult */
export type CapabilityResultStatus =
  | 'SUFICIENTE'
  | 'SUFICIENTE_EVOLUCAO_POSSIVEL'
  | 'SUFICIENTE_COMPROVACAO_PENDENTE'
  | 'INSUFICIENTE'
  | 'NAO_CONCLUSIVO';

export interface PersonalDependencyFinding {
  isConcentratedInSingleAgent: boolean;
  demonstratedFailureOccurred: boolean;
  impactedCriterionIds: CanonicalCriterionId[];
  factualDescription: string;
}

export interface CapabilityResult {
  capacityId: CanonicalCapacityId;
  status: CapabilityResultStatus;
  criteriaResults: CriterionResult[];
  personalDependencyFinding?: PersonalDependencyFinding;
  bottleneckCriterionIds: CanonicalCriterionId[];
  causalFindings: string[];
  rationale: string;
}

// ============================================================================
// 5. CAUSAL CLUSTERING E SAÍDA PARA ETAPA 2
// ============================================================================

export interface CausalGapCluster {
  clusterId: string;
  capacityId: CanonicalCapacityId;
  rootDeficiencyDescription: string; // Distância de capacidade observada (não prescritiva)
  originatingCriteriaIds: CanonicalCriterionId[];
  originatingVerificationObjectIds?: string[];
  supportingEvidenceIds: string[];
}

export interface D1InferenceOutput {
  capabilities: CapabilityResult[];
  clusters: CausalGapCluster[];
  // Contratos da Etapa 2 produzidos upstream:
  validatedGaps: Array<{
    id: string;
    doorId: string;
    capacityId: string;
    title: string;
    description: string;
    supportingEvidenceIds: string[];
  }>;
  nextExpectedStates: Record<string, {
    targetKind: 'TRANSICAO_OPERACIONAL' | 'ROTINA_ESTABILIZADA' | 'CAPACIDADE_DEMONSTRADA';
    description: string;
    metricOrVerification: string;
  }>;
}

// ============================================================================
// 6. MATRIZ MESTRA D1 v2 (MATERIALIDADE EM DOIS NÍVEIS - PLACEHOLDERS)
// ============================================================================

/**
 * Configuração do Objeto de Verificação na Matriz Mestra:
 * Materialidade no 1º nível: OV → Critério.
 */
export interface D1MasterMatrixOVConfig {
  proofRequirement: ProofRequirementLevel;
  nonTriggeredEffect?: NonTriggeredOVEffect;
  pointsOfValidation: string[];
  isEssentialForCriterion: boolean; // Materialidade OV → Critério (sem scores/pesos)
}

/**
 * Configuração do Critério na Matriz Mestra:
 * Materialidade no 2º nível: Critério → Capacidade.
 */
export interface D1MasterMatrixCriterionConfig {
  verificationObjectsConfig?: Record<string, D1MasterMatrixOVConfig>;
  isEssentialForCapacity: boolean; // Materialidade Critério → Capacidade (sem scores/pesos)
  // Caso de critérios sem decomposição de OVs:
  nonTriggeredEffect?: NonTriggeredOVEffect;
  pointsOfValidation?: string[];
}

export interface D1MasterMatrixCapacityConfig {
  essentialCriteriaIds: CanonicalCriterionId[];
  toleratedNonSatisfiedForPossibleEvolution?: CanonicalCriterionId[];
}

export interface D1MasterMatrixConfig {
  version: string;
  criteriaConfig: Record<CanonicalCriterionId, D1MasterMatrixCriterionConfig>;
  capacitiesConfig: Record<CanonicalCapacityId, D1MasterMatrixCapacityConfig>;
}
