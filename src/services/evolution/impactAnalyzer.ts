/**
 * VIPAZ — Minha Rota
 * Bloco 2.5 — Analisador de Impacto de Eventos e Fatos Novos
 *
 * Responsável por:
 * 1. Categorizar o impacto de eventos sem score:
 *    - CORROBORANTE: ratifica fatos sem alterar rota;
 *    - COMPLEMENTAR: adiciona detalhes sem invalidar a conclusão;
 *    - CONTRADITORIO_OU_MODIFICADOR: altera pressupostos materiais, demandando reavaliação localizada;
 *    - IMPACTO_INDETERMINADO: carência informativa que conduz a esclarecimento sem reiniciar o diagnóstico.
 * 2. Identificar estritamente o menor objeto afetado (TargetEntityRef);
 * 3. Impedir que todo fato novo resulte em retriagem ou novo diagnóstico integral.
 */

import {
  RoutingCandidate,
  EventImpactType,
  OperationalImpactAnalysis,
  TargetEntityRef
} from '../../types/routing';

export interface EventAnalysisInput {
  eventId: string;
  description: string;
  impactNature?: 'CORROBORA_FATO' | 'COMPLEMENTA_INFO' | 'CONTRADIZ_FATO' | 'DUVIDA_OU_INDETERMINADO';
  isContradictory?: boolean;
  isComplementary?: boolean;
  isUnclearOrIndeterminate?: boolean;
  newEvidenceIds?: string[];
}

/**
 * Analisa o impacto de um evento operacional, fato novo ou evidência sobre um candidato específico.
 */
export function analyzeFactOrEventImpact(
  input: EventAnalysisInput,
  candidate: RoutingCandidate
): OperationalImpactAnalysis {
  const analyzedAt = new Date().toISOString();
  const sourceEntity: TargetEntityRef = {
    entityType: 'CANDIDATE',
    entityId: candidate.candidateId
  };

  let impactType: EventImpactType = 'CORROBORANTE';
  let isPotentiallyRelevant = false;
  let requiresLocalReevaluation = false;
  let requiresClarification = false;
  let rationale = '';

  // 1. Identificação do Tipo de Impacto
  if (input.isContradictory || input.impactNature === 'CONTRADIZ_FATO') {
    impactType = 'CONTRADITORIO_OU_MODIFICADOR';
    isPotentiallyRelevant = true;
    requiresLocalReevaluation = true;
    requiresClarification = false;
    rationale = `Fato ou evidência contraditória detectada (${input.description}). Exige reavaliação metodológica localizada do candidato '${candidate.candidateId}'.`;
  } else if (input.isUnclearOrIndeterminate || input.impactNature === 'DUVIDA_OU_INDETERMINADO') {
    impactType = 'IMPACTO_INDETERMINADO';
    isPotentiallyRelevant = false;
    requiresLocalReevaluation = false;
    requiresClarification = true;
    rationale = `O impacto da nova informação (${input.description}) não pode ser determinado com segurança. Encaminhado para esclarecimento localizado sem reiniciar o diagnóstico.`;
  } else if (input.isComplementary || input.impactNature === 'COMPLEMENTA_INFO') {
    impactType = 'COMPLEMENTAR';
    isPotentiallyRelevant = false;
    requiresLocalReevaluation = false;
    requiresClarification = false;
    rationale = `Informação complementar incorporada (${input.description}). Não altera os pressupostos nem invalida a decisão de rota vigente.`;
  } else {
    // Padrão: Corroborante
    impactType = 'CORROBORANTE';
    isPotentiallyRelevant = false;
    requiresLocalReevaluation = false;
    requiresClarification = false;
    rationale = `Evento corroborante confirmado (${input.description}). Ratifica o estado factual do candidato sem necessidade de retriagem.`;
  }

  return {
    eventId: input.eventId,
    sourceEntity,
    impactType,
    isPotentiallyRelevant,
    rationale,
    directlyAffectedEntities: [sourceEntity],
    requiresLocalReevaluation,
    requiresClarification,
    analyzedAt
  };
}
