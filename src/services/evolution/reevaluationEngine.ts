/**
 * VIPAZ — Minha Rota
 * Bloco 2.5 — Motor de Reavaliação Localizada e Snapshots Imutáveis
 *
 * Responsável por:
 * 1. Executar a menor reavaliação metodologicamente suficiente;
 * 2. Reaproveitar evidências válidas sem retrabalho probatório;
 * 3. Distinguir desfechos: EVOLUCAO, ESTABILIDADE, CORRECAO_DE_COMPREENSAO e REGRESSAO_OU_PERDA;
 * 4. Assegurar que ESTABILIDADE não gere artificialmente novo snapshot de AS IS;
 * 5. Gerar novos snapshots com imutabilidade contratual sem sobrescrever snapshots anteriores;
 * 6. Preservar a cadeia causal: Estado Anterior → Evento → Análise de Impacto → Reavaliação → Novo Estado.
 */

import { InstitutionalAsIsRecord, AsIsTriggerOrigin, CapacityId } from '../../types';
import {
  RoutingCandidate,
  TargetEntityRef,
  ReevaluationTriggerOrigin,
  ReevaluationOutcomeType,
  LocalizedReevaluationResult,
  OperationalImpactAnalysis
} from '../../types/routing';

export interface LocalizedReevaluationParams {
  candidate: RoutingCandidate;
  triggerOrigin: ReevaluationTriggerOrigin;
  impactAnalysis: OperationalImpactAnalysis;
  observedOutcome: ReevaluationOutcomeType;
  updatedStatement?: string;
  newEvidenceIds?: string[];
  homologatedByUserId?: string;
}

/**
 * Executa a reavaliação estritamente localizada de um candidato afetado por evento ou fato novo.
 */
export function executeLocalizedReevaluation(
  params: LocalizedReevaluationParams
): LocalizedReevaluationResult {
  const {
    candidate,
    triggerOrigin,
    observedOutcome,
    updatedStatement,
    newEvidenceIds = []
  } = params;

  const targetScope: TargetEntityRef = {
    entityType: 'CANDIDATE',
    entityId: candidate.candidateId
  };

  // Reaproveitamento estrito de evidências pré-existentes
  const reusedEvidenceIds = [...candidate.supportingEvidenceIds];
  const allEvidences = Array.from(new Set([...reusedEvidenceIds, ...newEvidenceIds]));

  // Determinação se produz novo marco institucional de AS IS
  // Regra metodológica: ESTABILIDADE e CORREÇÃO DE COMPREENSÃO NÃO geram novo marco de AS IS.
  // Apenas EVOLUÇÃO e REGRESSÃO homologadas justificam incremento temporal.
  const producesNewAsIsMilestone = 
    observedOutcome === 'EVOLUCAO' || observedOutcome === 'REGRESSAO_OU_PERDA';

  const reevaluationId = `reeval-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const resultingMilestoneId = producesNewAsIsMilestone 
    ? `as-is-milestone-${Date.now()}` 
    : undefined;

  return {
    reevaluationId,
    triggerOrigin,
    targetScope,
    outcome: observedOutcome,
    evidentialBasisIds: allEvidences,
    reusedEvidenceIds,
    statementAfterReevaluation: updatedStatement || candidate.statementAsIs,
    recognizedAt: new Date().toISOString(),
    producesNewAsIsMilestone,
    resultingMilestoneId
  };
}

export interface CreateNextAsIsSnapshotParams {
  previousSnapshot: InstitutionalAsIsRecord;
  reevaluationResult: LocalizedReevaluationResult;
  updatedDemonstratedCapacities?: CapacityId[];
  updatedStructuringCapacities?: CapacityId[];
  synthesisSummary: string;
  validatedByUserId: string;
  validatedByRole: import('../../types').UserRole;
  validatedByMembershipId?: string;
}

/**
 * Cria a próxima versão de snapshot de AS IS histórico mantendo o anterior 100% imutável.
 * Progressão temporal contínua: AS IS 0 → AS IS 1 → AS IS 2...
 */
export function createNextAsIsSnapshot(
  params: CreateNextAsIsSnapshotParams
): InstitutionalAsIsRecord {
  const {
    previousSnapshot,
    reevaluationResult,
    updatedDemonstratedCapacities,
    updatedStructuringCapacities,
    synthesisSummary,
    validatedByUserId,
    validatedByRole,
    validatedByMembershipId
  } = params;

  // Garantia de imutabilidade: o snapshot anterior não pode ser modificado
  if (!previousSnapshot.isLockedImmutable) {
    throw new Error('O snapshot institucional anterior deve possuir garantia de imutabilidade (isLockedImmutable).');
  }

  const nextSequenceNumber = previousSnapshot.sequenceNumber + 1;
  const nextVersionLabel = `AS IS ${nextSequenceNumber}`;

  let triggerOrigin: AsIsTriggerOrigin = 'REAVALIACAO_DE_CAPACIDADE';
  if (reevaluationResult.triggerOrigin === 'REVISAO_PROGRAMADA') {
    triggerOrigin = 'REVISAO_FORMAL_DE_CICLO';
  } else if (reevaluationResult.triggerOrigin === 'MUDANCA_EXTERNA_OU_METODOLOGICA') {
    triggerOrigin = 'OUTRO_MARCO_METODOLOGICO';
  }

  return {
    asIsId: reevaluationResult.resultingMilestoneId || `as-is-${Date.now()}`,
    organizationId: previousSnapshot.organizationId,
    cycleId: previousSnapshot.cycleId,
    sequenceNumber: nextSequenceNumber,
    versionLabel: nextVersionLabel,
    triggerOrigin,
    establishedAt: new Date().toISOString(),
    validatedByUserId,
    validatedByRole,
    validatedByMembershipId,
    methodologyVersion: previousSnapshot.methodologyVersion,
    demonstratedCapacities: updatedDemonstratedCapacities || [...previousSnapshot.demonstratedCapacities],
    structuringCapacities: updatedStructuringCapacities || [...previousSnapshot.structuringCapacities],
    synthesisSummary,
    evidentialBasisIds: [...reevaluationResult.evidentialBasisIds],
    isLockedImmutable: true // Imutabilidade estrita
  };
}
