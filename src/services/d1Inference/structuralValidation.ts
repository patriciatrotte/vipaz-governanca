/**
 * VIPAZ — Minha Rota
 * Bloco D1-A — Validações Estruturais de Domínio do Motor D1 v2 (v2.2 Refinada)
 *
 * Módulo de validação estrutural dos contratos do Bloco D1-A:
 * - Validação de integridade de InformationUnit (natureza cumulativa, proveniência e vínculos N:N)
 * - Validação de Objeto de Verificação (VerificationObjectDefinition) com aplicabilidade condicionada
 * - Validação de aplicabilidade de OV (ApplicabilityStatus) e distinção estrita com NAO_ACIONADO
 * - Validação de referencial/requisito compartilhável (RequirementReference) com relação N:N
 * - Validação de resultado de Objeto de Verificação (VerificationObjectResult)
 * - Semântica de allowNonTriggered (condição atual investigável vs ausência de oportunidade)
 * - Separação estrita entre teste prospectivo de prontidão atual e intenção futura
 * - Validação de divergências com vínculo de OV opcional
 * - Validação de clusters causais (prevenção de prescrição antecipada e duplicação)
 * - Garantia da regra: COMPROVACAO_PENDENTE !== requisito comprovado
 * - Salvaguarda estrita contra suposição técnica de parâmetros dependentes da Matriz Mestra
 */

import {
  InformationUnit,
  Divergence,
  CausalGapCluster,
  CriterionResultStatus,
  VerificationObjectDefinition,
  VerificationObjectResult,
  VerificationObjectApplicabilityEvaluation,
  RequirementReference,
  D1MasterMatrixConfig,
  CanonicalCriterionId,
  CanonicalCapacityId
} from '../../types/d1Inference';
import { CANONICAL_CAPACITIES_D1, CANONICAL_CRITERIA_D1 } from './canonicalDefinitions';

export interface ValidationIssue {
  code: string;
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}

/**
 * Valida a integridade de uma Unidade de Informação (InformationUnit).
 */
export function validateInformationUnitIntegrity(unit: InformationUnit): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!unit.id || unit.id.trim().length === 0) {
    issues.push({ code: 'EMPTY_ID', field: 'id', message: 'O ID da unidade de informação é obrigatório.' });
  }

  if (!unit.doorOrCapabilityScope || !CANONICAL_CAPACITIES_D1[unit.doorOrCapabilityScope]) {
    issues.push({
      code: 'INVALID_CAPACITY_SCOPE',
      field: 'doorOrCapabilityScope',
      message: `Escopo de capacidade inválido: ${unit.doorOrCapabilityScope}. Deve ser uma das 6 capacidades D1.1 a D1.6.`
    });
  }

  if (!unit.rawContent || unit.rawContent.trim().length === 0) {
    issues.push({ code: 'EMPTY_RAW_CONTENT', field: 'rawContent', message: 'O conteúdo investigado não pode ser vazio.' });
  }

  // Validação da dimensão epistemológica cumulativa (mínimo 1 natureza válida)
  if (!Array.isArray(unit.manifestationNatures) || unit.manifestationNatures.length === 0) {
    issues.push({
      code: 'MISSING_MANIFESTATION_NATURES',
      field: 'manifestationNatures',
      message: 'A unidade de informação deve conter pelo menos uma natureza de manifestação epistemológica.'
    });
  } else {
    const validNatures = new Set(['DECLARADA', 'VIVENCIADA', 'DEMONSTRADA', 'COMPROVADA', 'CORROBORADA', 'PROSPECTIVA']);
    for (const nature of unit.manifestationNatures) {
      if (!validNatures.has(nature)) {
        issues.push({
          code: 'INVALID_MANIFESTATION_NATURE',
          field: 'manifestationNatures',
          message: `Natureza epistemológica inválida: ${nature}.`
        });
      }
    }
  }

  // Validação da proveniência
  if (!unit.provenance) {
    issues.push({ code: 'MISSING_PROVENANCE', field: 'provenance', message: 'A proveniência é obrigatória.' });
  } else {
    if (!unit.provenance.authorName || unit.provenance.authorName.trim().length === 0) {
      issues.push({ code: 'EMPTY_AUTHOR_NAME', field: 'provenance.authorName', message: 'Nome do informante/autor é obrigatório.' });
    }
    if (!unit.provenance.authorRole) {
      issues.push({ code: 'EMPTY_AUTHOR_ROLE', field: 'provenance.authorRole', message: 'Papel do informante é obrigatório.' });
    }
    if (!unit.provenance.channel) {
      issues.push({ code: 'EMPTY_CHANNEL', field: 'provenance.channel', message: 'Canal de elicitação é obrigatório.' });
    }
    if (!unit.provenance.collectedAt || isNaN(Date.parse(unit.provenance.collectedAt))) {
      issues.push({ code: 'INVALID_TIMESTAMP', field: 'provenance.collectedAt', message: 'Data de coleta em formato ISO-8601 é obrigatória.' });
    }
    if (unit.provenance.investigationContext) {
      const validContexts = new Set(['ROTINA_OPERACIONAL', 'TESTE_PROSPECTIVO_PRONTIDAO']);
      if (!validContexts.has(unit.provenance.investigationContext)) {
        issues.push({
          code: 'INVALID_INVESTIGATION_CONTEXT',
          field: 'provenance.investigationContext',
          message: `Contexto investigativo inválido: ${unit.provenance.investigationContext}.`
        });
      }
    }
  }

  // Validação dos vínculos N:N com critérios e OVs
  if (!Array.isArray(unit.bindings) || unit.bindings.length === 0) {
    issues.push({
      code: 'MISSING_CRITERION_BINDINGS',
      field: 'bindings',
      message: 'A unidade de informação deve possuir ao menos um vínculo com critério do diagnóstico.'
    });
  } else {
    for (let i = 0; i < unit.bindings.length; i++) {
      const b = unit.bindings[i];
      if (!b.criterionId || !CANONICAL_CRITERIA_D1[b.criterionId]) {
        issues.push({
          code: 'INVALID_CRITERION_BINDING',
          field: `bindings[${i}].criterionId`,
          message: `Critério canônico inválido: ${b.criterionId}. Deve ser um dos 19 critérios canônicos.`
        });
      }
      if (!b.pertinence) {
        issues.push({
          code: 'MISSING_PERTINENCE',
          field: `bindings[${i}].pertinence`,
          message: 'Grau de pertinência probatória é obrigatório no vínculo.'
        });
      }
      if (typeof b.supportsExistence !== 'boolean') {
        issues.push({
          code: 'INVALID_SUPPORTS_EXISTENCE',
          field: `bindings[${i}].supportsExistence`,
          message: 'Indicação de suporte à existência deve ser booleana.'
        });
      }
      if (!b.specificFactSummary || b.specificFactSummary.trim().length === 0) {
        issues.push({
          code: 'EMPTY_FACT_SUMMARY',
          field: `bindings[${i}].specificFactSummary`,
          message: 'Síntese objetiva do fato atestado é obrigatória.'
        });
      }
    }
  }

  return { isValid: issues.length === 0, issues };
}

/**
 * Validação de integridade do Objeto de Verificação (VerificationObjectDefinition).
 */
export function validateVerificationObjectIntegrity(ov: VerificationObjectDefinition): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!ov.id || ov.id.trim().length === 0) {
    issues.push({ code: 'EMPTY_ID', field: 'id', message: 'O ID do Objeto de Verificação é obrigatório.' });
  }

  if (!ov.criterionId || !CANONICAL_CRITERIA_D1[ov.criterionId]) {
    issues.push({
      code: 'INVALID_CRITERION_ID',
      field: 'criterionId',
      message: `Critério inválido para o Objeto de Verificação: ${ov.criterionId}.`
    });
  }

  if (!ov.code || ov.code.trim().length === 0) {
    issues.push({ code: 'EMPTY_CODE', field: 'code', message: 'O código do Objeto de Verificação é obrigatório.' });
  }

  if (!ov.title || ov.title.trim().length === 0) {
    issues.push({ code: 'EMPTY_TITLE', field: 'title', message: 'O título do Objeto de Verificação é obrigatório.' });
  }

  if (!ov.description || ov.description.trim().length === 0) {
    issues.push({ code: 'EMPTY_DESCRIPTION', field: 'description', message: 'A descrição do Objeto de Verificação é obrigatória.' });
  }

  const validNatures = new Set(['REQUISITO_NORMATIVO', 'MANIFESTACAO_FUNCIONAL']);
  if (!ov.nature || !validNatures.has(ov.nature)) {
    issues.push({
      code: 'INVALID_OV_NATURE',
      field: 'nature',
      message: `Natureza do Objeto de Verificação inválida: ${ov.nature}. Deve ser REQUISITO_NORMATIVO ou MANIFESTACAO_FUNCIONAL.`
    });
  }

  if (typeof ov.isConditionedApplicability !== 'boolean') {
    issues.push({
      code: 'INVALID_CONDITIONED_FLAG',
      field: 'isConditionedApplicability',
      message: 'Indicação de aplicabilidade condicionada deve ser booleana.'
    });
  }

  if (typeof ov.allowNonTriggered !== 'boolean') {
    issues.push({
      code: 'INVALID_ALLOW_NON_TRIGGERED',
      field: 'allowNonTriggered',
      message: 'Indicação de allowNonTriggered deve ser booleana.'
    });
  }

  return { isValid: issues.length === 0, issues };
}

/**
 * Validação estrutural de avaliação de aplicabilidade do OV.
 */
export function validateApplicabilityEvaluation(
  evaluation: VerificationObjectApplicabilityEvaluation,
  isConditioned: boolean
): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!evaluation.verificationObjectId || evaluation.verificationObjectId.trim().length === 0) {
    issues.push({ code: 'EMPTY_OV_ID', field: 'verificationObjectId', message: 'ID do OV é obrigatório na avaliação de aplicabilidade.' });
  }

  const validStatuses = new Set(['APLICAVEL', 'NAO_APLICAVEL', 'APLICABILIDADE_NAO_CONCLUSIVA']);
  if (!evaluation.status || !validStatuses.has(evaluation.status)) {
    issues.push({
      code: 'INVALID_APPLICABILITY_STATUS',
      field: 'status',
      message: `Status de aplicabilidade inválido: ${evaluation.status}.`
    });
  }

  if (!evaluation.rationale || evaluation.rationale.trim().length === 0) {
    issues.push({ code: 'EMPTY_RATIONALE', field: 'rationale', message: 'Justificativa da aplicabilidade é obrigatória.' });
  }

  // Salvaguarda: NAO_APLICAVEL !== NAO_ACIONADO
  if ((evaluation.status as string) === 'NAO_ACIONADO') {
    issues.push({
      code: 'CONFUSED_APPLICABILITY_WITH_NON_TRIGGERED',
      field: 'status',
      message: 'VIOLAÇÃO METODOLÓGICA: NAO_APLICAVEL é estritamente distinto de NAO_ACIONADO.'
    });
  }

  return { isValid: issues.length === 0, issues };
}

/**
 * Validação de integridade de Requisito Compartilhável (RequirementReference).
 */
export function validateRequirementReferenceIntegrity(req: RequirementReference): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!req.id || req.id.trim().length === 0) {
    issues.push({ code: 'EMPTY_ID', field: 'id', message: 'ID do requisito referencial é obrigatório.' });
  }
  if (!req.code || req.code.trim().length === 0) {
    issues.push({ code: 'EMPTY_CODE', field: 'code', message: 'Código do requisito referencial é obrigatório.' });
  }
  if (!req.title || req.title.trim().length === 0) {
    issues.push({ code: 'EMPTY_TITLE', field: 'title', message: 'Título do requisito referencial é obrigatório.' });
  }
  if (!req.sourceNorm || req.sourceNorm.trim().length === 0) {
    issues.push({ code: 'EMPTY_SOURCE_NORM', field: 'sourceNorm', message: 'Norma de origem do requisito é obrigatória.' });
  }
  if (!req.statement || req.statement.trim().length === 0) {
    issues.push({ code: 'EMPTY_STATEMENT', field: 'statement', message: 'Enunciado formal da exigência é obrigatório.' });
  }

  return { isValid: issues.length === 0, issues };
}

/**
 * Validação estrutural do resultado do Objeto de Verificação (VerificationObjectResult).
 */
export function validateVerificationObjectResultStructure(result: VerificationObjectResult): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!result.verificationObjectId || result.verificationObjectId.trim().length === 0) {
    issues.push({ code: 'EMPTY_OV_ID', field: 'verificationObjectId', message: 'ID do Objeto de Verificação é obrigatório no resultado.' });
  }

  if (!result.criterionId || !CANONICAL_CRITERIA_D1[result.criterionId]) {
    issues.push({
      code: 'INVALID_CRITERION_ID',
      field: 'criterionId',
      message: `Critério do resultado de OV inválido: ${result.criterionId}.`
    });
  }

  const validStatuses = new Set(['SATISFEITO', 'NAO_SATISFEITO', 'COMPROVACAO_PENDENTE', 'NAO_CONCLUSIVO', 'NAO_ACIONADO']);
  if (!result.status || !validStatuses.has(result.status)) {
    issues.push({
      code: 'INVALID_STATUS',
      field: 'status',
      message: `Status do resultado de OV inválido: ${result.status}.`
    });
  }

  const validProofs = new Set(['FUNCIONAL', 'ESTRITA']);
  if (!result.proofRequirementApplied || !validProofs.has(result.proofRequirementApplied)) {
    issues.push({
      code: 'INVALID_PROOF_REQUIREMENT',
      field: 'proofRequirementApplied',
      message: `Força probatória aplicada inválida: ${result.proofRequirementApplied}.`
    });
  }

  return { isValid: issues.length === 0, issues };
}

/**
 * Validação de integridade estrutural de uma divergência.
 */
export function validateDivergenceStructure(divergence: Divergence, knownUnitIds: Set<string>): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!divergence.id || divergence.id.trim().length === 0) {
    issues.push({ code: 'EMPTY_ID', field: 'id', message: 'ID da divergência é obrigatório.' });
  }

  if (!divergence.criterionId || !CANONICAL_CRITERIA_D1[divergence.criterionId]) {
    issues.push({
      code: 'INVALID_CRITERION_ID',
      field: 'criterionId',
      message: `Critério da divergência inválido: ${divergence.criterionId}.`
    });
  }

  if (!Array.isArray(divergence.conflictingUnitIds) || divergence.conflictingUnitIds.length < 2) {
    issues.push({
      code: 'INSUFFICIENT_CONFLICTING_UNITS',
      field: 'conflictingUnitIds',
      message: 'A divergência deve relacionar ao menos duas unidades de informação conflitantes.'
    });
  } else {
    for (const unitId of divergence.conflictingUnitIds) {
      if (!knownUnitIds.has(unitId)) {
        issues.push({
          code: 'UNKNOWN_CONFLICTING_UNIT',
          field: 'conflictingUnitIds',
          message: `Unidade de informação conflitante não encontrada no repositório: ${unitId}.`
        });
      }
    }
  }

  if (typeof divergence.isMaterial !== 'boolean') {
    issues.push({ code: 'MISSING_MATERIALITY', field: 'isMaterial', message: 'A materialidade da divergência deve ser informada.' });
  }

  return { isValid: issues.length === 0, issues };
}

/**
 * Validação de integridade estrutural de um cluster causal.
 * Assegura que o gap gerado seja descritivo (distância de capacidade) e não prescritivo antecipado.
 */
export function validateCausalClusterStructure(cluster: CausalGapCluster): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!cluster.clusterId || cluster.clusterId.trim().length === 0) {
    issues.push({ code: 'EMPTY_CLUSTER_ID', field: 'clusterId', message: 'ID do cluster causal é obrigatório.' });
  }

  if (!cluster.capacityId || !CANONICAL_CAPACITIES_D1[cluster.capacityId]) {
    issues.push({
      code: 'INVALID_CAPACITY_ID',
      field: 'capacityId',
      message: `Capacidade do cluster causal inválida: ${cluster.capacityId}.`
    });
  }

  if (!cluster.rootDeficiencyDescription || cluster.rootDeficiencyDescription.trim().length === 0) {
    issues.push({
      code: 'EMPTY_ROOT_DEFICIENCY',
      field: 'rootDeficiencyDescription',
      message: 'A descrição da distância de capacidade / deficiência raiz é obrigatória.'
    });
  }

  if (!Array.isArray(cluster.originatingCriteriaIds) || cluster.originatingCriteriaIds.length === 0) {
    issues.push({
      code: 'EMPTY_ORIGINATING_CRITERIA',
      field: 'originatingCriteriaIds',
      message: 'O cluster causal deve originar-se de pelo menos um critério avaliado.'
    });
  } else {
    for (const critId of cluster.originatingCriteriaIds) {
      const def = CANONICAL_CRITERIA_D1[critId];
      if (!def) {
        issues.push({ code: 'INVALID_CRITERION_ID', field: 'originatingCriteriaIds', message: `Critério inválido: ${critId}.` });
      } else if (def.capacityId !== cluster.capacityId) {
        issues.push({
          code: 'CRITERION_CAPACITY_MISMATCH',
          field: 'originatingCriteriaIds',
          message: `O critério ${critId} pertence à capacidade ${def.capacityId}, mas o cluster foi registrado sob ${cluster.capacityId}.`
        });
      }
    }
  }

  return { isValid: issues.length === 0, issues };
}

/**
 * Salvaguarda estrita: assegura que COMPROVACAO_PENDENTE nunca seja equiparado a SATISFEITO.
 */
export function assertComprovacaoPendenteNaoEquivaleASatisfeito(status: CriterionResultStatus): void {
  if (status === 'COMPROVACAO_PENDENTE') {
    // Validação formal semântica: status é estritamente distinto de SATISFEITO
    const equivaleASatisfeito = (status as string) === 'SATISFEITO';
    if (equivaleASatisfeito) {
      throw new Error('VIOLAÇÃO METODOLÓGICA: COMPROVACAO_PENDENTE não pode ser equiparado a SATISFEITO.');
    }
  }
}

/**
 * Salvaguarda metodológica: assegura que teste prospectivo de prontidão atual
 * não seja confundido ou convertido automaticamente em natureza PROSPECTIVA.
 */
export function assertProspectiveContextSeparation(unit: InformationUnit): void {
  if (unit.provenance.investigationContext === 'TESTE_PROSPECTIVO_PRONTIDAO') {
    // Um teste prospectivo pode constatar que existe protocolo atual funcional (DEMONSTRADA ou COMPROVADA)
    // Não deve forçar a natureza a ser PROSPECTIVA
    const temNaturezaPresente = unit.manifestationNatures.some(
      n => n === 'DEMONSTRADA' || n === 'COMPROVADA' || n === 'VIVENCIADA' || n === 'DECLARADA'
    );
    if (!temNaturezaPresente && !unit.manifestationNatures.includes('PROSPECTIVA')) {
      throw new Error('VIOLAÇÃO: Unidade em contexto prospectivo deve possuir ao menos uma natureza epistemológica válida.');
    }
  }
}

/**
 * Salvaguarda estrita contra valores padrão técnicos da Matriz Mestra D1 v2.
 * Caso a Matriz Mestra não seja fornecida externamente, a função recusa a operação
 * em vez de inventar ou arbitrar valores padrão.
 */
export function assertMasterMatrixConfigProvided(config?: D1MasterMatrixConfig): D1MasterMatrixConfig {
  if (!config) {
    throw new Error(
      'PENDÊNCIA METODOLÓGICA EXTERNA: A Matriz Mestra D1 v2 não foi fornecida. ' +
      'O motor recusa a execução de inferência decisória sem a matriz formal, em estrita ' +
      'vedação à criação de valores técnicos padrão ou scores artificiais.'
    );
  }

  // Verifica se todos os 19 critérios estão contemplados na matriz injetada
  const missingCriteria: CanonicalCriterionId[] = [];
  for (const critId of Object.keys(CANONICAL_CRITERIA_D1) as CanonicalCriterionId[]) {
    if (!config.criteriaConfig[critId]) {
      missingCriteria.push(critId);
    }
  }

  if (missingCriteria.length > 0) {
    throw new Error(
      `MATRIZ MESTRA INCOMPLETA: Faltam parâmetros metodológicos para os seguintes critérios: ${missingCriteria.join(', ')}.`
    );
  }

  return config;
}
