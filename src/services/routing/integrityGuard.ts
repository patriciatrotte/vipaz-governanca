/**
 * VIPAZ — Minha Rota
 * Bloco 2.3 — Guarda de Integridade Transversal
 *
 * Responsável estrita por:
 * 1. Verificar se a conclusão de rota proposta é metodologicamente admissível;
 * 2. Incidir de forma localizada sobre o objeto/conclusão avaliado (sem bloqueio global);
 * 3. Não escolher o RouteSpace (a escolha compete às regras, modelos ou deliberação humana);
 * 4. Assegurar conformidade metodológica em todos os 3 regimes (DETERMINISTICO, ASSISTIDO, HUMANO).
 */

import { RouteSpace } from '../../types';
import { RoutingCandidate, DecisionRegime } from '../../types/routing';

export interface IntegrityGuardEvaluation {
  isAdmissible: boolean;
  violations: string[];
  warnings?: string[];
}

export interface IntegrityGuardContext {
  /** Candidatos já avaliados no ciclo para validação de coerência relacional */
  allCandidatesInCycle?: RoutingCandidate[];
  /** Indica se o processo de investigação reconheceu formalmente a suficiência informativa */
  hasInvestigativeSufficiency?: boolean;
  /** Referência ao PendingItem pré-existente de evidência pendente no ciclo */
  pendingEvidenceItemRefId?: string;
}

/**
 * Valida a admissibilidade metodológica de uma destinação a um RouteSpace específico.
 * Não altera nem escolhe o espaço; apenas atesta a conformidade da proposta.
 */
export function evaluateRoutingIntegrityGuard(
  candidate: RoutingCandidate,
  proposedSpace: RouteSpace,
  regime: DecisionRegime,
  context?: IntegrityGuardContext
): IntegrityGuardEvaluation {
  const violations: string[] = [];
  const warnings: string[] = [];

  // Regra 1: Candidato sob ESCLARECIMENTO não admite conclusão de espaço efetivo
  if (candidate.triageStatus === 'ESCLARECIMENTO_SOLICITADO') {
    violations.push(
      `Conclusão inadmissível: o candidato '${candidate.candidateId}' está sob esclarecimento probatório e não pode receber destinação de espaço efetivo (${proposedSpace}) enquanto houver pendência informativa.`
    );
  }

  // Regra 2: Destinação a JÁ_CONSTRUÍDO e Distinção Probatória (Homologação v0.4.1)
  // Uma capacidade pode ser destinada a JA_CONSTRUIDO quando houver suficiência informativa
  // legitimamente reconhecida pela investigação, ainda que sua comprovação permaneça pendente.
  if (proposedSpace === 'JA_CONSTRUIDO') {
    const hasEvidence = candidate.supportingEvidenceIds && candidate.supportingEvidenceIds.length > 0;
    const hasSufficiency = context?.hasInvestigativeSufficiency !== false && candidate.triageStatus !== 'ESCLARECIMENTO_SOLICITADO';

    if (!hasEvidence) {
      if (!hasSufficiency) {
        // Sem evidência documental E sem suficiência informativa da investigação: conclusão inadmissível
        violations.push(
          `Conclusão inadmissível: a destinação ao espaço JÁ_CONSTRUÍDO requer comprovação probatória válida ou suficiência informativa legitimamente reconhecida pela investigação.`
        );
      } else {
        // Suficiência informativa presente, comprovação documental pendente: ADMISSÍVEL COM ADVERTÊNCIA
        // A condição probatória permanece explícita e não pode ser apresentada como comprovada
        warnings.push(
          `Destinação a JÁ_CONSTRUÍDO com comprovação documental pendente: a capacidade foi reconhecida por suficiência informativa da investigação, mas a prova documental permanece pendente de conferência (referência: ${context?.pendingEvidenceItemRefId || 'pendência canônica de evidência'}).`
        );
      }
    }
  }

  // Regra 3: Destinação a AGORA requer definição estruturada do próximo estado esperado
  if (proposedSpace === 'AGORA') {
    if (!candidate.nextExpectedState || !candidate.nextExpectedState.description) {
      violations.push(
        `Conclusão inadmissível: a inclusão no espaço AGORA requer definição estruturada do próximo estado esperado (nextExpectedState).`
      );
    }
  }

  // Regra 4: Coerência relacional localizada (dependências lógicas)
  if (candidate.relations && candidate.relations.length > 0) {
    for (const rel of candidate.relations) {
      if (rel.targetCandidateId === candidate.candidateId) {
        violations.push(
          `Inconsistência relacional: autorreferência detectada no candidato '${candidate.candidateId}'.`
        );
      }

      // Se houver contexto de candidatos, verificar incoerências extremas
      if (context?.allCandidatesInCycle && proposedSpace === 'JA_CONSTRUIDO') {
        const prereq = context.allCandidatesInCycle.find(c => c.candidateId === rel.targetCandidateId);
        if (prereq && rel.relationType === 'DEPENDE_DE') {
          // Se depende de um item que ainda está pendente ou no horizonte, não pode estar já construído
          if (prereq.routing?.effectiveSpace === 'NO_HORIZONTE') {
            violations.push(
              `Inconsistência relacional: o candidato não pode ser declarado JÁ_CONSTRUÍDO enquanto seu pré-requisito legítimo '${prereq.candidateId}' estiver em NO_HORIZONTE.`
            );
          }
        }
      }
    }
  }

  // Regra 5: Observância das diretrizes do regime decisório
  if (regime === 'DETERMINISTICO') {
    // No regime determinístico, a conclusão deve decorrer de regra válida; não pode haver ambiguidade probatória não resolvida
    if (candidate.triageStatus === 'PENDENTE_DE_TRIAGEM') {
      warnings.push(
        `Aviso de governança: decisão determinística proposta para candidato ainda em PENDENTE_DE_TRIAGEM.`
      );
    }
  }

  return {
    isAdmissible: violations.length === 0,
    violations,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}
