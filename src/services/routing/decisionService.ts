/**
 * VIPAZ — Minha Rota
 * Bloco 2.4 — Serviço de Decisão Formal e Integridade
 *
 * Responsável por:
 * 1. Processar e formalizar decisões nos três regimes (DETERMINISTICO, ASSISTIDO, HUMANO);
 * 2. Adotar semântica de alteração da sugestão (decisão divergente) em vez de 'override';
 * 3. Assegurar que autorização administrativa NUNCA supere a Guarda de Integridade;
 * 4. Preservar a distinção entre estado reconhecido e força de comprovação;
 * 5. Manter histórico e proveniência estritamente imutáveis e auditáveis.
 */

import { RouteSpace, RouteDecisionRecord, UserRole } from '../../types';
import {
  RoutingCandidate,
  DecisionRegime,
  FormalDecisionInput,
  FormalDecisionResult
} from '../../types/routing';
import {
  evaluateRoutingIntegrityGuard,
  IntegrityGuardContext
} from './integrityGuard';

export interface DecisionContext {
  guardContext?: IntegrityGuardContext;
  routingRuleVersion?: string;
}

/** Papéis institucionais atualmente habilitados a validar ou manifestar decisões */
const AUTHORIZED_DECISION_ROLES: ReadonlySet<UserRole> = new Set([
  'FACILITADOR',
  'GESTOR_INSTITUCIONAL',
  'ADMINISTRADOR',
  'INTERLOCUTOR_PRINCIPAL'
]);

/**
 * Formaliza a decisão de rota para um candidato, aplicando validação estrita de permissão
 * e submissão mandatória à Guarda de Integridade Transversal.
 */
export function recordFormalDecision(
  candidate: RoutingCandidate,
  input: FormalDecisionInput,
  context?: DecisionContext
): FormalDecisionResult {
  const regime: DecisionRegime = candidate.routing?.applicableRegime || 'ASSISTIDO';
  const ruleVersion = context?.routingRuleVersion || candidate.routing?.routingRuleVersion || 'RULES_D1_v0.3';
  const divergenceJustification = input.divergenceReason || input.overrideReason;

  // 1. Verificação de Autoridade e Permissão (quando decisão humana)
  if (regime !== 'DETERMINISTICO') {
    if (!input.decidedByUserId) {
      return {
        isSuccess: false,
        violations: ['Decisão em regime não determinístico exige identificação do usuário autenticado (decidedByUserId).']
      };
    }
    if (!input.decidedByRole || !AUTHORIZED_DECISION_ROLES.has(input.decidedByRole)) {
      return {
        isSuccess: false,
        violations: [`O papel '${input.decidedByRole}' não possui autorização para homologar decisões de rota institucional.`]
      };
    }
  }

  // 2. Semântica de Decisão Divergente em Regime ASSISTIDO
  if (regime === 'ASSISTIDO') {
    const suggested = candidate.routing?.suggestedSpace;
    const isDivergent = suggested !== undefined && input.chosenSpace !== suggested;

    if (isDivergent && (!divergenceJustification || divergenceJustification.trim().length === 0)) {
      return {
        isSuccess: false,
        violations: ['Decisão divergente da recomendação assistida exige fundamentação formal (divergenceReason).']
      };
    }
  }

  // 3. Submissão Mandatória à Guarda de Integridade
  // REGRA DE OURO: Permissão administrativa nunca supera a integridade metodológica!
  const guardResult = evaluateRoutingIntegrityGuard(
    candidate,
    input.chosenSpace,
    regime,
    context?.guardContext
  );

  if (!guardResult.isAdmissible) {
    return {
      isSuccess: false,
      violations: [
        'A decisão pretendida foi rejeitada pela Guarda de Integridade Metodológica.',
        ...guardResult.violations
      ]
    };
  }

  // 4. Criação do Registro Imutável de Decisão (RouteDecisionRecord)
  const decisionId = `dec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const decidedAt = new Date().toISOString();

  let suggestedRouteForRecord: RouteSpace | null = null;
  if (regime === 'ASSISTIDO') {
    suggestedRouteForRecord = candidate.routing?.suggestedSpace || null;
  } else {
    // No regime DETERMINÍSTICO e HUMANO: não existe sugestão pendente
    suggestedRouteForRecord = null;
  }

  const decisionRecord: RouteDecisionRecord = {
    decisionId,
    organizationId: candidate.organizationId,
    suggestedRoute: suggestedRouteForRecord,
    confirmedRoute: input.chosenSpace,
    decidedByUserId: regime === 'DETERMINISTICO' ? undefined : input.decidedByUserId,
    decidedByRole: regime === 'DETERMINISTICO' ? undefined : input.decidedByRole,
    decidedByMembershipId: input.decidedByMembershipId,
    decidedAt,
    // Preservação retrocompatível e canônica
    divergenceReason: divergenceJustification,
    overrideReason: divergenceJustification,
    regime,
    ruleCode: candidate.routing?.routingReason?.ruleCode,
    routingRuleVersion: ruleVersion,
    rationale: input.rationale || candidate.routing?.routingReason?.contextualJustification
  };

  // 5. Preservação da Distinção: Estado Reconhecido vs. Força de Comprovação
  // Se for JA_CONSTRUIDO e comprovação documental estiver pendente, preserva a referência canônica à pendência
  const isPendingDoc = input.chosenSpace === 'JA_CONSTRUIDO' && candidate.supportingEvidenceIds.length === 0;
  const pendingRef = isPendingDoc 
    ? (candidate.routing?.routingReason?.pendingEvidenceItemRefId || context?.guardContext?.pendingEvidenceItemRefId || 'pend-doc-canonica')
    : undefined;

  // 6. Atualização do Candidato com a Decisão Efetiva Consolidada
  const updatedCandidate: RoutingCandidate = {
    ...candidate,
    triageStatus: 'TRIADO',
    routing: {
      routingRuleVersion: ruleVersion,
      methodologyVersion: candidate.routing?.methodologyVersion || 'D1 v1.0',
      applicableRegime: regime,
      suggestedSpace: candidate.routing?.suggestedSpace ?? null, // Preserva sugestão original intacta no histórico
      effectiveSpace: input.chosenSpace,
      lastDecisionRecordId: decisionId,
      routingReason: {
        ruleCode: candidate.routing?.routingReason?.ruleCode,
        factualBasis: candidate.statementAsIs,
        evidentialBasis: [...candidate.supportingEvidenceIds],
        selectedInterventionStrategy: candidate.routing?.routingReason?.selectedInterventionStrategy,
        pendingEvidenceItemRefId: pendingRef,
        contextualJustification: [
          `Decisão formal consolidada para o espaço ${input.chosenSpace}.`,
          divergenceJustification ? `Decisão divergente justificada: ${divergenceJustification}.` : '',
          isPendingDoc ? 'Comprovação documental permanece pendente de conferência (não comunicado como verificado).' : '',
          input.rationale ? `Fundamento: ${input.rationale}.` : ''
        ].filter(Boolean).join(' ')
      }
    }
  };

  return {
    isSuccess: true,
    decisionRecord,
    updatedCandidate
  };
}
