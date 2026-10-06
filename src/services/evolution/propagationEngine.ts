/**
 * VIPAZ — Minha Rota
 * Bloco 2.5 — Motor de Propagação Relacional de Impacto
 *
 * Responsável por:
 * 1. Identificar candidatos dependentes legitimamente afetados a partir de um candidato alterado;
 * 2. Propagar reavaliação EXCLUSIVAMENTE por relações formalmente conhecidas ('DEPENDE_DE', 'PRECEDE');
 * 3. Proibir estritamente propagação por proximidade temática, posição em array, ID ou heurística técnica;
 * 4. Garantir que candidatos independentes permaneçam 100% intactos.
 */

import { RoutingCandidate, PropagationResult } from '../../types/routing';

/**
 * Mapeia o impacto relacional de uma alteração formal sobre a malha de candidatos.
 * Percorre unicamente relações formalmente registradas com rastreabilidade de origem.
 */
export function propagateLocalizedImpact(
  rootImpactedCandidateId: string,
  allCandidates: RoutingCandidate[]
): PropagationResult {
  const directlyAffected = [rootImpactedCandidateId];
  const dependentCandidateIds: string[] = [];
  const propagationTrace: PropagationResult['propagationTrace'] = [];

  // Busca todos os candidatos que possuem relação explícita 'DEPENDE_DE' apontando para o candidato raiz
  for (const candidate of allCandidates) {
    if (candidate.candidateId === rootImpactedCandidateId) {
      continue;
    }

    if (candidate.relations && candidate.relations.length > 0) {
      for (const rel of candidate.relations) {
        if (rel.targetCandidateId === rootImpactedCandidateId && rel.relationType === 'DEPENDE_DE') {
          dependentCandidateIds.push(candidate.candidateId);
          propagationTrace.push({
            sourceCandidateId: rootImpactedCandidateId,
            targetCandidateId: candidate.candidateId,
            relationType: rel.relationType,
            origin: rel.origin
          });
        }
      }
    }
  }

  return {
    rootImpactedCandidateId,
    directlyAffectedCandidateIds: directlyAffected,
    dependentCandidateIds,
    propagationTrace
  };
}
