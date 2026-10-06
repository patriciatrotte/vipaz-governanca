/**
 * VIPAZ — Minha Rota
 * Bloco 2.1 — Serviços de Domínio Canônico
 *
 * Implementação das funções centrais de criação, integridade e conformidade
 * para RoutingCandidate e registros de decisão formal/determinística.
 */

import { ValidatedGap, RouteSpace, RouteDecisionRecord, UserRole } from '../../types';
import {
  RoutingCandidate,
  NextExpectedStateRef,
  DecisionRegime
} from '../../types/routing';

export type { RoutingCandidate, NextExpectedStateRef, DecisionRegime };

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}

export interface CreateCandidateFromGapParams {
  gap: ValidatedGap;
  organizationId: string;
  cycleId: string;
  dimensionId?: string;
  supportingEvidenceIds?: string[];
  customNextStateDescription?: string;
}

/**
 * Cria um RoutingCandidate a partir de um ValidatedGap do ciclo de investigação.
 * Preserva o princípio de fonte única: referências probatórias são mantidas por ID,
 * sem duplicar flags de investigação e sem inferir condicionantes não homologadas.
 */
export function createCandidateFromGap(params: CreateCandidateFromGapParams): RoutingCandidate {
  const {
    gap,
    organizationId,
    cycleId,
    dimensionId = 'D1',
    supportingEvidenceIds = [],
    customNextStateDescription
  } = params;

  const nextExpectedState: NextExpectedStateRef = {
    targetKind: 'CAPACIDADE',
    targetRefId: gap.capacityId,
    description: customNextStateDescription || `Evolução e consolidação da capacidade: ${gap.title}`
  };

  return {
    candidateId: `cand-${gap.id}`,
    sourceType: 'DIAGNOSTICO_GAP',
    sourceRefId: gap.id,
    organizationId,
    cycleId,
    dimensionId,
    statementAsIs: gap.description || gap.title,
    nextExpectedState,
    supportingEvidenceIds: [...supportingEvidenceIds],
    relations: [], // Relações só são registradas quando legitimamente conhecidas
    triageStatus: 'PENDENTE_DE_TRIAGEM'
  };
}

/**
 * Valida a integridade do candidato de roteamento.
 * Transversal aos regimes: verifica fundamentação factual, coerência probatória
 * e obediência às regras canônicas de domínio da v0.4.1.
 */
export function validateCandidateIntegrity(
  candidate: RoutingCandidate,
  validEvidenceIds?: Set<string>
): ValidationResult {
  const issues: ValidationIssue[] = [];

  // 1. Fundamentação Factual
  if (!candidate.statementAsIs || candidate.statementAsIs.trim().length === 0) {
    issues.push({
      field: 'statementAsIs',
      message: 'O candidato deve possuir descrição factual do estado institucional atual (statementAsIs).',
      severity: 'ERROR'
    });
  }

  // 2. Próximo Estado Estruturado
  if (!candidate.nextExpectedState || !candidate.nextExpectedState.description || candidate.nextExpectedState.description.trim().length === 0) {
    issues.push({
      field: 'nextExpectedState',
      message: 'O candidato deve declarar estruturadamente o próximo estado esperado (nextExpectedState).',
      severity: 'ERROR'
    });
  }

  // 3. Integridade Probatória (Fonte Única)
  if (validEvidenceIds && candidate.supportingEvidenceIds.length > 0) {
    for (const evidenceId of candidate.supportingEvidenceIds) {
      if (!validEvidenceIds.has(evidenceId)) {
        issues.push({
          field: 'supportingEvidenceIds',
          message: `A evidência probatória '${evidenceId}' referenciada não existe no contexto do ciclo.`,
          severity: 'ERROR'
        });
      }
    }
  }

  // 4. Relações e Dependências
  if (candidate.relations && candidate.relations.length > 0) {
    for (const relation of candidate.relations) {
      if (relation.targetCandidateId === candidate.candidateId) {
        issues.push({
          field: 'relations',
          message: 'Autorreferência inválida: um candidato não pode depender de si mesmo.',
          severity: 'ERROR'
        });
      }
      if (!relation.origin) {
        issues.push({
          field: 'relations',
          message: `A relação com '${relation.targetCandidateId}' deve possuir origem legítima rastreável (origin).`,
          severity: 'ERROR'
        });
      }
    }
  }

  // 5. Integridade do Regime e Espaço (Regra v0.4.1)
  if (candidate.routing) {
    const { applicableRegime, suggestedSpace, effectiveSpace } = candidate.routing;

    // Regra estrita: No regime DETERMINÍSTICO, suggestedSpace DEVE ser ausente ou null.
    if (applicableRegime === 'DETERMINISTICO' && suggestedSpace !== undefined && suggestedSpace !== null) {
      issues.push({
        field: 'routing.suggestedSpace',
        message: 'No regime DETERMINÍSTICO, suggestedSpace deve permanecer ausente/null; a regra produz a conclusão diretamente em effectiveSpace.',
        severity: 'ERROR'
      });
    }

    // Se estiver em estado de esclarecimento, não pode ter effectiveSpace fabricado
    if (candidate.triageStatus === 'ESCLARECIMENTO_SOLICITADO' && effectiveSpace !== undefined) {
      issues.push({
        field: 'routing.effectiveSpace',
        message: 'Não é permitido fabricar effectiveSpace para candidato sob esclarecimento probatório.',
        severity: 'ERROR'
      });
    }
  }

  return {
    isValid: issues.filter(i => i.severity === 'ERROR').length === 0,
    issues
  };
}

export interface DeterministicDecisionParams {
  decisionId: string;
  organizationId: string;
  confirmedRoute: RouteSpace;
  ruleCode: string;
  routingRuleVersion: string;
  rationale: string;
  decidedAt?: string;
  decidedByMembershipId?: string;
}

/**
 * Cria um RouteDecisionRecord canônico para o regime DETERMINÍSTICO.
 * Garantia contratual: suggestedRoute é estritamente null (não há sugestão prévia)
 * e o ato é atribuído à autoridade da regra, sem exigir identificador humano arbitrário.
 */
export function createDeterministicDecisionRecord(
  params: DeterministicDecisionParams
): RouteDecisionRecord {
  return {
    decisionId: params.decisionId,
    organizationId: params.organizationId,
    suggestedRoute: null, // Correção semântica definitiva v0.4.1
    confirmedRoute: params.confirmedRoute,
    decidedByUserId: undefined,
    decidedByRole: undefined,
    decidedByMembershipId: params.decidedByMembershipId,
    decidedAt: params.decidedAt || new Date().toISOString(),
    regime: 'DETERMINISTICO',
    ruleCode: params.ruleCode,
    routingRuleVersion: params.routingRuleVersion,
    rationale: params.rationale
  };
}

export interface AssistedDecisionParams {
  decisionId: string;
  organizationId: string;
  suggestedRoute: RouteSpace;
  confirmedRoute: RouteSpace;
  decidedByUserId: string;
  decidedByRole: UserRole;
  decidedByMembershipId?: string;
  overrideReason?: string;
  decidedAt?: string;
  routingRuleVersion?: string;
  rationale?: string;
}

/**
 * Cria um RouteDecisionRecord canônico para o regime ASSISTIDO.
 * Registra a sugestão prévia formulada e a decisão efetiva homologada pelo interlocutor/facilitador.
 */
export function createAssistedDecisionRecord(
  params: AssistedDecisionParams
): RouteDecisionRecord {
  if (params.confirmedRoute !== params.suggestedRoute && (!params.overrideReason || params.overrideReason.trim().length === 0)) {
    throw new Error('Decisão divergente em regime ASSISTIDO exige justificativa de divergência (overrideReason).');
  }

  return {
    decisionId: params.decisionId,
    organizationId: params.organizationId,
    suggestedRoute: params.suggestedRoute,
    confirmedRoute: params.confirmedRoute,
    decidedByUserId: params.decidedByUserId,
    decidedByRole: params.decidedByRole,
    decidedByMembershipId: params.decidedByMembershipId,
    decidedAt: params.decidedAt || new Date().toISOString(),
    overrideReason: params.overrideReason,
    regime: 'ASSISTIDO',
    routingRuleVersion: params.routingRuleVersion,
    rationale: params.rationale
  };
}
