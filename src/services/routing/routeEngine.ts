/**
 * VIPAZ — Minha Rota
 * Bloco 2.3 — Motor de Decisão de Rota
 *
 * Responsável por:
 * 1. Determinar o regime decisório aplicável para a decisão em execução;
 * 2. Destinar o candidato a um RouteSpace conforme regras da v0.3 / v0.4.1;
 * 3. Assegurar que no regime DETERMINÍSTICO não haja suggestedSpace;
 * 4. Assegurar que no regime ASSISTIDO a sugestão não vire decisão automática antecipada;
 * 5. Não fabricar effectiveSpace em estado de esclarecimento;
 * 6. Estruturar a fundamentação (StructuredRoutingReason) a partir de fatos, evidências e regras;
 * 7. Acionar a Guarda de Integridade Transversal.
 */

import { RouteSpace } from '../../types';
import {
  RoutingCandidate,
  TriageEvaluation,
  DecisionRegime,
  StructuredRoutingReason,
  RoutingExecutionResult
} from '../../types/routing';
import {
  evaluateRoutingIntegrityGuard,
  IntegrityGuardContext
} from './integrityGuard';

export interface RouteExecutionContext {
  ruleVersion?: string;
  methodologyVersion?: string;
  forcedRegime?: DecisionRegime;
  guardContext?: IntegrityGuardContext;
}

/**
 * Executa o roteamento de um candidato com base na triagem probatória prévia.
 */
export function executeCandidateRouting(
  candidate: RoutingCandidate,
  triage: TriageEvaluation,
  context?: RouteExecutionContext
): RoutingExecutionResult {
  const ruleVersion = context?.ruleVersion || 'RULES_D1_v0.3';
  const methodologyVersion = context?.methodologyVersion || 'D1 v1.0';
  const regimeApplied: DecisionRegime = context?.forcedRegime || triage.recommendedDecisionRegime;

  // 1. Tratamento estrito de candidato sob ESCLARECIMENTO
  // Em estado de esclarecimento, não fabricamos effectiveSpace nem concluímos rota
  if (triage.status === 'NECESSITA_ESCLARECIMENTO' || candidate.triageStatus === 'ESCLARECIMENTO_SOLICITADO') {
    const reason: StructuredRoutingReason = {
      factualBasis: candidate.statementAsIs || 'Diagnóstico preliminar em aberto',
      evidentialBasis: candidate.supportingEvidenceIds,
      contextualJustification: triage.missingInformationReason || 'Conclusão suspensa aguardando esclarecimento probatório ou fático.'
    };

    const updatedCandidate: RoutingCandidate = {
      ...candidate,
      triageStatus: 'ESCLARECIMENTO_SOLICITADO',
      routing: {
        routingRuleVersion: ruleVersion,
        methodologyVersion,
        applicableRegime: regimeApplied,
        suggestedSpace: null,
        effectiveSpace: undefined, // Rigor: sem effectiveSpace
        routingReason: reason
      }
    };

    return {
      candidateId: candidate.candidateId,
      targetSpace: 'AGORA', // fallback nominal não efetivado
      regimeApplied,
      reason,
      passedIntegrityGuard: true,
      updatedCandidate
    };
  }

  // 2. Determinação do RouteSpace substantivo (sem confundir espaço com regime)
  let targetSpace: RouteSpace = 'AGORA';
  let ruleCode: string | undefined = undefined;

  // Regra R1: Se a capacidade já estiver demonstrada como preexistente na instituição
  // Homologação v0.4.1: Uma capacidade pode ser destinada a JA_CONSTRUIDO quando houver suficiência
  // informativa legitimamente reconhecida pela investigação, ainda que sua comprovação permaneça pendente.
  if (triage.identifiedInterventionComposition?.primaryModality === 'MANTER') {
    targetSpace = 'JA_CONSTRUIDO';
    ruleCode = 'REG_D1_01_JA_CONSTRUIDO';
  }
  // Regra R2: Se for necessidade com horizonte futuro planejado sem urgência imediata
  else if (triage.triageNotes?.includes('Quando Precisar ou No Horizonte')) {
    targetSpace = candidate.confirmedDeadline ? 'QUANDO_PRECISAR' : 'NO_HORIZONTE';
    ruleCode = 'REG_D1_02_HORIZONTE_FUTURO';
  }
  // Regra R3: Necessidade presente de intervenção institucional
  else {
    targetSpace = 'AGORA';
    ruleCode = 'REG_D1_03_AGORA';
  }

  // Identificação de pendência probatória sem fabricar booleano duplicado
  const isPendingVerification = targetSpace === 'JA_CONSTRUIDO' && candidate.supportingEvidenceIds.length === 0;
  const pendingEvidenceRef = isPendingVerification
    ? (context?.guardContext?.pendingEvidenceItemRefId || 'pend-doc-canonica')
    : undefined;

  // 3. Montagem da Fundamentação Estruturada (fatos + evidências + estratégia ANTES do texto)
  const reason: StructuredRoutingReason = {
    ruleCode,
    factualBasis: candidate.statementAsIs,
    evidentialBasis: [...candidate.supportingEvidenceIds],
    selectedInterventionStrategy: triage.identifiedInterventionComposition,
    pendingEvidenceItemRefId: pendingEvidenceRef,
    contextualJustification: [
      `Destinação orientada para o espaço ${targetSpace}.`,
      isPendingVerification 
        ? 'Capacidade reconhecida por suficiência informativa da investigação; lastro documental permanece pendente de conferência (não comunicado como verificado).'
        : '',
      ruleCode ? `Regra de referência: ${ruleCode}.` : '',
      triage.identifiedInterventionComposition 
        ? `Estratégia de intervenção: ${triage.identifiedInterventionComposition.primaryModality}.`
        : '',
      candidate.confirmedDeadline 
        ? `Prazo regulatório confirmado: ${candidate.confirmedDeadline.deadlineDate} (${candidate.confirmedDeadline.legalBasis}).`
        : ''
    ].filter(Boolean).join(' ')
  };

  // 4. Submissão à Guarda de Integridade
  const guardResult = evaluateRoutingIntegrityGuard(
    candidate,
    targetSpace,
    regimeApplied,
    context?.guardContext
  );

  // 5. Configuração do Estado de Roteamento conforme o Regime Decisório
  let suggestedSpace: RouteSpace | null = null;
  let effectiveSpace: RouteSpace | undefined = undefined;

  if (regimeApplied === 'DETERMINISTICO') {
    // No regime DETERMINÍSTICO: a regra conclui diretamente.
    // suggestedSpace é estritamente null (não há sugestão pendente).
    suggestedSpace = null;
    effectiveSpace = guardResult.isAdmissible ? targetSpace : undefined;
  } else if (regimeApplied === 'ASSISTIDO') {
    // No regime ASSISTIDO: a IA/metodologia sugere, mas NÃO grava effectiveSpace antecipadamente.
    // A efetivação depende de homologação humana no Bloco 2.4.
    suggestedSpace = targetSpace;
    effectiveSpace = undefined;
  } else if (regimeApplied === 'HUMANO') {
    // No regime HUMANO: a decisão é direta dos atores; não há sugestão automática imposta.
    suggestedSpace = null;
    effectiveSpace = undefined;
  }

  const updatedCandidate: RoutingCandidate = {
    ...candidate,
    triageStatus: 'TRIADO',
    routing: {
      routingRuleVersion: ruleVersion,
      methodologyVersion,
      applicableRegime: regimeApplied,
      suggestedSpace,
      effectiveSpace,
      routingReason: reason
    }
  };

  return {
    candidateId: candidate.candidateId,
    targetSpace,
    regimeApplied,
    reason,
    passedIntegrityGuard: guardResult.isAdmissible,
    integrityViolations: guardResult.violations.length > 0 ? guardResult.violations : undefined,
    updatedCandidate
  };
}

export interface SubsequentEvidenceAttachmentResult {
  updatedCandidate: RoutingCandidate;
  isPendingResolved: boolean;
  requiresReevaluation: boolean;
  reevaluationReason?: string;
}

/**
 * Ciclo posterior de comprovação: incorpora evidência validada superveniente a um candidato.
 * - Se a evidência for corroborante: resolve a pendência probatória sem alterar artificialmente
 *   o RouteSpace e sem reiniciar desnecessariamente o diagnóstico da porta.
 * - Se a evidência for contraditória: não trata como mero fechamento de pendência;
 *   sinaliza expressamente necessidade de reavaliação metodológica localizada (Bloco 2.5).
 */
export function attachSubsequentEvidence(
  candidate: RoutingCandidate,
  evidenceId: string,
  options?: {
    isContradictory?: boolean;
    contradictionDetail?: string;
  }
): SubsequentEvidenceAttachmentResult {
  const updatedEvidences = Array.from(new Set([
    ...candidate.supportingEvidenceIds,
    evidenceId
  ]));

  if (options?.isContradictory) {
    // Evidência contraditória: não fecha simplesmente a pendência; exige reavaliação metodológica
    const updatedCandidate: RoutingCandidate = {
      ...candidate,
      supportingEvidenceIds: updatedEvidences
    };

    return {
      updatedCandidate,
      isPendingResolved: false,
      requiresReevaluation: true,
      reevaluationReason: options.contradictionDetail || 'A evidência documental superveniente contradiz fatos anteriormente reconhecidos pela investigação.'
    };
  }

  // Evidência corroborante: fecha a pendência probatória mantendo intacto o RouteSpace
  const updatedRouting = candidate.routing
    ? {
        ...candidate.routing,
        routingReason: {
          ...candidate.routing.routingReason,
          evidentialBasis: updatedEvidences,
          pendingEvidenceItemRefId: undefined, // Pendência resolvida
          contextualJustification: candidate.routing.routingReason.contextualJustification.replace(
            'Capacidade reconhecida por suficiência informativa da investigação; lastro documental permanece pendente de conferência (não comunicado como verificado).',
            'Capacidade comprovada documentalmente com evidência verificada incorporada.'
          )
        }
      }
    : undefined;

  const updatedCandidate: RoutingCandidate = {
    ...candidate,
    supportingEvidenceIds: updatedEvidences,
    routing: updatedRouting
  };

  return {
    updatedCandidate,
    isPendingResolved: true,
    requiresReevaluation: false
  };
}
