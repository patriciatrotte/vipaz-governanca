/**
 * VIPAZ — Minha Rota
 * Bloco 2.2 — Motor de Triagem e Suficiência Probatória
 *
 * Responsável por:
 * 1. Avaliar suficiência de informação probatória antes do roteamento;
 * 2. Suspender conclusão via ESCLARECER sem descartar o candidato;
 * 3. Garantir que identifiedInterventionComposition permaneça ausente sob esclarecimento;
 * 4. Tratar NECESSIDADE_FUTURA como candidato legítimo a No Horizonte / Quando Precisar,
 *    jamais equiparando a SEM_ACAO;
 * 5. Desacoplar rota de EvolutionAction: não transformar marcos em tarefas.
 */

import {
  RoutingCandidate,
  TriageEvaluation,
  DecisionRegime
} from '../../types/routing';
import {
  InstitutionAssetContext,
  deriveInterventionComposition
} from './interventionRules';

export interface EvaluationTriageContext {
  /** Informações apuradas sobre instrumentos ou rotinas prévias da Câmara */
  assetContext?: InstitutionAssetContext;
  /** Indica se há pendência expressa de documento ou resposta não obtida */
  hasKnownEvidentialGap?: boolean;
  evidentialGapDescription?: string;
  /** Regime decisório pré-determinado pela metodologia para este tipo de objeto */
  mandatedRegime?: DecisionRegime;
  /** Indica se o candidato refere-se a uma necessidade com horizonte futuro planejado */
  isFutureOrientedNeed?: boolean;
}

/**
 * Executa a triagem de um candidato antes de qualquer definição de espaço.
 * Aplica rigor metodológico:
 * - Se informação for insuficiente: suspende em NECESSITA_ESCLARECIMENTO e omite identifiedInterventionComposition.
 * - Se informação for suficiente: avalia a menor intervenção e determina como/por quem será decidido.
 */
export function evaluateCandidateTriage(
  candidate: RoutingCandidate,
  context?: EvaluationTriageContext
): TriageEvaluation {
  const evaluatedAt = new Date().toISOString();

  // 1. Verificação de Suficiência Probatória / Factual
  const hasEvidentialDeficit = 
    context?.hasKnownEvidentialGap === true ||
    (candidate.supportingEvidenceIds.length === 0 && (!candidate.statementAsIs || candidate.statementAsIs.trim().length === 0));

  if (hasEvidentialDeficit) {
    return {
      candidateId: candidate.candidateId,
      status: 'NECESSITA_ESCLARECIMENTO',
      hasSufficientInformation: false,
      missingInformationReason: context?.evidentialGapDescription || 'Informações probatórias ou fáticas insuficientes para subsidiar a conclusão da rota.',
      identifiedInterventionComposition: undefined, // Contrato v0.4.1: ausente quando sem informação
      recommendedDecisionRegime: context?.mandatedRegime || 'ASSISTIDO',
      triageEvaluatedAt: evaluatedAt,
      triageNotes: 'Candidato retido na triagem aguardando esclarecimento. Nenhuma conclusão de espaço ou plano de ação deve ser gerada.'
    };
  }

  // 2. Composição da Menor Intervenção Suficiente (quando houver dados)
  const interventionComp = context?.assetContext
    ? deriveInterventionComposition(context.assetContext)
    : undefined;

  // 3. Determinação do Regime Decisório Aplicável
  // Determina COMO será decidido, sem se confundir com a intervenção ou com o espaço.
  let recommendedRegime: DecisionRegime = 'ASSISTIDO';

  if (context?.mandatedRegime) {
    recommendedRegime = context.mandatedRegime;
  } else if (context?.assetContext?.isCapacityFullyDemonstrated) {
    // Quando plenamente demonstrado por evidência conclusiva, regra determinística pode fechar
    recommendedRegime = 'DETERMINISTICO';
  } else if (context?.isFutureOrientedNeed) {
    // Necessidades de pactuação futura dependem de deliberação estratégica dos interlocutores
    recommendedRegime = 'HUMANO';
  }

  return {
    candidateId: candidate.candidateId,
    status: 'APTO_PARA_ROTEAMENTO',
    hasSufficientInformation: true,
    identifiedInterventionComposition: interventionComp,
    recommendedDecisionRegime: recommendedRegime,
    triageEvaluatedAt: evaluatedAt,
    triageNotes: context?.isFutureOrientedNeed 
      ? 'Necessidade futura identificada: apta para roteamento formal (Quando Precisar ou No Horizonte), sem conversão em tarefa imediata.'
      : 'Candidato apto para roteamento com base factual consistente.'
  };
}

/**
 * Solicita formalmente esclarecimento probatório ou fático para um candidato.
 * Suspende a conclusão sem descartar o item nem criar ações operacionais.
 */
export function requestCandidateClarification(
  candidate: RoutingCandidate,
  missingDetails: string,
  requestedBy: string
): RoutingCandidate {
  if (!missingDetails || missingDetails.trim().length === 0) {
    throw new Error('A solicitação de esclarecimento exige descrição do detalhe ou evidência faltante.');
  }

  return {
    ...candidate,
    triageStatus: 'ESCLARECIMENTO_SOLICITADO',
    clarificationRequest: {
      requestId: `req-clarif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      missingInformation: missingDetails,
      requestedAt: new Date().toISOString(),
      requestedBy,
      isResolved: false
    },
    // Limpeza de qualquer rota efetiva preliminar; esclarecimento suspende a conclusão
    routing: candidate.routing
      ? {
          ...candidate.routing,
          effectiveSpace: undefined
        }
      : undefined
  };
}

/**
 * Resolve a pendência de esclarecimento com novas evidências ou notas fáticas,
 * retornando o candidato para PENDENTE_DE_TRIAGEM para ser retriado.
 */
export function resolveCandidateClarification(
  candidate: RoutingCandidate,
  resolutionNote: string,
  newEvidenceIds: string[] = []
): RoutingCandidate {
  if (!candidate.clarificationRequest) {
    throw new Error('O candidato não possui solicitação de esclarecimento ativa.');
  }

  const updatedEvidence = Array.from(new Set([
    ...candidate.supportingEvidenceIds,
    ...newEvidenceIds
  ]));

  return {
    ...candidate,
    supportingEvidenceIds: updatedEvidence,
    triageStatus: 'PENDENTE_DE_TRIAGEM',
    clarificationRequest: {
      ...candidate.clarificationRequest,
      isResolved: true,
      resolutionNote
    }
  };
}

/**
 * Valida a distinção arquitetural: Rota !== EvolutionAction.
 * Garante que estados como JÁ_CONSTRUÍDO, NO_HORIZONTE e QUANDO_PRECISAR
 * não possuam EvolutionAction ativa associada artificialmente.
 */
export function validateRouteActionSeparation(candidate: RoutingCandidate): {
  isCompliant: boolean;
  reason?: string;
} {
  const effective = candidate.routing?.effectiveSpace;

  if (effective && effective !== 'AGORA' && candidate.boundActionId) {
    return {
      isCompliant: false,
      reason: `Violação da separação rota/ação: o candidato está no espaço '${effective}', mas possui ação operacional vinculada ('${candidate.boundActionId}'). Itens em Já Construído, No Horizonte e Quando Precisar não devem ser artificialmente transformados em tarefas.`
    };
  }

  return { isCompliant: true };
}
