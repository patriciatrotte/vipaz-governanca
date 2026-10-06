/**
 * VIPAZ — Minha Rota
 * Bloco 2.5 — Serviço de Revisão Programada
 *
 * Responsável por:
 * 1. Inicializar revisões programadas a partir do estado anterior como ponto de partida;
 * 2. Evitar a repetição integral do diagnóstico;
 * 3. Delimitar o escopo estrito daquilo que necessita confirmação, atualização ou reavaliação;
 * 4. Não inventar regras de periodicidade automática não homologadas pela metodologia.
 */

import { InstitutionalAsIsRecord } from '../../types';
import { RoutingCandidate, TargetEntityRef } from '../../types/routing';

export interface ScheduledReviewPlan {
  reviewId: string;
  organizationId: string;
  cycleId: string;
  baselineAsIsSnapshotId: string;
  baselineSequenceNumber: number;
  scopeOfInvestigation: {
    confirmedWithoutReinterview: TargetEntityRef[];
    candidatesTargetedForUpdate: TargetEntityRef[];
  };
  initiatedAt: string;
  reviewNotes: string;
}

/**
 * Inicializa uma revisão programada ancorada no último snapshot institucional válido.
 * Não repete a investigação de itens estáveis; foca nos objetos explicitamente delimitados.
 */
export function initializeScheduledReview(
  baselineSnapshot: InstitutionalAsIsRecord,
  allCandidates: RoutingCandidate[],
  candidatesNeedingUpdateIds: Set<string> = new Set()
): ScheduledReviewPlan {
  const reviewId = `sched-rev-${Date.now()}`;
  const confirmedWithoutReinterview: TargetEntityRef[] = [];
  const candidatesTargetedForUpdate: TargetEntityRef[] = [];

  for (const candidate of allCandidates) {
    const ref: TargetEntityRef = {
      entityType: 'CANDIDATE',
      entityId: candidate.candidateId
    };

    if (candidatesNeedingUpdateIds.has(candidate.candidateId)) {
      candidatesTargetedForUpdate.push(ref);
    } else {
      // Itens consolidados anteriores são aproveitados como ponto de partida
      confirmedWithoutReinterview.push(ref);
    }
  }

  return {
    reviewId,
    organizationId: baselineSnapshot.organizationId,
    cycleId: baselineSnapshot.cycleId,
    baselineAsIsSnapshotId: baselineSnapshot.asIsId,
    baselineSequenceNumber: baselineSnapshot.sequenceNumber,
    scopeOfInvestigation: {
      confirmedWithoutReinterview,
      candidatesTargetedForUpdate
    },
    initiatedAt: new Date().toISOString(),
    reviewNotes: `Revisão programada ancorada no ${baselineSnapshot.versionLabel}. ${confirmedWithoutReinterview.length} item(ns) preservados do estado anterior sem repetição de entrevista; ${candidatesTargetedForUpdate.length} item(ns) selecionados para atualização focal.`
  };
}
