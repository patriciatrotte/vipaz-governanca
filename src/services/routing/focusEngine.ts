/**
 * VIPAZ — Minha Rota
 * Bloco 2.3 — Motor de Foco Atual e Relações de Precedência
 *
 * Princípios e Regras Obrigatórias:
 * 1. Foco Atual ⊆ AGORA (relação formal estrita de subconjunto);
 * 2. Estar em AGORA é condição necessária, mas não suficiente;
 * 3. Exclusões do Foco Atual decorrem estritamente de restrições legítimas conhecidas:
 *    - Candidato que possui relação 'DEPENDE_DE' cujo pré-requisito não está concluído;
 *    - Candidato sob esclarecimento probatório;
 *    - Candidato que não possui destinação a AGORA;
 * 4. Foco Atual Plural: candidatos independentes coexistem no Foco Atual;
 * 5. Invariância: ordem do array ou IDs não alteram os candidatos em foco (zero desempate arbitrário);
 * 6. Zero scores, zero pesos, zero rankings universais e zero limites forçados;
 * 7. Prazos regulatórios confirmados (ConfirmedRegulatoryDeadline) são transparentes, sem pontuação.
 */

import {
  RoutingCandidate,
  CurrentFocusEvaluation,
  FocusCandidateExclusion
} from '../../types/routing';

export interface FocusDerivationOptions {
  cycleId: string;
  organizationId: string;
  /** Identificadores de candidatos cujos avanços já foram plenamente atestados/concluídos */
  completedCandidateIds?: Set<string>;
}

/**
 * Deriva o Foco Atual a partir do conjunto de candidatos de roteamento.
 * Implementa Foco Atual ⊆ AGORA com exclusões puramente lógicas e rastreáveis.
 */
export function deriveCurrentFocus(
  candidates: RoutingCandidate[],
  options: FocusDerivationOptions
): CurrentFocusEvaluation {
  const { cycleId, organizationId, completedCandidateIds = new Set<string>() } = options;

  const focusCandidates: RoutingCandidate[] = [];
  const excludedCandidatesSummary: FocusCandidateExclusion[] = [];

  for (const candidate of candidates) {
    // 1. Verificação de Esclarecimento
    if (candidate.triageStatus === 'ESCLARECIMENTO_SOLICITADO') {
      excludedCandidatesSummary.push({
        candidateId: candidate.candidateId,
        exclusionReason: 'SOB_ESCLARECIMENTO',
        detail: 'Candidato retido sob esclarecimento probatório; não elegível a foco imediato.'
      });
      continue;
    }

    // 2. Relação Formal Estrita: Foco Atual ⊆ AGORA
    // Somente candidatos cujo espaço efetivo (ou sugerido em regime assistido homologado) seja AGORA
    const isDestinedToAgora = 
      candidate.routing?.effectiveSpace === 'AGORA' ||
      (candidate.routing?.applicableRegime === 'ASSISTIDO' && candidate.routing?.suggestedSpace === 'AGORA');

    if (!isDestinedToAgora) {
      const currentSpace = candidate.routing?.effectiveSpace || candidate.routing?.suggestedSpace || 'INDEFINIDO';
      excludedCandidatesSummary.push({
        candidateId: candidate.candidateId,
        exclusionReason: 'NAO_PERTENCE_A_AGORA',
        detail: `Candidato destinado ao espaço '${currentSpace}'; apenas itens em AGORA são elegíveis ao Foco Atual.`
      });
      continue;
    }

    // 3. Verificação de Dependências Conhecidas ('DEPENDE_DE')
    // Se possui relação de dependência cujo pré-requisito não esteja concluído, é bloqueado do Foco
    let isBlockedByDependency = false;
    let blockingRel = undefined;

    if (candidate.relations && candidate.relations.length > 0) {
      for (const rel of candidate.relations) {
        if (rel.relationType === 'DEPENDE_DE') {
          const isPrereqCompleted = completedCandidateIds.has(rel.targetCandidateId);
          if (!isPrereqCompleted) {
            isBlockedByDependency = true;
            blockingRel = rel;
            break;
          }
        }
      }
    }

    if (isBlockedByDependency && blockingRel) {
      excludedCandidatesSummary.push({
        candidateId: candidate.candidateId,
        exclusionReason: 'BLOQUEADO_POR_DEPENDENCIA',
        detail: `Item pertence a AGORA, mas seu foco imediato está bloqueado aguardando conclusão do pré-requisito '${blockingRel.targetCandidateId}' (origem da relação: ${blockingRel.origin}).`,
        blockingRelation: blockingRel
      });
      // Atenção metodológica: o candidato permanece em AGORA; apenas não entra no Foco Atual imediato.
      continue;
    }

    // 4. Candidato Elegível: integra o Foco Atual Plural
    focusCandidates.push(candidate);
  }

  // 5. Garantia de Invariância e Pluralidade
  // Não aplicamos score, ranking, ordenação de array ou truncamento por limite forçado.
  // Candidatos que satisfazem as restrições coexistem legitimamente no Foco Atual.
  const evaluationNotes = [
    `Foco Atual derivado com ${focusCandidates.length} candidato(s) ativo(s).`,
    focusCandidates.length > 1 ? 'Pluralidade legítima mantida (sem ranking ou desempate artificial).' : '',
    excludedCandidatesSummary.length > 0 ? `${excludedCandidatesSummary.length} candidato(s) excluído(s) por restrições legítimas.` : ''
  ].filter(Boolean).join(' ');

  return {
    cycleId,
    organizationId,
    focusCandidates,
    excludedCandidatesSummary,
    evaluationTimestamp: new Date().toISOString(),
    evaluationNotes
  };
}
